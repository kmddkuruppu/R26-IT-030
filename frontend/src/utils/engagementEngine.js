// engagementEngine.js
//
// Research note (put this in your methodology chapter):
// MediaPipe FaceLandmarker outputs 52 ARKit-style "blendshape" scores per frame,
// each representing how strongly one facial muscle group is activated (0-1).
// This is far richer than a 7-class emotion label. We combine a subset of these
// blendshapes into:
//   1) an Engagement/Interest score (0-100) — a continuous, weighted heuristic
//   2) a discrete emotion label — for readable UI + comparability with literature
//
// The weights below are a heuristic Action-Unit-inspired scoring model,
// loosely based on FACS (Facial Action Coding System) positive/negative affect
// groupings commonly used in engagement-detection literature. Tune the WEIGHTS
// object based on your pilot data / validation study.

const WEIGHTS = {
  smile: 40,      // mouthSmileLeft/Right avg -> enjoyment / positive interest
  browRaise: 15,  // browInnerUp -> surprise / curiosity
  eyeWide: 15,     // eyeWideLeft/Right avg -> surprise / heightened attention
  browDown: 20,    // browDownLeft/Right avg -> confusion / concentration strain
  frown: 25,        // mouthFrownLeft/Right avg -> frustration / dislike
  lookAway: 15,    // eyeLookDown/Out avg -> distraction / disengagement
};

function avg(map, keys) {
  const vals = keys.map((k) => map[k] ?? 0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/**
 * Converts the raw `faceBlendshapes[0].categories` array from MediaPipe
 * FaceLandmarker into a simple { categoryName: score } lookup map.
 */
export function blendshapesToMap(categories) {
  const map = {};
  categories.forEach((c) => {
    map[c.categoryName] = c.score;
  });
  return map;
}

/**
 * Returns { score: 0-100, signals: {...} }
 * score >= 70  -> highly engaged / interested
 * score 40-69  -> moderately engaged
 * score < 40   -> low engagement / disinterested / frustrated
 */
export function calculateEngagement(map) {
  const smile = avg(map, ["mouthSmileLeft", "mouthSmileRight"]);
  const browRaise = map["browInnerUp"] ?? 0;
  const eyeWide = avg(map, ["eyeWideLeft", "eyeWideRight"]);
  const browDown = avg(map, ["browDownLeft", "browDownRight"]);
  const frown = avg(map, ["mouthFrownLeft", "mouthFrownRight"]);
  const lookAway = avg(map, [
    "eyeLookDownLeft",
    "eyeLookDownRight",
    "eyeLookOutLeft",
    "eyeLookOutRight",
  ]);

  const positive =
    smile * WEIGHTS.smile + browRaise * WEIGHTS.browRaise + eyeWide * WEIGHTS.eyeWide;
  const negative =
    browDown * WEIGHTS.browDown + frown * WEIGHTS.frown + lookAway * WEIGHTS.lookAway;

  let score = 50 + positive - negative; // 50 = neutral baseline
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    signals: { smile, browRaise, eyeWide, browDown, frown, lookAway },
  };
}

/**
 * Returns { label, confidence } where label is one of:
 * "happy" | "surprised" | "confused" | "frustrated" | "neutral"
 * (lowercase, matches EXPRESSION_MAP keys in GamifiedLearningPage.jsx)
 */
export function classifyEmotion(map) {
  const smile = avg(map, ["mouthSmileLeft", "mouthSmileRight"]);
  const browRaise = map["browInnerUp"] ?? 0;
  const eyeWide = avg(map, ["eyeWideLeft", "eyeWideRight"]);
  const jawOpen = map["jawOpen"] ?? 0;
  const browDown = avg(map, ["browDownLeft", "browDownRight"]);
  const frown = avg(map, ["mouthFrownLeft", "mouthFrownRight"]);
  const squint = avg(map, ["eyeSquintLeft", "eyeSquintRight"]);

  const scores = {
    happy: smile * 1.2,
    surprised: ((eyeWide + jawOpen + browRaise) / 3) * 1.1,
    confused: (browDown + squint) / 2,
    frustrated: ((browDown + frown) / 2) * 1.1,
    neutral: 0.32, // baseline so "neutral" wins when nothing else is strongly activated
  };

  let best = "neutral";
  let bestScore = scores.neutral;
  Object.entries(scores).forEach(([k, v]) => {
    if (v > bestScore) {
      best = k;
      bestScore = v;
    }
  });

  return { label: best, confidence: Math.min(1, Number(bestScore.toFixed(3))) };
}