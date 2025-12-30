#!/bin/bash

# Build and Push Script for ui-next Docker Image
# Optimized for Next.js standalone builds

set -e

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
IMAGE_NAME="devops-monitoring-ui"
IMAGE_TAG="latest"
USE_BUILDX=false
PLATFORMS="linux/amd64"
PUSH_TO_REGISTRY=false
NO_CACHE=""
BUILD_CONTEXT="."

# Function to show help
show_help() {
    echo ""
    print_header "ui-next Docker Build and Push Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --username USERNAME    Docker Hub username (required for --push)"
    echo "  -i, --image IMAGE_NAME     Docker image name (default: devops-monitoring-ui)"
    echo "  -t, --tag TAG              Docker image tag (default: latest)"
    echo "  -x, --buildx               Use Docker Buildx for multi-platform builds"
    echo "  -p, --platforms PLATFORMS  Comma-separated platforms (default: linux/amd64)"
    echo "                             Example: linux/amd64,linux/arm64"
    echo "  --push                     Push image to Docker Hub registry"
    echo "  --no-cache                 Build without using cache"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --username myuser --tag v1.0.0 --push"
    echo "  $0 --username myuser --buildx --platforms linux/amd64,linux/arm64 --push"
    echo "  $0 --tag local --no-cache"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--username)
            DOCKER_USERNAME="$2"
            shift 2
            ;;
        -i|--image)
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

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_header "Building ui-next Docker Image"
echo ""
print_info "Image: $FULL_IMAGE_NAME"
print_info "Platforms: $PLATFORMS"
print_info "Build method: $([ "$USE_BUILDX" == true ] && echo "Docker Buildx" || echo "Standard Docker")"
print_info "Push to registry: $([ "$PUSH_TO_REGISTRY" == true ] && echo "Yes" || echo "No")"
print_info "Build context: $BUILD_CONTEXT"
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

# Verify Dockerfile exists
if [[ ! -f "Dockerfile" ]]; then
    print_error "Dockerfile not found in current directory"
    exit 1
fi

# Build the image
print_info "Starting build process..."
echo ""

if [[ "$USE_BUILDX" == true ]]; then
    # Use buildx for multi-platform builds with BuildKit cache
    BUILD_CMD="docker buildx build --platform $PLATFORMS $NO_CACHE -f Dockerfile -t $FULL_IMAGE_NAME"
    
    # Add build arguments for better buildx compatibility
    BUILD_CMD="$BUILD_CMD --build-arg NODE_OPTIONS=--max-old-space-size=4096"
    
    if [[ "$PUSH_TO_REGISTRY" == true ]]; then
        BUILD_CMD="$BUILD_CMD --push"
    else
        BUILD_CMD="$BUILD_CMD --load"
    fi
    
    # Add cache configuration
    BUILD_CMD="$BUILD_CMD --cache-from type=local,src=/tmp/.buildx-cache"
    BUILD_CMD="$BUILD_CMD --cache-to type=local,dest=/tmp/.buildx-cache,mode=max"
    
    print_info "Running buildx build with BuildKit cache optimizations..."
    print_info "Command: $BUILD_CMD"
    eval $BUILD_CMD
else
    # Use standard Docker build with BuildKit
    export DOCKER_BUILDKIT=1
    BUILD_CMD="docker build $NO_CACHE -t $FULL_IMAGE_NAME -f Dockerfile ."
    
    print_info "Running standard Docker build with BuildKit..."
    print_info "Command: $BUILD_CMD"
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
    docker images "$FULL_IMAGE_NAME" 2>/dev/null || echo "Image not found locally (may have been pushed only)"
    echo ""
    print_info "To run the container:"
    echo "  docker run -p 3000:3000 $FULL_IMAGE_NAME"
    echo ""
    print_info "Build optimizations applied:"
    echo "  ✓ BuildKit cache mounts for npm and Prisma"
    echo "  ✓ Multi-stage build for minimal image size"
    echo "  ✓ Non-root user for security"
    echo "  ✓ Health check included"
    echo "  ✓ Standalone Next.js output"
    
else
    print_error "Build failed!"
    echo ""
    exit 1
fi

