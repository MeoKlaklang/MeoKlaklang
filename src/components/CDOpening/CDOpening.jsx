
import {
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./CDOpening.module.css";

const HEADLINE =
  "What if a temporary home could change an animal's life?";

const TYPING_SPEED = 48;
const OPEN_DURATION = 900;

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

/* =========================================
   ANIMATION STAGES

   1 = Closed jewel case
   2 = Open jewel case
   3 = Disc flies RIGHT out of screen
========================================= */

function getStage(progress, departureProgress) {
  if (
    departureProgress > 0.05 ||
    progress >= 0.84
  ) {
    return 3;
  }

  if (progress >= 0.49) {
    return 2;
  }

  return 1;
}

export default function CDOpening({
  project,
  progress = 0,
  departureProgress = 0,
  step,
}) {
  const [characterCount, setCharacterCount] =
    useState(0);

  const [typingFinished, setTypingFinished] =
    useState(false);

  const [
    openAnimationFinished,
    setOpenAnimationFinished,
  ] = useState(false);

  const [isOnScreen, setIsOnScreen] =
    useState(false);

  const experienceRef = useRef(null);
  const audioRef = useRef(null);
  const typingTimerRef = useRef(null);
  const openingTimerRef = useRef(null);

  /* =====================================
     PROJECT IMAGES & COLORS
  ===================================== */

  const image =
    project?.image ||
    "/images/projects/het-mandje.jpg";

  const discImage =
    project?.discImage || image;

  const color =
    project?.color || "#F4D869";

  /* =====================================
     DETERMINE CURRENT STAGE
  ===================================== */

  const controlled =
    step !== undefined && step !== null;

  const stage = controlled
    ? clamp(Math.round(Number(step) || 1), 1, 3)
    : getStage(progress, departureProgress);

  const isClosed = stage === 1;
  const isOpen = stage === 2;
  const isLeaving = stage === 3;

  const isVisible = controlled
    ? true
    : progress >= 0.23;

  /* =====================================
     CREATE AUDIO
  ===================================== */

  useEffect(() => {
    const audio = new Audio(
      "/sounds/cd-typing.mp3"
    );

    audio.preload = "auto";
    audio.volume = 0.18;
    audio.loop = true;

    audioRef.current = audio;

    return () => {
      window.clearInterval(
        typingTimerRef.current
      );

      window.clearTimeout(
        openingTimerRef.current
      );

      audio.pause();
      audio.currentTime = 0;

      audioRef.current = null;
    };
  }, []);

  /* =====================================
     CHECK VIEWPORT VISIBILITY
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
        threshold: 0,
        rootMargin: "-5% 0px -5% 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =====================================
     WAIT UNTIL COVER IS OPEN
  ===================================== */

  useEffect(() => {
    window.clearTimeout(
      openingTimerRef.current
    );

    if (!isOpen) {
      setOpenAnimationFinished(false);
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reducedMotion) {
      setOpenAnimationFinished(true);
      return;
    }

    openingTimerRef.current =
      window.setTimeout(() => {
        setOpenAnimationFinished(true);
      }, OPEN_DURATION);

    return () => {
      window.clearTimeout(
        openingTimerRef.current
      );
    };
  }, [isOpen]);

  /* =====================================
     TYPEWRITER

     Only starts after opening.
     Stops when leaving.
  ===================================== */

  useEffect(() => {
    window.clearInterval(
      typingTimerRef.current
    );

    typingTimerRef.current = null;

    const audio = audioRef.current;

    if (audio) {
      audio.pause();
    }

    if (isClosed) {
      setCharacterCount(0);
      setTypingFinished(false);
      return;
    }

    if (isLeaving) {
      return;
    }

    if (
      !isOpen ||
      !openAnimationFinished ||
      !isOnScreen ||
      typingFinished
    ) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reducedMotion) {
      setCharacterCount(HEADLINE.length);
      setTypingFinished(true);
      return;
    }

    if (audio) {
      audio.play().catch(() => {});
    }

    typingTimerRef.current =
      window.setInterval(() => {
        setCharacterCount((previous) => {
          const next = Math.min(
            previous + 1,
            HEADLINE.length
          );

          if (next >= HEADLINE.length) {
            window.clearInterval(
              typingTimerRef.current
            );

            typingTimerRef.current = null;

            if (audioRef.current) {
              audioRef.current.pause();
            }

            setTypingFinished(true);
          }

          return next;
        });
      }, TYPING_SPEED);

    return () => {
      window.clearInterval(
        typingTimerRef.current
      );

      typingTimerRef.current = null;

      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [
    isClosed,
    isOpen,
    isLeaving,
    openAnimationFinished,
    isOnScreen,
    typingFinished,
  ]);

  /* =====================================
     PAUSE AUDIO WHEN TAB IS HIDDEN
  ===================================== */

  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.hidden &&
        audioRef.current
      ) {
        audioRef.current.pause();
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
     STAGE CLASSES
  ===================================== */

  const experienceClass = [
    styles.experience,

    isClosed
      ? styles.stageClosed
      : "",

    isOpen
      ? styles.stageOpen
      : "",

    isLeaving
      ? styles.stageLeaving
      : "",

    isVisible
      ? styles.experienceVisible
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  /* =====================================
     RENDER
  ===================================== */

  return (
    <div
      ref={experienceRef}
      className={experienceClass}
      style={{
        "--project-color": color,
      }}
      data-stage={stage}
    >
      {/* =================================
          JEWEL CASE
      ================================= */}

      <div className={styles.caseSpread}>

        {/* RIGHT TRAY */}

        <div className={styles.tray}>
          <div
            className={
              styles.trayBackground
            }
          />

          {/* CD INSIDE TRAY */}

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

        {/* =================================
            FRONT COVER
        ================================= */}

        <div
          className={styles.coverPanel}
        >
          <div
            className={
              styles.frontSurface
            }
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

          {/* =================================
              INSIDE COVER
          ================================= */}

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
                className={
                  styles.eyebrow
                }
              >
                01 / A PROJECT WITH A PURPOSE
              </span>

              <h2
                className={
                  styles.introHeadline
                }
                aria-label={HEADLINE}
              >
                <span
                  aria-hidden="true"
                >
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
                className={[
                  styles.introDescription,

                  typingFinished
                    ? styles.descriptionVisible
                    : styles.descriptionHidden,
                ].join(" ")}
              >
                Het Mandje connects animal
                shelters, foster families
                and veterinarians to make
                temporary animal care
                easier to organize.
              </p>

              <span
                className={[
                  styles.insideHint,

                  typingFinished
                    ? styles.hintVisible
                    : styles.descriptionHidden,
                ].join(" ")}
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

        {/* HINGE */}

        <div
          className={styles.hinge}
        />
      </div>

      {/* =====================================
          FLOATING DISC

          Starts at EXACT tray position.
          Then FLIES RIGHT offscreen.

          Only visible at stage 3.
      ===================================== */}

      <div
        className={
          styles.floatingDisc
        }
        aria-hidden="true"
      >
        <div
          className={
            styles.floatingDiscInner
          }
        >
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

      {/* =====================================
          PROJECT CAPTION
      ===================================== */}

      <div
        className={
          styles.projectCaption
        }
      >
        <span>
          NOW PLAYING
        </span>

        <strong>
          {project?.title}
        </strong>
      </div>

      {/* =====================================
          KEEP SCROLLING
      ===================================== */}

      <div
        className={
          styles.scrollCue
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.scrollCueLabel
          }
        >
          {isOpen
            ? "SCROLL TO DISCOVER"
            : "KEEP SCROLLING"}
        </span>

        <span
          className={
            styles.scrollCueArrow
          }
        >
          ↓
        </span>
      </div>
    </div>
  );
}
