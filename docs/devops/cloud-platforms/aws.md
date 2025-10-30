# AWS (Amazon Web Services)

Best practices and essential services for building on Amazon Web Services.

## Overview

AWS is the world's most comprehensive cloud platform, offering over 200 services for compute, storage, databases, networking, and more.

## Core Services

### Compute

#### EC2 (Elastic Compute Cloud)
```bash
# Launch instance
aws ec2 run-instances \
  --image-id ami-xxxxx \
  --instance-type t3.micro \
  --key-name my-key \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx

# List instances
aws ec2 describe-instances

# Stop instance
aws ec2 stop-instances --instance-ids i-xxxxx

# Start instance
aws ec2 start-instances --instance-ids i-xxxxx

# Terminate instance
aws ec2 terminate-instances --instance-ids i-xxxxx
```

#### Lambda (Serverless)
```bash
# Create function
aws lambda create-function \
  --function-name my-function \
  --runtime nodejs18.x \
  --role arn:aws:iam::123456789012:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip

# Invoke function
aws lambda invoke \
  --function-name my-function \
  --payload '{"key": "value"}' \
  response.json

# Update function code
aws lambda update-function-code \
  --function-name my-function \
  --zip-file fileb://function.zip
```

#### ECS (Elastic Container Service)
```bash
# Create cluster
aws ecs create-cluster --cluster-name my-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Run task
aws ecs run-task \
  --cluster my-cluster \
  --task-definition my-task:1 \
  --count 1
```

### Storage

#### S3 (Simple Storage Service)
```bash
# Create bucket
aws s3 mb s3://my-bucket

# Upload file
aws s3 cp file.txt s3://my-bucket/

# Download file
aws s3 cp s3://my-bucket/file.txt .

# Sync directory
aws s3 sync ./local-folder s3://my-bucket/

# List objects
aws s3 ls s3://my-bucket/

# Delete object
aws s3 rm s3://my-bucket/file.txt

# Delete bucket
aws s3 rb s3://my-bucket --force
```

**S3 Lifecycle Policy:**
```json
{
  "Rules": [{
    "Id": "Move to IA after 30 days",
    "Status": "Enabled",
    "Transitions": [{
      "Days": 30,
      "StorageClass": "STANDARD_IA"
    }, {
      "Days": 90,
      "StorageClass": "GLACIER"
    }]
  }]
}
```

#### EBS (Elastic Block Store)
```bash
# Create volume
aws ec2 create-volume \
  --availability-zone us-east-1a \
  --size 100 \
  --volume-type gp3

# Attach volume
aws ec2 attach-volume \
  --volume-id vol-xxxxx \
  --instance-id i-xxxxx \
  --device /dev/sdf
```

### Databases

#### RDS (Relational Database Service)
```bash
# Create DB instance
aws rds create-db-instance \
  --db-instance-identifier mydb \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password mypassword \
  --allocated-storage 20

# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier mydb \
  --db-snapshot-identifier mydb-snapshot
```

#### DynamoDB (NoSQL)
```bash
# Create table
aws dynamodb create-table \
  --table-name Users \
  --attribute-definitions \
    AttributeName=UserId,AttributeType=S \
  --key-schema \
    AttributeName=UserId,KeyType=HASH \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5

# Put item
aws dynamodb put-item \
  --table-name Users \
  --item '{"UserId": {"S": "user123"}, "Name": {"S": "John"}}'

# Get item
aws dynamodb get-item \
  --table-name Users \
  --key '{"UserId": {"S": "user123"}}'
```

### Networking

#### VPC (Virtual Private Cloud)
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create subnet
aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a

# Create internet gateway
aws ec2 create-internet-gateway

# Attach to VPC
aws ec2 attach-internet-gateway \
  --internet-gateway-id igw-xxxxx \
  --vpc-id vpc-xxxxx
```

#### Load Balancer
```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name my-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Create target group
aws elbv2 create-target-group \
  --name my-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxx
```

## IAM (Identity and Access Management)

### Users and Roles

```bash
# Create user
aws iam create-user --user-name john

# Create role
aws iam create-role \
  --role-name lambda-execution-role \
  --assume-role-policy-document file://trust-policy.json

