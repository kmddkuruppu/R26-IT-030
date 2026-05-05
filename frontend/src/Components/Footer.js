import React, { useEffect, useRef } from "react";
import logoSrc from "../Logo.png";

const footerTranslations = {
  en: {
    footerDesc:
      "Sinhala Handwriting Learning Support System for Primary Age Kids. Making education joyful, one letter at a time.",
    footerLinks: "Quick Links",
    footerLink1: "Features",
    footerLink2: "How It Works",
    footerLink3: "For Parents",
    footerLink4: "For Teachers",
    footerAboutTitle: "About This Project",
    footerAbout:
      "An academic research initiative to support Sinhala handwriting literacy among primary school children through AI-assisted interactive technology.",
    footerCopy: "Nena Thaksalawa. All rights reserved.",
    footerBuilt: "Built with ❤️ for young Sinhala learners",
  },
  si: {
    footerDesc:
      "ප්‍රාථමික පාසල් දරුවන් සඳහා සිංහල අතින් ලිවීම ඉගෙනීමේ සහාය පද්ධතිය.",
    footerLinks: "ඉක්මන් සබැඳි",
    footerLink1: "විශේෂාංග",
    footerLink2: "ක්‍රියා කරන ආකාරය",
    footerLink3: "දෙමාපියන් සඳහා",
    footerLink4: "ගුරුවරුන් සඳහා",
    footerAboutTitle: "මෙම ව්‍යාපෘතිය ගැන",
    footerAbout:
      "AI-ආධාරිත අන්තර්ක්‍රියාකාරී තාක්ෂණය හරහා සිංහල ලේඛන සාක්ෂරතාවය.",
    footerCopy: "Nena Thaksalawa. සියලු හිමිකම් ඇවිරිණි.",
    footerBuilt: "ළමා සිංහල ඉගෙන්නන් සඳහා ❤️ සමඟ ගොඩනගන ලදී",
  },
  ta: {
    footerDesc:
      "ஆரம்பப் பள்ளி குழந்தைகளுக்கான சிங்கள கையெழுத்து கற்றல் ஆதரவு அமைப்பு.",
    footerLinks: "விரைவு இணைப்புகள்",
    footerLink1: "அம்சங்கள்",
    footerLink2: "எவ்வாறு செயல்படுகிறது",
    footerLink3: "பெற்றோர்களுக்கு",
    footerLink4: "ஆசிரியர்களுக்கு",
    footerAboutTitle: "இந்த திட்டம் பற்றி",
    footerAbout:
      "AI உதவியுடன் சிங்கள எழுத்தறிவை மேம்படுத்தும் திட்டம்.",
    footerCopy: "LetterHelper. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    footerBuilt: "இளம் கற்றவர்களுக்காக ❤️ உடன் கட்டப்பட்டது",
  },
};

const Footer = ({ lang }) => {
  const t = footerTranslations[lang] ?? footerTranslations.en;
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = footerRef.current?.querySelectorAll(".footer-animate");
            items?.forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }, i * 80);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const animBase = {
    opacity: 0,
    transform: "translateY(24px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  };

  const links = [t.footerLink1, t.footerLink2, t.footerLink3, t.footerLink4];

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes float-orb {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-18px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-8px); }
        }
        .footer-link-item {
          color: #9ca3af;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.25s ease, padding-left 0.25s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 0;
        }
        .footer-link-item:hover {
          color: #ffffff;
          padding-left: 6px;
        }
        .footer-link-item .arrow {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          transition: background 0.25s ease;
          flex-shrink: 0;
        }
        .footer-link-item:hover .arrow {
          background: rgba(255,255,255,0.15);
        }
        .divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent);
          margin-bottom: 28px;
        }
      `}</style>

      <footer
        ref={footerRef}
        style={{
          background: "#0d0d0d",
          color: "#fff",
          paddingTop: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating ambient orbs */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
            animation: "float-orb 12s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)",
            animation: "float-orb 16s ease-in-out infinite reverse",
            pointerEvents: "none",
          }}
        />

        {/* Top accent line with shimmer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.15) 70%, transparent 100%)",
            backgroundSize: "200% auto",
            animation: "shimmer 4s linear infinite",
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 32px",
            position: "relative",
          }}
        >
          {/* Main grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.8fr 1fr 1.2fr",
              gap: "52px",
              marginBottom: "60px",
            }}
          >
            {/* Brand */}
            <div className="footer-animate" style={animBase}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <img
                  src={logoSrc}
                  alt="නැණ තක්සලාව"
                  style={{ height: "44px", width: "auto", objectFit: "contain" }}
                />
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    letterSpacing: "-0.3px",
                    color: "#fff",
                  }}
                >
                  නැණ තක්සලාව
                </span>
              </div>

              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: "1.85",
                  maxWidth: "290px",
                  margin: "0 0 28px 0",
                }}
              >
                {t.footerDesc}
              </p>

              {/* Pill badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "999px",
                  padding: "7px 16px",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#fff",
                    animation: "pulse-dot 2s ease-in-out infinite",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#d1d5db", fontWeight: 600, letterSpacing: "0.3px" }}>
                  Academic Research Project
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-animate" style={{ ...animBase, transitionDelay: "0.1s" }}>
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#fff",
                  fontWeight: 700,
                  marginBottom: "28px",
                  opacity: 0.5,
                }}
              >
                {t.footerLinks}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                <li className="footer-link-item footer-animate" style={animBase}>
                  <span className="arrow">›</span>{t.footerLink1}
                </li>
                <li className="footer-link-item footer-animate" style={animBase}>
                  <span className="arrow">›</span>{t.footerLink2}
                </li>
                <li className="footer-link-item footer-animate" style={animBase}>
                  <span className="arrow">›</span>{t.footerLink3}
                </li>
                <li className="footer-link-item footer-animate" style={animBase}>
                  <span className="arrow">›</span>{t.footerLink4}
                </li>
              </ul>
            </div>

            {/* About */}
            <div className="footer-animate" style={{ ...animBase, transitionDelay: "0.2s" }}>
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#fff",
                  fontWeight: 700,
                  marginBottom: "28px",
                  opacity: 0.5,
                }}
              >
                {t.footerAboutTitle}
              </p>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: "1.85",
                  margin: "0 0 24px 0",
                }}
              >
                {t.footerAbout}
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>3</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>Languages</div>
                </div>
                <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>AI</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>Powered</div>
                </div>
                <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>Kids</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>Focused</div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="divider-line" />

          {/* Bottom bar */}
          <div
            className="footer-animate"
            style={{
              ...animBase,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              paddingBottom: "36px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#4b5563" }}>
              © 2026 {t.footerCopy}
            </span>
            <span style={{ fontSize: "13px", color: "#4b5563" }}>
              {t.footerBuilt}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;