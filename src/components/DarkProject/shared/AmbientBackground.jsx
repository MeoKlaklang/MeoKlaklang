
import styles from "./AmbientBackground.module.css";

export default function AmbientBackground({
  currentColor,
  nextColor,
  progress = 0,
  cursorOnly = false,
}) {
  const amount = Math.max(
    0,
    Math.min(1, progress)
  );

  // Reuse the EXACT cursor highlight
  // without the full project background.
  if (cursorOnly) {
    return (
      <div
        className={`${styles.ambient} ${styles.cursorOnly}`}
        aria-hidden="true"
      >
        <div
          className={styles.scene}
          style={{
            "--ambient-color": currentColor,
          }}
        >
          <div className={styles.cursorAura} />
        </div>
      </div>
    );
  }

  // Original project background — unchanged.
  return (
    <div
      className={styles.ambient}
      aria-hidden="true"
    >
      <div
        className={`${styles.scene} ${styles.current}`}
        style={{
          "--ambient-color": currentColor,
          opacity: 1 - amount,
        }}
      >
        <div className={styles.colorWash} />
        <div className={styles.floatingMist} />
        <div className={styles.cursorAura} />
        <div className={styles.grooves} />
      </div>

      <div
        className={`${styles.scene} ${styles.next}`}
        style={{
          "--ambient-color": nextColor,
          opacity: amount,
        }}
      >
        <div className={styles.colorWash} />
        <div className={styles.floatingMist} />
        <div className={styles.cursorAura} />
        <div className={styles.grooves} />
      </div>
    </div>
  );
}
