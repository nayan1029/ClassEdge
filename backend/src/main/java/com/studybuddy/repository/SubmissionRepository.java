package com.studybuddy.repository;

import com.studybuddy.entity.Assignment;
import com.studybuddy.entity.Submission;
import com.studybuddy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findAllByAssignmentOrderBySubmittedAtAsc(Assignment assignment);
    Optional<Submission> findByAssignmentAndStudent(Assignment assignment, User student);
    List<Submission> findAllByStudentOrderByGradedAtDesc(User student);
}
