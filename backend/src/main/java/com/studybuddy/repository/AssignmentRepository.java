package com.studybuddy.repository;

import com.studybuddy.entity.Assignment;
import com.studybuddy.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findAllByClassroomOrderByCreatedAtDesc(Classroom classroom);
}
