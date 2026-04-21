import { useState, useEffect } from "react";

// ─── TRANSLATIONS ────────────────────────────────────────────────
const translations = {
  en: {
    heroBadge: "For Primary School Kids",
    heroTitle1: "Learn Sinhala",
    heroTitle2: "Handwriting",
    heroTitle3: "the Smart Way",
    heroSub: "A fun, interactive companion that helps children master Sinhala letters with guided tracing, mini-games, and smart feedback — step by step.",
    heroCta: "Start Learning",
    heroDemo: "Watch Demo",
    stat1: "Sinhala Letters",
    stat2: "Free to Use",
    stat3: "Target Group",
    sectionLabel: "What We Offer",
    sectionTitle1: "Everything a Child Needs",
    sectionTitle2: "to Master Sinhala",
    sectionSub: "Four powerful components working together to make learning Sinhala handwriting joyful and effective.",
    f1Title: "Sinhala Letter Recognition",
    f1Desc: "Detect and recognize Sinhala letters instantly using AI-powered technology built for young learners.",
    f2Title: "Letter Tracing & Writing Practice",
    f2Desc: "Interactive tracing exercises that guide children stroke-by-stroke to develop confident handwriting.",
    f3Title: "Gamified Learning",
    f3Desc: "Fun mini-games and rewards that keep children engaged and excited to practice every day.",
    f4Title: "Practice Sentences & Progress Tracking",
    f4Desc: "Build vocabulary with practice sentences and let parents monitor improvement over time.",
    howLabel: "Simple Process",
    howTitle: "How It Works",
    howSub: "Three easy steps to take any child from beginner to confident Sinhala writer.",
    step1Chip: "Step 1", step1Title: "Learn Letters",
    step1Desc: "Explore the full Sinhala alphabet with clear audio and visual guides.",
    step2Chip: "Step 2", step2Title: "Practice Writing",
    step2Desc: "Trace each letter with guided strokes and get instant feedback.",
    step3Chip: "Step 3", step3Title: "Track Progress",
    step3Desc: "Collect badges and watch your skills grow day by day.",
    ctaTitle1: "Ready to Start",
    ctaTitle2: "the Adventure?",
    ctaSub: "Join hundreds of young learners discovering the beauty of Sinhala handwriting. It's free, fun, and made just for kids!",
    ctaBtn1: "Get Started Now ✏️",
    ctaBtn2: "For Parents & Teachers",
    // Feature page translations
    fp1Title: "Sinhala Letter Recognition",
    fp1Sub: "AI-powered letter detection for young learners",
    fp2Title: "Letter Tracing & Writing Practice",
    fp2Sub: "Stroke-by-stroke guided handwriting exercises",
    fp3Title: "Gamified Learning",
    fp3Sub: "Fun mini-games and daily rewards system",
    fp4Title: "Practice Sentences & Progress Tracking",
    fp4Sub: "Vocabulary building with parent monitoring",
    backBtn: "← Back to Home",
  },
  si: {
    heroBadge: "ප්‍රාථමික පාසල් දරුවන් සඳහා",
    heroTitle1: "සිංහල",
    heroTitle2: "අතින් ලිවීම",
    heroTitle3: "දක්ෂ ලෙස ඉගෙනෙමු",
    heroSub: "දරුවන්ට සිංහල අකුරු ප්‍රගුණ කිරීමට සහාය වන විනෝදජනක, අන්තර්ක්‍රියාකාරී සගයා — ලිවීමේ මාර්ගෝපදේශ, ක්‍රීඩා සහ ස්මාර්ට් ප්‍රතිපෝෂණ සමඟ.",
    heroCta: "ඉගෙනීම ආරම්භ කරන්න",
    heroDemo: "ආදර්ශනය බලන්න",
    stat1: "සිංහල අකුරු",
    stat2: "නොමිලේ",
    stat3: "වයස් කාණ්ඩය",
    sectionLabel: "අපි ඉදිරිපත් කරන දේ",
    sectionTitle1: "දරුවෙකුට අවශ්‍ය සියල්ල",
    sectionTitle2: "සිංහල ප්‍රගුණ කිරීමට",
    sectionSub: "සිංහල අතින් ලිවීම ඉගෙනීම ප්‍රීතිමත් හා ඵලදායී කිරීමට එකට ක්‍රියා කරන සංරචක හතරක්.",
    f1Title: "සිංහල අකුරු හඳුනාගැනීම",
    f1Desc: "ළමා ඉගෙන්නන් සඳහා ගොඩනගන ලද AI තාක්ෂණය භාවිතා කර සිංහල අකුරු ක්ෂණිකව හඳුනාගන්න.",
    f2Title: "අකුරු ලුහු බැඳීම සහ ලිවීමේ පුහුණුව",
    f2Desc: "දරුවන් ආඝාත-ආකාරයෙන් මාර්ගෝපදේශ කරන අන්තර්ක්‍රියාකාරී ලුහු බැඳීමේ අභ්‍යාස.",
    f3Title: "ක්‍රීඩා ආකාරයෙන් ඉගෙනීම",
    f3Desc: "දරුවන් සෑම දිනම පුහුණු වීමට නියැලී සිටීමට සහ උද්‍යෝගිමත් කිරීමට විනෝදජනක ක්‍රීඩා.",
    f4Title: "වාක්‍ය පුහුණුව සහ ප්‍රගතිය නිරීක්ෂණය",
    f4Desc: "පුහුණු වාක්‍ය සමඟ වචන මාලාව ගොඩ නගා දෙමාපියන්ට කාලයත් සමඟ දියුණුව නිරීක්ෂණය කරන්න.",
    howLabel: "සරල ක්‍රියාවලිය",
    howTitle: "ක්‍රියා කරන ආකාරය",
    howSub: "ඕනෑම දරුවෙකු ආරම්භකයා සිට ස්ථිර සිංහල ලේඛකයෙකු දක්වා ගෙන යාමට පියවර තුනක්.",
    step1Chip: "පියවර 1", step1Title: "අකුරු ඉගෙනෙමු",
    step1Desc: "පැහැදිලි ශ්‍රව්‍ය සහ දෘශ්‍ය මාර්ගෝපදේශ සමඟ සම්පූර්ණ සිංහල අකුරු මාලාව ගවේෂණය කරන්න.",
    step2Chip: "පියවර 2", step2Title: "ලිවීම පුහුණු කරමු",
    step2Desc: "මාර්ගෝපදේශිත ආඝාත සමඟ එක් එක් අකුර ලුහු බැඳ ක්ෂණික ප්‍රතිපෝෂණ ලබා ගන්න.",
    step3Chip: "පියවර 3", step3Title: "ප්‍රගතිය නිරීක්ෂණය",
    step3Desc: "ත්‍යාග රැස් කර ඔබේ කුසලතා දිනෙන් දිනෙකට වර්ධනය වනු බලන්න.",
    ctaTitle1: "ආරම්භ කිරීමට",
    ctaTitle2: "සූදානම්ද?",
    ctaSub: "සිංහල අතින් ලිවීමේ සුන්දරත්වය සොයා ගන්නා සිය ගණනක් ළමා ඉගෙන්නන් සමඟ එකතු වන්න. නොමිලේ, විනෝදජනක, දරුවන් සඳහාම!",
    ctaBtn1: "දැන්ම ආරම්භ කරන්න ✏️",
    ctaBtn2: "දෙමාපියන් සහ ගුරුවරුන් සඳහා",
    fp1Title: "සිංහල අකුරු හඳුනාගැනීම",
    fp1Sub: "AI-ශක්තිමත් අකුරු හඳුනාගැනීම",
    fp2Title: "අකුරු ලුහු බැඳීම",
    fp2Sub: "ආඝාත-ආකාරයෙන් ලිවීමේ අභ්‍යාස",
    fp3Title: "ක්‍රීඩා ආකාරයෙන් ඉගෙනීම",
    fp3Sub: "විනෝදජනක ක්‍රීඩා සහ ත්‍යාග",
    fp4Title: "ප්‍රගතිය නිරීක්ෂණය",
    fp4Sub: "දෙමාපියන් සඳහා නිරීක්ෂණ",
    backBtn: "← මුල් පිටුවට",
  },
  ta: {
    heroBadge: "ஆரம்பப் பள்ளி மாணவர்களுக்காக",
    heroTitle1: "சிங்களம்",
    heroTitle2: "கையெழுத்தை",
    heroTitle3: "சிறப்பாக கற்கலாம்",
    heroSub: "வழிகாட்டிய எழுதுதல், சிறு விளையாட்டுகள் மற்றும் அறிவார்ந்த கருத்துக்களுடன் குழந்தைகளுக்கு சிங்கள எழுத்துக்களை திறம்பட கற்க உதவும் வேடிக்கையான துணை.",
    heroCta: "கற்றலைத் தொடங்குங்கள்",
    heroDemo: "டெமோவைப் பாருங்கள்",
    stat1: "சிங்கள எழுத்துக்கள்",
    stat2: "இலவசமாக",
    stat3: "வயது குழு",
    sectionLabel: "நாங்கள் வழங்குவது",
    sectionTitle1: "ஒரு குழந்தைக்கு தேவையான அனைத்தும்",
    sectionTitle2: "சிங்களத்தில் தேர்ச்சி பெற",
    sectionSub: "சிங்கள கையெழுத்தை கற்பதை மகிழ்ச்சியாகவும் பயனுள்ளதாகவும் மாற்ற ஒன்றாக இயங்கும் நான்கு கூறுகள்.",
    f1Title: "சிங்கள எழுத்து அடையாளம்",
    f1Desc: "இளம் கற்பவர்களுக்காக உருவாக்கப்பட்ட AI தொழில்நுட்பத்தைப் பயன்படுத்தி சிங்கள எழுத்துக்களை உடனடியாக அடையாளம் காணுங்கள்.",
    f2Title: "எழுத்து குறிப்பிடல் & பயிற்சி",
    f2Desc: "குழந்தைகளை ஒவ்வொரு வரிப்பிடியாகவும் வழிகாட்டும் ஊடாடும் குறிப்பிடல் பயிற்சிகள்.",
    f3Title: "விளையாட்டு வழி கற்றல்",
    f3Desc: "குழந்தைகளை ஆர்வமாக வைத்திருக்கவும் ஒவ்வொரு நாளும் பயிற்சி செய்யவும் உற்சாகப்படுத்தும் வேடிக்கையான விளையாட்டுகள்.",
    f4Title: "பயிற்சி & முன்னேற்றக் கண்காணிப்பு",
    f4Desc: "பயிற்சி வாக்கியங்களுடன் வார்த்தை கலைஞரை உருவாக்கி, பெற்றோர்களை முன்னேற்றத்தை கண்காணிக்க அனுமதிக்கவும்.",
    howLabel: "எளிய செயல்முறை",
    howTitle: "எவ்வாறு செயல்படுகிறது",
    howSub: "எந்த குழந்தையையும் தொடக்கத்திலிருந்து நம்பிக்கையான சிங்கள எழுத்தாளராக மாற்ற மூன்று எளிய படிகள்.",
    step1Chip: "படி 1", step1Title: "எழுத்துக்கள் கற்கவும்",
    step1Desc: "தெளிவான ஒலி மற்றும் காட்சி வழிகாட்டிகளுடன் முழு சிங்கள எழுத்துக்களை ஆராயுங்கள்.",
    step2Chip: "படி 2", step2Title: "எழுதுவதை பயிற்சி செய்யவும்",
    step2Desc: "வழிகாட்டப்பட்ட வரிப்பிடிகளுடன் ஒவ்வொரு எழுத்தையும் குறிப்பிட்டு உடனடி கருத்துக்களைப் பெறுங்கள்.",
    step3Chip: "படி 3", step3Title: "முன்னேற்றத்தைக் கண்காணிக்கவும்",
    step3Desc: "பதக்கங்களை சேகரிக்கவும் உங்கள் திறன்கள் நாளுக்கு நாள் வளரக் காணுங்கள்.",
    ctaTitle1: "தொடங்குவதற்கு",
    ctaTitle2: "தயாரா?",
    ctaSub: "சிங்கள கையெழுத்தின் அழகை கண்டுபிடிக்கும் நூற்றுக்கணக்கான இளம் கற்பவர்களுடன் சேருங்கள். இலவசம், வேடிக்கையானது, குழந்தைகளுக்காகவே!",
    ctaBtn1: "இப்போதே தொடங்குங்கள் ✏️",
    ctaBtn2: "பெற்றோர்கள் & ஆசிரியர்களுக்கு",
    fp1Title: "எழுத்து அடையாளம்",
    fp1Sub: "AI-சக்தி வாய்ந்த கண்டறிதல்",
    fp2Title: "எழுத்து குறிப்பிடல்",
    fp2Sub: "வழிகாட்டப்பட்ட பயிற்சிகள்",
    fp3Title: "விளையாட்டு கற்றல்",
    fp3Sub: "விளையாட்டுகள் மற்றும் பரிசுகள்",
    fp4Title: "முன்னேற்றக் கண்காணிப்பு",
    fp4Sub: "பெற்றோர் கண்காணிப்பு",
    backBtn: "← முகப்புக்கு திரும்பு",
  },
};

