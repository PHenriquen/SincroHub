variable "aws_region" {
  description = "AWS region used by the SincroHub cloud lab."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging or prod"
  }
}

variable "log_retention_days" {
  description = "CloudWatch retention period."
  type        = number
  default     = 14
}
