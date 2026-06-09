package com.chat.app.chat.app.Enitiy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


import java.util.ArrayList;
import java.util.List;


@Document( collection = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Room {
    @Id
    private  String id  ;
     private  String roomID;

     private String deviceId;  // Links this room to a surveillance device
     private String ownerId;   // The user who created this room

     private List<Message> message;

     public List<Message> getMessage() {
         if (message == null) {
             message = new ArrayList<>();
         }
         return message;
     }
}

