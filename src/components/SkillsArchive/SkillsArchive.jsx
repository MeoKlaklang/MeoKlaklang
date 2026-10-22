
import styles from "./SkillsArchive.module.css";

const education = [
  {
    school: "Erasmus Hogeschool Brussel",
    course: "Multimedia & Creative Technology",
    period: "2023 — 2026",
  },
  {
    school: "VIVES Hogeschool Roeselare",
    course: "Agro-Biotechnology · Animal Care",
    period: "2020 — 2023",
  },
];

const info = [
  {
    title: "languages",
    accent: "blue",
    items: [
      "Dutch — fluent",
      "English — fluent",
      "French — fluent",
      "Thai — basic speaking",
    ],
  },
  {
    title: "softwares",
    accent: "pink",
    items: [
      "Figma",
      "Adobe Illustrator",
      "Adobe Photoshop",
      "Adobe XD",
      "Adobe InDesign",
      "Premiere Pro",
      "Rive",
    ],
  },
  {
    title: "programming",
    accent: "green",
    items: [
      "HTML / CSS",
      "JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "Swift / SwiftUI",
      "MongoDB",
      "MySQL",
      "Supabase",
    ],
  },
  {
    title: "soft skills",
    accent: "purple",
    items: [
      "Curious",
      "Feedback-oriented",
      "Collaborative",
      "Problem-solving",
      "Creative",
      "Driven",
      "Organised",
    ],
  },
  {
    title: "hobbies",
    accent: "yellow",
    items: [
      "Animal care",
      "Music",
      "Running",
      "Travelling",
      "Crocheting",
      "Gaming",
    ],
  },
];

function InfoGroup({ title, items, accent }) {
  return (
    <section
      className={styles.infoGroup}
      data-accent={accent}
    >
      <h3>{title}</h3>

      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function SkillsArchive({
  onClose,
  backRef,
}) {
  return (
    <main className={styles.archivePage}>
      {/* TOP NAVIGATION */}

      <div className={styles.archiveTop}>
        <button
          ref={backRef}
          type="button"
          className={styles.backButton}
          onClick={onClose}
        >
          <span aria-hidden="true">←</span>
          BACK TO ME
        </button>

        <span>PERSONAL ARCHIVE / 02</span>
      </div>

      {/* HEADING */}


      {/* INFORMATION */}

      <div className={styles.infoGrid}>
        {/* COLUMN 1 */}

        <div className={styles.infoColumn}>
          <section
            className={styles.infoGroup}
            data-accent="yellow"
          >
            <h3>education</h3>

            <div className={styles.educationList}>
              {education.map((item) => (
                <div
                  className={styles.educationItem}
                  key={item.school}
                >
                  <strong>{item.school}</strong>
                  <span>{item.course}</span>
                  <small>{item.period}</small>
                </div>
              ))}
            </div>
          </section>

          <InfoGroup {...info[0]} />
        </div>

        {/* COLUMN 2 */}

        <div className={styles.infoColumn}>
          <InfoGroup {...info[1]} />
          <InfoGroup {...info[2]} />
        </div>

        {/* COLUMN 3 */}

        <div className={styles.infoColumn}>
          <InfoGroup {...info[3]} />
          <InfoGroup {...info[4]} />
        </div>
      </div>

      {/* FOOTER */}

      <footer className={styles.archiveFooter}>
        <span>STILL LEARNING. STILL CREATING.</span>

        <button
          type="button"
          onClick={onClose}
        >
          CLOSE ARCHIVE ↗
        </button>
      </footer>
    </main>
  );
}
