package com.studybuddy.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SubmissionResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String content;
    private String status;
    private LocalDateTime submittedAt;
    private Integer grade;
    private String feedback;
    private LocalDateTime gradedAt;
}
