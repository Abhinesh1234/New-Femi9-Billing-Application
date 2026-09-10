variable "aws_region" {
  description = "AWS region for all staging resources"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "Local AWS CLI profile used for terraform plan/apply"
  type        = string
  default     = "billing-staging"
}

variable "environment" {
  description = "Environment name, used as a resource name prefix"
  type        = string
  default     = "staging"
}

variable "app_name" {
  description = "Application name, used as a resource name prefix"
  type        = string
  default     = "femi9"
}
