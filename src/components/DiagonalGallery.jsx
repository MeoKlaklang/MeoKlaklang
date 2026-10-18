
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projects } from "../data/projects";

// MOVEMENT SETTINGS
const AUTO_SPEED = 0.000012;
const DRAG_SPEED = 0.005;
const SCROLL_SPEED = 0.0015;

const wrap = (value, length) =>
  ((value % length) + length) % length;

export default function DiagonalGallery() {
  const navigate = useNavigate();

  const [position, setPosition] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const galleryRef = useRef(null);
  const positionRef = useRef(0);
  const targetRef = useRef(0);

  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const pointerRef = useRef(null);
  const didDragRef = useRef(false);

  const soundRef = useRef(null);

  // ===============================
  // AUDIO
  // ===============================

  useEffect(() => {
    const sound = new Audio(
      "/sounds/cd-pop-instant.mp3"
    );

    sound.preload = "auto";
    sound.volume = 0.45;

    soundRef.current = sound;
    sound.load();

    return () => {
      sound.pause();
      soundRef.current = null;
    };
  }, []);

  function playHoverSound() {
    const sound = soundRef.current;

    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;

    sound.play().catch(() => {
      // Browser may require an initial user interaction.
    });
  }

  // ===============================
  // AUTOMATIC MOVEMENT
  // ===============================

  useEffect(() => {
    let frame;
    let previousTime = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function animate(time) {
      const delta = previousTime
        ? Math.min(time - previousTime, 50)
        : 16;

      previousTime = time;

      if (
        !reducedMotion &&
        !hoveredRef.current &&
        !draggingRef.current
      ) {
        targetRef.current += delta * AUTO_SPEED;
      }

      const ease = 1 - Math.exp(-delta * 0.01);

      positionRef.current +=
        (targetRef.current - positionRef.current) *
        ease;

      setPosition(positionRef.current);

      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  // ===============================
  // DRAG
  // ===============================

  function handlePointerDown(event) {
    if (event.button !== 0) return;

    draggingRef.current = true;
    didDragRef.current = false;
    setIsDragging(true);

    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function handlePointerMove(event) {
    const gallery = galleryRef.current;

    // Background follows mouse
    if (gallery && event.pointerType === "mouse") {
      const rect = gallery.getBoundingClientRect();

      gallery.style.setProperty(
        "--mouse-x",
        `${event.clientX - rect.left}px`
      );

      gallery.style.setProperty(
        "--mouse-y",
        `${event.clientY - rect.top}px`
      );
    }

    if (
      !draggingRef.current ||
      !pointerRef.current
    ) {
      return;
    }

    const pointer = pointerRef.current;

    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;

    const distance = Math.hypot(
      event.clientX - pointer.startX,
      event.clientY - pointer.startY
    );

    if (distance > 7) {
      didDragRef.current = true;

      if (
        !event.currentTarget.hasPointerCapture(
          event.pointerId
        )
      ) {
        event.currentTarget.setPointerCapture(
          event.pointerId
        );
      }
    }

    if (didDragRef.current) {
      targetRef.current +=
        (-dx + dy) * DRAG_SPEED;
    }

    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  function handlePointerUp(event) {
    draggingRef.current = false;
    pointerRef.current = null;
    setIsDragging(false);

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }
  }

  useEffect(() => {
    function endDrag() {
      draggingRef.current = false;
      pointerRef.current = null;
      setIsDragging(false);
    }

    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  // ===============================
  // SCROLL
  // ===============================

  function handleWheel(event) {
    targetRef.current +=
      event.deltaY * SCROLL_SPEED;
  }

  // ===============================
  // HOVER
  // ===============================

  function handleCardEnter(project) {
    if (draggingRef.current) return;
    if (hoveredRef.current) return;

    hoveredRef.current = true;
    setHoveredId(project.id);

    playHoverSound();
  }

  function handleCardLeave() {
    hoveredRef.current = false;
    setHoveredId(null);
  }

  function handleCardMove(event) {
    if (draggingRef.current) return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = Math.max(
      0,
      Math.min(
        1,
        (event.clientX - rect.left) / rect.width
      )
    );

    const y = Math.max(
      0,
      Math.min(
        1,
        (event.clientY - rect.top) / rect.height
      )
    );

    card.style.setProperty(
      "--shine-x",
      `${x * 100}%`
    );

    card.style.setProperty(
      "--shine-y",
      `${y * 100}%`
    );
  }

  function resetCard(event) {
    event.currentTarget.style.setProperty(
      "--shine-x",
      "50%"
    );

    event.currentTarget.style.setProperty(
      "--shine-y",
      "50%"
    );

    handleCardLeave();
  }

  function openProject(event, project) {
    if (didDragRef.current) {
      event.preventDefault();
      return;
    }

    navigate(`/projects/${project.slug}`);
  }

  // ===============================
  // CD POSITIONING
  // ===============================

  function getCardStyle(index) {
    const count = projects.length;

    const offset =
      wrap(index - position + count / 2, count) -
      count / 2;

    const depth = Math.abs(offset);

    return {
      "--x": `${offset * 150}px`,
      "--y": `${-offset * 112}px`,
      "--z": `${-depth * 135}px`,
      "--opacity": Math.max(
        0.65,
        1 - depth * 0.09
      ),
      zIndex:
        hoveredId === projects[index].id
          ? 1000
          : Math.round(100 - depth * 10),
    };
  }

  // ===============================
  // RENDER
  // ===============================

  return (
    <main
      ref={galleryRef}
      className={`gallery cd-gallery ${
        isDragging ? "gallery--dragging" : ""
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <div className="gallery__scene">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className={`project-card ${
              hoveredId === project.id
                ? "project-card--active"
                : ""
            }`}
            style={{
              ...getCardStyle(index),
              "--card-color": project.color,
            }}
          >
            <div className="cd-slot" />

            <button
              className="project-card__button"
              type="button"
              aria-label={`Bekijk ${project.title}`}
              onPointerEnter={() =>
                handleCardEnter(project)
              }
              onPointerMove={handleCardMove}
              onPointerLeave={resetCard}
              onFocus={() => {
                hoveredRef.current = true;
                setHoveredId(project.id);
              }}
              onBlur={handleCardLeave}
              onClick={(event) =>
                openProject(event, project)
              }
            >
              <div className="cd-cover">
                <img
                  src={project.image}
                  alt=""
                  draggable="false"
                />
              </div>

              <div className="cd-spine" />

              <div className="cd-plastic" />

              <div className="cd-reflection" />

              <div className="project-card__info">
                <span>{project.category}</span>

                <h2>{project.title}</h2>

                <p>EXPLORE PROJECT ↗</p>
              </div>
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
