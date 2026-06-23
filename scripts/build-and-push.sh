#!/bin/bash
# Build and push Docker images to Docker Hub (or any registry)
# Usage: ./build-and-push.sh <image-tag> [docker-registry]
# Example: ./build-and-push.sh v1.2.3 abhayt0512

set -e

IMAGE_TAG=${1:-"latest"}
DOCKER_REGISTRY=${2:-${DOCKER_REGISTRY:-"abhayt0512"}}

BACKEND_IMAGE="$DOCKER_REGISTRY/employee-management-backend:$IMAGE_TAG"
FRONTEND_IMAGE="$DOCKER_REGISTRY/employee-management-frontend:$IMAGE_TAG"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."

echo "==========================================="
echo "Building images"
echo "Registry : $DOCKER_REGISTRY"
echo "Tag      : $IMAGE_TAG"
echo "==========================================="

# --- Backend ---
echo "Building backend: $BACKEND_IMAGE"
docker build --platform linux/amd64 \
    -t "$BACKEND_IMAGE" \
    "$ROOT_DIR/backend"

# --- Frontend ---
# Supabase env vars are baked in at build time.
# Override REACT_APP_API_URL to point at your cluster's backend service
# (e.g. the LoadBalancer DNS or an Ingress hostname).
REACT_APP_API_URL=${REACT_APP_API_URL:-"http://backend-service:8080/api"}

echo "Building frontend: $FRONTEND_IMAGE"
docker build --platform linux/amd64 \
    --build-arg REACT_APP_API_URL="$REACT_APP_API_URL" \
    --build-arg REACT_APP_SUPABASE_URL="https://xckjxmcoofrgdqatevfo.supabase.co" \
    --build-arg REACT_APP_SUPABASE_ANON_KEY="sb_publishable_Qf0XEnHWcON6zXUzIO-uAQ_S61wUA6A" \
    -t "$FRONTEND_IMAGE" \
    "$ROOT_DIR/frontend"

# --- Push ---
echo "Pushing images..."
docker push "$BACKEND_IMAGE"
docker push "$FRONTEND_IMAGE"

echo ""
echo "==========================================="
echo "Done. Images pushed:"
echo "  $BACKEND_IMAGE"
echo "  $FRONTEND_IMAGE"
echo ""
echo "Next: set your Supabase DB password in the cluster secret, then deploy:"
echo "  kubectl create secret generic backend-secrets \\"
echo "    --from-literal=db-url=\"jdbc:postgresql://db.xckjxmcoofrgdqatevfo.supabase.co:5432/postgres\" \\"
echo "    --from-literal=db-username=\"postgres\" \\"
echo "    --from-literal=db-password=\"<YOUR_SUPABASE_DB_PASSWORD>\" \\"
echo "    --from-literal=jwt-secret=\"\$(openssl rand -base64 32)\""
echo ""
echo "  ./deploy-blue-green.sh blue $IMAGE_TAG $DOCKER_REGISTRY"
echo "==========================================="
