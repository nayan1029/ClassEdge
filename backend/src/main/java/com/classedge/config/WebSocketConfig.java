package com.classedge.config;

import com.classedge.repository.UserRepository;
import com.classedge.repository.ClassroomRepository;
import com.classedge.repository.ClassroomMembershipRepository;
import com.classedge.entity.Classroom;
import com.classedge.entity.User;
import com.classedge.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomMembershipRepository membershipRepository;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authorization = accessor.getFirstNativeHeader("Authorization");
                    if (authorization == null || !authorization.startsWith("Bearer ")) {
                        throw new MessageDeliveryException("Authentication is required for classroom chat");
                    }
                    String token = authorization.substring(7).trim();
                    String email = jwtService.extractUsername(token);
                    if (email == null || !jwtService.isTokenValid(token, email) || userRepository.findByEmail(email).isEmpty()) {
                        throw new MessageDeliveryException("Invalid or expired classroom chat session");
                    }
                    accessor.setUser(() -> email);
                }
                if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    if (destination != null && destination.matches("/topic/classes/[0-9]+/chat")) {
                        String email = accessor.getUser() == null ? null : accessor.getUser().getName();
                        User user = email == null ? null : userRepository.findByEmail(email).orElse(null);
                        Long classroomId = Long.valueOf(destination.split("/")[3]);
                        Classroom classroom = classroomRepository.findById(classroomId).orElse(null);
                        boolean isTeacher = user != null && classroom != null && classroom.getTeacher().getId().equals(user.getId());
                        boolean isStudent = user != null && classroom != null && membershipRepository.existsByClassroomAndStudent(classroom, user);
                        if (!isTeacher && !isStudent) throw new MessageDeliveryException("You are not a member of this classroom chat");
                    }
                }
                return message;
            }
        });
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat").setAllowedOriginPatterns("*").withSockJS();
    }
}
