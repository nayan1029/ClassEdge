package com.classedge.dto;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDate;
@Getter @Builder
public class FeeResponse { private Long id; private Long studentId; private String studentName; private String description; private BigDecimal amount; private LocalDate dueDate; private String status; }
