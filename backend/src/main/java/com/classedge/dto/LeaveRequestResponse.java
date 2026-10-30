package com.classedge.dto;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Getter @Builder
public class LeaveRequestResponse {
    private Long id; private Long classroomId; private String classroomName; private Long studentId; private String studentName;
    private LocalDate startDate; private LocalDate endDate; private String reason; private String status; private LocalDateTime createdAt;
}
