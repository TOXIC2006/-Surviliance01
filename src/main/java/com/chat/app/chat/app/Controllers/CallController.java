package com.chat.app.chat.app.Controllers;

import com.chat.app.chat.app.Enitiy.CallSession;
import com.chat.app.chat.app.Enitiy.User;
import com.chat.app.chat.app.Repository.UserRepository;
import com.chat.app.chat.app.Service.CallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calls")
@CrossOrigin("*")
public class CallController {

    @Autowired
    private CallService callService;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/calls/initiate
     * Start a new call.
     * Body: { "calleeId": "...", "deviceId": "..." }
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateCall(@RequestBody Map<String, String> request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User caller = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String calleeId = request.get("calleeId");
            String deviceId = request.get("deviceId");

            User callee = userRepository.findById(calleeId)
                    .orElseThrow(() -> new RuntimeException("Callee not found"));

            CallSession session = callService.initiateCall(
                    caller.getId(),
                    caller.getFullName() != null ? caller.getFullName() : caller.getUsername(),
                    callee.getId(),
                    callee.getFullName() != null ? callee.getFullName() : callee.getUsername(),
                    deviceId
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(session);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/calls/{sessionId}/accept
     * Accept an incoming call.
     */
    @PostMapping("/{sessionId}/accept")
    public ResponseEntity<?> acceptCall(@PathVariable String sessionId) {
        try {
            CallSession session = callService.acceptCall(sessionId);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/calls/{sessionId}/end
     * End a call.
     */
    @PostMapping("/{sessionId}/end")
    public ResponseEntity<?> endCall(@PathVariable String sessionId) {
        try {
            CallSession session = callService.endCall(sessionId);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/calls/history
     * Get call history for the authenticated user.
     */
    @GetMapping("/history")
    public ResponseEntity<?> callHistory(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CallSession> history = callService.getCallHistory(user.getId());
        return ResponseEntity.ok(history);
    }

    // ---- WebSocket Endpoints for real-time call signaling ----

    @MessageMapping("/call/accept/{sessionId}")
    @SendTo("/topic/calls/{sessionId}")
    public Map<String, Object> acceptCallWs(@DestinationVariable String sessionId) {
        CallSession session = callService.acceptCall(sessionId);
        return Map.of(
                "type", "CALL_ACCEPTED",
                "sessionId", session.getId(),
                "status", session.getStatus().name()
        );
    }

    @MessageMapping("/call/end/{sessionId}")
    @SendTo("/topic/calls/{sessionId}")
    public Map<String, Object> endCallWs(@DestinationVariable String sessionId) {
        CallSession session = callService.endCall(sessionId);
        return Map.of(
                "type", "CALL_ENDED",
                "sessionId", session.getId(),
                "status", session.getStatus().name()
        );
    }
}
