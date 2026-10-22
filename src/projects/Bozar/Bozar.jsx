
import ScrollHighlight from "../../components/DarkProject/shared/ScrollHighlight";
import darkStyles from "../../components/DarkProject/DarkProject.module.css";
import styles from "./Bozar.module.css";

const BASE = "/images/bozar";

/*
  Images to add to public/images/bozar:

  app-phones.png
  kiosk-mockup.png
  ticket-mockup.png
*/

function setChapter(chaptersRef, index, element) {
  if (chaptersRef?.current) {
    chaptersRef.current[index] = element;
  }
}

function ProjectText({
  id,
  as = "p",
  className,
  revealedWords,
  text,
}) {
  return (
    <ScrollHighlight
      id={id}
      as={as}
      className={className}
      styles={darkStyles}
      revealedWords={revealedWords}
      text={text}
    />
  );
}

export default function Bozar({
  chaptersRef,
  revealedWords = {},
}) {
  return (
    <div className={styles.project}>

      {/* =====================================
          01 — INTRO
      ===================================== */}

      <section
        ref={(el) => setChapter(chaptersRef, 0, el)}
        id="bozar-intro"
        className={styles.chapter}
      >
        <div className={styles.chapterInner}>
          <span className={styles.eyebrow}>
            01 / INTRO
          </span>

          <ProjectText
            id="bozar-intro-title"
            as="h2"
            className={styles.introTitle}
            revealedWords={revealedWords}
            text="Art becomes personal when you make it yours."
          />

          <ProjectText
            id="bozar-intro-description"
            className={styles.introDescription}
            revealedWords={revealedWords}
            text="For my Design 5 course, I collaborated on ARTMATCH, an interactive experience concept for BOZAR in Brussels. We explored how a digital kiosk, a mobile app and a physical Art Card could work together to help visitors discover their artistic personality and connect with art in a more personal way."
          />

          <div className={styles.projectDetails}>
            <span>UX/UI DESIGN</span>
            <span>EXPERIENCE DESIGN</span>
            <span>FIGMA</span>
            <span>GROUP PROJECT</span>
          </div>

          <div className={styles.introDecoration}>
            <span>YOUR PERSONAL ART JOURNEY</span>
            <div className={styles.introLine} />
            <span>2025</span>
          </div>
        </div>
      </section>

      {/* =====================================
          02 — APP
      ===================================== */}

      <section
        ref={(el) => setChapter(chaptersRef, 1, el)}
        id="bozar-app"
        className={styles.chapter}
      >
        <div className={styles.chapterInner}>
          <span className={styles.eyebrow}>
            02 / APP
          </span>

          <ProjectText
            id="bozar-app-title"
            as="h2"
            className={styles.sectionTitle}
            revealedWords={revealedWords}
            text="Your art journey doesn't end at the museum."
          />

          <ProjectText
            id="bozar-app-description"
            className={styles.sectionDescription}
            revealedWords={revealedWords}
            text="The mobile app connects the physical museum experience to a personal digital story. Visitors can scan their Art Card, revisit the artworks they selected and discover what those choices reveal about their artistic preferences."
          />

          <figure className={styles.appShowcase}>
            <img
              src={`${BASE}/app-phones.png`}
              alt="Two floating iPhone mockups displaying the ARTMATCH mobile app"
              loading="lazy"
            />

            <figcaption>
              ARTMATCH / MOBILE EXPERIENCE
            </figcaption>
          </figure>

          <div className={styles.featureRow}>
            <span>01 — PERSONAL ART PROFILE</span>
            <span>02 — DIGITAL ART JOURNEY</span>
          </div>
        </div>
      </section>

      {/* =====================================
          03 — KIOSK
      ===================================== */}

      <section
        ref={(el) => setChapter(chaptersRef, 2, el)}
        id="bozar-kiosk"
        className={styles.chapter}
      >
        <div className={styles.chapterInner}>
          <span className={styles.eyebrow}>
            03 / KIOSK
          </span>

          <ProjectText
            id="bozar-kiosk-title"
            as="h2"
            className={styles.sectionTitle}
            revealedWords={revealedWords}
            text="Every great art journey starts with curiosity."
          />

          <ProjectText
            id="bozar-kiosk-description"
            className={styles.sectionDescription}
            revealedWords={revealedWords}
            text="The experience begins at Brussels Central Station, where an interactive kiosk invites passers-by to discover their art personality through a short visual quiz. Based on their choices, visitors receive personalised artwork suggestions and a printed Art Card to take to BOZAR."
          />

          <figure className={styles.kioskShowcase}>
            <img
              src={`${BASE}/kiosk-mockup.png`}
              alt="Realistic standing ARTMATCH interactive touchscreen kiosk"
              loading="lazy"
            />

            <figcaption>
              ARTMATCH / INTERACTIVE KIOSK
            </figcaption>
          </figure>

          <div className={styles.featureRow}>
            <span>VISUAL PERSONALITY QUIZ</span>
            <span>PERSONALISED RECOMMENDATIONS</span>
          </div>
        </div>
      </section>

      {/* =====================================
          04 — TICKET
      ===================================== */}

      <section
        ref={(el) => setChapter(chaptersRef, 3, el)}
        id="bozar-ticket"
        className={styles.chapter}
      >
        <div className={styles.chapterInner}>
          <span className={styles.eyebrow}>
            04 / TICKET
          </span>

          <ProjectText
            id="bozar-ticket-title"
            as="h2"
            className={styles.sectionTitle}
            revealedWords={revealedWords}
            text="A little piece of art to take home."
          />

          <ProjectText
            id="bozar-ticket-description"
            className={styles.sectionDescription}
            revealedWords={revealedWords}
            text="The printed Art Card connects the digital experience with the physical museum visit. Visitors can collect up to six stamps from artworks that resonate with them, creating a personal souvenir that can later be connected to their digital art journey."
          />

          <figure className={styles.ticketShowcase}>
            <img
              src={`${BASE}/ticket-mockup.png`}
              alt="ARTMATCH printed Art Cards with green halftone graphics and stamp collection spaces"
              loading="lazy"
            />

            <figcaption>
              ARTMATCH / PHYSICAL ART CARD
            </figcaption>
          </figure>

          <div className={styles.featureRow}>
            <span>PHYSICAL × DIGITAL</span>
            <span>COLLECT YOUR ART STORY</span>
          </div>

   
        </div>
      </section>

    </div>
  );
}
