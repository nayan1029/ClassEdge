package com.classedge.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity @Table(name = "leave_requests") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "classroom_id", nullable = false) private Classroom classroom;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id", nullable = false) private User student;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "reviewed_by") private User reviewedBy;
    @Column(nullable = false) private LocalDate startDate;
    @Column(nullable = false) private LocalDate endDate;
    @Column(nullable = false, length = 1000) private String reason;
    @Column(nullable = false) private String status;
    @Column(nullable = false) private LocalDateTime createdAt;
}
