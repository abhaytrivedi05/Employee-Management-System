# Helper script to update Azure SQL credentials in Kubernetes secrets
# Usage: .\update-azure-sql-credentials.ps1

Write-Host "Update Azure SQL Credentials for Kubernetes Deployment" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

# Get user input
$serverName = Read-Host "Enter your Azure SQL Server name (e.g., myserver)"
$databaseName = Read-Host "Enter your Azure SQL Database name (e.g., employee-db)"
$username = Read-Host "Enter your Azure SQL username (e.g., adminuser)"
$password = Read-Host "Enter your Azure SQL password" -AsSecureString
$jwtSecret = Read-Host "Enter a JWT secret (min 32 chars) or press Enter to generate one"

if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
    # Generate a random JWT secret
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Host "Generated JWT Secret: $jwtSecret" -ForegroundColor Yellow
}

# Convert secure string to plain text for the connection string
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

# Build connection strings
$sqlUrl = "jdbc:sqlserver://${serverName}.database.windows.net:1433;database=${databaseName};encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;"
$sqlUsername = "${username}@${serverName}"

Write-Host ""
Write-Host "Updating kubernetes/azure-sql-secrets.yaml..." -ForegroundColor Cyan

# Update the secrets file
$content = Get-Content "kubernetes/azure-sql-secrets.yaml" -Raw
$content = $content -replace 'AZURE_SQL_URL: ".*"', "AZURE_SQL_URL: `"$sqlUrl`""
$content = $content -replace 'AZURE_SQL_USERNAME: ".*"', "AZURE_SQL_USERNAME: `"$sqlUsername`""
$content = $content -replace 'AZURE_SQL_PASSWORD: ".*"', "AZURE_SQL_PASSWORD: `"$plainPassword`""
$content = $content -replace 'JWT_SECRET: ".*"', "JWT_SECRET: `"$jwtSecret`""

Set-Content "kubernetes/azure-sql-secrets.yaml" -Value $content

Write-Host "Credentials updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the updated file: kubernetes/azure-sql-secrets.yaml" -ForegroundColor White
Write-Host "2. Apply the updated secrets: kubectl apply -f kubernetes/azure-sql-secrets.yaml" -ForegroundColor White
Write-Host "3. Restart the backend deployment: kubectl rollout restart deployment/backend-deployment -n employee-management" -ForegroundColor White
