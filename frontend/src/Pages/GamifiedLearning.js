import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── INLINE ICONS ─────────────────────────────────────────────────
const Ico = ({ d, size = 20, fill = "none", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const HomeIco     = ({ s = 20 }) => <Ico size={s} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const TrophyIco   = ({ s = 20 }) => <Ico size={s} d={["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.34","M14 14.66V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.34","M18 2H6v7a6 6 0 0 0 12 0V2z"]} />;
const StarIco     = ({ s = 20, fill = "none" }) => <Ico size={s} fill={fill} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />;
const AwardIco    = ({ s = 20 }) => <Ico size={s} d={["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z","M8.21 13.89 7 23l5-3 5 3-1.21-9.12"]} />;
const ZapIco      = ({ s = 20 }) => <Ico size={s} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />;
const TargetIco   = ({ s = 20 }) => <Ico size={s} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"]} />;
const ClockIco    = ({ s = 20 }) => <Ico size={s} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M12 6v6l4 2"]} />;
const RotateIco   = ({ s = 20 }) => <Ico size={s} d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5" />;
const CheckCircIco= ({ s = 20 }) => <Ico size={s} d={["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4 12 14.01l-3-3"]} />;
const PlayIco     = ({ s = 20 }) => <Ico size={s} fill="currentColor" d="M5 3l14 9-14 9V3z" />;
const SparklesIco = ({ s = 20 }) => <Ico size={s} d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z" />;
const BrainIco    = ({ s = 48 }) => <Ico size={s} d={["M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.66z","M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.66z"]} />;
const GiftIco     = ({ s = 48 }) => <Ico size={s} d={["M20 12v10H4V12","M2 7h20v5H2z","M12 22V7","M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z","M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"]} />;
const PuzzleIco   = ({ s = 48 }) => <Ico size={s} d="M20.5 10a2.5 2.5 0 0 1-2.5-2.5V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z" />;
const ChevronIco  = ({ s = 16, up = false }) => <Ico size={s} d={up ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />;
const Gamepad2Ico = ({ s = 64 }) => <Ico size={s} d={["M6 11l4-4 4 4","M14 13l4 4-4 4","M6 13l-4 4 4 4","M10 11l4 4-4 4","M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"]} />;

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

const shuffle  = (arr) => [...arr].sort(() => Math.random() - 0.5);
const randFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN    = (arr, n) => shuffle(arr).slice(0, n);

// ─── RESULT SCREEN ────────────────────────────────────────────────
function ResultScreen({ score, maxScore, time, moves, questionCount, onRetry, onBack }) {
  const pct   = Math.round((score / Math.max(maxScore, 1)) * 100);
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
  const msg   = pct >= 80 ? "Excellent Work" : pct >= 50 ? "Well Done" : "Keep Practicing";
  return (
    <div className="max-w-lg mx-auto px-6 py-20 pt-24 anim-scale-in">
      <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-2xl">
        <div className="bg-black text-white px-8 py-5 flex items-center justify-between">
          <span className="font-body text-xs text-gray-400 uppercase tracking-widest">Results</span>
          <button onClick={onRetry} className="font-body text-xs text-gray-400 hover:text-white transition-colors">Play Again →</button>
        </div>
        <div className="p-10 text-center">
          {/* Ring */}
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
          {/* Stars */}
          <div className="flex justify-center gap-2 my-4">
            {[0,1,2].map(i => (
              <svg key={i} viewBox="0 0 24 24" className={`w-8 h-8 transition-all duration-500`} fill={i < stars ? "#111" : "#e5e7eb"} style={{ transitionDelay: `${i * 120}ms` }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
              </svg>
            ))}
          </div>
          <div className="font-display text-6xl font-bold mb-1">{score}</div>
          <div className="font-body text-sm text-gray-400 mb-8">points earned</div>
          <div className="flex gap-3 text-center text-xs text-gray-400 font-body justify-center mb-8">
            {time      !== undefined && <span className="border border-gray-100 rounded-xl px-4 py-2"><span className="block font-display text-xl text-black">{time}s</span>Time</span>}
            {moves     !== undefined && <span className="border border-gray-100 rounded-xl px-4 py-2"><span className="block font-display text-xl text-black">{moves}</span>Moves</span>}
            {questionCount !== undefined && <span className="border border-gray-100 rounded-xl px-4 py-2"><span className="block font-display text-xl text-black">{questionCount}</span>Answered</span>}
          </div>
          <div className="flex gap-3">
            <button onClick={onRetry} className="font-body flex-1 bg-black text-white py-3 rounded-2xl text-sm hover:bg-gray-900 transition-all hover:shadow-lg">
              Play Again →
            </button>
            <button onClick={onBack} className="font-body flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl text-sm hover:border-black hover:text-black transition-all">
              ← All Games
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
function MemoryMatchGame({ letters, onComplete, onBack }) {
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
  const lockRef = useRef(false);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [done]);

  const handleClick = (idx) => {
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
        if (newMatched.size === PAIRS) setTimeout(() => { setDone(true); onComplete(score + 20); }, 600);
      } else {
        setWrongPair([a, b]);
        setTimeout(() => { setFlipped([]); setWrongPair([]); lockRef.current = false; }, 1000);
      }
    }
  };

  const restart = () => {
    setCards(makeCards()); setFlipped([]); setMatched(new Set());
    setMoves(0); setScore(0); setTimer(0); setDone(false); setWrongPair([]);
    lockRef.current = false;
  };

  if (done) return <ResultScreen score={score} maxScore={PAIRS*20} time={timer} moves={moves} onRetry={restart} onBack={onBack}/>;

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Game header */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors flex items-center gap-2">
            ← Back
          </button>
          <span className="font-body text-xs text-gray-400 uppercase tracking-widest">Memory Match</span>
          <div className="flex gap-5 font-body text-sm">
            <span className="text-gray-400">{timer}s</span>
            <span className="text-gray-400">{moves} moves</span>
            <span className="font-semibold">{score} pts</span>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="font-body text-center text-gray-400 text-sm mb-8">Match each letter with its name — find all {PAIRS} pairs</p>
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.has(card.matchId);
            const isMatched = matched.has(card.matchId);
            const isWrong   = wrongPair.includes(idx);
            return (
              <button key={card.uid} onClick={() => handleClick(idx)}
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
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 2 — SPEED QUIZ
// ═══════════════════════════════════════════════════════════════════
function SpeedQuizGame({ letters, onComplete, onBack }) {
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
  const timerRef = useRef(null);

  const next = useCallback(() => {
    if (qNum >= TOTAL_Q) { setDone(true); return; }
    setQ(makeQ()); setQNum(n => n + 1); setAnswered(null); setTimeLeft(Q_TIME);
  }, [qNum, makeQ]);

  useEffect(() => {
    if (done || answered !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setAnswered("__timeout__"); setAnsCount(c => c+1); setTimeout(next, 800); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [q, answered, done, next]);

  const answer = (opt) => {
    clearInterval(timerRef.current); setAnswered(opt); setAnsCount(c => c+1);
    if (opt === q.correct.name) setScore(s => s + (timeLeft >= 7 ? 15 : timeLeft >= 4 ? 10 : 5));
    setTimeout(next, 800);
  };

  const restart = () => { setQ(makeQ()); setQNum(1); setScore(0); setTimeLeft(Q_TIME); setAnswered(null); setDone(false); setAnsCount(0); };

  if (done) return <ResultScreen score={score} maxScore={TOTAL_Q*15} questionCount={ansCount} onRetry={restart} onBack={onBack}/>;

  const timePct = (timeLeft / Q_TIME) * 100;
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">← Back</button>
          <span className="font-body text-xs text-gray-400 uppercase tracking-widest">Speed Quiz</span>
          <div className="flex gap-5 font-body text-sm">
            <span className={timeLeft <= 4 ? "text-red-500 font-semibold" : "text-gray-400"}>{timeLeft}s</span>
            <span className="font-semibold">{score} pts</span>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-8">
          <span className="font-body text-xs text-gray-400">{qNum} / {TOTAL_Q}</span>
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${(qNum / TOTAL_Q) * 100}%` }}/>
          </div>
        </div>
        {/* Timer bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-8">
          <div className="h-1 rounded-full transition-all duration-1000" style={{ width: `${timePct}%`, background: timePct > 60 ? "#111" : timePct > 30 ? "#f59e0b" : "#ef4444" }}/>
        </div>
        {/* Letter display */}
        <div className="rounded-3xl border border-gray-100 bg-gray-50 px-8 py-12 text-center mb-8">
          <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-4">What is the name of this letter?</p>
          <div className="font-display" style={{ fontFamily: SINHALA_FONT, fontSize: 96, lineHeight: 1, color: "#111" }}>{q.correct.letter}</div>
        </div>
        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {q.options.map((opt, i) => {
            let cls = "border-gray-100 bg-white text-gray-800 hover:border-gray-300 hover:shadow-md";
            if (answered !== null) {
              if (opt === q.correct.name) cls = "border-black bg-black text-white shadow-lg scale-[1.02]";
              else if (opt === answered)  cls = "border-red-200 bg-red-50 text-red-600";
              else                        cls = "border-gray-100 bg-gray-50 text-gray-300";
            }
            return (
              <button key={i} onClick={() => answer(opt)} disabled={answered !== null}
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
}

// ═══════════════════════════════════════════════════════════════════
// GAME 3 — LETTER HUNT
// ═══════════════════════════════════════════════════════════════════
function LetterHuntGame({ letters, onComplete, onBack }) {
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

  const advanceRound = useCallback(() => {
    if (round + 1 >= TOTAL_ROUNDS) { setDone(true); return; }
    setRound(r => r+1); setData(makeRound()); setTimeLeft(ROUND_TIME); setRoundComplete(false);
  }, [round, makeRound]);

  useEffect(() => {
    if (done || roundComplete) return;
    const id = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(id); advanceRound(); return 0; } return t-1; }), 1000);
    return () => clearInterval(id);
  }, [round, roundComplete, done, advanceRound]);

  const handleClick = (cell) => {
    if (cell.found) return;
    if (cell.isTarget) {
      setData(prev => ({ ...prev, grid: prev.grid.map(c => c.id===cell.id ? {...c,found:true} : c) }));
      setScore(s => s+10); setFlash("correct"); setTimeout(() => setFlash(null), 400);
      const remaining = data.grid.filter(c => c.isTarget && !c.found && c.id !== cell.id);
      if (remaining.length === 0) { setRoundComplete(true); setTimeout(advanceRound, 900); }
    } else { setScore(s => Math.max(0, s-3)); setFlash("wrong"); setTimeout(() => setFlash(null), 400); }
  };

  const restart = () => { setRound(0); setData(makeRound()); setScore(0); setTimeLeft(ROUND_TIME); setDone(false); setRoundComplete(false); };

  if (done) return <ResultScreen score={score} maxScore={TOTAL_ROUNDS*40} onRetry={restart} onBack={onBack}/>;

  const found = data.grid.filter(c => c.isTarget && c.found).length;
  const timePct = (timeLeft / ROUND_TIME) * 100;

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">← Back</button>
          <span className="font-body text-xs text-gray-400 uppercase tracking-widest">Letter Hunt</span>
          <div className="flex gap-5 font-body text-sm">
            <span className="text-gray-400">Round {round+1}/{TOTAL_ROUNDS}</span>
            <span className={timeLeft <= 5 ? "text-red-500 font-semibold" : "text-gray-400"}>{timeLeft}s</span>
            <span className="font-semibold">{score} pts</span>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div className="h-1 rounded-full transition-all duration-1000" style={{ width: `${timePct}%`, background: timePct > 50 ? "#111" : timePct > 25 ? "#f59e0b" : "#ef4444" }}/>
        </div>
        {/* Target card */}
        <div className={`bg-gray-50 rounded-3xl border p-6 mb-6 flex items-center gap-6 transition-all duration-200 ${flash === "correct" ? "border-black" : flash === "wrong" ? "border-red-200" : "border-gray-100"}`}>
          <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center text-4xl font-bold flex-shrink-0"
            style={{ fontFamily: SINHALA_FONT }}>{data.target.letter}</div>
          <div>
            <p className="font-body text-xs text-gray-400 mb-1 uppercase tracking-wider">Find all of this letter</p>
            <p className="font-display text-2xl font-bold" style={{ fontFamily: SINHALA_FONT }}>{data.target.name}</p>
            <p className="font-body text-sm text-gray-400 mt-1">Found: {found} / {data.targetCount}</p>
          </div>
          <div className="ml-auto text-right font-body text-xs text-gray-300">
            <p>+10 correct</p><p className="text-red-300">−3 wrong</p>
          </div>
        </div>
        {/* Grid */}
        <div className="grid grid-cols-4 gap-3">
          {data.grid.map(cell => (
            <button key={cell.id} onClick={() => handleClick(cell)} disabled={cell.found}
              style={{ fontFamily: SINHALA_FONT }}
              className={`aspect-square rounded-2xl text-3xl font-bold transition-all hover:scale-105 border
                ${cell.found ? "bg-black text-white border-black scale-95 cursor-default" : "bg-white text-gray-800 hover:shadow-md border-gray-100 hover:border-gray-300"}`}>
              {cell.found ? "✓" : cell.letter}
            </button>
          ))}
        </div>
        {roundComplete && (
          <div className="mt-6 text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="font-display text-xl font-bold">Round Complete — Loading next…</p>
          </div>
        )}
      </div>
    </div>
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

function PieceTile({ piece, letter, color, isDragging, onDragStart }) {
  const tileW = TILE * piece.gridColSpan, tileH = TILE * piece.gridRowSpan;
  return (
    <div draggable onDragStart={onDragStart}
      className="hover-lift"
      style={{ width: tileW, height: tileH, borderRadius: 14, border: `2px solid ${color}44`, background: `${color}11`,
        cursor: "grab", opacity: isDragging ? 0.3 : 1, overflow: "hidden", userSelect: "none", flexShrink: 0 }}>
      <LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH}/>
    </div>
  );
}

function SlotTile({ piece, letter, color, filled, onDrop, onDragOver, isWrong }) {
  const tileW = TILE * piece.gridColSpan, tileH = TILE * piece.gridRowSpan;
  return (
    <div onDrop={onDrop} onDragOver={onDragOver}
      style={{ width: tileW, height: tileH, borderRadius: 14, position: "relative", overflow: "hidden",
        border: filled ? `2px solid ${color}88` : isWrong ? "2px solid #fca5a5" : "2px dashed #e5e7eb",
        background: filled ? `${color}11` : isWrong ? "#fef2f2" : "#f9fafb",
        transition: "all 0.3s" }}>
      <LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH} opacity={filled ? 1 : 0.1}/>
      {!filled && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <span style={{ fontSize: 20, color: "#d1d5db", fontWeight: "bold" }}>?</span>
      </div>}
      {filled && <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%",
        background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", pointerEvents: "none" }}>✓</div>}
    </div>
  );
}

function ChevronSidebar({ s = 16, up = false }) {
  return <ChevronIco s={s} up={up}/>;
}

function LetterPuzzleGame({ onBack, onComplete }) {
  const defaultLetter = LETTER_CATEGORIES[0].letters[0];
  const defaultColor  = LETTER_CATEGORIES[0].color;
  const [selectedLetter, setSelectedLetter] = useState(defaultLetter);
  const [currentColor, setCurrentColor]     = useState(defaultColor);
  const [pz, setPz]                         = useState(() => buildPuzzle(defaultLetter, defaultColor));
  const [score, setScore]                   = useState(0);
  const [pool, setPool]                     = useState([]);
  const [placed, setPlaced]                 = useState({});
  const [dragging, setDragging]             = useState(null);
  const [celebrating, setCelebrating]       = useState(false);
  const [completedLetters, setCompleted]    = useState(new Set());
  const [mistakes, setMistakes]             = useState(0);
  const [timer, setTimer]                   = useState(0);
  const [wrongSlot, setWrongSlot]           = useState(null);
  const [openCat, setOpenCat]               = useState(0);
  const timerRef = useRef(null);

  const initPuzzle = useCallback((letterObj, color) => {
    const newPz = buildPuzzle(letterObj, color);
    setPz(newPz);
    setPool(shuffle(newPz.pieces.map(p => p.id)));
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
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (slotId) => {
    if (!dragging) return;
    if (dragging === slotId) {
      const newPlaced = { ...placed, [slotId]: true };
      setPlaced(newPlaced); setPool(p => p.filter(id => id !== dragging));
      const earned = Math.max(5, 25 - mistakes * 4);
      setScore(s => s + earned);
      if (Object.keys(newPlaced).length === pz.pieces.length) {
        clearInterval(timerRef.current); setCelebrating(true);
        setCompleted(c => new Set([...c, pz.letter])); onComplete && onComplete(earned);
      }
    } else { setMistakes(m => m + 1); setWrongSlot(slotId); setTimeout(() => setWrongSlot(null), 700); }
    setDragging(null);
  };

  const boardW = pz.gridCols * TILE, boardH = pz.gridRows * TILE;

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="border-b border-gray-100 bg-white sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="font-body text-sm text-gray-400 hover:text-black transition-colors">← Back</button>
          <span className="font-body text-xs text-gray-400 uppercase tracking-widest">Letter Puzzle</span>
          <div className="flex gap-5 font-body text-sm">
            <span className="text-gray-400">{completedLetters.size} done</span>
            <span className="text-gray-400">{timer}s</span>
            <span className={mistakes > 0 ? "text-red-500" : "text-gray-400"}>{mistakes} mistakes</span>
            <span className="font-semibold">{score} pts</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6" style={{ alignItems: "flex-start" }}>
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 rounded-3xl border border-gray-100 overflow-hidden" style={{ maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <p className="font-body text-xs text-gray-400 uppercase tracking-widest">Select Letter</p>
            <p className="font-body text-xs text-gray-400 mt-1">{completedLetters.size}/{SINHALA_LETTERS.length} complete</p>
          </div>
          <div style={{ overflowY: "auto", flex: 1, paddingBottom: 8 }}>
            {LETTER_CATEGORIES.map((cat, ci) => (
              <div key={ci}>
                <button onClick={() => setOpenCat(openCat === ci ? -1 : ci)}
                  className="w-full px-4 py-2.5 flex items-center justify-between border-b border-gray-50 font-body text-xs font-semibold transition-all"
                  style={{ background: openCat === ci ? "#f9fafb" : "white", color: openCat === ci ? "#111" : "#9ca3af" }}>
                  <span>{cat.name}</span><ChevronSidebar s={12} up={openCat === ci}/>
                </button>
                {openCat === ci && (
                  <div className="flex flex-wrap gap-1.5 p-3">
                    {cat.letters.map((l, li) => {
                      const isSel = selectedLetter?.letter === l.letter;
                      const isDone = completedLetters.has(l.letter);
                      return (
                        <button key={li} onClick={() => handleSelectLetter(l, cat.color)}
                          style={{ fontFamily: SINHALA_FONT, border: isSel ? `2px solid ${cat.color}` : isDone ? "2px solid #22c55e" : "1px solid #e5e7eb",
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

        {/* Puzzle area */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="text-center">
            <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-2">Drag pieces onto matching slots</p>
            <div className="font-bold mb-1" style={{ fontFamily: SINHALA_FONT, fontSize: 64, color: currentColor, lineHeight: 1 }}>{pz.letter}</div>
            <p className="font-body text-sm text-gray-400">{pz.name}</p>
            {celebrating && <p className="font-display text-lg font-bold mt-2" style={{ color: currentColor }}>Complete! Pick the next letter →</p>}
          </div>

          <div className="flex gap-8 items-start justify-center">
            {/* Board */}
            <div className="flex flex-col items-center gap-3">
              <p className="font-body text-xs text-gray-400 uppercase tracking-widest">Assembly Board</p>
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
                        <SlotTile piece={slot} letter={pz.letter} color={currentColor} filled={!!placed[slot.id]} isWrong={wrongSlot === slot.id} onDrop={() => handleDrop(slot.id)} onDragOver={handleDragOver}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-4 flex-1 min-w-52">
              <p className="font-body text-xs text-gray-400 uppercase tracking-widest text-center">Letter Pieces</p>
              <div className="bg-gray-50 rounded-3xl border border-gray-100 p-4 min-h-36 flex flex-wrap gap-3 justify-center items-center" onDragOver={handleDragOver} onDrop={() => setDragging(null)}>
                {celebrating ? (
                  <div className="text-center py-2">
                    <div className="font-display text-2xl font-bold mb-1">Complete!</div>
                    <p className="font-body text-xs text-gray-400">Pick another from sidebar</p>
                  </div>
                ) : pool.length === 0 ? (
                  <div className="text-center py-2"><p className="font-display text-lg font-bold">All placed!</p></div>
                ) : pool.map(pid => {
                  const piece = pz.pieces.find(p => p.id === pid);
                  return <PieceTile key={pid} piece={piece} letter={pz.letter} color={currentColor} isDragging={dragging === pid} onDragStart={() => setDragging(pid)}/>;
                })}
              </div>
              {/* Hint */}
              <div className="rounded-2xl border border-gray-100 p-4 text-center bg-gray-50">
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-2">Hint</p>
                <div className="mx-auto" style={{ width: 80, height: 80 }}>
                  <svg width={80} height={80} viewBox="10 10 180 180">
                    <text x="100" y="155" textAnchor="middle" fontSize="160" fontFamily={SINHALA_FONT} fill={currentColor} fontWeight="900" opacity="0.6">{pz.letter}</text>
                  </svg>
                </div>
              </div>
              {/* Reset */}
              <button onClick={() => initPuzzle(selectedLetter, currentColor)}
                className="font-body w-full border border-gray-200 text-gray-500 py-2.5 rounded-xl text-xs hover:border-gray-400 hover:text-black transition-all">
                Reset Puzzle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAMES CONFIG
// ═══════════════════════════════════════════════════════════════════
const GAMES_CONFIG = [
  { id: "memory-match",  title: "Memory Match",  subtitle: "Match each letter with its name",      Icon: BrainIco,  difficulty: "Easy",   points: 120, tag: "Pairs" },
  { id: "speed-quiz",    title: "Speed Quiz",    subtitle: "10-second timer per question",          Icon: ZapIco,    difficulty: "Medium", points: 150, tag: "Timed" },
  { id: "letter-hunt",   title: "Letter Hunt",   subtitle: "Find the correct letter in the grid",   Icon: TargetIco, difficulty: "Easy",   points: 200, tag: "Search" },
  { id: "letter-puzzle", title: "Letter Puzzle", subtitle: "Assemble letter pieces into the slot",  Icon: PuzzleIco, difficulty: "Medium", points: 250, tag: "Puzzle" },
];

// ═══════════════════════════════════════════════════════════════════
// LOBBY — MAIN PAGE (matches Progress.js aesthetic)
// ═══════════════════════════════════════════════════════════════════
export default function GamifiedLearningPage({ lang = "en" }) {
  const navigate = useNavigate();
  const [selected,    setSelected]   = useState(null);
  const [totalScore,  setTotal]      = useState(0);
  const [totalStars,  setStars]      = useState(0);
  const [achievements,setAchiev]     = useState([]);
  const [heroVisible, setHeroVisible]= useState(false);
  const [showStats,   setShowStats]  = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    setTimeout(() => setShowStats(true), 600);
  }, []);

  const handleComplete = (score) => {
    setTotal(t => t + score);
    setStars(s => s + Math.min(3, Math.floor(score / 30)));
    if (totalScore + score >= 500 && !achievements.includes("master")) setAchiev(a => [...a, "master"]);
  };

  const handleBack = () => setSelected(null);

  const renderGame = () => {
    const props = { letters: SINHALA_LETTERS, onBack: handleBack, onComplete: handleComplete };
    switch (selected) {
      case "memory-match":  return <MemoryMatchGame  {...props}/>;
      case "speed-quiz":    return <SpeedQuizGame    {...props}/>;
      case "letter-hunt":   return <LetterHuntGame   {...props}/>;
      case "letter-puzzle": return <LetterPuzzleGame onBack={handleBack} onComplete={handleComplete}/>;
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
        .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .hover-lift { transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease; }
        .hover-lift:hover { transform: translateY(-3px) scale(1.015); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
      `}</style>
      {renderGame()}
    </div>
  );

  const statCards = [
    { label: "Total Score", value: totalScore, suffix: " pts" },
    { label: "Stars Earned", value: totalStars, suffix: "" },
    { label: "Badges", value: achievements.length, suffix: "" },
  ];

  const chartBars = [30, 45, 60, 40, 70, 55, 80];

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
        {/* Background geometry */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50" style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }}/>
          <svg className="absolute bottom-0 left-0 opacity-5 w-96 h-96" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="180" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="120" stroke="black" strokeWidth="1"/>
            <circle cx="200" cy="200" r="60" stroke="black" strokeWidth="1"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div className={heroVisible ? "anim-fade-up" : "opacity-0"}>
            <span className="font-body inline-block text-xs tracking-[0.2em] uppercase border border-black px-3 py-1 mb-8 anim-fade-in delay-1">
              Gamified Learning System
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-800 leading-[1.08] mb-6 anim-fade-up delay-2">
              Play Your Way to{" "}
              <em className="not-italic underline decoration-2 underline-offset-4">Sinhala</em>{" "}
              Mastery
            </h1>
            <p className="font-body text-gray-500 text-lg leading-relaxed mb-10 max-w-md anim-fade-up delay-3">
              Four uniquely crafted games — each designed to build letter recognition, speed, and confidence through play.
            </p>
            <div className="flex flex-wrap gap-4 anim-fade-up delay-4">
              <button
                onClick={() => setSelected("speed-quiz")}
                className="font-body bg-black text-white px-7 py-3.5 rounded-2xl text-sm font-medium hover:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Quick Play →
              </button>
              <button
                onClick={() => setSelected("letter-puzzle")}
                className="font-body border border-black text-black px-7 py-3.5 rounded-2xl text-sm font-medium hover:bg-black hover:text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Try Letter Puzzle
              </button>
            </div>
          </div>

          {/* Hero illustration — score snapshot */}
          <div className={`relative ${heroVisible ? "anim-scale-in delay-2" : "opacity-0"}`}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-2xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Gamepad2Ico s={24}/>
                  </div>
                  <div>
                    <div className="font-body text-xs text-gray-400 mb-1">Active today</div>
                    <div className="font-display text-xl font-semibold">4 Games Available</div>
                  </div>
                </div>
                {/* Mini game preview grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {GAMES_CONFIG.map((g, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                      <g.Icon s={22}/>
                      <div>
                        <div className="font-body text-xs font-semibold">{g.title}</div>
                        <div className="font-body text-xs text-gray-400">{g.points} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-black mt-0.5"/>
                    <span className="font-body text-xs text-gray-500">Best possible score</span>
                  </div>
                  <div className="font-display text-2xl font-bold">720 pts</div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 font-body text-xs">
                <div className="text-gray-400 mb-0.5">Difficulty</div>
                <div className="font-semibold text-sm flex gap-1">Easy — Medium</div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-black text-white rounded-2xl shadow-xl px-4 py-3 font-body text-xs">
                <div className="text-gray-400 mb-0.5">Letters covered</div>
                <div className="font-semibold text-sm sinhala">{SINHALA_LETTERS.length} letters</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GAMES GRID ─── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Choose Your Game</h2>
          <p className="font-body text-gray-400 text-base max-w-md mx-auto">Four ways to build Sinhala letter mastery — each game targets a different skill</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES_CONFIG.map((game, i) => (
            <div key={game.id}
              onClick={() => setSelected(game.id)}
              className={`game-card cursor-pointer rounded-3xl border-2 p-8 bg-gray-50 hover:border-black border-gray-100 group`}>
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
                <game.Icon s={28}/>
              </div>
              {/* Tag */}
              <div className="flex gap-2 mb-4">
                <span className="font-body text-xs border border-gray-200 text-gray-500 px-2.5 py-1 rounded-lg">{game.tag}</span>
                <span className={`font-body text-xs px-2.5 py-1 rounded-lg ${game.difficulty === "Easy" ? "bg-gray-100 text-gray-600" : "border border-gray-200 text-gray-500"}`}>{game.difficulty}</span>
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">{game.title}</h3>
              <p className="font-body text-sm text-gray-400 leading-relaxed mb-8">{game.subtitle}</p>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-gray-400 flex items-center gap-1">
                  <StarIco s={12} fill="#111"/> {game.points} pts max
                </span>
                <button className="font-body text-xs font-medium text-gray-500 group-hover:text-black transition-colors flex items-center gap-1">
                  Play <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Your Progress</h2>
          <p className="font-body text-gray-400 text-sm">Track improvement across all games</p>
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

        {/* Score trend chart */}
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display text-lg font-semibold">Score Trend</h4>
            <span className="font-body text-xs text-gray-400">Last 7 sessions</span>
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
            <span>0 pts</span><span>500 pts</span><span>1000 pts</span>
          </div>
        </div>

        {/* Achievement badges — only shown after earned */}
        {achievements.length > 0 && (
          <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="bg-black text-white px-8 py-5 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">Achievements Unlocked</h3>
              <TrophyIco s={20}/>
            </div>
            <div className="p-8 grid sm:grid-cols-3 gap-6">
              {achievements.map((_, i) => (
                <div key={i} className="hover-lift bg-gray-50 rounded-2xl border border-gray-100 p-6 text-center">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GiftIco s={28}/>
                  </div>
                  <div className="font-display text-lg font-bold mb-1">Master Learner</div>
                  <p className="font-body text-sm text-gray-400">Earned 500+ points</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}