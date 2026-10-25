
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./DarkProject.module.css";

import VinylNavigation from "./shared/VinylNavigation";
import RecordTransition from "./shared/RecordTransition";
import AmbientBackground from "./shared/AmbientBackground";
import MobileProjectDock from "./MobileProjectDock";
import Final from "../Final/Final";

import { portfolioRecords } from "../../data/portfolioRecords";

/* =====================================
   HELPERS
===================================== */

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

function smoothstep(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function getScrollBehavior() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
    ? "auto"
    : "smooth";
}

/* =====================================
   PROJECT TRANSITION STATE
===================================== */

function getTransitionState(element, viewport) {
  if (!element) {
    return { progress: 0, cue: 0 };
  }

  const rect = element.getBoundingClientRect();

  const start = viewport * 0.7;
  const end = -viewport * 0.7;

  return {
    progress: smoothstep(
      (start - rect.top) / (start - end)
    ),

    cue: smoothstep(
      (viewport * 1.05 - rect.top) /
        (viewport * 0.45)
    ),
  };
}

/* =====================================
   CHAPTER SCROLL STATE
===================================== */

function getChapterState(refs, readingLine, viewport) {
  const elements = (refs?.current || []).filter(Boolean);

  if (!elements.length) {
    return { active: 0, progress: 0 };
  }

  const rects = elements.map((element) =>
    element.getBoundingClientRect()
  );

  if (rects[0].top > readingLine) {
    return { active: 0, progress: 0 };
  }

  let active = 0;

  rects.forEach((rect, index) => {
    if (rect.top <= readingLine) {
      active = index;
    }
  });

  const lastIndex = rects.length - 1;
  const current = rects[active];

  let withinChapter = 0;

  if (active < lastIndex) {
    const next = rects[active + 1];

    const distance = Math.max(
      1,
      next.top - current.top
    );

    withinChapter = clamp(
      (readingLine - current.top) / distance
    );
  } else {
    const reachableEnd = viewport * 0.85;

    const distance = Math.max(
      1,
      current.height + readingLine - reachableEnd
    );

    withinChapter = clamp(
      (readingLine - current.top) / distance
    );
  }

  return {
    active,
    progress: clamp(
      (active + withinChapter) / rects.length
    ),
  };
}

/* =====================================
   SPOTIFY-STYLE LYRICS
===================================== */

function calculateRevealedWords(world, viewport) {
  const revealed = {};
  const readingLine = viewport * 0.67;

  world
    .querySelectorAll("[data-lyric-block]")
    .forEach((block) => {
      const id = block.dataset.lyricBlock;

      if (!id) return;

      const words = block.querySelectorAll(
        "[data-lyric-word]"
      );

      let count = 0;

      for (const word of words) {
        const rect = word.getBoundingClientRect();

        if (rect.top <= readingLine) {
          count += 1;
        } else {
          break;
        }
      }

      revealed[id] = count;
    });

  return revealed;
}

/* =====================================
   INDIVIDUAL PROJECT SECTION
===================================== */

function ProjectSection({
  record,
  recordIndex,
  records,
  chapterRefs,
  projectStartRefs,
  transitionRefs,
  revealedWords,
}) {
  const Component = record.Component;
  const nextRecord = records[recordIndex + 1];

  return (
    <div className={styles.projectSection}>
      {/* CURRENT PROJECT */}

      <div
        ref={(element) => {
          projectStartRefs.current[recordIndex] = element;
        }}
        id={`project-${record.slug}`}
        className={
          recordIndex === 0
            ? styles.firstProjectPosition
            : styles.nextProjectPosition
        }
      >
        <Component
          project={record}
          chaptersRef={chapterRefs.current[recordIndex]}
          revealedWords={revealedWords}
        />
      </div>

      {/* DESKTOP PROJECT TRANSITION */}

      {nextRecord && (
        <section
          ref={(element) => {
            transitionRefs.current[recordIndex] = element;
          }}
          className={styles.recordTransitionZone}
          aria-label={`Next project: ${nextRecord.title}`}
        >
          <div className={styles.recordTransitionPrompt}>
            <span>
              END OF RECORD{" "}
              {String(recordIndex + 1).padStart(2, "0")}
            </span>

            <h2>Every record has another side.</h2>

            <p>
              Keep scrolling — or click the glowing
              record — to discover {nextRecord.title}.
            </p>

            <span
              className={styles.recordScrollArrow}
              aria-hidden="true"
            >
              ↓
            </span>
          </div>
        </section>
      )}
    </div>
  );
}

