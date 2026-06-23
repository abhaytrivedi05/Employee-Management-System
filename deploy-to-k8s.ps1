# Employee Management App - Kubernetes Deployment Script with Azure SQL
# Usage: .\deploy-to-k8s.ps1

Write-Host "Starting deployment of Employee Management App to Kubernetes with Azure SQL..." -ForegroundColor Green

# Configuration
$NAMESPACE = "employee-management"
$IMAGE_TAG = "v1"

Write-Host "Step 1: Building Docker images..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

# Build backend image
Write-Host "Building backend image..." -ForegroundColor Cyan
docker build -t abhayt0512/employee-management-app:$IMAGE_TAG ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend image build failed!" -ForegroundColor Red
    exit 1
}

# Build frontend image
Write-Host "Building frontend image..." -ForegroundColor Cyan
docker build -t abhayt0512/employee-frontend:$IMAGE_TAG ./frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend image build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 2: Pushing images to registry..." -ForegroundColor Yellow
docker push abhayt0512/employee-management-app:$IMAGE_TAG
docker push abhayt0512/employee-frontend:$IMAGE_TAG

Write-Host "Step 3: Applying Kubernetes configurations..." -ForegroundColor Yellow

# Create namespace
kubectl apply -f kubernetes/namespace.yaml

# Apply secrets (make sure to update azure-sql-secrets.yaml with your actual credentials first)
Write-Host "IMPORTANT: Make sure you've updated kubernetes/azure-sql-secrets.yaml with your actual Azure SQL credentials!" -ForegroundColor Red
kubectl apply -f kubernetes/azure-sql-secrets.yaml

# Apply configmap
kubectl apply -f kubernetes/backend-configmap.yaml

# Deploy backend
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

# Deploy frontend
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml

Write-Host "Step 4: Checking deployment status..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check pods
Write-Host "Pods status:" -ForegroundColor Cyan
kubectl get pods -n $NAMESPACE

# Check services
Write-Host "Services:" -ForegroundColor Cyan
kubectl get services -n $NAMESPACE

# Check deployments
Write-Host "Deployments:" -ForegroundColor Cyan
kubectl get deployments -n $NAMESPACE

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "To access your application:" -ForegroundColor Yellow
Write-Host "- If using NodePort: http://<your-node-ip>:30080" -ForegroundColor White
Write-Host "- For local testing, run: kubectl port-forward service/frontend-service 3000:3001 -n $NAMESPACE" -ForegroundColor White
Write-Host "- Then access at: http://localhost:3000" -ForegroundColor White
