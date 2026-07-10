package com.studybuddy.service;

import com.studybuddy.entity.User;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.NoteRepository;
import com.studybuddy.repository.TaskRepository;
import com.studybuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final TaskRepository taskRepository;

    public Map<String, Object> dashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        long noteCount = noteRepository.findAllByUserOrderByCreatedAtDesc(user).size();
        long taskCount = taskRepository.findAllByUserOrderByCreatedAtDesc(user).size();

        return Map.of(
                "stats", Map.of(
                        "notesCount", noteCount,
                        "completedTasks", 0,
                        "quizAttempts", 0,
                        "focusHours", 0
                )
        );
    }
}
