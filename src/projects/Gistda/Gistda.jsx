import { useEffect, useRef, useState } from "react";

import ScrollHighlight from "../../components/DarkProject/shared/ScrollHighlight";
import darkStyles from "../../components/DarkProject/DarkProject.module.css";

import MagazineFlipbook from "./MagazineFlipbook";
import StickerPlayground from "./StickerPlayground";

import styles from "./Gistda.module.css";

/* =========================================
   ASSETS
========================================= */

const BASE = "/images/gistda";

const MAGAZINE_PAGES = ["2.png", "1.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png", "10.png", "15.png", "16.png", "18.png", "20.png", "22.png", "26.png", "27.png", "28.png"].map((name) => `${BASE}/${name}`);

const STICKERS = ["sticker-02.png", "sticker-03.png", "sticker-04.png", "sticker-05.png", "sticker-06.png", "sticker-07.png", "sticker-08.png", "sticker-09.png", "sticker-10.png", "sticker-11.png"].map((name) => `${BASE}/${name}`);

const PROJECT_TAGS = ["INTERNSHIP", "GRAPHIC DESIGN", "THAILAND"];

/* =========================================
   HELPERS
========================================= */

function setChapter(chaptersRef, index, element) {
	if (chaptersRef?.current) {
		chaptersRef.current[index] = element;
	}
}

function ProjectText({ id, as = "p", className, revealedWords, text }) {
	return <ScrollHighlight id={id} as={as} className={className} styles={darkStyles} revealedWords={revealedWords} text={text} />;
}

/* =========================================
   BONUS TRACK

   Appears at the end of GISTDA,
   inviting visitors to the About page.
========================================= */

/* =========================================
   GISTDA PROJECT
========================================= */

