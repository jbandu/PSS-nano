# Runbook: Service Down

## Alert Details
- **Alert Name:** ServiceDown
- **Severity:** Critical
- **Category:** Availability
- **Threshold:** Service unreachable for >1 minute

## Symptoms
- Service health check failing
- 502/503 errors from API Gateway
- Service not responding to requests
- Prometheus shows `up{job="service-name"} == 0`

## Impact
- **Business Impact:** Service unavailable, potential revenue loss
- **User Impact:** Complete service unavailability
- **SLA Impact:** Direct SLA breach, affects uptime guarantee

## Investigation Steps

### 1. Verify Service is Actually Down
```bash
# Check Prometheus metrics
curl 'http://localhost:9090/api/v1/query?query=up{job="affected-service"}'

# Check service health endpoint directly
curl http://localhost:PORT/health

# Check Grafana Service Overview Dashboard
http://localhost:3010/d/service-overview
```

### 2. Check Service Status in Container/Kubernetes
```bash
# Check if container is running
docker ps | grep affected-service

# For Kubernetes:
kubectl get pods -n airline-ops | grep affected-service
kubectl describe pod affected-service-xxx -n airline-ops
kubectl logs affected-service-xxx -n airline-ops --tail=100
```

### 3. Check Recent Changes
```bash
# Check recent deployments
kubectl rollout history deployment/affected-service -n airline-ops

# Check recent commits
git log --since="1 hour ago" --oneline

# Check recent configuration changes
kubectl get configmap -n airline-ops
kubectl describe configmap affected-service-config -n airline-ops
```

### 4. Check System Resources
```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pod affected-service-xxx -n airline-ops

# Check for OOMKilled pods
kubectl get pods -n airline-ops | grep OOMKilled
```

### 5. Check Application Logs
```bash
# Check container logs
kubectl logs affected-service-xxx -n airline-ops --tail=200

# Check previous container logs if pod restarted
kubectl logs affected-service-xxx -n airline-ops --previous

# Check Loki logs
# Grafana Explore > Loki:
{service="affected-service"} | json | line_format "{{.timestamp}} {{.level}} {{.message}}"
```

### 6. Check Dependencies
```bash
# Check database connection
kubectl get pods -n airline-ops | grep postgres

# Check Redis
kubectl get pods -n airline-ops | grep redis

# Check RabbitMQ
kubectl get pods -n airline-ops | grep rabbitmq

# Check network connectivity
kubectl exec -it affected-service-xxx -n airline-ops -- nc -zv postgres 5432
```

## Resolution Steps

### Scenario 1: Container Crashed
```bash
# Check why container crashed
kubectl logs affected-service-xxx -n airline-ops --previous

# Common causes:
# - OOMKilled: Increase memory limits
# - CrashLoopBackOff: Fix application error
# - ImagePullBackOff: Fix image reference

# Restart the deployment
kubectl rollout restart deployment/affected-service -n airline-ops

# Monitor pod status
kubectl get pods -n airline-ops -w | grep affected-service
```

### Scenario 2: OOMKilled (Out of Memory)
```bash
# Increase memory limits
kubectl edit deployment affected-service -n airline-ops

# Update resources:
resources:
  limits:
    memory: "2Gi"  # Increase from 1Gi
  requests:
    memory: "1Gi"

# Save and apply
# Monitor pod creation
kubectl get pods -n airline-ops -w
```

### Scenario 3: Database Connection Failed
```bash
# Check database status
kubectl get pods -n airline-ops | grep postgres
kubectl logs postgres-xxx -n airline-ops

# Check database credentials in secrets
kubectl get secret affected-service-db-secret -n airline-ops -o yaml

# Verify database is accessible
kubectl exec -it affected-service-xxx -n airline-ops -- nc -zv postgres 5432

# Restart database if needed
kubectl rollout restart statefulset/postgres -n airline-ops
```

