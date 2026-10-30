package com.classedge.dto;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
@Getter @Setter
public class FeeInput { private Long studentId; private String description; private BigDecimal amount; private LocalDate dueDate; }
