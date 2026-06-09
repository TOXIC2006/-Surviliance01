package com.chat.app.chat.app.Service;

import com.chat.app.chat.app.Enitiy.CallSession;
import com.chat.app.chat.app.Enitiy.CallStatus;
import com.chat.app.chat.app.Repository.CallSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CallService {

    @Autowired
    private CallSessionRepository callSessionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Initiate a call — creates a CallSession and notifies the callee via WebSocket.
     */
    public CallSession initiateCall(String callerId, String callerName,
                                     String calleeId, String calleeName,
                                     String deviceId) {
        CallSession session = CallSession.builder()
                .callerId(callerId)
                .callerName(callerName)
                .calleeId(calleeId)
                .calleeName(calleeName)
                .deviceId(deviceId)
                .status(CallStatus.RINGING)
                .startedAt(LocalDateTime.now())
                .build();

        CallSession saved = callSessionRepository.save(session);

        // Notify callee via WebSocket
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "INCOMING_CALL");
        notification.put("sessionId", saved.getId());
        notification.put("callerName", callerName);
        notification.put("deviceId", deviceId);

        messagingTemplate.convertAndSend("/topic/calls/" + calleeId, (Object) notification);

        return saved;
    }

    /**
     * Accept a call — updates status to ACTIVE.
     */
    public CallSession acceptCall(String sessionId) {
        CallSession session = callSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Call session not found: " + sessionId));

        session.setStatus(CallStatus.ACTIVE);
        session.setAnsweredAt(LocalDateTime.now());
        CallSession saved = callSessionRepository.save(session);

        // Notify caller that call was accepted
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "CALL_ACCEPTED");
        notification.put("sessionId", saved.getId());

        messagingTemplate.convertAndSend("/topic/calls/" + session.getCallerId(), (Object) notification);

        return saved;
    }

    /**
     * End a call — updates status to ENDED.
     */
    public CallSession endCall(String sessionId) {
        CallSession session = callSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Call session not found: " + sessionId));

        session.setStatus(CallStatus.ENDED);
        session.setEndedAt(LocalDateTime.now());
        CallSession saved = callSessionRepository.save(session);

        // Notify both parties
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "CALL_ENDED");
        notification.put("sessionId", saved.getId());

        messagingTemplate.convertAndSend("/topic/calls/" + session.getCallerId(), (Object) notification);
        messagingTemplate.convertAndSend("/topic/calls/" + session.getCalleeId(), (Object) notification);

        return saved;
    }

    public Optional<CallSession> getSession(String sessionId) {
        return callSessionRepository.findById(sessionId);
    }

    public List<CallSession> getCallHistory(String userId) {
        return callSessionRepository.findByCallerIdOrCalleeId(userId, userId);
    }
}
