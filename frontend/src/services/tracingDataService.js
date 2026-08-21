// src/services/tracingDataService.js
//
// Talks to the new backend endpoints under /api/tracing-data.
// Used by:
//   - LetterTracing.js  -> getFullTracingData()  (read-only, students)
//   - AddTracingData.js -> everything else        (admin CRUD)
//
// If your project already has an axios instance with baseURL/auth headers
// set up in apiService.js, swap the fetch calls below for that instance —
// the function names/shapes here are what both pages expect, so nothing
// else needs to change.

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const BASE = `${API_BASE_URL}/api/tracing-data`;

async function request(path, options = {}) {
  const token = localStorage.getItem('token'); // adjust key if yours differs
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
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

// ── read: used by LetterTracing.js ──
export function getFullTracingData() {
  return request('/full');
}

// ── categories: used by AddTracingData.js ──
export function getCategories() {
  return request('/categories');
}
export function createCategory(payload) {
  return request('/categories', { method: 'POST', body: JSON.stringify(payload) });
}
export function updateCategory(id, payload) {
  return request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}
export function deleteCategory(id) {
  return request(`/categories/${id}`, { method: 'DELETE' });
}

// ── letters: used by AddTracingData.js ──
export function getLetters() {
  return request('/letters');
}
export function getLetterById(id) {
  return request(`/letters/${id}`);
}
export function createLetter(payload) {
  return request('/letters', { method: 'POST', body: JSON.stringify(payload) });
}
export function updateLetter(id, payload) {
  return request(`/letters/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}
export function deleteLetter(id) {
  return request(`/letters/${id}`, { method: 'DELETE' });
}