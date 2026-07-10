package com.studybuddy.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TimetableRequest {
    private String subjects;
    private String weakSubjects;
    private Integer dailyHours;
}
