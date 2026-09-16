import { useState } from "react";
import "./portfolioMusicToggle.css";

const TRACKS = {
  weightless: {
    label: "Weightless Part 2",
    artist: "Marconi Union",
    service: "YouTube",
    url: "https://www.youtube.com/watch?v=aS41f-yM4M8",
    embedUrl: "https://www.youtube-nocookie.com/embed/aS41f-yM4M8?autoplay=1&rel=0&playsinline=1"
  },
  somethingSpecial: {
    label: "Something Special",
    artist: "Afar",
    service: "Yandex Music",
    url: "https://music.yandex.ru/album/38368363/track/141262604",
    embedUrl: "https://music.yandex.ru/iframe/#track/141262604/38368363"
  }
} as const;

type TrackKey = keyof typeof TRACKS;

export function PortfolioMusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<TrackKey>("weightless");
  const track = TRACKS[activeTrack];

  const selectTrack = (nextTrack: TrackKey) => {
    setActiveTrack(nextTrack);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    selectTrack(activeTrack === "weightless" ? "somethingSpecial" : "weightless");
  };

  return (
    <aside className={`dw-music-control${isPlaying ? " is-playing" : ""}`} aria-live="polite">
      <button
        type="button"
        className="dw-music-button"
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        aria-pressed={isPlaying}
        onClick={() => setIsPlaying((playing) => !playing)}
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

      {isPlaying ? (
        <>
          <button
            type="button"
            className="dw-music-next"
            aria-label={`Switch from ${track.label} to the other background track`}
            title="Switch background track"
            onClick={nextTrack}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5 12.5 12 5 16.5V7.5Zm8 0 7.5 4.5-7.5 4.5V7.5Z" /></svg>
          </button>
          <iframe
            key={activeTrack}
            className="dw-music-embed"
            src={track.embedUrl}
            title={`${track.label} by ${track.artist}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </>
      ) : null}
    </aside>
  );
}
