package com.classedge.dto;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
@Getter @Builder
public class AttendanceResponse {
    private Long studentId;
    private String studentName;
    private LocalDate date;
    private String status;
}
