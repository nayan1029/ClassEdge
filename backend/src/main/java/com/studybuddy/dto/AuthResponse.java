package com.studybuddy.dto;

import com.studybuddy.entity.AuthProvider;
import com.studybuddy.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserResponse user;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private Role role;
        private boolean emailVerified;
        private AuthProvider provider;
    }
}
