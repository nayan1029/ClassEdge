package com.studybuddy.controller;

import com.studybuddy.dto.ChatMessagePayload;
import com.studybuddy.dto.CreateRoomRequest;
import com.studybuddy.dto.RoomMessageResponse;
import com.studybuddy.dto.RoomResponse;
import com.studybuddy.dto.SignalPayload;
import com.studybuddy.service.StudyRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class StudyRoomController {

    private final StudyRoomService studyRoomService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public List<RoomResponse> rooms(Authentication auth) {
        return studyRoomService.listRooms(auth == null ? null : auth.getName());
    }

    @PostMapping
    public RoomResponse createRoom(Authentication auth, @Valid @RequestBody CreateRoomRequest request) {
        return studyRoomService.createRoom(auth.getName(), request);
    }

    @PostMapping("/{roomId}/join")
    public RoomResponse joinRoom(Authentication auth, @PathVariable Long roomId) {
        return studyRoomService.joinRoom(auth.getName(), roomId);
    }

    @GetMapping("/{roomId}/messages")
    public List<RoomMessageResponse> messages(@PathVariable Long roomId) {
        return studyRoomService.getRecentMessages(roomId);
    }

    // Sent by clients over the /ws/chat STOMP socket to /app/chat/send.
    // Broadcasts to subscribers of /topic/rooms/{roomId} instead of a single global topic
    // so chat is actually scoped per study room.
    @MessageMapping("/chat/send")
    public void send(@Payload ChatMessagePayload payload) {
        RoomMessageResponse saved = studyRoomService.saveMessage(payload.getRoomId(), payload.getSenderEmail(), payload.getContent());
        messagingTemplate.convertAndSend("/topic/rooms/" + payload.getRoomId(), saved);
    }

    // WebRTC signaling relay: offers/answers/ICE candidates are opaque to the backend,
    // it just fans them out to everyone subscribed to the room's signal channel.
    // Uses public STUN only (see frontend webrtcClient.js) — works on open networks;
    // a TURN server would be needed for reliable connectivity across restrictive NATs.
    @MessageMapping("/signal/send")
    public void signal(@Payload SignalPayload payload) {
        messagingTemplate.convertAndSend("/topic/rooms/" + payload.getRoomId() + "/signal", payload);
    }
}
