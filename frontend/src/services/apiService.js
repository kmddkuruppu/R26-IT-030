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
// GAME PROGRESS
// ═════════════════════════════════════════════════════════════════

export async function saveGameProgress({ gameId, score, maxScore }) {
  return request('/game-progress', {
    method: 'POST',
    body: JSON.stringify({
      studentId : 1,
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

  await Promise.allSettled(promises);
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