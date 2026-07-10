package com.studybuddy.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private LocalDate deadline;
    private boolean completed;
}
