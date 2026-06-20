import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import logoSrc from "../Logo.png";
import { getToken, getStudent, logout } from "../services/authService";

const navTranslations = {
  en: {
    navFeatures: "Features",
    navHow: "How It Works",
    navStart: "Start Learning",
    viewProfile: "View Profile",
    logoutLabel: "Log Out",
  },
  si: {
    navFeatures: "විශේෂාංග",
    navHow: "ක්‍රියා කරන ආකාරය",
    navStart: "ඉගෙනීම ආරම්භ කරන්න",
    viewProfile: "පැතිකඩ බලන්න",
    logoutLabel: "ඉවත් වන්න",
  },
  ta: {
    navFeatures: "அம்சங்கள்",
    navHow: "எவ்வாறு செயல்படுகிறது",
    navStart: "கற்றலைத் தொடங்குங்கள்",
    viewProfile: "சுயவிவரத்தைப் பார்க்க",
    logoutLabel: "வெளியேறு",
  },
};

const Navbar = ({ lang, setLang }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const menuRef = useRef(null);
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

  // ── Check auth state on mount + whenever route changes (covers login/logout navigation) ──
  useEffect(() => {
    const token = getToken();
    setStudent(token ? getStudent() : null);
  }, [location]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const id = href.replace("#", "");

    if (location.pathname === "/home") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/home" + href);
    }
  };

  const handleViewProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    setStudent(null);
    navigate("/");
  };

  const initials = student
    ? `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      }`}
    >
      {/* ── thin top accent line ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-900/10 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── Logo (image) ── */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate("/"); }}
          className="flex items-center gap-2.5 group"
          aria-label="LetterHelper home"
        >
          {/* Image container — matches original 32 × 32 black rounded square */}
          <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-black/8 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <img
              src={logoSrc}
              alt="LetterHelper logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          <span className="font-black text-gray-900 text-lg tracking-tight leading-none select-none">
            නැණ තක්සලාව
          </span>
        </a>

        {/* ── Nav Links ── */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: t.navFeatures, href: "#features" },
            { label: t.navHow,      href: "#how-it-works" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200
                         after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-gray-900
                         after:transition-all after:duration-300 hover:after:w-full"
            >
              {label}
            </a>
          ))}
        </div>

        {/* ── Right: Language Switcher + CTA / Profile ── */}
        <div className="flex items-center gap-3">
          {/* Language pill */}
          <div className="flex items-center gap-0.5 bg-gray-100/80 backdrop-blur-sm rounded-xl p-1 ring-1 ring-gray-200/60">
            {["en", "si", "ta"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  lang === l
                    ? "bg-white shadow-sm text-gray-900 ring-1 ring-gray-200/80"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {student ? (
            /* ── Profile avatar + dropdown ── */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold
                           ring-2 ring-white shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
                aria-label="Account menu"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                {initials}
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden
                             animate-[fadeIn_0.15s_ease-out]"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">@{student.username}</p>
                  </div>

                  <button
                    onClick={handleViewProfile}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50
                               flex items-center gap-2.5 transition-colors duration-150"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
                    </svg>
                    {t.viewProfile}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50
                               flex items-center gap-2.5 transition-colors duration-150"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0-4-4m4 4H7m6 5v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
                    </svg>
                    {t.logoutLabel}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── CTA (not logged in) ── */
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, "#features")}
              className="hidden md:inline-flex items-center gap-1.5 bg-black text-white text-sm font-bold
                         px-5 py-2.5 rounded-xl hover:bg-gray-800 hover:scale-[1.03]
                         active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {t.navStart}
              {/* subtle arrow icon */}
              <svg
                className="w-3.5 h-3.5 opacity-70"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;