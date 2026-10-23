
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projects } from "../../data/projects";

import styles from "./ProjectsOverview.module.css";

export default function ProjectsOverview() {
  const navigate = useNavigate();

  /* =====================================
     PROJECTS THEME
  ===================================== */

  useEffect(() => {
    document.body.classList.add("projects-dark-theme");

    return () => {
      document.body.classList.remove(
        "projects-dark-theme"
      );
    };
  }, []);

  /* =====================================
     PROJECT COLLECTION
  ===================================== */

  const workProjects = projects.filter(
    (project) => project.slug !== "about"
  );

  const projectCount = String(
    workProjects.length
  ).padStart(2, "0");

  /* =====================================
     OPEN PROJECT WITHOUT RELOADING
  ===================================== */

  function openProject(event, slug) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    navigate("/", {
      state: {
        openProject: slug,
        returnTo: "/projects",
      },
    });
  }

  /* =====================================
     RENDER
  ===================================== */

  return (
    <section
      className={styles.projectsPage}
      aria-label="Selected projects"
    >
      {/* BACKGROUND AURAS */}

      <div
        className={styles.auraTop}
        aria-hidden="true"
      />

      <div
        className={styles.auraBottom}
        aria-hidden="true"
      />

      <div className={styles.container}>
        {/* MINIMAL HEADER */}

        <header className={styles.archiveHeader}>
          <div className={styles.archiveHeaderRow}>
            <span className={styles.archiveLabel}>
              MEØ / SELECTED PROJECTS
            </span>

            <span className={styles.archiveCount}>
              01 / {projectCount}
            </span>
          </div>

          <div
            className={styles.archiveLine}
            aria-hidden="true"
          />
        </header>

        {/* PROJECT GRID */}

        <div className={styles.projectGrid}>
          {workProjects.map((project, index) => (
            <a
              key={project.slug}
              href={`/#project-${project.slug}`}
              className={styles.projectItem}
              onClick={(event) =>
                openProject(event, project.slug)
              }
              style={{
                "--card-accent": project.color,
                "--card-index": index,
              }}
              aria-label={`Explore ${project.title}`}
            >
              {/* IMAGE */}

              <div className={styles.imageFrame}>
                <img
                  src={project.image}
                  alt={`${project.title} project preview`}
                  loading={
                    index < 3 ? "eager" : "lazy"
                  }
                />

                <span className={styles.imageNumber}>
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </span>

                <span
                  className={styles.viewIcon}
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>

              {/* PROJECT INFORMATION */}

              <div className={styles.cardInfo}>
                <div className={styles.cardHeadingRow}>
                  <h3>{project.title}</h3>

                  <span className={styles.year}>
                    {project.year}
                  </span>
                </div>

                <div className={styles.cardMeta}>
                  <span>{project.category}</span>

                  <span className={styles.viewText}>
                    EXPLORE RECORD ↗
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* FOOTER */}

        <footer className={styles.footer}>
          <span>
            {projectCount} PROJECTS.
            DIFFERENT STORIES.
          </span>

          <span>SELECT A RECORD ↗</span>
        </footer>
      </div>
    </section>
  );
}
