package com.studybuddy.repository;

import com.studybuddy.entity.Note;
import com.studybuddy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findAllByUserOrderByCreatedAtDesc(User user);
}
