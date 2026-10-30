package com.classedge.repository;

import com.classedge.entity.Classroom;
import com.classedge.entity.ClassroomChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassroomChatMessageRepository extends JpaRepository<ClassroomChatMessage, Long> {
    List<ClassroomChatMessage> findTop100ByClassroomOrderBySentAtDesc(Classroom classroom);
}
