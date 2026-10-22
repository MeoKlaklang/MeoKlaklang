
import styles from "./NextProjectLink.module.css";

export default function NextProjectLink({
  project,
  onClick,
}) {
  if (!project) return null;

  return (
    <button
      type="button"
      className={styles.nextLink}
      onClick={onClick}
      aria-label={`Go to next project: ${project.title}`}
      style={{
        "--next-accent":
          project.themeColor || project.color,
      }}
    >
      <span className={styles.label}>
        NEXT PROJECT
      </span>

      <span className={styles.projectName}>
        {project.title}

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}
