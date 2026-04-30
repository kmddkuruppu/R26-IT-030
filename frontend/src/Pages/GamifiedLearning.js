import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── INLINE ICONS ─────────────────────────────────────────────────
const Ico = ({ d, size = 20, fill = 'none', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const HomeIco     = ({ s = 20 }) => <Ico size={s} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const TrophyIco   = ({ s = 20 }) => <Ico size={s} d={["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.34","M14 14.66V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.34","M18 2H6v7a6 6 0 0 0 12 0V2z"]} />;
const StarIco     = ({ s = 20, fill = 'none' }) => <Ico size={s} fill={fill} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />;
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
const Gamepad2Ico = ({ s = 64 }) => <Ico size={s} d={["M6 11l4-4 4 4","M14 13l4 4-4 4","M6 13l-4 4 4 4","M10 11l4 4-4 4","M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"]} />;
const PuzzleIco   = ({ s = 48 }) => <Ico size={s} d="M20.5 10a2.5 2.5 0 0 1-2.5-2.5V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z" />;
const ChevronIco  = ({ s = 16, up = false }) => <Ico size={s} d={up ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />;

// ─── SINHALA LETTERS — 60 letters in categories ───────────────────
const LETTER_CATEGORIES = [
  {
    name: 'ස්වර (Vowels)',
    color: '#e11d48',
    letters: [
      { letter: 'අ', name: 'අ', sound: 'a' },
      { letter: 'ආ', name: 'ආ', sound: 'aa' },
      { letter: 'ඇ', name: 'ඇ', sound: 'ae' },
      { letter: 'ඈ', name: 'ඈ', sound: 'aee' },
      { letter: 'ඉ', name: 'ඉ', sound: 'i' },
      { letter: 'ඊ', name: 'ඊ', sound: 'ii' },
      { letter: 'උ', name: 'උ', sound: 'u' },
      { letter: 'ඌ', name: 'ඌ', sound: 'uu' },
      { letter: 'එ', name: 'එ', sound: 'e' },
      { letter: 'ඒ', name: 'ඒ', sound: 'ee' },
      { letter: 'ඓ', name: 'ඓ', sound: 'ai' },
      { letter: 'ඔ', name: 'ඔ', sound: 'o' },
      { letter: 'ඕ', name: 'ඕ', sound: 'oo' },
      { letter: 'ඖ', name: 'ඖ', sound: 'au' },
    ],
  },
  {
    name: 'ක වර්ගය',
    color: '#7c3aed',
    letters: [
      { letter: 'ක', name: 'ක', sound: 'ka' },
      { letter: 'ඛ', name: 'ඛ', sound: 'kha' },
      { letter: 'ග', name: 'ග', sound: 'ga' },
      { letter: 'ඝ', name: 'ඝ', sound: 'gha' },
      { letter: 'ඞ', name: 'ඞ', sound: 'nga' },
    ],
  },
  {
    name: 'ච වර්ගය',
    color: '#0891b2',
    letters: [
      { letter: 'ච', name: 'ච', sound: 'cha' },
      { letter: 'ඡ', name: 'ඡ', sound: 'chha' },
      { letter: 'ජ', name: 'ජ', sound: 'ja' },
      { letter: 'ඣ', name: 'ඣ', sound: 'jha' },
      { letter: 'ඤ', name: 'ඤ', sound: 'nya' },
    ],
  },
  {
    name: 'ට වර්ගය',
    color: '#0369a1',
    letters: [
      { letter: 'ට', name: 'ට', sound: 'ta' },
      { letter: 'ඨ', name: 'ඨ', sound: 'tha' },
      { letter: 'ඩ', name: 'ඩ', sound: 'da' },
      { letter: 'ඪ', name: 'ඪ', sound: 'dha' },
      { letter: 'ණ', name: 'ණ', sound: 'na' },
    ],
  },
  {
    name: 'ත වර්ගය',
    color: '#15803d',
    letters: [
      { letter: 'ත', name: 'ත', sound: 'tha' },
      { letter: 'ථ', name: 'ථ', sound: 'thha' },
      { letter: 'ද', name: 'ද', sound: 'da' },
      { letter: 'ධ', name: 'ධ', sound: 'dha' },
      { letter: 'න', name: 'න', sound: 'na' },
    ],
  },
  {
    name: 'ප වර්ගය',
    color: '#b45309',
    letters: [
      { letter: 'ප', name: 'ප', sound: 'pa' },
      { letter: 'ඵ', name: 'ඵ', sound: 'pha' },
      { letter: 'බ', name: 'බ', sound: 'ba' },
      { letter: 'භ', name: 'භ', sound: 'bha' },
      { letter: 'ම', name: 'ම', sound: 'ma' },
    ],
  },
  {
    name: 'අවර්ගීය',
    color: '#be185d',
    letters: [
      { letter: 'ය', name: 'ය', sound: 'ya' },
      { letter: 'ර', name: 'ර', sound: 'ra' },
      { letter: 'ල', name: 'ල', sound: 'la' },
      { letter: 'ව', name: 'ව', sound: 'va' },
      { letter: 'ශ', name: 'ශ', sound: 'sha' },
      { letter: 'ෂ', name: 'ෂ', sound: 'shha' },
      { letter: 'ස', name: 'ස', sound: 'sa' },
      { letter: 'හ', name: 'හ', sound: 'ha' },
      { letter: 'ළ', name: 'ළ', sound: 'lla' },
      { letter: 'ෆ', name: 'ෆ', sound: 'fa' },
    ],
  },
  {
    name: 'ගණකාධිකරණ',
    color: '#6d28d9',
    letters: [
      { letter: 'ං', name: 'අනුනාසික', sound: 'an' },
      { letter: 'ඃ', name: 'විසර්ග', sound: 'ah' },
    ],
  },
  // {
  //   name: 'සංයෝජිත',
  //   color: '#0f766e',
  //   letters: [
  //     { letter: 'ක්ෂ', name: 'ක්ෂ', sound: 'ksha' },
  //     { letter: 'ත්ත', name: 'ත්ත', sound: 'ttha' },
  //     { letter: 'ද්ද', name: 'ද්ද', sound: 'dda' },
  //     { letter: 'ද්ධ', name: 'ද්ධ', sound: 'ddha' },
  //     { letter: 'ම්ම', name: 'ම්ම', sound: 'mma' },
  //     { letter: 'ල්ල', name: 'ල්ල', sound: 'lla' },
  //     { letter: 'ඤ්ජ', name: 'ඤ්ජ', sound: 'nja' },
  //     { letter: 'ට්ට', name: 'ට්ට', sound: 'tta' },
  //     { letter: 'ස්ස', name: 'ස්ස', sound: 'ssa' },
  //     { letter: 'ඬ',  name: 'ඬ',  sound: 'nda' },
  //   ],
  // },
];

// Flat list used by other games
const SINHALA_LETTERS = LETTER_CATEGORIES.flatMap(cat =>
  cat.letters.map(l => ({ ...l, category: cat.name }))
);

// Build a dynamic 4-piece (2×2) puzzle for any letter
function buildPuzzle(letterObj, color) {
  return {
    letter: letterObj.letter,
    name: `${letterObj.letter} — ${letterObj.sound}`,
    color,
    gridCols: 2,
    gridRows: 2,
    pieces: [
      { id: 'tl', label: 'top-left',     gridCol: 1, gridRow: 1, gridColSpan: 1, gridRowSpan: 1, clip: [0,   0,   100, 100] },
      { id: 'tr', label: 'top-right',    gridCol: 2, gridRow: 1, gridColSpan: 1, gridRowSpan: 1, clip: [100, 0,   100, 100] },
      { id: 'bl', label: 'bottom-left',  gridCol: 1, gridRow: 2, gridColSpan: 1, gridRowSpan: 1, clip: [0,   100, 100, 100] },
      { id: 'br', label: 'bottom-right', gridCol: 2, gridRow: 2, gridColSpan: 1, gridRowSpan: 1, clip: [100, 100, 100, 100] },
    ],
  };
}

const shuffle  = (arr) => [...arr].sort(() => Math.random() - 0.5);
const randFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN    = (arr, n) => shuffle(arr).slice(0, n);

const SINHALA_FONT = "'Noto Sans Sinhala','Iskoola Pota',serif";

// ─── SHARED: RESULT SCREEN ────────────────────────────────────────
function ResultScreen({ score, maxScore, time, moves, questionCount, onRetry, onBack, color = 'orange' }) {
  const pct   = Math.round((score / Math.max(maxScore, 1)) * 100);
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
  const colorMap = {
    orange: 'from-orange-600 to-red-600', purple: 'from-purple-600 to-pink-600',
    green:  'from-green-600 to-emerald-600', yellow: 'from-yellow-500 to-orange-500',
    indigo: 'from-indigo-600 to-purple-600',
  };
  const grad = colorMap[color] || colorMap.orange;
  return (
    <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-md mx-auto animate-fade-in">
      <div className="text-7xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '💪'}</div>
      <h3 className={`text-3xl font-bold bg-gradient-to-r ${grad} bg-clip-text text-transparent mb-2`}>
        {pct >= 80 ? 'Congratulations! 🎉' : pct >= 50 ? 'Great Job! ⭐' : 'Keep Trying! 💪'}
      </h3>
      <div className="flex justify-center gap-1 my-4">
        {[0,1,2].map(i => (
          <svg key={i} viewBox="0 0 24 24" className={`w-10 h-10 ${i < stars ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
          </svg>
        ))}
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-2">
        <p className={`text-5xl font-black bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{score} pts</p>
        {time !== undefined          && <p className="text-gray-500 text-sm">⏱ {time} seconds</p>}
        {moves !== undefined         && <p className="text-gray-500 text-sm">🎯 {moves} moves</p>}
        {questionCount !== undefined && <p className="text-gray-500 text-sm">✅ {questionCount} answered</p>}
      </div>
      <div className="flex gap-3">
        <button onClick={onRetry} className={`flex-1 bg-gradient-to-r ${grad} text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:scale-105 shadow-md`}>
          <RotateIco s={18} /> Play Again
        </button>
        <button onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:border-gray-400 transition-all">
          <HomeIco s={18} /> Games
        </button>
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
      ...chosen.map((l, i) => ({ uid: `L${i}`, type: 'letter', content: l.letter, matchId: i })),
      ...chosen.map((l, i) => ({ uid: `N${i}`, type: 'name',   content: l.name,   matchId: i })),
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

  if (done) return <div className="max-w-4xl mx-auto px-6 py-12"><ResultScreen score={score} maxScore={PAIRS*20} time={timer} moves={moves} onRetry={restart} onBack={onBack} color="purple" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-800"><HomeIco s={18}/> Back</button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Memory Match</h2>
          <div className="flex gap-5">
            <div className="text-center text-purple-600"><ClockIco s={18} className="mx-auto"/><p className="text-sm font-bold">{timer}s</p></div>
            <div className="text-center text-purple-600"><TargetIco s={18} className="mx-auto"/><p className="text-sm font-bold">{moves} moves</p></div>
            <div className="text-center text-yellow-600"><StarIco s={18} fill="currentColor" className="mx-auto"/><p className="text-sm font-bold">{score}</p></div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-center text-gray-500 text-sm mb-6 font-medium">Match each letter with its name — find all {PAIRS} pairs!</p>
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.has(card.matchId);
            const isMatched = matched.has(card.matchId);
            const isWrong   = wrongPair.includes(idx);
            return (
              <button key={card.uid} onClick={() => handleClick(idx)}
                style={isFlipped ? { fontFamily: SINHALA_FONT } : {}}
                className={`rounded-2xl shadow-lg cursor-pointer transition-all duration-300 select-none flex items-center justify-center
                  ${card.type === 'letter' ? 'aspect-square' : 'h-20'}
                  ${isMatched ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white scale-95 cursor-default' :
                    isWrong   ? 'bg-gradient-to-br from-red-400 to-rose-500 text-white animate-shake' :
                    isFlipped ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-105 shadow-xl' :
                                'bg-white hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-purple-300'}`}>
                {isFlipped
                  ? <span className={`font-bold ${card.type === 'letter' ? 'text-4xl' : 'text-base leading-tight px-2 text-center'}`}>{card.content}</span>
                  : <SparklesIco s={36} className="text-purple-200"/>}
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
        if (t <= 1) { clearInterval(timerRef.current); setAnswered('__timeout__'); setAnsCount(c => c+1); setTimeout(next, 800); return 0; }
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

  if (done) return <div className="max-w-4xl mx-auto px-6 py-12"><ResultScreen score={score} maxScore={TOTAL_Q*15} questionCount={ansCount} onRetry={restart} onBack={onBack} color="yellow"/></div>;

  const timePct = (timeLeft / Q_TIME) * 100;
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-yellow-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-800"><HomeIco s={18}/> Back</button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Speed Quiz</h2>
          <div className="flex gap-5">
            <div className={`text-center ${timeLeft <= 4 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}><ClockIco s={18} className="mx-auto"/><p className="text-sm font-bold">{timeLeft}s</p></div>
            <div className="text-center text-yellow-600"><StarIco s={18} fill="currentColor" className="mx-auto"/><p className="text-sm font-bold">{score}</p></div>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm font-semibold text-gray-600">Question {qNum} of {TOTAL_Q}</span>
            <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all" style={{width:`${(qNum/TOTAL_Q)*100}%`}}/>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div className="h-3 rounded-full transition-all duration-1000" style={{width:`${timePct}%`, background: timePct>60?'#22c55e':timePct>30?'#f59e0b':'#ef4444'}}/>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-10 text-center mb-8">
            <p className="text-gray-600 mb-3 font-medium">What is the name of this letter?</p>
            <div className="text-9xl font-bold text-orange-600 leading-none" style={{ fontFamily: SINHALA_FONT }}>{q.correct.letter}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {q.options.map((opt, i) => {
              let cls = 'bg-gradient-to-r from-orange-100 to-red-100 text-gray-800 hover:from-orange-200 hover:to-red-200 hover:scale-105';
              if (answered !== null) {
                if (opt === q.correct.name) cls = 'bg-green-500 text-white scale-105 shadow-lg';
                else if (opt === answered)  cls = 'bg-red-500 text-white';
                else                        cls = 'bg-gray-100 text-gray-400';
              }
              return (
                <button key={i} onClick={() => answer(opt)} disabled={answered !== null}
                  style={{ fontFamily: SINHALA_FONT }}
                  className={`${cls} font-bold text-2xl py-5 rounded-2xl transition-all duration-200 disabled:cursor-default disabled:hover:scale-100`}>
                  {opt}
                </button>
              );
            })}
          </div>
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
      setScore(s => s+10); setFlash('correct'); setTimeout(() => setFlash(null), 400);
      const remaining = data.grid.filter(c => c.isTarget && !c.found && c.id !== cell.id);
      if (remaining.length === 0) { setRoundComplete(true); setTimeout(advanceRound, 900); }
    } else { setScore(s => Math.max(0, s-3)); setFlash('wrong'); setTimeout(() => setFlash(null), 400); }
  };

  const restart = () => { setRound(0); setData(makeRound()); setScore(0); setTimeLeft(ROUND_TIME); setDone(false); setRoundComplete(false); };

  if (done) return <div className="max-w-4xl mx-auto px-6 py-12"><ResultScreen score={score} maxScore={TOTAL_ROUNDS*40} onRetry={restart} onBack={onBack} color="green"/></div>;

  const timePct = (timeLeft / ROUND_TIME) * 100;
  const found = data.grid.filter(c => c.isTarget && c.found).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-green-600 font-semibold hover:text-green-800"><HomeIco s={18}/> Back</button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Letter Hunt</h2>
          <div className="flex gap-5">
            <div className="text-center text-green-600"><TargetIco s={18} className="mx-auto"/><p className="text-sm font-bold">Round {round+1}/{TOTAL_ROUNDS}</p></div>
            <div className={`text-center ${timeLeft<=5?'text-red-600 animate-pulse':'text-green-600'}`}><ClockIco s={18} className="mx-auto"/><p className="text-sm font-bold">{timeLeft}s</p></div>
            <div className="text-center text-yellow-600"><StarIco s={18} fill="currentColor" className="mx-auto"/><p className="text-sm font-bold">{score}</p></div>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div className="h-3 rounded-full transition-all duration-1000" style={{width:`${timePct}%`, background:timePct>50?'#22c55e':timePct>25?'#f59e0b':'#ef4444'}}/>
        </div>
        <div className={`bg-white rounded-3xl p-6 mb-6 shadow-xl flex items-center gap-6 transition-all ${flash==='correct'?'ring-4 ring-green-400':flash==='wrong'?'ring-4 ring-red-400':''}`}>
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center text-5xl font-bold text-green-700 flex-shrink-0"
            style={{ fontFamily: SINHALA_FONT }}>{data.target.letter}</div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Find all</p>
            <p className="text-2xl font-black text-gray-900" style={{ fontFamily: SINHALA_FONT }}>{data.target.name}</p>
            <p className="text-gray-400 text-sm mt-1">({data.target.sound})</p>
            <p className="text-green-600 font-semibold text-sm mt-1">Found: {found} / {data.targetCount}</p>
          </div>
          <div className="ml-auto text-right"><p className="text-xs text-gray-400">+10 per correct</p><p className="text-xs text-red-400">-3 per wrong</p></div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {data.grid.map(cell => (
            <button key={cell.id} onClick={() => handleClick(cell)} disabled={cell.found}
              style={{ fontFamily: SINHALA_FONT }}
              className={`aspect-square rounded-2xl shadow-md text-4xl font-bold transition-all hover:scale-105 hover:shadow-xl
                ${cell.found?'bg-green-200 text-green-600 scale-95 cursor-default opacity-60':'bg-white text-gray-800 hover:bg-green-50 border-2 border-transparent hover:border-green-300'}`}>
              {cell.found ? '✓' : cell.letter}
            </button>
          ))}
        </div>
        {roundComplete && <div className="mt-6 text-center bg-green-100 rounded-2xl p-4 animate-pulse"><p className="text-green-700 font-black text-xl">🎉 Round Complete! Next round loading…</p></div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GAME 4 — LETTER PUZZLE with sidebar letter picker
// ═══════════════════════════════════════════════════════════════════
const TILE = 120;

function LetterTile({ letter, color, clip, tileW, tileH, opacity = 1 }) {
  const [cx, cy, cw, ch] = clip;
  return (
    <svg width={tileW} height={tileH} viewBox={`${cx} ${cy} ${cw} ${ch}`} style={{ display: 'block' }}>
      <text x="100" y="155" textAnchor="middle" fontSize="160"
        fontFamily={SINHALA_FONT} fill={color} fontWeight="900" opacity={opacity}>{letter}</text>
    </svg>
  );
}

function PieceTile({ piece, letter, color, isDragging, onDragStart }) {
  const tileW = TILE * piece.gridColSpan;
  const tileH = TILE * piece.gridRowSpan;
  return (
    <div draggable onDragStart={onDragStart} title={piece.label}
      style={{
        width: tileW, height: tileH, borderRadius: 14,
        border: `2px solid ${color}88`, background: `${color}18`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        cursor: 'grab', opacity: isDragging ? 0.35 : 1,
        transition: 'transform 0.15s, opacity 0.15s',
        userSelect: 'none', flexShrink: 0, overflow: 'hidden',
      }}
      className="hover:scale-105 hover:shadow-2xl active:cursor-grabbing">
      <LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH} />
    </div>
  );
}

function SlotTile({ piece, letter, color, filled, onDrop, onDragOver, isWrong }) {
  const tileW = TILE * piece.gridColSpan;
  const tileH = TILE * piece.gridRowSpan;
  return (
    <div onDrop={onDrop} onDragOver={onDragOver}
      style={{
        width: tileW, height: tileH, borderRadius: 14,
        border: filled ? `2px solid ${color}` : isWrong ? '2px solid #f87171' : '2px dashed #6366f166',
        background: filled ? `${color}22` : isWrong ? '#f8717122' : '#ffffff08',
        boxShadow: filled ? `0 0 20px ${color}44` : 'none',
        transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
      }}>
      <LetterTile letter={letter} color={color} clip={piece.clip} tileW={tileW} tileH={tileH} opacity={filled ? 1 : 0.15} />
      {!filled && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
          <span style={{ fontSize: 22, color: '#818cf8', fontWeight: 'bold', opacity: 0.7 }}>?</span>
        </div>
      )}
      {filled && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 22, height: 22, borderRadius: '50%',
          background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: 'white', fontWeight: 'bold', pointerEvents: 'none',
        }}>✓</div>
      )}
    </div>
  );
}

// ── Letter Picker Sidebar ─────────────────────────────────────────
function LetterPickerSidebar({ onSelect, selectedLetter, completedLetters }) {
  const [openCat, setOpenCat] = useState(0);
  return (
    <div style={{
      width: 210, flexShrink: 0,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 20, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 120px)',
    }}>
      {/* Sidebar header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <p style={{ color: '#a5b4fc', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
          Select Letter
        </p>
        <p style={{ color: '#6366f1', fontSize: 11, margin: '3px 0 0' }}>
          {completedLetters.size} / {SINHALA_LETTERS.length} completed
        </p>
      </div>

      {/* Scrollable category list */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 8 }}>
        {LETTER_CATEGORIES.map((cat, ci) => (
          <div key={ci}>
            {/* Category toggle */}
            <button
              onClick={() => setOpenCat(openCat === ci ? -1 : ci)}
              style={{
                width: '100%', padding: '9px 12px',
                background: openCat === ci ? `${cat.color}22` : 'transparent',
                border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
                color: openCat === ci ? cat.color : '#94a3b8',
                fontSize: 10.5, fontWeight: 700, textAlign: 'left',
                transition: 'all 0.15s',
              }}>
              <span>{cat.name}</span>
              <ChevronIco s={13} up={openCat === ci} />
            </button>

            {/* Letter grid */}
            {openCat === ci && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '7px 9px 9px' }}>
                {cat.letters.map((l, li) => {
                  const isSelected  = selectedLetter?.letter === l.letter;
                  const isCompleted = completedLetters.has(l.letter);
                  return (
                    <button key={li} onClick={() => onSelect(l, cat.color)}
                      title={`${l.letter} (${l.sound})`}
                      style={{
                        width: 38, height: 38, borderRadius: 10,
                        border: isSelected
                          ? `2px solid ${cat.color}`
                          : isCompleted
                          ? '2px solid #22c55e'
                          : '1px solid rgba(255,255,255,0.14)',
                        background: isSelected ? `${cat.color}33` : isCompleted ? '#22c55e22' : 'rgba(255,255,255,0.05)',
                        color: isSelected ? cat.color : isCompleted ? '#22c55e' : '#e2e8f0',
                        fontSize: 17, cursor: 'pointer', position: 'relative',
                        fontFamily: SINHALA_FONT,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      }}>
                      {l.letter}
                      {isCompleted && (
                        <span style={{
                          position: 'absolute', top: -4, right: -4,
                          width: 11, height: 11, background: '#22c55e',
                          borderRadius: '50%', fontSize: 7, color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Puzzle Component ─────────────────────────────────────────
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
  const timerRef = useRef(null);

  const initPuzzle = useCallback((letterObj, color) => {
    const newPz = buildPuzzle(letterObj, color);
    setPz(newPz);
    setPool(shuffle(newPz.pieces.map(p => p.id)));
    setPlaced({}); setCelebrating(false);
    setMistakes(0); setTimer(0); setWrongSlot(null);
  }, []);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (celebrating) return;
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [pz, celebrating]);

  const handleSelectLetter = (letterObj, catColor) => {
    setSelectedLetter(letterObj);
    setCurrentColor(catColor);
    initPuzzle(letterObj, catColor);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (slotId) => {
    if (!dragging) return;
    if (dragging === slotId) {
      const newPlaced = { ...placed, [slotId]: true };
      setPlaced(newPlaced);
      setPool(p => p.filter(id => id !== dragging));
      const earned = Math.max(5, 25 - mistakes * 4);
      setScore(s => s + earned);
      if (Object.keys(newPlaced).length === pz.pieces.length) {
        clearInterval(timerRef.current);
        setCelebrating(true);
        setCompleted(c => new Set([...c, pz.letter]));
        onComplete && onComplete(earned);
      }
    } else {
      setMistakes(m => m + 1);
      setWrongSlot(slotId);
      setTimeout(() => setWrongSlot(null), 700);
    }
    setDragging(null);
  };

  const boardW = pz.gridCols * TILE;
  const boardH = pz.gridRows * TILE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        @keyframes popIn    { 0%{transform:scale(.8) rotate(-5deg);opacity:0} 60%{transform:scale(1.15) rotate(2deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glowBurst{ 0%{box-shadow:0 0 0 0 rgba(99,102,241,.6)} 80%{box-shadow:0 0 40px 16px rgba(99,102,241,0)} }
        .pop-in    { animation: popIn .5s cubic-bezier(.36,.07,.19,.97) forwards; }
        .fade-up   { animation: fadeUp .4s ease-out forwards; }
        .float-y   { animation: floatY 3s ease-in-out infinite; }
        .glow-burst{ animation: glowBurst 1.2s ease-out forwards; }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-indigo-300 font-semibold hover:text-white transition-colors">
            <HomeIco s={18} /> Back to Games
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧩</span>
            <h2 className="text-xl font-bold">Letter Puzzle</h2>
          </div>
          <div className="flex gap-5 text-sm">
            <div className="text-center">
              <p className="text-indigo-400 text-xs">Completed</p>
              <p className="font-bold text-green-400">{completedLetters.size}</p>
            </div>
            <div className="text-center">
              <p className="text-indigo-400 text-xs">Time</p>
              <p className="font-bold">{timer}s</p>
            </div>
            <div className="text-center">
              <p className="text-indigo-400 text-xs">Mistakes</p>
              <p className={`font-bold ${mistakes > 0 ? 'text-red-400' : 'text-green-400'}`}>{mistakes}</p>
            </div>
            <div className="text-center">
              <StarIco s={14} fill="currentColor" className="text-yellow-400 mx-auto" />
              <p className="font-bold text-yellow-300">{score}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body: sidebar + puzzle */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-5 fade-up" style={{ alignItems: 'flex-start' }}>

        {/* ── Sidebar ── */}
        <LetterPickerSidebar
          onSelect={handleSelectLetter}
          selectedLetter={selectedLetter}
          completedLetters={completedLetters}
        />

        {/* ── Puzzle area ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* Letter name & status */}
          <div className="text-center">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
              Drag pieces onto matching slots
            </p>
            <h3 className="font-black mb-0.5" style={{ color: currentColor, fontFamily: SINHALA_FONT, fontSize: 52 }}>
              {pz.letter}
            </h3>
            <p className="text-indigo-400 text-sm">{pz.name}</p>
            {celebrating && (
              <p className="text-xl font-black animate-bounce mt-2" style={{ color: currentColor }}>
                ✨ නිවැරදියි! ← Pick next letter from sidebar
              </p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">

            {/* Assembly Board */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest">Assembly Board</p>
              <div className={`rounded-3xl border p-4 backdrop-blur-sm transition-all duration-500
                ${celebrating ? 'border-indigo-400/60 bg-indigo-500/15 glow-burst' : 'border-white/10 bg-white/5'}`}>
                {celebrating ? (
                  <div className="pop-in flex items-center justify-center" style={{ width: boardW, height: boardH }}>
                    <svg width={boardW} height={boardH} viewBox="0 0 200 200">
                      <defs><filter id="sg"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                      <text x="100" y="155" textAnchor="middle" fontSize="160"
                        fontFamily={SINHALA_FONT} fill={currentColor} fontWeight="900" filter="url(#sg)">{pz.letter}</text>
                    </svg>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${pz.gridCols}, ${TILE}px)`,
                    gridTemplateRows: `repeat(${pz.gridRows}, ${TILE}px)`,
                    gap: 4,
                  }}>
                    {pz.pieces.map(slot => (
                      <div key={slot.id} style={{ gridColumn:`${slot.gridCol}/span ${slot.gridColSpan}`, gridRow:`${slot.gridRow}/span ${slot.gridRowSpan}` }}>
                        <SlotTile
                          piece={slot} letter={pz.letter} color={currentColor}
                          filled={!!placed[slot.id]} isWrong={wrongSlot === slot.id}
                          onDrop={() => handleDrop(slot.id)} onDragOver={handleDragOver}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-4 flex-1 min-w-[220px]">
              <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest text-center">Letter Pieces</p>

              {/* Pool */}
              <div className="bg-white/5 rounded-3xl border border-white/10 p-4 min-h-[150px] flex flex-wrap gap-3 justify-center items-center"
                onDragOver={handleDragOver} onDrop={() => setDragging(null)}>
                {celebrating ? (
                  <div className="text-center py-3">
                    <CheckCircIco s={32} className="text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold text-sm">Complete! 🎉</p>
                    <p className="text-indigo-400 text-xs mt-1">Choose another from the sidebar</p>
                  </div>
                ) : pool.length === 0 ? (
                  <div className="text-center py-3">
                    <CheckCircIco s={32} className="text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold text-sm">All placed!</p>
                  </div>
                ) : pool.map(pid => {
                  const piece = pz.pieces.find(p => p.id === pid);
                  return (
                    <PieceTile key={pid} piece={piece} letter={pz.letter} color={currentColor}
                      isDragging={dragging === pid} onDragStart={() => setDragging(pid)} />
                  );
                })}
              </div>

              {/* Full letter hint */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 text-center">
                <p className="text-indigo-400 text-xs uppercase tracking-wider mb-2">Full Letter Hint</p>
                <div className="float-y mx-auto" style={{ width: 90, height: 90 }}>
                  <svg width={90} height={90} viewBox="10 10 180 180">
                    <text x="100" y="155" textAnchor="middle" fontSize="160"
                      fontFamily={SINHALA_FONT} fill={currentColor} fontWeight="900" opacity="0.75">{pz.letter}</text>
                  </svg>
                </div>
              </div>

              {/* Instructions + reset */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                <p className="text-indigo-300 text-xs font-semibold mb-2 uppercase tracking-wider">How to play</p>
                <ul className="text-slate-400 text-xs space-y-1 mb-3">
                  <li>📋 Pick any letter from the sidebar</li>
                  <li>🖱 Drag a piece from the pool</li>
                  <li>📦 Drop it on the matching slot</li>
                  <li>⭐ Fewer mistakes = more points</li>
                </ul>
                <button onClick={() => initPuzzle(selectedLetter, currentColor)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-indigo-400/40 text-indigo-300 hover:text-white hover:border-indigo-400 hover:bg-white/5 transition-all text-xs font-semibold">
                  <RotateIco s={14} /> Reset Puzzle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE — LOBBY
// ═══════════════════════════════════════════════════════════════════
const GAMES_CONFIG = [
  { id: 'memory-match',  title: 'Memory Match',  description: 'Match letters with their names',           Icon: BrainIco,  color: 'from-purple-500 to-pink-500',   bgColor: 'bg-purple-50', difficulty: 'Easy',   points: 120 },
  { id: 'speed-quiz',    title: 'Speed Quiz',    description: 'Answer as fast as you can! (10s)',         Icon: ZapIco,    color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-50', difficulty: 'Medium', points: 150 },
  { id: 'letter-hunt',   title: 'Letter Hunt',   description: 'Find the correct letter quickly',          Icon: TargetIco, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50',  difficulty: 'Easy',   points: 200 },
  { id: 'letter-puzzle', title: 'Letter Puzzle', description: 'Pick any letter & assemble the puzzle!',   Icon: PuzzleIco, color: 'from-indigo-500 to-purple-600', bgColor: 'bg-indigo-50', difficulty: 'Medium', points: 250 },
];

export default function GamifiedLearningPage({ lang = 'en' }) {
  const navigate = useNavigate();
  const [selected, setSelected]   = useState(null);
  const [totalScore, setTotal]    = useState(0);
  const [totalStars, setStars]    = useState(0);
  const [achievements, setAchiev] = useState([]);

  const handleComplete = (score) => {
    setTotal(t => t + score);
    setStars(s => s + Math.min(3, Math.floor(score / 30)));
    if (totalScore + score >= 500 && !achievements.includes('master')) setAchiev(a => [...a, 'master']);
  };

  const handleBack = () => setSelected(null);

  const renderGame = () => {
    const props = { letters: SINHALA_LETTERS, onBack: handleBack, onComplete: handleComplete };
    switch (selected) {
      case 'memory-match':  return <MemoryMatchGame  {...props}/>;
      case 'speed-quiz':    return <SpeedQuizGame    {...props}/>;
      case 'letter-hunt':   return <LetterHuntGame   {...props}/>;
      case 'letter-puzzle': return <LetterPuzzleGame onBack={handleBack} onComplete={handleComplete}/>;
      default: return null;
    }
  };

  if (selected) return (
    <div className="pt-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .animate-fade-in { animation: fade-in 0.35s ease-out forwards; }
        .animate-shake   { animation: shake 0.35s ease-in-out; }
      `}</style>
      {renderGame()}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pt-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700;900&display=swap');
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in { animation: fade-in 0.35s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-orange-100 sticky top-[64px] z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-orange-100 rounded-full transition-colors text-orange-600">
              <HomeIco s={22}/>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Gamified Learning</h1>
              <p className="text-xs sm:text-sm text-gray-500">Play &amp; Learn Sinhala!</p>
            </div>
          </div>
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-orange-600 font-bold text-lg"><TrophyIco s={18}/>{totalScore}</div>
              <p className="text-xs text-gray-400">Total Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-lg"><StarIco s={18} fill="currentColor" className="text-yellow-400"/>{totalStars}</div>
              <p className="text-xs text-gray-400">Stars</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-red-500 font-bold text-lg"><AwardIco s={18}/>{achievements.length}</div>
              <p className="text-xs text-gray-400">Badges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-3xl p-8 mb-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 pointer-events-none"/>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24 pointer-events-none"/>
          <div className="relative flex items-center gap-6">
            <Gamepad2Ico s={64}/>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-1">Learning Through Play!</h2>
              <p className="text-lg text-orange-100">Choose a game and start your Sinhala adventure</p>
            </div>
          </div>
        </div>

        {/* Games grid */}
        <div className="mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-7 flex items-center gap-3">
            <SparklesIco s={28} className="text-orange-600"/> Available Games
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GAMES_CONFIG.map((game) => {
              const { Icon } = game;
              return (
                <div key={game.id} onClick={() => setSelected(game.id)}
                  className={`${game.bgColor} rounded-3xl p-7 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden group`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}/>
                  <div className={`w-18 h-18 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 p-3`}>
                    <Icon s={42}/>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{game.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${game.difficulty==='Easy'?'bg-green-100 text-green-600':game.difficulty==='Medium'?'bg-orange-100 text-orange-600':'bg-red-100 text-red-600'}`}>
                      {game.difficulty}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-600 flex items-center gap-1">
                      <StarIco s={11} fill="currentColor" className="text-yellow-500"/> {game.points} pts
                    </span>
                  </div>
                  <button className={`bg-gradient-to-r ${game.color} text-white px-4 py-2.5 rounded-full font-bold shadow-md transition-all duration-200 flex items-center gap-2 w-full justify-center text-sm`}>
                    <PlayIco s={15}/> Play Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <TrophyIco s={28} className="text-yellow-500"/> Your Achievements
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {achievements.map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 text-center">
                  <GiftIco s={48} className="text-orange-600 mx-auto mb-3"/>
                  <h4 className="font-bold text-lg text-gray-900">Master Learner</h4>
                  <p className="text-sm text-gray-600">Earned 500+ points</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
//fix the code