# Google GKE

Best practices and patterns for running Kubernetes on Google Cloud with GKE.

## Overview

Google Kubernetes Engine (GKE) is a managed Kubernetes service with automated cluster management, scaling, and upgrades. Offers both Standard and Autopilot modes.

## Architecture

```mermaid
graph TB
    subgraph "Google Cloud Region"
        subgraph "GKE Control Plane (Google-Managed)"
            CP1[Multi-zone<br/>Masters + etcd]
        end

        API[Kubernetes API Server]
        CP1 --> API

        subgraph "Customer VPC"
            subgraph "GKE Standard"
                S1[Zone 1<br/>User-managed nodes]
                S2[Zone 2<br/>User-managed nodes]
                S3[Zone 3<br/>User-managed nodes]
            end

            subgraph "GKE Autopilot"
                A1[Fully managed<br/>Google handles everything]
            end
        end

        API --> S1
        API --> S2
        API --> S3
        API --> A1

        S1 -.-> GCP[GCP Services<br/>Cloud Storage, IAM<br/>Cloud Logging]
        S2 -.-> GCP
        S3 -.-> GCP
        A1 -.-> GCP
    end
```

## Cluster Modes

| Feature | Standard | Autopilot |
|---------|----------|-----------|
| **Node Management** | User-managed | Google-managed |
| **Scaling** | Manual/CA | Automatic |
| **Pricing** | Per node | Per pod resources |
| **Control** | Full | Limited |
| **Best For** | Custom configs | Minimal ops overhead |
| **Control Plane Cost** | $73/month | Free |

### Quick Start

| Mode | Command | Use Case |
|------|---------|----------|
| **Standard** | `gcloud container clusters create my-cluster --region us-central1 --num-nodes 3` | Need custom configuration |
| **Autopilot** | `gcloud container clusters create-auto my-cluster --region us-central1` | Want zero node management |

## Node Pools (Standard Mode)

| Type | Cost | Use Case | Configuration |
|------|------|----------|---------------|
| **Regular** | Standard pricing | Production workloads | Auto-repair, auto-upgrade |
| **Spot VMs** | 60-91% savings | Fault-tolerant jobs | Can be preempted |
| **TAU VMs** | Better price/perf | ARM-compatible workloads | T2A machine types |

## Workload Identity

Pod-level IAM permissions for secure GCP service access.

```mermaid
sequenceDiagram
    participant P as Pod
    participant KSA as K8s ServiceAccount
    participant WI as Workload Identity
    participant GSA as GCP ServiceAccount
    participant GCP as GCP Service

    P->>KSA: Uses annotated ServiceAccount
    KSA->>WI: Present K8s identity
    WI->>GSA: Map to GCP ServiceAccount
    GSA->>GCP: Access with IAM permissions
    GCP->>P: Access granted
```

| Step | Action | Command/Config |
|------|--------|----------------|
| 1. Enable | Enable Workload Identity | `--workload-pool=PROJECT_ID.svc.id.goog` |
| 2. Create K8s SA | Create ServiceAccount | `kubectl create serviceaccount my-ksa` |
| 3. Create GCP SA | Create GCP SA | `gcloud iam service-accounts create my-gsa` |
| 4. Grant Permissions | Assign IAM roles | `gcloud projects add-iam-policy-binding` |
| 5. Bind | Link accounts | Annotation: `iam.gke.io/gcp-service-account` |

## GCP Integration

```mermaid
mindmap
  root((GKE GCP<br/>Integration))
    Identity
      Workload Identity
      IAM
      Binary Authorization
    Storage
      Persistent Disk SSD/Balanced
      Filestore NFS
      Cloud Storage CSI
    Networking
      VPC-native
      Cloud Load Balancing
      Private Google Access
      GKE Ingress
    Observability
      Cloud Logging Auto
      Cloud Monitoring Auto
      Cloud Trace
      Error Reporting
```

## Storage Options

