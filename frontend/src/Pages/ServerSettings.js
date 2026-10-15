import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  getServerUrl,
  saveServerUrl,
  resetServerUrl,
} from "../services/serverConfig";

export default function ServerSettings() {
  const [serverUrl, setServerUrl] = useState(getServerUrl());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const savedUrl = saveServerUrl(serverUrl);
      setServerUrl(savedUrl);
      setMessage("Server URL saved successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    resetServerUrl();
    setServerUrl(getServerUrl());
    setMessage("Default Server URL restored.");
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        background: "#f4f7fb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "30px",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h2>Server Settings</h2>

        <p>
          Enter the HTTPS address of your Letter Helper backend.
        </p>

        <form onSubmit={handleSave}>
          <label htmlFor="server-url">Backend Server URL</label>

          <input
            id="server-url"
            type="url"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="https://192.168.1.10:8080"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />

          <button type="submit" style={buttonStyle}>
            Save Server URL
          </button>
        </form>

        <button
          type="button"
          onClick={handleReset}
          style={{
            ...buttonStyle,
            background: "#64748b",
            marginTop: "12px",
          }}
        >
          Reset to Default
        </button>

        {message && (
          <p role="status" style={{ color: "green" }}>
            {message}
          </p>
        )}

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <p style={{ marginTop: "20px", fontSize: "13px" }}>
          Note: Your phone must be able to reach the backend, and
          its HTTPS certificate must be valid for this address.
        </p>

        <Link to="/" style={{ display: "block", marginTop: "20px" }}>
          Back to Welcome
        </Link>
      </div>
    </div>
  );
}

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};