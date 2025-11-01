# Best Practices

Essential best practices for writing maintainable, secure, and scalable Terraform infrastructure code.

## Quick Start Checklist

Use this checklist for every new Terraform project to ensure you're following best practices:

| # | Best Practice | Reference / Commands |
|:-:|--------------|---------------------|
| ⬜ | **Set up proper project structure** with environments/ and modules/ directories | See [Project Structure](#project-structure) |
| ⬜ | **Configure remote state backend** with encryption and locking enabled | `terraform init` - [State Management](#state-management) |
| ⬜ | **Enable state locking** using DynamoDB (AWS) or equivalent | Create lock table - [State Locking](#state-locking) |
| ⬜ | **Separate state files** by environment (dev/staging/prod) | [State Isolation](#state-isolation) |
| ⬜ | **Never hardcode secrets** - use variables with `sensitive = true` | [Secrets Management](#secrets-management) |
| ⬜ | **Use AWS Secrets Manager** or equivalent for sensitive data | [Secrets Management](#secrets-management) |
| ⬜ | **Implement resource tagging** strategy with required tags | [Resource Tagging](#resource-tagging) |
| ⬜ | **Add lifecycle rules** with `prevent_destroy` for critical resources | [Prevent Resource Deletion](#prevent-resource-deletion) |
| ⬜ | **Format code** before committing | `terraform fmt -recursive` |
| ⬜ | **Validate configuration** in CI/CD pipeline | `terraform validate` |
| ⬜ | **Set up pre-commit hooks** for formatting, validation, and linting | Install: `pre-commit install` - [Use Pre-commit Hooks](#use-pre-commit-hooks) |
| ⬜ | **Run static analysis** with tflint and checkov | `tflint .` and `checkov -d .` |
| ⬜ | **Use cost allocation tags** for billing and tracking | [Tag for Cost Allocation](#tag-for-cost-allocation) |
| ⬜ | **Configure S3 lifecycle policies** for cost optimization | [Use Lifecycle Policies](#use-lifecycle-policies) |
| ⬜ | **Implement CI/CD pipeline** with automated testing | [CI/CD Integration](#cicd-integration) |
| ⬜ | **Pin provider versions** in versions.tf | Create versions.tf with required_version |
| ⬜ | **Use explicit dependencies** only when necessary | Use `depends_on` sparingly |
| ⬜ | **Document modules** with README.md and output descriptions | Each module needs README |
| ⬜ | **Run plan before apply** and review changes carefully | `terraform plan -out=tfplan` |
| ⬜ | **Test in non-prod** environments first | Apply to dev → staging → prod |

> **Note:** Copy this checklist to your project README and manually check off items (⬜ → ✅) as you complete them.

### Verification Commands

Run these commands to verify your setup:

```bash
# Check Terraform version
terraform version

# Format all files
terraform fmt -recursive -check

# Validate configuration
terraform validate

# Security scanning
checkov -d . --framework terraform

# Linting
tflint --recursive

# Plan with detailed output
terraform plan -out=tfplan

# Show planned changes in JSON
terraform show -json tfplan | jq

# List all resources in state
terraform state list

# Verify backend configuration
terraform init -backend-config=backend.hcl
```

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

## Security

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
