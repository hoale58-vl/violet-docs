# Terraform Cheat Sheet

Quick reference for Terraform commands, syntax, and common operations.

## Basic Commands

### Initialize and Setup

```bash
# Initialize Terraform working directory
terraform init

# Initialize and upgrade providers
terraform init -upgrade

# Initialize with backend configuration
terraform init -backend-config="bucket=my-state-bucket"

# Reconfigure backend
terraform init -reconfigure

# Download modules without backend initialization
terraform init -backend=false
```

### Planning and Applying

```bash
# Create execution plan
terraform plan

# Save plan to file
terraform plan -out=tfplan

# Plan with specific variable file
terraform plan -var-file="prod.tfvars"

# Plan with inline variables
terraform plan -var="instance_count=3"

# Target specific resource
terraform plan -target=aws_instance.web

# Apply changes
terraform apply

# Apply saved plan
terraform apply tfplan

# Apply with auto-approve (no confirmation)
terraform apply -auto-approve

# Apply targeting specific resource
terraform apply -target=aws_s3_bucket.data
```

### Destroying Resources

```bash
# Destroy all resources
terraform destroy

# Destroy with auto-approve
terraform destroy -auto-approve

# Destroy specific resource
terraform destroy -target=aws_instance.test

# Plan destroy
terraform plan -destroy
```

### State Management

```bash
# List resources in state
terraform state list

# Show resource details
terraform state show aws_instance.web

# Remove resource from state
terraform state rm aws_instance.old

# Move resource in state
terraform state mv aws_instance.old aws_instance.new

# Pull remote state
terraform state pull

# Push state to remote
terraform state push

# Replace resource (force recreation)
terraform apply -replace=aws_instance.web
```

### Workspaces

```bash
# List workspaces
terraform workspace list

# Create new workspace
terraform workspace new dev

# Switch workspace
terraform workspace select prod

# Show current workspace
terraform workspace show

# Delete workspace
terraform workspace delete old
```

### Output and Inspection

```bash
# Show outputs
terraform output

# Show specific output
terraform output vpc_id

# Show outputs in JSON
terraform output -json

# Show current state
terraform show

# Show state in JSON
terraform show -json

# Validate configuration
terraform validate

# Format code
terraform fmt

# Format recursively
terraform fmt -recursive

# Check formatting
terraform fmt -check
```

### Import and Taint

```bash
# Import existing resource
terraform import aws_instance.web i-1234567890abcdef0

# Mark resource for recreation (deprecated, use -replace)
terraform taint aws_instance.web

# Untaint resource
terraform untaint aws_instance.web
```

### Graph and Dependencies

```bash
# Generate dependency graph
terraform graph | dot -Tsvg > graph.svg

# Show provider requirements
terraform providers

# Show provider schema
terraform providers schema -json
```

## Configuration Syntax

### Resource Block

```hcl
resource "provider_type" "name" {
  argument1 = "value"
  argument2 = 123

  nested_block {
    key = "value"
  }

  lifecycle {
    create_before_destroy = true
    prevent_destroy       = false
    ignore_changes        = [tags]
  }

  depends_on = [
    other_resource.name
  ]
}
```

### Data Source

```hcl
data "provider_type" "name" {
  argument = "value"

  filter {
    name   = "tag:Name"
    values = ["example"]
  }
}

# Reference: data.provider_type.name.attribute
```

### Variable

```hcl
variable "name" {
  description = "Description of variable"
  type        = string
  default     = "default-value"
  sensitive   = false

  validation {
    condition     = length(var.name) > 3
    error_message = "Name must be longer than 3 characters."
  }
}

# Usage: var.name
```

### Output

```hcl
output "name" {
  description = "Description of output"
  value       = resource.type.name.attribute
  sensitive   = false
}
```

### Local Values

```hcl
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project
  }

  instance_name = "${var.project}-${var.environment}-web"
}

# Usage: local.common_tags, local.instance_name
```

### Module

```hcl
module "name" {
  source  = "./modules/vpc"
  version = "1.0.0"

  # Input variables
  vpc_cidr = "10.0.0.0/16"
  name     = "my-vpc"
}

# Output reference: module.name.output_name
```

