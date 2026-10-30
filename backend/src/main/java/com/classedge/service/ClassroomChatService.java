package com.classedge.service;

import com.classedge.dto.ChatMessageRequest;
import com.classedge.dto.ChatMessageResponse;
import com.classedge.entity.Classroom;
import com.classedge.entity.ClassroomChatMessage;
import com.classedge.entity.User;
import com.classedge.exception.ApiException;
import com.classedge.repository.ClassroomChatMessageRepository;
import com.classedge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassroomChatService {
    private final ClassroomChatMessageRepository messageRepository;
    private final ClassroomService classroomService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> history(String email, Long classroomId) {
        User user = classroomService.findUser(email);
        Classroom classroom = classroomService.findClassroom(classroomId);
        classroomService.verifyMembership(classroom, user);
        return messageRepository.findTop100ByClassroomOrderBySentAtDesc(classroom).stream()
                .map(this::toResponse).toList().reversed();
    }

    @Transactional
    public ChatMessageResponse send(String email, Long classroomId, ChatMessageRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ApiException("User not found"));
        Classroom classroom = classroomService.findClassroom(classroomId);
        classroomService.verifyMembership(classroom, user);
        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isBlank()) throw new ApiException("Message cannot be empty");
        if (content.length() > 4000) throw new ApiException("Messages must be 4000 characters or fewer");
        ClassroomChatMessage saved = messageRepository.save(ClassroomChatMessage.builder()
                .classroom(classroom).sender(user).content(content).sentAt(LocalDateTime.now()).build());
        return toResponse(saved);
    }

    private ChatMessageResponse toResponse(ClassroomChatMessage message) {
        return ChatMessageResponse.builder().id(message.getId()).classroomId(message.getClassroom().getId())
                .senderId(message.getSender().getId()).senderName(message.getSender().getName())
                .content(message.getContent()).sentAt(message.getSentAt()).build();
    }
}
