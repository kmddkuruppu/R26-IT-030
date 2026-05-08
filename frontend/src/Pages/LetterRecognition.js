import { useState, useRef, useEffect, useCallback } from "react";

// ─── LETTER DATA (ALL 60 SINHALA LETTERS) ──────────────────────────────────────────────────
const LETTER_CATEGORIES = [
  {
    name: "ස්වර", nameEn: "Vowels", color: "#e11d48",
    letters: [
      { letter: "අ", sound: "a", word: "අම්මා", meaning: "Mother", image: "../images/mother.png" },
      { letter: "ආ", sound: "aa", word: "ආම්ප", meaning: "Mango tree", image: "/images/aa_aampa.jpg" },
      { letter: "ඇ", sound: "ae", word: "ඇස", meaning: "Eye", image: "/images/ae_aesa.jpg" },
      { letter: "ඈ", sound: "aee", word: "ඈත", wordEn: "aetha", meaning: "Far", image: "/images/aee_aetha.jpg" },
      { letter: "ඉ", sound: "i", word: "ඉර", wordEn: "ira", meaning: "Sun", image: "/images/letters/i_ira.jpg" },
      { letter: "ඊ", sound: "ii", word: "ඊට", wordEn: "eeta", meaning: "To that", image: "/images/letters/ii_eeta.jpg" },
      { letter: "උ", sound: "u", word: "උකුස්සා", wordEn: "ukussa", meaning: "Eagle", image: "/images/letters/u_ukussa.jpg" },
      { letter: "ඌ", sound: "uu", word: "ඌරා", wordEn: "oora", meaning: "Pig", image: "/images/letters/uu_oora.jpg" },
      { letter: "එ", sound: "e", word: "එළදෙනා", wordEn: "eladena", meaning: "Cow", image: "/images/letters/e_eladena.jpg" },
      { letter: "ඒ", sound: "ee", word: "ඒකා", wordEn: "eeka", meaning: "Alone", image: "/images/letters/ee_eeka.jpg" },
      { letter: "ඓ", sound: "ai", word: "ඓතිහාසික", wordEn: "aithasika", meaning: "Historical", image: "/images/letters/ai_aithasika.jpg" },
      { letter: "ඔ", sound: "o", word: "ඔළුව", wordEn: "oluwa", meaning: "Head", image: "/images/letters/o_oluwa.jpg" },
      { letter: "ඕ", sound: "oo", word: "ඕනෑ", wordEn: "oonae", meaning: "Need", image: "/images/letters/oo_oonae.jpg" },
      { letter: "ඖ", sound: "au", word: "ඖෂධ", wordEn: "aushadha", meaning: "Medicine", image: "/images/letters/au_aushadha.jpg" },
    ],
  },
  {
    name: "ක වර්ගය", nameEn: "Ka group", color: "#7c3aed",
    letters: [
      { letter: "ක", sound: "ka", word: "කපුටා", meaning: "Crow", image: "/images/crow.png" },
      { letter: "ඛ", sound: "kha", word: "ඛේදය", wordEn: "khedaya", meaning: "Grief", image: "/images/letters/kha_khedaya.jpg" },
      { letter: "ග", sound: "ga", word: "ගස", wordEn: "gasa", meaning: "Tree", image: "../images/tree.png" },
      { letter: "ඝ", sound: "gha", word: "ඝෝෂාව", wordEn: "ghoshawa", meaning: "Noise", image: "/images/letters/gha_ghoshawa.jpg" },
      { letter: "ඞ", sound: "nga", word: "ඞේ", wordEn: "nge", meaning: "Sound symbol", image: "/images/letters/nga_nge.jpg" },
    ],
  },
  {
    name: "ච වර්ගය", nameEn: "Cha group", color: "#0891b2",
    letters: [
      { letter: "ච", sound: "cha", word: "චන්ද්‍රයා", wordEn: "chandraya", meaning: "Moon", image: "/images/letters/cha_chandraya.jpg" },
      { letter: "ඡ", sound: "chha", word: "ඡායාරූප", wordEn: "chhayaruupa", meaning: "Photograph", image: "/images/letters/chha_chhayaruupa.jpg" },
      { letter: "ජ", sound: "ja", word: "ජලය", wordEn: "jalaya", meaning: "Water", image: "/images/letters/ja_jalaya.jpg" },
      { letter: "ඣ", sound: "jha", word: "ඣාරය", wordEn: "jharaya", meaning: "Waterfall", image: "/images/letters/jha_jharaya.jpg" },
      { letter: "ඤ", sound: "nya", word: "ඤාණය", wordEn: "nyanaya", meaning: "Wisdom", image: "/images/letters/nya_nyanaya.jpg" },
    ],
  },
  {
    name: "ට වර්ගය", nameEn: "Ta group (retroflex)", color: "#0369a1",
    letters: [
      { letter: "ට", sound: "ta", word: "ටෙලිවිෂනය", wordEn: "television", meaning: "Television", image: "/images/letters/ta_television.jpg" },
      { letter: "ඨ", sound: "tha", word: "ඨෙරවාද", wordEn: "therawada", meaning: "Theravada", image: "/images/letters/tha_therawada.jpg" },
      { letter: "ඩ", sound: "da", word: "ඩයිනෝසිරස්", meaning: "Dinosaur", image: "/images/dino.png" },
      { letter: "ඪ", sound: "dha", word: "ඪෝලය", wordEn: "dholaya", meaning: "Drum", image: "/images/letters/dha_dholaya.jpg" },
      { letter: "ණ", sound: "na", word: "ණය", wordEn: "naya", meaning: "Debt", image: "/images/letters/na_naya.jpg" },
    ],
  },
  {
    name: "ත වර්ගය", nameEn: "Tha group (dental)", color: "#15803d",
    letters: [
      { letter: "ත", sound: "tha", word: "තරු", wordEn: "tharu", meaning: "Stars", image: "/images/letters/tha_tharu.jpg" },
      { letter: "ථ", sound: "thha", word: "ථෙරවාද", wordEn: "therawada", meaning: "Theravada path", image: "/images/letters/thha_therawada.jpg" },
      { letter: "ද", sound: "da", word: "දිය", wordEn: "diya", meaning: "Water", image: "/images/letters/da_diya.jpg" },
      { letter: "ධ", sound: "dha", word: "ධර්මය", wordEn: "dharmaya", meaning: "Dhamma", image: "/images/letters/dha_dharmaya.jpg" },
      { letter: "න", sound: "na", word: "නෙළුම", wordEn: "neluma", meaning: "Lotus", image: "/images/letters/na_neluma.jpg" },
    ],
  },
  {
    name: "ප වර්ගය", nameEn: "Pa group", color: "#b45309",
    letters: [
      { letter: "ප", sound: "pa", word: "පාන්", wordEn: "paan", meaning: "Bread", image: "/images/letters/pa_paan.jpg" },
      { letter: "ඵ", sound: "pha", word: "ඵලය", wordEn: "phalaya", meaning: "Fruit", image: "/images/letters/pha_phalaya.jpg" },
      { letter: "බ", sound: "ba", word: "බල්ලා", wordEn: "balla", meaning: "Dog", image: "/images/letters/ba_balla.jpg" },
      { letter: "භ", sound: "bha", word: "භාෂාව", wordEn: "bhashawa", meaning: "Language", image: "/images/letters/bha_bhashawa.jpg" },
      { letter: "ම", sound: "ma", word: "මල", wordEn: "mala", meaning: "Flower", image: "/images/letters/ma_mala.jpg" },
    ],
  },
  {
    name: "අවර්ගීය", nameEn: "Semi-vowels & Sibilants", color: "#be185d",
    letters: [
      { letter: "ය", sound: "ya", word: "යකා", wordEn: "yaka", meaning: "Demon", image: "/images/letters/ya_yaka.jpg" },
      { letter: "ර", sound: "ra", word: "රථය", wordEn: "rathaya", meaning: "Vehicle", image: "/images/letters/ra_rathaya.jpg" },
      { letter: "ල", sound: "la", word: "ලිය", wordEn: "liya", meaning: "Write", image: "/images/letters/la_liya.jpg" },
      { letter: "ව", sound: "va", word: "වලිගය", wordEn: "waligaya", meaning: "Tail", image: "../images/monkey.png" },
      { letter: "ශ", sound: "sha", word: "ශාලාව", wordEn: "shaalawa", meaning: "Hall", image: "/images/letters/sha_shaalawa.jpg" },
      { letter: "ෂ", sound: "shha", word: "ෂඩ්රසය", wordEn: "shadrasaya", meaning: "Six flavours", image: "/images/letters/shha_shadrasaya.jpg" },
      { letter: "ස", sound: "sa", word: "සමනලයා", meaning: "Butterfly", image: "/images/butterfly.png" },
      { letter: "හ", sound: "ha", word: "හාවා", wordEn: "haawa", meaning: "Rabbit", image: "/images/letters/ha_haawa.jpg" },
      { letter: "ළ", sound: "lla", word: "ළමයා", wordEn: "lamaaya", meaning: "Child", image: "/images/letters/lla_lamaaya.jpg" },
      { letter: "ෆ", sound: "fa", word: "ෆෝනය", wordEn: "phonaya", meaning: "Phone", image: "/images/letters/fa_phonaya.jpg" },
    ],
  },
  {
    name: "ගණනා අකුරු", nameEn: "Numerals", color: "#6d28d9",
    letters: [
      { letter: "෦", sound: "shoonya", word: "ශුන්‍ය", wordEn: "shoonya", meaning: "Zero", image: "/images/letters/num_0.jpg" },
      { letter: "෧", sound: "eka", word: "එකය", wordEn: "ekaya", meaning: "One", image: "/images/letters/num_1.jpg" },
      { letter: "෨", sound: "deka", word: "දෙකය", wordEn: "dekaya", meaning: "Two", image: "/images/letters/num_2.jpg" },
      { letter: "෩", sound: "thuna", word: "තුනය", wordEn: "thunaya", meaning: "Three", image: "/images/letters/num_3.jpg" },
      { letter: "෪", sound: "hathara", word: "හතරය", wordEn: "hatharaya", meaning: "Four", image: "/images/letters/num_4.jpg" },
      { letter: "෫", sound: "paha", word: "පහය", wordEn: "pahaya", meaning: "Five", image: "/images/letters/num_5.jpg" },
      { letter: "෬", sound: "haya", word: "හය", wordEn: "haya", meaning: "Six", image: "/images/letters/num_6.jpg" },
      { letter: "෭", sound: "hatha", word: "හතය", wordEn: "hathaya", meaning: "Seven", image: "/images/letters/num_7.jpg" },
      { letter: "෮", sound: "ata", word: "අටය", wordEn: "ataya", meaning: "Eight", image: "/images/letters/num_8.jpg" },
      { letter: "෯", sound: "nawaya", word: "නවය", wordEn: "nawaya", meaning: "Nine", image: "/images/letters/num_9.jpg" },
    ],
  },
];

