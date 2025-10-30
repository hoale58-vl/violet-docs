# Helm

The package manager for Kubernetes - templating, packaging, and deploying applications.

## Overview

Helm helps you manage Kubernetes applications using Helm Charts, which are packages of pre-configured Kubernetes resources.

## Installation

```bash
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Windows
choco install kubernetes-helm

# Verify installation
helm version
```

## Basic Concepts

- **Chart**: A Helm package containing Kubernetes resource definitions
- **Release**: An instance of a chart running in a Kubernetes cluster
- **Repository**: A collection of charts
- **Values**: Configuration parameters for charts

## Getting Started

### Working with Repositories

```bash
# Add repository
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami

# Update repositories
helm repo update

# List repositories
helm repo list

# Search for charts
helm search repo nginx
helm search hub wordpress

# Remove repository
helm repo remove stable
```

### Installing Charts

```bash
# Install a chart
helm install my-release bitnami/nginx

# Install with custom values
helm install my-release bitnami/nginx --set service.type=LoadBalancer

# Install from values file
helm install my-release bitnami/nginx -f values.yaml

# Install in specific namespace
helm install my-release bitnami/nginx --namespace production --create-namespace

# Dry run (test without installing)
helm install my-release bitnami/nginx --dry-run --debug
```

### Managing Releases

```bash
# List releases
helm list
helm list -A  # All namespaces

# Get release status
helm status my-release

# Get release values
helm get values my-release

# Get release manifest
helm get manifest my-release

# Upgrade release
helm upgrade my-release bitnami/nginx -f values.yaml

# Rollback release
helm rollback my-release 1

# Uninstall release
helm uninstall my-release

# Keep history after uninstall
helm uninstall my-release --keep-history
```

## Creating Charts

### Initialize New Chart

```bash
# Create new chart
helm create my-chart

# Chart structure:
# my-chart/
#   Chart.yaml          # Chart metadata
#   values.yaml         # Default values
#   charts/             # Dependencies
#   templates/          # Kubernetes manifests
#     deployment.yaml
#     service.yaml
#     ingress.yaml
#     _helpers.tpl      # Template helpers
```

### Chart.yaml

```yaml
apiVersion: v2
name: my-chart
description: A Helm chart for my application
type: application
version: 0.1.0
appVersion: "1.0"
keywords:
  - application
  - web
maintainers:
  - name: Your Name
    email: you@example.com
dependencies:
  - name: postgresql
    version: 11.x.x
    repository: https://charts.bitnami.com/bitnami
```

### values.yaml

```yaml
replicaCount: 3

image:
  repository: nginx
  tag: "1.21"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

### Template Example (deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-chart.fullname" . }}
  labels:
    {{- include "my-chart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "my-chart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "my-chart.selectorLabels" . | nindent 8 }}
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
        resources:
          {{- toYaml .Values.resources | nindent 12 }}
```

## Template Functions

### Common Functions

```yaml
# String operations
{{ .Values.name | quote }}
{{ .Values.name | upper }}
{{ .Values.name | lower }}
{{ .Values.name | title }}
{{ .Values.name | trim }}

# Default values
{{ .Values.name | default "default-name" }}

# Conditionals
{{- if .Values.enabled }}
enabled: true
{{- else }}
enabled: false
{{- end }}

# Ranges
{{- range .Values.environments }}
- {{ . }}
{{- end }}

# Include templates
{{ include "my-chart.labels" . | nindent 4 }}

# toYaml
{{ toYaml .Values.resources | nindent 12 }}
```

## Dependencies

### Managing Dependencies

```bash
# Add dependency in Chart.yaml
dependencies:
  - name: postgresql
    version: "11.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled

# Update dependencies
helm dependency update

# List dependencies
helm dependency list
```

### Override Dependency Values

```yaml
# values.yaml
postgresql:
  enabled: true
  auth:
    database: mydb
    username: myuser
    password: mypassword
  primary:
    persistence:
      size: 8Gi
```

## Testing Charts

```bash
# Lint chart
helm lint my-chart

# Template (render without installing)
helm template my-release my-chart

# Test with values
helm template my-release my-chart -f custom-values.yaml

# Install with dry-run
helm install my-release my-chart --dry-run --debug

# Run tests
helm test my-release
```

## Packaging & Sharing

```bash
# Package chart
helm package my-chart

# This creates: my-chart-0.1.0.tgz

# Install from package
helm install my-release my-chart-0.1.0.tgz

# Create chart repository
helm repo index . --url https://example.com/charts

# Upload to repository
# Upload .tgz files and index.yaml to your hosting
```

## Advanced Patterns

### Hooks

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "my-chart.fullname" . }}-migration
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    spec:
      containers:
      - name: migration
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        command: ["npm", "run", "migrate"]
      restartPolicy: Never
```

### Named Templates (_helpers.tpl)

```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "my-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "my-chart.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "my-chart.labels" -}}
helm.sh/chart: {{ include "my-chart.chart" . }}
{{ include "my-chart.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
```

## Best Practices

1. **Use semantic versioning** for chart versions
2. **Document values** in values.yaml with comments
3. **Set resource limits** in values
4. **Use templates for reusability** (_helpers.tpl)
5. **Test charts thoroughly** before releasing
6. **Keep charts simple** and composable
7. **Use .helmignore** to exclude unnecessary files
8. **Pin dependency versions** for stability
9. **Use conditions** to make features optional
10. **Follow naming conventions** for templates

## Common Charts

```bash
# Install common applications
helm install my-nginx bitnami/nginx
helm install my-postgres bitnami/postgresql
helm install my-redis bitnami/redis
helm install my-mongodb bitnami/mongodb
helm install my-mysql bitnami/mysql
helm install prometheus prometheus-community/kube-prometheus-stack
helm install ingress-nginx ingress-nginx/ingress-nginx
```

## Troubleshooting

```bash
# View release history
helm history my-release

# Debug template rendering
helm template my-release my-chart --debug

# Verify chart
helm lint my-chart

# Get all information
helm get all my-release

# Check values
helm get values my-release

# Rollback if needed
helm rollback my-release 1
```

## Helm Diff Plugin

```bash
# Install plugin
helm plugin install https://github.com/databus23/helm-diff

# Preview changes before upgrade
helm diff upgrade my-release bitnami/nginx -f values.yaml
```

## Tags

`helm`, `kubernetes`, `k8s`, `package-manager`, `devops`, `charts`

---

*Last updated: 2025-10-30*
