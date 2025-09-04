#!/bin/bash

# DevOps Monitoring in a Box - Stop Script
# This script stops the monitoring stack

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

echo "🛑 Stopping DevOps Monitoring in a Box..."
echo "========================================="

# Stop the services
echo "📦 Stopping monitoring services..."
docker compose down

echo ""
echo "✅ Monitoring stack has been stopped!"
echo ""
echo "💡 To start again, run: ./scripts/start.sh"
echo "   Or use: docker compose up -d"
