import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFullTracingData } from '../services/tracingDataService';
import { logExperimentEntryToServer } from '../services/experimentLogService';
import {
  ADAPTIVE_RECENT_N,
  getValidRecentAttempts,
  getAdaptiveSupportSettings,
  getStaticSupportSettings,
} from '../utils/tracingAdaptiveEngine';
// ─── CANVAS DIMENSIONS ──────────────────────────────────────────
const CANVAS_W = 680;
const CANVAS_H = 440;
const KP_SRC = 400;
const KP_TOUCH = 14;

// During the research experiment, students should not manually
// override the scaffolding condition assigned by the system.
const RESEARCH_LOCK_SUPPORT_CONTROLS = true;

// ─── SOUND PLAYER ────────────────────────────────────────────────
const audioCache = {};

function playLetterSound(letter) {
  try {
    const encoded = encodeURIComponent(letter);
    const src = `/sounds/${encoded}.m4a`;
    if (!audioCache[letter]) {
      audioCache[letter] = new Audio(src);
    }
    const audio = audioCache[letter];
    audio.currentTime = 0;
    audio.play().catch(() => {
      console.warn(`Sound file not found: ${src}`);
    });
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

const introAudio = new Audio('/sounds/1.m4a');
function playIntroSound() {
  try {
    introAudio.currentTime = 0;
    introAudio.play().catch((err) => {
      console.warn('Intro sound (1.m4a) could not play:', err);
    });
  } catch (e) {
    console.warn('Intro sound error:', e);
  }
}

// ─── FONT LOADING HELPER ─────────────────────────────────────────
function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    return document.fonts.ready;
  }
  return Promise.resolve();
}

// ─── KEYPOINTS SCALING ────────────────────────────────────────────
// Keypoints now come from the backend (per-letter, in the same 400x400
// source coordinate space the app always used) instead of a hard-coded
// KEYPOINTS_SRC map. This just scales whatever array it's given.
function getScaledKP(keypointsSrc) {
  return (keypointsSrc || []).map(p => ({
    x: (p.x / KP_SRC) * CANVAS_W,
    y: (p.y / KP_SRC) * CANVAS_H,
  }));
}

// ─── ADAPTIVE DIFFICULTY ENGINE (research feature) ─────────────────
// Compares "Adaptive" scaffolding (guide opacity / keypoint touch radius /
// boundary tolerance auto-tuned from the student's recent performance on
// THIS letter) against "Static" scaffolding (fixed defaults, i.e. the
// original behaviour) — an A/B setup for evaluating whether adaptive
// support improves accuracy/retention over static support.
const ADAPTIVE_STORAGE_KEY = 'tracingExperimentLog';

// Stable per-browser ID so the backend can group attempts by device for
// multi-device data collection, without requiring login.
function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem('tracingDeviceId');
    if (!id) {
      id = (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('tracingDeviceId', id);
    }
    return id;
  } catch {
    return 'unknown-device';
  }
}

// ─── EXPERIMENT MODE NAVIGATION ────────────────────────────────────
// The Letter Tracing route now has two clearly separated research views:
//   /letter-tracing?mode=adaptive
//   /letter-tracing?mode=static
//
// Both views keep the same tracing task, validation and scoring.
// Adaptive changes scaffolding from recent performance.
// Static keeps the admin-defined baseline scaffolding fixed.

const BRUSH_COLORS = [
  { color:'#111111', name:'Black' },   { color:'#444444', name:'Charcoal' },
  { color:'#888888', name:'Gray' },    { color:'#1a56db', name:'Blue' },
  { color:'#0e9f6e', name:'Green' },   { color:'#e02424', name:'Red' },
  { color:'#9061f9', name:'Purple' },  { color:'#ff5a1f', name:'Orange' },
];

// ─── HELPERS ─────────────────────────────────────────────────────
const diffLabel = d => d === 'Easy' ? 'Easy' : d === 'Medium' ? 'Medium' : 'Hard';

const getGrade = score => {
  if (score >= 90) return { label:'Excellent',  sub:'Perfect tracing',   stars:3, symbol:'★★★' };
  if (score >= 75) return { label:'Very Good',  sub:'Great technique',   stars:2, symbol:'★★☆' };
  if (score >= 60) return { label:'Good',       sub:'Keep it up',        stars:2, symbol:'★★☆' };
  return               { label:'Try Again',  sub:'Practice more',    stars:1, symbol:'★☆☆' };
};

const computeAccuracy = (userCanvas, guideCanvas) => {
  try {
    const w = userCanvas.width, h = userCanvas.height;
    const uPx = userCanvas.getContext('2d').getImageData(0,0,w,h).data;
    const gPx = guideCanvas.getContext('2d').getImageData(0,0,w,h).data;
    let guidePixels=0, hitPixels=0, extraPixels=0;
    for (let i=3; i<gPx.length; i+=4) {
      const inGuide=gPx[i]>50, inUser=uPx[i]>30;
      if (inGuide) { guidePixels++; if (inUser) hitPixels++; }
      else if (inUser) extraPixels++;
    }
    if (guidePixels===0) return 0;
    const penalty = Math.min(30,(extraPixels/Math.max(guidePixels,1))*25);
    return Math.min(100,Math.max(0,Math.round((hitPixels/guidePixels)*100*1.3-penalty)));
} catch {
  return 0;
}
};

function isOnLetterBoundary(px, py, guideCanvas, radiusMultiplier = 1) {
  if (!guideCanvas) return true;
  try {
    const ctx = guideCanvas.getContext('2d');
    const data = ctx.getImageData(0, 0, guideCanvas.width, guideCanvas.height).data;
    const r = Math.round(18 * radiusMultiplier);
    let letterPixels = 0, total = 0;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = Math.round(px + dx), ny = Math.round(py + dy);
        if (nx < 0 || ny < 0 || nx >= guideCanvas.width || ny >= guideCanvas.height) continue;
        const idx = (ny * guideCanvas.width + nx) * 4;
        if (data[idx + 3] > 30) letterPixels++;
        total++;
      }
    }
    return total > 0 && (letterPixels / total) >= 0.04;
  } catch { return true; }
}

function triggerBoundaryVibration() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 80]);
    }
  } catch {}
}

function triggerOrderVibration() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([60, 30, 60]);
    }
  } catch {}
}

function playWarningSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const beep = (freq, start, dur) => {
      const osc=ctx.createOscillator(), g=ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type='square'; osc.frequency.setValueAtTime(freq,ctx.currentTime+start);
      osc.frequency.exponentialRampToValueAtTime(freq*0.5,ctx.currentTime+start+dur);
      g.gain.setValueAtTime(0.25,ctx.currentTime+start);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+start+dur);
      osc.start(ctx.currentTime+start); osc.stop(ctx.currentTime+start+dur);
    };
    beep(880,0,0.1); beep(660,0.15,0.1);
    setTimeout(()=>ctx.close(),500);
  } catch {}
}

function playOrderBlockSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    setTimeout(() => ctx.close(), 300);
  } catch {}
}

// ─── STROKE ORDER ────────────────────────────────────────────────
const ORDER_WINDOW = 0;
function getNextExpectedKPIndex(coveredInOrder) {
  if (coveredInOrder.length === 0) return 0;
  return coveredInOrder[coveredInOrder.length - 1] + 1;
}

function isKPInValidOrderRange(kpIndex, coveredInOrder, totalKPs) {
  if (coveredInOrder.includes(kpIndex)) return false;
  const nextExpected = getNextExpectedKPIndex(coveredInOrder);
  return kpIndex >= nextExpected && kpIndex <= nextExpected + ORDER_WINDOW;
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.ceil(value / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setCount(value); clearInterval(t); }
      else setCount(cur);
    }, 30);
    return () => clearInterval(t);
  }, [value]);
  return <span>{count}</span>;
}

// ─── SOUND BUTTON ────────────────────────────────────────────────
function SoundButton({ letter, size = 'md' }) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = useCallback((e) => {
    e.stopPropagation();
    setPlaying(true);
    playLetterSound(letter);
    setTimeout(() => setPlaying(false), 800);
  }, [letter]);

  const isSmall = size === 'sm';
  const dim = isSmall ? 28 : 36;
  const iconSize = isSmall ? 12 : 15;

  return (
    <button
      onClick={handlePlay}
      title={`Play sound for ${letter}`}
      style={{
        width: dim, height: dim, borderRadius: '50%',
        border: playing ? '1.5px solid #1a56db' : '1.5px solid #e5e7eb',
        background: playing ? '#eff6ff' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease',
        boxShadow: playing ? '0 0 0 3px rgba(26,86,219,0.15)' : 'none',
        transform: playing ? 'scale(0.94)' : 'scale(1)',
      }}
    >
      {playing ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#1a56db" stroke="none"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
      )}
    </button>
  );
}

// ─── KEYPOINTS OVERLAY ───────────────────────────────────────────
function KeypointsOverlay({ keypoints, coveredInOrder, blockedSet, canvasW, canvasH, show }) {
  if (!show || !keypoints.length) return null;
  const nextExpected = getNextExpectedKPIndex(coveredInOrder);
  return (
    <svg
      style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:8 }}
      viewBox={`0 0 ${canvasW} ${canvasH}`}
      preserveAspectRatio="none"
    >
      {keypoints.map((kp, idx) => {
        const coveredOK = coveredInOrder.includes(idx);
        const isBlocked = blockedSet.has(idx);
        const isNext = idx === nextExpected && !coveredOK;
        const fill = coveredOK
          ? 'rgba(21,128,61,0.9)'
          : isBlocked
            ? 'rgba(220,38,38,0.85)'
            : isNext
              ? 'rgba(26,86,219,0.9)'
              : 'rgba(200,200,210,0.72)';
        const stroke = isNext ? '#1a56db' : 'none';
        const textColor = (coveredOK || isBlocked || isNext) ? '#fff' : '#1a1a2e';
        const r = isNext ? 12 : 10;
        return (
          <g key={idx}>
            {isNext && (
              <circle cx={kp.x} cy={kp.y} r={18} fill="rgba(26,86,219,0.12)" stroke="#1a56db" strokeWidth="1.5" strokeDasharray="4 3"/>
            )}
            <circle cx={kp.x} cy={kp.y} r={r} fill={fill} stroke={stroke} strokeWidth={isNext ? 1.5 : 0}/>
            <text x={kp.x} y={kp.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="11" fontFamily="sans-serif" fontWeight="bold" fill={textColor}>
              {idx + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── BOUNDARY FLASH ──────────────────────────────────────────────
function BoundaryWarningFlash({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position:'absolute', inset:0, pointerEvents:'none', zIndex:15,
      border:'4px solid #e02424', borderRadius:16,
      boxShadow:'inset 0 0 40px rgba(224,36,36,0.25)',
      animation:'boundaryFlash 0.4s ease both',
    }} />
  );
}

// ─── ORDER BLOCK FLASH ────────────────────────────────────────────
function OrderBlockFlash({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position:'absolute', inset:0, pointerEvents:'none', zIndex:15,
      border:'4px solid #f59e0b', borderRadius:16,
      boxShadow:'inset 0 0 40px rgba(245,158,11,0.2)',
      animation:'boundaryFlash 0.35s ease both',
    }} />
  );
}

// ─── LETTER GRID ─────────────────────────────────────────────────
// `categories` now comes in as a prop (fetched from the backend) instead
// of reading the module-level LETTER_CATEGORIES constant.
function LetterGrid({ categories, currentLetter, masteredSet, onSelect }) {
  const [openCat, setOpenCat] = useState(0);
  return (
    <div>
      {categories.map((cat, ci) => {
        const done = cat.letters.filter(l=>masteredSet.has(l.letter)).length;
        const isOpen = openCat===ci;
        return (
          <div key={cat.id} style={{ marginBottom:8 }}>
            <button
              onClick={()=>setOpenCat(isOpen?-1:ci)}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 4px', background:'none', border:'none', cursor:'pointer',
                borderBottom:'0.5px solid #e5e7eb' }}>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:500,
                color:isOpen?'#111':'#888', letterSpacing:'0.05em', textTransform:'uppercase' }}>
                {cat.nameEn}
              </span>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:11,
                color:done===cat.letters.length?'#111':'#aaa' }}>
                {done}/{cat.letters.length}
              </span>
            </button>
            {isOpen && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'10px 0 14px' }}>
                {cat.letters.map(l => {
                  const isMastered=masteredSet.has(l.letter), isCurrent=currentLetter?.letter===l.letter;
                  return (
                    <div key={l.letter} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <button onClick={()=>onSelect(l)} title={`${l.letter} (${l.sound})`}
                        style={{ width:40, height:40, borderRadius:8, display:'flex', alignItems:'center',
                          justifyContent:'center',
                          fontFamily:"'Noto Sans Sinhala',serif",
                          fontSize:18,
                          fontWeight:700, cursor:'pointer',
                          background:isCurrent?'#111':isMastered?'#f0f0f0':'#fafafa',
                          border:isCurrent?'2px solid #111':isMastered?'1.5px solid #111':'1px solid #e5e7eb',
                          color:isCurrent?'#fff':'#111', position:'relative' }}>
                        {l.letter}
                        {isMastered&&!isCurrent&&(
                          <span style={{ position:'absolute', top:-4, right:-4, width:12, height:12,
                            background:'#111', borderRadius:'50%', display:'flex', alignItems:'center',
                            justifyContent:'center' }}>
                            <span style={{ color:'#fff', fontSize:8, lineHeight:1 }}>✓</span>
                          </span>
                        )}
                      </button>
                      <SoundButton letter={l.letter} size="sm" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SCORE OVERLAY ────────────────────────────────────────────────
function ScoreOverlay({ score, grade, onNext, onRetry, isLast }) {
  return (
    <div style={{ position:'absolute', inset:0, borderRadius:16, display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:20, background:'rgba(255,255,255,0.96)',
      animation:'scaleIn 0.4s cubic-bezier(.22,1,.36,1) both' }}>
      <div style={{ textAlign:'center', maxWidth:280, width:'100%', padding:'0 24px' }}>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:80, fontWeight:800, lineHeight:1, color:'#111', marginBottom:8 }}>
          {score}%
        </div>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:22, fontWeight:600, color:'#111', marginBottom:6 }}>{grade.label}</div>
        <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#888', marginBottom:8 }}>{grade.sub}</div>
        <div style={{ fontFamily:'monospace', fontSize:20, letterSpacing:6, color:'#111', marginBottom:28 }}>{grade.symbol}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onRetry} style={{ flex:1, padding:'12px 0', borderRadius:10,
            border:'1px solid #e5e7eb', background:'#fff', fontFamily:'DM Sans,sans-serif',
            fontSize:13, fontWeight:500, color:'#444', cursor:'pointer' }}>Clear &amp; Retry</button>
          <button onClick={onNext} style={{ flex:1, padding:'12px 0', borderRadius:10,
            border:'1px solid #111', background:'#111', fontFamily:'DM Sans,sans-serif',
            fontSize:13, fontWeight:500, color:'#fff', cursor:'pointer' }}>
            {isLast?'Finish':'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LOADING / EMPTY STATES ────────────────────────────────────────
function TracingDataLoading() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:14, fontFamily:'DM Sans,sans-serif', color:'#888', background:'linear-gradient(135deg,#fff8fc 0%,#f3f8ff 45%,#f2fff8 100%)' }}>
      <div style={{ width:32, height:32, border:'2px solid #e5e7eb', borderTopColor:'#111',
        borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <p style={{ fontSize:13 }}>Loading tracing data…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function TracingDataError({ message, onRetry }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:12, fontFamily:'DM Sans,sans-serif', padding:24, textAlign:'center', background:'linear-gradient(135deg,#fff8fc 0%,#f3f8ff 45%,#f2fff8 100%)' }}>
      <p style={{ fontSize:14, color:'#dc2626', maxWidth:420 }}>
        Couldn't load tracing data: {message}
      </p>
      <button onClick={onRetry} style={{ padding:'10px 20px', borderRadius:10, border:'1px solid #111',
        background:'#111', color:'#fff', fontFamily:'DM Sans,sans-serif', fontSize:13, cursor:'pointer' }}>
        Retry
      </button>
    </div>
  );
}

