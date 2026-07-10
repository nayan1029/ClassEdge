package com.studybuddy.controller;

import com.studybuddy.dto.*;
import com.studybuddy.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AuthResponse.UserResponse me(Authentication authentication) {
        return authService.currentUser(authentication.getName());
    }

    @PostMapping("/verify-email")
    public MessageResponse verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return new MessageResponse("Email verified successfully. You can now use all StudyBuddy features.");
    }

    @PostMapping("/resend-verification")
    public MessageResponse resendVerification(Authentication authentication) {
        authService.resendVerification(authentication.getName());
        return new MessageResponse("Verification email sent. Please check your inbox.");
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return new MessageResponse("If that email is registered, a password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return new MessageResponse("Password reset successfully. You can now log in with your new password.");
    }
}
