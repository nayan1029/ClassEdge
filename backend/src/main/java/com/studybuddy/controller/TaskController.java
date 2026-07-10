package com.studybuddy.controller;

import com.studybuddy.dto.TaskRequest;
import com.studybuddy.dto.TaskResponse;
import com.studybuddy.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public TaskResponse create(Authentication auth, @RequestBody TaskRequest request) {
        return taskService.create(auth.getName(), request);
    }

    @GetMapping
    public List<TaskResponse> getAll(Authentication auth) {
        return taskService.getAll(auth.getName());
    }
}
