const BASE_URL = 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // For QR code image endpoints, return the blob
  if (response.ok && response.headers.get('content-type')?.includes('image')) {
    return response.blob();
  }

  // For 204 No Content
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ========== Auth ==========
export async function login(username, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return data;
}

export async function register(userData) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return data;
}

// ========== Devices ==========
export async function getDevices(type) {
  const query = type ? `?type=${type}` : '';
  return request(`/api/devices${query}`);
}

export async function getDevice(id) {
  return request(`/api/devices/${id}`);
}

export async function createDevice(deviceData) {
  return request('/api/devices', {
    method: 'POST',
    body: JSON.stringify(deviceData),
  });
}

export async function updateDevice(id, deviceData) {
  return request(`/api/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(deviceData),
  });
}

export async function deleteDevice(id) {
  return request(`/api/devices/${id}`, {
    method: 'DELETE',
  });
}

// ========== QR Codes ==========
export function getQrCodeUrl(deviceId) {
  const token = getToken();
  return `${BASE_URL}/api/qr/device/${deviceId}?token=${token}`;
}

export async function getQrCodeBlob(deviceId) {
  return request(`/api/qr/device/${deviceId}`);
}

export async function scanQrCode(qrCodeData) {
  return request('/api/qr/scan', {
    method: 'POST',
    body: JSON.stringify({ qrCodeData }),
  });
}

// ========== Calls ==========
export async function initiateCall(calleeId, deviceId) {
  return request('/api/calls/initiate', {
    method: 'POST',
    body: JSON.stringify({ calleeId, deviceId }),
  });
}

export async function acceptCall(sessionId) {
  return request(`/api/calls/${sessionId}/accept`, {
    method: 'POST',
  });
}

export async function endCall(sessionId) {
  return request(`/api/calls/${sessionId}/end`, {
    method: 'POST',
  });
}

export async function getCallHistory() {
  return request('/api/calls/history');
}

// ========== Rooms / Messages ==========
export async function createRoom(roomId) {
  return request('/Room', {
    method: 'POST',
    body: JSON.stringify({ roomId }),
  });
}

export async function getRoom(roomId) {
  return request(`/Room/${roomId}`);
}

export async function getMessages(roomId, page = 0, size = 20) {
  return request(`/Room/${roomId}/message?page=${page}&size=${size}`);
}

export async function sendMessageRest(roomId, sender, content) {
  return request(`/Room/${roomId}/message`, {
    method: 'POST',
    body: JSON.stringify({ sender, content }),
  });
}
