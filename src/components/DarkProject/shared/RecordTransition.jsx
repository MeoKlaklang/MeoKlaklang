
import styles from "./RecordTransition.module.css";

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

export default function RecordTransition({
  project,
  number = 2,
  progress = 0,
  cue = 0,
  rotation = 0,
  onPlay,
}) {
  const inProgress = clamp(
    (progress - 0.18) / 0.75
  );

  const visible = clamp(
    inProgress * 2.3
  );

  return (
    <div
      className={styles.layer}
      style={{
        opacity: visible,

        transform: `
          translateX(${
            (1 - inProgress) * 115
          }vw)
        `,

        "--next-project-color":
          project?.color ||
          "#B8A1DC",
      }}
    >
      <div
        className={styles.shell}
      >
        <button
          type="button"
          className={`
            ${styles.record}
            ${
              cue > 0.4
                ? styles.cued
                : ""
            }
          `}
          onClick={onPlay}
          aria-label={
            `Play next project: ${
              project?.title
            }`
          }
          title={
            `Play ${project?.title}`
          }
          style={{
            "--rotation":
              `${
                rotation * 0.6
              }deg`,
          }}
        >
          <span
            className={
              styles.grooves
            }
            aria-hidden="true"
          />

          <span
            className={
              styles.label
            }
          >
            {project?.image ? (
              <img
                src={
                  project.image
                }
                alt=""
                draggable="false"
              />
            ) : (
              <span
                className={
                  styles.fallback
                }
              >
                {String(
                  number
                ).padStart(2, "0")}
              </span>
            )}

            <span
              className={
                styles.hole
              }
            />
          </span>
        </button>
      </div>
    </div>
  );
}
