import { useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════════════
// AchievementToast — celebration popup for newly-unlocked achievements.
// Field names match AchievementResponse.AchievementDetail EXACTLY
// (code, titleEn, titleSi, descriptionEn, descriptionSi, icon, tier)
// — this is what checkAndEarnAchievements() now returns in `earnedDetails`.
//
// Usage in GamifiedLearningPage.js:
//   const [unlockQueue, setUnlockQueue] = useState([]);
//   ...after checkAndEarnAchievements() resolves:
//   if (res.earnedDetails?.length) setUnlockQueue(q => [...q, ...res.earnedDetails]);
//   ...in JSX (anywhere always-mounted, e.g. bottom of the lobby return):
//   <AchievementToast queue={unlockQueue} setQueue={setUnlockQueue} lang={lang} />
// ═══════════════════════════════════════════════════════════════════

const TIER_COLORS = {
  BRONZE: { bg: "#f5e6d3", border: "#c98b3a", text: "#8a5a1e" },
  SILVER: { bg: "#eef1f4", border: "#9aa5b1", text: "#4b5563" },
  GOLD:   { bg: "#fff7d6", border: "#eab308", text: "#92660a" },
};

export default function AchievementToast({ queue = [], setQueue, lang = "en" }) {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(q => q.slice(1));
    }
  }, [queue, current, setQueue]);

  useEffect(() => {
    if (!current) return;
    setVisible(true);
    const hideTimer = setTimeout(() => setVisible(false), 4200);
    const clearTimer = setTimeout(() => setCurrent(null), 4700);
    return () => { clearTimeout(hideTimer); clearTimeout(clearTimer); };
  }, [current]);

  if (!current) return null;

  const title = lang === "si" ? current.titleSi : current.titleEn;
  const desc  = lang === "si" ? current.descriptionSi : current.descriptionEn;
  const colors = TIER_COLORS[current.tier] ?? TIER_COLORS.BRONZE;
  const label = { en: "Achievement Unlocked!", si: "ජයග්‍රහණයක් අගුළු ඇරුණි!", ta: "சாதனை திறக்கப்பட்டது!" }[lang] ?? "Achievement Unlocked!";

  return (
    <div
      style={{
        position: "fixed", top: 24, right: 24, zIndex: 10000,
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "all 0.5s cubic-bezier(.22,1,.36,1)",
        pointerEvents: "none",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        background: colors.bg, border: `2px solid ${colors.border}`,
        borderRadius: 20, padding: "16px 22px", minWidth: 280, maxWidth: 340,
        boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, border: `2px solid ${colors.border}`,
        }}>
          {current.icon}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.text, marginBottom: 3 }}>
            {label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 2 }}>{title}</div>
          {desc && <div style={{ fontSize: 12, color: "#6b7280" }}>{desc}</div>}
        </div>
      </div>
    </div>
  );
}
