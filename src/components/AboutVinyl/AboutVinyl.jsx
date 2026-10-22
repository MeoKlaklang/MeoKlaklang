
import styles from "./AboutVinyl.module.css";

/* =====================================
   VINYL GEOMETRY
===================================== */

const MARKER_ANGLES = [-150, -90, -30];

const CENTER = 50;
const RADIUS = 44;

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

function getPoint(angle) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: CENTER + Math.cos(radians) * RADIUS,
    y: CENTER + Math.sin(radians) * RADIUS,
  };
}

function markerPosition(angle) {
  const point = getPoint(angle);

  return {
    left: `${point.x}%`,
    top: `${point.y}%`,
  };
}

function createArcPath(startAngle, endAngle) {
  const start = getPoint(startAngle);
  const end = getPoint(endAngle);

  return `
    M ${start.x} ${start.y}
    A ${RADIUS} ${RADIUS}
      0 0 1
      ${end.x} ${end.y}
  `;
}

const PROGRESS_PATH = createArcPath(
  MARKER_ANGLES[0],
  MARKER_ANGLES[MARKER_ANGLES.length - 1]
);

/* =====================================
   ABOUT VINYL
===================================== */

export default function AboutVinyl({
  chapters = [],
  activeChapter = 0,
  onChapterChange,
}) {
  const count = chapters.length;

  const progress =
    count > 1
      ? clamp(activeChapter / (count - 1))
      : 0;

  const rotation = activeChapter * 48;

  function goToChapter(index) {
    const safeIndex = clamp(
      index,
      0,
      count - 1
    );

    onChapterChange?.(safeIndex);
  }

  return (
    <div className={styles.vinylDock}>
      {/* RECORD */}

      <div
        className={styles.record}
        aria-hidden="true"
      >
        {/* Slowly rotating grooves */}

        <div
          className={styles.recordSurface}
          style={{
            "--chapter-rotation": `${rotation}deg`,
          }}
        >
          <div className={styles.recordGrooves} />
          <div className={styles.recordReflection} />
        </div>

        {/* Center label */}

        <div className={styles.recordLabel}>
          <span className={styles.labelTop}>
            MEØ
          </span>

          <span className={styles.recordHole} />

          <span className={styles.labelBottom}>
            SIDE B
          </span>
        </div>
      </div>

      {/* PROGRESS + CHAPTER MARKERS */}

      <nav
        className={styles.navigation}
        aria-label="About page sections"
      >
        <svg
          className={styles.progressSvg}
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <path
            className={styles.progressTrack}
            d={PROGRESS_PATH}
            pathLength="100"
          />

          <path
            className={styles.progressFill}
            d={PROGRESS_PATH}
            pathLength="100"
            style={{
              strokeDasharray: `${
                progress * 100
              } 100`,
            }}
          />
        </svg>

        {chapters.map((chapter, index) => {
          const isActive =
            index === activeChapter;

          const isCompleted =
            index < activeChapter;

          return (
            <button
              key={chapter.id}
              type="button"
              className={[
                styles.marker,
                isActive
                  ? styles.markerActive
                  : "",
                isCompleted
                  ? styles.markerCompleted
                  : "",
              ].join(" ")}
              style={{
                ...markerPosition(
                  MARKER_ANGLES[index] ?? -90
                ),
                "--marker-color": chapter.color,
              }}
              onClick={() =>
                goToChapter(index)
              }
              aria-current={
                isActive ? "step" : undefined
              }
              aria-label={`Show ${chapter.title}`}
            >
              <span className={styles.markerName}>
                {chapter.title}
              </span>

              <span className={styles.markerDot}>
                <span />
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
