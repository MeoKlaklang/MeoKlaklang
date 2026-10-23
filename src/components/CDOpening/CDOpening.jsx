
import { useEffect, useRef, useState } from "react";
import styles from "./CDOpening.module.css";

const HEADLINE =
  "What if a temporary home could change an animal's life?";

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

function smoothstep(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export default function CDOpening({
  project,
  progress = 0,
  departureProgress = 0,
}) {
  const [characterCount, setCharacterCount] = useState(0);
  const [typingFinished, setTypingFinished] = useState(false);
  const startedRef = useRef(false);
  const audioRef = useRef(null);

  const image =
    project?.image || "/images/projects/het-mandje.jpg";

  // The disc can use different artwork from the cover.
  const discImage = project?.discImage || image;
  const color = project?.color || "#F4D869";

  /* =====================================
     SCROLL-DRIVEN OPENING
  ===================================== */

  const visibility = smoothstep(
    (progress - 0.23) / 0.10
  );

  const openAmount = smoothstep(
    (progress - 0.34) / 0.29
  );

  const detailsOpacity = smoothstep(
    (progress - 0.58) / 0.09
  );

  const leaveAmount = smoothstep(
    departureProgress
  );

  const coverAngle = -180 * openAmount;
  const horizontalShift = -25 * (1 - openAmount);

  const typingReady = progress >= 0.65;

  /* =====================================
     AUDIO
  ===================================== */

  useEffect(() => {
    const audio = new Audio("/sounds/cd-typing.mp3");
    audio.preload = "auto";
    audio.volume = 0.18;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  /* =====================================
     TYPEWRITER
  ===================================== */

  useEffect(() => {
    if (!typingReady || startedRef.current) return;

    startedRef.current = true;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setCharacterCount(HEADLINE.length);
      setTypingFinished(true);
      return;
    }

    const sound = audioRef.current;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }

    let count = 0;

    const interval = window.setInterval(() => {
      count += 1;
      setCharacterCount(count);

      if (count >= HEADLINE.length) {
        window.clearInterval(interval);
        setTypingFinished(true);
        sound?.pause();
      }
    }, 48);

    return () => {
      window.clearInterval(interval);
      sound?.pause();
    };
  }, [typingReady]);

  /* =====================================
     RENDER
  ===================================== */

  return (
    <div
      className={styles.experience}
      style={{
        "--visibility": visibility,
        "--cover-angle": `${coverAngle}deg`,
        "--horizontal-shift": `${horizontalShift}%`,
        "--details-opacity": detailsOpacity,
        "--project-color": color,
        "--flight-x": `${leaveAmount * 115}vw`,
      }}
    >
      <div className={styles.caseSpread}>
        {/* CD TRAY */}

        <div className={styles.tray}>
          <div className={styles.trayBackground} />

          <div className={styles.discFlight}>
            <div className={styles.disc}>
              <img
                src={discImage}
                alt=""
                draggable={false}
                className={styles.discImage}
              />

              <span className={styles.discRings} />
              <span className={styles.discHole} />
            </div>
          </div>

          <span className={styles.trayEdge} />
          <span className={styles.trayReflection} />
        </div>

        {/* OPENING COVER */}

        <div className={styles.coverPanel}>
          <div className={styles.frontSurface}>
            <img
              src={image}
              alt=""
              draggable={false}
              className={styles.frontImage}
            />

            <span className={styles.frontTint} />
            <span className={styles.frontGloss} />
            <span className={styles.frontSpine} />

            <div className={styles.frontText}>
              <span>SELECTED PROJECT / 2026</span>
              <h2>{project?.title}</h2>
            </div>
          </div>

          {/* INSIDE OF THE COVER */}

          <div className={styles.insideSurface}>
            <div className={styles.insideContent}>
              <span className={styles.eyebrow}>
                01 / A PROJECT WITH A PURPOSE
              </span>

              <h2
                className={styles.introHeadline}
                aria-label={HEADLINE}
              >
                <span aria-hidden="true">
                  {HEADLINE.slice(0, characterCount)}
                </span>

                {characterCount > 0 &&
                  !typingFinished && (
                    <span
                      className={styles.typingCursor}
                      aria-hidden="true"
                    >
                      |
                    </span>
                  )}
              </h2>

              <p
                className={`${styles.introDescription} ${
                  typingFinished
                    ? styles.descriptionVisible
                    : styles.descriptionHidden
                }`}
              >
                Het Mandje connects animal shelters,
                foster families and veterinarians to
                make temporary animal care easier
                to organize.
              </p>

              <span
                className={`${styles.insideHint} ${
                  typingFinished
                    ? styles.hintVisible
                    : styles.descriptionHidden
                }`}
              >
                SCROLL TO DISCOVER ↓
              </span>
            </div>

            <span className={styles.insideReflection} />
          </div>
        </div>

        <div className={styles.hinge} />
      </div>

      <div className={styles.projectCaption}>
        <span>NOW PLAYING</span>
        <strong>{project?.title}</strong>
      </div>
    </div>
  );
}