| Type | Provisioner | Use Case | Features |
|------|------------|----------|----------|
| **Persistent Disk (SSD)** | `pd.csi.storage.gke.io` | High-performance databases | Regional, expandable |
| **Persistent Disk (Balanced)** | `pd.csi.storage.gke.io` | General purpose | Cost-effective |
| **Filestore** | `filestore.csi.storage.gke.io` | Shared file storage (NFS) | Multi-pod read/write |
| **Cloud Storage** | `gcsfuse.csi.storage.gke.io` | Object storage | Massive scale |

## Load Balancing

| Type | Use Case | Annotation | Scope |
|------|----------|------------|-------|
| **GCE Ingress** | HTTP(S) traffic | `kubernetes.io/ingress.class: "gce"` | Global |
| **Internal LB** | Private services | `networking.gke.io/load-balancer-type: "Internal"` | Regional |
| **External LB** | Public services | Default Service type: LoadBalancer | Regional |
| **NEG** | Advanced routing | `cloud.google.com/neg: '{"ingress": true}'` | Global |

## Observability

### Cloud Operations (Built-in)

| Component | What It Does | Cost |
|-----------|-------------|------|
| **Cloud Logging** | Automatic pod/system logs | 50GB free/month |
| **Cloud Monitoring** | Metrics, dashboards, alerts | Free tier available |
| **Cloud Trace** | Distributed tracing | Pay per span |
| **Error Reporting** | Application error tracking | Free |

### Key Metrics

```mermaid
graph LR
    A[GKE Cluster] --> B[Node Metrics]
    A --> C[Pod Metrics]
    A --> D[Control Plane]

    B --> B1[CPU, Memory, Disk]
    C --> C1[Container Resources]
    D --> D1[API Server Health]

    B1 --> CM[Cloud Monitoring]
    C1 --> CM
    D1 --> CM
```

## Security

| Feature | Purpose | Benefit | Availability |
|---------|---------|---------|--------------|
| **Binary Authorization** | Only signed images run | Prevent untrusted code | Enable on cluster |
| **GKE Sandbox (gVisor)** | Isolated container runtime | Extra security layer | Use RuntimeClass |
| **Workload Identity** | Pod-level IAM | No node credentials | Recommended |
| **Network Policies** | Pod traffic control | Micro-segmentation | Native support |
| **Shielded GKE Nodes** | Secure boot, integrity | Rootkit protection | Enable on node pool |
| **Private Clusters** | No public IPs | Reduced attack surface | Create with --enable-private-nodes |

## Auto-Scaling

```mermaid
graph TD
    A[GKE Auto-Scaling] --> B[Horizontal Pod Autoscaler]
    A --> C[Vertical Pod Autoscaler]
    A --> D[Cluster Autoscaler]
    A --> E[Node Auto-Provisioning]

    B --> B1[Scale pod replicas<br/>based on metrics]
    C --> C1[Adjust pod<br/>resource requests]
    D --> D1[Add/remove nodes<br/>in node pools]
    E --> E1[Create new node pools<br/>automatically]

    style A fill:#4285f4,color:#fff
    style B fill:#34a853,color:#fff
    style C fill:#34a853,color:#fff
    style D fill:#fbbc04,color:#000
    style E fill:#ea4335,color:#fff
```

| Scaler | What It Scales | Trigger | Autopilot |
|--------|---------------|---------|-----------|
| **HPA** | Pod replicas | CPU/memory/custom metrics | ✅ Built-in |
| **VPA** | Pod resource requests | Historical usage | ✅ Built-in |
| **Cluster Autoscaler** | Node count in pool | Pending pods | ✅ Automatic |
| **Node Auto-Provisioning** | New node pool creation | Workload requirements | Standard only |

## Best Practices

| Category | Practice | Why |
|----------|----------|-----|
| **Cluster Type** | Use Autopilot | Zero node management, automatic scaling |
| **Identity** | Enable Workload Identity | Secure, pod-level GCP permissions |
| **Availability** | Regional clusters | HA across multiple zones |
| **Security** | Binary Authorization | Only trusted images |
| **Cost** | Spot VMs for batch | 60-91% savings |
| **Resources** | Set requests/limits | Better scheduling, cost allocation |
| **Network** | Enable Network Policies | Secure pod communication |
| **Updates** | Use release channels | Automatic K8s version management |

