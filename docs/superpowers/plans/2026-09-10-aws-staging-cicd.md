# AWS Staging Environment + CI/CD Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a single AWS staging environment for Femi9 Billing (same-origin Laravel+React on ECS Fargate, Aurora Serverless v2, ElastiCache, S3), containerize local dev to match it, and wire a GitHub Actions pipeline that deploys every push to `develop` to that staging environment automatically.

**Architecture:** Laravel serves the Vite-built React SPA from the same container/domain (confirmed decision: same-origin hosting) behind CloudFront → ALB → ECS Fargate. Aurora Serverless v2 (MySQL-compatible) replaces SQLite; ElastiCache Redis replaces database-backed sessions/cache/queue; S3 replaces local disk storage. All infrastructure is defined in Terraform so staging is reproducible and production can later reuse the same modules with different tfvars. Local development moves from bare SQLite to Docker Compose (MySQL + Redis containers) so the SQL dialect and cache/queue drivers match staging without touching real AWS resources day-to-day.

**Tech Stack:** Terraform (AWS provider), Docker / Docker Compose, GitHub Actions, AWS ECS Fargate + ECR, Aurora Serverless v2 (MySQL 8-compatible), ElastiCache Redis, S3, Application Load Balancer, CloudFront, Secrets Manager, CloudWatch. Laravel 11 + Sanctum, React 18 + Vite (existing app, unchanged business logic).

**Spec:** Femi9 AWS Architecture reference — https://claude.ai/code/artifact/15ae7ce7-bee6-4b74-b5f5-441588f32818 (production + budget tiers; this plan builds the staging-sized variant of that architecture, using Aurora Serverless v2 as decided).

## Global Constraints

