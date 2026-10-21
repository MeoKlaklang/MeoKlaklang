import styles from "./AmbientBackground.module.css";

/**
 * Decorative, non-interactive backdrop. The two fully separate color layers
 * crossfade during the existing Record Transition, without changing its logic.
 */
export default function AmbientBackground({ currentColor, nextColor, progress = 0 }) {
  const amount = Math.max(0, Math.min(1, progress));

  return (
    <div className={styles.ambient} aria-hidden="true">
      <div
        className={`${styles.scene} ${styles.current}`}
        style={{ "--ambient-color": currentColor, opacity: 1 - amount }}
      >
        <div className={styles.colorWash} />
        <div className={styles.floatingMist} />
        <div className={styles.cursorAura} />
        <div className={styles.grooves} />
      </div>

      <div
        className={`${styles.scene} ${styles.next}`}
        style={{ "--ambient-color": nextColor, opacity: amount }}
      >
        <div className={styles.colorWash} />
        <div className={styles.floatingMist} />
        <div className={styles.cursorAura} />
        <div className={styles.grooves} />
      </div>
    </div>
  );
}
