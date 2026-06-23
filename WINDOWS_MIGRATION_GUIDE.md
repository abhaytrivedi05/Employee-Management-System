# 🪟 Windows Migration Guide - Azure SQL 2FA

## Two Easy Options for Windows Users

### ✅ Option 1: Azure Portal (Recommended - No Installation)

**Time**: 5 minutes  
**Requirements**: Web browser only

1. **Open Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your Azure account

2. **Navigate to Database**
   - Search for "SQL databases"
   - Click on **cemsdb**

3. **Open Query Editor**
   - Click **Query editor (preview)** in left menu
   - Login: `cemsadmin` / `Abhayhumain@123`

4. **Run Migration**
   - Copy the SQL from `database/azure-sql-2fa-migration.sql`
   - Paste into query editor
   - Click **Run**

**Detailed guide**: [AZURE_PORTAL_MIGRATION_GUIDE.md](AZURE_PORTAL_MIGRATION_GUIDE.md)

---

### ✅ Option 2: PowerShell Script

**Time**: 5 minutes  
**Requirements**: PowerShell (already on Windows)

#### Step 1: Open PowerShell

Right-click Start menu → **Windows PowerShell** (or **Terminal**)

#### Step 2: Navigate to Project

```powershell
cd "C:\Users\Acer\Desktop\Employee-Management-Fullstack-App-master (1)\Employee-Management-Fullstack-App-master"
```

#### Step 3: Run Migration Script

```powershell
.\scripts\Run-AzureSqlMigration.ps1
```

The script will:
- ✅ Install SqlServer module if needed (first time only)
- ✅ Connect to your Azure SQL database
- ✅ Add 2FA columns
- ✅ Verify the changes

#### Expected Output

```
==========================================
Azure SQL 2FA Migration Script
==========================================

Configuration:
  Server:   sql-server-abhay.database.windows.net
  Database: cemsdb
  Username: cemsadmin

Checking for SqlServer PowerShell module...
✓ SqlServer module found

Connecting to Azure SQL Database...

==========================================
✓ Migration Completed Successfully!
==========================================

Verification Results:

COLUMN_NAME          DATA_TYPE    IS_NULLABLE    COLUMN_DEFAULT
two_factor_secret    nvarchar     YES            NULL
two_factor_enabled   bit          NO             ((0))
```

---

## 🐛 Troubleshooting

### Issue: "Execution Policy" Error

**Error Message**:
```
.\scripts\Run-AzureSqlMigration.ps1 : File cannot be loaded because running scripts is disabled
```

**Solution**:
```powershell
# Allow script execution (one-time setup)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run the script again
.\scripts\Run-AzureSqlMigration.ps1
```

### Issue: "Login Failed"

**Cause**: Firewall blocking your IP

**Solution**:
1. Go to https://portal.azure.com
2. Navigate to: **SQL servers** → **sql-server-abhay** → **Networking**
3. Click **Add your client IPv4 address**
4. Click **Save**
5. Wait 1 minute, then try again

### Issue: "Cannot find the object 'users'"

**Cause**: Users table doesn't exist yet

**Solution**:
1. Deploy the application first (it creates the table)
2. Then run the migration

### Issue: Module Installation Fails

**Solution**: Use Azure Portal instead (Option 1 above)

---

## 🎯 Quick Reference

### Your Azure SQL Details
```
Server:   sql-server-abhay.database.windows.net
Database: cemsdb
Username: cemsadmin
Password: Abhayhumain@123
```

### PowerShell Commands
```powershell
# Navigate to project
cd "C:\Users\Acer\Desktop\Employee-Management-Fullstack-App-master (1)\Employee-Management-Fullstack-App-master"

# Run migration
.\scripts\Run-AzureSqlMigration.ps1

# Check if columns exist (after migration)
# Use Azure Portal Query Editor with:
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users';
```

---

## 📋 Next Steps After Migration

1. ✅ Database migration complete
2. 🐳 Build Docker images
3. ☸️ Deploy to Kubernetes
4. 🧪 Test 2FA

**Continue with**: [QUICK_START_AZURE.md](QUICK_START_AZURE.md) - Step 3

---

## 💡 Tips

- **First time?** Use Azure Portal (easier, no setup)
- **Automating?** Use PowerShell script
- **Having issues?** Azure Portal always works
- **Need help?** Check [AZURE_PORTAL_MIGRATION_GUIDE.md](AZURE_PORTAL_MIGRATION_GUIDE.md)

---

**Estimated Time**: 5 minutes  
**Difficulty**: Easy  
**Best Option**: Azure Portal (no installation required)