## Data Types

### Primitive Types

```hcl
# String
variable "name" {
  type = string
}

# Number
variable "count" {
  type = number
}

# Bool
variable "enabled" {
  type = bool
}
```

### Collection Types

```hcl
# List
variable "availability_zones" {
  type = list(string)
  default = ["us-east-1a", "us-east-1b"]
}

# Set (unique values)
variable "allowed_cidrs" {
  type = set(string)
}

# Map
variable "tags" {
  type = map(string)
  default = {
    Environment = "prod"
    Project     = "web"
  }
}
```

### Structural Types

```hcl
# Object
variable "vpc_config" {
  type = object({
    cidr    = string
    name    = string
    azs     = list(string)
    private = bool
  })
}

# Tuple
variable "subnet_config" {
  type = tuple([string, number, bool])
}
```

## Functions

### String Functions

```hcl
# Concatenate strings
join(", ", ["a", "b", "c"])  # "a, b, c"

# Split string
split(",", "a,b,c")  # ["a", "b", "c"]

# Replace substring
replace("hello world", "world", "terraform")  # "hello terraform"

# Format string
format("Hello, %s!", "World")  # "Hello, World!"

# Trim whitespace
trimspace("  hello  ")  # "hello"

# Upper/Lower case
upper("hello")  # "HELLO"
lower("HELLO")  # "hello"

# Substring
substr("hello world", 0, 5)  # "hello"
```

### Collection Functions

```hcl
# Length
length([1, 2, 3])  # 3

# Element
element(["a", "b", "c"], 1)  # "b"

# Contains
contains(["a", "b"], "a")  # true

# Index
index(["a", "b", "c"], "b")  # 1

# Concat
concat(["a", "b"], ["c", "d"])  # ["a", "b", "c", "d"]

# Merge maps
merge({a = 1}, {b = 2})  # {a = 1, b = 2}

# Lookup
lookup({a = 1, b = 2}, "a", 0)  # 1

# Keys/Values
keys({a = 1, b = 2})  # ["a", "b"]
values({a = 1, b = 2})  # [1, 2]

# Distinct (remove duplicates)
distinct([1, 2, 2, 3])  # [1, 2, 3]

# Flatten
flatten([[1, 2], [3, 4]])  # [1, 2, 3, 4]
```

### Numeric Functions

```hcl
# Min/Max
min(1, 2, 3)  # 1
max(1, 2, 3)  # 3

# Absolute value
abs(-5)  # 5

# Ceiling/Floor
ceil(1.2)   # 2
floor(1.8)  # 1

# Parse number
parseint("42", 10)  # 42
```

### Encoding Functions

```hcl
# JSON
jsonencode({name = "value"})
jsondecode("{\"name\":\"value\"}")

# YAML
yamlencode({name = "value"})
yamldecode("name: value")

# Base64
base64encode("hello")
base64decode("aGVsbG8=")

# URL encoding
urlencode("hello world")
```

### Date/Time Functions

```hcl
# Current timestamp
timestamp()  # "2025-10-31T12:00:00Z"

# Format timestamp
formatdate("YYYY-MM-DD", timestamp())  # "2025-10-31"

# Add duration
timeadd(timestamp(), "1h")
```

### Filesystem Functions

```hcl
# Read file
file("${path.module}/config.json")

# Read and decode
templatefile("template.tpl", {name = "value"})

# Check file existence
fileexists("config.json")

# Get paths
path.module   # Current module path
path.root     # Root module path
path.cwd      # Current working directory
```

### IP Network Functions

```hcl
# CIDR functions
cidrhost("10.0.0.0/24", 5)      # "10.0.0.5"
cidrnetmask("10.0.0.0/24")      # "255.255.255.0"
cidrsubnet("10.0.0.0/16", 8, 1) # "10.0.1.0/24"
```

### Type Conversion

