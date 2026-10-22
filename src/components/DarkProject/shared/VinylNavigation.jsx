
import styles from "./VinylNavigation.module.css";

/* =====================================
   VINYL GEOMETRY
===================================== */

const DESKTOP_ANGLES = [-55, -18, 18, 55];
const MOBILE_ANGLES = [-145, -110, -70, -35];

const CENTER = 50;
const RADIUS = 46;

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
    "--marker-x": `${point.x}%`,
    "--marker-y": `${point.y}%`,
  };
}

function createArcPath(startAngle, endAngle) {
  const start = getPoint(startAngle);
  const end = getPoint(endAngle);

  const difference = endAngle - startAngle;
  const largeArc = Math.abs(difference) > 180 ? 1 : 0;
  const sweep = difference >= 0 ? 1 : 0;

  return `
    M ${start.x} ${start.y}
    A ${RADIUS} ${RADIUS}
    0 ${largeArc} ${sweep}
    ${end.x} ${end.y}
  `;
}

const DESKTOP_ARC = createArcPath(
  DESKTOP_ANGLES[0],
  DESKTOP_ANGLES[3]
);

const MOBILE_ARC = createArcPath(
  MOBILE_ANGLES[0],
  MOBILE_ANGLES[3]
);

/* =====================================
   CHAPTER PROGRESS
===================================== */

function calculateArcProgress(progress, count) {
  const safeProgress = clamp(progress);

  if (count <= 1) {
    return safeProgress;
  }

  const chapterProgress = safeProgress * count;

  const currentSegment = Math.min(
    count - 1,
    Math.floor(chapterProgress)
  );

  const fraction = clamp(
    chapterProgress - currentSegment
  );

  const currentMarker = currentSegment;
  const nextMarker = Math.min(
    currentMarker + 1,
    count - 1
  );

  let result =
    (currentMarker +
      (nextMarker - currentMarker) * fraction) /
    (count - 1);

  if (safeProgress >= 0.999) {
    result = 1;
  }

  return clamp(result);
}

/* =====================================
   CHAPTER MARKERS
===================================== */

function ChapterMarkers({
  project,
  chapters,
  angles,
  arcPath,
  progress,
  activeChapter,
  goToChapter,
  mobile = false,
  transition,
}) {
  return (
    <nav
      className={`${styles.chapterMarkers} ${
        mobile
          ? styles.mobileMarkers
          : styles.desktopMarkers
      }`}
      aria-label={`${project?.title} chapters`}
      aria-hidden={!mobile ? undefined : undefined}
      style={{
        opacity: clamp((transition - 0.6) / 0.4),
        pointerEvents:
          transition > 0.9 ? "auto" : "none",
      }}
    >
      <svg
        className={styles.progressRing}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path
          className={styles.progressTrack}
          d={arcPath}
          pathLength="100"
        />

        <path
          className={styles.progressFill}
          d={arcPath}
          pathLength="100"
          style={{
            strokeDasharray: `${
              clamp(progress) * 100
            } 100`,
          }}
        />
      </svg>

      {chapters.map((chapter, index) => {
        const active = activeChapter === index;

        return (
          <button
            key={`${index}-${chapter}`}
            type="button"
            className={`${styles.marker} ${
              active ? styles.markerActive : ""
            }`}
            style={markerPosition(
              angles[index] ?? angles[angles.length - 1]
            )}
            aria-current={active ? "step" : undefined}
            aria-label={`Go to ${chapter} chapter`}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              goToChapter?.(index);
            }}
          >
            <span className={styles.markerDot} />

            <span className={styles.markerText}>
              {chapter}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* =====================================
   VINYL NAVIGATION
===================================== */

export default function VinylNavigation({
  project,
  chapters = [],
  transition = 1,
  rotation = 0,
  progress = 0,
  activeChapter = 0,
  handleDiscDown,
  handleDiscUp,
  cancelDrag,
  goToChapter,
  canPlayNext = false,
  onPlayNext,
}) {
  const arcProgress = calculateArcProgress(
    progress,
    chapters.length
  );

  function handleRecordClick() {
    if (canPlayNext) {
      onPlayNext?.();
    }
  }

  function handleRecordKeyDown(event) {
    if (!canPlayNext) return;

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      onPlayNext?.();
    }
  }

  return (
    <div
      className={styles.vinylEntrance}
      style={{
        opacity: clamp(transition * 3),
        transform: `
          translateX(${(1 - transition) * 125}vw)
          scale(${0.78 + transition * 0.22})
        `,
        "--vinyl-rotation": `${rotation}deg`,
      }}
    >
      <div className={styles.vinylShell}>
        {/* VINYL RECORD */}

        <div
          className={styles.vinyl}
          role={canPlayNext ? "button" : "group"}
          tabIndex={canPlayNext ? 0 : undefined}
          aria-label={
            canPlayNext
              ? `Play next project after ${project?.title}`
              : "Drag the record to change chapter"
          }
          onClick={handleRecordClick}
          onKeyDown={handleRecordKeyDown}
          onPointerDown={handleDiscDown}
          onPointerUp={handleDiscUp}
          onPointerCancel={cancelDrag}
        >
          <div className={styles.vinylGrooves} />

          <div className={styles.vinylLabel}>
            {project?.image && (
              <img
                src={project.image}
                alt=""
                draggable={false}
              />
            )}

            <span className={styles.vinylHole} />
          </div>
        </div>

        {/* DESKTOP: RIGHT SIDE ARC */}

        <ChapterMarkers
          project={project}
          chapters={chapters}
          angles={DESKTOP_ANGLES}
          arcPath={DESKTOP_ARC}
          progress={arcProgress}
          activeChapter={activeChapter}
          goToChapter={goToChapter}
          transition={transition}
        />

        {/* MOBILE: TOP HALF ARC */}

        <ChapterMarkers
          project={project}
          chapters={chapters}
          angles={MOBILE_ANGLES}
          arcPath={MOBILE_ARC}
          progress={arcProgress}
          activeChapter={activeChapter}
          goToChapter={goToChapter}
          transition={transition}
          mobile
        />
      </div>
    </div>
  );
}
