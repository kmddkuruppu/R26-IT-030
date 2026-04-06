import { useState } from "react";


// ─── TRANSLATIONS ────────────────────────────────────────────────
const translations = {
  en: {
    // nav (also used by Header — kept here so t is the single source of truth)
    navFeatures: "Features",
    navHow: "How It Works",
    navStart: "Start Learning",
    // hero
    heroBadge: "For Primary School Kids",
    heroTitle1: "Learn Sinhala",
    heroTitle2: "Handwriting",
    heroTitle3: "the Smart Way",
    heroSub:
      "A fun, interactive companion that helps children master Sinhala letters with guided tracing, mini-games, and smart feedback — step by step.",
    heroCta: "Start Learning",
    heroDemo: "Watch Demo",
    stat1: "Sinhala Letters",
    stat2: "Free to Use",
    stat3: "Target Group",
    // features
    sectionLabel: "What We Offer",
    sectionTitle1: "Everything a Child Needs",
    sectionTitle2: "to Master Sinhala",
    sectionSub:
      "Four powerful components working together to make learning Sinhala handwriting joyful and effective.",
    f1Title: "Sinhala Letter Recognition",
    f1Desc: "Detect and recognize Sinhala letters instantly using AI-powered technology built for young learners.",
    f2Title: "Letter Tracing & Writing Practice",
    f2Desc: "Interactive tracing exercises that guide children stroke-by-stroke to develop confident handwriting.",
    f3Title: "Gamified Learning",
    f3Desc: "Fun mini-games and rewards that keep children engaged and excited to practice every day.",
    f4Title: "Practice Sentences & Progress Tracking",
    f4Desc: "Build vocabulary with practice sentences and let parents monitor improvement over time.",
    // how it works
    howLabel: "Simple Process",
    howTitle: "How It Works",
    howSub: "Three easy steps to take any child from beginner to confident Sinhala writer.",
    step1Chip: "Step 1", step1Title: "Learn Letters",
    step1Desc: "Explore the full Sinhala alphabet with clear audio and visual guides.",
    step2Chip: "Step 2", step2Title: "Practice Writing",
    step2Desc: "Trace each letter with guided strokes and get instant feedback.",
    step3Chip: "Step 3", step3Title: "Track Progress",
    step3Desc: "Collect badges and watch your skills grow day by day.",
    // cta
    ctaTitle1: "Ready to Start",
    ctaTitle2: "the Adventure?",
    ctaSub: "Join hundreds of young learners discovering the beauty of Sinhala handwriting. It's free, fun, and made just for kids!",
    ctaBtn1: "Get Started Now ✏️",
    ctaBtn2: "For Parents & Teachers",
    // footer
    footerDesc: "Sinhala Handwriting Learning Support System for Primary Age Kids. Making education joyful, one letter at a time.",
    footerLinks: "Quick Links",
    footerLink1: "Features", footerLink2: "How It Works", footerLink3: "For Parents", footerLink4: "For Teachers",
    footerAboutTitle: "About This Project",
    footerAbout: "An academic research initiative to support Sinhala handwriting literacy among primary school children through AI-assisted interactive technology.",
    footerCopy: "LetterHelper. All rights reserved.",
    footerBuilt: "Built with ❤️ for young Sinhala learners",
  },
  si: {
    navFeatures: "විශේෂාංග",
    navHow: "ක්‍රියා කරන ආකාරය",
    navStart: "ඉගෙනීම ආරම්භ කරන්න",
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
    footerDesc: "ප්‍රාථමික පාසල් දරුවන් සඳහා සිංහල අතින් ලිවීම ඉගෙනීමේ සහාය පද්ධතිය. අධ්‍යාපනය ප්‍රීතිමත් කිරීම, එක් අකුරක් බැගින්.",
    footerLinks: "ඉක්මන් සබැඳි",
    footerLink1: "විශේෂාංග", footerLink2: "ක්‍රියා කරන ආකාරය", footerLink3: "දෙමාපියන් සඳහා", footerLink4: "ගුරුවරුන් සඳහා",
    footerAboutTitle: "මෙම ව්‍යාපෘතිය ගැන",
    footerAbout: "AI-ආධාරිත අන්තර්ක්‍රියාකාරී තාක්ෂණය හරහා ප්‍රාථමික පාසල් දරුවන් අතර සිංහල ලේඛන සාක්ෂරතාවය සඳහා ශාස්ත්‍රීය පර්යේෂණ මුලපිරීමකි.",
    footerCopy: "LetterHelper. සියලු හිමිකම් ඇවිරිණි.",
    footerBuilt: "ළමා සිංහල ඉගෙන්නන් සඳහා ❤️ සමඟ ගොඩනගන ලදී",
  },
  ta: {
    navFeatures: "அம்சங்கள்",
    navHow: "எவ்வாறு செயல்படுகிறது",
    navStart: "கற்றலைத் தொடங்குங்கள்",
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
    f2Title: "எழுத்து குறிப்பிடல் & எழுத்துப் பயிற்சி",
    f2Desc: "குழந்தைகளை ஒவ்வொரு வரிப்பிடியாகவும் வழிகாட்டும் ஊடாடும் குறிப்பிடல் பயிற்சிகள்.",
    f3Title: "விளையாட்டு வழி கற்றல்",
    f3Desc: "குழந்தைகளை ஆர்வமாக வைத்திருக்கவும் ஒவ்வொரு நாளும் பயிற்சி செய்யவும் உற்சாகப்படுத்தும் வேடிக்கையான விளையாட்டுகள்.",
    f4Title: "பயிற்சி & முன்னேற்றக் கண்காணிப்பு",
    f4Desc: "பயிற்சி வாக்கியங்களுடன் வார்த்தை கலைஞரை உருவாக்கி, பெற்றோர்களை காலப்போக்கில் முன்னேற்றத்தை கண்காணிக்க அனுமதிக்கவும்.",
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
    footerDesc: "ஆரம்பப் பள்ளி குழந்தைகளுக்கான சிங்கள கையெழுத்து கற்றல் ஆதரவு அமைப்பு. கல்வியை மகிழ்ச்சியாக்குவது, ஒரு எழுத்தாக.",
    footerLinks: "விரைவு இணைப்புகள்",
    footerLink1: "அம்சங்கள்", footerLink2: "எவ்வாறு செயல்படுகிறது", footerLink3: "பெற்றோர்களுக்கு", footerLink4: "ஆசிரியர்களுக்கு",
    footerAboutTitle: "இந்த திட்டம் பற்றி",
    footerAbout: "AI-உதவிய ஊடாடும் தொழில்நுட்பம் மூலம் ஆரம்பப் பள்ளி குழந்தைகளிடையே சிங்கள எழுத்தறிவை ஆதரிக்கும் கல்விசார் ஆராய்ச்சி முன்னெடுப்பு.",
    footerCopy: "LetterHelper. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    footerBuilt: "இளம் சிங்கள கற்பவர்களுக்காக ❤️ உடன் கட்டப்பட்டது",
  },
};

