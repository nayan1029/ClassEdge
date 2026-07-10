package com.studybuddy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

/**
 * Registers Google as an OAuth2 login provider — but only when GOOGLE_CLIENT_ID is
 * actually set. Without it, no ClientRegistrationRepository bean is created at all,
 * "Continue with Google" simply isn't wired up, and the rest of the app (JWT auth,
 * everything else) runs completely normally. This avoids the common failure mode
 * where Spring Boot's property-based OAuth2 autoconfiguration throws at startup
 * because client-id/client-secret are blank.
 *
 * Google's registration is built by hand with its well-known OAuth2 endpoints rather
 * than via CommonOAuth2Provider.GOOGLE — that convenience enum was removed from the
 * Spring Security version Spring Boot 3.3.2 pulls in, so relying on it fails to
 * compile.
 */
@Configuration
public class OAuth2ClientConfig {

    @Value("${google.oauth.client-id:}")
    private String googleClientId;

    @Value("${google.oauth.client-secret:}")
    private String googleClientSecret;

    @Bean
    @ConditionalOnExpression("!'${google.oauth.client-id:}'.isEmpty()")
    public ClientRegistrationRepository clientRegistrationRepository() {
        ClientRegistration google = ClientRegistration.withRegistrationId("google")
                .clientId(googleClientId)
                .clientSecret(googleClientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid", "profile", "email")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://www.googleapis.com/oauth2/v4/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                .clientName("Google")
                .build();

        return new InMemoryClientRegistrationRepository(google);
    }
}
