package com.chat.app.chat.app.Controllers;

import com.chat.app.chat.app.Enitiy.Device;
import com.chat.app.chat.app.Enitiy.DeviceType;
import com.chat.app.chat.app.Enitiy.User;
import com.chat.app.chat.app.Repository.UserRepository;
import com.chat.app.chat.app.Service.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/devices")
@CrossOrigin("*")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/devices
     * Register a new home or car device.
     * Body: { "name": "My Home", "type": "HOME", "description": "...", "location": "..." }
     */
    @PostMapping
    public ResponseEntity<?> createDevice(@RequestBody Map<String, String> request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String name = request.get("name");
            String typeStr = request.getOrDefault("type", "HOME");
            String description = request.getOrDefault("description", "");
            String location = request.getOrDefault("location", "");

            DeviceType type = DeviceType.valueOf(typeStr.toUpperCase());

            Device device = deviceService.createDevice(name, type, description, location, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(device);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid device type. Use HOME or CAR"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/devices
     * List all devices owned by the authenticated user.
     * Optional query param: ?type=HOME or ?type=CAR
     */
    @GetMapping
    public ResponseEntity<?> listDevices(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "type", required = false) String type) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Device> devices;
        if (type != null) {
            devices = deviceService.getDevicesByOwnerAndType(
                    user.getId(), DeviceType.valueOf(type.toUpperCase()));
        } else {
            devices = deviceService.getDevicesByOwner(user.getId());
        }

        return ResponseEntity.ok(devices);
    }

    /**
     * GET /api/devices/{id}
     * Get a specific device by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDevice(@PathVariable String id) {
        Optional<Device> device = deviceService.getDeviceById(id);
        return device.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/devices/{id}
     * Update device details.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDevice(@PathVariable String id,
                                           @RequestBody Map<String, String> request) {
        try {
            Device device = deviceService.updateDevice(id,
                    request.get("name"),
                    request.get("description"),
                    request.get("location"));
            return ResponseEntity.ok(device);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/devices/{id}
     * Delete a device.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDevice(@PathVariable String id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.ok(Map.of("message", "Device deleted successfully"));
    }
}
