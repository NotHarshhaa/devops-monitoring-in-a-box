#!/bin/bash

# DevOps Monitoring Health Check Script
# This script checks the health of all monitoring services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if a service is responding
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    print_info "Checking $service_name at $url..."
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        print_status "$service_name is healthy"
        return 0
    else
        print_error "$service_name is not responding"
        return 1
    fi
}

# Function to check Docker containers
check_containers() {
    print_info "Checking Docker containers..."
    
    local containers=("prometheus" "grafana" "loki" "alertmanager" "node-exporter" "cadvisor" "devops-monitor-ui")
    local all_healthy=true
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*Up"; then
            print_status "$container is running"
        else
            print_error "$container is not running"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        print_status "All containers are running"
        return 0
    else
        print_error "Some containers are not running"
        return 1
    fi
}

# Function to check service endpoints
check_endpoints() {
    print_info "Checking service endpoints..."
    
    local all_healthy=true
    
    # Check Prometheus
    if check_service "Prometheus" "http://localhost:9090/-/healthy" 200; then
        print_status "Prometheus metrics endpoint is accessible"
    else
        print_error "Prometheus is not accessible"
        all_healthy=false
    fi
    
    # Check Grafana
    if check_service "Grafana" "http://localhost:3000/api/health" 200; then
        print_status "Grafana is accessible"
    else
        print_error "Grafana is not accessible"
        all_healthy=false
    fi
    
    # Check Loki
    if check_service "Loki" "http://localhost:3100/ready" 200; then
        print_status "Loki is accessible"
    else
        print_error "Loki is not accessible"
        all_healthy=false
    fi
    
    # Check Alertmanager
    if check_service "Alertmanager" "http://localhost:9093/-/healthy" 200; then
        print_status "Alertmanager is accessible"
    else
        print_error "Alertmanager is not accessible"
        all_healthy=false
    fi
    
    # Check DevOps Monitor UI
    if check_service "DevOps Monitor UI" "http://localhost:4000" 200; then
        print_status "DevOps Monitor UI is accessible"
    else
        print_error "DevOps Monitor UI is not accessible"
        all_healthy=false
    fi
    
    # Check cAdvisor
    if check_service "cAdvisor" "http://localhost:8080/healthz" 200; then
        print_status "cAdvisor is accessible"
    else
        print_error "cAdvisor is not accessible"
        all_healthy=false
    fi
    
    # Check Node Exporter
    if check_service "Node Exporter" "http://localhost:9100/metrics" 200; then
        print_status "Node Exporter is accessible"
    else
        print_error "Node Exporter is not accessible"
        all_healthy=false
    fi
    
    if [ "$all_healthy" = true ]; then
        print_status "All service endpoints are healthy"
        return 0
    else
        print_error "Some service endpoints are not healthy"
        return 1
    fi
}

# Function to check metrics collection
check_metrics() {
    print_info "Checking metrics collection..."
    
    # Check if Prometheus is collecting metrics
    local metrics_count=$(curl -s "http://localhost:9090/api/v1/query?query=up" | jq -r '.data.result | length' 2>/dev/null)
    
    if [ "$metrics_count" -gt 0 ]; then
        print_status "Prometheus is collecting $metrics_count metrics"
        return 0
    else
        print_error "Prometheus is not collecting metrics"
        return 1
    fi
}

# Function to check logs
check_logs() {
    print_info "Checking service logs for errors..."
    
    local services=("prometheus" "grafana" "loki" "alertmanager" "devops-monitor-ui")
    local has_errors=false
    
    for service in "${services[@]}"; do
        local error_count=$(docker logs "$service" 2>&1 | grep -i "error\|fatal\|panic" | wc -l)
        
        if [ "$error_count" -gt 0 ]; then
            print_warning "$service has $error_count error messages in logs"
            has_errors=true
        else
            print_status "$service logs look clean"
        fi
    done
    
    if [ "$has_errors" = false ]; then
        print_status "All service logs are clean"
        return 0
    else
        print_warning "Some services have errors in logs"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    print_info "Checking disk space..."
    
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        print_status "Disk usage is at ${usage}% (healthy)"
        return 0
    elif [ "$usage" -lt 90 ]; then
        print_warning "Disk usage is at ${usage}% (warning)"
        return 1
    else
        print_error "Disk usage is at ${usage}% (critical)"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    print_info "Checking memory usage..."
    
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$memory_usage" -lt 80 ]; then
        print_status "Memory usage is at ${memory_usage}% (healthy)"
        return 0
    elif [ "$memory_usage" -lt 90 ]; then
        print_warning "Memory usage is at ${memory_usage}% (warning)"
        return 1
    else
        print_error "Memory usage is at ${memory_usage}% (critical)"
        return 1
    fi
}

# Main health check function
main() {
    echo "🔍 DevOps Monitoring Health Check"
    echo "================================="
    echo ""
    
    local overall_status=0
    
    # Check Docker containers
    if ! check_containers; then
        overall_status=1
    fi
    echo ""
    
    # Check service endpoints
    if ! check_endpoints; then
        overall_status=1
    fi
    echo ""
    
    # Check metrics collection
    if ! check_metrics; then
        overall_status=1
    fi
    echo ""
    
    # Check logs
    if ! check_logs; then
        overall_status=1
    fi
    echo ""
    
    # Check system resources
    if ! check_disk_space; then
        overall_status=1
    fi
    
    if ! check_memory; then
        overall_status=1
    fi
    echo ""
    
    # Summary
    if [ $overall_status -eq 0 ]; then
        print_status "🎉 All health checks passed! Your monitoring stack is healthy."
        echo ""
        print_info "Access your monitoring tools:"
        echo "   🎨 DevOps Monitor UI: http://localhost:4000"
        echo "   📊 Grafana:           http://localhost:3000 (admin/admin)"
        echo "   📈 Prometheus:        http://localhost:9090"
        echo "   📜 Loki:              http://localhost:3100"
        echo "   🚨 Alertmanager:      http://localhost:9093"
        echo "   📊 cAdvisor:          http://localhost:8080"
        echo "   🔍 Node Exporter:     http://localhost:9100"
    else
        print_error "❌ Some health checks failed. Please review the issues above."
        echo ""
        print_info "Troubleshooting tips:"
        echo "   - Check service logs: docker compose logs [service-name]"
        echo "   - Restart services: docker compose restart"
        echo "   - Check port conflicts: netstat -tulpn | grep :PORT"
        echo "   - Verify Docker is running: docker info"
    fi
    
    exit $overall_status
}

# Run main function
main "$@"
