
import { useState } from "react";
import styles from "./CDOpening.module.css";

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const sections = [
  {
    id: "intro",
    number: "01",
    label: "Introduction",
    title: "A little introduction",
    description:
      "Het Mandje is a digital platform that connects animal shelters, foster families and veterinarians to support temporary animal care.",
  },
  {
    id: "demo",
    number: "02",
    label: "Demo",
    title: "The platform",
    description:
      "Explore the core experience: finding foster homes, managing animals and coordinating care through one connected platform.",
  },
  {
    id: "research",
    number: "03",
    label: "Research",
    title: "Understanding the problem",
    description:
      "User interviews, personas and journey mapping helped identify the challenges faced by shelters, foster families and veterinarians.",
  },
  {
    id: "details",
    number: "04",
    label: "Details",
    title: "From idea to product",
    description:
      "UX/UI design, prototyping and full-stack development come together in a platform designed around real user needs.",
  },
];

export default function CDOpening({
  project,
  progress = 0,
}) {
  const [activeSection, setActiveSection] =
    useState("intro");

  const selectedSection =
    sections.find(
      (section) => section.id === activeSection
    ) || sections[0];

  // The new jewel case fades in
  const visibility = smoothstep(
    (progress - 0.23) / 0.11
  );

  // Cover opens smoothly from 0 to 180 degrees
  const openAmount = smoothstep(
    (progress - 0.37) / 0.34
  );

  // Interior navigation appears near the end
  const detailsOpacity = smoothstep(
    (progress - 0.72) / 0.12
  );

  const interactive = progress >= 0.81;

  const coverAngle = -180 * openAmount;

  // Keep the closed jewel case centered,
  // then center the entire open spread.
  const horizontalShift =
    -25 * (1 - openAmount);

  const image =
    project.image || "/images/projects/het-mandje.jpg";

  const color = project.color || "#8DB5A9";

  return (
    <div
      className={styles.experience}
      style={{
        "--visibility": visibility,
        "--cover-angle": `${coverAngle}deg`,
        "--horizontal-shift": `${horizontalShift}%`,
        "--details-opacity": detailsOpacity,
        "--project-color": color,
        pointerEvents: interactive ? "auto" : "none",
      }}
      aria-hidden={visibility < 0.02}
    >
      <div className={styles.caseSpread}>

        {/* RIGHT SIDE: CD TRAY */}
        <div className={styles.tray}>
          <div className={styles.trayBackground} />

          <div className={styles.disc}>
            <img
              src={image}
              alt=""
              draggable="false"
              className={styles.discImage}
            />

            <span className={styles.discTint} />
            <span className={styles.discRings} />
            <span className={styles.discHole} />
          </div>

          <span className={styles.trayEdge} />
          <span className={styles.trayReflection} />
        </div>

        {/* FRONT COVER: OPENS TO THE LEFT */}
        <div className={styles.coverPanel}>

          {/* CLOSED COVER — OUTSIDE */}
          <div className={styles.frontSurface}>
            <img
              src={image}
              alt=""
              draggable="false"
              className={styles.frontImage}
            />

            <span className={styles.frontTint} />
            <span className={styles.frontGloss} />
            <span className={styles.frontSpine} />

            <div className={styles.frontText}>
              <span>SELECTED PROJECT / 2026</span>
              <h2>{project.title}</h2>
            </div>
          </div>

          {/* OPEN COVER — INSIDE LEFT */}
          <div className={styles.insideSurface}>
            <div className={styles.insideContent}>

              <span className={styles.eyebrow}>
                PROJECT 01 / 2026
              </span>

              <h2 className={styles.projectTitle}>
                {project.title}
              </h2>

              <p className={styles.category}>
                {project.category ||
                  "UX/UI · Full-stack"}
              </p>

              <div className={styles.separator} />

              <nav
                className={styles.projectNav}
                aria-label="Project sections"
              >
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    disabled={!interactive}
                    className={`${styles.navItem} ${
                      activeSection === section.id
                        ? styles.navItemActive
                        : ""
                    }`}
                    onClick={() =>
                      setActiveSection(section.id)
                    }
                  >
                    <span>
                      {section.number}
                    </span>
                    <span>
                      {section.label}
                    </span>
                  </button>
                ))}
              </nav>

              <div className={styles.sectionPreview}>
                <h3>{selectedSection.title}</h3>
                <p>
                  {selectedSection.description}
                </p>
              </div>

            </div>

            <span className={styles.insideReflection} />
          </div>
        </div>

        {/* PLASTIC HINGE */}
        <div className={styles.hinge} />

      </div>

      <div className={styles.projectCaption}>
        <span>NOW PLAYING</span>
        <strong>{project.title}</strong>
        <span>UX/UI · CREATIVE TECHNOLOGY</span>
      </div>
    </div>
  );
}
