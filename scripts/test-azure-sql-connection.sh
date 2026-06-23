#!/bin/bash
# Test Azure SQL Database Connection
# This script verifies connectivity to your Azure SQL database

set -e

echo "=========================================="
echo "Azure SQL Connection Test"
echo "=========================================="
echo ""

# Azure SQL Configuration
AZURE_SQL_SERVER="sql-server-abhay.database.windows.net"
AZURE_SQL_DATABASE="cemsdb"
AZURE_SQL_USERNAME="cemsadmin"
AZURE_SQL_PORT="1433"

echo "Testing connection to:"
echo "  Server:   $AZURE_SQL_SERVER"
echo "  Database: $AZURE_SQL_DATABASE"
echo "  Username: $AZURE_SQL_USERNAME"
echo "  Port:     $AZURE_SQL_PORT"
echo ""

# Check if sqlcmd is available
if ! command -v sqlcmd &> /dev/null; then
    echo "❌ sqlcmd not found"
    echo ""
    echo "Please install sqlcmd:"
    echo "  Windows: Included with SQL Server tools"
    echo "  Mac:     brew install sqlcmd"
    echo "  Linux:   apt-get install mssql-tools"
    echo ""
    echo "Or use Azure Portal Query Editor instead:"
    echo "  https://portal.azure.com → SQL databases → cemsdb → Query editor"
    exit 1
fi

echo "✓ sqlcmd found"
echo ""

# Prompt for password
read -sp "Enter password for $AZURE_SQL_USERNAME: " AZURE_SQL_PASSWORD
echo ""
echo ""

# Test connection
echo "Testing connection..."
echo ""

QUERY="SELECT 
    @@VERSION as Version,
    DB_NAME() as DatabaseName,
    SUSER_NAME() as CurrentUser,
    GETDATE() as CurrentTime;"

if sqlcmd -S "$AZURE_SQL_SERVER" \
    -d "$AZURE_SQL_DATABASE" \
    -U "$AZURE_SQL_USERNAME" \
    -P "$AZURE_SQL_PASSWORD" \
    -Q "$QUERY" \
    -C; then
    
    echo ""
    echo "=========================================="
    echo "✓ Connection Successful!"
    echo "=========================================="
    echo ""
    
    # Check if users table exists
    echo "Checking for users table..."
    USERS_TABLE_QUERY="SELECT COUNT(*) as TableExists 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'users';"
    
    sqlcmd -S "$AZURE_SQL_SERVER" \
        -d "$AZURE_SQL_DATABASE" \
        -U "$AZURE_SQL_USERNAME" \
        -P "$AZURE_SQL_PASSWORD" \
        -Q "$USERS_TABLE_QUERY" \
        -C
    
    echo ""
    echo "Checking for 2FA columns..."
    COLUMNS_QUERY="SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'users'
    AND COLUMN_NAME IN ('two_factor_secret', 'two_factor_enabled');"
    
    sqlcmd -S "$AZURE_SQL_SERVER" \
        -d "$AZURE_SQL_DATABASE" \
        -U "$AZURE_SQL_USERNAME" \
        -P "$AZURE_SQL_PASSWORD" \
        -Q "$COLUMNS_QUERY" \
        -C
    
    echo ""
    echo "Next steps:"
    echo "  1. If users table doesn't exist, deploy the app first"
    echo "  2. If 2FA columns don't exist, run: database/azure-sql-2fa-migration.sql"
    echo "  3. Deploy the application with 2FA support"
    echo ""
    
else
    echo ""
    echo "=========================================="
    echo "❌ Connection Failed"
    echo "=========================================="
    echo ""
    echo "Possible issues:"
    echo "  1. Incorrect password"
    echo "  2. Firewall blocking your IP address"
    echo "  3. Server name incorrect"
    echo "  4. Database name incorrect"
    echo ""
    echo "To fix firewall issues:"
    echo "  1. Go to Azure Portal"
    echo "  2. Navigate to: SQL servers → sql-server-abhay → Networking"
    echo "  3. Add your IP address to firewall rules"
    echo "  4. Enable 'Allow Azure services and resources to access this server'"
    echo "  5. Click Save"
    echo ""
    exit 1
fi
