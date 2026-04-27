// src/services/apiService.js
// ─────────────────────────────────────────────────────────────────
// Drop this file in your React project.
// It handles all communication with the Spring Boot backend.
// ─────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:8080/api';

// ── Guest session ID (persisted in localStorage) ──────────────────
function getSessionId() {
  let id = localStorage.getItem('sinhala_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sinhala_session_id', id);
  }
  return id;
}

// ── Generic fetch helper ──────────────────────────────────────────
async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (e) {
    console.error(`[API] ${options.method ?? 'GET'} ${path} failed:`, e.message);
    throw e;
  }
}

// ═════════════════════════════════════════════════════════════════
// GAME SESSIONS
// ═════════════════════════════════════════════════════════════════

/**
 * Call this when any game ends.
 *
 * @param {Object} params
 * @param {'memory-match'|'speed-quiz'|'letter-hunt'|'letter-puzzle'} params.gameType
 * @param {number}  params.score
 * @param {number}  [params.timeSeconds]
 * @param {number}  [params.moves]
 * @param {number}  [params.questionsAnswered]
 * @param {number}  [params.mistakes]
 */
export async function saveGameSession({ gameType, score, timeSeconds, moves, questionsAnswered, mistakes }) {
  return request('/games/session', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: getSessionId(),
      gameType,
      score,
      timeSeconds   : timeSeconds    ?? null,
      moves         : moves          ?? null,
      questionsAnswered: questionsAnswered ?? null,
      mistakes      : mistakes       ?? null,
    }),
  });
}

/** Full game history for this guest */
export async function getGameHistory(gameType) {
  const sid = getSessionId();
  const path = gameType
    ? `/games/history/${sid}/${gameType}`
    : `/games/history/${sid}`;
  return request(path);
}

// ═════════════════════════════════════════════════════════════════
// LETTER PROGRESS
// ═════════════════════════════════════════════════════════════════

/**
 * Call this when a letter is practiced (any game) or completed (puzzle).
 *
 * @param {Object} params
 * @param {string}  params.letter      e.g. "ක"
 * @param {string}  params.letterName  e.g. "ක"
 * @param {string}  params.sound       e.g. "ka"
 * @param {string}  params.category    e.g. "ක වර්ගය"
 * @param {boolean} params.completed
 * @param {number}  params.score
 */
export async function upsertLetterProgress({ letter, letterName, sound, category, completed = false, score = 0 }) {
  return request('/letters/progress', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: getSessionId(),
      letter, letterName, sound, category, completed, score,
    }),
  });
}

/** All letter progress for this guest */
export async function getAllLetterProgress() {
  return request(`/letters/progress/${getSessionId()}`);
}

/** Only completed letters */
export async function getCompletedLetters() {
  return request(`/letters/progress/${getSessionId()}/completed`);
}

// ═════════════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ═════════════════════════════════════════════════════════════════

/**
 * Earn an achievement (idempotent — safe to call multiple times).
 *
 * Pre-defined keys used by the frontend:
 *   "master"        → 500+ total score
 *   "speed_demon"   → finished Speed Quiz with score ≥ 100
 *   "perfect_memory"→ finished Memory Match without wrong pairs
 *   "letter_master" → completed all puzzle letters
 *
 * @param {Object} params
 * @param {string} params.achievementKey
 * @param {string} params.title
 * @param {string} params.description
 */
export async function earnAchievement({ achievementKey, title, description }) {
  return request('/achievements', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: getSessionId(),
      achievementKey, title, description,
    }),
  });
}

/** All achievements for this guest */
export async function getAchievements() {
  return request(`/achievements/${getSessionId()}`);
}

// ═════════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════════

/**
 * Returns:
 * {
 *   summary:        { totalScore, totalStars, gamesPlayed, lettersCompleted },
 *   achievements:   [...],
 *   letterProgress: [...],
 *   recentGames:    [...],
 * }
 */
export async function getDashboard() {
  return request(`/dashboard/${getSessionId()}`);
}

// ═════════════════════════════════════════════════════════════════
// HELPERS — Achievement logic mirrors frontend score tracking
// ═════════════════════════════════════════════════════════════════

