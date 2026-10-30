package com.classedge.repository;
import com.classedge.entity.Classroom;
import com.classedge.entity.LessonPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LessonPlanRepository extends JpaRepository<LessonPlan, Long> { List<LessonPlan> findAllByClassroomOrderByLessonDateDescCreatedAtDesc(Classroom classroom); }
