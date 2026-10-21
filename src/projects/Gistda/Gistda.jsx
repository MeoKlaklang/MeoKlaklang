import ScrollHighlight from "../../components/DarkProject/shared/ScrollHighlight";
import darkStyles from "../../components/DarkProject/DarkProject.module.css";

import MagazineFlipbook from "./MagazineFlipbook";
import StickerPlayground from "./StickerPlayground";

import styles from "./Gistda.module.css";

const BASE = "/images/gistda";

// Exacte namen zoals in jouw VS Code.
const MAGAZINE_PAGES = ["3.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png", "10.png", "15.png", "16.png", "18.png", "20.png", "22.png", "26.png", "27.png", "28.png"].map((name) => `${BASE}/${name}`);

const STICKERS = ["sticker-02.png", "sticker-03.png", "sticker-04.png", "sticker-05.png", "sticker-06.png", "sticker-07.png", "sticker-08.png", "sticker-09.png", "sticker-10.png", "sticker-11.png"].map((name) => `${BASE}/${name}`);

function setChapter(chaptersRef, index, element) {
	if (chaptersRef?.current) {
		chaptersRef.current[index] = element;
	}
}

function ProjectText({ id, as = "p", className, revealedWords, text }) {
	return <ScrollHighlight id={id} as={as} className={className} styles={darkStyles} revealedWords={revealedWords} text={text} />;
}

export default function Gistda({ chaptersRef, revealedWords = {} }) {
	return (
		<div className={styles.project}>
			{/* ================================
          01 — INTRO
      ================================= */}

			<section ref={(element) => setChapter(chaptersRef, 0, element)} className={styles.chapter} id="gistda-intro">
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>01 / INTRO</span>

					<ProjectText id="gistda-intro-title" as="h2" className={styles.introTitle} revealedWords={revealedWords} text="Nothing beats an internship in the place where your story began." />

					<ProjectText
						id="gistda-intro-description"
						className={styles.introDescription}
						revealedWords={revealedWords}
						text="Returning to Thailand, the country where I was born, gave me the chance to reconnect with my roots and experience a new working culture. I never imagined my internship would lead me into the space sector. At GISTDA, I worked as a Graphic Design Intern with the Space Promotion Division and the Cal/Val team."
					/>

					<div className={styles.introDetails}>
						<span>GISTDA / THAILAND</span>
						<span>GRAPHIC DESIGN INTERN</span>
						<span>FEB — APR 2026</span>
					</div>
				</div>
			</section>

			{/* ================================
          02 — EDITORIAL
      ================================= */}

			<section ref={(element) => setChapter(chaptersRef, 1, element)} className={styles.chapter} id="gistda-editorial">
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>02 / EDITORIAL</span>

					<ProjectText id="gistda-editorial-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="THEOS Earth Gallery." />

					<ProjectText
						id="gistda-editorial-description"
						className={styles.sectionDescription}
						revealedWords={revealedWords}
						text="An editorial photobook presenting satellite imagery from the THEOS Earth observation programme. A visual journey across our planet, seen from space."
					/>

					<MagazineFlipbook pages={MAGAZINE_PAGES} title="THEOS Earth Gallery" />
				</div>
			</section>

			{/* ================================
          03 — BRANDING
      ================================= */}

			<section ref={(element) => setChapter(chaptersRef, 2, element)} className={styles.chapter} id="gistda-branding">
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>03 / BRANDING</span>

					<ProjectText id="gistda-branding-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="Visual communication for Cal/Val." />

					<ProjectText
						id="gistda-branding-description"
						className={styles.sectionDescription}
						revealedWords={revealedWords}
						text="Event communication, branding and playful space-inspired illustrations created for the Calibration and Validation team."
					/>

					<figure className={styles.brandingVisual}>
						<img src={`${BASE}/calval-back-13.jpg`} alt="Cal/Val pixel-art visual identity" loading="lazy" />

						<figcaption>01 / CAL/VAL VISUAL DESIGN</figcaption>
					</figure>

					<figure className={styles.brandingPoster}>
						<img src={`${BASE}/calvalPoster-02.jpg`} alt="GISTDA Technology Watch and Foresight Forum poster" loading="lazy" />

						<figcaption>02 / EVENT COMMUNICATION</figcaption>
					</figure>

					<section className={styles.stickerSection}>
						<span className={styles.eyebrow}>THE STICKER COLLECTION</span>

						<h3 className={styles.stickerHeading}>Space gets playful.</h3>

						<p className={styles.stickerDescription}>Ten stickers. A little gravity. Pick one up and see what happens.</p>

						<StickerPlayground stickers={STICKERS} />
					</section>
				</div>
			</section>

	

      {/* =====================================
          04 — LOGO / RAHU
      ===================================== */}

      <section
        ref={(element) =>
          setChapter(chaptersRef, 3, element)
        }
        className={styles.chapter}
        id="gistda-logo"
      >
        <div className={styles.chapterInner}>

          <span className={styles.eyebrow}>
            04 / LOGO
          </span>

          {/* ORIGINAL LOGO + STORY */}

          <div className={styles.rahuIntro}>

            {/* LEFT — THAI CULTURE */}

            <div className={styles.rahuStory}>

              <ProjectText
                id="gistda-logo-title"
                as="h2"
                className={styles.sectionTitle}
                revealedWords={revealedWords}
                text="A little piece of Thai mythology."
              />

              <span className={styles.rahuLabel}>
                MEET RAHU
              </span>

              <p className={styles.rahuDescription}>
                Inspired by Thai mythology, I created
                a playful interpretation of Rahu,
                a mythical figure known for swallowing
                the moon and causing lunar eclipses.
              </p>

              <p className={styles.rahuDescription}>
                I combined traditional Thai-inspired
                ornamentation, a golden crown and vibrant
                colours with a friendly, expressive
                character. The result brings a piece
                of Thai culture into a contemporary
                illustration.
              </p>

              <div className={styles.rahuColors}>
                <span style={{ background: "#F4BC39" }} />
                <span style={{ background: "#D9473F" }} />
                <span style={{ background: "#2285BA" }} />
                <span style={{ background: "#202323" }} />
              </div>

              <span className={styles.rahuFootnote}>
                THAI CULTURE · MYTHOLOGY · ILLUSTRATION
              </span>

            </div>

            {/* RIGHT — ORIGINAL RAHU DESIGN */}

            <figure className={styles.rahuIllustration}>
              <img
                src={`${BASE}/rahu-03.png`}
                alt="Original Rahu-inspired illustration holding the Moon Village Association logo"
                loading="lazy"
              />

              <figcaption>
                01 / ORIGINAL ILLUSTRATION
              </figcaption>
            </figure>

          </div>

          {/* MERCHANDISE MOCKUPS */}

          <div className={styles.logoApplications}>

            <div className={styles.logoApplicationsHeading}>
              <span className={styles.eyebrow}>
                02 / DESIGN APPLICATIONS
              </span>

              <h3>
                From illustration to identity.
              </h3>

              <p>
                Exploring how the illustration could
                come to life across everyday merchandise.
              </p>
            </div>

            <figure className={styles.logoMockupFigure}>
              <img
                src={`${BASE}/rahu-mockup.png`}
                alt="Rahu merchandise concepts including a tote bag, water bottle and apparel"
                loading="lazy"
              />
            </figure>

          </div>

        </div>
      </section>

    </div>
  );
}


	
