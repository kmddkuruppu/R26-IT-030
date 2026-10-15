/**
 * Sinhala Letter Confusion-Aware Adaptive Learning Engine
 * Research component for Letter Hunt.
 *
 * Tracks letter recognition attempts and prioritizes
 * letters that learners frequently confuse.
 */

export function recordLetterAttempt(
  attempts,
  targetLetter,
  selectedLetter
) {
  const attempt = {
    targetLetter,
    selectedLetter,
    correct: targetLetter === selectedLetter,
    timestamp: new Date().toISOString(),
  };

  return [...attempts, attempt];
}

export function calculateConfusionScores(attempts) {
  const scores = {};

  for (const attempt of attempts) {
    if (attempt.correct) continue;

    const target = attempt.targetLetter;
    const selected = attempt.selectedLetter;

    if (!scores[target]) {
      scores[target] = {};
    }

    scores[target][selected] =
      (scores[target][selected] || 0) + 1;
  }

  return scores;
}

export function selectAdaptiveTarget(
  letters,
  attempts,
  random = Math.random
) {
  if (!Array.isArray(letters) || letters.length === 0) {
    return null;
  }

  const validLetters = letters.filter(
    (item) => item && typeof item.letter === "string"
  );

  if (validLetters.length === 0) {
    return null;
  }

  const validLetterSet = new Set(
    validLetters.map((item) => item.letter)
  );

  const mistakeCounts = {};

  for (const attempt of attempts) {
    if (
      attempt.correct === false &&
      validLetterSet.has(attempt.targetLetter)
    ) {
      const target = attempt.targetLetter;

      mistakeCounts[target] =
        (mistakeCounts[target] || 0) + 1;
    }
  }

  const weights = validLetters.map(
    (item) => 1 + (mistakeCounts[item.letter] || 0)
  );

  const totalWeight = weights.reduce(
    (sum, weight) => sum + weight,
    0
  );

  let selection = random() * totalWeight;

  for (let i = 0; i < validLetters.length; i++) {
    selection -= weights[i];

    if (selection < 0) {
      return validLetters[i];
    }
  }

  return validLetters[validLetters.length - 1];
}

export function selectAdaptiveDistractor(
  letters,
  targetLetter,
  attempts,
  random = Math.random
) {
  if (!Array.isArray(letters)) return null;

  const candidates = letters.filter(
    item => item &&
      typeof item.letter === "string" &&
      item.letter !== targetLetter
  );

  if (candidates.length === 0) return null;

  const confusionScores = calculateConfusionScores(attempts);
  const targetConfusions = confusionScores[targetLetter] || {};

  const weights = candidates.map(
    item => 1 + (targetConfusions[item.letter] || 0)
  );

  const totalWeight = weights.reduce(
    (sum, weight) => sum + weight, 0
  );

  let selection = random() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    selection -= weights[i];

    if (selection < 0) return candidates[i];
  }

  return candidates[candidates.length - 1];
}