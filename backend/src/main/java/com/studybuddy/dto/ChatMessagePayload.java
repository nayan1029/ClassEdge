package com.studybuddy.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessagePayload {
    private Long roomId;
    private String senderEmail;
    private String content;
}
