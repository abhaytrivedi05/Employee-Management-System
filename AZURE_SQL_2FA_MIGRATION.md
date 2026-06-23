# Azure SQL Database - 2FA Migration Guide

## Your Azure SQL Configuration

Based on your `.env` file, here are your Azure SQL details:

- **Server**: `sql-server-abhay.database.windows.net`
- **Database**: `cemsdb`
- **Username**: `cemsadmin@sql-server-abhay`
- **Port**: `1433`

## Migration Overview

This guide will help you add the required 2FA columns to your Azure SQL database.

## Prerequisites

- Access to Azure Portal
- Azure SQL Database credentials
- One of the following tools:
  - Azure Data Studio (Recommended)
  - SQL Server Management Studio (SSMS)
  - Azure Portal Query Editor
  - sqlcmd command-line tool

## Option 1: Using Azure Portal Query Editor (Easiest)

### Step 1: Access Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **SQL databases**
3. Select your database: `cemsdb`

### Step 2: Open Query Editor

1. In the left menu, click **Query editor (preview)**
2. Login with:
   - **Login**: `cemsadmin`
   - **Password**: `Abhayhumain@123`
3. Click **OK**

### Step 3: Run Migration Script

Copy and paste this script into the query editor:

```sql
-- Azure SQL Database Migration Script for 2FA

-- Check if columns already exist before adding them
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[users]') 
    AND name = 'two_factor_secret'
)
BEGIN
    ALTER TABLE [dbo].[users] 
    ADD two_factor_secret NVARCHAR(255) NULL;
    PRINT 'Column two_factor_secret added successfully';
END
ELSE
BEGIN
    PRINT 'Column two_factor_secret already exists';
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[users]') 
    AND name = 'two_factor_enabled'
)
BEGIN
    ALTER TABLE [dbo].[users] 
    ADD two_factor_enabled BIT NOT NULL DEFAULT 0;
    PRINT 'Column two_factor_enabled added successfully';
END
ELSE
BEGIN
    PRINT 'Column two_factor_enabled already exists';
END
GO

-- Verify the changes
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND COLUMN_NAME IN ('two_factor_secret', 'two_factor_enabled');
GO
```

### Step 4: Execute

1. Click **Run** button
2. Check the **Results** pane for success messages
3. Verify the columns were added

## Option 2: Using Azure Data Studio

### Step 1: Install Azure Data Studio

Download from: https://docs.microsoft.com/en-us/sql/azure-data-studio/download

### Step 2: Connect to Azure SQL

1. Open Azure Data Studio
2. Click **New Connection**
3. Enter connection details:
   ```
   Server: sql-server-abhay.database.windows.net
   Authentication type: SQL Login
   User name: cemsadmin
   Password: Abhayhumain@123
   Database: cemsdb
   Encrypt: True
   Trust server certificate: False
   ```
4. Click **Connect**

### Step 3: Run Migration

1. Click **New Query**
2. Open the migration script: `database/azure-sql-2fa-migration.sql`
3. Click **Run** or press `F5`
4. Check the **Messages** pane for results

## Option 3: Using sqlcmd (Command Line)

### Step 1: Install sqlcmd

For Windows:
```powershell
# Already included with SQL Server tools
```

For Linux/Mac:
```bash
# Install via package manager
brew install sqlcmd  # Mac
```

### Step 2: Run Migration

```bash
sqlcmd -S sql-server-abhay.database.windows.net \
  -d cemsdb \
  -U cemsadmin \
  -P 'Abhayhumain@123' \
  -i database/azure-sql-2fa-migration.sql
```

## Option 4: Using PowerShell

```powershell
# Install SqlServer module if not already installed
Install-Module -Name SqlServer -Scope CurrentUser

# Run migration
$ServerInstance = "sql-server-abhay.database.windows.net"
$Database = "cemsdb"
$Username = "cemsadmin"
$Password = "Abhayhumain@123"

$Query = @"
ALTER TABLE [dbo].[users] ADD two_factor_secret NVARCHAR(255) NULL;
ALTER TABLE [dbo].[users] ADD two_factor_enabled BIT NOT NULL DEFAULT 0;
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users';
"@

Invoke-Sqlcmd -ServerInstance $ServerInstance `
  -Database $Database `
  -Username $Username `
  -Password $Password `
  -Query $Query `
  -Encrypt
