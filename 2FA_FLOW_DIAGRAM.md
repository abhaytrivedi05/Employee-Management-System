# Two-Factor Authentication Flow Diagrams

## 1. 2FA Setup Flow

```
┌─────────────┐
│   User      │
│  Profile    │
└──────┬──────┘
       │
       │ Click "Enable 2FA"
       ▼
┌─────────────────────────────────────┐
│     POST /api/2fa/setup             │
│  { username: "user@example.com" }   │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  TwoFactorAuthService                │
│  - Generate secret key               │
│  - Create QR code URL                │
│  - Generate QR code image            │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Response:                           │
│  {                                   │
│    secret: "JBSWY3DPEHPK3PXP",      │
│    qrCode: "data:image/png;base64..",│
│    qrCodeUrl: "otpauth://..."        │
│  }                                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  TwoFactorSetup Component            │
│  - Display QR code                   │
│  - Show manual entry option          │
│  - Wait for verification code        │
└──────────────┬───────────────────────┘
               │
               │ User scans QR code
               │ with authenticator app
               │
               ▼
┌──────────────────────────────────────┐
│  Authenticator App                   │
│  - Google Authenticator              │
│  - Authy                             │
│  - Microsoft Authenticator           │
│  - Generates 6-digit TOTP code       │
└──────────────┬───────────────────────┘
               │
               │ User enters code
               ▼
┌──────────────────────────────────────┐
│     POST /api/2fa/enable             │
│  {                                   │
│    username: "user@example.com",     │
│    code: "123456"                    │
│  }                                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  TwoFactorAuthService                │
│  - Verify TOTP code                  │
│  - If valid: enable 2FA              │
│  - Update user record                │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Database Update                     │
│  UPDATE users SET                    │
│    two_factor_enabled = true         │
│  WHERE username = 'user@example.com' │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Success!                            │
│  2FA is now enabled                  │
│  Redirect to Dashboard               │
└──────────────────────────────────────┘
```

## 2. Login Flow with 2FA

```
┌─────────────┐
│   Login     │
│    Page     │
└──────┬──────┘
       │
       │ Enter credentials
       ▼
┌─────────────────────────────────────┐
│     POST /authenticate              │
│  {                                  │
│    username: "user@example.com",    │
│    password: "password123"          │
│  }                                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  AuthController                      │
│  - Authenticate credentials          │
│  - Check if 2FA enabled              │
└──────────────┬───────────────────────┘
               │
               ├─────────────┬─────────────┐
               │             │             │
        2FA Enabled    2FA Disabled       │
               │             │             │
               ▼             ▼             │
┌──────────────────┐  ┌──────────────────┐│
│  Response 202    │  │  Response 200    ││
│  {               │  │  {               ││
│   requires2FA:   │  │   token: "jwt.." ││
│     true,        │  │  }               ││
│   username: "..  │  └────────┬─────────┘│
│  }               │           │          │
└────────┬─────────┘           │          │
         │                     │          │
         │                     ▼          │
         │              ┌──────────────┐  │
         │              │  Dashboard   │  │
         │              └──────────────┘  │
         │                                │
         ▼                                │
┌──────────────────────────────────────┐ │
│  Redirect to /verify-2fa             │ │
│  TwoFactorVerify Component           │ │
└──────────────┬───────────────────────┘ │
               │                          │
               │ User enters 6-digit code │
               ▼                          │
┌──────────────────────────────────────┐ │
│     POST /api/2fa/verify             │ │
│  {                                   │ │
│    username: "user@example.com",     │ │
│    code: "123456"                    │ │
│  }                                   │ │
└──────────────┬───────────────────────┘ │
               │                          │
               ▼                          │
┌──────────────────────────────────────┐ │
│  TwoFactorAuthService                │ │
│  - Verify TOTP code                  │ │
│  - Check against stored secret       │ │
└──────────────┬───────────────────────┘ │
               │                          │
        ┌──────┴──────┐                  │
        │             │                  │
    Valid Code   Invalid Code            │
        │             │                  │
        ▼             ▼                  │
┌──────────────┐  ┌──────────────┐      │
│ POST         │  │ Show Error   │      │
│ /authenticate│  │ "Invalid     │      │
│ /2fa         │  │  code"       │      │
└──────┬───────┘  └──────────────┘      │
       │                                 │
       ▼                                 │
┌──────────────────────────────────────┐│
│  Response:                           ││
│  { token: "jwt-token..." }           ││
└──────────────┬───────────────────────┘│
               │                         │
               ▼                         │
┌──────────────────────────────────────┐│
│  Store token in localStorage         ││
│  Redirect to Dashboard               ││
└──────────────────────────────────────┘│
```

