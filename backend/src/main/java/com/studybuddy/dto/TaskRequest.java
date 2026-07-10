package com.studybuddy.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TaskRequest {
    private String title;
    private LocalDate deadline;
}
