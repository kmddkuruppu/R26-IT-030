import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import { saveGameProgress, checkAndEarnAchievements, saveGamifiedSession, saveFaceReaction, checkAndEarnGamifiedAchievements, getGamifiedStats, 
} from "../services/apiService";

// ─── PAGE-LEVEL TRANSLATIONS ──────────────────────────────────────
const PAGE_TRANSLATIONS = {
  en: {
    badge:          "Gamified Learning System",
    heroTitle1:     "Play Your Way to",
    heroTitle2:     "Mastery",
    heroItalic:     "Sinhala",
    heroDesc:       "Seven uniquely crafted games — letters first, then words. Build recognition, spelling, and confidence through play.",
    quickPlay:      "Quick Play →",
    tryPuzzle:      "Try Letter Puzzle",
    chooseGame:     "Choose Your Game",
    chooseDesc:     "Eight games across two skill levels — letters first, then words",
    letterGames:    "Letter Games",
    wordGames:      "Word Games",
    newLabel:       "New",
    yourProgress:   "Your Progress",
    progressDesc:   "Track improvement across all games",
    totalScore:     "Total Score",
    starsEarned:    "Stars Earned",
    badges:         "Badges",
    scoreTrend:     "Score Trend",
    last7:          "Last 7 sessions",
    achievTitle:    "Achievements Unlocked",
    masterTitle:    "Master Learner",
    masterDesc:     "Earned 500+ points",
    activeToday:    "Active today",
    gamesAvail:     "7 Games Available",
    wordGamesLabel: "Word Games: Builder · Unscramble · Missing Letter · Line Connect",
    bestScore:      "Best possible score",
    diffLabel:      "Difficulty",
    diffValue:      "Easy — Medium",
    lettersLabel:   "Letters covered",
    play:           "Play",
    pts:            "pts",
    moodHistory:    "Mood History",
    recentMood:     "Recent reactions",
    difficulty: { Easy: "Easy", Medium: "Medium", Hard: "Hard" },
    tags: { Pairs: "Pairs", Timed: "Timed", Search: "Search", Puzzle: "Puzzle", Build: "Build", Fill: "Fill", Match: "Match" },
  },
  si: {
    badge:          "ක්‍රීඩා ඉගෙනීමේ පද්ධතිය",
    heroTitle1:     "ක්‍රීඩාවෙන් ඉගෙනගන්න",
    heroTitle2:     "ප්‍රවීණත්වය",
    heroItalic:     "සිංහල",
    heroDesc:       "විශේෂයෙන් නිර්මාණය කළ ක්‍රීඩා හතක් — අකුරු මුලින්, ඉන් පසු වචන. ක්‍රීඩාව හරහා හඳුනා ගැනීම, අක්ෂර වින්‍යාසය සහ විශ්වාසය ගොඩ නගන්. ",
    quickPlay:      "ඉක්මන් ක්‍රීඩාව →",
    tryPuzzle:      "ලිය ප්‍රහේලිකාව අත්හදා බලන්න",
    chooseGame:     "ඔබේ ක්‍රීඩාව තෝරන්න",
    chooseDesc:     "කුසලතා මට්ටම් දෙකක ක්‍රීඩා අටක් — අකුරු මුලින්, ඉන් පසු වචන",
    letterGames:    "අකුරු ක්‍රීඩා",
    wordGames:      "වචන ක්‍රීඩා",
    newLabel:       "නව",
    yourProgress:   "ඔබේ ප්‍රගතිය",
    progressDesc:   "සියලු ක්‍රීඩාවල දියුණුව නිරීක්ෂණය කරන්න",
    totalScore:     "මුළු ලකුණු",
    starsEarned:    "ලබාගත් තරු",
    badges:         "සම්මාන",
    scoreTrend:     "ලකුණු ප්‍රවණතාව",
    last7:          "අවසාන සැසි 7",
    achievTitle:    "ලබාගත් ජය",
    masterTitle:    "ප්‍රධාන ඉගෙන්නා",
    masterDesc:     "ලකුණු 500+ ලබා ගත්තා",
    activeToday:    "අද ක්‍රියාත්මකයි",
    gamesAvail:     "ක්‍රීඩා 8ක් ඇත",
    wordGamesLabel: "වචන ක්‍රීඩා: ගොඩනැගිල්ල · ව්‍යාකූල · අස්ථාන · රේඛා සම්බන්ධ",
    bestScore:      "හොඳම ලකුණු",
    diffLabel:      "දුෂ්කරතාව",
    diffValue:      "පහසු — මධ්‍යම",
    lettersLabel:   "ආවරණය කළ අකුරු",
    play:           "ක්‍රීඩා කරන්න",
    pts:            "ල.",
    moodHistory:    "හැඟීම් ඉතිහාසය",
    recentMood:     "මෑත ප්‍රතික්‍රියා",
    difficulty: { Easy: "පහසු", Medium: "මධ්‍යම", Hard: "අමාරු" },
    tags: { Pairs: "යුගල", Timed: "කාලය", Search: "සෙවීම", Puzzle: "ප්‍රහේලිකා", Build: "ගොඩනැඟීම", Fill: "පිරවීම", Match: "ගැලපීම" },
  },
  ta: {
    badge:          "விளையாட்டு கற்றல் அமைப்பு",
    heroTitle1:     "விளையாடி கற்றுக்கொள்",
    heroTitle2:     "தேர்ச்சி",
    heroItalic:     "சிங்களம்",
    heroDesc:       "சிறப்பாக வடிவமைக்கப்பட்ட ஏழு விளையாட்டுகள் — முதலில் எழுத்துக்கள், பிறகு வார்த்தைகள். விளையாட்டின் மூலம் அடையாளம், எழுத்துப்பிழை மற்றும் நம்பிக்கையை வளர்க்கவும்.",
    quickPlay:      "விரைவு விளையாட்டு →",
    tryPuzzle:      "எழுத்து புதிரை முயற்சி செய்",
    chooseGame:     "உங்கள் விளையாட்டைத் தேர்ந்தெடுக்கவும்",
    chooseDesc:     "இரண்டு திறன் நிலைகளில் எட்டு விளையாட்டுகள் — முதலில் எழுத்துக்கள், பிறகு வார்த்தைகள்",
    letterGames:    "எழுத்து விளையாட்டுகள்",
    wordGames:      "வார்த்தை விளையாட்டுகள்",
    newLabel:       "புதியது",
    yourProgress:   "உங்கள் முன்னேற்றம்",
    progressDesc:   "அனைத்து விளையாட்டுகளிலும் முன்னேற்றத்தை கண்காணிக்கவும்",
    totalScore:     "மொத்த மதிப்பெண்",
    starsEarned:    "பெற்ற நட்சத்திரங்கள்",
    badges:         "பதக்கங்கள்",
    scoreTrend:     "மதிப்பெண் போக்கு",
    last7:          "கடைசி 7 அமர்வுகள்",
    achievTitle:    "சாதனைகள் திறக்கப்பட்டன",
    masterTitle:    "மாஸ்டர் கற்பவர்",
    masterDesc:     "500+ புள்ளிகள் சம்பாதித்தார்",
    activeToday:    "இன்று செயலில்",
    gamesAvail:     "8 விளையாட்டுகள் கிடைக்கின்றன",
    wordGamesLabel: "வார்த்தை விளையாட்டுகள்: கட்டமைப்பு · குழப்பம் · காணாமல் போன · கோடு இணைப்பு",
    bestScore:      "சிறந்த மதிப்பெண்",
    diffLabel:      "சிரமம்",
    diffValue:      "எளிது — நடுத்தரம்",
    lettersLabel:   "உள்ளடக்கிய எழுத்துக்கள்",
    play:           "விளையாடு",
    pts:            "புள்.",
    moodHistory:    "மனநிலை வரலாறு",
    recentMood:     "சமீபத்திய எதிர்வினைகள்",
    difficulty: { Easy: "எளிது", Medium: "நடுத்தரம்", Hard: "கடினம்" },
    tags: { Pairs: "ஜோடிகள்", Timed: "நேரம்", Search: "தேடல்", Puzzle: "புதிர்", Build: "கட்டமைப்பு", Fill: "நிரப்பு", Match: "பொருத்தம்" },
  },
};

// ─── RESULT SCREEN TRANSLATIONS ───────────────────────────────────
const RESULT_TRANSLATIONS = {
  en: {
    results:      "Results",
    playAgain:    "Play Again →",
    excellent:    "Excellent Work",
    wellDone:     "Well Done",
    keepPract:    "Keep Practicing",
    pointsEarned: "points earned",
    time:         "Time",
    moves:        "Moves",
    answered:     "Answered",
    allGames:     "← All Games",
    scanReaction: "📷 Scan My Reaction",
    yourReaction: "Your Reaction",
    confidence:   "Confidence",
    saveReaction: "Save Reaction",
    skipReaction: "skip →",
    scanTitle:    "How did that feel?",
    loadingModels:"Loading face detection...",
    cameraReady:  "Camera ready — look at the screen!",
    scanning:     "Scanning your reaction...",
    reactionDone: "Reaction captured!",
    cameraError:  "Camera error. Please allow camera access.",
    close:        "Close",
    detectedExpr: "Detected expression",
  },
  si: {
    results:      "ප්‍රතිඵල",
    playAgain:    "නැවත ක්‍රීඩා කරන්න →",
    excellent:    "විශිෂ්ට කාර්යය",
    wellDone:     "ශාබාෂ්",
    keepPract:    "පුහුණු වෙමින් සිටින්න",
    pointsEarned: "ලකුණු ලබා ගත්තා",
    time:         "කාලය",
    moves:        "ගමන්",
    answered:     "පිළිතුරු දුන්නා",
    allGames:     "← සියලු ක්‍රීඩා",
    scanReaction: "📷 ප්‍රතික්‍රියාව scan කරන්න",
    yourReaction: "ඔබේ ප්‍රතික්‍රියාව",
    confidence:   "නිරවද්‍යතාව",
    saveReaction: "ප්‍රතික්‍රියාව සුරකින්න",
    skipReaction: "මඟ හරිනවා →",
    scanTitle:    "ඔබට කොහොමද දැනෙන්නේ?",
    loadingModels:"Face detection load වෙනවා...",
    cameraReady:  "Camera සූදානම් — screen එක බලන්න!",
    scanning:     "ඔබේ ප්‍රතික්‍රියාව scan වෙනවා...",
    reactionDone: "ප්‍රතික්‍රියාව ලැබුණා!",
    cameraError:  "Camera error. Camera access allow කරන්න.",
    close:        "වසන්න",
    detectedExpr: "හඳුනාගත් ප්‍රතික්‍රියාව",
  },
  ta: {
    results:      "முடிவுகள்",
    playAgain:    "மீண்டும் விளையாடு →",
    excellent:    "சிறந்த வேலை",
    wellDone:     "நன்றாக செய்தீர்கள்",
    keepPract:    "தொடர்ந்து பயிற்சி செய்யுங்கள்",
    pointsEarned: "புள்ளிகள் சம்பாதித்தது",
    time:         "நேரம்",
    moves:        "நகர்வுகள்",
    answered:     "பதிலளித்தது",
    allGames:     "← அனைத்து விளையாட்டுகள்",
    scanReaction: "📷 எதிர்வினையை ஸ்கேன் செய்யவும்",
    yourReaction: "உங்கள் எதிர்வினை",
    confidence:   "நம்பகத்தன்மை",
    saveReaction: "எதிர்வினையை சேமிக்கவும்",
    skipReaction: "தவிர் →",
    scanTitle:    "எப்படி உணர்கிறீர்கள்?",
    loadingModels:"முக கண்டறிதல் ஏற்றுகிறது...",
    cameraReady:  "கேமரா தயார் — திரையைப் பாருங்கள்!",
    scanning:     "உங்கள் எதிர்வினையை ஸ்கேன் செய்கிறது...",
    reactionDone: "எதிர்வினை கைப்பற்றப்பட்டது!",
    cameraError:  "கேமரா பிழை. கேமரா அணுகலை அனுமதிக்கவும்.",
    close:        "மூடு",
    detectedExpr: "கண்டறியப்பட்ட வெளிப்பாடு",
  },
};

// ─── EXPRESSION MAP ───────────────────────────────────────────────
const EXPRESSION_MAP = {
  happy:     { emoji: "😄", si: "සතුටුයි",    ta: "மகிழ்ச்சி",   en: "Happy" },
  surprised: { emoji: "😮", si: "පුදුමයි",    ta: "ஆச்சரியம்",   en: "Surprised" },
  neutral:   { emoji: "😐", si: "සාමාන්‍යයි", ta: "சாதாரணம்",    en: "Neutral" },
  sad:       { emoji: "😢", si: "දුකයි",       ta: "சோகம்",       en: "Sad" },
  angry:     { emoji: "😠", si: "තරහයි",      ta: "கோபம்",       en: "Angry" },
  fearful:   { emoji: "😨", si: "බියයි",       ta: "பயம்",        en: "Fearful" },
  disgusted: { emoji: "🤢", si: "පිළිකුලයි",  ta: "வெறுப்பு",    en: "Disgusted" },
};

