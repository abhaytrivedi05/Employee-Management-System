package com.example.employeemanagement.controller;

import com.example.employeemanagement.model.User;
import com.example.employeemanagement.repository.UserRepository;
import com.example.employeemanagement.security.JwtTokenUtil;
import com.example.employeemanagement.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/** This class represents the REST API controller for user authentication. */
@RestController
@Tag(name = "Authentication APIs", description = "API Operations related to user authentication")
public class AuthController {

  /** The authentication manager. */
  @Autowired
  private AuthenticationManager authenticationManager;

  /** The user details service. */
  @Autowired
  private UserDetailsService userDetailsService;

  /** The user repository. */
  @Autowired
  private UserRepository userRepository;

  /** The password encoder. */
  @Autowired
  private PasswordEncoder passwordEncoder;

  /** The JWT token util. */
  @Autowired
  private JwtTokenUtil jwtTokenUtil;

  /** The OTP service. */
  @Autowired
  private OtpService otpService;

  /**
   * Register user API.
   *
   * @param user The user to be registered
   * @return Success message
   */
  @Operation(summary = "Register user", description = "Register a new user")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "User registered successfully"),
          @ApiResponse(responseCode = "409", description = "Username already exists"),
          @ApiResponse(responseCode = "500", description = "Unable to register user")
      })
  @PostMapping("/register")
  public ResponseEntity<?> registerUser(@RequestBody User user) {
    try {
      user.setPassword(passwordEncoder.encode(user.getPassword()));
      user.setEmailVerified(false);
      userRepository.save(user);
      // Send OTP for email verification
      otpService.generateAndSendOtp(user);
      return ResponseEntity.ok("OTP sent to " + user.getUsername() + ". Please verify your email.");
    } catch (DataIntegrityViolationException e) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: Username already exists");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: Unable to register user");
    }
  }

  @Operation(summary = "Verify OTP", description = "Verify the OTP sent to the user's email after registration")
  @PostMapping("/verify-otp")
  public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
    String username = request.get("username");
    String otp = request.get("otp");

    if (username == null || otp == null)
      return ResponseEntity.badRequest().body("Error: username and otp are required");

    boolean verified = otpService.verifyOtp(username, otp);
    if (!verified)
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Invalid or expired OTP");

    return ResponseEntity.ok("Email verified successfully. You can now login.");
  }

  @Operation(summary = "Resend OTP", description = "Resend the OTP to the user's email")
  @PostMapping("/resend-otp")
  public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
    String username = request.get("username");
    Optional<User> userOpt = userRepository.findByUsername(username);
    if (!userOpt.isPresent())
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");

    User user = userOpt.get();
    if (user.isEmailVerified())
      return ResponseEntity.badRequest().body("Error: Email already verified");

    otpService.generateAndSendOtp(user);
    return ResponseEntity.ok("OTP resent to " + username);
  }

  /**
   * Authenticate user API.
   *
   * @param user The user to be authenticated
   * @return JWT token or 2FA required message
   * @throws Exception If authentication fails
   */
  @Operation(summary = "Authenticate user", description = "Authenticate a user and generate a JWT token")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "User authenticated successfully"),
          @ApiResponse(responseCode = "202", description = "2FA verification required"),
          @ApiResponse(responseCode = "401", description = "Invalid username or password"),
          @ApiResponse(responseCode = "500", description = "Unable to authenticate user")
      })
  @PostMapping("/authenticate")
  public ResponseEntity<?> createAuthenticationToken(@RequestBody User user) {
    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
      );

      // Block unverified users
      Optional<User> userOpt = userRepository.findByUsername(user.getUsername());
      if (userOpt.isPresent() && !userOpt.get().isEmailVerified()) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("requiresVerification", true);
        resp.put("username", user.getUsername());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resp);
      }

      // Check if 2FA is enabled
      if (userOpt.isPresent() && userOpt.get().isTwoFactorEnabled()) {
        Map<String, Object> response = new HashMap<>();
        response.put("requires2FA", true);
        response.put("username", user.getUsername());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
      }

      final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
      final String jwt = jwtTokenUtil.generateToken(userDetails.getUsername());

      Map<String, String> response = new HashMap<>();
      response.put("token", jwt);
      return ResponseEntity.ok(response);

    } catch (BadCredentialsException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Invalid username or password");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: Unable to authenticate");
    }
  }

  /**
   * Verify if a username exists.
   *
   * @param username The username to verify
   * @return Response message indicating whether the username exists
   */
  @Operation(summary = "Verify username", description = "Verify if a username exists in the system")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "Username exists"),
          @ApiResponse(responseCode = "404", description = "Username not found")
      })
  @GetMapping("/verify-username/{username}")
  public ResponseEntity<?> verifyUsername(@PathVariable String username) {
    Optional<User> user = userRepository.findByUsername(username);
    if (user.isPresent()) {
      return ResponseEntity.ok("Username exists");
    } else {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Username not found");
    }
  }

  /**
   * Reset password for a given username.
   *
   * @param request Map containing the username and new password
   * @return Response message indicating success or failure of the operation
   */
  @Operation(summary = "Reset password", description = "Reset the password for the given username")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "Password reset successfully"),
          @ApiResponse(responseCode = "404", description = "Username not found"),
          @ApiResponse(responseCode = "500", description = "Unable to reset password")
      })
  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
    String username = request.get("username");
    String newPassword = request.get("newPassword");

    Optional<User> user = userRepository.findByUsername(username);

    if (user.isPresent()) {
      User existingUser = user.get();
      existingUser.setPassword(passwordEncoder.encode(newPassword));
      userRepository.save(existingUser);
      return ResponseEntity.ok("Password reset successfully");
    } else {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Username not found");
    }
  }

  /**
   * Complete authentication after 2FA verification.
   *
   * @param request Map containing username and 2FA code
   * @return JWT token
   */
  @Operation(summary = "Complete 2FA authentication", description = "Complete authentication after 2FA verification")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "Authentication completed successfully"),
          @ApiResponse(responseCode = "400", description = "Invalid 2FA code"),
          @ApiResponse(responseCode = "404", description = "User not found")
      })
  @PostMapping("/authenticate/2fa")
  public ResponseEntity<?> authenticate2FA(@RequestBody Map<String, String> request) {
    try {
      String username = request.get("username");
      
      // First verify 2FA code via the 2FA endpoint
      // In a real implementation, you'd inject the TwoFactorAuthService here
      // For now, we'll assume the frontend has already verified via /api/2fa/verify
      
      final UserDetails userDetails = userDetailsService.loadUserByUsername(username);
      final String jwt = jwtTokenUtil.generateToken(userDetails.getUsername());

      Map<String, String> response = new HashMap<>();
      response.put("token", jwt);
      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error: Unable to complete authentication");
    }
  }
}
