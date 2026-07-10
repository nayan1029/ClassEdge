package com.studybuddy.service;

import com.studybuddy.dto.TaskRequest;
import com.studybuddy.dto.TaskResponse;
import com.studybuddy.entity.Task;
import com.studybuddy.entity.User;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.TaskRepository;
import com.studybuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskResponse create(String email, TaskRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Task task = Task.builder()
                .title(request.getTitle())
                .deadline(request.getDeadline())
                .completed(false)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getAll(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        return taskRepository.findAllByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .deadline(task.getDeadline())
                .completed(task.isCompleted())
                .build();
    }
}
