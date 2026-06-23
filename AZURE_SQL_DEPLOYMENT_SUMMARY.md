# 🚀 Azure SQL Deployment Summary - 2FA Implementation

## Your Current Setup

### Azure SQL Database Configuration
```
Server:   sql-server-abhay.database.windows.net
Database: cemsdb
Username: cemsadmin@sql-server-abhay
Password: Abhayhumain@123
Port:     1433
```

### Application Configuration
- **Backend**: Spring Boot with Hibernate
- **Database**: Azure SQL Database (already configured ✓)
- **Profile**: `azure` (SPRING_PROFILES_ACTIVE=azure)
- **DDL Mode**: `update` (safe for production)
- **Dialect**: SQLServerDialect

## 📋 Deployment Steps

### Step 1: Update Azure SQL Database Schema

You need to add two columns to the `users` table for 2FA support.

#### Option A: Azure Portal (Recommended - Easiest)

1. **Open Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your Azure account

2. **Navigate to Your Database**
   - Click "SQL databases" in the left menu
   - Select `cemsdb`

3. **Open Query Editor**
   - Click "Query editor (preview)" in the left menu
   - Login with:
     - Login: `cemsadmin`
     - Password: `Abhayhumain@123`

4. **Run Migration Script**
   - Copy this SQL:
   ```sql
   -- Add 2FA columns
   ALTER TABLE [dbo].[users] ADD two_factor_secret NVARCHAR(255) NULL;
   ALTER TABLE [dbo].[users] ADD two_factor_enabled BIT NOT NULL DEFAULT 0;
   
   -- Verify
   SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
   FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_NAME = 'users' 
   AND COLUMN_NAME IN ('two_factor_secret', 'two_factor_enabled');
   ```
   - Click "Run"
   - Verify you see the two new columns in the results

#### Option B: Using sqlcmd (Command Line)

```bash
# Test connection first
./scripts/test-azure-sql-connection.sh

# Run migration
sqlcmd -S sql-server-abhay.database.windows.net \
  -d cemsdb \
  -U cemsadmin \
  -P 'Abhayhumain@123' \
  -i database/azure-sql-2fa-migration.sql
```

#### Option C: Azure Data Studio

1. Download Azure Data Studio
2. Connect to `sql-server-abhay.database.windows.net`
3. Open `database/azure-sql-2fa-migration.sql`
4. Execute (F5)

### Step 2: Verify Database Migration

Run this query to confirm the columns were added:

```sql
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;
```

Expected output should include:
```
two_factor_secret    | nvarchar | 255  | YES | NULL
two_factor_enabled   | bit      | NULL | NO  | ((0))
```

### Step 3: Update Kubernetes Secrets

Your Azure SQL credentials are stored in Kubernetes secrets. Verify they're correct:

```bash
# Check if secret exists
kubectl get secret backend-secrets

# If it doesn't exist or needs updating, create it:
kubectl create secret generic backend-secrets \
  --from-literal=azure-sql-url="jdbc:sqlserver://sql-server-abhay.database.windows.net:1433;database=cemsdb;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;" \
  --from-literal=azure-sql-username="cemsadmin@sql-server-abhay" \
  --from-literal=azure-sql-password="Abhayhumain@123" \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 4: Build Docker Images

```bash
cd Employee-Management-Fullstack-App-master

# Set your Docker registry
export DOCKER_REGISTRY="your-dockerhub-username"

# Build and push images
./scripts/build-and-push.sh v2.0.0-2fa $DOCKER_REGISTRY
```

This will:
- ✅ Build backend with 2FA support
- ✅ Build frontend with 2FA components
- ✅ Push to your Docker registry

### Step 5: Deploy to Kubernetes

```bash
# Deploy using blue-green deployment
./scripts/deploy-blue-green.sh blue v2.0.0-2fa $DOCKER_REGISTRY

# Or use the automated script
./scripts/deploy-with-2fa.sh
```

### Step 6: Verify Deployment

```bash
# Check pods
kubectl get pods

# Check backend logs
kubectl logs -l app=backend --tail=50

