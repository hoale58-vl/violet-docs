# CheatsSheet

Quick reference for essential Helm commands.

## Common Workflows

### Install with Custom Values

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm search repo wordpress
helm show values bitnami/wordpress > values.yaml
# Edit values.yaml
helm install my-wordpress bitnami/wordpress -f values.yaml -n prod --create-namespace
```

### Upgrade Release

```bash
helm get values my-release > current-values.yaml
# Edit current-values.yaml
helm upgrade my-release bitnami/nginx -f current-values.yaml
helm history my-release
```

### Rollback Release

```bash
helm history my-release
helm rollback my-release 3
helm status my-release
```

### Create and Package Chart

```bash
helm create my-chart
helm lint my-chart
helm template test my-chart
helm package my-chart
helm install my-release ./my-chart-0.1.0.tgz
```

### Debug Installation

```bash
helm install my-release ./chart --dry-run --debug
helm template my-release ./chart
helm lint ./chart --strict
helm install my-release ./chart --wait --timeout 10m
```

## Repository Management

| Command | Description |
|---------|-------------|
| `helm repo add <name> <url>` | Add repository |
| `helm repo list` | List repositories |
| `helm repo update` | Update repository index |
| `helm repo remove <name>` | Remove repository |

## Search Charts

| Command | Description |
|---------|-------------|
| `helm search repo <keyword>` | Search in added repositories |
| `helm search hub <keyword>` | Search Artifact Hub |
| `helm search repo <name> --versions` | Show all versions |

## Chart Information

| Command | Description |
|---------|-------------|
| `helm show chart <chart>` | Show chart metadata |
| `helm show values <chart>` | Show default values |
| `helm show readme <chart>` | Show README |
| `helm show all <chart>` | Show all information |

## Install

| Command | Description |
|---------|-------------|
| `helm install <release> <chart>` | Install chart |
| `helm install <release> <chart> -f values.yaml` | Install with custom values file |
| `helm install <release> <chart> --set key=value` | Install with inline values |
| `helm install <release> <chart> -n <ns> --create-namespace` | Install in namespace |
| `helm install <release> <chart> --dry-run --debug` | Test without installing |
| `helm install <release> <chart> --wait --timeout 10m` | Wait for resources to be ready |
| `helm install <chart> --generate-name` | Auto-generate release name |

## List Releases

| Command | Description |
|---------|-------------|
| `helm list` | List releases in current namespace |
| `helm list -A` | List all releases in all namespaces |
| `helm list -n <namespace>` | List releases in specific namespace |
| `helm list --all` | List all (including failed/deleted) |
| `helm list -o json` | Output in JSON format |

## Status & Info

| Command | Description |
|---------|-------------|
| `helm status <release>` | Get release status |
| `helm get manifest <release>` | Get Kubernetes manifest |
| `helm get values <release>` | Get custom values |
| `helm get values <release> --all` | Get all values (including defaults) |
| `helm get hooks <release>` | Get hooks |
| `helm get notes <release>` | Get release notes |

## Upgrade

| Command | Description |
|---------|-------------|
| `helm upgrade <release> <chart>` | Upgrade release |
| `helm upgrade <release> <chart> -f values.yaml` | Upgrade with new values |
| `helm upgrade --install <release> <chart>` | Install if not exists, upgrade if exists |
| `helm upgrade <release> <chart> --force` | Force recreate resources |
| `helm upgrade <release> <chart> --atomic` | Rollback on failure |
| `helm upgrade <release> <chart> --wait` | Wait for completion |
| `helm upgrade <release> <chart> --reuse-values` | Reuse previous values |
| `helm upgrade <release> <chart> --reset-values` | Reset to chart defaults |

## Rollback

| Command | Description |
|---------|-------------|
| `helm rollback <release>` | Rollback to previous version |
| `helm rollback <release> <revision>` | Rollback to specific revision |
| `helm rollback <release> --wait` | Wait for rollback to complete |
| `helm history <release>` | View release history |

## Uninstall

| Command | Description |
|---------|-------------|
| `helm uninstall <release>` | Uninstall release |
| `helm uninstall <release> -n <namespace>` | Uninstall from specific namespace |
| `helm uninstall <release> --keep-history` | Keep history |
| `helm uninstall <release> --wait` | Wait for deletion |

## Dependencies

| Command | Description |
|---------|-------------|
| `helm dependency update <chart>` | Update dependencies |
| `helm dependency build <chart>` | Build dependencies |
| `helm dependency list <chart>` | List dependencies |

## Template & Lint

| Command | Description |
|---------|-------------|
| `helm template <release> <chart>` | Render templates locally |
| `helm template <release> <chart> -f values.yaml` | Render with custom values |
| `helm template <release> <chart> --debug` | Render with debug output |
| `helm lint <chart>` | Lint chart |
| `helm lint <chart> --strict` | Strict linting |
| `helm lint <chart> -f values.yaml` | Lint with values |

## Pull Charts

| Command | Description |
|---------|-------------|
| `helm pull <chart>` | Pull chart to local directory |
| `helm pull <chart> --untar` | Pull and extract |
| `helm pull <chart> --version 1.0.0` | Pull specific version |
| `helm pull <chart> -d ./charts` | Pull to directory |

## Tags

`helm`, `cli`, `cheatsheet`, `kubernetes`, `commands`

---

*Last updated: 2025-10-31*
