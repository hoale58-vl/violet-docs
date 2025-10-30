# GCP (Google Cloud Platform)

Best practices and essential services for building on Google Cloud Platform.

## Overview

Google Cloud Platform is a suite of cloud computing services that runs on the same infrastructure that Google uses internally for products like Google Search, Gmail, and YouTube.

## Core Services

### Compute

#### Compute Engine (Virtual Machines)
```bash
# Create instance
gcloud compute instances create my-instance \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=debian-11 \
  --image-project=debian-cloud

# List instances
gcloud compute instances list

# SSH into instance
gcloud compute ssh my-instance --zone=us-central1-a

# Stop instance
gcloud compute instances stop my-instance --zone=us-central1-a

# Delete instance
gcloud compute instances delete my-instance --zone=us-central1-a
```

#### Cloud Functions (Serverless)
```bash
# Deploy function
gcloud functions deploy my-function \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point handler

# Invoke function
gcloud functions call my-function \
  --data '{"name":"World"}'

# View logs
gcloud functions logs read my-function
```

#### Cloud Run (Containers)
```bash
# Deploy container
gcloud run deploy my-service \
  --image gcr.io/my-project/my-image:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Update service
gcloud run services update my-service \
  --region us-central1 \
  --set-env-vars "ENV=production"

# Delete service
gcloud run services delete my-service --region us-central1
```

### Storage

#### Cloud Storage (Object Storage)
```bash
# Create bucket
gsutil mb gs://my-bucket

# Upload file
gsutil cp file.txt gs://my-bucket/

# Download file
gsutil cp gs://my-bucket/file.txt .

# Sync directory
gsutil rsync -r ./local-folder gs://my-bucket/

# List objects
gsutil ls gs://my-bucket/

# Delete object
gsutil rm gs://my-bucket/file.txt

# Make public
gsutil iam ch allUsers:objectViewer gs://my-bucket

# Set lifecycle policy
gsutil lifecycle set lifecycle.json gs://my-bucket
```

**Lifecycle Policy (lifecycle.json):**
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
        "condition": {"age": 30}
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {"age": 90}
      },
      {
        "action": {"type": "Delete"},
        "condition": {"age": 365}
      }
    ]
  }
}
```

#### Persistent Disks
```bash
# Create disk
gcloud compute disks create my-disk \
  --size 100GB \
  --type pd-ssd \
  --zone us-central1-a

# Attach disk to instance
gcloud compute instances attach-disk my-instance \
  --disk my-disk \
  --zone us-central1-a
```

### Databases

#### Cloud SQL
```bash
# Create PostgreSQL instance
gcloud sql instances create my-postgres \
  --database-version POSTGRES_14 \
  --tier db-f1-micro \
  --region us-central1

# Create database
gcloud sql databases create mydb --instance my-postgres

# Create user
gcloud sql users create myuser \
  --instance my-postgres \
  --password mypassword

# Connect to instance
gcloud sql connect my-postgres --user=myuser
```

#### Firestore (NoSQL)
```bash
# Create Firestore database (via console or API)

# Using gcloud
gcloud firestore databases create --location=us-central
```

**Firestore SDK Example (Node.js):**
```javascript
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Add document
await db.collection('users').doc('user123').set({
  name: 'John Doe',
  email: 'john@example.com'
});

// Get document
const doc = await db.collection('users').doc('user123').get();
console.log(doc.data());
```

#### BigQuery (Data Warehouse)
```bash
# Create dataset
bq mk my_dataset

# Load data
bq load \
  --source_format=CSV \
  my_dataset.my_table \
  gs://my-bucket/data.csv \
  schema.json

# Query data
bq query --use_legacy_sql=false \
  'SELECT * FROM my_dataset.my_table LIMIT 10'
```

### Networking

#### VPC (Virtual Private Cloud)
```bash
# Create VPC
gcloud compute networks create my-vpc \
  --subnet-mode custom

# Create subnet
gcloud compute networks subnets create my-subnet \
  --network my-vpc \
  --region us-central1 \
  --range 10.0.0.0/24

# Create firewall rule
gcloud compute firewall-rules create allow-http \
  --network my-vpc \
  --allow tcp:80,tcp:443 \
  --source-ranges 0.0.0.0/0
```

#### Load Balancing
```bash
# Create backend service
gcloud compute backend-services create my-backend \
  --protocol HTTP \
  --global

# Create URL map
gcloud compute url-maps create my-url-map \
  --default-service my-backend

# Create HTTP proxy
gcloud compute target-http-proxies create my-http-proxy \
  --url-map my-url-map

# Create forwarding rule
gcloud compute forwarding-rules create my-http-rule \
  --global \
  --target-http-proxy my-http-proxy \
  --ports 80
```

## IAM (Identity and Access Management)

### Service Accounts

```bash
# Create service account
gcloud iam service-accounts create my-sa \
  --display-name "My Service Account"

# Grant role
gcloud projects add-iam-policy-binding my-project \
  --member serviceAccount:my-sa@my-project.iam.gserviceaccount.com \
  --role roles/storage.objectViewer

# Create key
gcloud iam service-accounts keys create key.json \
  --iam-account my-sa@my-project.iam.gserviceaccount.com

