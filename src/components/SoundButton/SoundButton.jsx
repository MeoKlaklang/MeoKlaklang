
import { useAudio } from "../../context/AudioContext";
import styles from "./SoundButton.module.css";

export default function SoundButton() {
  const { muted, isPlaying, toggleSound } = useAudio();

  const soundOn = isPlaying && !muted;

  return (
    <button
      type="button"
      className={styles.soundButton}
      onClick={toggleSound}
      aria-label={
        soundOn
          ? "Mute background music"
          : "Play background music"
      }
      aria-pressed={soundOn}
      title={soundOn ? "Mute music" : "Play music"}
    >
      {soundOn ? (
        // Sound ON
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15 9a5 5 0 0 1 0 6" />
          <path d="M18 6a9 9 0 0 1 0 12" />
        </svg>
      ) : (
        // Sound OFF
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="m16 9 5 6m0-6-5 6" />
        </svg>
      )}
    </button>
  );
}
