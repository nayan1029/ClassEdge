package com.classedge.repository;

import com.classedge.entity.LearningModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningModuleRepository extends JpaRepository<LearningModule, Long> {
    List<LearningModule> findAllByOrderByUploadedAtDesc();
}
