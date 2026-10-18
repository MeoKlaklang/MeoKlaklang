
import { useEffect, useRef, useState } from "react";

import Navbar from "../components/Navbar/Navbar";
import DiagonalGallery from "../components/Gallery/DiagonalGallery";
import CDOpening from "../components/CDOpening/CDOpening";

import { projects } from "../data/projects";
import styles from "./Home.module.css";

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

export default function Home() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const selectedProject =
    projects.find((project) =>
      String(project.slug || project.title)
        .toLowerCase()
        .includes("mandje")
    ) || projects[0];

  useEffect(() => {
    let frame = null;

    function updateProgress() {
      frame = null;

      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();

      const scrollDistance =
        section.offsetHeight - window.innerHeight;

      if (scrollDistance <= 0) {
        setProgress(0);
        return;
      }

      const next = clamp(
        -rect.top / scrollDistance
      );

      setProgress(next);
    }

    function handleScroll() {
      if (frame !== null) return;

      frame = requestAnimationFrame(updateProgress);
    }

    updateProgress();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div className={styles.home}>
      <section
        ref={sectionRef}
        className={styles.scrollSection}
      >
        <div className={styles.stickyStage}>
          <div className={styles.navigation}>
            <Navbar />
          </div>

          <div
            className={styles.intro}
            style={{
              opacity: clamp(1 - progress / 0.14),
              transform: `translateY(${
                -progress * 120
              }px)`,
            }}
          >
            <span>
              SELECTED WORKS / 2025—2026
            </span>

            <h1>
              Creative thinking.
              <br />
              Digital experiences.
            </h1>

            <p>
              A collection of my work in UX/UI,
              visual design and development.
            </p>
          </div>

          <DiagonalGallery
            scrollProgress={progress}
            selectedProjectId={selectedProject.id}
          />

          <CDOpening
            project={selectedProject}
            progress={progress}
          />

          <div
            className={styles.scrollHint}
            style={{
              opacity: clamp(1 - progress / 0.12),
            }}
          >
            SCROLL TO EXPLORE
            <span>↓</span>
          </div>
        </div>
      </section>
    </div>
  );
}