// ─── ICONS ───────────────────────────────────────────────────────
const RecognitionIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#FFF9F0" stroke="#1a1a1a" strokeWidth="2"/>
    <text x="10" y="34" fontSize="22" fontFamily="serif" fill="#1a1a1a">ක</text>
    <circle cx="36" cy="14" r="7" fill="#1a1a1a"/>
    <path d="M33 14 L35.5 16.5 L40 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TracingIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
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
const GamifiedIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
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
const ProgressIcon = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
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

// ─── SUB-COMPONENTS ──────────────────────────────────────────────
const FeatureCard = ({ icon, title, description, accent }) => (
  <div
    className="group bg-white border-2 border-gray-100 rounded-3xl p-8 flex flex-col gap-5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default"
    style={{ borderTop: `4px solid ${accent}` }}
  >
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const Step = ({ icon, chip, title, description }) => (
  <div className="flex flex-col items-center text-center gap-4 flex-1">
    <div className="hover:scale-110 transition-transform duration-300">{icon}</div>
    <div>
      <span className="inline-block bg-gray-100 text-gray-500 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-2">
        {chip}
      </span>
      <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
    </div>
  </div>
);

// ─── HOME PAGE ───────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  const features = [
    { icon: <RecognitionIcon />, title: t.f1Title, description: t.f1Desc, accent: "#FFD166" },
    { icon: <TracingIcon />,     title: t.f2Title, description: t.f2Desc, accent: "#A8D8EA" },
    { icon: <GamifiedIcon />,   title: t.f3Title, description: t.f3Desc, accent: "#FFB3BA" },
    { icon: <ProgressIcon />,   title: t.f4Title, description: t.f4Desc, accent: "#B5EAD7" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased">

    

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-40"
          style={{ backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-7">
              <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2 w-fit">
                <span className="text-yellow-500 text-sm">🎓</span>
                <span className="text-sm font-semibold text-yellow-700">{t.heroBadge}</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                {t.heroTitle1}<br/>
                <span className="relative">
                  {t.heroTitle2}
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="#FFD166" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  </svg>
                </span><br/>
                {t.heroTitle3}
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md">{t.heroSub}</p>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="bg-black text-white font-bold px-8 py-4 rounded-2xl text-base hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                  {t.heroCta}
                  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
                <button className="text-gray-700 font-semibold px-6 py-4 rounded-2xl border-2 border-gray-200 hover:border-gray-400 hover:scale-105 transition-all duration-200">
                  {t.heroDemo}
                </button>
              </div>
              <div className="flex flex-wrap gap-8 pt-4 border-t border-gray-100">
                {[
                  { value: "50+", label: t.stat1 },
                  { value: "100%", label: t.stat2 },
                  { value: "5–12", label: t.stat3 },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-black text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center items-center">
              {/* Sinhala Letters Animated SVG */}
              <div className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-[3rem] border-2 border-gray-100 shadow-2xl overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-blue-50 flex items-center justify-center">
                <svg viewBox="0 0 320 320" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <style>{`
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
                  `}</style>

                  {/* Background decorative circles */}
                  <circle className="bg-pulse" cx="160" cy="160" r="130" fill="#FFD166" opacity="0.15"/>
                  <circle className="bg-pulse" cx="160" cy="160" r="90" fill="#A8D8EA" opacity="0.12" style={{animationDelay:"2s"}}/>

                  {/* Rotating dashed ring */}
                  <circle className="bg-spin" cx="160" cy="160" r="118" fill="none" stroke="#FFD166" strokeWidth="1.5" strokeDasharray="8 12" opacity="0.4"/>

                  {/* ── BIG CENTER LETTER: ක ── */}
                  <g className="la" style={{transformOrigin:"160px 160px"}}>
                    <rect x="118" y="118" width="84" height="84" rx="20" fill="#FFD166"/>
                    <rect x="118" y="118" width="84" height="84" rx="20" fill="none" stroke="#F4A623" strokeWidth="2"/>
                    <text x="160" y="178" fontSize="52" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ක</text>
                  </g>

                  {/* ── SURROUNDING LETTERS ── */}

                  {/* ආ - top */}
                  <g className="lb" style={{transformOrigin:"160px 52px"}}>
                    <rect x="132" y="28" width="56" height="56" rx="14" fill="#FFB3BA"/>
                    <rect x="132" y="28" width="56" height="56" rx="14" fill="none" stroke="#FF8FA3" strokeWidth="1.5"/>
                    <text x="160" y="68" fontSize="30" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ආ</text>
                  </g>

                  {/* ඇ - top right */}
                  <g className="lc" style={{transformOrigin:"248px 80px"}}>
                    <rect x="222" y="54" width="52" height="52" rx="13" fill="#B5EAD7"/>
                    <rect x="222" y="54" width="52" height="52" rx="13" fill="none" stroke="#7DCFB6" strokeWidth="1.5"/>
                    <text x="248" y="92" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ඇ</text>
                  </g>

                  {/* ඉ - right */}
                  <g className="ld" style={{transformOrigin:"272px 160px"}}>
                    <rect x="248" y="134" width="52" height="52" rx="13" fill="#A8D8EA"/>
                    <rect x="248" y="134" width="52" height="52" rx="13" fill="none" stroke="#6BBFD4" strokeWidth="1.5"/>
                    <text x="274" y="172" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ඉ</text>
                  </g>

                  {/* ඊ - bottom right */}
                  <g className="le" style={{transformOrigin:"245px 245px"}}>
                    <rect x="220" y="220" width="50" height="50" rx="13" fill="#C9B8F0"/>
                    <rect x="220" y="220" width="50" height="50" rx="13" fill="none" stroke="#A98EDF" strokeWidth="1.5"/>
                    <text x="245" y="257" fontSize="26" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ඊ</text>
                  </g>

                  {/* උ - bottom */}
                  <g className="lf" style={{transformOrigin:"160px 272px"}}>
                    <rect x="134" y="248" width="52" height="52" rx="13" fill="#FFDBA4"/>
                    <rect x="134" y="248" width="52" height="52" rx="13" fill="none" stroke="#FFC066" strokeWidth="1.5"/>
                    <text x="160" y="285" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">උ</text>
                  </g>

                  {/* ඌ - bottom left */}
                  <g className="lg" style={{transformOrigin:"72px 245px"}}>
                    <rect x="47" y="220" width="50" height="50" rx="13" fill="#FFB3BA"/>
                    <rect x="47" y="220" width="50" height="50" rx="13" fill="none" stroke="#FF8FA3" strokeWidth="1.5"/>
                    <text x="72" y="254" fontSize="24" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">ඌ</text>
                  </g>

                  {/* එ - left */}
                  <g className="lh" style={{transformOrigin:"46px 160px"}}>
                    <rect x="20" y="134" width="52" height="52" rx="13" fill="#B5EAD7"/>
                    <rect x="20" y="134" width="52" height="52" rx="13" fill="none" stroke="#7DCFB6" strokeWidth="1.5"/>
                    <text x="46" y="172" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">එ</text>
                  </g>

                  {/* අ - top left */}
                  <g className="li" style={{transformOrigin:"72px 80px"}}>
                    <rect x="46" y="54" width="52" height="52" rx="13" fill="#FFDBA4"/>
                    <rect x="46" y="54" width="52" height="52" rx="13" fill="none" stroke="#FFC066" strokeWidth="1.5"/>
                    <text x="72" y="93" fontSize="28" fontFamily="serif" textAnchor="middle" fill="#1a1a1a">අ</text>
                  </g>

                  {/* small sparkles */}
                  <text x="28"  y="28"  fontSize="14" fill="#FFD166" opacity="0.8">✦</text>
                  <text x="288" y="40"  fontSize="10" fill="#FFB3BA" opacity="0.8">★</text>
                  <text x="295" y="295" fontSize="12" fill="#B5EAD7" opacity="0.8">✦</text>
                  <text x="18"  y="298" fontSize="10" fill="#A8D8EA" opacity="0.8">★</text>
                </svg>
              </div>

              {/* Floating badges */}
              <span className="absolute -top-4 -left-4 bg-white border border-gray-200 shadow-md rounded-2xl px-4 py-2 text-sm font-semibold text-gray-800 whitespace-nowrap animate-bounce">✏️ Trace & Learn</span>
              <span className="absolute -bottom-4 right-0 bg-white border border-gray-200 shadow-md rounded-2xl px-4 py-2 text-sm font-semibold text-gray-800 whitespace-nowrap">🏆 Earn Badges</span>
              <span className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-2xl px-4 py-2 text-sm font-semibold text-gray-800 whitespace-nowrap">ක ✓ Recognized!</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-black text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-5">
              {t.sectionLabel}
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
              {t.sectionTitle1}<br/>{t.sectionTitle2}
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">{t.sectionSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-black text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-5">
              {t.howLabel}
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">{t.howTitle}</h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">{t.howSub}</p>
          </div>
          <div className="flex flex-col md:flex-row items-start gap-12 md:gap-6 relative">
            <div className="hidden md:block absolute top-7 left-[calc(16.67%)] right-[calc(16.67%)] h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 z-0" />
            <Step icon={<LearnIcon />}    chip={t.step1Chip} title={t.step1Title} description={t.step1Desc} />
            <Step icon={<PracticeIcon />} chip={t.step2Chip} title={t.step2Title} description={t.step2Desc} />
            <Step icon={<TrackIcon />}    chip={t.step3Chip} title={t.step3Title} description={t.step3Desc} />
          </div>
        </div>
      </section>

      {/* ── LETTER MARQUEE ── */}
      <section className="py-10 bg-black overflow-hidden">
        <div className="flex gap-10 whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10 items-center" aria-hidden={k === 1}
              style={{ animation: "marquee 18s linear infinite" }}>
              {["ක","ඛ","ග","ඝ","ච","ජ","ට","ඩ","ත","ද","න","ප","බ","ම","ය","ර","ල","ව","ස","හ"].map((l, i) => (
                <span key={i} className="text-white text-4xl font-serif opacity-70 hover:opacity-100 transition-opacity">{l}</span>
              ))}
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }`}</style>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-black rounded-[2.5rem] p-12 lg:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white opacity-5 translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-yellow-400 opacity-10 -translate-x-10 translate-y-10" />
            <div className="relative">
              <span className="text-5xl block mb-6">🌟</span>
              <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight">
                {t.ctaTitle1}<br/>
                <span className="text-yellow-400">{t.ctaTitle2}</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">{t.ctaSub}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-black font-black px-10 py-4 rounded-2xl text-base hover:scale-105 hover:shadow-2xl transition-all duration-200">
                  {t.ctaBtn1}
                </button>
                <button className="border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-base hover:border-white/70 hover:scale-105 transition-all duration-200">
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