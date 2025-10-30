# Amazon EKS (Elastic Kubernetes Service)

Best practices and patterns for running Kubernetes on AWS with EKS.

## Overview

Amazon EKS is a managed Kubernetes service that makes it easy to run Kubernetes on AWS without needing to install and operate your own Kubernetes control plane.

## Creating an EKS Cluster

### Using eksctl (Recommended)

```bash
# Create basic cluster
eksctl create cluster \
  --name my-cluster \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3

# Create cluster with custom configuration
eksctl create cluster -f cluster.yaml
```

**cluster.yaml:**
```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: my-cluster
  region: us-west-2
  version: "1.28"

managedNodeGroups:
  - name: ng-1
    instanceType: t3.medium
    desiredCapacity: 3
    minSize: 2
    maxSize: 5
    volumeSize: 80
    ssh:
      allow: true
      publicKeyName: my-key

iam:
  withOIDC: true
```

### Using AWS CLI

```bash
# Create cluster
aws eks create-cluster \
  --name my-cluster \
  --role-arn arn:aws:iam::123456789012:role/eks-service-role \
  --resources-vpc-config subnetIds=subnet-xxx,subnet-yyy,securityGroupIds=sg-xxx

# Update kubeconfig
aws eks update-kubeconfig --name my-cluster --region us-west-2
```

## Node Groups

### Managed Node Groups

```bash
# Create managed node group
eksctl create nodegroup \
  --cluster=my-cluster \
  --region=us-west-2 \
  --name=ng-2 \
  --node-type=t3.large \
  --nodes=3 \
  --nodes-min=2 \
  --nodes-max=5 \
  --managed

# Scale node group
eksctl scale nodegroup \
  --cluster=my-cluster \
  --name=ng-1 \
  --nodes=5
```

### Auto Scaling

```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

## IAM for Service Accounts (IRSA)

```bash
# Create IAM OIDC provider
eksctl utils associate-iam-oidc-provider \
  --cluster=my-cluster \
  --approve

# Create service account with IAM role
eksctl create iamserviceaccount \
  --name my-service-account \
  --namespace default \
  --cluster my-cluster \
  --attach-policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess \
  --approve
```

## Storage

### EBS CSI Driver

```bash
# Install EBS CSI driver
kubectl apply -k "github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=release-1.25"
```

**StorageClass:**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-sc
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  encrypted: "true"
volumeBindingMode: WaitForFirstConsumer
```

### EFS CSI Driver

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: efs-sc
provisioner: efs.csi.aws.com
parameters:
  provisioningMode: efs-ap
  fileSystemId: fs-xxxxx
  directoryPerms: "700"
```

## Load Balancer

### AWS Load Balancer Controller

```bash
# Install AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

**Ingress with ALB:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-service
                port:
                  number: 80
```

## Monitoring & Logging

### CloudWatch Container Insights

```bash
# Install Container Insights
eksctl utils install-cloudwatch-insights \
  --cluster=my-cluster \
  --approve
```

### Prometheus & Grafana

```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Install kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace
```

## Security Best Practices

1. **Enable cluster encryption**
   - Encrypt secrets at rest
   - Use AWS KMS for encryption keys

2. **Network security**
   - Use private subnets for nodes
   - Restrict security group rules
   - Enable network policies

3. **IAM best practices**
   - Use IRSA for pod-level permissions
   - Follow least privilege principle
   - Avoid using node IAM roles for pods

4. **Pod security**
   - Use Pod Security Standards
   - Scan images for vulnerabilities
   - Use read-only root filesystems

5. **Audit logging**
   - Enable EKS control plane logging
   - Send logs to CloudWatch

## Cost Optimization

- Use Spot Instances for non-critical workloads
- Right-size node instance types
- Enable cluster autoscaler
- Use Fargate for serverless pods
- Monitor and optimize resource requests/limits

## Upgrading EKS

```bash
# Upgrade cluster control plane
eksctl upgrade cluster --name=my-cluster --approve

# Upgrade node groups
eksctl upgrade nodegroup \
  --name=ng-1 \
  --cluster=my-cluster \
  --kubernetes-version=1.28
```

## Tags

`eks`, `kubernetes`, `aws`, `k8s`, `devops`, `cloud`

---

*Last updated: 2025-10-30*
