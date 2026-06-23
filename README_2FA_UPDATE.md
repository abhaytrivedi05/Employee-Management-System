# 🔐 Two-Factor Authentication (2FA) Feature

## New in Version 2.0.0

The Employee Management Application now includes **Two-Factor Authentication (2FA)** using TOTP (Time-based One-Time Password) for enhanced security.

### ✨ Features

- 🔒 **TOTP-based Authentication**: Industry-standard RFC 6238 implementation
- 📱 **QR Code Setup**: Easy setup with any authenticator app
- 🔑 **Manual Entry**: Alternative secret key entry option
- 👤 **User Management**: Enable/disable 2FA from profile page
- 🔄 **Seamless Integration**: Works with existing authentication flow
- 🛡️ **Enhanced Security**: Protects against unauthorized access

### 📱 Compatible Authenticator Apps

- Google Authenticator (iOS/Android)
- Authy (iOS/Android/Desktop)
- Microsoft Authenticator (iOS/Android)
- 1Password (with TOTP support)
- LastPass Authenticator
- Any RFC 6238 compliant TOTP app

### 🚀 Quick Start

#### For Users

1. **Enable 2FA**
   - Login to your account
   - Navigate to Profile page
   - Click "Enable 2FA"
   - Scan QR code with your authenticator app
   - Enter the 6-digit verification code
   - 2FA is now enabled!

2. **Login with 2FA**
   - Enter your username and password
   - You'll be redirected to 2FA verification
   - Enter the 6-digit code from your authenticator app
   - Access granted!

3. **Disable 2FA**
   - Go to Profile page
   - Click "Disable 2FA"
   - Enter current 6-digit code to confirm
   - 2FA is now disabled

#### For Developers

1. **Update Database Schema**
   ```sql
   -- PostgreSQL / Supabase
   ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
   ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
   ```

2. **Build and Deploy**
   ```bash
   # Make script executable
   chmod +x scripts/deploy-with-2fa.sh
   
   # Run deployment script
   ./scripts/deploy-with-2fa.sh
   ```

3. **Or use existing scripts**
   ```bash
   # Build images
   ./scripts/build-and-push.sh v2.0.0-2fa your-docker-registry
   
   # Deploy to Kubernetes
   ./scripts/deploy-blue-green.sh blue v2.0.0-2fa your-docker-registry
   ```

### 📚 Documentation

- **[2FA Setup Guide](2FA_SETUP.md)** - Detailed setup and usage instructions
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete deployment walkthrough
- **[Implementation Summary](2FA_IMPLEMENTATION_SUMMARY.md)** - Technical details

### 🔧 Technical Details

#### Backend Changes

**New Dependencies:**
- Google Authenticator (v1.5.0)
- ZXing Core (v3.5.1)
- ZXing JavaSE (v3.5.1)

**New Endpoints:**
- `POST /api/2fa/setup` - Initialize 2FA setup
- `POST /api/2fa/enable` - Enable 2FA
- `POST /api/2fa/verify` - Verify TOTP code
- `POST /api/2fa/disable` - Disable 2FA
- `GET /api/2fa/status/{username}` - Check 2FA status

**Database Schema:**
```java
// User entity additions
private String twoFactorSecret;      // TOTP secret key
private boolean twoFactorEnabled;    // 2FA status
```

#### Frontend Changes

**New Components:**
- `TwoFactorSetup.js` - QR code setup wizard
- `TwoFactorVerify.js` - Login verification screen
- `TwoFactorManage.js` - Profile page management

**New Routes:**
- `/setup-2fa` - 2FA setup page
- `/verify-2fa` - 2FA verification page

### 🔒 Security Considerations

1. **Time Synchronization**: Ensure server time is accurate (TOTP is time-based)
2. **Secret Storage**: Secrets are stored in database (consider encryption at rest)
3. **Code Expiry**: Codes expire after 30 seconds
4. **Rate Limiting**: Implement rate limiting on verification endpoints
5. **Account Recovery**: Consider implementing backup codes

### 🐛 Troubleshooting

**QR Code Not Displaying**
- Check backend logs for errors
- Verify ZXing dependencies are loaded

**Invalid Code Errors**
- Ensure device time is synchronized
- Check authenticator app is using correct account
- Verify secret key in database

**Lost Access**
- Contact administrator for manual 2FA reset
- Implement backup codes for self-service recovery

### 📊 API Examples

#### Setup 2FA
```bash
curl -X POST http://localhost:8080/api/2fa/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com"}'
```

Response:
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "qrCodeUrl": "otpauth://totp/TeamHub:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TeamHub"
}
```

#### Enable 2FA
```bash
curl -X POST http://localhost:8080/api/2fa/enable \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "code": "123456"}'
```

#### Verify Code
```bash
curl -X POST http://localhost:8080/api/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "code": "123456"}'
```

### 🎯 Future Enhancements

- [ ] Backup codes for account recovery
- [ ] SMS-based 2FA as alternative
- [ ] Remember device for 30 days
- [ ] Admin panel to manage user 2FA
- [ ] Audit logs for 2FA events
- [ ] Rate limiting on verification attempts

### 📝 Migration Guide

If you're upgrading from v1.x to v2.0.0:

1. **Backup your database**
   ```bash
   pg_dump -h your-db-host -U postgres -d postgres > backup.sql
   ```

2. **Run database migration**
   ```sql
   ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
   ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
   ```

3. **Update application**
   ```bash
   git pull origin main
   ./scripts/deploy-with-2fa.sh
   ```

4. **Verify deployment**
   ```bash
   kubectl get pods
   kubectl logs -l app=backend | grep "2FA"
   ```

### 🤝 Contributing

Found a bug or have a feature request? Please open an issue on GitHub.

### 📄 License

This feature is part of the Employee Management Application and follows the same license.

---

**Note:** This is an add-on feature to the existing Employee Management Application. For the main README, see [README.md](README.md).
