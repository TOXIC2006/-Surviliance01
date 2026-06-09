package com.chat.app.chat.app.Enitiy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "call_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallSession {

    @Id
    private String id;

    private String callerId;
    private String callerName;

    private String calleeId;
    private String calleeName;

    private String deviceId;

    @Builder.Default
    private CallStatus status = CallStatus.RINGING;

    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    private LocalDateTime answeredAt;
    private LocalDateTime endedAt;
}
