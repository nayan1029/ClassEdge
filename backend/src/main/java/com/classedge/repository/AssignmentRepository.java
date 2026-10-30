package com.classedge.repository;

import com.classedge.entity.Assignment;
import com.classedge.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findAllByClassroomOrderByCreatedAtDesc(Classroom classroom);

    @Query("select count(a) from Assignment a where a.classroom.teacher.id = :userId or exists (select m.id from ClassroomMembership m where m.classroom = a.classroom and m.student.id = :userId)")
    long countForUserClasses(@Param("userId") Long userId);
}
