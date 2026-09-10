output "aurora_endpoint" {
  description = "Aurora Serverless v2 cluster writer endpoint"
  value       = aws_rds_cluster.main.endpoint
}

output "aurora_master_password" {
  description = "Generated Aurora master password (sensitive — used only to populate Secrets Manager once)"
  value       = random_password.db.result
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

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