export default function Gistda({ chaptersRef, revealedWords = {} }) {
	return (
		<div className={styles.project}>
			{/* ==================================
          01 — INTRO
      ================================== */}

			<section ref={(element) => setChapter(chaptersRef, 0, element)} className={`${styles.chapter} ${styles.introChapter}`} id="gistda-intro">
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>01 / INTRO</span>

					<ProjectText id="gistda-intro-title" as="h2" className={styles.introTitle} revealedWords={revealedWords} text="Nothing beats an internship in the place where your story began." />

					<ProjectText
						id="gistda-intro-description"
						className={styles.introDescription}
						revealedWords={revealedWords}
						text="Returning to Thailand, the country where I was born, gave me the chance to reconnect with my roots and experience a new working culture. I never imagined my internship would lead me into the space sector. At GISTDA, I worked as a Graphic Design Intern with the Space Promotion Division and the Cal/Val team."
					/>

					{/* PROJECT TAGS */}

					<div className={styles.projectTags} aria-label="Project categories">
						{PROJECT_TAGS.map((tag) => (
							<span key={tag} className={styles.projectTag}>
								{tag}
							</span>
						))}
					</div>

					{/* INTRO PHOTO */}

					<figure className={styles.introFigure}>
						<div className={styles.introImage}>
							<img src={`${BASE}/intro1.jpg`} alt="GISTDA internship in Thailand" loading="eager" />
						</div>

						<figcaption className={styles.introCaption}>
							<span>01 / INTERNSHIP IN THAILAND</span>
							<span>GISTDA — 2026</span>
						</figcaption>
					</figure>
				</div>
			</section>

			{/* ==================================
          02 — EDITORIAL
      ================================== */}

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

			{/* ==================================
          03 — BRANDING
      ================================== */}

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

					{/* BRANDING VISUAL */}

					<figure className={styles.brandingVisual}>
						<img src={`${BASE}/calval-back-13.jpg`} alt="Cal/Val pixel-art visual identity" loading="lazy" />

						<figcaption>01 / CAL/VAL VISUAL DESIGN</figcaption>
					</figure>

					{/* EVENT POSTER */}

					<figure className={styles.brandingPoster}>
						<img src={`${BASE}/calvalPoster-02.jpg`} alt="GISTDA Technology Watch and Foresight Forum poster" loading="lazy" />

						<figcaption>02 / EVENT COMMUNICATION</figcaption>
					</figure>

					{/* STICKER COLLECTION */}

					<section className={styles.stickerSection} aria-label="GISTDA sticker collection">
						<span className={styles.eyebrow}>THE STICKER COLLECTION</span>

						<h3 className={styles.stickerHeading}>Space gets playful.</h3>

						<p className={styles.stickerDescription}>Ten stickers. A little gravity. Pick one up and see what happens.</p>

						<StickerPlayground stickers={STICKERS} />
					</section>
				</div>
			</section>

			{/* ==================================
          04 — LOGO / RAHU
      ================================== */}

			<section ref={(element) => setChapter(chaptersRef, 3, element)} className={`${styles.chapter} ${styles.logoChapter}`} id="gistda-logo">
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>04 / LOGO</span>

					<div className={styles.rahuIntro}>
						{/* STORY */}

						<div className={styles.rahuStory}>
							<ProjectText id="gistda-logo-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="A little piece of Thai mythology." />

							<span className={styles.rahuLabel}>MEET RAHU</span>

							<p className={styles.rahuDescription}>Inspired by Thai mythology, I created a playful interpretation of Rahu, a mythical figure known for swallowing the moon and causing lunar eclipses.</p>

							<p className={styles.rahuDescription}>
								I combined traditional Thai-inspired ornamentation, a golden crown and vibrant colours with a friendly, expressive character. The result brings a piece of Thai culture into a contemporary illustration.
							</p>

							<div className={styles.rahuColors} aria-label="Rahu colour palette">
								<span style={{ background: "#F4BC39" }} />
								<span style={{ background: "#D9473F" }} />
								<span style={{ background: "#2285BA" }} />
								<span style={{ background: "#202323" }} />
							</div>

							<span className={styles.rahuFootnote}>THAI CULTURE · MYTHOLOGY · ILLUSTRATION</span>
						</div>

						{/* ORIGINAL ILLUSTRATION */}

						<figure className={styles.rahuIllustration}>
							<img src={`${BASE}/rahu-03.png`} alt="Original Rahu-inspired illustration holding the Moon Village Association logo" loading="lazy" />

							<figcaption>01 / ORIGINAL ILLUSTRATION</figcaption>
						</figure>
					</div>

					{/* DESIGN APPLICATIONS */}

					<div className={styles.logoApplications}>
						<div className={styles.logoApplicationsHeading}>
							<span className={styles.eyebrow}>02 / DESIGN APPLICATIONS</span>

							<h3>From illustration to identity.</h3>

							<p>Exploring how the illustration could come to life across everyday merchandise.</p>
						</div>

						<figure className={styles.logoMockupFigure}>
							<img src={`${BASE}/rahu-mockup.png`} alt="Rahu merchandise concepts including a tote bag, water bottle and apparel" loading="lazy" />
						</figure>

						{/* =====================================
    FROM CONCEPT TO REALITY
===================================== */}

						<div className={styles.logoReality}>
							<div className={styles.logoRealityHeading}>
								<span className={styles.eyebrow}>03 / REAL-WORLD APPLICATION</span>

								<h3>From concept to reality.</h3>

								<p>One of the most rewarding moments of my internship was seeing my illustration come to life. My Rahu design was printed and used at the 10th Global Moon Village Workshop & Symposium 2026 in Bangkok, Thailand.</p>

								<p>From event decorations and entrance displays to merchandise, it was exciting to see my work become part of a real international space event.</p>
							</div>

							{/* REAL EVENT PHOTOS */}

							<div className={styles.logoRealityGallery}>
								<figure className={styles.realityWide}>
									<img src={`${BASE}/IMG_8747.png`} alt="Event display featuring my Rahu illustration at the 10th Global Moon Village Workshop and Symposium" loading="lazy" />
									<figcaption>EVENT BRANDING & DISPLAY</figcaption>
								</figure>

								<figure>
									<img src={`${BASE}/IMG_8746.png`} alt="Printed Rahu illustration incorporated into the event's floral installation" loading="lazy" />
									<figcaption>PRINTED ILLUSTRATION</figcaption>
								</figure>

								<figure>
									<img src={`${BASE}/IMG_8750.png`} alt="Rahu illustration displayed above the entrance to the international symposium" loading="lazy" />
									<figcaption>EVENT ENTRANCE</figcaption>
								</figure>

								<figure className={styles.realityMerchandise}>
									<img src={`${BASE}/IMG_8745.png`} alt="White reusable water bottle printed with my Rahu illustration" loading="lazy" />
									<figcaption>EVENT MERCHANDISE</figcaption>
								</figure>
							</div>

							{/* EXTERNAL ARTICLE */}

							<a href="https://www.linkedin.com/pulse/thailand-takes-centre-stage-aseans-space-hub-hosting-landmark-global-xzhtc/" target="_blank" rel="noopener noreferrer" className={styles.logoRealityLink}>
								<span>READ GISTDA'S EVENT ARTICLE</span>
								<span aria-hidden="true">↗</span>
							</a>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
