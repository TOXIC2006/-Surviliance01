import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDevices, createDevice } from '../services/api';
import DeviceCard from '../components/DeviceCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'HOME', description: '', location: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      setLoading(true);
      const data = await getDevices();
      setDevices(data);
    } catch (err) {
      setError('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await createDevice(newDevice);
      setShowModal(false);
      setNewDevice({ name: '', type: 'HOME', description: '', location: '' });
      loadDevices();
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
    <div className="page">
      <div className="dashboard-top">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.username}. Manage your surveillance devices.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Device
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon">📡</div>
          <div className="stat-info">
            <span className="stat-value">{devices.length}</span>
            <span className="stat-label">Total Devices</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <span className="stat-value">{homeCount}</span>
            <span className="stat-label">Home Devices</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <span className="stat-value">{carCount}</span>
            <span className="stat-label">Car Devices</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['ALL', 'HOME', 'CAR'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? '📡 All' : f === 'HOME' ? '🏠 Home' : '🚗 Car'}
            <span className="filter-count">
              {f === 'ALL' ? devices.length : f === 'HOME' ? homeCount : carCount}
            </span>
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error mb-2">{error}</div>}

      {/* Device Grid */}
      {loading ? (
        <div className="dashboard-loading">
          <LoadingSpinner size={40} text="Loading devices..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">📡</div>
          <h3>No devices yet</h3>
          <p>Add your first surveillance device to get started.</p>
          <button className="btn btn-primary mt-2" onClick={() => setShowModal(true)}>
            + Add Device
          </button>
        </div>
      ) : (
        <div className="device-grid stagger">
          {filtered.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {/* Add Device Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Device">
        <form className="modal-form" onSubmit={handleCreate}>
          <div className="input-group">
            <label htmlFor="device-name">Device Name *</label>
            <input
              id="device-name"
              type="text"
              className="input"
              placeholder="e.g. Front Door Camera"
              value={newDevice.name}
              onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="device-type">Type</label>
            <select
              id="device-type"
              className="input"
              value={newDevice.type}
              onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
            >
              <option value="HOME">🏠 Home</option>
              <option value="CAR">🚗 Car</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="device-location">Location</label>
            <input
              id="device-location"
              type="text"
              className="input"
              placeholder="e.g. Main entrance"
              value={newDevice.location}
              onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label htmlFor="device-desc">Description</label>
            <textarea
              id="device-desc"
              className="input"
              placeholder="Optional description..."
              value={newDevice.description}
              onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2" disabled={creating}>
            {creating ? 'Creating...' : 'Create Device'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
