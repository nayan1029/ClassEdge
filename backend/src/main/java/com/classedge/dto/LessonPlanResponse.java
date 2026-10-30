package com.classedge.dto;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Getter @Builder
public class LessonPlanResponse { private Long id; private Long classroomId; private String classroomName; private String title; private String subject; private LocalDate lessonDate; private String objectives; private String content; private String teacherName; private LocalDateTime createdAt; }
