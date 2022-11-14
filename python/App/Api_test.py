from fastapi import FastAPI
from boto3 import Session

from generate import *

app = FastAPI()
# バケット名,オブジェクト名
BUCKET_NAME = 'my-face-model'
OBJECT_KEY_NAME = 'styleGAN2_G_params.h5'

@app.get("/health")
async def get_health():
    return {"message": "OK"}

@app.get("/result")
async def get_face():
    num_layers = 18
    output_dir = 'results'
    latent_seed = 954 
    truncation_psi = 0.5
    noise_seed = 500
    batch_size = 1
    # S3からモデル読み込み
    session = Session()
    s3client = session.client("s3")
    model_obj = s3client.get_object(Bucket=BUCKET_NAME, Key=OBJECT_KEY_NAME)
    model = model_obj["Body"].read()
    nn.load_parameters(model)

    rnd = np.random.RandomState(latent_seed)
    z = rnd.randn(batch_size, 512)

    nn.set_auto_forward(True) 
    style_noise = nn.NdArray.from_numpy_array(z)
    style_noises = [style_noise for _ in range(2)] 

    images = generate(batch_size, style_noises, noise_seed, mix_after=7, truncation_psi=truncation_psi) 

    # Save image.
    os.makedirs(output_dir, exist_ok=True)
    png_filename = os.path.join(output_dir, 'example200.png')
    PIL.Image.fromarray(images[0], 'RGB').save(png_filename)
    return {"image_url": "ok"}