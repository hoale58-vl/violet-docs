# Helm Overview

The package manager for Kubernetes - simplifying application deployment and management.

## What is Helm?

Helm is a package manager for Kubernetes that helps you define, install, and upgrade complex Kubernetes applications. It uses a packaging format called Charts, which are collections of files that describe a related set of Kubernetes resources.

## Core Concepts

### Chart
A Chart is a Helm package containing all resource definitions necessary to run an application, tool, or service inside a Kubernetes cluster.

**Key characteristics:**
- Reusable and shareable
- Version controlled
- Parameterized with values
- Can have dependencies on other charts

### Release
A Release is an instance of a chart running in a Kubernetes cluster. Each time you install a chart, a new release is created.

**Example:** Installing the same WordPress chart three times creates three different releases, each with its own release name and configuration.

### Repository
A Repository is a collection of charts that can be shared. Similar to package repositories for other package managers (npm, pip, apt).

**Popular repositories:**
- Bitnami: `https://charts.bitnami.com/bitnami`
- Stable (deprecated): `https://charts.helm.sh/stable`
- Artifact Hub: `https://artifacthub.io/`

### Values
Values are configuration parameters that customize a chart's behavior. They can be set via:
- Default `values.yaml` in the chart
- Custom values file with `-f` flag
- Command-line overrides with `--set` flag

## Chart Structure

```
my-chart/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default configuration values
├── charts/                 # Chart dependencies
├── templates/              # Kubernetes manifest templates
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── _helpers.tpl        # Template helpers
│   ├── NOTES.txt           # Post-install notes
│   └── tests/              # Test files
│       └── test-connection.yaml
├── .helmignore             # Files to ignore
└── README.md               # Chart documentation
```

### Chart.yaml

Contains metadata about the chart:

```yaml
apiVersion: v2
name: my-application
description: A Helm chart for my application
type: application
version: 0.1.0              # Chart version (SemVer)
appVersion: "1.0.0"         # Application version
keywords:
  - web
  - application
maintainers:
  - name: Your Name
    email: you@example.com
    url: https://example.com
home: https://github.com/user/my-chart
sources:
  - https://github.com/user/app
icon: https://example.com/icon.png
dependencies:
  - name: postgresql
    version: "~11.0.0"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
```

**Chart types:**
- `application`: Default, standard application chart
- `library`: Provides utilities for other charts, not installable

### values.yaml

Default configuration values:

```yaml
# Number of replicas
replicaCount: 1

# Image configuration
image:
  repository: nginx
  pullPolicy: IfNotPresent
  tag: ""  # Overrides appVersion

# Service configuration
service:
  type: ClusterIP
  port: 80

# Ingress configuration
ingress:
  enabled: false
  className: "nginx"
  annotations: {}
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific

# Resources
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi

# Autoscaling
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80
```

### templates/

Contains Kubernetes manifests as Go templates. Files are rendered with values and installed in the cluster.

**Special files:**
- `_helpers.tpl`: Template helpers and reusable snippets (not rendered)
- `NOTES.txt`: Instructions shown after installation
- `tests/`: Test files for `helm test`

### .helmignore

Specifies files to exclude from the chart package:

```
# Development files
*.md
.git/
.gitignore

# CI/CD
.circleci/
.github/
.gitlab-ci.yml

# IDE
.idea/
.vscode/
*.swp

# OS files
.DS_Store
Thumbs.db
```

## Installation

### Install Helm

```bash
# macOS
brew install helm

# Linux (script)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Linux (manual)
wget https://get.helm.sh/helm-v3.13.0-linux-amd64.tar.gz
tar -zxvf helm-v3.13.0-linux-amd64.tar.gz
sudo mv linux-amd64/helm /usr/local/bin/helm

# Windows (Chocolatey)
choco install kubernetes-helm

# Windows (Scoop)
scoop install helm

# Verify installation
helm version
```

### Initialize Helm

Helm 3 doesn't require initialization (Tiller removed). Just add repositories:

```bash
# Add a repository
helm repo add bitnami https://charts.bitnami.com/bitnami

# Update repositories
helm repo update

# Search for charts
helm search repo nginx
```

## Basic Workflow

### 1. Search for Charts

```bash
# Search in added repositories
helm search repo wordpress

# Search Artifact Hub
helm search hub wordpress

# Show chart information
helm show chart bitnami/wordpress
helm show values bitnami/wordpress
helm show readme bitnami/wordpress
```

### 2. Install a Chart

```bash
# Simple install
helm install my-release bitnami/wordpress

# Install with custom values
helm install my-release bitnami/wordpress -f custom-values.yaml

# Install with inline values
helm install my-release bitnami/wordpress \
  --set wordpressUsername=admin \
  --set wordpressPassword=password

# Install in specific namespace
helm install my-release bitnami/wordpress \
  --namespace production \
  --create-namespace

# Dry run (test without installing)
helm install my-release bitnami/wordpress --dry-run --debug
```

### 3. Manage Releases

```bash
# List releases
helm list
helm list --all-namespaces

# Get release status
helm status my-release

# Get release values
helm get values my-release

# Get release manifest
helm get manifest my-release

# View release history
helm history my-release
```

### 4. Upgrade Releases

```bash
# Upgrade with new values
helm upgrade my-release bitnami/wordpress -f new-values.yaml

# Upgrade and install if not exists
helm upgrade --install my-release bitnami/wordpress

# Force upgrade (recreate resources)
helm upgrade my-release bitnami/wordpress --force

# Wait for resources to be ready
helm upgrade my-release bitnami/wordpress --wait --timeout 5m
```

### 5. Rollback Releases

```bash
# Rollback to previous version
helm rollback my-release

# Rollback to specific revision
helm rollback my-release 2

# Dry run rollback
helm rollback my-release 2 --dry-run
```

### 6. Uninstall Releases

```bash
# Uninstall release
helm uninstall my-release

# Keep history after uninstall
helm uninstall my-release --keep-history

# Uninstall from specific namespace
helm uninstall my-release -n production
```

## Helm Version Differences

### Helm 2 vs Helm 3

| Feature | Helm 2 | Helm 3 |
|---------|--------|--------|
| **Tiller** | Required server component | Removed (no Tiller) |
| **Security** | Tiller had broad permissions | Uses user's kubeconfig |
| **Release storage** | ConfigMaps/Secrets in Tiller namespace | Secrets in release namespace |
| **Release names** | Cluster-wide unique | Namespace-scoped |
| **Commands** | `helm init` required | No initialization needed |
| **Charts** | requirements.yaml | Dependencies in Chart.yaml |
| **Upgrades** | 2-way merge | 3-way merge |

## Quick Start Example

```bash
# 1. Add repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 2. Create custom values
cat <<EOF > my-values.yaml
replicaCount: 2
service:
  type: LoadBalancer
ingress:
  enabled: true
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
EOF

# 3. Install
helm install myapp bitnami/nginx -f my-values.yaml

# 4. Check status
helm status myapp
kubectl get all -l app.kubernetes.io/instance=myapp

# 5. Upgrade
helm upgrade myapp bitnami/nginx --set replicaCount=3

# 6. Rollback if needed
helm rollback myapp

# 7. Uninstall
helm uninstall myapp
```

## Resources

- **Official Documentation**: https://helm.sh/docs/
- **Artifact Hub**: https://artifacthub.io/
- **Chart Repository**: https://github.com/helm/charts
- **Helm GitHub**: https://github.com/helm/helm

## Tags

`helm`, `kubernetes`, `k8s`, `package-manager`, `devops`, `charts`

---

*Last updated: 2025-10-30*
