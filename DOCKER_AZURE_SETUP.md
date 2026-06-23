# Docker Setup with Azure SQL Database

## Quick Start

### Option 1: Using Environment File (Recommended)

1. **The `.env.azure` file is already configured** with your Azure SQL credentials

2. **Copy it to `.env`:**
   ```powershell
   Copy-Item .env.azure .env
   ```

3. **Run Docker Compose:**
   ```powershell
   docker-compose -f docker-compose.azure.yml up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html

### Option 2: Using PowerShell Environment Variables

```powershell
# Set environment variables
$env:AZURE_SQL_URL="jdbc:sqlserver://sql-server-abhay.database.windows.net:1433;database=cemsdb;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;"
$env:AZURE_SQL_USERNAME="cemsadmin@sql-server-abhay"
$env:AZURE_SQL_PASSWORD="Abhayhumain@123"

# Run Docker Compose
docker-compose -f docker-compose.azure.yml up --build
```

## Files Created

| File | Purpose |
|------|---------|
| `docker-compose.azure.yml` | Docker Compose configuration for Azure SQL |
| `backend/Dockerfile.azure` | Backend Dockerfile optimized for Azure SQL |
| `.env.azure` | Environment variables template |

## Stopping the Application

```powershell
# Stop containers
Ctrl + C

# Or in another terminal
docker-compose -f docker-compose.azure.yml down

# To remove all data and volumes
docker-compose -f docker-compose.azure.yml down -v
```

## Troubleshooting

### Connection Issues

1. **Check Azure SQL Firewall:**
   - Ensure your IP is added to the firewall rules
   - Verify port 1433 is accessible: `Test-NetConnection -ComputerName sql-server-abhay.database.windows.net -Port 1433`

2. **Check Environment Variables:**
   ```powershell
   Get-Content .env
   ```

3. **View Container Logs:**
   ```powershell
   docker-compose -f docker-compose.azure.yml logs backend
   ```

### Rebuild After Changes

```powershell
docker-compose -f docker-compose.azure.yml up --build --force-recreate
```

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────────┐
│   Frontend  │──────▶│   Backend   │──────▶│   Azure SQL     │
│   :3000     │      │   :8080     │      │   (Cloud)       │
└─────────────┘      └─────────────┘      └─────────────────┘
```

## Notes

- No local MySQL/MongoDB containers needed - uses Azure SQL directly
- Data persists in Azure SQL (cloud database)
- Frontend and backend run in Docker containers
- Health checks ensure backend is ready before frontend starts
