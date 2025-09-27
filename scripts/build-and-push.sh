#!/bin/bash

# Build and Push Script for DevOps Monitoring Dashboard
# Supports both standard Docker build and buildx for multi-platform

set -e

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

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

# Default values
DOCKER_USERNAME=""
IMAGE_NAME="devops-monitoring-dashboard"
IMAGE_TAG="latest"
USE_BUILDX=false
PLATFORMS="linux/amd64"
PUSH_TO_REGISTRY=false

# Function to show help
show_help() {
    echo ""
    print_header "DevOps Monitoring Dashboard - Build and Push Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --username USERNAME    Docker Hub username (required for push)"
    echo "  -n, --name NAME           Image name (default: devops-monitoring-dashboard)"
    echo "  -t, --tag TAG             Image tag (default: latest)"
    echo "  -x, --buildx              Use Docker buildx for multi-platform builds"
    echo "  -p, --platforms PLATFORMS Comma-separated platforms (default: linux/amd64)"
    echo "  --push                    Push to registry after building"
    echo "  --no-cache                Build without cache"
    echo "  -h, --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -u myusername --push"
    echo "  $0 -u myusername -x --platforms linux/amd64,linux/arm64 --push"
    echo "  $0 -n my-dashboard -t v1.0.0"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--username)
            DOCKER_USERNAME="$2"
            shift 2
            ;;
        -n|--name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -x|--buildx)
            USE_BUILDX=true
            shift
            ;;
        -p|--platforms)
            PLATFORMS="$2"
            shift 2
            ;;
        --push)
            PUSH_TO_REGISTRY=true
            shift
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ "$PUSH_TO_REGISTRY" == true && -z "$DOCKER_USERNAME" ]]; then
    print_error "Docker username is required when using --push option"
    show_help
    exit 1
fi

# Set full image name
if [[ -n "$DOCKER_USERNAME" ]]; then
    FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
else
    FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"
fi

print_header "Building DevOps Monitoring Dashboard"
echo ""
print_info "Image: $FULL_IMAGE_NAME"
print_info "Platforms: $PLATFORMS"
print_info "Build method: $([ "$USE_BUILDX" == true ] && echo "Docker Buildx" || echo "Standard Docker")"
print_info "Push to registry: $([ "$PUSH_TO_REGISTRY" == true ] && echo "Yes" || echo "No")"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if buildx is available when requested
if [[ "$USE_BUILDX" == true ]]; then
    if ! docker buildx version &> /dev/null; then
        print_error "Docker buildx is not available. Please install buildx or use standard Docker build."
        exit 1
    fi
    
    # Create buildx builder if it doesn't exist
    if ! docker buildx inspect mybuilder &> /dev/null; then
        print_info "Creating buildx builder..."
        docker buildx create --name mybuilder --driver docker-container --use
        docker buildx inspect --bootstrap
    else
        docker buildx use mybuilder
    fi
fi

# Build the image
print_info "Starting build process..."
echo ""

if [[ "$USE_BUILDX" == true ]]; then
    # Use buildx for multi-platform builds with optimized Dockerfile
    BUILD_CMD="docker buildx build --platform $PLATFORMS $NO_CACHE -f Dockerfile.buildx -t $FULL_IMAGE_NAME"
    
    # Add build arguments for better buildx compatibility
    BUILD_CMD="$BUILD_CMD --build-arg NODE_OPTIONS=--max-old-space-size=2048"
    BUILD_CMD="$BUILD_CMD --build-arg NEXT_BUILD_WORKERS=1"
    
    if [[ "$PUSH_TO_REGISTRY" == true ]]; then
        BUILD_CMD="$BUILD_CMD --push"
    else
        BUILD_CMD="$BUILD_CMD --load"
    fi
    
    print_info "Running buildx build with optimizations for QEMU emulation..."
    print_info "Command: $BUILD_CMD"
    eval $BUILD_CMD
else
    # Use standard Docker build
    BUILD_CMD="docker build $NO_CACHE -t $FULL_IMAGE_NAME ."
    
    print_info "Running: $BUILD_CMD"
    eval $BUILD_CMD
    
    # Push if requested
    if [[ "$PUSH_TO_REGISTRY" == true ]]; then
        print_info "Pushing image to registry..."
        docker push "$FULL_IMAGE_NAME"
    fi
fi

# Check build result
if [[ $? -eq 0 ]]; then
    print_status "Build completed successfully!"
    echo ""
    
    if [[ "$PUSH_TO_REGISTRY" == true ]]; then
        print_status "Image pushed to registry: $FULL_IMAGE_NAME"
    else
        print_status "Image built locally: $FULL_IMAGE_NAME"
        echo ""
        print_info "To push to registry: docker push $FULL_IMAGE_NAME"
    fi
    
    echo ""
    print_info "Image details:"
    docker images "$FULL_IMAGE_NAME"
    echo ""
    print_info "To run the container:"
    echo "  docker run -p 3000:3000 $FULL_IMAGE_NAME"
    
else
    print_error "Build failed!"
    echo ""
    
    if [[ "$USE_BUILDX" == true ]]; then
        print_warning "Buildx build failed. This is often due to QEMU emulation issues."
        echo ""
        print_info "Troubleshooting options:"
        echo "  1. Use standard Docker build: $0 -u $DOCKER_USERNAME"
        echo "  2. Try single platform: $0 -u $DOCKER_USERNAME -x -p linux/amd64"
        echo "  3. Increase Docker Desktop memory to 8GB+"
        echo "  4. Try building without cache: $0 -u $DOCKER_USERNAME -x --no-cache"
        echo ""
        print_info "The buildx error is typically caused by:"
        echo "  • Insufficient memory in QEMU emulation"
        echo "  • Webpack build process running out of resources"
        echo "  • Architecture emulation issues"
        echo ""
        print_info "Recommended solution: Use standard Docker build for now"
        echo "  $0 -u $DOCKER_USERNAME --push"
    else
        print_info "Standard build failed. Check the error messages above."
        print_info "Common issues:"
        echo "  • Missing dependencies"
        echo "  • TypeScript compilation errors"
        echo "  • Prisma client generation issues"
    fi
    
    exit 1
fi
