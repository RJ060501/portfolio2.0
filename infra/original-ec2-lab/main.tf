resource "aws_instance" "demo_server" {
  ami           = "ami-0c1fe732b5494dc14"
  instance_type = "t3.micro"

  tags = {
    Name = "terraform-cloud-project"
  }
}

terraform {
  required_version = ">= 1.5"
}