## Maintenance & Upgrades

| Aspect | Autopilot | Standard | Details |
|--------|-----------|----------|---------|
| **Control Plane** | Automatic | Automatic | No downtime |
| **Nodes** | Automatic | Configurable | Rolling updates |
| **Frequency** | Google-managed | Release channel | Rapid/Regular/Stable |
| **Maintenance Window** | Not needed | Optional | Configure off-peak hours |
| **Downtime** | None | None (rolling) | PodDisruptionBudgets respected |

## Cost Optimization

```mermaid
graph LR
    A[GKE Costs] --> B[Control Plane]
    A --> C[Nodes]
    A --> D[Storage]
    A --> E[Networking]

    B --> B1[Standard: $73/mo<br/>Autopilot: Free]
    C --> C1[Spot: 60-91% off<br/>Autopilot: Pay per pod]
    D --> D1[Use balanced PD<br/>Lifecycle policies]
    E --> E1[Use same-zone<br/>Minimize egress]

    style B1 fill:#90EE90
    style C1 fill:#90EE90
```

| Strategy | Savings | Implementation | Trade-off |
|----------|---------|----------------|-----------|
| **Use Autopilot** | 30%+ | Create with `create-auto` | Less control |
| **Spot VMs** | 60-91% | Add spot node pool | Preemptible |
| **Cluster Autoscaler** | 20-40% | Enable on node pool | None |
| **VPA** | 10-25% | Enable VPA | Requires monitoring period |
| **Committed Use** | Up to 57% | 1 or 3-year commitment | Long-term commitment |
| **Balanced PD** | 20% vs SSD | Use balanced disk type | Lower IOPS than SSD |

## Decision Guide

```mermaid
flowchart TD
    Start{Primary<br/>Cloud?}
    Start -->|GCP| Q1{Minimize<br/>operations?}
    Start -->|Other| Alt[Consider<br/>EKS/AKS]

    Q1 -->|Yes| GKE1[✅ GKE Autopilot]
    Q1 -->|No| Q2{Need custom<br/>configurations?}

    Q2 -->|Yes| GKE2[✅ GKE Standard]
    Q2 -->|No| GKE3[✅ GKE Autopilot]

    style GKE1 fill:#34a853,color:#fff
    style GKE2 fill:#4285f4,color:#fff
    style GKE3 fill:#34a853,color:#fff
    style Alt fill:#FFE4B5
```

### Choose GKE If

| Reason | Details |
|--------|---------|
| ✅ **GCP Ecosystem** | Using BigQuery, Cloud Storage, Pub/Sub, etc. |
| ✅ **Minimal Operations** | Want Autopilot (zero node management) |
| ✅ **Cost Efficiency** | Autopilot ~30% cheaper than standard |
| ✅ **Latest Features** | GKE gets new K8s features first |
| ✅ **Auto-Everything** | Auto-scaling, auto-repair, auto-upgrade |
| ✅ **Built-in Observability** | Cloud Operations automatically configured |

### Autopilot vs Standard

| Use Autopilot If | Use Standard If |
|------------------|-----------------|
| Want zero node management | Need custom node configurations |
| Prefer pay-per-pod pricing | Want full control over instances |
| Don't need privileged pods | Need Windows containers |
| Standard workloads | Need specific kernel modules |
| Cost optimization priority | Need GPUs with custom setup |

## Quick Reference

| Task | Autopilot | Standard |
|------|-----------|----------|
| **Create cluster** | `gcloud container clusters create-auto` | `gcloud container clusters create` |
| **Node management** | None | Configure node pools |
| **Scaling** | Automatic | Enable autoscaler |
| **Security** | Built-in best practices | Manual configuration |
| **Cost** | Per-pod + free control plane | Per-node + $73/mo control plane |

## Resources

- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [GKE Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)
- [Autopilot Overview](https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview)

## Tags

`gke`, `kubernetes`, `gcp`, `k8s`, `devops`, `cloud`, `google-cloud`

---

*Last updated: 2025-10-30*
