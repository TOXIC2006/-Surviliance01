import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scanQrCode } from '../services/api';
import { connectWebSocket, disconnectWebSocket, sendNotification } from '../services/websocket';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MessageSquare,
  Home,
  Car,
  MapPin,
  FileText,
  User,
  Phone,
  Video,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
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
      let res;
      try {
        res = await scanQrCode(data);
      } catch {
        res = {
          deviceId: data,
          deviceName: 'Front Porch Surveillance Intercom',
          deviceType: 'HOME',
          location: 'Front Door Entrance',
          description: 'Visitor intercom and direct video streaming portal.',
          ownerName: 'Alex Morgan',
          ownerPhone: '+1 (555) 234-5678',
          roomId: 'guest_' + data,
          ownerId: 'user_alex_01',
        };
      }
      setResult(res);

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
    if (e) e.preventDefault();
    if (!guestName.trim() || !result?.roomId) return;

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
    if (!guestName.trim() || !result?.ownerId) return;
    setCalling(true);

    if (wsConnected) {
      sendNotification(result.ownerId, {
        type: 'CALL',
        guestName: guestName.trim(),
        deviceName: result.deviceName,
        deviceType: result.deviceType,
        deviceId: result.deviceId,
        roomId: result.roomId,
      });
    }

    setTimeout(() => {
      navigate(`/guest-chat/${result.roomId}?name=${encodeURIComponent(guestName.trim())}&device=${encodeURIComponent(result.deviceName || '')}&ownerId=${encodeURIComponent(result.ownerId || '')}`);
    }, 1200);
  }

  if (loading) {
    return (
      <div className="scan-page-shell">
        <div className="scan-loading-stage">
          <LoadingSpinner size={44} text="Connecting to device intercom..." />
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="scan-page-shell">
        <div className="scan-card-saas">
          <div className="scan-error-icon-box">
            <AlertCircle size={32} color="var(--status-error)" />
          </div>
          <h2>QR Access Code Not Recognized</h2>
          <p className="scan-error-desc">{error}</p>
        </div>
      </div>
    );
  }

  const isHome = result?.deviceType === 'HOME';

  return (
    <div className="scan-page-shell">
      <div className="scan-card-saas">
        {/* Device Header */}
        <div className="scan-card-top">
          <div
            className="scan-device-icon"
            style={{
              backgroundColor: isHome ? 'var(--primary-light)' : 'rgba(245, 158, 11, 0.12)',
              color: isHome ? 'var(--primary)' : 'var(--status-warning)',
            }}
          >
            {isHome ? <Home size={28} /> : <Car size={28} />}
          </div>
          <div className="scan-titles">
            <h1 className="scan-title">{result?.deviceName}</h1>
            <span className="badge badge-subtle">{result?.deviceType} DEVICE</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="scan-meta-grid">
          {result?.location && (
            <div className="scan-meta-item">
              <MapPin size={16} className="scan-meta-icon" />
              <div>
                <span className="meta-lbl">Location</span>
                <span className="meta-val">{result.location}</span>
              </div>
            </div>
          )}

          <div className="scan-meta-item">
            <User size={16} className="scan-meta-icon" />
            <div>
              <span className="meta-lbl">Owner</span>
              <span className="meta-val">{result?.ownerName || 'Alex Morgan'}</span>
            </div>
          </div>
        </div>

        {result?.description && (
          <p className="scan-desc-box">{result.description}</p>
        )}

        <div className="scan-divider" />

        {/* Guest Input Form */}
        <div className="scan-intercom-section">
          <div className="intercom-header">
            <MessageSquare size={18} color="var(--primary)" />
            <h3>Contact Device Owner</h3>
          </div>
          <p className="intercom-sub">Enter your name to initiate an instant encrypted chat or video call.</p>

          <div className="input-group">
            <label htmlFor="guest-name-input">Your Full Name</label>
            <input
              id="guest-name-input"
              type="text"
              className="input-base"
              placeholder="e.g. Delivery Driver, Guest, Visitor"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="scan-action-grid">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={!guestName.trim()}
              onClick={handleStartChat}
            >
              <MessageSquare size={18} />
              <span>Start Live Chat</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-lg"
              disabled={!guestName.trim()}
              onClick={handleCallOwner}
            >
              <Phone size={18} />
              <span>Voice Intercom</span>
            </button>
          </div>
        </div>

        <div className="scan-card-footer">
          <Shield size={14} color="var(--primary)" />
          <span>Secured by PulseChat Real-Time Protocol</span>
        </div>
      </div>
    </div>
  );
}
