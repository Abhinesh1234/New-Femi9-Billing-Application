resource "aws_secretsmanager_secret" "app_env" {
  name        = "${var.app_name}/${var.environment}/app-env"
  description = "Runtime environment values for the Femi9 Laravel app on ECS (staging)"
}

# The actual secret VALUE is intentionally not set here — Terraform would
# store it in state and in this repo's plan output. Populate it once, out of
# band, after the Aurora and ElastiCache endpoints exist (Tasks 4 and 5):
#
#   aws secretsmanager put-secret-value \
#     --secret-id femi9/staging/app-env \
#     --profile billing-staging \
#     --secret-string file://staging-secret.json
#
# staging-secret.json (never commit this file — it's in .gitignore):
# {
#   "APP_KEY": "base64:...",
#   "DB_HOST": "<aurora endpoint from terraform output aurora_endpoint>",
#   "DB_DATABASE": "femi9_staging",
#   "DB_USERNAME": "femi9_app",
#   "DB_PASSWORD": "<generated, see Task 4 Step 2>",
#   "REDIS_HOST": "<elasticache endpoint from terraform output redis_endpoint>",
#   "AWS_BUCKET": "femi9-staging-uploads",
#   "MAIL_MAILER": "log"
# }
