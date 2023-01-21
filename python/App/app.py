from fastapi import FastAPI
from fastapi.routing import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from boto3 import Session
import requests
from mtcnn.mtcnn import MTCNN
from keras_facenet import FaceNet
import numpy as np
import cv2
import os
import glob
import scipy
from scipy import spatial

from generate import *

import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage
from firebase_admin import firestore
import datetime
from typing import List
import hashlib
import uuid

credFilePath = "ace-cycling-356912-d715a97c04be.json"
cred = credentials.Certificate(credFilePath)
default_app = firebase_admin.initialize_app(cred)
bucket = storage.bucket("ace-cycling-356912.appspot.com", default_app)
db = firestore.client()

prefix_router = APIRouter()

# バケット名,オブジェクト名
BUCKET_NAME = 'my-face-model'
OBJECT_KEY_NAME = 'styleGAN2_G_params.h5'

embeddings = []
imgs = []
detector = MTCNN()
embedder = FaceNet()

x_max = 1.03
x_min = 0.04
sc_max = 0
sc_min = 100
types = ('jpg', 'png')

def S3_upload(aws_bucket, aws_file, aws_key):
    session = Session()
    print("S3にアップロード中")
    client = session.client('s3',region_name='ap-northeast-3')
    client.upload_file(aws_file, aws_bucket, aws_key)
    return

def get_as_byteimage(url):
    return bytearray(requests.get(url).content)
