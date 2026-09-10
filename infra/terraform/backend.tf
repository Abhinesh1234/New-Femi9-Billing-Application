terraform {
  backend "s3" {
    bucket         = "femi9-staging-tfstate"
    key            = "staging/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "femi9-staging-tflock"
    encrypt        = true
  }
}