### Scenario 4: Failed Deployment
```bash
# Rollback to previous version
kubectl rollout undo deployment/affected-service -n airline-ops

# Verify rollback succeeded
kubectl rollout status deployment/affected-service -n airline-ops

# Check pod status
kubectl get pods -n airline-ops | grep affected-service
```

### Scenario 5: Network Issues
```bash
# Check service definition
kubectl get svc affected-service -n airline-ops
kubectl describe svc affected-service -n airline-ops

# Check endpoints
kubectl get endpoints affected-service -n airline-ops

# Verify network policies
kubectl get networkpolicies -n airline-ops
```

### Scenario 6: Image Pull Issues
```bash
# Check image pull status
kubectl describe pod affected-service-xxx -n airline-ops | grep -A 5 "Events:"

# Verify image exists
docker pull registry/affected-service:tag

# Update image pull secrets if needed
kubectl create secret docker-registry regcred \
  --docker-server=<registry-url> \
  --docker-username=<username> \
  --docker-password=<password>
```

## Quick Recovery Actions

### Immediate Actions (< 5 minutes)
```bash
# 1. Restart the service
kubectl rollout restart deployment/affected-service -n airline-ops

# 2. If restart doesn't work, rollback
kubectl rollout undo deployment/affected-service -n airline-ops

# 3. Scale up replicas for redundancy
kubectl scale deployment/affected-service --replicas=5 -n airline-ops

# 4. Check if service recovered
curl http://localhost:PORT/health
```

### If Service Still Down
```bash
# 1. Delete problematic pods
kubectl delete pod affected-service-xxx -n airline-ops

# 2. Force recreate deployment
kubectl delete deployment affected-service -n airline-ops
kubectl apply -f deployment.yaml

# 3. Check all resources
kubectl get all -n airline-ops | grep affected-service
```

## Communication Template

### Initial Notification
```
🚨 CRITICAL: Service Down

Service: [Service Name]
Started: [Time]
Status: Down - Investigating

Impact: Service completely unavailable
Affected Users: All users of [service]

Actions:
- Investigating root cause
- Attempting restart

Next update in: 5 minutes
```

### Update Notification
```
📊 UPDATE: Service Down Incident

Service: [Service Name]
Duration: [Duration]
Root Cause: [Brief description]

Actions Taken:
- [Action 1]
- [Action 2]

Current Status: [Recovering/Still Down]

ETA for recovery: [Time estimate]
Next update in: 5 minutes
```

### Resolution Notification
```
✅ RESOLVED: Service Down Incident

Service: [Service Name]
Duration: [Duration]
Root Cause: [Description]

Resolution:
- [What was done]

Current Status: Service fully operational

Monitoring: Continuing to monitor closely
Post-mortem: Will be shared within 24 hours
```

## Post-Incident Actions

1. **Immediate Analysis**
   - Review pod events
   - Analyze crash logs
   - Identify root cause

2. **Fix Implementation**
   - Create bug tickets
   - Implement fixes
   - Add tests

3. **Monitoring Improvements**
   - Add better health checks
   - Improve alerting
   - Add more detailed logging

4. **Prevention Measures**
   - Update resource limits
   - Improve error handling
   - Add circuit breakers
   - Implement better graceful degradation

## Prevention

- **Proper Resource Limits:** Set appropriate CPU and memory limits
- **Health Checks:** Implement comprehensive liveness and readiness probes
- **High Availability:** Run multiple replicas across availability zones
- **Graceful Shutdown:** Implement proper signal handling
- **Circuit Breakers:** Prevent cascading failures
- **Monitoring:** Comprehensive monitoring and alerting
- **Testing:** Load testing and chaos engineering
- **Auto-scaling:** Implement HPA (Horizontal Pod Autoscaler)

## References

- [Service Overview Dashboard](http://localhost:3010/d/service-overview)
- [Infrastructure Dashboard](http://localhost:3010/d/infrastructure-dashboard)
- [Kubernetes Events](http://localhost:3010/d/kubernetes-events)
- [Prometheus Alerts](http://localhost:9090/alerts)
