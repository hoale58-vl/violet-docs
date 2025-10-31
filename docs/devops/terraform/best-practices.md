# Terraform Best Practices

Essential best practices for writing maintainable, secure, and scalable Terraform infrastructure code.

## Project Structure

### Recommended Directory Layout

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   └── ...
│   └── prod/
│       └── ...
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── eks/
│   └── rds/
├── global/
│   ├── iam/
│   └── s3/
└── README.md
```

### File Organization

**Separate concerns into logical files:**

```
main.tf           # Primary resources
variables.tf      # Input variables
outputs.tf        # Output values
versions.tf       # Provider and Terraform versions
data.tf           # Data sources
locals.tf         # Local values
backend.tf        # Backend configuration
```

## State Management

### Remote State Backend

**Always use remote state for team collaboration:**

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/vpc/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"

    # Optional: Prevent accidental deletion
    skip_region_validation      = false
    skip_credentials_validation = false
    skip_metadata_api_check     = false
  }
}
```

### State Locking

**Always enable state locking:**

```hcl
# AWS DynamoDB for state locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "Terraform State Lock"
    Environment = "shared"
  }
}
```

### State Isolation

**Separate state files by environment:**

```
terraform-state/
├── dev/
│   ├── vpc/terraform.tfstate
│   └── eks/terraform.tfstate
├── staging/
│   └── ...
└── prod/
    └── ...
```

## Module Design

### Module Best Practices

**1. Keep modules focused and reusable:**

```hcl
# modules/vpc/main.tf
variable "name" {
  description = "Name of the VPC"
  type        = string
}

variable "cidr" {
  description = "CIDR block for VPC"
  type        = string
  validation {
    condition     = can(cidrhost(var.cidr, 0))
    error_message = "Must be a valid CIDR block."
  }
}

variable "availability_zones" {
  description = "List of AZs"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

resource "aws_vpc" "main" {
  cidr_block           = var.cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.tags,
    {
      Name = var.name
    }
  )
}
```

**2. Use semantic versioning for modules:**

```hcl
module "vpc" {
  source  = "git::https://github.com/org/terraform-modules.git//vpc?ref=v1.2.0"

  name               = "production-vpc"
  cidr               = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
}
```

**3. Provide comprehensive outputs:**

```hcl
# modules/vpc/outputs.tf
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}
```

## Variables and Naming

### Variable Validation

**Add validation rules:**

```hcl
variable "environment" {
  description = "Environment name"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "instance_count" {
  description = "Number of instances"
  type        = number

  validation {
    condition     = var.instance_count > 0 && var.instance_count <= 10
    error_message = "Instance count must be between 1 and 10."
  }
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_password) >= 16
    error_message = "Password must be at least 16 characters."
  }
}
```

### Naming Conventions

**Use consistent naming:**

```hcl
# Good naming
resource "aws_instance" "web_server" {
  # ...
}

resource "aws_security_group" "web_server_sg" {
  # ...
}

# Use locals for computed names
locals {
  resource_prefix = "${var.project}-${var.environment}"

  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "Terraform"
    CreatedAt   = timestamp()
  }
}

resource "aws_s3_bucket" "data" {
  bucket = "${local.resource_prefix}-data-bucket"

  tags = merge(
    local.common_tags,
    {
      Name = "Data Bucket"
    }
  )
}
```

## Security Best Practices

### Secrets Management

**Never hardcode secrets:**

```hcl
# Bad - Never do this
resource "aws_db_instance" "main" {
  username = "admin"
  password = "hardcoded-password-123"  # ❌ NEVER
}

# Good - Use sensitive variables
variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

resource "aws_db_instance" "main" {
  username = "admin"
  password = var.db_password  # ✅
}

# Better - Use AWS Secrets Manager
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/db/password"
}

resource "aws_db_instance" "main" {
  username = "admin"
  password = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)["password"]
}
```

### Resource Tagging

**Always tag resources:**

```hcl
locals {
  required_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "Terraform"
    CostCenter  = var.cost_center
    Owner       = var.owner
  }
}

resource "aws_instance" "web" {
  # ...

  tags = merge(
    local.required_tags,
    {
      Name = "web-server"
      Role = "webserver"
    }
  )
}
```

### Prevent Resource Deletion

**Use lifecycle rules for critical resources:**

```hcl
resource "aws_db_instance" "production" {
  # ...

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket" "critical_data" {
  # ...

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [
      tags["LastModified"]
    ]
  }
}
```

## Code Quality

### Use Terraform Formatting

```bash
# Format all files
terraform fmt -recursive

# Check formatting
terraform fmt -check -recursive
```

