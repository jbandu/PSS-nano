# PSS-nano Kubernetes & CI/CD Complete Guide

Comprehensive guide for the complete Kubernetes and CI/CD infrastructure.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Google Cloud Platform                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                  GKE Cluster (Multi-Zone)                      ││
│  │                                                                 ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     ││
│  │  │   API Pool    │  │  Worker Pool  │  │  Cache Pool   │     ││
│  │  │   (3-10)      │  │    (2-10)     │  │    (3-6)      │     ││
│  │  │ n2-standard-4 │  │ n2-standard-4 │  │ n2-highmem-4  │     ││
│  │  └───────────────┘  └───────────────┘  └───────────────┘     ││
│  │                                                                 ││
│  │  ┌─────────────────────────────────────────────────────────┐  ││
│  │  │                  Istio Service Mesh                      │  ││
│  │  │  ┌──────────┐   ┌──────────┐   ┌──────────┐           │  ││
│  │  │  │  Ingress │──▶│ API GW   │──▶│ Services │           │  ││
│  │  │  │ Gateway  │   │   (5)    │   │  (2-3)   │           │  ││
│  │  │  └──────────┘   └──────────┘   └──────────┘           │  ││
│  │  │      │                                                   │  ││
│  │  │      └──▶ mTLS, Circuit Breaking, Retries              │  ││
│  │  └─────────────────────────────────────────────────────────┘  ││
│  │                                                                 ││
│  │  ┌─────────────────────────────────────────────────────────┐  ││
│  │  │              Infrastructure Services                     │  ││
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │  ││
│  │  │  │  Redis   │  │ RabbitMQ │  │   Cloud  │             │  ││
│  │  │  │ Cluster  │  │ Cluster  │  │    SQL   │             │  ││
│  │  │  │  (3+3)   │  │   (3)    │  │ (Regional)│            │  ││
│  │  │  └──────────┘  └──────────┘  └──────────┘             │  ││
│  │  └─────────────────────────────────────────────────────────┘  ││
│  │                                                                 ││
│  │  ┌─────────────────────────────────────────────────────────┐  ││
│  │  │         Observability Stack (monitoring ns)             │  ││
│  │  │  ┌───────────┐  ┌─────────┐  ┌──────────┐             │  ││
│  │  │  │Prometheus │  │ Grafana │  │   Loki   │             │  ││
│  │  │  │    (2)    │  │   (2)   │  │   (2)    │             │  ││
│  │  │  └───────────┘  └─────────┘  └──────────┘             │  ││
│  │  └─────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Cloud Armor   │  │  Cloud CDN   │  │  Cloud Load       │  │
│  │  (DDoS, WAF)   │  │              │  │  Balancer         │  │
│  └─────────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

                                ▲
                                │
                            HTTPS/TLS
                                │
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                           GitHub Actions                            │
│                                                                      │
│  PR Workflow               Main Workflow                            │
│  ┌──────────┐             ┌──────────┐                             │
│  │  Lint    │             │  Build   │                             │
│  │  Test    │             │  Test    │                             │
│  │  Build   │             │  Scan    │                             │
│  │  Scan    │             │  Deploy  │                             │
│  │  Preview │             │  Staging │                             │
│  └──────────┘             │  ──────▶ │                             │
│                           │ Approve? │                             │
│                           │  ──────▶ │                             │
│                           │  Deploy  │                             │
│                           │   Prod   │                             │
│                           └──────────┘                             │
└─────────────────────────────────────────────────────────────────────┘
```

## Infrastructure Components

### 1. GKE Cluster

**Configuration:**
- **Type:** Regional (multi-zone for HA)
- **Release Channel:** Regular (stable updates)
- **Workload Identity:** Enabled
- **Binary Authorization:** Enabled (production)
- **Private Cluster:** Enabled (private nodes)

**Node Pools:**

| Pool | Machine Type | Min | Max | Workload | Taint |
|------|-------------|-----|-----|----------|-------|
| API | n2-standard-4 | 3 | 10 | API services | None |
| Worker | n2-standard-4 | 2 | 10 | Background jobs | workload=worker |
| Cache | n2-highmem-4 | 3 | 6 | Redis/RabbitMQ | workload=cache |

### 2. Networking

**VPC:**
- Subnet CIDR: `10.0.0.0/20`
- Pods CIDR: `10.4.0.0/14`
- Services CIDR: `10.8.0.0/20`

**Network Policies:**
- Default deny all traffic
- Explicit allow rules per service
- DNS egress allowed
- Monitoring ingress allowed

**Load Balancing:**
- Global HTTP(S) Load Balancer
- Cloud Armor for DDoS/WAF
- SSL/TLS termination
- Path-based routing

### 3. Service Mesh (Istio)

**Features:**
- Mutual TLS (mTLS) between services
- Circuit breaking & retries
- Traffic management (canary, blue-green)
- Observability (metrics, traces, logs)
- Authorization policies

**Traffic Management:**
```yaml
# 90% stable, 10% canary
- destination: api-gateway:stable
  weight: 90