# Impersonate service account
gcloud auth activate-service-account --key-file key.json
```

### Custom Roles

```yaml
title: "Custom Role"
description: "Custom role with specific permissions"
stage: "GA"
includedPermissions:
- storage.buckets.get
- storage.objects.get
- storage.objects.list
```

```bash
# Create custom role
gcloud iam roles create customRole \
  --project my-project \
  --file role-definition.yaml
```

## Deployment Manager (Infrastructure as Code)

**Template (vm-template.yaml):**
```yaml
resources:
- name: my-vm
  type: compute.v1.instance
  properties:
    zone: us-central1-a
    machineType: zones/us-central1-a/machineTypes/e2-medium
    disks:
    - deviceName: boot
      boot: true
      autoDelete: true
      initializeParams:
        sourceImage: projects/debian-cloud/global/images/family/debian-11
    networkInterfaces:
    - network: global/networks/default
      accessConfigs:
      - name: External NAT
        type: ONE_TO_ONE_NAT
```

```bash
# Create deployment
gcloud deployment-manager deployments create my-deployment \
  --config vm-template.yaml

# Update deployment
gcloud deployment-manager deployments update my-deployment \
  --config vm-template.yaml

# Delete deployment
gcloud deployment-manager deployments delete my-deployment
```

## Cloud Monitoring (formerly Stackdriver)

```bash
# View metrics
gcloud monitoring time-series list \
  --filter metric.type="compute.googleapis.com/instance/cpu/utilization"

# Create alert policy (via console or API)

# View logs
gcloud logging read "resource.type=gce_instance" --limit 50

# Create log sink
gcloud logging sinks create my-sink \
  storage.googleapis.com/my-logs-bucket \
  --log-filter='resource.type="gce_instance"'
```

## gcloud CLI Configuration

```bash
# Initialize gcloud
gcloud init

# Login
gcloud auth login

# Set project
gcloud config set project my-project

# Set region
gcloud config set compute/region us-central1

# Set zone
gcloud config set compute/zone us-central1-a

# List configurations
gcloud config list

# Create configuration
gcloud config configurations create dev
gcloud config configurations activate dev

# Use service account
gcloud auth activate-service-account --key-file=key.json
```

## Best Practices

### Security
1. **Use Service Accounts** for applications
2. **Enable Cloud Armor** for DDoS protection
3. **Use VPC Service Controls** for data exfiltration protection
4. **Enable audit logging** with Cloud Logging
5. **Use Secret Manager** for credentials
6. **Implement least privilege** with IAM
7. **Enable Binary Authorization** for GKE

### Cost Optimization
1. **Use Committed Use Discounts** for predictable workloads
2. **Enable autoscaling** where possible
3. **Use Preemptible VMs** for fault-tolerant workloads
4. **Set up budget alerts** in Billing
5. **Use Cloud Storage lifecycle policies**
6. **Right-size instances** with Recommender
7. **Clean up unused resources** regularly

### High Availability
1. **Multi-regional deployments** for critical services
2. **Use Managed Instance Groups** with autoscaling
3. **Configure Cloud SQL with HA**
4. **Use Cloud Load Balancing** for distribution
5. **Implement health checks**
6. **Regular backups** and disaster recovery testing

## Architecture Patterns

#### Serverless Web Application
```
Cloud CDN → Cloud Load Balancer → Cloud Run → Firestore
                                            → Cloud Storage
```

#### Microservices on GKE
```
Cloud Load Balancer → GKE Services → Cloud SQL
                                   → Memorystore (Redis)
```

#### Data Pipeline
```
Pub/Sub → Dataflow → BigQuery
                   → Cloud Storage
```

## Common GCP Services Quick Reference

| Service | Purpose |
|---------|---------|
| Compute Engine | Virtual machines |
| Cloud Run | Serverless containers |
| Cloud Functions | Serverless functions |
| Cloud Storage | Object storage |
| Cloud SQL | Managed relational databases |
| Firestore | NoSQL document database |
| GKE | Kubernetes clusters |
| VPC | Network isolation |
| Cloud Load Balancing | Load distribution |
| Cloud CDN | Content delivery |
| Cloud Pub/Sub | Messaging |
| BigQuery | Data warehouse |
| Cloud Monitoring | Monitoring and alerting |
| Cloud Logging | Log management |
| IAM | Identity and access |

## Useful Commands

```bash
# Get project info
gcloud projects describe my-project

# List all regions
gcloud compute regions list

# List all zones
gcloud compute zones list

# Get billing info
gcloud billing accounts list

# List all services
gcloud services list

# Enable service
gcloud services enable container.googleapis.com

# View quotas
gcloud compute project-info describe --project my-project

# Cost estimation
# Use Cloud Pricing Calculator: cloud.google.com/products/calculator
```

## Cloud SDK Components

```bash
# List components
gcloud components list

# Install component
gcloud components install kubectl

# Update components
gcloud components update

# Common components:
# - kubectl: Kubernetes CLI
# - gsutil: Cloud Storage CLI
# - bq: BigQuery CLI
```

## Tags

`gcp`, `cloud`, `devops`, `infrastructure`, `google-cloud`

---

*Last updated: 2025-10-30*