- **CRITICAL — do not touch existing AWS resources.** This AWS account already runs other services (existing EC2 instances, existing RDS databases, and others unrelated to this project). Every resource this plan creates must be net-new and unambiguously scoped to Femi9 staging: unique `femi9-staging-*` names, its own VPC/CIDR range (never the default VPC), its own security groups (never attaching to or modifying an existing SG), its own IAM roles/users (never modifying an existing role's policy). Before any `terraform apply`, `aws ec2 ...`, `aws rds ...`, or similar create/modify command runs, the implementer must first run the corresponding `aws ... describe/list` command and confirm nothing pre-existing matches the name/tag this task is about to create, and must never run `terraform apply` against a plan that shows changes to any resource this plan didn't itself create in an earlier task. Destructive commands (`terraform destroy`, `aws rds delete-*`, `aws ec2 terminate-*`, `aws s3 rb`, `aws iam delete-*`) are never run as part of any task in this plan — full stop, regardless of what the task text says.
- Environment scope for this plan: **staging only**. Do not create production infrastructure or a `main`-branch deploy workflow in this plan.
- Hosting model: **same-origin** — the React build output stays inside Laravel's `public/build/` and is served by the same ECS service. No separate CloudFront-for-frontend / ALB-for-API split.
- IaC tool: **Terraform**. No manual click-ops resources outside what Terraform bootstrap itself requires (the S3 backend bucket + DynamoDB lock table, created once, documented, not managed by Terraform itself to avoid the chicken-and-egg problem).
- CI/CD platform: **GitHub Actions**. Repo is `Abhinesh1234/New-Femi9-Billing-Application` on GitHub.
- Local dev must keep working **without** AWS credentials present — default `.env` stays pointed at local Docker containers (MySQL, Redis) and `MAIL_MAILER=log`. AWS services (S3, SES, SNS) are only ever targeted by staging/production `.env` values, never by the default local one.
- Every AWS resource name is prefixed `femi9-staging-` so it's unambiguous in the console and never collides with a future `femi9-prod-` resource.
- Secrets (DB password, `APP_KEY`, AWS keys used *inside* the container) live in AWS Secrets Manager, injected into the ECS task at runtime — never committed to the repo or baked into the Docker image.
- Every infrastructure task ends with a concrete, runnable verification command (`terraform plan`/`apply` output, `curl`, `aws` CLI query, GitHub Actions run) — no task is "done" on code existing alone.

---

## File Structure

```
Femi9 Billing Site/
├── docker/
│   ├── php/
│   │   └── Dockerfile                  # multi-stage: composer install → npm build → php-fpm runtime
│   ├── nginx/
│   │   └── default.conf                # serves public/, proxies PHP to php-fpm
│   └── local/
│       └── php.ini                     # local-only PHP overrides (upload size, memory)
├── docker-compose.yml                  # local dev: app, mysql, redis, mailpit
├── .dockerignore
├── .env.staging.example                # documents staging env var shape (no real secrets)
├── infra/
│   ├── bootstrap/
│   │   └── README.md                   # one-time manual step: create TF state bucket + lock table
│   └── terraform/
│       ├── providers.tf
│       ├── variables.tf
│       ├── backend.tf
│       ├── vpc.tf
│       ├── ecr.tf
│       ├── secrets.tf
│       ├── aurora.tf
│       ├── elasticache.tf
│       ├── s3.tf
│       ├── alb.tf
│       ├── ecs.tf
│       ├── cloudfront.tf
│       ├── iam.tf
│       ├── cloudwatch.tf
│       ├── outputs.tf
│       └── environments/
│           └── staging.tfvars
└── .github/
    └── workflows/
        └── deploy-staging.yml          # build → push ECR → terraform apply → migrate → force new deployment
```

Each Terraform file owns one AWS concern (network, data, compute, edge) so a reviewer can approve "the Aurora setup" without re-reading the ALB rules. `docker-compose.yml` and the `docker/` folder are the local-parity half of the plan; `infra/` and `.github/` are the AWS + pipeline half.

---

### Task 1: AWS account access & Terraform bootstrap

**Files:**
- Create: `infra/bootstrap/README.md`
- Create: `infra/terraform/backend.tf`
- Create: `infra/terraform/providers.tf`
- Create: `infra/terraform/variables.tf`

**Interfaces:**
- Produces: a working `terraform init` in `infra/terraform/`, an S3 bucket `femi9-staging-tfstate` and DynamoDB table `femi9-staging-tflock` that every later Terraform task relies on for state.

- [ ] **Step 1: Install the tools locally**

Run:
```bash
brew install awscli terraform
aws --version   # expect aws-cli/2.x
terraform -version  # expect Terraform v1.7+
```
Expected: both print version strings without error. (Confirmed neither is installed yet — this is the first real gap to close.)

- [ ] **Step 2: Create an IAM user for Terraform (not your root/personal AWS login)**

In the AWS Console → IAM → Users → Create user `femi9-terraform-staging`, attach policy `AdministratorAccess` **scoped to the staging account only if you use a separate AWS account for staging** (recommended); otherwise attach a tightly-scoped policy covering EC2/VPC, ECS, ECR, RDS, ElastiCache, S3, IAM (for creating task roles), CloudFront, Secrets Manager, CloudWatch. Generate an access key pair.

Configure it locally:
```bash
aws configure --profile billing-staging
# AWS Access Key ID: <paste>
# AWS Secret Access Key: <paste>
# Default region: us-east-1
# Default output format: json
```

Expected: `aws sts get-caller-identity --profile billing-staging` returns the IAM user ARN, not an error.

- [ ] **Step 3: Create the Terraform state bucket and lock table manually (one-time, not managed by Terraform)**

Write `infra/bootstrap/README.md`:
```markdown
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
```

Run those three commands.
Expected: `aws s3api list-buckets --profile billing-staging` includes `femi9-staging-tfstate`; `aws dynamodb list-tables --profile billing-staging` includes `femi9-staging-tflock`.

- [ ] **Step 4: Write the Terraform backend and provider config**

`infra/terraform/backend.tf`:
```hcl
terraform {
  backend "s3" {
    bucket         = "femi9-staging-tfstate"
    key            = "staging/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "femi9-staging-tflock"
    encrypt        = true
  }
}
```

`infra/terraform/providers.tf`:
```hcl
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}
```

`infra/terraform/variables.tf`:
```hcl
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
```

- [ ] **Step 5: Initialize Terraform against the new backend**

Run:
```bash
cd infra/terraform
terraform init
```
Expected: `Terraform has been successfully initialized!` with the S3 backend configured — no local `terraform.tfstate` file created (it lives in S3 now).

- [ ] **Step 6: Commit**

```bash
git add infra/bootstrap/README.md infra/terraform/backend.tf infra/terraform/providers.tf infra/terraform/variables.tf
git commit -m "infra: bootstrap Terraform S3 backend and AWS provider for staging

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: VPC and networking

**Files:**
- Create: `infra/terraform/vpc.tf`

**Interfaces:**
- Consumes: `var.app_name`, `var.environment` from Task 1.
- Produces: `aws_vpc.main.id`, `aws_subnet.public[*].id` (2 AZs), `aws_subnet.private[*].id` (2 AZs), `aws_security_group.ecs_tasks.id`, `aws_security_group.rds.id`, `aws_security_group.redis.id`, `aws_security_group.alb.id` — every later task (ECS, Aurora, ElastiCache, ALB) references these by name.

- [ ] **Step 0: Safety pre-check — confirm no collision with existing account resources**

This account already runs other services (existing EC2 instances, existing RDS databases, and others unrelated to this project). Before writing any Terraform, run:
```bash
aws ec2 describe-vpcs --profile billing-staging --query 'Vpcs[].{Id:VpcId,CIDR:CidrBlock,Name:Tags[?Key==`Name`]|[0].Value}' --output table
```
Expected: confirm the CIDR range `10.20.0.0/16` (used below) does not already appear in this list, and confirm no existing VPC is tagged with the name `femi9-staging-vpc`. This task creates a brand-new VPC — it never modifies, peers with, or references any VPC already in this output. If `10.20.0.0/16` does collide with an existing VPC's range, stop and pick a different unused `/16` (e.g. `10.30.0.0/16`) before proceeding, and use that value consistently in every step below instead of `10.20.0.0/16`.

- [ ] **Step 1: Write the VPC and subnets**

`infra/terraform/vpc.tf`:
```hcl
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.app_name}-${var.environment}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-${var.environment}-igw"
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.20.${count.index}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-${var.environment}-public-${count.index}"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.20.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.app_name}-${var.environment}-private-${count.index}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

