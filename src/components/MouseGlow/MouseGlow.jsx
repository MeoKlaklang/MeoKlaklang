
import { useEffect, useRef } from "react";
import AmbientBackground from "../DarkProject/shared/AmbientBackground";
import styles from "./MouseGlow.module.css";

export default function MouseGlow({
  color = "#C3A2EB",
}) {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;

    if (!glow) return;

    let frame = null;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    function updatePosition() {
      frame = null;

      glow.style.setProperty(
        "--mouse-x",
        `${lastX}px`
      );

      glow.style.setProperty(
        "--mouse-y",
        `${lastY}px`
      );
    }

    function handlePointerMove(event) {
      if (event.pointerType !== "mouse") {
        return;
      }

      lastX = event.clientX;
      lastY = event.clientY;

      if (frame !== null) return;

      frame = requestAnimationFrame(
        updatePosition
      );
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className={styles.mouseGlow}
      aria-hidden="true"
    >
      <AmbientBackground
        currentColor={color}
        cursorOnly
      />
    </div>
  );
}