- destination: api-gateway:canary
  weight: 10
```

### 4. Storage

**Cloud SQL PostgreSQL:**
- Version: 16
- Tier: db-custom-4-15360 (production)
- Availability: Regional (HA)
- Backups: Daily + Point-in-time recovery
- Read Replica: us-east1 (production)

**Persistent Volumes:**
- Redis: SSD, 16Gi (production)
- RabbitMQ: SSD, 16Gi (production)
- Prometheus: Standard, 100Gi
- Grafana: Standard, 10Gi

### 5. Observability

**Metrics:**
- Prometheus Operator
- Service monitors for all services
- Custom metrics (business KPIs)
- 30-day retention

**Logs:**
- Loki for log aggregation
- Promtail for log collection
- GCS backend for storage
- 30-day retention

**Traces:**
- Jaeger for distributed tracing
- 10% sampling rate
- Istio integration

**Dashboards:**
- Grafana with pre-built dashboards
- Kiali for service mesh visualization
- Custom business dashboards

### 6. Security

**Authentication & Authorization:**
- Service accounts per microservice
- RBAC roles (developer, devops, admin)
- Workload Identity (GCP IAM)
- OAuth2 proxy for dashboards

**Network Security:**
- Private GKE cluster
- Network policies (default deny)
- Cloud Armor (WAF, DDoS)
- Certificate management (cert-manager)

**Image Security:**
- Distroless base images
- Trivy vulnerability scanning
- Image signing (Cosign)
- Binary authorization (production)

**Secrets Management:**
- Kubernetes Secrets
- Google Secret Manager integration
- External Secrets Operator
- Sealed Secrets

### 7. Backup & DR

**Velero:**
- Daily backups (2 AM, 30-day retention)
- Weekly backups (Sunday, 90-day retention)
- GCS backend
- Namespace-level backups

**Database Backups:**
- Cloud SQL automated daily backups
- Transaction logs (7-day retention)
- Point-in-time recovery
- Cross-region replication (production)

**Disaster Recovery:**
- RTO: 4 hours
- RPO: 15 minutes
- Multi-region failover capability
- Documented recovery procedures

## CI/CD Pipeline

### Pull Request Workflow

```yaml
Trigger: Pull request opened/updated
├── 1. Lint & Format Check (2 min)
│   ├── ESLint
│   ├── Prettier
│   └── TypeScript check
│
├── 2. Unit Tests (3 min)
│   ├── Jest tests
│   ├── Coverage report
│   └── Upload to Codecov
│
├── 3. Integration Tests (5 min)
│   ├── Start test services
│   ├── Run integration tests
│   └── Cleanup
│
├── 4. Build Docker Images (10 min)
│   ├── Multi-stage build
│   ├── Layer caching
│   └── Push to GCR
│
├── 5. Security Scan (5 min)
│   ├── Trivy vulnerability scan
│   ├── Upload SARIF to GitHub
│   └── Fail on critical issues
│
├── 6. Deploy Preview (5 min)
│   ├── Create preview namespace
│   ├── Deploy services
│   └── Comment PR with URL
│
└── 7. E2E Tests (10 min)
    ├── Run E2E test suite
    ├── Upload test results
    └── Post summary to PR

