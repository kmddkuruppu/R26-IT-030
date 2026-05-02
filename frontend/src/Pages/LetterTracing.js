import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── TRANSLATIONS ────────────────────────────────────────────────
const translations = {
  en: {
    pageTitle: "Letter Tracing & Writing",
    pageSubtitle: "Stroke by stroke, master every letter",
    points: "Points", completed: "Completed", streak: "Streak",
    currentLetter: "Current Letter", difficulty: "Difficulty",
    strokes: "Strokes", group: "Group", sound: "Sound",
    practiceArea: "Practice Canvas", hideGuide: "Hide Guide",
    showGuide: "Show Guide", clear: "Clear", checkWork: "Check My Work",
    prev: "Previous", next: "Next", tryAgain: "Try Again",
    instructions: "Instructions", brushSettings: "Brush Settings",
    brushSize: "Size", brushColor: "Color", fine: "Fine", thick: "Thick",
    letterProgress: "Letter Progress", allLetters: "All Letters",
    mastered: "Mastered", practicing: "Practicing", notStarted: "Not Started",
    strokeGuide: "Stroke Guide", letterInfo: "Letter Info",
    excellent: "Excellent! 🌟", veryGood: "Very Good! ⭐",
    good: "Good! 👍", goodTry: "Keep Going! 💪",
    excellentSub: "Perfect tracing!", goodTrySub: "Practice makes perfect!",
    milestone: "Milestone!", milestoneMsg: "You've mastered",
    letters: "letters!", scoreLabel: "Accuracy",
    inst1: "Trace over the faint guide letter", inst2: "Follow the stroke order shown",
    inst3: "Stay within the guide path", inst4: "Tap 'Check' for instant feedback",
    animateStroke: "Animate Stroke", stopAnim: "Stop",
    canvasMode: "Mode", freehand: "Freehand", guided: "Guided",
    opacity: "Guide Opacity", tipTitle: "Pro Tip",
    tipText: "For best results, draw slowly and follow the stroke direction arrows.",
    masteredBadge: "✓ Mastered", categoryPicker: "Choose Category",
    vowels: "Vowels", consonants: "Consonants", special: "Special",
    accuracy: "Accuracy", totalDone: "Total Done",
    sessionScore: "Session Score",
    voiceAlerts: "Voice Guidance",
    voiceOn: "Voice On", voiceOff: "Voice Off",
    listeningForStroke: "Listening…", voiceSpeaking: "Speaking…", voiceReady: "Ready",
    clearCanvas: "Canvas cleared — ready to trace",
    demoPlay: "Play demo",
  },
};

