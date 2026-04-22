# ════════════════════════════════════════════════════════════
#   SECURITY GROUPS
# ════════════════════════════════════════════════════════════

resource "aws_security_group" "lumen_sg" {
  name        = "${var.project}-sg"
  description = "Lumen ECS Security Group"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project}-sg"
    Project = var.project
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "${var.project}-rds-sg"
  description = "Lumen RDS Security Group"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lumen_sg.id]
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project}-rds-sg"
    Project = var.project
  }
}

# ════════════════════════════════════════════════════════════
#   IAM — Attach policies to ECS task role
# ════════════════════════════════════════════════════════════

resource "aws_iam_role_policy_attachment" "ecs_sagemaker" {
  role       = "ecsTaskExecutionRole"
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}

resource "aws_iam_role_policy_attachment" "ecs_kinesis" {
  role       = "ecsTaskExecutionRole"
  policy_arn = "arn:aws:iam::aws:policy/AmazonKinesisFullAccess"
}

resource "aws_iam_role_policy_attachment" "ecs_s3" {
  role       = "ecsTaskExecutionRole"
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "ecs_ecr" {
  role       = "ecsTaskExecutionRole"
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ecs_logs" {
  role       = "ecsTaskExecutionRole"
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}
