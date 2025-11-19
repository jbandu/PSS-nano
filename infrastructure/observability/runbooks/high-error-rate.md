# Runbook: High Error Rate

## Alert Details
- **Alert Name:** HighErrorRate / CriticalErrorRate
- **Severity:** Warning / Critical
- **Category:** Availability
- **Threshold:** >5% (Warning), >10% (Critical)

## Symptoms
- Error rate above acceptable thresholds
- Increased 4xx or 5xx responses
- User complaints about service unavailability

## Impact
- **Business Impact:** Customers unable to complete bookings, revenue loss
- **User Impact:** Service degradation or unavailability
- **SLA Impact:** May breach 99.9% uptime SLA

## Investigation Steps

### 1. Identify the Affected Service
```bash
# Check which service is experiencing high error rate
# Open Grafana Service Overview Dashboard
http://localhost:3010/d/service-overview

# Or query Prometheus directly
curl 'http://localhost:9090/api/v1/query?query=rate(http_request_errors_total[5m])/rate(http_requests_total[5m])'
```

### 2. Check Error Types
```bash
# View error distribution by status code
# Grafana query:
sum by (status_code, service) (rate(http_requests_total{status_code=~"4..|5.."}[5m]))

# Check logs for error details
# Loki query in Grafana:
{service="affected-service"} |= "error" | json
```

### 3. Review Recent Deployments
```bash
# Check if errors started after a recent deployment
git log --since="2 hours ago" --oneline

# Check Kubernetes deployment history
kubectl rollout history deployment/affected-service -n airline-ops
```

### 4. Check Dependencies
```bash
# Check database health
# Query Prometheus:
up{job="postgres"}

# Check Redis health
up{job="redis"}

# Check external API health
rate(external_api_errors_total[5m])
```

### 5. Review Application Logs
```bash
# Check application logs in Loki
# Grafana Explore > Loki:
{service="affected-service", level="error"} | json | line_format "{{.timestamp}} {{.message}}"

# Or check log files directly
tail -f logs/affected-service/affected-service-$(date +%Y-%m-%d).log | grep ERROR
```

### 6. Check System Resources
```bash
# Check CPU and memory usage
# Grafana Infrastructure Dashboard
http://localhost:3010/d/infrastructure-dashboard

# Or query Prometheus:
rate(process_cpu_seconds_total{job="affected-service"}[5m])
process_resident_memory_bytes{job="affected-service"}
```

## Resolution Steps

### Scenario 1: Database Connection Issues
```bash
# Check database connections
# Prometheus query:
db_connection_pool_used / db_connection_pool_size

# Resolution:
# 1. Scale up database connection pool
# 2. Restart affected service
# 3. Check for long-running queries
```

### Scenario 2: Memory Issues
```bash
# If high memory usage detected:
# 1. Check for memory leaks in recent code changes
# 2. Restart the service
kubectl rollout restart deployment/affected-service -n airline-ops

# 3. Scale up if needed
kubectl scale deployment/affected-service --replicas=5 -n airline-ops
```

### Scenario 3: External API Failures
```bash
# Check external API health
rate(external_api_errors_total{service="payment-gateway"}[5m])

# Resolution:
# 1. Verify API credentials
# 2. Check API provider status page
# 3. Enable circuit breaker if repeated failures
# 4. Switch to backup provider if available
```

### Scenario 4: Code Bug from Recent Deployment
```bash
# Rollback to previous version
kubectl rollout undo deployment/affected-service -n airline-ops

# Verify error rate decreases
# Monitor for 10 minutes in Grafana
```

### Scenario 5: Traffic Spike
```bash
# Check request rate
rate(http_requests_total[5m])

# Resolution:
# 1. Scale up service
kubectl scale deployment/affected-service --replicas=10 -n airline-ops

# 2. Enable rate limiting
# 3. Review caching strategy
```

## Communication Template

### Initial Notification
```
🚨 INCIDENT: High Error Rate Detected

Service: [Service Name]
Error Rate: [X%]
Started: [Time]
Status: Investigating

Impact: [Description of user impact]
Actions: [What's being done]

Next update in: 15 minutes
```

### Update Notification
```
📊 UPDATE: High Error Rate Incident

Service: [Service Name]
Error Rate: [X%] (was [Y%])
Root Cause: [Brief description]

Actions Taken:
- [Action 1]
- [Action 2]

Next Steps:
- [Next action]

Next update in: 15 minutes
```

### Resolution Notification
```
✅ RESOLVED: High Error Rate Incident

Service: [Service Name]
Duration: [Duration]
Root Cause: [Description]

Resolution:
- [What was done]

Prevention:
- [What will be done to prevent recurrence]

Post-mortem: Will be shared within 24 hours
```

## Post-Incident Actions

1. **Write Post-Mortem**
   - Timeline of events
   - Root cause analysis
   - Impact assessment
   - Action items to prevent recurrence

2. **Update Monitoring**
   - Add new alerts if gaps identified
   - Adjust thresholds if needed
   - Add new dashboards if needed

3. **Code Fixes**
   - Create tickets for identified issues
   - Implement fixes
   - Add tests to prevent regression

4. **Process Improvements**
   - Update deployment process if needed
   - Improve testing procedures
   - Enhance monitoring coverage

## Prevention

- Implement comprehensive error handling
- Add circuit breakers for external dependencies
- Use proper retry logic with exponential backoff
- Implement request timeouts
- Add comprehensive testing (unit, integration, E2E)
- Conduct load testing before major releases
- Implement gradual rollouts (canary deployments)
- Monitor error rates continuously

## References

- [Service Overview Dashboard](http://localhost:3010/d/service-overview)
- [Grafana Logs](http://localhost:3010/explore?datasource=Loki)
- [Jaeger Traces](http://localhost:16686)
- [Prometheus Alerts](http://localhost:9090/alerts)