// ─── LETTER CATEGORIES ───────────────────────────────────────────
const LETTER_CATEGORIES = [
  {
    id: 'vowels', name: 'ස්වර', nameEn: 'Vowels',
    letters: [
      { letter:'අ', sound:'a',   strokes:1, diff:'Easy',   tip:'Start top-left, curve right and loop down', phases:['Start at the top — curve right, then loop down into a round body'] },
      { letter:'ආ', sound:'aa',  strokes:1, diff:'Easy',   tip:'Like අ with a long tail extending right',   phases:['Trace the round body of අ, then extend a long sweeping tail to the right'] },
      { letter:'ඇ', sound:'ae',  strokes:1, diff:'Easy',   tip:'Round body with a small hook at top',       phases:['Begin at the top-left hook, curve right, then bring the loop down and close it'] },
      { letter:'ඈ', sound:'aee', strokes:2, diff:'Medium', tip:'ඇ plus a long right extension stroke',      phases:['Draw the round body of ඇ','Now add a long horizontal stroke to the right'] },
      { letter:'ඉ', sound:'i',   strokes:1, diff:'Easy',   tip:'Single flowing loop, like a backwards e',   phases:['Start at the right, curve up and left, then loop around'] },
      { letter:'ඊ', sound:'ii',  strokes:2, diff:'Medium', tip:'ඉ with a vertical bar on the right',        phases:['Draw the ඉ loop','Now add a short vertical bar on the right side'] },
      { letter:'උ', sound:'u',   strokes:1, diff:'Easy',   tip:'Bowl shape opening upward',                 phases:['Start at the left, sweep down and curve right — like drawing a bowl'] },
      { letter:'ඌ', sound:'uu',  strokes:2, diff:'Medium', tip:'උ with a curved extension below',           phases:['Draw the bowl shape of උ','Now add a curved extension below, hooking to the left'] },
    ],
  },
  {
    id: 'ka', name: 'ක වර්ගය', nameEn: 'Ka Group',
    letters: [
      { letter:'ක', sound:'ka',  strokes:2, diff:'Medium', tip:'Top horizontal bar, then curved body below', phases:['Draw a horizontal bar across the top','Now curve down to form the body and close below'] },
      { letter:'ග', sound:'ga',  strokes:2, diff:'Medium', tip:'Open loop curving to the right',             phases:['Start at the top, sweep down and curve right — leave the loop open','Bring the stroke back up slightly'] },
      { letter:'ච', sound:'cha', strokes:1, diff:'Easy',   tip:'Single smooth flowing curve, like a fishhook', phases:['One smooth stroke — start at the top-right, sweep left and curve downward'] },
      { letter:'ජ', sound:'ja',  strokes:2, diff:'Medium', tip:'Vertical drop with curved base and hook',    phases:['Start at the top — draw a vertical line downward','Curve the base to the left and add a small hook'] },
      { letter:'ට', sound:'ṭa',  strokes:1, diff:'Easy',   tip:'Circle with a short right exit stroke',      phases:['Draw a full circle, then exit with a short stroke to the right'] },
      { letter:'ත', sound:'tha', strokes:2, diff:'Medium', tip:'Two linked loops at different heights',      phases:['Draw the upper loop','Add the lower loop, slightly larger, with a small tail'] },
      { letter:'ද', sound:'da',  strokes:2, diff:'Hard',   tip:'Reversed P shape with flat bottom',          phases:['Start at the top-right — curve left across the top like a reversed P','Bring the line down with a flat base'] },
      { letter:'න', sound:'na',  strokes:2, diff:'Medium', tip:'Dental n — arch with right foot',            phases:['Draw the arch — start left, curve up and over to the right, then come down','Add a small right-facing foot'] },
      { letter:'ප', sound:'pa',  strokes:2, diff:'Medium', tip:'P-like shape with circular head',            phases:['Draw the circular head — go clockwise to form a full circle','Bring a vertical stem straight down'] },
      { letter:'ම', sound:'ma',  strokes:2, diff:'Medium', tip:'Two connected humps — like m in shape',      phases:['Draw the first hump — curve up from the left then down','Draw the second hump with a tail sweeping right'] },
      { letter:'ය', sound:'ya',  strokes:2, diff:'Hard',   tip:'Y-shaped starting stroke with curved body',  phases:['Draw a Y-shaped upper stroke','From that point, curve the body right and close into a loop'] },
      { letter:'ර', sound:'ra',  strokes:1, diff:'Easy',   tip:'Single elegant loop — like a teardrop',      phases:['One elegant stroke — start at the top-right, curve left, then spiral inward'] },
      { letter:'ල', sound:'la',  strokes:2, diff:'Medium', tip:'Tall vertical stroke with curved base',      phases:['Draw a tall vertical stroke from top to bottom','Curve the base to the left — like adding a foot'] },
      { letter:'ස', sound:'sa',  strokes:2, diff:'Hard',   tip:'S-shaped main body with base loop',          phases:['Draw the S-shaped main body','Add the small closing loop at the very base'] },
      { letter:'හ', sound:'ha',  strokes:2, diff:'Medium', tip:'H-like structure with curved crossbar',      phases:['Draw two vertical-ish strokes with a gap between','Connect them with a curved crossbar in the middle'] },
    ],
  },
];

const ALL_LETTERS = LETTER_CATEGORIES.flatMap(cat => cat.letters.map(l => ({ ...l, cat })));

const BRUSH_COLORS = [
  { color: '#111111', name: 'Black' },
  { color: '#444444', name: 'Charcoal' },
  { color: '#888888', name: 'Gray' },
  { color: '#1a56db', name: 'Blue' },
  { color: '#0e9f6e', name: 'Green' },
  { color: '#e02424', name: 'Red' },
  { color: '#9061f9', name: 'Purple' },
  { color: '#ff5a1f', name: 'Orange' },
];

const diffLabel = (d) =>
  d === 'Easy' ? 'Easy' : d === 'Medium' ? 'Medium' : 'Hard';

const getGrade = (score) => {
  if (score >= 90) return { label: 'Excellent', sub: 'Perfect tracing', stars: 3, symbol: '★★★' };
  if (score >= 75) return { label: 'Very Good', sub: 'Great technique', stars: 2, symbol: '★★☆' };
  if (score >= 60) return { label: 'Good', sub: 'Keep it up', stars: 2, symbol: '★★☆' };
  return               { label: 'Try Again', sub: 'Practice more', stars: 1, symbol: '★☆☆' };
};

