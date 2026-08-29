import { Link } from 'react-router-dom';
import { Home, Car, QrCode, MessageSquare, Video, Shield, ChevronRight } from 'lucide-react';
import './DeviceCard.css';

export default function DeviceCard({ device }) {
  const isHome = device.type === 'HOME';

  return (
    <div className="device-card-saas">
      <div className="device-card-header">
        <div className="device-card-icon-badge" style={{ backgroundColor: isHome ? 'var(--primary-light)' : 'rgba(245, 158, 11, 0.12)', color: isHome ? 'var(--primary)' : 'var(--status-warning)' }}>
          {isHome ? <Home size={20} /> : <Car size={20} />}
        </div>
        <div className="device-card-titles">
          <h3 className="device-name-text">{device.name}</h3>
          <span className="device-location-text">{device.location || 'Surveillance Zone'}</span>
        </div>
        <span className="device-status-pill online">
          <span className="status-dot-sm" />
          Online
        </span>
      </div>

      <p className="device-desc-text">{device.description || 'Active real-time video surveillance and sensor monitoring.'}</p>

      <div className="device-card-footer">
        <Link to={`/devices/${device.id}`} className="btn btn-secondary btn-sm">
          <QrCode size={14} />
          <span>Access QR</span>
        </Link>

        <Link to={`/chat/device_${device.id}`} className="btn btn-primary btn-sm">
          <MessageSquare size={14} />
          <span>Live Intercom</span>
        </Link>
      </div>
    </div>
  );
}