// ─── INLINE ICONS ─────────────────────────────────────────────────
const Ico = ({ d, size = 20, fill = "none", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const TrophyIco   = ({ s = 20 }) => <Ico size={s} d={["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.34","M14 14.66V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.34","M18 2H6v7a6 6 0 0 0 12 0V2z"]} />;
const StarIco     = ({ s = 20, fill = "none" }) => <Ico size={s} fill={fill} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />;
const ZapIco      = ({ s = 20 }) => <Ico size={s} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />;
const TargetIco   = ({ s = 20 }) => <Ico size={s} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"]} />;
const BrainIco    = ({ s = 48 }) => <Ico size={s} d={["M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.66z","M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.66z"]} />;
const GiftIco     = ({ s = 48 }) => <Ico size={s} d={["M20 12v10H4V12","M2 7h20v5H2z","M12 22V7","M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z","M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"]} />;
const PuzzleIco   = ({ s = 48 }) => <Ico size={s} d="M20.5 10a2.5 2.5 0 0 1-2.5-2.5V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z" />;
const ChevronIco  = ({ s = 16, up = false }) => <Ico size={s} d={up ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />;
const Gamepad2Ico = ({ s = 64 }) => <Ico size={s} d={["M6 11l4-4 4 4","M14 13l4 4-4 4","M6 13l-4 4 4 4","M10 11l4 4-4 4","M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"]} />;
const TypeIco     = ({ s = 48 }) => <Ico size={s} d={["M4 7V4h16v3","M9 20h6","M12 4v16"]} />;
const KeyIco      = ({ s = 48 }) => <Ico size={s} d={["M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"]} />;
const LinkIco     = ({ s = 48 }) => <Ico size={s} d={["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71","M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"]} />;

// ─── MAX SCORES ───────────────────────────────────────────────────
const MAX_SCORES = {
  "memory-match"  : 120,
  "speed-quiz"    : 150,
  "letter-hunt"   : 200,
  "letter-puzzle" : 250,
  "word-builder"  : 360,
  "missing-letter": 360,
  "line-connect"  : 360,
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

// ─── SINHALA LETTERS DATA ─────────────────────────────────────────
const LETTER_CATEGORIES = [
  { name: "ස්වර (Vowels)", color: "#e11d48", letters: [{ letter: "අ", name: "අ", sound: "a" },{ letter: "ආ", name: "ආ", sound: "aa" },{ letter: "ඇ", name: "ඇ", sound: "ae" },{ letter: "ඈ", name: "ඈ", sound: "aee" },{ letter: "ඉ", name: "ඉ", sound: "i" },{ letter: "ඊ", name: "ඊ", sound: "ii" },{ letter: "උ", name: "උ", sound: "u" },{ letter: "ඌ", name: "ඌ", sound: "uu" },{ letter: "එ", name: "එ", sound: "e" },{ letter: "ඒ", name: "ඒ", sound: "ee" },{ letter: "ඓ", name: "ඓ", sound: "ai" },{ letter: "ඔ", name: "ඔ", sound: "o" },{ letter: "ඕ", name: "ඕ", sound: "oo" },{ letter: "ඖ", name: "ඖ", sound: "au" }] },
  { name: "ක වර්ගය", color: "#7c3aed", letters: [{ letter: "ක", name: "ක", sound: "ka" },{ letter: "ඛ", name: "ඛ", sound: "kha" },{ letter: "ග", name: "ග", sound: "ga" },{ letter: "ඝ", name: "ඝ", sound: "gha" },{ letter: "ඞ", name: "ඞ", sound: "nga" }] },
  { name: "ච වර්ගය", color: "#0891b2", letters: [{ letter: "ච", name: "ච", sound: "cha" },{ letter: "ඡ", name: "ඡ", sound: "chha" },{ letter: "ජ", name: "ජ", sound: "ja" },{ letter: "ඣ", name: "ඣ", sound: "jha" },{ letter: "ඤ", name: "ඤ", sound: "nya" }] },
  { name: "ප වර්ගය", color: "#b45309", letters: [{ letter: "ප", name: "ප", sound: "pa" },{ letter: "ඵ", name: "ඵ", sound: "pha" },{ letter: "බ", name: "බ", sound: "ba" },{ letter: "භ", name: "භ", sound: "bha" },{ letter: "ම", name: "ම", sound: "ma" }] },
  { name: "අවර්ගීය", color: "#be185d", letters: [{ letter: "ය", name: "ය", sound: "ya" },{ letter: "ර", name: "ර", sound: "ra" },{ letter: "ල", name: "ල", sound: "la" },{ letter: "ව", name: "ව", sound: "va" },{ letter: "ස", name: "ස", sound: "sa" },{ letter: "හ", name: "හ", sound: "ha" }] },
];

const SINHALA_LETTERS = LETTER_CATEGORIES.flatMap(cat => cat.letters.map(l => ({ ...l, category: cat.name })));
const SINHALA_FONT = "'Noto Sans Sinhala','Iskoola Pota',serif";

// ─── SINHALA WORDS ────────────────────────────────────────────────
const SINHALA_WORDS = [
  { word: "අම්මා", meaning: "Mother",   syllables: ["අ","ම්","මා"],      emoji: "👩" },
  { word: "තාත්තා", meaning: "Father",  syllables: ["තා","ත්","තා"],     emoji: "👨" },
  { word: "ගෙදර",  meaning: "Home",    syllables: ["ගෙ","ද","ර"],       emoji: "🏠" },
  { word: "පාසල",  meaning: "School",  syllables: ["පා","ස","ල"],       emoji: "🏫" },
  { word: "මල",   meaning: "Flower",  syllables: ["ම","ල"],             emoji: "🌸" },
  { word: "ගල",    meaning: "Stone",   syllables: ["ග","ල"],            emoji: "🪨" },
  { word: "කාලය",  meaning: "Time",    syllables: ["කා","ල","ය"],       emoji: "⏰" },
  { word: "වල",    meaning: "Well",    syllables: ["ව","ල"],            emoji: "🕳️" },
  { word: "නලාව",  meaning: "Flute",   syllables: ["න","ලා","ව"],       emoji: "🪈" },
  { word: "ඇස",    meaning: "Eye",     syllables: ["ඇ","ස"],            emoji: "👁️" },
  { word: "කන",    meaning: "Ear",     syllables: ["ක","න"],            emoji: "👂" },
  { word: "දිය",   meaning: "Water",   syllables: ["දි","ය"],           emoji: "💧" },
  { word: "ගස",    meaning: "Tree",    syllables: ["ග","ස"],            emoji: "🌳" },
  { word: "බලය",   meaning: "Power",   syllables: ["බ","ල","ය"],        emoji: "⚡" },
  { word: "රට",    meaning: "Country", syllables: ["ර","ට"],            emoji: "🗺️" },
  { word: "කිරි",  meaning: "Milk",    syllables: ["කි","රි"],          emoji: "🥛" },
  { word: "මාළු",  meaning: "Fish",    syllables: ["මා","ළු"],          emoji: "🐟" },
  { word: "හාවා",  meaning: "Rabbit",  syllables: ["හා","වා"],          emoji: "🐰" },
  { word: "කෑම",   meaning: "Food",    syllables: ["කෑ","ම"],           emoji: "🍚" },
  { word: "සඳ",    meaning: "Moon",    syllables: ["ස","ඳ"],            emoji: "🌙" },
];

const shuffle  = (arr) => [...arr].sort(() => Math.random() - 0.5);
const randFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN    = (arr, n) => shuffle(arr).slice(0, n);

// ═══════════════════════════════════════════════════════════════════
// FACE REACTION SCANNER
// ═══════════════════════════════════════════════════════════════════
// autoStart=true  → game play wakathama floating mini overlay
//   - camera open wela thiyenawa game puranthama
//   - continuously best expression track karanawa (frame count naha)
//   - gameEnded=true wuna gaman immediately best captured expression deliver karala close wenawa
// autoStart=false → result screen eke modal (existing behavior)
function FaceReactionScanner({ onResult, onClose, lang = "en", autoStart = false, gameEnded = false }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);
  const cdRef       = useRef(null);

  const [status,      setStatus]      = useState("loading");
  const [modelsReady, setModelsReady] = useState(false);
  const [detected,    setDetected]    = useState(null);
  const [countdown,   setCountdown]   = useState(3);
  const [framesDone,  setFramesDone]  = useState(0);
  const [minimized,   setMinimized]   = useState(false);

  // autoStart mode: game maddedi continuously best expression track karanawa
  const bestExpressionRef = useRef({ name: "neutral", score: 0 });
  const TOTAL_FRAMES      = 20; // normal mode (autoStart=false) eke use wenawa

  const t = RESULT_TRANSLATIONS[lang] ?? RESULT_TRANSLATIONS.en;

  // ── Load face-api models ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        if (!cancelled) setModelsReady(true);
      } catch (err) {
        console.error("Model load failed:", err);
        if (!cancelled) setStatus("error");
      }
    };
    load();
    return () => {
      cancelled = true;
      stopAll();
    };
  }, []);

  // ── Start camera once models ready ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!modelsReady) return;
    startCamera();
  }, [modelsReady]);

  // ── gameEnded=true wuna gaman best captured expression immediately deliver karala close wenawa ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!autoStart || !gameEnded || !modelsReady) return;
    // Monitoring interval stop karanawa
    clearInterval(intervalRef.current);
    const best   = bestExpressionRef.current;
    const mapped = EXPRESSION_MAP[best.name] ?? EXPRESSION_MAP.neutral;
    // UI te show karanawa
    setDetected({ name: best.name, score: best.score });
    setStatus("done");
    stopCamera();
    // Result deliver karala 2s delay ekaka passse close wenawa
    onResult({ ...mapped, rawName: best.name, confidence: best.score });
    setTimeout(() => onClose(), 2000);
  }, [gameEnded, autoStart, modelsReady]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setStatus("ready");
          if (autoStart) {
            // autoStart mode: camera ready wenakota continuous monitoring start karanawa
            startContinuousMonitoring();
          } else {
            beginCountdown();
          }
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setStatus("error");
    }
  };

  // autoStart mode: game puranthama continuously best expression track karanawa (passive)
  // Frame count naha — gameEnded=true wuna gaman immediately deliver karanawa
  const startContinuousMonitoring = () => {
    setStatus("ready");
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const result = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 })
          )
          .withFaceExpressions();

        if (result) {
          const exprs         = result.expressions;
          const top           = Object.entries(exprs).sort((a, b) => b[1] - a[1])[0];
          const [name, score] = top;
          // Best expression update karanawa (game purantha)
          if (score > bestExpressionRef.current.score) {
            bestExpressionRef.current = { name, score };
          }
        }
      } catch (err) {
        // silent — next frame
      }
    }, 100);
  };

  const beginCountdown = () => {
    let c = 3;
    setCountdown(c);
    cdRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(cdRef.current);
        startScanning();
      }
    }, 1000);
  };

  // Normal mode (autoStart=false) scan logic — unchanged
  const startScanning = () => {
    setStatus("scanning");
    let bestExpression = "neutral";
    let bestScore      = 0;
    let frames         = 0;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const result = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 })
          )
          .withFaceExpressions();

        if (result) {
          if (canvasRef.current) {
            faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
            const resized = faceapi.resizeResults(result, {
              width: canvasRef.current.width,
              height: canvasRef.current.height,
            });
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            const box = resized.detection.box;
            ctx.strokeStyle = "#22c55e";
            ctx.lineWidth   = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          }

          const exprs   = result.expressions;
          const top     = Object.entries(exprs).sort((a, b) => b[1] - a[1])[0];
          const [name, score] = top;

          if (score > bestScore) {
            bestScore      = score;
            bestExpression = name;
          }

          frames += 1;
          setFramesDone(frames);

          if (frames >= TOTAL_FRAMES) {
            clearInterval(intervalRef.current);
            const detectedResult = { name: bestExpression, score: bestScore };
            setDetected(detectedResult);
            setStatus("done");
            stopCamera();
          }
        }
      } catch (err) {
        // silent
      }
    }, 100);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const stopAll = () => {
    clearInterval(intervalRef.current);
    clearInterval(cdRef.current);
    stopCamera();
  };

  const handleClose = () => { stopAll(); onClose(); };

  const handleSave = () => {
    stopAll();
    if (detected) {
      const mapped = EXPRESSION_MAP[detected.name] ?? EXPRESSION_MAP.neutral;
      onResult({ ...mapped, rawName: detected.name, confidence: detected.score });
    }
    onClose();
  };

  const expr        = detected ? (EXPRESSION_MAP[detected.name] ?? EXPRESSION_MAP.neutral) : null;
  // progressPct — only used in normal mode (autoStart=false) scan progress bar
  const progressPct = Math.round((framesDone / TOTAL_FRAMES) * 100);

  const exprLabel = expr
    ? (lang === "si" ? expr.si : lang === "ta" ? expr.ta : expr.en)
    : "";

  // ══════════════════════════════════════════════════════════════
  // AUTO-START MODE — Floating mini overlay
  // Game play puranthama camera live thiynawa. gameEnded=true wuna
  // gaman captured best reaction show karala close wenawa.
  // ══════════════════════════════════════════════════════════════
  if (autoStart) {
    return (
      <div style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
        pointerEvents: "none",
      }}>
        {/* Minimize/expand button */}
        <button
          onClick={() => setMinimized(m => !m)}
          style={{
            pointerEvents: "auto",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
          title={minimized ? "Show camera" : "Hide camera"}
        >
          {minimized ? "📷" : "−"}
        </button>

        {!minimized && (
          <div style={{
            pointerEvents: "auto",
            background: "#111",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
            width: 200,
            border: "2px solid #333",
          }}>
            {/* Camera feed */}
            <div style={{ position: "relative", height: 150, background: "#000" }}>
              <video
                ref={videoRef}
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                  display: "block",
                }}
              />

              {status === "loading" && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "#111",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <div style={{
                    width: 24, height: 24,
                    border: "2px solid #333",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}/>
                  <p style={{ color: "#9ca3af", fontSize: 11, fontFamily: "DM Sans, sans-serif" }}>
                    {t.loadingModels}
                  </p>
                </div>
              )}

              {status === "done" && expr && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.75)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  animation: "scaleIn 0.4s cubic-bezier(.22,1,.36,1) both",
                }}>
                  <span style={{ fontSize: 40 }}>{expr.emoji}</span>
                  <p style={{ color: "#fff", fontWeight: "bold", fontSize: 14, marginTop: 4, fontFamily: "Playfair Display, serif" }}>
                    {exprLabel}
                  </p>
                  <p style={{ color: "#22c55e", fontSize: 11, marginTop: 2, fontFamily: "DM Sans, sans-serif" }}>
                    {Math.round((detected?.score ?? 0) * 100)}% {t.confidence}
                  </p>
                </div>
              )}

              {status === "error" && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "#7f1d1d",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: 12, gap: 4,
                }}>
                  <span style={{ fontSize: 24 }}>📷</span>
                  <p style={{ color: "#fca5a5", fontSize: 10, textAlign: "center", fontFamily: "DM Sans, sans-serif" }}>
                    {t.cameraError}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom status bar */}
            <div style={{ padding: "8px 12px" }}>
              {/* Game running — camera ready, just show live indicator */}
              {status === "ready" && !gameEnded && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#22c55e",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}/>
                  <p style={{ color: "#9ca3af", fontSize: 10, fontFamily: "DM Sans, sans-serif" }}>
                    {t.cameraReady}
                  </p>
                </div>
              )}

              {status === "loading" && (
                <p style={{ color: "#9ca3af", fontSize: 10, fontFamily: "DM Sans, sans-serif", textAlign: "center" }}>
                  {t.loadingModels}
                </p>
              )}
              {status === "done" && (
                <p style={{ color: "#22c55e", fontSize: 10, fontFamily: "DM Sans, sans-serif", textAlign: "center" }}>
                  ✓ {t.reactionDone}
                </p>
              )}
              {status === "error" && (
                <button
                  onClick={handleClose}
                  style={{
                    width: "100%", background: "transparent",
                    border: "1px solid #333", color: "#9ca3af",
                    borderRadius: 8, padding: "4px 0", fontSize: 10,
                    cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {t.close}
                </button>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
          @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        `}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // NORMAL MODE — Result screen eke full modal (unchanged)
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.80)",
      zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl"
        style={{ width: 360, maxWidth: "94vw" }}>

        <div style={{ background: "#111", color: "#fff" }}
          className="px-6 py-4 flex items-center justify-between">
          <span className="font-body text-sm font-medium">{t.scanTitle}</span>
          <button onClick={handleClose}
            className="font-body text-xs transition-colors"
            style={{ color: "#9ca3af" }}
            onMouseOver={e => e.target.style.color="#fff"}
            onMouseOut={e => e.target.style.color="#9ca3af"}>
            {t.close} ✕
          </button>
        </div>

        <div className="relative bg-gray-900"
          style={{ height: 240, overflow: "hidden" }}>

          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: "scaleX(-1)" }}
          />

          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "#111" }}>
              <div style={{
                width: 32, height: 32, border: "3px solid #333",
                borderTop: "3px solid #fff", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}/>
              <p className="font-body text-sm" style={{ color: "#9ca3af" }}>{t.loadingModels}</p>
            </div>
          )}

          {status === "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(0,0,0,0.55)" }}>
              <p className="font-body text-sm mb-3" style={{ color: "#d1d5db" }}>{t.cameraReady}</p>
              <span className="font-display font-bold" style={{ fontSize: 72, color: "#fff", lineHeight: 1 }}>
                {countdown}
              </span>
            </div>
          )}

          {status === "done" && expr && (
            <div className="absolute inset-0 flex flex-col items-center justify-center anim-scale-in"
              style={{ background: "rgba(0,0,0,0.72)" }}>
              <span style={{ fontSize: 72 }}>{expr.emoji}</span>
              <p className="font-display font-bold mt-2" style={{ color: "#fff", fontSize: 22 }}>
                {exprLabel}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-3"
              style={{ background: "#7f1d1d" }}>
              <span style={{ fontSize: 36 }}>📷</span>
              <p className="font-body text-sm text-center" style={{ color: "#fca5a5" }}>{t.cameraError}</p>
            </div>
          )}
        </div>

        {status === "scanning" && (
          <div className="px-5 py-3 border-b border-gray-100" style={{ background: "#f9fafb" }}>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "#e5e7eb" }}>
                <div className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${progressPct}%`, background: "#111" }}/>
              </div>
              <span className="font-body text-xs" style={{ color: "#9ca3af", minWidth: 32 }}>
                {progressPct}%
              </span>
            </div>
            <p className="font-body text-xs mt-1" style={{ color: "#9ca3af" }}>{t.scanning}</p>
          </div>
        )}

        <div className="px-6 py-5">
          {status === "done" && expr ? (
            <div>
              <div className="flex items-center gap-4 mb-4 p-4 rounded-2xl border border-gray-100"
                style={{ background: "#f9fafb" }}>
                <span style={{ fontSize: 40 }}>{expr.emoji}</span>
                <div className="flex-1">
                  <p className="font-body text-xs uppercase tracking-wider mb-0.5"
                    style={{ color: "#9ca3af" }}>{t.detectedExpr}</p>
                  <p className="font-display font-bold" style={{ fontSize: 20 }}>{exprLabel}</p>
                </div>
                <div className="text-right">
                  <p className="font-body text-xs mb-0.5" style={{ color: "#9ca3af" }}>{t.confidence}</p>
                  <p className="font-display font-bold" style={{ fontSize: 16 }}>
                    {Math.round((detected?.score ?? 0) * 100)}%
                  </p>
                </div>
              </div>
              <button onClick={handleSave}
                className="font-body w-full py-3 rounded-2xl text-sm transition-all"
                style={{ background: "#111", color: "#fff" }}
                onMouseOver={e => e.currentTarget.style.background="#333"}
                onMouseOut={e => e.currentTarget.style.background="#111"}>
                {t.saveReaction}
              </button>
            </div>
          ) : status === "error" ? (
            <button onClick={handleClose}
              className="font-body w-full border border-gray-200 py-3 rounded-2xl text-sm"
              style={{ color: "#6b7280" }}>
              {t.close}
            </button>
          ) : (
            <p className="font-body text-xs text-center py-1" style={{ color: "#d1d5db" }}>
              {status === "loading" ? t.loadingModels : t.cameraReady}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME WRAPPER
// ─────────────────────────────────────────────────────────────────
// Game start wenakota camera open wenawa (autoStart floating overlay).
// Game iwara wuna passse (signalGameEnd() call wenakota) gameEnded=true
// wenawa — scanner eka final scan 20 frames karala result deliver
// karala close wenawa. Intermediate frames count wenawa na.
// ═══════════════════════════════════════════════════════════════════
function GameWithAutoCamera({ children, onReaction, lang }) {
  const [showScanner,      setShowScanner]      = useState(true);
  const [gameEnded,        setGameEnded]        = useState(false);
  const [captured,         setCaptured]         = useState(false);
  const capturedReactionRef = useRef(null);

  const handleResult = useCallback((reaction) => {
    setCaptured(true);
    capturedReactionRef.current = reaction;  // reaction store karanawa — ResultScreen eka pass karanawa
    onReaction && onReaction(reaction);
  }, [onReaction]);

  const handleClose = useCallback(() => {
    setShowScanner(false);
  }, []);

  // Game component eka call karana callback — game end wena witama call karanawa
  const signalGameEnd = useCallback(() => {
    if (!captured) setGameEnded(true);
  }, [captured]);

  // children render prop: signalGameEnd AND capturedReactionRef pass karanawa
  // Game eke ResultScreen eka capturedReactionRef.current use karanawa
  const renderedChildren = typeof children === "function"
    ? children({ signalGameEnd, capturedReactionRef })
    : children;

  return (
    <>
      {renderedChildren}
      {showScanner && !captured && (
        <FaceReactionScanner
          lang={lang}
          autoStart={true}
          gameEnded={gameEnded}
          onResult={handleResult}
          onClose={handleClose}
        />
      )}
    </>
  );
}

// ─── RESULT SCREEN ────────────────────────────────────────────────
function ResultScreen({ score, maxScore, time, moves, questionCount, onRetry, onBack, onReaction, lang = "en", capturedReaction = null }) {
  const t   = RESULT_TRANSLATIONS[lang] ?? RESULT_TRANSLATIONS.en;
  const pct   = Math.round((score / Math.max(maxScore, 1)) * 100);
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
  const msg   = pct >= 80 ? t.excellent : pct >= 50 ? t.wellDone : t.keepPract;

  const [savedReaction, setSavedReaction] = useState(capturedReaction ?? null);

  useEffect(() => {
    if (capturedReaction) setSavedReaction(capturedReaction);
  }, [capturedReaction]);

  const reactionLabel = savedReaction
    ? (lang === "si" ? savedReaction.si : lang === "ta" ? savedReaction.ta : savedReaction.en)
    : "";

  return (
    <div className="max-w-lg mx-auto px-6 py-20 pt-24 anim-scale-in">
      <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-2xl">
        <div className="bg-black text-white px-8 py-5 flex items-center justify-between">
          <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{t.results}</span>
          <button onClick={onRetry} className="font-body text-xs text-gray-400 hover:text-white transition-colors">{t.playAgain}</button>
        </div>

        <div className="p-10 text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="black" strokeWidth="8"
                strokeDasharray={`${pct * 2.64} 264`} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)" }}/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-3xl font-bold">{pct}%</span>
            </div>
          </div>

          <h3 className="font-display text-3xl font-bold mb-2">{msg}</h3>

          <div className="flex justify-center gap-2 my-4">
            {[0,1,2].map(i => (
              <svg key={i} viewBox="0 0 24 24" className="w-8 h-8 transition-all duration-500"
                fill={i < stars ? "#111" : "#e5e7eb"} style={{ transitionDelay: `${i * 120}ms` }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
              </svg>
            ))}
          </div>

          <div className="font-display text-6xl font-bold mb-1">{score}</div>
          <div className="font-body text-sm text-gray-400 mb-6">{t.pointsEarned}</div>

          <div className="flex gap-3 text-center text-xs text-gray-400 font-body justify-center mb-6">
            {time          !== undefined && <span className="border border-gray-100 rounded-xl px-4 py-2"><span className="block font-display text-xl text-black">{time}s</span>{t.time}</span>}
            {moves         !== undefined && <span className="border border-gray-100 rounded-xl px-4 py-2"><span className="block font-display text-xl text-black">{moves}</span>{t.moves}</span>}
            {questionCount !== undefined && <span className="border border-gray-100 rounded-xl px-4 py-2"><span className="block font-display text-xl text-black">{questionCount}</span>{t.answered}</span>}
          </div>

          {savedReaction && (
            <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border border-gray-100 bg-gray-50 anim-scale-in">
              <span style={{ fontSize: 36 }}>{savedReaction.emoji}</span>
              <div className="text-left">
                <p className="font-body text-xs text-gray-400 uppercase tracking-wider">{t.yourReaction}</p>
                <p className="font-display text-lg font-bold">{reactionLabel}</p>
              </div>
              {savedReaction.confidence && (
                <div className="ml-auto text-right">
                  <p className="font-body text-xs text-gray-400">{t.confidence}</p>
                  <p className="font-display text-sm font-bold">{Math.round(savedReaction.confidence * 100)}%</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onRetry}
              className="font-body flex-1 bg-black text-white py-3 rounded-2xl text-sm hover:bg-gray-900 transition-all hover:shadow-lg">
              {t.playAgain}
            </button>
            <button onClick={onBack}
              className="font-body flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl text-sm hover:border-black hover:text-black transition-all">
              {t.allGames}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 1 — MEMORY MATCH
// ═══════════════════════════════════════════════════════════════════
function MemoryMatchGame({ letters, onComplete, onBack, lang, onReaction }) {
  const PAIRS = 6;
  const makeCards = () => {
    const chosen = pickN(letters, PAIRS);
    return shuffle([
      ...chosen.map((l, i) => ({ uid: `L${i}`, type: "letter", content: l.letter, matchId: i })),
      ...chosen.map((l, i) => ({ uid: `N${i}`, type: "name",   content: l.name,   matchId: i })),
    ]);
  };
  const [cards, setCards]         = useState(makeCards);
  const [flipped, setFlipped]     = useState([]);
  const [matched, setMatched]     = useState(new Set());
  const [moves, setMoves]         = useState(0);
  const [score, setScore]         = useState(0);
  const [timer, setTimer]         = useState(0);
  const [done, setDone]           = useState(false);
  const [wrongPair, setWrongPair] = useState([]);
  const capturedReactionRef = useRef(null);
  const lockRef = useRef(false);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [done]);

  const handleClick = (idx, signalGameEnd) => {
    if (lockRef.current) return;
    const card = cards[idx];
    if (flipped.includes(idx) || matched.has(card.matchId) || flipped.length === 2) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);
      const [a, b] = next;
      if (cards[a].matchId === cards[b].matchId) {
        const newMatched = new Set([...matched, cards[a].matchId]);
        setMatched(newMatched); setScore(s => s + 20); setFlipped([]); lockRef.current = false;
        if (newMatched.size === PAIRS) {
          // Game end — camera signal
          signalGameEnd && signalGameEnd();
          setTimeout(() => { setDone(true); onComplete(score + 20); }, 900);
        }
      } else {
        setWrongPair([a, b]);
        setTimeout(() => { setFlipped([]); setWrongPair([]); lockRef.current = false; }, 1000);
      }
    }
  };

  const restart = () => {
    setCards(makeCards()); setFlipped([]); setMatched(new Set());
    setMoves(0); setScore(0); setTimer(0); setDone(false); setWrongPair([]);
    capturedReactionRef.current = null;
    lockRef.current = false;
  };

  const handleAutoReaction = useCallback((reaction) => {
    capturedReactionRef.current = reaction;
    onReaction && onReaction(reaction);
  }, [onReaction]);

  if (done) return (
    <ResultScreen
      score={score} maxScore={PAIRS*20} time={timer} moves={moves}
      onRetry={restart} onBack={onBack} lang={lang}
      onReaction={onReaction}
      capturedReaction={capturedReactionRef.current}
    />
  );

  const gameLabels = {
    en: { back: "← Back", title: "Memory Match", hint: `Match each letter with its name — find all ${PAIRS} pairs` },
    si: { back: "← ආපසු", title: "මතක ගැලපීම", hint: `සෑම අකුරක්ම එහි නමට ගලපන්න — යුගල ${PAIRS}ක් සොයන්න` },
    ta: { back: "← பின்னால்", title: "நினைவக பொருத்தம்", hint: `ஒவ்வொரு எழுத்தையும் அதன் பெயரோடு பொருத்துங்கள் — ${PAIRS} ஜோடிகள் கண்டுபிடிக்கவும்` },
  };
  const gl = gameLabels[lang] ?? gameLabels.en;

  return (
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang}>
      {({ signalGameEnd }) => (
        <div className="min-h-screen bg-white pt-16">
          <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
              <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors flex items-center gap-2">{gl.back}</button>
              <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span>
              <div className="flex gap-5 font-body text-sm">
                <span className="text-gray-400">{timer}s</span>
                <span className="text-gray-400">{moves} {lang === "si" ? "ගමන්" : lang === "ta" ? "நகர்வுகள்" : "moves"}</span>
                <span className="font-semibold">{score} {lang === "si" ? "ල." : lang === "ta" ? "புள்." : "pts"}</span>
              </div>
            </div>
          </div>
          <div className="max-w-3xl mx-auto px-6 py-10">
            <p className="font-body text-center text-gray-400 text-sm mb-8">{gl.hint}</p>
            <div className="grid grid-cols-4 gap-4">
              {cards.map((card, idx) => {
                const isFlipped = flipped.includes(idx) || matched.has(card.matchId);
                const isMatched = matched.has(card.matchId);
                const isWrong   = wrongPair.includes(idx);
                return (
                  <button key={card.uid} onClick={() => handleClick(idx, signalGameEnd)}
                    style={isFlipped ? { fontFamily: SINHALA_FONT } : {}}
                    className={`rounded-2xl shadow-sm cursor-pointer transition-all duration-300 select-none flex items-center justify-center border
                      ${card.type === "letter" ? "aspect-square" : "h-20"}
                      ${isMatched ? "bg-black text-white border-black scale-95 cursor-default" :
                        isWrong   ? "bg-gray-100 text-red-500 border-red-200" :
                        isFlipped ? "bg-black text-white border-black scale-105 shadow-xl" :
                                    "bg-white hover:scale-105 hover:shadow-lg border-gray-100 hover:border-gray-300"}`}>
                    {isFlipped
                      ? <span className={`font-bold ${card.type === "letter" ? "text-4xl" : "text-base leading-tight px-2 text-center"}`}>{card.content}</span>
                      : <span className="text-gray-200 font-display text-2xl">?</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 2 — SPEED QUIZ
// ═══════════════════════════════════════════════════════════════════
function SpeedQuizGame({ letters, onComplete, onBack, lang, onReaction }) {
  const TOTAL_Q = 10, Q_TIME = 10;
  const makeQ = useCallback(() => {
    const correct = randFrom(letters);
    const opts = shuffle([correct, ...pickN(letters.filter(l => l.letter !== correct.letter), 3)]);
    return { correct, options: opts.map(l => l.name) };
  }, [letters]);

  const [q, setQ]               = useState(() => makeQ());
  const [qNum, setQNum]         = useState(1);
  const [score, setScore]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(Q_TIME);
  const [answered, setAnswered] = useState(null);
  const [done, setDone]         = useState(false);
  const [ansCount, setAnsCount] = useState(0);
  const capturedReactionRef = useRef(null);
  const timerRef    = useRef(null);
  const signalRef   = useRef(null); // signalGameEnd ref store karanawa

  const next = useCallback((signal) => {
    if (qNum >= TOTAL_Q) {
      // Last question — signal game end
      signal && signal();
      setTimeout(() => setDone(true), 300);
      return;
    }
    setQ(makeQ()); setQNum(n => n + 1); setAnswered(null); setTimeLeft(Q_TIME);
  }, [qNum, makeQ]);

  useEffect(() => {
    if (done || answered !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setAnswered("__timeout__");
          setAnsCount(c => c+1);
          setTimeout(() => next(signalRef.current), 800);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [q, answered, done, next]);

  const answer = (opt, signal) => {
    clearInterval(timerRef.current); setAnswered(opt); setAnsCount(c => c+1);
    if (opt === q.correct.name) setScore(s => s + (timeLeft >= 7 ? 15 : timeLeft >= 4 ? 10 : 5));
    setTimeout(() => next(signal), 800);
  };

  const restart = () => {
    setQ(makeQ()); setQNum(1); setScore(0); setTimeLeft(Q_TIME);
    setAnswered(null); setDone(false); setAnsCount(0); capturedReactionRef.current = null;
  };

  const handleAutoReaction = useCallback((reaction) => {
    capturedReactionRef.current = reaction;
    onReaction && onReaction(reaction);
  }, [onReaction]);

  const gameLabels = {
    en: { back: "← Back", title: "Speed Quiz", question: "What is the name of this letter?" },
    si: { back: "← ආපසු", title: "වේග ප්‍රශ්නාවලිය", question: "මෙම අකුරේ නම කුමක්ද?" },
    ta: { back: "← பின்னால்", title: "வேக வினாடி வினா", question: "இந்த எழுத்தின் பெயர் என்ன?" },
  };
  const gl = gameLabels[lang] ?? gameLabels.en;

  if (done) return (
    <ResultScreen
      score={score} maxScore={TOTAL_Q*15} questionCount={ansCount}
      onRetry={restart} onBack={onBack} lang={lang}
      onReaction={onReaction}
      capturedReaction={capturedReactionRef.current}
    />
  );

  const timePct = (timeLeft / Q_TIME) * 100;
  return (
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang}>
      {({ signalGameEnd }) => {
        // signalRef update karanawa — timeout handler use wenata
        signalRef.current = signalGameEnd;
        return (
          <div className="min-h-screen bg-white pt-16">
            <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button>
                <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span>
                <div className="flex gap-5 font-body text-sm">
                  <span className={timeLeft <= 4 ? "text-red-500 font-semibold" : "text-gray-400"}>{timeLeft}s</span>
                  <span className="font-semibold">{score} {lang === "si" ? "ල." : lang === "ta" ? "புள்." : "pts"}</span>
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto px-6 py-10">
              <div className="flex items-center gap-3 mb-8">
                <span className="font-body text-xs text-gray-400">{qNum} / {TOTAL_Q}</span>
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${(qNum / TOTAL_Q) * 100}%` }}/>
                </div>
              </div>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-8">
                <div className="h-1 rounded-full transition-all duration-1000" style={{ width: `${timePct}%`, background: timePct > 60 ? "#111" : timePct > 30 ? "#f59e0b" : "#ef4444" }}/>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-gray-50 px-8 py-12 text-center mb-8">
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-4">{gl.question}</p>
                <div className="font-display" style={{ fontFamily: SINHALA_FONT, fontSize: 96, lineHeight: 1, color: "#111" }}>{q.correct.letter}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {q.options.map((opt, i) => {
                  let cls = "border-gray-100 bg-white text-gray-800 hover:border-gray-300 hover:shadow-md";
                  if (answered !== null) {
                    if (opt === q.correct.name) cls = "border-black bg-black text-white shadow-lg scale-[1.02]";
                    else if (opt === answered)  cls = "border-red-200 bg-red-50 text-red-600";
                    else                        cls = "border-gray-100 bg-gray-50 text-gray-300";
                  }
                  return (
                    <button key={i} onClick={() => answer(opt, signalGameEnd)} disabled={answered !== null}
                      style={{ fontFamily: SINHALA_FONT }}
                      className={`${cls} border-2 font-bold text-2xl py-6 rounded-2xl transition-all duration-200 disabled:cursor-default`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 3 — LETTER HUNT
// ═══════════════════════════════════════════════════════════════════
function LetterHuntGame({ letters, onComplete, onBack, lang, onReaction }) {
  const TOTAL_ROUNDS = 5, ROUND_TIME = 15;
  const makeRound = useCallback(() => {
    const target = randFrom(letters);
    const targetCount = 3 + Math.floor(Math.random() * 3);
    const grid = [];
    for (let i = 0; i < targetCount; i++) grid.push({ ...target, isTarget: true, id: `t${i}`, found: false });
    const others = letters.filter(l => l.letter !== target.letter);
    while (grid.length < 16) grid.push({ ...randFrom(others), isTarget: false, id: `o${grid.length}`, found: false });
    return { target, grid: shuffle(grid), targetCount };
  }, [letters]);

  const [round, setRound]       = useState(0);
  const [data, setData]         = useState(() => makeRound());
  const [score, setScore]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [done, setDone]         = useState(false);
  const [flash, setFlash]       = useState(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const capturedReactionRef = useRef(null);
  const signalRef = useRef(null);

  const advanceRound = useCallback((signal) => {
    if (round + 1 >= TOTAL_ROUNDS) {
      signal && signal();
      setTimeout(() => setDone(true), 300);
      return;
    }
    setRound(r => r+1); setData(makeRound()); setTimeLeft(ROUND_TIME); setRoundComplete(false);
  }, [round, makeRound]);

  useEffect(() => {
    if (done || roundComplete) return;
    const id = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(id); advanceRound(signalRef.current); return 0; }
      return t-1;
    }), 1000);
    return () => clearInterval(id);
  }, [round, roundComplete, done, advanceRound]);

  const handleClick = (cell, signalGameEnd) => {
    if (cell.found) return;
    if (cell.isTarget) {
      setData(prev => ({ ...prev, grid: prev.grid.map(c => c.id===cell.id ? {...c,found:true} : c) }));
      setScore(s => s+10); setFlash("correct"); setTimeout(() => setFlash(null), 400);
      const remaining = data.grid.filter(c => c.isTarget && !c.found && c.id !== cell.id);
      if (remaining.length === 0) {
        setRoundComplete(true);
        setTimeout(() => advanceRound(signalGameEnd), 900);
      }
    } else { setScore(s => Math.max(0, s-3)); setFlash("wrong"); setTimeout(() => setFlash(null), 400); }
  };

  const restart = () => {
    setRound(0); setData(makeRound()); setScore(0); setTimeLeft(ROUND_TIME);
    setDone(false); setRoundComplete(false); capturedReactionRef.current = null;
  };

  const handleAutoReaction = useCallback((reaction) => {
    capturedReactionRef.current = reaction;
    onReaction && onReaction(reaction);
  }, [onReaction]);

  const gameLabels = {
    en: { back: "← Back", title: "Letter Hunt", findAll: "Find all of this letter", found: "Found", roundComplete: "Round Complete — Loading next…" },
    si: { back: "← ආපසු", title: "අකුරු සෙවීම", findAll: "මෙම අකුරේ සියල්ල සොයන්න", found: "හමු විය", roundComplete: "වාරය සම්පූර්ණ — මීළඟ පූරණය…" },
    ta: { back: "← பின்னால்", title: "எழுத்து வேட்டை", findAll: "இந்த எழுத்தை எல்லாம் கண்டுபிடிக்கவும்", found: "கண்டுபிடிக்கப்பட்டது", roundComplete: "சுற்று முடிந்தது — அடுத்தது ஏற்றுகிறது…" },
  };
  const gl = gameLabels[lang] ?? gameLabels.en;

  if (done) return (
    <ResultScreen
      score={score} maxScore={TOTAL_ROUNDS*40}
      onRetry={restart} onBack={onBack} lang={lang}
      onReaction={onReaction}
      capturedReaction={capturedReactionRef.current}
    />
  );

  const found = data.grid.filter(c => c.isTarget && c.found).length;
  const timePct = (timeLeft / ROUND_TIME) * 100;

  return (
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang}>
      {({ signalGameEnd }) => {
        signalRef.current = signalGameEnd;
        return (
          <div className="min-h-screen bg-white pt-16">
            <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button>
                <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span>
                <div className="flex gap-5 font-body text-sm">
                  <span className="text-gray-400">{lang === "si" ? "වාරය" : lang === "ta" ? "சுற்று" : "Round"} {round+1}/{TOTAL_ROUNDS}</span>
                  <span className={timeLeft <= 5 ? "text-red-500 font-semibold" : "text-gray-400"}>{timeLeft}s</span>
                  <span className="font-semibold">{score} {lang === "si" ? "ල." : lang === "ta" ? "புள்." : "pts"}</span>
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto px-6 py-8">
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-6">
                <div className="h-1 rounded-full transition-all duration-1000" style={{ width: `${timePct}%`, background: timePct > 50 ? "#111" : timePct > 25 ? "#f59e0b" : "#ef4444" }}/>
              </div>
              <div className={`bg-gray-50 rounded-3xl border p-6 mb-6 flex items-center gap-6 transition-all duration-200 ${flash === "correct" ? "border-black" : flash === "wrong" ? "border-red-200" : "border-gray-100"}`}>
                <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center text-4xl font-bold flex-shrink-0"
                  style={{ fontFamily: SINHALA_FONT }}>{data.target.letter}</div>
                <div>
                  <p className="font-body text-xs text-gray-400 mb-1 uppercase tracking-wider">{gl.findAll}</p>
                  <p className="font-display text-2xl font-bold" style={{ fontFamily: SINHALA_FONT }}>{data.target.name}</p>
                  <p className="font-body text-sm text-gray-400 mt-1">{gl.found}: {found} / {data.targetCount}</p>
                </div>
                <div className="ml-auto text-right font-body text-xs text-gray-300">
                  <p>+10 correct</p><p className="text-red-300">−3 wrong</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {data.grid.map(cell => (
                  <button key={cell.id} onClick={() => handleClick(cell, signalGameEnd)} disabled={cell.found}
                    style={{ fontFamily: SINHALA_FONT }}
                    className={`aspect-square rounded-2xl text-3xl font-bold transition-all hover:scale-105 border
                      ${cell.found ? "bg-black text-white border-black scale-95 cursor-default" : "bg-white text-gray-800 hover:shadow-md border-gray-100 hover:border-gray-300"}`}>
                    {cell.found ? "✓" : cell.letter}
                  </button>
                ))}
              </div>
              {roundComplete && (
                <div className="mt-6 text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="font-display text-xl font-bold">{gl.roundComplete}</p>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 4 — LETTER PUZZLE
// ═══════════════════════════════════════════════════════════════════
const TILE = 120;

function buildPuzzle(letterObj, color) {
  return {
    letter: letterObj.letter,
    name: `${letterObj.letter} — ${letterObj.sound}`,
    color,
    gridCols: 2, gridRows: 2,
    pieces: [
      { id: "tl", label: "top-left",     gridCol: 1, gridRow: 1, gridColSpan: 1, gridRowSpan: 1, clip: [0,   0,   100, 100] },
      { id: "tr", label: "top-right",    gridCol: 2, gridRow: 1, gridColSpan: 1, gridRowSpan: 1, clip: [100, 0,   100, 100] },
      { id: "bl", label: "bottom-left",  gridCol: 1, gridRow: 2, gridColSpan: 1, gridRowSpan: 1, clip: [0,   100, 100, 100] },
      { id: "br", label: "bottom-right", gridCol: 2, gridRow: 2, gridColSpan: 1, gridRowSpan: 1, clip: [100, 100, 100, 100] },
    ],
  };
}

function LetterTile({ letter, color, clip, tileW, tileH, opacity = 1 }) {
  const [cx, cy, cw, ch] = clip;
  return (
    <svg width={tileW} height={tileH} viewBox={`${cx} ${cy} ${cw} ${ch}`} style={{ display: "block" }}>
      <text x="100" y="155" textAnchor="middle" fontSize="160" fontFamily={SINHALA_FONT} fill={color} fontWeight="900" opacity={opacity}>{letter}</text>
    </svg>
  );
}

function DragGhost({ piece, letter, color, x, y }) {
  if (!piece) return null;
  const tileW = TILE * piece.gridColSpan;
  const tileH = TILE * piece.gridRowSpan;
  return (
    <div style={{
      position: "fixed", left: x - tileW / 2, top: y - tileH / 2,
      width: tileW, height: tileH, borderRadius: 14,
      border: `2px solid ${color}88`, background: `${color}22`,
      pointerEvents: "none", zIndex: 9999, opacity: 0.85,
      overflow: "hidden", transform: "scale(1.08)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    }}>
      <LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH}/>
    </div>
  );
}

function PieceTile({ piece, letter, color, isDragging, onPointerDown }) {
  const tileW = TILE * piece.gridColSpan, tileH = TILE * piece.gridRowSpan;
  return (
    <div onPointerDown={onPointerDown} className="hover-lift"
      style={{ width: tileW, height: tileH, borderRadius: 14, border: `2px solid ${color}44`,
        background: `${color}11`, cursor: "grab", opacity: isDragging ? 0.3 : 1,
        overflow: "hidden", userSelect: "none", flexShrink: 0, touchAction: "none" }}>
      <LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH}/>
    </div>
  );
}

function SlotTile({ piece, letter, color, filled, slotRef, isWrong }) {
  const tileW = TILE * piece.gridColSpan, tileH = TILE * piece.gridRowSpan;
  return (
    <div ref={slotRef} data-slot-id={piece.id}
      style={{ width: tileW, height: tileH, borderRadius: 14, position: "relative", overflow: "hidden",
        border: filled ? `2px solid ${color}88` : isWrong ? "2px solid #fca5a5" : "2px dashed #e5e7eb",
        background: filled ? `${color}11` : isWrong ? "#fef2f2" : "#f9fafb", transition: "all 0.3s" }}>
      <LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH} opacity={filled ? 1 : 0.1}/>
      {!filled && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: 20, color: "#d1d5db", fontWeight: "bold" }}>?</span>
        </div>
      )}
      {filled && (
        <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%",
          background: "#111", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: "white", pointerEvents: "none" }}>✓</div>
      )}
    </div>
  );
}

function LetterPuzzleGame({ onBack, onComplete, lang, onReaction }) {
  const defaultLetter = LETTER_CATEGORIES[0].letters[0];
  const defaultColor  = LETTER_CATEGORIES[0].color;
  const [selectedLetter, setSelectedLetter] = useState(defaultLetter);
  const [currentColor, setCurrentColor]     = useState(defaultColor);
  const [pz, setPz]                         = useState(() => buildPuzzle(defaultLetter, defaultColor));
  const [score, setScore]                   = useState(0);
  const [pool, setPool]                     = useState([]);
  const [placed, setPlaced]                 = useState({});
  const [dragging, setDragging]             = useState(null);
  const [ghostPos, setGhostPos]             = useState({ x: 0, y: 0 });
  const [celebrating, setCelebrating]       = useState(false);
  const [completedLetters, setCompleted]    = useState(new Set());
  const [mistakes, setMistakes]             = useState(0);
  const [timer, setTimer]                   = useState(0);
  const [wrongSlot, setWrongSlot]           = useState(null);
  const [openCat, setOpenCat]               = useState(0);
  const capturedReactionRef = useRef(null);
  const timerRef   = useRef(null);
  const slotRefs   = useRef({});
  const signalRef  = useRef(null);

  const initPuzzle = useCallback((letterObj, color) => {
    const newPz = buildPuzzle(letterObj, color);
    setPz(newPz); setPool(shuffle(newPz.pieces.map(p => p.id)));
    setPlaced({}); setCelebrating(false); setMistakes(0); setTimer(0); setWrongSlot(null);
  }, []);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (celebrating) return;
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [pz, celebrating]);

  const handleSelectLetter = (letterObj, catColor) => {
    setSelectedLetter(letterObj); setCurrentColor(catColor); initPuzzle(letterObj, catColor);
  };

  const handlePointerDown = useCallback((pid, e) => {
    e.preventDefault();
    const piece = pz.pieces.find(p => p.id === pid);
    setDragging({ pid, piece });
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setGhostPos({ x: clientX, y: clientY });
  }, [pz.pieces]);

  const getSlotUnderPointer = useCallback((clientX, clientY) => {
    const els = document.elementsFromPoint(clientX, clientY);
    for (const el of els) { const sid = el.dataset?.slotId; if (sid) return sid; }
    return null;
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setGhostPos({ x: clientX, y: clientY });
  }, [dragging]);

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return;
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const slotId  = getSlotUnderPointer(clientX, clientY);
    if (slotId) {
      if (dragging.pid === slotId) {
        setPlaced(prev => {
          const newPlaced = { ...prev, [slotId]: true };
          const earned = Math.max(5, 25 - mistakes * 4);
          setScore(s => s + earned);
          if (Object.keys(newPlaced).length === pz.pieces.length) {
            clearInterval(timerRef.current); setCelebrating(true);
            setCompleted(c => new Set([...c, pz.letter]));
            // Signal game end when puzzle complete
            signalRef.current && signalRef.current();
            onComplete && onComplete(earned);
          }
          return newPlaced;
        });
        setPool(p => p.filter(id => id !== dragging.pid));
      } else {
        setMistakes(m => m + 1); setWrongSlot(slotId);
        setTimeout(() => setWrongSlot(null), 700);
      }
    }
    setDragging(null);
  }, [dragging, getSlotUnderPointer, mistakes, pz.pieces.length, pz.letter, onComplete]);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup",   handlePointerUp);
    window.addEventListener("touchmove",   handlePointerMove, { passive: false });
    window.addEventListener("touchend",    handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup",   handlePointerUp);
      window.removeEventListener("touchmove",   handlePointerMove);
      window.removeEventListener("touchend",    handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  const handleAutoReaction = useCallback((reaction) => {
    capturedReactionRef.current = reaction;
    onReaction && onReaction(reaction);
  }, [onReaction]);

  const gameLabels = {
    en: { back: "← Back", title: "Letter Puzzle", done: "done", mistakes: "mistakes", selectLetter: "Select Letter", complete: "complete", dragHint: "Drag pieces onto matching slots", allPlaced: "All placed!", hint: "Hint", resetPuzzle: "Reset Puzzle", nextHint: "Pick the next letter →" },
    si: { back: "← ආපසු", title: "අකුරු ප්‍රහේලිකාව", done: "සම්පූර්ණ", mistakes: "වැරදි", selectLetter: "අකුර තෝරන්න", complete: "සම්පූර්ණ", dragHint: "කෑලි ගලපන ස්ථානයට ඇදගන්න", allPlaced: "සියල්ල තැබිණ!", hint: "ඉඟිය", resetPuzzle: "ප්‍රහේලිකාව නැවත සකසන්න", nextHint: "ඊළඟ අකුර තෝරන්න →" },
    ta: { back: "← பின்னால்", title: "எழுத்து புதிர்", done: "முடிந்தது", mistakes: "தவறுகள்", selectLetter: "எழுத்து தேர்ந்தெடு", complete: "முடிந்தது", dragHint: "துண்டுகளை பொருத்தமான இடங்களில் இழுக்கவும்", allPlaced: "அனைத்தும் வைக்கப்பட்டன!", hint: "குறிப்பு", resetPuzzle: "புதிரை மீட்டமை", nextHint: "அடுத்த எழுத்தை தேர்ந்தெடுக்கவும் →" },
  };
  const gl = gameLabels[lang] ?? gameLabels.en;
  const boardW = pz.gridCols * TILE, boardH = pz.gridRows * TILE;

  return (
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang}>
      {({ signalGameEnd }) => {
        signalRef.current = signalGameEnd;
        return (
          <div className="min-h-screen bg-white pt-16" style={{ touchAction: "none" }}>
            {dragging && <DragGhost piece={dragging.piece} letter={pz.letter} color={currentColor} x={ghostPos.x} y={ghostPos.y}/>}
            <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
              <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button>
                <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span>
                <div className="flex gap-5 font-body text-sm">
                  <span className="text-gray-400">{completedLetters.size} {gl.done}</span>
                  <span className="text-gray-400">{timer}s</span>
                  <span className={mistakes > 0 ? "text-red-500" : "text-gray-400"}>{mistakes} {gl.mistakes}</span>
                  <span className="font-semibold">{score} {lang === "si" ? "ල." : lang === "ta" ? "புள்." : "pts"}</span>
                </div>
              </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6" style={{ alignItems: "flex-start" }}>
              <div className="w-52 flex-shrink-0 rounded-3xl border border-gray-100 overflow-hidden" style={{ maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
                <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
                  <p className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.selectLetter}</p>
                  <p className="font-body text-xs text-gray-400 mt-1">{completedLetters.size}/{SINHALA_LETTERS.length} {gl.complete}</p>
                </div>
                <div style={{ overflowY: "auto", flex: 1, paddingBottom: 8 }}>
                  {LETTER_CATEGORIES.map((cat, ci) => (
                    <div key={ci}>
                      <button onClick={() => setOpenCat(openCat === ci ? -1 : ci)}
                        className="w-full px-4 py-2.5 flex items-center justify-between border-b border-gray-50 font-body text-xs font-semibold transition-all"
                        style={{ background: openCat === ci ? "#f9fafb" : "white", color: openCat === ci ? "#111" : "#9ca3af" }}>
                        <span>{cat.name}</span><ChevronIco s={12} up={openCat === ci}/>
                      </button>
                      {openCat === ci && (
                        <div className="flex flex-wrap gap-1.5 p-3">
                          {cat.letters.map((l, li) => {
                            const isSel  = selectedLetter?.letter === l.letter;
                            const isDone = completedLetters.has(l.letter);
                            return (
                              <button key={li} onClick={() => handleSelectLetter(l, cat.color)}
                                style={{ fontFamily: SINHALA_FONT,
                                  border: isSel ? `2px solid ${cat.color}` : isDone ? "2px solid #22c55e" : "1px solid #e5e7eb",
                                  background: isSel ? `${cat.color}15` : isDone ? "#f0fdf4" : "white",
                                  color: isSel ? cat.color : isDone ? "#16a34a" : "#374151",
                                  transform: isSel ? "scale(1.1)" : "scale(1)" }}
                                className="w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all relative">
                                {l.letter}
                                {isDone && <span style={{ position: "absolute", top: -3, right: -3, width: 9, height: 9, background: "#22c55e", borderRadius: "50%", fontSize: 6, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                <div className="text-center">
                  <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-2">{gl.dragHint}</p>
                  <div className="font-bold mb-1" style={{ fontFamily: SINHALA_FONT, fontSize: 64, color: currentColor, lineHeight: 1 }}>{pz.letter}</div>
                  <p className="font-body text-sm text-gray-400">{pz.name}</p>
                  {celebrating && <p className="font-display text-lg font-bold mt-2" style={{ color: currentColor }}>{lang === "si" ? "සම්පූර්ණයි!" : lang === "ta" ? "முடிந்தது!" : "Complete!"} {gl.nextHint}</p>}
                </div>
                <div className="flex gap-8 items-start justify-center flex-wrap">
                  <div className="flex flex-col items-center gap-3">
                    <p className="font-body text-xs text-gray-400 uppercase tracking-widest">{lang === "si" ? "එකලස් කිරීමේ බෝඩ්" : lang === "ta" ? "கூட்டு பலகை" : "Assembly Board"}</p>
                    <div className={`rounded-3xl border p-4 transition-all ${celebrating ? "border-black bg-gray-50" : "border-gray-100 bg-gray-50"}`}>
                      {celebrating ? (
                        <div className="anim-scale-in flex items-center justify-center" style={{ width: boardW, height: boardH }}>
                          <svg width={boardW} height={boardH} viewBox="0 0 200 200">
                            <text x="100" y="155" textAnchor="middle" fontSize="160" fontFamily={SINHALA_FONT} fill={currentColor} fontWeight="900">{pz.letter}</text>
                          </svg>
                        </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: `repeat(${pz.gridCols}, ${TILE}px)`, gridTemplateRows: `repeat(${pz.gridRows}, ${TILE}px)`, gap: 4 }}>
                          {pz.pieces.map(slot => (
                            <div key={slot.id} style={{ gridColumn: `${slot.gridCol}/span ${slot.gridColSpan}`, gridRow: `${slot.gridRow}/span ${slot.gridRowSpan}` }}>
                              <SlotTile piece={slot} letter={pz.letter} color={currentColor} filled={!!placed[slot.id]} isWrong={wrongSlot === slot.id} slotRef={el => { slotRefs.current[slot.id] = el; }}/>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 flex-1 min-w-52">
                    <p className="font-body text-xs text-gray-400 uppercase tracking-widest text-center">{lang === "si" ? "අකුරු කෑලි" : lang === "ta" ? "எழுத்து துண்டுகள்" : "Letter Pieces"}</p>
                    <div className="bg-gray-50 rounded-3xl border border-gray-100 p-4 min-h-36 flex flex-wrap gap-3 justify-center items-center">
                      {celebrating ? (
                        <div className="text-center py-2">
                          <div className="font-display text-2xl font-bold mb-1">{lang === "si" ? "සම්පූර්ණයි!" : lang === "ta" ? "முடிந்தது!" : "Complete!"}</div>
                          <p className="font-body text-xs text-gray-400">{lang === "si" ? "පැති ෙප්ලෙන් තෝරන්න" : lang === "ta" ? "பக்கப்பட்டியில் இருந்து தேர்வு செய்யவும்" : "Pick another from sidebar"}</p>
                        </div>
                      ) : pool.length === 0 ? (
                        <div className="text-center py-2"><p className="font-display text-lg font-bold">{gl.allPlaced}</p></div>
                      ) : pool.map(pid => {
                        const piece = pz.pieces.find(p => p.id === pid);
                        return <PieceTile key={pid} piece={piece} letter={pz.letter} color={currentColor} isDragging={dragging?.pid === pid} onPointerDown={(e) => handlePointerDown(pid, e)}/>;
                      })}
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4 text-center bg-gray-50">
                      <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-2">{gl.hint}</p>
                      <div className="mx-auto" style={{ width: 80, height: 80 }}>
                        <svg width={80} height={80} viewBox="10 10 180 180">
                          <text x="100" y="155" textAnchor="middle" fontSize="160" fontFamily={SINHALA_FONT} fill={currentColor} fontWeight="900" opacity="0.6">{pz.letter}</text>
                        </svg>
                      </div>
                    </div>
                    <button onClick={() => initPuzzle(selectedLetter, currentColor)}
                      className="font-body w-full border border-gray-200 text-gray-500 py-2.5 rounded-xl text-xs hover:border-gray-400 hover:text-black transition-all">
                      {gl.resetPuzzle}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 5 — WORD BUILDER
// ═══════════════════════════════════════════════════════════════════
function WordBuilderGame({ onComplete, onBack, lang, onReaction }) {
  const TOTAL = 8;
  const makeRound = useCallback(() => {
    const word = SINHALA_WORDS[Math.floor(Math.random() * SINHALA_WORDS.length)];
    const allSyllables = SINHALA_WORDS.flatMap(w => w.syllables);
    const decoys = shuffle(allSyllables.filter(s => !word.syllables.includes(s))).slice(0, 2);
    const pool = shuffle([
      ...word.syllables.map((s, i) => ({ id: `c${i}`, text: s, correct: true, correctIdx: i })),
      ...decoys.map((s, i) => ({ id: `d${i}`, text: s, correct: false, correctIdx: -1 })),
    ]);
    return { word, pool, slots: Array(word.syllables.length).fill(null) };
  }, []);

  const [round, setRound]         = useState(0);
  const [data, setData]           = useState(() => makeRound());
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);
  const [, setShake]              = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [wrongSlot, setWrongSlot] = useState(null);
  const [usedIds, setUsedIds]     = useState(new Set());
  const [dragging, setDragging]   = useState(null);
  const capturedReactionRef = useRef(null);
  const isDraggingRef             = useRef(false);
  const [ghostPos, setGhostPos]   = useState({ x: 0, y: 0 });
  const slotRefs  = useRef({});
  const signalRef = useRef(null);

  const advanceRound = useCallback((signal) => {
    if (round + 1 >= TOTAL) {
      signal && signal();
      setTimeout(() => setDone(true), 300);
      return;
    }
    setRound(r => r + 1); setData(makeRound()); setCelebrate(false);
    setUsedIds(new Set()); setWrongSlot(null);
  }, [round, makeRound]);

  const resolveDropAt = useCallback((clientX, clientY, signal) => {
    if (!isDraggingRef.current || celebrate) return;
    const currentDrag = isDraggingRef.current;
    const els = document.elementsFromPoint(clientX, clientY);
    let droppedSlotIdx = null;
    for (const el of els) { const idx = el.dataset?.slotIdx; if (idx !== undefined) { droppedSlotIdx = parseInt(idx, 10); break; } }
    if (droppedSlotIdx === null) { setDragging(null); isDraggingRef.current = null; return; }
    if (currentDrag.correctIdx === droppedSlotIdx) {
      setData(d => { const newSlots = [...d.slots]; newSlots[droppedSlotIdx] = currentDrag.text; return { ...d, slots: newSlots }; });
      setUsedIds(prev => new Set([...prev, currentDrag.id]));
      setScore(s => s + 15);
      setTimeout(() => {
        setData(d => {
          if (d.slots.every(s => s !== null)) {
            setCelebrate(true);
            setTimeout(() => advanceRound(signal), 1200);
          }
          return d;
        });
      }, 0);
    } else {
      setWrongSlot(droppedSlotIdx); setShake(true); setScore(s => Math.max(0, s - 3));
      setTimeout(() => { setShake(false); setWrongSlot(null); }, 600);
    }
    setDragging(null); isDraggingRef.current = null;
  }, [celebrate, advanceRound]);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    if (e.cancelable) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setGhostPos({ x: clientX, y: clientY });
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    resolveDropAt(clientX, clientY, signalRef.current);
  }, [resolveDropAt]);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup",   handlePointerUp);
    window.addEventListener("touchmove",   handlePointerMove, { passive: false });
    window.addEventListener("touchend",    handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup",   handlePointerUp);
      window.removeEventListener("touchmove",   handlePointerMove);
      window.removeEventListener("touchend",    handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  const handlePiecePointerDown = (piece, e) => {
    if (usedIds.has(piece.id) || celebrate) return;
    e.preventDefault();
    isDraggingRef.current = piece;
    setDragging(piece);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setGhostPos({ x: clientX, y: clientY });
  };

  const restart = () => {
    setRound(0); setData(makeRound()); setScore(0); setDone(false);
    setCelebrate(false); setUsedIds(new Set()); setWrongSlot(null);
    setDragging(null); isDraggingRef.current = null; capturedReactionRef.current = null;
  };

  const handleAutoReaction = useCallback((reaction) => {
    capturedReactionRef.current = reaction;
    onReaction && onReaction(reaction);
  }, [onReaction]);

  const gameLabels = {
    en: { back: "← Back", title: "Word Builder", buildWord: "Build this word", dragHint: "Drag the correct syllables in order", correct: "නිවැරදියි! ✓", scoreHint: "+15 correct · −3 wrong placement" },
    si: { back: "← ආපසු", title: "වචන ගොඩනැගිල්ල", buildWord: "මෙම වචනය ගොඩනගන්න", dragHint: "නිවැරදි සිලේබල් ඇදගෙන අනුපිළිවෙලට තබන්න", correct: "නිවැරදියි! ✓", scoreHint: "+15 නිවැරදි · −3 වැරදි ස්ථානය" },
    ta: { back: "← பின்னால்", title: "வார்த்தை கட்டமைப்பாளர்", buildWord: "இந்த வார்த்தையை கட்டுங்கள்", dragHint: "சரியான எழுத்துக்களை வரிசையாக இழுக்கவும்", correct: "சரி! ✓", scoreHint: "+15 சரி · −3 தவறான இடம்" },
  };
  const gl = gameLabels[lang] ?? gameLabels.en;

  if (done) return (
    <ResultScreen
      score={score} maxScore={TOTAL * 45}
      onRetry={restart} onBack={onBack} lang={lang}
      onReaction={onReaction}
      capturedReaction={capturedReactionRef.current}
    />
  );
  const progress = (round / TOTAL) * 100;

  return (
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang}>
      {({ signalGameEnd }) => {
        signalRef.current = signalGameEnd;
        return (
          <div className="min-h-screen bg-white pt-16">
            {dragging && (
              <div style={{ position: "fixed", left: ghostPos.x - 36, top: ghostPos.y - 36, width: 72, height: 72, borderRadius: 16,
                border: "2px solid #111", background: "#111", color: "white", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 26, fontFamily: SINHALA_FONT, fontWeight: "bold",
                pointerEvents: "none", zIndex: 9999, opacity: 0.9, transform: "scale(1.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
                {dragging.text}
              </div>
            )}
            <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button>
                <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span>
                <div className="flex gap-5 font-body text-sm">
                  <span className="text-gray-400">{round + 1}/{TOTAL}</span>
                  <span className="font-semibold">{score} {lang === "si" ? "ල." : lang === "ta" ? "புள்." : "pts"}</span>
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto px-6 py-10">
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-10">
                <div className="h-1 bg-black rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
              </div>
              <div className={`rounded-3xl border bg-gray-50 p-8 text-center mb-8 transition-all duration-300 ${celebrate ? "border-black bg-black" : "border-gray-100"}`}>
                <div className="text-6xl mb-3">{data.word.emoji}</div>
                <p className={`font-body text-xs uppercase tracking-widest mb-1 ${celebrate ? "text-gray-400" : "text-gray-400"}`}>{gl.buildWord}</p>
                <p className={`font-display text-2xl font-bold mb-1 ${celebrate ? "text-white" : "text-black"}`}>{data.word.meaning}</p>
                {celebrate && <p className="font-body text-sm text-gray-300 mt-2 anim-fade-up">{gl.correct} — {data.word.word}</p>}
              </div>
              <div className="flex gap-3 justify-center mb-10">
                {data.word.syllables.map((_, slotIdx) => {
                  const filled  = data.slots[slotIdx];
                  const isWrong = wrongSlot === slotIdx;
                  return (
                    <div key={slotIdx} ref={el => { slotRefs.current[slotIdx] = el; }} data-slot-idx={slotIdx}
                      className={`flex-1 min-w-0 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center
                        ${filled ? "border-black bg-black text-white" : isWrong ? "border-red-300 bg-red-50" : "border-dashed border-gray-200 bg-white"}`}
                      style={{ height: 80 }}>
                      {filled ? <span className="font-bold text-3xl" style={{ fontFamily: SINHALA_FONT }}>{filled}</span>
                              : <span className="font-body text-xs text-gray-300">{slotIdx + 1}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mb-4">
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest text-center mb-5">{gl.dragHint}</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  {data.pool.map(piece => {
                    const isUsed     = usedIds.has(piece.id);
                    const isDragging = dragging?.id === piece.id;
                    return (
                      <div key={piece.id} onPointerDown={e => handlePiecePointerDown(piece, e)}
                        className={`select-none transition-all duration-200 rounded-2xl border-2 flex items-center justify-center font-bold
                          ${isUsed ? "border-gray-100 bg-gray-50 text-gray-200 cursor-default"
                            : isDragging ? "border-gray-200 bg-gray-50 text-gray-200 opacity-40 cursor-grabbing scale-95"
                            : "border-gray-200 bg-white text-gray-800 cursor-grab hover:border-black hover:shadow-lg hover:-translate-y-1"}`}
                        style={{ width: 72, height: 72, fontSize: 26, fontFamily: SINHALA_FONT, touchAction: isUsed ? "auto" : "none" }}>
                        {isUsed ? "✓" : piece.text}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="font-body text-xs text-center text-gray-300">{gl.scoreHint}</p>
            </div>
          </div>
        );
      }}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 6 — WORD UNSCRAMBLE
// ═══════════════════════════════════════════════════════════════════
function WordUnscrambleGame({ onComplete, onBack, lang, onReaction }) {
  const TOTAL = 10;
  const makeRound = useCallback(() => {
    const word = SINHALA_WORDS[Math.floor(Math.random() * SINHALA_WORDS.length)];
    const scrambled = shuffle([...word.syllables].map((s, i) => ({ id: `s${i}_${Math.random()}`, text: s, origIdx: i })));
    return { word, scrambled, selected: [] };
  }, []);

  const [round, setRound]           = useState(0);
  const [data, setData]             = useState(() => makeRound());
  const [score, setScore]           = useState(0);
  const [done, setDone]             = useState(false);
  const [status, setStatus]         = useState(null);
  const [bonusFlash, setBonusFlash] = useState(null);
  const [timer, setTimer]           = useState(0);
  const capturedReactionRef = useRef(null);
  const timerRef  = useRef(null);
  const signalRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [round]);

  const advanceRound = useCallback((signal) => {
    if (round + 1 >= TOTAL) {
      signal && signal();
      setTimeout(() => setDone(true), 300);
      return;
    }
    setRound(r => r + 1); setData(makeRound()); setStatus(null); setBonusFlash(null); setTimer(0);
  }, [round, makeRound]);

  const handleTile = (tile, signal) => {
    if (status || data.selected.find(s => s.id === tile.id)) return;
    const newSelected = [...data.selected, tile];
    setData(d => ({ ...d, selected: newSelected }));
    if (newSelected.length === data.word.syllables.length) {
      const formed = newSelected.map(s => s.text).join("");
      if (formed === data.word.word) {
        const bonus = Math.max(0, 20 - timer);
        const pts = 20 + bonus;
        setScore(s => s + pts); setStatus("correct"); setBonusFlash(`+${pts}`);
        setTimeout(() => advanceRound(signal), 1000);
      } else {
        setStatus("wrong"); setScore(s => Math.max(0, s - 5));
        setTimeout(() => { setData(d => ({ ...d, selected: [] })); setStatus(null); }, 700);
      }
    }
  };

  const deselect = (tile) => {
    if (status) return;
    setData(d => ({ ...d, selected: d.selected.filter(s => s.id !== tile.id) }));
  };

  const restart = () => {
    setRound(0); setData(makeRound()); setScore(0); setDone(false);
    setStatus(null); setBonusFlash(null); setTimer(0); capturedReactionRef.current = null;
  };

  const handleAutoReaction = useCallback((reaction) => {
    capturedReactionRef.current = reaction;
    onReaction && onReaction(reaction);
  }, [onReaction]);

  const gameLabels = {
    en: { back: "← Back", title: "Word Unscramble", unscramble: "Unscramble to spell", tapHint: "Tap syllables below to build the word", scrambledHint: "Scrambled syllables — tap to place", scoreHint: "+20 base · bonus for speed · −5 wrong order" },
    si: { back: "← ආපසු", title: "වචන ව්‍යාකූලතාව", unscramble: "අකුරු සකසා ලියන්න", tapHint: "පහත සිලේබල් තද කර වචනය ගොඩනගන්න", scrambledHint: "ව්‍යාකූල සිලේබල් — තද කර තබන්න", scoreHint: "+20 මූලික · වේගය සඳහා බෝනස් · −5 වැරදි අනුපිළිවෙල" },
    ta: { back: "← பின்னால்", title: "வார்த்தை குழப்பம்", unscramble: "எழுத்துக்களை சரியாக வரிசைப்படுத்துங்கள்", tapHint: "வார்த்தை கட்ட கீழே உள்ள எழுத்துக்களை தட்டவும்", scrambledHint: "குழப்பமான எழுத்துக்கள் — தட்டி வைக்கவும்", scoreHint: "+20 அடிப்படை · வேகத்திற்கு போனஸ் · −5 தவறான வரிசை" },
  };
  const gl = gameLabels[lang] ?? gameLabels.en;

  if (done) return (
    <ResultScreen
      score={score} maxScore={TOTAL * 30} time={timer}
      onRetry={restart} onBack={onBack} lang={lang}
      onReaction={onReaction}
      capturedReaction={capturedReactionRef.current}
    />
  );
  const progress = (round / TOTAL) * 100;

  return (
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang}>
      {({ signalGameEnd }) => {
        signalRef.current = signalGameEnd;
        return (
          <div className="min-h-screen bg-white pt-16">
            <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button>
                <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span>
                <div className="flex gap-5 font-body text-sm">
                  <span className="text-gray-400">{round + 1}/{TOTAL}</span>
                  <span className="text-gray-400">{timer}s</span>
                  <span className="font-semibold">{score} {lang === "si" ? "ල." : lang === "ta" ? "புள்." : "pts"}</span>
                </div>
              </div>
            </div>
            <div className="max-w-xl mx-auto px-6 py-10">
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-10">
                <div className="h-1 bg-black rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
              </div>
              <div className={`rounded-3xl border p-8 text-center mb-8 transition-all duration-300
                ${status === "correct" ? "border-black bg-black text-white" : status === "wrong" ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="text-5xl mb-3">{data.word.emoji}</div>
                <p className="font-body text-xs uppercase tracking-widest mb-2 text-gray-400">{gl.unscramble}</p>
                <p className={`font-display text-3xl font-bold ${status === "correct" ? "text-white" : status === "wrong" ? "text-red-600" : "text-black"}`}>
                  {data.word.meaning}
                </p>
                {bonusFlash && <div className="mt-3 inline-block font-display text-2xl font-bold text-white anim-fade-up">{bonusFlash} {lang === "si" ? "ල." : lang === "ta" ? "புள்." : "pts"}!</div>}
              </div>
              <div className="mb-2">
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-3 text-center">{lang === "si" ? "ඔබේ පිළිතුර" : lang === "ta" ? "உங்கள் பதில்" : "Your answer"}</p>
                <div className="flex gap-3 justify-center min-h-[72px] items-center flex-wrap">
                  {data.selected.length === 0
                    ? <span className="font-body text-sm text-gray-200">{gl.tapHint}</span>
                    : data.selected.map((tile) => (
                        <button key={tile.id} onClick={() => deselect(tile)}
                          className={`rounded-2xl border-2 flex items-center justify-center font-bold transition-all duration-200
                            ${status === "correct" ? "border-black bg-black text-white cursor-default" :
                              status === "wrong"   ? "border-red-300 bg-red-100 text-red-600 cursor-default" :
                              "border-black bg-black text-white hover:opacity-80 cursor-pointer"}`}
                          style={{ width: 68, height: 68, fontSize: 24, fontFamily: SINHALA_FONT }}>
                          {tile.text}
                        </button>
                      ))
                  }
                </div>
              </div>
              <div className="mt-8">
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-5 text-center">{gl.scrambledHint}</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  {data.scrambled.map(tile => {
                    const isSelected = !!data.selected.find(s => s.id === tile.id);
                    return (
                      <button key={tile.id} onClick={() => handleTile(tile, signalGameEnd)} disabled={isSelected || !!status}
                        className={`rounded-2xl border-2 flex items-center justify-center font-bold transition-all duration-200
                          ${isSelected ? "border-gray-100 bg-gray-50 text-gray-200 cursor-default scale-90"
                            : "border-gray-200 bg-white text-gray-800 hover:border-black hover:shadow-lg hover:-translate-y-1 cursor-pointer active:scale-95"}`}
                        style={{ width: 72, height: 72, fontSize: 26, fontFamily: SINHALA_FONT }}>
                        {tile.text}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="font-body text-xs text-center text-gray-300 mt-8">{gl.scoreHint}</p>
            </div>
          </div>
        );
      }}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 7 — MISSING LETTER
// ═══════════════════════════════════════════════════════════════════
function MissingLetterGame({ letters, onComplete, onBack, lang, onReaction }) {
  const TOTAL = 12;
  const makeQ = useCallback(() => {
    const word     = SINHALA_WORDS[Math.floor(Math.random() * SINHALA_WORDS.length)];
    const blankIdx = Math.floor(Math.random() * word.syllables.length);
    const correct  = word.syllables[blankIdx];
    const wrongs   = shuffle(letters.filter(l => l.letter !== correct)).slice(0, 3).map(l => l.letter);
    const options  = shuffle([correct, ...wrongs]);
    return { word, blankIdx, correct, options };
  }, [letters]);

  const [qNum, setQNum]               = useState(1);
  const [q, setQ]                     = useState(() => makeQ());
  const [score, setScore]             = useState(0);
  const [answered, setAnswered]       = useState(null);
  const [done, setDone]               = useState(false);
  const [streak, setStreak]           = useState(0);
  const [streakFlash, setStreakFlash] = useState(false);
  const capturedReactionRef = useRef(null);
  const signalRef = useRef(null);

  const next = useCallback((signal) => {
    if (qNum >= TOTAL) {
      signal && signal();
      setTimeout(() => setDone(true), 300);
      return;
    }
    setQNum(n => n + 1); setQ(makeQ()); setAnswered(null);
  }, [qNum, makeQ]);

  const answer = (opt, signal) => {
    if (answered) return;
    setAnswered(opt);
    if (opt === q.correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const bonus = newStreak >= 3 ? 10 : 0;
      setScore(s => s + 20 + bonus);
      if (newStreak >= 3) setStreakFlash(true);
    } else {
      setStreak(0); setStreakFlash(false); setScore(s => Math.max(0, s - 5));
    }
    setTimeout(() => { next(signal); setStreakFlash(false); }, 900);
  };

  const restart = () => {
    setQNum(1); setQ(makeQ()); setScore(0); setAnswered(null);
    setDone(false); setStreak(0); setStreakFlash(false); capturedReactionRef.current = null;
  };

  const handleAutoReaction = useCallback((reaction) => {
    capturedReactionRef.current = reaction;
    onReaction && onReaction(reaction);
  }, [onReaction]);

  const gameLabels = {
    en: { back: "← Back", title: "Missing Letter", fillBlank: "fill the missing part", streakBonus: "🔥 Streak Bonus +10!", scoreHint: "+20 correct · +10 bonus on 3× streak · −5 wrong" },
    si: { back: "← ආපසු", title: "අස්ථාන අකුර", fillBlank: "නැතිවූ කොටස පිරවන්න", streakBonus: "🔥 ලකුණු අනුලකුණු +10!", scoreHint: "+20 නිවැරදි · 3× ශ්‍රේණිය +10 · −5 වැරදි" },
    ta: { back: "← பின்னால்", title: "காணாமல் போன எழுத்து", fillBlank: "காணாத பகுதியை நிரப்பவும்", streakBonus: "🔥 தொடர் போனஸ் +10!", scoreHint: "+20 சரி · 3× தொடர் +10 · −5 தவறு" },
  };
  const gl = gameLabels[lang] ?? gameLabels.en;

  if (done) return (
    <ResultScreen
      score={score} maxScore={TOTAL * 30} questionCount={qNum}
      onRetry={restart} onBack={onBack} lang={lang}
      onReaction={onReaction}
      capturedReaction={capturedReactionRef.current}
    />
  );
  const progress = ((qNum - 1) / TOTAL) * 100;

  return (
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang}>
      {({ signalGameEnd }) => {
        signalRef.current = signalGameEnd;
        return (
          <div className="min-h-screen bg-white pt-16">
            <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button>
                <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span>
                <div className="flex gap-4 font-body text-sm items-center">
                  {streak >= 3 && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border border-gray-200 ${streakFlash ? "bg-black text-white border-black" : "text-gray-600"} transition-all duration-300`}>
                      🔥 {streak} streak
                    </span>
                  )}
                  <span className="text-gray-400">{qNum}/{TOTAL}</span>
                  <span className="font-semibold">{score} {lang === "si" ? "ල." : lang === "ta" ? "புள்." : "pts"}</span>
                </div>
              </div>
            </div>
            <div className="max-w-xl mx-auto px-6 py-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-1 bg-black rounded-full transition-all duration-500" style={{ width: `${progress}%` }}/>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-gray-50 px-6 py-10 text-center mb-8">
                <div className="text-5xl mb-4">{q.word.emoji}</div>
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-6">{q.word.meaning} — {gl.fillBlank}</p>
                <div className="flex gap-3 justify-center items-center flex-wrap">
                  {q.word.syllables.map((syl, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {i === q.blankIdx ? (
                        <div className={`rounded-2xl border-2 border-dashed flex items-center justify-center font-bold transition-all duration-300
                          ${answered === null ? "border-gray-300 bg-white" :
                            answered === q.correct ? "border-black bg-black text-white" : "border-red-300 bg-red-50"}`}
                          style={{ width: 72, height: 72, fontSize: 28, fontFamily: SINHALA_FONT }}>
                          {answered !== null ? <span>{answered}</span> : <span className="text-3xl text-gray-200">_</span>}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-gray-200 bg-white flex items-center justify-center font-bold"
                          style={{ width: 72, height: 72, fontSize: 28, fontFamily: SINHALA_FONT, color: "#111" }}>
                          {syl}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {q.options.map((opt, i) => {
                  let cls = "border-gray-100 bg-white text-gray-800 hover:border-gray-300 hover:shadow-md cursor-pointer";
                  if (answered !== null) {
                    if (opt === q.correct)   cls = "border-black bg-black text-white shadow-lg";
                    else if (opt === answered) cls = "border-red-200 bg-red-50 text-red-500";
                    else cls = "border-gray-100 bg-gray-50 text-gray-300 cursor-default";
                  }
                  return (
                    <button key={i} onClick={() => answer(opt, signalGameEnd)} disabled={!!answered}
                      style={{ fontFamily: SINHALA_FONT }}
                      className={`border-2 rounded-2xl py-5 text-3xl font-bold transition-all duration-200 disabled:cursor-default ${cls}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {streakFlash && <div className="text-center anim-fade-up"><span className="font-display text-lg font-bold">{gl.streakBonus}</span></div>}
              <p className="font-body text-xs text-center text-gray-300 mt-4">{gl.scoreHint}</p>
            </div>
          </div>
        );
      }}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 8 — LINE CONNECT
// ═══════════════════════════════════════════════════════════════════
const CONNECT_SETS = [
  { title: "සතා යා කරන්න", hint: "Match each animal to what it does",
    pairs: [
      { left: "හාවා",   right: "පැන පැන යයි", leftMeaning: "Rabbit",   rightMeaning: "Run away" },
      { left: "මාළු",   right: "පිහිනයි",     leftMeaning: "Fish",     rightMeaning: "Swims" },
      { left: "කුකුළා", right: "හඬලයි",       leftMeaning: "Rooster",  rightMeaning: "Crows" },
      { left: "අලියා",  right: "ගමන් කරයි",  leftMeaning: "Elephant", rightMeaning: "Walks" },
      { left: "කපුටා",  right: "පියාඹයි",     leftMeaning: "Crow",     rightMeaning: "Flies" },
      { left: "සිංහයා", right: "දුවයි",       leftMeaning: "Lion",     rightMeaning: "Roars" },
    ],
  },
  { title: "වර්ණය යා කරන්න", hint: "Match each object to its colour",
    pairs: [
      { left: "අහස",    right: "නිල්",    leftMeaning: "Sky",   rightMeaning: "Blue" },
      { left: "ගස",     right: "කොළ",    leftMeaning: "Tree",  rightMeaning: "Green" },
      { left: "සූර්යයා", right: "ආලෝකය", leftMeaning: "Sun",   rightMeaning: "Light" },
      { left: "රතු",    right: "රොස",    leftMeaning: "Red",   rightMeaning: "Rose" },
      { left: "කළු",    right: "රෑ",     leftMeaning: "Black", rightMeaning: "Night" },
      { left: "සුදු",   right: "කිරි",   leftMeaning: "White", rightMeaning: "Milk" },
    ],
  },
  { title: "ස්ථානය යා කරන්න", hint: "Match each person to their place",
    pairs: [
      { left: "ශිෂ්‍යයා", right: "පාසල",  leftMeaning: "Student",   rightMeaning: "School" },
      { left: "රෝගියා",   right: "රෝහල",  leftMeaning: "Patient",   rightMeaning: "Hospital" },
      { left: "ගොවියා",   right: "කුඹුර", leftMeaning: "Farmer",    rightMeaning: "Paddy field" },
      { left: "ධීවරයා",   right: "මුහුද", leftMeaning: "Fisherman", rightMeaning: "Ocean" },
      { left: "හමුදාව",   right: "කඳවුර", leftMeaning: "Army",      rightMeaning: "Camp" },
      { left: "කම්කරු",   right: "කම්හල", leftMeaning: "Worker",    rightMeaning: "Factory" },
    ],
  },
];

function LineConnectGame({ onComplete, onBack, lang, onReaction }) {
  const ROUNDS = CONNECT_SETS.length;
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);
  const capturedReactionRef = useRef(null);
  const signalRef = useRef(null);

  const makeRound = useCallback((idx) => {
    const set = CONNECT_SETS[idx];
    const shuffledRight = shuffle([...set.pairs.map((p, i) => ({ ...p, origIdx: i, id: `r${i}` }))]);
    return { set, leftItems: set.pairs.map((p, i) => ({ ...p, id: `l${i}`, origIdx: i })), rightItems: shuffledRight, connections: {}, confirmed: false };
  }, []);

  const [round, setRound]           = useState(() => makeRound(0));
  const svgRef                      = useRef(null);
  const leftRefs                    = useRef({});
  const rightRefs                   = useRef({});
  const boardRef                    = useRef(null);
  const [dragging, setDragging]     = useState(null);
  const [hoveredRight, setHoveredRight] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer]           = useState(0);
  const timerRef                    = useRef(null);
  const draggingRef                 = useRef(null);
  const hoveredRightRef             = useRef(null);

  useEffect(() => { draggingRef.current = dragging; }, [dragging]);
  useEffect(() => { hoveredRightRef.current = hoveredRight; }, [hoveredRight]);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [roundIdx]);

  const getAnchor = (el, side) => {
    if (!el || !svgRef.current) return { x: 0, y: 0 };
    const svgRect = svgRef.current.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();
    const x = side === "right" ? elRect.right - svgRect.left : elRect.left - svgRect.left;
    const y = elRect.top + elRect.height / 2 - svgRect.top;
    return { x, y };
  };

  const handleLeftMouseDown = (e, leftId) => {
    e.preventDefault();
    const el = leftRefs.current[leftId];
    const { x, y } = getAnchor(el, "right");
    const svgRect = svgRef.current.getBoundingClientRect();
    setDragging({ fromId: leftId, x1: x, y1: y, curX: e.clientX - svgRect.left, curY: e.clientY - svgRect.top });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    setDragging(d => ({ ...d, curX: e.clientX - svgRect.left, curY: e.clientY - svgRect.top }));
  };

  const handleMouseUp = () => {
    if (!dragging) return;
    if (hoveredRight) {
      setRound(r => {
        const newConn = { ...r.connections };
        Object.keys(newConn).forEach(k => { if (newConn[k] === hoveredRight) delete newConn[k]; });
        newConn[dragging.fromId] = hoveredRight;
        return { ...r, connections: newConn };
      });
    }
    setDragging(null); setHoveredRight(null);
  };

  const handleTouchStartOnLeft = useCallback((e, leftId) => {
    e.preventDefault();
    const touch = e.touches[0];
    const el = leftRefs.current[leftId];
    if (!el || !svgRef.current) return;
    const { x, y } = getAnchor(el, "right");
    const svgRect = svgRef.current.getBoundingClientRect();
    const newDrag = { fromId: leftId, x1: x, y1: y, curX: touch.clientX - svgRect.left, curY: touch.clientY - svgRect.top };
    draggingRef.current = newDrag; setDragging(newDrag);
  }, []);

  const handleBoardTouchMove = useCallback((e) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const updated = { ...draggingRef.current, curX: touch.clientX - svgRect.left, curY: touch.clientY - svgRect.top };
    draggingRef.current = updated; setDragging({ ...updated });
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const rid = el?.dataset?.rid || null;
    hoveredRightRef.current = rid; setHoveredRight(rid);
  }, []);

  const handleBoardTouchEnd = useCallback((e) => {
    const currentDrag = draggingRef.current;
    if (!currentDrag) return;
    const currentHovered = hoveredRightRef.current;
    if (currentHovered) {
      setRound(r => {
        const newConn = { ...r.connections };
        Object.keys(newConn).forEach(k => { if (newConn[k] === currentHovered) delete newConn[k]; });
        newConn[currentDrag.fromId] = currentHovered;
        return { ...r, connections: newConn };
      });
    }
    draggingRef.current = null; hoveredRightRef.current = null;
    setDragging(null); setHoveredRight(null);
  }, []);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    board.addEventListener("touchmove", handleBoardTouchMove, { passive: false });
    board.addEventListener("touchend",  handleBoardTouchEnd,  { passive: false });
    return () => { board.removeEventListener("touchmove", handleBoardTouchMove); board.removeEventListener("touchend", handleBoardTouchEnd); };
  }, [handleBoardTouchMove, handleBoardTouchEnd]);

  useEffect(() => {
    const cleanups = [];
    Object.entries(leftRefs.current).forEach(([leftId, el]) => {
      if (!el) return;
      const handler = (e) => { if (showResult) return; handleTouchStartOnLeft(e, leftId); };
      el.addEventListener("touchstart", handler, { passive: false });
      cleanups.push(() => el.removeEventListener("touchstart", handler));
    });
    return () => cleanups.forEach(fn => fn());
  }, [round, showResult, handleTouchStartOnLeft]);

  const handleConfirm = (signal) => {
    if (Object.keys(round.connections).length < round.leftItems.length) return;
    setShowResult(true); clearInterval(timerRef.current);
    let correct = 0;
    round.leftItems.forEach(li => {
      const ri = round.rightItems.find(r => r.id === round.connections[li.id]);
      if (ri && ri.origIdx === li.origIdx) correct++;
    });
    const pts = correct * 20;
    setScore(s => s + pts);
    setTimeout(() => {
      if (roundIdx + 1 >= ROUNDS) {
        // Last round — signal game end then delay done for reaction capture
        signal && signal();
        setTimeout(() => { setDone(true); onComplete(score + pts); }, 300);
      } else {
        setRoundIdx(r => r + 1); setRound(makeRound(roundIdx + 1));
        setShowResult(false); setTimer(0);
        timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      }
    }, 2200);
  };

  const restart = () => {
    setRoundIdx(0); setRound(makeRound(0)); setScore(0); setDone(false);
    setShowResult(false); setTimer(0); setDragging(null); draggingRef.current = null;
    capturedReactionRef.current = null;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const handleAutoReaction = useCallback((reaction) => {
    capturedReactionRef.current = reaction;
    onReaction && onReaction(reaction);
  }, [onReaction]);

  const gameLabels = {
    en: { back: "← Back", title: "Line Connect", connected: "connected", clearLines: "Clear Lines", checkAnswers: "Check Answers →", checking: "Checking…", connectRemaining: (n) => `Connect all ${n} remaining`, scoreHint: "Drag from any left word → right answer · +20 per correct pair" },
    si: { back: "← ආපසු", title: "රේඛා සම්බන්ධ කිරීම", connected: "සම්බන්ධ", clearLines: "රේඛා ඉවත් කරන්න", checkAnswers: "පිළිතුරු පරීක්ෂා කරන්න →", checking: "පරීක්ෂා කිරීම…", connectRemaining: (n) => `ඉතිරි ${n} සම්බන්ධ කරන්න`, scoreHint: "වාම වචනයේ සිට දකුණු පිළිතුරට ඇදගන්න · +20 සෑම නිවැරදි යුගලයකට" },
    ta: { back: "← பின்னால்", title: "கோடு இணைப்பு", connected: "இணைக்கப்பட்டது", clearLines: "கோடுகளை அழிக்கவும்", checkAnswers: "விடைகளை சரிபார்க்கவும் →", checking: "சரிபார்க்கிறது…", connectRemaining: (n) => `மீதமுள்ள ${n} ஐ இணைக்கவும்`, scoreHint: "இடது வார்த்தையிலிருந்து வலது பதிலுக்கு இழுக்கவும் · +20 ஒவ்வொரு சரியான ஜோடிக்கும்" },
  };
  const gl = gameLabels[lang] ?? gameLabels.en;

  if (done) return (
    <ResultScreen
      score={score} maxScore={ROUNDS * round.leftItems.length * 20} time={timer}
      onRetry={restart} onBack={onBack} lang={lang}
      onReaction={onReaction}
      capturedReaction={capturedReactionRef.current}
    />
  );

  const allConnected = Object.keys(round.connections).length >= round.leftItems.length;
  const progress     = (roundIdx / ROUNDS) * 100;

  const lineColor = (leftId) => {
    if (!showResult) return dragging?.fromId === leftId ? "#111" : "#9ca3af";
    const ri = round.rightItems.find(r => r.id === round.connections[leftId]);
    const li = round.leftItems.find(l => l.id === leftId);
    return ri && ri.origIdx === li.origIdx ? "#16a34a" : "#ef4444";
  };

  return (
    <GameWithAutoCamera onReaction={handleAutoReaction} lang={lang}>
      {({ signalGameEnd }) => {
        signalRef.current = signalGameEnd;
        return (
          <div className="min-h-screen bg-white pt-16" style={{ userSelect: "none" }}>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700&display=swap');
              .connect-left:hover { border-color: #111 !important; }
              .connect-right:hover { border-color: #111 !important; }
            `}</style>
            <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{gl.back}</button>
                <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{gl.title}</span>
                <div className="flex gap-5 font-body text-sm">
                  <span className="text-gray-400">{lang === "si" ? "වාරය" : lang === "ta" ? "சுற்று" : "Round"} {roundIdx + 1}/{ROUNDS}</span>
                  <span className="text-gray-400">{timer}s</span>
                  <span className="font-semibold">{score} {lang === "si" ? "ල." : lang === "ta" ? "புள்." : "pts"}</span>
                </div>
              </div>
            </div>
            <div className="max-w-3xl mx-auto px-4 py-8">
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-8">
                <div className="h-1 bg-black rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-gray-50 px-8 py-5 mb-6 flex items-center justify-between">
                <div>
                  <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-1">{round.set.hint}</p>
                  <p className="font-display text-xl font-bold" style={{ fontFamily: SINHALA_FONT }}>{round.set.title}</p>
                </div>
                <div className="font-body text-xs text-gray-400">{Object.keys(round.connections).length}/{round.leftItems.length} {gl.connected}</div>
              </div>
              <div ref={boardRef} className="rounded-3xl border-2 border-gray-100 bg-white overflow-hidden relative"
                style={{ touchAction: "none" }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
                onMouseLeave={() => { if (dragging) { setDragging(null); setHoveredRight(null); } }}>
                <div className="flex" style={{ minHeight: 440 }}>
                  <div className="flex flex-col justify-around py-6 px-6" style={{ width: "40%", gap: 0 }}>
                    {round.leftItems.map((item) => {
                      const isConnected = !!round.connections[item.id];
                      const lineCol     = showResult ? lineColor(item.id) : null;
                      return (
                        <div key={item.id} ref={el => { leftRefs.current[item.id] = el; }}
                          onMouseDown={e => !showResult && handleLeftMouseDown(e, item.id)}
                          className="connect-left flex items-center gap-3 rounded-2xl border-2 px-4 py-3 cursor-crosshair transition-all duration-200 select-none"
                          style={{ borderColor: showResult && lineCol ? lineCol : isConnected ? "#111" : "#e5e7eb",
                            background: showResult && lineCol === "#16a34a" ? "#f0fdf4" : showResult && lineCol === "#ef4444" ? "#fef2f2" : "white",
                            marginBottom: 6, WebkitUserSelect: "none", WebkitTouchCallout: "none" }}>
                          <span style={{ fontFamily: SINHALA_FONT, fontSize: 20, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{item.left}</span>
                          <span className="font-body text-xs text-gray-300">{item.leftMeaning}</span>
                          <div className="ml-auto w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all"
                            style={{ borderColor: isConnected ? "#111" : "#d1d5db", background: isConnected ? "#111" : "white" }}/>
                        </div>
                      );
                    })}
                  </div>
                  <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                    <defs>
                      <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#9ca3af"/>
                      </marker>
                    </defs>
                    {round.leftItems.map(li => {
                      const rid = round.connections[li.id];
                      if (!rid) return null;
                      const p1  = getAnchor(leftRefs.current[li.id], "right");
                      const p2  = getAnchor(rightRefs.current[rid],  "left");
                      const col = showResult ? lineColor(li.id) : "#111";
                      const cx1 = p1.x + (p2.x - p1.x) * 0.45;
                      const cx2 = p1.x + (p2.x - p1.x) * 0.55;
                      return <path key={li.id} d={`M ${p1.x} ${p1.y} C ${cx1} ${p1.y}, ${cx2} ${p2.y}, ${p2.x} ${p2.y}`}
                        fill="none" stroke={col} strokeWidth={dragging?.fromId === li.id ? 2.5 : 2} strokeLinecap="round"
                        style={{ transition: showResult ? "stroke 0.3s" : "none" }}/>;
                    })}
                    {dragging && (() => {
                      const cx1 = dragging.x1 + (dragging.curX - dragging.x1) * 0.45;
                      const cx2 = dragging.x1 + (dragging.curX - dragging.x1) * 0.55;
                      return <path d={`M ${dragging.x1} ${dragging.y1} C ${cx1} ${dragging.y1}, ${cx2} ${dragging.curY}, ${dragging.curX} ${dragging.curY}`}
                        fill="none" stroke="#111" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round"/>;
                    })()}
                  </svg>
                  <div className="flex flex-col justify-around py-6 px-6 ml-auto" style={{ width: "40%", gap: 0 }}>
                    {round.rightItems.map((item) => {
                      const isTarget    = hoveredRight === item.id;
                      const isConnected = Object.values(round.connections).includes(item.id);
                      const lineCol     = showResult ? (() => {
                        const li = round.leftItems.find(l => round.connections[l.id] === item.id);
                        return li ? lineColor(li.id) : null;
                      })() : null;
                      return (
                        <div key={item.id} ref={el => { rightRefs.current[item.id] = el; }} data-rid={item.id}
                          onMouseEnter={() => dragging && setHoveredRight(item.id)}
                          onMouseLeave={() => setHoveredRight(null)}
                          className="connect-right flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all duration-200 select-none"
                          style={{ borderColor: isTarget ? "#111" : showResult && lineCol ? lineCol : isConnected ? "#111" : "#e5e7eb",
                            background: isTarget ? "#f9fafb" : showResult && lineCol === "#16a34a" ? "#f0fdf4" : showResult && lineCol === "#ef4444" ? "#fef2f2" : "white",
                            cursor: "default", marginBottom: 6 }}>
                          <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                            style={{ borderColor: isTarget || isConnected ? "#111" : "#d1d5db", background: isTarget || isConnected ? "#111" : "white" }}/>
                          <span style={{ fontFamily: SINHALA_FONT, fontSize: 20, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{item.right}</span>
                          <span className="font-body text-xs text-gray-300">{item.rightMeaning}</span>
                          {showResult && lineCol && <span className="ml-auto text-lg">{lineCol === "#16a34a" ? "✓" : "✗"}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setRound(r => ({ ...makeRound(roundIdx), connections: {} })); setShowResult(false); }} disabled={showResult}
                  className="font-body flex-1 border border-gray-200 text-gray-500 py-3 rounded-2xl text-sm hover:border-gray-400 hover:text-black transition-all disabled:opacity-30">
                  {gl.clearLines}
                </button>
                <button onClick={() => handleConfirm(signalGameEnd)} disabled={!allConnected || showResult}
                  className="font-body flex-1 bg-black text-white py-3 rounded-2xl text-sm hover:bg-gray-900 transition-all hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                  {showResult ? gl.checking : allConnected ? gl.checkAnswers : gl.connectRemaining(round.leftItems.length - Object.keys(round.connections).length)}
                </button>
              </div>
              <p className="font-body text-xs text-center text-gray-300 mt-4">{gl.scoreHint}</p>
            </div>
          </div>
        );
      }}
    </GameWithAutoCamera>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAMES CONFIG
// ═══════════════════════════════════════════════════════════════════
const GAMES_CONFIG = [
  { id: "memory-match",   title: { en: "Memory Match",   si: "මතක ගැලපීම",           ta: "நினைவக பொருத்தம்" },   subtitle: { en: "Match each letter with its name",          si: "සෑම අකුරක්ම එහි නමට ගලපන්න",              ta: "ஒவ்வொரு எழுத்தையும் அதன் பெயரோடு பொருத்துங்கள்" }, Icon: BrainIco,  difficulty: "Easy",   points: 120, tag: "Pairs",  section: "Letters" },
  { id: "speed-quiz",     title: { en: "Speed Quiz",     si: "වේග ප්‍රශ්නාවලිය",       ta: "வேக வினாடி வினா" },     subtitle: { en: "10-second timer per question",             si: "ප්‍රශ්නයකට තත්පර 10 ක ටයිමරයක්",            ta: "ஒவ்வொரு கேள்விக்கும் 10 வினாடி டைமர்" },          Icon: ZapIco,    difficulty: "Medium", points: 150, tag: "Timed",  section: "Letters" },
  { id: "letter-hunt",    title: { en: "Letter Hunt",    si: "අකුරු සෙවීම",           ta: "எழுத்து வேட்டை" },      subtitle: { en: "Find the correct letter in the grid",      si: "ජාලකයේ නිවැරදි අකුර සොයන්න",              ta: "கட்டத்தில் சரியான எழுத்தை கண்டுபிடிக்கவும்" },     Icon: TargetIco, difficulty: "Easy",   points: 200, tag: "Search", section: "Letters" },
  { id: "letter-puzzle",  title: { en: "Letter Puzzle",  si: "අකුරු ප්‍රහේලිකාව",      ta: "எழுத்து புதிர்" },       subtitle: { en: "Assemble letter pieces into the slot",     si: "අකුරු කෑලි ස්ථානයට එකලස් කරන්න",           ta: "எழுத்து துண்டுகளை இடத்தில் பொருத்துங்கள்" },       Icon: PuzzleIco, difficulty: "Medium", points: 250, tag: "Puzzle", section: "Letters" },
  { id: "word-builder",   title: { en: "Word Builder",   si: "වචන ගොඩනැගිල්ල",        ta: "வார்த்தை கட்டமைப்பாளர்" }, subtitle: { en: "Drag syllables to build the correct word", si: "නිවැරදි වචනය ගොඩනැගීමට සිලේබල් ඇදගන්න",    ta: "சரியான வார்த்தையை கட்ட எழுத்துக்களை இழுக்கவும்" }, Icon: TypeIco,   difficulty: "Medium", points: 360, tag: "Build",  section: "Words" },
  { id: "missing-letter", title: { en: "Missing Letter", si: "අස්ථාන අකුර",            ta: "காணாமல் போன எழுத்து" },  subtitle: { en: "Fill the blank — chain streaks for bonus", si: "හිස්ව ඇති ස්ථානය පිරවීම — ශ්‍රේණිය ලකුණු",   ta: "வெற்றிடத்தை நிரப்புங்கள் — தொடர் போனஸ் " },      Icon: KeyIco,    difficulty: "Medium", points: 360, tag: "Fill",   section: "Words" },
  { id: "line-connect",   title: { en: "Line Connect",   si: "රේඛා සම්බන්ධ කිරීම",     ta: "கோடு இணைப்பு" },        subtitle: { en: "Draw lines to match words — just like class!", si: "ගුරු පන්තිය මෙන් රේඛා ඇදගෙන ගලපන්න!",  ta: "வார்த்தைகளை பொருத்த கோடுகளை வரையுங்கள்!" },     Icon: LinkIco,   difficulty: "Easy",   points: 360, tag: "Match",  section: "Words" },
];

// ═══════════════════════════════════════════════════════════════════
// LOBBY
// ═══════════════════════════════════════════════════════════════════
export default function GamifiedLearningPage({ lang = "en" }) {
  const t = PAGE_TRANSLATIONS[lang] ?? PAGE_TRANSLATIONS.en;

  const [selected,     setSelected]  = useState(null);
  const [totalScore,   setTotal]     = useState(0);
  const [totalStars,   setStars]     = useState(0);
  const [achievements, setAchiev]    = useState([]);
  const [heroVisible,  setHeroVisible] = useState(false);
  const [showStats,    setShowStats] = useState(false);
  const [moodHistory, setMoodHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sinhala_mood_history") || "[]"); } catch { return []; }
  });

  const [last7Scores, setLast7Scores] = useState([30, 45, 60, 40, 70, 55, 80]); // ← ADD

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    setTimeout(() => setShowStats(true),   600);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selected]);

  useEffect(() => {
    try { localStorage.setItem("sinhala_mood_history", JSON.stringify(moodHistory)); } catch {}
  }, [moodHistory]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getGamifiedStats();
        if (!stats) return;
        if (stats.totalScore != null)   setTotal(stats.totalScore);
        if (stats.totalStars != null)   setStars(stats.totalStars);
        if (stats.achievements?.length) setAchiev(stats.achievements.map(a => a.achievementType));
        if (stats.moodHistory?.length)  setMoodHistory(stats.moodHistory);
        if (stats.last7Scores?.length)  setLast7Scores(stats.last7Scores);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    loadStats();
  }, []);

  // ── handleComplete — replace කරන්න ────────────────────────────
const handleComplete = async (score, gameId) => {
  const newTotal = totalScore + score;
  setTotal(newTotal);
  setStars(s => s + Math.min(3, Math.floor(score / 30)));
  if (newTotal >= 500 && !achievements.includes("master"))
    setAchiev(a => [...a, "master"]);

  try {
    await saveGamifiedSession({
      gameId,
      score,
      maxScore: MAX_SCORES[gameId] ?? 100,
    });

    await checkAndEarnGamifiedAchievements({
      gameType  : gameId,
      score,
      totalScore: newTotal,
    });

    await saveGameProgress({
      gameId,
      score,
      maxScore: MAX_SCORES[gameId] ?? 100,
    });

    await checkAndEarnAchievements({
      gameType  : gameId,
      score,
      totalScore: newTotal,
    });

  } catch (err) {
    console.error("Failed to save progress:", err);
  }
};

// ── handleReaction — replace කරන්න ────────────────────────────
const handleReaction = useCallback((reaction, gameId) => {
  setMoodHistory(prev => {
    const entry = {
      emoji: reaction.emoji,
      si   : reaction.si,
      ta   : reaction.ta,
      en   : reaction.en,
      game : gameId,
      time : Date.now(),
    };
    return [entry, ...prev].slice(0, 20);
  });

  saveFaceReaction({
    gameId,
    rawExpression: reaction.rawName,
    emoji        : reaction.emoji,
    labelEn      : reaction.en,
    labelSi      : reaction.si,
    labelTa      : reaction.ta,
    confidence   : reaction.confidence,
  }).catch(err => console.error("Failed to save reaction:", err));

}, []);

  const handleBack = () => setSelected(null);

  const renderGame = () => {
    const props = {
      letters   : SINHALA_LETTERS,
      onBack    : handleBack,
      onComplete: (score) => handleComplete(score, selected),
      onReaction: (reaction) => handleReaction(reaction, selected),
      lang,
    };
    switch (selected) {
      case "memory-match":    return <MemoryMatchGame    {...props}/>;
      case "speed-quiz":      return <SpeedQuizGame      {...props}/>;
      case "letter-hunt":     return <LetterHuntGame     {...props}/>;
      case "letter-puzzle":   return <LetterPuzzleGame   onBack={handleBack} onComplete={(score) => handleComplete(score, selected)} onReaction={(r) => handleReaction(r, selected)} lang={lang}/>;
      case "word-builder":    return <WordBuilderGame    onBack={handleBack} onComplete={(score) => handleComplete(score, selected)} onReaction={(r) => handleReaction(r, selected)} lang={lang}/>;
      case "word-unscramble": return <WordUnscrambleGame onBack={handleBack} onComplete={(score) => handleComplete(score, selected)} onReaction={(r) => handleReaction(r, selected)} lang={lang}/>;
      case "missing-letter":  return <MissingLetterGame  {...props}/>;
      case "line-connect":    return <LineConnectGame    onBack={handleBack} onComplete={(score) => handleComplete(score, selected)} onReaction={(r) => handleReaction(r, selected)} lang={lang}/>;
      default: return null;
    }
  };

  if (selected) return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .sinhala      { font-family: 'Noto Sans Sinhala', serif; }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-up  { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        .hover-lift { transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease; }
        .hover-lift:hover { transform: translateY(-3px) scale(1.015); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
      `}</style>
      {renderGame()}
    </div>
  );

  const statCards = [
    { label: t.totalScore,  value: totalScore,          suffix: ` ${t.pts}` },
    { label: t.starsEarned, value: totalStars,          suffix: "" },
    { label: t.badges,      value: achievements.length, suffix: "" },
  ];

  const chartBars = last7Scores.length > 0
    ? last7Scores.map(s => Math.min(100, Math.round((s / 400) * 100)))
    : [30, 45, 60, 40, 70, 55, 80];

  const moodCounts = Object.values(EXPRESSION_MAP).map(expr => ({
    emoji: expr.emoji,
    label: lang === "si" ? expr.si : lang === "ta" ? expr.ta : expr.en,
    count: moodHistory.filter(m => m.emoji === expr.emoji).length,
  })).filter(m => m.count > 0).sort((a, b) => b.count - a.count);
  const maxMoodCount = Math.max(...moodCounts.map(m => m.count), 1);

  return (
    <div className="min-h-screen bg-white font-serif text-black selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .sinhala      { font-family: 'Noto Sans Sinhala', serif; }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
        .anim-fade-up   { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in   { animation: fadeIn 0.6s ease both; }
        .anim-scale-in  { animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .delay-1 { animation-delay: 0.10s; }
        .delay-2 { animation-delay: 0.22s; }
        .delay-3 { animation-delay: 0.38s; }
        .delay-4 { animation-delay: 0.54s; }
        .hover-lift { transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease; }
        .hover-lift:hover { transform: translateY(-4px) scale(1.015); box-shadow: 0 20px 60px rgba(0,0,0,0.13); }
        .game-card { transition: all 0.3s cubic-bezier(.22,1,.36,1); }
        .game-card:hover { transform: translateY(-6px); box-shadow: 0 24px 64px rgba(0,0,0,0.12); }
      `}</style>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50" style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }}/>
          <svg className="absolute bottom-0 left-0 opacity-5 w-96 h-96" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="180" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="120" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="60"  stroke="black" strokeWidth="1"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div className={heroVisible ? "anim-fade-up" : "opacity-0"}>
            <span className="font-body inline-block text-xs tracking-[0.2em] uppercase border border-black px-3 py-1 mb-8 anim-fade-in delay-1">{t.badge}</span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-800 leading-[1.08] mb-6 anim-fade-up delay-2">
              {t.heroTitle1}{" "}
              <em className="not-italic underline decoration-2 underline-offset-4">{t.heroItalic}</em>{" "}
              {t.heroTitle2}
            </h1>
            <p className="font-body text-gray-500 text-lg leading-relaxed mb-10 max-w-md anim-fade-up delay-3">{t.heroDesc}</p>
            <div className="flex flex-wrap gap-4 anim-fade-up delay-4">
              <button onClick={() => setSelected("speed-quiz")}
                className="font-body bg-black text-white px-7 py-3.5 rounded-2xl text-sm font-medium hover:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                {t.quickPlay}
              </button>
              <button onClick={() => setSelected("letter-puzzle")}
                className="font-body border border-black text-black px-7 py-3.5 rounded-2xl text-sm font-medium hover:bg-black hover:text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                {t.tryPuzzle}
              </button>
            </div>
          </div>
          <div className={`relative ${heroVisible ? "anim-scale-in delay-2" : "opacity-0"}`}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-2xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0"><Gamepad2Ico s={24}/></div>
                  <div>
                    <div className="font-body text-xs text-gray-400 mb-1">{t.activeToday}</div>
                    <div className="font-display text-xl font-semibold">{t.gamesAvail}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {GAMES_CONFIG.slice(0, 4).map((g, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                      <g.Icon s={22}/>
                      <div>
                        <div className="font-body text-xs font-semibold">{g.title[lang] ?? g.title.en}</div>
                        <div className="font-body text-xs text-gray-400">{g.points} {t.pts}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="font-body text-xs text-gray-400 mb-5">+ 4 {t.wordGamesLabel}</div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-black mt-0.5"/>
                    <span className="font-body text-xs text-gray-500">{t.bestScore}</span>
                  </div>
                  <div className="font-display text-2xl font-bold">1,740 {t.pts}</div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 font-body text-xs">
                <div className="text-gray-400 mb-0.5">{t.diffLabel}</div>
                <div className="font-semibold text-sm flex gap-1">{t.diffValue}</div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-black text-white rounded-2xl shadow-xl px-4 py-3 font-body text-xs">
                <div className="text-gray-400 mb-0.5">{t.lettersLabel}</div>
                <div className="font-semibold text-sm sinhala">{SINHALA_LETTERS.length} {lang === "si" ? "අකුරු" : lang === "ta" ? "எழுத்துக்கள்" : "letters"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GAMES GRID ─── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">{t.chooseGame}</h2>
          <p className="font-body text-gray-400 text-base max-w-md mx-auto">{t.chooseDesc}</p>
        </div>
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-gray-400">{t.letterGames}</span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GAMES_CONFIG.filter(g => g.section === "Letters").map((game) => (
              <div key={game.id} onClick={() => setSelected(game.id)}
                className="game-card cursor-pointer rounded-3xl border-2 p-8 bg-gray-50 hover:border-black border-gray-100 group">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"><game.Icon s={28}/></div>
                <div className="flex gap-2 mb-4">
                  <span className="font-body text-xs border border-gray-200 text-gray-500 px-2.5 py-1 rounded-lg">{t.tags[game.tag] ?? game.tag}</span>
                  <span className={`font-body text-xs px-2.5 py-1 rounded-lg ${game.difficulty === "Easy" ? "bg-gray-100 text-gray-600" : "border border-gray-200 text-gray-500"}`}>
                    {t.difficulty[game.difficulty] ?? game.difficulty}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">{game.title[lang] ?? game.title.en}</h3>
                <p className="font-body text-sm text-gray-400 leading-relaxed mb-8">{game.subtitle[lang] ?? game.subtitle.en}</p>
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-gray-400 flex items-center gap-1"><StarIco s={12} fill="#111"/> {game.points} {t.pts}</span>
                  <button className="font-body text-xs font-medium text-gray-500 group-hover:text-black transition-colors flex items-center gap-1">
                    {t.play} <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-gray-400">{t.wordGames}</span>
            <div className="flex-1 h-px bg-gray-100"/>
            <span className="font-body text-xs text-gray-300 uppercase tracking-wider">{t.newLabel}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES_CONFIG.filter(g => g.section === "Words").map((game) => (
              <div key={game.id} onClick={() => setSelected(game.id)}
                className="game-card cursor-pointer rounded-3xl border-2 p-8 bg-white hover:border-black border-gray-100 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full pointer-events-none"/>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"><game.Icon s={28}/></div>
                  <div className="flex gap-2 mb-4">
                    <span className="font-body text-xs border border-gray-200 text-gray-500 px-2.5 py-1 rounded-lg">{t.tags[game.tag] ?? game.tag}</span>
                    <span className={`font-body text-xs px-2.5 py-1 rounded-lg ${game.difficulty === "Easy" ? "bg-gray-100 text-gray-600" : game.difficulty === "Hard" ? "bg-black text-white" : "border border-gray-200 text-gray-500"}`}>
                      {t.difficulty[game.difficulty] ?? game.difficulty}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">{game.title[lang] ?? game.title.en}</h3>
                  <p className="font-body text-sm text-gray-400 leading-relaxed mb-8">{game.subtitle[lang] ?? game.subtitle.en}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-gray-400 flex items-center gap-1"><StarIco s={12} fill="#111"/> {game.points} {t.pts}</span>
                    <button className="font-body text-xs font-medium text-gray-500 group-hover:text-black transition-colors flex items-center gap-1">
                      {t.play} <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">{t.yourProgress}</h2>
          <p className="font-body text-gray-400 text-sm">{t.progressDesc}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className={`hover-lift rounded-3xl p-8 border ${i === 0 ? "bg-black text-white border-black" : "bg-gray-50 border-gray-100"}`}>
              <div className={`font-body text-xs uppercase tracking-widest mb-4 ${i === 0 ? "text-gray-400" : "text-gray-400"}`}>{stat.label}</div>
              <div className={`font-display text-5xl font-bold ${i === 0 ? "text-white" : "text-black"}`}>
                {showStats ? <AnimatedCounter value={stat.value} suffix={stat.suffix}/> : "0"}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display text-lg font-semibold">{t.scoreTrend}</h4>
            <span className="font-body text-xs text-gray-400">{t.last7}</span>
          </div>
          <div className="flex items-end gap-3 h-36">
            {chartBars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative">
                  <div className="w-full bg-black rounded-t-lg transition-all duration-1000"
                    style={{ height: showStats ? `${(h / 100) * 120}px` : "0px", transitionDelay: `${i * 80}ms` }}/>
                </div>
                <span className="font-body text-xs text-gray-400">{["M","T","W","T","F","S","S"][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 font-body text-xs text-gray-300">
            <span>0 {t.pts}</span><span>500 {t.pts}</span><span>1000 {t.pts}</span>
          </div>
        </div>

        {moodHistory.length > 0 && (
          <div className="rounded-3xl border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gray-50 border-b border-gray-100 px-8 py-5 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">{t.moodHistory}</h3>
              <button onClick={() => { setMoodHistory([]); try { localStorage.removeItem("sinhala_mood_history"); } catch {} }}
                className="font-body text-xs text-gray-400 hover:text-black transition-colors">
                {lang === "si" ? "ඉවත් කරන්න" : lang === "ta" ? "அழிக்க" : "clear"}
              </button>
            </div>
            <div className="p-8 grid sm:grid-cols-2 gap-8">
              <div>
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-4">{t.recentMood}</p>
                <div className="flex flex-col gap-2">
                  {moodHistory.slice(0, 6).map((m, i) => {
                    const label = lang === "si" ? m.si : lang === "ta" ? m.ta : m.en;
                    const gameLabel = m.game?.replace(/-/g, " ") ?? "";
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50">
                        <span style={{ fontSize: 24 }}>{m.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-medium text-black">{label}</p>
                          <p className="font-body text-xs text-gray-400 capitalize truncate">{gameLabel}</p>
                        </div>
                        <span className="font-body text-xs text-gray-300">
                          {new Date(m.time).toLocaleDateString(lang === "si" ? "si-LK" : lang === "ta" ? "ta-LK" : "en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-4">
                  {lang === "si" ? "හැඟීම් ගැන" : lang === "ta" ? "உணர்வு அலைவரிசை" : "Feeling frequency"}
                </p>
                <div className="flex flex-col gap-3">
                  {moodCounts.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{m.emoji}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full transition-all duration-700"
                          style={{ width: `${(m.count / maxMoodCount) * 100}%`, transitionDelay: `${i * 80}ms` }}/>
                      </div>
                      <span className="font-body text-xs text-gray-400 min-w-[20px] text-right">{m.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="bg-black text-white px-8 py-5 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">{t.achievTitle}</h3>
              <TrophyIco s={20}/>
            </div>
            <div className="p-8 grid sm:grid-cols-3 gap-6">
              {achievements.map((_, i) => (
                <div key={i} className="hover-lift bg-gray-50 rounded-2xl border border-gray-100 p-6 text-center">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4"><GiftIco s={28}/></div>
                  <div className="font-display text-lg font-bold mb-1">{t.masterTitle}</div>
                  <p className="font-body text-sm text-gray-400">{t.masterDesc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}