# Amazon EKS

Best practices and patterns for running Kubernetes on AWS with EKS.

## Overview

Amazon EKS is a managed Kubernetes service that runs the control plane across multiple AWS Availability Zones, automatically handles node health, and provides on-demand upgrades.

## Architecture

```mermaid
graph TB
    subgraph "AWS Region"
        subgraph "EKS Control Plane (AWS-Managed)"
            A1[AZ 1<br/>Master + etcd]
            A2[AZ 2<br/>Master + etcd]
            A3[AZ 3<br/>Master + etcd]
        end

        API[Kubernetes API Server]
        A1 -.-> API
        A2 -.-> API
        A3 -.-> API

        subgraph "Customer VPC"
            subgraph "AZ 1"
                N1[Worker Nodes<br/>EC2/Fargate]
            end
            subgraph "AZ 2"
                N2[Worker Nodes<br/>EC2/Fargate]
            end
            subgraph "AZ 3"
                N3[Worker Nodes<br/>EC2/Fargate]
            end
        end

        API --> N1
        API --> N2
        API --> N3

        N1 -.-> AWS[AWS Services<br/>IAM, EBS, EFS<br/>ALB, CloudWatch]
        N2 -.-> AWS
        N3 -.-> AWS
    end
```

### Key Components

| Layer | Components | Management | Details |
|-------|-----------|------------|---------|
| **Control Plane** | API Server, etcd, Scheduler, Controller Manager | AWS-Managed | HA across 3 AZs, Auto-scaling, Auto-updates |
| **Data Plane** | Worker Nodes (EC2), Fargate Pods | Customer-Managed | Runs in customer VPC, Connects via API |
| **Networking** | VPC CNI, Security Groups, Load Balancers | Shared | VPC IPs for pods, Pod/node security, ALB/NLB |

## Node Options

| Type | Management | Updates | Best For | Cost Model |
|------|-----------|---------|----------|-----------|
| **Managed Node Groups** | AWS-managed | Automatic | Most use cases | EC2 pricing |
| **Self-Managed Nodes** | Customer-managed | Manual | Custom configs, AMIs | EC2 pricing |
| **Fargate** | AWS-managed | Automatic | Batch jobs, sporadic workloads | Per pod/vCPU/memory |

## AWS Integration

```mermaid
mindmap
  root((EKS AWS<br/>Integration))
    Identity & Security
      IRSA Pod IAM
      KMS Encryption
      Security Groups
      GuardDuty
    Storage
      EBS CSI
      EFS CSI
      FSx Lustre
      Snapshots
    Networking
      VPC CNI
      ALB Controller
      NLB Support
      App Mesh
      PrivateLink
    Observability
      Container Insights
      CloudWatch Logs
      X-Ray Tracing
      CloudTrail Audit
```

### IRSA (IAM Roles for Service Accounts)

```mermaid
sequenceDiagram
    participant P as Pod
    participant SA as ServiceAccount
    participant OIDC as OIDC Provider
    participant IAM as IAM Role
    participant AWS as AWS Service

    P->>SA: Uses K8s ServiceAccount
    SA->>OIDC: Presents JWT token
    OIDC->>IAM: Authenticates & assumes role
    IAM->>AWS: Grants permissions
    AWS->>P: Access granted
```

| Feature | IRSA | Node IAM Role |
|---------|------|---------------|
| **Scope** | Per-pod | All pods on node |
| **Security** | ✅ Fine-grained | ⚠️ Over-privileged |
| **Audit** | ✅ Per-pod CloudTrail | ⚠️ Node-level only |
| **Best Practice** | ✅ Recommended | ❌ Avoid for pods |

## Best Practices

### Security

| Category | Practice | Implementation |
|----------|----------|----------------|
| **Identity** | Use IRSA | One IAM role per ServiceAccount, least privilege |
| **Encryption** | Enable KMS | Secrets encryption, envelope encryption for etcd |
| **Network** | Private endpoints | Private API, Security Groups for pods, Network Policies |
| **Images** | ECR scanning | Private repos, admission controllers, image signing |
| **Audit** | Control plane logs | Enable all log types → CloudWatch Logs |

### High Availability

| Component | Strategy | Details |
|-----------|----------|---------|
| **Nodes** | Multi-AZ | 3+ AZs, multiple node groups, pod anti-affinity |
| **Workloads** | PodDisruptionBudgets | Define min available replicas |
| **Scaling** | HPA + Cluster Autoscaler | Or use Karpenter for advanced needs |
| **Health** | Probes | Liveness, readiness, startup probes |

### Performance

| Area | Optimization | Options |
|------|-------------|---------|
| **Instances** | Right-size | Compute-optimized (CPU), memory-optimized, Graviton (ARM) |
| **Placement** | Pod scheduling | Node selectors, taints/tolerations, topology spread |
| **Resources** | Limits & quotas | Requests/limits, LimitRanges, ResourceQuotas |
| **Networking** | VPC CNI optimization | Latest version, prefix delegation, ENI trunking, Nitro instances |

## Cost Optimization

### Pricing Overview

| Component | Cost | Strategy |
|-----------|------|----------|
| **Control Plane** | ~$73/month | Share clusters across teams |
| **Nodes** | EC2 pricing | Spot, Graviton, right-sizing |
| **Storage** | EBS/EFS pricing | Use gp3, lifecycle policies |
| **Data Transfer** | Standard AWS rates | Same-AZ communication |

### Node Cost Strategies

