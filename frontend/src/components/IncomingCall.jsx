import { useNavigate } from 'react-router-dom';
import './IncomingCall.css';

export default function IncomingCall({ notification, onAccept, onReject }) {
  const navigate = useNavigate();

  if (!notification) return null;

  const { guestName, deviceName, deviceType, roomId, type } = notification;
  const icon = deviceType === 'HOME' ? '🏠' : '🚗';
  const isCall = type === 'CALL';
  const isVideoCall = type === 'VIDEO_CALL';

  function handleAccept() {
    if (onAccept) onAccept();
    if (isVideoCall) {
      // Navigate to ZegoCloud video call room
      navigate(`/room/${roomId}?device=${encodeURIComponent(deviceName || '')}`);
    } else {
      // Navigate to text chat room
      navigate(`/chat/${roomId}`);
    }
  }

  const titleText = isVideoCall
    ? 'Incoming Video Call'
    : isCall
      ? 'Incoming Call'
      : 'Someone at your device';

  const actionText = isVideoCall
    ? 'wants to video call you'
    : isCall
      ? 'is calling you'
      : 'wants to chat with you';

  const acceptLabel = isVideoCall
    ? 'Join Video'
    : isCall
      ? 'Answer'
      : 'Open Chat';

  const acceptIcon = isVideoCall ? '📹' : isCall ? '📞' : '💬';
  const avatarIcon = isVideoCall ? '📹' : isCall ? '📞' : '🔔';

  return (
    <div className="incoming-overlay">
      <div className="incoming-card animate-scaleIn">
        {/* Pulse rings */}
        <div className="incoming-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
          <div className="incoming-avatar">
            {avatarIcon}
          </div>
        </div>

        <h2 className="incoming-title">{titleText}</h2>

        <div className="incoming-info">
          <span className="incoming-guest">{guestName || 'A visitor'}</span>
          <span className="incoming-device">
            {icon} {deviceName || 'your device'}
          </span>
          <span className="incoming-action">{actionText}</span>
        </div>

        <div className="incoming-actions">
          <button className="incoming-btn reject" onClick={onReject}>
            <span className="incoming-btn-icon">✕</span>
            Decline
          </button>
          <button className="incoming-btn accept" onClick={handleAccept}>
            <span className="incoming-btn-icon">{acceptIcon}</span>
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
