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
      name         = "app"
      image        = "${aws_ecr_repository.app.repository_url}:latest"
      essential    = true
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
        { name = "APP_DEBUG", value = "false" },
        { name = "APP_URL", value = "http://${aws_lb.main.dns_name}" },
        { name = "DB_CONNECTION", value = "mysql" },
        { name = "CACHE_STORE", value = "redis" },
        { name = "SESSION_DRIVER", value = "redis" },
        { name = "QUEUE_CONNECTION", value = "redis" },
        { name = "FILESYSTEM_DISK", value = "s3" },
        { name = "MAIL_MAILER", value = "log" },
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

  health_check_grace_period_seconds = 60

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

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  depends_on = [aws_lb_listener.http]
}
