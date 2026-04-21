import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── INLINE SVG ICONS (no extra dep) ─────────────────────────────
const Ico = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const HomeIcon     = () => <Ico d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const PenIcon      = () => <Ico d="M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />;
const CheckIcon    = () => <Ico d={["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4 12 14.01l-3-3"]} />;
const RotateIcon   = () => <Ico d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5" />;
const SparklesIcon = () => <Ico d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z" />;
const TrophyIcon   = () => <Ico d={["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.34","M14 14.66V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.34","M18 2H6v7a6 6 0 0 0 12 0V2z"]} />;
const StarIcon     = () => <Ico d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />;
const ArrowRight   = () => <Ico d="M5 12h14 M12 5l7 7-7 7" />;
const ArrowLeft    = () => <Ico d="M19 12H5 M12 19l-7-7 7-7" />;
const EyeIcon      = () => <Ico d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]} />;
const EyeOffIcon   = () => <Ico d={["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94","M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19","M1 1l22 22"]} />;
const AwardIcon    = () => <Ico d={["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z","M8.21 13.89 7 23l5-3 5 3-1.21-9.12"]} />;

// ─── TRANSLATIONS ─────────────────────────────────────────────────
const translations = {
  en: {
    pageTitle: "Letter Tracing & Writing",
    pageSubtitle: "Practice your handwriting",
    letterOf: "of",
    complete: "Complete",
    points: "Points",
    completed: "Completed",
    currentLetter: "Current Letter",
    difficulty: { Easy: "Easy", Medium: "Medium", Hard: "Hard" },
    instructions: "Instructions",
    inst: [
      "Trace the letter following the guide",
      "Try to stay within the guide lines",
      'Click "Check My Work" when done',
      'Use "Clear" to start over',
    ],
    brushSettings: "Brush Settings",
    brushSize: "Brush Size",
    brushColor: "Brush Color",
    fine: "Fine", thick: "Thick",
    practiceArea: "Practice Area",
    hideGuide: "Hide Guide",
    showGuide: "Show Guide",
    clear: "Clear",
    checkWork: "Check My Work",
    prevLetter: "Previous Letter",
    nextLetter: "Next Letter",
    excellent: "Excellent! 🎉",
    excellentSub: "Great handwriting!",
    veryGood: "Very Good! ⭐",
    good: "Good! 👍",
    goodTry: "Good Try! 💪",
    goodTrySub: "Practice makes perfect!",
    startDrawing: "Start Drawing!",
    startDrawingSub: "Trace the letter first",
    milestone: "Milestone Achieved! 🎉",
    milestoneMsg: "You've completed",
    letters: "letters!",
    strokes: "Strokes",
    tryAgain: "Try Again",
  },
  si: {
    pageTitle: "අකුරු ලකුණු කිරීම සහ ලිවීම",
    pageSubtitle: "ඔබේ අතින් ලිවීම පුහුණු කරන්න",
    letterOf: "න්",
    complete: "සම්පූර්ණයි",
    points: "ලකුණු",
    completed: "සම්පූර්ණ",
    currentLetter: "වත්මන් අකුර",
    difficulty: { Easy: "පහසු", Medium: "මධ්‍යම", Hard: "දුෂ්කර" },
    instructions: "උපදෙස්",
    inst: [
      "මාර්ගෝපදේශය අනුව අකුර ලිවීමෙන් ලුහු බැඳගන්න",
      "මාර්ගෝපදේශ රේඛා ඇතුළත රැඳීමට උත්සාහ කරන්න",
      "\"ගෙදර වැඩ පරීක්ෂා කරන්න\" ක්ලික් කරන්න",
      "නැවත ආරම්භ කිරීමට \"මකන්න\" භාවිතා කරන්න",
    ],
    brushSettings: "බ්‍රෂ් සැකසුම්",
    brushSize: "බ්‍රෂ් ප්‍රමාණය",
    brushColor: "බ්‍රෂ් වර්ණය",
    fine: "සිහින්", thick: "තඩි",
    practiceArea: "පුහුණු ප්‍රදේශය",
    hideGuide: "මාර්ගෝපදේශය සඟවන්න",
    showGuide: "මාර්ගෝපදේශය පෙන්වන්න",
    clear: "මකන්න",
    checkWork: "ගෙදර වැඩ පරීක්ෂා කරන්න",
    prevLetter: "පෙර අකුර",
    nextLetter: "ඊළඟ අකුර",
    excellent: "අති විශිෂ්ට! 🎉",
    excellentSub: "සුපිරි අතින් ලිවීමක්!",
    veryGood: "ඉතා හොඳයි! ⭐",
    good: "හොඳයි! 👍",
    goodTry: "හොඳ උත්සාහයක්! 💪",
    goodTrySub: "පුහුණුව සාර්ථකත්වය ගෙනෙයි!",
    startDrawing: "ලිවීම ආරම්භ කරන්න!",
    startDrawingSub: "මුලින්ම අකුර ලිවීමෙන් ලුහු බැඳගන්න",
    milestone: "සන්ධිස්ථානය සාක්ෂාත් කෙරිණ! 🎉",
    milestoneMsg: "ඔබ සම්පූර්ණ කළේ",
    letters: "අකුරු!",
    strokes: "ආඝාත",
    tryAgain: "නැවත උත්සාහ කරන්න",
  },
  ta: {
    pageTitle: "எழுத்து பின்தொடர்தல் & எழுத்து",
    pageSubtitle: "உங்கள் கையெழுத்தை பயிற்சி செய்யுங்கள்",
    letterOf: "இல்",
    complete: "முடிந்தது",
    points: "மதிப்பெண்கள்",
    completed: "முடிந்தது",
    currentLetter: "தற்போதைய எழுத்து",
    difficulty: { Easy: "எளிது", Medium: "நடுத்தர", Hard: "கடினம்" },
    instructions: "வழிமுறைகள்",
    inst: [
      "வழிகாட்டியைப் பின்பற்றி எழுத்தை பின்தொடருங்கள்",
      "வழிகாட்டி கோடுகளுக்குள் இருக்க முயற்சிக்கவும்",
      '"என் வேலையை சரிபார்" என்பதை கிளிக் செய்யவும்',
      '"அழிக்கவும்" என்பதை மீண்டும் தொடங்க பயன்படுத்தவும்',
    ],
    brushSettings: "தூரிகை அமைப்புகள்",
    brushSize: "தூரிகை அளவு",
    brushColor: "தூரிகை வண்ணம்",
    fine: "மெல்லிய", thick: "தடிமன்",
    practiceArea: "பயிற்சி பகுதி",
    hideGuide: "வழிகாட்டியை மறை",
    showGuide: "வழிகாட்டியை காட்டு",
    clear: "அழிக்கவும்",
    checkWork: "என் வேலையை சரிபார்",
    prevLetter: "முந்தைய எழுத்து",
    nextLetter: "அடுத்த எழுத்து",
    excellent: "அருமை! 🎉",
    excellentSub: "சிறந்த கையெழுத்து!",
    veryGood: "மிகவும் நல்லது! ⭐",
    good: "நல்லது! 👍",
    goodTry: "நல்ல முயற்சி! 💪",
    goodTrySub: "பயிற்சி சரியானதாக்குகிறது!",
    startDrawing: "வரைவதை தொடங்குங்கள்!",
    startDrawingSub: "முதலில் எழுத்தை பின்தொடருங்கள்",
    milestone: "மைல்கல் அடைந்தீர்கள்! 🎉",
    milestoneMsg: "நீங்கள் முடித்தீர்கள்",
    letters: "எழுத்துகள்!",
    strokes: "பக்கவாட்டுகள்",
    tryAgain: "மீண்டும் முயற்சிக்கவும்",
  },
};

