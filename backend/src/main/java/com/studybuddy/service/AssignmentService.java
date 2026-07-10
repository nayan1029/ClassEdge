package com.studybuddy.service;

import com.studybuddy.dto.AssignmentResponse;
import com.studybuddy.dto.CreateAssignmentRequest;
import com.studybuddy.entity.Assignment;
import com.studybuddy.entity.Classroom;
import com.studybuddy.entity.SubmissionStatus;
import com.studybuddy.entity.User;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.AssignmentRepository;
import com.studybuddy.repository.SubmissionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final ClassroomService classroomService;

    @Transactional
    public AssignmentResponse create(String email, Long classroomId, CreateAssignmentRequest request) {
        User user = classroomService.findUser(email);
        Classroom classroom = classroomService.findClassroom(classroomId);
        classroomService.requireTeacherOfClass(classroom, user);

        Assignment assignment = Assignment.builder()
                .classroom(classroom)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .points(request.getPoints() == null ? 100 : request.getPoints())
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(assignmentRepository.save(assignment), classroom, user);
    }

    public List<AssignmentResponse> list(String email, Long classroomId) {
        User user = classroomService.findUser(email);
        Classroom classroom = classroomService.findClassroom(classroomId);
        classroomService.verifyMembership(classroom, user);

        return assignmentRepository.findAllByClassroomOrderByCreatedAtDesc(classroom)
                .stream()
                .map(assignment -> toResponse(assignment, classroom, user))
                .toList();
    }

    public Assignment findAssignment(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ApiException("Assignment not found"));
    }

    private AssignmentResponse toResponse(Assignment assignment, Classroom classroom, User currentUser) {
        boolean isTeacher = classroom.getTeacher().getId().equals(currentUser.getId());

        AssignmentResponse.AssignmentResponseBuilder builder = AssignmentResponse.builder()
                .id(assignment.getId())
                .classroomId(classroom.getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate())
                .points(assignment.getPoints())
                .createdAt(assignment.getCreatedAt());

        if (isTeacher) {
            long submitted = submissionRepository.findAllByAssignmentOrderBySubmittedAtAsc(assignment)
                    .stream()
                    .filter(s -> s.getStatus() != SubmissionStatus.ASSIGNED)
                    .count();
            builder.submittedCount(submitted).totalStudents(classroomService.studentCount(classroom));
        } else {
            submissionRepository.findByAssignmentAndStudent(assignment, currentUser).ifPresentOrElse(
                    submission -> builder
                            .mySubmissionStatus(submission.getStatus().name())
                            .myGrade(submission.getGrade())
                            .myFeedback(submission.getFeedback()),
                    () -> builder.mySubmissionStatus("ASSIGNED")
            );
        }

        return builder.build();
    }
}
