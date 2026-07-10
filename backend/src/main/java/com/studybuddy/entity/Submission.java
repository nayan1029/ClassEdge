package com.studybuddy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions", uniqueConstraints = @UniqueConstraint(columnNames = {"assignment_id", "student_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // Text answer or a link (e.g. to a doc/drive file) — no binary file upload in this version.
    @Column(length = 4000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.ASSIGNED;

    private LocalDateTime submittedAt;

    private Integer grade;

    @Column(length = 2000)
    private String feedback;

    private LocalDateTime gradedAt;
}