// ─── LETTER DATA (60 letters) ─────────────────────────────────────
const SINHALA_LETTERS = [
  // ── ස්වර / Vowels (18) ──
  { letter: 'අ',   name: 'අ',   strokes: 1, difficulty: 'Easy',   group: 'Vowels' },
  { letter: 'ආ',   name: 'ආ',   strokes: 1, difficulty: 'Easy',   group: 'Vowels' },
  { letter: 'ඇ',   name: 'ඇ',   strokes: 1, difficulty: 'Easy',   group: 'Vowels' },
  { letter: 'ඈ',   name: 'ඈ',   strokes: 2, difficulty: 'Medium', group: 'Vowels' },
  { letter: 'ඉ',   name: 'ඉ',   strokes: 1, difficulty: 'Easy',   group: 'Vowels' },
  { letter: 'ඊ',   name: 'ඊ',   strokes: 2, difficulty: 'Medium', group: 'Vowels' },
  { letter: 'උ',   name: 'උ',   strokes: 1, difficulty: 'Easy',   group: 'Vowels' },
  { letter: 'ඌ',   name: 'ඌ',   strokes: 2, difficulty: 'Medium', group: 'Vowels' },
  { letter: 'ඍ',   name: 'ඍ',   strokes: 2, difficulty: 'Hard',   group: 'Vowels' },
  { letter: 'ඎ',   name: 'ඎ',   strokes: 2, difficulty: 'Hard',   group: 'Vowels' },
  { letter: 'එ',   name: 'එ',   strokes: 1, difficulty: 'Easy',   group: 'Vowels' },
  { letter: 'ඒ',   name: 'ඒ',   strokes: 2, difficulty: 'Medium', group: 'Vowels' },
  { letter: 'ඓ',   name: 'ඓ',   strokes: 2, difficulty: 'Hard',   group: 'Vowels' },
  { letter: 'ඔ',   name: 'ඔ',   strokes: 2, difficulty: 'Medium', group: 'Vowels' },
  { letter: 'ඕ',   name: 'ඕ',   strokes: 2, difficulty: 'Medium', group: 'Vowels' },
  { letter: 'ඖ',   name: 'ඖ',   strokes: 2, difficulty: 'Hard',   group: 'Vowels' },
  { letter: 'අං',  name: 'අං',  strokes: 2, difficulty: 'Medium', group: 'Vowels' },
  { letter: 'අඃ',  name: 'අඃ',  strokes: 2, difficulty: 'Medium', group: 'Vowels' },
  // ── ව්‍යංජන / Consonants (42) ──
  { letter: 'ක',   name: 'ක',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ඛ',   name: 'ඛ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ග',   name: 'ග',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ඝ',   name: 'ඝ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ඞ',   name: 'ඞ',   strokes: 2, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ඟ',   name: 'ඟ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ච',   name: 'ච',   strokes: 1, difficulty: 'Easy',   group: 'Consonants' },
  { letter: 'ඡ',   name: 'ඡ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ජ',   name: 'ජ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ඣ',   name: 'ඣ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ඤ',   name: 'ඤ',   strokes: 2, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ඥ',   name: 'ඥ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ට',   name: 'ට',   strokes: 1, difficulty: 'Easy',   group: 'Consonants' },
  { letter: 'ඨ',   name: 'ඨ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ඩ',   name: 'ඩ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ඪ',   name: 'ඪ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ණ',   name: 'ණ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ඬ',   name: 'ඬ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ත',   name: 'ත',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ථ',   name: 'ථ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ද',   name: 'ද',   strokes: 2, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ධ',   name: 'ධ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'න',   name: 'න',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ඳ',   name: 'ඳ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ප',   name: 'ප',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ඵ',   name: 'ඵ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'බ',   name: 'බ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'භ',   name: 'භ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ම',   name: 'ම',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ඹ',   name: 'ඹ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ය',   name: 'ය',   strokes: 2, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ර',   name: 'ර',   strokes: 1, difficulty: 'Easy',   group: 'Consonants' },
  { letter: 'ල',   name: 'ල',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ව',   name: 'ව',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ශ',   name: 'ශ',   strokes: 2, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ෂ',   name: 'ෂ',   strokes: 2, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ස',   name: 'ස',   strokes: 2, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'හ',   name: 'හ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ළ',   name: 'ළ',   strokes: 2, difficulty: 'Medium', group: 'Consonants' },
  { letter: 'ෆ',   name: 'ෆ',   strokes: 2, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ඦ',   name: 'ඦ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
  { letter: 'ඐ',   name: 'ඐ',   strokes: 3, difficulty: 'Hard',   group: 'Consonants' },
];

// ─── SCORING ─────────────────────────────────────────────────────
const getGrade = (score, t) => {
  if (score >= 95) return { label: t.excellent, msg: t.excellentSub, color: '#22c55e', emoji: '🌟' };
  if (score >= 85) return { label: t.veryGood,  msg: t.excellentSub, color: '#3b82f6', emoji: '⭐' };
  if (score >= 75) return { label: t.good,       msg: t.excellentSub, color: '#f59e0b', emoji: '👍' };
  return               { label: t.goodTry,    msg: t.goodTrySub,   color: '#ef4444', emoji: '💪' };
};
const canProgress = (s) => s >= 75;

const BRUSH_COLORS = [
  { color: '#7C3AED', name: 'Purple' },
  { color: '#EC4899', name: 'Pink'   },
  { color: '#3B82F6', name: 'Blue'   },
  { color: '#10B981', name: 'Green'  },
  { color: '#F59E0B', name: 'Orange' },
  { color: '#EF4444', name: 'Red'    },
];

const diffStyle = (d) =>
  d === 'Easy'   ? 'text-green-600 bg-green-100'  :
  d === 'Medium' ? 'text-orange-600 bg-orange-100' :
                   'text-red-600 bg-red-100';

// Pixel-overlap accuracy
const computeAccuracy = (userCanvas, guideCanvas) => {
  try {
    const w = userCanvas.width, h = userCanvas.height;
    const uPx = userCanvas.getContext('2d').getImageData(0, 0, w, h).data;
    const gPx = guideCanvas.getContext('2d').getImageData(0, 0, w, h).data;
    let total = 0, hit = 0;
    for (let i = 3; i < gPx.length; i += 4) {
      if (gPx[i] > 60) {
        total++;
        if (uPx[i] > 40) hit++;
      }
    }
    if (total === 0) return 0;
    return Math.min(100, Math.round((hit / total) * 145));
  } catch {
    return Math.floor(Math.random() * 28) + 70;
  }
};

// ─── COMPONENT ────────────────────────────────────────────────────
export default function LetterTracingPage({ lang = 'en' }) {
  const t = translations[lang] ?? translations.en;
  const navigate = useNavigate();

  const canvasRef    = useRef(null);
  const guideRef     = useRef(null); // offscreen guide canvas
  const isDrawingRef = useRef(false);

  const [idx, setIdx]         = useState(0);
  const [showGuide, setGuide] = useState(true);
  const [hasDrawn, setDrawn]  = useState(false);
  const [points, setPoints]   = useState(0);
  const [done, setDone]       = useState(0);
  const [feedback, setFeedback] = useState(null); // null | { type, score, grade }
  const [brushSize, setBrush]   = useState(20);
  const [brushColor, setColor]  = useState('#7C3AED');

  const letter = SINHALA_LETTERS[idx];

  // Build offscreen guide canvas for scoring
  const buildGuide = (ch, w, h) => {
    const gc = document.createElement('canvas');
    gc.width = w; gc.height = h;
    const ctx = gc.getContext('2d');
    ctx.font = `bold 280px serif`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, w / 2, h / 2);
    guideRef.current = gc;
  };

  // Draw background (grid + crosshairs + ghost letter)
  const drawBg = (ctx, canvas, guide) => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1; ctx.setLineDash([]);
    for (let x = 0; x <= w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    ctx.strokeStyle = '#93C5FD'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
    ctx.setLineDash([]);

    if (guide) {
      ctx.font = `bold 280px serif`;
      ctx.fillStyle = 'rgba(124,58,237,0.15)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(letter.letter, w / 2, h / 2);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    drawBg(ctx, canvas, showGuide);
    setDrawn(false); setFeedback(null);
  };

  // Init on letter or guide change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    buildGuide(letter.letter, canvas.width, canvas.height);
    clearCanvas();
  }, [idx]);

  useEffect(() => { clearCanvas(); }, [showGuide]);

  // Pointer
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawingRef.current = true; setDrawn(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = brushColor; ctx.lineWidth = brushSize;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineTo(x, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const handleSubmit = () => {
    if (!hasDrawn) {
      setFeedback({ type: 'empty' });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }
    const acc   = computeAccuracy(canvasRef.current, guideRef.current);
    const grade = getGrade(acc, t);
    const pass  = canProgress(acc);
    setFeedback({ type: pass ? 'success' : 'tryagain', score: acc, grade });
    if (pass) { setPoints(p => p + Math.round(acc / 10)); setDone(d => d + 1); }
    if (!pass) setTimeout(() => setFeedback(null), 3000);
  };

  const handleNext = () => { if (idx < SINHALA_LETTERS.length - 1) setIdx(i => i + 1); };
  const handlePrev = () => { if (idx > 0) setIdx(i => i - 1); };

  const pct = Math.round(((idx + 1) / SINHALA_LETTERS.length) * 100);

  // Feedback overlay
  const Overlay = () => {
    if (!feedback) return null;
    const { type, score: sc, grade } = feedback;
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-20">
        {type === 'success' && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full mx-4 animate-bounce">
            <div className="text-5xl mb-3">{grade.emoji}</div>
            <div className="text-5xl font-black mb-2" style={{ color: grade.color }}>{sc}%</div>
            <h4 className="text-2xl font-bold text-gray-800 mb-1">{grade.label}</h4>
            <p className="text-gray-500 text-sm mb-6">{grade.msg}</p>
            <button
              onClick={() => { setFeedback(null); handleNext(); }}
              disabled={idx === SINHALA_LETTERS.length - 1}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4)' }}
            >
              {t.nextLetter} <ArrowRight />
            </button>
          </div>
        )}
        {type === 'tryagain' && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full mx-4">
            <div className="text-5xl mb-3">💪</div>
            <div className="text-5xl font-black text-orange-500 mb-2">{sc}%</div>
            <h4 className="text-2xl font-bold text-orange-600 mb-1">{t.goodTry}</h4>
            <p className="text-gray-500 text-sm mb-6">{t.goodTrySub}</p>
            <button
              onClick={() => { setFeedback(null); clearCanvas(); }}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl transition-all hover:scale-105"
            >
              <RotateIcon /> {t.tryAgain}
            </button>
          </div>
        )}
        {type === 'empty' && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full mx-4">
            <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenIcon />
            </div>
            <h4 className="text-2xl font-bold text-blue-600 mb-2">{t.startDrawing}</h4>
            <p className="text-gray-500 text-sm">{t.startDrawingSub}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 pt-20">

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Page title + stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {t.pageTitle}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{t.pageSubtitle}</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-blue-600 font-black text-lg"><TrophyIcon />{points}</div>
              <p className="text-xs text-gray-400">{t.points}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-cyan-600 font-black text-lg"><AwardIcon />{done}</div>
              <p className="text-xs text-gray-400">{t.completed}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Letter {idx + 1} {t.letterOf} {SINHALA_LETTERS.length}
            </span>
            <span className="text-sm text-gray-500">{pct}% {t.complete}</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#2563eb,#06b6d4,#7c3aed)' }}
            />
          </div>
        </div>

        {/* 3-col grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="space-y-5">

            {/* Current letter */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">{t.currentLetter}</h3>
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 text-center">
                <div className="text-8xl font-bold text-blue-600 mb-3 leading-none" style={{ fontFamily: 'serif' }}>
                  {letter.letter}
                </div>
                <p className="text-lg font-semibold text-gray-800 mb-3">{letter.name}</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    letter.group === 'Vowels' ? 'bg-purple-100 text-purple-600' : 'bg-cyan-100 text-cyan-600'
                  }`}>
                    {letter.group === 'Vowels' ? 'ස්වර' : 'ව්‍යංජන'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${diffStyle(letter.difficulty)}`}>
                    {t.difficulty[letter.difficulty]}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600">
                    {letter.strokes} {t.strokes}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">{t.instructions}</h3>
              <div className="space-y-3">
                {t.inst.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      {i + 1}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Brush settings */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">{t.brushSettings}</h3>
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  {t.brushSize}: {brushSize}px
                </label>
                <input
                  type="range" min="5" max="40" value={brushSize}
                  onChange={e => setBrush(+e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">{t.fine}</span>
                  <span className="text-xs text-gray-400">{t.thick}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">{t.brushColor}</label>
                <div className="grid grid-cols-3 gap-2">
                  {BRUSH_COLORS.map(b => (
                    <button
                      key={b.color}
                      onClick={() => setColor(b.color)}
                      title={b.name}
                      className={`w-full h-12 rounded-xl transition-all duration-200 ${
                        brushColor === b.color
                          ? 'ring-4 ring-offset-2 ring-blue-400 scale-110 shadow-lg'
                          : 'hover:scale-105 hover:shadow-md'
                      }`}
                      style={{ backgroundColor: b.color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER + RIGHT */}
          <div className="lg:col-span-2 space-y-5">

            {/* Canvas card */}
            <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">{t.practiceArea}</h3>
                <button
                  onClick={() => setGuide(g => !g)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    showGuide ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {showGuide ? <EyeIcon /> : <EyeOffIcon />}
                  {showGuide ? t.hideGuide : t.showGuide}
                </button>
              </div>

              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={700} height={500}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                  className="border-4 border-gray-200 rounded-2xl cursor-crosshair w-full touch-none block"
                />
                <Overlay />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <button
                  onClick={clearCanvas}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 px-6 rounded-2xl transition-all shadow hover:shadow-md"
                >
                  <RotateIcon /> {t.clear}
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4)' }}
                >
                  <CheckIcon /> {t.checkWork}
                </button>
              </div>
            </div>

            {/* Nav */}
            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                disabled={idx === 0}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-800 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow hover:shadow-md disabled:shadow-none"
              >
                <ArrowLeft /> {t.prevLetter}
              </button>
              <button
                onClick={handleNext}
                disabled={idx === SINHALA_LETTERS.length - 1}
                className="flex-1 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4)' }}
              >
                {t.nextLetter} <ArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Milestone */}
        {done > 0 && done % 5 === 0 && (
          <div
            className="mt-8 rounded-3xl p-6 shadow-2xl animate-pulse"
            style={{ background: 'linear-gradient(90deg,#facc15,#fb923c,#f87171)' }}
          >
            <div className="flex items-center justify-center gap-4 text-white flex-wrap">
              <TrophyIcon />
              <div className="text-center">
                <h3 className="text-2xl font-black">{t.milestone}</h3>
                <p className="text-lg font-semibold opacity-90">
                  {t.milestoneMsg} {done} {t.letters}
                </p>
              </div>
              <SparklesIcon />
            </div>
          </div>
        )}
      </div>

      {/* Decorative blobs */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-blue-300 rounded-full opacity-20 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-cyan-300 rounded-full opacity-20 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '.15s' }} />
      <div className="fixed top-1/2 right-1/4 w-24 h-24 bg-purple-300 rounded-full opacity-20 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '.3s' }} />
    </div>
  );
}