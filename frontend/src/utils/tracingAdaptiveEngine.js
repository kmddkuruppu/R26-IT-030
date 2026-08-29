// src/utils/tracingAdaptiveEngine.js
//
// Deterministic adaptive scaffolding engine for the
// Letter Tracing and Writing Practice research component.
//
// IMPORTANT:
// This is NOT the Gamified Learning adaptationEngine.js.
// This engine uses recent tracing PERFORMANCE only.
//
// Research design:
// - Adaptive Mode: support changes from recent performance.
// - Static Mode: support stays fixed at the admin-defined baseline.
// - Both groups start from the same baseline for a given letter.
// - Maximum of the last 3 valid submitted attempts is used.
// - No random behaviour.

export const ADAPTIVE_RECENT_N = 3;

export const SUPPORT_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

// These values stay inside the ranges already used by LetterTracing.js.
// HIGH support = easier / more scaffolding.
// LOW support  = less scaffolding.
const SUPPORT_SETTINGS = {
  LOW: {
    guideOpacity: 0.08,
    kpTouchMultiplier: 1.0,
    boundaryMultiplier: 1.0,
  },

  MEDIUM: {
    guideOpacity: 0.19,
    kpTouchMultiplier: 1.3,
    boundaryMultiplier: 1.25,
  },

  HIGH: {
    guideOpacity: 0.32,
    kpTouchMultiplier: 1.6,
    boundaryMultiplier: 1.5,
  },
};

function normalizeBaseDifficulty(baseDifficulty) {
  const value = String(baseDifficulty || 'Medium').trim().toLowerCase();

  if (value === 'easy') return 'Easy';
  if (value === 'hard') return 'Hard';

  return 'Medium';
}

/**
 * Converts the admin-defined letter difficulty into the initial
 * scaffolding level.
 *
 * Easy letter   -> LOW support
 * Medium letter -> MEDIUM support
 * Hard letter   -> HIGH support
 */
export function getInitialSupportLevel(baseDifficulty) {
  const normalized = normalizeBaseDifficulty(baseDifficulty);

  if (normalized === 'Easy') {
    return SUPPORT_LEVELS.LOW;
  }

  if (normalized === 'Hard') {
    return SUPPORT_LEVELS.HIGH;
  }

  return SUPPORT_LEVELS.MEDIUM;
}

/**
 * A valid attempt is an ended/submitted tracing attempt with a valid
 * numeric score from 0 to 100.
 *
 * `completed !== false` intentionally supports older localStorage rows
 * that were created before the completed field existed.
 */
export function isValidCompletedAttempt(entry, letter, mode = null) {
  if (!entry) return false;

  if (entry.letter !== letter) {
    return false;
  }

  if (mode && entry.mode && entry.mode !== mode) {
    return false;
  }

  if (entry.completed === false) {
    return false;
  }

  const score = Number(entry.score);

  if (!Number.isFinite(score)) {
    return false;
  }

  if (score < 0 || score > 100) {
    return false;
  }

  return true;
}

/**
 * Returns the newest valid submitted attempts for the selected letter.
 */
export function getValidRecentAttempts(
  entries,
  letter,
  mode = null,
  limit = ADAPTIVE_RECENT_N
) {
  if (!Array.isArray(entries) || !letter) {
    return [];
  }

  return entries
    .filter((entry) =>
      isValidCompletedAttempt(entry, letter, mode)
    )
    .sort((a, b) => {
      const timeA = Number(
        a.ts ?? a.clientTimestampMs ?? 0
      );

      const timeB = Number(
        b.ts ?? b.clientTimestampMs ?? 0
      );

      return timeB - timeA;
    })
    .slice(0, limit);
}

/**
 * Calculates the average of however many valid attempts are available.
 *
 * 0 attempts -> null
 * 1 attempt  -> average of 1
 * 2 attempts -> average of 2
 * 3 attempts -> average of 3
 */
export function calculateRecentAverage(attempts) {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    return null;
  }

  const scores = attempts
    .map((attempt) => Number(attempt.score))
    .filter(
      (score) =>
        Number.isFinite(score) &&
        score >= 0 &&
        score <= 100
    );

  if (scores.length === 0) {
    return null;
  }

  const average =
    scores.reduce((sum, score) => sum + score, 0) /
    scores.length;

  return Math.round(average * 10) / 10;
}

/**
 * Performance -> support mapping.
 *
 * Existing LetterTracing score interpretation is used:
 *
 * below 60  -> struggling -> HIGH support
 * 60 - 79   -> moderate   -> MEDIUM support
 * 80+       -> strong     -> LOW support
 */
export function determineAdaptiveSupportLevel(recentAverageScore) {
  if (
    recentAverageScore === null ||
    recentAverageScore === undefined ||
    !Number.isFinite(Number(recentAverageScore))
  ) {
    return null;
  }

  const average = Number(recentAverageScore);

  if (average < 60) {
    return SUPPORT_LEVELS.HIGH;
  }

  if (average < 80) {
    return SUPPORT_LEVELS.MEDIUM;
  }

  return SUPPORT_LEVELS.LOW;
}

function getSettingsForLevel(level) {
  const settings =
    SUPPORT_SETTINGS[level] ||
    SUPPORT_SETTINGS.MEDIUM;

  return {
    guideOpacity: settings.guideOpacity,
    kpTouchMultiplier: settings.kpTouchMultiplier,
    boundaryMultiplier: settings.boundaryMultiplier,
  };
}

/**
 * Adaptive condition.
 *
 * No history:
 * use admin-defined initial difficulty.
 *
 * History exists:
 * use recent tracing performance.
 */
export function getAdaptiveSupportSettings({
  baseDifficulty,
  recentAttempts,
}) {
  const normalizedBase =
    normalizeBaseDifficulty(baseDifficulty);

  const recentAverageScore =
    calculateRecentAverage(recentAttempts);

  const supportLevel =
    recentAverageScore === null
      ? getInitialSupportLevel(normalizedBase)
      : determineAdaptiveSupportLevel(
          recentAverageScore
        );

  const settings =
    getSettingsForLevel(supportLevel);

  // Retained only for backward compatibility with the existing
  // numeric research "difficulty" column.
  const adaptiveDifficultyScore =
    recentAverageScore === null
      ? null
      : Math.round(
          Math.max(
            0,
            Math.min(
              1,
              (100 - recentAverageScore) / 100
            )
          ) * 100
        ) / 100;

  return {
    mode: 'adaptive',
    baseDifficulty: normalizedBase,
    supportLevel,
    recentAverageScore,
    recentAttemptCount:
      Array.isArray(recentAttempts)
        ? recentAttempts.length
        : 0,
    adaptiveDifficultyScore,
    ...settings,
  };
}

/**
 * Static/control condition.
 *
 * The support setting is determined once from the admin-defined
 * initial difficulty and does NOT react to recent performance.
 */
export function getStaticSupportSettings(baseDifficulty) {
  const normalizedBase =
    normalizeBaseDifficulty(baseDifficulty);

  const supportLevel =
    getInitialSupportLevel(normalizedBase);

  return {
    mode: 'static',
    baseDifficulty: normalizedBase,
    supportLevel,
    recentAverageScore: null,
    recentAttemptCount: 0,
    adaptiveDifficultyScore: null,
    ...getSettingsForLevel(supportLevel),
  };
}