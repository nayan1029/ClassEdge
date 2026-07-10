package com.studybuddy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinClassroomRequest {
    @NotBlank(message = "Class code is required")
    private String classCode;
}
