terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── READ .ENV FILE AUTOMATICALLY ───────────────────────────
locals {
  # Parse the root .env file into a map
  env_file_path = "${path.module}/../.env"
  env_content   = fileexists(local.env_file_path) ? file(local.env_file_path) : ""

  env_vars = {
    for line in compact(split("\n", local.env_content)) :
    trimspace(split("=", line)[0]) => trimspace(join("=", slice(split("=", line), 1, length(split("=", line)))))
    if length(split("=", line)) >= 2 && !startswith(trimspace(line), "#") && trimspace(line) != ""
  }

  # Extract values from .env — fall back to var if not in .env
  db_password = lookup(local.env_vars, "DB_PASSWORD", var.db_password_fallback)
  db_username = lookup(local.env_vars, "DB_USER",     var.db_username)
  db_name     = lookup(local.env_vars, "DB_NAME",     var.db_name)
  jwt_secret  = lookup(local.env_vars, "JWT_SECRET",  var.jwt_secret_fallback)
}

# ─── DATA SOURCES ────────────────────────────────────────────
data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}
