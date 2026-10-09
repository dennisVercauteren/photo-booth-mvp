import { useEffect, useRef, useState } from "react";
import { playRevealBuild, playTada } from "../audio/sound";

type Phase = "charge" | "scan" | "silhouette" | "flash" | "done";

/** A short, skippable show sequence. Does not affect image generation or the result actions. */
export function RevealOverlay({ imageUrl }: { imageUrl: string }) {
  const [phase, setPhase] = useState<Phase>("charge");
  const finished = useRef(false);
  const startedAudio = useRef(false);
  const timers = useRef<number[]>([]);

  function finish(): void {
    if (finished.current) return;
    finished.current = true;
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setPhase("done");
    playTada();
  }

  useEffect(() => {
    const machine = document.documentElement.dataset.theme === "machine";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!machine || reduceMotion) {
      finish();
      return;
    }
    if (!startedAudio.current) {
      startedAudio.current = true;
      playRevealBuild();
    }
    const queue = (at: number, next: Phase) => {
      timers.current.push(window.setTimeout(() => {
        if (next === "done") finish();
        else setPhase(next);
      }, at));
    };
    queue(500, "scan");
    queue(1050, "silhouette");
    queue(1620, "flash");
    queue(1950, "done");
    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  // Only play once per result screen; selecting a thumbnail should not replay the sequence.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "done") return null;
  return (
    <div className={`result-reveal reveal-${phase}`} role="status" aria-live="polite">
      <div className="reveal-rings" aria-hidden="true"><i /><i /><i /></div>
      <div className="reveal-silhouette" aria-hidden="true"><img src={imageUrl} alt="" /></div>
      <div className="reveal-scan-line" aria-hidden="true" />
      <div className="reveal-whiteout" aria-hidden="true" />
      <div className="reveal-message">
        <span className="reveal-kicker">THE TRANSFORMATION MACHINE</span>
        <strong>{phase === "charge" ? "REALITY CHARGING" : phase === "scan" ? "IDENTITY RECONSTRUCTION" : phase === "silhouette" ? "NEW FORM DETECTED" : "REVEALING YOUR ALTER EGO"}</strong>
        <small>PREPARE FOR THE IMPOSSIBLE</small>
      </div>
      <button type="button" className="reveal-skip" onClick={finish}>Reveal now</button>
    </div>
  );
}
