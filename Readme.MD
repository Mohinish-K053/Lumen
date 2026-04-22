# ��� Lumen — AI-Powered Cognitive Load Detection

Lumen is a full-stack AI system that detects student cognitive load in real time using webcam facial expression analysis. It captures live video, detects faces, classifies emotions using a custom-trained ResNet18 model deployed on AWS SageMaker, and maps them to cognitive load levels to help students and educators monitor focus during study sessions.

---

## ���️ Architecture

```
Browser (React)
     │  Webcam frame (JPEG, full resolution)
     ▼
Nginx (frontend container)
     │  /api/* → proxy
     ▼
FastAPI (backend container)
     │  Face detection (OpenCV Haar Cascade)
     │  Crop + grayscale
     ▼
AWS SageMaker Endpoint
     │  ResNet18 → 7-class emotion prediction
     ▼
PostgreSQL (AWS RDS)        AWS Kinesis Stream
     │  Logs stored                │  Real-time analytics
     ▼                             ▼
Analytics Dashboard         Downstream consumers
```

### Emotion → Cognitive Load Mapping

| Emotion | Cognitive Load |
|---------|---------------|
| Happy | Low Load |
| Neutral | Optimal Load |
| Surprise | Optimal Load |
| Anger | High Load |
| Disgust | High Load |
| Fear | High Load |
| Sadness | High Load |

---

## ��� ML Model

- **Architecture:** ResNet18 (grayscale input, 7-class output)
- **Dataset:** RAF-DB (12,271 train / 3,068 test real-world facial expression images)
- **Accuracy:** 78.62% on RAF-DB test set
- **Training:** PyTorch with AdamW optimizer, cosine annealing LR, sqrt-weighted loss for class imbalance
- **Deployment:** AWS SageMaker real-time inference endpoint (`ml.c5.xlarge`)
- **Preprocessing:** OpenCV Haar Cascade face detection → grayscale crop → 224×224 resize → normalize

---

## ���️ Project Structure

```
Lumen/
├── backend/                  # FastAPI backend
│   ├── main.py               # App entrypoint
│   ├── database.py           # SQLAlchemy async DB setup
│   ├── models/               # ORM models
│   ├── routes/               # API route handlers
│   │   ├── auth_routes.py
│   │   ├── session_routes.py
│   │   └── analytics_routes.py
│   ├── services/
│   │   └── ai_service.py     # Face detection + SageMaker inference
│   ├── utils/
│   │   └── jwt_handler.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── StudySession.jsx   # Live webcam session
│   │   │   └── ...
│   │   ├── components/
│   │   ├── api/
│   │   │   └── axios.js
│   │   └── main.jsx
│   └── Dockerfile
├── terraform/                # AWS infrastructure as code
│   ├── main.tf
│   ├── ecs.tf                # ECS Fargate cluster
│   ├── alb.tf                # Application Load Balancer
│   ├── rds.tf                # PostgreSQL on RDS
│   ├── sagemaker.tf          # SageMaker endpoint
│   ├── ecr.tf                # Container registry
│   ├── bigdata.tf            # Kinesis stream
│   ├── security.tf           # Security groups
│   ├── route53.tf            # DNS
│   └── variables.tf
├── docker-compose.yml        # Local development
└── lumen_deploy.sh           # Deployment script
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (for local Docker) or set these in your ECS task definition for production.

```env
# Database (PostgreSQL on RDS)
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=lumendb
DB_USER=lumenadmin
DB_PASSWORD=your_db_password

# JWT Auth
JWT_SECRET=your_jwt_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# SageMaker
SAGEMAKER_ENDPOINT=lumen-endpoint

# S3
S3_BUCKET=lumen-cognitive-ai

# Kinesis
KINESIS_STREAM=lumen-cognitive-stream
```

---

## ��� Local Development Setup

### Prerequisites

- Docker Desktop installed and running
- AWS credentials configured (`~/.aws/credentials` or `.env`)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/lumen.git
cd lumen
```

### 2. Create `.env` file

Copy the environment variables above into a `.env` file in the project root and fill in your values.

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Build and run with Docker Compose

```bash
docker compose up --build
```

This starts:
- **Frontend** on `http://localhost` (port 80)
- **Backend** on `http://localhost:8000`

### 4. Access the app

Open `http://localhost` in your browser.

---

## ☁️ Production Deployment (AWS)

### Prerequisites

- AWS CLI configured with sufficient permissions
- Terraform >= 1.0 installed
- Docker installed

### 1. Provision infrastructure with Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

This provisions: ECS Fargate cluster, ALB, RDS PostgreSQL, SageMaker endpoint, ECR repositories, Kinesis stream, security groups, Route53 DNS.

