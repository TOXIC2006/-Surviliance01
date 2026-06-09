package com.chat.app.chat.app.Service;

import com.chat.app.chat.app.Enitiy.Message;
import com.chat.app.chat.app.Enitiy.Room;
import com.chat.app.chat.app.Repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;


        public boolean isroomexistornot(String roomID) {
            return roomRepository.findByRoomID(roomID) != null;
        }

    public Room findbyroomid(String roomID) {
        return roomRepository.findByRoomID(roomID);
    }


}
