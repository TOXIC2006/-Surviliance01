import { useState, useEffect } from 'react';
import { getCallHistory } from '../services/api';
import { useChat } from '../context/ChatContext';
import TopHeader from '../components/chat/TopHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastContainer from '../components/ui/ToastContainer';
import NewChatModal from '../components/modals/NewChatModal';
import SettingsModal from '../components/modals/SettingsModal';
import CallModal from '../components/modals/CallModal';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Clock,
  Calendar,
  Shield,
  Plus,
  Trash2,
} from 'lucide-react';
import './CallHistory.css';

const DEFAULT_MOCK_CALLS = [
  {
    id: 'call_1',
    callerName: 'Rahul Sharma',
    calleeName: 'Alex Morgan (You)',
    type: 'video',
    status: 'COMPLETED',
    startTime: Date.now() - 45 * 60 * 1000,
    endTime: Date.now() - 32 * 60 * 1000,
    duration: '13m 24s',
    initials: 'RS',
    avatarBg: '#6366F1',
  },
  {
    id: 'call_2',
    callerName: 'Priya Singh',
    calleeName: 'Alex Morgan (You)',
    type: 'audio',
    status: 'COMPLETED',
    startTime: Date.now() - 3 * 60 * 60 * 1000,
    endTime: Date.now() - (3 * 60 * 60 * 1000 - 5 * 60 * 1000),
    duration: '5m 12s',
    initials: 'PS',
    avatarBg: '#EC4899',
  },
  {
    id: 'call_3',
    callerName: 'Aman Kumar',
    calleeName: 'Alex Morgan (You)',
    type: 'audio',
    status: 'MISSED',
    startTime: Date.now() - 24 * 60 * 60 * 1000,
    endTime: null,
    duration: 'Missed',
    initials: 'AK',
    avatarBg: '#10B981',
  },
  {
    id: 'call_4',
    callerName: 'Front Door Camera',
    calleeName: 'Alex Morgan (You)',
    type: 'video',
    status: 'COMPLETED',
    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    endTime: Date.now() - (2 * 24 * 60 * 60 * 1000 - 45 * 1000),
    duration: '45s',
    initials: 'FD',
    avatarBg: '#475569',
  },
];

export default function CallHistory() {
  const { startCall, activeCall } = useChat();
  const [calls, setCalls] = useState(DEFAULT_MOCK_CALLS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadCalls();
  }, []);

  async function loadCalls() {
    try {
      const data = await getCallHistory();
      if (Array.isArray(data) && data.length > 0) {
        setCalls(data);
      }
    } catch (err) {
      // Keep default mock calls if backend is offline
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="page-shell">
      <TopHeader
        onOpenNewChat={() => setIsNewChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="call-history-container">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Call History</h1>
            <p className="page-subtitle">Past audio and video sessions across your contacts and devices.</p>
          </div>
        </div>

        {error && <div className="alert alert-error mb-2">{error}</div>}

        {loading ? (
          <div className="loading-stage">
            <LoadingSpinner size={36} text="Loading call records..." />
          </div>
        ) : calls.length === 0 ? (
          <div className="calls-empty-card">
            <PhoneCall size={40} color="var(--primary)" />
            <h3>No call history yet</h3>
            <p>Calls you initiate or receive will appear here with timestamps and duration.</p>
          </div>
        ) : (
          <div className="calls-list-grid">
            {calls.map((call) => {
              const isMissed = call.status === 'MISSED';
              const isVideo = call.type === 'video';

              return (
                <div key={call.id} className="call-record-card">
                  <div
                    className="avatar avatar-md"
                    style={{ backgroundColor: call.avatarBg || 'var(--primary)', color: '#FFFFFF' }}
                  >
                    {call.initials || call.callerName?.slice(0, 2).toUpperCase() || 'RS'}
                  </div>

                  <div className="call-record-info">
                    <div className="call-record-top">
                      <span className="call-record-name">{call.callerName}</span>
                      <span className={`call-status-pill ${isMissed ? 'missed' : 'completed'}`}>
                        {isMissed ? 'Missed' : 'Completed'}
                      </span>
                    </div>

                    <div className="call-record-meta">
                      <span className="call-meta-item">
                        {isVideo ? <Video size={14} /> : <PhoneCall size={14} />}
                        <span>{isVideo ? 'HD Video Call' : 'Voice Call'}</span>
                      </span>
                      <span className="call-meta-item">
                        <Calendar size={14} />
                        <span>{formatDate(call.startTime)}</span>
                      </span>
                      <span className="call-meta-item">
                        <Clock size={14} />
                        <span>{call.duration || '0:45'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="call-record-actions">
                    <button
                      type="button"
                      className="btn-icon btn-sm"
                      onClick={() =>
                        startCall(isVideo ? 'video' : 'audio', {
                          name: call.callerName,
                          avatarBg: call.avatarBg,
                          initials: call.initials,
                        })
                      }
                      aria-label="Call back"
                      title="Call back"
                    >
                      {isVideo ? <Video size={16} /> : <PhoneCall size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {activeCall && <CallModal />}
      <ToastContainer />
    </div>
  );
}
