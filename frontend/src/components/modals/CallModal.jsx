import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Maximize2,
  Minimize2,
  Volume2,
  Sparkles,
} from 'lucide-react';
import './Modals.css';

export default function CallModal() {
  const { activeCall, setActiveCall, endCall } = useChat();

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(activeCall?.type === 'audio');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const timerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!activeCall) return;

    // Simulate connection after 1.5s
    const connectTimer = setTimeout(() => {
      setConnectionStatus('Connected • HD Voice & Video');
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 1500);

    return () => {
      clearTimeout(connectTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCall]);

  if (!activeCall) return null;

  const contact = activeCall.contact || {
    name: 'Rahul Sharma',
    avatarBg: '#6366F1',
    initials: 'RS',
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`modal-backdrop call-modal-backdrop ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <div className="call-modal-window">
        {/* Call Header */}
        <div className="call-modal-header">
          <div className="call-status-badge">
            <span className="live-call-dot" />
            <span>{connectionStatus}</span>
          </div>

          <span className="call-timer-badge">{formatDuration(callDuration)}</span>

          <button
            type="button"
            className="btn-icon btn-sm call-header-btn"
            onClick={() => setIsFullscreen((prev) => !prev)}
            aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Video / Audio Center Stage */}
        <div className="call-stage-viewport">
          {activeCall.type === 'video' && !isVideoOff ? (
            <div className="video-stream-container">
              {/* Remote Simulated Video View */}
              <div className="remote-video-frame">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80"
                  alt="Remote Participant"
                  className="remote-stream-img"
                />
                <div className="remote-name-tag">{contact.name}</div>
              </div>

              {/* Local PiP (Picture in Picture) */}
              <div className="local-pip-frame">
                <div className="local-pip-content">
                  <div className="avatar avatar-sm" style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF' }}>
                    You
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="audio-call-stage">
              <div className="call-avatar-pulse-wrap">
                <div className="call-pulse-ring ring-1" />
                <div className="call-pulse-ring ring-2" />
                <div
                  className="avatar avatar-2xl call-main-avatar"
                  style={{ backgroundColor: contact.avatarBg || 'var(--primary)', color: '#FFFFFF' }}
                >
                  {contact.initials || contact.name?.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <h3 className="call-contact-name">{contact.name}</h3>
              <p className="call-contact-sub">Encrypted WebRTC Session</p>

              {/* Audio Waveform */}
              <div className="call-audio-bars">
                {[30, 65, 80, 45, 90, 70, 50, 85, 40, 75, 95, 60].map((h, idx) => (
                  <span
                    key={idx}
                    style={{
                      height: `${h}%`,
                      animationDelay: `${idx * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call Action Controls Bar */}
        <div className="call-controls-bar">
          <button
            type="button"
            className={`call-ctrl-btn ${isMuted ? 'active-mute' : ''}`}
            onClick={() => setIsMuted((prev) => !prev)}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            type="button"
            className={`call-ctrl-btn ${isVideoOff ? 'active-off' : ''}`}
            onClick={() => setIsVideoOff((prev) => !prev)}
            aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button
            type="button"
            className={`call-ctrl-btn ${isScreenSharing ? 'active-share' : ''}`}
            onClick={() => setIsScreenSharing((prev) => !prev)}
            aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            title="Share screen"
          >
            <Monitor size={20} />
          </button>

          <button
            type="button"
            className="call-ctrl-btn end-call-btn"
            onClick={endCall}
            aria-label="End call"
            title="End call"
          >
            <PhoneOff size={22} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </div>
  );
}
