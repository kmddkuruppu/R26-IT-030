// cameraConsent.js
//
// Simple persisted on/off flag for camera-based engagement tracking.
// This is the "global toggle" approach — one decision (made by a parent
// in the Profile/Settings page) applies to every game, instead of asking
// on every single game screen.
//
// Stored in localStorage so it survives refreshes/navigation. If you want
// this to sync across devices for the same student, also mirror it to the
// backend (see the commented-out section at the bottom).

const STORAGE_KEY = "camera_engagement_consent";

export function getCameraConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false; // default OFF — opt-in only, never opt-out
  }
}

export function setCameraConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
  } catch {
    // localStorage unavailable (private browsing etc.) — fails silently,
    // consent simply won't persist across reloads in that case.
  }
}

/*
// ── Optional: sync consent to the backend too ──────────────────────
// If you want the setting to follow the student across devices, add a
// column to the Student entity (e.g. `cameraConsent BOOLEAN DEFAULT FALSE`)
// and call an endpoint like PATCH /api/students/camera-consent whenever
// setCameraConsent() is called. Example:
//
// import { updateCameraConsent } from "../services/apiService"; // you'd add this
//
// export async function setCameraConsentSynced(value) {
//   setCameraConsent(value);
//   try { await updateCameraConsent(value); } catch (e) { console.error(e); }
// }
*/