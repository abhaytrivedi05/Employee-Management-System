# Deployment Guide - Employee Management App with 2FA

This guide covers deploying the updated application with Two-Factor Authentication support.

## Prerequisites

- Docker Desktop with WSL 2 integration enabled (for Windows)
- Kubernetes cluster (EKS, AKS, GKE, or local)
- kubectl configured to access your cluster
- Docker registry access (Docker Hub, ECR, ACR, etc.)

## Step 1: Enable Docker in WSL 2 (Windows Users)

1. Open Docker Desktop
2. Go to Settings → Resources → WSL Integration
3. Enable integration with your WSL 2 distro
4. Click "Apply & Restart"

## Step 2: Build Docker Images

```bash
cd Employee-Management-Fullstack-App-master

# Set your Docker registry (replace with your username/registry)
export DOCKER_REGISTRY="your-dockerhub-username"

# Build and push images
./scripts/build-and-push.sh v2.0.0-2fa $DOCKER_REGISTRY
```

This will:
- Build the backend with 2FA support
- Build the frontend with 2FA components
- Push both images to your Docker registry

## Step 3: Update Database Schema

**IMPORTANT**: This application uses **Azure SQL Database**.

Your Azure SQL configuration:
- **Server**: `sql-server-abhay.database.windows.net`
- **Database**: `cemsdb`
- **Username**: `cemsadmin@sql-server-abhay`

### Azure SQL Migration (REQUIRED)

Run the migration script to add 2FA columns:

**Option 1: Azure Portal Query Editor (Easiest)**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to SQL databases → cemsdb
3. Click **Query editor (preview)**
4. Login with your credentials
5. Run the script from `database/azure-sql-2fa-migration.sql`

**Option 2: Azure Data Studio**
```bash
# Connect to: sql-server-abhay.database.windows.net
# Database: cemsdb
# Run: database/azure-sql-2fa-migration.sql
```

**Option 3: sqlcmd**
```bash
sqlcmd -S sql-server-abhay.database.windows.net \
  -d cemsdb \
  -U cemsadmin \
  -P 'Abhayhumain@123' \
  -i database/azure-sql-2fa-migration.sql
```

**See detailed instructions**: [AZURE_SQL_2FA_MIGRATION.md](AZURE_SQL_2FA_MIGRATION.md)

### Migration Script (Azure SQL):

```sql
-- Add 2FA columns to Azure SQL
ALTER TABLE [dbo].[users] ADD two_factor_secret NVARCHAR(255) NULL;
ALTER TABLE [dbo].[users] ADD two_factor_enabled BIT NOT NULL DEFAULT 0;

-- Verify
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
AND COLUMN_NAME IN ('two_factor_secret', 'two_factor_enabled');
```

## Step 4: Update Kubernetes Secrets

Ensure your backend secrets are configured:

```bash
kubectl create secret generic backend-secrets \
  --from-literal=db-url="jdbc:postgresql://your-db-host:5432/postgres" \
  --from-literal=db-username="postgres" \
  --from-literal=db-password="your-db-password" \
  --from-literal=jwt-secret="$(openssl rand -base64 32)" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Step 5: Deploy to Kubernetes

### Option A: Blue-Green Deployment (Recommended)

```bash
# Deploy to blue environment
./scripts/deploy-blue-green.sh blue v2.0.0-2fa $DOCKER_REGISTRY

# Test the blue environment
# Access via: http://your-cluster-ip:blue-port

# Switch traffic to blue
kubectl patch service frontend-service -p '{"spec":{"selector":{"version":"blue"}}}'
kubectl patch service backend-service -p '{"spec":{"selector":{"version":"blue"}}}'

# Deploy to green for next update
./scripts/deploy-blue-green.sh green v2.0.1 $DOCKER_REGISTRY
```

### Option B: Direct Deployment

```bash
# Update image tags in deployment files
sed -i "s|image: .*/employee-management-backend:.*|image: $DOCKER_REGISTRY/employee-management-backend:v2.0.0-2fa|g" kubernetes/backend-deployment-blue.yaml
sed -i "s|image: .*/employee-management-frontend:.*|image: $DOCKER_REGISTRY/employee-management-frontend:v2.0.0-2fa|g" kubernetes/frontend-deployment-blue.yaml

# Apply deployments
kubectl apply -f kubernetes/backend-deployment-blue.yaml
kubectl apply -f kubernetes/frontend-deployment-blue.yaml
kubectl apply -f kubernetes/backend-service-production.yaml
kubectl apply -f kubernetes/frontend-service-production.yaml
```

## Step 6: Verify Deployment

```bash
# Check pod status
kubectl get pods

