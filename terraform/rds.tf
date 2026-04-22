# ════════════════════════════════════════════════════════════
#   RDS POSTGRESQL
# ════════════════════════════════════════════════════════════

resource "aws_db_instance" "lumen_postgres" {
  identifier        = "${var.project}-postgres"
  engine            = "postgres"
  engine_version    = "17.7"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = local.db_name
  username = local.db_username
  password = local.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  publicly_accessible     = true
  skip_final_snapshot     = true
  backup_retention_period = 0
  multi_az                = false
  deletion_protection     = false

  tags = {
    Name    = "${var.project}-postgres"
    Project = var.project
  }
}
