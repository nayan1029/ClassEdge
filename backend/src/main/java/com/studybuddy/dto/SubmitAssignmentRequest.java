package com.studybuddy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitAssignmentRequest {
    @NotBlank(message = "Submission cannot be empty")
    private String content;
}
