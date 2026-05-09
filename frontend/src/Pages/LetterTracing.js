import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── CANVAS DIMENSIONS ──────────────────────────────────────────
const CANVAS_W = 680;
const CANVAS_H = 440;
const KP_SRC   = 400;
const KP_TOL   = Math.round(35 * (CANVAS_W / KP_SRC));
const KP_TOUCH = 14;

// ─── SOUND PLAYER ────────────────────────────────────────────────
// M4A files should be placed at: /public/sounds/<letter>.m4a
// Example: /public/sounds/අ.m4a, /public/sounds/ආ.m4a, /public/sounds/ක.m4a
// If a file is missing, it silently falls back without crashing.
const audioCache = {};

function playLetterSound(letter) {
  try {
    // Encode the letter for safe URL usage (Sinhala unicode chars need encoding)
    const encoded = encodeURIComponent(letter);
    const src = `/sounds/${encoded}.m4a`;

    // Reuse cached Audio objects to avoid re-creating on every click
    if (!audioCache[letter]) {
      audioCache[letter] = new Audio(src);
    }
    const audio = audioCache[letter];
    audio.currentTime = 0;
    audio.play().catch(() => {
      // File not found or browser blocked autoplay — silently ignore
      console.warn(`Sound file not found: ${src}`);
    });
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

// ─── KEYPOINTS (source: 400 × 400 coordinate space) ─────────────
const KEYPOINTS_SRC = {
  'අ':[
    {x:185,y:150},{x:223,y:185},{x:180,y:190},{x:150,y:230},
    {x:200,y:270},{x:240,y:265},{x:223,y:320},{x:223,y:240},
    {x:240,y:145},{x:235,y:210},
  ],
  'ආ':[
    {x:150,y:150},{x:190,y:185},{x:140,y:190},{x:120,y:230},
    {x:150,y:270},{x:210,y:265},{x:190,y:320},{x:190,y:240},
    {x:210,y:145},{x:210,y:210},{x:240,y:150},{x:280,y:200},{x:240,y:268},
  ],
  'ඇ':[
    {x:150,y:150},{x:190,y:185},{x:140,y:190},{x:120,y:230},
    {x:150,y:270},{x:210,y:265},{x:190,y:320},{x:190,y:240},
    {x:210,y:145},{x:210,y:210},{x:250,y:200},{x:280,y:200},
    {x:250,y:268},{x:280,y:320},
  ],
  'ඈ':[
    {x:150,y:150},{x:190,y:185},{x:140,y:190},{x:120,y:230},
    {x:150,y:270},{x:210,y:265},{x:190,y:320},{x:190,y:240},
    {x:210,y:145},{x:210,y:210},{x:250,y:200},{x:280,y:200},
    {x:250,y:268},{x:280,y:320},
  ],
  'ඉ':[
    {x:200,y:220},{x:200,y:190},{x:200,y:250},{x:150,y:200},
    {x:210,y:150},{x:250,y:200},{x:220,y:270},{x:200,y:330},{x:170,y:300},
  ],
  'ඊ':[
    {x:210,y:150},{x:240,y:220},{x:210,y:260},{x:150,y:220},
    {x:180,y:150},{x:230,y:100},{x:170,y:110},{x:190,y:110},
    {x:240,y:130},{x:260,y:130},
  ],
  'උ':[
    {x:200,y:150},{x:240,y:180},{x:150,y:250},{x:200,y:330},{x:250,y:280},
  ],
  'ඌ':[
    {x:150,y:150},{x:200,y:180},{x:100,y:250},{x:150,y:330},
    {x:200,y:280},{x:230,y:160},{x:250,y:210},{x:260,y:170},
    {x:300,y:220},{x:255,y:270},
  ],
  'ක':[
    {x:120,y:180},{x:160,y:180},{x:230,y:220},{x:220,y:270},
    {x:190,y:230},{x:160,y:270},{x:130,y:240},{x:230,y:150},
    {x:270,y:200},{x:250,y:270},
  ],
  'ග':[
    {x:180,y:140},{x:140,y:210},{x:180,y:260},{x:190,y:200},
    {x:240,y:140},{x:260,y:200},{x:230,y:270},
  ],
  'ච':[
    {x:160,y:150},{x:200,y:180},{x:140,y:180},{x:160,y:190},
    {x:180,y:270},{x:240,y:250},{x:260,y:190},{x:220,y:90},{x:150,y:100},
  ],
  'ජ':[
    {x:150,y:160},{x:190,y:190},{x:145,y:220},{x:200,y:270},
    {x:250,y:240},{x:210,y:190},{x:240,y:145},{x:240,y:180},
    {x:220,y:130},{x:255,y:100},
  ],
  'ට':[
    {x:200,y:100},{x:150,y:120},{x:130,y:170},{x:150,y:220},
    {x:200,y:240},{x:250,y:220},{x:270,y:170},{x:250,y:120},
    {x:220,y:130},{x:290,y:170},{x:170,y:150},{x:180,y:200},
    {x:230,y:200},{x:250,y:160},
  ],
  'ත':[
    {x:200,y:90},{x:160,y:110},{x:140,y:150},{x:160,y:200},
    {x:200,y:220},{x:240,y:200},{x:220,y:250},{x:180,y:280},
    {x:150,y:310},{x:130,y:340},{x:180,y:140},{x:190,y:190},
    {x:210,y:240},{x:170,y:270},
  ],
  'ද':[
    {x:280,y:90},{x:230,y:90},{x:180,y:100},{x:140,y:130},
    {x:130,y:180},{x:140,y:240},{x:160,y:280},{x:190,y:300},
    {x:230,y:300},{x:280,y:280},{x:170,y:140},{x:150,y:200},
    {x:170,y:260},{x:220,y:290},
  ],
  'න':[
    {x:140,y:100},{x:120,y:150},{x:140,y:200},{x:180,y:220},
    {x:230,y:210},{x:260,y:170},{x:260,y:120},{x:240,y:100},
    {x:200,y:100},{x:280,y:170},{x:160,y:160},{x:190,y:200},
    {x:240,y:180},{x:250,y:140},
  ],
  'ප':[
    {x:200,y:80},{x:160,y:100},{x:140,y:140},{x:160,y:200},
    {x:200,y:220},{x:240,y:200},{x:260,y:140},{x:240,y:100},
    {x:200,y:180},{x:200,y:300},{x:180,y:160},{x:220,y:180},
    {x:240,y:160},{x:200,y:260},
  ],
  'ම':[
    {x:140,y:100},{x:120,y:150},{x:140,y:200},{x:180,y:230},
    {x:220,y:210},{x:220,y:280},{x:180,y:310},{x:140,y:310},
    {x:120,y:280},{x:160,y:290},{x:170,y:180},{x:200,y:250},
    {x:190,y:290},{x:150,y:270},
  ],
  'ය':[
    {x:200,y:80},{x:160,y:100},{x:130,y:140},{x:130,y:190},
    {x:160,y:230},{x:210,y:240},{x:250,y:210},{x:260,y:170},
    {x:240,y:150},{x:200,y:130},{x:150,y:160},{x:170,y:200},
    {x:220,y:220},{x:240,y:190},
  ],
  'ර':[
    {x:280,y:90},{x:250,y:110},{x:220,y:140},{x:200,y:180},
    {x:190,y:230},{x:210,y:270},{x:240,y:290},{x:270,y:270},
    {x:280,y:230},{x:270,y:190},{x:230,y:130},{x:200,y:150},
    {x:210,y:210},{x:240,y:250},
  ],
  'ල':[
    {x:200,y:80},{x:200,y:150},{x:200,y:220},{x:200,y:280},
    {x:180,y:310},{x:150,y:320},{x:130,y:300},{x:140,y:260},
    {x:170,y:250},{x:190,y:240},{x:200,y:100},{x:200,y:180},
    {x:200,y:250},{x:180,y:290},
  ],
  'ස':[
    {x:200,y:90},{x:150,y:110},{x:130,y:150},{x:170,y:190},
    {x:220,y:210},{x:260,y:230},{x:280,y:270},{x:250,y:300},
    {x:200,y:320},{x:150,y:310},{x:160,y:140},{x:190,y:180},
    {x:240,y:220},{x:260,y:260},
  ],
  'හ':[
    {x:140,y:90},{x:140,y:160},{x:140,y:240},{x:140,y:300},
    {x:170,y:310},{x:220,y:280},{x:260,y:240},{x:290,y:200},
    {x:270,y:160},{x:230,y:150},{x:170,y:130},{x:200,y:200},
    {x:230,y:270},{x:190,y:270},
  ],
};

function getScaledKP(letter) {
  return (KEYPOINTS_SRC[letter] || []).map(p => ({
    x: (p.x / KP_SRC) * CANVAS_W,
    y: (p.y / KP_SRC) * CANVAS_H,
  }));
}

// ─── LETTER CATEGORIES ───────────────────────────────────────────
const LETTER_CATEGORIES = [
  {
    id: 'vowels', name: 'ස්වර', nameEn: 'Vowels',
    letters: [
      { letter:'අ', sound:'a',   strokes:1, diff:'Easy',   tip:'Start top-left, curve right and loop down',   phases:['Start at the top — curve right, then loop down into a round body'] },
      { letter:'ආ', sound:'aa',  strokes:1, diff:'Easy',   tip:'Like අ with a long tail extending right',     phases:['Trace the round body of අ, then extend a long sweeping tail to the right'] },
      { letter:'ඇ', sound:'ae',  strokes:1, diff:'Easy',   tip:'Round body with a small hook at top',         phases:['Begin at the top-left hook, curve right, then bring the loop down and close it'] },
      { letter:'ඈ', sound:'aee', strokes:2, diff:'Medium', tip:'ඇ plus a long right extension stroke',        phases:['Draw the round body of ඇ','Now add a long horizontal stroke to the right'] },
      { letter:'ඉ', sound:'i',   strokes:1, diff:'Easy',   tip:'Single flowing loop, like a backwards e',     phases:['Start at the right, curve up and left, then loop around'] },
      { letter:'ඊ', sound:'ii',  strokes:2, diff:'Medium', tip:'ඉ with a vertical bar on the right',          phases:['Draw the ඉ loop','Now add a short vertical bar on the right side'] },
      { letter:'උ', sound:'u',   strokes:1, diff:'Easy',   tip:'Bowl shape opening upward',                   phases:['Start at the left, sweep down and curve right — like drawing a bowl'] },
      { letter:'ඌ', sound:'uu',  strokes:2, diff:'Medium', tip:'උ with a curved extension below',             phases:['Draw the bowl shape of උ','Now add a curved extension below, hooking to the left'] },
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
  } catch { return 65+Math.floor(Math.random()*30); }
};

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
// Standalone button component — clicking plays /sounds/<letter>.mp3
function SoundButton({ letter, size = 'md' }) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = useCallback((e) => {
    e.stopPropagation();
    setPlaying(true);
    playLetterSound(letter);
    // Reset visual state after ~800ms (typical short pronunciation duration)
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
        width: dim,
        height: dim,
        borderRadius: '50%',
        border: playing ? '1.5px solid #1a56db' : '1.5px solid #e5e7eb',
        background: playing ? '#eff6ff' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.15s ease',
        boxShadow: playing ? '0 0 0 3px rgba(26,86,219,0.15)' : 'none',
        transform: playing ? 'scale(0.94)' : 'scale(1)',
      }}
    >
      {playing ? (
        // Animated sound wave icon when playing
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#1a56db" stroke="none"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      ) : (
        // Speaker icon at rest
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
      )}
    </button>
  );
}

// ─── BOUNDARY HELPERS ────────────────────────────────────────────
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

function triggerVibration() {
  try { navigator.vibrate?.([80,40,80]); } catch {}
}

function isOutsideBoundary(px, py, guideCanvas) {
  if (!guideCanvas) return false;
  try {
    const ctx=guideCanvas.getContext('2d');
    const data=ctx.getImageData(0,0,guideCanvas.width,guideCanvas.height).data;
    const r=12; let letter=0, total=0;
    for (let dy=-r; dy<=r; dy++) {
      for (let dx=-r; dx<=r; dx++) {
        const nx=Math.round(px+dx), ny=Math.round(py+dy);
        if (nx<0||ny<0||nx>=guideCanvas.width||ny>=guideCanvas.height) continue;
        const idx=(ny*guideCanvas.width+nx)*4;
        if (data[idx+3]>30) letter++;
        total++;
      }
    }
    return total>0 && (letter/total)<0.05;
  } catch { return false; }
}

// ─── KEYPOINTS OVERLAY ───────────────────────────────────────────
function KeypointsOverlay({ keypoints, validTracePoints, canvasW, canvasH, show }) {
  if (!show || !keypoints.length) return null;
  return (
    <svg
      style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:8 }}
      viewBox={`0 0 ${canvasW} ${canvasH}`}
      preserveAspectRatio="none"
    >
      {keypoints.map((kp, idx) => {
        const covered = validTracePoints.some(tp => Math.hypot(tp.x-kp.x, tp.y-kp.y) <= KP_TOUCH);
        return (
          <g key={idx}>
            <circle cx={kp.x} cy={kp.y} r={10}
              fill={covered ? 'rgba(21,128,61,0.82)' : 'rgba(232,230,240,0.72)'} />
            <text x={kp.x} y={kp.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="11" fontFamily="sans-serif" fontWeight="bold"
              fill={covered ? '#166534' : '#1a1a2e'}>
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

// ─── LETTER GRID ─────────────────────────────────────────────────
function LetterGrid({ currentLetter, masteredSet, onSelect }) {
  const [openCat, setOpenCat] = useState(0);
  return (
    <div>
      {LETTER_CATEGORIES.map((cat, ci) => {
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
                          justifyContent:'center', fontFamily:"'Noto Sans Sinhala',serif", fontSize:18,
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
                      {/* Small sound button under each letter tile */}
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function LetterTracingPage() {
  const [allLetters]  = useState(() => ALL_LETTERS);
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
  const [alertLog, setAlertLog]         = useState([]);
  const [heroVisible, setHeroVisible]   = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const [boundaryWarning, setBoundaryWarning] = useState(false);
  const [warningCount, setWarningCount]       = useState(0);
  const allLettersRef = useRef(allLetters);

  const [scaledKP, setScaledKP]             = useState([]);
  const [validTracePoints, setValidTracePoints] = useState([]);
  const [traceProgress, setTraceProgress]   = useState(0);
  const [isComplete, setIsComplete]         = useState(false);
  const [showKP, setShowKP]                 = useState(true);

  const canvasRef       = useRef(null);
  const guideRef        = useRef(null);
  const isDrawRef       = useRef(false);
  const strokesRef      = useRef([]);
  const curStrokeRef    = useRef([]);
  const warningCoolRef  = useRef(0);
  const validPtsRef     = useRef([]);
  const drawCntRef      = useRef(0);
  const isCompleteRef   = useRef(false);

  const showGuideRef    = useRef(showGuide);
  const guideOpacityRef = useRef(guideOpacity);
  const currentIdxRef   = useRef(currentIdx);

  useEffect(() => { showGuideRef.current = showGuide; },    [showGuide]);
  useEffect(() => { guideOpacityRef.current = guideOpacity; }, [guideOpacity]);
  useEffect(() => { currentIdxRef.current = currentIdx; },  [currentIdx]);

  const current = allLetters[currentIdx];
  const cat     = current.cat;
  const total   = allLetters.length;
  const pct     = Math.round(((currentIdx+1)/total)*100);
  const bestScore = progressMap[current.letter] ?? 0;
  const accuracy  = history.length>0
    ? Math.round(history.slice(0,10).reduce((a,h)=>a+h.score,0)/Math.min(history.length,10))
    : 0;
  const chartBars = (() => { const b=history.slice(0,7).reverse().map(h=>h.score); while(b.length<7) b.unshift(0); return b; })();

  // ── Log helper (no auto-voice) ───────────────────────────────
  // NOTE: Auto-play voice has been fully removed.
  // All audio is now user-triggered via SoundButton components only.
  const logAlert = useCallback((text, type = 'info') => {
    const d = new Date();
    const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    setAlertLog(prev => [...prev.slice(-14), { text, type, time }]);
  }, []);

  // ── Build offscreen guide canvas ──────────────────────────────
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
      const letter = allLettersRef.current[currentIdxRef.current].letter;
      ctx.font=`900 ${Math.round(h*0.65)}px "Noto Sans Sinhala",serif`;
      ctx.fillStyle=`rgba(17,17,17,${guideOpacityRef.current})`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(letter, w/2, h/2+h*0.04);
    }
  }, []);

  const updateTraceProgress = useCallback(() => {
    const kps = scaledKP; if (!kps.length) return 0;
    const covered = new Set();
    validPtsRef.current.forEach(tp => {
      kps.forEach((kp, idx) => {
        if (Math.hypot(tp.x-kp.x, tp.y-kp.y) <= KP_TOUCH) covered.add(idx);
      });
    });
    const pct2 = Math.min(100, (covered.size/kps.length)*100);
    setTraceProgress(pct2);
    setValidTracePoints([...validPtsRef.current]);
    return pct2;
  }, [scaledKP]);

  const computeKPScore = useCallback(() => {
    const kps = scaledKP;
    if (!kps.length) return computeAccuracy(canvasRef.current, guideRef.current);
    const hits = new Array(kps.length).fill(0);
    validPtsRef.current.forEach(tp => {
      kps.forEach((kp,idx) => { if (Math.hypot(tp.x-kp.x,tp.y-kp.y)<=KP_TOUCH) hits[idx]++; });
    });
    return Math.round((hits.filter(h=>h>=3).length/kps.length)*100);
  }, [scaledKP]);

  const awardMastery = useCallback((raw) => {
    if (!masteredSet.has(current.letter)) {
      const nm = new Set([...masteredSet, current.letter]);
      setMasteredSet(nm);
      if (nm.size%5===0) { setMilestoneCount(nm.size); setMilestone(true); setTimeout(()=>setMilestone(false),3500); }
    }
    setPoints(p=>p+Math.round(raw/8));
    setProgressMap(pm=>({ ...pm, [current.letter]:Math.max(pm[current.letter]??0,raw) }));
    setHistory(h=>[{letter:current.letter,score:raw,cat:cat.nameEn,ts:Date.now()},...h].slice(0,50));
  }, [current, cat, masteredSet]);

  const handleAutoComplete = useCallback(() => {
    if (isCompleteRef.current) return;
    isCompleteRef.current = true;
    setIsComplete(true);
    const raw = computeKPScore();
    setCelebrating(true);
    setTimeout(()=>setCelebrating(false),1600);
    logAlert('Excellent — perfect tracing!', 'done');
    awardMastery(Math.max(raw,90));
    setTimeout(()=>{
      isCompleteRef.current=false;
      setIsComplete(false);
      setScoreResult(null);
      setCurrentIdx(i=>i<total-1?i+1:0);
    },2000);
  }, [computeKPScore, awardMastery, logAlert, total]);

  const initCanvas = useCallback(() => {
    const canvas=canvasRef.current; if (!canvas) return;
    buildGuideCanvas(current.letter, canvas.width, canvas.height);
    const kps=getScaledKP(current.letter);
    setScaledKP(kps);
    drawBackground();
    setHasDrawn(false); setScoreResult(null);
    setBoundaryWarning(false); setWarningCount(0);
    setValidTracePoints([]); setTraceProgress(0);
    setIsComplete(false); isCompleteRef.current=false;
    validPtsRef.current=[]; drawCntRef.current=0;
    strokesRef.current=[]; curStrokeRef.current=[];
    setAlertLog([]);
    // ✅ NO auto-play here — removed speak() call
    // User must click the SoundButton to hear the letter
    logAlert(`Ready to trace ${current.letter} — ${current.phases[0]}`, 'start');
  }, [current, buildGuideCanvas, drawBackground, logAlert]);

  useEffect(() => { initCanvas(); }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { drawBackground(); }, [showGuide, guideOpacity, drawBackground]);
  useEffect(()=>{
    setTimeout(()=>setHeroVisible(true),80);
    setTimeout(()=>setShowProgress(true),500);
  },[]);

  const getPos = (e) => {
    const canvas=canvasRef.current;
    const rect=canvas.getBoundingClientRect();
    const sx=canvas.width/rect.width, sy=canvas.height/rect.height;
    const src=e.touches?e.touches[0]:e;
    return { x:(src.clientX-rect.left)*sx, y:(src.clientY-rect.top)*sy };
  };

  const checkBoundary = useCallback((px,py)=>{
    const now=Date.now();
    if (now-warningCoolRef.current<600) return;
    if (!isOutsideBoundary(px,py,guideRef.current)) return;
    warningCoolRef.current=now;
    setBoundaryWarning(true);
    setWarningCount(c=>c+1);
    playWarningSound(); triggerVibration();
    const time=new Date().toTimeString().slice(0,8);
    setAlertLog(prev=>[...prev.slice(-14),{
      text:`⚠ Boundary crossed at (${Math.round(px)}, ${Math.round(py)}) — stay on the letter!`,
      type:'warning', time,
    }]);
    setTimeout(()=>setBoundaryWarning(false),500);
  },[]);

  const startDraw = (e) => {
    e.preventDefault();
    if (scoreResult || isCompleteRef.current) return;
    isDrawRef.current=true; setHasDrawn(true);
    const {x,y}=getPos(e);
    curStrokeRef.current=[{x,y}];
    const ctx=canvasRef.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(x,y);
    checkBoundary(x,y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawRef.current || scoreResult || isCompleteRef.current) return;
    const {x,y}=getPos(e);
    curStrokeRef.current.push({x,y});
    const ctx=canvasRef.current.getContext('2d');
    ctx.strokeStyle=brushColor; ctx.lineWidth=brushSize;
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.lineTo(x,y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x,y);
    if (scaledKP.some(kp => Math.hypot(x-kp.x, y-kp.y) <= KP_TOUCH)) {
      validPtsRef.current.push({x,y});
    }
    drawCntRef.current++;
    if (drawCntRef.current%5===0) {
      const pct2=updateTraceProgress();
      if (pct2>=95 && !isCompleteRef.current) handleAutoComplete();
    }
    checkBoundary(x,y);
  };

  const stopDraw = useCallback(()=>{
    if (!isDrawRef.current) return;
    isDrawRef.current=false;
    strokesRef.current.push([...curStrokeRef.current]);
    curStrokeRef.current=[];
    const pct2=updateTraceProgress();
    if (pct2>=95 && !isCompleteRef.current) handleAutoComplete();
  },[updateTraceProgress, handleAutoComplete]);

  const handleClear = () => {
    drawBackground();
    setHasDrawn(false); setScoreResult(null);
    setBoundaryWarning(false); setWarningCount(0);
    setValidTracePoints([]); setTraceProgress(0);
    setIsComplete(false); isCompleteRef.current=false;
    validPtsRef.current=[]; drawCntRef.current=0;
    strokesRef.current=[]; curStrokeRef.current=[];
    logAlert('Canvas cleared — ready to trace again', 'info');
  };

  const handleCheck = () => {
    if (!hasDrawn||isChecking||isCompleteRef.current) return;
    setIsChecking(true);
    setTimeout(()=>{
      const raw=computeKPScore();
      const grade=getGrade(raw);
      setScoreResult({score:raw,grade});
      setIsChecking(false);
      awardMastery(raw);
      if (raw>=90) logAlert('Excellent — perfect tracing!','done');
      else if (raw>=75) logAlert('Very good — great technique!','done');
      else if (raw>=60) logAlert('Good effort — keep it up!','done');
      else logAlert('Keep practising — you will get it!','done');
      if (raw>=80) { setCelebrating(true); setTimeout(()=>setCelebrating(false),1600); }
    },400);
  };

  const handleNext  = ()=>{ handleClear(); setCurrentIdx(i=>i<total-1?i+1:0); };
  const handlePrev  = ()=>{ if (currentIdx>0) { handleClear(); setCurrentIdx(i=>i-1); } };
  const handleRetry = ()=>{ handleClear(); setScoreResult(null); };
  const handleSelectLetter = l=>{
    const idx=allLetters.findIndex(a=>a.letter===l.letter);
    if (idx!==-1) { handleClear(); setCurrentIdx(idx); }
  };

  const progressStats = [
    {label:'Points',   value:points,           suffix:''},
    {label:'Mastered', value:masteredSet.size,  suffix:''},
    {label:'Accuracy', value:accuracy,          suffix:'%'},
  ];

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:'DM Sans,sans-serif', color:'#111', paddingTop:80 }}>
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
        @keyframes soundPulse{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}
        .afu{animation:fadeUp 0.7s cubic-bezier(.22,1,.36,1) both}
        .afi{animation:fadeIn 0.5s ease both}
        .asi{animation:scaleIn 0.5s cubic-bezier(.22,1,.36,1) both}
        .d1{animation-delay:0.1s}.d2{animation-delay:0.22s}.d3{animation-delay:0.38s}
        canvas{touch-action:none;cursor:crosshair;display:block}
        button{transition:all 0.2s ease}
        button:hover{opacity:0.85}
        button:active{transform:scale(0.98)}
        .ptab{background:#111!important;color:#fff!important}
        input[type=range]{-webkit-appearance:none;appearance:none;height:2px;background:#e5e7eb;border-radius:2px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#111;cursor:pointer;border:2px solid #fff;box-shadow:0 0 0 1px #111}
        .mtoast{animation:milestoneUp 0.5s cubic-bezier(.22,1,.36,1) both}
        .log-e{animation:fadeIn 0.3s ease both}
        .wbadge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;background:#fef2f2;border:0.5px solid #fca5a5;font-family:'DM Sans',sans-serif;font-size:11px;color:#dc2626;font-weight:500}
        .sound-btn-hero:hover{background:#f0f7ff!important;border-color:#93c5fd!important}
      `}</style>

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
          {/* Hero letter card with SOUND BUTTON */}
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
              {/* Sound button pinned to bottom-right of hero card */}
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
                {/* LetterGrid now shows a small sound button under each tile */}
                <LetterGrid currentLetter={current} masteredSet={masteredSet} onSelect={handleSelectLetter}/>
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
                    {current.phases.map((phase,i)=>(
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
                  <div className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:8 }}>Keypoint detection</div>
                  <p className="fb" style={{ fontSize:12, color:'#555', lineHeight:1.6, marginBottom:10 }}>
                    {scaledKP.length} keypoints guide this letter. Green = covered, light = not yet reached.
                  </p>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:'rgba(232,230,240,0.8)', border:'1px solid #aaa' }}/>
                      <span className="fb" style={{ fontSize:11, color:'#888' }}>Not covered</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:'rgba(21,128,61,0.82)' }}/>
                      <span className="fb" style={{ fontSize:11, color:'#888' }}>Covered ✓</span>
                    </div>
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
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              {bestScore>0&&(
                <div className="fb" style={{ fontSize:13, color:'#888' }}>
                  Best: <strong style={{ color:'#111', fontWeight:600 }}>{bestScore}%</strong>
                </div>
              )}
              <button onClick={()=>setShowKP(v=>!v)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8,
                  border:`0.5px solid ${showKP?'#15803d':'#e5e7eb'}`,
                  background:showKP?'#dcfce7':'#fff',
                  color:showKP?'#15803d':'#888',
                  fontFamily:'DM Sans,sans-serif', fontSize:12, cursor:'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9" strokeDasharray="3 3"/>
                </svg>
                {showKP?'Keypoints on':'Keypoints off'}
              </button>
              <button onClick={()=>setShowGuide(g=>!g)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8,
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
              {showGuide&&(
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="fb" style={{ fontSize:11, color:'#aaa' }}>opacity</span>
                  <input type="range" min="5" max="35" value={Math.round(guideOpacity*100)}
                    onChange={e=>setGuideOpacity(+e.target.value/100)} style={{ width:72 }}/>
                </div>
              )}
            </div>
          </div>

          {/* Boundary warning banner */}
          {boundaryWarning&&(
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

          {/* Live guide progress bar */}
          <div style={{ marginBottom:4, padding:'0 10px' }}>
            <div style={{ fontSize:12, color:'#6B6B80', textAlign:'center', marginBottom:5 }}>
              Live Guide: {Math.floor(traceProgress)}%
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
          <div style={{
            background:'#fff',
            border:boundaryWarning?'2px solid #dc2626':'0.5px solid #e5e7eb',
            borderRadius:16, overflow:'hidden',
            boxShadow:boundaryWarning
              ?'0 0 0 4px rgba(220,38,38,0.15)'
              :'0 2px 16px rgba(0,0,0,0.04)',
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
                — {scaledKP.length} keypoints active
              </span>
              {celebrating&&(
                <span style={{ marginLeft:'auto', fontSize:14, animation:'fadeIn 0.3s ease' }}>★ ★ ★</span>
              )}
              {warningCount>0&&!celebrating&&(
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
                  <span className="fb" style={{ fontSize:12, color:'#888' }}>Start tracing here</span>
                </div>
              )}

              <KeypointsOverlay
                keypoints={scaledKP}
                validTracePoints={validTracePoints}
                canvasW={CANVAS_W} canvasH={CANVAS_H}
                show={showKP}
              />
              <BoundaryWarningFlash visible={boundaryWarning}/>

              <canvas
                ref={canvasRef}
                width={CANVAS_W} height={CANVAS_H}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                style={{ width:'100%', display:'block', background:'#fafafa' }}
              />
            </div>

            {/* Action row — Clear, SOUND BUTTON, Check */}
            <div style={{ padding:'14px 16px', borderTop:'0.5px solid #e5e7eb', display:'flex', gap:10, alignItems:'center' }}>
              <button onClick={handleClear}
                style={{ flex:'0 0 auto', padding:'12px 20px', borderRadius:10,
                  border:'0.5px solid #e5e7eb', background:'#fff',
                  fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#888', cursor:'pointer' }}>
                Clear
              </button>

              {/* ── SOUND BUTTON in action bar ── */}
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

          {/* Activity log (replaces voice log) */}
          <div style={{ background:'#fafafa', border:'0.5px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'10px 16px', borderBottom:'0.5px solid #e5e7eb',
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="fb" style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em', color:'#888' }}>
                  Activity log &amp; boundary alerts
                </span>
              </div>
              {/* Sound button also accessible from log bar */}
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="fb" style={{ fontSize:11, color:'#bbb' }}>Play letter sound:</span>
                <SoundButton letter={current.letter} size="sm" />
              </div>
            </div>
            <div style={{ padding:'12px 16px', maxHeight:120, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
              {alertLog.length===0
                ? <p className="fb" style={{ fontSize:12, color:'#bbb', textAlign:'center', padding:'8px 0' }}>
                    Activity and boundary warnings will appear here.
                  </p>
                : alertLog.slice().reverse().map((a,i)=>(
                  <div key={i} className="log-e" style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <span className="fb" style={{ fontSize:10, color:'#ccc', flexShrink:0, paddingTop:1 }}>{a.time}</span>
                    <p className="fb" style={{ fontSize:12, color:a.type==='warning'?'#dc2626':'#555',
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

          {/* Accuracy trend chart */}
          {history.length>=2&&(
            <div style={{ background:'#fafafa', border:'0.5px solid #e5e7eb', borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span className="fd" style={{ fontSize:15, fontWeight:600 }}>Accuracy trend</span>
                <span className="fb" style={{ fontSize:11, color:'#aaa' }}>Last 7 attempts</span>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:60 }}>
                {chartBars.map((h,i)=>(
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', background:h>0?'#111':'#e5e7eb', borderRadius:'3px 3px 0 0',
                      height:`${(h/100)*48}px`, minHeight:h>0?3:0,
                      transition:`height 1s cubic-bezier(.22,1,.36,1) ${i*80}ms` }}/>
                    <span className="fb" style={{ fontSize:9, color:'#ccc' }}>{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ══ RIGHT SIDEBAR ══ */}
        <aside style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Letter info card with large SOUND BUTTON */}
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
              {/* Large sound button centred at bottom of black card */}
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
                {label:'Covered',    value:`${new Set(validTracePoints.map(tp=>scaledKP.findIndex(kp=>Math.hypot(tp.x-kp.x,tp.y-kp.y)<=KP_TOUCH)).filter(i=>i>=0)).size}/${scaledKP.length}`},
              ].map(({label,value})=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid #f0f0f0' }}>
                  <span className="fb" style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'#aaa' }}>{label}</span>
                  <span className="fb" style={{ fontSize:13, fontWeight:500, color:'#111' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Keypoint progress card */}
          <div style={{
            border:traceProgress>0?'1px solid #bbf7d0':'0.5px solid #e5e7eb',
            borderRadius:16, padding:'16px 20px',
            background:traceProgress>=95?'#f0fdf4':traceProgress>0?'#fafafa':'#fafafa',
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
                <div className="fb" style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#aaa', marginTop:3 }}>Warnings</div>
              </div>
            </div>
            {traceProgress>=95&&(
              <p className="fb" style={{ fontSize:12, color:'#15803d', marginTop:10, lineHeight:1.5, fontWeight:500 }}>
                ✓ All keypoints covered — well done!
              </p>
            )}
            {warningCount>0&&traceProgress<95&&(
              <p className="fb" style={{ fontSize:12, color:'#dc2626', marginTop:10, lineHeight:1.5 }}>
                ⚠ {warningCount}x boundary warning. Trace within the letter.
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
                'Click the 🔊 speaker button to hear the letter\'s pronunciation',
                'Trace over the faint ghost letter on the canvas',
                'Follow stroke order shown in the Guide tab',
                'Cover the numbered keypoints — they turn green when hit',
                'At 95% coverage the app auto-advances you',
                'Tap "Check" anytime for instant scored feedback',
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
        </aside>
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

      <div style={{ position:'fixed', top:80, right:-80, width:320, height:320, background:'#f8f8f8', borderRadius:'50%', pointerEvents:'none', zIndex:-1 }}/>
      <div style={{ position:'fixed', bottom:-60, left:-60, width:240, height:240, background:'#f8f8f8', borderRadius:'50%', pointerEvents:'none', zIndex:-1 }}/>
    </div>
  );
}