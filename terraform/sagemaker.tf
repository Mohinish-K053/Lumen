# ════════════════════════════════════════════════════════════
#   SAGEMAKER ENDPOINT
# ════════════════════════════════════════════════════════════

resource "aws_sagemaker_model" "lumen_model" {
  name               = "${var.project}-model"
  execution_role_arn = var.sagemaker_role_arn

  primary_container {
    image          = "763104351884.dkr.ecr.${var.aws_region}.amazonaws.com/pytorch-inference:2.1-cpu-py310"
    model_data_url = "s3://${var.s3_bucket}/models/lumen_model_v7_rafdb.tar.gz"

    environment = {
      SAGEMAKER_PROGRAM              = "inference.py"
      SAGEMAKER_SUBMIT_DIRECTORY     = "s3://${var.s3_bucket}/models/lumen_model_v7_rafdb.tar.gz"
    }
  }

  tags = {
    Project = var.project
  }
}

resource "aws_sagemaker_endpoint_configuration" "lumen_config" {
  name = "${var.project}-endpoint-config"

  production_variants {
    variant_name           = "AllTraffic"
    model_name             = aws_sagemaker_model.lumen_model.name
    initial_instance_count = 1
    instance_type          = "ml.c5.xlarge"
    initial_variant_weight = 1
  }

  tags = {
    Project = var.project
  }
}

resource "aws_sagemaker_endpoint" "lumen_endpoint" {
  name                 = "${var.project}-endpoint"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.lumen_config.name

  tags = {
    Project = var.project
  }
}
