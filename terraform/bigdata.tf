# ════════════════════════════════════════════════════════════
#   BIG DATA PIPELINE
#   Kinesis → Firehose → S3 → Glue → Athena
# ════════════════════════════════════════════════════════════

# ─── KINESIS DATA STREAM ────────────────────────────────────

resource "aws_kinesis_stream" "lumen_stream" {
  name        = "${var.project}-cognitive-stream"
  shard_count = 1

  stream_mode_details {
    stream_mode = "PROVISIONED"
  }

  tags = {
    Project = var.project
  }
}

# ─── FIREHOSE → S3 ──────────────────────────────────────────

resource "aws_kinesis_firehose_delivery_stream" "lumen_firehose" {
  name        = "${var.project}-firehose"
  destination = "extended_s3"

  kinesis_source_configuration {
    kinesis_stream_arn = aws_kinesis_stream.lumen_stream.arn
    role_arn           = var.firehose_role_arn
  }

  extended_s3_configuration {
    role_arn           = var.firehose_role_arn
    bucket_arn         = "arn:aws:s3:::${var.s3_bucket}"
    buffering_size     = 5
    buffering_interval = 60
    compression_format = "UNCOMPRESSED"

    prefix              = "data-lake/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/"
    error_output_prefix = "data-lake-errors/!{firehose:error-output-type}/"
  }

  tags = {
    Project = var.project
  }
}

# ─── GLUE DATABASE ──────────────────────────────────────────

resource "aws_glue_catalog_database" "lumen_db" {
  name = "${var.project}_glue_db"
}

# ─── GLUE CRAWLER ───────────────────────────────────────────

resource "aws_glue_crawler" "lumen_crawler" {
  name          = "${var.project}-crawler"
  role          = var.glue_role_arn
  database_name = aws_glue_catalog_database.lumen_db.name
  schedule      = "cron(0 * * * ? *)"

  s3_target {
    path = "s3://${var.s3_bucket}/data-lake/"
  }

  tags = {
    Project = var.project
  }
}

# ─── ATHENA DATABASE + WORKGROUP ────────────────────────────

resource "aws_athena_workgroup" "lumen" {
  name          = "${var.project}-workgroup"
  force_destroy = true

  configuration {
    result_configuration {
      output_location = "s3://${var.s3_bucket}/athena-results/"
    }
  }

  tags = {
    Project = var.project
  }
}

resource "aws_athena_database" "lumen_analytics" {
  name   = "${var.project}_analytics"
  bucket = var.s3_bucket
  force_destroy = true
}

# ─── ATHENA TABLE ───────────────────────────────────────────

resource "aws_athena_named_query" "create_table" {
  name      = "${var.project}-create-cognitive-logs-table"
  workgroup = aws_athena_workgroup.lumen.id
  database  = aws_athena_database.lumen_analytics.name

  query = <<-SQL
    CREATE EXTERNAL TABLE IF NOT EXISTS cognitive_logs (
      user_id    STRING,
      session_id STRING,
      emotion    STRING,
      load_level STRING,
      confidence DOUBLE,
      timestamp  STRING
    )
    ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
    LOCATION 's3://${var.s3_bucket}/data-lake/'
    TBLPROPERTIES ('has_encrypted_data'='false');
  SQL
}
