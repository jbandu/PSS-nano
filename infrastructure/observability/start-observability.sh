#!/bin/bash

# Airline PSS Observability Stack Startup Script
# This script starts all observability infrastructure components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Airline PSS Observability Stack${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running!${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check available resources
echo ""
echo -e "${YELLOW}Checking system resources...${NC}"
TOTAL_MEM=$(docker info --format '{{.MemTotal}}' | awk '{print int($1/1024/1024/1024)}')
echo "Available memory: ${TOTAL_MEM}GB"

if [ "$TOTAL_MEM" -lt 8 ]; then
    echo -e "${YELLOW}Warning: Less than 8GB RAM available. Observability stack may be slow.${NC}"
    echo "Recommended: 8GB+ RAM"
fi

# Check if observability stack is already running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo -e "${YELLOW}Observability stack is already running!${NC}"
    echo ""
    echo "Choose an option:"
    echo "  1) Restart all services"
    echo "  2) Stop all services"
    echo "  3) Show status and exit"
    echo "  4) View logs"
    echo "  5) Exit without changes"
    echo ""
    read -p "Enter choice [1-5]: " choice

    case $choice in
        1)
            echo ""
            echo -e "${YELLOW}Restarting observability stack...${NC}"
            docker-compose restart
            ;;
        2)
            echo ""
            echo -e "${YELLOW}Stopping observability stack...${NC}"
            docker-compose down
            echo -e "${GREEN}✓ Observability stack stopped${NC}"
            exit 0
            ;;
        3)
            echo ""
            docker-compose ps
            exit 0
            ;;
        4)
            echo ""
            echo "Choose service to view logs:"
            echo "  1) All services"
            echo "  2) Grafana"
            echo "  3) Prometheus"
            echo "  4) Loki"
            echo "  5) Jaeger"
            echo ""
            read -p "Enter choice [1-5]: " log_choice

            case $log_choice in
                1) docker-compose logs -f ;;
                2) docker-compose logs -f grafana ;;
                3) docker-compose logs -f prometheus ;;
                4) docker-compose logs -f loki ;;
                5) docker-compose logs -f jaeger ;;
                *) echo "Invalid choice" ;;
            esac
            exit 0
            ;;
        5)
            echo "Exiting without changes"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
else
    # Start the observability stack
    echo ""
    echo -e "${YELLOW}Starting observability stack...${NC}"
    echo ""

    # Create necessary directories
    echo "Creating log directories..."
    mkdir -p ../../logs

    # Pull latest images
    echo ""
    echo -e "${YELLOW}Pulling latest Docker images...${NC}"
    docker-compose pull

    # Start services
    echo ""
    echo -e "${YELLOW}Starting services...${NC}"
    docker-compose up -d

    # Wait for services to be healthy
    echo ""
    echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
    sleep 5

    # Check service health
    check_service() {
        local name=$1
        local url=$2
        local max_attempts=30
        local attempt=1

        echo -n "Checking $name... "

        while [ $attempt -le $max_attempts ]; do
            if curl -s -f "$url" > /dev/null 2>&1; then
                echo -e "${GREEN}✓${NC}"
                return 0
            fi
            sleep 2
            attempt=$((attempt + 1))
        done

        echo -e "${RED}✗ (timeout)${NC}"
        return 1
    }

    echo ""
    check_service "Grafana" "http://localhost:3010/api/health"
    check_service "Prometheus" "http://localhost:9090/-/healthy"
    check_service "Loki" "http://localhost:3100/ready"
    check_service "Jaeger" "http://localhost:16686/"
    check_service "AlertManager" "http://localhost:9093/-/healthy"
fi

# Show service status
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Service Status${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
docker-compose ps

# Show access URLs
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Access Observability Tools${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Grafana:${NC}      http://localhost:3010"
echo -e "              Username: admin"
echo -e "              Password: admin"
echo ""
echo -e "${GREEN}Prometheus:${NC}   http://localhost:9090"
echo ""
echo -e "${GREEN}Jaeger:${NC}       http://localhost:16686"
echo ""
echo -e "${GREEN}AlertManager:${NC} http://localhost:9093"
echo ""
echo -e "${GREEN}Loki:${NC}         http://localhost:3100"
echo ""

# Show available dashboards
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Available Grafana Dashboards${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "  • Executive Dashboard"
echo "  • Service Overview"
echo "  • Infrastructure Monitoring"
echo "  • Database Performance"
echo "  • Business Metrics"
echo "  • Security Monitoring"
echo ""

# Show next steps
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Next Steps${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "1. Open Grafana at http://localhost:3010"
echo "2. Login with admin/admin (change password on first login)"
echo "3. Navigate to Dashboards to view pre-configured dashboards"
echo "4. Instrument your services with @airline/observability package"
echo "5. View the integration guide: OBSERVABILITY_INTEGRATION_GUIDE.md"
echo ""

# Show useful commands
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Useful Commands${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "View logs:           docker-compose logs -f [service]"
echo "Stop stack:          docker-compose down"
echo "Restart stack:       docker-compose restart"
echo "Remove all data:     docker-compose down -v"
echo "View status:         docker-compose ps"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Observability Stack Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