function TracingDataEmpty() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:10, fontFamily:'DM Sans,sans-serif', padding:24, textAlign:'center', background:'linear-gradient(135deg,#fff8fc 0%,#f3f8ff 45%,#f2fff8 100%)' }}>
      <p style={{ fontSize:14, color:'#666', maxWidth:420 }}>
        No tracing letters yet. Add some from the admin "Add Tracing Data" page first.
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function LetterTracingPage() {
  // ── fetched tracing data (replaces hard-coded LETTER_CATEGORIES) ──
  const [letterCategories, setLetterCategories] = useState([]);
  const [dataLoading, setDataLoading]           = useState(true);
  const [dataError, setDataError]               = useState(null);

  const loadTracingData = useCallback(() => {
    setDataLoading(true);
    setDataError(null);
    getFullTracingData()
      .then(data => setLetterCategories(data || []))
      .catch(err => setDataError(err.message || 'Unknown error'))
      .finally(() => setDataLoading(false));
  }, []);

  useEffect(() => { loadTracingData(); }, [loadTracingData]);

  // flatten into the same shape the rest of the component always used:
  // [{ letter, sound, strokes, diff, tip, phases, keypoints, cat }, ...]
  const allLetters = useMemo(
    () => letterCategories.flatMap(catObj =>
      (catObj.letters || []).map(l => ({ ...l, diff: l.difficulty, cat: catObj }))
    ),
    [letterCategories]
  );

  const [currentIdx, setCurrentIdx]     = useState(0);
  const [showGuide, setShowGuide]       = useState(true);
  const [guideOpacity, setGuideOpacity] = useState(0.12);
  const [brushSize, setBrushSize]       = useState(30);
  const [brushColor, setBrushColor]     = useState('#1a56db');
  const [hasDrawn, setHasDrawn]         = useState(false);
  const [isChecking, setIsChecking]     = useState(false);
  const [scoreResult, setScoreResult]   = useState(null);
  const [celebrating, setCelebrating]   = useState(false);
  const [perfectLetterPopup, setPerfectLetterPopup] = useState(null);
  const [points, setPoints]             = useState(0);
  const [masteredSet, setMasteredSet]   = useState(new Set());
  const [progressMap, setProgressMap]   = useState({});
  const [showMilestone, setMilestone]   = useState(false);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const [history, setHistory]           = useState([]);
  const [activePanel, setActivePanel]   = useState('letters');
  const [alertLog, setAlertLog]         = useState([]);
  const [heroVisible, setHeroVisible]   = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const [isMouseDrawing, setIsMouseDrawing] = useState(false);
  const isMouseDrawingRef = useRef(false);
  const isTouchDevice = useRef(false);

  // ── Honeybee tracing companion ──
  // Visual-only overlay: follows the active tracing point without changing
  // any canvas drawing, scoring, keypoint, boundary, or research logic.
  const [beePosition, setBeePosition] = useState({ x: 0, y: 0 });
  const [beeVisible, setBeeVisible] = useState(false);

  // ── Soft side-spread animation for the traced line ──
  // Visual-only effect. It never draws into the real canvas, so scoring,
  // boundary checks, keypoint order and stored tracing pixels stay unchanged.
  const [lineSpreadEffects, setLineSpreadEffects] = useState([]);
  const spreadEffectIdRef = useRef(0);
  const spreadEffectLastRef = useRef(0);

  // ── Star burst animation while tracing ──
  // Visual-only effect. Stars are rendered above the canvas and never change
  // scoring, keypoints, boundary detection, tracing pixels, or research data.
  const [traceStarEffects, setTraceStarEffects] = useState([]);
  const traceStarIdRef = useRef(0);
  const traceStarLastRef = useRef(0);

  const [drawingBlocked, setDrawingBlocked] = useState(false);
  const drawingBlockedRef = useRef(false);

  const [boundaryWarning, setBoundaryWarning] = useState(false);
  const [warningCount, setWarningCount]       = useState(0);
  const allLettersRef = useRef(allLetters);
  useEffect(() => { allLettersRef.current = allLetters; }, [allLetters]);

  const [scaledKP, setScaledKP]             = useState([]);
  const [validTracePoints, setValidTracePoints] = useState([]);
  const [traceProgress, setTraceProgress]   = useState(0);
  const [isComplete, setIsComplete]         = useState(false);
  const [showKP, setShowKP]                 = useState(true);

  const [coveredInOrder, setCoveredInOrder] = useState([]);
  const [blockedKPSet, setBlockedKPSet]     = useState(new Set());
  const [orderBlockFlash, setOrderBlockFlash] = useState(false);
  const [orderBlockMsg, setOrderBlockMsg]   = useState('');
  const coveredInOrderRef = useRef([]);
  const blockedKPSetRef   = useRef(new Set());

  const [fontsReady, setFontsReady] = useState(false);

  const canvasRef       = useRef(null);
  const guideRef        = useRef(null);
  const isDrawRef       = useRef(false);
  const strokesRef      = useRef([]);
  const curStrokeRef    = useRef([]);
  const warningCoolRef  = useRef(0);
  const orderCoolRef    = useRef(0);
  const validPtsRef     = useRef([]);
  const drawCntRef      = useRef(0);
  const isCompleteRef   = useRef(false);

  const showGuideRef = useRef(showGuide);
const showKPRef = useRef(showKP);
const guideOpacityRef = useRef(guideOpacity);
const currentIdxRef = useRef(currentIdx);
const scaledKPRef = useRef(scaledKP);

  useEffect(() => {
  showGuideRef.current = showGuide;
}, [showGuide]);

useEffect(() => {
  showKPRef.current = showKP;
}, [showKP]);

useEffect(() => {
  currentIdxRef.current = currentIdx;
}, [currentIdx]);

useEffect(() => {
  scaledKPRef.current = scaledKP;
}, [scaledKP]);

  useEffect(() => {
    waitForFonts().then(() => {
      setFontsReady(true);
    });
  }, []);

  // clamp currentIdx if the fetched letter list is shorter than before
  useEffect(() => {
    if (allLetters.length > 0 && currentIdx >= allLetters.length) {
      setCurrentIdx(0);
    }
  }, [allLetters, currentIdx]);

  const total = allLetters.length;
  const current = allLetters[currentIdx];

  // ── adaptive / static research mode ──
  // The selected page is controlled by the URL query parameter:
  //   ?mode=adaptive
  //   ?mode=static
  //
  // This keeps both modes directly accessible from the same protected
  // /letter-tracing route without requiring any App.js route changes.
  const location = useLocation();
  const navigate = useNavigate();

  const deviceIdRef = useRef(getOrCreateDeviceId());

  const experimentMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('mode') === 'adaptive' ? 'adaptive' : 'static';
  }, [location.search]);

  const navigateToExperimentMode = useCallback((mode) => {
    if (mode !== 'adaptive' && mode !== 'static') return;
    if (mode === experimentMode) return;

    navigate({
      pathname: '/letter-tracing',
      search: `?mode=${mode}`,
    });
  }, [navigate, experimentMode]);

  const [experimentLog, setExperimentLog] = useState(() => {
    try {
      const stored = localStorage.getItem(ADAPTIVE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const attemptStartRef = useRef(Date.now());

  // ── Recent persistent attempts for this letter ──
//
// Unlike the old implementation, adaptation is not based only on the
// temporary React `history` state. experimentLog is backed by localStorage,
// so the child's recent performance survives page refreshes on this device.
const recentAttemptsForCurrentLetter = useMemo(() => {
  if (!current) return [];

  return getValidRecentAttempts(
    experimentLog,
    current.letter,
    experimentMode,
    ADAPTIVE_RECENT_N
  );
}, [experimentLog, current, experimentMode]);

// ── Research support condition ──
//
// Adaptive:
//   0 previous valid attempts -> admin-defined baseline
//   1-3 previous attempts     -> performance-based support
//
// Static:
//   always stays at the same admin-defined baseline
const supportSettings = useMemo(() => {
  if (!current) {
    return getStaticSupportSettings('Medium');
  }

  if (experimentMode === 'adaptive') {
    return getAdaptiveSupportSettings({
      baseDifficulty: current.diff,
      recentAttempts: recentAttemptsForCurrentLetter,
    });
  }

  return getStaticSupportSettings(current.diff);
}, [
  current,
  experimentMode,
  recentAttemptsForCurrentLetter,
]);

const effectiveGuideOpacity =
  supportSettings.guideOpacity;

const kpTouchMultiplier =
  supportSettings.kpTouchMultiplier;

const boundaryMultiplier =
  supportSettings.boundaryMultiplier;

const kpTouchMultiplierRef =
  useRef(kpTouchMultiplier);

const boundaryMultiplierRef =
  useRef(boundaryMultiplier);

useEffect(() => {
  kpTouchMultiplierRef.current =
    kpTouchMultiplier;
}, [kpTouchMultiplier]);

useEffect(() => {
  boundaryMultiplierRef.current =
    boundaryMultiplier;
}, [boundaryMultiplier]);

useEffect(() => {
  guideOpacityRef.current =
    effectiveGuideOpacity;
}, [effectiveGuideOpacity]);

  // converts a local log entry (ts-based) into the shape the backend expects
  // (clientTimestampMs + deviceId)
  const toServerPayload = useCallback((entry) => ({
  deviceId: deviceIdRef.current,
  clientTimestampMs: entry.ts,

  mode: entry.mode,
  letter: entry.letter,
  category: entry.category,
  score: entry.score,

  // Existing numeric field retained for backward compatibility.
  difficulty: entry.difficulty,

  // New research variables.
  baseDifficulty: entry.baseDifficulty,
  supportLevel: entry.supportLevel,
  recentAverageScore: entry.recentAverageScore,
  recentAttemptCount: entry.recentAttemptCount,
  attemptType: entry.attemptType,
  completed: entry.completed,
  guideVisible: entry.guideVisible,
  keypointsVisible: entry.keypointsVisible,

  guideOpacityUsed: entry.guideOpacityUsed,
  kpTouchMultiplierUsed: entry.kpTouchMultiplierUsed,
  boundaryMultiplierUsed: entry.boundaryMultiplierUsed,

  warningCount: entry.warningCount,
  durationMs: entry.durationMs,
}), []);

  // Silent instrumentation only — no UI in this page reads experimentLog
  // anymore. It stays in localStorage purely as an offline-resilience
  // backup; the Research Dashboard page is the actual place this data
  // gets reviewed/exported from (server-side, across every device).
  const logExperimentEntry = useCallback(
  (rawScore, attemptType = 'manual_check') => {
    if (!current) return;

    const numericScore = Number(rawScore);

    // Never put invalid scores into either the adaptive history
    // or the research dataset.
    if (
      !Number.isFinite(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      console.warn(
        'Ignoring invalid tracing score:',
        rawScore
      );
      return;
    }

    const entry = {
      ts: Date.now(),

      mode: experimentMode,

      letter: current.letter,
      category: current.cat.nameEn,

      score: numericScore,

      // This numeric field existed in the original schema.
      // Static mode deliberately leaves it null because the
      // static condition does not calculate adaptive difficulty.
      difficulty:
        experimentMode === 'adaptive'
          ? supportSettings.adaptiveDifficultyScore
          : null,

      // New research variables.
      baseDifficulty: supportSettings.baseDifficulty,
      supportLevel: supportSettings.supportLevel,

      recentAverageScore:
        supportSettings.recentAverageScore,

      recentAttemptCount:
        supportSettings.recentAttemptCount,

      attemptType,
      completed: true,

      guideVisible: showGuideRef.current,
      keypointsVisible: showKPRef.current,

      guideOpacityUsed: effectiveGuideOpacity,
      kpTouchMultiplierUsed: kpTouchMultiplier,
      boundaryMultiplierUsed: boundaryMultiplier,

      warningCount,

      durationMs:
        Math.max(
          0,
          Date.now() - attemptStartRef.current
        ),
    };

    setExperimentLog((prev) => {
      const next = [...prev, entry];

      try {
        localStorage.setItem(
          ADAPTIVE_STORAGE_KEY,
          JSON.stringify(next)
        );
      } catch {
        // localStorage failure must never interrupt tracing
      }

      return next;
    });

    // Best-effort central research logging.
    logExperimentEntryToServer(
      toServerPayload(entry)
    ).catch(() => {
      // Backend/network failure does not interrupt the child.
      // The localStorage copy remains available.
    });
  },
  [
    current,
    experimentMode,
    supportSettings,
    effectiveGuideOpacity,
    kpTouchMultiplier,
    boundaryMultiplier,
    warningCount,
    toServerPayload,
  ]
);

  const logAlert = useCallback((text, type = 'info') => {
    const d = new Date();
    const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    setAlertLog(prev => [...prev.slice(-14), { text, type, time }]);
  }, []);

  const buildGuideCanvas = useCallback((letter, w, h) => {
    const gc=document.createElement('canvas');
    gc.width=w; gc.height=h;
    const ctx=gc.getContext('2d');
    ctx.font=`900 ${Math.round(h*0.65)}px "Noto Sans Sinhala",serif`;
    ctx.fillStyle='#000'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(letter, w/2, h/2+h*0.04);
    guideRef.current=gc;
  }, []);

  const drawBackground = useCallback(() => {
    const canvas=canvasRef.current; if (!canvas) return;
    const letterObj = allLettersRef.current[currentIdxRef.current];
    if (!letterObj) return;
    const ctx=canvas.getContext('2d');
    const {width:w,height:h}=canvas;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#fafafa'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=1; ctx.setLineDash([]);
    for (let y=60;y<h;y+=60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    ctx.strokeStyle='#d1d5db'; ctx.lineWidth=1.5; ctx.setLineDash([6,6]);
    ctx.beginPath(); ctx.moveTo(0,h*0.72); ctx.lineTo(w,h*0.72); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(48,0); ctx.lineTo(48,h); ctx.stroke();
    if (showGuideRef.current) {
      const letter = letterObj.letter;
      ctx.font=`900 ${Math.round(h*0.65)}px "Noto Sans Sinhala",serif`;
      ctx.fillStyle=`rgba(17,17,17,${guideOpacityRef.current})`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(letter, w/2, h/2+h*0.04);
    }
  }, []);

  const updateTraceProgress = useCallback(() => {
    const kps = scaledKPRef.current; if (!kps.length) return 0;
    const covered = coveredInOrderRef.current;
    const pct2 = Math.min(100, (covered.length / kps.length) * 100);
    setTraceProgress(pct2);
    setValidTracePoints([...validPtsRef.current]);
    return pct2;
  }, []);

  const computeKPScore = useCallback(() => {
    const kps = scaledKPRef.current;
    if (!kps.length) return computeAccuracy(canvasRef.current, guideRef.current);
    const inOrderCount = coveredInOrderRef.current.length;
    const totalKPs = kps.length;
    const baseScore = Math.round((inOrderCount / totalKPs) * 100);
    return Math.min(100, baseScore);
  }, []);

  const awardMastery = useCallback((raw) => {
    if (!current) return;
    if (!masteredSet.has(current.letter)) {
      const nm = new Set([...masteredSet, current.letter]);
      setMasteredSet(nm);
      if (nm.size%5===0) { setMilestoneCount(nm.size); setMilestone(true); setTimeout(()=>setMilestone(false),3500); }
    }
    setPoints(p=>p+Math.round(raw/8));
    setProgressMap(pm=>({ ...pm, [current.letter]:Math.max(pm[current.letter]??0,raw) }));
    setHistory(h=>[{letter:current.letter,score:raw,cat:current.cat.nameEn,ts:Date.now()},...h].slice(0,50));
  }, [current, masteredSet]);

  const handleAutoComplete = useCallback(() => {
    if (isCompleteRef.current) return;
    isCompleteRef.current = true;
    setIsComplete(true);
    const raw = computeKPScore();
    setCelebrating(true);
    setTimeout(()=>setCelebrating(false),1600);
    if (raw === 100) {
      setPerfectLetterPopup(current.letter);
      setTimeout(() => setPerfectLetterPopup(null), 3000);
    }
    logAlert('Excellent — perfect tracing!', 'done');
    logExperimentEntry(
  raw,
  'auto_complete'
);

awardMastery(raw);

    setTimeout(()=>{
      isCompleteRef.current=false;
      setIsComplete(false);
      setScoreResult(null);
      setCurrentIdx(i=>i<total-1?i+1:0);
    }, raw === 100 ? 3200 : 2000);
  }, [
  computeKPScore,
  awardMastery,
  logAlert,
  logExperimentEntry,
  total,
  current
]);

  const resetOrderTracking = useCallback(() => {
    coveredInOrderRef.current = [];
    blockedKPSetRef.current = new Set();
    setCoveredInOrder([]);
    setBlockedKPSet(new Set());
    setOrderBlockFlash(false);
    setOrderBlockMsg('');
  }, []);

  const initCanvas = useCallback(() => {
    const canvas=canvasRef.current; if (!canvas) return;
    const letterObj = allLettersRef.current[currentIdxRef.current];
    if (!letterObj) return;
    waitForFonts().then(() => {
      buildGuideCanvas(letterObj.letter, canvas.width, canvas.height);
      const kps=getScaledKP(letterObj.keypoints);
      setScaledKP(kps);
      scaledKPRef.current = kps;
      drawBackground();
      setHasDrawn(false); setScoreResult(null);
      setBoundaryWarning(false); setWarningCount(0);
      setValidTracePoints([]); setTraceProgress(0);
      setIsComplete(false); isCompleteRef.current=false;
      validPtsRef.current=[]; drawCntRef.current=0;
      strokesRef.current=[]; curStrokeRef.current=[];
      setAlertLog([]);
      setDrawingBlocked(false); drawingBlockedRef.current = false;
      setIsMouseDrawing(false); isMouseDrawingRef.current = false;
      isDrawRef.current = false;
      resetOrderTracking();
      attemptStartRef.current = Date.now();
      logAlert(`Ready to trace ${letterObj.letter} — ${letterObj.phases?.[0] ?? ''}`, 'start');
    });
  }, [buildGuideCanvas, drawBackground, logAlert, resetOrderTracking]);

  useEffect(() => {
    if (fontsReady && current) {
      initCanvas();
    }
  }, [currentIdx, fontsReady, current, experimentMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (current) drawBackground(); }, [showGuide, effectiveGuideOpacity, drawBackground, current]);

  useEffect(()=>{
    playIntroSound();
    setTimeout(()=>setHeroVisible(true),80);
    setTimeout(()=>setShowProgress(true),500);
  },[]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preventScroll = (e) => { e.preventDefault(); };
    canvas.addEventListener('mousedown', preventScroll, { passive: false });
    canvas.addEventListener('touchstart', preventScroll, { passive: false });
    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      canvas.removeEventListener('mousedown', preventScroll);
      canvas.removeEventListener('touchstart', preventScroll);
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const getPos = (e) => {
    const canvas=canvasRef.current;
    const rect=canvas.getBoundingClientRect();
    const sx=canvas.width/rect.width, sy=canvas.height/rect.height;
    const src=e.touches?e.touches[0]:e;
    return { x:(src.clientX-rect.left)*sx, y:(src.clientY-rect.top)*sy };
  };

  const updateBeePosition = useCallback((x, y) => {
    setBeePosition({
      x: (x / CANVAS_W) * 100,
      y: (y / CANVAS_H) * 100,
    });
  }, []);

  const spawnLineSpreadEffect = useCallback((x, y) => {
    const now = Date.now();
    if (now - spreadEffectLastRef.current < 38) return;
    spreadEffectLastRef.current = now;

    const id = ++spreadEffectIdRef.current;
    const effect = {
      id,
      x: (x / CANVAS_W) * 100,
      y: (y / CANVAS_H) * 100,
    };

    setLineSpreadEffects(prev => [...prev.slice(-10), effect]);
    setTimeout(() => {
      setLineSpreadEffects(prev => prev.filter(item => item.id !== id));
    }, 460);
  }, []);



  const spawnTraceStars = useCallback((x, y) => {
    const now = Date.now();
    if (now - traceStarLastRef.current < 70) return;
    traceStarLastRef.current = now;

    const colors = ['#facc15', '#fb7185', '#60a5fa', '#a78bfa', '#34d399', '#fb923c'];
    const newStars = Array.from({ length: 4 }, (_, i) => {
      const id = ++traceStarIdRef.current;
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 26;
      return {
        id,
        x: (x / CANVAS_W) * 100,
        y: (y / CANVAS_H) * 100,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - (8 + Math.random() * 10),
        size: 8 + Math.random() * 7,
        rotate: 80 + Math.random() * 180,
        color: colors[(id + i) % colors.length],
        delay: i * 0.025,
      };
    });

    const ids = new Set(newStars.map(star => star.id));
    setTraceStarEffects(prev => [...prev.slice(-28), ...newStars]);
    setTimeout(() => {
      setTraceStarEffects(prev => prev.filter(star => !ids.has(star.id)));
    }, 700);
  }, []);

  const checkAndHandleBoundary = useCallback((px, py) => {
    const onLetter = isOnLetterBoundary(px, py, guideRef.current, boundaryMultiplierRef.current);
    if (!onLetter) {
      if (!drawingBlockedRef.current) {
        drawingBlockedRef.current = true;
        setDrawingBlocked(true);
        isDrawRef.current = false;
        const now = Date.now();
        if (now - warningCoolRef.current > 600) {
          warningCoolRef.current = now;
          setBoundaryWarning(true);
          setWarningCount(c => c + 1);
          playWarningSound();
          triggerBoundaryVibration();
          const time = new Date().toTimeString().slice(0, 8);
          setAlertLog(prev => [...prev.slice(-14), {
            text: `⚠ ශ්‍රේෂ්ඨ ලකුණෙන් පිටත! Drawing blocked — return to the letter to continue.`,
            type: 'warning', time,
          }]);
          setTimeout(() => setBoundaryWarning(false), 500);
        }
      }
      return false;
    } else {
      if (drawingBlockedRef.current) {
        drawingBlockedRef.current = false;
        setDrawingBlocked(false);
      }
      return true;
    }
  }, []);

  const tryHitKeypoint = useCallback((px, py) => {
    const kps = scaledKPRef.current;
    if (!kps.length) return 'none';

    for (let idx = 0; idx < kps.length; idx++) {
      const kp = kps[idx];
      if (Math.hypot(px - kp.x, py - kp.y) > KP_TOUCH * kpTouchMultiplierRef.current) continue;

      if (coveredInOrderRef.current.includes(idx)) return 'none';

      const inValidRange = isKPInValidOrderRange(idx, coveredInOrderRef.current, kps.length);

      if (inValidRange) {
        coveredInOrderRef.current = [...coveredInOrderRef.current, idx];
        setCoveredInOrder([...coveredInOrderRef.current]);
        const newBlocked = new Set(blockedKPSetRef.current);
        newBlocked.delete(idx);
        blockedKPSetRef.current = newBlocked;
        setBlockedKPSet(new Set(newBlocked));
        validPtsRef.current.push({ x: px, y: py });
        return 'ok';
      } else {
        const now = Date.now();
        const newBlocked = new Set(blockedKPSetRef.current);
        newBlocked.add(idx);
        blockedKPSetRef.current = newBlocked;
        setBlockedKPSet(new Set(newBlocked));

        if (now - orderCoolRef.current > 800) {
          orderCoolRef.current = now;
          const nextExp = getNextExpectedKPIndex(coveredInOrderRef.current);
          const msg = `❌ Wrong order! You hit #${idx + 1} but next should be #${nextExp + 1}`;
          setOrderBlockMsg(msg);
          setOrderBlockFlash(true);
          setTimeout(() => setOrderBlockFlash(false), 400);
          playOrderBlockSound();
          triggerOrderVibration();
          logAlert(msg, 'warning');
        }
        return 'blocked';
      }
    }
    return 'none';
  }, [logAlert]);

  const handleMouseDown = (e) => {
    if (isTouchDevice.current) return;
    e.preventDefault();
    if (scoreResult || isCompleteRef.current) return;

    const { x, y } = getPos(e);
    updateBeePosition(x, y);

    if (!isMouseDrawingRef.current) {
      const onLetter = checkAndHandleBoundary(x, y);
      if (!onLetter) return;

      if (scaledKPRef.current.length > 0) {
        const kpResult = tryHitKeypoint(x, y);
        if (kpResult === 'blocked') return;
      }

      isMouseDrawingRef.current = true;
      setIsMouseDrawing(true);
      setBeeVisible(true);
      isDrawRef.current = true;
      setHasDrawn(true);
      curStrokeRef.current = [{ x, y }];
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath(); ctx.moveTo(x, y);
    } else {
      isMouseDrawingRef.current = false;
      setIsMouseDrawing(false);
      setBeeVisible(false);
      isDrawRef.current = false;
      strokesRef.current.push([...curStrokeRef.current]);
      curStrokeRef.current = [];
      drawingBlockedRef.current = false;
      setDrawingBlocked(false);
      const pct2 = updateTraceProgress();
      if (pct2 >= 95 && !isCompleteRef.current) handleAutoComplete();
    }
  };

  const handleMouseMove = (e) => {
    if (isTouchDevice.current) return;
    e.preventDefault();
    if (scoreResult || isCompleteRef.current) return;
    if (!isMouseDrawingRef.current) return;

    const { x, y } = getPos(e);
    updateBeePosition(x, y);

    const onLetter = checkAndHandleBoundary(x, y);
    if (!onLetter) {
      return;
    }

    if (!isDrawRef.current && isMouseDrawingRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      isDrawRef.current = true;
      curStrokeRef.current.push({ x, y });
      ctx.beginPath(); ctx.moveTo(x, y);
      return;
    }

    if (!isDrawRef.current) return;

    if (scaledKPRef.current.length > 0) {
      const kpResult = tryHitKeypoint(x, y);
      if (kpResult === 'blocked') {
        isDrawRef.current = false;
        strokesRef.current.push([...curStrokeRef.current]);
        curStrokeRef.current = [];
        setTimeout(() => {
          if (isMouseDrawingRef.current && !drawingBlockedRef.current) {
            isDrawRef.current = true;
            curStrokeRef.current = [];
            const ctx = canvasRef.current.getContext('2d');
            ctx.beginPath(); ctx.moveTo(x, y);
          }
        }, 300);
        return;
      }
    }

    spawnLineSpreadEffect(x, y);
    spawnTraceStars(x, y);
    curStrokeRef.current.push({ x, y });
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = brushColor; ctx.lineWidth = brushSize;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineTo(x, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y);

    drawCntRef.current++;
    if (drawCntRef.current % 5 === 0) {
      const pct2 = updateTraceProgress();
      if (pct2 >= 95 && !isCompleteRef.current) handleAutoComplete();
    }
  };

  const handleMouseLeave = (e) => {
    if (isTouchDevice.current) return;
    setBeeVisible(false);
    if (isDrawRef.current) {
      isDrawRef.current = false;
      strokesRef.current.push([...curStrokeRef.current]);
      curStrokeRef.current = [];
    }
  };

  const handleMouseEnter = (e) => {
    if (isTouchDevice.current) return;
    if (isMouseDrawingRef.current && !drawingBlockedRef.current && !scoreResult && !isCompleteRef.current) {
      isDrawRef.current = true;
      const { x, y } = getPos(e);
      updateBeePosition(x, y);
      setBeeVisible(true);
      curStrokeRef.current = [{ x, y }];
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath(); ctx.moveTo(x, y);
    }
  };

  const startDrawTouch = (e) => {
    isTouchDevice.current = true;
    e.preventDefault();
    if (scoreResult || isCompleteRef.current) return;

    const { x, y } = getPos(e);
    updateBeePosition(x, y);
    const onLetter = checkAndHandleBoundary(x, y);
    if (!onLetter) return;

    if (scaledKPRef.current.length > 0) {
      const kpResult = tryHitKeypoint(x, y);
      if (kpResult === 'blocked') return;
    }

    isDrawRef.current = true;
    setBeeVisible(true);
    setHasDrawn(true);
    curStrokeRef.current = [{ x, y }];
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const drawTouch = (e) => {
    e.preventDefault();
    if (scoreResult || isCompleteRef.current) return;

    const { x, y } = getPos(e);
    updateBeePosition(x, y);
    setBeeVisible(true);
    const onLetter = checkAndHandleBoundary(x, y);

    if (!isDrawRef.current || !onLetter) {
      if (onLetter && !isDrawRef.current && !scoreResult && !isCompleteRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        isDrawRef.current = true;
        curStrokeRef.current.push({ x, y });
        ctx.beginPath(); ctx.moveTo(x, y);
      }
      return;
    }

    if (scaledKPRef.current.length > 0) {
      const kpResult = tryHitKeypoint(x, y);
      if (kpResult === 'blocked') {
        isDrawRef.current = false;
        strokesRef.current.push([...curStrokeRef.current]);
        curStrokeRef.current = [];
        setTimeout(() => {
          if (!drawingBlockedRef.current) {
            isDrawRef.current = true;
            curStrokeRef.current = [];
          }
        }, 300);
        return;
      }
    }

    spawnLineSpreadEffect(x, y);
    spawnTraceStars(x, y);
    curStrokeRef.current.push({ x, y });
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = brushColor; ctx.lineWidth = brushSize;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineTo(x, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y);

    drawCntRef.current++;
    if (drawCntRef.current % 5 === 0) {
      const pct2 = updateTraceProgress();
      if (pct2 >= 95 && !isCompleteRef.current) handleAutoComplete();
    }
  };

  const stopDrawTouch = useCallback(() => {
    setBeeVisible(false);
    if (!isDrawRef.current) return;
    isDrawRef.current = false;
    strokesRef.current.push([...curStrokeRef.current]);
    curStrokeRef.current = [];
    drawingBlockedRef.current = false;
    setDrawingBlocked(false);
    const pct2 = updateTraceProgress();
    if (pct2 >= 95 && !isCompleteRef.current) handleAutoComplete();
  }, [updateTraceProgress, handleAutoComplete]);

  const handleClear = () => {
    setPerfectLetterPopup(null);
    drawBackground();
    setHasDrawn(false); setScoreResult(null);
    setBoundaryWarning(false); setWarningCount(0);
    setValidTracePoints([]); setTraceProgress(0);
    setIsComplete(false); isCompleteRef.current = false;
    validPtsRef.current = []; drawCntRef.current = 0;
    strokesRef.current = []; curStrokeRef.current = [];
    setDrawingBlocked(false); drawingBlockedRef.current = false;
    setIsMouseDrawing(false); isMouseDrawingRef.current = false;
    setLineSpreadEffects([]);
    setTraceStarEffects([]);
    setBeeVisible(false);
    isDrawRef.current = false;
    resetOrderTracking();
    attemptStartRef.current = Date.now();
    logAlert('Canvas cleared — ready to trace again', 'info');
  };

  const handleCheck = () => {
    if (!hasDrawn || isChecking || isCompleteRef.current) return;
    setIsChecking(true);
    setTimeout(() => {
      const raw = computeKPScore();
      const grade = getGrade(raw);
      setScoreResult({ score: raw, grade });
      setIsChecking(false);
      logExperimentEntry(
  raw,
  'manual_check'
);

awardMastery(raw);

      if (raw >= 90) logAlert('Excellent — perfect tracing!', 'done');
      else if (raw >= 75) logAlert('Very good — great technique!', 'done');
      else if (raw >= 60) logAlert('Good effort — keep it up!', 'done');
      else logAlert('Keep practising — you will get it!', 'done');
      if (raw >= 80) { setCelebrating(true); setTimeout(() => setCelebrating(false), 1600); }
    }, 400);
  };

  const handleNext  = () => { handleClear(); setCurrentIdx(i => i < total - 1 ? i + 1 : 0); };
  const handlePrev  = () => { if (currentIdx > 0) { handleClear(); setCurrentIdx(i => i - 1); } };
  const handleRetry = () => { handleClear(); setScoreResult(null); };
  const handleSelectLetter = l => {
    const idx = allLetters.findIndex(a => a.letter === l.letter);
    if (idx !== -1) { handleClear(); setCurrentIdx(idx); }
  };

  const progressStats = [
    {label:'Points',   value:points,           suffix:''},
    {label:'Mastered', value:masteredSet.size,  suffix:''},
    {label:'Accuracy', value: history.length>0
        ? Math.round(history.slice(0,10).reduce((a,h)=>a+h.score,0)/Math.min(history.length,10))
        : 0, suffix:'%'},
  ];

  // ── loading / error / empty gates ──
  if (dataLoading) return <TracingDataLoading/>;
  if (dataError) return <TracingDataError message={dataError} onRetry={loadTracingData}/>;
  if (!current || total === 0) return <TracingDataEmpty/>;

  const cat     = current.cat;
  const pct     = Math.round(((currentIdx+1)/total)*100);
  const bestScore = progressMap[current.letter] ?? 0;
  const accuracy  = history.length>0
    ? Math.round(history.slice(0,10).reduce((a,h)=>a+h.score,0)/Math.min(history.length,10))
    : 0;
  const chartBars = (() => { const b=history.slice(0,7).reverse().map(h=>h.score); while(b.length<7) b.unshift(0); return b; })();

  const nextKPIndex = getNextExpectedKPIndex(coveredInOrder);

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, #fff8fc 0%, #f3f8ff 30%, #f2fff8 62%, #fffbea 100%)',
      fontFamily:'DM Sans,sans-serif',
      color:'#111',
      paddingTop:80,
      position:'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        .fd{font-family:'Playfair Display',serif}
        .fb{font-family:'DM Sans',sans-serif}
        .sinhala{font-family:'Noto Sans Sinhala',serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
        @keyframes milestoneUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes boundaryFlash{0%{opacity:0}20%{opacity:1}60%{opacity:0.8}100%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes clickPulse{0%{transform:scale(1)}50%{transform:scale(0.96)}100%{transform:scale(1)}}
        @keyframes beeBuzz{0%,100%{transform:translate(-50%,-58%) rotate(-7deg) scale(1)}50%{transform:translate(-50%,-64%) rotate(7deg) scale(1.06)}}
        @keyframes traceSpreadLeft{0%{opacity:.55;transform:translate(-50%,-50%) translateX(0) scaleX(.35) scaleY(.7)}65%{opacity:.28}100%{opacity:0;transform:translate(-50%,-50%) translateX(-22px) scaleX(1.25) scaleY(.25)}}
        @keyframes traceSpreadRight{0%{opacity:.55;transform:translate(-50%,-50%) translateX(0) scaleX(.35) scaleY(.7)}65%{opacity:.28}100%{opacity:0;transform:translate(-50%,-50%) translateX(22px) scaleX(1.25) scaleY(.25)}}
        @keyframes traceSpreadGlow{0%{opacity:.28;transform:translate(-50%,-50%) scale(.45)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.8)}}
        @keyframes traceStarBurst{0%{opacity:0;transform:translate(-50%,-50%) scale(.35) rotate(0deg)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(20deg)}100%{opacity:0;transform:translate(calc(-50% + var(--star-x)),calc(-50% + var(--star-y))) scale(.45) rotate(var(--star-r))}}
        @keyframes perfectLetterPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.28) rotate(-10deg)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.16) rotate(3deg)}27%{transform:translate(-50%,-50%) scale(.96) rotate(-1deg)}40%{transform:translate(-50%,-50%) scale(1.03) rotate(0)}78%{opacity:1;transform:translate(-50%,-50%) scale(1.03) rotate(0)}100%{opacity:0;transform:translate(-50%,-56%) scale(1.14) rotate(0)}}
        @keyframes perfectLetterRing{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}16%{opacity:.9}72%{opacity:.68;transform:translate(-50%,-50%) scale(1.18)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}
        @keyframes perfectSparkle{0%{opacity:0;transform:translate(-50%,-50%) scale(.25) rotate(0)}18%{opacity:1}72%{opacity:1}100%{opacity:0;transform:translate(var(--spark-x),var(--spark-y)) scale(1.35) rotate(160deg)}}
        @keyframes kidFloatOne{0%,100%{transform:translate3d(0,0,0) rotate(-4deg)}50%{transform:translate3d(0,-16px,0) rotate(4deg)}}
        @keyframes kidFloatTwo{0%,100%{transform:translate3d(0,0,0) rotate(3deg)}50%{transform:translate3d(10px,-12px,0) rotate(-3deg)}}
        @keyframes kidTwinkle{0%,100%{opacity:.35;transform:scale(.8) rotate(0deg)}50%{opacity:.9;transform:scale(1.15) rotate(16deg)}}
        @keyframes cloudDrift{0%,100%{transform:translateX(0)}50%{transform:translateX(18px)}}
        @keyframes sinhalaLetterFall{
          0%{transform:translate3d(0,-12vh,0) rotate(0deg);opacity:0}
          8%{opacity:.34}
          86%{opacity:.28}
          100%{transform:translate3d(var(--fall-drift,0px),112vh,0) rotate(var(--fall-rotate,180deg));opacity:0}
        }
        .kid-decor{position:fixed;pointer-events:none;user-select:none;z-index:0}
        .kid-soft-card{box-shadow:0 10px 35px rgba(89,105,160,.08)}
        @media (prefers-reduced-motion:reduce){
          .kid-decor{animation:none!important}
        }
        .afu{animation:fadeUp 0.7s cubic-bezier(.22,1,.36,1) both}
        .afi{animation:fadeIn 0.5s ease both}
        .asi{animation:scaleIn 0.5s cubic-bezier(.22,1,.36,1) both}
        .d1{animation-delay:0.1s}.d2{animation-delay:0.22s}.d3{animation-delay:0.38s}
        canvas{touch-action:none;display:block}
        button{transition:all 0.2s ease}
        button:hover{opacity:0.85}
        button:active{transform:scale(0.98)}
        .ptab{background:#111!important;color:#fff!important}
        input[type=range]{-webkit-appearance:none;appearance:none;height:2px;background:#e5e7eb;border-radius:2px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#111;cursor:pointer;border:2px solid #fff;box-shadow:0 0 0 1px #111}
        .mtoast{animation:milestoneUp 0.5s cubic-bezier(.22,1,.36,1) both}
        .log-e{animation:fadeIn 0.3s ease both}
        .wbadge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;background:#fef2f2;border:0.5px solid #fca5a5;font-family:'DM Sans',sans-serif;font-size:11px;color:#dc2626;font-weight:500}
        .drawing-active-cursor{cursor:crosshair!important;}
        .drawing-inactive-cursor{cursor:pointer!important;}
        .blocked-cursor{cursor:not-allowed!important;}
        @media (max-width:1100px){.lower-tools-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}}
        @media (max-width:700px){.lower-tools-grid{grid-template-columns:1fr!important;}}
      `}</style>

      {/* Falling Sinhala letters — decorative background only */}
      <div
        aria-hidden="true"
        style={{
          position:'fixed',
          inset:0,
          overflow:'hidden',
          pointerEvents:'none',
          userSelect:'none',
          zIndex:0,
        }}
      >
        {[
          {letter:'අ', left:'4%',  size:25, delay:'-1s',  duration:'13s', color:'#f472b6', drift:'24px', rotate:'190deg'},
          {letter:'ආ', left:'12%', size:30, delay:'-8s',  duration:'16s', color:'#60a5fa', drift:'-18px', rotate:'-150deg'},
          {letter:'ඇ', left:'20%', size:22, delay:'-4s',  duration:'12s', color:'#34d399', drift:'20px', rotate:'170deg'},
          {letter:'ඉ', left:'28%', size:28, delay:'-11s', duration:'17s', color:'#a78bfa', drift:'-22px', rotate:'-200deg'},
          {letter:'උ', left:'36%', size:24, delay:'-6s',  duration:'14s', color:'#fb923c', drift:'16px', rotate:'145deg'},
          {letter:'එ', left:'44%', size:31, delay:'-2s',  duration:'18s', color:'#38bdf8', drift:'-26px', rotate:'215deg'},
          {letter:'ක', left:'52%', size:23, delay:'-10s', duration:'13s', color:'#facc15', drift:'20px', rotate:'-175deg'},
          {letter:'ග', left:'60%', size:29, delay:'-5s',  duration:'15s', color:'#fb7185', drift:'-18px', rotate:'165deg'},
          {letter:'ච', left:'68%', size:26, delay:'-13s', duration:'19s', color:'#818cf8', drift:'24px', rotate:'210deg'},
          {letter:'ට', left:'76%', size:22, delay:'-7s',  duration:'14s', color:'#2dd4bf', drift:'-20px', rotate:'-155deg'},
          {letter:'ත', left:'84%', size:30, delay:'-3s',  duration:'16s', color:'#c084fc', drift:'18px', rotate:'185deg'},
          {letter:'ප', left:'92%', size:24, delay:'-9s',  duration:'15s', color:'#f59e0b', drift:'-24px', rotate:'-190deg'},
          {letter:'ම', left:'8%',  size:21, delay:'-15s', duration:'20s', color:'#22c55e', drift:'18px', rotate:'155deg'},
          {letter:'ය', left:'32%', size:27, delay:'-14s', duration:'21s', color:'#ec4899', drift:'-16px', rotate:'205deg'},
          {letter:'ර', left:'56%', size:20, delay:'-12s', duration:'18s', color:'#3b82f6', drift:'22px', rotate:'-165deg'},
          {letter:'ල', left:'80%', size:28, delay:'-16s', duration:'22s', color:'#8b5cf6', drift:'-20px', rotate:'195deg'},
        ].map((item, index) => (
          <span
            key={`falling-sinhala-${index}`}
            style={{
              position:'absolute',
              top:'-12vh',
              left:item.left,
              fontFamily:"'Noto Sans Sinhala', sans-serif",
              fontWeight:800,
              fontSize:item.size,
              lineHeight:1,
              color:item.color,
              opacity:0,
              textShadow:'0 3px 10px rgba(255,255,255,.85)',
              animation:`sinhalaLetterFall ${item.duration} linear ${item.delay} infinite`,
              '--fall-drift':item.drift,
              '--fall-rotate':item.rotate,
              willChange:'transform, opacity',
            }}
          >
            {item.letter}
          </span>
        ))}
      </div>

      {/* Decorative child-friendly background layer — visual only */}
      <div className="kid-decor" aria-hidden="true" style={{
        top:118, left:22, width:72, height:72, opacity:.72,
        animation:'kidFloatOne 5.2s ease-in-out infinite',
      }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path d="M20 65 A30 30 0 0 1 80 65" fill="none" stroke="#fb7185" strokeWidth="10" strokeLinecap="round"/>
          <path d="M28 65 A22 22 0 0 1 72 65" fill="none" stroke="#fbbf24" strokeWidth="9" strokeLinecap="round"/>
          <path d="M36 65 A14 14 0 0 1 64 65" fill="none" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round"/>
          <circle cx="19" cy="68" r="10" fill="#ffffff" opacity=".95"/>
          <circle cx="29" cy="68" r="13" fill="#ffffff" opacity=".95"/>
          <circle cx="75" cy="68" r="12" fill="#ffffff" opacity=".95"/>
          <circle cx="84" cy="68" r="9" fill="#ffffff" opacity=".95"/>
        </svg>
      </div>

      <div className="kid-decor" aria-hidden="true" style={{
        top:180, right:30, width:92, height:52, opacity:.78,
        animation:'cloudDrift 6.4s ease-in-out infinite',
      }}>
        <svg viewBox="0 0 130 72" width="100%" height="100%">
          <ellipse cx="65" cy="49" rx="55" ry="18" fill="#ffffff"/>
          <circle cx="45" cy="34" r="22" fill="#ffffff"/>
          <circle cx="72" cy="26" r="27" fill="#ffffff"/>
          <circle cx="94" cy="38" r="20" fill="#ffffff"/>
          <circle cx="45" cy="55" r="4" fill="#93c5fd" opacity=".8"/>
          <circle cx="67" cy="59" r="4" fill="#c4b5fd" opacity=".8"/>
          <circle cx="89" cy="55" r="4" fill="#86efac" opacity=".8"/>
        </svg>
      </div>

      <div className="kid-decor" aria-hidden="true" style={{
        top:'39%', left:12, fontSize:25, opacity:.55,
        animation:'kidTwinkle 3.6s ease-in-out infinite',
      }}>★</div>
      <div className="kid-decor" aria-hidden="true" style={{
        top:'55%', right:18, fontSize:22, color:'#a78bfa', opacity:.55,
        animation:'kidTwinkle 4.1s ease-in-out .8s infinite',
      }}>✦</div>
      <div className="kid-decor" aria-hidden="true" style={{
        bottom:86, right:42, fontSize:38, opacity:.65,
        animation:'kidFloatTwo 5.8s ease-in-out infinite',
        filter:'drop-shadow(0 5px 8px rgba(0,0,0,.08))',
      }}>🦋</div>
      <div className="kid-decor" aria-hidden="true" style={{
        bottom:110, left:28, width:66, height:66, borderRadius:'50%',
        background:'radial-gradient(circle at 35% 30%, rgba(253,224,71,.55), rgba(253,224,71,.10) 55%, transparent 70%)',
        animation:'kidTwinkle 4.8s ease-in-out infinite',
      }}/>

      {/* ═══ PROGRESS SUB-BAR ═══ */}
      <div style={{ position:'sticky', top:80, zIndex:40, background:'#fff', borderBottom:'0.5px solid #e5e7eb', padding:'10px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', gap:24 }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#aaa' }}>
              <span>Letter {currentIdx+1} of {total}</span><span>{pct}%</span>
            </div>
            <div style={{ height:3, background:'#f0f0f0', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', background:'#111', borderRadius:2, width:`${pct}%`, transition:'width 0.5s ease' }} />
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:28, flexShrink:0 }}>
            {progressStats.map(({label,value,suffix})=>(
              <div key={label} style={{ textAlign:'right' }}>
                <div className="fd" style={{ fontSize:18, fontWeight:800, lineHeight:1.1, color:'#111' }}>
                  {showProgress?<AnimatedCounter value={value}/>:0}{suffix}
                </div>
                <div className="fb" style={{ fontSize:10, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
              </div>
            ))}
            {warningCount>0&&(
              <div style={{ textAlign:'right' }}>
                <div className="fd" style={{ fontSize:18, fontWeight:800, lineHeight:1.1, color:'#dc2626' }}>{warningCount}</div>
                <div className="fb" style={{ fontSize:10, color:'#dc2626', textTransform:'uppercase', letterSpacing:'0.08em' }}>Warnings</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ PRACTICE MODE NAVIGATION ═══ */}
      <section style={{
        borderBottom:'0.5px solid #e5e7eb',
        background: experimentMode === 'adaptive' ? '#f5f9ff' : '#fafafa',
        padding:'16px 24px',
      }}>
        <div style={{
          maxWidth:1280,
          margin:'0 auto',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          gap:20,
          flexWrap:'wrap',
        }}>
          <div style={{ minWidth:260, flex:1 }}>
            <div className="fb" style={{
              fontSize:10,
              textTransform:'uppercase',
              letterSpacing:'0.14em',
              color:experimentMode === 'adaptive' ? '#1a56db' : '#666',
              fontWeight:700,
              marginBottom:4,
            }}>
              Tracing practice mode
            </div>

            <div className="fd" style={{
              fontSize:20,
              fontWeight:700,
              color:'#111',
              marginBottom:3,
            }}>
              {experimentMode === 'adaptive'
                ? 'Adaptive Practice'
                : 'Static Practice'}
            </div>

            <p className="fb" style={{
              fontSize:12,
              lineHeight:1.55,
              color:'#777',
              margin:0,
              maxWidth:620,
            }}>
              {experimentMode === 'adaptive'
                ? 'Support adjusts automatically from your recent tracing performance.'
                : 'Support stays fixed at the starting level defined for this letter.'}
            </p>
          </div>

          <div style={{
            display:'flex',
            gap:8,
            padding:4,
            borderRadius:12,
            border:'1px solid #e5e7eb',
            background:'#fff',
            flexShrink:0,
          }}>
            <button
              type="button"
              onClick={() => navigateToExperimentMode('adaptive')}
              aria-pressed={experimentMode === 'adaptive'}
              style={{
                minWidth:120,
                padding:'10px 18px',
                borderRadius:9,
                border:experimentMode === 'adaptive' ? '1px solid #1a56db' : '1px solid transparent',
                background:experimentMode === 'adaptive' ? '#1a56db' : 'transparent',
                color:experimentMode === 'adaptive' ? '#fff' : '#666',
                fontFamily:'DM Sans,sans-serif',
                fontSize:13,
                fontWeight:600,
                cursor:'pointer',
                transition:'all 0.18s ease',
              }}
            >
              Adaptive
            </button>

            <button
              type="button"
              onClick={() => navigateToExperimentMode('static')}
              aria-pressed={experimentMode === 'static'}
              style={{
                minWidth:120,
                padding:'10px 18px',
                borderRadius:9,
                border:experimentMode === 'static' ? '1px solid #111' : '1px solid transparent',
                background:experimentMode === 'static' ? '#111' : 'transparent',
                color:experimentMode === 'static' ? '#fff' : '#666',
                fontFamily:'DM Sans,sans-serif',
                fontSize:13,
                fontWeight:600,
                cursor:'pointer',
                transition:'all 0.18s ease',
              }}
            >
              Static
            </button>
          </div>
        </div>
      </section>

      {/* ═══ HERO ═══ */}
      <section style={{ borderBottom:'0.5px solid #e5e7eb', padding:'28px 24px', background:'#fff', overflow:'hidden' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }}>
          <div className={heroVisible?'afu':''} style={{ opacity:heroVisible?1:0 }}>
            <div className="fb afi d1" style={{ display:'inline-block', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', border:'0.5px solid #111', padding:'4px 12px', marginBottom:14 }}>
              {cat.nameEn} — Letter {currentIdx+1}
            </div>
            <h1 className="fd afu d2" style={{ fontSize:'clamp(40px,5vw,64px)', fontWeight:800, lineHeight:1.06, margin:'0 0 10px', letterSpacing:'-0.02em' }}>
              Practice <em style={{ fontStyle:'italic' }}>{current.letter}</em>,{' '}
              <span style={{ textDecoration:'underline', textDecorationThickness:2, textUnderlineOffset:4 }}>improve</span>
            </h1>
            <p className="fb afu d3" style={{ fontSize:15, color:'#666', marginBottom:0, maxWidth:380 }}>
              /{current.sound}/ · {current.strokes} stroke{current.strokes>1?'s':''} · {current.diff}
            </p>
          </div>
          <div className={heroVisible?'asi d2':''} style={{ opacity:heroVisible?1:0 }}>
            <div style={{ width:120, height:120, background:'#f8f8f8', borderRadius:16, border:'0.5px solid #e5e7eb',
              display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexDirection:'column', gap:0 }}>
              <span className="sinhala" style={{ fontSize:72, fontWeight:900, color:'#111', lineHeight:1 }}>
                {current.letter}
              </span>
              {masteredSet.has(current.letter)&&(
                <div style={{ position:'absolute', top:-6, right:-6, width:20, height:20, background:'#111',
                  borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#fff', fontSize:10 }}>✓</span>
                </div>
              )}
              <div style={{ position:'absolute', bottom:-12, right:-12 }}>
                <SoundButton letter={current.letter} size="md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BODY ═══ */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'28px 24px',
        display:'grid', gridTemplateColumns:'220px 1fr 240px', gap:24 }}>

        {/* ══ LEFT SIDEBAR ══ */}
        <aside>
          <div style={{ display:'flex', gap:4, marginBottom:16, padding:3, background:'#f8f8f8', borderRadius:10, border:'0.5px solid #e5e7eb' }}>
            {[{id:'letters',label:'Letters'},{id:'guide',label:'Guide'}].map(({id,label})=>(
              <button key={id} onClick={()=>setActivePanel(id)}
                className={activePanel===id?'ptab':''}
                style={{ flex:1, padding:'7px 0', borderRadius:8, border:'none',
                  fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:500,
                  cursor:'pointer', background:'transparent', color:'#888',
                  letterSpacing:'0.04em', textTransform:'uppercase' }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ height:'calc(100vh - 280px)', overflowY:'auto', paddingRight:4 }}>
            {activePanel==='letters'&&(
              <>
                <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:12 }}>
                  {masteredSet.size}/{total} mastered
                </div>
                <LetterGrid categories={letterCategories} currentLetter={current} masteredSet={masteredSet} onSelect={handleSelectLetter}/>
              </>
            )}
            {activePanel==='guide'&&(
              <div style={{ paddingTop:4 }}>
                <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:12 }}>Stroke order</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                  {Array.from({length:Math.min(current.strokes,4)},(_,i)=>(
                    <div key={i} style={{ width:48, height:48, background:'#f8f8f8', border:'0.5px solid #e5e7eb',
                      borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                      <span className="sinhala" style={{ fontSize:24, fontWeight:900, color:'#111' }}>{current.letter}</span>
                      <div style={{ position:'absolute', top:-6, right:-6, width:16, height:16, background:'#111',
                        borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ color:'#fff', fontSize:9, fontWeight:700 }}>{i+1}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop:'0.5px solid #e5e7eb', paddingTop:16, marginBottom:16 }}>
                  <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:8 }}>Pro tip</div>
                  <p className="fb" style={{ fontSize:13, color:'#555', lineHeight:1.6 }}>{current.tip}</p>
                </div>
                <div style={{ borderTop:'0.5px solid #e5e7eb', paddingTop:16 }}>
                  <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:10 }}>Guidance steps</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {(current.phases||[]).map((phase,i)=>(
                      <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                        <div style={{ width:20, height:20, background:'#111', borderRadius:5, flexShrink:0,
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>{i+1}</span>
                        </div>
                        <p className="fb" style={{ fontSize:12, color:'#555', lineHeight:1.6, margin:0 }}>{phase}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop:'0.5px solid #e5e7eb', paddingTop:16, marginTop:16 }}>
                  <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:8 }}>Keypoint colour guide</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {[
                      { color:'rgba(26,86,219,0.9)',  label:'Next to trace (pulsing)' },
                      { color:'rgba(21,128,61,0.9)',  label:'Covered correctly ✓' },
                      { color:'rgba(220,38,38,0.85)', label:'Hit out of order ✗' },
                      { color:'rgba(200,200,210,0.7)',label:'Not yet reached' },
                    ].map(({color,label})=>(
                      <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0 }}/>
                        <span className="fb" style={{ fontSize:11, color:'#666' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ══ MAIN CANVAS AREA ══ */}
        <main style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Nav row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handlePrev} disabled={currentIdx===0}
                style={{ padding:'8px 16px', borderRadius:8, border:'0.5px solid #e5e7eb',
                  background:'#fff', fontSize:13, color:'#888', cursor:'pointer',
                  opacity:currentIdx===0?0.3:1 }}>← Prev</button>
              <button onClick={handleNext}
                style={{ padding:'8px 16px', borderRadius:8, border:'0.5px solid #e5e7eb',
                  background:'#fff', fontSize:13, color:'#888', cursor:'pointer' }}>Next →</button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              {bestScore>0&&(
                <div className="fb" style={{ fontSize:13, color:'#888' }}>
                  Best: <strong style={{ color:'#111', fontWeight:600 }}>{bestScore}%</strong>
                </div>
              )}
              <button
  onClick={() => {
    if (!RESEARCH_LOCK_SUPPORT_CONTROLS) {
      setShowKP(v => !v);
    }
  }}
  disabled={RESEARCH_LOCK_SUPPORT_CONTROLS}
  title={
    RESEARCH_LOCK_SUPPORT_CONTROLS
      ? 'Keypoint guidance is controlled by the research condition'
      : 'Toggle keypoints'
  }
                style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8,
                  opacity:
  RESEARCH_LOCK_SUPPORT_CONTROLS
    ? 0.75
    : 1,

cursor:
  RESEARCH_LOCK_SUPPORT_CONTROLS
    ? 'not-allowed'
    : 'pointer',
                  border:`0.5px solid ${showKP?'#15803d':'#e5e7eb'}`,
                  background:showKP?'#dcfce7':'#fff',
                  color:showKP?'#15803d':'#888',
                  fontFamily:'DM Sans,sans-serif', fontSize:12, cursor:'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9" strokeDasharray="3 3"/>
                </svg>
                {showKP?'Keypoints on':'Keypoints off'}
              </button>
<button
  onClick={() => {
    if (!RESEARCH_LOCK_SUPPORT_CONTROLS) {
      setShowGuide(g => !g);
    }
  }}
  disabled={RESEARCH_LOCK_SUPPORT_CONTROLS}
  title={
    RESEARCH_LOCK_SUPPORT_CONTROLS
      ? 'Guide visibility is controlled by the research condition'
      : 'Toggle guide'
  }                style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8,
    opacity:
  RESEARCH_LOCK_SUPPORT_CONTROLS
    ? 0.75
    : 1,

cursor:
  RESEARCH_LOCK_SUPPORT_CONTROLS
    ? 'not-allowed'
    : 'pointer',
                  border:`0.5px solid ${showGuide?'#111':'#e5e7eb'}`,
                  background:showGuide?'#111':'#fff',
                  color:showGuide?'#fff':'#888',
                  fontFamily:'DM Sans,sans-serif', fontSize:12, cursor:'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showGuide
                    ?<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    :<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></>
                  }
                </svg>
                {showGuide?'Guide on':'Guide off'}
              </button>
            </div>
          </div>

          {!isMouseDrawing && hasDrawn && !isTouchDevice.current && !scoreResult && !isComplete && (
            <div style={{ padding:'10px 16px', borderRadius:10, background:'#f8f8f8', border:'1px solid #e5e7eb',
              display:'flex', alignItems:'center', gap:10, animation:'fadeIn 0.2s ease' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <span className="fb" style={{ fontSize:13, color:'#888' }}>
                Drawing paused — click on the letter to continue tracing.
              </span>
            </div>
          )}

          {drawingBlocked && (
            <div style={{ padding:'10px 16px', borderRadius:10, background:'#fef2f2', border:'1px solid #fca5a5',
              display:'flex', alignItems:'center', gap:10, animation:'fadeIn 0.2s ease' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              <span className="fb" style={{ fontSize:13, fontWeight:600, color:'#dc2626' }}>
                ✋ Drawing paused — bring your {isTouchDevice.current ? 'finger' : 'cursor'} back onto the letter to continue!
              </span>
            </div>
          )}

          {boundaryWarning && !drawingBlocked && (
            <div style={{ padding:'10px 16px', borderRadius:10, background:'#fef2f2', border:'1px solid #fca5a5',
              display:'flex', alignItems:'center', gap:10, animation:'fadeIn 0.2s ease' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="fb" style={{ fontSize:13, fontWeight:500, color:'#dc2626' }}>
                ⚠ ශ්‍රේෂ්ඨ ලකුණෙන් පිටත! — Stay within the letter boundary!
              </span>
            </div>
          )}

          {orderBlockMsg && (
            <div style={{ padding:'10px 16px', borderRadius:10, background:'#fef3c7', border:'1px solid #fcd34d',
              display:'flex', alignItems:'center', gap:10, animation:'fadeIn 0.2s ease' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
              </svg>
              <span className="fb" style={{ fontSize:13, fontWeight:600, color:'#d97706' }}>
                {orderBlockMsg} — Drawing blocked at wrong keypoint!
              </span>
            </div>
          )}

          {/* Live guide progress bar */}
          <div style={{ marginBottom:4, padding:'0 10px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
              <span style={{ fontSize:12, color:'#6B6B80' }}>
                Live Guide: {Math.floor(traceProgress)}%
              </span>
              {scaledKP.length > 0 && traceProgress < 95 && (
                <span className="fb" style={{ fontSize:11, color:'#888' }}>
                  Next keypoint: <strong style={{ color:'#1a56db' }}>#{nextKPIndex + 1}</strong>
                  {' '}of {scaledKP.length}
                  {blockedKPSet.size > 0 && (
                    <span style={{ color:'#dc2626', marginLeft:8 }}>⛔ {blockedKPSet.size} blocked</span>
                  )}
                </span>
              )}
            </div>
            <div style={{ height:8, borderRadius:4, background:'#e8e6f0', overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:4,
                background: traceProgress>=95?'#15803d':'#1a1a2e',
                width:`${traceProgress}%`,
                transition:'width 0.2s ease',
              }}/>
            </div>
            {traceProgress>=95&&!scoreResult&&(
              <div style={{ fontSize:12, textAlign:'center', marginTop:5, fontWeight:'bold', color:'#15803d' }}>
                ✓ Excellent! Moving to next letter…
              </div>
            )}
          </div>

          {/* Canvas card */}
          <div
            style={{
              background:'#fff',
              border: drawingBlocked
                ? '2px solid #dc2626'
                : orderBlockFlash
                  ? '2px solid #f59e0b'
                  : boundaryWarning
                    ? '2px solid #dc2626'
                    : isMouseDrawing
                      ? '2px solid #1a56db'
                      : '0.5px solid #e5e7eb',
              borderRadius:16, overflow:'hidden',
              boxShadow: drawingBlocked || boundaryWarning
                ? '0 0 0 4px rgba(220,38,38,0.15)'
                : orderBlockFlash
                  ? '0 0 0 4px rgba(245,158,11,0.15)'
                  : isMouseDrawing
                    ? '0 0 0 4px rgba(26,86,219,0.12)'
                    : '0 2px 16px rgba(0,0,0,0.04)',
              transition:'border-color 0.2s, box-shadow 0.2s',
            }}>
            <div style={{ padding:'10px 16px', borderBottom:'0.5px solid #e5e7eb',
              display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', gap:6 }}>
                {[0.94,0.9,0.84].map((op,i)=>(
                  <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:`rgba(0,0,0,${op*0.12})` }}/>
                ))}
              </div>
              <span className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginLeft:6 }}>
                Practice canvas
              </span>
              <span className="fb" style={{ fontSize:11, color:'#bbb', marginLeft:4 }}>
                — {scaledKP.length} keypoints · strict order
              </span>
              {isMouseDrawing && !drawingBlocked && (
                <span style={{ marginLeft:'auto', fontSize:12, color:'#1a56db', fontWeight:600,
                  display:'flex', alignItems:'center', gap:4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Drawing…
                </span>
              )}
              {drawingBlocked && (
                <span style={{ marginLeft:'auto', fontSize:12, color:'#dc2626', fontWeight:600,
                  display:'flex', alignItems:'center', gap:4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                  Blocked
                </span>
              )}
              {celebrating && !drawingBlocked && (
                <span style={{ marginLeft:'auto', fontSize:14, animation:'fadeIn 0.3s ease' }}>★ ★ ★</span>
              )}
              {warningCount>0&&!celebrating&&!drawingBlocked&&!isMouseDrawing&&(
                <span className="wbadge" style={{ marginLeft:'auto' }}>
                  ⚠ {warningCount} {warningCount===1?'boundary cross':'boundary crosses'}
                </span>
              )}
            </div>

            <div style={{ position:'relative' }}>
              {isChecking&&(
                <div style={{ position:'absolute', inset:0, zIndex:10, background:'rgba(255,255,255,0.9)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                  <div style={{ width:32, height:32, border:'2px solid #e5e7eb', borderTopColor:'#111',
                    borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                  <p className="fb" style={{ fontSize:13, color:'#888' }}>Analysing your tracing…</p>
                </div>
              )}
              {scoreResult&&(
                <ScoreOverlay score={scoreResult.score} grade={scoreResult.grade}
                  onNext={()=>{ setScoreResult(null); handleNext(); }}
                  onRetry={handleRetry} isLast={currentIdx===total-1}/>
              )}

              {!hasDrawn&&!scoreResult&&(
                <div style={{ position:'absolute', bottom:20, right:24, zIndex:5, pointerEvents:'none',
                  display:'flex', alignItems:'center', gap:8,
                  background:'#fff', border:'0.5px solid #e5e7eb', borderRadius:24, padding:'8px 16px',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="fb" style={{ fontSize:12, color:'#888' }}>
                    Click keypoint #1 to start tracing
                  </span>
                </div>
              )}

              <KeypointsOverlay
                keypoints={scaledKP}
                coveredInOrder={coveredInOrder}
                blockedSet={blockedKPSet}
                canvasW={CANVAS_W} canvasH={CANVAS_H}
                show={showKP}
              />
              <BoundaryWarningFlash visible={boundaryWarning || drawingBlocked}/>
              <OrderBlockFlash visible={orderBlockFlash}/>

              {perfectLetterPopup && (
                <div
                  aria-hidden="true"
                  style={{
                    position:'absolute',
                    inset:0,
                    zIndex:30,
                    pointerEvents:'none',
                    overflow:'hidden',
                  }}
                >
                  <div
                    style={{
                      position:'absolute',
                      left:'50%', top:'50%',
                      width:300, height:300,
                      borderRadius:'50%',
                      border:'7px solid rgba(255,193,7,0.72)',
                      boxShadow:'0 0 26px rgba(255,193,7,0.36), 0 0 58px rgba(236,72,153,0.28), inset 0 0 38px rgba(59,130,246,0.16)',
                      background:'radial-gradient(circle, rgba(255,255,255,0.10) 46%, rgba(250,204,21,0.08) 62%, rgba(236,72,153,0.06) 100%)',
                      animation:'perfectLetterRing 2.8s cubic-bezier(.22,1,.36,1) forwards',
                    }}
                  />
                  {[
                    ['-132px','-108px'], ['122px','-118px'], ['-155px','-22px'],
                    ['152px','18px'], ['-112px','118px'], ['118px','112px'],
                    ['-18px','-150px'], ['26px','150px'], ['-166px','76px'], ['164px','-70px']
                  ].map(([sx,sy], i) => (
                    <span
                      key={i}
                      style={{
                        '--spark-x':sx,
                        '--spark-y':sy,
                        position:'absolute',
                        left:'50%', top:'50%',
                        fontSize:i % 2 === 0 ? 28 : 20,
                        lineHeight:1,
                        color:['#f59e0b','#ec4899','#8b5cf6','#3b82f6','#10b981'][i % 5],
                        textShadow:'0 0 12px currentColor',
                        animation:`perfectSparkle 2.25s ease-out ${i * 0.07}s forwards`,
                      }}
                    >
                      ✦
                    </span>
                  ))}
                  <div
                    className="sinhala"
                    style={{
                      position:'absolute',
                      left:'50%', top:'50%',
                      fontSize:235,
                      fontWeight:900,
                      lineHeight:1,
                      color:'#f59e0b',
                      background:'linear-gradient(135deg,#f97316 0%,#facc15 22%,#22c55e 44%,#3b82f6 66%,#8b5cf6 82%,#ec4899 100%)',
                      WebkitBackgroundClip:'text',
                      backgroundClip:'text',
                      WebkitTextFillColor:'transparent',
                      filter:'drop-shadow(0 10px 18px rgba(59,130,246,0.20)) drop-shadow(0 0 22px rgba(236,72,153,0.20))',
                      animation:'perfectLetterPop 2.9s cubic-bezier(.22,1,.36,1) forwards',
                    }}
                  >
                    {perfectLetterPopup}
                  </div>
                </div>
              )}

              {lineSpreadEffects.map(effect => (
                <div
                  key={effect.id}
                  aria-hidden="true"
                  style={{
                    position:'absolute',
                    left:`${effect.x}%`,
                    top:`${effect.y}%`,
                    width:1,
                    height:1,
                    zIndex:17,
                    pointerEvents:'none',
                  }}
                >
                  <span
                    style={{
                      position:'absolute',
                      left:0, top:0,
                      width:18, height:5,
                      borderRadius:999,
                      background:brushColor,
                      filter:'blur(1.2px)',
                      animation:'traceSpreadLeft 0.46s ease-out forwards',
                    }}
                  />
                  <span
                    style={{
                      position:'absolute',
                      left:0, top:0,
                      width:18, height:5,
                      borderRadius:999,
                      background:brushColor,
                      filter:'blur(1.2px)',
                      animation:'traceSpreadRight 0.46s ease-out forwards',
                    }}
                  />
                  <span
                    style={{
                      position:'absolute',
                      left:0, top:0,
                      width:10, height:10,
                      borderRadius:'50%',
                      border:`2px solid ${brushColor}`,
                      animation:'traceSpreadGlow 0.4s ease-out forwards',
                    }}
                  />
                </div>
              ))}


              {traceStarEffects.map(star => (
                <span
                  key={star.id}
                  aria-hidden="true"
                  style={{
                    '--star-x':`${star.dx}px`,
                    '--star-y':`${star.dy}px`,
                    '--star-r':`${star.rotate}deg`,
                    position:'absolute',
                    left:`${star.x}%`,
                    top:`${star.y}%`,
                    zIndex:19,
                    pointerEvents:'none',
                    color:star.color,
                    fontSize:star.size,
                    lineHeight:1,
                    textShadow:'0 0 7px currentColor',
                    animation:`traceStarBurst 0.62s ease-out ${star.delay}s forwards`,
                    willChange:'transform, opacity',
                  }}
                >
                  ★
                </span>
              ))}

              {beeVisible && !scoreResult && !isComplete && (
                <div
                  aria-hidden="true"
                  style={{
                    position:'absolute',
                    left:`${beePosition.x}%`,
                    top:`${beePosition.y}%`,
                    zIndex:18,
                    pointerEvents:'none',
                    fontSize:34,
                    lineHeight:1,
                    filter:'drop-shadow(0 3px 3px rgba(0,0,0,0.18))',
                    animation:'beeBuzz 0.18s ease-in-out infinite',
                    transformOrigin:'center',
                    willChange:'left, top, transform',
                  }}
                >
                  🐝
                </div>
              )}

              <canvas
                ref={canvasRef}
                width={CANVAS_W} height={CANVAS_H}
                tabIndex={-1}
                onFocus={e => e.currentTarget.blur()}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                onTouchStart={startDrawTouch}
                onTouchMove={drawTouch}
                onTouchEnd={stopDrawTouch}
                style={{
                  width:'100%', display:'block', background:'#fafafa',
                  outline: 'none',
                  cursor: drawingBlocked
                    ? 'not-allowed'
                    : isMouseDrawing
                      ? 'crosshair'
                      : 'pointer',
                }}
              />
            </div>

            {/* Action row */}
            <div style={{ padding:'14px 16px', borderTop:'0.5px solid #e5e7eb', display:'flex', gap:10, alignItems:'center' }}>
              <button onClick={handleClear}
                style={{ flex:'0 0 auto', padding:'12px 20px', borderRadius:10,
                  border:'0.5px solid #e5e7eb', background:'#fff',
                  fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#888', cursor:'pointer' }}>
                Clear
              </button>

              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 4px',
                background:'#f8f8f8', borderRadius:10, border:'0.5px solid #e5e7eb',
                paddingLeft:12, paddingRight:14, height:44 }}>
                <SoundButton letter={current.letter} size="md" />
                <span className="fb" style={{ fontSize:12, color:'#666', whiteSpace:'nowrap' }}>
                  Hear <span className="sinhala" style={{ fontSize:16, fontWeight:700, marginLeft:2 }}>{current.letter}</span>
                </span>
              </div>

              <button onClick={handleCheck} disabled={!hasDrawn||isChecking||!!scoreResult||isComplete}
                style={{ flex:1, padding:'12px 0', borderRadius:10,
                  border:(!hasDrawn||isChecking||!!scoreResult||isComplete)?'0.5px solid #e5e7eb':'1px solid #111',
                  background:(!hasDrawn||isChecking||!!scoreResult||isComplete)?'#f8f8f8':'#111',
                  fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:500,
                  color:(!hasDrawn||isChecking||!!scoreResult||isComplete)?'#bbb':'#fff',
                  cursor:(hasDrawn&&!isComplete&&!scoreResult)?'pointer':'not-allowed' }}>
                {isChecking?'Checking…':'Check My Work →'}
              </button>
            </div>
          </div>

          {/* Activity log */}
          <div style={{ background:'#fafafa', border:'0.5px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'10px 16px', borderBottom:'0.5px solid #e5e7eb',
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="fb" style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em', color:'#888' }}>
                  Activity log
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="fb" style={{ fontSize:11, color:'#bbb' }}>Play letter sound:</span>
                <SoundButton letter={current.letter} size="sm" />
              </div>
            </div>
            <div style={{ padding:'12px 16px', maxHeight:120, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
              {alertLog.length===0
                ? <p className="fb" style={{ fontSize:12, color:'#bbb', textAlign:'center', padding:'8px 0' }}>
                    Activity and alerts will appear here.
                  </p>
                : alertLog.slice().reverse().map((a,i)=>(
                  <div key={i} className="log-e" style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <span className="fb" style={{ fontSize:10, color:'#ccc', flexShrink:0, paddingTop:1 }}>{a.time}</span>
                    <p className="fb" style={{ fontSize:12,
                      color:a.type==='warning'?'#dc2626':a.type==='start'?'#1a56db':'#555',
                      margin:0, lineHeight:1.5, fontWeight:a.type==='warning'?500:400 }}>{a.text}</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Recent attempts */}
          {history.length>0&&(
            <div style={{ background:'#fff', border:'0.5px solid #e5e7eb', borderRadius:12, padding:16 }}>
              <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:12 }}>Recent attempts</div>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
                {history.slice(0,10).map((h,i)=>(
                  <div key={i} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div className="sinhala" style={{ width:36, height:36, borderRadius:8,
                      border:`0.5px solid ${h.score>=80?'#111':'#e5e7eb'}`,
                      background:h.score>=80?'#111':'#fafafa',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:18, fontWeight:900, color:h.score>=80?'#fff':'#555' }}>
                      {h.letter}
                    </div>
                    <span className="fb" style={{ fontSize:10, color:h.score>=80?'#111':'#aaa', fontWeight:500 }}>{h.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ══ RIGHT SIDEBAR ══ */}
        <aside style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Current research mode */}
          <div style={{
            border: experimentMode === 'adaptive'
              ? '1px solid #bfdbfe'
              : '1px solid #d1d5db',
            borderRadius:16,
            overflow:'hidden',
            background:'#fff',
          }}>
            <div style={{
              padding:'14px 16px',
              background: experimentMode === 'adaptive' ? '#eff6ff' : '#f5f5f5',
              borderBottom: experimentMode === 'adaptive'
                ? '1px solid #bfdbfe'
                : '1px solid #e5e7eb',
            }}>
              <div className="fb" style={{
                fontSize:10,
                textTransform:'uppercase',
                letterSpacing:'0.14em',
                color:experimentMode === 'adaptive' ? '#1a56db' : '#666',
                fontWeight:700,
                marginBottom:4,
              }}>
                Current mode
              </div>

              <div className="fd" style={{
                fontSize:18,
                fontWeight:700,
                color:'#111',
              }}>
                {experimentMode === 'adaptive' ? 'Adaptive' : 'Static'}
              </div>
            </div>

            <div style={{ padding:'14px 16px' }}>
              {experimentMode === 'adaptive' ? (
                <>
                  <p className="fb" style={{
                    margin:'0 0 12px',
                    fontSize:12,
                    lineHeight:1.55,
                    color:'#666',
                  }}>
                    This mode uses the learner's recent valid attempts to adjust the amount of tracing support.
                  </p>

                  {[
                    { label:'Current support', value:supportSettings.supportLevel },
                    {
                      label:'Recent average',
                      value:supportSettings.recentAverageScore != null
                        ? `${Number(supportSettings.recentAverageScore).toFixed(1)}%`
                        : 'No previous attempt',
                    },
                    { label:'Attempts used', value:supportSettings.recentAttemptCount },
                  ].map(({label,value}) => (
                    <div key={label} style={{
                      display:'flex',
                      justifyContent:'space-between',
                      gap:12,
                      padding:'7px 0',
                      borderTop:'0.5px solid #f0f0f0',
                    }}>
                      <span className="fb" style={{ fontSize:11, color:'#999' }}>{label}</span>
                      <span className="fb" style={{
                        fontSize:11,
                        color:'#1a56db',
                        fontWeight:600,
                        textAlign:'right',
                      }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="fb" style={{
                    margin:'0 0 12px',
                    fontSize:12,
                    lineHeight:1.55,
                    color:'#666',
                  }}>
                    This mode keeps the same support level for the letter and does not adapt from recent scores.
                  </p>

                  {[
                    { label:'Fixed support', value:supportSettings.supportLevel },
                    { label:'Initial difficulty', value:supportSettings.baseDifficulty },
                    { label:'Recent performance', value:'Not used' },
                  ].map(({label,value}) => (
                    <div key={label} style={{
                      display:'flex',
                      justifyContent:'space-between',
                      gap:12,
                      padding:'7px 0',
                      borderTop:'0.5px solid #f0f0f0',
                    }}>
                      <span className="fb" style={{ fontSize:11, color:'#999' }}>{label}</span>
                      <span className="fb" style={{
                        fontSize:11,
                        color:'#111',
                        fontWeight:600,
                        textAlign:'right',
                      }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Letter info card */}
          <div style={{ border:'0.5px solid #e5e7eb', borderRadius:16, overflow:'hidden' }}>
            <div style={{ background:'#111', padding:'24px 20px', textAlign:'center', position:'relative' }}>
              <span className="sinhala" style={{ fontSize:96, fontWeight:900, color:'#fff', lineHeight:1, display:'block' }}>
                {current.letter}
              </span>
              {bestScore>0&&(
                <div style={{ marginTop:8, fontFamily:'monospace', fontSize:16, color:'#888', letterSpacing:4 }}>
                  {getGrade(bestScore).symbol}
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'center', marginTop:14 }}>
                <button
                  onClick={()=>playLetterSound(current.letter)}
                  title={`Play sound: ${current.letter}`}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'9px 20px', borderRadius:100,
                    background:'rgba(255,255,255,0.10)',
                    border:'1px solid rgba(255,255,255,0.22)',
                    color:'#fff', cursor:'pointer',
                    fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500,
                    backdropFilter:'blur(4px)',
                    transition:'all 0.18s ease',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.20)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.10)'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white" stroke="none"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                  Play /{current.sound}/
                </button>
              </div>
            </div>
            <div style={{ padding:'16px 20px', background:'#fff' }}>
              {[
                {label:'Sound',      value:`/${current.sound}/`},
                {label:'Category',   value:cat.nameEn},
                {label:'Difficulty', value:diffLabel(current.diff)},
                {label:'Strokes',    value:`${current.strokes} stroke${current.strokes>1?'s':''}`},
                {label:'Best',       value:bestScore>0?`${bestScore}%`:'—'},
                {label:'Keypoints',  value:`${scaledKP.length}`},
                {label:'In order',   value:`${coveredInOrder.length}/${scaledKP.length}`},
                {label:'Blocked',    value:blockedKPSet.size > 0 ? `⛔ ${blockedKPSet.size}` : '—'},
              ].map(({label,value})=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid #f0f0f0' }}>
                  <span className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'#aaa' }}>{label}</span>
                  <span className="fb" style={{ fontSize:13, fontWeight:500,
                    color: (label==='Blocked' && blockedKPSet.size > 0) ? '#dc2626' : '#111' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ LOWER PRACTICE TOOLS — moved below the main workspace to remove empty white space ═══ */}
      <div className="lower-tools-grid" style={{
        maxWidth:1280,
        margin:'0 auto',
        padding:'0 24px 28px',
        display:'grid',
        gridTemplateColumns:'repeat(4, minmax(0, 1fr))',
        gap:16,
        alignItems:'start',
      }}>
          {/* Keypoint progress card */}
          <div style={{
            border: traceProgress > 0 ? '1px solid #bbf7d0' : '0.5px solid #e5e7eb',
            borderRadius:16, padding:'16px 20px',
            background: traceProgress>=95?'#f0fdf4':traceProgress>0?'#fafafa':'#fafafa',
            transition:'all 0.3s',
          }}>
            <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em',
              color:traceProgress>=95?'#15803d':'#aaa', marginBottom:12 }}>
              Keypoint progress
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{ padding:'12px 14px', borderRadius:10,
                background:traceProgress>=95?'#dcfce7':'#fff', border:'0.5px solid #e5e7eb' }}>
                <div className="fd" style={{ fontSize:22, fontWeight:800, color:traceProgress>=95?'#15803d':'#111', lineHeight:1.1 }}>
                  {Math.floor(traceProgress)}%
                </div>
                <div className="fb" style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em',
                  color:traceProgress>=95?'#15803d':'#aaa', marginTop:3 }}>Progress</div>
              </div>
              <div style={{ padding:'12px 14px', borderRadius:10, background:'#fff', border:'0.5px solid #e5e7eb' }}>
                <div className="fd" style={{ fontSize:22, fontWeight:800, color:'#111', lineHeight:1.1 }}>
                  {warningCount}
                </div>
                <div className="fb" style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#aaa', marginTop:3 }}>Boundary ⚠</div>
              </div>
              <div style={{ padding:'12px 14px', borderRadius:10, background:'#fff', border:'0.5px solid #e5e7eb' }}>
                <div className="fd" style={{ fontSize:22, fontWeight:800, color:'#15803d', lineHeight:1.1 }}>
                  {coveredInOrder.length}
                </div>
                <div className="fb" style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#aaa', marginTop:3 }}>In order ✓</div>
              </div>
              <div style={{ padding:'12px 14px', borderRadius:10,
                background: blockedKPSet.size > 0 ? '#fef2f2' : '#fff',
                border: blockedKPSet.size > 0 ? '0.5px solid #fca5a5' : '0.5px solid #e5e7eb' }}>
                <div className="fd" style={{ fontSize:22, fontWeight:800,
                  color: blockedKPSet.size > 0 ? '#dc2626' : '#ccc', lineHeight:1.1 }}>
                  {blockedKPSet.size}
                </div>
                <div className="fb" style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#aaa', marginTop:3 }}>Blocked ⛔</div>
              </div>
            </div>
            {traceProgress>=95&&(
              <p className="fb" style={{ fontSize:12, color:'#15803d', marginTop:10, lineHeight:1.5, fontWeight:500 }}>
                ✓ All keypoints covered in order — well done!
              </p>
            )}
            {traceProgress < 95 && scaledKP.length > 0 && (
              <p className="fb" style={{ fontSize:12, color:'#888', marginTop:10, lineHeight:1.5 }}>
                Next: trace through keypoint{' '}
                <strong style={{ color:'#1a56db' }}>#{nextKPIndex + 1}</strong>
                {' '}of {scaledKP.length}
              </p>
            )}
          </div>

          {/* Brush settings */}
          <div style={{ border:'0.5px solid #e5e7eb', borderRadius:16, padding:'16px 20px', background:'#fff' }}>
            <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:14 }}>Brush settings</div>
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span className="fb" style={{ fontSize:12, color:'#666' }}>Size</span>
                <span className="fb" style={{ fontSize:12, fontWeight:500, color:'#111' }}>{brushSize}px</span>
              </div>
              <input type="range" min="8" max="44" value={brushSize} onChange={e=>setBrushSize(+e.target.value)} style={{ width:'100%' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span className="fb" style={{ fontSize:10, color:'#ccc' }}>Fine</span>
                <span className="fb" style={{ fontSize:10, color:'#ccc' }}>Thick</span>
              </div>
              <div style={{ display:'flex', justifyContent:'center', marginTop:10 }}>
                <div style={{ borderRadius:'50%', background:brushColor,
                  width:Math.max(6,brushSize*0.5), height:Math.max(6,brushSize*0.5), transition:'all 0.2s' }}/>
              </div>
            </div>
            <div className="fb" style={{ fontSize:12, color:'#666', marginBottom:10 }}>Color</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {BRUSH_COLORS.map(b=>(
                <button key={b.color} onClick={()=>setBrushColor(b.color)} title={b.name}
                  style={{ width:'100%', paddingBottom:'100%', position:'relative', borderRadius:8,
                    background:b.color,
                    border:brushColor===b.color?'2.5px solid #fff':'1px solid transparent',
                    boxShadow:brushColor===b.color?`0 0 0 2px ${b.color}`:'none',
                    cursor:'pointer', transition:'all 0.15s',
                    transform:brushColor===b.color?'scale(1.1)':'scale(1)' }}/>
              ))}
            </div>
          </div>

          {/* Session stats */}
          <div style={{ border:'0.5px solid #e5e7eb', borderRadius:16, padding:'16px 20px', background:'#fafafa' }}>
            <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:14 }}>Session stats</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                {label:'Points',   value:points,          dark:true},
                {label:'Mastered', value:masteredSet.size, dark:false},
                {label:'Accuracy', value:`${accuracy}%`,  dark:false},
                {label:'Attempts', value:history.length,  dark:false},
              ].map(({label,value,dark})=>(
                <div key={label} style={{ padding:'12px 14px', borderRadius:10,
                  background:dark?'#111':'#fff', border:dark?'none':'0.5px solid #e5e7eb' }}>
                  <div className="fd" style={{ fontSize:22, fontWeight:800, color:dark?'#fff':'#111', lineHeight:1.1 }}>
                    {showProgress
                      ? (typeof value==='number'?<AnimatedCounter value={value}/>:value)
                      : (typeof value==='number'?0:'—')}
                  </div>
                  <div className="fb" style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em',
                    color:dark?'#888':'#aaa', marginTop:3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ border:'0.5px solid #e5e7eb', borderRadius:16, padding:'16px 20px', background:'#fff' }}>
            <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:12 }}>How to practice</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                '🖥 Mouse/Laptop: click once on keypoint #1 to start drawing, move cursor to trace, click again to stop',
                '📱 Touch: touch and drag to draw — lift finger to pause, touch again to continue',
                'Stay within the letter — drawing stops if you go outside!',
                'Follow keypoint number order strictly (1→2→3…)',
                'Wrong keypoint = drawing blocked for 300ms, red flash & sound',
                'Blue pulsing ring = next keypoint to trace',
                'At 95% coverage the app auto-advances to the next letter',
              ].map((step,i)=>(
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:18, height:18, background:'#111', borderRadius:4, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:'#fff', fontSize:9, fontWeight:700 }}>{i+1}</span>
                  </div>
                  <p className="fb" style={{ fontSize:12, color:'#555', margin:0, lineHeight:1.6 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* ═══ MILESTONE TOAST ═══ */}
      {showMilestone&&(
        <div className="mtoast" style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)',
          zIndex:100, background:'#111', color:'#fff', borderRadius:100,
          padding:'14px 28px', display:'flex', alignItems:'center', gap:14,
          boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize:18 }}>★</span>
          <div>
            <div className="fd" style={{ fontSize:15, fontWeight:700 }}>Milestone reached</div>
            <div className="fb" style={{ fontSize:12, color:'#888' }}>You've mastered {milestoneCount} letters</div>
          </div>
          <span style={{ fontSize:18 }}>★</span>
        </div>
      )}

      <div aria-hidden="true" style={{ position:'fixed', top:80, right:-80, width:320, height:320, background:'radial-gradient(circle, rgba(191,219,254,.42) 0%, rgba(221,214,254,.24) 48%, rgba(255,255,255,0) 72%)', borderRadius:'50%', pointerEvents:'none', zIndex:0, animation:'kidFloatTwo 8s ease-in-out infinite' }}/>
      <div aria-hidden="true" style={{ position:'fixed', bottom:-60, left:-60, width:240, height:240, background:'radial-gradient(circle, rgba(167,243,208,.40) 0%, rgba(254,240,138,.22) 48%, rgba(255,255,255,0) 72%)', borderRadius:'50%', pointerEvents:'none', zIndex:0, animation:'kidFloatOne 9s ease-in-out infinite' }}/>
    </div>
  );
}
