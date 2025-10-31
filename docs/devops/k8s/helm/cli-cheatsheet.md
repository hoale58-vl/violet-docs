# Helm CLI Cheatsheet

Quick reference for essential Helm commands.

## Repository Management

```bash
# Add repository
helm repo add [NAME] [URL]
helm repo add bitnami https://charts.bitnami.com/bitnami

# List repositories
helm repo list

# Update repositories
helm repo update

# Remove repository
helm repo remove [NAME]

# Show repository index
helm repo index [DIR]
```

## Search

```bash
# Search repositories
helm search repo [KEYWORD]
helm search repo nginx

# Search Artifact Hub
helm search hub [KEYWORD]
helm search hub wordpress

# Search with versions
helm search repo nginx --versions

# Search with regex
helm search repo 'ngin[x]'
```

## Chart Information

```bash
# Show chart information
helm show chart [CHART]
helm show chart bitnami/nginx

# Show values
helm show values [CHART]
helm show values bitnami/nginx > values.yaml

# Show README
helm show readme [CHART]

# Show all information
helm show all [CHART]
```

## Install

```bash
# Basic install
helm install [RELEASE] [CHART]
helm install my-nginx bitnami/nginx

# Install with custom values file
helm install [RELEASE] [CHART] -f values.yaml
helm install my-nginx bitnami/nginx -f custom-values.yaml

# Install with inline values
helm install [RELEASE] [CHART] --set key=value
helm install my-nginx bitnami/nginx --set replicaCount=3

# Install with multiple values files
helm install my-nginx bitnami/nginx -f values1.yaml -f values2.yaml

# Install in specific namespace
helm install [RELEASE] [CHART] -n [NAMESPACE] --create-namespace
helm install my-nginx bitnami/nginx -n production --create-namespace

# Install from local chart
helm install my-release ./my-chart

# Install from tar archive
helm install my-release my-chart-0.1.0.tgz

# Install from URL
helm install my-release https://example.com/charts/my-chart-0.1.0.tgz

# Dry run (test without installing)
helm install [RELEASE] [CHART] --dry-run --debug

# Generate name
helm install bitnami/nginx --generate-name

# Wait for resources to be ready
helm install [RELEASE] [CHART] --wait --timeout 10m

# Skip CRDs
helm install [RELEASE] [CHART] --skip-crds

# Verify charts (requires provenance)
helm install [RELEASE] [CHART] --verify
```

## List Releases

```bash
# List releases in current namespace
helm list
helm ls

# List all releases in all namespaces
helm list --all-namespaces
helm list -A

# List releases in specific namespace
helm list -n [NAMESPACE]

# List all (including failed/deleted)
helm list --all

# Filter by status
helm list --deployed
helm list --failed
helm list --pending
helm list --superseded

# Output formats
helm list -o json
helm list -o yaml
helm list -o table

# Sort
helm list --sort-reverse
helm list --max 10
```

## Status

```bash
# Get release status
helm status [RELEASE]
helm status my-nginx

# Status in specific namespace
helm status [RELEASE] -n [NAMESPACE]

# Show resources
helm status [RELEASE] --show-resources

# Output format
helm status [RELEASE] -o json
```

## Get

```bash
# Get manifest
helm get manifest [RELEASE]

# Get values
helm get values [RELEASE]

# Get all values (including defaults)
helm get values [RELEASE] --all

# Get values in JSON
helm get values [RELEASE] -o json

# Get hooks
helm get hooks [RELEASE]

# Get notes
helm get notes [RELEASE]

# Get all information
helm get all [RELEASE]
```

## Upgrade

```bash
# Basic upgrade
helm upgrade [RELEASE] [CHART]
helm upgrade my-nginx bitnami/nginx

# Upgrade with new values
helm upgrade [RELEASE] [CHART] -f values.yaml

# Upgrade with inline values
helm upgrade [RELEASE] [CHART] --set key=value

# Install if not exists
helm upgrade --install [RELEASE] [CHART]
helm upgrade --install my-nginx bitnami/nginx

# Force upgrade (recreate resources)
helm upgrade [RELEASE] [CHART] --force

# Reset values to chart defaults
helm upgrade [RELEASE] [CHART] --reset-values

# Reuse previous values
helm upgrade [RELEASE] [CHART] --reuse-values

# Wait for upgrade to complete
helm upgrade [RELEASE] [CHART] --wait --timeout 10m

# Atomic upgrade (rollback on failure)
helm upgrade [RELEASE] [CHART] --atomic

# Cleanup on failure
helm upgrade [RELEASE] [CHART] --cleanup-on-fail

# Dry run
helm upgrade [RELEASE] [CHART] --dry-run --debug
```

## Rollback

```bash
# Rollback to previous version
helm rollback [RELEASE]
helm rollback my-nginx

# Rollback to specific revision
helm rollback [RELEASE] [REVISION]
helm rollback my-nginx 3

# Rollback with wait
helm rollback [RELEASE] --wait

# Rollback with timeout
helm rollback [RELEASE] --timeout 10m

# Force rollback
helm rollback [RELEASE] --force

# Cleanup on failure
helm rollback [RELEASE] --cleanup-on-fail

# Dry run
helm rollback [RELEASE] [REVISION] --dry-run
```

## History

```bash
# View release history
helm history [RELEASE]
helm history my-nginx

# View in specific namespace
helm history [RELEASE] -n [NAMESPACE]

# Limit results
helm history [RELEASE] --max 5

# Output format
helm history [RELEASE] -o json
helm history [RELEASE] -o yaml
```

## Uninstall

