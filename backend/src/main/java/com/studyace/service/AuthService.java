package com.studyace.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.studyace.dto.AuthRequest;
import com.studyace.dto.AuthResponse;
import com.studyace.dto.RegisterRequest;
import com.studyace.entity.Role;
import com.studyace.entity.User;
import com.studyace.exception.ApiException;
import com.studyace.repository.UserRepository;
import com.studyace.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getEmail());
        return buildAuthResponse(saved, token);
    }

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException | org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            throw new ApiException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid credentials"));

        String token = jwtService.generateToken(user.getEmail());
        return buildAuthResponse(user, token);
    }

    public AuthResponse.UserResponse currentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        return AuthResponse.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
