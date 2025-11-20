# PSS-nano Operations Runbook

Operational runbooks for managing the PSS-nano platform.

## Table of Contents

- [Incident Response](#incident-response)
- [Common Issues](#common-issues)
- [Maintenance Procedures](#maintenance-procedures)
- [Performance Tuning](#performance-tuning)
- [Disaster Recovery](#disaster-recovery)

## Incident Response

### Severity Levels

- **P0 (Critical)**: Service down, data loss, security breach
- **P1 (High)**: Major functionality impaired, significant performance degradation
- **P2 (Medium)**: Minor functionality impaired, workaround available
- **P3 (Low)**: Cosmetic issues, feature requests

### P0: Service Down

#### Symptoms
- API Gateway returning 5xx errors
- Monitoring alerts firing
- Users unable to access the application

#### Immediate Actions

```bash
# 1. Check service health
kubectl get pods -n pss-nano
kubectl get deployments -n pss-nano

# 2. Check recent deployments
kubectl rollout history deployment/api-gateway -n pss-nano

# 3. Check logs
kubectl logs -l app=api-gateway -n pss-nano --tail=100

# 4. Check ingress
kubectl get ingress -n pss-nano
kubectl describe ingress api-gateway -n pss-nano
```

#### Resolution Steps

**Option 1: Rollback Recent Deployment**
```bash
# Identify problematic deployment
kubectl rollout history deployment/api-gateway -n pss-nano

# Rollback
kubectl rollout undo deployment/api-gateway -n pss-nano

# Verify
kubectl rollout status deployment/api-gateway -n pss-nano
```

**Option 2: Scale Up Replicas**
```bash
# If resource constrained
kubectl scale deployment api-gateway --replicas=10 -n pss-nano
```

**Option 3: Restart Pods**
```bash
# Force pod restart
kubectl rollout restart deployment/api-gateway -n pss-nano
```

**Option 4: Emergency Maintenance Mode**
```bash
# Enable maintenance page
kubectl apply -f infrastructure/kubernetes/maintenance-mode.yaml
```

#### Post-Incident

1. Document root cause
2. Update monitoring/alerts
3. Create prevention tasks
4. Conduct post-mortem

---

### P1: High Error Rate

#### Symptoms
- Error rate > 5%
- Prometheus alert: `HighErrorRate`
- Users reporting intermittent failures

#### Investigation

```bash
# 1. Check error metrics
kubectl port-forward -n monitoring svc/prometheus-prometheus 9090:9090
# Query: rate(http_requests_total{status=~"5.."}[5m])

# 2. Check application logs
kubectl logs -l app=api-gateway -n pss-nano --tail=500 | grep ERROR

# 3. Check database connections
kubectl exec -it <postgres-pod> -n pss-nano -- psql -U airlineops -c "SELECT count(*) FROM pg_stat_activity;"

# 4. Check Redis
kubectl exec -it <redis-pod> -n pss-nano -- redis-cli INFO clients

# 5. Check RabbitMQ
kubectl port-forward -n pss-nano svc/rabbitmq 15672:15672
# Open http://localhost:15672
```

#### Common Causes & Fixes

**Database Connection Pool Exhausted**
```bash
# Check connections
kubectl logs -l app=reservation-service -n pss-nano | grep "connection pool"

# Increase pool size (temporary)
kubectl set env deployment/reservation-service MAX_DB_CONNECTIONS=50 -n pss-nano

# Permanent fix: Update values.yaml
```

**Circuit Breaker Open**
```bash
# Check Istio circuit breaker
istioctl proxy-config clusters <pod-name> | grep outlier

# Reset circuit breaker (restart affected pods)
kubectl delete pod -l app=reservation-service -n pss-nano
```

**Memory Leak**
```bash
# Check memory usage
kubectl top pods -n pss-nano

# Restart affected service
kubectl rollout restart deployment/<service-name> -n pss-nano

# Schedule memory profiling
```

---

### P1: Slow Response Times

#### Symptoms
- P99 latency > 2 seconds
- Prometheus alert: `HighLatency`
- Users reporting slow performance

#### Investigation

```bash
# 1. Check latency metrics
# Prometheus query: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# 2. Check database query performance
kubectl exec -it <postgres-pod> -n pss-nano -- psql -U airlineops -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;"

# 3. Check Istio service mesh latency
istioctl dashboard grafana
# Navigate to Istio Service Dashboard

# 4. Check APM traces
kubectl port-forward -n monitoring svc/jaeger-query 16686:16686
# Open http://localhost:16686
```

#### Quick Fixes

**Scale Up**
```bash
# Increase replicas
kubectl scale deployment api-gateway --replicas=10 -n pss-nano
```

**Clear Cache**
```bash
# Flush Redis cache
kubectl exec -it <redis-pod> -n pss-nano -- redis-cli FLUSHDB
```

**Optimize Queries**
```bash
# Add database indexes (example)
kubectl exec -it <postgres-pod> -n pss-nano -- psql -U airlineops -c "
CREATE INDEX CONCURRENTLY idx_reservations_user_id ON reservations(user_id);"
```

---

## Common Issues

### Pod CrashLoopBackOff

```bash
# Check pod status
kubectl describe pod <pod-name> -n pss-nano

# Check logs
kubectl logs <pod-name> -n pss-nano --previous

# Common causes:
# 1. Missing environment variables
# 2. Database connection failure
# 3. Failed health checks
# 4. OOMKilled (out of memory)

# Fix health check timing
kubectl edit deployment <deployment-name> -n pss-nano
# Adjust initialDelaySeconds, periodSeconds, failureThreshold
```

### ImagePullBackOff

```bash
# Check image pull secret
kubectl get secrets -n pss-nano
kubectl describe pod <pod-name> -n pss-nano

# Verify image exists
gcloud container images list --repository=gcr.io/$PROJECT_ID

# Re-create pull secret if needed
kubectl create secret docker-registry gcr-json-key \
  --docker-server=gcr.io \
  --docker-username=_json_key \
  --docker-password="$(cat key.json)" \
  -n pss-nano
```

### Certificate Expired

```bash
# Check certificate status
kubectl get certificates -n pss-nano
kubectl describe certificate api-gateway-tls -n pss-nano

# Force renewal
kubectl delete certificate api-gateway-tls -n pss-nano
kubectl apply -f infrastructure/kubernetes/cert-manager/cluster-issuer.yaml

# Verify
kubectl get certificaterequest -n pss-nano
```

### Database Migration Failed

```bash
# Check migration logs
kubectl logs -l job-name=db-migration -n pss-nano

# Rollback migration
kubectl exec -it <api-gateway-pod> -n pss-nano -- npm run db:rollback

# Re-run migration
kubectl delete job db-migration -n pss-nano
kubectl apply -f infrastructure/kubernetes/jobs/db-migration.yaml
```

### High Memory Usage

```bash
# Check memory usage
kubectl top pods -n pss-nano --sort-by=memory

# Check for memory leaks
kubectl exec -it <pod-name> -n pss-nano -- node --expose-gc --inspect=0.0.0.0:9229 dist/index.js

# Increase memory limits (temporary)
kubectl set resources deployment api-gateway \
  --limits=memory=2Gi \
  -n pss-nano

# Update values.yaml for permanent fix
```

---

## Maintenance Procedures

### Planned Maintenance

#### Pre-Maintenance Checklist

- [ ] Notify users (24 hours advance)
- [ ] Schedule during low-traffic window
- [ ] Create backup
- [ ] Prepare rollback plan
- [ ] Update status page

#### Maintenance Window Process

```bash
# 1. Enable maintenance mode
kubectl apply -f infrastructure/kubernetes/maintenance-mode.yaml

# 2. Scale down services (optional)
kubectl scale deployment --all --replicas=0 -n pss-nano

# 3. Perform maintenance
# - Database upgrades
# - Kubernetes version upgrade
# - Infrastructure changes

# 4. Scale up services
kubectl scale deployment api-gateway --replicas=5 -n pss-nano
kubectl scale deployment reservation-service --replicas=3 -n pss-nano
# ... other services

# 5. Verify health
kubectl get pods -n pss-nano
kubectl rollout status deployment --all -n pss-nano

# 6. Run smoke tests
npm run test:smoke

# 7. Disable maintenance mode
kubectl delete -f infrastructure/kubernetes/maintenance-mode.yaml
```

### Database Maintenance

#### Vacuum PostgreSQL

```bash
kubectl exec -it <postgres-pod> -n pss-nano -- psql -U airlineops -c "VACUUM ANALYZE;"
```

#### Reindex

```bash
kubectl exec -it <postgres-pod> -n pss-nano -- psql -U airlineops -c "REINDEX DATABASE airline_ops;"
```

#### Update Statistics

```bash
kubectl exec -it <postgres-pod> -n pss-nano -- psql -U airlineops -c "ANALYZE;"
```

### Redis Maintenance

#### Flush Cache

```bash
kubectl exec -it <redis-pod> -n pss-nano -- redis-cli FLUSHDB
```

#### Check Memory

```bash
kubectl exec -it <redis-pod> -n pss-nano -- redis-cli INFO memory
```

### Certificate Renewal

```bash
# Check expiration
kubectl get certificates -n pss-nano

# Cert-manager handles auto-renewal, but if needed:
kubectl delete secret api-gateway-tls -n pss-nano
kubectl delete certificate api-gateway-tls -n pss-nano
kubectl apply -f infrastructure/kubernetes/cert-manager/cluster-issuer.yaml
```

---

## Performance Tuning

### Application Optimization

#### Node.js Settings

```yaml
# Environment variables for production
NODE_ENV: production
NODE_OPTIONS: "--max-old-space-size=4096 --optimize-for-size"
UV_THREADPOOL_SIZE: 128
```

#### Database Connection Pool

```yaml
# Optimal pool size = (CPU cores * 2) + effective_spindle_count
POSTGRES_POOL_MIN: 10
POSTGRES_POOL_MAX: 30
POSTGRES_IDLE_TIMEOUT: 30000
```

### Kubernetes Optimization

#### Resource Requests/Limits

```yaml
resources:
  requests:
    cpu: 250m      # Guaranteed
    memory: 512Mi
  limits:
    cpu: 1000m     # Maximum allowed
    memory: 2Gi
```

#### HPA Tuning

```yaml
autoscaling:
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Istio Optimization

#### Connection Pool

```yaml
trafficPolicy:
  connectionPool:
    tcp:
      maxConnections: 100
    http:
      http1MaxPendingRequests: 50
      http2MaxRequests: 100
      maxRequestsPerConnection: 2
```

#### Circuit Breaker

```yaml
outlierDetection:
  consecutiveErrors: 5
  interval: 30s
  baseEjectionTime: 30s
  maxEjectionPercent: 50
```

---

## Disaster Recovery

### Recovery Time Objective (RTO): 4 hours
### Recovery Point Objective (RPO): 15 minutes

### Disaster Scenarios

#### 1. Complete Cluster Failure

**Recovery Steps:**

```bash
# 1. Create new cluster
cd infrastructure/terraform/gke
terraform apply -var-file=environments/prod.tfvars

# 2. Restore from Velero backup
velero restore create --from-backup <latest-backup>

# 3. Restore database
gcloud sql backups restore <backup-id> \
  --backup-instance=pss-nano-postgres-prod

# 4. Verify services
kubectl get pods -n pss-nano
helm list -n pss-nano

# 5. Run smoke tests
npm run test:smoke

# 6. Update DNS if needed
```

**Estimated Recovery Time:** 2-3 hours

#### 2. Database Corruption

```bash
# 1. Stop all services
kubectl scale deployment --all --replicas=0 -n pss-nano

# 2. Create snapshot
gcloud sql backups create \
  --instance=pss-nano-postgres-prod

# 3. Restore from backup
gcloud sql backups restore <backup-id> \
  --backup-instance=pss-nano-postgres-prod

# 4. Verify data integrity
kubectl exec -it <postgres-pod> -n pss-nano -- psql -U airlineops -c "
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# 5. Scale up services
kubectl scale deployment api-gateway --replicas=5 -n pss-nano
```

**Estimated Recovery Time:** 1-2 hours

#### 3. Regional Outage

**Multi-Region Failover:**

```bash
# 1. Update DNS to secondary region
gcloud dns record-sets transaction start --zone=pss-nano
gcloud dns record-sets transaction remove \
  --name=api.pss-nano.com. \
  --type=A \
  --ttl=300 \
  --zone=pss-nano \
  <primary-ip>
gcloud dns record-sets transaction add \
  --name=api.pss-nano.com. \
  --type=A \
  --ttl=300 \
  --zone=pss-nano \
  <secondary-ip>
gcloud dns record-sets transaction execute --zone=pss-nano

# 2. Scale up secondary region
gcloud container clusters resize pss-nano-gke-secondary \
  --node-pool api-pool \
  --num-nodes 5 \
  --region us-east1

# 3. Verify replication
gcloud sql instances describe pss-nano-postgres-replica
```

**Estimated Recovery Time:** 30-60 minutes

---

## Monitoring & Alerts

### Critical Alerts

1. **Service Down** - P0
   - Trigger: Pod restarts > 3 in 5 minutes
   - Action: Page on-call engineer

2. **High Error Rate** - P1
   - Trigger: Error rate > 5% for 5 minutes
   - Action: Notify DevOps team

3. **High Latency** - P1
   - Trigger: P99 latency > 2s for 5 minutes
   - Action: Notify DevOps team

4. **Database Issues** - P0
   - Trigger: Connection failures > 10%
   - Action: Page on-call engineer

5. **Disk Space** - P1
   - Trigger: Disk usage > 85%
   - Action: Auto-scale or notify team

### On-Call Procedures

**Primary Response:**
1. Acknowledge alert within 5 minutes
2. Assess severity
3. Follow runbook procedures
4. Escalate if needed

**Escalation Path:**
1. On-call engineer → 15 minutes
2. Team lead → 30 minutes
3. Engineering manager → 1 hour
4. CTO → 2 hours

---

## Contact Information

- **On-Call:** PagerDuty rotation
- **Slack:** #pss-nano-incidents
- **Email:** ops@pss-nano.com
- **War Room:** Zoom link in PagerDuty

## Documentation Updates

This runbook should be reviewed and updated quarterly or after major incidents.

Last Updated: 2024-01-01
