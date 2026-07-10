package com.studybuddy.service;

import com.studybuddy.dto.GradeSubmissionRequest;
import com.studybuddy.dto.SubmissionResponse;
import com.studybuddy.entity.Assignment;
import com.studybuddy.entity.Classroom;
import com.studybuddy.entity.Submission;
import com.studybuddy.entity.SubmissionStatus;
import com.studybuddy.entity.User;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.SubmissionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentService assignmentService;
    private final ClassroomService classroomService;

    @Transactional
    public SubmissionResponse submit(String email, Long assignmentId, String content) {
        User student = classroomService.findUser(email);
        Assignment assignment = assignmentService.findAssignment(assignmentId);
        Classroom classroom = assignment.getClassroom();
        classroomService.verifyMembership(classroom, student);

        if (classroom.getTeacher().getId().equals(student.getId())) {
            throw new ApiException("Teachers cannot submit their own assignment");
        }

        Submission submission = submissionRepository.findByAssignmentAndStudent(assignment, student)
                .orElseGet(() -> Submission.builder().assignment(assignment).student(student).build());

        submission.setContent(content.trim());
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(LocalDateTime.now());

        return toResponse(submissionRepository.save(submission));
    }

    public List<SubmissionResponse> listForAssignment(String email, Long assignmentId) {
        User teacher = classroomService.findUser(email);
        Assignment assignment = assignmentService.findAssignment(assignmentId);
        classroomService.requireTeacherOfClass(assignment.getClassroom(), teacher);

        return submissionRepository.findAllByAssignmentOrderBySubmittedAtAsc(assignment)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SubmissionResponse grade(String email, Long submissionId, GradeSubmissionRequest request) {
        User teacher = classroomService.findUser(email);
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ApiException("Submission not found"));

        classroomService.requireTeacherOfClass(submission.getAssignment().getClassroom(), teacher);

        submission.setGrade(request.getGrade());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.GRADED);
        submission.setGradedAt(LocalDateTime.now());

        return toResponse(submissionRepository.save(submission));
    }

    private SubmissionResponse toResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getName())
                .content(submission.getContent())
                .status(submission.getStatus().name())
                .submittedAt(submission.getSubmittedAt())
                .grade(submission.getGrade())
                .feedback(submission.getFeedback())
                .gradedAt(submission.getGradedAt())
                .build();
    }
}
