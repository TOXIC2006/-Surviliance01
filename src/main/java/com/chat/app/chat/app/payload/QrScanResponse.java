package com.chat.app.chat.app.payload;

import com.chat.app.chat.app.Enitiy.DeviceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrScanResponse {
    private String deviceId;
    private String deviceName;
    private DeviceType deviceType;
    private String description;
    private String location;
    private String roomId;        // Chat room to join for messaging
    private String ownerId;
    private String ownerName;
    private String ownerPhone;
    private String message;
}
