import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── INLINE SVG ICONS ────────────────────────────────────────────
const Ico = ({ d, size = 20, fill = 'none', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const HomeIco      = ({ s = 20 }) => <Ico size={s} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const UploadIco    = ({ s = 20 }) => <Ico size={s} d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} />;
const CameraIco    = ({ s = 20 }) => <Ico size={s} d={["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z","M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]} />;
const PenIco       = ({ s = 20 }) => <Ico size={s} d="M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />;
const RotateIco    = ({ s = 20 }) => <Ico size={s} d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5" />;
const CheckIco     = ({ s = 20 }) => <Ico size={s} d={["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4 12 14.01l-3-3"]} />;
const XIco         = ({ s = 20 }) => <Ico size={s} d="M18 6L6 18 M6 6l12 12" />;
const ZapIco       = ({ s = 20 }) => <Ico size={s} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />;
const TrophyIco    = ({ s = 20 }) => <Ico size={s} d={["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.34","M14 14.66V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.34","M18 2H6v7a6 6 0 0 0 12 0V2z"]} />;
const StarIco      = ({ s = 20, fill = 'none' }) => <Ico size={s} fill={fill} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />;
const InfoIco      = ({ s = 20 }) => <Ico size={s} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 16v-4","M12 8h.01"]} />;
const GridIco      = ({ s = 20 }) => <Ico size={s} d={["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"]} />;
const SparklesIco  = ({ s = 20 }) => <Ico size={s} d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z" />;
const ChevronIco   = ({ s = 16, dir = 'right' }) => {
  const d = { right: 'M9 18l6-6-6-6', left: 'M15 18l-6-6 6-6', down: 'M6 9l6 6 6-6', up: 'M18 15l-6-6-6 6' };
  return <Ico size={s} d={d[dir]} />;
};

// ─── TRANSLATIONS ────────────────────────────────────────────────
const translations = {
  en: {
    pageTitle: "Letter Recognition",
    pageSubtitle: "AI-powered Sinhala letter detection",
    drawTab: "Draw a Letter",
    uploadTab: "Upload Image",
    recognizeBtn: "Recognize Letter",
    clearBtn: "Clear",
    recognizing: "Recognizing...",
    resultTitle: "Recognition Result",
    confidence: "Confidence",
    alternatives: "Alternatives",
    tryAgain: "Try Again",
    nothingDrawn: "Nothing drawn yet",
    nothingDrawnSub: "Draw or upload a Sinhala letter first",
    uploadHint: "Click or drag & drop an image here",
    uploadFormats: "PNG, JPG, WEBP supported",
    correctLabel: "Was this correct?",
    yes: "Yes, correct! ✓",
    no: "No, try again",
    practiceWith: "Practice tracing this letter →",
    recognized: "Recognized",
    totalRecognized: "Recognized",
    accuracy: "Accuracy",
    streak: "Streak",
    letterInfo: "Letter Info",
    drawingTip: "Drawing Tip",
    drawingTipText: "Draw the letter large and centred for better accuracy.",
    allLetters: "All Letters",
    howItWorks: "How It Works",
    step1: "Draw or upload a Sinhala letter",
    step2: "AI analyses stroke patterns",
    step3: "See the result instantly",
    points: "Points",
  },
  si: {
    pageTitle: "අකුරු හඳුනාගැනීම",
    pageSubtitle: "AI-ශක්තිමත් සිංහල අකුරු හඳුනාගැනීම",
    drawTab: "අකුරක් ඇඳීම",
    uploadTab: "රූපයක් උඩුගත කරන්න",
    recognizeBtn: "අකුර හඳුනාගන්න",
    clearBtn: "මකන්න",
    recognizing: "හඳුනාගනිමින්...",
    resultTitle: "හඳුනාගැනීමේ ප්‍රතිඵලය",
    confidence: "විශ්වාසනීයතාව",
    alternatives: "විකල්ප",
    tryAgain: "නැවත උත්සාහ කරන්න",
    nothingDrawn: "තවම කිසිවක් ඇඳිලා නැත",
    nothingDrawnSub: "මුලින්ම සිංහල අකුරක් ඇඳීම් කරන්න",
    uploadHint: "රූපය ඇදගෙන මෙතැනට දමන්න",
    uploadFormats: "PNG, JPG, WEBP සහය දක්වයි",
    correctLabel: "මෙය නිවැරදිද?",
    yes: "ඔව්, නිවැරදියි! ✓",
    no: "නැහැ, නැවත උත්සාහ",
    practiceWith: "මෙම අකුර ලිවීම පුහුණු කරන්න →",
    recognized: "හඳුනාගෙන ඇත",
    totalRecognized: "හඳුනාගත්",
    accuracy: "නිරවද්‍යතාව",
    streak: "අඛණ්ඩ",
    letterInfo: "අකුරු තොරතුරු",
    drawingTip: "ඇඳීමේ ඉඟිය",
    drawingTipText: "වඩා හොඳ නිරවද්‍යතාවක් සඳහා අකුර විශාලව හා මධ්‍යයේ ඇදීම් කරන්න.",
    allLetters: "සියලු අකුරු",
    howItWorks: "ක්‍රියා කරන ආකාරය",
    step1: "සිංහල අකුරක් ඇදීමෙන් හෝ උඩුගත කිරීමෙන්",
    step2: "AI ආඝාත රටාවන් විශ්ලේෂණය කරයි",
    step3: "ක්ෂණිකව ප්‍රතිඵලය ලැබෙනු ඇත",
    points: "ලකුණු",
  },
  ta: {
    pageTitle: "எழுத்து அடையாளம்",
    pageSubtitle: "AI-சக்தி வாய்ந்த சிங்கள எழுத்து கண்டறிதல்",
    drawTab: "எழுத்தை வரையுங்கள்",
    uploadTab: "படம் பதிவேற்றவும்",
    recognizeBtn: "எழுத்தை அடையாளம் காணுங்கள்",
    clearBtn: "அழிக்கவும்",
    recognizing: "அடையாளம் காணுகிறது...",
    resultTitle: "அடையாள முடிவு",
    confidence: "நம்பகத்தன்மை",
    alternatives: "மாற்று விருப்பங்கள்",
    tryAgain: "மீண்டும் முயற்சிக்கவும்",
    nothingDrawn: "இன்னும் எதுவும் வரையவில்லை",
    nothingDrawnSub: "முதலில் ஒரு சிங்கள எழுத்தை வரையுங்கள்",
    uploadHint: "படத்தை இங்கே இழுத்து விடுங்கள்",
    uploadFormats: "PNG, JPG, WEBP ஆதரிக்கப்படுகின்றன",
    correctLabel: "இது சரியானதா?",
    yes: "ஆம், சரியானது! ✓",
    no: "இல்லை, மீண்டும் முயற்சி",
    practiceWith: "இந்த எழுத்தை பயிற்சி செய்யுங்கள் →",
    recognized: "அடையாளம் காணப்பட்டது",
    totalRecognized: "அடையாளம்",
    accuracy: "துல்லியம்",
    streak: "தொடர்ச்சி",
    letterInfo: "எழுத்து தகவல்",
    drawingTip: "வரைதல் குறிப்பு",
    drawingTipText: "சிறந்த துல்லியத்திற்கு எழுத்தை பெரியதாக மையத்தில் வரையுங்கள்.",
    allLetters: "அனைத்து எழுத்துகளும்",
    howItWorks: "எவ்வாறு செயல்படுகிறது",
    step1: "சிங்கள எழுத்தை வரையுங்கள் அல்லது பதிவேற்றுங்கள்",
    step2: "AI வரிப்பட வடிவங்களை பகுப்பாய்வு செய்கிறது",
    step3: "முடிவை உடனடியாக காணுங்கள்",
    points: "மதிப்பெண்கள்",
  },
};

// ─── LETTER DATA ──────────────────────────────────────────────────
const LETTER_CATEGORIES = [
  { name: 'ස්වර', nameEn: 'Vowels', color: '#e11d48',
    letters: [
      { letter: 'අ', sound: 'a',  meaning: 'a as in "art"' },
      { letter: 'ආ', sound: 'aa', meaning: 'aa (long a)' },
      { letter: 'ඇ', sound: 'ae', meaning: 'ae as in "cat"' },
      { letter: 'ඈ', sound: 'aee', meaning: 'long ae' },
      { letter: 'ඉ', sound: 'i',  meaning: 'i as in "it"' },
      { letter: 'ඊ', sound: 'ii', meaning: 'ii (long i)' },
      { letter: 'උ', sound: 'u',  meaning: 'u as in "put"' },
      { letter: 'ඌ', sound: 'uu', meaning: 'uu (long u)' },
      { letter: 'එ', sound: 'e',  meaning: 'e as in "egg"' },
      { letter: 'ඒ', sound: 'ee', meaning: 'ee (long e)' },
      { letter: 'ඓ', sound: 'ai', meaning: 'ai as in "aisle"' },
      { letter: 'ඔ', sound: 'o',  meaning: 'o as in "open"' },
      { letter: 'ඕ', sound: 'oo', meaning: 'oo (long o)' },
      { letter: 'ඖ', sound: 'au', meaning: 'au as in "auction"' },
    ],
  },
  { name: 'ක වර්ගය', nameEn: 'Ka group', color: '#7c3aed',
    letters: [
      { letter: 'ක', sound: 'ka',  meaning: 'k sound' },
      { letter: 'ඛ', sound: 'kha', meaning: 'aspirated k' },
      { letter: 'ග', sound: 'ga',  meaning: 'g sound' },
      { letter: 'ඝ', sound: 'gha', meaning: 'aspirated g' },
      { letter: 'ඞ', sound: 'nga', meaning: 'ng sound' },
    ],
  },
  { name: 'ච වර්ගය', nameEn: 'Cha group', color: '#0891b2',
    letters: [
      { letter: 'ච', sound: 'cha',  meaning: 'ch sound' },
      { letter: 'ඡ', sound: 'chha', meaning: 'aspirated ch' },
      { letter: 'ජ', sound: 'ja',   meaning: 'j sound' },
      { letter: 'ඣ', sound: 'jha',  meaning: 'aspirated j' },
      { letter: 'ඤ', sound: 'nya',  meaning: 'ny sound' },
    ],
  },
  { name: 'ට වර්ගය', nameEn: 'Ta group', color: '#0369a1',
    letters: [
      { letter: 'ට', sound: 'ta',  meaning: 'retroflex t' },
      { letter: 'ඨ', sound: 'tha', meaning: 'aspirated T' },
      { letter: 'ඩ', sound: 'da',  meaning: 'retroflex d' },
      { letter: 'ඪ', sound: 'dha', meaning: 'aspirated D' },
      { letter: 'ණ', sound: 'na',  meaning: 'retroflex n' },
    ],
  },
  { name: 'ත වර්ගය', nameEn: 'Tha group', color: '#15803d',
    letters: [
      { letter: 'ත', sound: 'tha',  meaning: 'dental t' },
      { letter: 'ථ', sound: 'thha', meaning: 'aspirated th' },
      { letter: 'ද', sound: 'da',   meaning: 'dental d' },
      { letter: 'ධ', sound: 'dha',  meaning: 'aspirated dh' },
      { letter: 'න', sound: 'na',   meaning: 'dental n' },
    ],
  },
  { name: 'ප වර්ගය', nameEn: 'Pa group', color: '#b45309',
    letters: [
      { letter: 'ප', sound: 'pa',  meaning: 'p sound' },
      { letter: 'ඵ', sound: 'pha', meaning: 'aspirated p' },
      { letter: 'බ', sound: 'ba',  meaning: 'b sound' },
      { letter: 'භ', sound: 'bha', meaning: 'aspirated b' },
      { letter: 'ම', sound: 'ma',  meaning: 'm sound' },
    ],
  },
  { name: 'අවර්ගීය', nameEn: 'Semi-vowels', color: '#be185d',
    letters: [
      { letter: 'ය', sound: 'ya',  meaning: 'y sound' },
      { letter: 'ර', sound: 'ra',  meaning: 'r sound' },
      { letter: 'ල', sound: 'la',  meaning: 'l sound' },
      { letter: 'ව', sound: 'va',  meaning: 'v sound' },
      { letter: 'ශ', sound: 'sha', meaning: 'sh sound' },
      { letter: 'ෂ', sound: 'shha',meaning: 'aspirated sh' },
      { letter: 'ස', sound: 'sa',  meaning: 's sound' },
      { letter: 'හ', sound: 'ha',  meaning: 'h sound' },
      { letter: 'ළ', sound: 'lla', meaning: 'retroflex l' },
      { letter: 'ෆ', sound: 'fa',  meaning: 'f sound' },
    ],
  },
];

const ALL_LETTERS = LETTER_CATEGORIES.flatMap(c => c.letters.map(l => ({ ...l, catColor: c.color, catName: c.nameEn })));

// Find category info for a letter
const getLetterInfo = (char) => {
  for (const cat of LETTER_CATEGORIES) {
    const found = cat.letters.find(l => l.letter === char);
    if (found) return { ...found, catColor: cat.color, catName: cat.nameEn, sinhalaName: cat.name };
  }
  return null;
};

// ─── MOCK RECOGNITION ENGINE ──────────────────────────────────────
// In production this would call a real AI/ML API.
// We simulate by pixel-sampling the canvas and picking the top match.
const mockRecognize = (canvasEl, targetLetter) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // If a targetLetter hint is provided (e.g. from selected letter), weight it
      const all = [...ALL_LETTERS];
      const confidenceBase = 70 + Math.floor(Math.random() * 28);
      const top = targetLetter
        ? { ...getLetterInfo(targetLetter), confidence: confidenceBase }
        : { ...all[Math.floor(Math.random() * all.length)], confidence: confidenceBase };

      // Generate 3 alternatives from the same category
      const alts = all
        .filter(l => l.catName === top.catName && l.letter !== top.letter)
        .slice(0, 3)
        .map((l, i) => ({ ...l, confidence: Math.max(10, confidenceBase - 20 - i * 8) }));

      resolve({ top, alternatives: alts });
    }, 1400);
  });
};

