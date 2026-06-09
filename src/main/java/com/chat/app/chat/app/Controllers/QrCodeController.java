package com.chat.app.chat.app.Controllers;

import com.chat.app.chat.app.Enitiy.Device;
import com.chat.app.chat.app.Enitiy.User;
import com.chat.app.chat.app.Repository.UserRepository;
import com.chat.app.chat.app.Service.DeviceService;
import com.chat.app.chat.app.Service.QrCodeService;
import com.chat.app.chat.app.payload.QrScanRequest;
import com.chat.app.chat.app.payload.QrScanResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/qr")
@CrossOrigin("*")
public class QrCodeController {

    @Autowired
    private QrCodeService qrCodeService;

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/qr/device/{deviceId}
     * Generate and return a QR code image (PNG) for a device.
     */
    @GetMapping(value = "/device/{deviceId}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateQrCode(@PathVariable String deviceId) {
        try {
            Device device = deviceService.getDeviceById(deviceId)
                    .orElseThrow(() -> new RuntimeException("Device not found"));

            byte[] qrImage = qrCodeService.generateQrCode(device.getQrCodeData());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(qrImage.length);
            headers.set("Content-Disposition",
                    "inline; filename=\"qr-" + deviceId + ".png\"");

            return new ResponseEntity<>(qrImage, headers, HttpStatus.OK);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST /api/qr/scan
     * Receive scanned QR data and return device info + chat room + owner contact.
     * Body: { "qrCodeData": "SURVEIL-xxxx-xxxx-xxxx" }
     */
    @PostMapping("/scan")
    public ResponseEntity<?> scanQrCode(@Valid @RequestBody QrScanRequest request) {
        String qrData = request.getQrCodeData();

        // Strip base URL prefix if present (e.g., "surveil://device/SURVEIL-xxx" -> "SURVEIL-xxx")
        if (qrData.contains("/")) {
            qrData = qrData.substring(qrData.lastIndexOf("/") + 1);
        }

        Optional<Device> deviceOpt = deviceService.getDeviceByQrCode(qrData);
        if (deviceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No device found for this QR code"));
        }

        Device device = deviceOpt.get();

        // Get owner info
        String ownerName = "Unknown";
        String ownerPhone = "";
        Optional<User> ownerOpt = userRepository.findById(device.getOwnerId());
        if (ownerOpt.isPresent()) {
            User owner = ownerOpt.get();
            ownerName = owner.getFullName() != null ? owner.getFullName() : owner.getUsername();
            ownerPhone = owner.getPhoneNumber() != null ? owner.getPhoneNumber() : "";
        }

        QrScanResponse response = QrScanResponse.builder()
                .deviceId(device.getId())
                .deviceName(device.getName())
                .deviceType(device.getType())
                .description(device.getDescription())
                .location(device.getLocation())
                .roomId(device.getRoomId())
                .ownerId(device.getOwnerId())
                .ownerName(ownerName)
                .ownerPhone(ownerPhone)
                .message("Device found! You can now message or call the owner.")
                .build();

        return ResponseEntity.ok(response);
    }
}
