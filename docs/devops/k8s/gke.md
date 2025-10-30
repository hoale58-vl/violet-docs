# Google GKE (Google Kubernetes Engine)

Best practices and patterns for running Kubernetes on Google Cloud with GKE.

## Overview

Google Kubernetes Engine (GKE) is a managed Kubernetes service on Google Cloud Platform, providing automated cluster management, scaling, and upgrades.

## Creating a GKE Cluster

### Standard Cluster

```bash
# Create basic cluster
gcloud container clusters create my-cluster \
  --region us-central1 \
  --num-nodes 3 \
  --machine-type n1-standard-2

# Create cluster with specific version
gcloud container clusters create my-cluster \
  --region us-central1 \
  --cluster-version 1.28 \
  --num-nodes 3

# Get cluster credentials
gcloud container clusters get-credentials my-cluster --region us-central1
```

### Autopilot Cluster (Recommended)

```bash
# Create Autopilot cluster
gcloud container clusters create-auto my-autopilot-cluster \
  --region us-central1

# Autopilot benefits:
# - Fully managed nodes
# - Automatic scaling
# - Built-in security
# - Pay per pod resource usage
```

### Advanced Configuration

```bash
gcloud container clusters create my-cluster \
  --region us-central1 \
  --machine-type n1-standard-4 \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-ip-alias \
  --network "my-vpc" \
  --subnetwork "my-subnet" \
  --enable-stackdriver-kubernetes \
  --enable-network-policy \
  --addons HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver
```

## Node Pools

### Managing Node Pools

```bash
# Create additional node pool
gcloud container node-pools create high-memory-pool \
  --cluster my-cluster \
  --region us-central1 \
  --machine-type n1-highmem-4 \
  --num-nodes 2 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 5

# Delete node pool
gcloud container node-pools delete high-memory-pool \
  --cluster my-cluster \
  --region us-central1

# List node pools
gcloud container node-pools list --cluster my-cluster --region us-central1
```

### Spot VMs (Preemptible Nodes)

```bash
gcloud container node-pools create spot-pool \
  --cluster my-cluster \
  --region us-central1 \
  --spot \
  --machine-type n1-standard-4 \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 0 \
  --max-nodes 10
```

## Workload Identity

Enable pod-level IAM permissions using Workload Identity:

```bash
# Enable Workload Identity on cluster
gcloud container clusters update my-cluster \
  --region us-central1 \
  --workload-pool=PROJECT_ID.svc.id.goog

# Create service account
kubectl create serviceaccount my-ksa -n default

# Create GCP service account
gcloud iam service-accounts create my-gsa

# Grant IAM permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member "serviceAccount:my-gsa@PROJECT_ID.iam.gserviceaccount.com" \
  --role "roles/storage.objectViewer"

# Bind accounts
gcloud iam service-accounts add-iam-policy-binding \
  my-gsa@PROJECT_ID.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:PROJECT_ID.svc.id.goog[default/my-ksa]"

# Annotate K8s service account
kubectl annotate serviceaccount my-ksa \
  iam.gke.io/gcp-service-account=my-gsa@PROJECT_ID.iam.gserviceaccount.com
```

**Using in Pod:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  serviceAccountName: my-ksa
  containers:
  - name: app
    image: google/cloud-sdk:slim
```

## Storage

### Persistent Disks

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: pd.csi.storage.gke.io
parameters:
  type: pd-ssd
  replication-type: regional-pd
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

### Filestore (NFS)

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: filestore
provisioner: filestore.csi.storage.gke.io
parameters:
  tier: standard
  network: default
volumeBindingMode: WaitForFirstConsumer
```

## Ingress & Load Balancing

### GCE Ingress (Default)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    kubernetes.io/ingress.class: "gce"
    kubernetes.io/ingress.global-static-ip-name: "my-static-ip"
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /*
        pathType: ImplementationSpecific
        backend:
          service:
            name: my-service
            port:
              number: 80
```

### Internal Load Balancer

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-internal-service
  annotations:
    networking.gke.io/load-balancer-type: "Internal"
spec:
  type: LoadBalancer
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 8080
```

## Monitoring & Logging

### Cloud Operations (formerly Stackdriver)

```bash
# Enable Cloud Operations on existing cluster
gcloud container clusters update my-cluster \
  --region us-central1 \
  --enable-cloud-logging \
  --enable-cloud-monitoring

# Cloud Logging is automatic
# View logs in Cloud Console or use gcloud
gcloud logging read "resource.type=k8s_container" --limit 50
```

### GKE Metrics

```bash
# View cluster metrics
gcloud container clusters describe my-cluster --region us-central1

# Get metrics using kubectl
kubectl top nodes
kubectl top pods
```

## Security Features

### Binary Authorization

```bash
# Enable Binary Authorization
gcloud container clusters update my-cluster \
  --region us-central1 \
  --enable-binauthz
```

### GKE Sandbox (gVisor)

```yaml
apiVersion: v1
kind: RuntimeClass
metadata:
  name: gvisor
handler: runsc
---
apiVersion: v1
kind: Pod
metadata:
  name: sandboxed-pod
spec:
  runtimeClassName: gvisor
  containers:
  - name: app
    image: nginx
```

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

## Auto-Scaling

### Cluster Autoscaler (enabled by default)

```bash
# Configure node pool autoscaling
gcloud container node-pools update default-pool \
  --cluster my-cluster \
  --region us-central1 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 10
```

### Vertical Pod Autoscaling

```bash
# Enable VPA
gcloud container clusters update my-cluster \
  --region us-central1 \
  --enable-vertical-pod-autoscaling
```

## GKE Best Practices

1. **Use Autopilot when possible** - Less operational overhead
2. **Enable Workload Identity** - Better security than node service accounts
3. **Use regional clusters** - High availability across zones
4. **Enable Binary Authorization** - Ensure only trusted images run
5. **Use Spot VMs for fault-tolerant workloads** - Cost savings
6. **Configure resource requests and limits** - Better bin packing
7. **Enable Network Policies** - Secure pod-to-pod communication
8. **Use release channels** - Automatic version management

## Maintenance & Upgrades

```bash
# Set maintenance window
gcloud container clusters update my-cluster \
  --region us-central1 \
  --maintenance-window-start 2025-11-01T00:00:00Z \
  --maintenance-window-end 2025-11-01T04:00:00Z \
  --maintenance-window-recurrence "FREQ=WEEKLY;BYDAY=SU"

# Manually upgrade cluster
gcloud container clusters upgrade my-cluster \
  --region us-central1 \
  --cluster-version 1.28
```

## Cost Optimization

- Use Autopilot for automatic resource optimization
- Use Spot VMs for non-critical workloads
- Enable cluster autoscaling
- Right-size your pods (use VPA recommendations)
- Use committed use discounts
- Clean up unused resources

## Tags

`gke`, `kubernetes`, `gcp`, `k8s`, `devops`, `cloud`, `google-cloud`

---

*Last updated: 2025-10-30*