def save_image(url,filename):
    response = requests.get(url)
    image = response.content
    url_separate = os.path.splitext(url)
    # 拡張子の後(.jpgとか)をurl_extensionに代入する
    url_extension = url_separate[1]
    # URLに拡張子がなかった場合.pngにする
    if url_extension == "png":
        cv2.imwrite(filename + '.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, 95])
        # ファイルの名前を作る
    with open(filename, "wb") as aaa:
        aaa.write(image)

@prefix_router.get("/health")
async def get_health():
    return {"message": "OK"}

@prefix_router.post("/make_face/{u_id}")
async def update_face(u_id:str):
    num_layers = 18
    output_dir = 'results'
    latent_seed = 954 
    truncation_psi = 0.5
    noise_seed = 500
    batch_size = 1
    nn.load_parameters("styleGAN2_G_params.h5")

    rnd = np.random.RandomState(latent_seed)
    z = rnd.randn(batch_size, 512)

    nn.set_auto_forward(True) 
    style_noise = nn.NdArray.from_numpy_array(z)
    style_noises = [style_noise for _ in range(2)] 
    rgb_output = generate(batch_size, style_noises, noise_seed, mix_after=7, truncation_psi=truncation_psi) 

    images = convert_images_to_uint8(rgb_output, drange=[-1, 1])
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    # Display all the images
    filename = f'results/{u_id}_likeface.png'
    imsave(filename, images[0],channel_first=True)
    blob = bucket.blob(filename)
    blob.upload_from_filename(filename)
    blob.make_public()
    print(blob.public_url)
    print(u_id)
    city_ref = db.collection('users').document(u_id)
    city_ref.update({
        'likeface_url': blob.public_url,
        'updatedAt':datetime.datetime.now()
    })
    return {"status": "ok","face_url":blob.public_url}

@prefix_router.post("/make_face_v2/{u_id}")
async def update_face(u_id:str,like:List,vectors:List):
    plus_vector = np.zeros((1,512))
    minus_vector = np.zeros((1,512))
    
    num_layers = 18
    output_dir = 'results'
    latent_seed = 954 
    truncation_psi = 0.5
    noise_seed = 500
    batch_size = 1
    nn.load_parameters("styleGAN2_G_params.h5")

    rnd = np.random.RandomState(latent_seed)
    vectors = np.array(vectors)
    for i in range(len(like)):
        if liek[1] == 'plus':
            plus_vector = np.concatenate([plus_vector, vectors[i].reshape([1,512])],axis=0)

        if like[0] == 'minus':
            minus_vector = np.concatenate([minus_vector, vectors[i].reshape([1,512])], axis=0)

    plus_vector_mean = np.mean(plus_vector, axis=0) # plus_vectorの平均をとる
    minus_vector_mean = np.mean(minus_vector, axis=0)  # minus_vectorの平均をとる
    vectors = rnd.randn(batch_size, 512)  # ランダムベクトル取得
    vectors = vectors + plus_vector_mean - minus_vector_mean  # ベクトルの補正

    nn.set_auto_forward(True) 
    style_noise = nn.NdArray.from_numpy_array(vectors)
    style_noises = [style_noise for _ in range(2)] 
    rgb_output = generate(batch_size, style_noises, noise_seed, mix_after=7, truncation_psi=truncation_psi) 

    images = convert_images_to_uint8(rgb_output, drange=[-1, 1])
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    # Display all the images
    filename = f'results/{u_id}_likeface.png'
    imsave(filename, images[0],channel_first=True)
    blob = bucket.blob(filename)
    blob.upload_from_filename(filename)
    blob.make_public()
    print(blob.public_url)
    print(u_id)
    city_ref = db.collection('users').document(u_id)
    city_ref.update({
        'likeface_url': blob.public_url,
        'updatedAt':datetime.datetime.now()
    })
    return {"status": "ok","face_url":blob.public_url}
    

@prefix_router.post("/similarity_measure")
async def get_health(url_source:str,url_target:str):
    session = Session()
    # Rekognition呼び出し
    rekognition = session.client("rekognition",region_name='ap-northeast-1')
    image_data = get_as_byteimage(url_source)
    target_image = get_as_byteimage(url_target)
    response = rekognition.compare_faces(SimilarityThreshold=10,SourceImage={'Bytes': image_data},TargetImage={'Bytes': target_image})
    if not response['FaceMatches']:
        res2 = 0
    else:
        matches = response['FaceMatches']
        match = matches[0]
        res2 = match['Similarity']
    return {"percentage": res2}

@prefix_router.post("/similarity_measure_facenet")
def get_percentage(url_source:str,url_target:str):
    save_image(url_source,"source.jpg")
    save_image(url_target,"target.jpg")
    for i in range(2):
        files = glob.glob("*.jpg")
        for i, file in enumerate(files):
            img = cv2.imread(str(file))
            embedding = embedder.embeddings([img])
            embeddings.append(embedding[0])
            imgs.append(img)  # 顔領域を保存しておく
    # ユークリッド距離を計算
    def calc_euclid_distance(a, b):
        return scipy.spatial.distance.euclidean(a, b)

    image1 = embeddings[0]
    image2 = embeddings[1]

    result = calc_euclid_distance(image1, image2)
    if result >= 0.04 and result <= 1.03:
        res = (result - x_min) / (x_max - x_min) * (sc_max - sc_min) + sc_min
    elif result < 0.04:
        res = 100
    elif result > 1.03:
        res = 0
    print(result)
    return {"percentage": res}
@prefix_router.post("/generate_face")
async def get_face():
    num_layers = 18
    output_dir = 'results'
    latent_seed = 954 
    truncation_psi = 0.5
    noise_seed = 500
    batch_size = 2
    nn.load_parameters("styleGAN2_G_params.h5")

    rnd = np.random.RandomState(latent_seed)
    z = rnd.randn(batch_size, 512)

    nn.set_auto_forward(True) 
    style_noise = nn.NdArray.from_numpy_array(z)
    style_noises = [style_noise for _ in range(2)]
    rgb_output = generate(batch_size, style_noises, noise_seed, mix_after=7, truncation_psi=truncation_psi) 

    images = convert_images_to_uint8(rgb_output, drange=[-1, 1])
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    # Display all the images
    for i in range(batch_size):
        filename = f'results/{str(uuid.uuid4())}.png'
        file_id = hashlib.sha1(filename.encode()).hexdigest()
        imsave(filename, images[i],channel_first=True)
        blob = bucket.blob(filename)
        blob.upload_from_filename(filename)
        blob.make_public()
        print(blob.public_url)
        city_ref = db.collection('faceimage').document()
        city_ref.set({
            'ID':file_id,
            'ImageURL': blob.public_url,
            'Vector':z[i].tolist(),
            'UpdatedAt':datetime.datetime.now()
        })
    return {"status": "ok"}

app = FastAPI()
app.include_router(
    prefix_router,
    prefix="/fastapi"
)