### Enable Validation

```bash
# Validate configuration
terraform validate

# Static analysis
terraform plan -out=tfplan
```

### Use Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.83.5
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_docs
      - id: terraform_tflint
      - id: terraform_checkov
```

### Documentation

**Document modules with terraform-docs:**

```hcl
# modules/vpc/main.tf
/**
 * # VPC Module
 *
 * Creates a VPC with public and private subnets across multiple AZs.
 *
 * ## Usage
 *
 * ```hcl
 * module "vpc" {
 *   source = "./modules/vpc"
 *
 *   name               = "my-vpc"
 *   cidr               = "10.0.0.0/16"
 *   availability_zones = ["us-east-1a", "us-east-1b"]
 * }
 * ```
 */
```

## Version Management

### Pin Provider Versions

```hcl
# versions.tf
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}
```

## Data Sources

### Use Data Sources for External Resources

```hcl
# Reference existing VPC
data "aws_vpc" "existing" {
  id = var.vpc_id
}

# Get latest AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Get current region
data "aws_region" "current" {}

# Get current account
data "aws_caller_identity" "current" {}
```

## Performance Optimization

### Use Count and For_Each Wisely

```hcl
# Good - Using for_each for dynamic resources
variable "subnets" {
  type = map(object({
    cidr_block        = string
    availability_zone = string
  }))
}

resource "aws_subnet" "private" {
  for_each = var.subnets

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr_block
  availability_zone = each.value.availability_zone

  tags = {
    Name = "private-${each.key}"
  }
}

# Good - Using count for simple duplication
resource "aws_instance" "web" {
  count = var.instance_count

  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  tags = {
    Name = "web-${count.index + 1}"
  }
}
```

### Minimize Plan/Apply Time

```hcl
# Use depends_on sparingly - let Terraform infer dependencies
# Bad
resource "aws_instance" "web" {
  # ...
  depends_on = [aws_security_group.web] # Usually unnecessary
}

# Good - Implicit dependency
resource "aws_instance" "web" {
  # ...
  vpc_security_group_ids = [aws_security_group.web.id]
}
```

## Testing

### Use Terraform Workspaces

```bash
# Create workspace for testing
terraform workspace new test

# Switch workspaces
terraform workspace select prod

# List workspaces
terraform workspace list
```

### Implement Policy as Code

```hcl
# Use Sentinel or OPA for policy enforcement
# Example: Require specific tags
policy "required-tags" {
  enforcement_level = "hard-mandatory"
}

rule "aws_resources_have_required_tags" {
  condition = all terraform.resources as r {
    r.tags contains "Environment" and
    r.tags contains "Owner" and
    r.tags contains "CostCenter"
  }
}
```

## Cost Optimization

### Use Lifecycle Policies

```hcl
resource "aws_instance" "optional" {
  # ...

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "example" {
  bucket = aws_s3_bucket.example.id

  rule {
    id     = "archive-old-objects"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}
```

### Tag for Cost Allocation

```hcl
locals {
  cost_tags = {
    CostCenter  = var.cost_center
    Project     = var.project
    Environment = var.environment
  }
}
```

## CI/CD Integration

### Automated Terraform Workflow

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.5.0

      - name: Terraform Format
        run: terraform fmt -check -recursive

      - name: Terraform Init
        run: terraform init

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        run: terraform plan -out=tfplan

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve tfplan
```

## Common Pitfalls to Avoid

### Don't Use Terraform for Everything

```hcl
# Bad - Don't use Terraform for application config
resource "local_file" "app_config" {
  content  = jsonencode(var.app_settings)
  filename = "/app/config.json"
}

# Good - Use Terraform for infrastructure
resource "aws_ssm_parameter" "app_config" {
  name  = "/app/config"
  type  = "String"
  value = jsonencode(var.app_settings)
}
```

### Avoid String Interpolation When Not Needed

```hcl
# Bad
resource "aws_instance" "web" {
  ami = "${data.aws_ami.ubuntu.id}"
}

# Good
resource "aws_instance" "web" {
  ami = data.aws_ami.ubuntu.id
}
```

### Use Explicit Dependencies

```hcl
# Only when implicit dependencies don't work
resource "aws_iam_role_policy_attachment" "example" {
  role       = aws_iam_role.example.name
  policy_arn = aws_iam_policy.example.arn

  depends_on = [aws_iam_role.example]
}
```

## Tags

`terraform`, `iac`, `best-practices`, `devops`, `infrastructure`, `aws`, `gcp`, `security`

---

*Last updated: 2025-10-31*
