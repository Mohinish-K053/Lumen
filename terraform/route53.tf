# ════════════════════════════════════════════════════════════
#   ROUTE53 DNS — quorica.shop
# ════════════════════════════════════════════════════════════

# ALB Hosted Zone ID for ap-south-1
locals {
  alb_hosted_zone_id = "ZP97RAFLXTNZK"
}

# app.quorica.shop → Frontend (ALB port 80)
resource "aws_route53_record" "app" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${var.app_subdomain}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.lumen_alb.dns_name
    zone_id                = local.alb_hosted_zone_id
    evaluate_target_health = true
  }
}

# api.quorica.shop → Backend (ALB port 8000 via target group)
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${var.api_subdomain}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.lumen_alb.dns_name
    zone_id                = local.alb_hosted_zone_id
    evaluate_target_health = true
  }
}
