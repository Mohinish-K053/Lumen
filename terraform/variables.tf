variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "lumen"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
  default     = "905418455670"
}

variable "s3_bucket" {
  description = "S3 bucket name"
  type        = string
  default     = "lumen-cognitive-ai"
}

variable "sagemaker_role_arn" {
  description = "SageMaker execution role ARN"
  type        = string
  default     = "arn:aws:iam::905418455670:role/service-role/AmazonSageMaker-ExecutionRole-20260221T172729"
}

variable "ecs_task_role_arn" {
  description = "ECS task execution role ARN"
  type        = string
  default     = "arn:aws:iam::905418455670:role/ecsTaskExecutionRole"
}

variable "firehose_role_arn" {
  description = "Firehose delivery role ARN"
  type        = string
  default     = "arn:aws:iam::905418455670:role/FirehoseDeliveryRole"
}

variable "glue_role_arn" {
  description = "Glue service role ARN"
  type        = string
  default     = "arn:aws:iam::905418455670:role/AWSGlueServiceRole"
}

variable "domain_name" {
  description = "Root domain name in Route53"
  type        = string
  default     = "quorica.shop"
}

variable "app_subdomain" {
  description = "Subdomain for frontend"
  type        = string
  default     = "app"
}

variable "api_subdomain" {
  description = "Subdomain for backend API"
  type        = string
  default     = "api"
}

# ── These are fallbacks only — values come from .env first ──

variable "db_username" {
  description = "RDS username fallback (overridden by .env DB_USER)"
  type        = string
  default     = "lumenadmin"
}

variable "db_name" {
  description = "RDS database name fallback (overridden by .env DB_NAME)"
  type        = string
  default     = "lumendb"
}

variable "db_password_fallback" {
  description = "RDS password fallback — only used if not in .env"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret_fallback" {
  description = "JWT secret fallback — only used if not in .env"
  type        = string
  sensitive   = true
  default     = "changeme_set_in_env_file"
}
