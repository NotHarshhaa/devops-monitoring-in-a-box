#!/bin/bash

# DevOps Monitoring Health Check Script
# This script checks the health of all monitoring services

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}🎯 $1${NC}"
}

print_section() {
    echo -e "${CYAN}📋 $1${NC}"
}

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
    local timeout=${4:-10}
    
    print_info "Checking $service_name at $url..."
    
    # Use curl with timeout and follow redirects
    local response=$(curl -s --max-time "$timeout" -L -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    local curl_exit_code=$?
    
    if [ $curl_exit_code -eq 0 ] && echo "$response" | grep -q "$expected_status"; then
        print_status "$service_name is healthy (HTTP $response)"
        return 0
    else
        if [ $curl_exit_code -ne 0 ]; then
            print_error "$service_name connection failed (curl error: $curl_exit_code)"
        else
            print_error "$service_name returned HTTP $response (expected $expected_status)"
        fi
        return 1
    fi
}

# Function to check Docker containers
check_containers() {
    print_section "Checking Docker Containers..."
    
    # Change to project root directory
    cd "$PROJECT_ROOT"
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running"
        return 1
    fi
    
    local containers=("prometheus" "grafana" "loki" "alertmanager" "node-exporter" "cadvisor" "promtail" "devops-monitor-ui")
    local all_healthy=true
    local running_count=0
    
    print_info "Checking container status..."
    
    for container in "${containers[@]}"; do
        local container_info=$(docker ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "$container" || true)
        
        if echo "$container_info" | grep -q "Up"; then
            local status=$(echo "$container_info" | cut -f2)
            local ports=$(echo "$container_info" | cut -f3)
            print_status "$container is running ($status) - Ports: $ports"
            ((running_count++))
        else
            print_error "$container is not running"
            all_healthy=false
            
            # Check if container exists but is stopped
            if docker ps -a --format "{{.Names}}" | grep -q "$container"; then
                local stopped_info=$(docker ps -a --format "{{.Names}}\t{{.Status}}" | grep "$container")
                print_warning "$container exists but stopped: $(echo "$stopped_info" | cut -f2)"
            else
                print_warning "$container container not found"
            fi
        fi
    done
    
    echo ""
    print_info "Container Summary: $running_count/${#containers[@]} containers running"
    
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
    print_section "Checking Service Endpoints..."
    
    local all_healthy=true
    local healthy_count=0
    local total_checks=0
    
    # Service endpoints to check
    declare -A services=(
        ["Prometheus"]="http://localhost:9090/-/healthy"
        ["Grafana"]="http://localhost:3000/api/health"
        ["Loki"]="http://localhost:3100/ready"
        ["Alertmanager"]="http://localhost:9093/-/healthy"
        ["DevOps Monitor UI"]="http://localhost:4000"
        ["cAdvisor"]="http://localhost:8080/healthz"
        ["Node Exporter"]="http://localhost:9100/metrics"
        ["Promtail"]="http://localhost:9080/metrics"
    )
    
    for service in "${!services[@]}"; do
        ((total_checks++))
        if check_service "$service" "${services[$service]}" 200 10; then
            ((healthy_count++))
        else
            all_healthy=false
        fi
    done
    
    echo ""
    print_info "Endpoint Summary: $healthy_count/$total_checks endpoints healthy"
    
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
    print_section "Checking Metrics Collection..."
    
    # Check if Prometheus is collecting metrics
    print_info "Checking Prometheus metrics collection..."
    
    local prometheus_response=$(curl -s --max-time 10 "http://localhost:9090/api/v1/query?query=up" 2>/dev/null)
    local curl_exit_code=$?
    
    if [ $curl_exit_code -ne 0 ]; then
        print_error "Failed to connect to Prometheus API"
        return 1
    fi
    
    # Check if jq is available for JSON parsing
    if command -v jq >/dev/null 2>&1; then
        local metrics_count=$(echo "$prometheus_response" | jq -r '.data.result | length' 2>/dev/null || echo "0")
        local status=$(echo "$prometheus_response" | jq -r '.status' 2>/dev/null || echo "error")
        
        if [ "$status" = "success" ] && [ "$metrics_count" -gt 0 ]; then
            print_status "Prometheus API is healthy and collecting $metrics_count metrics"
            
            # Show some example metrics
            print_info "Active targets:"
            echo "$prometheus_response" | jq -r '.data.result[] | "  - \(.instance): \(.value[1])"' 2>/dev/null | head -5 || true
            
            return 0
        else
            print_error "Prometheus API returned status: $status, metrics: $metrics_count"
            return 1
        fi
    else
        # Fallback if jq is not available
        if echo "$prometheus_response" | grep -q '"status":"success"'; then
            print_status "Prometheus API is healthy (jq not available for detailed analysis)"
            return 0
        else
            print_error "Prometheus API response indicates issues"
            return 1
        fi
    fi
}

