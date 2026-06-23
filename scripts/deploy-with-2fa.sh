#!/bin/bash
# Deploy Employee Management App with 2FA Support
# This script checks prerequisites and guides through deployment

set -e

echo "=========================================="
echo "Employee Management App - 2FA Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker installed: $DOCKER_VERSION"
else
    print_error "Docker not found"
    echo "Please install Docker Desktop and enable WSL 2 integration"
    echo "Visit: https://docs.docker.com/desktop/wsl/"
    exit 1
fi

# Check Docker daemon
if docker info &> /dev/null; then
    print_success "Docker daemon running"
else
    print_error "Docker daemon not running"
    echo "Please start Docker Desktop"
    exit 1
fi

# Check kubectl
if command -v kubectl &> /dev/null; then
    KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null || kubectl version --client)
    print_success "kubectl installed: $KUBECTL_VERSION"
else
    print_warning "kubectl not found (optional for local testing)"
fi

# Check Maven
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn --version | head -n 1)
    print_success "Maven installed: $MVN_VERSION"
else
    print_warning "Maven not found (using Maven wrapper)"
fi

echo ""
echo "=========================================="
echo "Configuration"
echo "=========================================="
echo ""

# Get configuration
read -p "Enter Docker registry username (default: abhayt0512): " DOCKER_REGISTRY
DOCKER_REGISTRY=${DOCKER_REGISTRY:-abhayt0512}

read -p "Enter image tag (default: v2.0.0-2fa): " IMAGE_TAG
IMAGE_TAG=${IMAGE_TAG:-v2.0.0-2fa}

read -p "Enter deployment environment [blue/green] (default: blue): " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-blue}

echo ""
print_info "Docker Registry: $DOCKER_REGISTRY"
print_info "Image Tag: $IMAGE_TAG"
print_info "Environment: $ENVIRONMENT"
echo ""

read -p "Continue with these settings? (y/n): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "=========================================="
echo "Step 1: Building Backend"
echo "=========================================="
echo ""

cd backend
print_info "Compiling backend with Maven..."
./mvnw clean compile -DskipTests

if [ $? -eq 0 ]; then
    print_success "Backend compiled successfully"
else
    print_error "Backend compilation failed"
    exit 1
fi

cd ..

echo ""
echo "=========================================="
echo "Step 2: Building Docker Images"
echo "=========================================="
echo ""

BACKEND_IMAGE="$DOCKER_REGISTRY/employee-management-backend:$IMAGE_TAG"
FRONTEND_IMAGE="$DOCKER_REGISTRY/employee-management-frontend:$IMAGE_TAG"

print_info "Building backend image: $BACKEND_IMAGE"
docker build --platform linux/amd64 -t "$BACKEND_IMAGE" backend/

if [ $? -eq 0 ]; then
    print_success "Backend image built"
else
    print_error "Backend image build failed"
    exit 1
fi

print_info "Building frontend image: $FRONTEND_IMAGE"
docker build --platform linux/amd64 \
    --build-arg REACT_APP_API_URL="http://backend-service:8080/api" \
    --build-arg REACT_APP_SUPABASE_URL="https://xckjxmcoofrgdqatevfo.supabase.co" \
    --build-arg REACT_APP_SUPABASE_ANON_KEY="sb_publishable_Qf0XEnHWcON6zXUzIO-uAQ_S61wUA6A" \
    -t "$FRONTEND_IMAGE" \
    frontend/

if [ $? -eq 0 ]; then
    print_success "Frontend image built"
else
    print_error "Frontend image build failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Step 3: Pushing Images to Registry"
echo "=========================================="
echo ""

read -p "Push images to Docker registry? (y/n): " PUSH_CONFIRM
if [[ $PUSH_CONFIRM =~ ^[Yy]$ ]]; then
    print_info "Pushing backend image..."
    docker push "$BACKEND_IMAGE"
    
    if [ $? -eq 0 ]; then
        print_success "Backend image pushed"
    else
        print_error "Backend image push failed"
        exit 1
    fi
    
    print_info "Pushing frontend image..."
    docker push "$FRONTEND_IMAGE"
    
    if [ $? -eq 0 ]; then
        print_success "Frontend image pushed"
    else
        print_error "Frontend image push failed"
        exit 1
    fi
else
    print_warning "Skipping image push"
fi

echo ""
echo "=========================================="
echo "Step 4: Database Migration"
echo "=========================================="
echo ""

print_warning "IMPORTANT: Update your database schema before deploying!"
echo ""
echo "Run this SQL on your database:"
echo ""
echo "-- PostgreSQL / Supabase"
echo "ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);"
echo "ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;"
echo ""
echo "-- MySQL"
echo "ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);"
echo "ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;"
echo ""
echo "-- Azure SQL"
echo "ALTER TABLE users ADD two_factor_secret NVARCHAR(255);"
echo "ALTER TABLE users ADD two_factor_enabled BIT DEFAULT 0;"
echo ""

read -p "Have you updated the database schema? (y/n): " DB_CONFIRM
if [[ ! $DB_CONFIRM =~ ^[Yy]$ ]]; then
    print_error "Please update database schema before deploying"
    exit 1
fi

echo ""
echo "=========================================="
echo "Step 5: Kubernetes Deployment"
echo "=========================================="
echo ""

if command -v kubectl &> /dev/null; then
    read -p "Deploy to Kubernetes cluster? (y/n): " K8S_CONFIRM
    if [[ $K8S_CONFIRM =~ ^[Yy]$ ]]; then
        print_info "Deploying to Kubernetes..."
        ./scripts/deploy-blue-green.sh "$ENVIRONMENT" "$IMAGE_TAG" "$DOCKER_REGISTRY"
        
        if [ $? -eq 0 ]; then
            print_success "Deployment completed"
        else
            print_error "Deployment failed"
            exit 1
        fi
    else
        print_warning "Skipping Kubernetes deployment"
    fi
else
    print_warning "kubectl not available, skipping Kubernetes deployment"
fi

echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo ""
print_success "Backend image: $BACKEND_IMAGE"
print_success "Frontend image: $FRONTEND_IMAGE"
print_success "Environment: $ENVIRONMENT"
echo ""
print_info "Next steps:"
echo "  1. Verify pods are running: kubectl get pods"
echo "  2. Check logs: kubectl logs -l app=backend"
echo "  3. Test 2FA functionality:"
echo "     - Register a new user"
echo "     - Enable 2FA from profile"
echo "     - Test login with 2FA"
echo ""
print_info "Documentation:"
echo "  - 2FA Setup Guide: 2FA_SETUP.md"
echo "  - Deployment Guide: DEPLOYMENT_GUIDE.md"
echo "  - Implementation Summary: 2FA_IMPLEMENTATION_SUMMARY.md"
echo ""
print_success "Deployment script completed!"
echo ""
