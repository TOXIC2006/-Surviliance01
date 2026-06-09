import { useState, useEffect } from 'react';
import { getCallHistory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './CallHistory.css';

export default function CallHistory() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCalls();
  }, []);

  async function loadCalls() {
    try {
      setLoading(true);
      const data = await getCallHistory();
      setCalls(data);
    } catch (err) {
      setError('Failed to load call history');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'RINGING':
        return <span className="badge badge-warning">🔔 Ringing</span>;
      case 'ACTIVE':
        return <span className="badge badge-success">📞 Active</span>;
      case 'ENDED':
        return <span className="badge badge-purple">✅ Ended</span>;
      case 'MISSED':
        return <span className="badge badge-danger">❌ Missed</span>;
      default:
        return <span className="badge badge-purple">{status}</span>;
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Call History</h1>
        <p>View your past call sessions</p>
      </div>

      {error && <div className="alert alert-error mb-2">{error}</div>}

      {loading ? (
        <div className="dashboard-loading">
          <LoadingSpinner size={40} text="Loading call history..." />
        </div>
      ) : calls.length === 0 ? (
        <div className="calls-empty">
          <div className="calls-empty-icon">📞</div>
          <h3>No calls yet</h3>
          <p>Your call history will appear here.</p>
        </div>
      ) : (
        <div className="calls-list stagger">
          {calls.map((call) => (
            <div key={call.id} className="call-item glass">
              <div className="call-item-icon">
                📞
              </div>
              <div className="call-item-info">
                <div className="call-item-top">
                  <span className="call-item-name">
                    {call.callerName || 'Unknown'} → {call.calleeName || 'Unknown'}
                  </span>
                  {getStatusBadge(call.status)}
                </div>
                <div className="call-item-meta">
                  {call.deviceId && (
                    <span className="call-meta-tag">📡 Device: {call.deviceId.substring(0, 8)}...</span>
                  )}
                  <span className="call-meta-tag">🕐 {formatDate(call.startTime)}</span>
                  {call.endTime && (
                    <span className="call-meta-tag">
                      ⏱️ {Math.round((new Date(call.endTime) - new Date(call.startTime)) / 1000)}s
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
