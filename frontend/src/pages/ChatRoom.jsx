import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMessages, getRoom } from '../services/api';
import { connectWebSocket, disconnectWebSocket, subscribeToChatRoom, sendChatMessage } from '../services/websocket';
import LoadingSpinner from '../components/LoadingSpinner';
import './ChatRoom.css';

export default function ChatRoom() {
  const { roomId } = useParams();
  const { user } = useAuth();
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

      // Check if room exists
      try {
        await getRoom(roomId);
      } catch {
        setRoomExists(false);
        setLoading(false);
        return;
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

    sendChatMessage(roomId, user.username, newMessage.trim());
    setNewMessage('');
  }

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <LoadingSpinner size={40} text="Connecting to chat..." />
      </div>
    );
  }

  if (!roomExists) {
    return (
      <div className="page">
        <div className="chat-not-found">
          <h2>Room not found</h2>
          <p>The chat room "{roomId}" doesn't exist.</p>
          <Link to="/" className="btn btn-primary mt-2">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <Link to="/" className="btn btn-ghost btn-sm">←</Link>
        <div className="chat-header-info">
          <h2>💬 {roomId}</h2>
          <span className={`chat-status ${connected ? 'online' : 'offline'}`}>
            <span className="status-dot-sm"></span>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-empty-icon">💬</span>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.sender === user.username;
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
    </div>
  );
}