const ALL_LETTERS = LETTER_CATEGORIES.flatMap((c) =>
  c.letters.map((l) => ({ ...l, catColor: c.color, catName: c.nameEn }))
);

const getLetterInfo = (char) => {
  for (const cat of LETTER_CATEGORIES) {
    const found = cat.letters.find((l) => l.letter === char);
    if (found) return { ...found, catColor: cat.color, catName: cat.nameEn, sinhalaName: cat.name };
  }
  return null;
};

// ─── SPEAK FUNCTION ───────────────────────────────────────────────
const speakText = (text, lang = "si-LK") => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.85;
  utt.pitch = 1;
  // Try Sinhala voice, fallback to any available
  const voices = window.speechSynthesis.getVoices();
  const sinhalaVoice = voices.find(v => v.lang.startsWith("si"));
  if (sinhalaVoice) utt.voice = sinhalaVoice;
  window.speechSynthesis.speak(utt);
};

// ─── ANIMATED COUNTER ─────────────────────────────────────────────
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

// ─── LETTER DETAIL MODAL ──────────────────────────────────────────
function LetterDetailModal({ letterInfo, catColor, onClose }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!letterInfo) return null;

  const handleSpeak = () => {
    setIsSpeaking(true);
    speakText(`${letterInfo.letter}. ${letterInfo.word}. ${letterInfo.meaning}`);
    setTimeout(() => setIsSpeaking(false), 2500);
  };

  const handleSpeakWord = () => {
    setIsSpeaking(true);
    speakText(letterInfo.word, "si-LK");
    setTimeout(() => setIsSpeaking(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden anim-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="sinhala w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold"
              style={{ background: `${catColor}18`, color: catColor }}
            >
              {letterInfo.letter}
            </div>
            <div>
              <div className="font-display text-xl text-black">{letterInfo.letter}</div>
              <div className="text-sm text-gray-400">/{letterInfo.sound}/</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-all"
          >
            ✕
          </button>
        </div>

        {/* Image */}
        <div className="relative bg-gray-50 h-70 flex items-center justify-center overflow-hidden">
          {!imgError ? (
            <img
              src={letterInfo.image}
              alt={letterInfo.meaning}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-300">
              <div className="sinhala text-7xl" style={{ color: `${catColor}40` }}>{letterInfo.letter}</div>
              <div className="text-xs text-gray-400">Add image: {letterInfo.image}</div>
            </div>
          )}
          {/* Image overlay with meaning */}
          {!imgError && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4">
              <div className="sinhala text-white font-bold text-2xl">{letterInfo.word}</div>
              <div className="text-gray-300 text-sm">{letterInfo.meaning}</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {imgError && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="sinhala text-3xl font-bold text-black">{letterInfo.word}</div>
                <div
                  className="text-xs px-2 py-1 rounded-lg font-semibold"
                  style={{ background: `${catColor}14`, color: catColor }}
                >
                  {letterInfo.catName}
                </div>
              </div>
              <div className="text-gray-500 text-sm">{letterInfo.meaning} · <span className="font-mono">{letterInfo.wordEn}</span></div>
            </div>
          )}

          {/* Word display when image shows */}
          {!imgError && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Example Word</div>
                <div className="sinhala text-2xl font-bold text-black">{letterInfo.word}</div>
                <div className="text-sm text-gray-500">{letterInfo.wordEn} · {letterInfo.meaning}</div>
              </div>
              <div
                className="text-xs px-3 py-1.5 rounded-xl font-semibold"
                style={{ background: `${catColor}14`, color: catColor }}
              >
                {letterInfo.catName}
              </div>
            </div>
          )}

          {/* Voice buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSpeak}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${isSpeaking ? "bg-black text-white" : "bg-black text-white hover:bg-gray-900"}`}
            >
              <span>{isSpeaking ? "🔊" : "🔈"}</span>
              {isSpeaking ? "Playing..." : "Hear Letter & Word"}
            </button>
            <button
              onClick={handleSpeakWord}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black transition-all"
            >
              <span>🗣</span>
              Word
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LETTER GRID ──────────────────────────────────────────────────
function LetterGrid({ onSelect, selectedLetter, onLetterClick }) {
  const [openCat, setOpenCat] = useState(0);
  return (
    <div>
      {LETTER_CATEGORIES.map((cat, ci) => (
        <div key={ci} className="mb-1">
          <button
            onClick={() => setOpenCat(openCat === ci ? -1 : ci)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-left hover:bg-white"
            style={{ background: openCat === ci ? `${cat.color}14` : "transparent" }}
          >
            <span className="text-xs font-bold" style={{ color: openCat === ci ? cat.color : "#6b7280" }}>
              {cat.name} <span className="opacity-50 font-normal">({cat.nameEn})</span>
            </span>
            <span className="text-gray-400 text-xs">{openCat === ci ? "▲" : "▼"}</span>
          </button>
          {openCat === ci && (
            <div className="flex flex-wrap gap-2 px-2 pb-3 pt-1">
              {cat.letters.map((l, li) => {
                const isSel = selectedLetter === l.letter;
                return (
                  <button
                    key={li}
                    onClick={() => {
                      onSelect?.(l.letter);
                      onLetterClick?.({ ...l, catColor: cat.color, catName: cat.nameEn });
                    }}
                    title={`${l.letter} (${l.sound}) · ${l.meaning}`}
                    className="sinhala w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all duration-150 hover:scale-110"
                    style={{
                      border: isSel ? `2px solid ${cat.color}` : "1.5px solid #e5e7eb",
                      background: isSel ? cat.color : "#f9fafb",
                      color: isSel ? "#fff" : "#374151",
                      transform: isSel ? "scale(1.15)" : "scale(1)",
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
}

// ─── CONFIDENCE BAR ───────────────────────────────────────────────
function ConfidenceBar({ value }) {
  return (
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-black rounded-full transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// ─── FULL ALPHABET SHOWCASE ───────────────────────────────────────
function AlphabetShowcase({ onLetterClick }) {
  return (
    <div className="space-y-8">
      {LETTER_CATEGORIES.map((cat, ci) => (
        <div key={ci}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-100" />
            <div
              className="sinhala text-sm font-semibold px-4 py-1.5 rounded-full"
              style={{ background: `${cat.color}14`, color: cat.color }}
            >
              {cat.name} · {cat.nameEn}
            </div>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3">
            {cat.letters.map((l, li) => (
              <button
                key={li}
                onClick={() => onLetterClick({ ...l, catColor: cat.color, catName: cat.nameEn })}
                title={`${l.letter} (${l.sound}) - ${l.meaning}`}
                className="group relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-gray-100 bg-gray-50 hover:border-transparent hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                style={{ "--hover-color": cat.color }}
              >
                <div
                  className="sinhala text-2xl font-bold transition-colors duration-200"
                  style={{ color: cat.color }}
                >
                  {l.letter}
                </div>
                <div className="text-xs text-gray-400 font-mono leading-none">{l.sound}</div>
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: `${cat.color}08`, border: `1.5px solid ${cat.color}40` }}
                />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function LetterRecognition() {
  const [tab, setTab] = useState("upload");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isRecognizing, setRecognizing] = useState(false);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, streak: 0, points: 0 });
  const [showProgress, setShowProgress] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showPanel, setShowPanel] = useState("letters");
  const [activeModal, setActiveModal] = useState(null); // { letter, catColor, ...info }
  const [activeMode, setActiveMode] = useState(null);
  const [alphabetView, setAlphabetView] = useState("grid"); // "grid" | "showcase"

  const fileInputRef = useRef(null);

  const chartBars = [40, 55, 48, 62, 70, 75, 85];
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    setTimeout(() => setShowProgress(true), 600);
    // Load voices
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const handleLetterClick = (letterInfo) => {
    setActiveModal(letterInfo);
    speakText(`${letterInfo.letter}`, "si-LK");
  };

  const handleSelectLetter = (letter) => {
    setSelectedLetter(letter);
    setActiveMode("upload");
    setTab("upload");
    setResult(null);
    setFeedback(null);
    setHasDrawn(false);
  };

  const handleActivateMode = (mode) => {
    setActiveMode(mode);
    setTab(mode);
    setResult(null);
    setFeedback(null);
  };

  const mockRecognize = (selLetter) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const conf = 70 + Math.floor(Math.random() * 28);
        const pool = selLetter
          ? ALL_LETTERS.filter((l) => l.letter === selLetter)
          : ALL_LETTERS;
        const top = { ...pool[Math.floor(Math.random() * pool.length)], confidence: conf };
        const alts = ALL_LETTERS.filter(
          (l) => l.catName === top.catName && l.letter !== top.letter
        )
          .slice(0, 3)
          .map((l, i) => ({ ...l, confidence: Math.max(10, conf - 20 - i * 8) }));
        resolve({ top, alternatives: alts });
      }, 1400);
    });

  const handleRecognize = async () => {
    if (!hasDrawn && !uploadPreview) return;
    setRecognizing(true);
    setResult(null);
    setFeedback(null);
    const res = await mockRecognize(selectedLetter);
    setResult(res);
    setRecognizing(false);
    setStats((p) => ({ ...p, total: p.total + 1 }));
  };

  const handleFeedback = (correct) => {
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1800);
      setStats((p) => ({
        ...p,
        correct: p.correct + 1,
        streak: p.streak + 1,
        points: p.points + Math.max(5, Math.round((result?.top?.confidence ?? 70) / 10)),
      }));
    } else {
      setStats((p) => ({ ...p, streak: 0 }));
    }
  };

  const handleReset = () => {
    setResult(null);
    setFeedback(null);
    setHasDrawn(false);
    setUploadPreview(null);
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadPreview(URL.createObjectURL(file));
    setHasDrawn(true);
    setResult(null);
    setFeedback(null);
  };

  const progressStats = [
    { label: "Accuracy", value: accuracy || 78, suffix: "%" },
    { label: "Sessions", value: stats.total || 24, suffix: "" },
    { label: "Streak", value: stats.streak || 7, suffix: " days" },
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Noto+Sans+Sinhala:wght@300;400;500;600&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .sinhala { font-family: 'Noto Sans Sinhala', sans-serif !important; font-weight: 400; }
        .font-display { font-family: 'Nunito', sans-serif; font-weight: 800; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
        @keyframes popIn { 0%{opacity:0;transform:scale(.7)} 60%{transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes confettiFly { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-60px) rotate(720deg);opacity:0} }
        .anim-fade-up { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in { animation: fadeIn 0.6s ease both; }
        .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .anim-pop { animation: popIn 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.22s; }
        .delay-3 { animation-delay: 0.38s; }
        .delay-4 { animation-delay: 0.54s; }
        .hover-lift { transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease; }
        .hover-lift:hover { transform: translateY(-4px) scale(1.015); box-shadow: 0 20px 60px rgba(0,0,0,0.13); }
        .spin { animation: spin 0.8s linear infinite; }
        .confetti-burst span { position:absolute; pointer-events:none; animation: confettiFly 0.9s ease-out forwards; }
      `}</style>

      {/* ─── LETTER DETAIL MODAL ─── */}
      {activeModal && (
        <LetterDetailModal
          letterInfo={activeModal}
          catColor={activeModal.catColor}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50" style={{ clipPath: "polygon(8% 0,100% 0,100% 100%,0 100%)" }} />
          <svg className="absolute bottom-0 left-0 opacity-5 w-96 h-96" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="180" stroke="black" strokeWidth="1" />
            <circle cx="200" cy="200" r="120" stroke="black" strokeWidth="1" />
            <circle cx="200" cy="200" r="60" stroke="black" strokeWidth="1" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div className={heroVisible ? "anim-fade-up" : "opacity-0"}>
            <span className="inline-block text-xs tracking-[0.2em] uppercase border border-black px-3 py-1 mb-8 anim-fade-in delay-1">
              Sinhala Learning System
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-6 anim-fade-up delay-2 text-black">
              Learn Sinhala Letters &{" "}
              <em className="not-italic underline decoration-2 underline-offset-4 text-black">Train</em>{" "}
              Your Eye
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md anim-fade-up delay-3">
              Click any letter to see example words, images and hear the pronunciation instantly. Upload a letter for AI recognition.
            </p>
            <div className="flex flex-wrap gap-4 anim-fade-up delay-4">
              <button
                onClick={() => {
                  document.getElementById("alphabet-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-black text-white px-7 py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore All 60 Letters
              </button>
              <button
                onClick={() => handleActivateMode("upload")}
                className="border border-black text-black px-7 py-3.5 rounded-2xl text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* Hero illustration */}
          <div className={`relative ${heroVisible ? "anim-scale-in delay-2" : "opacity-0"}`}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-2xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Today's letter</div>
                    <div className="sinhala text-4xl font-semibold">ක</div>
                  </div>
                </div>

                {/* Showcase 5 random letters */}
                <div className="flex gap-3 flex-wrap mb-4">
                  {["ක", "ග", "ජ", "ත", "ම"].map((l, i) => {
                    const info = getLetterInfo(l);
                    return (
                      <button
                        key={i}
                        onClick={() => handleLetterClick({ ...info, catColor: info?.catColor })}
                        className="sinhala w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-bold hover:scale-110 transition-all"
                        style={{ background: `${info?.catColor}14`, color: info?.catColor }}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-black" />
                    <span className="text-xs text-gray-500">Click any letter to learn</span>
                  </div>
                  <div className="font-display text-xl">60 Letters</div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 text-xs">
                <div className="text-gray-400 mb-0.5">Practice streak</div>
                <div className="font-semibold text-sm">🔥 7 days</div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-black text-white rounded-2xl shadow-xl px-4 py-3 text-xs">
                <div className="text-gray-400 mb-0.5">Letters to learn</div>
                <div className="font-semibold text-sm">60 total letters</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODE SELECTION ─── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">Choose Your Practice Mode</h2>
          <p className="text-gray-400 text-base max-w-md mx-auto">Two powerful ways to sharpen your Sinhala letter recognition</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              id: "explore",
              title: "Explore Letters",
              desc: "Click any Sinhala letter to see example words, images and hear the pronunciation instantly.",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
            },
            {
              id: "upload",
              title: "Upload an Image",
              desc: "Upload a photo or scan of a handwritten Sinhala letter and receive detailed recognition feedback.",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              ),
            },
          ].map(({ id, title, desc, icon }) => {
            const isActive = activeMode === id;
            return (
              <div
                key={id}
                onClick={() => id === "explore"
                  ? document.getElementById("alphabet-section")?.scrollIntoView({ behavior: "smooth" })
                  : handleActivateMode(id)}
                className={`hover-lift cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 ${isActive ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${isActive ? "bg-white text-black" : "bg-black text-white"}`}>
                  {icon}
                </div>
                <h3 className="font-display text-2xl mb-3">{title}</h3>
                <p className={`text-sm leading-relaxed mb-8 ${isActive ? "text-gray-300" : "text-gray-500"}`}>{desc}</p>
                <button className={`text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-300 ${isActive ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-900"}`}>
                  {id === "explore" ? "Explore Letters →" : "Upload Image →"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── UPLOAD PRACTICE AREA ─── */}
      {activeMode === "upload" && (
        <section className="max-w-7xl mx-auto px-6 pb-20 anim-fade-up">
          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            {/* Main panel */}
            <div className="rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-widest">Upload Mode</span>
                <button onClick={() => setActiveMode(null)} className="text-xs text-gray-400 hover:text-black transition-colors">
                  Close ✕
                </button>
              </div>

              <div className="p-8">
                {selectedLetter && (() => {
                  const info = getLetterInfo(selectedLetter);
                  return (
                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3.5 mb-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="sinhala w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-semibold"
                          style={{ background: `${info?.catColor}18`, color: info?.catColor }}
                        >
                          {selectedLetter}
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Practicing</div>
                          <div className="sinhala text-xl font-semibold leading-tight">{selectedLetter}</div>
                          <div className="text-xs text-gray-500">/{info?.sound}/ · {info?.catName}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedLetter(null)}
                        className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-all text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })()}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  className="relative rounded-2xl border-2 border-dashed border-gray-200 bg-white cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center min-h-64 overflow-hidden"
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                  {uploadPreview ? (
                    <>
                      <img src={uploadPreview} alt="uploaded" className="max-h-60 max-w-full object-contain rounded-xl" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadPreview(null); setHasDrawn(false); setResult(null); }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-red-400 transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-10">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-700 mb-1">Click or drag & drop an image here</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP supported</p>
                    </div>
                  )}
                </div>
                {uploadPreview && (
                  <button
                    onClick={handleRecognize}
                    disabled={isRecognizing}
                    className="w-full mt-5 bg-black text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-all hover:shadow-lg disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {isRecognizing ? "Recognizing..." : "Recognize Letter →"}
                  </button>
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5">
                {[
                  { id: "letters", label: "All Letters" },
                  { id: "howto", label: "How It Works" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setShowPanel(id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${showPanel === id ? "bg-black text-white" : "text-gray-500"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex-1 overflow-y-auto" style={{ maxHeight: 480 }}>
                {showPanel === "letters" && (
                  <>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Click to explore</p>
                    <LetterGrid
                      onSelect={handleSelectLetter}
                      selectedLetter={selectedLetter}
                      onLetterClick={handleLetterClick}
                    />
                  </>
                )}
                {showPanel === "howto" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">How It Works</h3>
                    {[
                      "Upload a Sinhala letter image",
                      "AI analyses stroke patterns",
                      "See the result instantly",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center font-bold text-xs text-white flex-shrink-0">{i + 1}</div>
                        <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tip</p>
                      <p className="text-xs text-gray-500 leading-relaxed">Upload a clear, well-lit photo of the letter for best accuracy.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── RESULT / FEEDBACK ─── */}
      {result && (
        <section className="max-w-7xl mx-auto px-6 pb-20 anim-scale-in">
          <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-xl max-w-4xl">
            <div className="bg-black text-white px-8 py-5 flex items-center justify-between">
              <h3 className="font-display text-xl">Recognition Result</h3>
              <button onClick={handleReset} className="text-xs text-gray-400 hover:text-white transition-colors font-semibold">
                Try Again →
              </button>
            </div>

            <div className="p-8 grid sm:grid-cols-[200px_1fr] gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-4">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="black" strokeWidth="8"
                      strokeDasharray={`${result.top.confidence * 2.64} 264`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-2xl">{result.top.confidence}%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-4">Confidence</div>
                <button
                  onClick={() => handleLetterClick({ ...result.top, catColor: result.top.catColor || "#000" })}
                  className="sinhala text-5xl font-bold text-black mb-1 hover:scale-110 transition-all cursor-pointer"
                  title="Click to explore this letter"
                >
                  {result.top.letter}
                </button>
                <div className="text-xs text-gray-500">/{result.top.sound}/ · {result.top.catName}</div>
                <div className="text-xs text-gray-400 mt-1">{result.top.meaning}</div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest">Was this correct?</div>
                  {!feedback ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleFeedback(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all"
                      >
                        ✓ Yes, correct!
                      </button>
                      <button
                        onClick={() => handleFeedback(false)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all"
                      >
                        ✕ No, try again
                      </button>
                    </div>
                  ) : feedback === "correct" ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center anim-pop">
                      <div className="text-2xl mb-1">🎉</div>
                      <div className="text-green-700 font-bold text-sm">
                        +{Math.max(5, Math.round(result.top.confidence / 10))} pts! Streak: {stats.streak} 🔥
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center anim-pop">
                      <div className="text-2xl mb-1">💪</div>
                      <div className="text-orange-700 font-bold text-sm">Keep practising!</div>
                    </div>
                  )}
                </div>

                {result.alternatives.length > 0 && (
                  <div className="rounded-2xl p-5 border border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest">Alternatives</div>
                    <div className="space-y-3">
                      {result.alternatives.map((alt, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <button
                            onClick={() => handleLetterClick({ ...alt, catColor: alt.catColor || "#888" })}
                            className="sinhala w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg flex-shrink-0 hover:scale-110 transition-all"
                          >
                            {alt.letter}
                          </button>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="sinhala text-sm font-bold">{alt.letter}</span>
                              <span className="text-xs text-gray-400 font-semibold">{alt.confidence}%</span>
                            </div>
                            <ConfidenceBar value={alt.confidence} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleLetterClick({ ...result.top, catColor: result.top.catColor || "#000" })}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-black bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Explore this letter →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── ALL SINHALA LETTERS SECTION ─── */}
      <section id="alphabet-section" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-display text-2xl mb-1">All Sinhala Letters</h4>
              <p className="text-gray-400 text-sm">Click any letter to see word, image & hear pronunciation</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAlphabetView("showcase")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${alphabetView === "showcase" ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}
              >
                Showcase
              </button>
              <button
                onClick={() => setAlphabetView("grid")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${alphabetView === "grid" ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}
              >
                Compact
              </button>
            </div>
          </div>

          {alphabetView === "showcase" ? (
            <AlphabetShowcase onLetterClick={handleLetterClick} />
          ) : (
            <LetterGrid
              onSelect={handleSelectLetter}
              selectedLetter={selectedLetter}
              onLetterClick={handleLetterClick}
            />
          )}
        </div>
      </section>

      {/* ─── PROGRESS ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">Your Progress</h2>
          <p className="text-gray-400 text-sm">Track your improvement over time</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          {progressStats.map((stat, i) => (
            <div key={i} className={`hover-lift rounded-3xl p-8 border ${i === 0 ? "bg-black text-white border-black" : "bg-gray-50 border-gray-100"}`}>
              <div className={`text-xs uppercase tracking-widest mb-4 ${i === 0 ? "text-gray-400" : "text-gray-400"}`}>{stat.label}</div>
              <div className={`font-display text-5xl ${i === 0 ? "text-white" : "text-black"}`}>
                {showProgress ? <AnimatedCounter value={stat.value} suffix={stat.suffix} /> : "0"}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display text-lg">Accuracy Trend</h4>
            <span className="text-xs text-gray-400">Last 7 sessions</span>
          </div>
          <div className="flex items-end gap-3 h-36">
            {chartBars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full">
                  <div
                    className="w-full bg-black rounded-t-lg transition-all duration-1000"
                    style={{ height: showProgress ? `${(h / 100) * 120}px` : "0px", transitionDelay: `${i * 80}ms` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-300 font-semibold">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </section>
    </div>
  );
}