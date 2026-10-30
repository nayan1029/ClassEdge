package com.classedge.controller;
import com.classedge.dto.LessonPlanRequest;
import com.classedge.dto.LessonPlanResponse;
import com.classedge.dto.LessonPlanDraftRequest;
import com.classedge.service.LessonPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/classrooms/{classroomId}/lesson-plans") @RequiredArgsConstructor
public class LessonPlanController {
    private final LessonPlanService service;
    @GetMapping public List<LessonPlanResponse> list(Authentication auth, @PathVariable Long classroomId) { return service.list(auth.getName(), classroomId); }
    @PostMapping public LessonPlanResponse create(Authentication auth, @PathVariable Long classroomId, @RequestBody LessonPlanRequest request) { return service.create(auth.getName(), classroomId, request); }
    @PutMapping("/{planId}") public LessonPlanResponse update(Authentication auth, @PathVariable Long classroomId, @PathVariable Long planId, @RequestBody LessonPlanRequest request) { return service.update(auth.getName(), classroomId, planId, request); }
    @PostMapping("/generate") public java.util.Map<String, Object> draft(Authentication auth, @PathVariable Long classroomId, @RequestBody LessonPlanDraftRequest request) { return service.draft(auth.getName(), classroomId, request); }
    @DeleteMapping("/{planId}") public void delete(Authentication auth, @PathVariable Long classroomId, @PathVariable Long planId) { service.delete(auth.getName(), classroomId, planId); }
}
