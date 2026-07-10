package com.studybuddy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRoomRequest {
    @NotBlank(message = "Room name is required")
    private String name;

    private String topic;

    private String status;
}