# Function to check logs
check_logs() {
    print_section "Checking Service Logs..."
    
    local services=("prometheus" "grafana" "loki" "alertmanager" "devops-monitor-ui")
    local has_errors=false
    local total_errors=0
    
    for service in "${services[@]}"; do
        print_info "Checking $service logs..."
        
        # Check if container exists
        if docker ps --format "{{.Names}}" | grep -q "$service"; then
            # Get recent log lines (last 50 lines)
            local recent_logs=$(docker logs --tail 50 "$service" 2>&1)
            local error_count=$(echo "$recent_logs" | grep -iE "error|fatal|panic|failed|exception" | wc -l)
            local warning_count=$(echo "$recent_logs" | grep -iE "warning|warn" | wc -l)
            
            if [ "$error_count" -gt 0 ]; then
                print_error "$service has $error_count error messages in recent logs"
                # Show last few errors
                echo "$recent_logs" | grep -iE "error|fatal|panic|failed|exception" | tail -3 | sed 's/^/    /'
                has_errors=true
                total_errors=$((total_errors + error_count))
            elif [ "$warning_count" -gt 2 ]; then
                print_warning "$service has $warning_count warning messages in recent logs"
            else
                print_status "$service logs look clean"
            fi
        else
            print_warning "$service container not found - cannot check logs"
        fi
    done
    
    echo ""
    print_info "Log Summary: $total_errors total errors found"
    
    if [ "$has_errors" = false ]; then
        print_status "All service logs are clean"
        return 0
    else
        print_warning "Some services have errors in logs (check with: docker compose logs [service-name])"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    print_section "Checking System Resources..."
    
    print_info "Checking disk space..."
    
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    local available=$(df -h / | awk 'NR==2 {print $4}')
    
    if [ "$usage" -lt 80 ]; then
        print_status "Disk usage is at ${usage}% (${available} available) - Healthy"
        return 0
    elif [ "$usage" -lt 90 ]; then
        print_warning "Disk usage is at ${usage}% (${available} available) - Warning"
        return 1
    else
        print_error "Disk usage is at ${usage}% (${available} available) - Critical"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    print_info "Checking memory usage..."
    
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    local available=$(free -h | awk 'NR==2 {print $7}')
    
    if [ "$memory_usage" -lt 80 ]; then
        print_status "Memory usage is at ${memory_usage}% (${available} available) - Healthy"
        return 0
    elif [ "$memory_usage" -lt 90 ]; then
        print_warning "Memory usage is at ${memory_usage}% (${available} available) - Warning"
        return 1
    else
        print_error "Memory usage is at ${memory_usage}% (${available} available) - Critical"
        return 1
    fi
}

# Function to check Docker compose configuration
check_compose_config() {
    print_section "Checking Docker Compose Configuration..."
    
    # Change to project root directory
    cd "$PROJECT_ROOT"
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found"
        return 1
    fi
    
    # Validate compose file
    if docker compose config >/dev/null 2>&1; then
        print_status "Docker Compose configuration is valid"
        return 0
    else
        print_error "Docker Compose configuration has errors"
        docker compose config 2>&1 | head -10 | sed 's/^/    /'
        return 1
    fi
}

