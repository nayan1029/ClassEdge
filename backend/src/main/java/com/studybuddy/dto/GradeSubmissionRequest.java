package com.studybuddy.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GradeSubmissionRequest {
    @NotNull(message = "Grade is required")
    @Min(value = 0, message = "Grade cannot be negative")
    private Integer grade;

    private String feedback;
}
