package com.studybuddy.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AssignmentResponse {
    private Long id;
    private Long classroomId;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Integer points;
    private LocalDateTime createdAt;

    // Populated only when the caller is a student enrolled in the class.
    private String mySubmissionStatus;
    private Integer myGrade;
    private String myFeedback;

    // Populated only when the caller is the teacher — how many students have submitted.
    private Long submittedCount;
    private Long totalStudents;
}
