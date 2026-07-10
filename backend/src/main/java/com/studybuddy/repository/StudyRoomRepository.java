package com.studybuddy.repository;

import com.studybuddy.entity.StudyRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyRoomRepository extends JpaRepository<StudyRoom, Long> {
    List<StudyRoom> findAllByOrderByCreatedAtDesc();
    java.util.Optional<StudyRoom> findByClassroomId(Long classroomId);
}
