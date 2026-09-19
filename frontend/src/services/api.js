const BASE_URL = '/api';

/**
 * Universal API helper
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('giftbro_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.details || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  // System / AI status
  getAiStatus: () => request('/ai-status'),
  getHealth: () => request('/health'),

  // Recommendations
  recommendGifts: (payload) =>
    request('/recommend-gifts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  refineGifts: (payload) =>
    request('/refine-gifts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Recipients
  getRecipients: () => request('/recipients'),
  getRecipientById: (id) => request(`/recipients/${id}`),
  createRecipient: (payload) =>
    request('/recipients', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRecipient: (id, payload) =>
    request(`/recipients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteRecipient: (id) =>
    request(`/recipients/${id}`, {
      method: 'DELETE',
    }),

  // Gifts & History
  saveRecipientGift: (recipientId, giftPayload) =>
    request(`/recipients/${recipientId}/gifts`, {
      method: 'POST',
      body: JSON.stringify(giftPayload),
    }),
  updateGiftStatus: (giftId, status) =>
    request(`/gifts/${giftId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getRecipientHistory: (recipientId) => request(`/recipients/${recipientId}/history`),

  // Shopping Tracking
  trackShoppingClick: (payload) =>
    request('/tracking/shopping-click', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn('Analytics tracking error:', err.message);
      return null;
    }),
};
