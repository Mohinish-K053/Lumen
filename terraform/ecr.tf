# ════════════════════════════════════════════════════════════
#   ECR REPOSITORIES
# ════════════════════════════════════════════════════════════

resource "aws_ecr_repository" "lumen_backend" {
  name                 = "${var.project}-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = false
  }

  tags = {
    Project = var.project
  }
}

resource "aws_ecr_repository" "lumen_frontend" {
  name                 = "${var.project}-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = false
  }

  tags = {
    Project = var.project
  }
}

# ─── BUILD AND PUSH DOCKER IMAGES ───────────────────────────
# This runs after ECR repos are created
resource "null_resource" "docker_build_push" {
  depends_on = [
    aws_ecr_repository.lumen_backend,
    aws_ecr_repository.lumen_frontend,
    aws_db_instance.lumen_postgres,
    aws_sagemaker_endpoint.lumen_endpoint,
  ]

  # Re-run if any source file changes
  triggers = {
    backend_dockerfile  = filemd5("${path.module}/../backend/Dockerfile")
    frontend_dockerfile = filemd5("${path.module}/../frontend/Dockerfile")
    backend_main        = filemd5("${path.module}/../backend/main.py")
    always_run          = timestamp()
  }

  provisioner "local-exec" {
    interpreter = ["C:/Program Files/Git/bin/bash.exe", "-c"]
    working_dir = "${path.module}/.."
    command     = <<-EOT
      export AWS_PAGER=""
      export MSYS_NO_PATHCONV=1

      echo "[→] Logging into ECR..."
      aws ecr get-login-password --region ${var.aws_region} | \
        docker login --username AWS --password-stdin \
        ${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com

      echo "[→] Building backend..."
      docker build -t ${var.project}-backend:latest ./backend
      docker tag ${var.project}-backend:latest \
        ${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project}-backend:latest

      echo "[→] Building frontend..."
      docker build -t ${var.project}-frontend:latest ./frontend
      docker tag ${var.project}-frontend:latest \
        ${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project}-frontend:latest

      echo "[→] Pushing backend to ECR..."
      for i in 1 2 3 4 5; do
        docker push ${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project}-backend:latest && break
        echo "[!] Push failed, retrying in 30s..."
        sleep 30
      done

      echo "[→] Pushing frontend to ECR..."
      for i in 1 2 3 4 5; do
        docker push ${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project}-frontend:latest && break
        echo "[!] Push failed, retrying in 30s..."
        sleep 30
      done

      echo "[✔] Images pushed to ECR"
    EOT
  }
}
