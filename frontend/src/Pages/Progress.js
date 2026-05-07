import { useState, useRef, useEffect, useCallback } from "react";

// ─── Translations ───────────────────────────────────────────────────────────
const t = {
  en: {
    badge: "Sinhala Learning System",
    heroTitle1: "Practice Sinhala Sentences &",
    heroTitle2: "Your Handwriting",
    heroTitleEm: "Improve",
    heroDesc: "Write, learn, and improve with smart feedback and progress tracking designed for young learners.",
    startGuided: "Start Guided Practice",
    tryFree: "Try Free Writing",
    todaySentence: "Today's sentence",
    canvasLabel: "Canvas",
    practiceStreak: "Practice streak",
    streakVal: "🔥 7 days",
    sessionsDone: "Sentences done",
    sessionsVal: "24 sessions",
    accuracy: "Handwriting accuracy",
    chooseModeTitle: "Choose Your Practice Mode",
    chooseModeDesc: "Two powerful ways to build your Sinhala handwriting skills",
    guidedTitle: "Practice Given Sentences",
    guidedDesc: "Write sentences provided by the system and improve handwriting accuracy with guided feedback.",
    guidedBtn: "Start Practice →",
    freeTitle: "Write Your Own Sentence",
    freeDesc: "Think and write your own Sinhala sentence freely and receive intelligent feedback on your work.",
    freeBtn: "Start Writing →",
    writeSentence: "Write this sentence",
    nextSentence: "Next sentence →",
    sentenceCounter: (cur, total) => `Sentence ${cur} of ${total}`,
    yourSpace: "Your writing space",
    guided: "Guided Practice",
    freeWriting: "Free Writing",
    close: "Close ✕",
    clear: "Clear",
    submit: "Submit →",
    feedbackTitle: "Feedback Report",
    tryAgain: "Try Again →",
    hwAccuracy: "Handwriting Accuracy",
    grammarCheck: "Grammar Check",
    grammarOk: "වාක්‍යය සම්පූර්ණයි ✓",
    grammarFail: "වාක්‍යය සම්පූර්ණ නැහැ",
    suggestion: "Improvement Suggestion",
    charAnalysis: "Character Analysis",
    correct: "Correct",
    needsWork: "Needs work",
    progressTitle: "Your Progress",
    progressDesc: "Track your improvement over time",
    statLabels: ["Accuracy", "Sessions", "Streak"],
    statSuffixes: ["%", "", " days"],
    accuracyTrend: "Accuracy Trend",
    last7: "Last 7 sessions",
    freePlaceholder: "ඔබගේ වාක්‍යය මෙහි ලියන්න...",
  },
  si: {
    badge: "සිංහල ඉගෙනීමේ පද්ධතිය",
    heroTitle1: "සිංහල වාක්‍ය පුහුණු වන්න &",
    heroTitle2: "ඔබේ අත් අකුරු",
    heroTitleEm: "වැඩිදියුණු කරන්න",
    heroDesc: "දෙමළ ළමුන් සඳහා නිර්මාණය කළ ස්මාර්ට් ප්‍රතිපෝෂණ සහ ප්‍රගති ලුහුබැඳීම සමඟ ලියන්න, ඉගෙන ගන්න.",
    startGuided: "මෙහෙයවන පුහුණුව ආරම්භ කරන්න",
    tryFree: "නිදහස් ලිවීම උත්සාහ කරන්න",
    todaySentence: "අදේ වාක්‍යය",
    canvasLabel: "කළමනාකරණ පෙළ",
    practiceStreak: "පුහුණු දින පෙළ",
    streakVal: "🔥 දින 7",
    sessionsDone: "සම්පූර්ණ කළ වාරයන්",
    sessionsVal: "සැසි 24",
    accuracy: "අත් අකුරු නිරවද්‍යතාව",
    chooseModeTitle: "ඔබේ පුහුණු ආකාරය තෝරන්න",
    chooseModeDesc: "ඔබේ සිංහල අත් ලිවීමේ ක්‍රම දෙකක්",
    guidedTitle: "දෙන ලද වාක්‍ය පුහුණු වන්න",
    guidedDesc: "පද්ධතිය ලබා දෙන වාක්‍ය ලියා, මෙහෙයවන ප්‍රතිපෝෂණ සහිතව නිරවද්‍යතාව වැඩි කරන්න.",
    guidedBtn: "පුහුණුව ආරම්භ කරන්න →",
    freeTitle: "ඔබේම වාක්‍යයක් ලියන්න",
    freeDesc: "ඔබේ නිදහස් සිංහල වාක්‍යයක් ලිවීමෙන් බුද්ධිමත් ප්‍රතිපෝෂණ ලබා ගන්න.",
    freeBtn: "ලිවීම ආරම්භ කරන්න →",
    writeSentence: "මෙම වාක්‍යය ලියන්න",
    nextSentence: "ඊළඟ වාක්‍යය →",
    sentenceCounter: (cur, total) => `වාක්‍යය ${cur} / ${total}`,
    yourSpace: "ඔබේ ලිවීමේ ස්ථානය",
    guided: "මෙහෙයවන පුහුණුව",
    freeWriting: "නිදහස් ලිවීම",
    close: "වසන්න ✕",
    clear: "මකන්න",
    submit: "ඉදිරිපත් කරන්න →",
    feedbackTitle: "ප්‍රතිපෝෂණ වාර්තාව",
    tryAgain: "නැවත උත්සාහ කරන්න →",
    hwAccuracy: "අත් අකුරු නිරවද්‍යතාව",
    grammarCheck: "ව්‍යාකරණ පරීක්ෂාව",
    grammarOk: "වාක්‍යය සම්පූර්ණයි ✓",
    grammarFail: "වාක්‍යය සම්පූර්ණ නැහැ",
    suggestion: "වැඩිදියුණු කිරීමේ යෝජනා",
    charAnalysis: "අකුරු විශ්ලේෂණය",
    correct: "නිවැරදිය",
    needsWork: "වැඩ ඕනේ",
    progressTitle: "ඔබේ ප්‍රගතිය",
    progressDesc: "කාලයත් සමඟ ඔබේ වැඩිදියුණුව නිරීක්ෂණය කරන්න",
    statLabels: ["නිරවද්‍යතාව", "සැසි", "දින පෙළ"],
    statSuffixes: ["%", "", " දිනය"],
    accuracyTrend: "නිරවද්‍යතා ප්‍රවණතාව",
    last7: "අවසාන සැසි 7",
    freePlaceholder: "ඔබගේ වාක්‍යය මෙහි ලියන්න...",
  },
  ta: {
    badge: "சிங்கள கற்றல் அமைப்பு",
    heroTitle1: "சிங்கள வாக்கியங்களை பயிற்சி செய்யுங்கள் &",
    heroTitle2: "உங்கள் கையெழுத்தை",
    heroTitleEm: "மேம்படுத்துங்கள்",
    heroDesc: "இளம் கற்பவர்களுக்காக வடிவமைக்கப்பட்ட ஸ்மார்ட் கருத்துக்களுடன் எழுதுங்கள், கற்றுக்கொள்ளுங்கள்.",
    startGuided: "வழிகாட்டப்பட்ட பயிற்சியைத் தொடங்குங்கள்",
    tryFree: "சுதந்திர எழுத்தை முயற்சிக்கவும்",
    todaySentence: "இன்றைய வாக்கியம்",
    canvasLabel: "வரைபலகை",
    practiceStreak: "பயிற்சி தொடர்",
    streakVal: "🔥 7 நாட்கள்",
    sessionsDone: "முடிந்த வாக்கியங்கள்",
    sessionsVal: "24 அமர்வுகள்",
    accuracy: "கையெழுத்து துல்லியம்",
    chooseModeTitle: "உங்கள் பயிற்சி முறையை தேர்ந்தெடுக்கவும்",
    chooseModeDesc: "சிங்கள கையெழுத்து திறன்களை வளர்க்க இரண்டு சக்திவாய்ந்த வழிகள்",
    guidedTitle: "கொடுக்கப்பட்ட வாக்கியங்களை பயிற்சி செய்யுங்கள்",
    guidedDesc: "கணினி வழங்கும் வாக்கியங்களை எழுதி வழிகாட்டப்பட்ட கருத்துடன் துல்லியத்தை மேம்படுத்துங்கள்.",
    guidedBtn: "பயிற்சியைத் தொடங்குங்கள் →",
    freeTitle: "உங்கள் சொந்த வாக்கியம் எழுதுங்கள்",
    freeDesc: "உங்கள் சொந்த சிங்கள வாக்கியத்தை சுதந்திரமாக எழுதி அறிவார்ந்த கருத்தைப் பெறுங்கள்.",
    freeBtn: "எழுத்தைத் தொடங்குங்கள் →",
    writeSentence: "இந்த வாக்கியத்தை எழுதுங்கள்",
    nextSentence: "அடுத்த வாக்கியம் →",
    sentenceCounter: (cur, total) => `வாக்கியம் ${cur} / ${total}`,
    yourSpace: "உங்கள் எழுத்து இடம்",
    guided: "வழிகாட்டப்பட்ட பயிற்சி",
    freeWriting: "சுதந்திர எழுத்து",
    close: "மூடு ✕",
    clear: "அழி",
    submit: "சமர்ப்பிக்கவும் →",
    feedbackTitle: "கருத்து அறிக்கை",
    tryAgain: "மீண்டும் முயற்சிக்கவும் →",
    hwAccuracy: "கையெழுத்து துல்லியம்",
    grammarCheck: "இலக்கண சோதனை",
    grammarOk: "வாக்கியம் முழுமையானது ✓",
    grammarFail: "வாக்கியம் முழுமையற்றது",
    suggestion: "மேம்பாட்டு பரிந்துரை",
    charAnalysis: "எழுத்து பகுப்பாய்வு",
    correct: "சரியானது",
    needsWork: "மேலும் தேவை",
    progressTitle: "உங்கள் முன்னேற்றம்",
    progressDesc: "காலப்போக்கில் உங்கள் முன்னேற்றத்தை கண்காணிக்கவும்",
    statLabels: ["துல்லியம்", "அமர்வுகள்", "தொடர்"],
    statSuffixes: ["%", "", " நாட்கள்"],
    accuracyTrend: "துல்லிய போக்கு",
    last7: "கடந்த 7 அமர்வுகள்",
    freePlaceholder: "ඔබගේ වාක්‍යය මෙහි ලියන්න...",
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────
const sentences = [
  "අම්මා පාසලට යයි",
  "තාත්තා වැඩට යයි",
  "මම කිරි බොයි",
  "අපේ ගෙදර ලස්සනයි",
  "ළමයි ක්‍රීඩා කරයි",
];

const feedbackData = {
  accuracy: 85,
  grammar: true,
  suggestion: "ඔබේ ලිවීම සාමාන්‍ය මට්ටමේ ඇත. වැඩිපුර පුහුණු වී නිරවද්‍යතාව වැඩි කරන්න.",
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}{suffix}</span>;
}

function DrawingCanvas({ placeholder, onClearRef, onHasContentChange }) {
  const canvasRef = useRef(null);
  const [hasContent, setHasContent] = useState(false);
  const lastPos = useRef(null);
  const isDrawingRef = useRef(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onHasContentChange?.(false);
  }, [onHasContentChange]);

  useEffect(() => {
    if (onClearRef) onClearRef.current = clearCanvas;
  }, [clearCanvas, onClearRef]);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    isDrawingRef.current = true;
    setHasContent(true);
    onHasContentChange?.(true);
    lastPos.current = pos;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
  }, [onHasContentChange]);

  const draw = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }, []);

  const stopDraw = useCallback(() => { isDrawingRef.current = false; }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDraw);
    return () => {
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  return (
    <div className="relative bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden">
      {placeholder && !hasContent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="sinhala text-2xl text-gray-200 select-none">{placeholder}</span>
        </div>
      )}
      <div className="guide-lines">
        <canvas
          ref={canvasRef}
          width={800}
          height={220}
          className="canvas-area w-full block"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
        />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SinhalaHandwriting({ lang = "en" }) {
  // Safe fallback
  const tr = t[lang] ?? t.en;

  const [activeMode, setActiveMode] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const guidedClearRef = useRef(null);
  const freeClearRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    setTimeout(() => setShowProgress(true), 600);
  }, []);

  const handleSubmit = () => setSubmitted(true);
  const handleReset = () => {
    setSubmitted(false);
    guidedClearRef.current?.();
    freeClearRef.current?.();
  };
  const nextSentence = () => { setCurrentSentence((p) => (p + 1) % sentences.length); handleReset(); };

  const progressStats = [
    { label: tr.statLabels[0], value: 78, suffix: tr.statSuffixes[0] },
    { label: tr.statLabels[1], value: 24, suffix: tr.statSuffixes[1] },
    { label: tr.statLabels[2], value: 7,  suffix: tr.statSuffixes[2] },
  ];

  const chartBars = [40, 55, 48, 62, 70, 75, 85];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Noto+Sans+Sinhala:wght@300;400;500;600&display=swap');

        * { font-family: 'Nunito', sans-serif; }
        .sinhala { font-family: 'Noto Sans Sinhala', sans-serif; font-weight: 400; }
        .font-display { font-family: 'Nunito', sans-serif; font-weight: 800; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
        .anim-fade-up  { animation: fadeUp  0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in  { animation: fadeIn  0.6s ease both; }
        .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .delay-1 { animation-delay: 0.10s; }
        .delay-2 { animation-delay: 0.22s; }
        .delay-3 { animation-delay: 0.38s; }
        .delay-4 { animation-delay: 0.54s; }
        .canvas-area  { cursor: crosshair; touch-action: none; }
        .hover-lift   { transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease; }
        .hover-lift:hover { transform: translateY(-4px) scale(1.015); box-shadow: 0 20px 60px rgba(0,0,0,0.13); }
        .guide-lines  { background-image: repeating-linear-gradient(transparent, transparent 39px, #e5e7eb 39px, #e5e7eb 40px); }
      `}</style>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50" style={{clipPath:'polygon(8% 0,100% 0,100% 100%,0 100%)'}} />
          <svg className="absolute bottom-0 left-0 opacity-5 w-96 h-96" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="180" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="120" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="60"  stroke="black" strokeWidth="1"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div className={heroVisible ? "anim-fade-up" : "opacity-0"}>
            <span className="inline-block text-xs tracking-[0.2em] uppercase border border-black px-3 py-1 mb-8 anim-fade-in delay-1">
              {tr.badge}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-6 anim-fade-up delay-2">
              {tr.heroTitle1}{" "}
              <em className="not-italic underline decoration-2 underline-offset-4">{tr.heroTitleEm}</em>{" "}
              {tr.heroTitle2}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md anim-fade-up delay-3">
              {tr.heroDesc}
            </p>
            <div className="flex flex-wrap gap-4 anim-fade-up delay-4">
              <button
                onClick={() => { setActiveMode("guided"); setSubmitted(false); }}
                className="bg-black text-white px-7 py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                {tr.startGuided}
              </button>
              <button
                onClick={() => { setActiveMode("free"); setSubmitted(false); }}
                className="border border-black text-black px-7 py-3.5 rounded-2xl text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 hover:-translate-y-0.5"
              >
                {tr.tryFree}
              </button>
            </div>
          </div>

          {/* Illustration card */}
          <div className={`relative ${heroVisible ? "anim-scale-in delay-2" : "opacity-0"}`}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-2xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{tr.todaySentence}</div>
                    <div className="sinhala text-xl">අම්මා පාසලට යයි</div>
                  </div>
                </div>
                <div className="guide-lines bg-white rounded-xl border border-gray-200 p-4 h-28 relative overflow-hidden">
                  <svg className="absolute inset-4 w-full opacity-20" viewBox="0 0 300 80" fill="none">
                    <path d="M10 40 Q40 20 70 40 Q100 60 130 40 Q160 20 190 40 Q220 60 250 40" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute bottom-3 right-3 text-xs text-gray-300">{tr.canvasLabel}</div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-black mt-1.5" />
                    <span className="text-xs text-gray-500">{tr.accuracy}</span>
                  </div>
                  <div className="font-display text-2xl">85%</div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 text-xs">
                <div className="text-gray-400 mb-0.5">{tr.practiceStreak}</div>
                <div className="font-semibold text-sm">{tr.streakVal}</div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-black text-white rounded-2xl shadow-xl px-4 py-3 text-xs">
                <div className="text-gray-400 mb-0.5">{tr.sessionsDone}</div>
                <div className="font-semibold text-sm">{tr.sessionsVal}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODE SELECTION ─── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">{tr.chooseModeTitle}</h2>
          <p className="text-gray-400 text-base max-w-md mx-auto">{tr.chooseModeDesc}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Guided */}
          <div
            onClick={() => { setActiveMode("guided"); setSubmitted(false); }}
            className={`hover-lift cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 ${activeMode === "guided" ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${activeMode === "guided" ? "bg-white" : "bg-black"}`}>
              <svg className={`w-7 h-7 ${activeMode === "guided" ? "text-black" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-display text-2xl mb-3">{tr.guidedTitle}</h3>
            <p className={`text-sm leading-relaxed mb-8 ${activeMode === "guided" ? "text-gray-300" : "text-gray-500"}`}>{tr.guidedDesc}</p>
            <button className={`text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-300 ${activeMode === "guided" ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-900"}`}>
              {tr.guidedBtn}
            </button>
          </div>

          {/* Free */}
          <div
            onClick={() => { setActiveMode("free"); setSubmitted(false); }}
            className={`hover-lift cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 ${activeMode === "free" ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${activeMode === "free" ? "bg-white" : "bg-black"}`}>
              <svg className={`w-7 h-7 ${activeMode === "free" ? "text-black" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl mb-3">{tr.freeTitle}</h3>
            <p className={`text-sm leading-relaxed mb-8 ${activeMode === "free" ? "text-gray-300" : "text-gray-500"}`}>{tr.freeDesc}</p>
            <button className={`text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-300 ${activeMode === "free" ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-900"}`}>
              {tr.freeBtn}
            </button>
          </div>
        </div>
      </section>

      {/* ─── PRACTICE AREA ─── */}
      {activeMode && (
        <section className="max-w-4xl mx-auto px-6 pb-20 anim-fade-up">
          <div className="rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden shadow-xl">
            {/* Header bar */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-400" />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-widest">
                {activeMode === "guided" ? tr.guided : tr.freeWriting}
              </span>
              <button onClick={() => setActiveMode(null)} className="text-xs text-gray-400 hover:text-black transition-colors duration-200">
                {tr.close}
              </button>
            </div>

            <div className="p-8">
              {activeMode === "guided" && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">{tr.writeSentence}</span>
                    <button onClick={nextSentence} className="text-xs text-gray-400 hover:text-black transition-colors border border-gray-200 rounded-lg px-3 py-1.5">
                      {tr.nextSentence}
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 px-8 py-6 text-center">
                    <div className="sinhala text-4xl sm:text-5xl tracking-wide text-black mb-2">
                      {sentences[currentSentence]}
                    </div>
                    <div className="text-xs text-gray-300">{tr.sentenceCounter(currentSentence + 1, sentences.length)}</div>
                  </div>
                </div>
              )}

              {activeMode === "free" && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">{tr.yourSpace}</span>
                </div>
              )}

              {activeMode === "guided" && <DrawingCanvas key="guided" onClearRef={guidedClearRef} />}
              {activeMode === "free"   && <DrawingCanvas key="free" placeholder={tr.freePlaceholder} onClearRef={freeClearRef} />}

              <div className="flex gap-3 mt-5">
                <button onClick={handleReset} className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl text-sm font-semibold hover:border-gray-400 hover:text-black transition-all duration-200">
                  {tr.clear}
                </button>
                <button onClick={handleSubmit} className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-all duration-200 hover:shadow-lg">
                  {tr.submit}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── FEEDBACK ─── */}
      {submitted && (
        <section className="max-w-4xl mx-auto px-6 pb-20 anim-scale-in">
          <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="bg-black text-white px-8 py-5 flex items-center justify-between">
              <h3 className="font-display text-xl">{tr.feedbackTitle}</h3>
              <button onClick={handleReset} className="text-xs text-gray-400 hover:text-white transition-colors">{tr.tryAgain}</button>
            </div>

            <div className="p-8 grid sm:grid-cols-3 gap-6">
              {/* Accuracy ring */}
              <div className="sm:col-span-1 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-4">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="black" strokeWidth="8"
                      strokeDasharray={`${feedbackData.accuracy * 2.64} 264`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-2xl">{feedbackData.accuracy}%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">{tr.hwAccuracy}</div>
              </div>

              {/* Grammar & Suggestions */}
              <div className="sm:col-span-2 space-y-4">
                <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50 flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${feedbackData.grammar ? "bg-black" : "bg-gray-200"}`}>
                    {feedbackData.grammar
                      ? <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    }
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{tr.grammarCheck}</div>
                    <div className="sinhala text-lg">{feedbackData.grammar ? tr.grammarOk : tr.grammarFail}</div>
                  </div>
                </div>

                <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-widest">{tr.suggestion}</div>
                  <p className="sinhala text-sm text-gray-700 leading-relaxed">{feedbackData.suggestion}</p>
                </div>

                <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest">{tr.charAnalysis}</div>
                  <div className="flex flex-wrap gap-2">
                    {["අ","ම්","මා"," ","පා","ස","ල","ට"," ","ය","යි"].map((char, i) => (
                      <span key={i} className={`sinhala text-lg px-2 py-1 rounded-lg border ${char === " " ? "w-2" : i % 4 === 0 ? "border-gray-300 bg-gray-200 text-gray-600" : "border-transparent bg-black text-white"}`}>
                        {char !== " " && char}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-black inline-block" />{tr.correct}</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-gray-200 inline-block" />{tr.needsWork}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── PROGRESS ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">{tr.progressTitle}</h2>
          <p className="text-gray-400 text-sm">{tr.progressDesc}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          {progressStats.map((stat, i) => (
            <div key={i} className={`hover-lift rounded-3xl p-8 border ${i === 0 ? "bg-black text-white border-black" : "bg-gray-50 border-gray-100"}`}>
              <div className="text-xs uppercase tracking-widest mb-4 text-gray-400">{stat.label}</div>
              <div className={`font-display text-5xl ${i === 0 ? "text-white" : "text-black"}`}>
                {showProgress ? <AnimatedCounter value={stat.value} suffix={stat.suffix} /> : "0"}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display text-lg">{tr.accuracyTrend}</h4>
            <span className="text-xs text-gray-400">{tr.last7}</span>
          </div>
          <div className="flex items-end gap-3 h-36">
            {chartBars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full">
                  <div className="w-full bg-black rounded-t-lg transition-all duration-1000"
                    style={{ height: showProgress ? `${(h / 100) * 120}px` : "0px", transitionDelay: `${i * 80}ms` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{["M","T","W","T","F","S","S"][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-300">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </section>
    </div>
  );
}