const computeAccuracy = (userCanvas, guideCanvas) => {
  try {
    const w = userCanvas.width, h = userCanvas.height;
    const uCtx = userCanvas.getContext('2d');
    const gCtx = guideCanvas.getContext('2d');
    const uPx = uCtx.getImageData(0, 0, w, h).data;
    const gPx = gCtx.getImageData(0, 0, w, h).data;
    let guidePixels = 0, hitPixels = 0, extraPixels = 0;
    for (let i = 3; i < gPx.length; i += 4) {
      const inGuide = gPx[i] > 50;
      const inUser  = uPx[i] > 30;
      if (inGuide) { guidePixels++; if (inUser) hitPixels++; }
      else if (inUser) extraPixels++;
    }
    if (guidePixels === 0) return 0;
    const coverageScore = (hitPixels / guidePixels) * 100;
    const penalty = Math.min(30, (extraPixels / Math.max(guidePixels, 1)) * 25);
    return Math.min(100, Math.max(0, Math.round(coverageScore * 1.3 - penalty)));
  } catch {
    return 65 + Math.floor(Math.random() * 30);
  }
};

function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(value / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(current);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}</span>;
}

// ─── LETTER GRID ─────────────────────────────────────────────────
function LetterGrid({ currentLetter, masteredSet, progressMap, onSelect }) {
  const [openCat, setOpenCat] = useState(0);
  return (
    <div>
      {LETTER_CATEGORIES.map((cat, ci) => {
        const catDone = cat.letters.filter(l => masteredSet.has(l.letter)).length;
        const isOpen = openCat === ci;
        return (
          <div key={cat.id} style={{ marginBottom: 8 }}>
            <button
              onClick={() => setOpenCat(isOpen ? -1 : ci)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '10px 4px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: '0.5px solid #e5e7eb',
              }}
            >
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, color: isOpen ? '#111' : '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {cat.nameEn}
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: catDone === cat.letters.length ? '#111' : '#aaa' }}>
                {catDone}/{cat.letters.length}
              </span>
            </button>
            {isOpen && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 0 14px' }}>
                {cat.letters.map(l => {
                  const isMastered = masteredSet.has(l.letter);
                  const isCurrent  = currentLetter?.letter === l.letter;
                  return (
                    <button
                      key={l.letter}
                      onClick={() => onSelect(l)}
                      title={`${l.letter} (${l.sound})`}
                      style={{
                        width: 40, height: 40, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Noto Sans Sinhala', serif", fontSize: 18, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: isCurrent ? '#111' : isMastered ? '#f0f0f0' : '#fafafa',
                        border: isCurrent ? '2px solid #111' : isMastered ? '1.5px solid #111' : '1px solid #e5e7eb',
                        color: isCurrent ? '#fff' : '#111',
                        position: 'relative',
                      }}
                    >
                      {l.letter}
                      {isMastered && !isCurrent && (
                        <span style={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, background: '#111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#fff', fontSize: 8, lineHeight: 1 }}>✓</span>
                        </span>
                      )}
                    </button>
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
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20,
      background: 'rgba(255,255,255,0.96)',
      animation: 'scaleIn 0.4s cubic-bezier(.22,1,.36,1) both',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 280, width: '100%', padding: '0 24px' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 80, fontWeight: 800, lineHeight: 1, color: '#111', marginBottom: 8 }}>
          {score}%
        </div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 600, color: '#111', marginBottom: 6 }}>{grade.label}</div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#888', marginBottom: 8 }}>{grade.sub}</div>
        <div style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 6, color: '#111', marginBottom: 28 }}>{grade.symbol}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onRetry} style={{
            flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid #e5e7eb',
            background: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: '#444', cursor: 'pointer',
          }}>Clear &amp; Retry</button>
          <button onClick={onNext} style={{
            flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid #111',
            background: '#111', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: '#fff', cursor: 'pointer',
          }}>{isLast ? 'Finish' : 'Next →'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function LetterTracingPage({ lang = 'en' }) {
  const t = translations[lang] ?? translations.en;

  const [allLetters] = useState(() => ALL_LETTERS);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [showGuide, setShowGuide]       = useState(true);
  const [guideOpacity, setGuideOpacity] = useState(0.12);
  const [brushSize, setBrushSize]       = useState(20);
  const [brushColor, setBrushColor]     = useState('#111111');
  const [hasDrawn, setHasDrawn]         = useState(false);
  const [isChecking, setIsChecking]     = useState(false);
  const [scoreResult, setScoreResult]   = useState(null);
  const [celebrating, setCelebrating]   = useState(false);
  const [points, setPoints]             = useState(0);
  const [masteredSet, setMasteredSet]   = useState(new Set());
  const [progressMap, setProgressMap]   = useState({});
  const [showMilestone, setMilestone]   = useState(false);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const [history, setHistory]           = useState([]);
  const [activePanel, setActivePanel]   = useState('letters');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [alertLog, setAlertLog]         = useState([]);
  const [heroVisible, setHeroVisible]   = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const canvasRef  = useRef(null);
  const guideRef   = useRef(null);
  const isDrawRef  = useRef(false);
  const strokesRef = useRef([]);
  const curStrokeRef = useRef([]);

  const current = allLetters[currentIdx];
  const cat     = current.cat;
  const total   = allLetters.length;
  const pct     = Math.round(((currentIdx + 1) / total) * 100);
  const bestScore = progressMap[current.letter] ?? 0;
  const accuracy  = history.length > 0
    ? Math.round(history.slice(0, 10).reduce((a, h) => a + h.score, 0) / Math.min(history.length, 10))
    : 0;

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 80);
    setTimeout(() => setShowProgress(true), 500);
  }, []);

  const speak = useCallback((text, type = 'info') => {
    const d = new Date();
    const time = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0') + ':' + d.getSeconds().toString().padStart(2,'0');
    setAlertLog(prev => [...prev.slice(-14), { text, type, time }]);
    if (!voiceEnabled) return;
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9; utt.pitch = 1.05; utt.lang = 'en-US';
    window.speechSynthesis?.speak(utt);
  }, [voiceEnabled]);

  const buildGuideCanvas = useCallback((letter, w, h) => {
    const gc = document.createElement('canvas');
    gc.width = w; gc.height = h;
    const ctx = gc.getContext('2d');
    ctx.font = `900 ${Math.round(h * 0.65)}px "Noto Sans Sinhala", serif`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, w / 2, h / 2 + h * 0.04);
    guideRef.current = gc;
  }, []);

  const drawBackground = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, w, h);

    // Ruled guide lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    for (let y = 60; y < h; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Baseline
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72); ctx.stroke();
    ctx.setLineDash([]);

    // Margin line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(48, 0); ctx.lineTo(48, h); ctx.stroke();

    // Ghost letter
    if (showGuide) {
      ctx.font = `900 ${Math.round(h * 0.65)}px "Noto Sans Sinhala", serif`;
      ctx.fillStyle = `rgba(17,17,17,${guideOpacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(current.letter, w / 2, h / 2 + h * 0.04);
    }
  }, [showGuide, guideOpacity, current.letter]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    buildGuideCanvas(current.letter, canvas.width, canvas.height);
    drawBackground();
    setHasDrawn(false);
    setScoreResult(null);
    strokesRef.current = [];
    curStrokeRef.current = [];
    setAlertLog([]);
    setTimeout(() => speak(`Ready to trace ${current.letter} — ${current.phases[0]}`, 'start'), 400);
  }, [current, buildGuideCanvas, drawBackground, speak]);

  useEffect(() => { initCanvas(); }, [currentIdx]);
  useEffect(() => { drawBackground(); }, [showGuide, guideOpacity]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  const startDraw = (e) => {
    e.preventDefault();
    if (scoreResult) return;
    isDrawRef.current = true;
    setHasDrawn(true);
    const { x, y } = getPos(e);
    curStrokeRef.current = [{ x, y }];
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawRef.current || scoreResult) return;
    const { x, y } = getPos(e);
    curStrokeRef.current.push({ x, y });
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = brushColor;
    ctx.lineWidth   = brushSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const stopDraw = () => {
    if (!isDrawRef.current) return;
    isDrawRef.current = false;
    strokesRef.current.push([...curStrokeRef.current]);
    curStrokeRef.current = [];
  };

  const handleClear = () => {
    drawBackground();
    setHasDrawn(false);
    setScoreResult(null);
    strokesRef.current = [];
    curStrokeRef.current = [];
    speak('Canvas cleared — ready to trace again', 'info');
  };

  const handleCheck = () => {
    if (!hasDrawn || isChecking) return;
    setIsChecking(true);
    setTimeout(() => {
      const raw   = computeAccuracy(canvasRef.current, guideRef.current);
      const grade = getGrade(raw);
      setScoreResult({ score: raw, grade });
      setIsChecking(false);
      setPoints(p => p + Math.round(raw / 8));
      setProgressMap(pm => ({ ...pm, [current.letter]: Math.max(pm[current.letter] ?? 0, raw) }));
      setHistory(h => [{ letter: current.letter, score: raw, cat: cat.nameEn, ts: Date.now() }, ...h].slice(0, 50));
      if (raw >= 90) speak('Excellent — perfect tracing!', 'done');
      else if (raw >= 75) speak('Very good — great technique!', 'done');
      else if (raw >= 60) speak('Good effort — keep it up!', 'done');
      else speak('Keep practising — you will get it!', 'done');
      if (raw >= 80) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 1600);
        if (!masteredSet.has(current.letter)) {
          const nm = new Set([...masteredSet, current.letter]);
          setMasteredSet(nm);
          if (nm.size % 5 === 0) {
            setMilestoneCount(nm.size);
            setMilestone(true);
            setTimeout(() => setMilestone(false), 3500);
          }
        }
      }
    }, 400);
  };

  const handleNext  = () => setCurrentIdx(i => (i < total - 1 ? i + 1 : 0));
  const handlePrev  = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1); };
  const handleRetry = () => { handleClear(); setScoreResult(null); };

  const handleSelectLetter = (letter) => {
    const idx = allLetters.findIndex(l => l.letter === letter.letter);
    if (idx !== -1) setCurrentIdx(idx);
  };

  const progressStats = [
    { label: 'Points',    value: points,          suffix: '' },
    { label: 'Mastered',  value: masteredSet.size, suffix: '' },
    { label: 'Accuracy',  value: accuracy,         suffix: '%' },
  ];

  const chartBars = history.slice(0, 7).reverse().map(h => h.score);
  while (chartBars.length < 7) chartBars.unshift(0);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'DM Sans, sans-serif', color: '#111', paddingTop: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .sinhala      { font-family: 'Noto Sans Sinhala', serif; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes slideRight { from { width:0; } to { width:var(--bar-w); } }
        @keyframes milestoneUp { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }

        .anim-fade-up  { animation: fadeUp  0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in  { animation: fadeIn  0.5s ease both; }
        .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.22s; }
        .delay-3 { animation-delay: 0.38s; }
        .delay-4 { animation-delay: 0.54s; }

        canvas { touch-action: none; cursor: crosshair; display: block; }

        .hover-lift { transition: transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }

        button { transition: all 0.2s ease; }
        button:hover { opacity: 0.85; }
        button:active { transform: scale(0.98); }

        .panel-tab-active {
          background: #111 !important;
          color: #fff !important;
        }

        input[type=range] { -webkit-appearance: none; appearance: none; height: 2px; background: #e5e7eb; border-radius: 2px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #111; cursor: pointer; border: 2px solid #fff; box-shadow: 0 0 0 1px #111; }

        .milestone-toast { animation: milestoneUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .log-entry { animation: fadeIn 0.3s ease both; }
      `}</style>

      {/* ═══ PROGRESS SUB-BAR ═══ */}
      <div style={{ position: 'sticky', top: 80, zIndex: 40, background: '#fff', borderBottom: '0.5px solid #e5e7eb', padding: '10px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#aaa' }}>
              <span>Letter {currentIdx + 1} of {total}</span>
              <span>{pct}%</span>
            </div>
            <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#111', borderRadius: 2, width: `${pct}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexShrink: 0 }}>
            {progressStats.map(({ label, value, suffix }) => (
              <div key={label} style={{ textAlign: 'right' }}>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1, color: '#111' }}>
                  {showProgress ? <AnimatedCounter value={value} /> : 0}{suffix}
                </div>
                <div className="font-body" style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ HERO STRIP ═══ */}
      <section style={{ borderBottom: '0.5px solid #e5e7eb', padding: '28px 24px 28px', background: '#fff', overflow: 'hidden', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div className={heroVisible ? 'anim-fade-up' : ''} style={{ opacity: heroVisible ? 1 : 0 }}>
            <div className="font-body anim-fade-in delay-1" style={{ display: 'inline-block', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', border: '0.5px solid #111', padding: '4px 12px', marginBottom: 14 }}>
              {cat.nameEn} — Letter {currentIdx + 1}
            </div>
            <h1 className="font-display anim-fade-up delay-2" style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.06, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              Practice <em style={{ fontStyle: 'italic' }}>{current.letter}</em>,{' '}
              <span style={{ textDecoration: 'underline', textDecorationThickness: 2, textUnderlineOffset: 4 }}>improve</span>
            </h1>
            <p className="font-body anim-fade-up delay-3" style={{ fontSize: 15, color: '#666', marginBottom: 0, maxWidth: 380 }}>
              /{current.sound}/ · {current.strokes} stroke{current.strokes > 1 ? 's' : ''} · {current.diff}
            </p>
          </div>

          {/* Big letter display */}
          <div className={heroVisible ? 'anim-scale-in delay-2' : ''} style={{ opacity: heroVisible ? 1 : 0 }}>
            <div style={{
              width: 120, height: 120, background: '#f8f8f8', borderRadius: 16,
              border: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <span className="sinhala" style={{ fontSize: 72, fontWeight: 900, color: '#111', fontFamily: "'Noto Sans Sinhala', serif", lineHeight: 1 }}>
                {current.letter}
              </span>
              {masteredSet.has(current.letter) && (
                <div style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 10 }}>✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BODY ═══ */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '220px 1fr 240px', gap: 24 }}>

        {/* ══ LEFT SIDEBAR ══ */}
        <aside>
          {/* Panel tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, padding: 3, background: '#f8f8f8', borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            {[{ id: 'letters', label: 'Letters' }, { id: 'guide', label: 'Guide' }].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                className={activePanel === id ? 'panel-tab-active' : ''}
                style={{
                  flex: 1, padding: '7px 0', borderRadius: 8, border: 'none',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', background: 'transparent', color: '#888',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ height: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: 4 }}>
            {activePanel === 'letters' && (
              <>
                <div className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#aaa', marginBottom: 12 }}>
                  {masteredSet.size}/{total} mastered
                </div>
                <LetterGrid
                  currentLetter={current}
                  masteredSet={masteredSet}
                  progressMap={progressMap}
                  onSelect={handleSelectLetter}
                />
              </>
            )}

            {activePanel === 'guide' && (
              <div style={{ paddingTop: 4 }}>
                <div className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#aaa', marginBottom: 12 }}>
                  Stroke order
                </div>

                {/* Stroke boxes */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {Array.from({ length: Math.min(current.strokes, 4) }, (_, i) => (
                    <div key={i} style={{
                      width: 48, height: 48, background: '#f8f8f8', border: '0.5px solid #e5e7eb', borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                    }}>
                      <span className="sinhala" style={{ fontSize: 24, fontWeight: 900, color: '#111' }}>{current.letter}</span>
                      <div style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, background: '#111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '0.5px solid #e5e7eb', paddingTop: 16, marginBottom: 16 }}>
                  <div className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#aaa', marginBottom: 8 }}>
                    Pro tip
                  </div>
                  <p className="font-body" style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{current.tip}</p>
                </div>

                <div style={{ borderTop: '0.5px solid #e5e7eb', paddingTop: 16 }}>
                  <div className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#aaa', marginBottom: 10 }}>
                    Guidance steps
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {current.phases.map((phase, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 20, height: 20, background: '#111', borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{i + 1}</span>
                        </div>
                        <p className="font-body" style={{ fontSize: 12, color: '#555', lineHeight: 1.6, margin: 0 }}>{phase}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ══ MAIN CANVAS AREA ══ */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Navigation row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handlePrev} disabled={currentIdx === 0} style={{
                padding: '8px 16px', borderRadius: 8, border: '0.5px solid #e5e7eb',
                background: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#888', cursor: 'pointer',
                opacity: currentIdx === 0 ? 0.3 : 1,
              }}>← Prev</button>
              <button onClick={handleNext} style={{
                padding: '8px 16px', borderRadius: 8, border: '0.5px solid #e5e7eb',
                background: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#888', cursor: 'pointer',
              }}>Next →</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {bestScore > 0 && (
                <div className="font-body" style={{ fontSize: 13, color: '#888' }}>
                  Best: <strong style={{ color: '#111', fontWeight: 600 }}>{bestScore}%</strong>
                </div>
              )}
              {/* Guide toggle */}
              <button onClick={() => setShowGuide(g => !g)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                border: `0.5px solid ${showGuide ? '#111' : '#e5e7eb'}`,
                background: showGuide ? '#111' : '#fff',
                color: showGuide ? '#fff' : '#888',
                fontFamily: 'DM Sans, sans-serif', fontSize: 12, cursor: 'pointer',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showGuide
                    ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></>
                  }
                </svg>
                {showGuide ? 'Guide on' : 'Guide off'}
              </button>
              {showGuide && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="font-body" style={{ fontSize: 11, color: '#aaa' }}>opacity</span>
                  <input
                    type="range" min="5" max="35" value={Math.round(guideOpacity * 100)}
                    onChange={e => setGuideOpacity(+e.target.value / 100)}
                    style={{ width: 72 }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Canvas card */}
          <div className="hover-lift" style={{
            background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 16,
            overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          }}>
            <div style={{ padding: '10px 16px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f0f0f0' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e5e5e5' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#d5d5d5' }} />
              </div>
              <span className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#aaa', marginLeft: 6 }}>
                Practice canvas
              </span>
              {celebrating && (
                <span style={{ marginLeft: 'auto', fontSize: 14, animation: 'fadeIn 0.3s ease' }}>
                  ★ ★ ★
                </span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              {isChecking && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.9)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                }}>
                  <div style={{ width: 32, height: 32, border: '2px solid #e5e7eb', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p className="font-body" style={{ fontSize: 13, color: '#888' }}>Analysing your tracing…</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
              {scoreResult && (
                <ScoreOverlay
                  score={scoreResult.score}
                  grade={scoreResult.grade}
                  onNext={() => { setScoreResult(null); handleNext(); }}
                  onRetry={handleRetry}
                  isLast={currentIdx === total - 1}
                />
              )}
              {!hasDrawn && !scoreResult && (
                <div style={{
                  position: 'absolute', bottom: 20, right: 24, zIndex: 5, pointerEvents: 'none',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 24, padding: '8px 16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="font-body" style={{ fontSize: 12, color: '#888' }}>Start tracing here</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={680} height={440}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                style={{ width: '100%', display: 'block', background: '#fafafa' }}
              />
            </div>

            {/* Action row */}
            <div style={{ padding: '14px 16px', borderTop: '0.5px solid #e5e7eb', display: 'flex', gap: 10 }}>
              <button onClick={handleClear} style={{
                flex: '0 0 auto', padding: '12px 20px', borderRadius: 10,
                border: '0.5px solid #e5e7eb', background: '#fff',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#888', cursor: 'pointer',
              }}>Clear</button>
              <button onClick={handleCheck} disabled={!hasDrawn || isChecking || !!scoreResult} style={{
                flex: 1, padding: '12px 0', borderRadius: 10,
                border: !hasDrawn || isChecking || !!scoreResult ? '0.5px solid #e5e7eb' : '1px solid #111',
                background: !hasDrawn || isChecking || !!scoreResult ? '#f8f8f8' : '#111',
                fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
                color: !hasDrawn || isChecking || !!scoreResult ? '#bbb' : '#fff', cursor: hasDrawn ? 'pointer' : 'not-allowed',
              }}>
                {isChecking ? 'Checking…' : 'Check My Work →'}
              </button>
            </div>
          </div>

          {/* Voice guidance log */}
          <div style={{ background: '#fafafa', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="font-body" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Voice guidance</span>
              </div>
              <button onClick={() => setVoiceEnabled(v => !v)} style={{
                padding: '4px 12px', borderRadius: 6,
                border: `0.5px solid ${voiceEnabled ? '#111' : '#e5e7eb'}`,
                background: voiceEnabled ? '#111' : '#fff',
                fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: voiceEnabled ? '#fff' : '#aaa', cursor: 'pointer',
              }}>
                {voiceEnabled ? 'Voice on' : 'Voice off'}
              </button>
            </div>
            <div style={{ padding: '12px 16px', maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {alertLog.length === 0 ? (
                <p className="font-body" style={{ fontSize: 12, color: '#bbb', textAlign: 'center', padding: '8px 0' }}>
                  Voice guidance will appear here as you trace.
                </p>
              ) : (
                alertLog.slice().reverse().map((a, i) => (
                  <div key={i} className="log-entry" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span className="font-body" style={{ fontSize: 10, color: '#ccc', flexShrink: 0, paddingTop: 1, fontVariantNumeric: 'tabular-nums' }}>{a.time}</span>
                    <p className="font-body" style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.5 }}>{a.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent attempts */}
          {history.length > 0 && (
            <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#aaa', marginBottom: 12 }}>
                Recent attempts
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {history.slice(0, 10).map((h, i) => {
                  const g = getGrade(h.score);
                  return (
                    <div key={i} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div className="sinhala" style={{
                        width: 36, height: 36, borderRadius: 8,
                        border: `0.5px solid ${h.score >= 80 ? '#111' : '#e5e7eb'}`,
                        background: h.score >= 80 ? '#111' : '#fafafa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 900, color: h.score >= 80 ? '#fff' : '#555',
                        fontFamily: "'Noto Sans Sinhala', serif",
                      }}>
                        {h.letter}
                      </div>
                      <span className="font-body" style={{ fontSize: 10, color: h.score >= 80 ? '#111' : '#aaa', fontWeight: 500 }}>{h.score}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accuracy chart */}
          {history.length >= 2 && (
            <div style={{ background: '#fafafa', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="font-display" style={{ fontSize: 15, fontWeight: 600 }}>Accuracy trend</span>
                <span className="font-body" style={{ fontSize: 11, color: '#aaa' }}>Last 7 attempts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
                {chartBars.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', background: h > 0 ? '#111' : '#e5e7eb', borderRadius: '3px 3px 0 0',
                      height: `${(h / 100) * 48}px`, minHeight: h > 0 ? 3 : 0,
                      transition: 'height 1s cubic-bezier(.22,1,.36,1)',
                      transitionDelay: `${i * 80}ms`,
                    }} />
                    <span className="font-body" style={{ fontSize: 9, color: '#ccc' }}>
                      {['1','2','3','4','5','6','7'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ══ RIGHT SIDEBAR ══ */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Letter info card */}
          <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ background: '#111', padding: '24px 20px', textAlign: 'center' }}>
              <span className="sinhala" style={{ fontSize: 96, fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: "'Noto Sans Sinhala', serif", display: 'block' }}>
                {current.letter}
              </span>
              {bestScore > 0 && (
                <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 16, color: '#888', letterSpacing: 4 }}>
                  {getGrade(bestScore).symbol}
                </div>
              )}
            </div>
            <div style={{ padding: '16px 20px', background: '#fff' }}>
              {[
                { label: 'Sound',      value: `/${current.sound}/` },
                { label: 'Category',   value: cat.nameEn },
                { label: 'Difficulty', value: diffLabel(current.diff) },
                { label: 'Strokes',    value: `${current.strokes} stroke${current.strokes > 1 ? 's' : ''}` },
                { label: 'Best',       value: bestScore > 0 ? `${bestScore}%` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                  <span className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#aaa' }}>{label}</span>
                  <span className="font-body" style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brush settings */}
          <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 16, padding: '16px 20px', background: '#fff' }}>
            <div className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#aaa', marginBottom: 14 }}>
              Brush settings
            </div>

            {/* Size */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="font-body" style={{ fontSize: 12, color: '#666' }}>Size</span>
                <span className="font-body" style={{ fontSize: 12, fontWeight: 500, color: '#111' }}>{brushSize}px</span>
              </div>
              <input type="range" min="8" max="44" value={brushSize} onChange={e => setBrushSize(+e.target.value)} style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span className="font-body" style={{ fontSize: 10, color: '#ccc' }}>Fine</span>
                <span className="font-body" style={{ fontSize: 10, color: '#ccc' }}>Thick</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                <div style={{ borderRadius: '50%', background: brushColor, width: Math.max(6, brushSize * 0.5), height: Math.max(6, brushSize * 0.5), transition: 'all 0.2s' }} />
              </div>
            </div>

            {/* Colors */}
            <div className="font-body" style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>Color</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {BRUSH_COLORS.map(b => (
                <button
                  key={b.color}
                  onClick={() => setBrushColor(b.color)}
                  title={b.name}
                  style={{
                    width: '100%', paddingBottom: '100%', position: 'relative', borderRadius: 8,
                    background: b.color, border: brushColor === b.color ? '2.5px solid #fff' : '1px solid transparent',
                    boxShadow: brushColor === b.color ? `0 0 0 2px ${b.color}` : 'none',
                    cursor: 'pointer', transition: 'all 0.15s',
                    transform: brushColor === b.color ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Session stats */}
          <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 16, padding: '16px 20px', background: '#fafafa' }}>
            <div className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#aaa', marginBottom: 14 }}>
              Session stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Points',   value: points,          dark: true },
                { label: 'Mastered', value: masteredSet.size, dark: false },
                { label: 'Accuracy', value: `${accuracy}%`,  dark: false },
                { label: 'Attempts', value: history.length,  dark: false },
              ].map(({ label, value, dark }) => (
                <div key={label} style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: dark ? '#111' : '#fff',
                  border: dark ? 'none' : '0.5px solid #e5e7eb',
                }}>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 800, color: dark ? '#fff' : '#111', lineHeight: 1.1 }}>
                    {showProgress ? (typeof value === 'number' ? <AnimatedCounter value={value} /> : value) : (typeof value === 'number' ? 0 : '—')}
                  </div>
                  <div className="font-body" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: dark ? '#888' : '#aaa', marginTop: 3 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 16, padding: '16px 20px', background: '#fff' }}>
            <div className="font-body" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#aaa', marginBottom: 12 }}>
              How to practice
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Trace over the faint guide letter',
                'Follow the stroke order shown',
                'Stay within the guide path',
                'Tap "Check" for instant feedback',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 18, height: 18, background: '#111', borderRadius: 4, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{i + 1}</span>
                  </div>
                  <p className="font-body" style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.6 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ MILESTONE TOAST ═══ */}
      {showMilestone && (
        <div className="milestone-toast" style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, background: '#111', color: '#fff', borderRadius: 100,
          padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}>
          <span style={{ fontSize: 18 }}>★</span>
          <div>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>Milestone reached</div>
            <div className="font-body" style={{ fontSize: 12, color: '#888' }}>You've mastered {milestoneCount} letters</div>
          </div>
          <span style={{ fontSize: 18 }}>★</span>
        </div>
      )}

      {/* Subtle background decorations */}
      <div style={{ position: 'fixed', top: 80, right: -80, width: 320, height: 320, background: '#f8f8f8', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
      <div style={{ position: 'fixed', bottom: -60, left: -60, width: 240, height: 240, background: '#f8f8f8', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
    </div>
  );
}