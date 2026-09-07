import { useCallback, useEffect, useRef, useState } from "react";
import "./portfolioMusicToggle.css";

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
  const [isPlaying, setIsPlaying] = useState(false);

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
      stop();
      return;
    }
    void start();
  }, [isPlaying, start, stop]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      stop(false);
    };
  }, [stop]);

  return (
    <aside className={`dw-music-control${isPlaying ? " is-playing" : ""}`} aria-live="polite">
      <button
        type="button"
        className="dw-music-button"
        aria-label={isPlaying ? "Pause ambient music" : "Play ambient music"}
        aria-pressed={isPlaying}
        onClick={toggle}
      >
        <svg className="dw-music-icon" viewBox="0 0 32 32" aria-hidden="true">
          <defs>
            <clipPath id="dw-music-clip">
              <circle cx="16" cy="16" r="10" />
            </clipPath>
          </defs>
          <g className="dw-music-glyph" clipPath="url(#dw-music-clip)">
            <path className="dw-music-sine" d="M -8 16 q 3 -5 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0" />
          </g>
          <line className="dw-music-flat" x1="9" y1="16" x2="23" y2="16" />
        </svg>
      </button>
    </aside>
  );
}
