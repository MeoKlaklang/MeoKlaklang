
import {
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./CDOpening.module.css";

const HEADLINE =
  "What if a temporary home could change an animal's life?";

const TYPING_SPEED = 48;
const VISIBILITY_GRACE = 350;

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
  const [characterCount, setCharacterCount] =
    useState(0);

  const [typingFinished, setTypingFinished] =
    useState(false);

  const [isOnScreen, setIsOnScreen] =
    useState(false);

  const experienceRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const pauseTimerRef = useRef(null);

  const characterRef = useRef(0);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);

  /* =====================================
     PROJECT IMAGES / COLORS
  ===================================== */

  const image =
    project?.image ||
    "/images/projects/het-mandje.jpg";

  const discImage =
    project?.discImage || image;

  const color =
    project?.color || "#F4D869";

  /* =====================================
     SCROLL-DRIVEN OPENING
  ===================================== */

  const visibility = smoothstep(
    (progress - 0.23) / 0.1
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

  const horizontalShift =
    -25 * (1 - openAmount);

  /*
    Start only when the CD is actually
    open and visible.

    IMPORTANT:
    This controls the START of typing,
    not every individual character.
  */

  const canStartTyping =
    progress >= 0.65 &&
    departureProgress < 0.08 &&
    isOnScreen;

  const isLeaving =
    departureProgress >= 0.15 ||
    progress < 0.5;

  /* =====================================
     HELPERS
  ===================================== */

  function stopTyping() {
    if (intervalRef.current !== null) {
      window.clearInterval(
        intervalRef.current
      );

      intervalRef.current = null;
    }

    const sound = audioRef.current;

    if (sound) {
      sound.pause();
    }
  }

  function finishTyping() {
    stopTyping();

    characterRef.current =
      HEADLINE.length;

    finishedRef.current = true;

    setCharacterCount(
      HEADLINE.length
    );

    setTypingFinished(true);
  }

  /* =====================================
     CREATE AUDIO ONCE
  ===================================== */

  useEffect(() => {
    const audio = new Audio(
      "/sounds/cd-typing.mp3"
    );

    audio.preload = "auto";
    audio.volume = 0.18;

    audioRef.current = audio;

    return () => {
      window.clearInterval(
        intervalRef.current
      );

      window.clearTimeout(
        pauseTimerRef.current
      );

      audio.pause();
      audio.currentTime = 0;

      audioRef.current = null;
    };
  }, []);

  /* =====================================
     TRACK VISIBILITY

     Use a generous viewport threshold.
     Small changes in intersection ratio
     should not interrupt typing.
  ===================================== */

  useEffect(() => {
    const element =
      experienceRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOnScreen(
          entry.isIntersecting
        );
      },
      {
        root: null,
        rootMargin: "-5% 0px -5% 0px",
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =====================================
     START / RESUME TYPING
  ===================================== */

  useEffect(() => {
    if (!canStartTyping) return;

    if (finishedRef.current) return;

    /*
      Cancel a pending pause if the
      opening becomes visible again.
    */

    window.clearTimeout(
      pauseTimerRef.current
    );

    pauseTimerRef.current = null;

    /*
      The interval is already running.
      Don't create another one.
    */

    if (intervalRef.current !== null) {
      return;
    }

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reduceMotion) {
      finishTyping();
      return;
    }

    startedRef.current = true;

    const sound = audioRef.current;

    if (sound) {
      sound.loop = true;

      sound.play().catch(() => {});
    }

    /*
      Continue from the previous
      character instead of restarting.
    */

    intervalRef.current = window.setInterval(
      () => {
        const next = Math.min(
          characterRef.current + 1,
          HEADLINE.length
        );

        characterRef.current = next;

        setCharacterCount(next);

        if (next >= HEADLINE.length) {
          finishTyping();
        }
      },
      TYPING_SPEED
    );
  }, [canStartTyping]);

  /* =====================================
     STOP WHEN REALLY LEAVING

     Give temporary visibility changes
     a small grace period.

     This avoids choppy typing caused
     by the CD flip animation.
  ===================================== */

  useEffect(() => {
    if (!startedRef.current) return;

    if (finishedRef.current) return;

    window.clearTimeout(
      pauseTimerRef.current
    );

    if (isLeaving) {
      stopTyping();
      return;
    }

    if (!isOnScreen) {
      pauseTimerRef.current =
        window.setTimeout(() => {
          stopTyping();
        }, VISIBILITY_GRACE);
    }

    return () => {
      window.clearTimeout(
        pauseTimerRef.current
      );
    };
  }, [isOnScreen, isLeaving]);

  /* =====================================
     STOP AUDIO IF TAB IS HIDDEN
  ===================================== */

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        stopTyping();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  /* =====================================
     RENDER
  ===================================== */

  return (
    <div
      ref={experienceRef}
      className={styles.experience}
      style={{
        "--visibility": visibility,
        "--cover-angle": `${coverAngle}deg`,
        "--horizontal-shift":
          `${horizontalShift}%`,
        "--details-opacity":
          detailsOpacity,
        "--project-color": color,
        "--flight-x":
          `${leaveAmount * 115}vw`,
      }}
    >
      <div className={styles.caseSpread}>
        {/* CD TRAY */}

        <div className={styles.tray}>
          <div
            className={
              styles.trayBackground
            }
          />

          <div
            className={styles.discFlight}
          >
            <div className={styles.disc}>
              <img
                src={discImage}
                alt=""
                draggable={false}
                className={
                  styles.discImage
                }
              />

              <span
                className={
                  styles.discRings
                }
              />

              <span
                className={
                  styles.discHole
                }
              />
            </div>
          </div>

          <span
            className={styles.trayEdge}
          />

          <span
            className={
              styles.trayReflection
            }
          />
        </div>

        {/* OPENING COVER */}

        <div
          className={styles.coverPanel}
        >
          <div
            className={styles.frontSurface}
          >
            <img
              src={image}
              alt=""
              draggable={false}
              className={
                styles.frontImage
              }
            />

            <span
              className={styles.frontTint}
            />

            <span
              className={styles.frontGloss}
            />

            <span
              className={
                styles.frontSpine
              }
            />

            <div
              className={styles.frontText}
            >
              <span>
                SELECTED PROJECT / 2026
              </span>

              <h2>
                {project?.title}
              </h2>
            </div>
          </div>

          {/* INSIDE OF COVER */}

          <div
            className={
              styles.insideSurface
            }
          >
            <div
              className={
                styles.insideContent
              }
            >
              <span
                className={styles.eyebrow}
              >
                01 / A PROJECT WITH A PURPOSE
              </span>

              <h2
                className={
                  styles.introHeadline
                }
                aria-label={HEADLINE}
              >
                <span aria-hidden="true">
                  {HEADLINE.slice(
                    0,
                    characterCount
                  )}
                </span>

                {characterCount > 0 &&
                  !typingFinished && (
                    <span
                      className={
                        styles.typingCursor
                      }
                      aria-hidden="true"
                    >
                      |
                    </span>
                  )}
              </h2>

              <p
                className={`${
                  styles.introDescription
                } ${
                  typingFinished
                    ? styles.descriptionVisible
                    : styles.descriptionHidden
                }`}
              >
                Het Mandje connects animal
                shelters, foster families
                and veterinarians to make
                temporary animal care easier
                to organize.
              </p>

              <span
                className={`${
                  styles.insideHint
                } ${
                  typingFinished
                    ? styles.hintVisible
                    : styles.descriptionHidden
                }`}
              >
                SCROLL TO DISCOVER ↓
              </span>
            </div>

            <span
              className={
                styles.insideReflection
              }
            />
          </div>
        </div>

        <div
          className={styles.hinge}
        />
      </div>

      <div
        className={
          styles.projectCaption
        }
      >
        <span>NOW PLAYING</span>

        <strong>
          {project?.title}
        </strong>
      </div>
    </div>
  );
}
