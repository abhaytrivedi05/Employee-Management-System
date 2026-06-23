# 🚀 Deployment Checklist - Employee Management App with 2FA

Use this checklist to ensure a smooth deployment of the application with Two-Factor Authentication.

## Pre-Deployment Checklist

### 1. Environment Setup

- [ ] Docker Desktop installed and running
- [ ] Docker WSL 2 integration enabled (Windows users)
- [ ] kubectl installed and configured
- [ ] Access to Kubernetes cluster (EKS, AKS, GKE, or local)
- [ ] Docker registry credentials configured
- [ ] Database access credentials available

### 2. Code Verification

- [ ] Latest code pulled from repository
- [ ] Backend compiles successfully: `./mvnw clean compile -DskipTests`
- [ ] Frontend dependencies installed: `npm install`
- [ ] No compilation errors in backend
- [ ] No dependency errors in frontend
- [ ] All new files present:
  - [ ] `TwoFactorAuthService.java`
  - [ ] `TwoFactorAuthController.java`
  - [ ] `TwoFactorSetup.js`
  - [ ] `TwoFactorVerify.js`
  - [ ] `TwoFactorManage.js`

### 3. Database Preparation

- [ ] Azure SQL Database accessible
- [ ] Database backup created (Azure Portal → cemsdb → Restore)
- [ ] Database connection tested
- [ ] Firewall rules configured (allow your IP)
- [ ] Schema migration script prepared: `database/azure-sql-2fa-migration.sql`
- [ ] Migration script tested (optional: on dev database)

#### Azure SQL Migration Script
```sql
-- Run this on Azure SQL Database: cemsdb
ALTER TABLE [dbo].[users] ADD two_factor_secret NVARCHAR(255) NULL;
ALTER TABLE [dbo].[users] ADD two_factor_enabled BIT NOT NULL DEFAULT 0;
```

**How to run**:
1. Azure Portal → SQL databases → cemsdb → Query editor
2. Login with: cemsadmin / Abhayhumain@123
3. Paste and run the script above
4. Verify columns added

- [ ] Schema migration executed successfully
- [ ] New columns verified in Azure SQL:
  ```sql
  SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'users' 
  AND COLUMN_NAME IN ('two_factor_secret', 'two_factor_enabled');
  ```

### 4. Configuration

- [ ] Environment variables configured
- [ ] Database connection string updated
- [ ] JWT secret configured
- [ ] API URL configured for frontend
- [ ] Supabase credentials configured (if using)

## Build Checklist

### 1. Backend Build

- [ ] Clean build completed: `./mvnw clean compile`
- [ ] Tests pass (if running): `./mvnw test`
- [ ] No compilation warnings
- [ ] Dependencies downloaded successfully
- [ ] 2FA dependencies present:
  - [ ] Google Authenticator (v1.5.0)
  - [ ] ZXing Core (v3.5.1)
  - [ ] ZXing JavaSE (v3.5.1)

### 2. Frontend Build

- [ ] Dependencies installed: `npm install`
- [ ] Build successful: `npm run build`
- [ ] No build errors
- [ ] No critical warnings
- [ ] Build artifacts generated in `build/` directory

### 3. Docker Images

- [ ] Backend Dockerfile present
- [ ] Frontend Dockerfile present
- [ ] Docker daemon running
- [ ] Backend image builds successfully
- [ ] Frontend image builds successfully
- [ ] Images tagged correctly
- [ ] Images pushed to registry

```bash
# Build commands
docker build -t your-registry/employee-management-backend:v2.0.0-2fa backend/
docker build -t your-registry/employee-management-frontend:v2.0.0-2fa frontend/

# Push commands
docker push your-registry/employee-management-backend:v2.0.0-2fa
docker push your-registry/employee-management-frontend:v2.0.0-2fa
```

## Deployment Checklist

### 1. Kubernetes Preparation

- [ ] kubectl configured for target cluster
- [ ] Cluster accessible: `kubectl cluster-info`
- [ ] Namespace created (if using custom namespace)
- [ ] Secrets configured:

