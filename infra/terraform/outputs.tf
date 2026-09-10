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
