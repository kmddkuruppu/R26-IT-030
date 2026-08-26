import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoSrc from "../Logo01.png";
import monsterSrc from "../img01.png";   // Image 1 — "We Love Us" monster character
import catSrc from "../img02.png";           // Image 2 — teal cat sticker character
import boatSrc from "../img03.png";         // Image 3 — sailboat kids character (optional)

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

export default function WelcomePage({ onStart }) {
  const navigate = useNavigate();
  const [ready, setReady]             = useState(false);
  const [hoveredChar, setHoveredChar] = useState(null);

  const skyRef  = useRef(null);
  const skyAF   = useRef(null);

  // ── logo 3D tilt tracking (2026-style pointer-reactive glow) ──
  const logoWrapRef = useRef(null);
  const [logoTilt, setLogoTilt] = useState({ rx: 0, ry: 0 });

  // ── mascot pointer-parallax tracking (2026-style ambient depth) ──
  // Each mascot drifts toward/away from the cursor slightly, on top of its
  // own float/wobble keyframe animation, so they feel alive and "aware".
  const monsterWrapRef = useRef(null);
  const catWrapRef     = useRef(null);
  const [monsterParallax, setMonsterParallax] = useState({ x: 0, y: 0, r: 0 });
  const [catParallax, setCatParallax]         = useState({ x: 0, y: 0, r: 0 });

  const handleStart = () => {
    if (onStart) onStart();
    else navigate('/register');
  };

  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  const handleLogoMove = (e) => {
    const el = logoWrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;   // 0..1
    const py = (e.clientY - r.top)  / r.height;  // 0..1
    const ry = (px - 0.5) * 22;   // rotateY
    const rx = (0.5 - py) * 22;   // rotateX
    setLogoTilt({ rx, ry });
  };
  const resetLogoTilt = () => setLogoTilt({ rx: 0, ry: 0 });

  /* ── Whole-viewport mascot parallax — mascots gently lean toward the
        cursor, like a character noticing you walked into the room ── */
  useEffect(() => {
    let raf = null;
    const handleMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const mx = e.clientX / vw;   // 0..1
        const my = e.clientY / vh;   // 0..1

        if (monsterWrapRef.current) {
          const rect = monsterWrapRef.current.getBoundingClientRect();
          const cx = (rect.left + rect.width / 2) / vw;
          const cy = (rect.top + rect.height / 2) / vh;
          setMonsterParallax({
            x: (mx - cx) * 22,
            y: (my - cy) * 14,
            r: (mx - cx) * 8,
          });
        }
        if (catWrapRef.current) {
          const rect = catWrapRef.current.getBoundingClientRect();
          const cx = (rect.left + rect.width / 2) / vw;
          const cy = (rect.top + rect.height / 2) / vh;
          setCatParallax({
            x: (mx - cx) * 22,
            y: (my - cy) * 14,
            r: (mx - cx) * 8,
          });
        }
      });
    };
    window.addEventListener('pointermove', handleMove);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* ── Sky canvas — butterflies & birds ── */
  useEffect(() => {
    const canvas = skyRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const COLORS = ['#FF8FAB','#FFD166','#06D6A0','#A78BFA','#F97316'];

    const butterflies = Array.from({ length: 8 }, () => ({
      x:         Math.random() * window.innerWidth,
      y:         Math.random() * (window.innerHeight * 0.5),
      vx:        (Math.random() - 0.5) * 1.2,
      vy:        (Math.random() - 0.5) * 0.7,
      phase:     Math.random() * Math.PI * 2,
      size:      Math.random() * 10 + 8,
      color:     COLORS[Math.floor(Math.random() * COLORS.length)],
      flapSpeed: Math.random() * 0.08 + 0.06,
    }));

    const birds = Array.from({ length: 5 }, () => ({
      x:     -60,
      y:     Math.random() * (window.innerHeight * 0.35) + 30,
      speed: Math.random() * 1.5 + 1.2,
      size:  Math.random() * 6 + 10,
      phase: Math.random() * Math.PI * 2,
    }));

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawButterfly(b) {
      const flap = Math.sin(t * b.flapSpeed * 60) * 0.8;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.7 * Math.abs(flap), 0, b.size * 0.9, b.size * 0.6, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = b.color + 'CC';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(b.size * 0.7 * Math.abs(flap), 0, b.size * 0.9, b.size * 0.6, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.5, b.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#33333366';
      ctx.fill();
      ctx.restore();
    }

    function drawBird(b) {
      ctx.save();
      ctx.translate(b.x, b.y + Math.sin(t * 0.8 + b.phase) * 5);
      const flap = Math.sin(t * 2.5 + b.phase);
      ctx.strokeStyle = '#555566';
      ctx.lineWidth   = 1.8;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-b.size * 0.6, flap * b.size * 0.5, -b.size, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(b.size * 0.6, flap * b.size * 0.5, b.size, 0);
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.016;

      butterflies.forEach(b => {
        b.x += b.vx + Math.sin(t * 0.5 + b.phase) * 0.5;
        b.y += b.vy + Math.cos(t * 0.4 + b.phase) * 0.4;
        if (b.x < -30) b.x = canvas.width + 30;
        if (b.x > canvas.width + 30) b.x = -30;
        if (b.y < 10)                      b.vy =  Math.abs(b.vy);
        if (b.y > canvas.height * 0.55)    b.vy = -Math.abs(b.vy);
        drawButterfly(b);
      });

      birds.forEach(b => {
        b.x += b.speed;
        if (b.x > canvas.width + 80) {
          b.x = -80;
          b.y = Math.random() * (canvas.height * 0.35) + 30;
        }
        drawBird(b);
      });

      skyAF.current = requestAnimationFrame(animate);
    }

    skyAF.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(skyAF.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const fd = i => ({ animationDelay: `${0.05 + i * 0.13}s` });

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* Sky canvas — butterflies & birds */}
      <canvas ref={skyRef} style={S.bgCanvas} />

      {/* Sun */}
      <div style={S.sun} className="sun-pulse">
        <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
          <circle cx="36" cy="36" r="22" fill="#FFD600" opacity="0.25"/>
          <circle cx="36" cy="36" r="16" fill="#FFD600"/>
          <g stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
            <line x1="36" y1="4"  x2="36" y2="12"/>
            <line x1="36" y1="60" x2="36" y2="68"/>
            <line x1="4"  y1="36" x2="12" y2="36"/>
            <line x1="60" y1="36" x2="68" y2="36"/>
            <line x1="13" y1="13" x2="19" y2="19"/>
            <line x1="53" y1="53" x2="59" y2="59"/>
            <line x1="59" y1="13" x2="53" y2="19"/>
            <line x1="13" y1="59" x2="19" y2="53"/>
          </g>
        </svg>
      </div>

      {/* Clouds */}
      <div className="cloud cloud1" style={S.cloud}>
        <svg width="200" height="70" viewBox="0 0 200 70">
          <ellipse cx="80"  cy="45" rx="70" ry="25" fill="white"/>
          <ellipse cx="60"  cy="38" rx="40" ry="22" fill="white"/>
          <ellipse cx="110" cy="36" rx="50" ry="24" fill="white"/>
          <ellipse cx="140" cy="44" rx="45" ry="20" fill="white"/>
        </svg>
      </div>
      <div className="cloud cloud2" style={S.cloud}>
        <svg width="160" height="55" viewBox="0 0 160 55">
          <ellipse cx="65" cy="37" rx="55" ry="18" fill="rgba(255,255,255,0.85)"/>
          <ellipse cx="50" cy="30" rx="32" ry="18" fill="rgba(255,255,255,0.85)"/>
          <ellipse cx="90" cy="28" rx="40" ry="18" fill="rgba(255,255,255,0.85)"/>
        </svg>
      </div>
      <div className="cloud cloud3" style={S.cloud}>
        <svg width="130" height="48" viewBox="0 0 130 48">
          <ellipse cx="55" cy="33" rx="45" ry="16" fill="rgba(255,255,255,0.7)"/>
          <ellipse cx="42" cy="27" rx="28" ry="15" fill="rgba(255,255,255,0.7)"/>
          <ellipse cx="75" cy="25" rx="35" ry="16" fill="rgba(255,255,255,0.7)"/>
        </svg>
      </div>

      {/* Floating cards */}
      {ready && (
        <>
          <div className="fc flt1" style={{ ...S.fc, top:80, left:18 }}>
            <div style={S.fcl}>Daily streak</div>
            <div style={S.fcv}>⚡ 7 days</div>
          </div>
          <div className="fc flt2" style={{ ...S.fc, top:80, right:18 }}>
            <div style={S.fcl}>Accuracy score</div>
            <div style={S.fcv}>85%</div>
          </div>
          <div className="fc flt1" style={{ ...S.fc, bottom:160, left:18 }}>
            <div style={S.fcl}>Today's sentence</div>
            <div style={{ ...S.fcv, fontFamily:"'Noto Sans Sinhala',sans-serif", fontSize:12 }}>
              අම්මා ගෙදර යයි
            </div>
          </div>
          <div className="fc flt2" style={{ ...S.fc, bottom:160, right:18 }}>
            <div style={S.fcl}>Current grade</div>
            <div style={S.fcv}>A+ Level</div>
          </div>
        </>
      )}

      {/* Character — Monster (bottom-left), enlarged + pointer-parallax + glow aura */}
      <div
        ref={monsterWrapRef}
        className={`char-wrap char-hero-enter flt1 ${ready ? 'is-in' : ''}`}
        style={{
          ...S.charWrap,
          bottom: 20,
          left: 24,
          width: 260,
          transform: `translate(${monsterParallax.x}px, ${monsterParallax.y}px) rotate(${monsterParallax.r}deg)`,
        }}
      >
        <div className="char-glow" style={{ ...S.charGlow, background:'radial-gradient(circle,#FFD16688,transparent 70%)' }} />
        <img
          src={monsterSrc}
          alt="Monster character"
          style={S.charImg}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      {/* Character — Cat (bottom-right), enlarged + pointer-parallax + glow aura */}
      <div
        ref={catWrapRef}
        className={`char-wrap char-hero-enter flt2 ${ready ? 'is-in' : ''}`}
        style={{
          ...S.charWrap,
          bottom: 20,
          right: 24,
          width: 220,
          transform: `translate(${catParallax.x}px, ${catParallax.y}px) rotate(${catParallax.r}deg)`,
        }}
      >
        <div className="char-glow" style={{ ...S.charGlow, background:'radial-gradient(circle,#06D6A088,transparent 70%)' }} />
        <img
          src={catSrc}
          alt="Cat character"
          style={S.charImg}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      {/* Ground */}
      <div style={S.ground}>
        <div style={S.groundShine} />
      </div>

      {/* Main content */}
      <div style={S.content}>

        {/* Status pill */}
        {ready && (
          <div className="fu" style={{ ...S.pill, ...fd(0) }}>
            <div className="pdot" style={S.pdot} />
            <span style={S.pillTxt}>Now enrolling — Sinhala Handwriting Program</span>
          </div>
        )}

        {/* Logo + System name — 2026 style: big, glowing, pointer-reactive glass orb */}
        {ready && (
          <div className="fu" style={{ ...S.logoSection, ...fd(1) }}>
            <div
              ref={logoWrapRef}
              onMouseMove={handleLogoMove}
              onMouseLeave={resetLogoTilt}
              style={{
                ...S.logoOrbit,
                transform: `perspective(800px) rotateX(${logoTilt.rx}deg) rotateY(${logoTilt.ry}deg)`,
              }}
            >
              {/* breathing scale lives on an inner element so it doesn't fight the pointer-tilt transform above */}
              <div className="logo-orbit-breathe" style={S.logoBreathe}>
                <span className="logo-ring" aria-hidden="true" />
                <span className="logo-ring logo-ring2" aria-hidden="true" />
                <div style={S.logoBox}>
                  <img
                    src={logoSrc}
                    alt="නැණ තක්සලාව"
                    style={S.logoImg}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
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
            <span className="hw">Handwriting</span>
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

        {/* Char chips */}
        {ready && (
          <div className="fu" style={{ ...S.charRow, ...fd(3) }}>
            {CHARS.map((ch, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredChar(i)}
                onMouseLeave={() => setHoveredChar(null)}
                style={{
                  ...S.chip,
                  transform:   hoveredChar === i ? 'translateY(-8px) scale(1.15)' : 'none',
                  background:  hoveredChar === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
                  boxShadow:   hoveredChar === i ? '0 14px 32px rgba(0,0,0,0.15)' : '0 2px 12px rgba(0,0,0,0.07)',
                  color:       hoveredChar === i ? '#0d3d24' : '#1a5c3a',
                }}
              >
                {ch}
              </div>
            ))}
          </div>
        )}

        {/* CTA buttons */}
        {ready && (
          <div className="fu" style={{ ...S.ctas, ...fd(4) }}>
            <button className="btn-primary" style={S.bp} onClick={handleStart}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
              Start Learning — Free
            </button>
            <button className="btn-secondary" style={S.bs} onClick={handleStart}>
              See how it works
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Metrics */}
        {ready && (
          <div className="fu" style={{ ...S.mets, ...fd(5) }}>
            {METRICS.map((m, i) => (
              <div key={i} style={S.met}>
                <div style={S.mv}>{m.val}</div>
                <div style={S.ml}>{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
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

        {/* Trust row */}
        {ready && (
          <div className="fu" style={{ ...S.trust, ...fd(7) }}>
            <div style={{ display:'flex' }}>
              {['A','D','K','M'].map((l, i) => (
                <div key={i} style={{ ...S.av, zIndex: 4 - i, marginLeft: i > 0 ? -7 : 0 }}>{l}</div>
              ))}
            </div>
            <span style={S.trustTxt}>
              Join <span style={{ color:'#1a3d2b', fontWeight:700 }}>2,400+</span> students already learning
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────── */

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
    background: 'linear-gradient(180deg,#87CEEB 0%,#B0E0FF 30%,#C8F0E0 55%,#7EC8A0 75%,#5AAA82 100%)',
    color: '#1a3d2b',
  },
  bgCanvas: {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  sun: {
    position: 'fixed',
    top: 28,
    right: 50,
    zIndex: 3,
    pointerEvents: 'none',
  },
  cloud: {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 2,
    opacity: 0.9,
  },
  ground: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    background: 'linear-gradient(180deg,#5AAA82 0%,#3D8A60 100%)',
    zIndex: 10,
    borderRadius: '60% 60% 0 0 / 30px 30px 0 0',
    overflow: 'visible',
  },
  groundShine: {
    position: 'absolute',
    top: -18,
    left: '-10%',
    width: '120%',
    height: 40,
    background: '#4CAF50',
    borderRadius: '50%',
    opacity: 0.6,
  },
  charWrap: {
    position: 'fixed',
    zIndex: 20,
    pointerEvents: 'none',
    transition: 'transform .5s cubic-bezier(.22,1,.36,1)',
    willChange: 'transform',
  },
  charGlow: {
    position: 'absolute',
    inset: '10% -20% -10% -20%',
    filter: 'blur(18px)',
    zIndex: -1,
    borderRadius: '50%',
  },
  charImg: {
    width: '100%',
    height: 'auto',
    filter: 'drop-shadow(0 14px 26px rgba(0,0,0,0.22))',
    display: 'block',
  },
  fc: {
    position: 'fixed',
    zIndex: 25,
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1.5px solid rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: '12px 16px',
    boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
    minWidth: 138,
  },
  fcl: { fontSize:9, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'#6b9e83', marginBottom:4 },
  fcv: { fontSize:13.5, fontWeight:800, color:'#1a3d2b' },
  content: {
    position: 'relative',
    zIndex: 15,
    maxWidth: 700,
    width: '100%',
    textAlign: 'center',
    padding: '44px 24px 160px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 9,
    background: 'rgba(255,255,255,0.75)',
    border: '1.5px solid rgba(255,255,255,0.9)',
    borderRadius: 999,
    padding: '7px 18px 7px 12px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    marginBottom: 28,
  },
  pillTxt: { fontSize:11.5, fontWeight:600, color:'#2d6a4f', letterSpacing:'.06em' },
  pdot: {
    width:8, height:8, borderRadius:'50%', background:'#2d6a4f', flexShrink:0,
  },
  logoSection: { display:'flex', flexDirection:'column', alignItems:'center', gap:20, marginBottom:24 },

  // ── Enlarged, animated logo orb wrapper (2026-style glass + gradient ring) ──
  logoOrbit: {
    position: 'relative',
    width: 200,
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform .25s cubic-bezier(.22,1,.36,1)',
    transformStyle: 'preserve-3d',
  },
  logoBreathe: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    position: 'relative',
    width: 168, height: 168, borderRadius: 40,
    background:'rgba(255,255,255,0.9)',
    border:'2px solid rgba(255,255,255,0.95)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 20px 60px rgba(20,80,50,0.28),0 6px 20px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.85)',
    overflow:'hidden',
    zIndex: 2,
  },
  logoImg: { width:138, height:138, objectFit:'contain', padding:10 },
  sysTag: { display:'inline-flex', alignItems:'center', gap:10, fontSize:10, fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'#3d8a60' },
  tl:     { width:24, height:2, background:'#3d8a60', borderRadius:2 },
  headline: { fontSize:'clamp(2.2rem,7vw,4.4rem)', fontWeight:800, lineHeight:1.05, letterSpacing:'-.04em', marginBottom:10, color:'#1a3d2b', textShadow:'0 3px 20px rgba(255,255,255,0.6)' },
  sin:    { fontFamily:"'Noto Sans Sinhala',sans-serif" },
  subTxt: { fontSize:'clamp(.9rem,2vw,1.2rem)', fontWeight:400, color:'#2d6a4f', display:'block', marginTop:6, fontStyle:'italic' },
  desc:   { fontSize:14.5, lineHeight:1.85, color:'#2d4a3e', maxWidth:440, margin:'16px auto 28px', background:'rgba(255,255,255,0.55)', borderRadius:14, padding:'14px 20px', backdropFilter:'blur(6px)' },
  charRow:{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8, marginBottom:30 },
  chip: {
    fontFamily:"'Noto Sans Sinhala',sans-serif", fontSize:17, fontWeight:700,
    padding:'9px 17px', borderRadius:12,
    border:'1.5px solid rgba(255,255,255,0.9)',
    cursor:'default', transition:'all .28s cubic-bezier(.22,1,.36,1)',
  },
  ctas:   { display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginBottom:30, flexWrap:'wrap' },
  bp: {
    display:'inline-flex', alignItems:'center', gap:10,
    background:'#2d6a4f', color:'#fff',
    border:'none', borderRadius:14,
    padding:'15px 38px', fontSize:14.5, fontWeight:700,
    cursor:'pointer', fontFamily:"'Inter',sans-serif",
    boxShadow:'0 6px 24px rgba(45,106,79,0.45),0 2px 8px rgba(0,0,0,0.1)',
    transition:'all .3s cubic-bezier(.22,1,.36,1)',
  },
  bs: {
    display:'inline-flex', alignItems:'center', gap:8,
    background:'rgba(255,255,255,0.72)', color:'#2d6a4f',
    border:'1.5px solid rgba(45,106,79,0.3)', borderRadius:14,
    padding:'15px 26px', fontSize:14.5, fontWeight:600,
    cursor:'pointer', fontFamily:"'Inter',sans-serif",
    backdropFilter:'blur(8px)',
    transition:'all .25s',
  },
  mets: {
    display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1,
    background:'rgba(45,106,79,0.25)',
    borderRadius:16, overflow:'hidden',
    border:'1.5px solid rgba(255,255,255,0.6)',
    marginBottom:24, width:'100%',
    backdropFilter:'blur(8px)',
  },
  met:  { background:'rgba(255,255,255,0.65)', padding:'18px 10px', textAlign:'center' },
  mv:   { fontSize:22, fontWeight:800, letterSpacing:'-.04em', color:'#1a3d2b' },
  ml:   { fontSize:9.5, fontWeight:600, color:'#4a7c59', textTransform:'uppercase', letterSpacing:'.12em', marginTop:4 },
  tgs:  { display:'flex', flexWrap:'wrap', justifyContent:'center', gap:7, marginBottom:28 },
  tg:   { display:'inline-flex', alignItems:'center', gap:6, padding:'6px 13px', borderRadius:9, fontSize:11.5, fontWeight:500, background:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.8)', color:'#2d6a4f', backdropFilter:'blur(4px)' },
  tgd:  { width:5, height:5, borderRadius:'50%', background:'#2d6a4f' },
  trust:{ display:'flex', alignItems:'center', justifyContent:'center', gap:12 },
  av:   { width:28, height:28, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#fff', background:'#2d6a4f', flexShrink:0 },
  trustTxt: { fontSize:12, color:'#2d6a4f', fontWeight:500 },
};

/* ─── Keyframe CSS ──────────────────────────────────────────────────────── */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Sinhala:wght@400;600;700&display=swap');

  .fu {
    opacity: 0;
    transform: translateY(20px);
    animation: fuUp .72s cubic-bezier(.22,1,.36,1) forwards;
  }
  @keyframes fuUp { to { opacity:1; transform:translateY(0); } }

  .pdot { animation: pdotBlink 2.2s ease-in-out infinite; }
  @keyframes pdotBlink { 0%,100%{opacity:1} 50%{opacity:.2} }

  .sys-name {
    font-family: 'Noto Sans Sinhala', sans-serif;
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    font-weight: 700;
    color: #1a3d2b;
    letter-spacing: .01em;
    text-shadow: 0 2px 12px rgba(255,255,255,0.7);
  }

  .hw {
    color: #fff;
    text-shadow: 0 2px 12px rgba(45,106,79,0.5);
  }

  .sun-pulse { animation: sunPulse 4s ease-in-out infinite; }
  @keyframes sunPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }

  .cloud { position: fixed; pointer-events: none; z-index: 2; opacity: 0.9; }
  .cloud1 { top: 8%;  left: -120px; animation: cloudDrift 28s linear infinite; }
  .cloud2 { top: 20%; left: -180px; animation: cloudDrift 38s linear 10s infinite; }
  .cloud3 { top: 5%;  left: -150px; animation: cloudDrift 32s linear 5s infinite; }
  @keyframes cloudDrift { from{transform:translateX(0)} to{transform:translateX(calc(100vw + 250px))} }

  /* ── Mascot entrance: springy pop-in from below with rotation settle ── */
  .char-hero-enter {
    opacity: 0;
    transform: translateY(80px) scale(.6) rotate(-8deg);
  }
  .char-hero-enter.is-in {
    animation: charPopIn 1.1s cubic-bezier(.34,1.56,.64,1) forwards;
  }
  @keyframes charPopIn {
    0%   { opacity:0; transform: translateY(80px) scale(.6) rotate(-8deg); }
    60%  { opacity:1; transform: translateY(-10px) scale(1.06) rotate(3deg); }
    100% { opacity:1; transform: translateY(0) scale(1) rotate(0deg); }
  }

  /* soft ambient pulse behind each mascot, gives depth + a 2026 "glow aura" feel */
  .char-glow { animation: charGlowPulse 3.6s ease-in-out infinite; }
  @keyframes charGlowPulse {
    0%,100% { opacity:.55; transform: scale(1); }
    50%     { opacity:.9;  transform: scale(1.12); }
  }

  .char-wrap { position: fixed; z-index: 20; pointer-events: none; }
  .flt1 { animation: flt1 3.8s ease-in-out infinite, wobble1 6.4s ease-in-out infinite; }
  .flt2 { animation: flt2 4.5s ease-in-out 0.8s infinite, wobble2 7.2s ease-in-out .4s infinite; }
  @keyframes flt1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
  @keyframes flt2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
  @keyframes wobble1 { 0%,100%{rotate:-3deg} 50%{rotate:3deg} }
  @keyframes wobble2 { 0%,100%{rotate:3deg} 50%{rotate:-3deg} }

  .btn-primary:hover  { transform:translateY(-3px) scale(1.03); background:#1a5c3a !important; box-shadow:0 10px 32px rgba(45,106,79,0.55) !important; }
  .btn-secondary:hover{ background:rgba(255,255,255,0.92) !important; transform:translateY(-2px); }

  /* ── 2026-style logo orb: rotating conic-gradient ring + breathing glow ── */
  .logo-orbit-breathe {
    animation: logoBreathe 5s ease-in-out infinite;
  }
  .logo-orbit-breathe:hover { animation-play-state: paused; }

  .logo-ring {
    position: absolute;
    inset: -10px;
    border-radius: 46px;
    padding: 3px;
    background: conic-gradient(from 0deg,
      #FFD166, #06D6A0, #A78BFA, #FF8FAB, #F97316, #FFD166);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: logoRingSpin 6s linear infinite;
    filter: drop-shadow(0 0 18px rgba(45,106,79,0.35));
    z-index: 1;
  }
  .logo-ring2 {
    inset: -22px;
    opacity: 0.45;
    filter: blur(6px);
    animation: logoRingSpin 9s linear infinite reverse;
  }
  @keyframes logoRingSpin { to { transform: rotate(360deg); } }
  @keyframes logoBreathe {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.045); }
  }

  @media (max-width: 600px) {
    .fc { display: none !important; }
    .char-wrap { width: 150px !important; }
  }
`;