# Quick fix script to resolve deployment issues
# Usage: .\fix-deployment.ps1

Write-Host "Fixing Employee Management App Deployment..." -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

$NAMESPACE = "employee-management"

Write-Host "Step 1: Deleting existing problematic resources..." -ForegroundColor Yellow
kubectl delete deployment backend-deployment -n $NAMESPACE --ignore-not-found
kubectl delete deployment frontend-deployment -n $NAMESPACE --ignore-not-found
kubectl delete secret azure-sql-secrets -n $NAMESPACE --ignore-not-found
kubectl delete configmap backend-config -n $NAMESPACE --ignore-not-found

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Step 2: IMPORTANT - Update your Azure SQL credentials!" -ForegroundColor Red
Write-Host "Run this command first:" -ForegroundColor Yellow
Write-Host "  .\update-azure-sql-credentials.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "OR manually edit: kubernetes/azure-sql-secrets.yaml" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Have you updated the Azure SQL credentials? (yes/no)"

if ($continue -ne "yes") {
    Write-Host "Please update the credentials first, then run this script again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Applying updated configurations..." -ForegroundColor Yellow

# Apply secrets
Write-Host "Applying secrets..." -ForegroundColor Cyan
kubectl apply -f kubernetes/azure-sql-secrets.yaml

# Apply configmap
Write-Host "Applying configmap..." -ForegroundColor Cyan
kubectl apply -f kubernetes/backend-configmap.yaml

Start-Sleep -Seconds 3

# Deploy backend
Write-Host "Deploying backend..." -ForegroundColor Cyan
kubectl apply -f kubernetes/backend-deployment.yaml

# Deploy frontend
Write-Host "Deploying frontend..." -ForegroundColor Cyan
kubectl apply -f kubernetes/frontend-deployment.yaml

Write-Host ""
Write-Host "Step 4: Waiting for pods to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "Current pod status:" -ForegroundColor Cyan
kubectl get pods -n $NAMESPACE

Write-Host ""
Write-Host "Checking for errors..." -ForegroundColor Yellow

# Check backend pod
$backendPod = kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[0].metadata.name}' 2>$null
if ($backendPod) {
    $status = kubectl get pod $backendPod -n $NAMESPACE -o jsonpath='{.status.phase}'
    Write-Host "Backend pod ($backendPod) status: $status" -ForegroundColor Cyan
    
    if ($status -ne "Running") {
        Write-Host ""
        Write-Host "Backend pod events:" -ForegroundColor Yellow
        kubectl describe pod $backendPod -n $NAMESPACE | Select-String -Pattern "Events:" -Context 0,20
    }
}

# Check frontend pod
$frontendPod = kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>$null
if ($frontendPod) {
    $status = kubectl get pod $frontendPod -n $NAMESPACE -o jsonpath='{.status.phase}'
    Write-Host "Frontend pod ($frontendPod) status: $status" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Fix completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To check logs:" -ForegroundColor Yellow
Write-Host "  kubectl logs -l app=backend -n $NAMESPACE --tail=50" -ForegroundColor White
Write-Host "  kubectl logs -l app=frontend -n $NAMESPACE --tail=50" -ForegroundColor White
