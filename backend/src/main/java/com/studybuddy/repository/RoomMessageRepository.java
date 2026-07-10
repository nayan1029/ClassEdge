package com.studybuddy.repository;

import com.studybuddy.entity.RoomMessage;
import com.studybuddy.entity.StudyRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomMessageRepository extends JpaRepository<RoomMessage, Long> {
    List<RoomMessage> findTop50ByRoomOrderBySentAtDesc(StudyRoom room);
}
