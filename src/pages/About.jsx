
import { Link } from "react-router-dom";
import styles from "./ContentPage.module.css";

export default function About() {
  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>
        ← BACK TO PROJECTS
      </Link>

      <span className={styles.category}>ABOUT ME</span>

      <h1>Hello, I'm Meo.</h1>

      <p>
        I'm a creative designer with a background
        in Multimedia & Creative Technology.
        I love creating intuitive and visually
        engaging digital experiences.
      </p>
    </main>
  );
}
