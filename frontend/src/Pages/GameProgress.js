import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getGameProgress } from "../services/apiService";

const SINHALA_FONT = "'Noto Sans Sinhala','Iskoola Pota',serif";

const PAGE_T = {
  en: { title: "Game Progress", subtitle: "Real-time progress across every game", back: "← Back to Games", loading: "Loading your progress…", error: "Couldn't load progress. Please try again.", retry: "Retry", sessions: "Sessions", bestScore: "Best score", lastPlayed: "Last played", notPlayed: "Not played yet", playNow: "Play now →", gamesPlayed: "Games played", totalStars: "Total stars", totalSessions: "Total sessions" },
  si: { title: "ක්‍රීඩා ප්‍රගතිය", subtitle: "සෑම ක්‍රීඩාවකම realtime ප්‍රගතිය", back: "← ක්‍රීඩා වෙත ආපසු", loading: "ඔබේ ප්‍රගතිය load වෙනවා…", error: "ප්‍රගතිය load කරගත නොහැකි විය. නැවත උත්සාහ කරන්න.", retry: "නැවත උත්සාහ කරන්න", sessions: "සැසි", bestScore: "හොඳම ලකුණු", lastPlayed: "අවසන් ක්‍රීඩාව", notPlayed: "තවම ක්‍රීඩා කර නැත", playNow: "දැන් ක්‍රීඩා කරන්න →", gamesPlayed: "ක්‍රීඩා කළ ගණන", totalStars: "මුළු තරු", totalSessions: "මුළු සැසි" },
  ta: { title: "விளையாட்டு முன்னேற்றம்", subtitle: "ஒவ்வொரு விளையாட்டிலும் நேரடி முன்னேற்றம்", back: "← விளையாட்டுகளுக்குத் திரும்பு", loading: "உங்கள் முன்னேற்றம் ஏற்றுகிறது…", error: "முன்னேற்றத்தை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.", retry: "மீண்டும் முயற்சிக்கவும்", sessions: "அமர்வுகள்", bestScore: "சிறந்த மதிப்பெண்", lastPlayed: "கடைசியாக விளையாடியது", notPlayed: "இன்னும் விளையாடவில்லை", playNow: "இப்போது விளையாடு →", gamesPlayed: "விளையாடிய விளையாட்டுகள்", totalStars: "மொத்த நட்சத்திரங்கள்", totalSessions: "மொத்த அமர்வுகள்" },
};

// Mirrors MAX_SCORES / GAMES_CONFIG in GamifiedLearning.js — kept in sync manually.
// word-unscramble is included because it's playable (handleComplete/renderGame
// switch case) even though it isn't shown in the GAMES_CONFIG lobby grid.
const GAMES_META = [
  { id: "memory-match",    maxScore: 120, title: { en: "Memory Match",    si: "මතක ගැලපීම",         ta: "நினைவக பொருத்தம்" } },
  { id: "speed-quiz",      maxScore: 150, title: { en: "Speed Quiz",      si: "වේග ප්‍රශ්නාවලිය",     ta: "வேக வினாடி வினா" } },
  { id: "letter-hunt",     maxScore: 200, title: { en: "Letter Hunt",     si: "අකුරු සෙවීම",          ta: "எழுத்து வேட்டை" } },
  { id: "letter-puzzle",   maxScore: 250, title: { en: "Letter Puzzle",   si: "අකුරු ප්‍රහේලිකාව",     ta: "எழுத்து புதிர்" } },
  { id: "word-builder",    maxScore: 360, title: { en: "Word Builder",    si: "වචන ගොඩනැගිල්ල",       ta: "வார்த்தை கட்டமைப்பாளர்" } },
  // { id: "word-unscramble", maxScore: 100, title: { en: "Word Unscramble", si: "වචන ව්‍යාකූලතාව",       ta: "வார்த்தை குழப்பம்" } },
  { id: "missing-letter",  maxScore: 360, title: { en: "Missing Letter",  si: "අස්ථාන අකුර",          ta: "காணாமல் போன எழுத்து" } },
  { id: "line-connect",    maxScore: 360, title: { en: "Line Connect",    si: "රේඛා සම්බන්ධ කිරීම",   ta: "கோடு இணைப்பு" } },
];

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
  .font-display{font-family:'Playfair Display',serif;}
  .font-body{font-family:'DM Sans',sans-serif;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .hover-lift{transition:transform 0.28s cubic-bezier(.22,1,.36,1),box-shadow 0.28s ease;}
  .hover-lift:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.1);}
