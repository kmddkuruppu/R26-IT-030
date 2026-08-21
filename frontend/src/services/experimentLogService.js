// src/services/experimentLogService.js
//
// Talks to the new /api/experiment-log endpoints, used by the "Research
// data" panel in LetterTracing.js for multi-device Adaptive-vs-Static
// data collection.

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const BASE = `${API_BASE_URL}/api/experiment-log`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // ignore — no JSON body
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Sends one attempt's log entry right after it happens. Fire-and-forget
// from the caller's side is fine — localStorage stays the source of truth
// on the device regardless of whether this succeeds.
export function logExperimentEntryToServer(entry) {
  return request('/log', { method: 'POST', body: JSON.stringify(entry) });
}

// Uploads a whole device's locally stored log in one call — used by the
// "Sync to server" button (catches up entries that failed to auto-send,
// or that were collected before the backend existed).
export function syncExperimentBatch(entries) {
  return request('/log/batch', { method: 'POST', body: JSON.stringify({ entries }) });
}

// Adaptive vs Static comparison across every device that has synced data.
export function getServerExperimentSummary() {
  return request('/summary');
}

// Full CSV download URL (every device, every attempt) — open this in a
// new tab / set as an <a href> rather than fetching it as JSON.
export function getExperimentExportUrl() {
  return `${BASE}/export`;
}