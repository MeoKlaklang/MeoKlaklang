
import { useRef, useState } from "react";
import { useAudio } from "../../context/AudioContext";
import Fireworks from "../Fireworks/Fireworks";
import styles from "./LoadingScreen.module.css";

// Add more photos here whenever you want
const PHOTOS = [
  "/images/about/me-2.jpg",
  "/images/loading/meo-1.jpg",
  "/images/about/me-3.jpg",
  "/images/loading/meo-3.jpg",
];

function Icon({ name, size = 21 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "volume":
      return (
        <svg {...props}>
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15 9a5 5 0 0 1 0 6" />
          <path d="M18 6a9 9 0 0 1 0 12" />
        </svg>
      );

    case "mute":
      return (
        <svg {...props}>
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="m16 9 5 6m0-6-5 6" />
        </svg>
      );

    case "previous":
      return (
        <svg {...props}>
          <path d="M5 5v14" />
          <path d="m19 5-11 7 11 7V5Z" fill="currentColor" stroke="none" />
        </svg>
      );

    case "next":
      return (
        <svg {...props}>
          <path d="M19 5v14" />
          <path d="M5 5v14l11-7L5 5Z" fill="currentColor" stroke="none" />
        </svg>
      );

    case "pause":
      return (
        <svg {...props}>
          <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
          <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
        </svg>
      );

    case "play":
      return (
        <svg {...props}>
          <path d="m7 4 14 8-14 8V4Z" fill="currentColor" stroke="none" />
        </svg>
      );

    default:
      return null;
  }
}

export default function LoadingScreen({
  progress,
  paused,
  exiting,
  onTogglePause,
}) {
  const { muted, isPlaying, toggleSound } = useAudio();

  const [photoIndex, setPhotoIndex] = useState(0);
  const screenRef = useRef(null);

  const soundOn = isPlaying && !muted;

  // Previous or next photograph
  function changePhoto(direction) {
    setPhotoIndex((current) =>
      (current + direction + PHOTOS.length) %
      PHOTOS.length
    );
  }

  // Mouse-following colorful background
  function handlePointerMove(event) {
    if (event.pointerType !== "mouse") return;

    const screen = screenRef.current;
    if (!screen) return;

    const rect = screen.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    screen.style.setProperty("--mouse-x", `${x}px`);
    screen.style.setProperty("--mouse-y", `${y}px`);

    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    // Soft hue changes as the cursor moves
    const hue = 115 + normalizedX * 170;

    screen.style.setProperty(
      "--glow-color",
      `hsla(${hue}, 85%, 82%, 0.48)`
    );

    screen.style.setProperty(
      "--glow-color-soft",
      `hsla(${hue + normalizedY * 35}, 80%, 91%, 0.28)`
    );
  }

  return (
    <div
      ref={screenRef}
      className={[
        styles.loadingScreen,
        paused ? styles.paused : "",
        exiting ? styles.exiting : "",
      ].join(" ")}
      onPointerMove={handlePointerMove}
      aria-label={`Loading portfolio ${progress}%`}
    >
      {/* Previous subtle fireworks */}
      <div className={styles.effects}>
        <Fireworks />
      </div>

      {/* Music player */}
      <div className={styles.player}>

        {/* Rotating photo record */}
        <div className={styles.recordWrapper}>
          <div className={styles.record}>
            <img
              key={PHOTOS[photoIndex]}
              src={PHOTOS[photoIndex]}
              alt={`Meo photograph ${photoIndex + 1}`}
              className={styles.recordImage}
              draggable="false"
            />

            <span className={styles.recordHole} />
          </div>
        </div>

        {/* Player information */}
        <div className={styles.playerCard}>
          <div className={styles.header}>
            <div className={styles.songInfo}>
              <h1>Portfolio</h1>
              <p>Meo Klaklang</p>
            </div>

            <button
              type="button"
              className={styles.muteButton}
              onClick={toggleSound}
              aria-label={
                soundOn ? "Mute music" : "Play music"
              }
              title={
                soundOn ? "Mute music" : "Play music"
              }
            >
              <Icon
                name={soundOn ? "volume" : "mute"}
                size={20}
              />
            </button>
          </div>

          {/* Loading progress */}
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Portfolio loading progress"
          >
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Interactive controls */}
          <div className={styles.controls}>

            <button
              type="button"
              className={styles.controlButton}
              onClick={() => changePhoto(-1)}
              aria-label="Previous photo"
              title="Previous photo"
            >
              <Icon name="previous" size={22} />
            </button>

            <button
              type="button"
              className={`${styles.controlButton} ${styles.playButton}`}
              onClick={onTogglePause}
              aria-label={
                paused ? "Resume loading" : "Pause loading"
              }
              title={
                paused ? "Resume loading" : "Pause loading"
              }
            >
              <Icon
                name={paused ? "play" : "pause"}
                size={24}
              />
            </button>

            <button
              type="button"
              className={`${styles.controlButton} ${styles.nextButton}`}
              onClick={() => changePhoto(1)}
              aria-label="Next photo"
              title="Next photo"
            >
              <Icon name="next" size={22} />
            </button>

          </div>
        </div>
      </div>

      <div className={styles.loadingPercentage}>
        {String(progress).padStart(2, "0")}%
        {paused && (
          <span className={styles.pausedLabel}>
            PAUSED
          </span>
        )}
      </div>
    </div>
  );
}
