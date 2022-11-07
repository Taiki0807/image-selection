import pandas as pd
from fastapi import FastAPI
from firebase_admin import firestore
import firebase_admin
from firebase_admin import credentials
import datetime


JSON_PATH = '.json'

# Firebase初期化
cred = credentials.Certificate(JSON_PATH)
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()

@app.get("/health")
async def get_health():
    return {"message": "OK"}

@app.get("/make_model")


@app.post("/get_result")
async def post_predict():
    # S3からモデル読み込み
    session = Session()
    s3client = session.client("s3")
    model_obj = s3client.get_object(Bucket="my-face-model", Key="boston.model")
    model = pickle.loads(model_obj["Body"].read())
    #潜在変数作成
    rnd = np.random.RandomState(5)
    latents = rnd.randn(1,model.inpput_shape[1])
    #generate image
    fmt = dict(func=tflib.convert_images_to_uint8,nchw_to_nhwc=True)
    images = model.run(latents,None,truncation_psi=0.7,randomize_noise=True,output_transform=fmt)
    #save image

