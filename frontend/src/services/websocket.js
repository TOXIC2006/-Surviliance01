import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/chat';

let stompClient = null;

export function connectWebSocket(onConnected, onError) {
  // Don't create a new connection if one is already active
  if (stompClient && stompClient.active) {
    if (onConnected) onConnected(stompClient);
    return stompClient;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket connected');
      if (onConnected) onConnected(stompClient);
    },
    onStompError: (frame) => {
      console.error('STOMP error', frame);
      if (onError) onError(frame);
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
  });

  stompClient.activate();
  return stompClient;
}

export function disconnectWebSocket() {
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function subscribeToChatRoom(roomId, onMessage) {
  if (!stompClient || !stompClient.active) {
    console.warn('WebSocket not connected');
    return null;
  }

  return stompClient.subscribe(`/topic/messages/${roomId}`, (message) => {
    const parsed = JSON.parse(message.body);
    onMessage(parsed);
  });
}

export function sendChatMessage(roomId, sender, content) {
  if (!stompClient || !stompClient.active) {
    console.warn('WebSocket not connected');
    return;
  }

  stompClient.publish({
    destination: `/app/sendMessage/${roomId}`,
    body: JSON.stringify({ sender, content }),
  });
}

// ========== Notifications ==========

/**
 * Subscribe to owner notifications (called when someone scans their QR).
 */
export function subscribeToNotifications(ownerId, onNotification) {
  if (!stompClient || !stompClient.active) {
    console.warn('WebSocket not connected');
    return null;
  }

  return stompClient.subscribe(`/topic/notifications/${ownerId}`, (message) => {
    const parsed = JSON.parse(message.body);
    onNotification(parsed);
  });
}

/**
 * Send a notification to a device owner (used by guests after scanning QR).
 */
export function sendNotification(ownerId, notification) {
  if (!stompClient || !stompClient.active) {
    console.warn('WebSocket not connected');
    return;
  }

  stompClient.publish({
    destination: `/app/notify/${ownerId}`,
    body: JSON.stringify(notification),
  });
}

// ========== Calls ==========

export function subscribeToCall(sessionId, onSignal) {
  if (!stompClient || !stompClient.active) return null;

  return stompClient.subscribe(`/topic/calls/${sessionId}`, (message) => {
    const parsed = JSON.parse(message.body);
    onSignal(parsed);
  });
}

export function getStompClient() {
  return stompClient;
}
