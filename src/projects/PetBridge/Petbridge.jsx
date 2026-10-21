import ScrollHighlight from "../../components/DarkProject/shared/ScrollHighlight";
import darkStyles from "../../components/DarkProject/DarkProject.module.css";

import styles from "./PetBridge.module.css";

const BASE = "/images/petbridge";

/*
  Save your images in public/images/petbridge/

  wireframe-01.png
  wireframe-02.png
  final-phones.png

  When your demo is ready:
  - save it as petbridge-demo.mp4
  - replace null with `${BASE}/petbridge-demo.mp4`
*/

const DEMO_VIDEO = `${BASE}/petbridge-demo.mov`;
const WIREFRAMES = [
	{
		src: `${BASE}/wireframe-01.png`,
		label: "01 / ANIMAL DISCOVERY",
	},
	{
		src: `${BASE}/wireframe-02.png`,
		label: "02 / ANIMAL DETAILS",
	},
];

function setChapter(chaptersRef, index, element) {
	if (chaptersRef?.current) {
		chaptersRef.current[index] = element;
	}
}

function ProjectText({ id, as = "p", className, revealedWords, text }) {
	return <ScrollHighlight id={id} as={as} className={className} styles={darkStyles} revealedWords={revealedWords} text={text} />;
}

export default function PetBridge({ chaptersRef, revealedWords = {} }) {
	return (
		<div className={styles.project}>
			{/* =====================================
          01 — INTRO
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 0, element)} id="petbridge-intro" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>01 / INTRO</span>

					<ProjectText id="petbridge-intro-title" as="h2" className={styles.introTitle} revealedWords={revealedWords} text="A little closer to finding a forever home." />

					<ProjectText
						id="petbridge-intro-description"
						className={styles.introDescription}
						revealedWords={revealedWords}
						text="For my iOS development course, I designed and built PetBridge, an iPhone app that helps people discover animals available for adoption. The goal was to make finding and connecting with animals and shelters simple and approachable."
					/>

					<div className={styles.projectDetails}>
						<span>IOS DEVELOPMENT</span>
						<span>UI DESIGN</span>
						<span>MOBILE APP</span>
					</div>

					<div className={styles.introDecoration}>
						<span>DESIGNED WITH CARE</span>
						<div className={styles.introLine} />
						<span>2025</span>
					</div>
				</div>
			</section>

			{/* =====================================
          02 — WIREFRAME
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 1, element)} id="petbridge-wireframe" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>02 / WIREFRAME</span>

					<ProjectText id="petbridge-wireframe-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="Making every interaction feel simple." />

					<ProjectText
						id="petbridge-wireframe-description"
						className={styles.sectionDescription}
						revealedWords={revealedWords}
						text="I explored how users could browse animals, find relevant information and move naturally between different screens. The wireframes helped define a clear and intuitive mobile experience."
					/>

					<div className={styles.wireframeGrid}>
						{WIREFRAMES.map((wireframe) => (
							<figure key={wireframe.src} className={styles.wireframeItem}>
								<div className={styles.wireframeImage}>
									<img src={wireframe.src} alt={wireframe.label} loading="lazy" />
								</div>

								<figcaption>{wireframe.label}</figcaption>
							</figure>
						))}
					</div>
				</div>
			</section>

			{/* =====================================
          03 — FINAL
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 2, element)} id="petbridge-final" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>03 / FINAL</span>

					<ProjectText id="petbridge-final-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="A friendly experience, built for animal lovers." />

					<ProjectText
						id="petbridge-final-description"
						className={styles.sectionDescription}
						revealedWords={revealedWords}
						text="The final design combines soft colours, playful details and clear navigation to make discovering animals and their stories feel personal and accessible."
					/>

					<figure className={styles.finalShowcase}>
						<img src={`${BASE}/final-phones.png`} alt="PetBridge final iOS app designs shown on five iPhone mockups" loading="lazy" />

						<figcaption>PETBRIDGE / FINAL INTERFACE DESIGN</figcaption>
					</figure>
				</div>
			</section>

			{/* =====================================
          04 — DEMO
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 3, element)} id="petbridge-demo" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>04 / DEMO</span>

					<ProjectText id="petbridge-demo-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="See PetBridge in action." />

					<ProjectText id="petbridge-demo-description" className={styles.sectionDescription} revealedWords={revealedWords} text="A closer look at how the app works, from browsing animals to exploring their profiles." />

					<div className={styles.demoArea}>
						{DEMO_VIDEO ? (
							<video className={styles.demoVideo} controls playsInline preload="metadata">
								<source src={DEMO_VIDEO} type="video/quicktime" />
							</video>
						) : (
							<div className={styles.demoPlaceholder}>
								<div className={styles.demoPlayIcon}>
									<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
										<path d="M8 5.5v13l10-6.5z" />
									</svg>
								</div>

								<span>APP WALKTHROUGH</span>

								<p>Demo video coming soon.</p>
							</div>
						)}
					</div>

					<div className={styles.projectEnding}>
						<span>END OF RECORD 03</span>
						<div className={styles.endingLine} />
						<span>MADE WITH CARE</span>
					</div>
				</div>
			</section>
		</div>
	);
}
