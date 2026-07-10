package com.studybuddy.repository;

import com.studybuddy.entity.RoomMembership;
import com.studybuddy.entity.StudyRoom;
import com.studybuddy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomMembershipRepository extends JpaRepository<RoomMembership, Long> {
    long countByRoom(StudyRoom room);

    Optional<RoomMembership> findByRoomAndUser(StudyRoom room, User user);

    boolean existsByRoomAndUser(StudyRoom room, User user);
}
