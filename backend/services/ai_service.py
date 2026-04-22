import boto3
import base64
import json
import os
import io
import time
import numpy as np
import cv2
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

ENDPOINT_NAME = os.getenv("SAGEMAKER_ENDPOINT")
REGION        = os.getenv("AWS_REGION", "ap-south-1")

client   = boto3.client("sagemaker-runtime", region_name=REGION)
_kinesis = boto3.client("kinesis", region_name=REGION)
_kinesis_stream = os.getenv("KINESIS_STREAM", "lumen-cognitive-stream")

# Load face detector once at startup
_face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)


def _crop_face(image_bytes: bytes) -> bytes:
    """
    Detect and crop face from raw image bytes.
    Falls back to center crop if no face detected.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    if img is None:
        return image_bytes

    img_eq = cv2.equalizeHist(img)

    faces = _face_cascade.detectMultiScale(
        img_eq,
        scaleFactor=1.1,
        minNeighbors=6,
        minSize=(80, 80)
    )

    if len(faces) > 0:
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        pad = int(0.15 * w)
        x = max(0, x - pad)
        y = max(0, y - pad)
        w = min(img.shape[1] - x, w + 2 * pad)
        h = min(img.shape[0] - y, h + 2 * pad)
        face = img[y:y+h, x:x+w]
    else:
        # No face detected — use center square crop
        size = min(img.shape[0], img.shape[1])
        y0   = (img.shape[0] - size) // 2
        x0   = (img.shape[1] - size) // 2
        face = img[y0:y0+size, x0:x0+size]

    pil_img = Image.fromarray(face)
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def _stream_to_kinesis(user_id, session_id, emotion, load_level, confidence):
    """
    Push prediction record to Kinesis stream.
    Never blocks or raises — fire and forget.
    """
    try:
        record = {
            "user_id":    str(user_id),
            "session_id": str(session_id),
            "emotion":    emotion,
            "load_level": load_level,
            "confidence": round(float(confidence), 4),
            "timestamp":  time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        _kinesis.put_record(
            StreamName=_kinesis_stream,
            Data=json.dumps(record),
            PartitionKey=str(user_id)
        )
    except Exception:
        pass  # Never block predictions on streaming failure


def predict_from_bytes(image_bytes: bytes) -> dict:
    """
    Crop face, send to SageMaker endpoint.
    Returns: { emotion, cognitive_load, confidence }
    """
    cropped_bytes = _crop_face(image_bytes)
    img_b64 = base64.b64encode(cropped_bytes).decode("utf-8")

    response = client.invoke_endpoint(
        EndpointName=ENDPOINT_NAME,
        ContentType="application/json",
        Body=json.dumps({"image": img_b64})
    )

    result = json.loads(response["Body"].read().decode("utf-8"))
    return result