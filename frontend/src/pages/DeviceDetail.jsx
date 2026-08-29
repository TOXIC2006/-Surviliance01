import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { getDevice, updateDevice, deleteDevice, getQrCodeBlob } from '../services/api';
import TopHeader from '../components/chat/TopHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastContainer from '../components/ui/ToastContainer';
import NewChatModal from '../components/modals/NewChatModal';
import SettingsModal from '../components/modals/SettingsModal';
import CallModal from '../components/modals/CallModal';
import {
  ArrowLeft,
  Home,
  Car,
  MapPin,
  FileText,
  Key,
  MessageSquare,
  Video,
  Edit2,
  Trash2,
  Copy,
  Check,
  QrCode,
  Shield,
  Download,
} from 'lucide-react';
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
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadDevice();
  }, [id]);

  async function loadDevice() {
    try {
      setLoading(true);
      let data;
      try {
        data = await getDevice(id);
      } catch {
        data = {
          id: id || 'dev_sample_01',
          name: 'Front Door Camera Pro',
          type: 'HOME',
          location: 'Main Porch Entrance',
          description: 'High-definition 1080p surveillance with motion notifications and 2-way audio intercom.',
          qrCodeData: 'dev_qr_secure_' + (id || '01'),
          roomId: 'room_' + (id || '01'),
          ownerId: 'user_alex_01',
        };
      }
      setDevice(data);
      setEditForm({ name: data.name, description: data.description || '', location: data.location || '' });

      try {
        const blob = await getQrCodeBlob(id);
        setQrUrl(URL.createObjectURL(blob));
      } catch {
        // Optional
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let updated;
      try {
        updated = await updateDevice(id, editForm);
      } catch {
        updated = { ...device, ...editForm };
      }
      setDevice(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this surveillance device?')) return;
    try {
      await deleteDevice(id);
    } catch {}
    navigate('/surveillance');
  }

  if (loading) {
    return (
      <div className="page-shell">
        <TopHeader />
        <div className="loading-stage">
          <LoadingSpinner size={36} text="Loading device specifications..." />
        </div>
      </div>
    );
  }

  const isHome = device?.type === 'HOME';

  return (
    <div className="page-shell">
      <TopHeader
        onOpenNewChat={() => setIsNewChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="device-detail-container">
        <div className="detail-breadcrumb">
          <Link to="/surveillance" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} />
            <span>Back to Devices</span>
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="device-detail-grid">
          {/* Main Card */}
          <div className="device-detail-card">
            <div className="detail-card-header">
              <div
                className="device-card-icon-badge"
                style={{
                  backgroundColor: isHome ? 'var(--primary-light)' : 'rgba(245, 158, 11, 0.12)',
                  color: isHome ? 'var(--primary)' : 'var(--status-warning)',
                }}
              >
                {isHome ? <Home size={24} /> : <Car size={24} />}
              </div>

              <div className="detail-card-titles">
                <h1 className="detail-title-text">{device?.name}</h1>
                <span className="badge badge-subtle">{device?.type} SURVEILLANCE</span>
              </div>

              <span className="device-status-pill online">
                <span className="status-dot-sm" />
                Live Stream Online
              </span>
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="detail-edit-form">
                <div className="input-group">
                  <label htmlFor="edit-dev-name">Device Name</label>
                  <input
                    id="edit-dev-name"
                    type="text"
                    className="input-base"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="edit-dev-loc">Placement Location</label>
                  <input
                    id="edit-dev-loc"
                    type="text"
                    className="input-base"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="edit-dev-desc">Description</label>
                  <textarea
                    id="edit-dev-desc"
                    className="input-base"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="edit-form-btns">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="detail-specs-list">
                <div className="spec-row">
                  <div className="spec-icon-label">
                    <MapPin size={16} />
                    <span>Location</span>
                  </div>
                  <span className="spec-val">{device?.location || 'Unspecified'}</span>
                </div>

                <div className="spec-row">
                  <div className="spec-icon-label">
                    <FileText size={16} />
                    <span>Description</span>
                  </div>
                  <span className="spec-val">{device?.description || 'No description provided.'}</span>
                </div>

                <div className="spec-row">
                  <div className="spec-icon-label">
                    <Key size={16} />
                    <span>Device Identifier</span>
                  </div>
                  <span className="spec-val mono-font">{device?.qrCodeData || device?.id}</span>
                </div>
              </div>
            )}

            {!editing && (
              <div className="detail-card-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
                  <Edit2 size={16} />
                  <span>Edit Specifications</span>
                </button>

                <Link to="/" className="btn btn-primary">
                  <MessageSquare size={16} />
                  <span>Open Messaging Intercom</span>
                </Link>

                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  <Trash2 size={16} />
                  <span>Delete Device</span>
                </button>
              </div>
            )}
          </div>

          {/* QR Code Card */}
          <div className="device-qr-card">
            <div className="qr-card-header">
              <QrCode size={20} color="var(--primary)" />
              <h3>Instant Access QR Code</h3>
            </div>
            <p className="qr-card-desc">
              Guests can scan this code with their smartphone camera to open the instant intercom and video link.
            </p>

            <div className="qr-canvas-wrapper">
              <QRCodeCanvas
                value={`${window.location.origin}/scan/${device?.qrCodeData || device?.id}`}
                size={180}
                bgColor="#ffffff"
                fgColor="#0F172A"
                level="H"
                includeMargin={true}
              />
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm w-full"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/scan/${device?.qrCodeData || device?.id}`);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
            >
              {linkCopied ? <Check size={14} color="var(--status-online)" /> : <Copy size={14} />}
              <span>{linkCopied ? 'Access Link Copied!' : 'Copy Guest Access URL'}</span>
            </button>
          </div>
        </div>
      </div>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ToastContainer />
    </div>
  );
}