## 3. Disable 2FA Flow

```
┌─────────────┐
│   User      │
│  Profile    │
└──────┬──────┘
       │
       │ Click "Disable 2FA"
       ▼
┌─────────────────────────────────────┐
│  Confirmation Modal                 │
│  "Enter verification code"          │
└──────────────┬──────────────────────┘
               │
               │ User enters code
               ▼
┌─────────────────────────────────────┐
│     POST /api/2fa/disable           │
│  {                                  │
│    username: "user@example.com",    │
│    code: "123456"                   │
│  }                                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  TwoFactorAuthService                │
│  - Verify TOTP code                  │
│  - If valid: disable 2FA             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Database Update                     │
│  UPDATE users SET                    │
│    two_factor_enabled = false,       │
│    two_factor_secret = NULL          │
│  WHERE username = 'user@example.com' │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Success!                            │
│  2FA is now disabled                 │
│  Close modal                         │
└──────────────────────────────────────┘
```

## 4. System Architecture with 2FA

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Login     │  │ TwoFactor    │  │ TwoFactor    │      │
│  │  Component   │  │   Setup      │  │   Verify     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP/REST
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                           ▼                                 │
│                  Backend (Spring Boot)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AuthController                          │  │
│  │  - /authenticate                                     │  │
│  │  - /authenticate/2fa                                 │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────┴───────────────────────────────────────┐  │
│  │         TwoFactorAuthController                      │  │
│  │  - POST /api/2fa/setup                               │  │
│  │  - POST /api/2fa/enable                              │  │
│  │  - POST /api/2fa/verify                              │  │
│  │  - POST /api/2fa/disable                             │  │
│  │  - GET  /api/2fa/status/{username}                   │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────┴───────────────────────────────────────┐  │
│  │         TwoFactorAuthService                         │  │
│  │  - generateSecretKey()                               │  │
│  │  - generateQRCodeUrl()                               │  │
│  │  - generateQRCodeImage()                             │  │
│  │  - verifyCode()                                      │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────┴───────────────────────────────────────┐  │
│  │         Google Authenticator Library                 │  │
│  │  - TOTP generation                                   │  │
│  │  - Code verification                                 │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  users table                                         │   │
│  │  - id                                                │   │
│  │  - username                                          │   │
│  │  - password (hashed)                                 │   │
│  │  - two_factor_secret                                 │   │
│  │  - two_factor_enabled                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 5. TOTP Code Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Authenticator App (User's Phone)                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Secret Key: JBSWY3DPEHPK3PXP                      │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Current Time: 2024-04-07 19:30:45                 │     │
│  │  Time Step: 30 seconds                             │     │
│  │  Time Counter: floor(timestamp / 30)               │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  HMAC-SHA1(secret, time_counter)                   │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Extract 6-digit code                              │     │
│  │  Code: 123456                                      │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Display to User                                   │     │
│  │  ┌──────────────────────────────────────┐          │     │
│  │  │  TeamHub                             │          │     │
│  │  │  user@example.com                    │          │     │
│  │  │                                      │          │     │
│  │  │         1 2 3 4 5 6                  │          │     │
│  │  │                                      │          │     │
│  │  │  ⏱ 15 seconds remaining              │          │     │
│  │  └──────────────────────────────────────┘          │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 6. Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
│                                                              │
│  Layer 1: Username & Password                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  - BCrypt password hashing                         │     │
│  │  - Secure password storage                         │     │
│  │  - Password complexity requirements                │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│                           ▼                                  │
│  Layer 2: Two-Factor Authentication                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  - TOTP-based verification                         │     │
│  │  - Time-synchronized codes                         │     │
│  │  - 30-second expiry                                │     │
│  │  - Secret key per user                             │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│                           ▼                                  │
│  Layer 3: JWT Token                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  - Signed JWT tokens                               │     │
│  │  - 7-day expiry                                    │     │
│  │  - Stateless authentication                        │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│                           ▼                                  │
│  Layer 4: HTTPS/TLS                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  - Encrypted communication                         │     │
│  │  - Certificate validation                          │     │
│  │  - Secure data transmission                        │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Legend

```
┌─────────┐
│  Box    │  = Component/Service
└─────────┘

    │
    ▼         = Data flow direction

─────────     = Connection/Relationship

┌─────────┐
│ Decision│  = Decision point
└────┬────┘
     ├─────  = Multiple paths
```
