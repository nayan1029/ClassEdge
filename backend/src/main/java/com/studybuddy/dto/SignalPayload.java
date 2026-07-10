package com.studybuddy.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Generic WebRTC signaling envelope (offer/answer/ICE candidate) relayed as-is
 * through the existing STOMP room channel. The backend never inspects `data` —
 * it's opaque SDP/ICE JSON that only the browsers understand.
 */
@Getter
@Setter
public class SignalPayload {
    private Long roomId;
    private String senderId;
    private String type; // "offer" | "answer" | "candidate" | "leave"
    private Object data;
}
