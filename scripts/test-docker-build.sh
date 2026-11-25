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

# Build the Docker image (the Dockerfile lives in ui-next/, so point the
# build at that context explicitly)
echo "🏗️  Building optimized Docker image..."
if docker build -f ui-next/Dockerfile -t devops-monitoring-dashboard:test ui-next; then
    echo "✅ Docker build successful!"
    echo ""
    echo "📦 Image details:"
    docker images devops-monitoring-dashboard:test
    echo ""
    if command -v trivy &> /dev/null; then
        echo "🛡️  Scanning image with Trivy (0 CVEs required)..."
        trivy image --exit-code 1 --severity CRITICAL,HIGH,MEDIUM,LOW --scanners vuln,secret devops-monitoring-dashboard:test
    fi
    if docker scout version &> /dev/null; then
        echo "🛡️  Scanning image with Docker Scout..."
        docker scout cves --only-severity critical,high,medium,low --exit-code devops-monitoring-dashboard:test
    fi
    echo ""
    echo "🧪 To test the container (hardened read-only runtime):"
    echo "   docker run --rm -p 4000:3000 --read-only --cap-drop=ALL --security-opt=no-new-privileges:true --tmpfs /tmp:rw,noexec,nosuid,size=64m --tmpfs /app/.next/cache:rw,noexec,nosuid,uid=65532,gid=65532,size=64m -e NEXTAUTH_SECRET=local-test-secret-at-least-32-chars -e NEXTAUTH_URL=http://localhost:4000 -e ENABLE_DEMO_AUTH=true devops-monitoring-dashboard:test"
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
