#!/bin/bash

# DevOps Monitoring Environment Setup Script
# This script sets up the environment for the monitoring stack

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites..."
    
    local missing_deps=()
    
    # Check Docker
    if command_exists docker; then
        print_status "Docker is installed"
        if docker info >/dev/null 2>&1; then
            print_status "Docker is running"
        else
            print_error "Docker is not running. Please start Docker first."
            missing_deps+=("docker-running")
        fi
    else
        print_error "Docker is not installed"
        missing_deps+=("docker")
    fi
    
    # Check Docker Compose
    if command_exists docker && docker compose version >/dev/null 2>&1; then
        print_status "Docker Compose is available"
    else
        print_error "Docker Compose is not available"
        missing_deps+=("docker-compose")
    fi
    
    # Check Node.js (optional for UI development)
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        print_status "Node.js is installed (version $node_version)"
    else
        print_warning "Node.js is not installed (UI development will not work)"
    fi
    
    # Check npm (optional for UI development)
    if command_exists npm; then
        local npm_version=$(npm --version)
        print_status "npm is installed (version $npm_version)"
    else
        print_warning "npm is not installed (UI development will not work)"
    fi
    
    # Check jq (for health checks)
    if command_exists jq; then
        print_status "jq is installed"
    else
        print_warning "jq is not installed (health checks may not work properly)"
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_info "Please install the missing dependencies and run this script again."
        return 1
    fi
    
    print_status "All prerequisites are met"
    return 0
}

# Function to create environment files
setup_environment() {
    print_header "Setting up environment files..."
    
    # Create root .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_status "Created .env file from env.example"
        else
            print_warning "env.example not found, creating basic .env file"
            cat > .env << EOF
# Site Configuration
SITE_NAME="DevOps Monitoring Dashboard"
SITE_URL="http://localhost:4000"
SITE_DESCRIPTION="Comprehensive DevOps monitoring solution"

# Docker Configuration
DOCKERHUB_USERNAME=yourusername

# Database Configuration
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:4000"
EOF
        fi
    else
        print_info ".env file already exists"
    fi
    
    # Create UI .env file if it doesn't exist
    if [ ! -f "ui-next/.env" ]; then
        if [ -f "ui-next/env.example" ]; then
            cp ui-next/env.example ui-next/.env
            print_status "Created ui-next/.env file from env.example"
        else
            print_warning "ui-next/env.example not found, creating basic ui-next/.env file"
            cat > ui-next/.env << EOF
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:4000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (optional)
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""
EOF
        fi
    else
        print_info "ui-next/.env file already exists"
    fi
    
    print_status "Environment files are ready"
}

# Function to setup Docker networks
setup_docker_networks() {
    print_header "Setting up Docker networks..."
    
    # Create monitoring network if it doesn't exist
    if ! docker network ls | grep -q "monitoring"; then
        docker network create monitoring
        print_status "Created monitoring network"
    else
        print_info "Monitoring network already exists"
    fi
    
    print_status "Docker networks are ready"
}

# Function to setup directories
setup_directories() {
    print_header "Setting up directories..."
    
    # Create necessary directories
    local dirs=(
        "prometheus_data"
        "grafana_data"
        "loki_data"
        "alertmanager_data"
        "ui-next/prisma"
        "ui-next/.next"
        "ui-next/node_modules"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_status "Created directory: $dir"
        else
            print_info "Directory already exists: $dir"
        fi
    done
    
    print_status "Directories are ready"
}

# Function to setup UI dependencies
setup_ui_dependencies() {
    print_header "Setting up UI dependencies..."
    
    if command_exists node && command_exists npm; then
        cd ui-next
        
        if [ ! -d "node_modules" ]; then
            print_info "Installing UI dependencies..."
            npm install
            
            if [ $? -eq 0 ]; then
                print_status "UI dependencies installed successfully"
            else
                print_error "Failed to install UI dependencies"
                return 1
            fi
        else
            print_info "UI dependencies already installed"
        fi
        
        # Generate Prisma client
        print_info "Generating Prisma client..."
        npx prisma generate
        
        if [ $? -eq 0 ]; then
            print_status "Prisma client generated successfully"
        else
            print_warning "Failed to generate Prisma client (database may not be available yet)"
        fi
        
        cd ..
    else
        print_warning "Node.js/npm not available, skipping UI setup"
    fi
    
    print_status "UI setup completed"
}

# Function to make scripts executable
setup_scripts() {
    print_header "Making scripts executable..."
    
    # Make all shell scripts executable
    chmod +x scripts/*.sh
    
    print_status "Scripts are now executable"
}

# Function to validate configuration
validate_configuration() {
    print_header "Validating configuration..."
    
    local errors=0
    
    # Check if .env files exist
    if [ ! -f ".env" ]; then
        print_error "Root .env file is missing"
        errors=$((errors + 1))
    fi
    
    if [ ! -f "ui-next/.env" ]; then
        print_error "UI .env file is missing"
        errors=$((errors + 1))
    fi
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml is missing"
        errors=$((errors + 1))
    fi
    
    # Check if required directories exist
    local required_dirs=("prometheus" "grafana" "loki" "alertmanager" "ui-next")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            print_error "Required directory missing: $dir"
            errors=$((errors + 1))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        print_status "Configuration is valid"
        return 0
    else
        print_error "Configuration has $errors errors"
        return 1
    fi
}

# Function to show next steps
show_next_steps() {
    print_header "Setup completed! Next steps:"
    echo ""
    print_info "1. Start the monitoring stack:"
    echo "   ./scripts/devops-monitor.sh start"
    echo ""
    print_info "2. Check service status:"
    echo "   ./scripts/devops-monitor.sh status"
    echo ""
    print_info "3. Run health check:"
    echo "   ./scripts/devops-monitor.sh health"
    echo ""
    print_info "4. Access your monitoring tools:"
    echo "   🎨 DevOps Monitor UI: http://localhost:4000"
    echo "   📊 Grafana:           http://localhost:3000 (admin/admin)"
    echo "   📈 Prometheus:        http://localhost:9090"
    echo "   📜 Loki:              http://localhost:3100"
    echo "   🚨 Alertmanager:      http://localhost:9093"
    echo ""
    print_info "5. For UI development:"
    echo "   ./scripts/devops-monitor.sh ui"
    echo ""
    print_info "6. For troubleshooting:"
    echo "   ./scripts/devops-monitor.sh logs"
    echo "   ./scripts/devops-monitor.sh health"
    echo ""
    print_status "Happy monitoring! 🚀"
}

# Main setup function
main() {
    echo "🚀 DevOps Monitoring Environment Setup"
    echo "======================================"
    echo ""
    
    # Check prerequisites
    if ! check_prerequisites; then
        print_error "Prerequisites check failed. Please install missing dependencies."
        exit 1
    fi
    echo ""
    
    # Setup environment files
    setup_environment
    echo ""
    
    # Setup Docker networks
    setup_docker_networks
    echo ""
    
    # Setup directories
    setup_directories
    echo ""
    
    # Setup scripts
    setup_scripts
    echo ""
    
    # Setup UI dependencies
    setup_ui_dependencies
    echo ""
    
    # Validate configuration
    if ! validate_configuration; then
        print_error "Configuration validation failed. Please check the errors above."
        exit 1
    fi
    echo ""
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"