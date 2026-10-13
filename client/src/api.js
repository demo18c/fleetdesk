// ============================================================
// client/src/api.js — thin wrapper around fetch for the devices API
// Components call these four functions and never build URLs or
// headers themselves. Keeps all HTTP details in one place.
// ============================================================

// Base URL for the API.
//  - dev:  '' → requests go to /api/... on the Vite server, which proxies to :5001
//  - prod: '' → same origin, because Express serves the built React app
//  - override with VITE_API_URL if the API is ever hosted separately
const BASE = import.meta.env.VITE_API_URL || '';

// Shared request helper. Adds the JSON header, parses the response, and
// turns non-2xx responses into thrown Errors so callers can use try/catch.
// 204 (delete) has no body, so return null instead of trying to parse it.
const request = async (path, options = {}) => {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

// READ all devices.
export const listDevices = () => request('/devices');

// CREATE a device. `device` is the form object { name, serial, platform, osVersion, status, assignedTo, notes }.
export const createDevice = (device) =>
  request('/devices', { method: 'POST', body: JSON.stringify(device) });

// UPDATE a device by id. `device` can be partial (e.g. just { status }).
export const updateDevice = (id, device) =>
  request(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(device) });

// DELETE a device by id.
export const deleteDevice = (id) => request(`/devices/${id}`, { method: 'DELETE' });
