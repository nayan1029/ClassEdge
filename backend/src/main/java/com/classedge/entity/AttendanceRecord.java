package com.classedge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "attendance_records", uniqueConstraints = @UniqueConstraint(columnNames = {"classroom_id", "student_id", "attendance_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "classroom_id", nullable = false) private Classroom classroom;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id", nullable = false) private User student;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "marked_by", nullable = false) private User markedBy;
    @Column(name = "attendance_date", nullable = false) private LocalDate attendanceDate;
    @Column(nullable = false) private String status;
}
