# ════════════════════════════════════════════════════════════
#   OUTPUTS
# ════════════════════════════════════════════════════════════

output "app_url" {
  description = "Frontend URL"
  value       = "http://${var.app_subdomain}.${var.domain_name}"
}

output "api_url" {
  description = "Backend API URL"
  value       = "http://${var.api_subdomain}.${var.domain_name}"
}

output "swagger_docs" {
  description = "Swagger API docs"
  value       = "http://${var.api_subdomain}.${var.domain_name}/docs"
}

output "alb_dns" {
  description = "ALB DNS name"
  value       = aws_lb.lumen_alb.dns_name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.lumen_postgres.address
}

output "sagemaker_endpoint" {
  description = "SageMaker endpoint name"
  value       = aws_sagemaker_endpoint.lumen_endpoint.name
}

output "kinesis_stream" {
  description = "Kinesis stream name"
  value       = aws_kinesis_stream.lumen_stream.name
}

output "athena_database" {
  description = "Athena database name"
  value       = aws_athena_database.lumen_analytics.name
}

output "ecr_backend" {
  description = "ECR backend repository URI"
  value       = aws_ecr_repository.lumen_backend.repository_url
}

output "ecr_frontend" {
  description = "ECR frontend repository URI"
  value       = aws_ecr_repository.lumen_frontend.repository_url
}

output "database_url" {
  description = "Full DATABASE_URL for backend"
  value       = "postgresql+asyncpg://${local.db_username}:${local.db_password}@${aws_db_instance.lumen_postgres.address}:5432/${local.db_name}?ssl=require"
  sensitive   = true
}

# ─── AUTO-UPDATE .ENV FILE ──────────────────────────────────

resource "null_resource" "update_env" {
  depends_on = [
    aws_sagemaker_endpoint.lumen_endpoint,
    aws_db_instance.lumen_postgres,
    aws_lb.lumen_alb,
    aws_kinesis_stream.lumen_stream,
    aws_athena_database.lumen_analytics,
    aws_route53_record.app,
    aws_route53_record.api,
  ]

  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    interpreter = ["C:/Program Files/Git/bin/bash.exe", "-c"]
    command = <<-EOT
      python3 << 'PYEOF'
import os, re

env_path = os.path.abspath("${path.module}/../.env")

updates = {
    "SAGEMAKER_ENDPOINT": "${aws_sagemaker_endpoint.lumen_endpoint.name}",
    "DB_HOST":            "${aws_db_instance.lumen_postgres.address}",
    "DB_PORT":            "5432",
    "DB_NAME":            "${local.db_name}",
    "DB_USER":            "${local.db_username}",
    "DB_PASSWORD":        "${local.db_password}",
    "DATABASE_URL":       "postgresql+asyncpg://${local.db_username}:${local.db_password}@${aws_db_instance.lumen_postgres.address}:5432/${local.db_name}?ssl=require",
    "JWT_SECRET":         "${local.jwt_secret}",
    "JWT_ALGORITHM":      "HS256",
    "JWT_EXPIRE_MINUTES": "1440",
    "AWS_REGION":         "${var.aws_region}",
    "S3_BUCKET":          "${var.s3_bucket}",
    "KINESIS_STREAM":     "${aws_kinesis_stream.lumen_stream.name}",
    "ATHENA_DB":          "${aws_athena_database.lumen_analytics.name}",
    "APP_URL":            "http://${var.app_subdomain}.${var.domain_name}",
    "API_URL":            "http://${var.api_subdomain}.${var.domain_name}",
    "VITE_API_URL":       "http://${var.api_subdomain}.${var.domain_name}",
    "ALB_DNS":            "${aws_lb.lumen_alb.dns_name}",
}

# Read existing .env
try:
    with open(env_path, 'r') as f:
        lines = f.readlines()
except FileNotFoundError:
    lines = []

existing = {}
for line in lines:
    m = re.match(r'^([A-Z_]+)=', line)
    if m:
        existing[m.group(1)] = line

# Update or append
for key, value in updates.items():
    new_line = f"{key}={value}\n"
    if key in existing:
        existing[key] = new_line
    else:
        lines.append(new_line)
        existing[key] = new_line

# Write back
final_lines = []
seen = set()
for line in lines:
    m = re.match(r'^([A-Z_]+)=', line)
    if m:
        key = m.group(1)
        if key not in seen:
            seen.add(key)
            final_lines.append(existing.get(key, line))
    else:
        final_lines.append(line)

with open(env_path, 'w') as f:
    f.writelines(final_lines)

print(f"[OK] .env updated at {env_path}")
for k, v in updates.items():
    if 'PASSWORD' not in k and 'SECRET' not in k:
        print("  {}={}".format(k, v))
PYEOF
    EOT
  }
}
