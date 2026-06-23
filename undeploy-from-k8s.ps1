# Employee Management App - Kubernetes Undeployment Script
# Usage: .\undeploy-from-k8s.ps1

Write-Host "Starting undeployment of Employee Management App from Kubernetes..." -ForegroundColor Green

$NAMESPACE = "employee-management"

Write-Host "Step 1: Deleting Kubernetes resources..." -ForegroundColor Yellow

# Delete all resources in the namespace
kubectl delete namespace $NAMESPACE

Write-Host "Undeployment completed!" -ForegroundColor Green
Write-Host "Note: Docker images remain in your registry. To remove them:" -ForegroundColor Yellow
Write-Host "  docker rmi abhayt0512/employee-management-app:v1" -ForegroundColor White
Write-Host "  docker rmi abhayt0512/employee-frontend:v1" -ForegroundColor White