# Function to check port availability
check_ports() {
    print_section "Checking Port Availability..."
    
    declare -A ports=(
        ["Prometheus"]="9090"
        ["Grafana"]="3000"
        ["Loki"]="3100"
        ["Alertmanager"]="9093"
        ["DevOps Monitor UI"]="4000"
        ["cAdvisor"]="8080"
        ["Node Exporter"]="9100"
        ["Promtail"]="9080"
    )
    
    local all_available=true
    
    for service in "${!ports[@]}"; do
        local port=${ports[$service]}
        if netstat -tulpn 2>/dev/null | grep -q ":$port " || ss -tulpn 2>/dev/null | grep -q ":$port "; then
            print_status "Port $port ($service) is in use"
        else
            print_warning "Port $port ($service) is not in use"
            # Check if this is expected (service might be down)
        fi
    done
    
    return 0
}

# Main health check function
main() {
    echo ""
    print_header "🔍 DevOps Monitoring Health Check"
    echo "=================================================="
    echo ""
    
    local overall_status=0
    local check_count=0
    local passed_count=0
    
    # Check Docker compose configuration
    ((check_count++))
    if check_compose_config; then
        ((passed_count++))
    else
        overall_status=1
    fi
    echo ""
    
    # Check Docker containers
    ((check_count++))
    if check_containers; then
        ((passed_count++))
    else
        overall_status=1
    fi
    echo ""
    
    # Check service endpoints
    ((check_count++))
    if check_endpoints; then
        ((passed_count++))
    else
        overall_status=1
    fi
    echo ""
    
    # Check metrics collection
    ((check_count++))
    if check_metrics; then
        ((passed_count++))
    else
        overall_status=1
    fi
    echo ""
    
    # Check logs
    ((check_count++))
    if check_logs; then
        ((passed_count++))
    else
        overall_status=1
    fi
    echo ""
    
    # Check system resources
    ((check_count++))
    if check_disk_space && check_memory; then
        ((passed_count++))
    else
        overall_status=1
    fi
    echo ""
    
    # Check ports
    ((check_count++))
    check_ports
    ((passed_count++))
    echo ""
    
    # Summary
    print_header "📊 Health Check Summary"
    echo "========================"
    print_info "Checks Passed: $passed_count/$check_count"
    echo ""
    
    if [ $overall_status -eq 0 ]; then
        print_status "🎉 All health checks passed! Your monitoring stack is healthy."
        echo ""
        print_info "🌐 Access your monitoring tools:"
        echo "   🎨 DevOps Monitor UI: http://localhost:4000"
        echo "   📊 Grafana:           http://localhost:3000 (admin/admin)"
        echo "   📈 Prometheus:        http://localhost:9090"
        echo "   📜 Loki:              http://localhost:3100"
        echo "   🚨 Alertmanager:      http://localhost:9093"
        echo "   📊 cAdvisor:          http://localhost:8080"
        echo "   🔍 Node Exporter:     http://localhost:9100"
        echo "   📝 Promtail:          http://localhost:9080/metrics"
    else
        print_error "❌ Some health checks failed. Please review the issues above."
        echo ""
        print_info "🔧 Troubleshooting tips:"
        echo "   - Check service logs: docker compose logs [service-name]"
        echo "   - Restart services: docker compose restart [service-name]"
        echo "   - Check port conflicts: netstat -tulpn | grep :PORT"
        echo "   - Verify Docker is running: docker info"
        echo "   - Check compose file: docker compose config"
        echo "   - Rebuild services: docker compose up -d --force-recreate"
        echo "   - Clean and restart: docker compose down && docker compose up -d"
    fi
    echo ""
    
    exit $overall_status
}

# Run main function
main "$@"
