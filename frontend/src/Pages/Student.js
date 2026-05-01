import { useState, useEffect, useRef } from "react";

const LETTERS = ["අ","ආ","ඇ","ඈ","ක","ග","ත","ද","න","ම","ය","ල","ව","ස"];

// Navbar height (h-16 = 64px fixed)
const HEADER_HEIGHT = 64;

const AnimatedStroke = ({ d, delay = 0 }) => (
  <path
    d={d}
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    strokeLinecap="round"
    style={{
      strokeDasharray: 300,
      strokeDashoffset: 300,
      animation: `drawStroke 2s cubic-bezier(0.4,0,0.2,1) ${delay}s forwards`,
    }}
  />
);

export default function SinhalaRegistration() {
  const [floaters, setFloaters] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [form, setForm] = useState({ firstName:"", lastName:"", age:"", grade:"", school:"" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    // Random floaters — same as original
    const items = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      letter: LETTERS[i % LETTERS.length],
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 40 + 18,
      opacity: Math.random() * 0.08 + 0.03,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    }));
    setFloaters(items);

    intervalRef.current = setInterval(() => setActiveIdx(i => (i + 1) % LETTERS.length), 1800);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: false }));
  };

  const handleSubmit = () => {
    const newErrors = {};
    Object.entries(form).forEach(([k, v]) => { if (!v.trim()) newErrors[k] = true; });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setSubmitted(true);
  };

  const reset = () => {
    setForm({ firstName:"", lastName:"", age:"", grade:"", school:"" });
    setErrors({});
    setSubmitted(false);
  };

  const stats = [
    { label: "ශිෂ්‍යයන්", value: "12K+", en: "Students" },
    { label: "අකුරු",    value: "58",   en: "Letters"  },
    { label: "ශ්‍රේණි",  value: "1–5",  en: "Grades"   },
  ];

  const tickerLetters = [...LETTERS, ...LETTERS];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Noto+Sans+Sinhala:wght@400;600;700&display=swap');

        @keyframes drawStroke {
          to { stroke-dashoffset: 0; }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform: translateY(32px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity:0; transform: translateX(-24px); }
          to   { opacity:1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity:0; transform: scale(0.7); }
          to   { opacity:1; transform: scale(1); }
        }
        @keyframes breatheGlow {
          0%,100% { transform: scale(1);    opacity: 0.12; }
          50%      { transform: scale(1.05); opacity: 0.18; }
        }
        @keyframes tickerMove {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes charSwap {
          0%       { opacity:0; transform: translateY(12px)  scale(0.85); }
          20%,80%  { opacity:1; transform: translateY(0)     scale(1);    }
          100%     { opacity:0; transform: translateY(-12px) scale(0.85); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes dotPulse {
          0%,100% { transform: scale(1);   }
          50%     { transform: scale(1.4); }
        }
        @keyframes slideIn {
          from { opacity:0; transform: translateY(14px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-mono-dm   { font-family: 'DM Mono', monospace; }
        .font-sinhala   { font-family: 'Noto Sans Sinhala', serif; }

        .ticker-track {
          display: flex; gap: 40px; white-space: nowrap;
          animation: tickerMove 18s linear infinite;
          width: max-content;
        }
        .char-animate { animation: charSwap 1.8s ease forwards; }

        .underline-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #d0d0d0;
          border-radius: 0;
          outline: none;
          padding: 8px 0 6px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #111;
          transition: border-color .2s;
          appearance: none;
          -webkit-appearance: none;
        }
        .underline-input::placeholder { color: #c8c8c8; }
        .underline-input:focus { border-bottom-color: #111; }
        .underline-input.error { border-bottom-color: #e24b4a; }

        .underline-select {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #d0d0d0;
          border-radius: 0;
          outline: none;
          padding: 8px 24px 6px 0;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #111;
          cursor: pointer;
          transition: border-color .2s;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 2px center;
        }
        .underline-select:focus { border-bottom-color: #111; }
        .underline-select.error { border-bottom-color: #e24b4a; }
        .underline-select option { background: white; color: #111; }
      `}</style>

      <div className="font-mono-dm" style={{ background:"#f5f3ee", minHeight:"100vh", display:"flex", flexDirection:"column" }}>

        {/* ═══════════════════════════════════════
            HERO BANNER — original SinhalaHeroPanel
            ═══════════════════════════════════════ */}
        <div style={{
          width:"100%",
          background:"#080808",
          position:"relative",
          overflow:"hidden",
          display:"flex",
          flexDirection:"column",
          justifyContent:"space-between",
          paddingTop: HEADER_HEIGHT,
          flexShrink: 0,
        }}>

          {/* Noise texture overlay */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            pointerEvents:"none", zIndex:0, opacity:0.6,
          }} />

          {/* Radial glow */}
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            transform:"translate(-50%,-50%)",
            width:"120%", height:"120%",
            background:"radial-gradient(ellipse at 40% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
            pointerEvents:"none", zIndex:0,
            animation:"breatheGlow 8s ease-in-out infinite",
          }} />

          {/* Floating background letters */}
          {floaters.map(f => (
            <span
              key={f.id}
              className="font-sinhala"
              style={{
                position:"absolute",
                left:`${f.x}%`, top:`${f.y}%`,
                fontSize: f.size,
                color:`rgba(255,255,255,${f.opacity})`,
                userSelect:"none", pointerEvents:"none", zIndex:1,
                animation:`floatY ${f.duration}s ease-in-out ${f.delay}s infinite`,
              }}
            >{f.letter}</span>
          ))}

          {/* Top bar */}
          <div style={{
            position:"relative", zIndex:10,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"28px 40px 0",
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fadeSlideUp 0.6s ease 0.1s both" : "none",
          }}>
            <div className="font-mono-dm" style={{ fontSize:10, letterSpacing:3, color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>
              සිංහල · SLH
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: i===0 ? 28 : 8, height:3,
                  background: i===0 ? "white" : "rgba(255,255,255,0.2)",
                  transition:"all 0.3s",
                }} />
              ))}
            </div>
          </div>

          {/* Main content */}
          <div style={{
            position:"relative", zIndex:10,
            padding:"0 40px",
            flex:1,
            display:"flex", flexDirection:"column", justifyContent:"center",
          }}>
            {/* Badge */}
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8, marginBottom:28,
              opacity: mounted ? 1 : 0,
              animation: mounted ? "fadeSlideLeft 0.7s ease 0.2s both" : "none",
            }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"white", animation:"dotPulse 2s ease-in-out infinite" }} />
              <span className="font-mono-dm" style={{ fontSize:10, color:"rgba(255,255,255,0.5)", letterSpacing:3, textTransform:"uppercase" }}>
                Handwriting System · v2.0
              </span>
            </div>

            {/* SVG stroke + big bg letter */}
            <div style={{
              position:"relative", marginBottom:20,
              opacity: mounted ? 1 : 0,
              animation: mounted ? "scaleIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both" : "none",
            }}>
              {/* Giant bg letter */}
              <div className="font-sinhala" style={{
                fontSize:"clamp(90px,22vw,160px)",
                color:"rgba(255,255,255,0.08)",
                lineHeight:1,
                position:"absolute", top:"50%", left:"50%",
                transform:"translate(-50%,-50%)",
                pointerEvents:"none", userSelect:"none", zIndex:0,
              }}>
                {LETTERS[activeIdx]}
              </div>

              {/* SVG handwriting stroke */}
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ position:"relative", zIndex:2 }}>
                <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <AnimatedStroke d="M 30 60 Q 60 20 90 60" delay={0.4} />
                <AnimatedStroke d="M 30 60 Q 60 100 90 60" delay={0.8} />
                <AnimatedStroke d="M 60 20 L 60 100" delay={1.2} />
                <circle cx="60" cy="60" r="4" fill="white" opacity={0.6} style={{ animation:"dotPulse 3s ease-in-out infinite" }} />
              </svg>
            </div>

            {/* Active letter badge */}
            <div style={{
              display:"inline-flex", alignItems:"center", gap:12, marginBottom:24,
              opacity: mounted ? 1 : 0,
              animation: mounted ? "fadeSlideUp 0.7s ease 0.5s both" : "none",
            }}>
              <div style={{
                width:48, height:48,
                border:"1.5px solid rgba(255,255,255,0.2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                position:"relative", overflow:"hidden",
              }}>
                <span
                  key={activeIdx}
                  className="font-sinhala char-animate"
                  style={{ fontSize:24, color:"white" }}
                >{LETTERS[activeIdx]}</span>
              </div>
              <div>
                <div className="font-mono-dm" style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>
                  Current Letter
                </div>
                <div className="font-mono-dm" style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>
                  Sinhala Alphabet
                </div>
              </div>
            </div>

            {/* Title */}
            <div style={{
              opacity: mounted ? 1 : 0,
              animation: mounted ? "fadeSlideUp 0.8s ease 0.35s both" : "none",
              marginBottom:16,
            }}>
              <h1 className="font-cormorant" style={{
                fontSize:"clamp(36px,8vw,58px)",
                fontWeight:700, color:"white",
                lineHeight:1.05, letterSpacing:"-1px",
              }}>
                Sinhala Letter<br/>
                <span style={{ color:"rgba(255,255,255,0.35)", fontWeight:400, fontStyle:"italic" }}>
                  &amp; Handwriting
                </span><br/>
                Helper System
              </h1>
            </div>

            {/* Divider */}
            <div style={{
              height:1, background:"rgba(255,255,255,0.1)", marginBottom:20,
              opacity: mounted ? 1 : 0,
              animation: mounted ? "lineGrow 1s ease 0.6s both" : "none",
              transformOrigin:"left",
            }} />

            {/* Description */}
            <p className="font-mono-dm" style={{
              fontSize:11, color:"rgba(255,255,255,0.4)", lineHeight:1.9,
              letterSpacing:0.5, maxWidth:280,
              opacity: mounted ? 1 : 0,
              animation: mounted ? "fadeSlideUp 0.8s ease 0.7s both" : "none",
              marginBottom:36,
            }}>
              An intelligent learning platform for young students to master the beautiful Sinhala script through guided handwriting practice.
            </p>

            {/* Stats */}
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(3,1fr)",
              gap:1, background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.08)",
              opacity: mounted ? 1 : 0,
              animation: mounted ? "fadeSlideUp 0.8s ease 0.85s both" : "none",
              marginBottom:0,
            }}>
              {stats.map((s,i) => (
                <div key={i} style={{
                  padding:"18px 16px", background:"#080808",
                  borderRight: i<2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  textAlign:"center",
                }}>
                  <div className="font-cormorant" style={{ fontSize:26, fontWeight:700, color:"white", lineHeight:1, marginBottom:4 }}>{s.value}</div>
                  <div className="font-sinhala" style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>{s.label}</div>
                  <div className="font-mono-dm" style={{ fontSize:9, color:"rgba(255,255,255,0.2)", letterSpacing:1, textTransform:"uppercase" }}>{s.en}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom ticker */}
          <div style={{
            position:"relative", zIndex:10,
            borderTop:"1px solid rgba(255,255,255,0.07)",
            padding:"14px 0", overflow:"hidden",
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fadeSlideUp 0.6s ease 1s both" : "none",
          }}>
            <div className="ticker-track">
              {tickerLetters.map((l,i) => (
                <span key={i} className="font-sinhala" style={{ fontSize:14, color:"rgba(255,255,255,0.18)", letterSpacing:2 }}>
                  {l} ·
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* ═══════════════ END HERO ═══════════════ */}

        {/* ── FORM AREA ── */}
        <div style={{ flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"48px 24px 56px", background:"#ffffff" }}>
          <div style={{ width:"100%", maxWidth:540, animation: mounted ? "slideIn .8s cubic-bezier(.16,1,.3,1) .15s both" : "none" }}>

            {!submitted ? (
              <>
                <div style={{ fontSize:9, letterSpacing:3, color:"#aaa", textTransform:"uppercase", marginBottom:8 }}>Student Enrollment</div>
                <h2 className="font-cormorant" style={{ fontSize:30, fontWeight:700, color:"#111", lineHeight:1.1, marginBottom:6 }}>Create your account</h2>
                <p style={{ fontSize:10, color:"#bbb", letterSpacing:.3, lineHeight:1.8, marginBottom:36 }}>
                  Fill in your details below to begin your Sinhala learning journey.
                </p>

                {/* Row 1 */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, marginBottom:28 }}>
                  <div>
                    <label style={{ display:"block", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#999", marginBottom:4 }}>First Name</label>
                    <input
                      className={`underline-input${errors.firstName?" error":""}`}
                      type="text" placeholder="Kasun"
                      value={form.firstName}
                      onChange={e => handleChange("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#999", marginBottom:4 }}>Last Name</label>
                    <input
                      className={`underline-input${errors.lastName?" error":""}`}
                      type="text" placeholder="Perera"
                      value={form.lastName}
                      onChange={e => handleChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, marginBottom:28 }}>
                  <div>
                    <label style={{ display:"block", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#999", marginBottom:4 }}>Age</label>
                    <input
                      className={`underline-input${errors.age?" error":""}`}
                      type="number" min="4" max="14" placeholder="8"
                      value={form.age}
                      onChange={e => handleChange("age", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#999", marginBottom:4 }}>Grade</label>
                    <select
                      className={`underline-select${errors.grade?" error":""}`}
                      value={form.grade}
                      onChange={e => handleChange("grade", e.target.value)}
                    >
                      <option value="" disabled>Select grade</option>
                      <option value="1">Grade 1</option>
                      <option value="2">Grade 2</option>
                      <option value="3">Grade 3</option>
                      <option value="4">Grade 4</option>
                      <option value="5">Grade 5</option>
                    </select>
                  </div>
                </div>

                {/* Row 3 */}
                <div style={{ marginBottom:40 }}>
                  <label style={{ display:"block", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#999", marginBottom:4 }}>School Name</label>
                  <input
                    className={`underline-input${errors.school?" error":""}`}
                    type="text" placeholder="Ananda College, Colombo"
                    value={form.school}
                    onChange={e => handleChange("school", e.target.value)}
                  />
                </div>

                <div style={{ height:1, background:"#f0f0f0", marginBottom:24 }} />

                <button
                  onClick={handleSubmit}
                  style={{
                    width:"100%", height:48, background:"#111", color:"white",
                    border:"none", borderRadius:4, cursor:"pointer",
                    fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:2.5, textTransform:"uppercase",
                    transition:"background .2s",
                  }}
                  onMouseEnter={e => e.target.style.background="#333"}
                  onMouseLeave={e => e.target.style.background="#111"}
                >
                  Register Student →
                </button>
                <p style={{ marginTop:14, fontSize:9, color:"#ccc", letterSpacing:1, textAlign:"center" }}>Your information is kept private and secure.</p>
              </>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:16, padding:"24px 0", animation:"slideIn .6s ease both" }}>
                <div style={{ width:58, height:58, border:"2px solid #111", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span className="font-cormorant" style={{ fontSize:22, fontWeight:700, color:"#111" }}>✓</span>
                </div>
                <div className="font-cormorant" style={{ fontSize:28, fontWeight:700, color:"#111" }}>Welcome, {form.firstName} {form.lastName}!</div>
                <p style={{ fontSize:11, color:"#aaa", letterSpacing:.4, lineHeight:1.8 }}>
                  Age {form.age} · Grade {form.grade} · {form.school}<br/>
                  Registration complete. Your Sinhala journey begins now.
                </p>
                <button
                  onClick={reset}
                  style={{
                    marginTop:8, background:"none", border:"1px solid #ccc", borderRadius:4,
                    padding:"10px 28px", fontFamily:"'DM Mono',monospace", fontSize:10,
                    letterSpacing:2, textTransform:"uppercase", color:"#888", cursor:"pointer",
                    transition:"border-color .2s, color .2s",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor="#111"; e.target.style.color="#111"; }}
                  onMouseLeave={e => { e.target.style.borderColor="#ccc"; e.target.style.color="#888"; }}
                >
                  Register Another
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}