```bash
kubectl create secret generic backend-secrets \
  --from-literal=db-url="jdbc:postgresql://your-db:5432/postgres" \
  --from-literal=db-username="postgres" \
  --from-literal=db-password="your-password" \
  --from-literal=jwt-secret="$(openssl rand -base64 32)"
```

- [ ] ConfigMaps created (if needed)
- [ ] Image pull secrets configured (if using private registry)

### 2. Deployment Files

- [ ] Deployment YAML files updated with correct image tags
- [ ] Resource limits configured appropriately
- [ ] Environment variables set correctly
- [ ] Service definitions correct
- [ ] Ingress configured (if using)

### 3. Deploy Application

#### Option A: Using Deployment Script
```bash
chmod +x scripts/deploy-with-2fa.sh
./scripts/deploy-with-2fa.sh
```

- [ ] Script executed successfully
- [ ] No errors during deployment

#### Option B: Using Blue-Green Script
```bash
./scripts/deploy-blue-green.sh blue v2.0.0-2fa your-registry
```

- [ ] Blue environment deployed
- [ ] Pods running successfully
- [ ] Services created

#### Option C: Manual Deployment
```bash
kubectl apply -f kubernetes/backend-deployment-blue.yaml
kubectl apply -f kubernetes/frontend-deployment-blue.yaml
kubectl apply -f kubernetes/backend-service-production.yaml
kubectl apply -f kubernetes/frontend-service-production.yaml
```

- [ ] All resources created successfully
- [ ] No errors in kubectl output

## Post-Deployment Verification

### 1. Pod Status

```bash
kubectl get pods
```

- [ ] All pods in `Running` state
- [ ] No pods in `CrashLoopBackOff`
- [ ] No pods in `Error` state
- [ ] Correct number of replicas running

### 2. Service Status

```bash
kubectl get services
```

- [ ] Backend service created
- [ ] Frontend service created
- [ ] Services have correct ports
- [ ] LoadBalancer IP assigned (if using LoadBalancer)

### 3. Logs Check

```bash
# Backend logs
kubectl logs -l app=backend --tail=50

# Frontend logs
kubectl logs -l app=frontend --tail=50
```

- [ ] No error messages in backend logs
- [ ] No error messages in frontend logs
- [ ] Application started successfully
- [ ] Database connection successful
- [ ] 2FA service initialized

### 4. Health Checks

```bash
# Backend health
kubectl port-forward service/backend-service 8080:8080
curl http://localhost:8080/actuator/health
```

- [ ] Backend health endpoint returns `UP`
- [ ] Database connection healthy
- [ ] All components healthy

### 5. Frontend Access

```bash
# Frontend access
kubectl port-forward service/frontend-service 3000:80
```

- [ ] Frontend accessible at http://localhost:3000
- [ ] Login page loads correctly
- [ ] No console errors
- [ ] Assets loading correctly

## Functional Testing Checklist

### 1. Basic Authentication

- [ ] Can access login page
- [ ] Can register new user
- [ ] Can login with username/password
- [ ] JWT token generated correctly
- [ ] Can access dashboard after login

### 2. 2FA Setup

- [ ] Can navigate to profile page
- [ ] "Enable 2FA" button visible
- [ ] Can click "Enable 2FA"
- [ ] Redirected to setup page
- [ ] QR code displays correctly
- [ ] Manual secret key visible
- [ ] Can copy secret key
- [ ] Can scan QR code with authenticator app
- [ ] Authenticator app generates codes
- [ ] Can enter verification code
- [ ] Code verification works
- [ ] 2FA enabled successfully
- [ ] Redirected to dashboard

### 3. 2FA Login

- [ ] Logout works correctly
- [ ] Can access login page
- [ ] Enter username/password
- [ ] Redirected to 2FA verification page
- [ ] Can enter 6-digit code
- [ ] Valid code accepted
- [ ] Invalid code rejected with error
- [ ] Successfully logged in after verification
- [ ] JWT token generated
- [ ] Redirected to dashboard

### 4. 2FA Management

