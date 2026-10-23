
import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import DiagonalGallery from "../components/Gallery/DiagonalGallery";
import CDOpening from "../components/CDOpening/CDOpening";
import DarkProject from "../components/DarkProject/DarkProject";

import { projects } from "../data/projects";
import styles from "./Home.module.css";

/* =====================================
   HELPERS
===================================== */

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

/* =====================================
   PROJECT DESTINATIONS
===================================== */

const PROJECT_TARGETS = {
  "het-mandje": "project-research",
  "animal-festival": "project-animal-festival",
  petbridge: "project-petbridge",
  bozar: "project-bozar",
  gistda: "project-gistda",
};

function getProjectTarget(project) {
  if (!project) return null;

  const slug = String(
    project.slug || project.title || ""
  ).toLowerCase();

  if (project.targetId) {
    const customTarget = document.getElementById(
      project.targetId
    );

    if (customTarget) {
      return customTarget;
    }
  }

  const targetId =
    PROJECT_TARGETS[slug] || `project-${slug}`;

  return document.getElementById(targetId);
}

/* =====================================
   SCROLL TO PROJECT
===================================== */

function scrollToProject(project) {
  const target = getProjectTarget(project);

  if (!target) return false;

  const targetY =
    window.scrollY +
    target.getBoundingClientRect().top;

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: "instant",
  });

  return true;
}

/* =====================================
   HOME COMPONENT
===================================== */

export default function Home() {
  const sectionRef = useRef(null);
  const navigationFrameRef = useRef(null);

  const [progress, setProgress] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  /* =====================================
     SELECTED PROJECT FOR CD OPENING
  ===================================== */

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

      const rect =
        section.getBoundingClientRect();

      const scrollDistance =
        section.offsetHeight -
        window.innerHeight;

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

      frame = requestAnimationFrame(
        updateProgress
      );
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
     OPEN PROJECT FROM HOMEPAGE GALLERY
  ===================================== */

  function handleProjectOpen(project) {
    if (project?.slug === "about") {
      navigate("/about");
      return;
    }

    if (location.state?.returnTo) {
      navigate("/", {
        replace: true,
        state: null,
        preventScrollReset: true,
      });
    }

    const success = scrollToProject(project);

    if (!success) {
      console.warn(
        "Project section not found:",
        project?.slug
      );
    }
  }

  /* =====================================
     OPEN PROJECT FROM PROJECTS OVERVIEW
  ===================================== */

  useEffect(() => {
    const requestedSlug =
      location.state?.openProject ||
      (
        location.hash?.startsWith(
          "#project-"
        )
          ? location.hash.replace(
              /^#project-/,
              ""
            )
          : null
      );

    if (!requestedSlug) return;

    const requestedProject =
      projects.find(
        (project) =>
          project.slug === requestedSlug &&
          project.slug !== "about"
      );

    if (!requestedProject) return;

    let attempts = 0;
    let cancelled = false;

    function openRequestedProject() {
      if (cancelled) return;

      const target = getProjectTarget(
        requestedProject
      );

      if (!target) {
        if (attempts < 60) {
          attempts += 1;

          navigationFrameRef.current =
            requestAnimationFrame(
              openRequestedProject
            );
        } else {
          console.warn(
            "Requested project could not be found:",
            requestedSlug
          );
        }

        return;
      }

      const targetY =
        window.scrollY +
        target.getBoundingClientRect().top;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "instant",
      });

      /*
        Keep returnTo available for
        the X button in DarkProject.
      */

      if (location.state?.openProject) {
        navigate(
          {
            pathname: "/",
            hash: "",
          },
          {
            replace: true,
            state: {
              returnTo:
                location.state?.returnTo ??
                null,
            },
            preventScrollReset: true,
          }
        );
      }
    }

    navigationFrameRef.current =
      requestAnimationFrame(
        openRequestedProject
      );

    return () => {
      cancelled = true;

      if (
        navigationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          navigationFrameRef.current
        );
      }
    };
  }, [
    location.state?.openProject,
    location.hash,
    navigate,
  ]);

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

  /* =====================================
     RENDER
  ===================================== */

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
          {/* NAVBAR */}

          <div className={styles.navigation}>
            <Navbar />
          </div>

          {/* =====================================
              INTRO TITLE
          ===================================== */}

          <div
            className={styles.intro}
            style={{
              opacity: introOpacity,
              transform: `translateY(${
                -progress * 120
              }px)`,
            }}
          >
            <h1>
              Creative thinking.
              <br />
              Digital experiences.
            </h1>

            {/* DESCRIPTION ON DESKTOP */}

            <p
              className={
                styles.desktopDescription
              }
            >
              A collection of my work in UX/UI,
              visual design and development.
            </p>
          </div>

          {/* =====================================
              INTERACTIVE PROJECT LIBRARY
          ===================================== */}

          <DiagonalGallery
            scrollProgress={progress}
            selectedProjectId={
              selectedProject.id
            }
            onProjectOpen={
              handleProjectOpen
            }
          />

          {/* =====================================
              OPENING JEWEL CASE
          ===================================== */}

          <div
            className={
              styles.cdOpeningLayer
            }
            style={{
              pointerEvents:
                openingInteractive
                  ? "auto"
                  : "none",
            }}
          >
            <CDOpening
              project={selectedProject}
              progress={progress}
              departureProgress={
                departureProgress
              }
            />
          </div>

          {/* =====================================
              MOBILE DESCRIPTION
              BELOW THE CD GALLERY
          ===================================== */}

          <p
            className={
              styles.mobileDescription
            }
            style={{
              opacity: introOpacity,
            }}
          >
            A collection of my work in UX/UI,
            visual design and development.
          </p>

          {/* =====================================
              SCROLL HINT
          ===================================== */}

          <div
            className={styles.scrollHint}
            style={{
              opacity: clamp(
                1 - progress / 0.12
              ),
            }}
          >
            <span>↓</span>
          </div>
        </div>
      </section>

      {/* =====================================
          DARK PROJECT EXPERIENCE
      ===================================== */}

      <DarkProject
        project={selectedProject}
      />
    </div>
  );
}
