# Best Practices

Essential best practices for creating and managing production-ready Helm charts.

## Quick Start Checklist

Use this checklist for every new Helm chart to ensure you're following best practices:

| # | Best Practice | Reference / Commands |
|:-:|--------------|---------------------|
| ⬜ | **Set sensible defaults** in values.yaml | [Provide Sensible Defaults](#1-provide-sensible-defaults) |
| ⬜ | **Document all values** with comments and descriptions | [Document All Values](#2-document-all-values) |
| ⬜ | **Use nested values** for better organization | [Use Nested Values for Organization](#3-use-nested-values-for-organization) |
| ⬜ | **Make features optional** with enable flags | [Make Features Optional](#4-make-features-optional) |
| ⬜ | **Set resource requests/limits** for all containers | [Always Set Resource Requests/Limits](#1-always-set-resource-requestslimits) |
| ⬜ | **Configure liveness and readiness probes** | [Configure Liveness and Readiness Probes](#2-configure-liveness-and-readiness-probes) |
| ⬜ | **Use Pod Disruption Budgets** for HA deployments | [Use Pod Disruption Budgets](#3-use-pod-disruption-budgets) |
| ⬜ | **Configure pod security context** | [Configure Pod Security](#4-configure-pod-security) |
| ⬜ | **Pin dependency versions** to specific versions | Chart.yaml dependencies - [Pin Dependency Versions](#1-pin-dependency-versions) |
| ⬜ | **Make dependencies optional** with conditions | [Make Dependencies Optional](#2-make-dependencies-optional) |
| ⬜ | **Use hooks** for lifecycle management | [Use Hooks for Lifecycle Management](#1-use-hooks-for-lifecycle-management) |
| ⬜ | **Lint chart before packaging** | `helm lint ./mychart --strict` - [Lint Before Packaging](#2-lint-before-packaging) |
| ⬜ | **Never store secrets in values** | Use existingSecret - [Don't Store Secrets in Values](#1-dont-store-secrets-in-values) |
| ⬜ | **Configure RBAC** with service accounts | [Configure RBAC](#2-configure-rbac) |
| ⬜ | **Use .helmignore** to exclude unnecessary files | [Use .helmignore](#1-use-helmignore) |
| ⬜ | **Maintain CHANGELOG** for version history | [Maintain CHANGELOG](#2-maintain-changelog) |

> **Note:** Copy this checklist to your project README and manually check off items (⬜ → ✅) as you complete them.


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

A PDB tells Kubernetes: always keep at least X Pods running, even during disruptions

```yaml
# templates/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ include "mychart.fullname" . }}
spec:
  minAvailable: 1
  selector:
    matchLabels:
      {{- include "mychart.selectorLabels" . | nindent 6 }}
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

### 1. Use Hooks for Lifecycle Management

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

### 2. Lint Before Packaging

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

### 2. Configure RBAC

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

## Tags

`helm`, `best-practices`, `kubernetes`, `k8s`, `charts`

---

*Last updated: 2025-10-30*
