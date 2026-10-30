package com.classedge.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LearningModuleResponse {
    private Long id;
    private String title;
    private String subject;
    private String description;
    private String fileName;
    private String contentType;
    private String teacherName;
    private LocalDateTime uploadedAt;
}