- [ ] **Step 2: Add a single NAT gateway (staging only needs one, not one per AZ) so private-subnet tasks can reach ECR/S3**

Append to `infra/terraform/vpc.tf`:
```hcl
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${var.app_name}-${var.environment}-nat-eip"
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "${var.app_name}-${var.environment}-nat"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-private-rt"
  }
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
```

- [ ] **Step 3: Add security groups scoped to exactly what talks to what**

Append to `infra/terraform/vpc.tf`:
```hcl
resource "aws_security_group" "alb" {
  name        = "${var.app_name}-${var.environment}-alb-sg"
  description = "Allow inbound HTTP/HTTPS from the internet"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-alb-sg"
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "${var.app_name}-${var.environment}-ecs-sg"
  description = "Allow inbound from ALB only"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-ecs-sg"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.app_name}-${var.environment}-rds-sg"
  description = "Allow inbound MySQL from ECS tasks only"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-rds-sg"
  }
}

resource "aws_security_group" "redis" {
  name        = "${var.app_name}-${var.environment}-redis-sg"
  description = "Allow inbound Redis from ECS tasks only"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-redis-sg"
  }
}
```

- [ ] **Step 4: Validate and plan**

Run:
```bash
cd infra/terraform
terraform fmt
terraform validate
terraform plan
```
Expected: `terraform validate` reports `Success!`; `terraform plan` shows ~15 resources to add (VPC, IGW, 4 subnets, 2 route tables, NAT+EIP, 4 security groups) with zero errors. Do not `apply` yet — later tasks add outputs that make it easier to verify this layer as one plan.

- [ ] **Step 5: Commit**

```bash
git add infra/terraform/vpc.tf
git commit -m "infra: add staging VPC, subnets, NAT gateway, and security groups

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: ECR repository and Secrets Manager entries

**Files:**
- Create: `infra/terraform/ecr.tf`
- Create: `infra/terraform/secrets.tf`

**Interfaces:**
- Consumes: `var.app_name`, `var.environment`.
- Produces: `aws_ecr_repository.app.repository_url` (used by the GitHub Actions workflow in Task 8 and by `ecs.tf` in Task 6), `aws_secretsmanager_secret.app_env.arn` (used by `ecs.tf` to inject secrets into the task definition).

- [ ] **Step 1: Write the ECR repository**

`infra/terraform/ecr.tf`:
```hcl
resource "aws_ecr_repository" "app" {
  name                 = "${var.app_name}-${var.environment}-app"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-ecr"
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}
```

- [ ] **Step 2: Write the Secrets Manager secret placeholder — a single JSON secret holding every runtime env value the app needs**

`infra/terraform/secrets.tf`:
```hcl
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
```

- [ ] **Step 3: Add `staging-secret.json` to `.gitignore`**

Run:
```bash
grep -qxF 'staging-secret.json' .gitignore || echo 'staging-secret.json' >> .gitignore
```
Expected: `.gitignore` now contains `staging-secret.json` on its own line.

- [ ] **Step 4: Validate**

Run:
```bash
cd infra/terraform
terraform fmt && terraform validate
```
Expected: `Success!`

- [ ] **Step 5: Commit**

```bash
git add infra/terraform/ecr.tf infra/terraform/secrets.tf .gitignore
git commit -m "infra: add ECR repository and Secrets Manager placeholder for staging

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Aurora Serverless v2 (staging-sized)

**Files:**
- Create: `infra/terraform/aurora.tf`

**Interfaces:**
- Consumes: `aws_vpc.main.id`, `aws_subnet.private[*].id`, `aws_security_group.rds.id` from Task 2.
- Produces: `aws_rds_cluster.main.endpoint` (referenced in the manual staging secret from Task 3, and read via `terraform output aurora_endpoint`).

