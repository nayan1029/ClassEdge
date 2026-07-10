package com.studybuddy.security;

import com.studybuddy.entity.AuthProvider;
import com.studybuddy.entity.Role;
import com.studybuddy.entity.User;
import com.studybuddy.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Runs after a successful "Continue with Google" login. Finds or creates a local
 * User record for the Google account, issues our own JWT for it (so the rest of the
 * app keeps using the same Bearer-token auth everywhere), and redirects back to the
 * frontend with the token in the URL for the SPA to pick up.
 *
 * Only reachable once GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are configured — see
 * SecurityConfig and application.properties.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler, AuthenticationFailureHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            response.sendRedirect(UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("error", "google_email_missing")
                    .build().toUriString());
            return;
        }

        User user = userRepository.findByEmail(email).map(existingUser -> {
            if (existingUser.getProvider() == AuthProvider.LOCAL) {
                existingUser.setProvider(AuthProvider.GOOGLE);
            }
            if (!existingUser.isEmailVerified()) {
                existingUser.setEmailVerified(true);
                existingUser.setVerificationToken(null);
                existingUser.setVerificationTokenExpiry(null);
            }
            if (name != null && !name.isBlank() && !name.equals(existingUser.getName())) {
                existingUser.setName(name);
            }
            return userRepository.save(existingUser);
        }).orElseGet(() -> {
            User newUser = User.builder()
                    .name(name == null || name.isBlank() ? email : name)
                    .email(email)
                    .role(Role.STUDENT)
                    .provider(AuthProvider.GOOGLE)
                    .emailVerified(true) // Google has already verified this address.
                    .build();
            return userRepository.save(newUser);
        });

        String token = jwtService.generateToken(user.getEmail());

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth-callback")
                .queryParam("token", token)
                .build().toUriString();

        response.sendRedirect(redirectUrl);
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        response.sendRedirect(UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                .queryParam("error", "google_login_failed")
                .build().toUriString());
    }
}


