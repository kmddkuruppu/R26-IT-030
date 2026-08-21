import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoSrc from "../Logo01.png";

const SINHALA_ALL = [
  'අ','ආ','ඇ','ඈ','ඉ','ඊ','උ','ඌ','එ','ඒ','ඔ','ඕ',
  'ක','ඛ','ග','ඝ','ච','ජ','ට','ඩ','ත','ද','ප','බ',
  'ඵ','ව','ශ','ස','හ','ළ','ල','ය','ර','ම','න','ණ',
  'ඟ','කා','කි','කී','කු','කූ','කෙ','කේ','කො','කෝ',
  'ක්','ග්','ත්','ද්','ප්','ව්','ස්','හ්','ල්','ර්',
];

const CHARS   = ['අ','ආ','ක','ග','ස','ම','ල','ය'];
const METRICS = [
  { val:'2,400+', label:'Students'    },
  { val:'94%',    label:'Satisfaction'},
  { val:'50K+',   label:'Sessions'    },
  { val:'Free',   label:'Always'      },
];
const TAGS = [
  'AI feedback','Progress tracking','Guided practice',
  'Free writing','Smart grading','Stroke analysis','Gamified Learning'
];

const TESTIMONIALS = [
  { initial:'A', name:'Amali P.', text:'My handwriting improved dramatically in just 3 weeks.' },
  { initial:'D', name:'Dinesh R.', text:'The AI feedback is like having a private tutor.' },
  { initial:'K', name:'Kavitha S.', text:'Finally a tool that takes Sinhala script seriously.' },
];

