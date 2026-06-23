#!/bin/bash
# Blue-Green Deployment Script
# Usage: ./deploy-blue-green.sh <target-version> <image-tag> [docker-registry]
# Example: ./deploy-blue-green.sh green v1.2.3 abhayt0512

set -e

TARGET_VERSION=$1
IMAGE_TAG=$2
DOCKER_REGISTRY=${3:-${DOCKER_REGISTRY:-"abhayt0512"}}

if [ -z "$TARGET_VERSION" ] || [ -z "$IMAGE_TAG" ]; then
    echo "Usage: $0 <target-version> <image-tag> [docker-registry]"
    echo "Example: $0 green v1.2.3 abhayt0512"
    exit 1
fi

if [ "$TARGET_VERSION" != "blue" ] && [ "$TARGET_VERSION" != "green" ]; then
    echo "Error: Target version must be either 'blue' or 'green'"
    exit 1
fi

export DOCKER_REGISTRY IMAGE_TAG

echo "==========================================="
echo "Blue-Green Deployment"
echo "==========================================="
echo "Target Version : $TARGET_VERSION"
echo "Image Tag      : $IMAGE_TAG"
echo "Docker Registry: $DOCKER_REGISTRY"
echo "==========================================="

cd "$(dirname "$0")/../kubernetes"

# Apply base resources
echo "Applying base Kubernetes resources..."
kubectl apply -f configmap-production.yaml
kubectl apply -f rbac.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml
kubectl apply -f network-policy.yaml

# Apply services
echo "Applying services..."
kubectl apply -f backend-service-production.yaml
kubectl apply -f frontend-service-production.yaml

# Ensure backend-secrets exist
if ! kubectl get secret backend-secrets &>/dev/null; then
    echo ""
    echo "ERROR: 'backend-secrets' not found in the cluster."
    echo "Create it first:"
    echo ""
    echo "  kubectl create secret generic backend-secrets \\"
    echo "    --from-literal=db-url=\"jdbc:postgresql://db.xckjxmcoofrgdqatevfo.supabase.co:5432/postgres\" \\"
    echo "    --from-literal=db-username=\"postgres\" \\"
    echo "    --from-literal=db-password=\"<YOUR_SUPABASE_DB_PASSWORD>\" \\"
    echo "    --from-literal=jwt-secret=\"<RANDOM_SECRET>\""
    echo ""
    exit 1
fi

# Deploy to target version
echo "Deploying backend and frontend to '$TARGET_VERSION'..."
envsubst < backend-deployment-$TARGET_VERSION.yaml  | kubectl apply -f -
envsubst < frontend-deployment-$TARGET_VERSION.yaml | kubectl apply -f -

# Wait for deployments to be ready
echo "Waiting for deployments to be ready (up to 5 min)..."
kubectl wait --for=condition=available --timeout=300s \
    deployment/backend-deployment-$TARGET_VERSION

kubectl wait --for=condition=available --timeout=300s \
    deployment/frontend-deployment-$TARGET_VERSION

# Health check
echo "Running health checks..."
sleep 15

BACKEND_READY=$(kubectl get deployment backend-deployment-$TARGET_VERSION \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
FRONTEND_READY=$(kubectl get deployment frontend-deployment-$TARGET_VERSION \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")

echo "Backend  $TARGET_VERSION ready replicas: $BACKEND_READY"
echo "Frontend $TARGET_VERSION ready replicas: $FRONTEND_READY"

if [ "${BACKEND_READY:-0}" -lt "1" ] || [ "${FRONTEND_READY:-0}" -lt "1" ]; then
    echo "ERROR: Deployment failed — not enough ready replicas."
    exit 1
fi

echo ""
echo "==========================================="
echo "Deployment to '$TARGET_V