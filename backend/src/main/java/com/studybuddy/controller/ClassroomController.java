package com.studybuddy.controller;

import com.studybuddy.dto.ClassroomResponse;
import com.studybuddy.dto.CreateClassroomRequest;
import com.studybuddy.dto.JoinClassroomRequest;
import com.studybuddy.dto.RosterMemberResponse;
import com.studybuddy.service.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping
    public List<ClassroomResponse> myClassrooms(Authentication auth) {
        return classroomService.listMyClassrooms(auth.getName());
    }

    @PostMapping
    public ClassroomResponse create(Authentication auth, @Valid @RequestBody CreateClassroomRequest request) {
        return classroomService.createClassroom(auth.getName(), request);
    }

    @PostMapping("/join")
    public ClassroomResponse join(Authentication auth, @Valid @RequestBody JoinClassroomRequest request) {
        return classroomService.joinClassroom(auth.getName(), request.getClassCode());
    }

    @GetMapping("/{classroomId}")
    public ClassroomResponse get(Authentication auth, @PathVariable Long classroomId) {
        return classroomService.getClassroom(auth.getName(), classroomId);
    }

    @GetMapping("/{classroomId}/roster")
    public List<RosterMemberResponse> roster(Authentication auth, @PathVariable Long classroomId) {
        return classroomService.getRoster(auth.getName(), classroomId);
    }
}
