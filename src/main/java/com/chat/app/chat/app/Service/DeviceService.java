package com.chat.app.chat.app.Service;

import com.chat.app.chat.app.Enitiy.Device;
import com.chat.app.chat.app.Enitiy.DeviceType;
import com.chat.app.chat.app.Enitiy.Room;
import com.chat.app.chat.app.Repository.DeviceRepository;
import com.chat.app.chat.app.Repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private RoomRepository roomRepository;

    /**
     * Register a new device (home/car) and auto-create a chat room for it.
     */
    public Device createDevice(String name, DeviceType type, String description,
                                String location, String ownerId) {
        // Generate unique QR code data
        String qrCodeData = "SURVEIL-" + UUID.randomUUID().toString();

        // Create a chat room linked to this device
        String roomId = "device-" + UUID.randomUUID().toString().substring(0, 8);
        Room room = new Room();
        room.setRoomID(roomId);
        room.setDeviceId(null); // Will be set after device save
        room.setOwnerId(ownerId);
        Room savedRoom = roomRepository.save(room);

        // Create the device
        Device device = Device.builder()
                .name(name)
                .type(type)
                .description(description)
                .location(location)
                .ownerId(ownerId)
                .qrCodeData(qrCodeData)
                .roomId(savedRoom.getRoomID())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        Device savedDevice = deviceRepository.save(device);

        // Update room with device ID
        savedRoom.setDeviceId(savedDevice.getId());
        roomRepository.save(savedRoom);

        return savedDevice;
    }

    public List<Device> getDevicesByOwner(String ownerId) {
        return deviceRepository.findByOwnerId(ownerId);
    }

    public List<Device> getDevicesByOwnerAndType(String ownerId, DeviceType type) {
        return deviceRepository.findByOwnerIdAndType(ownerId, type);
    }

    public Optional<Device> getDeviceById(String id) {
        return deviceRepository.findById(id);
    }

    public Optional<Device> getDeviceByQrCode(String qrCodeData) {
        return deviceRepository.findByQrCodeData(qrCodeData);
    }

    public Device updateDevice(String id, String name, String description,
                                String location) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found: " + id));
        if (name != null) device.setName(name);
        if (description != null) device.setDescription(description);
        if (location != null) device.setLocation(location);
        device.setUpdatedAt(LocalDateTime.now());
        return deviceRepository.save(device);
    }

    public void deleteDevice(String id) {
        deviceRepository.deleteById(id);
    }
}
