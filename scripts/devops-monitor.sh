#!/bin/bash

# DevOps Monitor - Complete Project Management Script
# This script provides easy access to all project functions

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
UI_DIR="$PROJECT_ROOT/ui-next"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${PURPLE}🎯 $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        return 1
    fi
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed"
        return 1
    fi
    
    # Check Node.js (for UI)
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed (UI development will not work)"
        print_info "Install Node.js from: https://nodejs.org/"
    fi
    
    # Check npm (for UI)
    if ! command -v npm &> /dev/null; then
        print_warning "npm is not installed (UI development will not work)"
    fi
    
    print_status "Prerequisites check completed"
    return 0
}

# Function to start the monitoring stack
start_monitoring() {
    print_header "Starting DevOps Monitoring Stack..."
    
    # Change to project root directory
    cd "$PROJECT_ROOT"
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in project root directory"
        return 1
    fi
    
    print_info "Starting all monitoring services..."
    docker compose up -d
    
    if [ $? -eq 0 ]; then
        print_status "Monitoring stack started successfully!"
        echo ""
        print_info "🌐 Access your monitoring tools:"
        echo "   🎨 DevOps Monitor UI: http://localhost:4000"
        echo "   📊 Grafana:           http://localhost:3000 (admin/admin)"
        echo "   📈 Prometheus:        http://localhost:9090"
        echo "   📜 Loki:              http://localhost:3100"
        echo "   🚨 Alertmanager:      http://localhost:9093"
        echo "   📊 cAdvisor:          http://localhost:8080"
        echo "   🔍 Node Exporter:     http://localhost:9100"
        echo ""
        print_info "Check service status: docker compose ps"
    else
        print_error "Failed to start monitoring stack"
        return 1
    fi
}

# Function to stop the monitoring stack
stop_monitoring() {
    print_header "Stopping DevOps Monitoring Stack..."
    
    # Change to project root directory
    cd "$PROJECT_ROOT"
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in project root directory"
        return 1
    fi
    
    print_info "Stopping all monitoring services..."
    docker compose down
    
    if [ $? -eq 0 ]; then
        print_status "Monitoring stack stopped successfully!"
    else
        print_error "Failed to stop monitoring stack"
        return 1
    fi
}

# Function to start UI development server
start_ui() {
    print_header "Starting UI Development Server..."
    
    if [ ! -d "$UI_DIR" ]; then
        print_error "UI directory not found at: $UI_DIR"
        return 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        return 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        return 1
    fi
    
    cd "$UI_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing UI dependencies..."
        npm install
    fi
    
    print_status "Starting UI development server..."
    print_info "🌐 UI will be available at: http://localhost:3001"
    print_info "📱 Auto-reload enabled for development"
    echo ""
    
    npm run dev -- -p 3001
}

# Function to build UI for production
build_ui() {
    print_header "Building UI for Production..."
    
    if [ ! -d "$UI_DIR" ]; then
        print_error "UI directory not found at: $UI_DIR"
        return 1
    fi
    
    cd "$UI_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing UI dependencies..."
        npm install
    fi
    
    print_info "Building production version..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "UI built successfully!"
        print_info "Production files are in: $UI_DIR/.next/"
    else
        print_error "Failed to build UI"
        return 1
    fi
}

# Function to show project status
show_status() {
    print_header "Project Status..."
    
    echo ""
    print_info "📁 Project Directory: $SCRIPT_DIR"
    print_info "🎨 UI Directory: $UI_DIR"
    echo ""
    
    # Check if monitoring stack is running
    # Change to project root directory
    cd "$PROJECT_ROOT"
    
    if [ -f "docker-compose.yml" ]; then
        print_info "Checking monitoring stack status..."
        docker compose ps
    else
        print_warning "docker-compose.yml not found"
    fi
    
    echo ""
    print_info "Available commands:"
    echo "  start     - Start the monitoring stack"
    echo "  stop      - Stop the monitoring stack"
    echo "  ui        - Start UI development server"
    echo "  build-ui  - Build UI for production"
    echo "  status    - Show project status"
    echo "  help      - Show this help message"
}

# Function to show help
show_help() {
    echo ""
    print_header "DevOps Monitor - Project Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     - Start the complete monitoring stack with Docker"
    echo "  stop      - Stop the monitoring stack"
    echo "  restart   - Restart the monitoring stack"
    echo "  ui        - Start the Next.js UI development server"
    echo "  build-ui  - Build the Next.js UI for production deployment"
    echo "  status    - Show current project and service status"
    echo "  logs      - Show logs from all services"
    echo "  clean     - Clean up Docker containers and volumes"
    echo "  health    - Run health check on all services"
    echo "  setup     - Setup environment and dependencies"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start monitoring stack"
    echo "  $0 ui         # Start UI development"
    echo "  $0 status     # Check project status"
    echo ""
    print_info "For more information, see README.md"
}

# Function to show logs
show_logs() {
    print_header "Showing Service Logs..."
    
    # Change to project root directory
    cd "$PROJECT_ROOT"
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in project root directory"
        return 1
    fi
    
    print_info "Showing logs from all services..."
    print_info "Press Ctrl+C to exit log view"
    echo ""
    
    docker compose logs -f
}

# Function to clean up
clean_up() {
    print_header "Cleaning Up Docker Resources..."
    
    # Change to project root directory
    cd "$PROJECT_ROOT"
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in project root directory"
        return 1
    fi
    
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Stopping and removing all services..."
        docker compose down -v --rmi all
        
        print_info "Removing any remaining containers..."
        docker container prune -f
        
        print_info "Removing any remaining networks..."
        docker network prune -f
        
        print_status "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

# Function to restart services
restart_services() {
    print_header "Restarting Monitoring Stack..."
    
    stop_monitoring
    if [ $? -eq 0 ]; then
        start_monitoring
    fi
}

# Main script logic
main() {
    case "${1:-help}" in
        start)
            check_prerequisites && start_monitoring
            ;;
        stop)
            stop_monitoring
            ;;
        restart)
            restart_services
            ;;
        ui)
            start_ui
            ;;
        build-ui)
            build_ui
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        clean)
            clean_up
            ;;
        health)
            ./scripts/health-check.sh
            ;;
        setup)
            ./scripts/setup-env.sh
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