- [ ] Profile page shows 2FA status
- [ ] "Enabled" badge visible
- [ ] Can click "Disable 2FA"
- [ ] Confirmation modal appears
- [ ] Can enter verification code
- [ ] Valid code disables 2FA
- [ ] Invalid code shows error
- [ ] 2FA disabled successfully
- [ ] Status updated on profile page

### 5. Edge Cases

- [ ] Expired code rejected
- [ ] Wrong code rejected
- [ ] Can't enable 2FA twice
- [ ] Can't disable 2FA when not enabled
- [ ] Time synchronization works
- [ ] Multiple failed attempts handled
- [ ] Session timeout works correctly

## Performance Testing

- [ ] Login response time < 2 seconds
- [ ] 2FA verification response time < 1 second
- [ ] QR code generation time < 3 seconds
- [ ] Page load times acceptable
- [ ] No memory leaks observed
- [ ] CPU usage within limits
- [ ] Database queries optimized

## Security Verification

- [ ] HTTPS enabled (production)
- [ ] Passwords hashed with BCrypt
- [ ] JWT tokens signed correctly
- [ ] 2FA secrets stored securely
- [ ] No sensitive data in logs
- [ ] CORS configured correctly
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection enabled

## Monitoring Setup

- [ ] Application logs accessible
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Alerts configured for:
  - [ ] Pod failures
  - [ ] High error rates
  - [ ] High response times
  - [ ] Database connection issues
  - [ ] 2FA verification failures

## Documentation

- [ ] Deployment documented
- [ ] Configuration documented
- [ ] Troubleshooting guide available
- [ ] User guide for 2FA created
- [ ] API documentation updated
- [ ] Architecture diagrams updated

## Rollback Plan

- [ ] Previous version images available
- [ ] Rollback procedure documented
- [ ] Database rollback script prepared
- [ ] Tested rollback procedure

### Rollback Commands
```bash
# Rollback deployment
kubectl rollout undo deployment/backend-deployment
kubectl rollout undo deployment/frontend-deployment

# Or switch to previous environment
kubectl patch service frontend-service -p '{"spec":{"selector":{"version":"green"}}}'
kubectl patch service backend-service -p '{"spec":{"selector":{"version":"green"}}}'
```

## Communication

- [ ] Stakeholders notified of deployment
- [ ] Users informed about 2FA feature
- [ ] Support team briefed
- [ ] Documentation shared
- [ ] Known issues communicated

## Post-Deployment Tasks

- [ ] Monitor application for 24 hours
- [ ] Review logs for errors
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Address any issues
- [ ] Update documentation based on feedback
- [ ] Plan next iteration

## Sign-Off

- [ ] Development team approval
- [ ] QA team approval
- [ ] Security team approval
- [ ] Operations team approval
- [ ] Product owner approval

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Version:** v2.0.0-2fa

**Environment:** _______________

**Notes:**
_______________________________________
_______________________________________
_______________________________________

## Quick Reference

### Useful Commands

```bash
# Check pod status
kubectl get pods -w

# View logs
kubectl logs -f deployment/backend-deployment
kubectl logs -f deployment/frontend-deployment

# Describe pod
kubectl describe pod <pod-name>

# Execute command in pod
kubectl exec -it <pod-name> -- /bin/bash

# Port forward
kubectl port-forward service/backend-service 8080:8080
kubectl port-forward service/frontend-service 3000:80

# Scale deployment
kubectl scale deployment backend-deployment --replicas=3

# Restart deployment
kubectl rollout restart deployment/backend-deployment

# Check deployment status
kubectl rollout status deployment/backend-deployment
```

### Important URLs

- Frontend: http://your-cluster-ip:frontend-port
- Backend API: http://your-cluster-ip:backend-port/api
- Swagger UI: http://your-cluster-ip:backend-port/swagger-ui.html
- Health Check: http://your-cluster-ip:backend-port/actuator/health

### Support Contacts

- Development Team: _______________
- Operations Team: _______________
- Database Admin: _______________
- Security Team: _______________
