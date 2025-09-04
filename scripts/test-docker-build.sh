#!/bin/bash

# Test Docker Build Script
# This script tests the Docker build locally

set -e

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

echo "🐳 Testing Docker Build for DevOps Monitoring Dashboard"
echo "======================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Build the Docker image
echo "🏗️  Building optimized Docker image (158MB)..."
docker build -t devops-monitoring-dashboard:test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    echo ""
    echo "📦 Image details:"
    docker images devops-monitoring-dashboard:test
    echo ""
    echo "🧪 To test the container:"
    echo "   docker run -p 3000:3000 devops-monitoring-dashboard:test"
    echo ""
    echo "🔍 To inspect the image:"
    echo "   docker inspect devops-monitoring-dashboard:test"
    echo ""
    echo "🗑️  To clean up:"
    echo "   docker rmi devops-monitoring-dashboard:test"
else
    echo "❌ Docker build failed!"
    echo "Check the error messages above for details."
    exit 1
fi
