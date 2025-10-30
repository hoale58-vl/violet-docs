# Minikube

Local Kubernetes development environment for learning and testing.

## Overview

Minikube runs a single-node Kubernetes cluster on your local machine, perfect for development, testing, and learning Kubernetes without cloud costs.

## Installation

### macOS
```bash
brew install minikube
```

### Linux
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Windows
```powershell
choco install minikube
```

## Basic Usage

### Starting & Stopping

```bash
# Start Minikube
minikube start

# Start with specific Kubernetes version
minikube start --kubernetes-version=v1.28.0

# Start with more resources
minikube start --cpus=4 --memory=8192 --disk-size=50g

# Stop Minikube
minikube stop

# Delete cluster
minikube delete

# Pause cluster
minikube pause

# Unpause cluster
minikube unpause
```

### Cluster Management

```bash
# Check status
minikube status

# View dashboard
minikube dashboard

# Get cluster IP
minikube ip

# SSH into node
minikube ssh

# View logs
minikube logs
```

## Drivers

Minikube supports multiple drivers:

```bash
# Docker (recommended, default on most systems)
minikube start --driver=docker

# VirtualBox
minikube start --driver=virtualbox

# Hyper-V (Windows)
minikube start --driver=hyperv

# KVM2 (Linux)
minikube start --driver=kvm2

# Set default driver
minikube config set driver docker
```

## Addons

Minikube includes useful addons:

```bash
# List available addons
minikube addons list

# Enable addon
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard

# Disable addon
minikube addons disable ingress

# Common useful addons
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable storage-provisioner
minikube addons enable default-storageclass
```

## Docker Integration

### Use Minikube's Docker Daemon

```bash
# Configure shell to use Minikube's Docker
eval $(minikube docker-env)

# Now docker commands use Minikube's daemon
docker ps

# Build and use images directly
docker build -t myapp:latest .
kubectl run myapp --image=myapp:latest --image-pull-policy=Never

# Reset to normal Docker
eval $(minikube docker-env -u)
```

## Service Access

### Accessing Services

```bash
# Get service URL
minikube service myservice

# Get service URL without opening browser
minikube service myservice --url

# Access all services
minikube service list

# Port forwarding (alternative)
kubectl port-forward svc/myservice 8080:80
```

### LoadBalancer Services

```bash
# Minikube tunnel enables LoadBalancer services
minikube tunnel

# Now LoadBalancer services get external IPs
kubectl get svc
```

## Ingress

```bash
# Enable ingress addon
minikube addons enable ingress

# Verify ingress controller
kubectl get pods -n ingress-nginx
```

**Example Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: myapp.local
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

Add to `/etc/hosts`:
```
192.168.49.2  myapp.local
```

## Multi-Node Clusters

```bash
# Create multi-node cluster
minikube start --nodes 3

# Add node to existing cluster
minikube node add

# Delete specific node
minikube node delete <node-name>

# List nodes
minikube node list
```

## Profiles

Manage multiple clusters:

```bash
# Create cluster with profile
minikube start -p dev-cluster

# Create another cluster
minikube start -p prod-cluster

# List profiles
minikube profile list

# Switch profile
minikube profile dev-cluster

# Delete profile
minikube delete -p dev-cluster
```

## Storage

```bash
# Enable default storage class
minikube addons enable storage-provisioner
minikube addons enable default-storageclass

# Mount host directory
minikube mount /host/path:/minikube/path

# SSH and access mounted volumes
minikube ssh
```

**PersistentVolumeClaim example:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

## Resource Management

```bash
# Configure default resources
minikube config set cpus 4
minikube config set memory 8192

# View configuration
minikube config view

# Delete config setting
minikube config unset memory
```

## Troubleshooting

```bash
# View logs
minikube logs

# Check system status
minikube status

# Verify installation
minikube version
kubectl version

# SSH into node for debugging
minikube ssh

# Reset cluster (clean slate)
minikube delete
minikube start

# Check running containers
minikube ssh
docker ps
```

## Development Workflow

### Basic Workflow

```bash
# 1. Start Minikube
minikube start

# 2. Use Minikube's Docker
eval $(minikube docker-env)

# 3. Build your image
docker build -t myapp:dev .

# 4. Deploy to Kubernetes
kubectl apply -f k8s/

# 5. Access your service
minikube service myapp

# 6. Make changes and rebuild
docker build -t myapp:dev .
kubectl rollout restart deployment/myapp
```

### Live Reload with Skaffold

```bash
# Install Skaffold
brew install skaffold

# Initialize
skaffold init

# Continuous development
skaffold dev
```

## Performance Tips

1. **Use Docker driver** - Faster than VM-based drivers
2. **Allocate sufficient resources** - At least 4GB RAM
3. **Enable caching** - Image building is faster
4. **Use local images** - Avoid pulling from registry
5. **Disable unnecessary addons** - Reduces resource usage

## Common Issues

### VM Driver Issues
```bash
# Use Docker driver instead
minikube start --driver=docker
```

### Insufficient Resources
```bash
# Allocate more resources
minikube start --cpus=4 --memory=8192
```

### Networking Issues
```bash
# Restart Minikube
minikube stop
minikube start

# Or recreate
minikube delete
minikube start
```

## Useful Commands

```bash
# Quick cluster info
kubectl cluster-info

# View all resources
kubectl get all -A

# Resource usage
kubectl top nodes
kubectl top pods

# Minikube version
minikube version

# Update Minikube
brew upgrade minikube  # macOS
```

## Tags

`minikube`, `kubernetes`, `k8s`, `local-development`, `devops`, `docker`

---

*Last updated: 2025-10-30*
