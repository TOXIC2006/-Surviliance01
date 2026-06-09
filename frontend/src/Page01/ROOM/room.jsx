import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { connectWebSocket, disconnectWebSocket, subscribeToChatRoom, sendChatMessage, sendNotification } from '../../services/websocket';
import './room.css';

const Room = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const deviceName = searchParams.get('device') || roomId;
  const ownerId = searchParams.get('ownerId') || '';
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatConnected, setChatConnected] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);
  const zegoRef = useRef(null);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!joined) return;
    connectWebSocket(
      () => {
        setChatConnected(true);
        subscriptionRef.current = subscribeToChatRoom(roomId, (msg) => {
          setMessages((prev) => [...prev, msg]);
        });

        // Notify the device owner that someone joined the video call
        if (ownerId) {
          sendNotification(ownerId, {
            type: 'VIDEO_CALL',
            guestName: userName,
            deviceName: deviceName,
            roomId: roomId,
          });
        }
      },
      () => setChatConnected(false)
    );
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      disconnectWebSocket();
    };
  }, [joined, roomId, ownerId, userName, deviceName]);

  // Initialize ZegoCloud video AFTER the container is mounted
  useEffect(() => {
    if (!joined || !videoContainerRef.current || zegoRef.current) return;

    const appID = 780340863;
    const serverSecret = 'a26cce2266556e2f9dea21a8584e0d61';
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, serverSecret, roomId, Date.now().toString(), userName
    );
    const zc = ZegoUIKitPrebuilt.create(kitToken);
    zegoRef.current = zc;

    zc.joinRoom({
      container: videoContainerRef.current,
      sharedLinks: [{ name: 'Room Link', url: `${window.location.origin}/room/${roomId}` }],
      scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
      showScreenSharingButton: false,
    });

    return () => {
      if (zegoRef.current) {
        zegoRef.current.destroy();
        zegoRef.current = null;
      }
    };
  }, [joined, roomId, userName]);

  const handleJoin = (e) => {
    if (e) e.preventDefault();
    if (!userName.trim()) return;
    setJoined(true);
  };

  const handleChat = () => {
    if (!userName.trim()) return;
    // Send notification to owner
    connectWebSocket(
      () => {
        if (ownerId) {
          sendNotification(ownerId, {
            type: 'CHAT',
            guestName: userName.trim(),
            deviceName: deviceName,
            roomId: roomId,
          });
        }
        // Navigate to guest chat page
        navigate(`/guest-chat/${roomId}?name=${encodeURIComponent(userName.trim())}&device=${encodeURIComponent(deviceName)}`);
      },
      () => {
        // Even if WS fails, navigate to chat
        navigate(`/guest-chat/${roomId}?name=${encodeURIComponent(userName.trim())}&device=${encodeURIComponent(deviceName)}`);
      }
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatConnected) return;
    sendChatMessage(roomId, userName, newMessage.trim());
    setNewMessage('');
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!joined) {
    return (
      <div className="room-join-overlay">
        <div className="room-join-bg-blob room-join-bg-blob-1" />
        <div className="room-join-bg-blob room-join-bg-blob-2" />
        <div className="room-join-card">
          <div className="room-join-icon-wrap"><span>📡</span></div>
          <h2>{deviceName !== roomId ? deviceName : 'Join Room'}</h2>
          <p className="room-join-room-label">Enter your name to chat or video call</p>
          <form onSubmit={(e) => e.preventDefault()} className="room-join-form">
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name" className="room-join-input" autoFocus />
            <div className="room-join-choices">
              <button type="button" className="room-join-btn room-join-btn-chat" disabled={!userName.trim()} onClick={handleChat}>
                💬 Chat
              </button>
              <button type="button" className="room-join-btn room-join-btn-video" disabled={!userName.trim()} onClick={() => handleJoin()}>
                📹 Video Call
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="room-layout">
      <div className="room-video-area">
        <div className="room-video-container" ref={videoContainerRef} />
      </div>
      <button className={`room-chat-toggle ${chatOpen ? 'active' : ''}`}
        onClick={() => setChatOpen(!chatOpen)} title={chatOpen ? 'Close chat' : 'Open chat'}>
        💬
        {messages.length > 0 && !chatOpen && <span className="room-chat-badge">{messages.length}</span>}
      </button>
      <div className={`room-chat-panel ${chatOpen ? 'open' : ''}`}>
        <div className="room-chat-header">
          <h3>💬 Chat</h3>
          <span className={`room-chat-dot ${chatConnected ? 'online' : ''}`} />
          <button className="room-chat-close" onClick={() => setChatOpen(false)}>✕</button>
        </div>
        <div className="room-chat-messages">
          {messages.length === 0 ? (
            <div className="room-chat-empty"><span>💬</span><p>No messages yet</p></div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender === userName;
              return (
                <div key={i} className={`room-chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  {!isMine && <span className="room-chat-sender">{msg.sender}</span>}
                  <div className="room-chat-content">{msg.content}</div>
                  <span className="room-chat-time">{formatTime(msg.timestamp)}</span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="room-chat-input-bar" onSubmit={handleSendMessage}>
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            placeholder={chatConnected ? 'Type a message...' : 'Connecting...'}
            disabled={!chatConnected} className="room-chat-input" />
          <button type="submit" className="room-chat-send"
            disabled={!chatConnected || !newMessage.trim()}>➤</button>
        </form>
      </div>
    </div>
  );
};

export default Room;