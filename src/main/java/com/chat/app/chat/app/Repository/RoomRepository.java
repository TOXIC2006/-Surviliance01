package com.chat.app.chat.app.Repository;

import com.chat.app.chat.app.Enitiy.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository  extends  MongoRepository<Room, String> {


     Room findByRoomID(String roomID);
}