Total Time: ~40 minutes
```

### Production Deployment Workflow

```yaml
Trigger: Merge to main branch
├── 1. Build & Test (15 min)
│   ├── Lint, unit, integration tests
│   ├── Generate version tag
│   └── Build production images
│
├── 2. Security Scan (5 min)
│   ├── Scan all images
│   ├── Upload reports
│   └── Sign images with Cosign
│
├── 3. Deploy Staging (10 min)
│   ├── Deploy to staging cluster
│   ├── Wait for rollout
│   └── Verify health checks
│
├── 4. Staging E2E Tests (15 min)
│   ├── Full E2E test suite
│   ├── Smoke tests
│   └── Upload results
│
├── 5. Manual Approval (∞)
│   └── Approval gate for production
│
├── 6. Canary Deployment (10 min)
│   ├── Deploy 10% canary
│   ├── Monitor metrics
│   └── Run smoke tests
│
├── 7. Gradual Rollout (15 min)
│   ├── Scale to 50%
│   ├── Wait 5 minutes
│   ├── Monitor errors/latency
│   └── Full rollout (100%)
│
└── 8. Post-Deployment (5 min)
    ├── Create GitHub release
    ├── Notify Slack
    └── Update tracking

Total Time: ~75 minutes (excluding approval)
```

### Rollback Workflow

**Automatic Rollback Triggers:**
- Error rate > 10%
- P99 latency > 5s
- Pod crash loop
- Failed health checks

**Manual Rollback:**
```bash
# Via Helm
helm rollback pss-nano -n pss-nano

# Via kubectl
kubectl rollout undo deployment/api-gateway -n pss-nano

# Via ArgoCD
argocd app rollback pss-nano-production
```

## Deployment Environments

### Development

**Purpose:** Local development and testing

**Infrastructure:**
- Local Docker Compose
- Minikube or Kind (optional)
- Mock external services

**Deployment:** Manual

### Staging

**Purpose:** Pre-production validation

**Infrastructure:**
- Dedicated GKE cluster
- Mirrors production configuration
- Smaller node pools (cost optimization)
- Shared observability stack

**Deployment:** Automatic on main branch

### Production

**Purpose:** Live customer traffic

**Infrastructure:**
- Regional GKE cluster (multi-zone)
- Full HA configuration
- Auto-scaling enabled
- Multi-region database replication

**Deployment:** Manual approval + canary

### Preview (Ephemeral)

**Purpose:** PR preview environments

**Infrastructure:**
- Shared GKE cluster
- Namespace per PR
- Automatic cleanup on PR close
- Resource quotas enforced

**Deployment:** Automatic on PR

## Cost Optimization

### Resource Right-Sizing

```yaml
# Development
requests:
  cpu: 125m
  memory: 256Mi

# Staging
requests:
  cpu: 250m
  memory: 512Mi

# Production
requests:
  cpu: 500m
  memory: 1Gi
```

### Auto-Scaling

**Horizontal Pod Autoscaler (HPA):**
- Scale based on CPU/memory
- Custom metrics (RPS, queue depth)
- Scale-down stabilization (5 min)

**Vertical Pod Autoscaler (VPA):**
- Recommend optimal resource requests
- Update mode: "Auto" or "Recommend"

**Cluster Autoscaler:**
- Add/remove nodes based on demand
- Respect pod disruption budgets
- Min/max node limits per pool

### Cost Monitoring

```bash
# View cluster costs
gcloud billing projects describe $PROJECT_ID

