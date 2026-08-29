import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Video, MessageSquare, Home, Car, Bell } from 'lucide-react';
import './IncomingCall.css';

export default function IncomingCall({ notification, onAccept, onReject }) {
  const navigate = useNavigate();

  if (!notification) return null;

  const { guestName, deviceName, deviceType, roomId, type } = notification;
  const isHome = deviceType === 'HOME';
  const isVideoCall = type === 'VIDEO_CALL';
  const isCall = type === 'CALL';

  function handleAccept() {
    if (onAccept) onAccept();
    if (isVideoCall) {
      navigate(`/room/${roomId}?device=${encodeURIComponent(deviceName || '')}`);
    } else {
      navigate(`/chat/${roomId}`);
    }
  }

  return (
    <div className="incoming-overlay" role="dialog" aria-modal="true" aria-label="Incoming Call Notification">
      <div className="incoming-saas-card">
        {/* Pulse rings */}
        <div className="incoming-rings">
          <div className="incoming-pulse-ring ring-1" />
          <div className="incoming-pulse-ring ring-2" />
          <div className="incoming-avatar-badge">
            {isVideoCall ? <Video size={28} /> : isCall ? <Phone size={28} /> : <Bell size={28} />}
          </div>
        </div>

        <div className="incoming-meta">
          <span className="incoming-call-type">
            {isVideoCall ? 'Incoming HD Video Call' : isCall ? 'Incoming Voice Call' : 'Visitor Alert'}
          </span>
          <h2 className="incoming-caller-title">{guestName || 'Visitor'}</h2>
          <span className="incoming-device-badge">
            {isHome ? <Home size={14} /> : <Car size={14} />}
            <span>{deviceName || 'Surveillance Device'}</span>
          </span>
        </div>

        <div className="incoming-btns-row">
          <button
            type="button"
            className="incoming-btn reject-btn"
            onClick={onReject}
            aria-label="Decline incoming call"
          >
            <PhoneOff size={20} />
            <span>Decline</span>
          </button>

          <button
            type="button"
            className="incoming-btn accept-btn"
            onClick={handleAccept}
            aria-label="Accept incoming call"
          >
            {isVideoCall ? <Video size={20} /> : <Phone size={20} />}
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}
