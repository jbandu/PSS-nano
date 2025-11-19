# Runbook: High Latency / Slow Response Times

## Alert Details
- **Alert Name:** HighResponseTime
- **Severity:** Warning
- **Category:** Performance
- **Threshold:** P95 response time >2 seconds

## Symptoms
- Slow page loads
- API timeouts
- User complaints about slow performance
- Increased response times in metrics

## Impact
- **Business Impact:** Poor user experience, potential cart abandonment
- **User Impact:** Frustration, decreased conversion rates
- **SLA Impact:** May breach <200ms response time SLO for critical APIs

## Investigation Steps

### 1. Identify Affected Endpoints
```bash
# Check response time by endpoint
# Grafana query:
histogram_quantile(0.95,
  sum by (le, route) (rate(http_request_duration_seconds_bucket[5m]))
)

# Check Service Overview Dashboard
http://localhost:3010/d/service-overview
```

### 2. Check Database Query Performance
```bash
# Check slow queries
# Grafana Database Dashboard:
http://localhost:3010/d/database-dashboard

# Prometheus query for slow queries:
histogram_quantile(0.95,
  sum by (le, operation) (rate(db_query_duration_seconds_bucket[5m]))
) > 1

# Check for long-running queries in PostgreSQL:
kubectl exec -it postgres-0 -n airline-ops -- psql -U airline -c "
SELECT pid, age(clock_timestamp(), query_start), usename, query
FROM pg_stat_activity
WHERE state != 'idle'
AND query_start < now() - interval '5 seconds'
ORDER BY query_start;
"
```

### 3. Check External API Latency
```bash
# Check external API response times
# Prometheus query:
histogram_quantile(0.95,
  sum by (le, service, endpoint) (rate(external_api_duration_seconds_bucket[5m]))
)

# Check which external services are slow
rate(external_api_duration_seconds_sum[5m]) / rate(external_api_duration_seconds_count[5m])
```

### 4. Check Cache Performance
```bash
# Check cache hit rate
sum(rate(cache_hits_total[5m])) by (cache_name)
/
(sum(rate(cache_hits_total[5m])) by (cache_name) + sum(rate(cache_misses_total[5m])) by (cache_name))

# Low cache hit rate (<50%) indicates caching issues
```

### 5. Check System Resources
```bash
# Check CPU usage
# Infrastructure Dashboard:
http://localhost:3010/d/infrastructure-dashboard

# Check if CPU throttling:
rate(container_cpu_cfs_throttled_seconds_total[5m])

# Check memory usage and swapping:
node_memory_SwapFree_bytes / node_memory_SwapTotal_bytes
```

### 6. Check for N+1 Query Problems
```bash
# Check query count per request
# Look for high database query counts:
rate(db_queries_total[5m])

# Review traces in Jaeger for N+1 patterns:
http://localhost:16686
# Search for service and look for multiple sequential database calls
```

### 7. Review Application Logs
```bash
# Check for slow operations in logs
# Loki query:
{service="affected-service", type="database_query", isSlowQuery="true"} | json

# Check for blocked threads or deadlocks
{service="affected-service"} |~ "blocked|deadlock|timeout" | json
```

### 8. Check Network Latency
```bash
# Check network I/O
# Infrastructure Dashboard or Prometheus:
rate(node_network_receive_bytes_total[5m])
rate(node_network_transmit_bytes_total[5m])

# Check for network errors:
rate(node_network_receive_errs_total[5m])
```

## Resolution Steps

### Scenario 1: Slow Database Queries
```bash
# Analyze slow queries
# View in Database Dashboard or PostgreSQL:
kubectl exec -it postgres-0 -n airline-ops -- psql -U airline -c "
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;
"

# Resolution:
# 1. Add missing indexes
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

# 2. Optimize query (add WHERE, LIMIT, proper JOINs)
# 3. Add query result caching
# 4. Consider database read replicas for heavy read queries
```

### Scenario 2: Low Cache Hit Rate
```bash
# Check Redis status
kubectl exec -it redis-0 -n airline-ops -- redis-cli INFO stats

# Resolution:
# 1. Increase cache TTL for frequently accessed data
# 2. Warm up cache after deployment
# 3. Increase Redis memory if evicting too frequently
# 4. Review cache key strategy
```

### Scenario 3: External API Slowness
```bash
# Identify slow external APIs
# Check monitoring dashboard

# Resolution:
# 1. Increase timeout thresholds if reasonable
# 2. Implement request retries with exponential backoff
# 3. Cache external API responses when possible
# 4. Consider async processing for non-critical API calls
# 5. Contact external API provider
# 6. Switch to backup provider if available
```

