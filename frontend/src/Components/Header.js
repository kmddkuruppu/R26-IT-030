import { useState, useEffect } from "react";

// ─── TRANSLATIONS (nav keys for Header) ─────────────────────────
const translations = {
  en: {
    navFeatures: "Features",
    navHow: "How It Works",
    navStart: "Start Learning",
  },
  si: {
    navFeatures: "විශේෂාංග",
    navHow: "ක්‍රියා කරන ආකාරය",
    navStart: "ඉගෙනීම ආරම්භ කරන්න",
  },
  ta: {
    navFeatures: "அம்சங்கள்",
    navHow: "எவ்வாறு செயல்படுகிறது",
    navStart: "கற்றலைத் தொடங்குங்கள்",
  },
};

const DEFAULT_LANG = "en";

const LANGUAGES = [
  { code: "en", label: "EN",  full: "English", flag: "🇬🇧" },
  { code: "si", label: "සිං", full: "සිංහල",  flag: "🇱🇰" },
  { code: "ta", label: "த",   full: "தமிழ்",  flag: "🇮🇳" },
];

// ─── LANGUAGE SWITCHER ───────────────────────────────────────────
const LanguageSwitcher = ({ lang, setLang }) => {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 select-none"
      >
        <span className="text-base">{current.flag}</span>
        <span>{current.label}</span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[150px]">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left ${
                  lang === l.code ? "bg-gray-50 font-bold text-gray-900" : "font-medium text-gray-600"
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span>{l.full}</span>
                {lang === l.code && (
                  <svg className="w-3.5 h-3.5 ml-auto text-black" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7 L5.5 10.5 L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── HEADER ──────────────────────────────────────────────────────
// Props:
//   lang     {string}   – current language code ("en" | "si" | "ta")
//   setLang  {function} – setter to change language (lifted to parent)
export default function Header({ lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang] ?? translations[DEFAULT_LANG];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">✏️</span>
          <span className="font-black text-gray-900 text-lg tracking-tight">
            Letter<span className="text-yellow-400">Helper</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features"    className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">{t.navFeatures}</a>
          <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">{t.navHow}</a>
          <LanguageSwitcher lang={lang} setLang={setLang} />
          <button className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-200">
            {t.navStart}
          </button>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher lang={lang} setLang={setLang} />
          <button className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl">{t.navStart}</button>
        </div>
      </div>
    </nav>
  );
}