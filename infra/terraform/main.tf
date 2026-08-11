terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SincroHub"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Container registries used by a future ECS/Fargate deployment.
resource "aws_ecr_repository" "api" {
  name                 = "sincrohub-${var.environment}-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "web" {
  name                 = "sincrohub-${var.environment}-web"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Raw/aggregated telemetry archive. Public access is explicitly blocked and
# server-side encryption is enabled by default.
resource "aws_s3_bucket" "telemetry" {
  bucket_prefix = "sincrohub-${var.environment}-telemetry-"
}

resource "aws_s3_bucket_public_access_block" "telemetry" {
  bucket = aws_s3_bucket.telemetry.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "telemetry" {
  bucket = aws_s3_bucket.telemetry.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "telemetry" {
  bucket = aws_s3_bucket.telemetry.id

  rule {
    id     = "archive-old-telemetry"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/sincrohub/${var.environment}/api"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "workers" {
  name              = "/sincrohub/${var.environment}/workers"
  retention_in_days = var.log_retention_days
}
