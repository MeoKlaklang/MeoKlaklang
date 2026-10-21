
import styles from "./CDOpening.module.css";

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export default function CDOpening({
  project,
  progress = 0,
  departureProgress = 0,
}) {
  const visibility = smoothstep(
    (progress - 0.23) / 0.11
  );

  const openAmount = smoothstep(
    (progress - 0.37) / 0.34
  );

  const detailsOpacity = smoothstep(
    (progress - 0.72) / 0.12
  );

  const leaveAmount = smoothstep(
    departureProgress
  );

  const coverAngle = -180 * openAmount;
  const horizontalShift = -25 * (1 - openAmount);

  const image =
    project.image ||
    "/images/projects/het-mandje.jpg";

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
        "--flight-x": `${leaveAmount * 115}vw`,
      }}
    >
      <div className={styles.caseSpread}>
        {/* RIGHT SIDE — CD TRAY */}

        <div className={styles.tray}>
          <div className={styles.trayBackground} />

          {/* Only the circular disc flies away */}
          <div className={styles.discFlight}>
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
          </div>

          <span className={styles.trayEdge} />
          <span className={styles.trayReflection} />
        </div>

        {/* LEFT SIDE — HINGED FRONT COVER */}

        <div className={styles.coverPanel}>
          {/* OUTSIDE OF THE COVER */}

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
              <span>
                SELECTED PROJECT / 2026
              </span>

              <h2>{project.title}</h2>
            </div>
          </div>

          {/* INSIDE — PROJECT INTRODUCTION */}

          <div className={styles.insideSurface}>
            <div className={styles.insideContent}>
              <span className={styles.eyebrow}>
                01 / A PROJECT WITH A PURPOSE
              </span>

              <h2 className={styles.introHeadline}>
                What if a temporary home could
                change an animal's life?
              </h2>

              <p className={styles.introDescription}>
                Het Mandje connects animal shelters,
                foster families and veterinarians to
                make temporary animal care easier
                to organize.
              </p>

              <span className={styles.insideHint}>
                SCROLL TO DISCOVER ↓
              </span>
            </div>

            <span className={styles.insideReflection} />
          </div>
        </div>

        {/* PLASTIC HINGE */}

        <div className={styles.hinge} />
      </div>

      {/* SMALL CAPTION BELOW THE CASE */}

      <div className={styles.projectCaption}>
        <span>NOW PLAYING</span>
        <strong>{project.title}</strong>
        <span>UX/UI · CREATIVE TECHNOLOGY</span>
      </div>
    </div>
  );
}
