package com.studybuddy.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends verification and password-reset emails.
 *
 * Requires SMTP credentials (MAIL_HOST / MAIL_USERNAME / MAIL_PASSWORD) to actually
 * deliver mail. If they are not configured, this falls back to logging the link so
 * the app and its auth flows remain fully testable in local/dev environments without
 * a real mail server.
 */
@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String name, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String subject = "Verify your StudyBuddy account";
        String body = "Hi " + name + ",\n\n"
                + "Welcome to StudyBuddy! Please verify your email address by opening this link:\n"
                + link + "\n\n"
                + "This link expires in 24 hours. If you didn't create this account, you can ignore this email.\n";

        send(toEmail, subject, body, link);
    }

    public void sendPasswordResetEmail(String toEmail, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String subject = "Reset your StudyBuddy password";
        String body = "Hi " + name + ",\n\n"
                + "We received a request to reset your StudyBuddy password. Open this link to choose a new one:\n"
                + link + "\n\n"
                + "This link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n";

        send(toEmail, subject, body, link);
    }

    private void send(String toEmail, String subject, String body, String link) {
        if (!mailEnabled) {
            log.info("[EMAIL DISABLED] Would send to {} — subject: '{}' — link: {}", toEmail, subject, link);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", toEmail, ex.getMessage());
        }
    }
}