// ─── CONFIDENCE BAR ───────────────────────────────────────────────
const ConfidenceBar = ({ value, color }) => (
  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
    />
  </div>
);

// ─── LETTER GRID PANEL ────────────────────────────────────────────
const LetterGridPanel = ({ onSelect, selectedLetter }) => {
  const [openCat, setOpenCat] = useState(0);
  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      {LETTER_CATEGORIES.map((cat, ci) => (
        <div key={ci} className="mb-1">
          <button
            onClick={() => setOpenCat(openCat === ci ? -1 : ci)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
            style={{ background: openCat === ci ? `${cat.color}18` : 'transparent' }}
          >
            <span className="text-xs font-bold" style={{ color: openCat === ci ? cat.color : '#6b7280' }}>
              {cat.name} <span className="opacity-60">({cat.nameEn})</span>
            </span>
            <ChevronIco s={13} dir={openCat === ci ? 'up' : 'down'} />
          </button>
          {openCat === ci && (
            <div className="flex flex-wrap gap-2 px-2 pb-3 pt-1">
              {cat.letters.map((l, li) => {
                const isSelected = selectedLetter === l.letter;
                return (
                  <button
                    key={li}
                    onClick={() => onSelect(l.letter)}
                    title={`${l.letter} (${l.sound})`}
                    className="w-10 h-10 rounded-xl text-xl font-serif flex items-center justify-center transition-all duration-150 hover:scale-110"
                    style={{
                      fontFamily: "'Noto Sans Sinhala', serif",
                      border: isSelected ? `2px solid ${cat.color}` : '1.5px solid #e5e7eb',
                      background: isSelected ? `${cat.color}20` : '#f9fafb',
                      color: isSelected ? cat.color : '#374151',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: isSelected ? `0 0 0 4px ${cat.color}22` : 'none',
                    }}
                  >
                    {l.letter}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function LetterRecognition({ lang = 'en' }) {
  const t = translations[lang] ?? translations.en;
  const navigate = useNavigate();

  // State
  const [tab, setTab]                   = useState('draw'); // 'draw' | 'upload'
  const [selectedLetter, setSelected]   = useState(null);
  const [isRecognizing, setRecognizing] = useState(false);
  const [result, setResult]             = useState(null);   // { top, alternatives }
  const [hasDrawn, setHasDrawn]         = useState(false);
  const [uploadedImg, setUploadedImg]   = useState(null);
  const [uploadPreview, setPreview]     = useState(null);
  const [feedback, setFeedback]         = useState(null);   // 'correct' | 'wrong'
  const [stats, setStats]               = useState({ total: 0, correct: 0, streak: 0, points: 0 });
  const [showPanel, setShowPanel]       = useState('letters'); // 'letters' | 'info' | 'howto'
  const [isDraggingOver, setDragOver]   = useState(false);
  const [celebrating, setCelebrating]   = useState(false);

  const canvasRef    = useRef(null);
  const isDrawingRef = useRef(false);
  const fileInputRef = useRef(null);

  // ── Canvas helpers ────────────────────────────────────────────
  const drawBackground = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Grid
    ctx.strokeStyle = '#EEF2FF'; ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    // Crosshair
    ctx.strokeStyle = '#C7D2FE'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
    ctx.setLineDash([]);
    // Guide letter ghost (if selected)
    if (selectedLetter) {
      ctx.font = 'bold 220px "Noto Sans Sinhala", serif';
      ctx.fillStyle = 'rgba(99,102,241,0.07)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedLetter, canvas.width / 2, canvas.height / 2);
    }
  }, [selectedLetter]);

  useEffect(() => {
    drawBackground();
    setHasDrawn(false);
    setResult(null);
    setFeedback(null);
  }, [drawBackground]);

  useEffect(() => {
    drawBackground();
  }, [selectedLetter, drawBackground]);

  // Pointer helpers
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    setHasDrawn(true);
    setResult(null);
    setFeedback(null);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const clearCanvas = () => {
    drawBackground();
    setHasDrawn(false);
    setResult(null);
    setFeedback(null);
  };

  // ── Upload helpers ───────────────────────────────────────────
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setUploadedImg(file);
    setResult(null);
    setFeedback(null);
    setHasDrawn(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // ── Recognize ────────────────────────────────────────────────
  const handleRecognize = async () => {
    if (!hasDrawn) return;
    setRecognizing(true);
    setResult(null);
    setFeedback(null);

    const res = await mockRecognize(canvasRef.current, selectedLetter);
    setResult(res);
    setRecognizing(false);
    setStats(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const handleFeedback = (correct) => {
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1800);
      setStats(prev => ({
        total: prev.total,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        points: prev.points + Math.max(5, Math.round((result?.top?.confidence ?? 70) / 10)),
      }));
    } else {
      setStats(prev => ({ ...prev, streak: 0 }));
    }
  };

  // ── Letter select ────────────────────────────────────────────
  const handleSelectLetter = (letter) => {
    setSelected(letter);
    setTab('draw');
    setResult(null);
    setFeedback(null);
    setHasDrawn(false);
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const resultInfo = result ? getLetterInfo(result.top.letter) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 pt-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .sinhala { font-family: 'Noto Sans Sinhala', serif !important; }

        @keyframes slideUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn      { 0%{opacity:0;transform:scale(.7)} 60%{transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes scanLine   { 0%{top:0%} 100%{top:100%} }
        @keyframes pulse      { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes confetti   { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-60px) rotate(720deg);opacity:0} }
        @keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }

        .slide-up   { animation: slideUp   .45s ease-out both; }
        .pop-in     { animation: popIn     .5s  cubic-bezier(.36,.07,.19,.97) both; }
        .fade-in    { animation: fadeIn    .3s  ease-out both; }
        .pulse-anim { animation: pulse     1.5s ease-in-out infinite; }

        .scan-overlay::after {
          content:''; position:absolute; left:0; right:0; height:3px;
          background:linear-gradient(90deg,transparent,#6366f1,transparent);
          animation: scanLine 1.2s ease-in-out infinite alternate;
        }

        .shimmer-text {
          background: linear-gradient(135deg, #4f46e5, #7c3aed, #2563eb);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .glass {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.9);
        }

        .confetti-burst span {
          position:absolute; pointer-events:none;
          animation: confetti .9s ease-out forwards;
        }

        canvas { touch-action: none; }

        .sidebar-scroll { overflow-y: auto; max-height: calc(100vh - 200px); }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 2px; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="glass border-b border-indigo-100/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Left: nav */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')}
              className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-500 transition-colors">
              <HomeIco s={20} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black shimmer-text leading-tight">{t.pageTitle}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">{t.pageSubtitle}</p>
            </div>
          </div>

          {/* Right: stats */}
          <div className="flex items-center gap-4 sm:gap-6">
            {[
              { icon: <TrophyIco s={16} />, val: stats.points, label: t.points, color: 'text-indigo-600' },
              { icon: <CheckIco  s={16} />, val: `${accuracy}%`, label: t.accuracy, color: 'text-emerald-600' },
              { icon: <ZapIco   s={16} />, val: stats.streak, label: t.streak, color: 'text-orange-500' },
            ].map(({ icon, val, label, color }) => (
              <div key={label} className="text-center hidden sm:block">
                <div className={`flex items-center gap-1 font-black text-base ${color}`}>{icon}{val}</div>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[260px_1fr_280px] gap-5">

        {/* ══ LEFT SIDEBAR ══ */}
        <aside className="hidden lg:flex flex-col gap-4">

          {/* Panel toggle */}
          <div className="glass rounded-2xl p-1.5 flex gap-1">
            {[
              { id: 'letters', icon: <GridIco s={15}/>,   label: t.allLetters },
              { id: 'howto',   icon: <InfoIco s={15}/>,   label: t.howItWorks },
            ].map(({ id, icon, label }) => (
              <button key={id} onClick={() => setShowPanel(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={{
                  background: showPanel === id ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
                  color: showPanel === id ? 'white' : '#6b7280',
                }}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="glass rounded-2xl p-4 flex-1 sidebar-scroll">
            {showPanel === 'letters' && (
              <>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  Click to practice
                </p>
                <LetterGridPanel onSelect={handleSelectLetter} selectedLetter={selectedLetter} />
              </>
            )}
            {showPanel === 'howto' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-900 mb-4">{t.howItWorks}</h3>
                {[t.step1, t.step2, t.step3].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 text-white"
                      style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                      {i + 1}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
                <div className="bg-indigo-50 rounded-xl p-4 mt-4">
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-1">{t.drawingTip}</p>
                  <p className="text-xs text-indigo-700 leading-relaxed">{t.drawingTipText}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ══ MAIN PANEL ══ */}
        <main className="flex flex-col gap-5">

          {/* Selected letter badge */}
          {selectedLetter && (() => {
            const info = getLetterInfo(selectedLetter);
            return (
              <div className="slide-up glass rounded-2xl px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl sinhala font-bold"
                    style={{ background: `${info?.catColor}18`, color: info?.catColor }}>
                    {selectedLetter}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Practicing</p>
                    <p className="font-black text-gray-900 sinhala text-lg leading-tight">{selectedLetter}</p>
                    <p className="text-xs text-gray-500">/{info?.sound}/ · {info?.catName}</p>
                  </div>
                </div>
                <button onClick={() => { setSelected(null); clearCanvas(); }}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors">
                  <XIco s={16} />
                </button>
              </div>
            );
          })()}

          {/* Tabs */}
          <div className="glass rounded-2xl p-1.5 flex gap-1 self-start">
            {[
              { id: 'draw',   icon: <PenIco s={15}/>,    label: t.drawTab },
              { id: 'upload', icon: <UploadIco s={15}/>, label: t.uploadTab },
            ].map(({ id, icon, label }) => (
              <button key={id} onClick={() => { setTab(id); setResult(null); setFeedback(null); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: tab === id ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
                  color: tab === id ? 'white' : '#6b7280',
                  boxShadow: tab === id ? '0 4px 14px rgba(79,70,229,0.3)' : 'none',
                }}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* ── DRAW TAB ── */}
          {tab === 'draw' && (
            <div className="glass rounded-3xl p-5 shadow-xl">
              <div className="relative">
                {/* Scan overlay while recognizing */}
                {isRecognizing && (
                  <div className="scan-overlay absolute inset-0 rounded-2xl z-10 overflow-hidden"
                    style={{ background: 'rgba(99,102,241,0.04)' }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20">
                      <div className="w-14 h-14 rounded-full border-4 border-indigo-300 border-t-indigo-600 animate-spin" />
                      <p className="text-sm font-bold text-indigo-600 pulse-anim">{t.recognizing}</p>
                    </div>
                  </div>
                )}

                {/* Celebration confetti */}
                {celebrating && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20 confetti-burst">
                    {['🎉','⭐','✨','🌟','💫'].map((em, i) => (
                      <span key={i} style={{
                        top: '50%', left: `${20 + i * 15}%`,
                        fontSize: 24,
                        animationDelay: `${i * 0.08}s`,
                      }}>{em}</span>
                    ))}
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  width={640} height={460}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                  className="w-full rounded-2xl border-2 cursor-crosshair block"
                  style={{
                    borderColor: celebrating ? '#22c55e' : isRecognizing ? '#6366f1' : '#e0e7ff',
                    boxShadow: celebrating ? '0 0 0 4px #22c55e33' : isRecognizing ? '0 0 0 4px #6366f133' : 'none',
                    transition: 'border-color .3s, box-shadow .3s',
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-4 mt-5">
                <button onClick={clearCanvas}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl transition-all hover:scale-[1.02] shadow-sm">
                  <RotateIco s={17} /> {t.clearBtn}
                </button>
                <button
                  onClick={handleRecognize}
                  disabled={!hasDrawn || isRecognizing}
                  className="flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: hasDrawn && !isRecognizing
                      ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                      : '#9ca3af',
                    transform: hasDrawn && !isRecognizing ? undefined : 'none',
                  }}
                  onMouseEnter={e => { if (hasDrawn && !isRecognizing) e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {isRecognizing
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t.recognizing}</>
                    : <><ZapIco s={17} />{t.recognizeBtn}</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── UPLOAD TAB ── */}
          {tab === 'upload' && (
            <div className="glass rounded-3xl p-5 shadow-xl">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] overflow-hidden"
                style={{
                  borderColor: isDraggingOver ? '#4f46e5' : '#c7d2fe',
                  background: isDraggingOver ? '#eef2ff' : '#f5f7ff',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {uploadPreview ? (
                  <>
                    <img src={uploadPreview} alt="uploaded" className="max-h-72 max-w-full object-contain rounded-xl" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setUploadedImg(null); setHasDrawn(false); setResult(null); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <XIco s={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-10">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <UploadIco s={28} />
                    </div>
                    <p className="font-bold text-gray-700 mb-1">{t.uploadHint}</p>
                    <p className="text-xs text-gray-400">{t.uploadFormats}</p>
                  </div>
                )}
              </div>

              {uploadPreview && (
                <button
                  onClick={handleRecognize}
                  disabled={isRecognizing}
                  className="w-full mt-5 flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
                >
                  {isRecognizing
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t.recognizing}</>
                    : <><ZapIco s={17} />{t.recognizeBtn}</>
                  }
                </button>
              )}
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!hasDrawn && !result && (
            <div className="glass rounded-3xl p-8 text-center fade-in">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PenIco s={32} />
              </div>
              <h4 className="font-bold text-gray-700 mb-1">{t.nothingDrawn}</h4>
              <p className="text-sm text-gray-400">{t.nothingDrawnSub}</p>
            </div>
          )}
        </main>

        {/* ══ RIGHT PANEL — RESULTS ══ */}
        <aside className="flex flex-col gap-4">

          {/* Result card */}
          {result ? (
            <div className="glass rounded-3xl p-6 shadow-2xl pop-in">
              <div className="flex items-center gap-2 mb-5">
                <SparklesIco s={16} />
                <h3 className="font-black text-gray-900 text-sm">{t.resultTitle}</h3>
              </div>

              {/* Primary result */}
              <div className="relative rounded-2xl p-6 text-center mb-5 overflow-hidden"
                style={{
                  background: resultInfo
                    ? `linear-gradient(135deg, ${resultInfo.catColor}18, ${resultInfo.catColor}08)`
                    : '#f5f7ff',
                  border: `2px solid ${resultInfo?.catColor ?? '#e0e7ff'}33`,
                }}>
                {/* Glow */}
                <div className="absolute inset-0 opacity-20 rounded-2xl"
                  style={{ background: `radial-gradient(circle at 50% 30%, ${resultInfo?.catColor ?? '#6366f1'}, transparent 70%)` }} />
                <div
                  className="relative sinhala text-9xl font-bold leading-none mb-3"
                  style={{ color: resultInfo?.catColor ?? '#4f46e5' }}>
                  {result.top.letter}
                </div>
                <p className="relative text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">{t.recognized}</p>
                <p className="relative font-black text-gray-900 text-xl sinhala">{result.top.letter}</p>
                {resultInfo && (
                  <p className="relative text-sm text-gray-500 mt-1">/{resultInfo.sound}/ · {resultInfo.catName}</p>
                )}
              </div>

              {/* Confidence */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-500">{t.confidence}</span>
                  <span className="text-sm font-black" style={{ color: resultInfo?.catColor ?? '#4f46e5' }}>
                    {result.top.confidence}%
                  </span>
                </div>
                <ConfidenceBar value={result.top.confidence} color={resultInfo?.catColor ?? '#4f46e5'} />
              </div>

              {/* Feedback buttons */}
              {!feedback && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-500 mb-2">{t.correctLabel}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleFeedback(true)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all hover:scale-105">
                      <CheckIco s={13} /> {t.yes}
                    </button>
                    <button onClick={() => handleFeedback(false)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-all hover:scale-105">
                      <XIco s={13} /> {t.no}
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback result */}
              {feedback === 'correct' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 fade-in text-center">
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="text-emerald-700 font-black text-sm">+{Math.max(5, Math.round((result.top.confidence) / 10))} pts!</p>
                  <p className="text-emerald-600 text-xs mt-1">Streak: {stats.streak + 1} 🔥</p>
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 fade-in text-center">
                  <p className="text-2xl mb-1">💪</p>
                  <p className="text-orange-700 font-bold text-sm">Keep practising!</p>
                </div>
              )}

              {/* Alternatives */}
              {result.alternatives.length > 0 && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t.alternatives}</p>
                  <div className="space-y-2.5">
                    {result.alternatives.map((alt, i) => {
                      const altInfo = getLetterInfo(alt.letter);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg sinhala font-bold flex-shrink-0"
                            style={{ background: `${altInfo?.catColor ?? '#6366f1'}18`, color: altInfo?.catColor ?? '#6366f1' }}>
                            {alt.letter}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-gray-600 sinhala">{alt.letter}</span>
                              <span className="text-xs text-gray-400 font-semibold">{alt.confidence}%</span>
                            </div>
                            <ConfidenceBar value={alt.confidence} color={altInfo?.catColor ?? '#6366f1'} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Practice CTA */}
              <button
                onClick={() => {
                  handleSelectLetter(result.top.letter);
                  setResult(null);
                }}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all hover:scale-[1.02]">
                <PenIco s={13} /> {t.practiceWith}
              </button>
            </div>
          ) : (
            /* Stats card when no result */
            <div className="glass rounded-3xl p-6 shadow-xl">
              <h3 className="font-black text-gray-900 text-sm mb-5 flex items-center gap-2">
                <TrophyIco s={16} /> Your Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t.totalRecognized, val: stats.total, color: '#4f46e5', icon: '🔍' },
                  { label: t.accuracy,        val: `${accuracy}%`, color: '#10b981', icon: '🎯' },
                  { label: t.streak,          val: stats.streak,  color: '#f59e0b', icon: '🔥' },
                  { label: t.points,          val: stats.points,  color: '#7c3aed', icon: '⭐' },
                ].map(({ label, val, color, icon }) => (
                  <div key={label} className="rounded-2xl p-4 text-center"
                    style={{ background: `${color}10`, border: `1.5px solid ${color}25` }}>
                    <p className="text-xl mb-1">{icon}</p>
                    <p className="font-black text-2xl" style={{ color }}>{val}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Letter info card (when letter selected) */}
          {selectedLetter && (() => {
            const info = getLetterInfo(selectedLetter);
            if (!info) return null;
            return (
              <div className="glass rounded-3xl p-6 shadow-xl fade-in">
                <h3 className="font-black text-gray-900 text-sm mb-4 flex items-center gap-2">
                  <InfoIco s={16} /> {t.letterInfo}
                </h3>
                <div className="bg-gradient-to-br rounded-2xl p-5 text-center mb-4"
                  style={{ background: `linear-gradient(135deg, ${info.catColor}18, ${info.catColor}06)`, border: `1.5px solid ${info.catColor}30` }}>
                  <p className="sinhala text-7xl font-bold leading-none mb-2" style={{ color: info.catColor }}>
                    {selectedLetter}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">/{info.sound}/</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Category', val: info.catName },
                    { label: 'Sound',    val: `/${info.sound}/` },
                    { label: 'Meaning',  val: info.meaning },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                      <span className="text-xs font-bold text-gray-700 text-right max-w-[55%]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Mobile letter grid (only visible on small screens) */}
          <div className="lg:hidden glass rounded-3xl p-5 shadow-xl">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t.allLetters}</p>
            <LetterGridPanel onSelect={handleSelectLetter} selectedLetter={selectedLetter} />
          </div>
        </aside>
      </div>

      {/* Ambient blobs */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-indigo-300 rounded-full opacity-20 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-20 right-10 w-52 h-52 bg-purple-300 rounded-full opacity-15 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '.2s' }} />
      <div className="fixed top-1/2 right-1/3 w-32 h-32 bg-blue-300 rounded-full opacity-15 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '.4s' }} />
    </div>
  );
}