# Terraform CLI Cheat Sheet

Quick reference for the most commonly used Terraform commands.

## Common Workflows

### Initialize New Project
```bash
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

### HCL Syntax Quick

```hcl
resource "type" "name" {
  argument = "value"
}

variable "name" {
  type    = string
  default = "value"
}

output "name" {
  value = resource.type.name.id
}

data "type" "name" {
  filter = "value"
}

locals {
  name = "value"
}

module "name" {
  source = "./path"
  var    = "value"
}

lifecycle {
  create_before_destroy = true
  prevent_destroy       = true
  ignore_changes        = [tags]
}
```

### Update Infrastructure
```bash
terraform plan -out=tfplan
terraform apply tfplan
```

### Import Existing Resource
```bash
terraform import aws_instance.web i-1234567890abcdef0
terraform state show aws_instance.web
```

### Destroy Specific Resource
```bash
terraform destroy -target=aws_instance.test
```

### Change Backend
```bash
terraform init -reconfigure -backend-config=backend.hcl
```

### Debug
```bash
export TF_LOG=DEBUG
terraform apply
unset TF_LOG
```

## Essential Commands

| Command | Description | Example |
|---------|-------------|---------|
| `terraform init` | Initialize working directory | `terraform init -upgrade` |
| `terraform plan` | Preview changes | `terraform plan -out=tfplan` |
| `terraform apply` | Apply changes | `terraform apply tfplan` |
| `terraform destroy` | Destroy infrastructure | `terraform destroy -auto-approve` |
| `terraform fmt` | Format code | `terraform fmt -recursive` |
| `terraform validate` | Validate configuration | `terraform validate` |
| `terraform output` | Show outputs | `terraform output -json` |
| `terraform show` | Show current state | `terraform show -json` |

## State Management

| Command | Description |
|---------|-------------|
| `terraform state list` | List all resources in state |
| `terraform state show <resource>` | Show specific resource details |
| `terraform state rm <resource>` | Remove resource from state |
| `terraform state mv <src> <dst>` | Move/rename resource in state |
| `terraform state pull` | Download remote state |
| `terraform state push` | Upload state to remote |
| `terraform apply -replace=<resource>` | Force recreate resource |

## Workspace Management

| Command | Description |
|---------|-------------|
| `terraform workspace list` | List workspaces |
| `terraform workspace new <name>` | Create workspace |
| `terraform workspace select <name>` | Switch workspace |
| `terraform workspace show` | Show current workspace |
| `terraform workspace delete <name>` | Delete workspace |

## Common Options

| Option | Description | Example |
|--------|-------------|---------|
| `-var="key=value"` | Set variable | `terraform plan -var="env=prod"` |
| `-var-file="file"` | Load variable file | `terraform apply -var-file="prod.tfvars"` |
| `-target=<resource>` | Target specific resource | `terraform apply -target=aws_instance.web` |
| `-auto-approve` | Skip confirmation | `terraform apply -auto-approve` |
| `-out=<file>` | Save plan to file | `terraform plan -out=tfplan` |
| `-json` | Output in JSON | `terraform output -json` |
| `-reconfigure` | Reconfigure backend | `terraform init -reconfigure` |
| `-upgrade` | Upgrade providers | `terraform init -upgrade` |

## Useful Functions

| Function | Description | Example |
|----------|-------------|---------|
| `join(sep, list)` | Join list with separator | `join(",", ["a", "b"])` returns `"a,b"` |
| `split(sep, str)` | Split string | `split(",", "a,b")` returns `["a", "b"]` |
| `length(list)` | Get length | `length([1,2,3])` returns `3` |
| `merge(map1, map2)` | Merge maps | `merge({a=1}, {b=2})` returns `{a=1, b=2}` |
| `lookup(map, key, default)` | Lookup with default | `lookup({a=1}, "b", 0)` returns `0` |
| `jsonencode(value)` | Encode to JSON | `jsonencode({a="b"})` |
| `file(path)` | Read file | `file("${path.module}/file.txt")` |
| `templatefile(path, vars)` | Template file | `templatefile("tpl", {name="x"})` |
| `cidrsubnet(prefix, bits, num)` | Calculate subnet | `cidrsubnet("10.0.0.0/16", 8, 1)` returns `"10.0.1.0/24"` |
| `timestamp()` | Current timestamp | `timestamp()` returns `"2025-10-31T12:00:00Z"` |

## Meta-Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `count` | Create multiple instances | `count = 3` (access via `count.index`) |
| `for_each` | Create from map/set | `for_each = var.instances` (access via `each.key`, `each.value`) |
| `depends_on` | Explicit dependency | `depends_on = [aws_vpc.main]` |
| `provider` | Use specific provider | `provider = aws.west` |
| `lifecycle` | Lifecycle customization | See below |

## Expressions

| Expression | Description | Example |
|------------|-------------|---------|
| Conditional | Ternary operator | `var.env == "prod" ? "t3.large" : "t3.micro"` |
| For list | Transform list | `[for s in var.list : upper(s)]` |
| For map | Transform map | `{for k, v in var.map : k => upper(v)}` |
| Splat | Get all attributes | `aws_instance.web[*].id` |

## Tags

`terraform`, `cli`, `cheat-sheet`, `reference`, `devops`

---

*Last updated: 2025-10-31*
