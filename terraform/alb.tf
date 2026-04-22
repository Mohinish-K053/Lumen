# ════════════════════════════════════════════════════════════
#   APPLICATION LOAD BALANCER
# ════════════════════════════════════════════════════════════

resource "aws_lb" "lumen_alb" {
  name               = "${var.project}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lumen_sg.id]
  subnets            = data.aws_subnets.default.ids

  enable_deletion_protection = false

  tags = {
    Name    = "${var.project}-alb"
    Project = var.project
  }
}

# ─── TARGET GROUPS ──────────────────────────────────────────

resource "aws_lb_target_group" "frontend" {
  name        = "${var.project}-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 10
  }

  tags = {
    Project = var.project
  }
}

resource "aws_lb_target_group" "backend" {
  name        = "${var.project}-backend-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 10
  }

  tags = {
    Project = var.project
  }
}

# ─── LISTENER PORT 80 → redirect to HTTPS ───────────────────

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.lumen_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ─── LISTENER PORT 443 ──────────────────────────────────────

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.lumen_alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:ap-south-1:905418455670:certificate/ff9a5771-46e9-494c-addf-f1ce62810c1d"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# ─── LISTENER RULES ─────────────────────────────────────────

resource "aws_lb_listener_rule" "api_route" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    host_header {
      values = ["api.quorica.shop"]
    }
  }
}

resource "aws_lb_listener_rule" "api_route_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    host_header {
      values = ["api.quorica.shop"]
    }
  }
}