package com.studybuddy.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RoomMessageResponse {
    private Long id;
    private Long roomId;
    private String sender;
    private String content;
    private LocalDateTime sentAt;
}
