package com.studybuddy.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClassroomResponse {
    private Long id;
    private String name;
    private String subject;
    private String section;
    private String description;
    private String classCode;
    private String teacherName;
    private long memberCount;
    // "TEACHER" or "STUDENT" — the current caller's relationship to this class.
    private String myRole;
    // Backing StudyRoom id for the Meet/Chat tab.
    private Long roomId;
}
