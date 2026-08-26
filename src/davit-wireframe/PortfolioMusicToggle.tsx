import { useCallback, useEffect, useRef, useState } from "react";
import "./portfolioMusicToggle.css";

const BAR_COUNT = 5;
const CHORDS = [
  [110, 164.81, 220, 329.63],
  [98, 146.83, 196, 293.66],
  [82.41, 123.47, 164.81, 246.94],
  [92.5, 138.59, 185, 277.18]
];

type AmbientEngine = {
  context: AudioContext;
  master: GainNode;
  oscillators: OscillatorNode[];
  chordTimer: number;
};

function randomHeights() {
  return Array.from({ length: BAR_COUNT }, () => Math.random() * 0.8 + 0.2);
}

function createAmbientEngine(): AmbientEngine {
  const context = new AudioContext();
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  const delay = context.createDelay(1.5);
  const delayLevel = context.createGain();
  const feedback = context.createGain();

  master.gain.setValueAtTime(0, context.currentTime);
  master.gain.linearRampToValueAtTime(0.42, context.currentTime + 1.8);
  filter.type = "lowpass";
  filter.frequency.value = 1250;
  filter.Q.value = 0.8;
  delay.delayTime.value = 0.42;
  delayLevel.gain.value = 0.16;
  feedback.gain.value = 0.2;

  filter.connect(master);
  filter.connect(delay);
  delay.connect(delayLevel);
  delayLevel.connect(master);
  delay.connect(feedback);
  feedback.connect(delay);
  master.connect(context.destination);

  const oscillators = CHORDS[0].map((frequency, index) => {
    const oscillator = context.createOscillator();
    const level = context.createGain();
    oscillator.type = index === 0 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = index % 2 ? -5 : 5;
    level.gain.value = index === 0 ? 0.045 : 0.026;
    oscillator.connect(level);
    level.connect(filter);
    oscillator.start();
    return oscillator;
  });

  let chordIndex = 0;
  const advanceChord = () => {
    chordIndex = (chordIndex + 1) % CHORDS.length;
    const transitionAt = context.currentTime + 0.15;
    oscillators.forEach((oscillator, index) => {
      oscillator.frequency.cancelScheduledValues(context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(CHORDS[chordIndex][index], transitionAt + 1.8);
    });
  };

  const chordTimer = window.setInterval(advanceChord, 5200);
  return { context, master, oscillators, chordTimer };
}

export function PortfolioMusicToggle() {
  const engineRef = useRef<AmbientEngine | null>(null);
  const mountedRef = useRef(true);
  const userPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [heights, setHeights] = useState(() => Array(BAR_COUNT).fill(0.12));

  const stop = useCallback((updateState = true) => {
    const engine = engineRef.current;
    if (!engine) return;
    window.clearInterval(engine.chordTimer);
    const stopAt = engine.context.currentTime + 0.45;
    engine.master.gain.cancelScheduledValues(engine.context.currentTime);
    engine.master.gain.setValueAtTime(engine.master.gain.value, engine.context.currentTime);
    engine.master.gain.linearRampToValueAtTime(0, stopAt);
    window.setTimeout(() => {
      engine.oscillators.forEach((oscillator) => oscillator.stop());
      void engine.context.close();
    }, 500);
    engineRef.current = null;
    if (updateState && mountedRef.current) setIsPlaying(false);
  }, []);

  const start = useCallback(async () => {
    let engine = engineRef.current;
    if (!engine) {
      engine = createAmbientEngine();
      engineRef.current = engine;
    }
    try {
      await engine.context.resume();
    } catch {
      // Browsers can reject sound until the visitor interacts with the page.
    }
    const started = engine.context.state === "running";
    if (mountedRef.current) setIsPlaying(started);
    return started;
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      userPausedRef.current = true;
      stop();
      return;
    }
    userPausedRef.current = false;
    void start();
  }, [isPlaying, start, stop]);

  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(BAR_COUNT).fill(0.12));
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setHeights([0.3, 0.65, 0.9, 0.55, 0.25]);
      return;
    }
    const waveformTimer = window.setInterval(() => setHeights(randomHeights()), 120);
    return () => window.clearInterval(waveformTimer);
  }, [isPlaying]);

  useEffect(() => {
    mountedRef.current = true;

    const removeUnlockListeners = () => {
      window.removeEventListener("click", unlockAutoplay, true);
      window.removeEventListener("keydown", unlockAutoplay, true);
    };

    const unlockAutoplay = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".dw-music-button")) return;
      if (userPausedRef.current) return;
      void start().then((started) => {
        if (started) removeUnlockListeners();
      });
    };

    window.addEventListener("click", unlockAutoplay, true);
    window.addEventListener("keydown", unlockAutoplay, true);
    void start().then((started) => {
      if (started) removeUnlockListeners();
    });

    return () => {
      mountedRef.current = false;
      removeUnlockListeners();
      stop(false);
    };
  }, [start, stop]);

  return (
    <aside className={`dw-music-control${isPlaying ? " is-playing" : ""}`} aria-live="polite">
      <button
        type="button"
        className="dw-music-button"
        aria-label={isPlaying ? "Pause ambient music" : "Play ambient music"}
        aria-pressed={isPlaying}
        onClick={toggle}
      >
        <span className="dw-music-wave" aria-hidden="true">
          {heights.map((height, index) => (
            <i key={index} style={{ "--bar-scale": height } as React.CSSProperties} />
          ))}
        </span>
      </button>
    </aside>
  );
}
