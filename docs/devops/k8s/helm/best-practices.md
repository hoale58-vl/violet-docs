# Helm Best Practices

Essential best practices for creating and managing production-ready Helm charts.

## Quick Start Checklist

Use this checklist for every new Helm chart to ensure you're following best practices:

| # | Best Practice | Reference / Commands |
|:-:|--------------|---------------------|
| ⬜ | **Follow semantic versioning** for chart and app versions | Update Chart.yaml - [Follow Semantic Versioning](#1-follow-semantic-versioning) |
| ⬜ | **Use meaningful chart names** (not generic names) | [Use Meaningful Chart Names](#2-use-meaningful-chart-names) |
| ⬜ | **Provide complete metadata** in Chart.yaml | [Provide Complete Metadata](#3-provide-complete-metadata) |
| ⬜ | **Set sensible defaults** in values.yaml | [Provide Sensible Defaults](#1-provide-sensible-defaults) |
| ⬜ | **Document all values** with comments and descriptions | [Document All Values](#2-document-all-values) |
| ⬜ | **Use nested values** for better organization | [Use Nested Values for Organization](#3-use-nested-values-for-organization) |
| ⬜ | **Make features optional** with enable flags | [Make Features Optional](#4-make-features-optional) |
| ⬜ | **Create named templates** for reusable code | `templates/_helpers.tpl` - [Use Named Templates](#1-use-named-templates) |
| ⬜ | **Use standard Kubernetes labels** | [Use Standard Labels](#2-use-standard-labels) |
| ⬜ | **Validate required values** with fail or required functions | [Validate Required Values](#3-validate-required-values) |
| ⬜ | **Use conditional resources** for optional features | [Use Conditional Resources](#4-use-conditional-resources) |
| ⬜ | **Control whitespace** in templates properly | Use `{{-` and `-}}` - [Control Whitespace](#5-control-whitespace) |
| ⬜ | **Set resource requests/limits** for all containers | [Always Set Resource Requests/Limits](#1-always-set-resource-requestslimits) |
| ⬜ | **Configure liveness and readiness probes** | [Configure Liveness and Readiness Probes](#2-configure-liveness-and-readiness-probes) |
| ⬜ | **Use Pod Disruption Budgets** for HA deployments | [Use Pod Disruption Budgets](#3-use-pod-disruption-budgets) |
| ⬜ | **Configure pod security context** | [Configure Pod Security](#4-configure-pod-security) |
| ⬜ | **Pin dependency versions** to specific versions | Chart.yaml dependencies - [Pin Dependency Versions](#1-pin-dependency-versions) |
| ⬜ | **Make dependencies optional** with conditions | [Make Dependencies Optional](#2-make-dependencies-optional) |
| ⬜ | **Create test files** for basic functionality | `templates/tests/` - [Create Test Files](#1-create-test-files) |
| ⬜ | **Use hooks** for lifecycle management | [Use Hooks for Lifecycle Management](#2-use-hooks-for-lifecycle-management) |
| ⬜ | **Lint chart before packaging** | `helm lint ./mychart --strict` - [Lint Before Packaging](#3-lint-before-packaging) |
| ⬜ | **Never store secrets in values** | Use existingSecret - [Don't Store Secrets in Values](#1-dont-store-secrets-in-values) |
| ⬜ | **Use image pull secrets** for private registries | [Use Image Pull Secrets](#2-use-image-pull-secrets) |
| ⬜ | **Configure RBAC** with service accounts | [Configure RBAC](#3-configure-rbac) |
| ⬜ | **Create comprehensive README** with installation instructions | [Create Comprehensive README](#1-create-comprehensive-readme) |
| ⬜ | **Provide NOTES.txt** with post-install instructions | `templates/NOTES.txt` - [Provide NOTES.txt](#2-provide-notestxt) |
| ⬜ | **Use .helmignore** to exclude unnecessary files | [Use .helmignore](#1-use-helmignore) |
| ⬜ | **Maintain CHANGELOG** for version history | [Maintain CHANGELOG](#2-maintain-changelog) |

> **Note:** Copy this checklist to your project README and manually check off items (⬜ → ✅) as you complete them.

### Verification Commands

Run these commands to verify and test your Helm chart:

```bash
# Lint the chart
helm lint ./mychart
helm lint ./mychart --strict

# Validate with custom values
helm lint ./mychart -f custom-values.yaml

# Dry-run installation
helm install myrelease ./mychart --dry-run --debug

# Template and check output
helm template myrelease ./mychart

# Template with custom values
helm template myrelease ./mychart -f custom-values.yaml

# Package the chart
helm package ./mychart

# Install and test
helm install myrelease ./mychart --wait --timeout 5m
helm test myrelease

# Check installed resources
helm get manifest myrelease
helm get values myrelease

# Validate dependencies
helm dependency list ./mychart
helm dependency update ./mychart

# Check for security issues (with kubesec)
helm template myrelease ./mychart | kubesec scan -

# Verify all required values are documented
grep -r "@param" ./mychart/values.yaml

# Check for hardcoded values in templates
grep -r "namespace:" ./mychart/templates/ | grep -v ".Release.Namespace"

# Generate documentation (with helm-docs)
helm-docs ./mychart
```

### Chart Quality Checklist

```bash
# Verify chart follows best practices
helm lint ./mychart --strict

# Check for common mistakes
# 1. Hardcoded namespaces
grep -r "namespace:" ./mychart/templates/ | grep -v "\.Release\.Namespace"

# 2. Missing resource limits
helm template myrelease ./mychart | grep -A 10 "kind: Deployment" | grep -c "resources:"

# 3. No probes configured
helm template myrelease ./mychart | grep -c "livenessProbe:"
helm template myrelease ./mychart | grep -c "readinessProbe:"

# 4. Secrets in values
grep -i "password\|secret\|token" ./mychart/values.yaml

# 5. No service account
helm template myrelease ./mychart | grep -c "serviceAccountName:"
```

## Chart Design

### 1. Follow Semantic Versioning

```yaml
# Chart.yaml
version: 1.2.3  # Chart version
appVersion: "2.0.1"  # Application version
```

**Version guidelines:**
- **Major**: Breaking changes, incompatible API changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

### 2. Use Meaningful Chart Names

```yaml
# Good
name: postgres-operator
name: nginx-ingress
name: cert-manager

# Avoid
name: my-app
name: test
name: app
```

### 3. Provide Complete Metadata

```yaml
# Chart.yaml
apiVersion: v2
name: my-application
description: A comprehensive description of what this chart does
type: application
version: 1.0.0
appVersion: "2.0.0"
keywords:
  - database
  - postgresql
  - ha
home: https://github.com/org/my-app
sources:
  - https://github.com/org/my-app
  - https://github.com/org/helm-chart
maintainers:
  - name: Team Name
    email: team@example.com
    url: https://example.com
icon: https://example.com/icon.png
deprecated: false
```

## Values Configuration

### 1. Provide Sensible Defaults

```yaml
# values.yaml - Good defaults
replicaCount: 1  # Start small

image:
  repository: nginx
  pullPolicy: IfNotPresent
  tag: ""  # Default to appVersion

resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: false  # Opt-in for advanced features
```

### 2. Document All Values

```yaml
# values.yaml with comments
## Number of replicas to deploy
## @param replicaCount - Number of pod replicas
replicaCount: 1

## Image configuration
image:
  ## Docker image repository
  ## @param image.repository - Image repository
  repository: nginx

  ## Image pull policy
  ## @param image.pullPolicy - Pull policy (IfNotPresent, Always, Never)
  pullPolicy: IfNotPresent

  ## Image tag (defaults to Chart appVersion)
  ## @param image.tag - Image tag
  tag: ""
```

### 3. Use Nested Values for Organization

```yaml
# Good - organized
postgresql:
  enabled: true
  auth:
    username: myuser
    password: mypass
    database: mydb
  primary:
    persistence:
      enabled: true
      size: 8Gi

# Avoid - flat structure
postgresqlEnabled: true
postgresqlUsername: myuser
postgresqlPassword: mypass
postgresqlDatabase: mydb
```

### 4. Make Features Optional

```yaml
ingress:
  enabled: false  # Opt-in
  className: nginx
  annotations: {}

monitoring:
  enabled: false  # Opt-in
  serviceMonitor:
    enabled: false

autoscaling:
  enabled: false  # Opt-in
  minReplicas: 1
  maxReplicas: 10
```

## Templates

### 1. Use Named Templates

```yaml
# templates/_helpers.tpl
{{- define "mychart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "mychart.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

# Usage in templates
name: {{ include "mychart.fullname" . }}
```

### 2. Use Standard Labels

```yaml
{{- define "mychart.labels" -}}
helm.sh/chart: {{ include "mychart.chart" . }}
{{ include "mychart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "mychart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mychart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

# In Deployment
metadata:
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
spec:
  selector:
    matchLabels:
      {{- include "mychart.selectorLabels" . | nindent 6 }}
```

### 3. Validate Required Values

```yaml
{{- if not .Values.database.host }}
{{- fail "database.host is required" }}
{{- end }}

{{- if and .Values.ingress.enabled (not .Values.ingress.host) }}
{{- fail "ingress.host is required when ingress is enabled" }}
{{- end }}

# Or use required function
host: {{ required "database.host is required" .Values.database.host }}
```

### 4. Use Conditional Resources

```yaml
# templates/ingress.yaml
{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "mychart.fullname" . }}
spec:
  # ...
{{- end }}
```

### 5. Control Whitespace

```yaml
# Remove leading whitespace
{{- if .Values.enabled }}
  enabled: true
{{- end }}

# Remove trailing whitespace
{{ if .Values.enabled -}}
  enabled: true
{{ end -}}

# Use nindent for proper YAML formatting
labels:
  {{- include "mychart.labels" . | nindent 4 }}

resources:
  {{- toYaml .Values.resources | nindent 2 }}
```

## Resource Management

### 1. Always Set Resource Requests/Limits

```yaml
# values.yaml
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi

# Template
{{- if .Values.resources }}
resources:
  {{- toYaml .Values.resources | nindent 2 }}
{{- end }}
```

### 2. Configure Liveness and Readiness Probes

```yaml
# values.yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 3. Use Pod Disruption Budgets

```yaml
# templates/pdb.yaml
{{- if and .Values.podDisruptionBudget.enabled (gt (int .Values.replicaCount) 1) }}
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ include "mychart.fullname" . }}
spec:
  minAvailable: {{ .Values.podDisruptionBudget.minAvailable }}
  selector:
    matchLabels:
      {{- include "mychart.selectorLabels" . | nindent 6 }}
{{- end }}
```

### 4. Configure Pod Security

```yaml
# values.yaml
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL
```

## Dependencies

### 1. Pin Dependency Versions

```yaml
# Chart.yaml - Good
dependencies:
  - name: postgresql
    version: "11.6.12"  # Specific version
    repository: "https://charts.bitnami.com/bitnami"

# Avoid
dependencies:
  - name: postgresql
    version: "~11.0.0"  # Too loose
    repository: "https://charts.bitnami.com/bitnami"
```

### 2. Make Dependencies Optional

```yaml
# Chart.yaml
dependencies:
  - name: postgresql
    version: "11.6.12"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled

# values.yaml
postgresql:
  enabled: true  # Can be disabled
  auth:
    database: mydb
```

### 3. Override Dependency Values Properly

```yaml
# values.yaml
postgresql:
  enabled: true
  auth:
    database: myapp
    username: myuser
  primary:
    persistence:
      size: 10Gi
  resources:
    requests:
      memory: 256Mi
      cpu: 250m
```

## Testing

### 1. Create Test Files

```yaml
# templates/tests/test-connection.yaml
apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "mychart.fullname" . }}-test-connection"
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  containers:
    - name: wget
      image: busybox
      command: ['wget']
      args: ['{{ include "mychart.fullname" . }}:{{ .Values.service.port }}']
  restartPolicy: Never
```

### 2. Use Hooks for Lifecycle Management

```yaml
# templates/job-pre-install.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "mychart.fullname" . }}-pre-install
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    spec:
      containers:
      - name: pre-install
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        command: ["/bin/sh", "-c"]
        args:
          - echo "Running pre-install tasks"
      restartPolicy: Never
```

**Hook types:**
- `pre-install`, `post-install`
- `pre-delete`, `post-delete`
- `pre-upgrade`, `post-upgrade`
- `pre-rollback`, `post-rollback`
- `test`

### 3. Lint Before Packaging

```bash
# Lint chart
helm lint ./mychart

# Strict linting
helm lint ./mychart --strict

# Lint with values
helm lint ./mychart -f test-values.yaml
```

## Security

### 1. Don't Store Secrets in Values

```yaml
# Bad - Never do this
password: "mysecretpassword"

# Good - Reference existing secrets
existingSecret: my-secret-name

# Or use sealed-secrets, external-secrets, etc.
```

### 2. Use Image Pull Secrets

```yaml
# values.yaml
imagePullSecrets:
  - name: regcred

# Template
{{- with .Values.imagePullSecrets }}
imagePullSecrets:
  {{- toYaml . | nindent 2 }}
{{- end }}
```

### 3. Configure RBAC

```yaml
# values.yaml
serviceAccount:
  create: true
  annotations: {}
  name: ""

rbac:
  create: true
  rules:
    - apiGroups: [""]
      resources: ["pods"]
      verbs: ["get", "list"]
```

## Documentation

### 1. Create Comprehensive README

```markdown
# Chart Name

## Prerequisites
- Kubernetes 1.20+
- Helm 3.2+
- PV provisioner support

## Installing the Chart
\`\`\`bash
helm install my-release ./mychart
\`\`\`

## Configuration
| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.repository` | Image repository | `nginx` |

## Upgrading
\`\`\`bash
helm upgrade my-release ./mychart
\`\`\`

## Uninstalling
\`\`\`bash
helm uninstall my-release
\`\`\`
```

### 2. Provide NOTES.txt

```yaml
# templates/NOTES.txt
Thank you for installing {{ .Chart.Name }}.

Your release is named {{ .Release.Name }}.

To access your application:

{{- if .Values.ingress.enabled }}
  http{{ if .Values.ingress.tls }}s{{ end }}://{{ .Values.ingress.host }}
{{- else if contains "NodePort" .Values.service.type }}
  export NODE_PORT=$(kubectl get --namespace {{ .Release.Namespace }} -o jsonpath="{.spec.ports[0].nodePort}" services {{ include "mychart.fullname" . }})
  export NODE_IP=$(kubectl get nodes --namespace {{ .Release.Namespace }} -o jsonpath="{.items[0].status.addresses[0].address}")
  echo http://$NODE_IP:$NODE_PORT
{{- else if contains "ClusterIP" .Values.service.type }}
  export POD_NAME=$(kubectl get pods --namespace {{ .Release.Namespace }} -l "app.kubernetes.io/name={{ include "mychart.name" . }},app.kubernetes.io/instance={{ .Release.Name }}" -o jsonpath="{.items[0].metadata.name}")
  kubectl --namespace {{ .Release.Namespace }} port-forward $POD_NAME 8080:80
  echo "Visit http://127.0.0.1:8080 to use your application"
{{- end }}
```

## Version Control

### 1. Use .helmignore

```
# .helmignore
*.md
.git/
.gitignore
CI/
.circleci/
.github/
.gitlab-ci.yml
*.swp
*.bak
*.tmp
*~
.DS_Store
```

### 2. Maintain CHANGELOG

```markdown
# Changelog

## [1.2.0] - 2025-01-15
### Added
- Support for horizontal pod autoscaling
- Pod disruption budget

### Changed
- Updated default resource limits

### Fixed
- Ingress annotation format
```

## Performance

### 1. Use --wait and --timeout

```bash
# Wait for resources to be ready
helm install myapp ./chart --wait --timeout 10m

# Atomic (rollback on failure)
helm install myapp ./chart --atomic --timeout 10m
```

### 2. Set Appropriate Timeouts in Hooks

```yaml
annotations:
  "helm.sh/hook": pre-install
  "helm.sh/hook-delete-policy": hook-succeeded,hook-failed
  "helm.sh/hook-weight": "0"
```

## Chart Organization

### Repository Structure

```
my-chart/
├── .github/
│   └── workflows/
│       └── lint-test.yaml
├── charts/
│   └── .gitkeep
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── serviceaccount.yaml
│   ├── _helpers.tpl
│   ├── NOTES.txt
│   └── tests/
│       └── test-connection.yaml
├── .helmignore
├── Chart.yaml
├── values.yaml
├── values.schema.json
├── README.md
└── CHANGELOG.md
```

## Common Mistakes to Avoid

1. **Hardcoding values** instead of using values.yaml
2. **Not validating required values**
3. **Missing resource limits**
4. **Not using readiness probes**
5. **Loose dependency versions**
6. **Storing secrets in values**
7. **Not providing NOTES.txt**
8. **Missing documentation**
9. **Not testing with `helm lint`**
10. **Not using semantic versioning**

## Tags

`helm`, `best-practices`, `kubernetes`, `k8s`, `charts`

---

*Last updated: 2025-10-30*
