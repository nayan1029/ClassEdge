package com.classedge.repository;

import com.classedge.entity.Classroom;
import com.classedge.entity.ClassroomMembership;
import com.classedge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassroomMembershipRepository extends JpaRepository<ClassroomMembership, Long> {
    List<ClassroomMembership> findAllByStudentOrderByJoinedAtDesc(User student);
    List<ClassroomMembership> findAllByStudent(User student);
    List<ClassroomMembership> findAllByClassroomOrderByJoinedAtAsc(Classroom classroom);
    Optional<ClassroomMembership> findByClassroomAndStudent(Classroom classroom, User student);
    boolean existsByClassroomAndStudent(Classroom classroom, User student);
    long countByClassroom(Classroom classroom);
}
