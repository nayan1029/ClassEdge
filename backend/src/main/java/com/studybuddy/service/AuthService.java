package com.studybuddy.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.studybuddy.dto.AuthRequest;
import com.studybuddy.dto.AuthResponse;
import com.studybuddy.dto.RegisterRequest;
import com.studybuddy.entity.AuthProvider;
import com.studybuddy.entity.Role;
import com.studybuddy.entity.User;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.UserRepository;
import com.studybuddy.security.JwtService;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered");
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(resolveSignupRole(request.getRole()))
                .provider(AuthProvider.LOCAL)
                .emailVerified(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .build();

        User saved = userRepository.save(user);
        emailService.sendVerificationEmail(saved.getEmail(), saved.getName(), verificationToken);

        String token = jwtService.generateToken(saved.getEmail());
        return buildAuthResponse(saved, token);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid credentials"));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new ApiException("This account uses Google sign-in. Please continue with Google instead.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException | org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            throw new ApiException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail());
        return buildAuthResponse(user, token);
    }

    public AuthResponse.UserResponse currentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        return toUserResponse(user);
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ApiException("Invalid or expired verification link"));

        if (user.getVerificationTokenExpiry() == null || user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ApiException("This verification link has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
    }

    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        if (user.isEmailVerified()) {
            throw new ApiException("This email is already verified");
        }

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), user.getName(), verificationToken);
    }

    public void forgotPassword(String email) {
        // Always behave the same whether or not the email exists, so we don't leak
        // which addresses are registered.
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.getProvider() != AuthProvider.LOCAL) {
                return;
            }
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetToken);
        });
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new ApiException("Invalid or expired reset link"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ApiException("This reset link has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    // ADMIN can never be chosen at signup — only STUDENT/TEACHER, defaulting to
    // STUDENT for anything blank or invalid.
    private Role resolveSignupRole(String requestedRole) {
        if (requestedRole == null) {
            return Role.STUDENT;
        }
        try {
            Role role = Role.valueOf(requestedRole.trim().toUpperCase());
            return role == Role.ADMIN ? Role.STUDENT : role;
        } catch (IllegalArgumentException ex) {
            return Role.STUDENT;
        }
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(user))
                .build();
    }

    private AuthResponse.UserResponse toUserResponse(User user) {
        return AuthResponse.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .provider(user.getProvider())
                .build();
    }
}
