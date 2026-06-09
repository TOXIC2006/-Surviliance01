package com.chat.app.chat.app.Controllers;

import com.chat.app.chat.app.Enitiy.Message;
import com.chat.app.chat.app.Enitiy.Room;
import com.chat.app.chat.app.Repository.RoomRepository;
import com.chat.app.chat.app.Service.RoomService;
import com.chat.app.chat.app.payload.MessageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("Room")
@CrossOrigin("*")
public class RoomController {


    @Autowired
     private RoomService roomService;
   @Autowired
     private RoomRepository roomRepository;

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Map<String, String> request) {
        String roomid = request.get("roomId");
        if (roomid == null || roomid.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("roomId is required");
        }
        roomid = roomid.trim();
        if (roomService.isroomexistornot(roomid)) {
            return ResponseEntity.badRequest().body("Room already exists");
        } else{
             Room room= new Room();
             room.setRoomID(roomid);
            Room savedRoom = roomRepository.save(room);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
        }
    }

     @GetMapping("/{roomid}")
       public  ResponseEntity<?> JoinRoom(@PathVariable String roomid) {
         Room room = roomRepository.findByRoomID(roomid);
         if (room != null) {
             return ResponseEntity.ok(room);
         } else {
             return ResponseEntity.notFound().build();
         }
     }

    @PostMapping("/{roomID}/message")
    public ResponseEntity<?> sendMessage(@PathVariable String roomID,
                                         @RequestBody MessageRequest request) {
        Room room = roomService.findbyroomid(roomID);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        Message message = new Message(request.getSender(), request.getContent());
        room.getMessage().add(message);
        roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

   
     @GetMapping("/{roomID}/message")
     public  ResponseEntity<?> Listofmessages( @PathVariable  String roomID,
                                               @RequestParam( value = "page", defaultValue = "0" , required = false) int page
                                              , @RequestParam( value = "size", defaultValue = "5" , required = false) int size
     ){
          Room room=  roomService.findbyroomid(roomID);
          if(room==null){
                return ResponseEntity.notFound().build();
          }else{

              List<Message>  messages=  room.getMessage() ;
              int start = Math.max(0,messages.size() - (page + 1) * size);
              int end = Math.min(messages.size(), messages.size() - page * size);
              List<Message> pagenatedmessgae= messages.subList(start,end);
            return ResponseEntity.ok(pagenatedmessgae);
     }
    }
 }