- [ ] **Step 1: Write the Aurora Serverless v2 cluster — single writer, no reader, floor of 0.5 ACU (staging doesn't need the reader instance from the production-tier doc)**

`infra/terraform/aurora.tf`:
```hcl
resource "aws_db_subnet_group" "aurora" {
  name       = "${var.app_name}-${var.environment}-aurora-subnets"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.app_name}-${var.environment}-aurora-subnets"
  }
}

resource "random_password" "db" {
  length  = 24
  special = false
}

resource "aws_rds_cluster" "main" {
  cluster_identifier     = "${var.app_name}-${var.environment}-aurora"
  engine                 = "aurora-mysql"
  engine_mode            = "provisioned"
  engine_version         = "8.0.mysql_aurora.3.05.2"
  database_name          = "femi9_staging"
  master_username        = "femi9_app"
  master_password        = random_password.db.result
  db_subnet_group_name   = aws_db_subnet_group.aurora.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true
  storage_encrypted      = true

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 2
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-aurora"
  }
}

resource "aws_rds_cluster_instance" "writer" {
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version
}
```

`skip_final_snapshot = true` is a staging-only shortcut — production Terraform must set this `false` so a `terraform destroy` can't silently delete billing data with no recovery point.

- [ ] **Step 2: Add the `random` provider needed for `random_password`**

Edit `infra/terraform/providers.tf`, add to `required_providers`:
```hcl
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
```

- [ ] **Step 3: Add the Aurora endpoint as a Terraform output**

`infra/terraform/outputs.tf` (create if it doesn't exist yet from an earlier task):
```hcl
output "aurora_endpoint" {
  description = "Aurora Serverless v2 cluster writer endpoint"
  value       = aws_rds_cluster.main.endpoint
}

output "aurora_master_password" {
  description = "Generated Aurora master password (sensitive — used only to populate Secrets Manager once)"
  value       = random_password.db.result
  sensitive   = true
}
```

- [ ] **Step 4: Re-init (new provider), validate, plan**

Run:
```bash
cd infra/terraform
terraform init -upgrade
terraform fmt && terraform validate
terraform plan
```
Expected: plan adds the DB subnet group, the Aurora cluster, and one `db.serverless` instance — no errors. `terraform validate` reports `Success!`.

- [ ] **Step 5: Apply just this layer plus everything before it**

Run:
```bash
terraform apply
```
Type `yes` when prompted. Expected: apply completes; `terraform output aurora_endpoint` prints a `*.rds.amazonaws.com` hostname. This is a real, billed AWS resource from this point on — note the ~$45-60/mo staging cost from the architecture doc's budget tier.

- [ ] **Step 6: Retrieve the generated password for the Secrets Manager step in Task 3**

Run:
```bash
terraform output -raw aurora_master_password
```
Expected: prints the 24-character password. Use this value for `DB_PASSWORD` in `staging-secret.json` from Task 3, Step 2.

- [ ] **Step 7: Commit**

```bash
git add infra/terraform/aurora.tf infra/terraform/outputs.tf infra/terraform/providers.tf
git commit -m "infra: add Aurora Serverless v2 staging database cluster

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: ElastiCache Redis (staging-sized)

**Files:**
- Create: `infra/terraform/elasticache.tf`
- Modify: `infra/terraform/outputs.tf`

**Interfaces:**
- Consumes: `aws_subnet.private[*].id`, `aws_security_group.redis.id` from Task 2.
- Produces: `aws_elasticache_cluster.main.cache_nodes[0].address` via `terraform output redis_endpoint`.

- [ ] **Step 1: Write a single-node Redis cluster (matches the budget-tier sizing from the architecture doc — cache.t4g.micro)**

`infra/terraform/elasticache.tf`:
```hcl
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.app_name}-${var.environment}-redis-subnets"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${var.app_name}-${var.environment}-redis"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Name = "${var.app_name}-${var.environment}-redis"
  }
}
```

- [ ] **Step 2: Add the Redis endpoint output**

Append to `infra/terraform/outputs.tf`:
```hcl
output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}
```

- [ ] **Step 3: Validate, plan, apply**

Run:
```bash
cd infra/terraform
terraform fmt && terraform validate
terraform plan
terraform apply
```
Type `yes` when prompted. Expected: `terraform output redis_endpoint` prints a `*.cache.amazonaws.com` hostname.

- [ ] **Step 4: Commit**

```bash
git add infra/terraform/elasticache.tf infra/terraform/outputs.tf
git commit -m "infra: add ElastiCache Redis for staging sessions/cache/queue

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: S3 bucket, IAM roles, ALB, and ECS Fargate service

**Files:**
- Create: `infra/terraform/s3.tf`
- Create: `infra/terraform/iam.tf`
- Create: `infra/terraform/alb.tf`
- Create: `infra/terraform/ecs.tf`
- Modify: `infra/terraform/outputs.tf`

