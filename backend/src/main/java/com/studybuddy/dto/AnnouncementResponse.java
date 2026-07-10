package com.studybuddy.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AnnouncementResponse {
    private Long id;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
}
