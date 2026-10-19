
import { useEffect, useRef, useState } from "react";

import Navbar from "../components/Navbar/Navbar";
import DiagonalGallery from "../components/Gallery/DiagonalGallery";
import CDOpening from "../components/CDOpening/CDOpening";
import ProjectAlbum from "../components/ProjectAlbum/ProjectAlbum";

import { projects } from "../data/projects";
import styles from "./Home.module.css";

/* =====================================
   HELPERS
===================================== */

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

/* =====================================
   HOME COMPONENT
===================================== */

export default function Home() {
  const sectionRef = useRef(null);

  const [progress, setProgress] = useState(0);

  /* =====================================
     SELECT HET MANDJE
  ===================================== */

  const selectedProject =
    projects.find((project) =>
      String(project.slug || project.title)
        .toLowerCase()
        .includes("mandje")
    ) || projects[0];

  /* =====================================
     SCROLL PROGRESS
  ===================================== */

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

      const nextProgress = clamp(
        -rect.top / scrollDistance
      );

      setProgress(nextProgress);
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
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleScroll
      );

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  /* =====================================
     SCROLL ANIMATION STATES
  ===================================== */

  const albumReveal = smoothstep(
    (progress - 0.82) / 0.16
  );

  const albumInteractive = progress >= 0.975;

  /* =====================================
     RENDER
  ===================================== */

  return (
    <div className={styles.home}>
      <section
        ref={sectionRef}
        className={styles.scrollSection}
      >
        <div className={styles.stickyStage}>

          {/* NAVBAR */}
          <div className={styles.navigation}>
            <Navbar />
          </div>

          {/* INTRO TEXT */}
          <div
            className={styles.intro}
            style={{
              opacity: clamp(
                1 - progress / 0.14
              ),

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

          {/* INTERACTIVE CD GALLERY */}
          <DiagonalGallery
            scrollProgress={progress}
            selectedProjectId={selectedProject.id}
          />

          {/* OPENING JEWEL CASE */}
          <div
            className={styles.cdOpeningLayer}
            style={{
              opacity: 1 - albumReveal,

              // IMPORTANT:
              // Let mouse events reach the gallery.
              pointerEvents: "none",
            }}
            aria-hidden={true}
            inert
          >
            <CDOpening
              project={selectedProject}
              progress={progress}
            />
          </div>

          {/* PROJECT ALBUM LAYOUT */}
          <div
            className={styles.albumLayer}
            style={{
              opacity: albumReveal,

              transform: `translateY(${
                (1 - albumReveal) * 45
              }px) scale(${
                0.97 + albumReveal * 0.03
              })`,

              pointerEvents: albumInteractive
                ? "auto"
                : "none",
            }}
            aria-hidden={!albumInteractive}
            inert={!albumInteractive}
          >
            <ProjectAlbum
              project={selectedProject}
              active={albumInteractive}
            />
          </div>

          {/* SCROLL INDICATOR */}
          <div
            className={styles.scrollHint}
            style={{
              opacity: clamp(
                1 - progress / 0.12
              ),
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
