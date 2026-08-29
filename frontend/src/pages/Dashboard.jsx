import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { getDevices, createDevice } from '../services/api';
import TopHeader from '../components/chat/TopHeader';
import DeviceCard from '../components/DeviceCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastContainer from '../components/ui/ToastContainer';
import NewChatModal from '../components/modals/NewChatModal';
import SettingsModal from '../components/modals/SettingsModal';
import CallModal from '../components/modals/CallModal';
import {
  Shield,
  Radio,
  Home,
  Car,
  Plus,
  Video,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import './Dashboard.css';

const DEFAULT_MOCK_DEVICES = [
  {
    id: 'dev_front_door',
    name: 'Front Door Camera Pro',
    type: 'HOME',
    location: 'Main Porch Entrance',
    description: '1080p HDR with night vision and two-way audio intercom.',
    status: 'ONLINE',
    qrCodeData: 'dev_front_door_qr_secure',
    lastActive: Date.now() - 5 * 60 * 1000,
  },
  {
    id: 'dev_living_hub',
    name: 'Living Room Hub',
    type: 'HOME',
    location: 'First Floor Lounge',
    description: 'Motion sensing sensor with thermal detection.',
    status: 'ONLINE',
    qrCodeData: 'dev_living_hub_qr_secure',
    lastActive: Date.now() - 15 * 60 * 1000,
  },
  {
    id: 'dev_car_dash',
    name: 'Tesla Dashcam Sync',
    type: 'CAR',
    location: 'Vehicle Front & Rear',
    description: '4K dual-channel surveillance with GPS telemetry.',
    status: 'ONLINE',
    qrCodeData: 'dev_car_dash_qr_secure',
    lastActive: Date.now() - 30 * 60 * 1000,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { activeCall } = useChat();
  const [devices, setDevices] = useState(DEFAULT_MOCK_DEVICES);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'HOME', description: '', location: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      const data = await getDevices();
      if (Array.isArray(data) && data.length > 0) {
        setDevices(data);
      }
    } catch (err) {
      // Backend not running, use mock
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      let created;
      try {
        created = await createDevice(newDevice);
      } catch {
        created = {
          id: 'dev_' + Date.now(),
          ...newDevice,
          status: 'ONLINE',
          qrCodeData: 'dev_custom_' + Date.now(),
          lastActive: Date.now(),
        };
      }
      setDevices((prev) => [created || { id: 'dev_' + Date.now(), ...newDevice, status: 'ONLINE' }, ...prev]);
      setShowModal(false);
      setNewDevice({ name: '', type: 'HOME', description: '', location: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  const filtered = filter === 'ALL' ? devices : devices.filter((d) => d.type === filter);
  const homeCount = devices.filter((d) => d.type === 'HOME').length;
  const carCount = devices.filter((d) => d.type === 'CAR').length;

  return (
    <div className="page-shell">
      <TopHeader
        onOpenNewChat={() => setIsNewChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="dashboard-container">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Devices & Surveillance Hub</h1>
            <p className="page-subtitle">
              Monitor active video feeds, generate guest QR access codes, and stream real-time events.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Add Device</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats-grid">
          <div className="saas-stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Radio size={22} />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-val">{devices.length}</span>
              <span className="stat-card-lbl">Total Connected Devices</span>
            </div>
          </div>

          <div className="saas-stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', color: 'var(--status-online)' }}>
              <Home size={22} />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-val">{homeCount}</span>
              <span className="stat-card-lbl">Home Surveillance</span>
            </div>
          </div>

          <div className="saas-stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--status-warning)' }}>
              <Car size={22} />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-val">{carCount}</span>
              <span className="stat-card-lbl">Vehicle Telemetry</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="dashboard-filter-bar">
          <div className="filter-tab-group">
            <button
              className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              <span>All Devices</span>
              <span className="filter-count-badge">{devices.length}</span>
            </button>
            <button
              className={`filter-btn ${filter === 'HOME' ? 'active' : ''}`}
              onClick={() => setFilter('HOME')}
            >
              <Home size={14} />
              <span>Home ({homeCount})</span>
            </button>
            <button
              className={`filter-btn ${filter === 'CAR' ? 'active' : ''}`}
              onClick={() => setFilter('CAR')}
            >
              <Car size={14} />
              <span>Car ({carCount})</span>
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Device Grid */}
        {loading ? (
          <div className="loading-stage">
            <LoadingSpinner size={36} text="Loading surveillance feeds..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="calls-empty-card">
            <Shield size={40} color="var(--primary)" />
            <h3>No devices found</h3>
            <p>Connect your first surveillance device or IoT camera to begin streaming.</p>
            <button className="btn btn-primary mt-2" onClick={() => setShowModal(true)}>
              <Plus size={16} />
              <span>Add Device</span>
            </button>
          </div>
        ) : (
          <div className="saas-device-grid">
            {filtered.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}

        {/* Add Device Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Surveillance Device">
          <form className="modal-form" onSubmit={handleCreate}>
            <div className="input-group">
              <label htmlFor="device-name">Device Name *</label>
              <input
                id="device-name"
                type="text"
                className="input-base"
                placeholder="e.g. Front Door Camera Pro"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <label htmlFor="device-type">Device Type</label>
              <select
                id="device-type"
                className="input-base"
                value={newDevice.type}
                onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
              >
                <option value="HOME">🏠 Home Surveillance</option>
                <option value="CAR">🚗 Vehicle Dashcam</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="device-location">Placement Location</label>
              <input
                id="device-location"
                type="text"
                className="input-base"
                placeholder="e.g. Main Porch Entrance"
                value={newDevice.location}
                onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label htmlFor="device-desc">Description</label>
              <textarea
                id="device-desc"
                className="input-base"
                placeholder="Camera specifications or notes..."
                value={newDevice.description}
                onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="modal-footer" style={{ margin: '10px -20px -20px -20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Registering...' : 'Register Device'}
              </button>
            </div>
          </form>
        </Modal>
      </div>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {activeCall && <CallModal />}
      <ToastContainer />
    </div>
  );
}
