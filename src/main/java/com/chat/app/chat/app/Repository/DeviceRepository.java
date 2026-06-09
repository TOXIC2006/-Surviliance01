package com.chat.app.chat.app.Repository;

import com.chat.app.chat.app.Enitiy.Device;
import com.chat.app.chat.app.Enitiy.DeviceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends MongoRepository<Device, String> {

    List<Device> findByOwnerId(String ownerId);

    Optional<Device> findByQrCodeData(String qrCodeData);

    List<Device> findByOwnerIdAndType(String ownerId, DeviceType type);

    boolean existsByQrCodeData(String qrCodeData);
}