/* =====================================
   MAIN DARK PROJECT
===================================== */

export default function DarkProject() {
  const records = portfolioRecords;

  const navigate = useNavigate();
  const location = useLocation();

  /* =====================================
     REFS
  ===================================== */

  const worldRef = useRef(null);
  const stickyRef = useRef(null);

  // NEW: Final section reference
  const finalRef = useRef(null);

  const chapterRefs = useRef(
    records.map(() => ({
      current: [],
    }))
  );

  const projectStartRefs = useRef([]);
  const transitionRefs = useRef([]);

  const dragRef = useRef(null);

  /* =====================================
     ANIMATION STATE
  ===================================== */

  const [entrance, setEntrance] = useState(0);
  const [rotation, setRotation] = useState(0);

  const [chapters, setChapters] = useState(
    records.map(() => ({
      active: 0,
      progress: 0,
    }))
  );

  const [transitions, setTransitions] = useState(
    records.slice(1).map(() => ({
      progress: 0,
      cue: 0,
    }))
  );

  const [revealedWords, setRevealedWords] =
    useState({});

  /* =====================================
     MOBILE STATE
  ===================================== */

  const [isMobile, setIsMobile] = useState(false);

  const [mobileDockVisible, setMobileDockVisible] =
    useState(false);

  const [
    mobileActiveRecordIndex,
    setMobileActiveRecordIndex,
  ] = useState(0);

  /* =====================================
     FINAL STATE
  ===================================== */

  const [finalActive, setFinalActive] =
    useState(false);

  /* =====================================
     SCROLL UPDATE
  ===================================== */

  useEffect(() => {
    let frame = null;

    function update() {
      frame = null;

      const world = worldRef.current;
      if (!world) return;

      const viewport = window.innerHeight;
      const worldRect = world.getBoundingClientRect();

      const inside = Math.max(
        0,
        -worldRect.top
      );

      const mobile = window.matchMedia(
        "(max-width: 767px)"
      ).matches;

      setIsMobile((previous) =>
        previous === mobile ? previous : mobile
      );

      /* ---------------------------------
         NEW: FINAL VISIBILITY

         When the Final section reaches
         the screen, hide the vinyl.
      --------------------------------- */

      const finalElement = finalRef.current;

      if (finalElement) {
        const finalRect =
          finalElement.getBoundingClientRect();

        const active =
          finalRect.top <= viewport * 0.5 &&
          finalRect.bottom > viewport * 0.15;

        setFinalActive((previous) =>
          previous === active
            ? previous
            : active
        );
      }

      /* ---------------------------------
         ENTRANCE
      --------------------------------- */

      setEntrance(
        smoothstep(inside / viewport)
      );

      /* ---------------------------------
         VINYL ROTATION
      --------------------------------- */

      setRotation(inside * 0.16);

      /* ---------------------------------
         DESKTOP RECORD TRANSITIONS
      --------------------------------- */

      const nextTransitions = records
        .slice(1)
        .map((_, index) =>
          getTransitionState(
            transitionRefs.current[index],
            viewport
          )
        );

      setTransitions(nextTransitions);

      /* ---------------------------------
         CHAPTER PROGRESS
      --------------------------------- */

      const readingLine = viewport * 0.48;

      setChapters(
        chapterRefs.current.map((ref) =>
          getChapterState(
            ref,
            readingLine,
            viewport
          )
        )
      );

      /* ---------------------------------
         MOBILE PROJECT DETECTION
      --------------------------------- */

      if (mobile) {
        const visible =
          worldRect.top <= viewport * 0.15 &&
          worldRect.bottom > viewport * 0.25;

        setMobileDockVisible((previous) =>
          previous === visible
            ? previous
            : visible
        );

        let currentProject = 0;

        projectStartRefs.current.forEach(
          (element, index) => {
            if (!element) return;

            const rect =
              element.getBoundingClientRect();

            if (rect.top <= readingLine) {
              currentProject = index;
            }
          }
        );

        setMobileActiveRecordIndex((previous) =>
          previous === currentProject
            ? previous
            : currentProject
        );
      } else {
        setMobileDockVisible(false);
      }

      /* ---------------------------------
         BACKGROUND PARALLAX
      --------------------------------- */

      if (stickyRef.current) {
        const shift =
          Math.sin(inside * 0.001) * 65;

        stickyRef.current.style.setProperty(
          "--background-shift",
          `${shift}px`
        );
      }

      /* ---------------------------------
         LYRICS HIGHLIGHT
      --------------------------------- */

      const nextRevealed =
        calculateRevealedWords(
          world,
          viewport
        );

      setRevealedWords((previous) => {
        const ids = Object.keys(nextRevealed);

        const unchanged =
          ids.length ===
            Object.keys(previous).length &&
          ids.every(
            (id) =>
              previous[id] === nextRevealed[id]
          );

        return unchanged
          ? previous
          : nextRevealed;
      });
    }

    function scheduleUpdate() {
      if (frame !== null) return;

      frame = requestAnimationFrame(update);
    }

    update();

    window.addEventListener(
      "scroll",
      scheduleUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      scheduleUpdate
    );

    return () => {
      window.removeEventListener(
        "scroll",
        scheduleUpdate
      );

      window.removeEventListener(
        "resize",
        scheduleUpdate
      );

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [records]);

  /* =====================================
     ACTIVE DESKTOP RECORD
  ===================================== */

  let desktopActiveRecordIndex = 0;

  transitions.forEach((state, index) => {
    if (state.progress >= 0.96) {
      desktopActiveRecordIndex = index + 1;
    }
  });

  /* =====================================
     ACTIVE PROJECT
  ===================================== */

  const activeRecordIndex = isMobile
    ? mobileActiveRecordIndex
    : desktopActiveRecordIndex;

  const activeRecord = records[activeRecordIndex];

  const upcomingRecord =
    records[activeRecordIndex + 1];

  /* =====================================
     CHAPTER NAVIGATION
  ===================================== */

  function goToChapter(recordIndex, chapterIndex) {
    const ref = chapterRefs.current[recordIndex];

    if (!ref || !ref.current.length) {
      return;
    }

    const safeIndex = clamp(
      chapterIndex,
      0,
      ref.current.length - 1
    );

    const target = ref.current[safeIndex];

    if (!target) return;

    target.scrollIntoView({
      behavior: getScrollBehavior(),
      block: "start",
    });
  }

  /* =====================================
     PROJECT NAVIGATION
  ===================================== */

  function playRecord(recordIndex) {
    const target =
      projectStartRefs.current[recordIndex];

    if (!target) return;

    target.scrollIntoView({
      behavior: getScrollBehavior(),
      block: "start",
    });
  }

  /* =====================================
     CLOSE PROJECT
  ===================================== */

  function backToProjects() {
    const cameFromProjects =
      location.state?.returnTo === "/projects";

    if (cameFromProjects) {
      navigate("/projects", {
        state: null,
      });

      return;
    }

    window.scrollTo({
      top: 0,
      behavior: getScrollBehavior(),
    });
  }

  /* =====================================
     VINYL DRAG
  ===================================== */

  function handleDiscDown(event, recordIndex) {
    if (event.button !== 0) return;

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      recordIndex,
      chapter:
        chapters[recordIndex]?.active || 0,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handleDiscUp(event) {
    const drag = dragRef.current;

    dragRef.current = null;

    if (!drag) return;

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    if (Math.hypot(dx, dy) < 30) {
      return;
    }

    const direction =
      Math.abs(dy) > Math.abs(dx)
        ? Math.sign(dy)
        : Math.sign(dx);

    const nextChapter = clamp(
      drag.chapter + direction,
      0,
      records[drag.recordIndex].chapters.length - 1
    );

    goToChapter(
      drag.recordIndex,
      nextChapter
    );
  }

  function cancelDrag() {
    dragRef.current = null;
  }

  /* =====================================
     BACKGROUND MOUSE PARALLAX
  ===================================== */

  function handleBackgroundMove(event) {
    if (
      event.pointerType !== "mouse" ||
      !stickyRef.current
    ) {
      return;
    }

    const rect =
      stickyRef.current.getBoundingClientRect();

    stickyRef.current.style.setProperty(
      "--mouse-x",
      `${event.clientX - rect.left}px`
    );

    stickyRef.current.style.setProperty(
      "--mouse-y",
      `${event.clientY - rect.top}px`
    );
  }

  /* =====================================
     AMBIENT COLORS
  ===================================== */

  const currentColor = activeRecord.color;

  const nextColor =
    upcomingRecord?.color || currentColor;

  const ambientProgress =
    transitions[desktopActiveRecordIndex]?.progress || 0;

  /* =====================================
     CLOSE ICON
  ===================================== */

  const closeIcon = (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 5L19 19M19 5L5 19" />
    </svg>
  );

  /* =====================================
     RENDER
  ===================================== */

  return (
    <section
      ref={worldRef}
      className={`${styles.world} ${
        finalActive ? styles.finalActive : ""
      }`}
      id="portfolio-records"
      onPointerMove={handleBackgroundMove}
      style={{
        "--project-color": currentColor,
        "--reveal": `${entrance * 100}%`,
        "--transition": entrance,
        "--disc-rotation": `${rotation}deg`,
        "--next-color": nextColor,
        "--record-progress": ambientProgress,
        "--record-cue":
          transitions[desktopActiveRecordIndex]
            ?.cue || 0,
      }}
    >
      {/* =====================================
          STICKY WORLD
      ===================================== */}

      <div
        ref={stickyRef}
        className={styles.stickyWorld}
      >
        <AmbientBackground
          currentColor={currentColor}
          nextColor={nextColor}
          progress={ambientProgress}
        />

        {/* ---------------------------------
            DESKTOP CLOSE BUTTON
        --------------------------------- */}

        <button
          type="button"
          className={`${styles.projectClose} ${
            styles.desktopClose
          } ${
            entrance > 0.9
              ? styles.projectCloseVisible
              : ""
          }`}
          aria-label="Close project"
          title="Close project"
          tabIndex={
            !isMobile && entrance > 0.9
              ? 0
              : -1
          }
          onClick={backToProjects}
        >
          {closeIcon}
        </button>

        {/* =====================================
            DESKTOP VINYL RECORDS
        ===================================== */}

        <div className={styles.desktopVinylLayer}>
          {records.map((record, recordIndex) => {
            const previous =
              transitions[recordIndex - 1];

            const next =
              transitions[recordIndex];

            const entered =
              recordIndex === 0
                ? 1
                : clamp(
                    ((previous?.progress || 0) -
                      0.955) / 0.045
                  );

            const exit = next
              ? smoothstep(
                  (next.progress - 0.18) / 0.65
                )
              : 0;

            const exitMovement = next
              ? smoothstep(
                  (next.progress - 0.12) / 0.73
                )
              : 0;

            const visible =
              entered * (1 - exit);

            const interactive =
              recordIndex === desktopActiveRecordIndex &&
              !finalActive;

            const state =
              chapters[recordIndex] || {
                active: 0,
                progress: 0,
              };

            return (
              <div
                key={record.slug}
                className={
                  recordIndex === 0
                    ? styles.recordOld
                    : styles.gistdaVinylWrap
                }
                style={{
                  "--project-color": record.color,
                  opacity: visible,
                  transform: `translateX(${
                    -125 * exitMovement
                  }vw)`,
                  pointerEvents: interactive
                    ? "auto"
                    : "none",
                  zIndex: interactive ? 5 : 1,
                }}
              >
                <VinylNavigation
                  project={record}
                  chapters={record.chapters}
                  transition={
                    recordIndex === 0
                      ? entrance
                      : 1
                  }
                  rotation={rotation}
                  progress={state.progress}
                  activeChapter={state.active}
                  handleDiscDown={(event) =>
                    handleDiscDown(
                      event,
                      recordIndex
                    )
                  }
                  handleDiscUp={handleDiscUp}
                  cancelDrag={cancelDrag}
                  goToChapter={(chapterIndex) =>
                    goToChapter(
                      recordIndex,
                      chapterIndex
                    )
                  }
                  canPlayNext={Boolean(
                    next && next.cue > 0.4
                  )}
                  onPlayNext={() =>
                    playRecord(recordIndex + 1)
                  }
                />
              </div>
            );
          })}
        </div>

        {/* =====================================
            DESKTOP RECORD TRANSITIONS
        ===================================== */}

        <div className={styles.desktopTransitionLayer}>
          {transitions.map((state, index) => {
            const nextRecord = records[index + 1];

            const previousEntered =
              index === 0
                ? 1
                : clamp(
                    ((transitions[index - 1]
                      ?.progress || 0) -
                      0.955) / 0.045
                  );

            const visible =
              previousEntered *
              clamp(
                (0.985 - state.progress) / 0.025
              );

            const interactive =
              desktopActiveRecordIndex === index &&
              state.progress > 0.18 &&
              state.progress < 0.96 &&
              visible > 0.05 &&
              !finalActive;

            return (
              <div
                key={`transition-${index}`}
                className={styles.transitionVinylWrap}
                style={{
                  opacity: visible,
                  pointerEvents: interactive
                    ? "auto"
                    : "none",
                  zIndex: interactive ? 6 : 0,
                }}
              >
                <RecordTransition
                  project={nextRecord}
                  number={index + 2}
                  progress={state.progress}
                  cue={state.cue}
                  rotation={rotation}
                  onPlay={() =>
                    playRecord(index + 1)
                  }
                />
              </div>
            );
          })}
        </div>

        {/* =====================================
            NEXT PROJECT SHORTCUT
        ===================================== */}

        {upcomingRecord &&
          entrance > 0.8 &&
          !finalActive && (
            <button
              type="button"
              className={styles.nextProjectShortcut}
              onClick={() =>
                playRecord(activeRecordIndex + 1)
              }
              aria-label={`Next project: ${upcomingRecord.title}`}
              style={{
                "--next-project-color":
                  upcomingRecord.color,
              }}
            >
              <span
                className={
                  styles.nextProjectShortcutLabel
                }
              >
                NEXT PROJECT
              </span>

              <span
                className={
                  styles.nextProjectShortcutName
                }
              >
                {upcomingRecord.title}
                <span aria-hidden="true">↗</span>
              </span>
            </button>
          )}

        {/* =====================================
            NOW PLAYING
        ===================================== */}

        <div
          className={styles.projectIdentity}
          style={{
            opacity: finalActive
              ? 0
              : clamp((entrance - 0.7) / 0.3),
            pointerEvents: "none",
          }}
        >
          <span
            className={styles.projectIdentityCurrent}
          >
            NOW PLAYING — {activeRecord.title}
          </span>
        </div>
      </div>

      {/* =====================================
          PROJECT CONTENT
      ===================================== */}

      {records.map((record, recordIndex) => (
        <ProjectSection
          key={record.slug}
          record={record}
          recordIndex={recordIndex}
          records={records}
          chapterRefs={chapterRefs}
          projectStartRefs={projectStartRefs}
          transitionRefs={transitionRefs}
          revealedWords={revealedWords}
        />
      ))}

      {/* =====================================
          NEW: FINAL

          Separate from the projects.
          Full-screen content.
          No vinyl on desktop or mobile.
      ===================================== */}

      <div
        ref={finalRef}
        className={styles.finalSection}
      >
        <Final />
      </div>

      {/* =====================================
          MOBILE VINYL — ABOVE CONTENT
      ===================================== */}

      {isMobile && (
        <MobileProjectDock
          visible={
            mobileDockVisible && !finalActive
          }
          project={activeRecord}
          activeChapter={
            chapters[activeRecordIndex]?.active ?? 0
          }
          progress={
            chapters[activeRecordIndex]?.progress ?? 0
          }
          rotation={rotation}
          onChapterChange={(chapterIndex) =>
            goToChapter(
              activeRecordIndex,
              chapterIndex
            )
          }
          onDiscDown={(event) =>
            handleDiscDown(
              event,
              activeRecordIndex
            )
          }
          onDiscUp={handleDiscUp}
          onDiscCancel={cancelDrag}
        />
      )}

      {/* =====================================
          MOBILE CLOSE — ABOVE VINYL
      ===================================== */}

      {isMobile &&
        mobileDockVisible &&
        !finalActive &&
        entrance > 0.9 &&
        createPortal(
          <button
            type="button"
            className={styles.mobileClose}
            aria-label="Close project"
            title="Close project"
            onClick={backToProjects}
            style={{
              "--project-color": currentColor,
            }}
          >
            {closeIcon}
          </button>,
          document.body
        )}
    </section>
  );
}
