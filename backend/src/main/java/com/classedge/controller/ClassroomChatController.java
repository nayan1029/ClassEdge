package com.classedge.controller;

import com.classedge.dto.ChatMessageRequest;
import com.classedge.dto.ChatMessageResponse;
import com.classedge.service.ClassroomChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ClassroomChatController {
    private final ClassroomChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/classrooms/{classroomId}/messages")
    public List<ChatMessageResponse> history(Authentication auth, @PathVariable Long classroomId) {
        return chatService.history(auth.getName(), classroomId);
    }

    @MessageMapping("/classes/{classroomId}/chat")
    public void send(@DestinationVariable Long classroomId, ChatMessageRequest request, Principal principal) {
        ChatMessageResponse message = chatService.send(principal.getName(), classroomId, request);
        messagingTemplate.convertAndSend("/topic/classes/" + classroomId + "/chat", message);
    }
}
