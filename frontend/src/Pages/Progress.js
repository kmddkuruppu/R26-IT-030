import { useState, useEffect, useRef, useCallback } from "react";

// ─── ANIMATED COUNTER ─────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 50);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 28);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}{suffix}</span>;
}

// ─── RING PROGRESS (SVG) ──────────────────────────────────────────
function RingProgress({ pct, size = 52, stroke = 5, color = "#111" }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={animated ? `${circ * pct / 100} ${circ * (1 - pct / 100)}` : `0 ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.22,1,.36,1)" }}
      />
    </svg>
  );
}

// ─── MODULE DATA ──────────────────────────────────────────────────
const MODULES = [
  {
    id: "recognition", icon: "📖", name: "Letter Recognition",
    sub: "Upload · Explore · Match", pct: 78,
    badge: "42 / 60 letters", color: "#111",
  },
  {
    id: "tracing", icon: "✍️", name: "Letter Tracing",
    sub: "Draw · Keypoints · Score", pct: 61,
    badge: "14 / 23 mastered", color: "#374151",
  },
  {
    id: "games", icon: "🎮", name: "Games",
    sub: "Match · Quiz · Hunt · Puzzle", pct: 85,
    badge: "7 / 8 games played", color: "#111",
  },
  {
    id: "handwriting", icon: "🖊️", name: "Handwriting",
    sub: "Guided · Free · Picture", pct: 54,
    badge: "13 / 24 sessions", color: "#6b7280",
  },
];

// ─── SINHALA LETTERS ──────────────────────────────────────────────
const SINHALA_LETTERS = [
  "අ","ආ","ඇ","ඈ","ඉ","ඊ","උ","ඌ","එ","ඒ","ඓ","ඔ","ඕ","ඖ",
  "ක","ඛ","ග","ඝ","ඞ","ච","ඡ","ජ","ඣ","ඤ",
  "ට","ඨ","ඩ","ඪ","ණ","ත","ථ","ද","ධ","න",
  "ප","ඵ","බ","භ","ම","ය","ර","ල","ව","ශ","ෂ","ස","හ","ළ","ෆ",
  "ඟ","ඦ","ඬ","ඳ","ඹ","ෳ","ෲ","෱","ෙ","ේ",
];

const LETTER_STATE = [
  ...Array(42).fill("mastered"),
  ...Array(12).fill("in-progress"),
  ...Array(6).fill(""),
];

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { icon: "🔥", name: "7-Day Streak",      desc: "Practiced 7 days in a row",          unlocked: true  },
  { icon: "⭐", name: "First 500 Points",   desc: "Earned 500+ total points",            unlocked: true  },
  { icon: "✍️", name: "Tracing Master",     desc: "100% on a tracing session",           unlocked: true  },
  { icon: "🏆", name: "All 60 Letters",    desc: "Master every Sinhala letter",          unlocked: false },
  { icon: "🎮", name: "Game Champion",     desc: "Score 100% in all 8 games",            unlocked: false },
  { icon: "📝", name: "Sentence Pro",      desc: "Complete all 5 picture activities",    unlocked: false },
];

// ─── RECENT ACTIVITY ──────────────────────────────────────────────
const ACTIVITIES = [
  { dot: "#111",    text: <><strong>Speed Quiz</strong> — scored 150/150 pts</>,       time: "2h ago",      score: "100%",    scoreStyle: { background: "#f0fdf4", color: "#15803d" } },
  { dot: "#374151", text: <><strong>Tracing: ස</strong> — all 11 keypoints covered</>, time: "3h ago",      score: "94%",     scoreStyle: { background: "#f0fdf4", color: "#15803d" } },
  { dot: "#374151", text: <><strong>Letter Hunt</strong> — Round 5/5 complete</>,      time: "Yesterday",   score: "180 pts", scoreStyle: { background: "#f9fafb", color: "#374151" } },
  { dot: "#6b7280", text: <><strong>Handwriting</strong> — Picture Activity: School</>, time: "Yesterday",  score: "✓ 5/5",   scoreStyle: { background: "#f0fdf4", color: "#15803d" } },
  { dot: "#111",    text: <><strong>Memory Match</strong> — 6 pairs in 34s</>,         time: "2 days ago",  score: "120 pts", scoreStyle: { background: "#f9fafb", color: "#374151" } },
  { dot: "#374151", text: <><strong>Tracing: ක</strong> — boundary warnings: 2</>,     time: "2 days ago",  score: "76%",     scoreStyle: { background: "#fff7ed", color: "#c2410c" } },
  { dot: "#6b7280", text: <><strong>Free Writing</strong> — 3 sentences submitted</>,  time: "3 days ago",  score: "85%",     scoreStyle: { background: "#f0fdf4", color: "#15803d" } },
];

// ─── BAR CHART ────────────────────────────────────────────────────
const BAR_DATA = {
  week:  { bars: [45, 62, 58, 75, 83, 70, 88], labels: ["M","T","W","T","F","S","S"],  sub: "Last 7 sessions" },
  month: { bars: [50,55,60,65,70,72,80,75,83,65,78,83,86,88], labels: ["W1","","W2","","W3","","W4","","W5","","W6","","W7",""], sub: "Last 14 sessions" },
  all:   { bars: [40,48,55,62,68,72,76,80,83,85,82,88,86,90], labels: Array.from({length:14},(_,i)=>i+1), sub: "Overall trend" },
};

function BarChart({ tf }) {
  const { bars, labels, sub } = BAR_DATA[tf];
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setAnimated(false); const t = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(t); }, [tf]);
  return (
    <div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>{sub}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 110 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: "100%", borderRadius: "4px 4px 0 0",
                background: i === bars.length - 1 ? "#374151" : "#111",
                height: animated ? `${(h / 100) * 105}px` : "0px",
                transition: `height 0.9s cubic-bezier(.22,1,.36,1) ${i * 55}ms`,
                minHeight: animated ? 4 : 0,
              }}
            />
            <span style={{ fontSize: 10, color: "#d1d5db", fontWeight: 600 }}>{labels[i]}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "#e5e7eb", fontWeight: 600 }}>
        <span>0%</span><span>50%</span><span>100%</span>
      </div>
    </div>
  );
}

// ─── HEATMAP ──────────────────────────────────────────────────────
function Heatmap() {
  const cells = Array.from({ length: 98 }, () => {
    if (Math.random() < 0.3) return 0;
    return Math.floor(Math.random() * 5);
  });
  const colors = ["#f3f4f6","#d1d5db","#6b7280","#374151","#111"];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 4, marginTop: 16 }}>
        {cells.map((v, i) => (
          <div
            key={i} title={`${v} session${v !== 1 ? "s" : ""}`}
            style={{ aspectRatio: "1", borderRadius: 3, background: colors[v], cursor: "default", transition: "transform .15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.35)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
        <span>Less</span>
        {colors.map((c, i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />)}
        <span>More</span>
      </div>
    </div>
  );
}

// ─── GOAL RING ────────────────────────────────────────────────────
function GoalRing({ pct }) {
  const [animated, setAnimated] = useState(false);
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => { setAnimated(true); }, 400);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!animated) return;
    let cur = 0;
    const target = pct;
    const timer = setInterval(() => {
      cur += 2;
      if (cur >= target) { setDisplayed(target); clearInterval(timer); }
      else setDisplayed(cur);
    }, 25);
    return () => clearInterval(timer);
  }, [animated, pct]);

  const r = 50, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={r} fill="none" stroke="#f0f0f0" strokeWidth={9} />
        <circle
          cx={60} cy={60} r={r} fill="none" stroke="#111" strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={animated ? `${circ * pct / 100} ${circ * (1 - pct / 100)}` : `0 ${circ}`}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{displayed}%</div>
        <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".1em" }}>weekly</div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function ProgressPage() {
  const [activeModule, setActiveModule] = useState(0);
  const [tf, setTf] = useState("week");
  const [heroVisible, setHeroVisible] = useState(false);
  const [showCounters, setShowCounters] = useState(false);

  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 80);
    setTimeout(() => setShowCounters(true), 300);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Noto+Sans+Sinhala:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .sinhala { font-family: 'Noto Sans Sinhala', sans-serif !important; }
        .font-display { font-family: 'Nunito', sans-serif; font-weight: 800; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }

        .anim-fade-up  { animation: fadeUp  0.65s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in  { animation: fadeIn  0.5s ease both; }
        .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.18s; }
        .delay-3 { animation-delay: 0.28s; }
        .delay-4 { animation-delay: 0.38s; }
        .delay-5 { animation-delay: 0.48s; }
        .delay-6 { animation-delay: 0.60s; }

        .hover-lift { transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease; }
        .hover-lift:hover { transform: translateY(-4px) scale(1.015); box-shadow: 0 20px 56px rgba(0,0,0,.12); }

        .module-card-transition { transition: all .3s cubic-bezier(.22,1,.36,1); }
        .module-card-transition:hover { border-color: #111 !important; box-shadow: 0 16px 48px rgba(0,0,0,.1); transform: translateY(-4px); }
        .letter-btn { transition: transform .15s ease; }
        .letter-btn:hover { transform: scale(1.18) !important; }
        .tf-btn { transition: all .2s ease; }
        .heat-cell { transition: transform .15s ease; }
        .heat-cell:hover { transform: scale(1.35); }
        .activity-item { transition: background .2s ease; }
        .activity-item:hover { background: #f9fafb; }
      `}</style>

      {/* Navbar height 64px nam */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 80px" }}>
            
        {/* ─── HERO HEADER ─── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span className={`anim-fade-in delay-1`} style={{ display: "inline-block", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid #111", padding: "4px 14px", borderRadius: 4, marginBottom: 18 }}>
              Sinhala Learning System · Progress
            </span>
            <h1 className={`font-display anim-fade-up delay-2`} style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.08, marginBottom: 10, color: "#111" }}>
              Your <em style={{ fontStyle: "normal", textDecoration: "underline", textDecorationThickness: 2, textUnderlineOffset: 5 }}>Progress</em>,{" "}
              <span style={{ display: "block" }}>All in One Place</span>
            </h1>
            <p className={`anim-fade-up delay-3`} style={{ fontSize: 14, color: "#6b7280", maxWidth: 420, lineHeight: 1.7 }}>
              Track every letter, game, tracing session and sentence — across all 4 learning modules.
            </p>
          </div>
          <div className={`anim-fade-in delay-2`} style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#d1d5db", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>Last updated</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{today}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
              {["week", "month", "all"].map(t => (
                <button
                  key={t} onClick={() => setTf(t)}
                  className="tf-btn"
                  style={{
                    padding: "5px 12px", borderRadius: 8, border: "1px solid",
                    borderColor: tf === t ? "#111" : "#e5e7eb",
                    background: tf === t ? "#111" : "#fff",
                    color: tf === t ? "#fff" : "#6b7280",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  {t === "week" ? "Week" : t === "month" ? "Month" : "All Time"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── STREAK BAR ─── */}
        <div className="anim-fade-up delay-3" style={{ display: "flex", alignItems: "center", gap: 20, background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 18, padding: "14px 24px", marginBottom: 36, flexWrap: "wrap" }}>
          <div style={{ fontSize: 26 }}>🔥</div>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".12em" }}>Current streak</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>7 days</div>
          </div>
          <div style={{ width: 1, height: 36, background: "#e5e7eb" }} />
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".12em" }}>Best streak</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>14 days</div>
          </div>
          <div style={{ width: 1, height: 36, background: "#e5e7eb" }} />
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".12em" }}>Total sessions</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{showCounters ? <AnimatedCounter value={68} /> : "0"}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280" }}>Keep it up! Practice again today ✦</div>
        </div>

        {/* ─── MODULE CARDS ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: 22 }}>4 Modules</h2>
          <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
          <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".14em" }}>overview</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
          {MODULES.map((mod, i) => {
            const isActive = activeModule === i;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveModule(i)}
                className={`module-card-transition anim-fade-up delay-${i + 2}`}
                style={{
                  border: `1.5px solid ${isActive ? "#111" : "#e5e7eb"}`,
                  borderRadius: 20,
                  padding: 24,
                  background: isActive ? "#111" : "#fff",
                  color: isActive ? "#fff" : "#111",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22, background: isActive ? "rgba(255,255,255,.15)" : "#f3f4f6" }}>
                  {mod.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{mod.name}</div>
                <div style={{ fontSize: 11, color: isActive ? "#9ca3af" : "#9ca3af", marginBottom: 14 }}>{mod.sub}</div>
                <div style={{ height: 4, background: isActive ? "rgba(255,255,255,.15)" : "#f0f0f0", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                  <div
                    style={{
                      height: "100%", borderRadius: 2,
                      background: isActive ? "#fff" : "#111",
                      width: `${mod.pct}%`,
                      transition: "width 1.2s cubic-bezier(.22,1,.36,1)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{showCounters ? <AnimatedCounter value={mod.pct} suffix="%" /> : "0%"}</div>
                  <div style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, border: `1px solid ${isActive ? "rgba(255,255,255,.3)" : "#e5e7eb"}`, color: isActive ? "rgba(255,255,255,.7)" : "#6b7280", fontWeight: 600 }}>
                    {mod.badge}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── STAT STRIP ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 40 }}>
          {[
            { label: "Total Points",      value: 2840, suffix: "",    dark: true,  delta: "+320 this week" },
            { label: "Accuracy",          value: 83,   suffix: "%",   dark: false, delta: "+5% vs last week" },
            { label: "Letters Mastered",  value: 42,   suffix: "/60", dark: false, delta: "4 this week" },
            { label: "Stars Earned",      value: 186,  suffix: "",    dark: false, delta: "+22 this week" },
            { label: "Tracing Warnings",  value: 12,   suffix: "",    dark: false, delta: "↓ improving" },
          ].map((s, i) => (
            <div
              key={i}
              className={`hover-lift anim-fade-up delay-${i + 1}`}
              style={{
                borderRadius: 20,
                padding: "24px 20px",
                border: `1.5px solid ${s.dark ? "#111" : "#e5e7eb"}`,
                background: s.dark ? "#111" : "#fff",
                color: s.dark ? "#fff" : "#111",
              }}
            >
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".16em", color: "#9ca3af", marginBottom: 10 }}>{s.label}</div>
              <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
                {showCounters ? <AnimatedCounter value={s.value} suffix={s.suffix} /> : "0"}
              </div>
              <div style={{ fontSize: 11, marginTop: 8, color: "#6b7280" }}>
                <span style={{ color: s.dark ? "#9ca3af" : "#16a34a" }}>↑ </span>{s.delta}
              </div>
            </div>
          ))}
        </div>

        {/* ─── CHARTS ROW ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
          {/* Bar chart */}
          <div className="anim-scale-in delay-3" style={{ border: "1.5px solid #e5e7eb", borderRadius: 20, padding: 24, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Accuracy Trend</div>
            </div>
            <BarChart tf={tf} />
          </div>

          {/* Ring chart */}
          <div className="anim-scale-in delay-4" style={{ border: "1.5px solid #e5e7eb", borderRadius: 20, padding: 24, background: "#fff" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Module Completion</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {MODULES.map((mod, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <RingProgress pct={mod.pct} color={mod.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{mod.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{mod.pct}% complete</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{mod.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── WEEKLY GOAL ─── */}
        <div className="anim-scale-in delay-3" style={{ border: "1.5px solid #e5e7eb", borderRadius: 20, padding: 28, marginBottom: 40, display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
          <GoalRing pct={60} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Weekly Goal</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 18, lineHeight: 1.7 }}>
              Complete 5 sessions this week to maintain your streak and unlock a new achievement.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { done: true,  text: "Letter practice — 2 sessions" },
                { done: true,  text: "Tracing — cover 5 new letters" },
                { done: true,  text: "Play 1 game" },
                { done: false, text: "Write 3 guided sentences" },
                { done: false, text: "Picture activity — 1 picture" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    background: item.done ? "#111" : "transparent",
                    border: item.done ? "none" : "1.5px solid #e5e7eb",
                  }}>
                    {item.done && (
                      <svg width={11} height={11} viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontWeight: item.done ? 600 : 400, color: item.done ? "#111" : "#9ca3af" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── HEATMAP ─── */}
        <div className="anim-scale-in delay-4" style={{ border: "1.5px solid #e5e7eb", borderRadius: 20, padding: 24, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Activity Heatmap</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Daily practice — last 14 weeks</div>
          </div>
          <Heatmap />
        </div>

        {/* ─── LETTER COVERAGE ─── */}
        <div className="anim-scale-in delay-3" style={{ border: "1.5px solid #e5e7eb", borderRadius: 20, padding: 24, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Sinhala Letter Coverage</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>42 mastered · 12 in progress · 6 not started</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 11, color: "#9ca3af" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, background: "#111", borderRadius: 3, display: "inline-block" }} />Mastered
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, background: "#f3f4f6", border: "1.5px solid #6b7280", borderRadius: 3, display: "inline-block" }} />In progress
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 3, display: "inline-block" }} />Not started
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
            {SINHALA_LETTERS.slice(0, 60).map((l, i) => {
              const state = LETTER_STATE[i] || "";
              return (
                <div
                  key={i}
                  className="sinhala letter-btn"
                  title={l}
                  style={{
                    width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, cursor: "default",
                    border: `1.5px solid ${state === "mastered" ? "#111" : state === "in-progress" ? "#6b7280" : "#e5e7eb"}`,
                    background: state === "mastered" ? "#111" : state === "in-progress" ? "#f3f4f6" : "#f9fafb",
                    color: state === "mastered" ? "#fff" : "#374151",
                  }}
                >
                  {l}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── ACHIEVEMENTS ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: 22 }}>Achievements</h2>
          <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
          <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".14em" }}>3 unlocked</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 40 }}>
          {ACHIEVEMENTS.map((a, i) => (
            <div
              key={i}
              className={`anim-fade-up delay-${(i % 4) + 2}`}
              style={{
                border: `1.5px solid ${a.unlocked ? "#111" : "#e5e7eb"}`,
                borderRadius: 16,
                padding: "20px 16px",
                textAlign: "center",
                position: "relative",
                background: a.unlocked ? "#f9fafb" : "#fff",
                opacity: a.unlocked ? 1 : 0.45,
              }}
            >
              {a.unlocked && (
                <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, background: "#111", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={10} height={10} viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                </div>
              )}
              <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>{a.desc}</div>
            </div>
          ))}
        </div>

        {/* ─── RECENT ACTIVITY ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: 22 }}>Recent Activity</h2>
          <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
        </div>

        <div className="anim-scale-in delay-2" style={{ border: "1.5px solid #e5e7eb", borderRadius: 20, padding: "8px 24px", marginBottom: 40 }}>
          {ACTIVITIES.map((a, i) => (
            <div
              key={i}
              className="activity-item"
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 0",
                borderBottom: i < ACTIVITIES.length - 1 ? "1px solid #f3f4f6" : "none",
                borderRadius: 8,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.dot, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 13 }}>{a.text}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{a.time}</div>
              <div style={{
                fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                flexShrink: 0, ...a.scoreStyle,
              }}>{a.score}</div>
            </div>
          ))}
        </div>

        {/* ─── GAME SCORES ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: 22 }}>Game Scores</h2>
          <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 40 }}>
          {[
            { name: "Memory Match",   best: 120,  max: 120,  icon: "🧠", played: true  },
            { name: "Speed Quiz",     best: 145,  max: 150,  icon: "⚡", played: true  },
            { name: "Letter Hunt",    best: 180,  max: 200,  icon: "🎯", played: true  },
            { name: "Letter Puzzle",  best: 220,  max: 250,  icon: "🧩", played: true  },
            { name: "Word Builder",   best: 300,  max: 360,  icon: "🔤", played: true  },
            { name: "Missing Letter", best: 260,  max: 360,  icon: "🔑", played: true  },
            { name: "Line Connect",   best: 340,  max: 360,  icon: "🔗", played: true  },
            { name: "Word Unscramble",best: 0,    max: 360,  icon: "🔀", played: false },
          ].map((g, i) => {
            const pct = g.max > 0 ? Math.round((g.best / g.max) * 100) : 0;
            return (
              <div
                key={i}
                className={`hover-lift anim-fade-up delay-${(i % 4) + 1}`}
                style={{ border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "18px 20px", background: g.played ? "#fff" : "#f9fafb", opacity: g.played ? 1 : 0.6 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{g.name}</span>
                </div>
                <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, background: pct >= 90 ? "#16a34a" : "#111", width: `${pct}%`, transition: "width 1s cubic-bezier(.22,1,.36,1)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#9ca3af" }}>{g.played ? `${g.best} / ${g.max} pts` : "Not played"}</span>
                  <span style={{ fontWeight: 800, color: pct >= 90 ? "#16a34a" : "#111" }}>{g.played ? `${pct}%` : "—"}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── NEXT LESSON ─── */}
        <div className="anim-scale-in delay-3" style={{ background: "#111", color: "#fff", borderRadius: 20, padding: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em", color: "#6b7280", marginBottom: 8 }}>Up next</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>ත · Dental Tha group</div>
            <div className="sinhala" style={{ fontSize: 13, color: "#6b7280" }}>ත ථ ද ධ න — 5 letters · Medium difficulty</div>
          </div>
          <button
            style={{
              background: "#fff", color: "#111", border: "none",
              padding: "12px 28px", borderRadius: 14,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
              transition: "all .2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Continue Learning →
          </button>
        </div>

      </div>
    </div>
  );
}