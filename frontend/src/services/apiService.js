const BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api`;

// ── Guest session ID ──────────────────────────────────────────────
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
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  } catch (e) {
    console.error(`[API] ${options.method ?? 'GET'} ${path} failed:`, e.message);
    throw e;
  }
}

// ═════════════════════════════════════════════════════════════════
// GAME PROGRESS
// ═════════════════════════════════════════════════════════════════

export async function saveGameProgress({ gameId, score, maxScore }) {
  return request('/game-progress', {
    method: 'POST',
    body: JSON.stringify({
      studentId: 1,
      gameId,
      score,
      maxScore,
    }),
  });
}

export async function getStudentSummary() {
  return request(`/game-progress/summary/1`);
}

export async function getSessionsByStudent() {
  return request(`/game-progress/student/1`);
}

export async function getSessionsByGame(gameId) {
  return request(`/game-progress/student/1/game/${gameId}`);
}

// ═════════════════════════════════════════════════════════════════
// GAME SESSIONS (legacy — kept for other pages)
// ═════════════════════════════════════════════════════════════════

export async function saveGameSession({
  gameType, score, timeSeconds, moves, questionsAnswered, mistakes,
}) {
  return request('/games/session', {
    method: 'POST',
    body: JSON.stringify({
      sessionId        : getSessionId(),
      gameType,
      score,
      timeSeconds      : timeSeconds       ?? null,
      moves            : moves             ?? null,
      questionsAnswered: questionsAnswered  ?? null,
      mistakes         : mistakes          ?? null,
    }),
  });
}

export async function getGameHistory(gameType) {
  const sid  = getSessionId();
  const path = gameType
    ? `/games/history/${sid}/${gameType}`
    : `/games/history/${sid}`;
  return request(path);
}

// ═════════════════════════════════════════════════════════════════
// LETTER PROGRESS
// ═════════════════════════════════════════════════════════════════

export async function upsertLetterProgress({
  letter, letterName, sound, category, completed = false, score = 0,
}) {
  return request('/letters/progress', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: getSessionId(),
      letter, letterName, sound, category, completed, score,
    }),
  });
}

export async function getAllLetterProgress() {
  return request(`/letters/progress/${getSessionId()}`);
}

export async function getCompletedLetters() {
  return request(`/letters/progress/${getSessionId()}/completed`);
}

// ═════════════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ═════════════════════════════════════════════════════════════════

export async function earnAchievement({ achievementKey, title, description }) {
  return request('/achievements', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: getSessionId(),
      achievementKey, title, description,
    }),
  });
}

export async function getAchievements() {
  return request(`/achievements/${getSessionId()}`);
}

// ═════════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════════

export async function getDashboard() {
  return request(`/dashboard/${getSessionId()}`);
}

// ═════════════════════════════════════════════════════════════════
// ACHIEVEMENTS AUTO-CHECK
// ═════════════════════════════════════════════════════════════════

export async function checkAndEarnAchievements({
  gameType, score, moves, totalScore,
}) {
  const promises = [];

  if ((totalScore ?? 0) >= 500)
    promises.push(earnAchievement({
      achievementKey: 'master',
      title        : 'Master Learner',
      description  : 'Earned 500+ total points',
    }));

  if (gameType === 'speed-quiz' && score >= 100)
    promises.push(earnAchievement({
      achievementKey: 'speed_demon',
      title        : 'Speed Demon',
      description  : 'Scored 100+ in Speed Quiz',
    }));

  if (gameType === 'memory-match' && moves !== undefined && moves <= 6)
    promises.push(earnAchievement({
      achievementKey: 'perfect_memory',
      title        : 'Perfect Memory',
      description  : 'Completed Memory Match in 6 moves or fewer',
    }));

  if (gameType === 'letter-puzzle' && score >= 200)
    promises.push(earnAchievement({
      achievementKey: 'puzzle_master',
      title        : 'Puzzle Master',
      description  : 'High score in Letter Puzzle',
    }));

  if (gameType === 'word-builder' && score >= 300)
    promises.push(earnAchievement({
      achievementKey: 'word_wizard',
      title        : 'Word Wizard',
      description  : 'Mastered Word Builder',
    }));

  await Promise.allSettled(promises);
}

// ═════════════════════════════════════════════════════════════════
// GAMIFIED LEARNING — GAME SESSIONS
// ═════════════════════════════════════════════════════════════════

/**
 * Save full game result after every game ends.
 * Called in GamifiedLearningPage handleComplete()
 *
 * @param {Object} p
 * @param {string}  p.gameId          — "memory-match" | "speed-quiz" | etc.
 * @param {number}  p.score           — final score
 * @param {number}  p.maxScore        — maximum possible score
 * @param {number}  [p.timeSeconds]   — time taken (MemoryMatch, LetterHunt, etc.)
 * @param {number}  [p.movesCount]    — moves made (MemoryMatch)
 * @param {number}  [p.questionCount] — questions answered (SpeedQuiz, MissingLetter)
 */
export async function saveGamifiedSession({
  gameId, score, maxScore,
  timeSeconds, movesCount, questionCount,
}) {
  return request('/gamified/session/save', {
    method: 'POST',
    body: JSON.stringify({
      gameId,
      score,
      maxScore   : maxScore    ?? 100,
      timeSeconds: timeSeconds ?? null,
      movesCount : movesCount  ?? null,
      questionCount: questionCount ?? null,
    }),
  });
}

/**
 * Get full player stats for GamifiedLearningPage lobby.
 * Returns totalScore, totalStars, badgeCount, last7Scores,
 * recentSessions, moodHistory, achievements.
 */
export async function getGamifiedStats() {
  return request('/gamified/stats');
}

// ═════════════════════════════════════════════════════════════════
// GAMIFIED LEARNING — FACE REACTIONS
// ═════════════════════════════════════════════════════════════════

/**
 * Save face reaction captured during gameplay.
 * Called in GamifiedLearningPage handleReaction()
 * Matches frontend EXPRESSION_MAP shape exactly.
 *
 * @param {Object} p
 * @param {string}  p.gameId        — which game triggered the reaction
 * @param {string}  p.rawExpression — "happy" | "surprised" | "neutral" | etc.
 * @param {string}  p.emoji         — "😄"
 * @param {string}  p.labelEn       — "Happy"
 * @param {string}  p.labelSi       — "සතුටුයි"
 * @param {string}  p.labelTa       — "மகிழ்ச்சி"
 * @param {number}  p.confidence    — 0.0 to 1.0 from face-api.js
 */
export async function saveFaceReaction({
  gameId, rawExpression, emoji,
  labelEn, labelSi, labelTa, confidence,
}) {
  return request('/gamified/reaction/save', {
    method: 'POST',
    body: JSON.stringify({
      gameId,
      rawExpression,
      emoji,
      labelEn,
      labelSi,
      labelTa,
      confidence: confidence ?? null,
    }),
  });
}

/**
 * Get recent mood history for a student.
 * Returns last 20 reactions — matches frontend moodHistory state shape.
 */
export async function getMoodHistory() {
  return request('/gamified/reactions');
}

// ═════════════════════════════════════════════════════════════════
// GAMIFIED LEARNING — ACHIEVEMENTS
// ═════════════════════════════════════════════════════════════════

/**
 * Check and unlock gamified achievements.
 * Called in GamifiedLearningPage handleComplete() after saveGameProgress.
 * Backend checks all thresholds and saves newly earned ones.
 *
 * @param {Object} p
 * @param {string}  p.gameType   — "memory-match" | "speed-quiz" | etc.
 * @param {number}  p.score      — score from this game session
 * @param {number}  p.totalScore — cumulative total score (frontend state)
 */
export async function checkAndEarnGamifiedAchievements({
  gameType, score, totalScore,
}) {
  return request('/gamified/achievements/check', {
    method: 'POST',
    body: JSON.stringify({
      gameType,
      score      : score      ?? 0,
      totalScore : totalScore ?? 0,
    }),
  });
}

/**
 * Get all achievements earned by the student.
 */
export async function getGamifiedAchievements() {
  return request('/gamified/achievements');
}

// ═════════════════════════════════════════════════════════════════
// RECOGNITION
// ═════════════════════════════════════════════════════════════════

export async function saveRecognitionAttempt({
  selectedLetter, recognizedLetter, confidence, inputType,
}) {
  return request('/recognition/attempt', {
    method: 'POST',
    body: JSON.stringify({
      sessionId       : getSessionId(),
      selectedLetter  : selectedLetter ?? null,
      recognizedLetter,
      confidence,
      inputType,
    }),
  });
}

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

export async function getRecognitionStats() {
  return request(`/recognition/stats/${getSessionId()}`);
}

export async function getRecognitionHistory() {
  return request(`/recognition/history/${getSessionId()}`);
}

export async function getLetterPracticeHistory() {
  return request(`/recognition/letters/${getSessionId()}`);
}

// ═════════════════════════════════════════════════════════════════
// LETTER TRACING
// ═════════════════════════════════════════════════════════════════

/**
 * Save a completed tracing session.
 * Call this when the user clicks "Check My Work" OR the app auto-completes at 95% coverage.
 *
 * @param {Object} p
 * @param {number}  p.studentId
 * @param {string}  p.letter             — Sinhala letter e.g. "අ"
 * @param {string}  p.sound              — phonetic e.g. "a"
 * @param {string}  p.category           — "Vowels" | "Ka Group"
 * @param {string}  p.difficulty         — "Easy" | "Medium" | "Hard"
 * @param {number}  p.strokes            — number of strokes for this letter
 * @param {number}  p.score              — 0-100
 * @param {number}  p.keypointsCovered   — keypoints hit in correct order
 * @param {number}  p.keypointsTotal     — total keypoints for this letter
 * @param {number}  p.boundaryWarnings   — out-of-boundary events fired
 * @param {number}  p.orderViolations    — wrong-order keypoint hits
 * @param {boolean} p.autoCompleted      — true if triggered by 95% auto-complete
 *
 * @returns {Promise<{
 *   sessionId, letter, score,
 *   gradeLabel, gradeSymbol,
 *   newBest, bestScore, mastered,
 *   totalPoints, masteredCount, recentAccuracy
 * }>}
 */
export async function saveTracingSession({
  studentId,
  letter,
  sound,
  category,
  difficulty,
  strokes,
  score,
  keypointsCovered,
  keypointsTotal,
  boundaryWarnings,
  orderViolations,
  autoCompleted,
}) {
  return request('/letter-tracing/sessions', {
    method: 'POST',
    body: JSON.stringify({
      studentId,
      letter,
      sound,
      category,
      difficulty,
      strokes,
      score,
      keypointsCovered,
      keypointsTotal,
      boundaryWarnings,
      orderViolations,
      autoCompleted,
    }),
  });
}

/**
 * Load the full progress snapshot for a student.
 * Call on component mount (useEffect) to restore:
 *   progressMap, masteredSet, history[], points, accuracy, currentLetterIndex.
 *
 * @param {number} studentId
 * @returns {Promise<{
 *   studentId, totalPoints, masteredCount, totalAttempts, recentAccuracy,
 *   currentLetterIndex, masteryList, recentSessions, lastUpdatedAt
 * }>}
 */
export async function getTracingProgress(studentId) {
  return request(`/letter-tracing/progress/${studentId}`);
}

/**
 * Sync the frontend's current letter index to the backend.
 * Call inside handleNext(), handlePrev(), handleSelectLetter().
 *
 * @param {number} studentId
 * @param {number} currentLetterIndex
 */
export async function updateLetterIndex(studentId, currentLetterIndex) {
  return request('/letter-tracing/progress/letter-index', {
    method: 'PATCH',
    body: JSON.stringify({ studentId, currentLetterIndex }),
  });
}

/**
 * Get mastery details for all letters a student has attempted.
 * Used to populate the LetterGrid's mastered / in-progress indicators.
 *
 * @param {number} studentId
 * @returns {Promise<Array<{
 *   letter, sound, category, difficulty,
 *   bestScore, attemptCount, mastered
 * }>>}
 */
export async function getMasteryList(studentId) {
  return request(`/letter-tracing/mastery/${studentId}`);
}

/**
 * Get mastery detail for a single Sinhala letter.
 *
 * @param {number} studentId
 * @param {string} letter  — e.g. "අ"  (will be URL-encoded automatically)
 */
export async function getLetterMastery(studentId, letter) {
  return request(
    `/letter-tracing/mastery/${studentId}/${encodeURIComponent(letter)}`
  );
}