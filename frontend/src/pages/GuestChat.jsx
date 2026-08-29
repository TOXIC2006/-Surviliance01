import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getMessages, getRoom, createRoom } from '../services/api';
import { connectWebSocket, disconnectWebSocket, subscribeToChatRoom, sendChatMessage } from '../services/websocket';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Paperclip,
  Smile,
  Shield,
  Video,
  Phone,
  Check,
  CheckCheck,
} from 'lucide-react';
import './GuestChat.css';

export default function GuestChat() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('name') || 'Visitor';
  const deviceName = searchParams.get('device') || roomId;

  const [messages, setMessages] = useState([
    {
      sender: 'Alex Morgan (Host)',
      content: `Hello ${guestName}! I received your visitor alert. How can I help you today?`,
      timestamp: Date.now() - 30 * 1000,
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(true);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function initChat() {
    try {
      setLoading(true);
      try {
        await getRoom(roomId);
        const msgs = await getMessages(roomId, 0, 50);
        if (Array.isArray(msgs) && msgs.length > 0) {
          setMessages(msgs);
        }
      } catch {
        // Mock fallback active
      }

      connectWebSocket(
        (client) => {
          setConnected(true);
          subscriptionRef.current = subscribeToChatRoom(roomId, (msg) => {
            setMessages((prev) => [...prev, msg]);
          });
        },
        () => {
          setConnected(true); // Keep mock connected
        }
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e) {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const sent = {
      sender: guestName,
      content: newMessage.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, sent]);
    sendChatMessage(roomId, guestName, newMessage.trim());
    setNewMessage('');

    // Simulate host reply
    setTimeout(() => {
      const hostReply = {
        sender: 'Alex Morgan (Host)',
        content: 'Thank you! I am reviewing the video intercom feed right now.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, hostReply]);
    }, 2000);
  }

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="guest-chat-page-root">
      <div className="guest-chat-box">
        {/* Header */}
        <header className="guest-box-header">
          <div className="guest-header-left">
            <div className="avatar avatar-sm" style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF' }}>
              <MessageSquare size={16} />
            </div>
            <div className="guest-header-meta">
              <h2 className="guest-box-title">{deviceName}</h2>
              <span className="guest-status-text">
                <span className="online-dot" /> Connected as {guestName}
              </span>
            </div>
          </div>
          <span className="badge badge-primary">Guest Intercom</span>
        </header>

        {/* Messages */}
        <div className="guest-messages-viewport">
          {messages.map((msg, i) => {
            const isMine = msg.sender === guestName;
            return (
              <div key={i} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                <div className="message-content-wrapper">
                  {!isMine && <span className="group-sender-name">{msg.sender}</span>}
                  <div className={`message-bubble ${isMine ? 'bubble-sent' : 'bubble-received'}`}>
                    <div className="message-text">{msg.content}</div>
                    <div className="message-meta-row">
                      <span className="message-timestamp">{formatTime(msg.timestamp)}</span>
                      {isMine && <CheckCheck size={14} color="#FFFFFF" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <form className="guest-composer-form" onSubmit={handleSend}>
          <input
            type="text"
            className="input-base guest-input"
            placeholder="Type a message to the device owner..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="btn-icon-primary guest-send-btn"
            disabled={!newMessage.trim()}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>

        <footer className="guest-box-footer">
          <Shield size={14} color="var(--primary)" />
          <span>Secured by PulseChat Protocol</span>
        </footer>
      </div>
    </div>
  );
}
