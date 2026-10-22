
import {
  useEffect,
  useRef,
  useState,
} from "react";

import ProjectCard from "../ProjectCard/ProjectCard";
import { projects } from "../../data/projects";

import styles from "./DiagonalGallery.module.css";

/* =====================================
   SETTINGS
===================================== */

const AUTO_SPEED = 0.000085;
const DESKTOP_DRAG_SPEED = 0.005;
const MOBILE_DRAG_SPEED = 0.008;

const SWIPE_THRESHOLD = 8;
const SNAP_DELAY = 0;

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const wrap = (value, length) =>
  ((value % length) + length) % length;

const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

/* =====================================
   GALLERY
===================================== */

export default function DiagonalGallery({
  scrollProgress = 0,
  selectedProjectId,
  onProjectOpen,
}) {
  const [position, setPosition] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const positionRef = useRef(0);
  const targetRef = useRef(0);

  const draggingRef = useRef(false);
  const pointerRef = useRef(null);
  const didDragRef = useRef(false);

  const hoveredRef = useRef(false);
  const soundRef = useRef(null);
  const galleryRef = useRef(null);

  const isMobileRef = useRef(false);
  const scrollProgressRef = useRef(scrollProgress);

  const snapTimerRef = useRef(null);

  /* =====================================
     RESPONSIVE DETECTION
  ===================================== */

  useEffect(() => {
    const media = window.matchMedia(
      "(max-width: 767px)"
    );

    function updateMobile() {
      const mobile = media.matches;

      isMobileRef.current = mobile;
      setIsMobile(mobile);

      pointerRef.current = null;
      draggingRef.current = false;
      hoveredRef.current = false;

      setDragging(false);
      setHoveredId(null);

      if (mobile) {
        targetRef.current = Math.round(
          targetRef.current
        );
      }
    }

    updateMobile();

    media.addEventListener(
      "change",
      updateMobile
    );

    return () => {
      media.removeEventListener(
        "change",
        updateMobile
      );
    };
  }, []);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  /* =====================================
     SCROLL TRANSITION
  ===================================== */

  const centering = smoothstep(
    scrollProgress / 0.27
  );

  const othersFade = 1 - smoothstep(
    (scrollProgress - 0.05) / 0.23
  );

  const selectedFade = 1 - smoothstep(
    (scrollProgress - 0.23) / 0.11
  );

  const galleryLocked = scrollProgress > 0.035;

  const idle =
    !galleryLocked &&
    !dragging &&
    hoveredId === null;

  /* =====================================
     MOBILE ACTIVE CD
  ===================================== */

  const mobileIndex = wrap(
    Math.round(position),
    projects.length
  );

  const mobileSelectedProject =
    projects[mobileIndex];

  /* =====================================
     SOUND
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
     AUTOMATIC MOVEMENT + SMOOTH SNAP
  ===================================== */

  useEffect(() => {
    let frame;
    let lastTime = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function animate(time) {
      const delta = lastTime
        ? Math.min(time - lastTime, 50)
        : 16;

      lastTime = time;

      const locked =
        scrollProgressRef.current > 0.035;

      if (locked) {
        hoveredRef.current = false;
        draggingRef.current = false;
      }

      /*
        Desktop keeps its original
        automatic gentle movement.

        Mobile stays snapped to a CD
        so visitors can browse precisely.
      */

      if (
        !locked &&
        !reducedMotion &&
        !hoveredRef.current &&
        !draggingRef.current &&
        !isMobileRef.current
      ) {
        targetRef.current +=
          delta * AUTO_SPEED;
      }

      /*
        Responsive easing:
        slightly faster during dragging,
        smoother when snapping.
      */

      const speed = draggingRef.current
        ? 0.022
        : isMobileRef.current
          ? 0.012
          : 0.01;

      const ease = reducedMotion
        ? 1
        : 1 - Math.exp(-delta * speed);

      positionRef.current +=
        (targetRef.current -
          positionRef.current) * ease;

      setPosition(positionRef.current);

      frame = requestAnimationFrame(
        animate
      );
    }

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  /* =====================================
     SNAP TO CLOSEST MOBILE CD
  ===================================== */

  function snapToClosest() {
    if (!isMobileRef.current) return;

    targetRef.current = Math.round(
      targetRef.current
    );
  }

  /* =====================================
     CLEAN UP DRAG
  ===================================== */

  function finishDrag(cancelled = false) {
    const pointer = pointerRef.current;

    if (!pointer) return;

    const wasHorizontal =
      pointer.axis === "horizontal";

    const wasDragging =
      didDragRef.current;

    pointerRef.current = null;
    draggingRef.current = false;

    setDragging(false);

    if (isMobileRef.current) {
      if (
        !cancelled &&
        wasHorizontal &&
        wasDragging
      ) {
        snapToClosest();

        if (projects.length > 0) {
          playSound();
        }
      } else {
        targetRef.current = Math.round(
          targetRef.current
        );
      }
    }
  }

  useEffect(() => {
    function handleWindowPointerUp() {
      finishDrag(false);
    }

    function handleWindowPointerCancel() {
      finishDrag(true);
    }

    window.addEventListener(
      "pointerup",
      handleWindowPointerUp
    );

    window.addEventListener(
      "pointercancel",
      handleWindowPointerCancel
    );

    return () => {
      window.removeEventListener(
        "pointerup",
        handleWindowPointerUp
      );

      window.removeEventListener(
        "pointercancel",
        handleWindowPointerCancel
      );

      if (snapTimerRef.current) {
        clearTimeout(snapTimerRef.current);
      }
    };
  });

  /* =====================================
     POINTER DOWN
  ===================================== */

  function handlePointerDown(event) {
    if (
      galleryLocked ||
      (event.pointerType === "mouse" &&
        event.button !== 0)
    ) {
      return;
    }

    didDragRef.current = false;

    pointerRef.current = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,

      x: event.clientX,
      y: event.clientY,

      startX: event.clientX,
      startY: event.clientY,

      axis: null,
    };

    /*
      Desktop starts dragging immediately.
      Mobile waits to determine whether
      the gesture is horizontal or vertical.
    */

    if (!isMobileRef.current) {
      draggingRef.current = true;
      setDragging(true);
    }
  }

  /* =====================================
     CURSOR GLOW + PARALLAX + DRAG
  ===================================== */

  function handlePointerMove(event) {
    const gallery = galleryRef.current;

    /* DESKTOP PARALLAX */

    if (
      gallery &&
      event.pointerType === "mouse"
    ) {
      const rect =
        gallery.getBoundingClientRect();

      const mouseX =
        event.clientX - rect.left;

      const mouseY =
        event.clientY - rect.top;

      gallery.style.setProperty(
        "--mouse-x",
        `${mouseX}px`
      );

      gallery.style.setProperty(
        "--mouse-y",
        `${mouseY}px`
      );

      const normalizedX =
        (mouseX / rect.width - 0.5) * 2;

      const normalizedY =
        (mouseY / rect.height - 0.5) * 2;

      const strength = 1 - centering;

      gallery.style.setProperty(
        "--gallery-rotate-y",
        `${
          normalizedX * 5 * strength
        }deg`
      );

      gallery.style.setProperty(
        "--gallery-rotate-x",
        `${
          -normalizedY * 4 * strength
        }deg`
      );

      gallery.style.setProperty(
        "--gallery-move-x",
        `${
          normalizedX * 15 * strength
        }px`
      );

      gallery.style.setProperty(
        "--gallery-move-y",
        `${
          normalizedY * 12 * strength
        }px`
      );
    }

    /* DRAG INTERACTION */

    const pointer = pointerRef.current;

    if (
      galleryLocked ||
      !pointer ||
      event.pointerId !== pointer.pointerId
    ) {
      return;
    }

    const totalDx =
      event.clientX - pointer.startX;

    const totalDy =
      event.clientY - pointer.startY;

    const distance = Math.hypot(
      totalDx,
      totalDy
    );

    if (isMobileRef.current) {
      /*
        Distinguish horizontal swipes
        from vertical page scrolling.
      */

      if (pointer.axis === null) {
        if (distance < SWIPE_THRESHOLD) {
          return;
        }

        if (
          Math.abs(totalDy) >
          Math.abs(totalDx)
        ) {
          pointer.axis = "vertical";

          draggingRef.current = false;
          setDragging(false);

          return;
        }

        pointer.axis = "horizontal";

        draggingRef.current = true;
        didDragRef.current = true;

        setDragging(true);
      }

      /*
        Allow normal vertical scrolling.
      */

      if (pointer.axis === "vertical") {
        return;
      }

      const dx =
        event.clientX - pointer.x;

      targetRef.current +=
        -dx * MOBILE_DRAG_SPEED;

      pointer.x = event.clientX;
      pointer.y = event.clientY;

      return;
    }

    /* DESKTOP DRAG */

    if (!draggingRef.current) return;

    const dx =
      event.clientX - pointer.x;

    const dy =
      event.clientY - pointer.y;

    if (distance > 7) {
      didDragRef.current = true;
    }

    if (didDragRef.current) {
      targetRef.current +=
        (-dx + dy) * DESKTOP_DRAG_SPEED;
    }

    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  /* =====================================
     HOVER — DESKTOP ONLY
  ===================================== */

  function handleCardEnter(
    id,
    withSound = true
  ) {
    if (
      isMobileRef.current ||
      galleryLocked ||
      draggingRef.current
    ) {
      return;
    }

    hoveredRef.current = true;
    setHoveredId(id);

    if (withSound) {
      playSound();
    }
  }

  function handleCardLeave(id) {
    if (isMobileRef.current) return;

    hoveredRef.current = false;

    setHoveredId((current) =>
      current === id ? null : current
    );
  }

  /* =====================================
     OPEN PROJECT
  ===================================== */

  function handleOpen(event, project) {
    if (
      didDragRef.current ||
      galleryLocked
    ) {
      event?.preventDefault?.();
      return;
    }

    /*
      On mobile:
      tap to open project.

      On desktop:
      preserve original click behavior.
    */

    onProjectOpen?.(project);
  }

  /* =====================================
     CARD POSITION
  ===================================== */

  function getCardStyle(index) {
    const count = projects.length;
    const project = projects[index];

    /*
      Desktop:
      default selectedProjectId still
      controls the homepage CD opening.

      Mobile:
      closest card gets visual focus.
    */

    const offset =
      wrap(
        index - position + count / 2,
        count
      ) -
      count / 2;

    const depth = Math.abs(offset);

    const isOpeningSelected =
      project.id === selectedProjectId;

    const isMobileCentered =
      isMobile &&
      project.id ===
        mobileSelectedProject?.id;

    /* MOBILE COMPACT DIAGONAL LAYOUT */

    const spacingX = isMobile ? 100 : 150;
    const spacingY = isMobile ? 48 : 112;
    const spacingZ = isMobile ? 90 : 135;

    const originalX =
      offset * spacingX;

    const originalY =
      -offset * spacingY;

    const originalZ =
      -depth * spacingZ;

    const x = isOpeningSelected
      ? originalX * (1 - centering)
      : originalX;

    const y = isOpeningSelected
      ? originalY * (1 - centering)
      : originalY;

    const z = isOpeningSelected
      ? originalZ * (1 - centering)
      : originalZ;

    const baseOpacity = Math.max(
      0.65,
      1 - depth * 0.09
    );

    const opacity = isOpeningSelected
      ? baseOpacity * selectedFade
      : baseOpacity * othersFade;

    const directions = [
      { x: -580, y: -280 },
      { x: 490, y: -420 },
      { x: -430, y: 450 },
      { x: 620, y: 280 },
      { x: 0, y: -650 },
      { x: -520, y: 250 },
    ];

    const direction =
      directions[index % directions.length];

    const focusScale =
      isMobileCentered &&
      !galleryLocked
        ? 1.07
        : 1;

    return {
      "--x": `${x}px`,
      "--y": `${y}px`,
      "--z": `${z}px`,

      "--opacity": opacity,
      "--card-color": project.color,

      "--entry-x": `${direction.x}px`,
      "--entry-y": `${direction.y}px`,
      "--entry-delay": `${
        0.12 + index * 0.13
      }s`,

      /*
        Optional CSS scale variable.
        Does not overwrite the existing
        ProjectCard transforms.
      */

      "--mobile-focus-scale": focusScale,

      zIndex: isMobile
        ? isMobileCentered
          ? 1000
          : Math.round(
              100 - depth * 10
            )
        : isOpeningSelected
          ? 500
          : hoveredId === project.id &&
              !galleryLocked
            ? 1000
            : Math.round(
                100 - depth * 10
              ),

      pointerEvents: galleryLocked
        ? "none"
        : "auto",
    };
  }

  /* =====================================
     RENDER
  ===================================== */

  return (
    <main
      ref={galleryRef}
      className={[
        styles.gallery,

        dragging && !galleryLocked
          ? styles.dragging
          : "",

        galleryLocked
          ? styles.locked
          : "",

        idle
          ? styles.idle
          : "",

        hoveredId !== null &&
        !galleryLocked
          ? styles.hasHover
          : "",

        isMobile
          ? styles.mobileGallery
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <div className={styles.scene}>
        {projects.map((project, index) => {
          const mobileActive =
            isMobile &&
            project.id ===
              mobileSelectedProject?.id;

          return (
            <ProjectCard
              key={project.id}
              project={project}
              positionStyle={
                getCardStyle(index)
              }
              active={
                !galleryLocked &&
                (isMobile
                  ? mobileActive
                  : hoveredId === project.id)
              }
              onEnter={handleCardEnter}
              onLeave={handleCardLeave}
              onOpen={handleOpen}
            />
          );
        })}
      </div>
    </main>
  );
}
