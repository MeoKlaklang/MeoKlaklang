
import { useRef } from "react";
import styles from "./ProjectCard.module.css";

export default function ProjectCard({
  project,
  positionStyle,
  active,
  onEnter,
  onLeave,
  onOpen,
  variant = "home",
}) {
  const buttonRef = useRef(null);

  function handleMouseMove(event) {
    const button = buttonRef.current;

    if (!button || event.pointerType !== "mouse") {
      return;
    }

    const rect = button.getBoundingClientRect();

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

    const tiltX = (0.5 - y) * 7;
    const tiltY = (x - 0.5) * 7;

    button.style.setProperty(
      "--tilt-x",
      `${tiltX}deg`
    );

    button.style.setProperty(
      "--tilt-y",
      `${tiltY}deg`
    );

    button.style.setProperty(
      "--shine-x",
      `${x * 100}%`
    );

    button.style.setProperty(
      "--shine-y",
      `${y * 100}%`
    );
  }

  function resetEffects() {
    const button = buttonRef.current;
    if (!button) return;

    button.style.setProperty("--tilt-x", "0deg");
    button.style.setProperty("--tilt-y", "0deg");

    button.style.setProperty("--shine-x", "50%");
    button.style.setProperty("--shine-y", "50%");
  }

  return (
    <div
      className={`${styles.card} ${
        active ? styles.active : ""
      } ${
        variant === "final" ? styles.cardFinal : ""
      }`}
      style={positionStyle}
    >
      <div className={styles.slot} />

      <button
        ref={buttonRef}
        type="button"
        className={styles.case}
        aria-label={`Bekijk project ${project.title}`}
        onPointerEnter={() =>
          onEnter?.(project.id)
        }
        onPointerMove={handleMouseMove}
        onPointerLeave={() => {
          resetEffects();
          onLeave?.(project.id);
        }}
        onFocus={() =>
          onEnter?.(project.id, false)
        }
        onBlur={() =>
          onLeave?.(project.id)
        }
        onClick={(event) =>
          onOpen?.(event, project)
        }
      >
        <div className={styles.cover}>
          <img
            src={project.image}
            alt=""
            draggable={false}
            className={styles.coverImage}
          />

          <div className={styles.coverTint} />
          <div className={styles.coverSoftLight} />
        </div>

        <div className={styles.spine} />
        <div className={styles.plastic} />
        <div className={styles.reflection} />

        <div className={styles.info}>
          <span>{project.category}</span>
          <h2>{project.title}</h2>
          <p>
            {project.slug === "about"
              ? "MEET MEO ↗"
              : "EXPLORE PROJECT ↗"}
          </p>
        </div>
      </button>
    </div>
  );
}
