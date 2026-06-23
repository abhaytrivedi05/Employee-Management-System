-- Azure SQL Database Migration Script for 2FA
-- Run this script on your Azure SQL Database: cemsdb
-- Server: sql-server-abhay.database.windows.net

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

-- Display current user table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;
GO

PRINT 'Azure SQL Database migration completed successfully!';
PRINT 'You can now deploy the application with 2FA support.';
GO
