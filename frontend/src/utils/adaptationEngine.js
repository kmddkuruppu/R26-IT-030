// adaptationEngine.js
//
// Research note (methodology chapter material):
// This module converts the continuous engagement stream — already computed
// by engagementEngine.js from MediaPipe blendshapes, emitted roughly every
// SAMPLE_WINDOW_MS = 3000ms by FaceReactionScanner — into two distinct
// adaptation signals:
//
//   1. A CONTINUOUS "difficultyModifier" in [-1, +1] — an EMA-smoothed,
//      silent signal games can read to nudge difficulty (extra time,
//      fewer distractors, simpler letters) with no UI interruption.
//
//   2. Discrete "intervention events" — hysteresis + cooldown gated
//      decisions (ENCOURAGEMENT / HINT / SIMPLIFY / SUGGEST_SWITCH /
//      SPEED_UP) that surface as an on-screen banner AND get logged to
//      /api/adaptation/event for offline research analysis of whether the
//      intervention actually helped engagement recover afterwards.
//
// Hysteresis (WINDOW_SIZE consecutive low/negative samples required) and a
// COOLDOWN_MS prevent flicker — important for young children (age 1-5) who
// glance away or fidget briefly without genuinely disengaging.

export const NEGATIVE_EMOTIONS = ["frustrated", "angry", "confused"];
export const LOW_ENGAGEMENT_THRESHOLD = 38;
export const HIGH_ENGAGEMENT_THRESHOLD = 65;
export const WINDOW_SIZE = 3;           // consecutive samples required to trigger (~9s)
export const COOLDOWN_MS = 25000;       // min gap between two fired interventions
export const MODIFIER_SMOOTHING = 0.35; // EMA smoothing factor for the continuous modifier

export class AdaptationTracker {
  constructor() {
    this.buffer = [];
    this.lastActionAt = 0;
    this.difficultyModifier = 0;
    this.frustrationEventCount = 0; // escalation: 1st = encourage, 2nd+ = simplify
    this.lastBoredAction = "SPEED_UP"; // alternates bored-state actions
  }

  reset() {
    this.buffer = [];
    this.lastActionAt = 0;
    this.difficultyModifier = 0;
    this.frustrationEventCount = 0;
  }

  /**
   * @param {{engagementScore:number, rawName:string, confidence:number}} point
   * @returns {{ difficultyModifier:number, interventionEvent: object|null }}
   */
  ingest(point) {
    const now = Date.now();
    this.buffer.push({ ...point, t: now });
    if (this.buffer.length > WINDOW_SIZE * 3) this.buffer.shift();

    // ── 1. Continuous modifier ──
    const targetSample = this._sampleEase(point);
    this.difficultyModifier =
      this.difficultyModifier * (1 - MODIFIER_SMOOTHING) + targetSample * MODIFIER_SMOOTHING;
    this.difficultyModifier = Math.max(-1, Math.min(1, this.difficultyModifier));

    // ── 2. Discrete, cooldown-gated intervention ──
    let interventionEvent = null;
    if (this.buffer.length >= WINDOW_SIZE && now - this.lastActionAt >= COOLDOWN_MS) {
      const recent = this.buffer.slice(-WINDOW_SIZE);
      const avgScore = recent.reduce((a, b) => a + b.engagementScore, 0) / recent.length;
      const frustratedCount = recent.filter((p) => ["frustrated", "angry"].includes(p.rawName)).length;
      const confusedCount = recent.filter((p) => p.rawName === "confused").length;
      const negativeCount = recent.filter((p) => NEGATIVE_EMOTIONS.includes(p.rawName)).length;

      if (frustratedCount >= WINDOW_SIZE - 1 && avgScore < LOW_ENGAGEMENT_THRESHOLD + 5) {
        this.frustrationEventCount += 1;
        const action = this.frustrationEventCount >= 2 ? "SIMPLIFY" : "ENCOURAGEMENT";
        interventionEvent = this._makeEvent("frustrated", action, point, avgScore);
      } else if (confusedCount >= WINDOW_SIZE - 1) {
        interventionEvent = this._makeEvent("confused", "HINT", point, avgScore);
      } else if (avgScore < LOW_ENGAGEMENT_THRESHOLD && negativeCount === 0) {
        const action = this.lastBoredAction === "SPEED_UP" ? "SUGGEST_SWITCH" : "SPEED_UP";
        this.lastBoredAction = action;
        interventionEvent = this._makeEvent("bored", action, point, avgScore);
      }

      if (interventionEvent) this.lastActionAt = now;
    }

    return {
      difficultyModifier: Math.round(this.difficultyModifier * 100) / 100,
      interventionEvent,
    };
  }

  _sampleEase(point) {
    // -1 = make it much easier · 0 = no change · +1 = safe to raise difficulty
    if (["frustrated", "angry"].includes(point.rawName)) return -1;
    if (point.rawName === "confused") return -0.6;
    if (point.engagementScore >= HIGH_ENGAGEMENT_THRESHOLD) return 0.6;
    if (point.engagementScore < LOW_ENGAGEMENT_THRESHOLD) return -0.3;
    return 0;
  }

  _makeEvent(state, action, point, avgScore) {
    return {
      state,
      action,
      engagementScore: Math.round(avgScore),
      dominantEmotion: point.rawName,
      confidence: point.confidence,
      timestamp: Date.now(),
    };
  }
}

// ── UI copy per action, en/si/ta — same inline-translation convention
//    already used across GamifiedLearningPage.jsx ──
export const INTERVENTION_MESSAGES = {
  ENCOURAGEMENT: {
    en: ["You're doing great — keep going! 💪", "Nice try! You've got this!"],
    si: ["ඔයා හොඳට කරනවා — දිගටම කරගෙන යන්න! 💪", "හොඳ උත්සාහයක්! ඔයාට පුළුවන්!"],
    ta: ["நீங்கள் நன்றாக செய்கிறீர்கள் — தொடருங்கள்! 💪", "நல்ல முயற்சி! உங்களால் முடியும்!"],
  },
  HINT: {
    en: ["Take your time and look closely at the shape 👀"],
    si: ["ඉක්මන් වෙන්න එපා, හැඩය හොඳට බලන්න 👀"],
    ta: ["அவசரப்படாதீர்கள், வடிவத்தை உன்னிப்பாகப் பாருங்கள் 👀"],
  },
  SIMPLIFY: {
    en: ["Let's make this a little easier for you 🌱"],
    si: ["මේක ටිකක් පහසු කරමු 🌱"],
    ta: ["இதை கொஞ்சம் எளிதாக்குவோம் 🌱"],
  },
  SUGGEST_SWITCH: {
    en: ["Feeling bored? Try a different game! 🎮"],
    si: ["කම්මැලියි කියලා දැනෙනවද? වෙන ක්‍රීඩාවක් උත්සාහ කරන්න! 🎮"],
    ta: ["சலிப்பாக உள்ளதா? வேறு விளையாட்டை முயற்சிக்கவும்! 🎮"],
  },
  SPEED_UP: {
    en: ["Let's pick up the pace! ⚡"],
    si: ["වේගය වැඩි කරමු! ⚡"],
    ta: ["வேகத்தை அதிகரிப்போம்! ⚡"],
  },
};

export function pickMessage(action, lang = "en") {
  const set = INTERVENTION_MESSAGES[action]?.[lang] ?? INTERVENTION_MESSAGES[action]?.en ?? [""];
  return set[Math.floor(Math.random() * set.length)];
}