# Attach policy to role
aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/AWSLambdaBasicExecutionRole

# Create access key
aws iam create-access-key --user-name john
```

**IAM Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:PutObject"
    ],
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
```

## CloudFormation (Infrastructure as Code)

**Basic Template:**
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: Simple EC2 instance

Parameters:
  KeyName:
    Type: AWS::EC2::KeyPair::KeyName
    Description: EC2 Key Pair

Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-xxxxx
      InstanceType: t3.micro
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: MyInstance

Outputs:
  InstanceId:
    Value: !Ref MyInstance
    Description: Instance ID
```

```bash
# Create stack
aws cloudformation create-stack \
  --stack-name my-stack \
  --template-body file://template.yaml \
  --parameters ParameterKey=KeyName,ParameterValue=my-key

# Update stack
aws cloudformation update-stack \
  --stack-name my-stack \
  --template-body file://template.yaml

# Delete stack
aws cloudformation delete-stack --stack-name my-stack
```

## CloudWatch (Monitoring)

```bash
# Put metric data
aws cloudwatch put-metric-data \
  --namespace MyApp \
  --metric-name Requests \
  --value 100

# Create alarm
aws cloudwatch put-metric-alarm \
  --alarm-name high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# View logs
aws logs tail /aws/lambda/my-function --follow
```

## AWS CLI Configuration

```bash
# Configure AWS CLI
aws configure

# Use profiles
aws configure --profile production
aws s3 ls --profile production

# Set default region
aws configure set region us-west-2

# Use environment variables
export AWS_ACCESS_KEY_ID=xxxxx
export AWS_SECRET_ACCESS_KEY=xxxxx
export AWS_DEFAULT_REGION=us-west-2
```

## Best Practices

### Security
1. **Enable MFA** for root and IAM users
2. **Use IAM roles** instead of access keys for EC2
3. **Encrypt data** at rest and in transit
4. **Use Security Groups** as firewalls
5. **Enable CloudTrail** for audit logging
6. **Use Secrets Manager** for credentials
7. **Regular security audits** with AWS Config

### Cost Optimization
1. **Use Reserved Instances** for predictable workloads
2. **Enable Auto Scaling** for variable loads
3. **Use Spot Instances** for fault-tolerant workloads
4. **Set up billing alerts** in CloudWatch
5. **Delete unused resources** regularly
6. **Use S3 lifecycle policies** for storage optimization
7. **Right-size instances** based on usage

### High Availability
1. **Multi-AZ deployments** for critical services
2. **Use Auto Scaling Groups** for EC2
3. **Configure RDS Multi-AZ** for databases
4. **Use Route 53** for DNS failover
5. **Implement health checks** for load balancers
6. **Regular backups** and disaster recovery testing

### Architecture Patterns

#### Serverless Web Application
```
CloudFront → API Gateway → Lambda → DynamoDB
                                  → S3 (static content)
```

#### Microservices on ECS
```
ALB → ECS Fargate Services → RDS/DynamoDB
                           → ElastiCache
```

#### Data Pipeline
```
S3 → Lambda → Kinesis → Lambda → Elasticsearch
                               → S3 (data lake)
```

## Common AWS Services Quick Reference

| Service | Purpose |
|---------|---------|
| EC2 | Virtual servers |
| Lambda | Serverless compute |
| S3 | Object storage |
| RDS | Managed relational databases |
| DynamoDB | NoSQL database |
| ECS/EKS | Container orchestration |
| VPC | Network isolation |
| Route 53 | DNS service |
| CloudFront | CDN |
| API Gateway | API management |
| SNS | Pub/sub messaging |
| SQS | Message queuing |
| CloudWatch | Monitoring and logs |
| IAM | Identity management |
| CloudFormation | Infrastructure as code |

## Useful Commands

```bash
# Get account ID
aws sts get-caller-identity

# List all regions
aws ec2 describe-regions --output table

# Find latest AMI
aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId'

# Cost estimate
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

## Tags

`aws`, `cloud`, `devops`, `infrastructure`, `amazon`

---

*Last updated: 2025-10-30*
