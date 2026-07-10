package com.studybuddy.service;

import com.studybuddy.dto.CreateRoomRequest;
import com.studybuddy.dto.RoomMessageResponse;
import com.studybuddy.dto.RoomResponse;
import com.studybuddy.entity.*;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.RoomMembershipRepository;
import com.studybuddy.repository.RoomMessageRepository;
import com.studybuddy.repository.StudyRoomRepository;
import com.studybuddy.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyRoomService {

    private final StudyRoomRepository studyRoomRepository;
    private final RoomMembershipRepository roomMembershipRepository;
    private final RoomMessageRepository roomMessageRepository;
    private final UserRepository userRepository;

    public List<RoomResponse> listRooms(String email) {
        User currentUser = email == null ? null : userRepository.findByEmail(email).orElse(null);

        return studyRoomRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(room -> toResponse(room, currentUser))
                .toList();
    }

    @Transactional
    public RoomResponse createRoom(String email, CreateRoomRequest request) {
        User user = findUser(email);

        RoomStatus status = parseStatus(request.getStatus());

        StudyRoom room = StudyRoom.builder()
                .name(request.getName().trim())
                .topic(request.getTopic() == null ? null : request.getTopic().trim())
                .status(status)
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .build();

        room = studyRoomRepository.save(room);

        // Creator automatically joins their own room.
        roomMembershipRepository.save(RoomMembership.builder()
                .room(room)
                .user(user)
                .joinedAt(LocalDateTime.now())
                .build());

        return toResponse(room, user);
    }

    @Transactional
    public RoomResponse joinRoom(String email, Long roomId) {
        User user = findUser(email);
        StudyRoom room = findRoom(roomId);

        if (!roomMembershipRepository.existsByRoomAndUser(room, user)) {
            roomMembershipRepository.save(RoomMembership.builder()
                    .room(room)
                    .user(user)
                    .joinedAt(LocalDateTime.now())
                    .build());
        }

        return toResponse(room, user);
    }

    public List<RoomMessageResponse> getRecentMessages(Long roomId) {
        StudyRoom room = findRoom(roomId);

        return roomMessageRepository.findTop50ByRoomOrderBySentAtDesc(room)
                .stream()
                .sorted(Comparator.comparing(RoomMessage::getSentAt))
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public RoomMessageResponse saveMessage(Long roomId, String senderEmail, String content) {
        if (content == null || content.isBlank()) {
            throw new ApiException("Message cannot be empty");
        }

        StudyRoom room = findRoom(roomId);
        User sender = findUser(senderEmail);

        RoomMessage message = RoomMessage.builder()
                .room(room)
                .sender(sender)
                .content(content.trim())
                .sentAt(LocalDateTime.now())
                .build();

        return toMessageResponse(roomMessageRepository.save(message));
    }

    private RoomStatus parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return RoomStatus.SCHEDULED;
        }
        try {
            return RoomStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return RoomStatus.SCHEDULED;
        }
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
    }

    private StudyRoom findRoom(Long roomId) {
        return studyRoomRepository.findById(roomId)
                .orElseThrow(() -> new ApiException("Study room not found"));
    }

    private RoomResponse toResponse(StudyRoom room, User currentUser) {
        long memberCount = roomMembershipRepository.countByRoom(room);
        boolean joined = currentUser != null && roomMembershipRepository.existsByRoomAndUser(room, currentUser);

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .topic(room.getTopic())
                .status(room.getStatus().name())
                .members(memberCount)
                .joined(joined)
                .build();
    }

    private RoomMessageResponse toMessageResponse(RoomMessage message) {
        return RoomMessageResponse.builder()
                .id(message.getId())
                .roomId(message.getRoom().getId())
                .sender(message.getSender().getName())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .build();
    }
}
