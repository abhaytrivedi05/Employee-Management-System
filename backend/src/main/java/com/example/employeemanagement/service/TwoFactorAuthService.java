package com.example.employeemanagement.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

/** Service for handling two-factor authentication operations. */
@Service
public class TwoFactorAuthService {

  private final GoogleAuthenticator googleAuthenticator;

  public TwoFactorAuthService() {
    this.googleAuthenticator = new GoogleAuthenticator();
  }

  /**
   * Generate a new secret key for 2FA.
   *
   * @return The secret key
   */
  public String generateSecretKey() {
    GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
    return key.getKey();
  }

  /**
   * Generate QR code URL for Google Authenticator.
   *
   * @param username The username
   * @param secret The secret key
   * @param issuer The issuer name
   * @return The QR code URL
   */
  public String generateQRCodeUrl(String username, String secret, String issuer) {
    return GoogleAuthenticatorQRGenerator.getOtpAuthURL(issuer, username, 
        new GoogleAuthenticatorKey.Builder(secret).build());
  }

  /**
   * Generate QR code image as base64 string.
   *
   * @param qrCodeUrl The QR code URL
   * @return Base64 encoded QR code image
   * @throws WriterException If QR code generation fails
   * @throws IOException If image conversion fails
   */
  public String generateQRCodeImage(String qrCodeUrl) throws WriterException, IOException {
    QRCodeWriter qrCodeWriter = new QRCodeWriter();
    BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeUrl, BarcodeFormat.QR_CODE, 300, 300);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
    byte[] qrCodeBytes = outputStream.toByteArray();

    return Base64.getEncoder().encodeToString(qrCodeBytes);
  }

  /**
   * Verify a TOTP code.
   *
   * @param secret The secret key
   * @param code The TOTP code to verify
   * @return True if the code is valid
   */
  public boolean verifyCode(String secret, int code) {
    return googleAuthenticator.authorize(secret, code);
  }
}
