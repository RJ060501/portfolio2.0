variable "aws_region" {
  type        = string
  description = "AWS region."
  default     = "us-east-1"
}

variable "ssh_key_name" {
  type        = string
  description = "Name of an existing EC2 SSH key pair in the target region."
}

variable "ssh_cidr" {
  type        = string
  description = "Your trusted public IP with /32 CIDR suffix; never use 0.0.0.0/0."
  validation {
    condition     = can(cidrnetmask(var.ssh_cidr)) && var.ssh_cidr != "0.0.0.0/0"
    error_message = "Specify a valid restricted CIDR, e.g. 203.0.113.5/32; no global SSH access."
  }
}

variable "instance_type" {
  type        = string
  description = "Choose a small instance to keep the lab affordable."
  default     = "t3.micro"
}
