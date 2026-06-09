package com.chat.app.chat.app.Repository;

import com.chat.app.chat.app.Enitiy.CallSession;
import com.chat.app.chat.app.Enitiy.CallStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CallSessionRepository extends MongoRepository<CallSession, String> {

    List<CallSession> findByCallerIdOrCalleeId(String callerId, String calleeId);

    List<CallSession> findByDeviceIdAndStatus(String deviceId, CallStatus status);

    List<CallSession> findByCalleeIdAndStatus(String calleeId, CallStatus status);
}
