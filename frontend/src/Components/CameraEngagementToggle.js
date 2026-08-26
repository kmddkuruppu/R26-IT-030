// CameraEngagementToggle.jsx
//
// Drop this into Profile.js (or wherever your Settings section lives).
// One switch, one decision, applies to every game — no per-game prompts.
// Default is OFF (opt-in only, per research-ethics requirement).

import { useState } from "react";
import { getCameraConsent, setCameraConsent } from "../utils/cameraConsent";

const COPY = {
  en: {
    title: "Camera Engagement Tracking",
    desc: "Uses the camera to understand how engaged your child feels while playing. The camera view is never shown or recorded — only a live engagement score is saved. Turn this on only with a parent's permission.",
    on: "ON",
    off: "OFF",
  },
  si: {
    title: "කැමරා හැඟීම් නිරීක්ෂණය",
    desc: "ඔබේ දරුවා ක්‍රීඩා කරන අතරතුර කොපමණ උනන්දුවෙන් සිටිනවාද යන්න තේරුම් ගැනීමට කැමරාව භාවිත කරයි. කැමරා දර්ශනය කිසිවිටෙක පෙන්වන්නේ හෝ record කරන්නේ නැත — engagement ලකුණු පමණක් save වේ. දෙමාපිය අවසරයෙන් පමණක් සක්‍රීය කරන්න.",
    on: "සක්‍රීයයි",
    off: "අක්‍රීයයි",
  },
  ta: {
    title: "கேமரா ஈடுபாட்டு கண்காணிப்பு",
    desc: "உங்கள் குழந்தை விளையாடும்போது எவ்வளவு ஆர்வமாக இருக்கிறது என்பதை புரிந்துகொள்ள கேமராவைப் பயன்படுத்துகிறது. கேமரா காட்சி ஒருபோதும் காட்டப்படாது அல்லது பதிவு செய்யப்படாது — ஈடுபாட்டு மதிப்பெண் மட்டுமே சேமிக்கப்படும். பெற்றோர் அனுமதியுடன் மட்டுமே இயக்கவும்.",
    on: "இயக்கத்தில்",
    off: "முடக்கப்பட்டது",
  },
};

export default function CameraEngagementToggle({ lang = "en" }) {
  const [enabled, setEnabled] = useState(getCameraConsent());
  const c = COPY[lang] ?? COPY.en;

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setCameraConsent(next);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        padding: "16px 20px",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: "#111" }}>
          {c.title}
        </p>
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, margin: 0 }}>
          {c.desc}
        </p>
      </div>
      <button
        onClick={handleToggle}
        aria-pressed={enabled}
        style={{
          flexShrink: 0,
          width: 52,
          height: 30,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          position: "relative",
          background: enabled ? "#111" : "#d1d5db",
          transition: "background 0.2s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: enabled ? 25 : 3,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </button>
    </div>
  );
}