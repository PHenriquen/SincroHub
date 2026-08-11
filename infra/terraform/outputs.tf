output "api_repository_url" {
  value       = aws_ecr_repository.api.repository_url
  description = "ECR repository for the API image."
}

output "web_repository_url" {
  value       = aws_ecr_repository.web.repository_url
  description = "ECR repository for the web image."
}

output "telemetry_bucket" {
  value       = aws_s3_bucket.telemetry.bucket
  description = "Encrypted telemetry archive bucket."
}
