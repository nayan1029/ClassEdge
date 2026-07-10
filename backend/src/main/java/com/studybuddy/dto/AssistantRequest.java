package com.studybuddy.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssistantRequest {

    @NotBlank
    private String text;

    private List<ChatMessage> history;

    @Getter
    @Setter
    public static class ChatMessage {
        private String role;
        private String content;
    }
}