import { useState, useRef, useEffect } from "react";

/* ── Scroll-reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── Animated counter ── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    const isFloat = target.toString().includes(".");
    const end = parseFloat(target);
    const duration = 1400;
    const step = 16;
    const steps = duration / step;
    let i = 0;
    const t = setInterval(() => {
      i++;
      const val = Math.min(end * (i / steps), end);
      setCount(isFloat ? val.toFixed(1) : Math.floor(val));
      if (i >= steps) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [visible, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Reveal wrapper ── */
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const OVERVIEW_CARDS = [
  {
    emoji: "⚠️",
    accent: "#FF6B6B",
    bg: "#FFF5F5",
    label: "Problem Statement",
    desc: "Manual recognition of Sinhala handwritten characters is error-prone and time-consuming. Smart OCR solutions for the Sinhala script have historically been very scarce.",
  },
  {
    emoji: "✨",
    accent: "#6C63FF",
    bg: "#F5F4FF",
    label: "Proposed Solution",
    desc: "A deep learning CNN model that automatically detects and predicts Sinhala letters from uploaded images with high confidence and minimal preprocessing overhead.",
  },
  {
    emoji: "🛠",
    accent: "#00C896",
    bg: "#F0FFF9",
    label: "Technologies Used",
    desc: "Python, TensorFlow / Keras, Convolutional Neural Networks, advanced image preprocessing pipelines, and a responsive React frontend interface.",
  },
];

const USE_CASES = [
  { accent: "#6C63FF", icon: "📚", title: "Education Technology", desc: "Enable smart tools that assist students in reading and writing the Sinhala script with instant AI-powered feedback." },
  { accent: "#FF6B6B", icon: "📄", title: "Document Digitization", desc: "Convert stacks of handwritten Sinhala manuscripts and historical records into fully searchable digital formats." },
  { accent: "#00C896", icon: "🔍", title: "Smart OCR Systems", desc: "Power next-generation OCR pipelines with native support for the unique curves and strokes of Sinhala." },
  { accent: "#F59E0B", icon: "🏛", title: "Government & Archival", desc: "Support public sector digitization of legal documents, birth records, and cultural archives in Sinhala script." },
];

const STEPS = [
  { num: "01", accent: "#6C63FF", icon: "📤", title: "Upload Image", desc: "User uploads a photo or scanned image of handwritten Sinhala characters." },
  { num: "02", accent: "#00C896", icon: "⚙️", title: "Pre-processing", desc: "System normalizes, resizes and binarizes the image to remove noise." },
  { num: "03", accent: "#FF6B6B", icon: "🧠", title: "CNN Prediction", desc: "Trained CNN model processes the image and outputs a probability distribution." },
  { num: "04", accent: "#F59E0B", icon: "🎯", title: "Letter Output", desc: "Predicted Sinhala character displayed with confidence score and suggestions." },
];

const FEATURES = [
  { accent: "#6C63FF", icon: "⚡", title: "Real-time Prediction", desc: "Sub-second inference latency ensures near-instant character recognition." },
  { accent: "#00C896", icon: "✅", title: "High Accuracy Model", desc: "Trained on thousands of labelled samples to achieve industry-leading accuracy." },
  { accent: "#FF6B6B", icon: "🖼", title: "Image Preprocessing", desc: "Automated pipeline handles contrast, deskewing, noise removal and normalisation." },
  { accent: "#F59E0B", icon: "💾", title: "Sinhala Dataset", desc: "Model trained exclusively on curated Sinhala handwriting datasets." },
  { accent: "#EC4899", icon: "🔬", title: "Deep Learning CNN", desc: "Multi-layer convolutional architecture with batch normalisation and dropout." },
  { accent: "#14B8A6", icon: "💻", title: "User-friendly UI", desc: "Clean drag-and-drop interface requiring no technical knowledge whatsoever." },
];

const STATS = [
  { label: "Accuracy Rate", value: 97.4, suffix: "%", accent: "#6C63FF" },
  { label: "Dataset Size", value: 12000, suffix: "+", accent: "#00C896" },
  { label: "Training Epochs", value: 150, suffix: "", accent: "#FF6B6B" },
  { label: "Character Classes", value: 56, suffix: "", accent: "#F59E0B" },
];

