#!/bin/bash

# Scan Docker images for vulnerabilities using Trivy
# Usage: ./scan-images.sh [registry]

set -e

REGISTRY=${1:-gcr.io/pss-nano}

echo "Scanning Docker images for vulnerabilities..."

# List of services
SERVICES=(
  "api-gateway"
  "auth-service"
  "reservation-service"
  "inventory-service"
  "payment-service"
  "pricing-service"
  "ancillary-service"
  "boarding-service"
  "dcs-service"
  "load-control-service"
  "marketing-service"
  "analytics-service"
  "cms-service"
  "gds-integration-service"
  "regulatory-compliance-service"
  "airport-integration-service"
  "notification-service"
)

# Create reports directory
mkdir -p security-reports

# Scan each service
for SERVICE in "${SERVICES[@]}"; do
  echo ""
  echo "========================================="
  echo "Scanning $SERVICE..."
  echo "========================================="

  trivy image \
    --severity HIGH,CRITICAL \
    --format json \
    --output security-reports/$SERVICE-scan.json \
    $REGISTRY/$SERVICE:latest

  # Also generate human-readable report
  trivy image \
    --severity HIGH,CRITICAL \
    --format table \
    $REGISTRY/$SERVICE:latest | tee security-reports/$SERVICE-scan.txt

  echo "✓ Scanned $SERVICE"
done

echo ""
echo "========================================="
echo "All scans completed!"
echo "Reports saved to security-reports/"
echo "========================================="