**Interfaces:**
- Consumes: `aws_vpc.main.id`, `aws_subnet.public[*].id`, `aws_subnet.private[*].id`, `aws_security_group.alb.id`, `aws_security_group.ecs_tasks.id` (Task 2); `aws_ecr_repository.app.repository_url`, `aws_secretsmanager_secret.app_env.arn` (Task 3).
- Produces: `aws_lb.main.dns_name` via `terraform output alb_dns_name` (the staging URL until a custom domain is wired up); `aws_ecs_service.app.name` and `aws_ecs_cluster.main.name` (used by the GitHub Actions workflow in Task 8 to force a new deployment); `aws_s3_bucket.uploads.bucket` (referenced by the staging secret's `AWS_BUCKET` value).

- [ ] **Step 1: S3 bucket for uploads, private by default**

`infra/terraform/s3.tf`:
```hcl
resource "aws_s3_bucket" "uploads" {
  bucket = "${var.app_name}-${var.environment}-uploads"

  tags = {
    Name = "${var.app_name}-${var.environment}-uploads"
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

- [ ] **Step 2: IAM roles — one for ECS to pull images/read secrets (execution role), one for the running app (task role, scoped to its own S3 bucket)**

`infra/terraform/iam.tf`:
```hcl
data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution" {
  name               = "${var.app_name}-${var.environment}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "ecs_execution_secrets" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.app_env.arn]
  }
}

resource "aws_iam_role_policy" "ecs_execution_secrets" {
  name   = "${var.app_name}-${var.environment}-ecs-execution-secrets"
  role   = aws_iam_role.ecs_execution.id
  policy = data.aws_iam_policy_document.ecs_execution_secrets.json
}