// ─── ICONS ───────────────────────────────────────────────────────
const RecognitionIcon = ({ size = 40 }) => (
  <svg viewBox="0 0 48 48" style={{ width: size, height: size }} fill="none">
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#FFF9F0" stroke="#1a1a1a" strokeWidth="2"/>
    <text x="10" y="34" fontSize="22" fontFamily="serif" fill="#1a1a1a">ක</text>
    <circle cx="36" cy="14" r="7" fill="#1a1a1a"/>
    <path d="M33 14 L35.5 16.5 L40 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TracingIcon = ({ size = 40 }) => (
  <svg viewBox="0 0 48 48" style={{ width: size, height: size }} fill="none">
    <rect x="4" y="8" width="32" height="36" rx="4" fill="#FFF9F0" stroke="#1a1a1a" strokeWidth="2"/>
    <line x1="10" y1="20" x2="30" y2="20" stroke="#D0C8C0" strokeWidth="1.5"/>
    <line x1="10" y1="28" x2="30" y2="28" stroke="#D0C8C0" strokeWidth="1.5"/>
    <line x1="10" y1="36" x2="30" y2="36" stroke="#D0C8C0" strokeWidth="1.5"/>
    <path d="M12 30 Q18 16 26 30" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <g transform="translate(34,10) rotate(30)">
      <rect x="-3" y="-14" width="6" height="18" rx="1" fill="#FFD166"/>
      <polygon points="-3,4 3,4 0,10" fill="#F4A460"/>
    </g>
  </svg>
);
const GamifiedIcon = ({ size = 40 }) => (
  <svg viewBox="0 0 48 48" style={{ width: size, height: size }} fill="none">
    <rect x="6" y="14" width="36" height="26" rx="8" fill="#1a1a1a"/>
    <rect x="10" y="18" width="28" height="18" rx="4" fill="#FFF9F0"/>
    <circle cx="20" cy="32" r="3" fill="#1a1a1a"/>
    <circle cx="28" cy="32" r="3" fill="#1a1a1a"/>
    <path d="M34 25 L36 27 L34 29" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
    <text x="12" y="30" fontSize="10" fill="#FFD166">★</text>
    <circle cx="24" cy="10" r="4" fill="#1a1a1a"/>
    <line x1="17" y1="14" x2="24" y2="14" stroke="#1a1a1a" strokeWidth="2"/>
    <line x1="31" y1="14" x2="24" y2="14" stroke="#1a1a1a" strokeWidth="2"/>
  </svg>
);
const ProgressIcon = ({ size = 40 }) => (
  <svg viewBox="0 0 48 48" style={{ width: size, height: size }} fill="none">
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#FFF9F0" stroke="#1a1a1a" strokeWidth="2"/>
    <line x1="10" y1="38" x2="10" y2="14" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
    <line x1="10" y1="38" x2="38" y2="38" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
    <rect x="14" y="26" width="6" height="12" rx="1" fill="#1a1a1a"/>
    <rect x="23" y="20" width="6" height="18" rx="1" fill="#1a1a1a" opacity="0.5"/>
    <rect x="32" y="14" width="6" height="24" rx="1" fill="#FFD166"/>
    <path d="M14 24 L20 18 L28 22 L38 12" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);
