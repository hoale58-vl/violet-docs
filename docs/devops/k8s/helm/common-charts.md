# Popular Charts

Most used and popular Helm charts for common applications and services.

## Quick Reference Table

| Chart | Repository | Use Case |
|-------|------------|----------|
| 🗄️ [PostgreSQL](#postgresql) | [bitnami](https://charts.bitnami.com/bitnami) | Relational database |
| 🗄️ [MySQL](#mysql) | [bitnami](https://charts.bitnami.com/bitnami) | Relational database |
| 🗄️ [MongoDB](#mongodb) | [bitnami](https://charts.bitnami.com/bitnami) | NoSQL database |
| ⚡ [Redis](#redis) | [bitnami](https://charts.bitnami.com/bitnami) | In-memory cache |
| 📨 [RabbitMQ](#rabbitmq) | [bitnami](https://charts.bitnami.com/bitnami) | Message broker |
| 📨 [Kafka](#kafka) | [bitnami](https://charts.bitnami.com/bitnami) | Event streaming |
| 🌐 [NGINX Ingress](#nginx-ingress-controller) | [ingress-nginx](https://kubernetes.github.io/ingress-nginx) | Load balancer |
| 🌐 [Traefik](#traefik) | [traefik](https://traefik.github.io/charts) | Load balancer + routing |
| 📊 [Prometheus Stack](#prometheus-stack-kube-prometheus-stack) | [prometheus-community](https://prometheus-community.github.io/helm-charts) | Full monitoring |
| 📊 [Grafana](#grafana) | [grafana](https://grafana.github.io/helm-charts) | Dashboards |
| 📋 [Loki](#loki) | [grafana](https://grafana.github.io/helm-charts) | Log aggregation |
| 🔀 [Istio](#istio) | [istio](https://istio-release.storage.googleapis.com/charts) | Service mesh |
| 🔀 [Linkerd](#linkerd) | [linkerd](https://helm.linkerd.io/stable) | Lightweight service mesh |
| 🚀 [ArgoCD](#argocd) | [argo](https://argoproj.github.io/argo-helm) | GitOps CD |
| 🚀 [Jenkins](#jenkins) | [jenkins](https://charts.jenkins.io) | CI/CD platform |
| 🔒 [cert-manager](#cert-manager) | [jetstack](https://charts.jetstack.io) | TLS certificates |
| 💾 [Longhorn](#longhorn) | [longhorn](https://charts.longhorn.io) | Block storage |
| 💾 [MinIO](#minio) | [minio](https://charts.min.io/) | S3-compatible storage |
| 🔐 [Vault](#vault) | [hashicorp](https://helm.releases.hashicorp.com) | Secrets management |
| 🔐 [External Secrets](#external-secrets-operator) | [external-secrets](https://charts.external-secrets.io) | Secrets sync |
| 📝 [WordPress](#wordpress) | [bitnami](https://charts.bitnami.com/bitnami) | CMS platform |
| 📝 [Ghost](#ghost) | [bitnami](https://charts.bitnami.com/bitnami) | Blogging platform |
| ⚙️ [Knative](#knative) | Custom install | Serverless containers |
| ⚙️ [OpenFaaS](#openfaas) | [openfaas](https://openfaas.github.io/faas-netes/) | Serverless functions |

## Databases

### PostgreSQL

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-postgres bitnami/postgresql \
  --set auth.postgresPassword=password \
  --set auth.database=mydb
```

**Features:**
- High availability support
- Replication
- Metrics export
- Backup/restore

**Popular values:**
```yaml
auth:
  postgresPassword: "password"
  database: "mydb"
primary:
  persistence:
    enabled: true
    size: 8Gi
resources:
  requests:
    memory: 256Mi
    cpu: 250m
```

**Repository:** `https://charts.bitnami.com/bitnami`

---

### MySQL

```bash
helm install my-mysql bitnami/mysql \
  --set auth.rootPassword=password \
  --set auth.database=mydb
```

**Features:**
- Primary-replica replication
- Metrics export
- Custom configuration
- Backup support

**Popular values:**
```yaml
auth:
  rootPassword: "password"
  database: "mydb"
  username: "myuser"
  password: "mypass"
primary:
  persistence:
    size: 8Gi
```

---

### MongoDB

```bash
helm install my-mongodb bitnami/mongodb \
  --set auth.rootPassword=password \
  --set auth.database=mydb
```

**Features:**
- Replica set
- Sharding
- Metrics
- TLS support

---

### Redis

```bash
helm install my-redis bitnami/redis \
  --set auth.password=password
```

**Features:**
- Sentinel support
- Cluster mode
- Persistence
- Metrics

**Popular values:**
```yaml
auth:
  password: "password"
master:
  persistence:
    size: 8Gi
replica:
  replicaCount: 3
```

---

## Message Queues

### RabbitMQ

```bash
helm install my-rabbitmq bitnami/rabbitmq \
  --set auth.username=admin \
  --set auth.password=password
```

**Features:**
- High availability
- Metrics
- Plugins support
- Management UI

**Popular values:**
```yaml
auth:
  username: admin
  password: password
replicaCount: 3
persistence:
  size: 8Gi
```

---

### Kafka

```bash
helm install my-kafka bitnami/kafka
```

**Features:**
- Zookeeper integration
- Kraft mode (no Zookeeper)
- SASL/TLS
- Metrics

---

## Ingress Controllers

### NGINX Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install nginx-ingress ingress-nginx/ingress-nginx
```

**Features:**
- Load balancing
- SSL/TLS termination
- WebSocket support
- Rate limiting

**Popular values:**
```yaml
controller:
  replicaCount: 2
  service:
    type: LoadBalancer
  metrics:
    enabled: true
```

**Repository:** `https://kubernetes.github.io/ingress-nginx`

---

### Traefik

```bash
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik
```

**Features:**
- Automatic service discovery
- Let's Encrypt
- Middleware support
- Dashboard

**Repository:** `https://traefik.github.io/charts`

---

## Monitoring & Observability

### Prometheus Stack (kube-prometheus-stack)

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack
```

**Includes:**
- Prometheus
- Grafana
- Alertmanager
- Node exporter
- Kube-state-metrics
- Pre-configured dashboards

**Popular values:**
```yaml
prometheus:
  prometheusSpec:
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          resources:
            requests:
              storage: 50Gi

grafana:
  adminPassword: "password"
  persistence:
    enabled: true
    size: 10Gi
```

**Repository:** `https://prometheus-community.github.io/helm-charts`

---

### Grafana

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana \
  --set adminPassword=password
```

**Features:**
- Multiple data sources
- Dashboard provisioning
- Plugins support
- Alerting

**Repository:** `https://grafana.github.io/helm-charts`

---

### Loki

```bash
helm install loki grafana/loki-stack
```

**Features:**
- Log aggregation
- Grafana integration
- S3/GCS backend
- Multi-tenancy

---

## Service Mesh

### Istio

```bash
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm install istio-base istio/base -n istio-system --create-namespace
helm install istiod istio/istiod -n istio-system
```

**Features:**
- Traffic management
- Security (mTLS)
- Observability
- Policy enforcement

**Repository:** `https://istio-release.storage.googleapis.com/charts`

---

### Linkerd

```bash
helm repo add linkerd https://helm.linkerd.io/stable
helm install linkerd linkerd/linkerd2
```

**Features:**
- Lightweight
- mTLS by default
- Built-in metrics
- Simple deployment

**Repository:** `https://helm.linkerd.io/stable`

---

## CI/CD

### ArgoCD

```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace
```

**Features:**
- GitOps continuous delivery
- Multi-cluster support
- RBAC
- UI and CLI

**Repository:** `https://argoproj.github.io/argo-helm`

---

### Jenkins

```bash
helm repo add jenkins https://charts.jenkins.io
helm install jenkins jenkins/jenkins \
  --set controller.adminPassword=password
```

**Features:**
- Plugin ecosystem
- Pipeline as code
- Distributed builds
- Kubernetes agent support

**Repository:** `https://charts.jenkins.io`

---

## Certificate Management

### cert-manager

```bash
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

**Features:**
- Let's Encrypt integration
- Multiple issuers
- Automatic renewal
- ACME support

**Repository:** `https://charts.jetstack.io`

---

## Storage

### MinIO

```bash
helm repo add minio https://charts.min.io/
helm install minio minio/minio \
  --set rootUser=admin \
  --set rootPassword=password
```

**Features:**
- S3-compatible
- Distributed mode
- Erasure coding
- Encryption

**Repository:** `https://charts.min.io/`

---

### Longhorn

```bash
helm repo add longhorn https://charts.longhorn.io
helm install longhorn longhorn/longhorn \
  --namespace longhorn-system \
  --create-namespace
```

**Features:**
- Distributed block storage
- Snapshots
- Backups
- UI

**Repository:** `https://charts.longhorn.io`

---

## Application Platforms

### WordPress

```bash
helm install my-wordpress bitnami/wordpress \
  --set wordpressUsername=admin \
  --set wordpressPassword=password
```

**Features:**
- MariaDB included
- Persistence
- Ingress support
- Multi-site

---

### Ghost

```bash
helm install my-ghost bitnami/ghost \
  --set ghostPassword=password
```

**Features:**
- MySQL included
- Persistence
- Email configuration
- Themes support

---

## Security

### Vault

```bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault
```

**Features:**
- Secrets management
- High availability
- Auto-unseal
- Kubernetes auth

**Repository:** `https://helm.releases.hashicorp.com`

---

### External Secrets Operator

```bash
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets \
  external-secrets/external-secrets \
  -n external-secrets-system \
  --create-namespace
```

**Features:**
- Multiple backend support (AWS, GCP, Vault, etc.)
- Automatic secret sync
- ClusterSecretStore
- SecretStore

**Repository:** `https://charts.external-secrets.io`

---

## Serverless

### Knative

```bash
helm repo add knative https://knative.dev/serving/releases/download/knative-v1.11.0/serving-core.yaml
helm install knative-serving knative/knative-serving \
  --namespace knative-serving \
  --create-namespace
```

**Features:**
- Serverless containers
- Auto-scaling
- Traffic splitting
- Event-driven

---

### OpenFaaS

```bash
helm repo add openfaas https://openfaas.github.io/faas-netes/
helm install openfaas openfaas/openfaas \
  --namespace openfaas \
  --create-namespace
```

**Features:**
- Function marketplace
- Auto-scaling
- Metrics
- Multiple languages

**Repository:** `https://openfaas.github.io/faas-netes/`

---

## Tags

`helm`, `charts`, `kubernetes`, `k8s`, `applications`

---

*Last updated: 2025-10-30*
