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
  engine_version         = "8.0.mysql_aurora.3.09.0"
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
