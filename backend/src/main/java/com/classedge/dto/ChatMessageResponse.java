package com.classedge.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {
    private Long id;
    private Long classroomId;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime sentAt;
}
