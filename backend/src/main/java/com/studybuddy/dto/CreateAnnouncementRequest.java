package com.studybuddy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAnnouncementRequest {
    @NotBlank(message = "Announcement cannot be empty")
    private String content;
}
