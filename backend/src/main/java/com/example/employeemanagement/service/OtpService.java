package com.example.employeemanagement.service;

import com.example.employeemanagement.model.User;
import com.example.employeemanagement.repository.UserRepository;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.internet.MimeMessage;
import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

/** Service for OTP generation, sending, and verification. */
@Service
public class OtpService {

  @Autowired(required = false)
  private JavaMailSender mailSender;

  @Autowired
  private UserRepository userRepository;

  @Value("${otp.expiry.minutes:10}")
  private int otpExpiryMinutes;

  @Value("${sendgrid.api.key:}")
  private String sendGridApiKey;

  @Value("${sendgrid.from.email:noreply@teamhub.com}")
  private String sendGridFromEmail;

  @Value("${sendgrid.from.name:TeamHub}")
  private String sendGridFromName;

  @Value("${spring.mail.username:}")
  private String gmailUsername;

  @Value("${spring.mail.password:}")
  private String gmailPassword;

  private final SecureRandom random = new SecureRandom();

  /** Generate a 6-digit OTP, save it, and send via email. */
  public void generateAndSendOtp(User user) {
    String otp = String.format("%06d", random.nextInt(1_000_000));
    user.setOtpCode(otp);
    user.setOtpExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
    userRepository.save(user);
    sendOtp(user.getUsername(), otp);
  }

  /** Verify the OTP. Returns true if valid and marks user as verified. */
  public boolean verifyOtp(String username, String otp) {
    Optional<User> userOpt = userRepository.findByUsername(username);
    if (!userOpt.isPresent()) return false;

    User user = userOpt.get();
    if (user.getOtpCode() == null) return false;
    if (LocalDateTime.now().isAfter(user.getOtpExpiry())) return false;
    if (!user.getOtpCode().equals(otp)) return false;

    user.setEmailVerified(true);
    user.setOtpCode(null);
    user.setOtpExpiry(null);
    userRepository.save(user);
    return true;
  }

  private void sendOtp(String toEmail, String otp) {
    // Try SendGrid first
    if (sendGridApiKey != null && !sendGridApiKey.isBlank()) {
      if (trySendGrid(toEmail, otp)) return;
    }

    // Try Gmail SMTP
    if (gmailUsername != null && !gmailUsername.isBlank()
        && gmailPassword != null && !gmailPassword.isBlank()) {
      if (tryGmail(toEmail, otp)) return;
    }

    // Fallback: print to console
    printToConsole(toEmail, otp);
  }

  private boolean trySendGrid(String toEmail, String otp) {
    try {
      Email from = new Email(sendGridFromEmail, sendGridFromName);
      Email to = new Email(toEmail);
      String subject = "TeamHub — Your Verification Code";
      Content content = new Content("text/html", buildEmailHtml(otp));
      Mail mail = new Mail(from, subject, to, content);

      SendGrid sg = new SendGrid(sendGridApiKey);
      Request request = new Request();
      request.setMethod(Method.POST);
      request.setEndpoint("mail/send");
      request.setBody(mail.build());

      Response response = sg.api(request);
      if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
        System.out.println("OTP email sent via SendGrid to: " + toEmail);
        return true;
      } else {
        System.out.println("SendGrid failed: " + response.getStatusCode() + " " + response.getBody());
        return false;
      }
    } catch (IOException e) {
      System.out.println("SendGrid error: " + e.getMessage());
      return false;
    }
  }

  private boolean tryGmail(String toEmail, String otp) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true);
      helper.setFrom(gmailUsername, sendGridFromName);
      helper.setTo(toEmail);
      helper.setSubject("TeamHub — Your Verification Code");
      helper.setText(buildEmailHtml(otp), true);
      mailSender.send(message);
      System.out.println("OTP email sent via Gmail to: " + toEmail);
      return true;
    } catch (Exception e) {
      System.out.println("Gmail failed: " + e.getMessage());
      return false;
    }
  }

  private void printToConsole(String toEmail, String otp) {
    System.out.println("\n========================================");
    System.out.println("  OTP for " + toEmail + " : " + otp);
    System.out.println("  (No email provider configured)");
    System.out.println("  Configure SendGrid: set SENDGRID_API_KEY env var");
    System.out.println("========================================\n");
  }

  private String buildEmailHtml(String otp) {
    return "<!DOCTYPE html><html><body style='margin:0;padding:0;background:#f3f4f6;font-family:sans-serif;'>"
        + "<table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center' style='padding:40px 20px;'>"
        + "<table width='480' cellpadding='0' cellspacing='0' style='background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>"
        + "<tr><td style='background:linear-gradient(135deg,#0d2318 0%,#1a4731 50%,#28a06e 100%);padding:32px;text-align:center;'>"
        + "<h1 style='color:white;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;'>TeamHub</h1>"
        + "<p style='color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:14px;'>HR Management Platform</p>"
        + "</td></tr>"
        + "<tr><td style='padding:40px 32px;'>"
        + "<h2 style='color:#111827;margin:0 0 12px;font-size:22px;font-weight:800;'>Verify your email address</h2>"
        + "<p style='color:#6b7280;margin:0 0 32px;font-size:15px;line-height:1.6;'>Enter the code below to complete your registration. This code expires in <strong>" + otpExpiryMinutes + " minutes</strong>.</p>"
        + "<div style='background:#f0fdf4;border:2px solid #bbf7d0;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;'>"
        + "<p style='color:#15803d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;'>Your verification code</p>"
        + "<span style='font-size:48px;font-weight:900;letter-spacing:16px;color:#059669;font-family:monospace;'>" + otp + "</span>"
        + "</div>"
        + "<p style='color:#9ca3af;font-size:13px;margin:0;'>If you didn't create a TeamHub account, you can safely ignore this email.</p>"
        + "</td></tr>"
        + "<tr><td style='background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;'>"
        + "<p style='color:#9ca3af;font-size:12px;margin:0;'>© " + java.time.Year.now().getValue() + " TeamHub HR Management</p>"
        + "</td></tr>"
        + "</table></td></tr></table></body></html>";
  }
}
