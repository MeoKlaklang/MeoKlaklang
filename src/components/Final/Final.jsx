
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import ProjectCard from "../ProjectCard/ProjectCard";
import { projects } from "../../data/projects";

import styles from "./Final.module.css";

/* =========================================
   SETTINGS
========================================= */

// Automatic horizontal movement in pixels/second
const AUTO_SPEED = 25;

// Time before animation resumes after swiping
const RESUME_DELAY = 1600;

// Distance for arrow button navigation
const ARROW_DISTANCE = 350;

// Minimum mouse movement to count as dragging
const DRAG_THRESHOLD = 7;

// Three identical groups create the infinite loop
const LOOP_COPIES = 3;

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

/* =========================================
   FINAL COMPONENT
========================================= */

export default function Final() {
  const navigate = useNavigate();

  /* =====================================
     REFS
  ===================================== */

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const firstGroupRef = useRef(null);
  const progressFillRef = useRef(null);

  const soundRef = useRef(null);
  const animationRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const dragRef = useRef(null);
  const draggedUntilRef = useRef(0);

  const groupWidthRef = useRef(0);
  const previousTimeRef = useRef(0);

  const pausedRef = useRef(false);
  const pointerInsideRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const focusInsideRef = useRef(false);
  const isVisibleRef = useRef(false);

  /* =====================================
     STATE
  ===================================== */

  const [visible, setVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [dragging, setDragging] = useState(false);

  /* =====================================
     REVEAL ANIMATION + VISIBILITY

     The banner only auto-scrolls while
     the Final section is on screen.
  ===================================== */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      isVisibleRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      {
        threshold: 0.08,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      isVisibleRef.current = false;
    };
  }, []);

  /* =====================================
     SAME CD SOUND AS HOMEPAGE
  ===================================== */

  useEffect(() => {
    const sound = new Audio(
      "/sounds/cd-pop-instant.mp3"
    );

    sound.preload = "auto";
    sound.volume = 0.25;

    soundRef.current = sound;

    return () => {
      sound.pause();
      soundRef.current = null;
    };
  }, []);

  function playSound() {
    const sound = soundRef.current;

    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;

    sound.play().catch(() => {});
  }

  /* =====================================
     INFINITE CAROUSEL — SETUP

     We render three identical groups.

     Initially, the viewport is positioned
     at the beginning of the middle group.

     When scrolling reaches the next or
     previous group, we silently reposition
     it by exactly one group width.

     Because the content is identical,
     there is no visible jump.
  ===================================== */

  function getGroupWidth() {
    const group = firstGroupRef.current;

    if (!group) return 0;

    return group.getBoundingClientRect().width;
  }

  function updateProgress() {
    const track = trackRef.current;
    const groupWidth = groupWidthRef.current;
    const progressFill = progressFillRef.current;

    if (!track || !groupWidth || !progressFill) {
      return;
    }

    const position =
      ((track.scrollLeft % groupWidth) +
        groupWidth) %
      groupWidth;

    const progress = clamp(position / groupWidth);

    progressFill.style.transform =
      `scaleX(${Math.max(0.08, progress)})`;
  }

  function normalizeScroll() {
    const track = trackRef.current;
    const width = groupWidthRef.current;

    if (!track || width <= 0) return;

    // The middle copy begins at width.
    // Stay inside that copy by wrapping.

    if (track.scrollLeft >= width * 2) {
      track.scrollLeft -= width;
    } else if (track.scrollLeft < width) {
      track.scrollLeft += width;
    }

    updateProgress();
  }

  useLayoutEffect(() => {
    const track = trackRef.current;
    const group = firstGroupRef.current;

    if (!track || !group) return;

    function measure() {
      const previousWidth = groupWidthRef.current;
      const newWidth = getGroupWidth();

      if (!newWidth) return;

      const previousOffset = previousWidth
        ? track.scrollLeft - previousWidth
        : 0;

      groupWidthRef.current = newWidth;

      track.scrollLeft =
        newWidth + previousOffset;

      normalizeScroll();
    }

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(group);
    observer.observe(track);

    return () => observer.disconnect();
  }, []);

  /* =====================================
     PAUSE / RESUME HELPERS
  ===================================== */

  function clearResumeTimer() {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function pauseAnimation() {
    clearResumeTimer();
    pausedRef.current = true;
  }

  function resumeAnimation(delay = 0) {
    clearResumeTimer();

    if (delay > 0) {
      resumeTimerRef.current = window.setTimeout(
        () => {
          resumeTimerRef.current = null;

          if (
            !pointerInsideRef.current &&
            !pointerActiveRef.current &&
            !focusInsideRef.current
          ) {
            pausedRef.current = false;
          }
        },
        delay
      );

      return;
    }

    if (
      !pointerInsideRef.current &&
      !pointerActiveRef.current &&
      !focusInsideRef.current
    ) {
      pausedRef.current = false;
    }
  }

  /* =====================================
     AUTOMATIC INFINITE MOVEMENT

     requestAnimationFrame gives a smooth,
     consistent speed across screens.

     No React state changes each frame.
  ===================================== */

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function animate(time) {
      const delta = previousTimeRef.current
        ? Math.min(
            (time - previousTimeRef.current) / 1000,
            0.05
          )
        : 0;

      previousTimeRef.current = time;

      const track = trackRef.current;

      const canAnimate =
        track &&
        groupWidthRef.current > 0 &&
        isVisibleRef.current &&
        !pausedRef.current &&
        !reducedMotion &&
        !document.hidden;

      if (canAnimate) {
        track.scrollLeft += AUTO_SPEED * delta;

        normalizeScroll();
      }

      animationRef.current =
        requestAnimationFrame(animate);
    }

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      clearResumeTimer();
    };
  }, []);

  /* =====================================
     ARROW NAVIGATION

     Always available because the
     carousel is infinite.
  ===================================== */

  function scrollTrack(direction) {
    const track = trackRef.current;

    if (!track) return;

    pauseAnimation();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    track.scrollBy({
      left: direction * ARROW_DISTANCE,
      behavior: reducedMotion ? "instant" : "smooth",
    });

    // Resume after manual navigation.
    // A hovered gallery stays paused.
    resumeAnimation(RESUME_DELAY);
  }

  /* =====================================
     DESKTOP DRAG / MOBILE SWIPE

     Mouse: custom drag.
     Touch: native horizontal scrolling.
  ===================================== */

  function handlePointerDown(event) {
    const track = trackRef.current;

    if (!track) return;

    pointerActiveRef.current = true;
    pauseAnimation();

    if (
      event.pointerType !== "mouse" ||
      event.button !== 0
    ) {
      return;
    }

    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    const track = trackRef.current;

    if (!drag || !track) return;
    if (drag.id !== event.pointerId) return;

    const dx = event.clientX - drag.startX;

    if (
      !drag.moved &&
      Math.abs(dx) < DRAG_THRESHOLD
    ) {
      return;
    }

    if (!drag.moved) {
      drag.moved = true;

      setDragging(true);
      setHoveredId(null);

      track.setPointerCapture(event.pointerId);
    }

    track.scrollLeft =
      drag.startScrollLeft - dx;

    normalizeScroll();

    // Keep drag distance correct after wrapping.
    drag.startScrollLeft =
      track.scrollLeft + dx;
  }

  function finishDrag(event) {
    const track = trackRef.current;
    const drag = dragRef.current;

    pointerActiveRef.current = false;

    if (drag && drag.id === event.pointerId) {
      if (drag.moved) {
        draggedUntilRef.current =
          Date.now() + 300;
      }

      if (
        track &&
        track.hasPointerCapture(event.pointerId)
      ) {
        track.releasePointerCapture(event.pointerId);
      }
    }

    dragRef.current = null;

    setDragging(false);

    normalizeScroll();

    resumeAnimation(RESUME_DELAY);
  }

  /* =====================================
     HOVER EFFECT

     Original ProjectCard still handles
     the lighting and tilt.

     Final variant moves the card UP.
  ===================================== */

  function handleEnter(id, withSound = true) {
    if (dragRef.current?.moved) return;

    if (
      !window.matchMedia("(hover: hover)").matches
    ) {
      return;
    }

    pauseAnimation();
    setHoveredId(id);

    if (withSound) {
      playSound();
    }
  }

  function handleLeave(id) {
    setHoveredId((current) =>
      current === id ? null : current
    );
  }

  /* =====================================
     PROJECT NAVIGATION

     About Me -> /about
     Existing projects -> scroll there
     Other projects -> project route
  ===================================== */

  function handleOpen(event, project) {
    if (
      dragging ||
      dragRef.current?.moved ||
      Date.now() < draggedUntilRef.current
    ) {
      event?.preventDefault?.();
      return;
    }

    if (project.slug === "about") {
      navigate("/about#who-is-meo", {
        state: {
          scrollTo: "who-is-meo",
        },
      });
      return;
    }

    const target = document.getElementById(
      `project-${project.slug}`
    );

    if (target) {
      target.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
        block: "start",
      });

      return;
    }

    navigate(`/projects/${project.slug}`);
  }

  /* =====================================
     RENDER
  ===================================== */

  return (
    <section
      ref={sectionRef}
      id="final"
      className={`${styles.final} ${
        visible ? styles.visible : ""
      }`}
      aria-labelledby="final-heading"
    >
      {/* ==================================
          CENTERED INTRO
      ================================== */}

      <div className={styles.intro}>
        <span className={styles.eyebrow}>
          THE FINAL TRACK
        </span>

        <h2
          id="final-heading"
          className={styles.title}
        >
          You've seen my work.
          <span>Now meet me.</span>
        </h2>

  

        <Link
          to="/about#who-is-meo"
          state={{
            scrollTo: "who-is-meo",
          }}
          className={styles.aboutButton}
          aria-label="Go to Who is Meo on the About page"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "instant",
            });
          }}
        >
          <span>MEET MEO</span>
  
        </Link>
      </div>

      {/* ==================================
          INFINITE HORIZONTAL GALLERY
      ================================== */}

      <div className={styles.gallerySection}>
        <div className={styles.galleryHeader}>
          <span>THE COMPLETE COLLECTION</span>

          <span>
            {String(projects.length).padStart(2, "0")} RECORDS
          </span>
        </div>

        <div className={styles.galleryWrapper}>
          {/* LEFT ARROW */}

          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() => scrollTrack(-1)}
            aria-label="Scroll CD collection left"
          >
            ←
          </button>

          {/* SCROLLING VIEWPORT */}

          <div
            ref={trackRef}
            className={`${styles.scrollViewport} ${
              dragging ? styles.dragging : ""
            }`}
            onScroll={normalizeScroll}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                pointerInsideRef.current = true;
                pauseAnimation();
              }
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") {
                pointerInsideRef.current = false;
                resumeAnimation();
              }
            }}
            onFocusCapture={() => {
              focusInsideRef.current = true;
              pauseAnimation();
            }}
            onBlurCapture={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget
                )
              ) {
                focusInsideRef.current = false;
                resumeAnimation();
              }
            }}
            role="region"
            aria-label="Infinite horizontal portfolio gallery"
            tabIndex={0}
          >
            <div className={styles.cardTrack}>
              {Array.from(
                { length: LOOP_COPIES },
                (_, copyIndex) => (
                  <div
                    key={`copy-${copyIndex}`}
                    ref={
                      copyIndex === 0
                        ? firstGroupRef
                        : null
                    }
                    className={styles.cardGroup}
                  >
                    {projects.map((project, index) => (
                      <div
                        key={`${copyIndex}-${project.id}`}
                        className={styles.cardSlot}
                        style={{
                          "--index": index,
                        }}
                      >
                        <ProjectCard
                          project={project}
                          variant="final"
                          positionStyle={{
                            "--x": "0px",
                            "--y": "0px",
                            "--z": "0px",
                            "--opacity": 1,
                            "--card-color": project.color,
                          }}
                          active={
                            !dragging &&
                            hoveredId === project.id
                          }
                          onEnter={handleEnter}
                          onLeave={handleLeave}
                          onOpen={handleOpen}
                        />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* RIGHT ARROW */}

          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => scrollTrack(1)}
            aria-label="Scroll CD collection right"
          >
            →
          </button>
        </div>

        <div className={styles.galleryFooter}>
          <span>
            DRAG OR SWIPE TO EXPLORE
          </span>

          <div className={styles.progress}>
            <div
              ref={progressFillRef}
              className={styles.progressFill}
            />
          </div>
        </div>
      </div>

      {/* ==================================
          END LABEL
      ================================== */}

      <span className={styles.footer}>
        END OF SIDE A — THE STORY CONTINUES
      </span>
    </section>
  );
}
