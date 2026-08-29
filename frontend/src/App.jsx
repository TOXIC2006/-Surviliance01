import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { connectWebSocket, subscribeToNotifications } from './services/websocket';
import IncomingCall from './components/IncomingCall';
import ChatAppMain from './pages/ChatAppMain';
import Dashboard from './pages/Dashboard';
import DeviceDetail from './pages/DeviceDetail';
import CallHistory from './pages/CallHistory';
import ScanResult from './pages/ScanResult';
import GuestChat from './pages/GuestChat';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './Page01/HOME/Home';
import Room from './Page01/ROOM/room';

function AppLayout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [incomingNotification, setIncomingNotification] = useState(null);
  const subscriptionRef = useRef(null);
  const subscriptionRef2 = useRef(null);
  const dismissTimerRef = useRef(null);

  // Subscribe to real WebSocket notifications if available
  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    const handleNotification = (notification) => {
      setIncomingNotification(notification);

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        setIncomingNotification(null);
      }, 60000);
    };

    connectWebSocket(
      () => {
        subscriptionRef.current = subscribeToNotifications(user.userId, handleNotification);
        if (user.username && user.username !== user.userId) {
          subscriptionRef2.current = subscribeToNotifications(user.username, handleNotification);
        }
      },
      () => {
        // WebSocket not available or standalone mode
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

  return (
    <>
      {/* Global Incoming Call Overlay */}
      {incomingNotification && (
        <IncomingCall
          notification={incomingNotification}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      <Routes>
        {/* Modern Real-Time Chat App (Primary Experience) */}
        <Route path="/" element={<ChatAppMain />} />
        <Route path="/chat/:roomId" element={<ChatAppMain />} />

        {/* Surveillance & Devices Hub */}
        <Route path="/surveillance" element={<Dashboard />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />

        {/* Call History */}
        <Route path="/calls" element={<CallHistory />} />

        {/* Public Flow */}
        <Route path="/scan/:qrData" element={<ScanResult />} />
        <Route path="/guest-chat/:roomId" element={<GuestChat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Additional Room Flow */}
        <Route path="/HOME" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <AppLayout />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
