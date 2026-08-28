import { useEffect, useState } from 'react';
import { getAuthHeader, clearCredentials } from './auth.js';

async function api(path, options) {
  const headers = { 'Content-Type': 'application/json' };
  const authHeader = getAuthHeader();
  if (authHeader) headers.Authorization = authHeader;

  const res = await fetch(`/api${path}`, { headers, ...options });

  if (res.status === 401) {
    clearCredentials();
    const err = new Error('Admin login required');
    err.isAuthError = true;
    throw err;
  }
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

export function useSyncedState() {
  const [state, setState] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let ws;
    let reconnectTimer;
    let reconnectDelay = 1000;

    const refreshState = () =>
      fetch('/api/state').then((r) => r.json()).then((data) => { if (!cancelled) setState(data); }).catch(() => {});

    function connect() {
      if (cancelled) return;
      clearTimeout(reconnectTimer);

      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(`${proto}://${location.host}/ws`);

      ws.onopen = () => { reconnectDelay = 1000; };

      ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'state') setState(msg.payload);
      };

      ws.onclose = () => {
        if (cancelled) return;
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 10000);
      };
    }

    // A kiosk display can sit idle for hours; if the socket died in the
    // background, reconnect and resync the instant someone comes back to
    // it instead of waiting for the next backoff tick.
    function onVisible() {
      if (document.visibilityState !== 'visible') return;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
      reconnectDelay = 1000;
      refreshState();
      connect();
    }

    refreshState();
    connect();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      document.removeEventListener('visibilitychange', onVisible);
      ws.close();
    };
  }, []);

  return state;
}

export const addTask = (studentId, task) =>
  api(`/students/${studentId}/tasks`, { method: 'POST', body: JSON.stringify(task) });

export const toggleTask = (studentId, taskId, done) =>
  api(`/students/${studentId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ done }) });

export const deleteTask = (studentId, taskId) =>
  api(`/students/${studentId}/tasks/${taskId}`, { method: 'DELETE' });

export const addFamilyItem = (groupKey, item) =>
  api(`/family/${groupKey}/items`, { method: 'POST', body: JSON.stringify(item) });

export const toggleFamilyItem = (groupKey, itemId, done) =>
  api(`/family/${groupKey}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ done }) });

export const deleteFamilyItem = (groupKey, itemId) =>
  api(`/family/${groupKey}/items/${itemId}`, { method: 'DELETE' });