const FUTURE = [
  { icon: "📱", accent: "#6C63FF", title: "Mobile App Integration", desc: "Native iOS & Android apps with on-device model inference for offline recognition." },
  { icon: "📷", accent: "#00C896", title: "Real-time Camera", desc: "Live video feed processing to recognise characters in real time via device camera." },
  { icon: "📊", accent: "#FF6B6B", title: "Larger Dataset", desc: "Expand training corpus with crowd-sourced and synthetic data for edge cases." },
  { icon: "🌐", accent: "#F59E0B", title: "Multi-language Support", desc: "Extend to Tamil, Devanagari and other South Asian scripts via transfer learning." },
];

export default function App() {
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target.result);
      setAnalyzing(true);
      setTimeout(() => { setAnalyzing(false); setUploaded(true); }, 1800);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => { setUploaded(false); setImgSrc(null); setAnalyzing(false); };
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#fff", color: "#111", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        .hero-glow{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(108,99,255,0.12) 0%,transparent 70%);pointer-events:none}
        .tag{display:inline-flex;align-items:center;gap:6px;background:#F5F4FF;color:#6C63FF;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 14px;border-radius:100px;border:1px solid rgba(108,99,255,.18)}
        .btn-primary{background:#6C63FF;color:#fff;border:none;padding:14px 32px;border-radius:100px;font-weight:800;font-size:14px;cursor:pointer;letter-spacing:.02em;transition:transform .2s,box-shadow .2s,background .2s}
        .btn-primary:hover{background:#5a52e0;transform:translateY(-2px);box-shadow:0 12px 32px rgba(108,99,255,.35)}
        .btn-outline{background:#fff;color:#111;border:2px solid #e5e7eb;padding:14px 32px;border-radius:100px;font-weight:800;font-size:14px;cursor:pointer;transition:transform .2s,border-color .2s}
        .btn-outline:hover{border-color:#6C63FF;color:#6C63FF;transform:translateY(-2px)}
        .fcard{border:1.5px solid #f0f0f0;border-radius:20px;background:#fff;padding:28px;transition:transform .25s,box-shadow .25s,border-color .25s}
        .fcard:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,.09);border-color:#e0dcff}
        .section-label{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6C63FF;margin-bottom:10px}
        .section-title{font-size:clamp(26px,4vw,40px);font-weight:900;line-height:1.2;letter-spacing:-.02em;color:#111}
        .stat-card{border-radius:20px;padding:32px 28px;border:1.5px solid #f0f0f0;transition:transform .2s,box-shadow .2s}
        .stat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.08)}
        .step-dot{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;transition:transform .2s}
        .step-dot:hover{transform:scale(1.1)}
        .upload-zone{border:2.5px dashed #d1d5db;border-radius:24px;min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;cursor:pointer;transition:border-color .2s,background .2s;padding:40px 24px;text-align:center}
        .upload-zone.active{border-color:#6C63FF;background:#F5F4FF}
        .upload-zone:hover{border-color:#6C63FF}
        .chip{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700}
        .pulse{animation:pulse 2s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .bar-fill{animation:fillBar 1.4s ease forwards}
        @keyframes fillBar{from{width:0}to{width:var(--w)}}
        .hero-char{font-size:72px;font-weight:900;line-height:1;letter-spacing:-.04em;background:linear-gradient(135deg,#6C63FF,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .gradient-border{border:2px solid transparent;background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,#6C63FF,#00C896) border-box;border-radius:20px}
        @media(max-width:768px){.hide-mobile{display:none!important}.stack{flex-direction:column!important}.full-w{width:100%!important}}
      `}</style>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div className="hero-glow" style={{ top: "-100px", right: "-100px" }} />
        <div className="hero-glow" style={{ bottom: "-200px", left: "-150px", background: "radial-gradient(circle,rgba(0,200,150,.08) 0%,transparent 70%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}
          className="stack">
          {/* Left */}
          <div>
            <div className="tag" style={{ marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6C63FF", display: "inline-block" }} />
              AI · Deep Learning · OCR
            </div>
            <h1 style={{ fontSize: "clamp(36px,5vw,60px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-.03em", marginBottom: 20 }}>
              Sinhala<br />
              <span style={{ background: "linear-gradient(135deg,#6C63FF 0%,#EC4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Handwritten
              </span>
              <br />Letter Recognition
            </h1>
            <p style={{ fontSize: 17, color: "#6b7280", lineHeight: 1.75, maxWidth: 480, marginBottom: 36, fontWeight: 500 }}>
              AI-powered deep learning system that identifies Sinhala handwritten characters from images with high accuracy — bridging ancient script with modern technology.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => scrollTo("demo")}>
                🚀 Try Demo
              </button>
              <button className="btn-outline" onClick={() => scrollTo("features")}>
                View Features
              </button>
            </div>
            {/* trust bar */}
            <div style={{ display: "flex", gap: 24, marginTop: 48, flexWrap: "wrap" }}>
              {[["97.4%", "Accuracy"], ["12K+", "Samples"], ["56", "Characters"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#111" }}>{v}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 420, borderRadius: 28, background: "linear-gradient(145deg,#f8f7ff,#ffffff)", border: "1.5px solid #ede9ff", padding: 36, position: "relative", boxShadow: "0 40px 80px rgba(108,99,255,.12)" }}>
              {/* top accent */}
              <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 3, background: "linear-gradient(90deg,#6C63FF,#EC4899)", borderRadius: "0 0 8px 8px" }} />
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
                  {["ක", "ශ", "ට", "ම", "ල"].map((c, i) => (
                    <span key={c} style={{
                      fontSize: 32, fontWeight: 900, color: i === 2 ? "#fff" : "#6C63FF",
                      background: i === 2 ? "linear-gradient(135deg,#6C63FF,#EC4899)" : "rgba(108,99,255,.08)",
                      width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                      transform: i === 2 ? "scale(1.12)" : "scale(1)",
                      transition: "transform .2s",
                    }}>{c}</span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em" }}>Sinhala Character Set</p>
              </div>
              {/* confidence bar */}
              <div style={{ background: "#f8f7ff", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF" }}>ට — Predicted</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>97.4%</span>
                </div>
                <div style={{ height: 8, background: "#e9e7ff", borderRadius: 100 }}>
                  <div style={{ height: 8, background: "linear-gradient(90deg,#6C63FF,#EC4899)", borderRadius: 100, width: "97.4%" }} />
                </div>
              </div>
              <div style={{ background: "#f8f7ff", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#00C896" }}>ධ — 2nd match</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>1.8%</span>
                </div>
                <div style={{ height: 8, background: "#e0fff5", borderRadius: 100 }}>
                  <div style={{ height: 8, background: "#00C896", borderRadius: 100, width: "1.8%" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["CNN", "TensorFlow", "Keras", "Python"].map((t) => (
                  <span key={t} className="chip" style={{ background: "#f5f4ff", color: "#6C63FF", border: "1px solid rgba(108,99,255,.2)" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ── */}
      <section id="overview" style={{ padding: "96px 24px", background: "#fafafa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label">Project Overview</div>
            <h2 className="section-title" style={{ marginBottom: 56 }}>Understanding the core<br />of this project</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {OVERVIEW_CARDS.map((c, i) => (
              <Reveal key={c.label} delay={i * 100}>
                <div className="fcard" style={{ background: "#fff" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20, border: `1.5px solid ${c.accent}22` }}>
                    {c.emoji}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{c.label}</div>
                  <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, fontWeight: 500 }}>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section style={{ padding: "96px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label">Why It Matters</div>
            <h2 className="section-title" style={{ marginBottom: 56 }}>Real-world use cases<br />that drive impact</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {USE_CASES.map((u, i) => (
              <Reveal key={u.title} delay={i * 80}>
                <div className="fcard" style={{ cursor: "default", borderTop: `3px solid ${u.accent}` }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{u.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 8 }}>{u.title}</div>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, fontWeight: 500 }}>{u.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="process" style={{ padding: "96px 24px", background: "linear-gradient(135deg,#f8f7ff 0%,#f0fffe 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label">Process</div>
            <h2 className="section-title" style={{ marginBottom: 64 }}>How the system works</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24, position: "relative" }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 110}>
                <div style={{ textAlign: "center" }}>
                  <div className="step-dot" style={{ background: `${s.accent}18`, margin: "0 auto 20px", border: `2px solid ${s.accent}40` }}>
                    <span style={{ fontSize: 26 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: s.accent, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>Step {s.num}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#111", marginBottom: 10 }}>{s.title}</div>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, fontWeight: 500 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "96px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label">Core Features</div>
            <h2 className="section-title" style={{ marginBottom: 56 }}>Built for precision<br />and scale</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="fcard" style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: `1.5px solid ${f.accent}25` }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 6 }}>{f.title}</div>
                    <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65, fontWeight: 500 }}>{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATASET & MODEL ── */}
      <section style={{ padding: "96px 24px", background: "#fafafa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label">Dataset & Model</div>
            <h2 className="section-title" style={{ marginBottom: 64 }}>Built on rigorous<br />data science</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
            {[
              { color: "#6C63FF", icon: "📊", title: "Sinhala Handwritten Character Dataset", body: "Over 12,000 labelled samples spanning all 56 primary Sinhala characters, collected from multiple age groups and writing styles to maximise generalisation." },
              { color: "#00C896", icon: "🖼", title: "Image Preprocessing Techniques", body: "Grayscale conversion, adaptive thresholding, morphological cleaning, center-cropping and bicubic resizing to a fixed 64×64 input tensor." },
              { color: "#FF6B6B", icon: "🧠", title: "CNN Model Training", body: "Four convolutional blocks with ReLU, max-pooling and batch normalisation, followed by fully-connected layers with 50% dropout. Adam optimiser, 150 epochs." },
              { color: "#F59E0B", icon: "📈", title: "Model Evaluation Process", body: "5-fold stratified cross-validation. Metrics: top-1 accuracy, macro F1 score, confusion matrices. Final test-set accuracy exceeded 97% on held-out samples." },
            ].map((b, i) => (
              <Reveal key={b.title} delay={i * 90}>
                <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1.5px solid #f0f0f0", borderTop: `3px solid ${b.color}` }}>
                  <div style={{ fontSize: 24, marginBottom: 14 }}>{b.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 10 }}>{b.title}</div>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, fontWeight: 500 }}>{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "96px 24px", background: "#0f0e1a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#6C63FF", marginBottom: 10 }}>Model Performance</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#fff", letterSpacing: "-.02em", marginBottom: 64 }}>
              Numbers that speak<br />for themselves
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="stat-card" style={{ background: "#1a1829", border: `1.5px solid ${s.accent}30`, borderTop: `3px solid ${s.accent}` }}>
                  <div style={{ fontSize: "clamp(40px,5vw,56px)", fontWeight: 900, color: s.accent, lineHeight: 1, marginBottom: 10 }}>
                    <Counter target={parseFloat(s.value)} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".1em" }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" style={{ padding: "96px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label">Live Demo</div>
            <h2 className="section-title" style={{ marginBottom: 10 }}>Try it yourself</h2>
            <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 56, fontWeight: 500 }}>Upload a handwritten Sinhala character image and watch the model predict it instantly.</p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }} className="stack">
            {/* Upload */}
            <Reveal>
              <div
                className={`upload-zone ${dragOver ? "active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !analyzing && !uploaded && fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
                {analyzing ? (
                  <>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid #e9e7ff", borderTopColor: "#6C63FF" }} className="spin" />
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#6C63FF" }}>Analysing image...</div>
                    <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Running CNN inference</div>
                  </>
                ) : uploaded ? (
                  <>
                    <div style={{ fontSize: 40 }}>✅</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#00C896" }}>Image analysed successfully!</div>
                    <button className="btn-outline" style={{ fontSize: 13, padding: "10px 24px" }} onClick={(e) => { e.stopPropagation(); reset(); }}>
                      Upload another
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "#f5f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📤</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 6 }}>Drag & drop your image here</div>
                      <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>or click to browse — PNG, JPG, WEBP</div>
                    </div>
                    <button className="btn-primary" style={{ fontSize: 13, padding: "11px 28px" }} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                      Choose File
                    </button>
                  </>
                )}
              </div>
            </Reveal>

            {/* Result card */}
            <Reveal delay={100}>
              <div style={{ border: "1.5px solid #f0f0f0", borderRadius: 24, padding: 32, background: "#fff", minHeight: 280 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>Prediction Result</div>
                  {uploaded && <span className="chip" style={{ background: "#f0fff9", color: "#00C896", border: "1px solid #00C89640" }}>✓ Analysed</span>}
                  {analyzing && <span className="chip pulse" style={{ background: "#f5f4ff", color: "#6C63FF", border: "1px solid #6C63FF40" }}>Processing…</span>}
                </div>

                {uploaded && imgSrc ? (
                  <div>
                    <div style={{ borderRadius: 16, overflow: "hidden", background: "#f8f7ff", height: 130, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: "1.5px solid #e9e7ff" }}>
                      <img src={imgSrc} alt="uploaded" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                      <div style={{ background: "linear-gradient(135deg,#f5f4ff,#ede9ff)", borderRadius: 16, padding: "20px 16px", textAlign: "center", border: "1.5px solid #e0dcff" }}>
                        <div style={{ fontSize: 44, fontWeight: 900, color: "#6C63FF", lineHeight: 1, marginBottom: 8 }}>ක</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Predicted Letter</div>
                      </div>
                      <div style={{ background: "linear-gradient(135deg,#f0fff9,#dcfff2)", borderRadius: 16, padding: "20px 16px", textAlign: "center", border: "1.5px solid #b3f0d8" }}>
                        <div style={{ fontSize: 44, fontWeight: 900, color: "#00C896", lineHeight: 1, marginBottom: 8 }}>97.4%</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Confidence</div>
                      </div>
                    </div>
                    {/* confidence bars */}
                    {[["ක", "97.4%", "#6C63FF", 97.4], ["ශ", "1.4%", "#00C896", 1.4], ["ට", "0.8%", "#FF6B6B", 0.8]].map(([ch, pct, col, w]) => (
                      <div key={ch} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ width: 28, fontSize: 18, fontWeight: 900, color: col }}>{ch}</span>
                        <div style={{ flex: 1, height: 8, background: "#f0f0f0", borderRadius: 100 }}>
                          <div style={{ height: 8, background: col, borderRadius: 100, width: `${w}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", width: 38, textAlign: "right" }}>{pct}</span>
                      </div>
                    ))}
                    <p style={{ fontSize: 12, color: "#c4c4c4", marginTop: 12, fontWeight: 500, textAlign: "center" }}>Simulated prediction for demo purposes.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12, color: "#d1d5db" }}>
                    <div style={{ fontSize: 48 }}>🖼</div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#c4c4c4" }}>Upload an image to see prediction</p>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FUTURE ── */}
      <section style={{ padding: "96px 24px", background: "#fafafa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label">Roadmap</div>
            <h2 className="section-title" style={{ marginBottom: 56 }}>Future improvements</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {FUTURE.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="fcard" style={{ background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `1.5px solid ${f.accent}25` }}>
                      {f.icon}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#e5e7eb" }}>0{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 8 }}>{f.title}</div>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, fontWeight: 500 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "120px 24px", background: "linear-gradient(135deg,#0f0e1a 0%,#1a1032 100%)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(108,99,255,.18) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
          <Reveal>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#6C63FF", marginBottom: 16 }}>Get Started</div>
            <h2 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-.03em", lineHeight: 1.15, marginBottom: 20 }}>
              Experience AI‑Powered<br />
              <span style={{ background: "linear-gradient(90deg,#6C63FF,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Sinhala Recognition
              </span>
            </h2>
            <p style={{ fontSize: 17, color: "#6b7280", marginBottom: 48, lineHeight: 1.7, fontWeight: 500 }}>
              Join researchers and developers using this platform to digitise and understand the Sinhala script with deep learning.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ fontSize: 15, padding: "16px 40px" }} onClick={() => scrollTo("demo")}>
                🚀 Try Demo
              </button>
              <button style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,.2)", padding: "16px 40px", borderRadius: 100, fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "border-color .2s" }}
                onMouseEnter={e => e.target.style.borderColor = "#6C63FF"}
                onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,.2)"}>
                View Documentation
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}