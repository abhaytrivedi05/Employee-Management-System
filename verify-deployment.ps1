# Employee Management App - Deployment Verification Script
# Usage: .\verify-deployment.ps1

Write-Host "Verifying Employee Management App deployment..." -ForegroundColor Green

$NAMESPACE = "employee-management"

Write-Host "Checking namespace..." -ForegroundColor Yellow
kubectl get namespace $NAMESPACE
if ($LASTEXITCODE -ne 0) {
    Write-Host "Namespace $NAMESPACE does not exist!" -ForegroundColor Red
    exit 1
}

Write-Host "`nChecking pods..." -ForegroundColor Yellow
kubectl get pods -n $NAMESPACE

Write-Host "`nChecking services..." -ForegroundColor Yellow
kubectl get services -n $NAMESPACE

Write-Host "`nChecking deployments..." -ForegroundColor Yellow
kubectl get deployments -n $NAMESPACE

Write-Host "`nChecking secrets..." -ForegroundColor Yellow
kubectl get secrets -n $NAMESPACE

Write-Host "`nChecking configmaps..." -ForegroundColor Yellow
kubectl get configmaps -n $NAMESPACE

# Wait for pods to be ready
Write-Host "`nWaiting for pods to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`nPod status after waiting:" -ForegroundColor Cyan
kubectl get pods -n $NAMESPACE

# Check if backend pod is running
$backendPod = kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[0].metadata.name}' 2>$null
if ($backendPod) {
    Write-Host "`nBackend pod found: $backendPod" -ForegroundColor Green
    
    # Check backend logs
    Write-Host "`nLast 20 lines of backend logs:" -ForegroundColor Cyan
    kubectl logs $backendPod -n $NAMESPACE --tail=20
} else {
    Write-Host "`nBackend pod not found!" -ForegroundColor Red
}

# Check if frontend pod is running
$frontendPod = kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>$null
if ($frontendPod) {
    Write-Host "`nFrontend pod found: $frontendPod" -ForegroundColor Green
    
    # Check frontend logs
    Write-Host "`nLast 20 lines of frontend logs:" -ForegroundColor Cyan
    kubectl logs $frontendPod -n $NAMESPACE --tail=20
} else {
    Write-Host "`nFrontend pod not found!" -ForegroundColor Red
}

Write-Host "`nDeployment verification completed!" -ForegroundColor Green
Write-Host "`nTo access your application:" -ForegroundColor Yellow
Write-Host "1. If using NodePort service:" -ForegroundColor White
Write-Host "   Find your node IP and access at: http://<node-ip>:30080" -ForegroundColor White
Write-Host ""
Write-Host "2. For local testing with port-forwarding:" -ForegroundColor White
Write-Host "   Run: kubectl port-forward service/frontend-service 3000:3001 -n $NAMESPACE" -ForegroundColor White
Write-Host "   Then access at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "3. To check backend API directly:" -ForegroundColor White
Write-Host "   Run: kubectl port-forward service/backend-service 8080:8080 -n $NAMESPACE" -ForegroundColor White
Write-Host "   Then access Swagger UI at: http://localhost:8080/swagger-ui.html" -ForegroundColor White
