output "public_ip" {
  value       = aws_instance.portfolio.public_ip
  description = "Point your domain A record at this IP (may change on stop/start)."
}

output "ssh_hint" {
  value       = "ssh ec2-user@${aws_instance.portfolio.public_ip}"
  description = "Supply your private key with -i as needed."
}
