package com.classedge.dto;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
@Getter @Setter
public class LessonPlanRequest { private String title; private String subject; private LocalDate lessonDate; private String objectives; private String content; }
