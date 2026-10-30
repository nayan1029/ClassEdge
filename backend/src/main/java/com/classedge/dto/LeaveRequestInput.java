package com.classedge.dto;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
@Getter @Setter
public class LeaveRequestInput { private Long classroomId; private LocalDate startDate; private LocalDate endDate; private String reason; }
