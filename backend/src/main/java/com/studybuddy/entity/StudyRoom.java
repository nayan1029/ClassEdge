package com.studybuddy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Set when this room is the auto-created Meet/Chat space for a Classroom,
    // rather than a standalone user-created study room. Null for standalone rooms.
    @Column(name = "classroom_id")
    private Long classroomId;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