```bash
# Uninstall release
helm uninstall [RELEASE]
helm uninstall my-nginx

# Uninstall from specific namespace
helm uninstall [RELEASE] -n [NAMESPACE]

# Keep history
helm uninstall [RELEASE] --keep-history

# Dry run
helm uninstall [RELEASE] --dry-run

# Wait for deletion
helm uninstall [RELEASE] --wait

# Set timeout
helm uninstall [RELEASE] --timeout 10m
```

## Create & Package

```bash
# Create new chart
helm create [NAME]
helm create my-chart

# Package chart
helm package [CHART]
helm package ./my-chart

# Package with version
helm package ./my-chart --version 1.0.0

# Package with app version
helm package ./my-chart --app-version 2.0.0

# Sign package
helm package ./my-chart --sign --key mykey --keyring ~/.gnupg/secring.gpg

# Set destination
helm package ./my-chart -d ./output

# Update dependencies before packaging
helm package ./my-chart --dependency-update
```

## Dependencies

```bash
# Update dependencies
helm dependency update [CHART]
helm dependency update ./my-chart

# Build dependencies
helm dependency build [CHART]

# List dependencies
helm dependency list [CHART]
```

## Template

```bash
# Render templates locally
helm template [RELEASE] [CHART]
helm template my-nginx bitnami/nginx

# Render with values
helm template [RELEASE] [CHART] -f values.yaml

# Render specific templates
helm template [RELEASE] [CHART] -s templates/deployment.yaml

# Show only manifests
helm template [RELEASE] [CHART] --show-only templates/deployment.yaml

# Output to file
helm template [RELEASE] [CHART] > output.yaml

# Debug
helm template [RELEASE] [CHART] --debug

# Validate
helm template [RELEASE] [CHART] --validate

# Include CRDs
helm template [RELEASE] [CHART] --include-crds

# Set namespace
helm template [RELEASE] [CHART] -n production

# Is upgrade mode
helm template [RELEASE] [CHART] --is-upgrade
```

## Lint

```bash
# Lint chart
helm lint [CHART]
helm lint ./my-chart

# Lint with values
helm lint [CHART] -f values.yaml

# Strict mode
helm lint [CHART] --strict

# Quiet mode
helm lint [CHART] --quiet

# Lint with specific values
helm lint [CHART] --set key=value
```

## Test

```bash
# Run tests
helm test [RELEASE]
helm test my-nginx

# Show logs
helm test [RELEASE] --logs

# Filter by name
helm test [RELEASE] --filter name=test-connection

# Timeout
helm test [RELEASE] --timeout 5m
```

## Plugin

```bash
# List plugins
helm plugin list

# Install plugin
helm plugin install [URL]
helm plugin install https://github.com/databus23/helm-diff

# Update plugin
helm plugin update [NAME]

# Uninstall plugin
helm plugin uninstall [NAME]
```

## Pull

```bash
# Pull chart
helm pull [CHART]
helm pull bitnami/nginx

# Pull and extract
helm pull [CHART] --untar

# Pull specific version
helm pull [CHART] --version 1.0.0

# Pull to directory
helm pull [CHART] -d ./charts

# Pull with provenance
helm pull [CHART] --prov

# Verify signature
helm pull [CHART] --verify
```

## Registry (OCI)

```bash
# Login to registry
helm registry login registry.example.com -u username

# Logout
helm registry logout registry.example.com

# Push chart to OCI registry
helm push my-chart-0.1.0.tgz oci://registry.example.com/charts

# Pull from OCI registry
helm pull oci://registry.example.com/charts/my-chart --version 0.1.0

# Install from OCI
helm install my-release oci://registry.example.com/charts/my-chart --version 0.1.0
```

## Environment & Config

```bash
# Show environment info
helm env

# Get Helm home
echo $HELM_HOME

# Show version
helm version

# Show version (short)
helm version --short

# Show client and server version
helm version

# Helm config home
helm env | grep HELM_CONFIG_HOME
```

## Useful Flags

| Flag | Description |
|------|-------------|
| `-n, --namespace` | Kubernetes namespace |
| `--create-namespace` | Create namespace if not exists |
| `-f, --values` | Specify values file |
| `--set` | Set values on command line |
| `--dry-run` | Simulate operation |
| `--debug` | Enable verbose output |
| `--wait` | Wait for resources to be ready |
| `--timeout` | Time to wait (default 5m0s) |
| `--atomic` | Rollback on failure |
| `--force` | Force update through delete/recreate |
| `--cleanup-on-fail` | Delete new resources on failure |
| `-o, --output` | Output format (table, json, yaml) |
| `-A, --all-namespaces` | List across all namespaces |
| `--version` | Specify chart version |

## Quick Workflows

### Install and Customize

```bash
# 1. Search
helm search repo wordpress

# 2. Show values
helm show values bitnami/wordpress > values.yaml

# 3. Edit values.yaml

# 4. Install
helm install my-wordpress bitnami/wordpress -f values.yaml -n prod --create-namespace
```

### Update Release

```bash
# 1. Check current values
helm get values my-release

# 2. Update
helm upgrade my-release bitnami/nginx --set replicaCount=5

# 3. Check status
helm status my-release

# 4. View history
helm history my-release

# 5. Rollback if needed
helm rollback my-release
```

### Debug Installation

```bash
# 1. Dry run
helm install my-release ./chart --dry-run --debug

# 2. Template locally
helm template my-release ./chart

# 3. Lint chart
helm lint ./chart

# 4. Install with debug
helm install my-release ./chart --debug --wait
```

### Work with Chart

```bash
# 1. Create chart
helm create my-app

# 2. Lint
helm lint ./my-app

# 3. Template test
helm template test ./my-app

# 4. Package
helm package ./my-app

# 5. Install from package
helm install my-release ./my-app-0.1.0.tgz
```

## Tags

`helm`, `cli`, `cheatsheet`, `kubernetes`, `commands`

---

*Last updated: 2025-10-30*
