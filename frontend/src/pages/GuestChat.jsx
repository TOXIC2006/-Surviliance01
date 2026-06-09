import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getMessages, getRoom, createRoom } from '../services/api';
import { connectWebSocket, disconnectWebSocket, subscribeToChatRoom, sendChatMessage } from '../services/websocket';
import LoadingSpinner from '../components/LoadingSpinner';
import './ChatRoom.css';
import './GuestChat.css';

export default function GuestChat() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('name') || 'Guest';
  const deviceName = searchParams.get('device') || roomId;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [roomExists, setRoomExists] = useState(true);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    initChat();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      disconnectWebSocket();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function initChat() {
    try {
      setLoading(true);

      // Check if room exists, create if not
      try {
        await getRoom(roomId);
      } catch {
        try {
          await createRoom(roomId);
        } catch {
          setRoomExists(false);
          setLoading(false);
          return;
        }
      }

      // Load existing messages
      try {
        const msgs = await getMessages(roomId, 0, 50);
        setMessages(msgs);
      } catch {
        // Room might have no messages yet
      }

      // Connect WebSocket
      connectWebSocket(
        (client) => {
          setConnected(true);
          subscriptionRef.current = subscribeToChatRoom(roomId, (msg) => {
            setMessages((prev) => [...prev, msg]);
          });
        },
        () => {
          setConnected(false);
        }
      );
    } finally {
      setLoading(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim() || !connected) return;

    sendChatMessage(roomId, `🔵 ${guestName}`, newMessage.trim());
    setNewMessage('');
  }

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="scan-page">
        <LoadingSpinner size={40} text="Connecting to chat..." />
      </div>
    );
  }

  if (!roomExists) {
    return (
      <div className="scan-page">
        <div className="scan-card animate-fadeInUp" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
          <h2>Chat room unavailable</h2>
          <p className="text-muted">This chat room could not be accessed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-chat-wrapper">
      {/* Header */}
      <div className="chat-header guest-chat-header">
        <div className="guest-badge">🔵</div>
        <div className="chat-header-info">
          <h2>💬 {deviceName}</h2>
          <span className={`chat-status ${connected ? 'online' : 'offline'}`}>
            <span className="status-dot-sm"></span>
            {connected ? `Connected as ${guestName}` : 'Connecting...'}
          </span>
        </div>
        <span className="guest-label badge badge-cyan">Guest</span>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-empty-icon">💬</span>
            <p>No messages yet. Say hello to the owner!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.sender === `🔵 ${guestName}`;
            return (
              <div key={i} className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                {!isMine && <span className="chat-bubble-sender">{msg.sender}</span>}
                <div className="chat-bubble-content">{msg.content}</div>
                <span className="chat-bubble-time">{formatTime(msg.timestamp)}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          type="text"
          className="input chat-input"
          placeholder={connected ? 'Type a message...' : 'Connecting...'}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!connected}
          autoFocus
        />
        <button type="submit" className="btn btn-primary chat-send" disabled={!connected || !newMessage.trim()}>
          Send
        </button>
      </form>

      <div className="guest-chat-footer">
        <span>🛡️ Powered by Surveil</span>
      </div>
    </div>
  );
}
