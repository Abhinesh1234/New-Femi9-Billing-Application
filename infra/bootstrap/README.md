# Terraform Bootstrap (one-time, manual)

Terraform's own state can't be stored in infrastructure Terraform itself creates
(chicken-and-egg). Run this once per AWS account, before any `terraform apply`.

    aws s3api create-bucket \
      --bucket femi9-staging-tfstate \
      --region us-east-1 \
      --profile billing-staging

    aws s3api put-bucket-versioning \
      --bucket femi9-staging-tfstate \
      --versioning-configuration Status=Enabled \
      --profile billing-staging

    aws dynamodb create-table \
      --table-name femi9-staging-tflock \
      --attribute-definitions AttributeName=LockID,AttributeType=S \
      --key-schema AttributeName=LockID,KeyType=HASH \
      --billing-mode PAY_PER_REQUEST \
      --profile billing-staging

Do not delete or recreate these by hand once `terraform init` has run against
them — that destroys the ability to track existing staging resources.
