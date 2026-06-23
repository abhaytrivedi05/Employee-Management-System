package com.example.employeemanagement.controller;

import com.example.employeemanagement.model.User;
import com.example.employeemanagement.repository.UserRepository;
import com.example.employeemanagement.service.TwoFactorAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/** Controller for two-factor authentication operations. */
@RestController
@RequestMapping("/api/2fa")
@Tag(name = "Two-Factor Authentication APIs", description = "API Operations for 2FA management")
public class TwoFactorAuthController {

  @Autowired
  private TwoFactorAuthService twoFactorAuthService;

  @Autowired
  private UserRepository userRepository;

  /**
   * Setup 2FA for a user.
   *
   * @param request Map containing the username
   * @return QR code and secret
   */
  @Operation(summary = "Setup 2FA", description = "Generate QR code and secret for 2FA setup")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "2FA setup initiated successfully"),
          @ApiResponse(responseCode = "404", description = "User not found"),
          @ApiResponse(responseCode = "500", description = "Error setting up 2FA")
      })
  @PostMapping("/setup")
  public ResponseEntity<?> setup2FA(@RequestBody Map<String, String> request) {
    try {
      String username = request.get("username");
      Optional<User> userOpt = userRepository.findByUsername(username);

      if (!userOpt.isPresent()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
      }

      User user = userOpt.get();
      String secret = twoFactorAuthService.generateSecretKey();
      
      // Save secret temporarily (not enabled yet)
      user.setTwoFactorSecret(secret);
      userRepository.save(user);

      String qrCodeUrl = twoFactorAuthService.generateQRCodeUrl(username, secret, "TeamHub");
      String qrCodeImage = twoFactorAuthService.generateQRCodeImage(qrCodeUrl);

      Map<String, String> response = new HashMap<>();
      response.put("secret", secret);
      response.put("qrCode", "data:image/png;base64," + qrCodeImage);
      response.put("qrCodeUrl", qrCodeUrl);

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error: Unable to setup 2FA - " + e.getMessage());
    }
  }

  /**
   * Enable 2FA for a user after verifying the code.
   *
   * @param request Map containing username and verification code
   * @return Success message
   */
  @Operation(summary = "Enable 2FA", description = "Enable 2FA after verifying the code")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "2FA enabled successfully"),
          @ApiResponse(responseCode = "400", description = "Invalid verification code"),
          @ApiResponse(responseCode = "404", description = "User not found"),
          @ApiResponse(responseCode = "500", description = "Error enabling 2FA")
      })
  @PostMapping("/enable")
  public ResponseEntity<?> enable2FA(@RequestBody Map<String, String> request) {
    try {
      String username = request.get("username");
      int code = Integer.parseInt(request.get("code"));

      Optional<User> userOpt = userRepository.findByUsername(username);
      if (!userOpt.isPresent()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
      }

      User user = userOpt.get();
      if (user.getTwoFactorSecret() == null) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Error: 2FA not set up. Please setup 2FA first");
      }

      boolean isValid = twoFactorAuthService.verifyCode(user.getTwoFactorSecret(), code);
      if (!isValid) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Error: Invalid verification code");
      }

      user.setTwoFactorEnabled(true);
      userRepository.save(user);

      return ResponseEntity.ok("2FA enabled successfully");
    } catch (NumberFormatException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Invalid code format");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error: Unable to enable 2FA - " + e.getMessage());
    }
  }

  /**
   * Verify 2FA code during login.
   *
   * @param request Map containing username and code
   * @return Success message
   */
  @Operation(summary = "Verify 2FA code", description = "Verify 2FA code during login")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "Code verified successfully"),
          @ApiResponse(responseCode = "400", description = "Invalid verification code"),
          @ApiResponse(responseCode = "404", description = "User not found")
      })
  @PostMapping("/verify")
  public ResponseEntity<?> verify2FA(@RequestBody Map<String, String> request) {
    try {
      String username = request.get("username");
      int code = Integer.parseInt(request.get("code"));

      Optional<User> userOpt = userRepository.findByUsername(username);
      if (!userOpt.isPresent()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
      }

      User user = userOpt.get();
      if (!user.isTwoFactorEnabled() || user.getTwoFactorSecret() == null) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: 2FA not enabled");
      }

      boolean isValid = twoFactorAuthService.verifyCode(user.getTwoFactorSecret(), code);
      if (!isValid) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Error: Invalid verification code");
      }

      return ResponseEntity.ok("Code verified successfully");
    } catch (NumberFormatException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Invalid code format");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error: Unable to verify code - " + e.getMessage());
    }
  }

  /**
   * Disable 2FA for a user.
   *
   * @param request Map containing username and verification code
   * @return Success message
   */
  @Operation(summary = "Disable 2FA", description = "Disable 2FA for a user")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "2FA disabled successfully"),
          @ApiResponse(responseCode = "400", description = "Invalid verification code"),
          @ApiResponse(responseCode = "404", description = "User not found")
      })
  @PostMapping("/disable")
  public ResponseEntity<?> disable2FA(@RequestBody Map<String, String> request) {
    try {
      String username = request.get("username");
      int code = Integer.parseInt(request.get("code"));

      Optional<User> userOpt = userRepository.findByUsername(username);
      if (!userOpt.isPresent()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
      }

      User user = userOpt.get();
      if (!user.isTwoFactorEnabled()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: 2FA not enabled");
      }

      boolean isValid = twoFactorAuthService.verifyCode(user.getTwoFactorSecret(), code);
      if (!isValid) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Error: Invalid verification code");
      }

      user.setTwoFactorEnabled(false);
      user.setTwoFactorSecret(null);
      userRepository.save(user);

      return ResponseEntity.ok("2FA disabled successfully");
    } catch (NumberFormatException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Invalid code format");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error: Unable to disable 2FA - " + e.getMessage());
    }
  }

  /**
   * Check if 2FA is enabled for a user.
   *
   * @param username The username
   * @return 2FA status
   */
  @Operation(summary = "Check 2FA status", description = "Check if 2FA is enabled for a user")
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
          @ApiResponse(responseCode = "404", description = "User not found")
      })
  @GetMapping("/status/{username}")
  public ResponseEntity<?> check2FAStatus(@PathVariable String username) {
    Optional<User> userOpt = userRepository.findByUsername(username);
    if (!userOpt.isPresent()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
    }

    User user = userOpt.get();
    Map<String, Boolean> response = new HashMap<>();
    response.put("enabled", user.isTwoFactorEnabled());

    return ResponseEntity.ok(response);
  }
}
