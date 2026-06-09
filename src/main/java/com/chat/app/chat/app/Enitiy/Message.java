package com.chat.app.chat.app.Enitiy;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String sender;
    private String content;
    private LocalDateTime timestamp;
    private String messageType; // TEXT, IMAGE, ALERT, CALL_REQUEST
    private String imageUrl;    // For surveillance snapshots


    public Message( String sender, String content) {
        this.sender = sender;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.messageType = "TEXT";
    }

}
