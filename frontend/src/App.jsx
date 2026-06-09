import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { connectWebSocket, disconnectWebSocket, subscribeToNotifications } from './services/websocket';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import IncomingCall from './components/IncomingCall';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DeviceDetail from './pages/DeviceDetail';
import ChatRoom from './pages/ChatRoom';
import CallHistory from './pages/CallHistory';
import ScanResult from './pages/ScanResult';
import GuestChat from './pages/GuestChat';
import Home from './Page01/HOME/Home';
import Room from './Page01/ROOM/room';

function AppLayout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [incomingNotification, setIncomingNotification] = useState(null);
  const subscriptionRef = useRef(null);
  const subscriptionRef2 = useRef(null);
  const audioRef = useRef(null);
  const dismissTimerRef = useRef(null);

  // Subscribe to notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    const handleNotification = (notification) => {
      console.log('Incoming notification:', notification);
      setIncomingNotification(notification);

      // Auto-dismiss after 1 minute
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        setIncomingNotification(null);
      }, 60000);

      // Play notification sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 1000;
          gain2.gain.value = 0.3;
          osc2.start();
          osc2.stop(ctx.currentTime + 0.3);
        }, 350);
      } catch {

      }
    };

    connectWebSocket(
      (client) => {
        // Subscribe by userId (MongoDB ObjectId)
        subscriptionRef.current = subscribeToNotifications(user.userId, handleNotification);

        // Also subscribe by username so notifications work with either ownerId format
        if (user.username && user.username !== user.userId) {
          subscriptionRef2.current = subscribeToNotifications(user.username, handleNotification);
        }
      },
      () => {
        console.warn('WebSocket connection error');
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (subscriptionRef2.current) {
        subscriptionRef2.current.unsubscribe();
        subscriptionRef2.current = null;
      }
    };
  }, [isAuthenticated, user?.userId, user?.username]);

  const handleAcceptCall = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setIncomingNotification(null);
  }, []);

  const handleRejectCall = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setIncomingNotification(null);
  }, []);

  // Hide navbar on public guest pages
  const isGuestPage = location.pathname.startsWith('/scan') || location.pathname.startsWith('/guest-chat') || location.pathname.startsWith('/HOME') || location.pathname.startsWith('/room');
  const showNavbar = isAuthenticated && !isGuestPage;

  return (
    <>
      {showNavbar && <Navbar />}

      {/* Incoming Call/Notification Overlay */}
      {incomingNotification && (
        <IncomingCall
          notification={incomingNotification}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Public QR Scan Flow */}
        <Route path="/scan/:qrData" element={<ScanResult />} />
        <Route path="/guest-chat/:roomId" element={<GuestChat />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/devices/:id" element={<ProtectedRoute><DeviceDetail /></ProtectedRoute>} />
        <Route path="/chat/:roomId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
        <Route path="/calls" element={<ProtectedRoute><CallHistory /></ProtectedRoute>} />
        <Route path='/HOME' element={<Home />} />
        <Route path='/room/:roomId' element={<Room />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}