package com.classedge.service;

import com.classedge.entity.User;
import com.classedge.exception.ApiException;
import com.classedge.repository.NoteRepository;
import com.classedge.repository.TaskRepository;
import com.classedge.repository.UserRepository;
import com.classedge.repository.ClassroomMembershipRepository;
import com.classedge.repository.ClassroomRepository;
import com.classedge.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final TaskRepository taskRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomMembershipRepository membershipRepository;
    private final AssignmentRepository assignmentRepository;

    public Map<String, Object> dashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        long noteCount = noteRepository.findAllByUserOrderByCreatedAtDesc(user).size();
        var tasks = taskRepository.findAllByUserOrderByCreatedAtDesc(user);
        long taskCount = tasks.size();
        long completedTaskCount = tasks.stream().filter(task -> task.isCompleted()).count();
        long classCount = user.getRole() != null && user.getRole().name().equals("TEACHER")
                ? classroomRepository.findAllByTeacherOrderByCreatedAtDesc(user).size()
                : membershipRepository.findAllByStudent(user).size();
        long assignmentCount = assignmentRepository.countForUserClasses(user.getId());

        return Map.of(
                "stats", Map.of(
                        "notesCount", noteCount,
                        "completedTasks", completedTaskCount,
                        "pendingTasks", Math.max(0, taskCount - completedTaskCount),
                        "classCount", classCount,
                        "assignmentCount", assignmentCount,
                        "quizAttempts", 0,
                        "focusHours", 0
                )
        );
    }
}