### 2. Build and push Docker images to ECR

```bash
# Authenticate Docker with ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <account_id>.dkr.ecr.ap-south-1.amazonaws.com

# Build and push backend
docker build -t lumen-backend ./backend
docker tag lumen-backend:latest <account_id>.dkr.ecr.ap-south-1.amazonaws.com/lumen-backend:latest
docker push <account_id>.dkr.ecr.ap-south-1.amazonaws.com/lumen-backend:latest

# Build and push frontend
docker build -t lumen-frontend ./frontend
docker tag lumen-frontend:latest <account_id>.dkr.ecr.ap-south-1.amazonaws.com/lumen-frontend:latest
docker push <account_id>.dkr.ecr.ap-south-1.amazonaws.com/lumen-frontend:latest
```

### 3. Deploy SageMaker model

Run the following in a SageMaker notebook (ap-south-1 region):

```python
import tarfile, boto3, sagemaker
from sagemaker.pytorch import PyTorchModel

# Package model
with tarfile.open("lumen_model.tar.gz", "w:gz") as tar:
    tar.add("lumen_rafdb_clean.pth")
    tar.add("inference.py")

# Upload to S3
s3 = boto3.client("s3")
s3.upload_file("lumen_model.tar.gz", "lumen-cognitive-ai", "models/lumen_model.tar.gz")

# Deploy endpoint
session = sagemaker.Session()
role = sagemaker.get_execution_role()

pytorch_model = PyTorchModel(
    model_data="s3://lumen-cognitive-ai/models/lumen_model.tar.gz",
    role=role,
    framework_version="2.1",
    py_version="py310",
    entry_point="inference.py"
)

predictor = pytorch_model.deploy(
    initial_instance_count=1,
    instance_type="ml.c5.xlarge",
    endpoint_name="lumen-endpoint"
)
```

### 4. Update ECS service

```bash
# Force new deployment to pick up latest image
aws ecs update-service \
  --cluster lumen-cluster \
  --service lumen-backend \
  --force-new-deployment \
  --region ap-south-1

aws ecs update-service \
  --cluster lumen-cluster \
  --service lumen-frontend \
  --force-new-deployment \
  --region ap-south-1
```

---

## ��� API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT token |

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/session/start` | Start a study session |
| POST | `/session/pause/{id}` | Pause session |
| POST | `/session/resume/{id}` | Resume session |
| POST | `/session/stop/{id}` | Stop session, compute average load |
| POST | `/session/predict/{id}` | Submit webcam frame, get emotion + load |
| GET | `/session/history` | Get past sessions |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/...` | Session analytics and trends |

---

## ��� ML Training

The model was trained in AWS SageMaker on a GPU instance. To retrain:

### Dataset

- **RAF-DB** — 15,339 real-world facial expression images across 7 classes
- Organized into `rafdb_organized/train/` and `rafdb_organized/test/`
- Classes: `anger`, `disgust`, `fear`, `happy`, `neutral`, `sadness`, `surprise`

### Training

```python
# Key hyperparameters used
optimizer = AdamW(lr=1e-3, weight_decay=1e-2)
scheduler = CosineAnnealingLR(T_max=30)
loss = CrossEntropyLoss(weight=sqrt_class_weights)  # handles imbalance
epochs = 30 + 20 fine-tune + 20 fine-tune
batch_size = 32
input_size = 224x224 grayscale
```

### Model file

Best checkpoint saved as `lumen_rafdb_clean.pth`. Final test accuracy: **78.62%**.

---

## ���️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion |
| Backend | FastAPI, SQLAlchemy (async), Uvicorn |
| ML Model | PyTorch, ResNet18, OpenCV |
| Database | PostgreSQL (AWS RDS) |
| ML Serving | AWS SageMaker |
| Streaming | AWS Kinesis |
| Storage | AWS S3 |
| Container | Docker, AWS ECS Fargate |
| Load Balancer | AWS ALB |
| Registry | AWS ECR |
| IaC | Terraform |
| Auth | JWT (python-jose) |

---

## ��� Known Limitations

- **Webcam accuracy lower than test set accuracy** — domain gap between studio-lit RAF-DB images and real webcam conditions. Expected 10-15% accuracy drop is normal for FER systems.
- **Resting face bias** — neutral resting expressions can be misclassified as sadness. Better lighting and more frontal face positioning improves accuracy.
- **Disgust/fear accuracy ~30-40%** — these are visually similar and hard classes even in state-of-the-art FER research.
- **Single face only** — system takes the largest detected face if multiple people are in frame.

---

## ��� Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

