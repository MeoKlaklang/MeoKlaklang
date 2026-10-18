
import { Link, useParams } from "react-router-dom";
import { projects } from "../data/projects";
import styles from "./ContentPage.module.css";

export default function ProjectDetail() {
  const { slug } = useParams();

  const project = projects.find(
    (item) => item.slug === slug
  );

  if (!project) {
    return (
      <main className={styles.page}>
        <Link to="/" className={styles.back}>
          ← BACK TO PROJECTS
        </Link>
        <h1>Project not found</h1>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>
        ← BACK TO PROJECTS
      </Link>

      <span className={styles.category}>
        {project.category} / {project.year}
      </span>

      <h1>{project.title}</h1>
      <p>{project.description}</p>

      <img
        className={styles.image}
        src={project.image}
        alt={project.title}
      />
    </main>
  );
}
