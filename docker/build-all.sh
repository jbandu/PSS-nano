#!/bin/bash

# Build all microservices Docker images
# Usage: ./build-all.sh [version] [registry]

set -e

VERSION=${1:-latest}
REGISTRY=${2:-gcr.io/pss-nano}

echo "Building all microservice images..."
echo "Version: $VERSION"
echo "Registry: $REGISTRY"

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

# Build each service
for SERVICE in "${SERVICES[@]}"; do
  echo ""
  echo "========================================="
  echo "Building $SERVICE..."
  echo "========================================="

  docker build \
    --file services/$SERVICE/Dockerfile \
    --build-arg SERVICE_NAME=$SERVICE \
    --tag $REGISTRY/$SERVICE:$VERSION \
    --tag $REGISTRY/$SERVICE:latest \
    --cache-from $REGISTRY/$SERVICE:latest \
    --progress=plain \
    .

  echo "✓ Built $SERVICE"
done

echo ""
echo "========================================="
echo "All services built successfully!"
echo "========================================="

# Optional: Push images
read -p "Do you want to push images to registry? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Pushing images..."
  for SERVICE in "${SERVICES[@]}"; do
    docker push $REGISTRY/$SERVICE:$VERSION
    docker push $REGISTRY/$SERVICE:latest
    echo "✓ Pushed $SERVICE"
  done
  echo "All images pushed successfully!"
fi