# Export to BigQuery for analysis
gcloud billing accounts get-iam-policy <billing-account-id>

# Use GCP Cost Management dashboard
```

### Savings Strategies

1. **Preemptible/Spot Instances:** Worker pool (non-critical)
2. **Committed Use Discounts:** 1-year or 3-year for stable workloads
3. **Resource Quotas:** Prevent runaway costs
4. **Idle Resource Cleanup:** Ephemeral environments
5. **Storage Lifecycle:** Move cold data to Nearline/Coldline

## Performance Benchmarks

### Target SLOs

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Availability | 99.9% | < 99.5% |
| P50 Latency | < 100ms | > 200ms |
| P95 Latency | < 500ms | > 1s |
| P99 Latency | < 1s | > 2s |
| Error Rate | < 0.1% | > 1% |
| Throughput | 10k RPS | N/A |

### Load Testing

```bash
# Using k6
k6 run --vus 100 --duration 5m load-tests/api-gateway.js

# Using Locust
locust -f load-tests/api_gateway.py --host=https://api.pss-nano.com
```

## Upgrade Procedures

### GKE Version Upgrade

```bash
# Check available versions
gcloud container get-server-config --region us-central1

# Upgrade control plane
gcloud container clusters upgrade pss-nano-gke-prod \
  --master \
  --cluster-version 1.28.5 \
  --region us-central1

# Upgrade node pools (one at a time)
gcloud container clusters upgrade pss-nano-gke-prod \
  --node-pool api-pool \
  --cluster-version 1.28.5 \
  --region us-central1
```

### Istio Upgrade

```bash
# Download new version
istioctl x precheck

# Perform canary upgrade
istioctl install --set revision=1-20-0

# Migrate namespaces
kubectl label namespace pss-nano istio.io/rev=1-20-0 --overwrite

# Restart workloads
kubectl rollout restart deployment -n pss-nano

# Verify
istioctl verify-install

# Cleanup old version
istioctl x uninstall --revision 1-19-0
```

## Troubleshooting Guide

### Quick Diagnostics

```bash
# Overall cluster health
kubectl get nodes
kubectl top nodes
kubectl get pods --all-namespaces

# Service health
kubectl get pods -n pss-nano
kubectl get svc -n pss-nano
kubectl get ingress -n pss-nano

# Logs
kubectl logs -l app=api-gateway -n pss-nano --tail=100

# Events
kubectl get events -n pss-nano --sort-by='.lastTimestamp'

# Resource usage
kubectl top pods -n pss-nano --sort-by=memory
```

### Common Issues

See [RUNBOOK.md](./RUNBOOK.md) for detailed troubleshooting procedures.

## Best Practices

### Development

- Use feature branches
- Write tests (unit, integration, E2E)
- Follow semantic versioning
- Document API changes
- Code reviews required

### Deployment

- Deploy small, frequent changes
- Use canary deployments for production
- Monitor during rollouts
- Have rollback plan ready
- Test in staging first

### Operations

- Monitor SLOs continuously
- Respond to alerts promptly
- Document incidents
- Conduct post-mortems
- Keep runbooks updated

### Security

- Principle of least privilege
- Regular security audits
- Keep dependencies updated
- Scan images for vulnerabilities
- Rotate secrets regularly

## Additional Resources

- [Deployment Guide](./DEPLOYMENT.md)
- [Operations Runbook](./RUNBOOK.md)
- [Architecture Documentation](../README.md)
- [API Documentation](./API.md)
- [Contributing Guide](../CONTRIBUTING.md)

## Support

- **Documentation:** https://docs.pss-nano.com
- **Issues:** https://github.com/pss-nano/pss-nano/issues
- **Slack:** #pss-nano-support
- **Email:** support@pss-nano.com

---

**Last Updated:** 2024-01-01
**Version:** 1.0.0
**Maintained by:** DevOps Team