/** Call after every game to auto-check & persist achievements */
export async function checkAndEarnAchievements({ gameType, score, moves, totalScore }) {
  const promises = [];

  if ((totalScore ?? 0) >= 500)
    promises.push(earnAchievement({ achievementKey: 'master', title: 'Master Learner', description: 'Earned 500+ total points' }));

  if (gameType === 'speed-quiz' && score >= 100)
    promises.push(earnAchievement({ achievementKey: 'speed_demon', title: 'Speed Demon', description: 'Scored 100+ in Speed Quiz' }));

  if (gameType === 'memory-match' && moves !== undefined && moves <= 6)
    promises.push(earnAchievement({ achievementKey: 'perfect_memory', title: 'Perfect Memory', description: 'Completed Memory Match in 6 moves or fewer' }));

  await Promise.allSettled(promises);   // never throws — silent fail is OK
}

// ═══════════════════════════════════════════════════════════════════
// ADD THESE FUNCTIONS TO YOUR EXISTING src/services/apiService.js
// Paste them at the bottom of the file, before the closing export.
// ═══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// RECOGNITION — called from LetterRecognition.js
// ─────────────────────────────────────────────────────────────────

/**
 * Save a recognition attempt after "Recognize Letter" is clicked.
 *
 * Call this inside handleRecognize() right after mockRecognize() resolves:
 *
 *   const res = await mockRecognize(canvasRef.current, selectedLetter);
 *   setResult(res);
 *   const saved = await saveRecognitionAttempt({
 *     selectedLetter,
 *     recognizedLetter : res.top.letter,
 *     confidence       : res.top.confidence,
 *     inputType        : tab,           // 'draw' or 'upload'
 *   });
 *   setCurrentRecognitionId(saved.id);  // store in state for feedback
 *
 * @param {Object} params
 * @param {string|null} params.selectedLetter
 * @param {string}      params.recognizedLetter
 * @param {number}      params.confidence  (0-100)
 * @param {'draw'|'upload'} params.inputType
 * @returns {Promise<{id, sessionId, recognizedLetter, confidence, points, attemptedAt}>}
 */
export async function saveRecognitionAttempt({
  selectedLetter,
  recognizedLetter,
  confidence,
  inputType,
}) {
  return request('/recognition/attempt', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: getSessionId(),
      selectedLetter: selectedLetter ?? null,
      recognizedLetter,
      confidence,
      inputType,
    }),
  });
}

/**
 * Save user feedback after "Yes, correct!" or "No, try again" is clicked.
 *
 * Call this inside handleFeedback():
 *
 *   const handleFeedback = async (correct) => {
 *     setFeedback(correct ? 'correct' : 'wrong');
 *     if (correct) { ...existing local state update... }
 *     else         { ...existing local state update... }
 *
 *     if (currentRecognitionId) {
 *       const updatedStats = await saveRecognitionFeedback({
 *         recognitionId : currentRecognitionId,
 *         correct,
 *       });
 *       // optionally sync stats from backend:
 *       // setStats({ total: updatedStats.totalAttempts, correct: updatedStats.correctCount,
 *       //            streak: updatedStats.currentStreak, points: updatedStats.totalPoints });
 *     }
 *   };
 *
 * @param {Object} params
 * @param {number}  params.recognitionId   ID returned by saveRecognitionAttempt
 * @param {boolean} params.correct
 */
export async function saveRecognitionFeedback({ recognitionId, correct }) {
  return request('/recognition/feedback', {
    method: 'POST',
    body: JSON.stringify({
      sessionId    : getSessionId(),
      recognitionId,
      correct,
    }),
  });
}

/**
 * Load saved stats on component mount so the stats panel is persistent.
 *
 * Call this in a useEffect at the top of LetterRecognition:
 *
 *   useEffect(() => {
 *     getRecognitionStats()
 *       .then(s => setStats({
 *         total  : s.totalAttempts,
 *         correct: s.correctCount,
 *         streak : s.currentStreak,
 *         points : s.totalPoints,
 *       }))
 *       .catch(() => {}); // silent fail — offline mode
 *   }, []);
 *
 * @returns {Promise<RecognitionStatsResponse>}
 */
export async function getRecognitionStats() {
  return request(`/recognition/stats/${getSessionId()}`);
}

/**
 * Get full recognition history for this guest.
 * Useful for a "history" modal or analytics panel.
 */
export async function getRecognitionHistory() {
  return request(`/recognition/history/${getSessionId()}`);
}

/**
 * Get per-letter practice breakdown.
 * Shows which letters the guest has practised most.
 */
export async function getLetterPracticeHistory() {
  return request(`/recognition/letters/${getSessionId()}`);
}