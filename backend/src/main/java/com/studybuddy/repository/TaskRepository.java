package com.studybuddy.repository;

import com.studybuddy.entity.Task;
import com.studybuddy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByUserOrderByCreatedAtDesc(User user);
}