# Look for successful startup messages:
# - "Started EmployeeManagementApplication"
# - "HikariPool-1 - Start completed"
# - No connection errors
```

### Step 7: Test 2FA Functionality

1. **Access the Application**
   ```bash
   # Get the frontend service URL
   kubectl get service frontend-service
   
   # Or port-forward for testing
   kubectl port-forward service/frontend-service 3000:80
   ```

2. **Register a New User**
   - Go to http://localhost:3000/register
   - Create an account

3. **Enable 2FA**
   - Login and go to Profile
   - Click "Enable 2FA"
   - Scan QR code with Google Authenticator or Authy
   - Enter verification code

4. **Test 2FA Login**
   - Logout
   - Login with username/password
   - Enter 6-digit code from authenticator app
   - Verify successful login

## 🔍 Verification Checklist

- [ ] Azure SQL database accessible
- [ ] Firewall rules allow your IP
- [ ] Migration script executed successfully
- [ ] Two new columns visible in users table
- [ ] Kubernetes secrets configured
- [ ] Docker images built and pushed
- [ ] Application deployed to Kubernetes
- [ ] Pods running successfully
- [ ] Backend connects to Azure SQL
- [ ] Frontend accessible
- [ ] Can register new user
- [ ] Can enable 2FA
- [ ] Can login with 2FA
- [ ] Can disable 2FA

## 🐛 Troubleshooting

### Issue: "Cannot connect to Azure SQL"

**Check Firewall Rules:**
1. Azure Portal → SQL servers → sql-server-abhay → Networking
2. Add your IP address
3. Enable "Allow Azure services and resources to access this server"
4. Click Save

**Test Connection:**
```bash
./scripts/test-azure-sql-connection.sh
```

### Issue: "Login failed for user 'cemsadmin'"

**Verify Credentials:**
- Username: `cemsadmin` (without @sql-server-abhay for sqlcmd)
- Password: `Abhayhumain@123`

**Check Kubernetes Secret:**
```bash
kubectl get secret backend-secrets -o yaml
# Decode values to verify
echo "encoded-value" | base64 -d
```

### Issue: "Table 'users' does not exist"

The application creates tables on first run. Deploy the app first, then run the migration.

**Solution:**
1. Deploy application
2. Wait for backend to start
3. Check logs: `kubectl logs -l app=backend`
4. Once users table is created, run migration

### Issue: "Column already exists"

The migration has already been run. This is safe to ignore.

### Issue: Backend pod crashes

**Check logs:**
```bash
kubectl logs -l app=backend --tail=100
```

**Common causes:**
- Database connection failed (check firewall)
- Wrong credentials (check secrets)
- Missing environment variables

### Issue: 2FA QR code not displaying

**Check backend logs:**
```bash
kubectl logs -l app=backend | grep -i "2fa\|qr"
```

**Verify dependencies:**
- Google Authenticator library loaded
- ZXing libraries loaded

## 📊 Monitoring

### Check Application Health

```bash
# Backend health
kubectl port-forward service/backend-service 8080:8080
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}
```

### Monitor Logs

```bash
# Backend logs (real-time)
kubectl logs -f deployment/backend-deployment-blue

# Frontend logs (real-time)
kubectl logs -f deployment/frontend-deployment-blue

# Filter for 2FA events
kubectl logs deployment/backend-deployment-blue | grep "2FA"
```

### Check Database Connection

```bash
# Execute SQL query from pod
kubectl exec -it deployment/backend-deployment-blue -- \
  curl -s http://localhost:8080/actuator/health | grep db
```

## 🔐 Security Notes

### Azure SQL Security Features (Already Enabled)

- ✅ **Encryption in Transit**: TLS/SSL enabled
- ✅ **Encrypted Connection String**: `encrypt=true`
- ✅ **Certificate Validation**: `trustServerCertificate=false`
- ✅ **Strong Password**: Complex password used

### Additional Recommendations

1. **Enable Azure SQL Auditing**
   - Azure Portal → cemsdb → Auditing
   - Enable auditing to track database access

2. **Enable Threat Detection**
   - Azure Portal → cemsdb → Microsoft Defender for SQL
   - Detect suspicious activities

3. **Regular Backups**
   - Azure Portal → cemsdb → Backups
   - Verify automated backups are enabled

4. **Rotate Passwords**
   - Change database password periodically
   - Update Kubernetes secrets after rotation

## 📈 Performance Optimization

### Connection Pooling (Already Configured)

The application uses HikariCP for connection pooling:
- Default pool size: 10 connections
- Maximum pool size: 20 connections
- Connection timeout: 30 seconds

### Azure SQL Performance Tips

1. **Choose Appropriate Tier**
   - Check current tier: Azure Portal → cemsdb → Pricing tier
   - Recommended: Standard S2 or higher for production

2. **Enable Query Performance Insights**
   - Azure Portal → cemsdb → Query Performance Insight
   - Monitor slow queries

3. **Create Indexes**
   ```sql
   -- Index on username for faster lookups
   CREATE INDEX idx_users_username ON users(username);
   
   -- Index on 2FA enabled status
   CREATE INDEX idx_users_2fa_enabled ON users(two_factor_enabled);
   ```

## 📚 Documentation Reference

- **2FA Setup Guide**: [2FA_SETUP.md](2FA_SETUP.md)
- **Azure SQL Migration**: [AZURE_SQL_2FA_MIGRATION.md](AZURE_SQL_2FA_MIGRATION.md)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Flow Diagrams**: [2FA_FLOW_DIAGRAM.md](2FA_FLOW_DIAGRAM.md)

## 🎯 Quick Commands Reference

```bash
# Test Azure SQL connection
./scripts/test-azure-sql-connection.sh

# Build and push images
./scripts/build-and-push.sh v2.0.0-2fa your-registry

# Deploy application
./scripts/deploy-blue-green.sh blue v2.0.0-2fa your-registry

# Check deployment status
kubectl get pods
kubectl get services

# View logs
kubectl logs -l app=backend --tail=50
kubectl logs -l app=frontend --tail=50

# Port forward for testing
kubectl port-forward service/backend-service 8080:8080
kubectl port-forward service/frontend-service 3000:80

# Rollback if needed
kubectl rollout undo deployment/backend-deployment-blue
kubectl rollout undo deployment/frontend-deployment-blue
```

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Azure SQL migration completed
2. ✅ Backend pods running and healthy
3. ✅ Frontend pods running and accessible
4. ✅ Backend connects to Azure SQL successfully
5. ✅ Users can register and login
6. ✅ 2FA setup works (QR code displays)
7. ✅ 2FA verification works during login
8. ✅ 2FA can be enabled/disabled from profile
9. ✅ No errors in application logs
10. ✅ All health checks passing

---

**Ready to deploy?** Start with Step 1: Update Azure SQL Database Schema!
