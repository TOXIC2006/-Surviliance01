package com.chat.app.chat.app.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QrScanRequest {

    @NotBlank(message = "QR code data is required")
    private String qrCodeData;
}