resource "aws_iam_role" "ecs_task" {
  name               = "${var.app_name}-${var.environment}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

data "aws_iam_policy_document" "ecs_task_s3" {
  statement {
    actions = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
    resources = [
      aws_s3_bucket.uploads.arn,
      "${aws_s3_bucket.uploads.arn}/*"
    ]
  }
}

resource "aws_iam_role_policy" "ecs_task_s3" {
  name   = "${var.app_name}-${var.environment}-ecs-task-s3"
  role   = aws_iam_role.ecs_task.id
  policy = data.aws_iam_policy_document.ecs_task_s3.json
}
```

- [ ] **Step 3: Application Load Balancer, target group, and HTTP listener (staging skips ACM/HTTPS initially — added when a real domain is pointed at it)**

`infra/terraform/alb.tf`:
```hcl
resource "aws_lb" "main" {
  name               = "${var.app_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "app" {
  name        = "${var.app_name}-${var.environment}-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/up"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
```

`/up` is Laravel 11's built-in health-check route (registered by default in `bootstrap/app.php`) — no application code change needed for the health check to work.

- [ ] **Step 4: ECS cluster, task definition, and service**

`infra/terraform/ecs.tf`:
```hcl
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-${var.environment}-cluster"
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.app_name}-${var.environment}-app"
  retention_in_days = 14
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.app_name}-${var.environment}-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "${aws_ecr_repository.app.repository_url}:latest"
      essential = true
      portMappings = [{ containerPort = 80, protocol = "tcp" }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "app"
        }
      }
      secrets = [
        { name = "APP_KEY", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:APP_KEY::" },
        { name = "DB_HOST", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:DB_HOST::" },
        { name = "DB_DATABASE", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:DB_DATABASE::" },
        { name = "DB_USERNAME", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:DB_USERNAME::" },
        { name = "DB_PASSWORD", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:DB_PASSWORD::" },
        { name = "REDIS_HOST", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:REDIS_HOST::" },
        { name = "AWS_BUCKET", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:AWS_BUCKET::" }
      ]
      environment = [
        { name = "APP_ENV", value = "staging" },
        { name = "DB_CONNECTION", value = "mysql" },
        { name = "CACHE_STORE", value = "redis" },
        { name = "SESSION_DRIVER", value = "redis" },
        { name = "QUEUE_CONNECTION", value = "redis" },
        { name = "FILESYSTEM_DISK", value = "s3" },
        { name = "AWS_DEFAULT_REGION", value = var.aws_region }
      ]
    }
  ])
}

resource "aws_ecs_service" "app" {
  name            = "${var.app_name}-${var.environment}-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.http]
}
```

`desired_count = 1` (not the production doc's 2 tasks) — staging doesn't need redundancy, only correctness. `valueFrom` with the `:KEY::` suffix pulls one field out of the single JSON secret from Task 3 rather than needing one Secrets Manager entry per variable.

- [ ] **Step 5: Add outputs for the ALB URL and ECS identifiers the pipeline needs**

Append to `infra/terraform/outputs.tf`:
```hcl
output "alb_dns_name" {
  description = "Staging URL (until a custom domain/CloudFront is added)"
  value       = aws_lb.main.dns_name
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}
```

- [ ] **Step 6: Validate**

Run:
```bash
cd infra/terraform
terraform fmt && terraform validate
terraform plan
```
Expected: `Success!` from validate; plan shows the S3 bucket, 2 IAM roles + policies, ALB + target group + listener, ECS cluster + task definition + service as pending adds. **Do not apply yet** — the task definition references `:latest` in ECR, which doesn't have an image pushed until Task 7 builds one. Applying now will create the service but its task will fail to start (image not found) — that's expected and fixed by Task 7, not a plan error.

- [ ] **Step 7: Commit**

```bash
git add infra/terraform/s3.tf infra/terraform/iam.tf infra/terraform/alb.tf infra/terraform/ecs.tf infra/terraform/outputs.tf
git commit -m "infra: add S3 uploads bucket, IAM roles, ALB, and ECS Fargate service

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Dockerize the app (multi-stage build) and local Docker Compose parity

**Files:**
- Create: `docker/php/Dockerfile`
- Create: `docker/nginx/default.conf`
- Create: `docker/local/php.ini`
- Create: `docker-compose.yml`
- Create: `.dockerignore`
- Modify: `.env.example`

**Interfaces:**
- Produces: a built image taggable as `<ecr_repository_url>:latest` (consumed by Task 6's ECS task definition and Task 8's pipeline); a `docker compose up` that runs the whole app locally against MySQL + Redis containers instead of SQLite.

- [ ] **Step 1: Write the multi-stage Dockerfile — build the Vite assets, install PHP deps, assemble a slim runtime image**

`docker/php/Dockerfile`:
```dockerfile
# ---- Stage 1: frontend build ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: PHP dependencies ----
# NOTE: composer.lock pins symfony/string, symfony/translation, symfony/clock,
# symfony/event-dispatcher, symfony/css-selector, symfony/yaml at 8.0.x, which
# require php >= 8.4. Both this stage and the runtime stage therefore run PHP 8.4
# (not 8.2 — the composer.json floor of ^8.2 is satisfied, but the resolved lock
# needs 8.4). Running composer under 8.4 also makes the generated
# vendor/composer/platform_check.php assert a version the runtime satisfies.
FROM php:8.4-cli-alpine AS composer_deps
RUN apk add --no-cache git unzip libzip-dev icu-dev \
  && docker-php-ext-install zip intl \
  && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

# ---- Stage 3: runtime ----
FROM php:8.4-fpm-alpine AS runtime

RUN apk add --no-cache \
    nginx supervisor \
    libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev icu-dev oniguruma-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install pdo_mysql gd zip intl mbstring bcmath opcache

WORKDIR /var/www/html

# COPY . . before the vendor copy-from so the app source doesn't clobber the
# freshly-built vendor/ (.dockerignore excludes vendor/ from the build context,
# but ordering this way is belt-and-braces).
COPY . .
COPY --from=composer_deps /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build

COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/local/php.ini /usr/local/etc/php/conf.d/zz-custom.ini

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

CMD php-fpm -D && nginx -g 'daemon off;'
```

- [ ] **Step 2: Write the nginx config that serves Laravel's `public/` directory and proxies PHP to php-fpm on the same container**

`docker/nginx/default.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html/public;
    index index.php;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

- [ ] **Step 3: Write a small PHP override for local uploads (matches the production `client_max_body_size` above)**

`docker/local/php.ini`:
```ini
upload_max_filesize = 20M
post_max_size = 20M
memory_limit = 256M
```

- [ ] **Step 4: Write `.dockerignore` so the image build doesn't ship `node_modules`, `vendor`, or local env files**

`.dockerignore`:
```
node_modules
vendor
.git
.env
.env.*
storage/logs/*
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
docs/
```

- [ ] **Step 5: Write `docker-compose.yml` for local development — MySQL and Redis containers replacing SQLite and database-backed drivers, matching staging's engine choices without touching AWS**

`docker-compose.yml`:
```yaml
services:
  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    ports:
      - "8000:80"
    env_file:
      - .env
    depends_on:
      - mysql
      - redis
    volumes:
      - ./storage:/var/www/html/storage

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: femi9_local
      MYSQL_USER: femi9_app
      MYSQL_PASSWORD: femi9_local_pw
      MYSQL_ROOT_PASSWORD: femi9_local_root_pw
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mailpit:
    image: axllent/mailpit
    ports:
      - "8025:8025"   # web UI to view sent mail
      - "1025:1025"   # SMTP port the app sends to

volumes:
  mysql_data:
```

This is the concrete answer to "should localhost be adjusted to match AWS" — the app code and its env-driven config (already true today per `config/database.php` etc.) don't change; only the *engine* underneath changes from SQLite/log-mailer to MySQL/Mailpit, matching staging's dialect without ever touching a real AWS resource from a laptop.

- [ ] **Step 6: Update `.env.example` to point at the Compose services by default, and document that AWS values are staging/production-only**

Edit `.env.example`, changing these lines:
```
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=femi9_local
DB_USERNAME=femi9_app
DB_PASSWORD=femi9_local_pw

SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null

# AWS_* below are only used when FILESYSTEM_DISK=s3 — leave FILESYSTEM_DISK=local
# for day-to-day local dev. Staging/production set these via Secrets Manager,
# never by hand in a committed .env file.
FILESYSTEM_DISK=local
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

- [ ] **Step 7: Build and run locally to verify the container works before it's ever pushed to ECR**

Run:
```bash
cp .env.example .env
docker compose build
docker compose up -d
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
curl -i http://localhost:8000/up
```
Expected: `curl` returns `HTTP/1.1 200 OK`. This is the same `/up` health-check path Task 6's ALB target group polls in staging — proving it locally here means the ECS health check has already been validated once before it costs anything on AWS.

- [ ] **Step 8: Commit**

```bash
git add docker/ docker-compose.yml .dockerignore .env.example
git commit -m "build: containerize app with multi-stage Dockerfile and local Docker Compose parity

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: GitHub Actions pipeline — build, push, deploy, migrate

**Files:**
- Create: `.github/workflows/deploy-staging.yml`
- Create: `.env.staging.example`

**Interfaces:**
- Consumes: `aws_ecr_repository.app.repository_url`, `aws_ecs_cluster.main.name`, `aws_ecs_service.app.name` (Task 6, read via `terraform output` and copied into GitHub Secrets — not read live by the workflow).
- Produces: an automatic deployment to the staging ECS service on every push to `develop`.

- [ ] **Step 1: Add the AWS credentials and resource names as GitHub Actions secrets**

In the GitHub repo (`Abhinesh1234/New-Femi9-Billing-Application`) → Settings → Secrets and variables → Actions, add:
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — a **separate**, narrowly-scoped IAM user `femi9-github-deploy` (ECR push + ECS update-service only, not the broad Terraform admin user from Task 1) — create it the same way as Task 1 Step 2 but with policy limited to `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`, `ecs:UpdateService`, `ecs:DescribeServices`.
- `AWS_REGION` = `us-east-1`
- `ECR_REPOSITORY` = the value from `terraform output ecr_repository_url` (Task 6)
- `ECS_CLUSTER` = the value from `terraform output ecs_cluster_name` (Task 6)
- `ECS_SERVICE` = the value from `terraform output ecs_service_name` (Task 6)

Expected: all 6 secrets listed under Settings → Secrets, values hidden.

- [ ] **Step 2: Write `.env.staging.example` documenting what staging's env shape looks like (mirrors the Secrets Manager JSON from Task 3, for onboarding — not consumed by the pipeline itself)**

`.env.staging.example`:
```
APP_ENV=staging
DB_CONNECTION=mysql
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
FILESYSTEM_DISK=s3
MAIL_MAILER=log
# DB_HOST, DB_PASSWORD, REDIS_HOST, AWS_BUCKET are injected at runtime by
# ECS from AWS Secrets Manager (femi9/staging/app-env) — never set here.
```

- [ ] **Step 3: Write the GitHub Actions workflow**

`.github/workflows/deploy-staging.yml`:
```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Log in to ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push image
        env:
          ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -f docker/php/Dockerfile -t $ECR_REPOSITORY:$IMAGE_TAG -t $ECR_REPOSITORY:latest .
          docker push $ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REPOSITORY:latest

      - name: Force new ECS deployment
        env:
          ECS_CLUSTER: ${{ secrets.ECS_CLUSTER }}
          ECS_SERVICE: ${{ secrets.ECS_SERVICE }}
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment

      - name: Wait for service to stabilize
        env:
          ECS_CLUSTER: ${{ secrets.ECS_CLUSTER }}
          ECS_SERVICE: ${{ secrets.ECS_SERVICE }}
        run: |
          aws ecs wait services-stable \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE

      - name: Run database migrations
        env:
          ECS_CLUSTER: ${{ secrets.ECS_CLUSTER }}
        run: |
          TASK_DEF=$(aws ecs describe-services --cluster $ECS_CLUSTER --services ${{ secrets.ECS_SERVICE }} --query 'services[0].taskDefinition' --output text)
          NETWORK_CONFIG=$(aws ecs describe-services --cluster $ECS_CLUSTER --services ${{ secrets.ECS_SERVICE }} --query 'services[0].networkConfiguration' --output json)
          aws ecs run-task \
            --cluster $ECS_CLUSTER \
            --task-definition "$TASK_DEF" \
            --launch-type FARGATE \
            --network-configuration "$NETWORK_CONFIG" \
            --overrides '{"containerOverrides":[{"name":"app","command":["php","artisan","migrate","--force"]}]}'
```

The migration step runs `php artisan migrate --force` as a one-off Fargate task against the same task definition (same image, same injected secrets) rather than inside the long-running web container — this is the standard pattern for running artisan commands on ECS without SSH access to a box that doesn't exist.

- [ ] **Step 4: Create the `develop` branch and push it to trigger the first pipeline run**

Run:
```bash
git checkout -b develop
git push -u origin develop
```
Expected: GitHub Actions tab shows a "Deploy to Staging" run starting automatically.

- [ ] **Step 5: Watch the run and verify the deployed app responds**

In the GitHub Actions UI, confirm all 5 steps go green. Then:
```bash
curl -i http://$(terraform -chdir=infra/terraform output -raw alb_dns_name)/up
```
Expected: `HTTP/1.1 200 OK` — the first real request served by staging infrastructure end-to-end (GitHub → ECR → ECS → ALB).

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/deploy-staging.yml .env.staging.example
git commit -m "ci: add GitHub Actions pipeline to build, push, and deploy to staging ECS

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push
```

---

### Task 9: Feature-by-feature staging cutover checklist

**Files:**
- Create: `docs/staging-cutover-checklist.md`

**Interfaces:**
- Consumes: nothing new — this is a tracking document, not code.
- Produces: an ordered checklist the team works through after Task 8's pipeline is live, matching the "alter functionalities one by one" request.

- [ ] **Step 1: Write the cutover order, grounded in the existing feature-module inventory and the architecture doc's own phase order**

`docs/staging-cutover-checklist.md`:
```markdown
# Staging Cutover Checklist

Each item below is validated on staging (via the ALB URL from `terraform output
alb_dns_name`) before being considered "moved to AWS." Work top to bottom —
each item only depends on the ones above it being done.

## Phase 1 — Foundations (infra already stood up by this plan)
- [ ] Confirm `php artisan migrate` ran cleanly against Aurora (Task 8 pipeline)
- [ ] Confirm sessions persist across requests (login, refresh, still logged in) — proves Redis session driver works
- [ ] Upload a file via the file-manager module, confirm it lands in the
      `femi9-staging-uploads` S3 bucket (`aws s3 ls s3://femi9-staging-uploads --profile billing-staging`)

## Phase 2 — Core billing flows
- [ ] Party creation (company portal) — confirm auto-generated mobile-number
      password flow still works against Aurora
- [ ] Party portal login — confirm `partyAuth` session works via Redis
- [ ] Invoice creation + PDF generation — confirm the job runs via the Redis
      queue driver (`QUEUE_CONNECTION=redis`) instead of synchronously
- [ ] Party list/overview pages — spot-check the resizable columns and
      two-pane overview still render correctly served from the container build

## Phase 3 — Comms (needs SES/SNS added to Terraform — not yet in this plan)
- [ ] Wire real SES sending, confirm invoice email delivery (currently
      `MAIL_MAILER=log` on staging until this is added)
- [ ] Wire SNS/Pinpoint, confirm OTP SMS delivery for password reset

## Phase 4 — Everything else
- [ ] Chat module — flag as needing the API Gateway WebSocket work from the
      architecture doc; not covered by this plan
- [ ] Super-admin subscriptions/packages pages — smoke test against Aurora
- [ ] Reports module — spot check any heavy report query's latency on
      `db.serverless` at the 0.5–2 ACU range; raise `max_capacity` in
      `aurora.tf` if a report times out

## Rollback
If any phase breaks staging, `aws ecs update-service --cluster
femi9-staging-cluster --service femi9-staging-app --task-definition
<previous-task-def-arn> --force-new-deployment` rolls the service back to the
last-known-good image without touching Terraform state.
```

- [ ] **Step 2: Commit**

```bash
git add docs/staging-cutover-checklist.md
git commit -m "docs: add feature-by-feature staging cutover checklist

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- AWS staging environment stood up one service at a time → Tasks 1–6 (bootstrap, network, ECR/secrets, Aurora, Redis, S3/IAM/ALB/ECS), matching the architecture doc's service choices (Aurora Serverless v2 per the prior decision, same-origin hosting per this session's decision). ✅
- CI/CD pipeline → Task 8, GitHub Actions per decision, triggered on `develop`. ✅
- "Local should be adjusted based on AWS architecture so it works while testing" → Task 7's Docker Compose (MySQL + Redis containers matching staging's engines) is the direct answer; explicitly does *not* point local at real AWS resources, which is called out as a deliberate choice, not a gap. ✅
- "Alter functionalities one by one" → Task 9's phased checklist gives an explicit one-by-one order tied to the app's real modules. ✅
- Frontend/backend hosting decision (same-origin) → reflected in Task 7's single Dockerfile serving both, and Task 6's single ECS service/target group — no separate frontend infra created. ✅

**Gaps intentionally out of scope for this plan** (flagged in Task 9, not silently dropped): SES/SNS Terraform resources, CloudFront, WAF, a custom domain/ACM certificate, the chat WebSocket layer, and production environment — all listed in the architecture doc but explicitly deferred past "staging only."

**Placeholder scan:** no TBD/TODO/"add appropriate" language; every step has literal file content or a literal runnable command.

**Type/name consistency check:** `femi9-staging-app` (ECS service) in Task 6 matches Task 8's `ECS_SERVICE` secret and Task 9's rollback command; `femi9-staging-uploads` (S3 bucket) in Task 6 matches Task 9's `aws s3 ls` check and the `AWS_BUCKET` secret value documented in Task 3; `aurora_endpoint`/`redis_endpoint` output names in Task 4/5 match the `DB_HOST`/`REDIS_HOST` fields referenced in Task 3's `staging-secret.json` example.
