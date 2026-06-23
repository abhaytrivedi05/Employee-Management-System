# Two-Factor Authentication (2FA) Setup Guide

This application now includes Two-Factor Authentication (2FA) using TOTP (Time-based One-Time Password) for enhanced security.

## Features

- **TOTP-based 2FA**: Uses Google Authenticator, Authy, or any compatible authenticator app
- **QR Code Setup**: Easy setup with QR code scanning
- **Manual Entry**: Alternative manual secret key entry
- **User Management**: Enable/disable 2FA from user profile
- **Secure Login Flow**: Seamless integration with existing authentication

## Backend Implementation

### Dependencies Added

```xml
<!-- Google Authenticator for 2FA -->
<dependency>
  <groupId>com.warrenstrange</groupId>
  <artifactId>googleauth</artifactId>
  <version>1.5.0</version>
</dependency>

<!-- ZXing for QR Code generation -->
<dependency>
  <groupId>com.google.zxing</groupId>
  <artifactId>core</artifactId>
  <version>3.5.1</version>
</dependency>
<dependency>
  <groupId>com.google.zxing</groupId>
  <artifactId>javase</artifactId>
  <version>3.5.1</version>
</dependency>
```

### Database Schema Changes

The `User` entity now includes:
- `two_factor_secret`: Stores the TOTP secret key
- `two_factor_enabled`: Boolean flag for 2FA status

### API Endpoints

#### Setup 2FA
```
POST /api/2fa/setup
Body: { "username": "user@example.com" }
Response: { "secret": "...", "qrCode": "data:image/png;base64,...", "qrCodeUrl": "..." }
```

#### Enable 2FA
```
POST /api/2fa/enable
Body: { "username": "user@example.com", "code": "123456" }
Response: "2FA enabled successfully"
```

#### Verify 2FA Code
```
POST /api/2fa/verify
Body: { "username": "user@example.com", "code": "123456" }
Response: "Code verified successfully"
```

#### Disable 2FA
```
POST /api/2fa/disable
Body: { "username": "user@example.com", "code": "123456" }
Response: "2FA disabled successfully"
```

#### Check 2FA Status
```
GET /api/2fa/status/{username}
Response: { "enabled": true }
```

#### Complete Authentication with 2FA
```
POST /authenticate/2fa
Body: { "username": "user@example.com" }
Response: { "token": "jwt-token..." }
```

## Frontend Implementation

### New Components

1. **TwoFactorSetup.js**: QR code display and initial setup
2. **TwoFactorVerify.js**: Login verification screen
3. **TwoFactorManage.js**: Profile page 2FA management

### User Flow

#### Enabling 2FA

1. User navigates to Profile page
2. Clicks "Enable 2FA" button
3. Redirected to `/setup-2fa`
4. Scans QR code with authenticator app
5. Enters 6-digit verification code
6. 2FA is enabled

#### Login with 2FA

1. User enters username/password on login page
2. If 2FA is enabled, redirected to `/verify-2fa`
3. Enters 6-digit code from authenticator app
4. Successfully authenticated and redirected to dashboard

#### Disabling 2FA

1. User navigates to Profile page
2. Clicks "Disable 2FA" button
3. Enters current 6-digit code to confirm
4. 2FA is disabled

## Deployment

### Database Migration

Before deploying, ensure your database schema is updated:

```sql
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
```

### Environment Variables

No additional environment variables are required. The 2FA feature works with existing configuration.

### Build and Deploy

```bash
# Build and push Docker images
./scripts/build-and-push.sh v2.0.0 your-docker-registry

# Deploy to Kubernetes
./scripts/deploy-blue-green.sh blue v2.0.0 your-docker-registry
```

## Security Considerations

1. **Secret Storage**: TOTP secrets are stored encrypted in the database
2. **Code Validation**: 6-digit codes expire after 30 seconds
3. **Backup Codes**: Consider implementing backup codes for account recovery
4. **Rate Limiting**: Implement rate limiting on verification endpoints to prevent brute force attacks

## Testing

### Manual Testing

1. Register a new user
2. Enable 2FA from profile
3. Logout and login again
4. Verify 2FA code is required
5. Test disabling 2FA

### Authenticator Apps

Compatible with:
- Google Authenticator (iOS/Android)
- Authy (iOS/Android/Desktop)
- Microsoft Authenticator
- 1Password
- LastPass Authenticator

## Troubleshooting

### QR Code Not Displaying
- Check backend logs for image generation errors
- Verify ZXing dependencies are properly loaded

### Invalid Code Errors
- Ensure device time is synchronized (TOTP is time-based)
- Check that the secret key matches between app and database

### Lost Access
- Implement account recovery flow
- Consider adding backup codes or admin override

## Future Enhancements

- [ ] Backup codes for account recovery
- [ ] SMS-based 2FA as alternative
- [ ] Remember device for 30 days
- [ ] Admin panel to manage user 2FA settings
- [ ] Audit logs for 2FA events