export default function WelcomePage({ onStart }) {
  const navigate = useNavigate();
  const [ready, setReady]             = useState(false);
  const [hoveredChar, setHoveredChar] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const rainRef  = useRef(null);
  const starRef  = useRef(null);
  const waveRef  = useRef(null);
  const rainAF   = useRef(null);
  const waveAF   = useRef(null);
  const colsRef  = useRef([]);
  const starsRef = useRef([]);

  const handleStart = () => {
    if (onStart) { onStart(); } else { navigate('/register'); }
  };

  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  // Rotate testimonials
  useEffect(() => {
    if (!ready) return;
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 3800);
    return () => clearInterval(t);
  }, [ready]);

  /* ── Rain canvas ── */
  useEffect(() => {
    const canvas = rainRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const fontSize = 17;
    const colWidth = 22;

    function initRain() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const numCols = Math.floor(canvas.width / colWidth);
      colsRef.current = Array.from({ length: numCols }, (_, i) => {
        const maxLen = Math.floor(Math.random() * 18 + 8);
        return {
          x: i * colWidth + colWidth / 2,
          y: -(Math.random() * canvas.height * 1.5),
          speed: Math.random() * 1.0 + 0.4,
          chars: Array.from({ length: maxLen }, () =>
            SINHALA_ALL[Math.floor(Math.random() * SINHALA_ALL.length)]
          ),
          maxLen,
          alpha: Math.random() * 0.13 + 0.03,
          headBright: Math.random() > 0.6,
          pauseTimer: Math.random() * 120,
        };
      });
    }

    function drawRain() {
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = 'rgba(3,3,5,0.16)';
      ctx.fillRect(0, 0, W, H);

      colsRef.current.forEach(col => {
        if (col.pauseTimer > 0) { col.pauseTimer--; return; }
        col.chars.forEach((ch, i) => {
          const yPos = col.y - i * fontSize;
          if (yPos < -fontSize || yPos > H + fontSize) return;
          const fade = 1 - i / col.maxLen;
          let alpha;
          if (i === 0 && col.headBright) {
            alpha = Math.min(col.alpha * 4.5, 0.85);
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          } else {
            alpha = col.alpha * fade * fade;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          }
          ctx.font = `600 ${fontSize}px 'Noto Sans Sinhala',sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ch, col.x, yPos);
          if (Math.random() < 0.008)
            col.chars[i] = SINHALA_ALL[Math.floor(Math.random() * SINHALA_ALL.length)];
        });
        col.y += col.speed;
        if (col.y - col.maxLen * fontSize > H) {
          col.y = -(Math.random() * H * 0.5 + fontSize * 2);
          col.speed = Math.random() * 1.0 + 0.4;
          col.alpha = Math.random() * 0.13 + 0.03;
          col.headBright = Math.random() > 0.6;
          col.maxLen = Math.floor(Math.random() * 18 + 8);
          col.pauseTimer = Math.random() * 200 + 80;
          col.chars = Array.from({ length: col.maxLen }, () =>
            SINHALA_ALL[Math.floor(Math.random() * SINHALA_ALL.length)]
          );
        }
      });
      rainAF.current = requestAnimationFrame(drawRain);
    }

    const onResize = () => initRain();
    window.addEventListener('resize', onResize);
    initRain();
    rainAF.current = requestAnimationFrame(drawRain);
    return () => { cancelAnimationFrame(rainAF.current); window.removeEventListener('resize', onResize); };
  }, []);

  /* ── Stars canvas ── */
  useEffect(() => {
    const canvas = starRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let starT = 0;

    function initStars() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.35 + 0.06,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.005 + 0.001,
      }));
    }

    let starAF;
    function drawStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      starT += 0.012;
      starsRef.current.forEach(s => {
        const flicker = 0.6 + 0.4 * Math.sin(starT * s.speed * 60 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a * flicker})`;
        ctx.fill();
      });
      starAF = requestAnimationFrame(drawStars);
    }

    const onResize = () => initStars();
    window.addEventListener('resize', onResize);
    initStars();
    starAF = requestAnimationFrame(drawStars);
    return () => { cancelAnimationFrame(starAF); window.removeEventListener('resize', onResize); };
  }, []);

  /* ── Wave canvas ── */
  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas || !ready) return;
    const ctx = canvas.getContext('2d');

    function setup() {
      canvas.width  = canvas.offsetWidth  * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    }
    setup();

    const W  = () => canvas.offsetWidth;
    const H2 = () => canvas.offsetHeight;
    const LINES = [
      { y:22, c:'rgba(255,255,255,.55)', lw:1.6, a:4.0, f:.15, sp:1.0 },
      { y:40, c:'rgba(255,255,255,.25)', lw:1.1, a:2.8, f:.21, sp:1.4 },
      { y:56, c:'rgba(255,255,255,.13)', lw:.8,  a:2.0, f:.27, sp:.75 },
    ];
    let frame = 0;

    function wDraw() {
      ctx.clearRect(0, 0, W(), H2());
      const prog = Math.min(frame / 130, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      LINES.forEach(l => {
        ctx.beginPath();
        ctx.strokeStyle = l.c;
        ctx.lineWidth = l.lw;
        ctx.lineCap = ctx.lineJoin = 'round';
        const pts = Math.floor(ease * 280);
        for (let i = 0; i <= pts; i++) {
          const x  = (i / 280) * (W() - 18) + 9;
          const tt = (frame * l.sp + i) * l.f;
          const y  = l.y + Math.sin(tt) * l.a + Math.sin(tt * 2.2) * (l.a * .38);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      frame++;
      if (frame < 170) {
        waveAF.current = requestAnimationFrame(wDraw);
      } else {
        frame = 0;
        ctx.clearRect(0, 0, W(), H2());
        setTimeout(() => { waveAF.current = requestAnimationFrame(wDraw); }, 550);
      }
    }

    const onResize = () => setup();
    window.addEventListener('resize', onResize);
    waveAF.current = requestAnimationFrame(wDraw);
    return () => { cancelAnimationFrame(waveAF.current); window.removeEventListener('resize', onResize); };
  }, [ready]);

  const fd = i => ({ animationDelay: `${0.05 + i * 0.12}s` });

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* Background layers */}
      <canvas ref={rainRef} style={S.bgCanvas} />
      <canvas ref={starRef} style={{ ...S.bgCanvas, zIndex: 1 }} />
      <div style={S.vignette} />
      <div style={S.grid} />

      {/* Floating stat cards */}
      {ready && (
        <>
          <div className="fc flt1" style={{ ...S.fc, top:88, left:22 }}>
            <div style={S.fcIcon}>⚡</div>
            <div>
              <div style={S.fcl}>Daily streak</div>
              <div style={S.fcv}>7 days</div>
            </div>
          </div>
          <div className="fc flt2" style={{ ...S.fc, top:88, right:22 }}>
            <div style={S.fcIcon}>🎯</div>
            <div>
              <div style={S.fcl}>Accuracy score</div>
              <div style={S.fcv}>85%</div>
            </div>
          </div>
          <div className="fc flt1" style={{ ...S.fc, bottom:110, left:22 }}>
            <div style={S.fcIcon}>✍️</div>
            <div>
              <div style={S.fcl}>Today's sentence</div>
              <div style={{ ...S.fcv, fontFamily:"'Noto Sans Sinhala',sans-serif", fontSize:11.5, letterSpacing:.5 }}>
                අම්මා ගෙදර යයි
              </div>
            </div>
          </div>
          <div className="fc flt2" style={{ ...S.fc, bottom:110, right:22 }}>
            <div style={S.fcIcon}>🏆</div>
            <div>
              <div style={S.fcl}>Current grade</div>
              <div style={S.fcv}>A+ Level</div>
            </div>
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <div style={S.content}>

        {/* Status pill */}
        {ready && (
          <div className="fu" style={{ ...S.pill, ...fd(0) }}>
            <div className="pdot" style={S.pdot} />
            <span style={S.pillTxt}>Now enrolling — Sinhala Handwriting Program</span>
            <span style={S.pillArrow}>→</span>
          </div>
        )}

        {/* Logo + system name */}
        {ready && (
          <div className="fu" style={{ ...S.logoSection, ...fd(1) }}>
            <div style={S.logoWrap}>
              <div className="ring r1" />
              <div className="ring r2" />
              <div className="ring r3" />
              <div style={S.logoBox}>
                <img
                  src={logoSrc}
                  alt="නැණ තක්සලාව"
                  style={S.logoImg}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <div className="sys-name">නැණ තක්සලාව</div>
              <div style={S.sysTag}>
                <div style={S.tl} />
                <span>AI-Powered Language Platform</span>
                <div style={S.tl} />
              </div>
            </div>
          </div>
        )}

        {/* Headline */}
        {ready && (
          <h1 className="fu" style={{ ...S.headline, ...fd(2) }}>
            <span style={S.sin}>ඔබේ සිංහල</span>
            <br />
            <span className="gw">Handwriting</span>
            <br />
            <span style={S.subTxt}>perfect කරගන්න</span>
          </h1>
        )}

        {/* Description */}
        {ready && (
          <p className="fu" style={{ ...S.desc, ...fd(3) }}>
            Master Sinhala script with precision AI analysis, real-time stroke
            feedback, and an adaptive curriculum designed for serious learners.
          </p>
        )}

        {/* Character chips with stroke-order hint */}
        {ready && (
          <div className="fu" style={{ ...S.charRow, ...fd(3) }}>
            {CHARS.map((ch, i) => (
              <div
                key={i}
                className="char-chip"
                onMouseEnter={() => setHoveredChar(i)}
                onMouseLeave={() => setHoveredChar(null)}
                style={{
                  ...S.chip,
                  transform:    hoveredChar === i ? 'translateY(-10px) scale(1.18)' : 'none',
                  borderColor:  hoveredChar === i ? 'rgba(255,255,255,.32)' : 'rgba(255,255,255,.09)',
                  color:        hoveredChar === i ? '#f9fafb' : 'rgba(249,250,251,.55)',
                  background:   hoveredChar === i
                    ? 'linear-gradient(135deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.06) 100%)'
                    : 'rgba(255,255,255,.04)',
                  boxShadow:    hoveredChar === i
                    ? '0 20px 48px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.14),inset 0 1px 0 rgba(255,255,255,.12)'
                    : '0 2px 8px rgba(0,0,0,.2)',
                }}
              >
                {ch}
                {hoveredChar === i && <span style={S.chipHint}>tap to practice</span>}
              </div>
            ))}
          </div>
        )}

        {/* CTA buttons */}
        {ready && (
          <div className="fu" style={{ ...S.ctas, ...fd(4) }}>
            <button className="btn-primary" style={S.bp} onClick={handleStart}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
              Start Learning — Free
            </button>
            <button className="btn-secondary" style={S.bs} onClick={handleStart}>
              See how it works
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Metrics row */}
        {ready && (
          <div className="fu" style={{ ...S.mets, ...fd(5) }}>
            {METRICS.map((m, i) => (
              <div key={i} className="met-cell" style={S.met}>
                <div style={S.mv}>{m.val}</div>
                <div style={S.ml}>{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Feature tags */}
        {ready && (
          <div className="fu" style={{ ...S.tgs, ...fd(6) }}>
            {TAGS.map((t, i) => (
              <div key={i} style={S.tg}>
                <div style={S.tgd} />
                {t}
              </div>
            ))}
          </div>
        )}

        {/* Testimonial strip */}
        {ready && (
          <div className="fu" style={{ ...S.testimonialWrap, ...fd(6) }}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  ...S.testimonial,
                  opacity:    activeTestimonial === i ? 1 : 0,
                  transform:  activeTestimonial === i ? 'translateY(0)' : 'translateY(6px)',
                  position:   i === 0 ? 'relative' : 'absolute',
                  top:        i === 0 ? undefined : 0, left: i === 0 ? undefined : 0,
                  right:      i === 0 ? undefined : 0,
                  pointerEvents: activeTestimonial === i ? 'auto' : 'none',
                }}
              >
                <div style={S.tAvatar}>{t.initial}</div>
                <div>
                  <div style={S.tName}>{t.name}</div>
                  <div style={S.tText}>"{t.text}"</div>
                </div>
              </div>
            ))}
            <div style={S.tDots}>
              {TESTIMONIALS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  style={{
                    ...S.tDot,
                    background: activeTestimonial === i ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.15)',
                    width:      activeTestimonial === i ? 20 : 6,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Live wave + progress bar section */}
        {ready && (
          <div className="fu" style={{ ...S.bottomRow, ...fd(7) }}>
            <div style={S.waveWrap}>
              <div style={S.lv}>
                <div className="pdot" style={{ ...S.pdot, background:'#fff', boxShadow:'none', width:5, height:5 }} />
                Live
              </div>
              <canvas ref={waveRef} style={{ width:'100%', height:'100%', display:'block' }} />
            </div>
            <div style={S.progressCard}>
              <div style={S.pcLabel}>Sample progress</div>
              {[
                { label:'Vowels',     pct:82 },
                { label:'Consonants', pct:61 },
                { label:'Conjuncts',  pct:34 },
              ].map((bar, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 10 : 0 }}>
                  <div style={S.barRow}>
                    <span style={S.barLabel}>{bar.label}</span>
                    <span style={S.barPct}>{bar.pct}%</span>
                  </div>
                  <div style={S.barTrack}>
                    <div className="bar-fill" style={{ ...S.barFill, width:`${bar.pct}%`, animationDelay:`${i * 0.18}s` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust row */}
        {ready && (
          <div className="fu" style={{ ...S.trust, ...fd(8) }}>
            <div style={{ display:'flex' }}>
              {['A','D','K','M'].map((l, i) => (
                <div key={i} style={{ ...S.av, zIndex: 4 - i, marginLeft: i > 0 ? -8 : 0 }}>{l}</div>
              ))}
            </div>
            <span style={S.trustTxt}>
              Join <span style={{ color:'#9ca3af' }}>2,400+</span> students already learning
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const S = {
  root: {
    fontFamily: "'Inter',sans-serif",
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#030305',
    color: '#f9fafb',
  },
  bgCanvas: {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  vignette: {
    position: 'fixed',
    inset: 0,
    zIndex: 2,
    pointerEvents: 'none',
    background: 'radial-gradient(ellipse 80% 80% at 50% 48%,rgba(3,3,5,.5) 0%,rgba(3,3,5,.80) 58%,rgba(3,3,5,.97) 100%)',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    zIndex: 3,
    pointerEvents: 'none',
    backgroundImage:
      'linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),' +
      'linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)',
    backgroundSize: '60px 60px',
  },
  fc: {
    position: 'fixed',
    zIndex: 20,
    background: 'rgba(8,8,12,.92)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 16,
    padding: '12px 16px',
    boxShadow: '0 8px 48px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.07)',
    minWidth: 158,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  fcIcon: { fontSize: 20, lineHeight: 1 },
  fcl: { fontSize:9, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:'#4b5563', marginBottom:4 },
  fcv: { fontSize:13.5, fontWeight:700, color:'#f9fafb', lineHeight:1 },

  content: {
    position: 'relative',
    zIndex: 10,
    maxWidth: 700,
    width: '100%',
    textAlign: 'center',
    padding: '56px 24px 72px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 999,
    padding: '7px 14px 7px 12px',
    background: 'rgba(255,255,255,.05)',
    backdropFilter: 'blur(16px)',
    marginBottom: 40,
    cursor: 'pointer',
  },
  pillTxt:   { fontSize:11.5, fontWeight:500, color:'#9ca3af', letterSpacing:'.06em' },
  pillArrow: { fontSize:11, color:'#6b7280', marginLeft:2 },
  pdot: {
    width:6, height:6, borderRadius:'50%', background:'#fff',
    boxShadow:'0 0 10px rgba(255,255,255,.9)', flexShrink:0,
  },

  logoSection: { display:'flex', flexDirection:'column', alignItems:'center', gap:20, marginBottom:30 },
  logoWrap:    { position:'relative', width:148, height:148, display:'flex', alignItems:'center', justifyContent:'center' },
  logoBox: {
    width:116, height:116, borderRadius:30,
    border:'1.5px solid rgba(255,255,255,.18)',
    background:'rgba(255,255,255,.06)',
    display:'flex', alignItems:'center', justifyContent:'center',
    position:'relative', zIndex:2, overflow:'hidden',
    boxShadow:'0 0 0 1px rgba(255,255,255,.05),0 24px 72px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.1)',
  },
  logoImg: { width:'100%', height:'100%', objectFit:'contain', padding:12, filter:'brightness(1.07) contrast(1.04)' },
  sysTag: {
    display:'inline-flex', alignItems:'center', gap:10,
    fontSize:9.5, fontWeight:600, letterSpacing:'.2em',
    textTransform:'uppercase', color:'#374151',
  },
  tl: { width:24, height:1, background:'#1f2937' },

  headline: {
    fontSize:'clamp(2.6rem,7vw,5rem)',
    fontWeight:800,
    lineHeight:1.02,
    letterSpacing:'-.046em',
    marginBottom:6,
  },
  sin:    { fontFamily:"'Noto Sans Sinhala',sans-serif", fontWeight:700, letterSpacing:'.01em', color:'#f9fafb' },
  subTxt: {
    fontSize:'clamp(.9rem,1.9vw,1.25rem)',
    fontWeight:300, color:'#374151',
    letterSpacing:'.015em', fontStyle:'italic',
    display:'block', marginTop:8,
  },
  desc: {
    fontSize:14.5, lineHeight:1.95,
    color:'#4b5563', maxWidth:450,
    margin:'22px auto 34px',
  },

  charRow: { display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8, marginBottom:38 },
  chip: {
    fontFamily:"'Noto Sans Sinhala',sans-serif",
    fontSize:17, fontWeight:600,
    padding:'9px 16px', borderRadius:12,
    border:'1px solid',
    cursor:'pointer',
    transition:'all .28s cubic-bezier(.22,1,.36,1)',
    position:'relative',
    userSelect:'none',
  },
  chipHint: {
    position:'absolute', bottom:-22, left:'50%',
    transform:'translateX(-50%)',
    fontSize:8.5, fontWeight:500,
    color:'rgba(255,255,255,.35)',
    whiteSpace:'nowrap', letterSpacing:'.06em',
    pointerEvents:'none',
  },

  ctas: {
    display:'flex', alignItems:'center', justifyContent:'center',
    gap:12, marginBottom:38, flexWrap:'wrap',
  },
  bp: {
    display:'inline-flex', alignItems:'center', gap:10,
    background:'#f9fafb', color:'#030305',
    border:'none', borderRadius:13,
    padding:'15px 44px', fontSize:14.5,
    fontWeight:700, cursor:'pointer',
    fontFamily:"'Inter',sans-serif", letterSpacing:'.01em',
    boxShadow:'0 0 0 1px rgba(255,255,255,.18),0 12px 40px rgba(255,255,255,.14)',
    transition:'all .3s cubic-bezier(.22,1,.36,1)',
  },
  bs: {
    display:'inline-flex', alignItems:'center', gap:9,
    background:'rgba(255,255,255,.05)', color:'#9ca3af',
    border:'1px solid rgba(255,255,255,.12)', borderRadius:13,
    padding:'15px 28px', fontSize:14.5, fontWeight:500, cursor:'pointer',
    fontFamily:"'Inter',sans-serif",
    backdropFilter:'blur(12px)',
    transition:'all .25s',
  },

  mets: {
    display:'grid', gridTemplateColumns:'repeat(4,1fr)',
    gap:1,
    background:'rgba(255,255,255,.07)',
    borderRadius:16, overflow:'hidden',
    border:'1px solid rgba(255,255,255,.07)',
    marginBottom:28, width:'100%',
  },
  met: {
    background:'rgba(255,255,255,.025)',
    padding:'22px 10px', textAlign:'center',
    transition:'background .2s',
  },
  mv: { fontSize:24, fontWeight:800, letterSpacing:'-.04em', color:'#f9fafb', lineHeight:1 },
  ml: { fontSize:9.5, fontWeight:500, color:'#374151', textTransform:'uppercase', letterSpacing:'.14em', marginTop:6 },

  tgs: { display:'flex', flexWrap:'wrap', justifyContent:'center', gap:7, marginBottom:28 },
  tg:  {
    display:'inline-flex', alignItems:'center', gap:7,
    padding:'6px 14px', borderRadius:999,
    fontSize:11.5, fontWeight:500,
    background:'rgba(255,255,255,.04)',
    border:'1px solid rgba(255,255,255,.08)',
    color:'#6b7280',
    transition:'border-color .2s, color .2s',
  },
  tgd: { width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,.25)', flexShrink:0 },

  /* Testimonial */
  testimonialWrap: {
    position:'relative', width:'100%',
    marginBottom:24,
    minHeight:64,
  },
  testimonial: {
    display:'flex', alignItems:'center', gap:14,
    padding:'14px 20px', borderRadius:14,
    background:'rgba(255,255,255,.03)',
    border:'1px solid rgba(255,255,255,.07)',
    transition:'opacity .5s ease, transform .5s ease',
  },
  tAvatar: {
    width:34, height:34, borderRadius:'50%',
    background:'rgba(255,255,255,.1)',
    border:'1px solid rgba(255,255,255,.14)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:12, fontWeight:700, color:'#d1d5db', flexShrink:0,
  },
  tName: { fontSize:11, fontWeight:600, color:'#6b7280', letterSpacing:'.06em', marginBottom:3 },
  tText: { fontSize:12.5, color:'#4b5563', lineHeight:1.5, textAlign:'left' },
  tDots: {
    display:'flex', alignItems:'center', justifyContent:'center',
    gap:6, marginTop:12,
  },
  tDot: {
    height:6, borderRadius:999,
    cursor:'pointer',
    transition:'all .35s cubic-bezier(.22,1,.36,1)',
  },

  /* Bottom row: wave + progress */
  bottomRow: {
    display:'grid', gridTemplateColumns:'1fr 1fr',
    gap:12, width:'100%', marginBottom:28,
  },
  waveWrap: {
    position:'relative', borderRadius:14, overflow:'hidden',
    background:'rgba(255,255,255,.03)',
    border:'1px solid rgba(255,255,255,.07)',
    height:90,
  },
  lv: {
    position:'absolute', top:9, right:10,
    background:'rgba(255,255,255,.08)',
    border:'1px solid rgba(255,255,255,.14)',
    borderRadius:6, padding:'3px 9px',
    fontSize:9, fontWeight:700,
    color:'#f9fafb', letterSpacing:'.1em',
    display:'flex', alignItems:'center', gap:5, zIndex:2,
  },
  progressCard: {
    borderRadius:14, overflow:'hidden',
    background:'rgba(255,255,255,.03)',
    border:'1px solid rgba(255,255,255,.07)',
    padding:'14px 16px',
  },
  pcLabel: { fontSize:9, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:'#374151', marginBottom:12 },
  barRow: { display:'flex', justifyContent:'space-between', marginBottom:5 },
  barLabel:{ fontSize:10.5, color:'#4b5563', fontWeight:500 },
  barPct:  { fontSize:10.5, color:'#6b7280', fontWeight:600 },
  barTrack:{ height:4, borderRadius:999, background:'rgba(255,255,255,.06)', overflow:'hidden' },
  barFill: { height:'100%', borderRadius:999, background:'rgba(255,255,255,.28)' },

  trust: { display:'flex', alignItems:'center', justifyContent:'center', gap:12 },
  av: {
    width:28, height:28, borderRadius:'50%',
    border:'2px solid #030305',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:9, fontWeight:700, color:'#d1d5db',
    background:'rgba(255,255,255,.12)', flexShrink:0,
  },
  trustTxt: { fontSize:12, color:'#4b5563' },
};

/* ─── Keyframe CSS ────────────────────────────────────────────────────────── */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Sinhala:wght@400;600;700&display=swap');

  * { box-sizing: border-box; }

  .fu {
    opacity: 0;
    transform: translateY(20px);
    animation: fuUp .68s cubic-bezier(.22,1,.36,1) forwards;
  }
  @keyframes fuUp { to { opacity:1; transform:translateY(0); } }

  .pdot { animation: pdotBlink 2.2s ease-in-out infinite; }
  @keyframes pdotBlink { 0%,100%{opacity:1} 50%{opacity:.22} }

  .sys-name {
    font-family: 'Noto Sans Sinhala', sans-serif;
    font-size: clamp(1.9rem, 5vw, 3rem);
    font-weight: 700;
    letter-spacing: .01em;
    background: linear-gradient(130deg,#ffffff 0%,#c8cdd6 35%,#ffffff 55%,#8a9099 100%);
    background-size: 280% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 7s ease infinite;
  }
  .gw {
    background: linear-gradient(95deg,#fff 0%,#6b7280 42%,#fff 65%,#9ca3af 100%);
    background-size: 220% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 5s ease infinite;
  }
  @keyframes shimmer { 0%,100%{background-position:0%} 50%{background-position:100%} }

  .ring {
    position: absolute;
    inset: 0;
    border-radius: 38px;
    border: 1.5px solid rgba(255,255,255,.26);
    animation: ringOut 3.2s ease-out infinite;
  }
  .r2 { animation-delay: 1.6s; border-color: rgba(255,255,255,.11); }
  .r3 { animation-delay: .9s;  border-color: rgba(255,255,255,.06); border-width: 1px; }
  @keyframes ringOut { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(1.9);opacity:0} }

  .flt1 { animation: flt1 7s ease-in-out infinite; }
  .flt2 { animation: flt2 5.8s ease-in-out 1s infinite; }
  @keyframes flt1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-11px)} }
  @keyframes flt2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

  .btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 0 1px rgba(255,255,255,.22), 0 18px 52px rgba(255,255,255,.18) !important; }
  .btn-primary:active { transform: scale(.98); }

  .btn-secondary:hover { background: rgba(255,255,255,.09) !important; color: #d1d5db !important; border-color: rgba(255,255,255,.2) !important; }

  .met-cell:hover { background: rgba(255,255,255,.055) !important; }

  .bar-fill { animation: barGrow .9s cubic-bezier(.22,1,.36,1) forwards; }
  @keyframes barGrow { from { width: 0 !important; } }

  .char-chip:hover .chip-hint { opacity: 1; }

  @media (max-width: 740px) {
    .fc { display: none !important; }
  }
  @media (max-width: 560px) {
    .bottom-row { grid-template-columns: 1fr !important; }
  }
`;