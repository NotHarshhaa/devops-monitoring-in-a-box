#!/bin/bash

# DevOps Monitoring Dashboard - Full Stack Startup Script
# This script starts the complete monitoring stack using Docker Compose

set -e

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

echo "🚀 Starting DevOps Monitoring Dashboard - Full Stack"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from example..."
    if [ -f env.example ]; then
        # env.example (not docker-compose.env.example) carries the secrets the
        # stack hard-requires: NEXTAUTH_SECRET and ALERT_WEBHOOK_TOKEN.
        cp env.example .env
        echo "✏️  Generated secrets placeholder .env. Please edit .env, or run scripts/setup-env.sh to generate the required secrets."
        echo ""
        read -p "Press Enter to continue, or Ctrl+C to edit .env first..."
    elif [ -f docker-compose.env.example ]; then
        cp docker-compose.env.example .env
        echo "📝 Please edit .env file with your Docker Hub username and other settings."
        echo "   Current DOCKERHUB_USERNAME: $(grep DOCKERHUB_USERNAME .env | cut -d'=' -f2)"
        echo ""
        read -p "Press Enter to continue with default settings, or Ctrl+C to edit .env first..."
    else
        echo "❌ env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# The compose file mounts ./alertmanager/webhook_token read-only; create it
# from ALERT_WEBHOOK_TOKEN if it is missing so startup does not fail.
if [ ! -f alertmanager/webhook_token ] && [ -f .env ]; then
    TOKEN_VALUE="$(grep -E '^ALERT_WEBHOOK_TOKEN=' .env | head -1 | cut -d'=' -f2- | tr -d '\"')"
    if [ -n "$TOKEN_VALUE" ]; then
        printf '%s' "$TOKEN_VALUE" > alertmanager/webhook_token
        echo "🔑 Created alertmanager/webhook_token from ALERT_WEBHOOK_TOKEN."
    fi
fi

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker compose pull

# Start the services
echo "🏗️  Starting monitoring stack..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
echo "=================="
docker compose ps

echo ""
echo "🎉 DevOps Monitoring Dashboard is starting up!"
echo ""
echo "📱 Access Points:"
echo "   • Dashboard (UI): http://localhost:4000"
echo "   • Grafana:        http://localhost:3000 (admin/admin)"
echo "   • Prometheus:     http://localhost:9090"
echo "   • Loki:           http://localhost:3100"
echo "   • Alertmanager:   http://localhost:9093"
echo "   • Node Exporter:  http://localhost:9100"
echo "   • cAdvisor:       http://localhost:8080"
echo ""
echo "📋 Useful Commands:"
echo "   • View logs:     docker compose logs -f"
echo "   • Stop services: docker compose down"
echo "   • Restart:       docker compose restart"
echo ""
echo "🔍 To view logs for a specific service:"
echo "   docker compose logs -f devops-monitor-ui"
echo "   docker compose logs -f prometheus"
echo "   docker compose logs -f grafana"
echo ""
echo "✨ Happy monitoring!"
