package com.studybuddy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateClassroomRequest {
    @NotBlank(message = "Class name is required")
    private String name;

    private String subject;
    private String section;
    private String description;
}