```hcl
# To string
tostring(42)  # "42"

# To number
tonumber("42")  # 42

# To bool
tobool("true")  # true

# To list
tolist([1, 2])

# To set
toset([1, 2, 2])  # [1, 2]

# To map
tomap({a = 1})
```

## Expressions

### Conditional

```hcl
condition ? true_val : false_val

# Example
instance_type = var.environment == "prod" ? "t3.large" : "t3.micro"
```

### For Expressions

```hcl
# Transform list
[for s in var.list : upper(s)]

# Transform map
{for k, v in var.map : k => upper(v)}

# Filter
[for s in var.list : s if length(s) > 3]

# List to map
{for i, v in var.list : i => v}
```

### Splat Expressions

```hcl
# Get attribute from all instances
aws_instance.web[*].id

# Equivalent to
[for o in aws_instance.web : o.id]
```

### Dynamic Blocks

```hcl
resource "aws_security_group" "example" {
  name = "example"

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
    }
  }
}
```

## Terraform Block

```hcl
terraform {
  # Required Terraform version
  required_version = ">= 1.5.0"

  # Required providers
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }

  # Experiments
  experiments = [module_variable_optional_attrs]
}
```

## Provider Configuration

```hcl
provider "aws" {
  region = var.aws_region
  profile = var.aws_profile

  # Default tags for all resources
  default_tags {
    tags = {
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }

  # Assume role
  assume_role {
    role_arn = var.role_arn
  }
}

# Alternative provider
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

# Use alternative provider
resource "aws_instance" "west" {
  provider = aws.west
  # ...
}
```

## Meta-Arguments

```hcl
# Count
resource "aws_instance" "web" {
  count = 3

  tags = {
    Name = "web-${count.index}"
  }
}

# For_each
resource "aws_instance" "web" {
  for_each = var.instances

  ami           = each.value.ami
  instance_type = each.value.type

  tags = {
    Name = each.key
  }
}

# Depends_on
resource "aws_instance" "web" {
  depends_on = [aws_security_group.web_sg]
}

# Lifecycle
resource "aws_instance" "web" {
  lifecycle {
    create_before_destroy = true
    prevent_destroy       = false
    ignore_changes        = [tags]
  }
}

# Provider
resource "aws_instance" "west" {
  provider = aws.west
}
```

## Environment Variables

```bash
# AWS credentials
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="us-east-1"

# Terraform variables (prefix with TF_VAR_)
export TF_VAR_instance_count=3
export TF_VAR_environment="prod"

# Terraform logging
export TF_LOG=DEBUG
export TF_LOG_PATH=terraform.log

# Terraform plugin cache
export TF_PLUGIN_CACHE_DIR="$HOME/.terraform.d/plugin-cache"
```

## Common Patterns

### Conditional Resource Creation

```hcl
resource "aws_instance" "web" {
  count = var.create_instance ? 1 : 0
  # ...
}
```

### Multiple Environments

```hcl
locals {
  env_config = {
    dev = {
      instance_type = "t3.micro"
      instance_count = 1
    }
    prod = {
      instance_type = "t3.large"
      instance_count = 3
    }
  }
}

resource "aws_instance" "web" {
  count = local.env_config[var.environment].instance_count
  instance_type = local.env_config[var.environment].instance_type
}
```

### Remote State Data Source

```hcl
data "terraform_remote_state" "vpc" {
  backend = "s3"

  config = {
    bucket = "my-terraform-state"
    key    = "vpc/terraform.tfstate"
    region = "us-east-1"
  }
}

# Reference: data.terraform_remote_state.vpc.outputs.vpc_id
```

## Debugging

```bash
# Enable debug logging
export TF_LOG=DEBUG
terraform apply

# Enable specific log levels
export TF_LOG=TRACE  # Most verbose
export TF_LOG=DEBUG
export TF_LOG=INFO
export TF_LOG=WARN
export TF_LOG=ERROR

# Log to file
export TF_LOG_PATH=terraform.log

# Disable logging
unset TF_LOG
```

## Tags

`terraform`, `iac`, `cheat-sheet`, `reference`, `devops`, `commands`

---

*Last updated: 2025-10-31*
