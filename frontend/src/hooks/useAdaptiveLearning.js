import { useCallback, useRef, useState } from "react";
import { AdaptationTracker } from "../utils/adaptationEngine";
import { logAdaptationEvent } from "../services/apiService";

/**
 * Wraps AdaptationTracker in React state so game components can consume
 * `difficultyModifier` reactively and the on-screen overlay can react to
 * `activeIntervention`. One instance per active game (created fresh inside
 * GameWithAutoCamera, which already wraps every one of the 8 games).
 */
export default function useAdaptiveLearning({ gameId, lang = "en" }) {
  const trackerRef = useRef(null);
  if (!trackerRef.current) trackerRef.current = new AdaptationTracker();

  const [difficultyModifier, setDifficultyModifier] = useState(0);
  const [activeIntervention, setActiveIntervention] = useState(null);
  const gameSessionIdRef = useRef(null);

  const ingest = useCallback(
    (point) => {
      const { difficultyModifier: dm, interventionEvent } = trackerRef.current.ingest(point);
      setDifficultyModifier(dm);

      if (interventionEvent) {
        setActiveIntervention({ ...interventionEvent, lang });

        logAdaptationEvent({
          gameId,
          gameSessionId: gameSessionIdRef.current,
          triggerState: interventionEvent.state,
          actionTaken: interventionEvent.action,
          engagementScoreAtTrigger: interventionEvent.engagementScore,
          dominantEmotionAtTrigger: interventionEvent.dominantEmotion,
        }).catch((err) => console.error("Failed to log adaptation event:", err));
      }
    },
    [gameId, lang]
  );

  const dismissIntervention = useCallback(() => setActiveIntervention(null), []);

  const reset = useCallback(() => {
    trackerRef.current.reset();
    setDifficultyModifier(0);
    setActiveIntervention(null);
  }, []);

  const setGameSessionId = useCallback((id) => {
    gameSessionIdRef.current = id;
  }, []);

  return { difficultyModifier, activeIntervention, ingest, dismissIntervention, reset, setGameSessionId };
}