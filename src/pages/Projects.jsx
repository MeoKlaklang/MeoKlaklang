
import Navbar from "../components/Navbar/Navbar";
import ProjectsOverview from "../components/ProjectsOverview/ProjectsOverview";
import MouseGlow from "../components/MouseGlow/MouseGlow";

import styles from "./Projects.module.css";

export default function Projects() {
  return (
    <div className={styles.projectsLayout}>
      {/* GREEN MOUSE HIGHLIGHT */}

      <MouseGlow color="#A8D6B7" />

      {/* NAVBAR */}

      <div className={styles.navbarWrap}>
        <Navbar />
      </div>

      {/* PROJECT COLLECTION */}

      <main className={styles.main}>
        <ProjectsOverview />
      </main>
    </div>
  );
}