```

## Verification

After running the migration, verify the columns were added:

```sql
-- Check table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

-- Expected output should include:
-- two_factor_secret    | NVARCHAR | 255  | YES | NULL
-- two_factor_enabled   | BIT      | NULL | NO  | ((0))
```

## Troubleshooting

### Error: "Cannot find the object 'users'"

The users table doesn't exist yet. The application will create it on first run with `DDL_AUTO=update`.

**Solution**: Deploy the application first, then run the migration.

### Error: "Login failed for user"

Check your credentials and firewall rules.

**Solution**:
1. Go to Azure Portal → SQL Server → Networking
2. Add your IP address to firewall rules
3. Enable "Allow Azure services and resources to access this server"

### Error: "Column already exists"

The migration has already been run.

**Solution**: This is safe to ignore. The script checks for existing columns.

### Connection Timeout

Azure SQL might be blocking your IP.

**Solution**:
1. Azure Portal → SQL Server → Networking
2. Add your current IP address
3. Click **Save**

## Rollback (If Needed)

If you need to remove the 2FA columns:

```sql
-- Remove 2FA columns
ALTER TABLE [dbo].[users] DROP COLUMN IF EXISTS two_factor_secret;
ALTER TABLE [dbo].[users] DROP COLUMN IF EXISTS two_factor_enabled;
GO
```

## Next Steps

After successful migration:

1. ✅ Database schema updated
2. 🚀 Deploy the application:
   ```bash
   ./scripts/deploy-with-2fa.sh
   ```
3. 🧪 Test 2FA functionality
4. 📊 Monitor application logs

## Azure SQL Specific Notes

### Connection String Format

Your application uses this connection string format:
```
jdbc:sqlserver://sql-server-abhay.database.windows.net:1433;
database=cemsdb;
encrypt=true;
trustServerCertificate=false;
hostNameInCertificate=*.database.windows.net;
loginTimeout=30;
```

### Hibernate Dialect

The application uses:
```
org.hibernate.dialect.SQLServerDialect
```

### DDL Auto Mode

For production, use:
```
DDL_AUTO=update
```

This allows Hibernate to update the schema without dropping tables.

## Security Best Practices

1. **Firewall Rules**: Only allow necessary IP addresses
2. **Strong Passwords**: Use complex passwords (already done ✓)
3. **Encryption**: Always use encrypted connections (already configured ✓)
4. **Backup**: Enable automated backups in Azure Portal
5. **Monitoring**: Enable Azure SQL auditing and threat detection

## Backup Before Migration

### Create Backup

1. Azure Portal → SQL Database → cemsdb
2. Click **Restore**
3. Note the latest restore point
4. Or create manual backup:
   - Click **Export**
   - Save to Azure Storage

### Restore if Needed

1. Azure Portal → SQL Database → cemsdb
2. Click **Restore**
3. Select restore point before migration
4. Create new database or overwrite

## Cost Considerations

Adding two columns has minimal impact:
- **Storage**: ~2 bytes per user (BIT) + variable (NVARCHAR)
- **Performance**: No significant impact
- **Cost**: Negligible increase

## Support

If you encounter issues:

1. Check Azure SQL logs in Azure Portal
2. Review application logs: `kubectl logs -l app=backend`
3. Verify connection string in Kubernetes secrets
4. Test connection from your local machine

## Quick Reference

### Your Azure SQL Details
```
Server:   sql-server-abhay.database.windows.net
Database: cemsdb
Username: cemsadmin
Port:     1433
```

### Migration File Location
```
database/azure-sql-2fa-migration.sql
```

### Kubernetes Secret Update (if needed)
```bash
kubectl create secret generic backend-secrets \
  --from-literal=azure-sql-url="jdbc:sqlserver://sql-server-abhay.database.windows.net:1433;database=cemsdb;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;" \
  --from-literal=azure-sql-username="cemsadmin@sql-server-abhay" \
  --from-literal=azure-sql-password="Abhayhumain@123" \
  --dry-run=client -o yaml | kubectl apply -f -
```

---

**Ready to proceed?** Run the migration script using any of the methods above, then deploy the application!