# Check services
kubectl get services

# View logs
kubectl logs -l app=backend --tail=100
kubectl logs -l app=frontend --tail=100

# Test backend health
kubectl port-forward service/backend-service 8080:8080
curl http://localhost:8080/actuator/health

# Test frontend
kubectl port-forward service/frontend-service 3000:80
# Open browser: http://localhost:3000
```

## Step 7: Test 2FA Functionality

1. **Register a new user**
   - Navigate to `/register`
   - Create an account

2. **Enable 2FA**
   - Login and go to Profile
   - Click "Enable 2FA"
   - Scan QR code with Google Authenticator or Authy
   - Enter verification code

3. **Test 2FA Login**
   - Logout
   - Login with username/password
   - Enter 6-digit code from authenticator app
   - Verify successful login

## Step 8: Configure Ingress (Optional)

If using an Ingress controller:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: employee-management-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: employee-management-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

Apply the ingress:

```bash
kubectl apply -f kubernetes/ingress.yaml
```

## Rollback Procedure

If issues occur, rollback to previous version:

```bash
# Rollback deployment
kubectl rollout undo deployment/backend-deployment
kubectl rollout undo deployment/frontend-deployment

# Or switch back to previous environment (blue-green)
kubectl patch service frontend-service -p '{"spec":{"selector":{"version":"green"}}}'
kubectl patch service backend-service -p '{"spec":{"selector":{"version":"green"}}}'
```

## Monitoring

### Check Application Logs

```bash
# Backend logs
kubectl logs -f deployment/backend-deployment

# Frontend logs
kubectl logs -f deployment/frontend-deployment

# Filter for 2FA events
kubectl logs deployment/backend-deployment | grep "2FA"
```

### Metrics

```bash
# Pod resource usage
kubectl top pods

# Node resource usage
kubectl top nodes
```

## Troubleshooting

### Issue: 2FA QR Code Not Displaying

**Solution:**
```bash
# Check backend logs
kubectl logs deployment/backend-deployment | grep -i "qr\|2fa"

# Verify ZXing dependencies
kubectl exec -it deployment/backend-deployment -- ls -la /app/lib | grep zxing
```

### Issue: Invalid 2FA Code

**Solution:**
- Ensure device time is synchronized (TOTP is time-based)
- Check database for correct secret storage
- Verify authenticator app is using correct account

### Issue: Database Connection Errors

**Solution:**
```bash
# Check database connectivity
kubectl exec -it deployment/backend-deployment -- curl -v telnet://your-db-host:5432

# Verify secrets
kubectl get secret backend-secrets -o yaml
```

### Issue: Image Pull Errors

**Solution:**
```bash
# Create Docker registry secret
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email

# Update deployment to use secret
# Add to pod spec:
# imagePullSecrets:
# - name: regcred
```

## Performance Optimization

### Enable Horizontal Pod Autoscaling

```bash
# Backend autoscaling
kubectl autoscale deployment backend-deployment \
  --cpu-percent=70 \
  --min=2 \
  --max=10

# Frontend autoscaling
kubectl autoscale deployment frontend-deployment \
  --cpu-percent=70 \
  --min=2 \
  --max=10
```

### Resource Limits

Update deployment files with appropriate resource limits:

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## Security Best Practices

1. **Use HTTPS**: Always use TLS/SSL in production
2. **Rotate Secrets**: Regularly rotate JWT secrets and database passwords
3. **Network Policies**: Implement Kubernetes network policies
4. **RBAC**: Configure proper role-based access control
5. **Image Scanning**: Scan Docker images for vulnerabilities
6. **Backup**: Regular database backups including 2FA secrets

## Maintenance

### Update Application

```bash
# Build new version
./scripts/build-and-push.sh v2.0.1 $DOCKER_REGISTRY

# Deploy using blue-green
./scripts/deploy-blue-green.sh green v2.0.1 $DOCKER_REGISTRY

# Test and switch traffic
kubectl patch service frontend-service -p '{"spec":{"selector":{"version":"green"}}}'
kubectl patch service backend-service -p '{"spec":{"selector":{"version":"green"}}}'
```

### Database Backup

```bash
# PostgreSQL backup
kubectl exec -it deployment/backend-deployment -- \
  pg_dump -h your-db-host -U postgres -d postgres > backup.sql

# Restore
kubectl exec -i deployment/backend-deployment -- \
  psql -h your-db-host -U postgres -d postgres < backup.sql
```

## Support

For issues or questions:
- Check logs: `kubectl logs deployment/backend-deployment`
- Review documentation: `2FA_SETUP.md`
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
