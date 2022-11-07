from fastapi import FastAPI
from boto3 import Session

app = FastAPI()
BUCKET_NAME = 'python-get-object-XXXX'

@app.get("/health")
async def get_health():
    return {"message": "OK"}

@app.get("/result")
async def get_face():
    # S3からモデル読み込み
    session = Session()
    s3client = session.client("s3")
    return {"image_url": image_url}