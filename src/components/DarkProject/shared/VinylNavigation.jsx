
/* =====================================
   VINYL NAVIGATION
===================================== */

const MARKER_ANGLES = [-55, -18, 18, 55];

const RADIUS = 47;
const CENTER = 50;

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

/* =====================================
   MARKER POSITION
===================================== */

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

/* =====================================
   PROGRESS ARC
===================================== */

/*
  The SVG arc is calculated from the same
  marker angles used by the buttons.

  This ensures that the progress line
  passes exactly through the markers.
*/

function createArcPath(startAngle, endAngle) {
  const start = getPoint(startAngle);
  const end = getPoint(endAngle);

  const difference = endAngle - startAngle;

  const largeArcFlag =
    Math.abs(difference) > 180 ? 1 : 0;

  const sweepFlag = difference >= 0 ? 1 : 0;

  return `
    M ${start.x} ${start.y}
    A ${RADIUS} ${RADIUS}
      0 ${largeArcFlag} ${sweepFlag}
      ${end.x} ${end.y}
  `;
}

const ARC_PATH = createArcPath(
  MARKER_ANGLES[0],
  MARKER_ANGLES[MARKER_ANGLES.length - 1]
);

/* =====================================
   VINYL NAVIGATION COMPONENT
===================================== */

export default function VinylNavigation({
  project,
  chapters = [],
  styles,
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
  const safeProgress = clamp(progress);

  /*
    DarkProject divides progress into
    four chapter segments.

    Our arc has three intervals between
    four markers.

    Convert chapter progress to arc
    position so chapter boundaries align
    with their corresponding dots.
  */

  const chapterCount = Math.max(1, chapters.length);

  const chapterProgress = safeProgress * chapterCount;

  const currentSegment = Math.min(
    chapterCount - 1,
    Math.floor(chapterProgress)
  );

  const segmentFraction = clamp(
    chapterProgress - currentSegment
  );

  let arcProgress = 0;

  if (chapterCount > 1) {
    const markerIndex = Math.min(
      currentSegment,
      chapterCount - 1
    );

    const nextMarkerIndex = Math.min(
      markerIndex + 1,
      chapterCount - 1
    );

    const markerPositionValue =
      markerIndex +
      (nextMarkerIndex - markerIndex) *
        segmentFraction;

    arcProgress =
      markerPositionValue / (chapterCount - 1);
  } else {
    arcProgress = safeProgress;
  }

  // Finish the line at the end of the record.
  if (safeProgress >= 0.999) {
    arcProgress = 1;
  }

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
      }}
    >
      <div className={styles.vinylShell}>
        {/* =====================================
            VINYL DISC
        ===================================== */}

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
                draggable="false"
              />
            )}

            <span className={styles.vinylHole} />
          </div>
        </div>

        {/* =====================================
            CHAPTER NAVIGATION
        ===================================== */}

        <nav
          className={styles.chapterMarkers}
          aria-label={`${project?.title} chapters`}
          style={{
            opacity: clamp(
              (transition - 0.6) / 0.4
            ),

            pointerEvents:
              transition > 0.9
                ? "auto"
                : "none",
          }}
        >
          {/* =====================================
              PROGRESS RING
          ===================================== */}

          <svg
            className={styles.progressRing}
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            {/* Background arc */}

            <path
              className={styles.progressTrack}
              d={ARC_PATH}
              pathLength="100"
            />

            {/* Active progress arc */}

            <path
              className={styles.progressFill}
              d={ARC_PATH}
              pathLength="100"
              style={{
                strokeDasharray: `${
                  clamp(arcProgress) * 100
                } 100`,
              }}
            />
          </svg>

          {/* =====================================
              CHAPTER MARKERS
          ===================================== */}

          {chapters.map((chapter, index) => {
            const angle =
              MARKER_ANGLES[index] ?? 0;

            const isActive =
              activeChapter === index;

            return (
              <button
                key={`${index}-${chapter}`}
                type="button"
                className={`
                  ${styles.marker}
                  ${
                    isActive
                      ? styles.markerActive
                      : ""
                  }
                `}
                style={markerPosition(angle)}
                aria-current={
                  isActive ? "step" : undefined
                }
                aria-label={`Go to ${chapter} chapter`}
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  goToChapter?.(index);
                }}
              >
                <span
                  className={styles.markerDot}
                />

                <span
                  className={styles.markerText}
                >
                  {chapter}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