const LearnIcon = () => (
  <svg viewBox="0 0 56 56" className="w-14 h-14" fill="none">
    <circle cx="28" cy="28" r="26" fill="#1a1a1a"/>
    <text x="13" y="40" fontSize="26" fontFamily="serif" fill="white">ක</text>
  </svg>
);
const PracticeIcon = () => (
  <svg viewBox="0 0 56 56" className="w-14 h-14" fill="none">
    <circle cx="28" cy="28" r="26" fill="#1a1a1a"/>
    <rect x="16" y="14" width="20" height="26" rx="3" fill="white" opacity="0.9"/>
    <line x1="20" y1="22" x2="32" y2="22" stroke="#1a1a1a" strokeWidth="1.5"/>
    <line x1="20" y1="28" x2="32" y2="28" stroke="#1a1a1a" strokeWidth="1.5"/>
    <g transform="translate(33,32) rotate(-30)">
      <rect x="-2.5" y="-10" width="5" height="14" rx="1" fill="#FFD166"/>
      <polygon points="-2.5,4 2.5,4 0,9" fill="#F4A460"/>
    </g>
  </svg>
);
const TrackIcon = () => (
  <svg viewBox="0 0 56 56" className="w-14 h-14" fill="none">
    <circle cx="28" cy="28" r="26" fill="#1a1a1a"/>
    <circle cx="28" cy="28" r="14" fill="none" stroke="white" strokeWidth="3" opacity="0.3"/>
    <path d="M28 28 L28 14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M28 28 L38 32" stroke="#FFD166" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="28" cy="28" r="3" fill="white"/>
  </svg>
);

