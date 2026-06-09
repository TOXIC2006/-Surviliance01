package com.chat.app.chat.app.Enitiy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {

    @Id
    private String id;

    private String name;

    private DeviceType type; // HOME or CAR

    private String description;

    private String location;

    @Indexed
    private String ownerId;

    @Indexed(unique = true)
    private String qrCodeData; // Unique QR identifier for this device

    private String roomId; // Associated chat room ID

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}
