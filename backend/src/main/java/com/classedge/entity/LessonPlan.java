package com.classedge.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity @Table(name = "lesson_plans") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LessonPlan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "classroom_id", nullable = false) private Classroom classroom;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "teacher_id", nullable = false) private User teacher;
    @Column(nullable = false) private String title;
    private String subject;
    private LocalDate lessonDate;
    @Column(length = 4000) private String objectives;
    @Column(length = 8000) private String content;
    @Column(nullable = false) private LocalDateTime createdAt;
}
