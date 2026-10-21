
import { useEffect, useRef, useState } from "react";
import styles from "./MagazineFlipbook.module.css";

const TURN_DURATION = 760;

export default function MagazineFlipbook({
  pages = [],
  title = "Magazine",
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [turn, setTurn] = useState(null);

  const timerRef = useRef(null);
  const turningRef = useRef(false);

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  function goToPage(direction) {
    if (turningRef.current || pages.length === 0) return;

    const nextIndex = pageIndex + direction;

    if (nextIndex < 0 || nextIndex >= pages.length) {
      return;
    }

    turningRef.current = true;

    setTurn({
      from: pageIndex,
      to: nextIndex,
      direction,
    });

    window.clearTimeout(timerRef.current);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    timerRef.current = window.setTimeout(
      () => {
        setPageIndex(nextIndex);
        setTurn(null);
        turningRef.current = false;
      },
      reducedMotion ? 0 : TURN_DURATION
    );
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPage(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPage(-1);
    }
  }

  if (pages.length === 0) return null;

  const fromIndex = turn ? turn.from : pageIndex;
  const displayedIndex = turn ? turn.to : pageIndex;

  return (
    <div className={styles.book}>
      <div className={styles.toolbar}>
        <div className={styles.bookMeta}>
          <span className={styles.label}>
            THEOS / EARTH GALLERY
          </span>

          <span className={styles.counter}>
            {String(displayedIndex + 1).padStart(2, "0")}
            {" / "}
            {String(pages.length).padStart(2, "0")}
          </span>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => goToPage(-1)}
            disabled={pageIndex === 0 || Boolean(turn)}
            aria-label="Previous magazine spread"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={
              pageIndex === pages.length - 1 || Boolean(turn)
            }
            aria-label="Next magazine spread"
          >
            →
          </button>
        </div>
      </div>

      <div
        className={styles.stage}
        tabIndex={0}
        role="group"
        aria-label={`${title}: use the left and right arrow keys to turn pages`}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.bookSurface}>
          {/* The page revealed underneath. */}
          <img
            className={styles.underPage}
            src={pages[displayedIndex]}
            alt={`${title}, spread ${displayedIndex + 1}`}
          />

          {/* Current page rotates away. */}
          {turn && (
            <div
              key={`${turn.from}-${turn.to}`}
              className={`${styles.turningPage} ${
                turn.direction > 0
                  ? styles.turnForward
                  : styles.turnBackward
              }`}
            >
              <img
                src={pages[fromIndex]}
                alt=""
                aria-hidden="true"
              />

              <span
                className={styles.paperShadow}
                aria-hidden="true"
              />
            </div>
          )}

          <div className={styles.bookFold} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{
            width: `${
              ((displayedIndex + 1) / pages.length) * 100
            }%`,
          }}
        />
      </div>

      <p className={styles.hint}>
        Browse the spreads with the arrows.
      </p>
    </div>
  );
}
