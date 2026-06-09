package com.chat.app.chat.app.Controllers;

import com.chat.app.chat.app.Enitiy.Message;
import com.chat.app.chat.app.Enitiy.Room;
import com.chat.app.chat.app.Repository.RoomRepository;
import com.chat.app.chat.app.Service.RoomService;
import com.chat.app.chat.app.payload.MessageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class ChatController {

     @Autowired
    private   RoomService roomService;

     @Autowired
     private RoomRepository roomRepository;


     @MessageMapping("/sendMessage/{roomID}")
     @SendTo("/topic/messages/{roomID}")
     public Message sendMessage(
             @DestinationVariable String roomID,
             @RequestBody MessageRequest request) {
           Room room = roomService.findbyroomid(roomID);
         Message message = new Message();
         message.setSender(request.getSender());
         message.setContent(request.getContent());
         message.setTimestamp(LocalDateTime.now());
         if(room != null) {
             room.getMessage().add(message);
             roomRepository.save(room);
         }else{
              throw new RuntimeException("Room not found");
         }
         return message;
     }

     /**
      * WebSocket endpoint for guest-to-owner notifications.
      * When a guest scans a QR code and clicks "Call Owner" or "Start Chat",
      * a notification is sent to the owner in real-time.
      *
      * Client sends to:    /app/notify/{ownerId}
      * Owner subscribes to: /topic/notifications/{ownerId}
      */
     @MessageMapping("/notify/{ownerId}")
     @SendTo("/topic/notifications/{ownerId}")
     public Map<String, Object> notifyOwner(
             @DestinationVariable String ownerId,
             @Payload Map<String, Object> notification) {
         // Add server timestamp
         notification.put("timestamp", LocalDateTime.now().toString());
         return notification;
     }
}

