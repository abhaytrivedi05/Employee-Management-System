# 🚀 Azure Portal - 2FA Migration Guide (No Installation Required)

## Step-by-Step Instructions

### Step 1: Open Azure Portal

1. Go to https://portal.azure.com
2. Sign in with your Azure account

### Step 2: Navigate to Your Database

1. In the search bar at the top, type **"SQL databases"**
2. Click on **SQL databases** from the results
3. Find and click on **cemsdb**

### Step 3: Open Query Editor

1. In the left sidebar menu, scroll down and click **"Query editor (preview)"**
2. You'll see a login screen

### Step 4: Login to Database

Enter your credentials:
- **Login**: `cemsadmin`
- **Password**: `Abhayhumain@123`
- Click **OK**

### Step 5: Run Migration Script

Copy and paste this SQL script into the query editor:

```sql
-- Azure SQL Database Migration Script for 2FA
-- This adds two columns to the users table

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

### Step 6: Execute the Script

1. Click the **Run** button at the top
2. Wait for the script to complete (should take 1-2 seconds)

### Step 7: Verify Results

You should see output in the **Results** pane showing:

```
COLUMN_NAME          DATA_TYPE    IS_NULLABLE    COLUMN_DEFAULT
two_factor_secret    nvarchar     YES            NULL
two_factor_enabled   bit          NO             ((0))
```

## ✅ Success!

If you see the two columns listed, the migration is complete! You can now proceed to deploy the application.

## 🐛 Troubleshooting

### Issue: "Cannot find the object 'users'"

**Cause**: The users table doesn't exist yet.

**Solution**: 
1. Deploy the application first (it will create the table)
2. Then run this migration script

### Issue: "Login failed"

**Cause**: Firewall blocking your IP address.

**Solution**:
1. In the Azure Portal, go to **SQL servers** (not SQL databases)
2. Click on **sql-server-abhay**
3. Click **Networking** in the left menu
4. Under **Firewall rules**, click **Add your client IPv4 address**
5. Click **Save**
6. Wait 1 minute, then try logging in again

### Issue: "Query editor not loading"

**Cause**: Browser compatibility issue.

**Solution**: Try using Microsoft Edge or Google Chrome

## 📸 Visual Guide

### Finding Query Editor
```
Azure Portal
  └─ SQL databases
      └─ cemsdb
          └─ Query editor (preview) ← Click here
```

### After Running Script
```
Query editor
  ├─ Query window (where you paste SQL)
  ├─ Run button (click to execute)
  └─ Results pane (shows output)
```

## 🎯 Next Steps

After successful migration:

1. ✅ Database schema updated
2. 🚀 Build Docker images
3. 📦 Deploy to Kubernetes
4. 🧪 Test 2FA functionality

See [QUICK_START_AZURE.md](QUICK_START_AZURE.md) for deployment steps.

---

**Estimated Time**: 5 minutes  
**Difficulty**: Easy  
**Requirements**: Azure Portal access only
