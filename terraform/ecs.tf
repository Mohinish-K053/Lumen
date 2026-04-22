# ════════════════════════════════════════════════════════════
#   ECS FARGATE
# ════════════════════════════════════════════════════════════

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/ecs/${var.project}-backend"
  retention_in_days = 7

  tags = {
    Project = var.project
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "lumen" {
  name = "${var.project}-cluster"

  tags = {
    Project = var.project
  }
}

# ─── BACKEND TASK DEFINITION ────────────────────────────────

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = var.ecs_task_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode([{
    name  = "${var.project}-backend"
    image = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project}-backend:latest"

    portMappings = [{
      containerPort = 8000
      protocol      = "tcp"
    }]

    essential = true

    environment = [
      { name = "DATABASE_URL",       value = "postgresql+asyncpg://${local.db_username}:${local.db_password}@${aws_db_instance.lumen_postgres.address}:5432/${local.db_name}?ssl=require" },
      { name = "JWT_SECRET",         value = local.jwt_secret },
      { name = "JWT_ALGORITHM",      value = "HS256" },
      { name = "JWT_EXPIRE_MINUTES", value = "1440" },
      { name = "AWS_REGION",         value = var.aws_region },
      { name = "S3_BUCKET",          value = var.s3_bucket },
      { name = "SAGEMAKER_ENDPOINT", value = aws_sagemaker_endpoint.lumen_endpoint.name },
      { name = "KINESIS_STREAM",     value = aws_kinesis_stream.lumen_stream.name }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.project}-backend"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  depends_on = [null_resource.docker_build_push]

  tags = {
    Project = var.project
  }
}

# ─── FRONTEND TASK DEFINITION ───────────────────────────────

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = var.ecs_task_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode([{
    name  = "${var.project}-frontend"
    image = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project}-frontend:latest"

    portMappings = [{
      containerPort = 80
      protocol      = "tcp"
    }]

    essential = true
  }])

  depends_on = [null_resource.docker_build_push]

  tags = {
    Project = var.project
  }
}

# ─── BACKEND ECS SERVICE ────────────────────────────────────

resource "aws_ecs_service" "backend" {
  name            = "${var.project}-backend-svc"
  cluster         = aws_ecs_cluster.lumen.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.lumen_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "${var.project}-backend"
    container_port   = 8000
  }

  depends_on = [
    aws_lb_listener.http,
    aws_iam_role_policy_attachment.ecs_sagemaker,
    aws_iam_role_policy_attachment.ecs_kinesis,
    aws_iam_role_policy_attachment.ecs_s3,
    aws_iam_role_policy_attachment.ecs_ecr,
    aws_iam_role_policy_attachment.ecs_logs,
  ]

  # Force new deployment when task definition changes
  force_new_deployment = true

  tags = {
    Project = var.project
  }
}

# ─── FRONTEND ECS SERVICE ───────────────────────────────────

resource "aws_ecs_service" "frontend" {
  name            = "${var.project}-frontend-svc"
  cluster         = aws_ecs_cluster.lumen.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.lumen_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "${var.project}-frontend"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.http]

  force_new_deployment = true

  tags = {
    Project = var.project
  }
}
