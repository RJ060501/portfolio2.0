# Optional Terraform hosting example (not deployed)

**Original learning project:** Your uploaded Terraform config already provisions a `t3.micro` EC2 instance and outputs a public IP; that stopped instance did not run the portfolio. This directory is a **separate future deployment blueprint**, not evidence of an operational AWS website.

This template uses an existing default VPC, current Amazon Linux 2023 AMI, one EC2 instance, encrypted gp3 EBS, IMDSv2, a security group exposing ports 80/443 to visitors and SSH to one trusted IP range. It assumes you already have AWS credentials, a registered domain, and an EC2 SSH key pair. It does not configure Route 53, DNS, credentials, backups, CI/CD or remote Terraform state.

## Provision

```bash
cd infra/aws
terraform init
terraform fmt -check
terraform validate
terraform plan -var='ssh_key_name=your-existing-key' -var='ssh_cidr=YOUR_PUBLIC_IP/32'
terraform apply -var='ssh_key_name=your-existing-key' -var='ssh_cidr=YOUR_PUBLIC_IP/32'
terraform output public_ip
```

Do not commit `*.tfstate`, plans, variables containing secrets, or SSH keys. Ensure your AWS budget alarm is configured; EC2, EBS, data transfer, and public IPv4 can incur charges even at a small scale. Stop or destroy your lab after your demo; **stopping an instance is not equivalent to eliminating costs**.

## Prepare the server (manual, not automated)

1. Point your domain's A record at the new EC2 public IP (a stopped/started instance may get a different IP; reserve an Elastic IP or use managed DNS to keep it stable, accounting for charges).
2. SSH in as `ec2-user`. Install Docker Engine and the Docker Compose plugin using the current Amazon Linux 2023 instructions; enable and start Docker; add your user to the docker group or use sudo (docker group effectively grants root privileges).
3. Clone the **updated** portfolio repository on the instance. Create an untracked `.env` with `DOMAIN=your.example.com` (and optionally `PORT=3000`).
4. In the project root run:

   ```bash
   docker compose -f compose.yaml -f compose.aws.yaml up -d --build --wait
   docker compose logs -f
   curl -I https://your.example.com
   curl https://your.example.com/api/topics
   ```

5. Caddy obtains TLS certificates after DNS resolves and both ports 80/443 are reachable. The Caddy reverse proxy passes public requests to the static Nginx site. Nginx forwards `/api/*` to the Trends API container on the private Compose network. Neither the Node API nor the raw Nginx container needs a public port.

## Validate and tear down

Test the real HTTPS website, playable Snake, `/work/` pagination, real `/api/trends` response, console errors, and API partial-failure handling. Add monitoring/backups, logs, patching and deployment automation before calling it production-grade. Take care not to open unrestricted SSH. When finished: `docker compose ... down`, and, if no longer needed, `terraform destroy` with the same variables.

The Linux home server can be used for **local builds, testing, staging, and operational experiments**. You need not expose the home server or route visitors into your home network to demonstrate either Docker or AWS. Keep your public entry point on AWS if that is the chosen architecture.
