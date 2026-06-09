import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scanQrCode } from '../services/api';
import { connectWebSocket, disconnectWebSocket, sendNotification } from '../services/websocket';
import LoadingSpinner from '../components/LoadingSpinner';
import './ScanResult.css';

export default function ScanResult() {
  const { qrData } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [calling, setCalling] = useState(false);
  const wsRef = useRef(false);

  useEffect(() => {
    if (qrData) {
      handleScan(qrData);
    }

    return () => {
      if (wsRef.current) {
        disconnectWebSocket();
      }
    };
  }, [qrData]);

  async function handleScan(data) {
    try {
      setLoading(true);
      setError('');
      const res = await scanQrCode(data);
      setResult(res);

      // Connect WebSocket for sending notifications
      connectWebSocket(
        () => {
          setWsConnected(true);
          wsRef.current = true;
        },
        () => setWsConnected(false)
      );
    } catch (err) {
      setError(err.message || 'No device found for this QR code');
    } finally {
      setLoading(false);
    }
  }

  function handleStartChat(e) {
    e.preventDefault();
    if (!guestName.trim() || !result?.roomId) return;

    // Notify the owner that someone wants to chat
    if (wsConnected && result.ownerId) {
      sendNotification(result.ownerId, {
        type: 'CHAT',
        guestName: guestName.trim(),
        deviceName: result.deviceName,
        deviceType: result.deviceType,
        deviceId: result.deviceId,
        roomId: result.roomId,
      });
    }

    navigate(`/guest-chat/${result.roomId}?name=${encodeURIComponent(guestName.trim())}&device=${encodeURIComponent(result.deviceName || '')}&ownerId=${encodeURIComponent(result.ownerId || '')}`);
  }

  function handleCallOwner() {
    if (!guestName.trim() || !result?.ownerId || !wsConnected) return;
    setCalling(true);

    // Send a CALL notification to the owner
    sendNotification(result.ownerId, {
      type: 'CALL',
      guestName: guestName.trim(),
      deviceName: result.deviceName,
      deviceType: result.deviceType,
      deviceId: result.deviceId,
      roomId: result.roomId,
    });

    // Navigate to guest chat after a short delay
    setTimeout(() => {
      navigate(`/guest-chat/${result.roomId}?name=${encodeURIComponent(guestName.trim())}&device=${encodeURIComponent(result.deviceName || '')}&ownerId=${encodeURIComponent(result.ownerId || '')}`);
    }, 1500);
  }

  if (loading) {
    return (
      <div className="scan-page">
        <div className="scan-loading">
          <LoadingSpinner size={48} text="Scanning QR code..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scan-page">
        <div className="scan-card animate-fadeInUp">
          <div className="scan-error-icon">❌</div>
          <h2>QR Code Not Recognized</h2>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-page">
      <div className="scan-card animate-fadeInUp">
        {/* Device Info */}
        <div className="scan-device-header">
          <div className="scan-device-icon">
            {result.deviceType === 'HOME' ? '🏠' : '🚗'}
          </div>
          <div>
            <h1 className="scan-device-name">{result.deviceName}</h1>
            <span className={`badge ${result.deviceType === 'HOME' ? 'badge-purple' : 'badge-cyan'}`}>
              {result.deviceType}
            </span>
          </div>
        </div>

        <div className="scan-info-grid">
          {result.description && (
            <div className="scan-info-item">
              <span className="scan-info-label">📝 Description</span>
              <span className="scan-info-value">{result.description}</span>
            </div>
          )}
          {result.location && (
            <div className="scan-info-item">
              <span className="scan-info-label">📍 Location</span>
              <span className="scan-info-value">{result.location}</span>
            </div>
          )}
          <div className="scan-info-item">
            <span className="scan-info-label">👤 Owner</span>
            <span className="scan-info-value">{result.ownerName}</span>
          </div>
          {result.ownerPhone && (
            <div className="scan-info-item">
              <span className="scan-info-label">📞 Phone</span>
              <span className="scan-info-value">
                <a href={`tel:${result.ownerPhone}`}>{result.ownerPhone}</a>
              </span>
            </div>
          )}
        </div>

        <div className="scan-divider"></div>

        {/* Contact Section */}
        <div className="scan-chat-section">
          <div className="scan-chat-header">
            <span className="scan-chat-icon">💬</span>
            <div>
              <h3>Contact Owner</h3>
              <p className="text-muted">Enter your name to chat or call</p>
            </div>
          </div>

          <div className="scan-chat-form">
            <div className="input-group">
              <label htmlFor="guest-name">Your Name</label>
              <input
                id="guest-name"
                type="text"
                className="input"
                placeholder="Enter your name..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {calling ? (
              <div className="scan-calling">
                <div className="scan-calling-pulse"></div>
                <span>📞 Calling {result.ownerName}...</span>
              </div>
            ) : (
              <div className="scan-action-buttons">
                <button
                  type="button"
                  className="btn btn-primary btn-lg scan-action-btn"
                  disabled={!guestName.trim()}
                  onClick={handleStartChat}
                >
                  💬 Start Chat
                </button>
                <button
                  type="button"
                  className="btn btn-call btn-lg scan-action-btn"
                  disabled={!guestName.trim() || !wsConnected}
                  onClick={handleCallOwner}
                >
                  📞 Call Owner
                </button>
                {result?.roomId && (
                  <button
                    type="button"
                    className="btn btn-lg scan-action-btn"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
                    disabled={!guestName.trim()}
                    onClick={() => navigate(`/room/${result.roomId}?device=${encodeURIComponent(result.deviceName || '')}&ownerId=${encodeURIComponent(result.ownerId || '')}`)}
                  >
                    📹 Video Call
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="scan-footer">
          <span className="scan-powered">🛡️ Powered by Surveil</span>
        </div>
      </div>
    </div>
  );
}
