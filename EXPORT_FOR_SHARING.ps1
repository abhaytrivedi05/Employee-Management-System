# PowerShell Script to Export Docker Images for Sharing
# Run this on your main system to create shareable files

Write-Host "Building Docker images..." -ForegroundColor Green

# Build images
docker-compose -f docker-compose.share.yml build

# Tag images
docker tag employee-management-fullstack-app-master-backend:latest employeemanagement/backend:latest
docker tag employee-management-fullstack-app-master-frontend:latest employeemanagement/frontend:latest

Write-Host "Exporting images to files..." -ForegroundColor Green

# Export images to tar files
docker save employeemanagement/backend:latest -o backend-image.tar
docker save employeemanagement/frontend:latest -o frontend-image.tar

Write-Host "Creating ZIP package..." -ForegroundColor Green

# Create a folder for sharing
New-Item -ItemType Directory -Force -Path "C:\Employee-Management-Package" | Out-Null

# Copy files
Copy-Item docker-compose.share.yml C:\Employee-Management-Package\
Copy-Item backend-image.tar C:\Employee-Management-Package\
Copy-Item frontend-image.tar C:\Employee-Management-Package\

# Create instructions
@"
# Employee Management System - Quick Start

## Requirements
- Docker Desktop installed

## Steps to Run

1. Open PowerShell or Command Prompt in this folder

2. Load the Docker images:
   ```
   docker load -i backend-image.tar
   docker load -i frontend-image.tar
   ```

3. Start the application:
   ```
   docker-compose -f docker-compose.share.yml up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8081
   - Swagger UI: http://localhost:8081/swagger-ui.html

## To Stop
Press Ctrl+C or run:
```
docker-compose -f docker-compose.share.yml down
```

That's it! No need to install Java, Node.js, or anything else.
"@ | Out-File -FilePath "C:\Employee-Management-Package\README.txt" -Encoding UTF8

# Create ZIP
Compress-Archive -Path "C:\Employee-Management-Package\*" -DestinationPath "C:\Employee-Management-System.zip" -Force

Write-Host "Package created: C:\Employee-Management-System.zip" -ForegroundColor Green
Write-Host "Share this ZIP file with others!" -ForegroundColor Yellow

# Cleanup temp files
Remove-Item backend-image.tar -ErrorAction SilentlyContinue
Remove-Item frontend-image.tar -ErrorAction SilentlyContinue
Remove-Item -Recurse C:\Employee-Management-Package -ErrorAction SilentlyContinue
