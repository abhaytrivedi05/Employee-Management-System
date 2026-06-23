# 🪟 Complete Windows Setup & Deployment Guide

## Current Status

✅ **Database Migration**: COMPLETE - 2FA columns added to Azure SQL  
⚠️ **Docker WSL Integration**: NEEDS SETUP  
⚠️ **kubectl**: NEEDS INSTALLATION  

## Step 1: Enable Docker WSL Integration (5 minutes)

### Instructions:

1. **Open Docker Desktop**
   - Look for Docker icon in system tray (bottom right)
   - Right-click and select "Docker Desktop"

2. **Open Settings**
   - Click the ⚙️ gear icon (top right corner)

3. **Enable WSL Integration**
   - Click **Resources** in left menu
   - Click **WSL Integration**
   - Toggle ON: **Enable integration with my default WSL distro**
   - If you see specific distros listed, enable them too
   - Click **Apply & Restart**

4. **Wait for Restart**
   - Docker Desktop will restart (takes 1-2 minutes)
   - Wait until you see "Docker Desktop is running"

5. **Verify Docker Works in WSL**
   ```bash
   # In PowerShell, run:
   bash -c "docker --version"
   ```
   - Should show: `Docker version 29.3.1` or similar

## Step 2: Install kubectl (5 minutes)

### Option A: Using Chocolatey (Recommended)

```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install kubectl
choco install kubernetes-cli -y

# Verify
kubectl version --client
```

### Option B: Manual Download

1. Download kubectl:
   - Go to: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
   - Download the latest release

2. Add to PATH:
   - Move `kubectl.exe` to `C:\Program Files\kubectl\`
   - Add `C:\Program Files\kubectl\` to system PATH
   - Restart PowerShell

3. Verify:
   ```powershell
   kubectl version --client
   ```

### Option C: Using Docker Desktop (Easiest)

1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check ☑️ **Enable Kubernetes**
4. Click **Apply & Restart**
5. Wait for Kubernetes to start (green icon)

## Step 3: Configure kubectl for Your Cluster

### For Azure AKS:

```powershell
# Login to Azure
az login

# Get AKS credentials
az aks get-credentials --resource-group your-resource-group --name your-cluster-name

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### For AWS EKS:

```powershell
# Configure AWS CLI
aws configure

# Update kubeconfig
aws eks update-kubeconfig --region your-region --name your-cluster-name

# Verify
kubectl get nodes
```

### For Local Kubernetes (Docker Desktop):

```powershell
# Already configured if you enabled Kubernetes in Docker Desktop
kubectl config use-context docker-desktop
kubectl get nodes
```

## Step 4: Build Docker Images (10 minutes)

After Docker WSL integration is enabled:

```bash
# Navigate to project
cd "C:\Users\Acer\Desktop\Employee-Management-Fullstack-App-master (1)\Employee-Management-Fullstack-App-master"

# Build and push images
bash scripts/build-and-push.sh v2.0.0-2fa abhayt0512
```

**Note**: You'll need to login to Docker Hub first:
```bash
docker login
# Enter your Docker Hub username and password
```

## Step 5: Create Kubernetes Secrets

```bash
kubectl create secret generic backend-secrets \
  --from-literal=azure-sql-url="jdbc:sqlserver://sql-server-abhay.database.windows.net:1433;database=cemsdb;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;" \
  --from-literal=azure-sql-username="cemsadmin@sql-server-abhay" \
  --from-literal=azure-sql-password="Abhayhumain@123" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Step 6: Deploy to Kubernetes (5 minutes)

```bash
# Deploy using blue-green deployment
bash scripts/deploy-blue-green.sh blue v2.0.0-2fa abhayt0512

# Check deployment status
kubectl get pods
kubectl get services
```

## Step 7: Access the Application

### Option A: Port Forward (Testing)

```bash
# Frontend
kubectl port-forward service/frontend-service 3000:80

# Backend
kubectl port-forward service/backend-service 8080:8080
```

Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api

### Option B: LoadBalancer (Production)

```bash
# Get external IP
kubectl get service frontend-service
kubectl get service backend-service

# Access via external IP
```

## Verification Checklist

- [ ] Docker Desktop running
- [ ] Docker WSL integration enabled
- [ ] `docker --version` works in bash
- [ ] kubectl installed
- [ ] kubectl connected to cluster
- [ ] Docker Hub login successful
- [ ] Backend image built and pushed
- [ ] Frontend image built and pushed
- [ ] Kubernetes secrets created
- [ ] Pods running successfully
- [ ] Services created
- [ ] Application accessible

## Troubleshooting

### Docker: "command not found in WSL"

**Solution**: Enable WSL integration in Docker Desktop (Step 1)

### kubectl: "command not found"

**Solution**: Install kubectl (Step 2)

### "Cannot connect to cluster"

**Solution**: Configure kubectl for your cluster (Step 3)

### "Login failed" when pushing images

**Solution**:
```bash
docker login
# Enter Docker Hub credentials
```

### Pods not starting

**Check logs**:
```bash
kubectl logs -l app=backend --tail=50
kubectl describe pod <pod-name>
```

### Database connection errors

**Verify secret**:
```bash
kubectl get secret backend-secrets -o yaml
```

## Quick Commands Reference

```bash
# Check Docker
docker --version
docker ps

# Check kubectl
kubectl version --client
kubectl cluster-info
kubectl get nodes

# Check deployment
kubectl get pods
kubectl get services
kubectl logs -l app=backend

# Port forward
kubectl port-forward service/frontend-service 3000:80

# Restart deployment
kubectl rollout restart deployment/backend-deployment-blue
kubectl rollout restart deployment/frontend-deployment-blue
```

## Next Steps After Deployment

1. Test user registration
2. Test 2FA setup
3. Test 2FA login
4. Configure ingress for external access
5. Set up monitoring
6. Configure autoscaling

---

**Current Directory**: `C:\Users\Acer\Desktop\Employee-Management-Fullstack-App-master (1)\Employee-Management-Fullstack-App-master`

**You are here**: Step 1 - Enable Docker WSL Integration
