import { useNavigate } from 'react-router-dom';
import './DeviceCard.css';

export default function DeviceCard({ device }) {
  const navigate = useNavigate();

  const icon = device.type === 'HOME' ? '🏠' : '🚗';
  const typeLabel = device.type === 'HOME' ? 'Home' : 'Car';
  const badgeClass = device.type === 'HOME' ? 'badge-purple' : 'badge-cyan';

  return (
    <div className="device-card glass" onClick={() => navigate(`/devices/${device.id}`)}>
      <div className="device-card-header">
        <div className="device-card-icon">{icon}</div>
        <span className={`badge ${badgeClass}`}>{typeLabel}</span>
      </div>
      <h3 className="device-card-name">{device.name}</h3>
      {device.description && (
        <p className="device-card-desc">{device.description}</p>
      )}
      {device.location && (
        <div className="device-card-location">
          <span className="device-card-location-icon">📍</span>
          {device.location}
        </div>
      )}
      <div className="device-card-footer">
        <span className="device-card-status">
          <span className="status-dot"></span>
          Active
        </span>
        <span className="device-card-arrow">→</span>
      </div>
    </div>
  );
}
