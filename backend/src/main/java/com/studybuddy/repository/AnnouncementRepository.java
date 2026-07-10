package com.studybuddy.repository;

import com.studybuddy.entity.Announcement;
import com.studybuddy.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByClassroomOrderByCreatedAtDesc(Classroom classroom);
}
