package com.studybuddy.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoomResponse {
    private Long id;
    private String name;
    private String topic;
    private String status;
    private long members;
    private boolean joined;
}
