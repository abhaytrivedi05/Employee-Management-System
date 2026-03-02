# Azure SQL Database Setup Guide

## Prerequisites

1. An active Azure subscription
2. Azure CLI installed (optional but recommended)

## Step 1: Create Azure SQL Database

### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → Search "SQL Database" → Click "Create"
3. Fill in the basics:
   - **Subscription**: Select your subscription
   - **Resource group**: Create new or select existing
   - **Database name**: `employee-management-db`
   - **Server**: Click "Create new"
     - **Server name**: `your-unique-server-name` (must be globally unique)
     - **Location**: Select nearest region
     - **Authentication method**: SQL authentication
     - **Server admin login**: `azureuser` (or your preferred username)
     - **Password**: Create a strong password
4. Click "Review + create" → "Create"

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name myResourceGroup --location eastus

# Create SQL Server
az sql server create \
  --name your-unique-server-name \
  --resource-group myResourceGroup \
  --location eastus \
  --admin-user azureuser \
  --admin-password YourStrongPassword123!

# Create SQL Database
az sql db create \
  --name employee-management-db \
  --server your-unique-server-name \
  --resource-group myResourceGroup \
  --service-objective S0

# Allow Azure services to access the server
az sql server firewall-rule create \
  --resource-group myResourceGroup \
  --server your-unique-server-name \
  --name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your local IP (optional - for local testing)
az sql server firewall-rule create \
  --resource-group myResourceGroup \
  --server your-unique-server-name \
  --name AllowMyIP \
  --start-ip-address YOUR_LOCAL_IP \
  --end-ip-address YOUR_LOCAL_IP
```

## Step 2: Configure Connection

### Method 1: Environment Variables (Recommended for Local Development)

On Windows PowerShell:
```powershell
$env:SPRING_PROFILES_ACTIVE="azure"
$env:AZURE_SQL_URL="jdbc:sqlserver://your-server-name.database.windows.net:1433;database=employee-management-db;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;"
$env:AZURE_SQL_USERNAME="azureuser@your-server-name"
$env:AZURE_SQL_PASSWORD="YourStrongPassword123!"
$env:DDL_AUTO="update"
```

On Linux/Mac:
```bash
export SPRING_PROFILES_ACTIVE=azure
export AZURE_SQL_URL="jdbc:sqlserver://your-server-name.database.windows.net:1433;database=employee-management-db;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;"
export AZURE_SQL_USERNAME="azureuser@your-server-name"
export AZURE_SQL_PASSWORD="YourStrongPassword123!"
export DDL_AUTO="update"
```

Then run the backend:
```bash
./mvnw.cmd spring-boot:run
```

### Method 2: Using application-azure.yml (For Production)

Edit `backend/src/main/resources/application-azure.yml` and replace the environment variables with actual values (not recommended for production secrets).

### Method 3: Using Docker Compose

Create a `.env` file in the project root:
```
SPRING_PROFILES_ACTIVE=azure
AZURE_SQL_URL=jdbc:sqlserver://your-server-name.database.windows.net:1433;database=employee-management-db;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;
AZURE_SQL_USERNAME=azureuser@your-server-name
AZURE_SQL_PASSWORD=YourStrongPassword123!
DDL_AUTO=update
```

Then run:
```bash
docker-compose up --build
```

## Step 3: Verify Connection

1. Start the application
2. Check logs for successful connection:
   ```
   HikariPool-1 - Start completed
   ```
3. Access Swagger UI: http://localhost:8080/swagger-ui.html
4. Test API endpoints

## Connection String Format

```
jdbc:sqlserver://<server-name>.database.windows.net:1433;
  database=<database-name>;
  encrypt=true;
  trustServerCertificate=false;
  hostNameInCertificate=*.database.windows.net;
  loginTimeout=30;
```

## Important Notes

1. **Firewall Rules**: Ensure your IP is allowed in Azure SQL firewall settings
2. **SSL/TLS**: Azure SQL requires encrypted connections (encrypt=true)
3. **DDL Auto**: 
   - Use `update` for production (preserves data)
   - Use `create-drop` only for development/testing
4. **Connection Pooling**: HikariCP is configured with:
   - Max pool size: 10
   - Connection timeout: 30 seconds
   - Idle timeout: 10 minutes

## Troubleshooting

### Connection Timeout
- Check firewall rules in Azure Portal
- Verify server name and database name
- Ensure you're using the correct port (1433)

### Login Failed
- Verify username format: `username@server-name`
- Check password is correct
- Ensure SQL authentication is enabled

### SSL Certificate Error
- Ensure `encrypt=true` and `trustServerCertificate=false`
- Verify `hostNameInCertificate=*.database.windows.net`

## Security Best Practices

1. Never commit credentials to version control
2. Use Azure Key Vault for production secrets
3. Enable Azure AD authentication for enhanced security
4. Use managed identities when deploying to Azure services
5. Regularly rotate passwords
6. Enable auditing and threat detection in Azure SQL