// ─── FEATURE PAGE CONTENT ─────────────────────────────────────────
const featurePageContent = {
  0: {
    emoji: "🔍",
    accent: "#FFD166",
    accentDark: "#a07c00",
    bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    letter: "ක",
    highlights: ["Real-time AI detection", "50+ Sinhala characters", "Instant accuracy feedback", "Camera & upload support"],
    description: "Our AI-powered recognition engine instantly identifies Sinhala letters drawn or uploaded by children. Built specifically for the unique curves and strokes of the Sinhala script, it provides immediate, encouraging feedback to help young learners understand exactly what they've written.",
    howItWorks: [
      { step: "01", text: "Child draws or uploads a Sinhala letter" },
      { step: "02", text: "AI engine analyzes stroke patterns in real-time" },
      { step: "03", text: "System identifies the letter and checks accuracy" },
      { step: "04", text: "Child receives instant, encouraging feedback" },
    ],
    demoLetters: ["ක", "ග", "ජ", "ට", "ද", "න", "ප", "ම", "ය", "ල"],
  },
  1: {
    emoji: "✏️",
    accent: "#A8D8EA",
    accentDark: "#1a6b8a",
    bg: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
    letter: "ල",
    highlights: ["Stroke-by-stroke guidance", "Animated letter guides", "Pressure sensitivity", "Progress per letter"],
    description: "Interactive tracing canvases let children follow animated stroke guides at their own pace. Each letter is broken down into individual strokes with clear directional arrows, helping children develop proper muscle memory and confident handwriting technique from the very beginning.",
    howItWorks: [
      { step: "01", text: "Choose a letter from the Sinhala alphabet" },
      { step: "02", text: "Watch the animated stroke demonstration" },
      { step: "03", text: "Trace the letter following the guided path" },
      { step: "04", text: "Receive stroke accuracy score and tips" },
    ],
    demoLetters: ["ල", "ව", "ස", "හ", "ම", "ය", "ර", "ල", "ළ", "ෆ"],
  },
  2: {
    emoji: "🎮",
    accent: "#FFB3BA",
    accentDark: "#8b1a2a",
    bg: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
    letter: "ඔ",
    highlights: ["Daily challenge games", "Badge & reward system", "Letter match puzzles", "Leaderboards for classes"],
    description: "Learning is most effective when it feels like play. Our gamified system turns daily practice into an adventure — children earn badges, unlock new characters, and complete fun letter-matching challenges that reinforce what they've learned through tracing and recognition activities.",
    howItWorks: [
      { step: "01", text: "Complete daily tracing or recognition tasks" },
      { step: "02", text: "Earn stars and unlock mini-games" },
      { step: "03", text: "Challenge friends or classmates to letter puzzles" },
      { step: "04", text: "Collect badges and level up your profile" },
    ],
    demoLetters: ["★", "🏆", "⭐", "🎯", "🌟", "🎖️", "🏅", "✨", "💫", "🎗️"],
  },
  3: {
    emoji: "📈",
    accent: "#B5EAD7",
    accentDark: "#1a6b4a",
    bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    letter: "ප",
    highlights: ["Parent dashboard", "Weekly progress reports", "Sentence building mode", "Teacher class overview"],
    description: "Beyond individual letters, children practice writing full Sinhala sentences, building their vocabulary naturally. Parents and teachers get a clear, visual dashboard showing which letters have been mastered, areas needing more practice, and weekly improvement trends over time.",
    howItWorks: [
      { step: "01", text: "Master individual letters through tracing" },
      { step: "02", text: "Progress to practicing simple words and sentences" },
      { step: "03", text: "System records accuracy and session time" },
      { step: "04", text: "Parents review weekly reports and insights" },
    ],
    demoLetters: ["ප", "ු", "ස", "්", "ත", "ක", "ය", "ා", "ව", "ල"],
  },
};