`;

export default function GameProgress({ lang = "en" }) {
  const t = PAGE_T[lang] ?? PAGE_T.en;
  const navigate = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [totals, setTotals]           = useState({ gamesPlayed: 0, totalStars: 0, totalSessions: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getGameProgress();
      const map = {};
      let starsSum = 0, sessionsSum = 0;
      (res?.games ?? []).forEach(g => {
        map[g.gameId] = g;
        starsSum    += g.bestStars ?? 0;
        sessionsSum += g.sessionsPlayed ?? 0;
      });
      setProgressMap(map);
      setTotals({
        gamesPlayed: res?.totalGamesPlayed ?? Object.keys(map).length,
        totalStars: starsSum,
        totalSessions: sessionsSum,
      });
    } catch (err) {
      console.error("Failed to load game progress:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-16">
      <style>{GLOBAL_CSS}</style>
      <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTop: "3px solid #111", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p className="font-body text-gray-400 text-sm">{t.loading}</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-16">
      <style>{GLOBAL_CSS}</style>
      <p className="font-body text-gray-500 text-sm">{t.error}</p>
      <button onClick={load} className="font-body bg-black text-white px-6 py-3 rounded-2xl text-sm hover:bg-gray-900 transition-all">{t.retry}</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-16">
      <style>{GLOBAL_CSS}</style>

      <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/gamified-learning")} className="font-body text-sm text-gray-400 hover:text-black transition-colors">{t.back}</button>
          <span className="font-body text-xs text-gray-400 uppercase tracking-widest">{t.title}</span>
          <span style={{ width: 100 }} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">{t.title}</h1>
          <p className="font-body text-gray-400 text-sm">{t.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          <div className="rounded-3xl p-8 border bg-black text-white border-black">
            <div className="font-body text-xs uppercase tracking-widest mb-4 text-gray-400">{t.gamesPlayed}</div>
            <div className="font-display text-5xl font-bold">{totals.gamesPlayed}/{GAMES_META.length}</div>
          </div>
          <div className="rounded-3xl p-8 border bg-gray-50 border-gray-100">
            <div className="font-body text-xs uppercase tracking-widest mb-4 text-gray-400">{t.totalStars}</div>
            <div className="font-display text-5xl font-bold text-black">{totals.totalStars}</div>
          </div>
          <div className="rounded-3xl p-8 border bg-gray-50 border-gray-100">
            <div className="font-body text-xs uppercase tracking-widest mb-4 text-gray-400">{t.totalSessions}</div>
            <div className="font-display text-5xl font-bold text-black">{totals.totalSessions}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES_META.map(meta => {
            const g = progressMap[meta.id];
            const played = !!g && (g.sessionsPlayed ?? 0) > 0;
            const pct = played ? Math.round(((g.bestScore ?? 0) / meta.maxScore) * 100) : 0;
            const title = meta.title[lang] ?? meta.title.en;

            return (
              <div key={meta.id} className={`hover-lift rounded-3xl border p-7 ${played ? "border-gray-100 bg-white" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-xl font-bold" style={{ fontFamily: SINHALA_FONT }}>{title}</h3>
                  {played ? (
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <svg key={i} viewBox="0 0 24 24" className="w-4 h-4" fill={i < (g.bestStars ?? 0) ? "#111" : "#e5e7eb"}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                        </svg>
                      ))}
                    </div>
                  ) : (
                    <span className="font-body text-xs text-gray-300">☆☆☆</span>
                  )}
                </div>

                {played ? (
                  <>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-black rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="flex justify-between font-body text-xs text-gray-400 mb-1">
                      <span>{t.bestScore}</span><span className="font-semibold text-black">{g.bestScore} / {meta.maxScore}</span>
                    </div>
                    <div className="flex justify-between font-body text-xs text-gray-400 mb-1">
                      <span>{t.sessions}</span><span className="font-semibold text-black">{g.sessionsPlayed}</span>
                    </div>
                    <div className="flex justify-between font-body text-xs text-gray-400">
                      <span>{t.lastPlayed}</span>
                      <span className="font-semibold text-black">
                        {g.lastPlayedAt ? new Date(g.lastPlayedAt).toLocaleDateString(lang === "si" ? "si-LK" : lang === "ta" ? "ta-LK" : "en-US", { month: "short", day: "numeric" }) : "—"}
                      </span>
                    </div>
                    {/* ─────────────────────────────────────────────
    FACE REACTIONS
───────────────────────────────────────────── */}

<div className="border-t border-gray-100 mt-5 pt-5">

  <div className="font-body text-xs uppercase tracking-wider text-gray-400 mb-3">
    {t.faceReactions}
  </div>

  {(g.faceReactions ?? []).length > 0 ? (

    <div className="flex flex-wrap gap-2">

      {(g.faceReactions ?? []).map((reaction) => {

        const reactionLabel =
          lang === "si"
            ? reaction.labelSi
            : lang === "ta"
              ? reaction.labelTa
              : reaction.labelEn;

        return (

          <div
            key={reaction.id}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
          >

            <span style={{ fontSize: 20 }}>
              {reaction.emoji ?? "😐"}
            </span>

            <div>

              <div className="font-body text-xs font-medium text-black">
                {reactionLabel ?? reaction.rawExpression}
              </div>

              {reaction.confidence != null && (

                <div className="font-body text-[10px] text-gray-400">

                  {Math.round(reaction.confidence * 100)}%

                </div>

              )}

            </div>

          </div>
        );
      })}

    </div>

  ) : (

    <p className="font-body text-xs text-gray-300">
      {t.noReactions}
    </p>

  )}

</div>


{/* ─────────────────────────────────────────────
    ACHIEVEMENTS
───────────────────────────────────────────── */}

<div className="border-t border-gray-100 mt-5 pt-5">

  <div className="font-body text-xs uppercase tracking-wider text-gray-400 mb-3">
    {t.achievements}
  </div>

  {(g.achievements ?? []).length > 0 ? (

    <div className="space-y-2">

      {(g.achievements ?? []).map((achievement) => {

        const title =
          lang === "si"
            ? achievement.titleSi ?? achievement.achievementTitle
            : achievement.achievementTitle;

        return (

          <div
            key={achievement.achievementType}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
          >

            <span style={{ fontSize: 22 }}>
              {achievement.icon ?? "🏆"}
            </span>

            <div className="min-w-0 flex-1">

              <div className="font-body text-xs font-semibold text-black">
                {title}
              </div>

              {achievement.tier && (

                <div className="font-body text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
                  {achievement.tier}
                </div>

              )}

            </div>

          </div>
        );
      })}

    </div>

  ) : (

    <p className="font-body text-xs text-gray-300">
      {t.noAchievements}
    </p>

  )}

</div>
                  </>
                ) : (
                  <>
                    <p className="font-body text-sm text-gray-400 mb-5">{t.notPlayed}</p>
                    <button onClick={() => navigate("/gamified-learning")} className="font-body text-xs font-medium text-gray-500 hover:text-black transition-colors">{t.playNow}</button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}