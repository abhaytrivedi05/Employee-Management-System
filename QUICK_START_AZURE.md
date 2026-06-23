# ⚡ Quick Start - Deploy with Azure SQL & 2FA

## 🎯 Goal
Deploy the Employee Management Application with Two-Factor Authentication using your existing Azure SQL Database.

## ⏱️ Time Required
- Database Migration: 5 minutes
- Build & Deploy: 15-20 minutes
- Testing: 5 minutes

## 📋 Prerequisites

✅ Azure SQL Database: `cemsdb` on `sql-server-abhay.database.windows.net`  
✅ Docker Desktop installed and running  
✅ kubectl configured for your Kubernetes cluster  
✅ Docker Hub account (or other registry)

## 🚀 5-Step Deployment

### Step 1: Update Azure SQL (5 minutes)

**🪟 Windows Users**: See [WINDOWS_MIGRATION_GUIDE.md](WINDOWS_MIGRATION_GUIDE.md) for detailed instructions

**Option A: Azure Portal (Easiest - No Installation Required)**
1. Go to https://portal.azure.com
2. Navigate to: SQL databases → cemsdb → Query editor
3. Login: `cemsadmin` / `Abhayhumain@123`
4. Copy SQL from `database/azure-sql-2fa-migration.sql`
5. Paste and click "Run" ✓

**Detailed guide**: [AZURE_PORTAL_MIGRATION_GUIDE.md](AZURE_PORTAL_MIGRATION_GUIDE.md)

**Option B: PowerShell (Windows)**
```powershell
# Open PowerShell and run:
.\scripts\Run-AzureSqlMigration.ps1
```

**Option C: Command Line (Linux/Mac with sqlcmd installed)**
```bash
sqlcmd -S sql-server-abhay.database.windows.net \
  -d cemsdb -U cemsadmin -P 'Abhayhumain@123' \
  -i database/azure-sql-2fa-migration.sql
```

### Step 2: Configure Kubernetes Secrets (2 minutes)

```bash
kubectl create secret generic backend-secrets \
  --from-literal=azure-sql-url="jdbc:sqlserver://sql-server-abhay.database.windows.net:1433;database=cemsdb;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;" \
  --from-literal=azure-sql-username="cemsadmin@sql-server-abhay" \
  --from-literal=azure-sql-password="Abhayhumain@123" \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 3: Build Docker Images (10 minutes)

```bash
cd Employee-Management-Fullstack-App-master

# Replace with your Docker Hub username
export DOCKER_REGISTRY="your-dockerhub-username"

# Build and push
./scripts/build-and-push.sh v2.0.0-2fa $DOCKER_REGISTRY
```

### Step 4: Deploy to Kubernetes (5 minutes)

```bash
# Deploy to blue environment
./scripts/deploy-blue-green.sh blue v2.0.0-2fa $DOCKER_REGISTRY

# Wait for pods to be ready
kubectl get pods -w
```

### Step 5: Test 2FA (5 minutes)

```bash
# Port forward to access locally
kubectl port-forward service/frontend-service 3000:80
```

Then:
1. Open http://localhost:3000
2. Register a new user
3. Go to Profile → Enable 2FA
4. Scan QR code with Google Authenticator
5. Logout and login with 2FA ✓

## ✅ Verification

```bash
# Check pods are running
kubectl get pods
# Expected: All pods in "Running" state

# Check backend logs
kubectl logs -l app=backend --tail=20
# Expected: "Started EmployeeManagementApplication"

# Check database connection
kubectl logs -l app=backend | grep -i "hikari\|database"
# Expected: "HikariPool-1 - Start completed"
```

## 🐛 Quick Troubleshooting

### Can't connect to Azure SQL?
```bash
# Add your IP to firewall
# Azure Portal → SQL servers → sql-server-abhay → Networking
# Add client IP → Save
```

### Pods not starting?
```bash
# Check logs
kubectl logs -l app=backend --tail=50

# Check secrets
kubectl get secret backend-secrets
```

### 2FA not working?
```bash
# Check backend logs for errors
kubectl logs -l app=backend | grep -i "2fa\|error"
```

## 📚 Detailed Documentation

- **Full Deployment Guide**: [AZURE_SQL_DEPLOYMENT_SUMMARY.md](AZURE_SQL_DEPLOYMENT_SUMMARY.md)
- **2FA Setup Guide**: [2FA_SETUP.md](2FA_SETUP.md)
- **Migration Details**: [AZURE_SQL_2FA_MIGRATION.md](AZURE_SQL_2FA_MIGRATION.md)
- **Troubleshooting**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 🎉 Success!

Once deployed, you'll have:
- ✅ Employee Management System running on Kubernetes
- ✅ Connected to Azure SQL Database
- ✅ Two-Factor Authentication enabled
- ✅ Production-ready with blue-green deployment

## 🔄 Next Steps

- Set up monitoring and alerts
- Configure ingress for external access
- Enable Azure SQL auditing
- Set up automated backups
- Configure horizontal pod autoscaling

---

**Need help?** Check the detailed guides or review the logs for specific error messages.
