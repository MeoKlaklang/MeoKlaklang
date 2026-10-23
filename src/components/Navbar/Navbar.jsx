
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import styles from "./Navbar.module.css";

export default function Navbar({
  variant = "light",
  activeAboutChapter = "about",
}) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  /* =====================================
     PAGE DETECTION
  ===================================== */

  const isProjectsPage =
    location.pathname === "/projects";

  const isAboutPage =
    location.pathname === "/about";

  const requestedChapter =
    location.state?.chapter ||
    activeAboutChapter;

  const isAboutActive =
    isAboutPage &&
    requestedChapter !== "contact";

  const isContactActive =
    isAboutPage &&
    requestedChapter === "contact";

  /* =====================================
     NAVBAR THEME
  ===================================== */

  const isDark =
    variant === "dark" ||
    isProjectsPage ||
    isAboutPage;

  const navbarClassName = [
    styles.navbar,
    isDark ? styles.dark : styles.light,
    isProjectsPage ? styles.projectsTheme : "",
    isContactActive ? styles.contactTheme : "",
  ]
    .filter(Boolean)
    .join(" ");

  /* =====================================
     CLOSE MOBILE MENU ON NAVIGATION
  ===================================== */

  useEffect(() => {
    setMenuOpen(false);
  }, [location.key]);

  /* =====================================
     ESCAPE CLOSES MOBILE MENU
  ===================================== */

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  /* =====================================
     RENDER
  ===================================== */

  return (
    <header className={navbarClassName}>
      {/* LOGO */}

      <Link
        to="/"
        className={styles.logo}
        onClick={closeMenu}
      >
        MEO® PROJECTS
      </Link>

      {/* =====================================
          DESKTOP NAVIGATION
      ===================================== */}

      <nav
        className={styles.desktopNav}
        aria-label="Main navigation"
      >
        {/* HOME */}

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${styles.navLink} ${
              isActive ? styles.active : ""
            }`
          }
        >
          HOME
        </NavLink>

        {/* PROJECTS */}

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `${styles.navLink} ${
              isActive ? styles.active : ""
            }`
          }
        >
          PROJECTS
        </NavLink>

        {/* ABOUT */}

        <NavLink
          to="/about"
          state={{ chapter: "about" }}
          className={`${styles.navLink} ${
            isAboutActive ? styles.active : ""
          }`}
          aria-current={
            isAboutActive ? "page" : undefined
          }
        >
          ABOUT
        </NavLink>

        {/* CONTACT */}

        <NavLink
          to="/about"
          state={{ chapter: "contact" }}
          className={`${styles.navLink} ${
            isContactActive ? styles.active : ""
          }`}
          aria-current={
            isContactActive ? "page" : undefined
          }
        >
          CONTACT
          <span aria-hidden="true">↗</span>
        </NavLink>
      </nav>

      {/* =====================================
          MOBILE MENU BUTTON
      ===================================== */}

      <button
        type="button"
        className={`${styles.menuToggle} ${
          menuOpen
            ? styles.menuToggleOpen
            : ""
        }`}
        aria-label={
          menuOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={menuOpen}
        aria-controls="mobile-main-navigation"
        onClick={() =>
          setMenuOpen((previous) => !previous)
        }
      >
        <span />
        <span />
      </button>

      {/* =====================================
          MOBILE DROPDOWN
      ===================================== */}

      <nav
        id="mobile-main-navigation"
        className={`${styles.mobileNav} ${
          menuOpen
            ? styles.mobileNavOpen
            : ""
        }`}
        aria-label="Mobile navigation"
        inert={!menuOpen}
      >
        {/* HOME */}

        <NavLink
          to="/"
          end
          onClick={closeMenu}
          className={({ isActive }) =>
            `${styles.mobileLink} ${
              isActive
                ? styles.mobileActive
                : ""
            }`
          }
        >
          <span className={styles.mobileNumber}>
            01
          </span>

          <span>Home</span>

          <span className={styles.mobileArrow}>
            ↗
          </span>
        </NavLink>

        {/* PROJECTS */}

        <NavLink
          to="/projects"
          onClick={closeMenu}
          className={({ isActive }) =>
            `${styles.mobileLink} ${
              isActive
                ? styles.mobileActive
                : ""
            }`
          }
        >
          <span className={styles.mobileNumber}>
            02
          </span>

          <span>Projects</span>

          <span className={styles.mobileArrow}>
            ↗
          </span>
        </NavLink>

        {/* ABOUT */}

        <NavLink
          to="/about"
          state={{ chapter: "about" }}
          onClick={closeMenu}
          className={`${styles.mobileLink} ${
            isAboutActive
              ? styles.mobileActive
              : ""
          }`}
          aria-current={
            isAboutActive ? "page" : undefined
          }
        >
          <span className={styles.mobileNumber}>
            03
          </span>

          <span>About</span>

          <span className={styles.mobileArrow}>
            ↗
          </span>
        </NavLink>

        {/* CONTACT */}

        <NavLink
          to="/about"
          state={{ chapter: "contact" }}
          onClick={closeMenu}
          className={`${styles.mobileLink} ${
            isContactActive
              ? styles.mobileActive
              : ""
          }`}
          aria-current={
            isContactActive ? "page" : undefined
          }
        >
          <span className={styles.mobileNumber}>
            04
          </span>

          <span>Contact</span>

          <span className={styles.mobileArrow}>
            ↗
          </span>
        </NavLink>

        {/* MOBILE FOOTER */}

        <div className={styles.mobileFooter}>
          <span>
            MEØ® / CREATIVE PORTFOLIO
          </span>

          <span>2026</span>
        </div>
      </nav>
    </header>
  );
}
