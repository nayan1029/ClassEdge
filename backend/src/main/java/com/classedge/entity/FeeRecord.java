package com.classedge.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity @Table(name = "fee_records") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id", nullable = false) private User student;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by", nullable = false) private User createdBy;
    @Column(nullable = false, length = 160) private String description;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal amount;
    @Column(nullable = false) private LocalDate dueDate;
    @Column(nullable = false) private String status;
    @Column(nullable = false) private LocalDateTime createdAt;
}
