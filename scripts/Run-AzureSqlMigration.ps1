# PowerShell Script to Run Azure SQL Migration for 2FA
param(
    [string]$Server = "sql-server-abhay.database.windows.net",
    [string]$Database = "cemsdb",
    [string]$Username = "cemsadmin",
    [string]$Password = "Abhayhumain@123"
)

Write-Host "=========================================="
Write-Host "Azure SQL 2FA Migration Script"
Write-Host "=========================================="
Write-Host ""
Write-Host "Server:   $Server"
Write-Host "Database: $Database"
Write-Host "Username: $Username"
Write-Host ""

# SQL Migration Script
$SqlScript = @"
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'two_factor_secret')
BEGIN
    ALTER TABLE [dbo].[users] ADD two_factor_secret NVARCHAR(255) NULL;
    PRINT 'Column two_factor_secret added successfully';
END
ELSE
BEGIN
    PRINT 'Column two_factor_secret already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'two_factor_enabled')
BEGIN
    ALTER TABLE [dbo].[users] ADD two_factor_enabled BIT NOT NULL DEFAULT 0;
    PRINT 'Column two_factor_enabled added successfully';
END
ELSE
BEGIN
    PRINT 'Column two_factor_enabled already exists';
END

SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN ('two_factor_secret', 'two_factor_enabled');
"@

Write-Host "Checking for SqlServer module..."
if (-not (Get-Module -ListAvailable -Name SqlServer)) {
    Write-Host "Installing SqlServer module..." -ForegroundColor Yellow
    try {
        Install-Module -Name SqlServer -Scope CurrentUser -Force -AllowClobber
        Write-Host "Module installed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to install module. Use Azure Portal instead." -ForegroundColor Red
        Write-Host "See: AZURE_PORTAL_MIGRATION_GUIDE.md"
        exit 1
    }
}

Write-Host "Connecting to Azure SQL..."
try {
    $Result = Invoke-Sqlcmd -ServerInstance $Server -Database $Database -Username $Username -Password $Password -Query $SqlScript -ErrorAction Stop
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "Migration Completed Successfully!" -ForegroundColor Green
    Write-Host "=========================================="
    Write-Host ""
    if ($Result) {
        $Result | Format-Table -AutoSize
    }
    Write-Host "Next: Build and deploy the application" -ForegroundColor Cyan
}
catch {
    Write-Host ""
    Write-Host "Migration Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try using Azure Portal instead:" -ForegroundColor Yellow
    Write-Host "See: AZURE_PORTAL_MIGRATION_GUIDE.md"
    exit 1
}
