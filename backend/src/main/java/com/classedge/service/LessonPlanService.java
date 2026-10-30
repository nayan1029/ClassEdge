package com.classedge.service;
import com.classedge.dto.LessonPlanRequest;
import com.classedge.dto.LessonPlanResponse;
import com.classedge.dto.LessonPlanDraftRequest;
import com.classedge.entity.*;
import com.classedge.exception.ApiException;
import com.classedge.repository.LessonPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
@Service @RequiredArgsConstructor
public class LessonPlanService {
    private final LessonPlanRepository plans;
    private final ClassroomService classrooms;
    private final AiService aiService;
    @Transactional(readOnly = true)
    public List<LessonPlanResponse> list(String email, Long classroomId) {
        User user = classrooms.findUser(email); Classroom classroom = classrooms.findClassroom(classroomId); classrooms.verifyMembership(classroom, user);
        return plans.findAllByClassroomOrderByLessonDateDescCreatedAtDesc(classroom).stream().map(this::response).toList();
    }
    @Transactional
    public LessonPlanResponse create(String email, Long classroomId, LessonPlanRequest input) {
        User teacher = classrooms.findUser(email); Classroom classroom = classrooms.findClassroom(classroomId); classrooms.requireTeacherOfClass(classroom, teacher);
        if (input.getTitle() == null || input.getTitle().isBlank()) throw new ApiException("Lesson title is required");
        if (input.getContent() == null || input.getContent().isBlank()) throw new ApiException("Add lesson content before publishing");
        LessonPlan saved = plans.save(LessonPlan.builder().classroom(classroom).teacher(teacher).title(input.getTitle().trim())
                .subject(blank(input.getSubject())).lessonDate(input.getLessonDate()).objectives(blank(input.getObjectives()))
                .content(input.getContent().trim()).createdAt(LocalDateTime.now()).build());
        return response(saved);
    }
    @Transactional
    public LessonPlanResponse update(String email, Long classroomId, Long planId, LessonPlanRequest input) {
        User teacher = classrooms.findUser(email); Classroom classroom = classrooms.findClassroom(classroomId); classrooms.requireTeacherOfClass(classroom, teacher);
        LessonPlan plan = plans.findById(planId).orElseThrow(() -> new ApiException("Lesson plan not found"));
        if (!plan.getClassroom().getId().equals(classroomId)) throw new ApiException("Lesson plan does not belong to this class");
        if (input.getTitle() == null || input.getTitle().isBlank() || input.getContent() == null || input.getContent().isBlank()) throw new ApiException("Lesson title and content are required");
        plan.setTitle(input.getTitle().trim()); plan.setSubject(blank(input.getSubject())); plan.setLessonDate(input.getLessonDate());
        plan.setObjectives(blank(input.getObjectives())); plan.setContent(input.getContent().trim());
        return response(plans.save(plan));
    }
    public java.util.Map<String, Object> draft(String email, Long classroomId, LessonPlanDraftRequest input) {
        User teacher = classrooms.findUser(email); Classroom classroom = classrooms.findClassroom(classroomId); classrooms.requireTeacherOfClass(classroom, teacher);
        if (input.getTitle() == null || input.getTitle().isBlank()) throw new ApiException("Enter a lesson topic first");
        String subject = input.getSubject() == null || input.getSubject().isBlank() ? classroom.getSubject() : input.getSubject();
        return aiService.draftLessonPlan(input.getTitle(), subject, input.getClassLevel());
    }
    @Transactional
    public void delete(String email, Long classroomId, Long planId) {
        User user = classrooms.findUser(email); Classroom classroom = classrooms.findClassroom(classroomId); classrooms.requireTeacherOfClass(classroom, user);
        LessonPlan plan = plans.findById(planId).orElseThrow(() -> new ApiException("Lesson plan not found"));
        if (!plan.getClassroom().getId().equals(classroomId)) throw new ApiException("Lesson plan does not belong to this class");
        plans.delete(plan);
    }
    private String blank(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private LessonPlanResponse response(LessonPlan plan) { return LessonPlanResponse.builder().id(plan.getId()).classroomId(plan.getClassroom().getId()).classroomName(plan.getClassroom().getName()).title(plan.getTitle()).subject(plan.getSubject()).lessonDate(plan.getLessonDate()).objectives(plan.getObjectives()).content(plan.getContent()).teacherName(plan.getTeacher().getName()).createdAt(plan.getCreatedAt()).build(); }
}
