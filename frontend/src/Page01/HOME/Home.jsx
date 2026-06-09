import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './Home.css';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  const roomUrl = roomId.trim()
    ? `${window.location.origin}/room/${roomId.trim()}`
    : '';

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    setShowQR(true);
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) return;
    navigate(`/room/${roomId.trim()}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
  };

  return (
    <div className="home-page">
      {/* Animated background blobs */}
      <div className="home-bg-blob home-bg-blob-1" />
      <div className="home-bg-blob home-bg-blob-2" />
      <div className="home-bg-blob home-bg-blob-3" />

      <div className="home-container">
        <div className="home-card">
          <div className="home-header">
            <div className="home-icon-wrap">
              <span className="home-icon">📹</span>
            </div>
            <h1>Video Call Room</h1>
            <p className="home-subtitle">
              Create a room, share the QR code, and start a 1-on-1 video call instantly.
              <br />No sign-up required.
            </p>
          </div>

          <form onSubmit={handleCreateRoom} className="home-form">
            <div className="home-input-group">
              <label htmlFor="roomId">Room ID</label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setShowQR(false);
                }}
                placeholder="e.g. my-room-123"
                className="home-input"
                autoFocus
              />
            </div>
            <div className="home-actions">
              <button type="submit" className="home-btn home-btn-secondary" disabled={!roomId.trim()}>
                🔗 Generate QR
              </button>
              <button type="button" className="home-btn home-btn-primary" disabled={!roomId.trim()} onClick={handleJoinRoom}>
                🚀 Join Room
              </button>
            </div>
          </form>

          {showQR && roomUrl && (
            <div className="qr-section">
              <div className="qr-divider">
                <span>Share this QR Code</span>
              </div>
              <p className="qr-subtitle">Anyone who scans this code will join your video call room</p>
              <div className="qr-card">
                <div className="qr-wrapper">
                  <QRCodeSVG
                    value={roomUrl}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="qr-room-label">Room: {roomId.trim()}</div>
              </div>
              <div className="qr-link-row">
                <input type="text" readOnly value={roomUrl} className="qr-link-input" />
                <button className="qr-copy-btn" onClick={handleCopyLink} title="Copy link">
                  📋 Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;