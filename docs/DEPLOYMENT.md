# PSS-nano Deployment Guide

Complete deployment guide for the PSS-nano airline platform on Google Kubernetes Engine (GKE).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Infrastructure Setup](#infrastructure-setup)
- [Kubernetes Cluster Setup](#kubernetes-cluster-setup)
- [Application Deployment](#application-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Observability](#monitoring--observability)
- [Security](#security)
- [Disaster Recovery](#disaster-recovery)

## Prerequisites

### Required Tools

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Install kubectl
gcloud components install kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Terraform
brew install terraform  # macOS
# or
sudo apt-get install terraform  # Linux

# Install Helmfile
brew install helmfile  # macOS

# Install Velero (for backups)
brew install velero  # macOS
```

### GCP Setup

```bash
# Authenticate
gcloud auth login

# Set project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  container.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  servicenetworking.googleapis.com \
  cloudkms.googleapis.com
```

## Infrastructure Setup

### 1. Terraform State Bucket

```bash
# Create GCS bucket for Terraform state
gsutil mb gs://pss-nano-terraform-state
gsutil versioning set on gs://pss-nano-terraform-state
```

### 2. Deploy Infrastructure

```bash
cd infrastructure/terraform/gke

# Initialize Terraform
terraform init

# Plan for development
terraform plan -var-file=environments/dev.tfvars

# Apply for development
terraform apply -var-file=environments/dev.tfvars

# For production
terraform apply -var-file=environments/prod.tfvars
```

### 3. Configure kubectl

```bash
# Get cluster credentials
gcloud container clusters get-credentials pss-nano-gke-prod \
  --region us-central1 \
  --project $PROJECT_ID

# Verify connection
kubectl cluster-info
kubectl get nodes
```

## Kubernetes Cluster Setup

### 1. Create Namespaces

```bash
# Create namespaces
kubectl apply -f infrastructure/kubernetes/namespace.yaml

# Create additional namespaces
kubectl create namespace monitoring
kubectl create namespace istio-system
kubectl create namespace argocd
kubectl create namespace ingress-nginx
kubectl create namespace cert-manager
```

### 2. Install Core Infrastructure

```bash
# Install using Helmfile
cd helm
helmfile sync

# Or install individually:

# Cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --values infrastructure/cert-manager/values.yaml

# Ingress NGINX
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --values infrastructure/ingress-nginx/values.yaml

# Istio
helm install istio-base istio/base \
  --namespace istio-system \
  --create-namespace

helm install istiod istio/istiod \
  --namespace istio-system \
  --values infrastructure/istio/values.yaml
```

### 3. Configure SSL Certificates

```bash
# Create cluster issuers
kubectl apply -f infrastructure/kubernetes/cert-manager/cluster-issuer.yaml

# Verify certificates
kubectl get certificates -n pss-nano
kubectl get clusterissuers
```

### 4. Deploy Monitoring Stack

```bash
# Prometheus & Grafana
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values infrastructure/monitoring/prometheus/values.yaml

# Loki
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --values infrastructure/monitoring/loki/values.yaml

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Open http://localhost:3000
```

## Application Deployment

### 1. Build Docker Images

```bash
# Build all services
./docker/build-all.sh v1.0.0 gcr.io/$PROJECT_ID

# Or build individual service
docker build -t gcr.io/$PROJECT_ID/api-gateway:v1.0.0 \
  -f services/api-gateway/Dockerfile .

# Push to registry
docker push gcr.io/$PROJECT_ID/api-gateway:v1.0.0
```

### 2. Deploy Infrastructure Services

```bash
# Redis
helm install redis bitnami/redis \
  --namespace pss-nano \
  --values helm/infrastructure/redis/values.yaml \
  --values helm/infrastructure/redis/values-prod.yaml

# RabbitMQ
helm install rabbitmq bitnami/rabbitmq \
  --namespace pss-nano \
  --values helm/infrastructure/rabbitmq/values.yaml \
  --values helm/infrastructure/rabbitmq/values-prod.yaml
```

### 3. Deploy Microservices

```bash
# API Gateway
helm install api-gateway helm/api-gateway \
  --namespace pss-nano \
  --values helm/api-gateway/values-prod.yaml

# All microservices via Helmfile
helmfile -f helm/helmfile.yaml \
  --environment prod \
  sync
```

### 4. Configure Istio

```bash
# Apply Istio configurations
kubectl apply -f infrastructure/kubernetes/istio/

# Verify
kubectl get gateway,virtualservice,destinationrule -n pss-nano
```

## CI/CD Pipeline

### 1. GitHub Secrets Setup

Required secrets in GitHub repository:

```
GCP_PROJECT_ID: your-project-id
GCP_SA_KEY: <service-account-json>
COSIGN_KEY: <cosign-private-key>
SLACK_WEBHOOK_URL: <slack-webhook>
```

### 2. Deploy Service Account for CI/CD

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/container.developer"

# Create key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

### 3. Pipeline Workflow

**Pull Request Flow:**
1. Code pushed to PR
2. Lint & Tests run
3. Docker images built
4. Security scanning (Trivy)
5. Preview environment deployed
6. E2E tests run

**Production Deployment:**
1. Merge to main
2. Full test suite runs
3. Production images built
4. Deploy to staging
5. Manual approval gate
6. Canary deployment (10%)
7. Gradual rollout to 100%
8. Automatic rollback on failure

## Monitoring & Observability

### Access Dashboards

```bash
# Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# http://localhost:3000

# Prometheus
kubectl port-forward -n monitoring svc/prometheus-prometheus 9090:9090
# http://localhost:9090

# ArgoCD
kubectl port-forward -n argocd svc/argocd-server 8080:443
# https://localhost:8080

# Kiali (Istio)
istioctl dashboard kiali
```

### Key Metrics

- **Request Rate**: `rate(http_requests_total[5m])`
- **Error Rate**: `rate(http_requests_total{status=~"5.."}[5m])`
- **Latency**: `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))`
- **Saturation**: `container_memory_usage_bytes / container_spec_memory_limit_bytes`

## Security

### 1. RBAC Configuration

```bash
# Apply RBAC policies
kubectl apply -f infrastructure/kubernetes/security/rbac.yaml
```

### 2. Network Policies

```bash
# Apply network policies
kubectl apply -f infrastructure/kubernetes/security/network-policies.yaml

# Verify
kubectl get networkpolicies -n pss-nano
```

### 3. Pod Security

```bash
# Apply pod security policies
kubectl apply -f infrastructure/kubernetes/security/pod-security.yaml
```

### 4. Secrets Management

```bash
# Create secrets
kubectl create secret generic pss-nano-db-secret \
  --from-literal=username=airlineops \
  --from-literal=password=<strong-password> \
  -n pss-nano

# Or use Google Secret Manager
gcloud secrets create db-password --data-file=-
```

## Disaster Recovery

### 1. Velero Setup

```bash
# Install Velero
helm install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  --values infrastructure/kubernetes/backup/velero-values.yaml
```

### 2. Backup Procedures

```bash
# Manual backup
./infrastructure/kubernetes/backup/backup-script.sh production-backup

# Scheduled backups are configured in velero-values.yaml
# - Daily: 2 AM, retention 30 days
# - Weekly: Sunday 3 AM, retention 90 days

# List backups
velero backup get

# Backup details
velero backup describe production-backup
```

### 3. Restore Procedures

```bash
# Restore from backup
velero restore create --from-backup production-backup

# Restore specific namespace
velero restore create --from-backup production-backup \
  --include-namespaces pss-nano

# Monitor restore
velero restore get
velero restore describe <restore-name>
```

### 4. Database Backup

Cloud SQL automatically backs up daily. For point-in-time recovery:

```bash
# List backups
gcloud sql backups list --instance=pss-nano-postgres-prod

# Restore to point in time
gcloud sql backups restore <backup-id> \
  --backup-instance=pss-nano-postgres-prod \
  --backup-project=$PROJECT_ID
```

## Rollback Procedures

### Application Rollback

```bash
# Helm rollback
helm rollback api-gateway -n pss-nano

# Kubectl rollback
kubectl rollout undo deployment/api-gateway -n pss-nano

# Rollback to specific revision
kubectl rollout undo deployment/api-gateway --to-revision=2 -n pss-nano
```

### ArgoCD Rollback

```bash
# Via CLI
argocd app rollback pss-nano-production

# Via UI
# Navigate to ArgoCD UI -> Application -> History -> Rollback
```

## Scaling

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment api-gateway --replicas=10 -n pss-nano

# Scale node pool
gcloud container clusters resize pss-nano-gke-prod \
  --node-pool api-pool \
  --num-nodes 5 \
  --region us-central1
```

### Auto-scaling

HPA is configured per service. To adjust:

```yaml
# helm/api-gateway/values.yaml
autoscaling:
  minReplicas: 5
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n pss-nano
kubectl describe pod <pod-name> -n pss-nano
kubectl logs <pod-name> -n pss-nano --tail=100
```

### Debug Networking

```bash
# Check services
kubectl get svc -n pss-nano

# Check ingress
kubectl get ingress -n pss-nano
kubectl describe ingress api-gateway -n pss-nano

# Test connectivity
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- /bin/bash
```

### Check Istio

```bash
# Proxy status
istioctl proxy-status

# Analyze configuration
istioctl analyze -n pss-nano

# Check mTLS
istioctl authn tls-check <pod-name>.<namespace>
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/pss-nano/pss-nano/issues
- Documentation: https://docs.pss-nano.com
- Slack: #pss-nano-support
