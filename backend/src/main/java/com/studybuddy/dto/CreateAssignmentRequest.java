package com.studybuddy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateAssignmentRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private LocalDateTime dueDate;
    private Integer points;
}
