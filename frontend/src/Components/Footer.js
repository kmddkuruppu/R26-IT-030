// ─── FALLBACK TRANSLATIONS (en) ──────────────────────────────────
const defaultT = {
  footerDesc: "Sinhala Handwriting Learning Support System for Primary Age Kids. Making education joyful, one letter at a time.",
  footerLinks: "Quick Links",
  footerLink1: "Features", footerLink2: "How It Works", footerLink3: "For Parents", footerLink4: "For Teachers",
  footerAboutTitle: "About This Project",
  footerAbout: "An academic research initiative to support Sinhala handwriting literacy among primary school children through AI-assisted interactive technology.",
  footerCopy: "LetterHelper. All rights reserved.",
  footerBuilt: "Built with ❤️ for young Sinhala learners",
};

// ─── FOOTER ──────────────────────────────────────────────────────
// Props:
//   t  {object} – full translations object for current language
//               (pass the t = translations[lang] from the parent)
export default function Footer({ t }) {
  t = t ?? defaultT;
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✏️</span>
              <span className="font-black text-gray-900 text-xl tracking-tight">
                Letter<span className="text-yellow-400">Helper</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t.footerDesc}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm tracking-wide uppercase">{t.footerLinks}</h4>
            <ul className="flex flex-col gap-2">
              {[t.footerLink1, t.footerLink2, t.footerLink3, t.footerLink4].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm tracking-wide uppercase">{t.footerAboutTitle}</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{t.footerAbout}</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} {t.footerCopy}</p>
          <p className="text-gray-300 text-xs">{t.footerBuilt}</p>
        </div>
      </div>
    </footer>
  );
}