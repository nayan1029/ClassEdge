package com.studybuddy.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetable_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mapped to a non-default column name because "day" is a reserved SQL keyword
    // in H2 (used in INTERVAL DAY TO SECOND syntax) — using it unquoted broke
    // table creation with a syntax error.
    @Column(name = "day_of_week", nullable = false)
    private String day;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String timeSlot;

    @Column(nullable = false)
    private String focus;

    @Column(nullable = false)
    private Integer sortOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