// ─── FEATURE DETAIL PAGE ─────────────────────────────────────────
const FeatureDetailPage = ({ featureIndex, t, lang, onBack }) => {
  const content = featurePageContent[featureIndex];
  const icons = [<RecognitionIcon size={56}/>, <TracingIcon size={56}/>, <GamifiedIcon size={56}/>, <ProgressIcon size={56}/>];
  const titles = [t.fp1Title, t.fp2Title, t.fp3Title, t.fp4Title];
  const subs = [t.fp1Sub, t.fp2Sub, t.fp3Sub, t.fp4Sub];
  const accents = ["#FFD166", "#A8D8EA", "#FFB3BA", "#B5EAD7"];

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatLetter { 0%,100%{transform:translateY(0px) rotate(-3deg)} 50%{transform:translateY(-12px) rotate(-3deg)} }
        .slide-left { animation: slideInLeft 0.5s ease-out both; }
        .slide-up { animation: slideInUp 0.5s ease-out both; }
        .float-letter { animation: floatLetter 3s ease-in-out infinite; }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.10); }
        .step-card { transition: all 0.3s ease; }
        .highlight-pill:hover { transform: scale(1.05); }
        .highlight-pill { transition: transform 0.2s ease; }
      `}</style>

      {/* Hero section */}
      <div className="relative overflow-hidden" style={{ background: content.bg, minHeight: '380px' }}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-30"
          style={{ background: content.accent, filter: 'blur(60px)' }}
        />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-20"
          style={{ background: content.accent, filter: 'blur(40px)' }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-12 pb-16">
          {/* Back button */}
          <button onClick={onBack}
            className="slide-left mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/80"
          >
            {t.backBtn}
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
            {/* Left: text */}
            <div className="flex-1">
              <div className="slide-up" style={{ animationDelay: '0.1s' }}>
                <span className="text-5xl block mb-4">{content.emoji}</span>
              </div>
              <h1 className="slide-up text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4"
                style={{ animationDelay: '0.15s' }}
              >
                {titles[featureIndex]}
              </h1>
              <p className="slide-up text-gray-600 text-lg font-semibold mb-6"
                style={{ animationDelay: '0.2s' }}
              >
                {subs[featureIndex]}
              </p>
              {/* Highlight pills */}
              <div className="slide-up flex flex-wrap gap-3" style={{ animationDelay: '0.25s' }}>
                {content.highlights.map((h, i) => (
                  <span key={i} className="highlight-pill text-sm font-bold px-4 py-2 rounded-full cursor-default"
                    style={{ background: `${content.accent}40`, color: content.accentDark, border: `1.5px solid ${content.accent}` }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: large floating letter / icon */}
            <div className="slide-up flex-shrink-0 flex flex-col items-center gap-4" style={{ animationDelay: '0.3s' }}>
              <div className="w-36 h-36 rounded-[2rem] flex items-center justify-center shadow-xl"
                style={{ background: content.accent }}
              >
                <span className="float-letter text-8xl font-serif text-gray-900">{content.letter}</span>
              </div>
              <div className="flex gap-2">
                {icons[featureIndex]}
                <span className="text-sm font-bold text-gray-500 self-center">Feature {featureIndex + 1} of 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description + How It Works */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Description */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">About This Feature</h2>
            <p className="text-gray-600 leading-relaxed text-base">{content.description}</p>

            {/* Letter preview strip */}
            <div className="mt-8">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                {featureIndex === 2 ? "Rewards & Badges" : "Practice Characters"}
              </h3>
              <div className="flex flex-wrap gap-3">
                {content.demoLetters.map((l, i) => (
                  <div key={i}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-serif font-bold cursor-default hover:scale-110 transition-transform duration-200"
                    style={{ background: `${content.accent}30`, color: '#1a1a1a', border: `1.5px solid ${content.accent}` }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How It Works steps */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6">How It Works</h2>
            <div className="flex flex-col gap-4">
              {content.howItWorks.map((item, i) => (
                <div key={i} className="step-card flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: content.accent, color: '#1a1a1a' }}
                  >
                    {item.step}
                  </div>
                  <p className="text-gray-700 font-semibold text-sm leading-relaxed self-center">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Other features navigation */}
        <div className="mt-16 pt-12 border-t border-gray-100">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Explore Other Features</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[0,1,2,3].filter(i => i !== featureIndex).map(i => (
              <button key={i} onClick={() => onBack(i)}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  style={{ background: `${accents[i]}30` }}
                >
                  {[<RecognitionIcon size={28}/>, <TracingIcon size={28}/>, <GamifiedIcon size={28}/>, <ProgressIcon size={28}/>][i]}
                </div>
                <span className="text-xs font-bold text-gray-600 text-center leading-tight">
                  {[t.fp1Title, t.fp2Title, t.fp3Title, t.fp4Title][i]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── FEATURE CARD ─────────────────────────────────────────────
const FeatureCard = ({ icon, title, description, accent, delay = 0, onClick }) => (
  <div
    onClick={onClick}
    className="group relative bg-white border border-gray-100 rounded-3xl p-8 flex flex-col gap-5 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
    role="button"
    tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onClick()}
  >
    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl transition-all duration-300 group-hover:h-1.5"
      style={{ background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
    />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
      style={{ background: `radial-gradient(circle at 50% 0%, ${accent}18 0%, transparent 70%)` }}
    />
    <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
      style={{ background: `${accent}20` }}
    >
      {icon}
    </div>
    <div className="relative">
      <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
    {/* "Explore" arrow that appears on hover */}
    <div className="relative flex items-center gap-1 text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mt-2"
      style={{ color: accent === '#FFD166' ? '#a07c00' : accent === '#A8D8EA' ? '#1a6b8a' : accent === '#FFB3BA' ? '#8b1a2a' : '#1a6b4a' }}
    >
      Explore feature
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path fillRule="evenodd" d="M8.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L10.586 9H3a1 1 0 110-2h7.586L8.293 4.707a1 1 0 010-1.414z" clipRule="evenodd"/>
      </svg>
    </div>
  </div>
);

// ─── STEP COMPONENT ──────────────────────────────────────────
const Step = ({ icon, chip, title, description, accent }) => (
  <div className="flex flex-col items-center text-center gap-5 flex-1 group">
    <div className="relative">
      <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
        style={{ background: accent, transform: 'scale(1.3)' }}
      />
      <div className="relative hover:scale-110 transition-transform duration-300">{icon}</div>
    </div>
    <div>
      <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3"
        style={{ background: `${accent}25`, color: accent === '#FFD166' ? '#a07c00' : accent === '#A8D8EA' ? '#1a6b8a' : '#1a6b4a' }}
      >
        {chip}
      </span>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
    </div>
  </div>
);

// ─── HOME PAGE ────────────────────────────────────────────────
export default function Home({ lang = "en", setLang }) {
  const [currentPage, setCurrentPage] = useState(null); // null = home, 0-3 = feature pages
  const t = translations[lang] || translations["en"];

  const features = [
    { icon: <RecognitionIcon />, title: t.f1Title, description: t.f1Desc, accent: "#FFD166", delay: 0 },
    { icon: <TracingIcon />,     title: t.f2Title, description: t.f2Desc, accent: "#A8D8EA", delay: 100 },
    { icon: <GamifiedIcon />,   title: t.f3Title, description: t.f3Desc, accent: "#FFB3BA", delay: 200 },
    { icon: <ProgressIcon />,   title: t.f4Title, description: t.f4Desc, accent: "#B5EAD7", delay: 300 },
  ];

  // Navigate to a feature page, or back to home
  const navigateToFeature = (index) => {
    setCurrentPage(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goHome = (featureIndex = null) => {
    if (featureIndex !== null && typeof featureIndex === 'number') {
      setCurrentPage(featureIndex);
    } else {
      setCurrentPage(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show feature detail page
  if (currentPage !== null) {
    return <FeatureDetailPage featureIndex={currentPage} t={t} lang={lang} onBack={goHome} />;
  }

  return (
    <div className="font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }

        @keyframes floatA  { 0%,100%{transform:translateY(0px) rotate(-6deg)}  50%{transform:translateY(-12px) rotate(-6deg)} }
        @keyframes floatB  { 0%,100%{transform:translateY(0px) rotate(5deg)}   50%{transform:translateY(-16px) rotate(5deg)} }
        @keyframes floatC  { 0%,100%{transform:translateY(0px) rotate(-3deg)}  50%{transform:translateY(-10px) rotate(-3deg)} }
        @keyframes floatD  { 0%,100%{transform:translateY(0px) rotate(8deg)}   50%{transform:translateY(-14px) rotate(8deg)} }
        @keyframes floatE  { 0%,100%{transform:translateY(0px) rotate(-5deg)}  50%{transform:translateY(-18px) rotate(-5deg)} }
        @keyframes floatF  { 0%,100%{transform:translateY(0px) rotate(4deg)}   50%{transform:translateY(-10px) rotate(4deg)} }
        @keyframes floatG  { 0%,100%{transform:translateY(0px) rotate(-7deg)}  50%{transform:translateY(-13px) rotate(-7deg)} }
        @keyframes floatH  { 0%,100%{transform:translateY(0px) rotate(6deg)}   50%{transform:translateY(-15px) rotate(6deg)} }
        @keyframes floatI  { 0%,100%{transform:translateY(0px) rotate(-4deg)}  50%{transform:translateY(-11px) rotate(-4deg)} }
        @keyframes spin    { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:0.15} 50%{opacity:0.35} }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

        .la { animation: floatA 3.2s ease-in-out infinite; transform-origin: center; }
        .lb { animation: floatB 2.8s ease-in-out infinite 0.4s; transform-origin: center; }
        .lc { animation: floatC 3.5s ease-in-out infinite 0.8s; transform-origin: center; }
        .ld { animation: floatD 2.6s ease-in-out infinite 1.2s; transform-origin: center; }
        .le { animation: floatE 3.8s ease-in-out infinite 0.2s; transform-origin: center; }
        .lf { animation: floatF 3.0s ease-in-out infinite 1.5s; transform-origin: center; }
        .lg { animation: floatG 2.9s ease-in-out infinite 0.6s; transform-origin: center; }
        .lh { animation: floatH 3.4s ease-in-out infinite 1.0s; transform-origin: center; }
        .li { animation: floatI 3.1s ease-in-out infinite 1.8s; transform-origin: center; }
        .bg-spin { animation: spin 30s linear infinite; transform-origin: 160px 160px; }
        .bg-pulse { animation: pulse 4s ease-in-out infinite; }

        .hero-badge   { animation: slideUp 0.6s ease-out 0.1s both; }
        .hero-title   { animation: slideUp 0.7s ease-out 0.25s both; }
        .hero-sub     { animation: slideUp 0.6s ease-out 0.4s both; }
        .hero-btns    { animation: slideUp 0.6s ease-out 0.55s both; }
        .hero-stats   { animation: slideUp 0.6s ease-out 0.7s both; }
        .hero-visual  { animation: scaleIn 0.8s ease-out 0.3s both; }

        .gradient-text {
          background: linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .btn-gradient {
          background: linear-gradient(135deg, #1a1a1a 0%, #374151 100%);
          box-shadow: 0 4px 15px rgba(26,26,26,0.3);
          transition: all 0.3s ease;
        }
        .btn-gradient:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 25px rgba(26,26,26,0.4), 0 0 30px rgba(255,209,102,0.15);
        }
        .btn-gradient:active { transform: translateY(0) scale(0.98); }

        .btn-outline {
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .btn-outline:hover {
          transform: translateY(-2px) scale(1.02);
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.6);
        }

        .glass-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .floating-badge {
          backdrop-filter: blur(12px);
          background: rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }

        .stat-item { transition: transform 0.2s ease; }
        .stat-item:hover { transform: translateY(-2px); }

        .feature-card-anim { animation: slideUp 0.6s ease-out both; }

        .step-connector {
          background: linear-gradient(90deg, transparent, #e5e7eb 30%, #e5e7eb 70%, transparent);
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(10,10,20,0.82) 0%, rgba(10,10,20,0.65) 50%, rgba(10,10,20,0.55) 100%)' }}
          />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom right, rgba(139,92,246,0.08), rgba(251,191,36,0.06), rgba(59,130,246,0.04))' }}
          />
        </div>

        <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full pt-20 pb-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-7">
              <div className="hero-badge inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full text-sm font-semibold"
                style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fde68a', backdropFilter: 'blur(8px)' }}
              >
                <span>🎓</span>
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="hero-title text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                {t.heroTitle1}<br/>
                <span className="gradient-text">{t.heroTitle2}</span><br/>
                {t.heroTitle3}
              </h1>

              <p className="hero-sub text-white/70 text-lg leading-relaxed max-w-md">{t.heroSub}</p>

              <div className="hero-btns flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => { const el = document.getElementById('features'); el && el.scrollIntoView({ behavior: 'smooth' }); }}
                  className="btn-gradient text-white font-black px-8 py-4 rounded-2xl text-base flex items-center gap-2.5"
                >
                  <span>{t.heroCta}</span>
                  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
                <button className="btn-outline text-white/90 font-semibold px-7 py-4 rounded-2xl text-base border border-white/25 flex items-center gap-2">
                  <span className="text-lg">▶</span>
                  <span>{t.heroDemo}</span>
                </button>
              </div>

              <div className="hero-stats flex flex-wrap gap-8 pt-6 border-t border-white/10">
                {[
                  { value: "50+", label: t.stat1 },
                  { value: "100%", label: t.stat2 },
                  { value: "5–12", label: t.stat3 },
                ].map(({ value, label }) => (
                  <div key={label} className="stat-item cursor-default">
                    <p className="text-3xl font-black text-white">{value}</p>
                    <p className="text-xs text-white/50 font-semibold mt-0.5 tracking-wide uppercase">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual relative flex justify-center items-center">
              <div className="absolute inset-0 rounded-[3rem] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)', filter: 'blur(20px)', transform: 'scale(1.1)' }}
              />
              <div className="glass-card rounded-[2.5rem] p-3 relative">
                <div className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-[2rem] overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(255,249,240,0.12) 0%, rgba(168,216,234,0.08) 100%)' }}
                >
                  <svg viewBox="0 0 320 320" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <circle className="bg-pulse" cx="160" cy="160" r="130" fill="#FFD166" opacity="0.1"/>
                    <circle className="bg-pulse" cx="160" cy="160" r="90" fill="#A8D8EA" opacity="0.08" style={{animationDelay:"2s"}}/>
                    <circle className="bg-spin" cx="160" cy="160" r="118" fill="none" stroke="#FFD166" strokeWidth="1.5" strokeDasharray="8 12" opacity="0.3"/>
                    <g className="la" style={{transformOrigin:"160px 160px"}}>
                      <rect x="118" y="118" width="84" height="84" rx="20" fill="#FFD166"/>
                      <rect x="118" y="118" width="84" height="84" rx="20" fill="none" stroke="#F4A623" strokeWidth="2"/>
                      <text x="160" y="178" fontSize="52" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ක</text>
                    </g>
                    <g className="lb" style={{transformOrigin:"160px 52px"}}>
                      <rect x="132" y="28" width="56" height="56" rx="14" fill="#FFB3BA"/>
                      <text x="160" y="68" fontSize="30" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ආ</text>
                    </g>
                    <g className="lc" style={{transformOrigin:"248px 80px"}}>
                      <rect x="222" y="54" width="52" height="52" rx="13" fill="#B5EAD7"/>
                      <text x="248" y="92" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ඇ</text>
                    </g>
                    <g className="ld" style={{transformOrigin:"272px 160px"}}>
                      <rect x="248" y="134" width="52" height="52" rx="13" fill="#A8D8EA"/>
                      <text x="274" y="172" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ඉ</text>
                    </g>
                    <g className="le" style={{transformOrigin:"245px 245px"}}>
                      <rect x="220" y="220" width="50" height="50" rx="13" fill="#C9B8F0"/>
                      <text x="245" y="257" fontSize="26" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ඊ</text>
                    </g>
                    <g className="lf" style={{transformOrigin:"160px 272px"}}>
                      <rect x="134" y="248" width="52" height="52" rx="13" fill="#FFDBA4"/>
                      <text x="160" y="285" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">උ</text>
                    </g>
                    <g className="lg" style={{transformOrigin:"72px 245px"}}>
                      <rect x="47" y="220" width="50" height="50" rx="13" fill="#FFB3BA"/>
                      <text x="72" y="254" fontSize="24" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ඌ</text>
                    </g>
                    <g className="lh" style={{transformOrigin:"46px 160px"}}>
                      <rect x="20" y="134" width="52" height="52" rx="13" fill="#B5EAD7"/>
                      <text x="46" y="172" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">එ</text>
                    </g>
                    <g className="li" style={{transformOrigin:"72px 80px"}}>
                      <rect x="46" y="54" width="52" height="52" rx="13" fill="#FFDBA4"/>
                      <text x="72" y="93" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">අ</text>
                    </g>
                    <text x="28"  y="28"  fontSize="14" fill="#FFD166" opacity="0.8">✦</text>
                    <text x="288" y="40"  fontSize="10" fill="#FFB3BA" opacity="0.8">★</text>
                    <text x="295" y="295" fontSize="12" fill="#B5EAD7" opacity="0.8">✦</text>
                    <text x="18"  y="298" fontSize="10" fill="#A8D8EA" opacity="0.8">★</text>
                  </svg>
                </div>
              </div>

              <div className="floating-badge absolute -top-5 -left-4 rounded-2xl px-4 py-2.5 flex items-center gap-2"
                style={{ animation: 'floatA 3.5s ease-in-out infinite' }}
              >
                <span className="text-base">✏️</span>
                <span className="text-sm font-bold text-gray-800 whitespace-nowrap">Trace & Learn</span>
              </div>
              <div className="floating-badge absolute -bottom-5 right-0 rounded-2xl px-4 py-2.5 flex items-center gap-2"
                style={{ animation: 'floatC 3.2s ease-in-out infinite 0.5s' }}
              >
                <span className="text-base">🏆</span>
                <span className="text-sm font-bold text-gray-800 whitespace-nowrap">Earn Badges</span>
              </div>
              <div className="floating-badge absolute top-1/2 -right-4 -translate-y-1/2 rounded-2xl px-4 py-2.5 flex items-center gap-2"
                style={{ animation: 'floatE 2.9s ease-in-out infinite 1s' }}
              >
                <span className="text-base text-green-500">✓</span>
                <span className="text-sm font-bold text-gray-800 whitespace-nowrap">ක Recognized!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
        />
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-5 py-2.5 rounded-full mb-6">
              {t.sectionLabel}
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4 leading-tight">
              {t.sectionTitle1}<br/>{t.sectionTitle2}
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">{t.sectionSub}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="feature-card-anim" style={{ animationDelay: `${i * 120}ms` }}>
                <FeatureCard {...f} onClick={() => navigateToFeature(i)} />
              </div>
            ))}
          </div>

          {/* Click hint */}
          <p className="text-center text-sm text-gray-400 font-semibold mt-8">
            👆 Click any feature card to explore it in detail
          </p>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #fafafa, #f3f4f6)' }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-5 py-2.5 rounded-full mb-6">
              {t.howLabel}
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">{t.howTitle}</h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">{t.howSub}</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-7 left-[calc(16.67%)] right-[calc(16.67%)] h-0.5 step-connector z-0 rounded-full" />
            <div className="flex flex-col md:flex-row items-start gap-12 md:gap-6">
              <Step icon={<LearnIcon />}    chip={t.step1Chip} title={t.step1Title} description={t.step1Desc} accent="#FFD166" />
              <Step icon={<PracticeIcon />} chip={t.step2Chip} title={t.step2Title} description={t.step2Desc} accent="#A8D8EA" />
              <Step icon={<TrackIcon />}    chip={t.step3Chip} title={t.step3Title} description={t.step3Desc} accent="#B5EAD7" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <section className="py-10 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)' }}
      >
        <div className="flex gap-10 whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10 items-center" aria-hidden={k === 1}
              style={{ animation: "marquee 18s linear infinite" }}>
              {["ක","ඛ","ග","ඝ","ච","ජ","ට","ඩ","ත","ද","න","ප","බ","ම","ය","ර","ල","ව","ස","හ"].map((l, i) => (
                <span key={i} className="text-white text-4xl font-serif opacity-50 hover:opacity-100 hover:text-yellow-300 transition-all duration-300 cursor-default">{l}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-[2.5rem] p-12 lg:p-16 text-center text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 60%, #0f172a 100%)' }}
          >
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
            />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }}
            />
            <div className="absolute inset-0 opacity-5 rounded-[2.5rem]"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            <div className="relative">
              <span className="text-5xl block mb-6">🌟</span>
              <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight">
                {t.ctaTitle1}<br/>
                <span className="text-yellow-400">{t.ctaTitle2}</span>
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto leading-relaxed">{t.ctaSub}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-black font-black px-10 py-4 rounded-2xl text-base hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all duration-200">
                  {t.ctaBtn1}
                </button>
                <button className="border-2 border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base hover:border-white/50 hover:bg-white/5 hover:scale-105 transition-all duration-200">
                  {t.ctaBtn2}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}