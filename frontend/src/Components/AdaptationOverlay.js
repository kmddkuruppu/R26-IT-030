import { useEffect, useState } from "react";
import { pickMessage } from "../utils/adaptationEngine";

const ACTION_ICON = {
  ENCOURAGEMENT: "💪",
  HINT: "👀",
  SIMPLIFY: "🌱",
  SUGGEST_SWITCH: "🎮",
  SPEED_UP: "⚡",
};

export default function AdaptationOverlay({ intervention, lang = "en", onDismiss, onSuggestSwitch }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!intervention) return;
    setMessage(pickMessage(intervention.action, lang));
    const timer = setTimeout(() => onDismiss && onDismiss(), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervention]);

  if (!intervention) return null;

  return (
    <div
      style={{
        position: "fixed", bottom: 90, right: 16, maxWidth: 280, zIndex: 9997,
        background: "#111", color: "#fff", borderRadius: 18, padding: "14px 16px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)", display: "flex",
        alignItems: "flex-start", gap: 10,
        animation: "adaptFadeUp 0.35s cubic-bezier(.22,1,.36,1) both", fontFamily: "inherit",
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{ACTION_ICON[intervention.action] ?? "✨"}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, lineHeight: 1.4, margin: 0 }}>{message}</p>
        {intervention.action === "SUGGEST_SWITCH" && onSuggestSwitch && (
          <button
            onClick={() => { onDismiss && onDismiss(); onSuggestSwitch(); }}
            style={{
              marginTop: 8, background: "#fff", color: "#111", border: "none",
              borderRadius: 10, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}
          >
            {lang === "si" ? "සියලු ක්‍රීඩා →" : lang === "ta" ? "எல்லா விளையாட்டுகள் →" : "All Games →"}
          </button>
        )}
      </div>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
      <style>{`@keyframes adaptFadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}`}</style>
    </div>
  );
}