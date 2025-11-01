# Helm Plugins

Most used and essential Helm plugins to enhance your workflow.

## Quick Reference Table

| Plugin | Repository | Most Used For |
|--------|------------|---------------|
| 🔍 [helm-diff](#helm-diff) | [GitHub](https://github.com/databus23/helm-diff) | Pre-upgrade review & change preview |
| 🔐 [helm-secrets](#helm-secrets) | [GitHub](https://github.com/jkroepke/helm-secrets) | Git-based secrets with SOPS |
| 📦 [helm-git](#helm-git) | [GitHub](https://github.com/aslafy-z/helm-git) | Install charts from Git repos |
| 📤 [helm-push](#helm-push) | [GitHub](https://github.com/chartmuseum/helm-push) | Push to ChartMuseum/OCI registry |
| ✅ [helm-unittest](#helm-unittest) | [GitHub](https://github.com/helm-unittest/helm-unittest) | Chart unit testing |
| 📊 [helm-dashboard](#helm-dashboard) | [GitHub](https://github.com/komodorio/helm-dashboard) | Web UI for visual management |
| ☁️ [helm-s3](#helm-s3) | [GitHub](https://github.com/hypnoglow/helm-s3) | Store charts in AWS S3 |
| ☁️ [helm-gcs](#helm-gcs) | [GitHub](https://github.com/hayorov/helm-gcs) | Store charts in GCS |
| 📈 [helm-monitor](#helm-monitor) | [GitHub](https://github.com/ContainerSolutions/helm-monitor) | Monitor releases with Prometheus |
| 📋 [helm-schema-gen](#helm-schema-gen) | [GitHub](https://github.com/karuppiah7890/helm-schema-gen) | Generate values.schema.json |
| 📝 [helm-docs](#helm-docs) | [GitHub](https://github.com/norwoodj/helm-docs) | Auto-generate chart documentation |

## Plugin Management

```bash
# List installed plugins
helm plugin list

# Install plugin
helm plugin install [URL]

# Update plugin
helm plugin update [NAME]

# Uninstall plugin
helm plugin uninstall [NAME]
```

---

## Essential Plugins

### helm-diff

**Show differences between deployed release and proposed update**

```bash
# Install
helm plugin install https://github.com/databus23/helm-diff

# Usage
helm diff upgrade [RELEASE] [CHART] -f values.yaml

# Show only changes
helm diff upgrade my-release ./chart --no-color

# Compare with specific revision
helm diff revision my-release 2 3
```

**Features:**
- Preview changes before upgrade
- Compare revisions
- Show added/removed/changed resources
- Color-coded output

**Use cases:**
- Before running `helm upgrade`
- Reviewing changes in CI/CD
- Debugging failed upgrades

**Repository:** [https://github.com/databus23/helm-diff](https://github.com/databus23/helm-diff)

---

### helm-secrets

**Manage secrets with Git workflow using SOPS**

```bash
# Install
helm plugin install https://github.com/jkroepke/helm-secrets

# Encrypt values file
helm secrets enc secrets.yaml

# Decrypt and view
helm secrets view secrets.yaml

# Edit encrypted file
helm secrets edit secrets.yaml

# Install with secrets
helm secrets install my-release ./chart -f secrets.yaml

# Upgrade with secrets
helm secrets upgrade my-release ./chart -f secrets.yaml
```

**Features:**
- SOPS integration
- Multiple backends (AWS KMS, GCP KMS, Azure Key Vault, PGP)
- Git-friendly (encrypted files in repo)
- Automatic decryption during install/upgrade

**Use cases:**
- Storing secrets in Git
- Multi-environment deployments
- Compliance requirements

**Repository:** [https://github.com/jkroepke/helm-secrets](https://github.com/jkroepke/helm-secrets)

---

### helm-git

**Install charts directly from Git repositories**

```bash
# Install
helm plugin install https://github.com/aslafy-z/helm-git

# Install from Git
helm install my-release git+https://github.com/user/repo@path/to/chart?ref=main

# With specific branch
helm install my-release git+https://github.com/user/repo@chart?ref=develop

# With tag
helm install my-release git+https://github.com/user/repo@chart?ref=v1.0.0

# SSH URL
helm install my-release git+ssh://git@github.com/user/repo@chart?ref=main
```

**Features:**
- Install from private repos
- Specify branch, tag, or commit
- SSH and HTTPS support
- No packaging required

**Use cases:**
- Development workflows
- Private chart repositories
- CI/CD pipelines

**Repository:** [https://github.com/aslafy-z/helm-git](https://github.com/aslafy-z/helm-git)

---

### helm-push

**Push charts to ChartMuseum or OCI registries**

```bash
# Install
helm plugin install https://github.com/chartmuseum/helm-push

# Add ChartMuseum repo
helm repo add chartmuseum http://chartmuseum.example.com

# Push chart
helm cm-push mychart/ chartmuseum

# Push with force
helm cm-push mychart/ chartmuseum --force

# Push specific version
helm cm-push mychart-0.1.0.tgz chartmuseum
```

**Features:**
- ChartMuseum integration
- Version management
- Authentication support
- CI/CD friendly

**Use cases:**
- Private chart repositories
- Chart distribution
- Release management

**Repository:** [https://github.com/chartmuseum/helm-push](https://github.com/chartmuseum/helm-push)

---

### helm-unittest

**Unit testing for Helm charts**

```bash
# Install
helm plugin install https://github.com/helm-unittest/helm-unittest

# Run tests
helm unittest ./mychart

# Run with color
helm unittest -c ./mychart

# Run specific test files
helm unittest -f 'tests/*_test.yaml' ./mychart

# Update snapshots
helm unittest -u ./mychart
```

**Test example:**
```yaml
# tests/deployment_test.yaml
suite: test deployment
templates:
  - deployment.yaml
tests:
  - it: should set replicas to 3
    set:
      replicaCount: 3
    asserts:
      - equal:
          path: spec.replicas
          value: 3

  - it: should have correct labels
    asserts:
      - isSubset:
          path: metadata.labels
          content:
            app.kubernetes.io/name: mychart
```

**Features:**
- Snapshot testing
- Assertion library
- Template validation
- CI/CD integration

**Use cases:**
- Chart development
- Regression testing
- CI pipelines

**Repository:** [https://github.com/helm-unittest/helm-unittest](https://github.com/helm-unittest/helm-unittest)

---

### helm-dashboard

**Web UI for Helm**

```bash
# Install
helm plugin install https://github.com/komodorio/helm-dashboard

# Start dashboard
helm dashboard

# Specify port
helm dashboard --port 8080

# No browser auto-open
helm dashboard --no-browser
```

**Features:**
- Visual release management
- Live cluster state
- Value editor
- Rollback UI
- Multi-cluster support

**Use cases:**
- Visual chart management
- Team collaboration
- Production debugging

**Repository:** [https://github.com/komodorio/helm-dashboard](https://github.com/komodorio/helm-dashboard)

---

### helm-s3

**Store charts in AWS S3**

```bash
# Install
helm plugin install https://github.com/hypnoglow/helm-s3

# Initialize S3 bucket
helm s3 init s3://my-helm-charts/stable

# Add S3 repo
helm repo add stable s3://my-helm-charts/stable/

# Push chart
helm s3 push mychart.tgz stable

# Reindex
helm s3 reindex stable
```

**Features:**
- S3 backend
- Private repositories
- Versioning
- Cost-effective

**Use cases:**
- Private chart storage
- AWS-based infrastructure
- Enterprise deployments

**Repository:** [https://github.com/hypnoglow/helm-s3](https://github.com/hypnoglow/helm-s3)

---

### helm-gcs

**Store charts in Google Cloud Storage**

```bash
# Install
helm plugin install https://github.com/hayorov/helm-gcs

# Initialize GCS bucket
helm gcs init gs://my-helm-charts

# Add GCS repo
helm repo add stable gs://my-helm-charts/

# Push chart
helm gcs push mychart.tgz stable
```

**Features:**
- GCS backend
- Private repositories
- IAM integration

**Repository:** [https://github.com/hayorov/helm-gcs](https://github.com/hayorov/helm-gcs)

---

### helm-monitor

**Monitor Helm releases with Prometheus**

```bash
# Install
helm plugin install https://github.com/ContainerSolutions/helm-monitor

# Monitor release
helm monitor prometheus my-release \
  --prometheus http://prometheus:9090

# Monitor with custom queries
helm monitor prometheus my-release \
  --prometheus http://prometheus:9090 \
  --query 'rate(http_requests_total[5m])'

# Auto-rollback on threshold
helm monitor prometheus my-release \
  --prometheus http://prometheus:9090 \
  --rollback-on-failure
```

**Features:**
- Prometheus integration
- Custom queries
- Auto-rollback
- Alert integration

**Repository:** [https://github.com/ContainerSolutions/helm-monitor](https://github.com/ContainerSolutions/helm-monitor)

---

### helm-schema-gen

**Generate values.schema.json from values.yaml**

```bash
# Install
helm plugin install https://github.com/karuppiah7890/helm-schema-gen

# Generate schema
helm schema-gen values.yaml > values.schema.json

# Validate values against schema
helm lint mychart/
```

**Features:**
- Automatic schema generation
- Values validation
- Documentation generation

**Repository:** [https://github.com/karuppiah7890/helm-schema-gen](https://github.com/karuppiah7890/helm-schema-gen)

---

### helm-docs

**Generate documentation from Helm charts**

```bash
# Install
helm plugin install https://github.com/norwoodj/helm-docs

# Generate docs
helm docs

# Custom template
helm docs --template-files=README.md.gotmpl

# Dry run
helm docs --dry-run
```

**Features:**
- Auto-generate README
- Table of values
- Template customization
- Pre-commit hook

**Repository:** [https://github.com/norwoodj/helm-docs](https://github.com/norwoodj/helm-docs)

---

## Finding More Plugins

- [Helm Plugins Index](https://helm.sh/docs/community/related/#helm-plugins)
- [Artifact Hub](https://artifacthub.io/packages/search?kind=13)
- [GitHub Topics: helm-plugin](https://github.com/topics/helm-plugin)

## Tags

`helm`, `plugins`, `kubernetes`, `k8s`, `tools`

---

*Last updated: 2025-10-30*
