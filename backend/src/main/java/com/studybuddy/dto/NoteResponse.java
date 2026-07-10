package com.studybuddy.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NoteResponse {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
}
