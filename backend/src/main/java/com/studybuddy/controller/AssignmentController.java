package com.studybuddy.controller;

import com.studybuddy.dto.AssignmentResponse;
import com.studybuddy.dto.CreateAssignmentRequest;
import com.studybuddy.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms/{classroomId}/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public List<AssignmentResponse> list(Authentication auth, @PathVariable Long classroomId) {
        return assignmentService.list(auth.getName(), classroomId);
    }

    @PostMapping
    public AssignmentResponse create(Authentication auth, @PathVariable Long classroomId,
                                      @Valid @RequestBody CreateAssignmentRequest request) {
        return assignmentService.create(auth.getName(), classroomId, request);
    }
}
