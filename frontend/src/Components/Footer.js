import React from "react";

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
    footerCopy: "LetterHelper. All rights reserved.",
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
    footerCopy: "LetterHelper. සියලු හිමිකම් ඇවිරිණි.",
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
  // ✅ SAFE FIX
  const t = footerTranslations[lang] ?? footerTranslations.en;

  return (
    <footer className="bg-gray-950 text-white py-16">
      <div className="max-w-6xl mx-auto px-6">

        <div className="grid md:grid-cols-3 gap-10 mb-12">

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center">
                <span className="text-black text-base font-bold">ල</span>
              </div>
              <span className="font-black text-xl">LetterHelper</span>
            </div>
            <p className="text-gray-400 text-sm">{t.footerDesc}</p>
          </div>

          <div>
            <h4 className="font-bold mb-5">{t.footerLinks}</h4>
            <ul className="flex flex-col gap-3">
              <li>{t.footerLink1}</li>
              <li>{t.footerLink2}</li>
              <li>{t.footerLink3}</li>
              <li>{t.footerLink4}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5">{t.footerAboutTitle}</h4>
            <p className="text-gray-400 text-sm">{t.footerAbout}</p>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 text-sm text-gray-500">
          © 2026 {t.footerCopy} — {t.footerBuilt}
        </div>

      </div>
    </footer>
  );
};

export default Footer;