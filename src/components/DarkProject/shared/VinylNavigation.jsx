
const MARKER_ANGLES = [-55, -18, 18, 55];

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

function markerPosition(angle) {
  const radians =
    (angle * Math.PI) / 180;

  return {
    "--marker-x":
      `${
        50 +
        Math.cos(radians) * 47
      }%`,

    "--marker-y":
      `${
        50 +
        Math.sin(radians) * 47
      }%`,
  };
}

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
      className={
        styles.vinylEntrance
      }
      style={{
        opacity: clamp(
          transition * 3
        ),

        transform: `
          translateX(${
            (1 - transition) * 125
          }vw)
          scale(${
            0.78 +
            transition * 0.22
          })
        `,
      }}
    >
      <div
        className={
          styles.vinylShell
        }
      >
        <div
          className={
            styles.vinyl
          }
          role={
            canPlayNext
              ? "button"
              : "group"
          }
          tabIndex={
            canPlayNext
              ? 0
              : undefined
          }
          aria-label={
            canPlayNext
              ? `Play next project after ${project?.title}`
              : "Drag the record to change chapter"
          }
          onClick={
            handleRecordClick
          }
          onKeyDown={
            handleRecordKeyDown
          }
          onPointerDown={
            handleDiscDown
          }
          onPointerUp={
            handleDiscUp
          }
          onPointerCancel={
            cancelDrag
          }
        >
          <div
            className={
              styles.vinylGrooves
            }
          />

          <div
            className={
              styles.vinylLabel
            }
          >
            {project?.image && (
              <img
                src={
                  project.image
                }
                alt=""
                draggable="false"
              />
            )}

            <span
              className={
                styles.vinylHole
              }
            />
          </div>
        </div>

        {/* CHAPTER NAVIGATION */}

        <nav
          className={
            styles.chapterMarkers
          }
          aria-label={
            `${project?.title} chapters`
          }
          style={{
            opacity: clamp(
              (transition - 0.6) /
                0.4
            ),

            pointerEvents:
              transition > 0.9
                ? "auto"
                : "none",
          }}
        >
          <svg
            className={
              styles.progressRing
            }
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <path
              className={
                styles.progressTrack
              }
              d="M 75.6 10.6 A 47 47 0 0 1 75.6 89.4"
              pathLength="100"
            />

            <path
              className={
                styles.progressFill
              }
              d="M 75.6 10.6 A 47 47 0 0 1 75.6 89.4"
              pathLength="100"
              style={{
                strokeDasharray:
                  `${
                    clamp(progress) *
                    100
                  } 100`,
              }}
            />
          </svg>

          {chapters.map(
            (chapter, index) => (
              <button
                key={
                  `${index}-${chapter}`
                }
                type="button"
                className={`
                  ${styles.marker}
                  ${
                    activeChapter ===
                    index
                      ? styles.markerActive
                      : ""
                  }
                `}
                style={
                  markerPosition(
                    MARKER_ANGLES[
                      index
                    ] ?? 0
                  )
                }
                aria-current={
                  activeChapter ===
                  index
                    ? "step"
                    : undefined
                }
                onPointerDown={
                  (event) =>
                    event.stopPropagation()
                }
                onClick={
                  (event) => {
                    event.stopPropagation();
                    goToChapter?.(
                      index
                    );
                  }
                }
              >
                <span
                  className={
                    styles.markerDot
                  }
                />

                <span
                  className={
                    styles.markerText
                  }
                >
                  {chapter}
                </span>
              </button>
            )
          )}
        </nav>
      </div>
    </div>
  );
}