```mermaid
graph LR
    A[Node Costs] --> B[Spot Instances<br/>70-90% savings]
    A --> C[Graviton ARM<br/>20% better $/perf]
    A --> D[Reserved/Savings<br/>Up to 72% off]
    A --> E[Right-sizing<br/>Monitor usage]

    style B fill:#90EE90
    style C fill:#90EE90
    style D fill:#FFE4B5
    style E fill:#87CEEB
```

| Strategy | Savings | Best For | Trade-off |
|----------|---------|----------|-----------|
| **Spot Instances** | 70-90% | Fault-tolerant workloads | Can be interrupted |
| **Graviton (ARM)** | 20% | Most workloads | Limited legacy app support |
| **Reserved Instances** | Up to 72% | Predictable workloads | 1-3 year commitment |
| **Savings Plans** | Up to 72% | Flexible workloads | Commitment, can change types |
| **Right-sizing** | 20-40% | All workloads | Requires monitoring |

### Auto-Scaling Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Cluster Autoscaler** | Adjust node count | Standard use cases |
| **Karpenter** | Advanced provisioning | Complex requirements, better consolidation |
| **HPA** | Scale pods | Application-level scaling |
| **VPA** | Right-size pods | Optimize resource requests |

### Quick Wins

| Action | Impact | Effort |
|--------|--------|--------|
| Switch gp2 → gp3 | 20% storage savings | ⭐ Low |
| Enable Cluster Autoscaler | 20-40% node savings | ⭐⭐ Medium |
| Use Spot for dev/test | 70-90% savings | ⭐⭐ Medium |
| Add Graviton nodes | 20% compute savings | ⭐⭐⭐ High |
| Implement Kubecost | Visibility + 15-30% | ⭐⭐ Medium |

## Upgrade Strategy

| Phase | Steps | Downtime | Automation |
|-------|-------|----------|------------|
| **Control Plane** | Review changelog → Test → Upgrade (1 version at a time) | None | AWS-managed |
| **Nodes** | Update AMI → Launch new → Drain old → Delete old | Rolling | Managed node groups |
| **Frequency** | Every ~3 months | Plan quarterly | Stay within N-2 versions |
| **Support** | 14 months per version | Regular updates critical | Use maintenance windows |

## Operations

### Observability Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| **Metrics** | Container Insights, Prometheus | Resource usage, performance |
| **Logs** | CloudWatch Logs, FluentBit | Debugging, audit trail |
| **Tracing** | X-Ray | Distributed request tracing |
| **Alerts** | CloudWatch Alarms | Proactive issue detection |

### Disaster Recovery

| Strategy | Tool/Method | Frequency |
|----------|-------------|-----------|
| **Backup** | Velero | Daily/weekly |
| **Multi-region** | Terraform, GitOps | Continuous |
| **Runbooks** | Documentation | As needed |
| **Testing** | DR drills | Quarterly |

## Common Patterns

```mermaid
graph LR
    subgraph "Microservices"
        Internet --> ALB
        ALB --> Ingress
        Ingress --> Services
        Services --> Pods
        Pods --> DB[(RDS/DynamoDB)]
    end

    subgraph "Batch Processing"
        EventBridge --> Lambda
        Lambda --> Fargate[EKS Fargate]
        Fargate --> S3[(S3/Data Lake)]
    end

    subgraph "CI/CD"
        GitHub --> CodeBuild
        CodeBuild --> ECR
        ECR --> ArgoCD
        ArgoCD --> EKS[EKS Cluster]
    end
```

## Quick Wins vs Common Pitfalls

| ✅ Do This | ❌ Avoid This |
|-----------|--------------|
| Enable IRSA immediately | Using node IAM roles for pods |
| Use gp3 volumes | Over-provisioning nodes |
| Enable Container Insights | Running nodes in public subnets |
| Implement autoscaling | Ignoring IP address planning |
| Set resource limits | Skipping regular upgrades |
| Enable control plane logs | Not implementing PodDisruptionBudgets |

## Decision Guide

```mermaid
flowchart TD
    Start{Primary<br/>Cloud?}
    Start -->|AWS| Q1{Need deep<br/>AWS integration?}
    Start -->|Other| Alt[Consider<br/>GKE/AKS]

    Q1 -->|Yes| EKS1[✅ Choose EKS]
    Q1 -->|No| Q2{Want minimal<br/>ops overhead?}

    Q2 -->|Yes| Alt2[Consider<br/>GKE Autopilot]
    Q2 -->|No| EKS2[✅ EKS works well]

    style EKS1 fill:#90EE90
    style EKS2 fill:#90EE90
    style Alt fill:#FFE4B5
    style Alt2 fill:#FFE4B5
```

### Choose EKS If

| Reason | Details |
|--------|---------|
| ✅ **AWS Ecosystem** | Using RDS, DynamoDB, S3, Lambda, etc. |
| ✅ **AWS Compliance** | Need AWS certifications (HIPAA, PCI-DSS, etc.) |
| ✅ **Enterprise Support** | Want AWS support for entire stack |
| ✅ **Multi-region AWS** | Planning global AWS deployment |
| ✅ **ECS Migration** | Moving from ECS or using both |

## Resources

- [EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/)
- [EKS Workshop](https://eksworkshop.com/)
- [AWS Documentation](https://docs.aws.amazon.com/eks/)

## Tags

`eks`, `kubernetes`, `aws`, `k8s`, `cloud`, `managed-kubernetes`

---

*Last updated: 2025-10-30*
