
import { useEffect, useRef, useState } from "react";

import Navbar from "../components/Navbar/Navbar";
import DiagonalGallery from "../components/Gallery/DiagonalGallery";
import CDOpening from "../components/CDOpening/CDOpening";
import DarkProject from "../components/DarkProject/DarkProject";

import { projects } from "../data/projects";
import styles from "./Home.module.css";

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

/*
  PROJECT DESTINATIONS

  For future projects, add the ID of their
  first chapter here, or set project.targetId
  in data/projects.js.
*/
const PROJECT_TARGETS = {
  gistda: "gistda-intro",
  "het-mandje": "project-research",
};

function getProjectTarget(project) {
  const slug = String(
    project?.slug || project?.title || ""
  ).toLowerCase();

  // Optional future configuration in projects.js
  if (project?.targetId) {
    return document.getElementById(project.targetId);
  }

  if (slug.includes("gistda")) {
    return document.getElementById(
      PROJECT_TARGETS.gistda
    );
  }

  if (slug.includes("mandje")) {
    return (
      document.getElementById(
        PROJECT_TARGETS["het-mandje"]
      ) ||
      document.getElementById("project-research") ||
      document.getElementById(
        `project-${project.slug}`
      ) ||
      document.getElementById("het-mandje")
    );
  }

  return document.getElementById(
    `project-${project.slug}`
  );
}

export default function Home() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  /*
    Het Mandje remains the initial record for
    the normal scroll-driven CD opening.
  */
  const selectedProject =
    projects.find((project) =>
      String(project.slug || project.title)
        .toLowerCase()
        .includes("mandje")
    ) || projects[0];

  /* =====================================
     HOMEPAGE SCROLL PROGRESS
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

      setProgress(
        clamp(-rect.top / scrollDistance)
      );
    }

    function handleScroll() {
      if (frame !== null) return;

      frame = requestAnimationFrame(updateProgress);
    }

    updateProgress();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      handleScroll
    );

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
     OPEN A PROJECT FROM THE GALLERY
  ===================================== */

  function handleProjectOpen(project) {
    const target = getProjectTarget(project);

    if (!target) {
      console.warn(
        "Project section not found:",
        project.slug,
        "Check the project's first chapter ID."
      );
      return;
    }

    /*
      Jump directly to the project rather than
      scrolling through the entire portfolio.

      This also triggers the existing DarkProject
      scroll listener to update the vinyl state.
    */
    const targetY =
      window.scrollY +
      target.getBoundingClientRect().top;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "instant",
    });
  }

  /* =====================================
     CD OPENING
  ===================================== */

  const departureProgress = clamp(
    (progress - 0.86) / 0.14
  );

  const openingInteractive =
    progress >= 0.82 &&
    progress < 0.86;

  const introOpacity = clamp(
    1 - progress / 0.15
  );

  return (
    <div className={styles.home}>

      {/* =====================================
          LIGHT HOME WORLD
      ===================================== */}

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
              opacity: introOpacity,
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

          {/* INTERACTIVE PROJECT LIBRARY */}

          <DiagonalGallery
            scrollProgress={progress}
            selectedProjectId={selectedProject.id}
            onProjectOpen={handleProjectOpen}
          />

          {/* OPENING JEWEL CASE */}

          <div
            className={styles.cdOpeningLayer}
            style={{
              pointerEvents: openingInteractive
                ? "auto"
                : "none",
            }}
          >
            <CDOpening
              project={selectedProject}
              progress={progress}
              departureProgress={departureProgress}
            />
          </div>

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

      {/* =====================================
          DARK PROJECT EXPERIENCE
      ===================================== */}

      <DarkProject project={selectedProject} />

    </div>
  );
}
