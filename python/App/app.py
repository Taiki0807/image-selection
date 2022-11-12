from fastapi import FastAPI
from boto3 import Session
import requests

from generate import *

import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage
from firebase_admin import firestore
import datetime

credFilePath = "ace-cycling-356912-d715a97c04be.json"
cred = credentials.Certificate(credFilePath)
default_app = firebase_admin.initialize_app(cred)
bucket = storage.bucket("ace-cycling-356912.appspot.com", default_app)
db = firestore.client()

app = FastAPI()
# バケット名,オブジェクト名
BUCKET_NAME = 'my-face-model'
OBJECT_KEY_NAME = 'styleGAN2_G_params.h5'

def S3_upload(aws_bucket, aws_file, aws_key):
    session = Session()
    print("S3にアップロード中")
    client = session.client('s3',region_name='ap-northeast-3')
    client.upload_file(aws_file, aws_bucket, aws_key)
    return

def get_as_byteimage(url):
    return bytearray(requests.get(url).content)

@app.get("/health")
async def get_health():
    return {"message": "OK"}

@app.post("/make_face/{u_id}")
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
    imsave(filename, images[i],channel_first=True)
    blob = bucket.blob(filename)
    blob.upload_from_filename(filename)
    blob.make_public()
    print(blob.public_url)
    print(u_id)
    city_ref = db.collection('Users').document(u_id)
    city_ref.update({
        'likeface_url': blob.public_url,
        'updatedAt':datetime.datetime.now()
    })
    return {"status": "ok","face_url":blob.public_url}

@app.get("/similarity_measure")
async def get_health(url_source:str,url_target:str):
    session = Session()
    # Rekognition呼び出し
    rekognition = session.client("rekognition",region_name='ap-northeast-1')
    image_data = get_as_byteimage(url_source)
    target_image = get_as_byteimage(url_target)
    response = rekognition.compare_faces(SimilarityThreshold=80,SourceImage={'Bytes': image_data},TargetImage={'Bytes': target_image})
    similarity = response['FaceMatches']
    return {"percentage": response}