package com.studybuddy.config;

import com.studybuddy.entity.RoomStatus;
import com.studybuddy.entity.StudyRoom;
import com.studybuddy.repository.StudyRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds a handful of starter study rooms on first boot so the Study Rooms page
 * isn't empty before any user has created one. Only runs when the table is empty,
 * so it never overwrites real user-created rooms.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final StudyRoomRepository studyRoomRepository;

    @Override
    public void run(String... args) {
        if (studyRoomRepository.count() > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        studyRoomRepository.saveAll(List.of(
                StudyRoom.builder()
                        .name("DSA Night Sprint")
                        .topic("Stacks, queues, and recursion")
                        .status(RoomStatus.LIVE)
                        .createdAt(now)
                        .build(),
                StudyRoom.builder()
                        .name("DBMS Revision Pod")
                        .topic("Normalization and SQL joins")
                        .status(RoomStatus.SCHEDULED)
                        .createdAt(now)
                        .build(),
                StudyRoom.builder()
                        .name("Aptitude Challenge")
                        .topic("Placement speed practice")
                        .status(RoomStatus.LIVE)
                        .createdAt(now)
                        .build()
        ));
    }
}
