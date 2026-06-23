package com.example.employeemanagement.model;

import javax.persistence.*;

/** This class represents the user entity. */
@Entity
@Table(name = "users")
public class User {

  /** The user ID. */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** The username. */
  @Column(nullable = false, unique = true)
  private String username;

  /** The password. */
  @Column(nullable = false)
  private String password;

  /** The 2FA secret key. */
  @Column(name = "two_factor_secret")
  private String twoFactorSecret;

  /** Whether 2FA is enabled. */
  @Column(name = "two_factor_enabled")
  private boolean twoFactorEnabled = false;

  /** Whether the user's email is verified. */
  @Column(name = "email_verified")
  private boolean emailVerified = false;

  /** The OTP code for email verification. */
  @Column(name = "otp_code")
  private String otpCode;

  /** The OTP expiry time. */
  @Column(name = "otp_expiry")
  private java.time.LocalDateTime otpExpiry;

  // Getters and Setters

  /**
   * Gets the user ID.
   *
   * @return The user ID
   */
  public Long getId() {
    return id;
  }

  /**
   * Sets the user ID.
   *
   * @param id The user ID
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Gets the username.
   *
   * @return The username
   */
  public String getUsername() {
    return username;
  }

  /**
   * Sets the username.
   *
   * @param username The username
   */
  public void setUsername(String username) {
    this.username = username;
  }

  /**
   * Gets the password.
   *
   * @return The password
   */
  public String getPassword() {
    return password;
  }

  /**
   * Sets the password.
   *
   * @param password The password
   */
  public void setPassword(String password) {
    this.password = password;
  }

  /**
   * Gets the 2FA secret.
   *
   * @return The 2FA secret
   */
  public String getTwoFactorSecret() {
    return twoFactorSecret;
  }

  /**
   * Sets the 2FA secret.
   *
   * @param twoFactorSecret The 2FA secret
   */
  public void setTwoFactorSecret(String twoFactorSecret) {
    this.twoFactorSecret = twoFactorSecret;
  }

  /**
   * Checks if 2FA is enabled.
   *
   * @return True if 2FA is enabled
   */
  public boolean isTwoFactorEnabled() {
    return twoFactorEnabled;
  }

  /**
   * Sets whether 2FA is enabled.
   *
   * @param twoFactorEnabled Whether 2FA is enabled
   */
  public void setTwoFactorEnabled(boolean twoFactorEnabled) {
    this.twoFactorEnabled = twoFactorEnabled;
  }

  public boolean isEmailVerified() { return emailVerified; }
  public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

  public String getOtpCode() { return otpCode; }
  public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

  public java.time.LocalDateTime getOtpExpiry() { return otpExpiry; }
  public void setOtpExpiry(java.time.LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }
}
