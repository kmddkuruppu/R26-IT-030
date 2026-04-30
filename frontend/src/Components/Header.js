import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navTranslations = {
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

const Navbar = ({ lang, setLang }) => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Safe fallback to English
  const t = navTranslations[lang] ?? navTranslations.en;

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ වෙනත් page එකෙන් navigate වෙලා home load වෙනකොට hash detect කරලා scroll කරනවා
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  // ✅ Home page එකේ ඉන්නවා නම් directly scroll, නැත්නම් navigate with hash
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const id = href.replace("#", "");

    if (location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/" + href);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
            <span className="text-white text-sm font-serif">ල</span>
          </div>
          <span className="font-black text-gray-900 text-lg tracking-tight">
            LetterHelper
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: t.navFeatures, href: "#features" },
            { label: t.navHow, href: "#how-it-works" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right: Language Switcher + CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {["en", "si", "ta"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  lang === l
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <a
            href="#features"
            onClick={(e) => handleNavClick(e, "#features")}
            className="hidden md:block bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 hover:scale-105 transition-all duration-200"
          >
            {t.navStart}
          </a>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;