package com.studybuddy.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI studyBuddyOpenApi() {
        return new OpenAPI().info(new Info()
                .title("StudyBuddy API")
                .description("AI-powered SaaS platform APIs for students")
                .version("v1")
                .contact(new Contact().name("StudyBuddy Team")));
    }
}
