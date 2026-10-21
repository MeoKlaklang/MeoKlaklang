
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
const DRAG_SPEED = 0.005;

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

  const positionRef = useRef(0);
  const targetRef = useRef(0);

  const draggingRef = useRef(false);
  const pointerRef = useRef(null);
  const didDragRef = useRef(false);

  const hoveredRef = useRef(false);

  const soundRef = useRef(null);
  const galleryRef = useRef(null);

  const scrollProgressRef = useRef(scrollProgress);

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
     AUTOMATIC CD MOVEMENT
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

      if (
        !locked &&
        !reducedMotion &&
        !hoveredRef.current &&
        !draggingRef.current
      ) {
        targetRef.current +=
          delta * AUTO_SPEED;
      }

      const ease =
        1 - Math.exp(-delta * 0.01);

      positionRef.current +=
        (targetRef.current - positionRef.current) *
        ease;

      setPosition(positionRef.current);

      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  /* =====================================
     END DRAG
  ===================================== */

  useEffect(() => {
    function endDrag() {
      draggingRef.current = false;
      pointerRef.current = null;

      setDragging(false);
    }

    window.addEventListener(
      "pointerup",
      endDrag
    );

    window.addEventListener(
      "pointercancel",
      endDrag
    );

    return () => {
      window.removeEventListener(
        "pointerup",
        endDrag
      );

      window.removeEventListener(
        "pointercancel",
        endDrag
      );
    };
  }, []);

  /* =====================================
     MOUSE DOWN
  ===================================== */

  function handlePointerDown(event) {
    if (
      galleryLocked ||
      event.button !== 0
    ) {
      return;
    }

    draggingRef.current = true;
    didDragRef.current = false;

    setDragging(true);

    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  /* =====================================
     CURSOR GLOW + PARALLAX + DRAG
  ===================================== */

  function handlePointerMove(event) {
    const gallery = galleryRef.current;

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
        `${normalizedX * 5 * strength}deg`
      );

      gallery.style.setProperty(
        "--gallery-rotate-x",
        `${-normalizedY * 4 * strength}deg`
      );

      gallery.style.setProperty(
        "--gallery-move-x",
        `${normalizedX * 15 * strength}px`
      );

      gallery.style.setProperty(
        "--gallery-move-y",
        `${normalizedY * 12 * strength}px`
      );
    }

    /* DRAG INTERACTION */

    if (
      galleryLocked ||
      !draggingRef.current ||
      !pointerRef.current
    ) {
      return;
    }

    const pointer = pointerRef.current;

    const dx =
      event.clientX - pointer.x;

    const dy =
      event.clientY - pointer.y;

    const distance = Math.hypot(
      event.clientX - pointer.startX,
      event.clientY - pointer.startY
    );

    if (distance > 7) {
      didDragRef.current = true;
    }

    if (didDragRef.current) {
      targetRef.current +=
        (-dx + dy) * DRAG_SPEED;
    }

    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  /* =====================================
     HOVER
  ===================================== */

  function handleCardEnter(
    id,
    withSound = true
  ) {
    if (
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
    if (hoveredRef.current) {
      hoveredRef.current = false;
    }

    setHoveredId((current) =>
      current === id ? null : current
    );
  }

  /* =====================================
     OPEN SELECTED PROJECT
  ===================================== */

  function handleOpen(event, project) {
    if (
      didDragRef.current ||
      galleryLocked
    ) {
      event.preventDefault();
      return;
    }

    // Pass the selected CD to Home.jsx.
    // Home decides which project section opens.
    onProjectOpen?.(project);
  }

  /* =====================================
     CARD POSITION
  ===================================== */

  function getCardStyle(index) {
    const count = projects.length;
    const project = projects[index];

    const offset =
      wrap(
        index - position + count / 2,
        count
      ) -
      count / 2;

    const depth = Math.abs(offset);

    const isSelected =
      project.id === selectedProjectId;

    const originalX = offset * 150;
    const originalY = -offset * 112;
    const originalZ = -depth * 135;

    const x = isSelected
      ? originalX * (1 - centering)
      : originalX;

    const y = isSelected
      ? originalY * (1 - centering)
      : originalY;

    const z = isSelected
      ? originalZ * (1 - centering)
      : originalZ;

    const baseOpacity = Math.max(
      0.65,
      1 - depth * 0.09
    );

    const opacity = isSelected
      ? baseOpacity * selectedFade
      : baseOpacity * othersFade;

    /* INITIAL FLYING ANIMATION */

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

      zIndex: isSelected
        ? 500
        : hoveredId === project.id &&
            !galleryLocked
          ? 1000
          : Math.round(100 - depth * 10),

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
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <div className={styles.scene}>
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            positionStyle={getCardStyle(index)}
            active={
              !galleryLocked &&
              hoveredId === project.id
            }
            onEnter={handleCardEnter}
            onLeave={handleCardLeave}
            onOpen={handleOpen}
          />
        ))}
      </div>
    </main>
  );
}
