import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { getDevice, updateDevice, deleteDevice, getQrCodeBlob } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './DeviceDetail.css';

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [error, setError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    loadDevice();
  }, [id]);

  async function loadDevice() {
    try {
      setLoading(true);
      const data = await getDevice(id);
      setDevice(data);
      setEditForm({ name: data.name, description: data.description || '', location: data.location || '' });

      // Load QR code
      try {
        const blob = await getQrCodeBlob(id);
        setQrUrl(URL.createObjectURL(blob));
      } catch {
        // QR code might not be available
      }
    } catch (err) {
      setError('Device not found');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateDevice(id, editForm);
      setDevice(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this device?')) return;
    try {
      await deleteDevice(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <LoadingSpinner size={40} text="Loading device..." />
      </div>
    );
  }

  if (error && !device) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
        <Link to="/" className="btn btn-secondary mt-2">← Back to Dashboard</Link>
      </div>
    );
  }

  const icon = device.type === 'HOME' ? '🏠' : '🚗';
  const badgeClass = device.type === 'HOME' ? 'badge-purple' : 'badge-cyan';

  return (
    <div className="page">
      <div className="detail-back">
        <Link to="/" className="btn btn-ghost">← Back to Dashboard</Link>
      </div>

      {error && <div className="alert alert-error mb-2">{error}</div>}

      <div className="detail-layout">
        {/* Main Info */}
        <div className="detail-main glass animate-fadeIn">
          <div className="detail-header">
            <div className="detail-icon">{icon}</div>
            <div className="detail-title">
              <h1>{device.name}</h1>
              <span className={`badge ${badgeClass}`}>{device.type}</span>
            </div>
          </div>

          {editing ? (
            <form className="detail-edit-form" onSubmit={handleSave}>
              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea
                  className="input"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="detail-edit-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="detail-info">
              {device.location && (
                <div className="detail-field">
                  <span className="detail-field-label">📍 Location</span>
                  <span className="detail-field-value">{device.location}</span>
                </div>
              )}
              {device.description && (
                <div className="detail-field">
                  <span className="detail-field-label">📝 Description</span>
                  <span className="detail-field-value">{device.description}</span>
                </div>
              )}
              {device.qrCodeData && (
                <div className="detail-field">
                  <span className="detail-field-label">🔑 QR Code ID</span>
                  <span className="detail-field-value detail-mono">{device.qrCodeData}</span>
                </div>
              )}
              {device.roomId && (
                <div className="detail-field">
                  <span className="detail-field-label">💬 Chat Room</span>
                  <Link to={`/chat/${device.roomId}`} className="detail-field-value detail-link">
                    Open Chat Room →
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="detail-actions">
            {!editing && (
              <>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                  ✏️ Edit
                </button>
                {device.roomId && (
                  <Link to={`/chat/${device.roomId}`} className="btn btn-primary">
                    💬 Open Chat
                  </Link>
                )}
                {device.roomId && (
                  <Link to={`/room/${device.roomId}?device=${encodeURIComponent(device.name)}`} className="btn btn-call">
                    📹 Join Video Call
                  </Link>
                )}
                <button className="btn btn-danger" onClick={handleDelete}>
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sidebar: QR Codes */}
        <div className="detail-sidebar">
          {/* Video Call QR Code (client-side) */}
          {device.roomId && (
            <div className="qr-card glass animate-fadeIn" style={{ marginBottom: '16px' }}>
              <h3 className="qr-title">📹 Video Call QR</h3>
              <p className="qr-subtitle">Share this QR for instant video call</p>
              <div className="qr-image-wrapper">
                <QRCodeCanvas
                  value={`${window.location.origin}/room/${device.roomId}?device=${encodeURIComponent(device.name)}&ownerId=${encodeURIComponent(device.ownerId)}`}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <button
                  className="btn btn-secondary btn-sm w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/room/${device.roomId}?device=${encodeURIComponent(device.name)}&ownerId=${encodeURIComponent(device.ownerId)}`
                    );
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                >
                  {linkCopied ? '✅ Copied!' : '📋 Copy Video Call Link'}
                </button>
              </div>
            </div>
          )}

          {/* Device QR Code (backend-generated) */}
          <div className="qr-card glass animate-fadeIn">
            <h3 className="qr-title">🔑 Device QR</h3>
            <p className="qr-subtitle">Scan to view device info</p>
            {qrUrl ? (
              <div className="qr-image-wrapper">
                <img src={qrUrl} alt="Device QR Code" className="qr-image" />
              </div>
            ) : (
              <div className="qr-placeholder">
                <span>📱</span>
                <p>QR code not available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
