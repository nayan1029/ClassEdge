package com.studybuddy.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TimetableEntryResponse {
    private Long id;
    private String day;
    private String subject;
    private String time;
    private String focus;
}