### Scenario 4: N+1 Query Problem
```bash
# Identified in traces showing many sequential DB queries

# Resolution:
# 1. Use eager loading / joins instead of lazy loading
# Example in Prisma:
# Before: await prisma.booking.findMany()
# After: await prisma.booking.findMany({ include: { passenger: true, flight: true } })

# 2. Use DataLoader pattern for batch loading
# 3. Implement caching layer
```

### Scenario 5: High CPU Usage
```bash
# Check CPU usage
kubectl top pods -n airline-ops

# Resolution:
# 1. Scale horizontally (add more instances)
kubectl scale deployment/affected-service --replicas=10 -n airline-ops

# 2. Increase CPU limits
kubectl edit deployment affected-service -n airline-ops
# Update resources.limits.cpu

# 3. Profile application to find CPU hotspots
# Add profiling and identify expensive operations
# Optimize algorithms, add caching
```

### Scenario 6: Memory Pressure / Garbage Collection
```bash
# Check memory usage and GC time
# Look for sawtooth pattern indicating frequent GC

# Resolution:
# 1. Increase heap size
NODE_OPTIONS="--max-old-space-size=4096"

# 2. Fix memory leaks
# Use heap snapshots to identify leaks

# 3. Optimize object creation
# Reduce allocations in hot paths
```

### Scenario 7: Network Latency
```bash
# Check inter-service latency
# Review traces in Jaeger

# Resolution:
# 1. Deploy services closer together (same region/AZ)
# 2. Use service mesh for better routing
# 3. Implement connection pooling
# 4. Use HTTP/2 or gRPC for better performance
```

## Quick Optimization Actions

### Immediate Actions (< 15 minutes)
```bash
# 1. Scale up service instances
kubectl scale deployment/affected-service --replicas=10 -n airline-ops

# 2. Increase database connection pool
# Update service config:
DATABASE_POOL_SIZE=50  # from 20

# 3. Warm up cache
# Run cache warming script if available

# 4. Enable request queuing/throttling to prevent overload

# 5. Add aggressive caching for read-heavy endpoints
```

## Communication Template

### Initial Notification
```
⚠️ PERFORMANCE DEGRADATION: High Latency

Service: [Service Name]
Endpoint: [Affected endpoints]
Current Latency: P95 [X]ms (normal: [Y]ms)
Started: [Time]
Status: Investigating

Impact: Slow response times, user experience degraded
Actions: Investigating root cause

Next update in: 15 minutes
```

### Update Notification
```
📊 UPDATE: High Latency Incident

Service: [Service Name]
Current Latency: P95 [X]ms (was [Y]ms)
Root Cause: [Brief description]

Actions Taken:
- [Action 1]
- [Action 2]

Current Status: [Improving/Stable/Degrading]

Next update in: 15 minutes
```

### Resolution Notification
```
✅ RESOLVED: High Latency Incident

Service: [Service Name]
Duration: [Duration]
Root Cause: [Description]

Resolution:
- [What was done]

Current Latency: P95 [X]ms (normal range)

Post-mortem: Will be shared within 24 hours
```

## Post-Incident Actions

1. **Performance Analysis**
   - Analyze slow query logs
   - Review Jaeger traces
   - Identify bottlenecks

2. **Optimization Tasks**
   - Add database indexes
   - Optimize N+1 queries
   - Improve caching strategy
   - Optimize expensive operations

3. **Monitoring Improvements**
   - Add SLO tracking
   - Set up latency budgets
   - Improve tracing coverage

4. **Prevention**
   - Implement performance testing in CI/CD
   - Set up synthetic monitoring
   - Regular performance reviews

## Prevention

- **Database Optimization:** Regular index maintenance, query optimization
- **Caching Strategy:** Multi-layer caching (CDN, application, database)
- **Code Reviews:** Focus on performance implications
- **Load Testing:** Regular load and stress testing
- **Performance Budgets:** Set and enforce performance budgets
- **APM Tools:** Use Application Performance Monitoring
- **Auto-scaling:** Implement auto-scaling based on latency
- **Connection Pooling:** Proper connection pool sizing
- **Async Processing:** Move heavy operations to background jobs
- **CDN:** Use CDN for static assets

## References

- [Service Overview Dashboard](http://localhost:3010/d/service-overview)
- [Database Dashboard](http://localhost:3010/d/database-dashboard)
- [Jaeger Traces](http://localhost:16686)
- [Performance Testing Results](./docs/performance-testing.md)
