
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <Link className={styles.logo} to="/">
        MEO® PROJECTS
      </Link>

      <nav
        className={styles.links}
        aria-label="Main navigation"
      >
        <Link to="/">PROJECTS</Link>
        <Link to="/about">ABOUT</Link>
        <a href="mailto:hello@example.com">
          CONTACT ↗
        </a>
      </nav>
    </header>
  );
}
