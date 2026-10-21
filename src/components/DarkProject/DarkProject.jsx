import { useEffect, useRef, useState } from "react";
import styles from "./DarkProject.module.css";

/* =====================================
   PROJECT DATA
===================================== */

const CHAPTERS = ["Research", "Wireframes", "Testing", "Final"];

const MARKER_ANGLES = [-55, -18, 18, 55];

const BASE = "/images/projects";

const MAGAZINE_PDF = "/images/projects/het-mandje/het-mandje-magazine.pdf";

const BRUZZ_URL = "https://www.bruzz.be/videoreeks/said-city/video-nieuwe-apps-en-vr-games-de-techstudenten-van-erasmus-stellen-hun-creaties-tentoon#t=253";

const ANIMALS = {
	cats: {
		label: "cats",
		inflow: 26134,
		outflow: 24385,
	},
	dogs: {
		label: "dogs",
		inflow: 7882,
		outflow: 7675,
	},
};

/* =====================================
   WIREFRAMES
===================================== */

const WIREFRAMES = [
	{
		src: `${BASE}/home.png`,
		category: "01 / HOMEPAGE",
		label: "First impression",
	},
	{
		src: `${BASE}/Dieren zoeken-UPSCALE.png`,
		category: "02 / FOSTER FAMILIES",
		label: "Discover animals",
	},
	{
		src: `${BASE}/Dieren zoeken-1-UPSCALE.png`,
		category: "03 / FOSTER FAMILIES",
		label: "Search and filter",
	},
	{
		src: `${BASE}/Asiel-UPSCALE.png`,
		category: "04 / ANIMAL SHELTERS",
		label: "Dashboard overview",
	},
];

/* =====================================
   FINAL MOCKUPS
===================================== */

const MOCKUPS = [
	{
		src: `${BASE}/mockup2.png`,
		category: "01 / HOMEPAGE",
		label: "First impressions",
		className: "mockupMain",
	},
	{
		src: `${BASE}/mockup3.png`,
		category: "02 / ANIMAL DISCOVERY",
		label: "Foster families",
		className: "mockupTop",
	},
	{
		src: `${BASE}/home mockup final.png`,
		category: "03 / VETERINARIAN DASHBOARD",
		label: "Medical care",
		className: "mockupBottom",
	},
];



/* =====================================
   HELPERS
===================================== */

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const smoothstep = (value) => {
	const t = clamp(value);
	return t * t * (3 - 2 * t);
};

function markerPosition(angle) {
	const radians = (angle * Math.PI) / 180;

	return {
		"--marker-x": `${50 + Math.cos(radians) * 47}%`,
		"--marker-y": `${50 + Math.sin(radians) * 47}%`,
	};
}

function getScrollBehavior() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/* =====================================
   SPOTIFY LYRICS
===================================== */

function ScrollHighlight({ id, as: Tag = "p", text, className = "", revealedWords }) {
	const tokens = text.match(/\S+|\s+/g) || [];
	const revealedCount = revealedWords[id] || 0;

	let wordIndex = 0;

	return (
		<Tag data-lyric-block={id} className={`${styles.scrollHighlight} ${className}`}>
			{tokens.map((token, index) => {
				if (/^\s+$/.test(token)) {
					return token;
				}

				const current = wordIndex++;
				const isRead = current < revealedCount;

				return (
					<span key={index} data-lyric-word={current} className={`${styles.lyricWord} ${isRead ? styles.lyricWordActive : ""}`}>
						{token}
					</span>
				);
			})}
		</Tag>
	);
}

/* =====================================
   ANIMATED STATISTICS
===================================== */

function AnimatedNumber({ value, active, delay = 0, duration = 1450 }) {
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		if (!active) return;

		let frame;
		let startTime;

		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (reducedMotion) return;

		function animate(time) {
			if (startTime === undefined) {
				startTime = time;
			}

			const progress = clamp((time - startTime - delay) / duration);

			const eased = 1 - Math.pow(1 - progress, 3);

			setDisplay(Math.round(value * eased));

			if (progress < 1) {
				frame = requestAnimationFrame(animate);
			}
		}

		frame = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(frame);
	}, [value, active, delay, duration]);

	const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const number = active ? (reducedMotion ? value : display) : 0;

	return number.toLocaleString("nl-BE");
}

/* =====================================
   REUSABLE CHAPTER HEADING
===================================== */

function SectionTitle({ eyebrow, title, description, prefix, revealedWords, className = "" }) {
	return (
		<header className={className}>
			<span className={styles.eyebrow}>{eyebrow}</span>

			<ScrollHighlight id={`${prefix}-title`} as="h2" text={title} revealedWords={revealedWords} />

			<ScrollHighlight id={`${prefix}-description`} text={description} revealedWords={revealedWords} />
		</header>
	);
}

/* =====================================
   MAIN COMPONENT
===================================== */

export default function DarkProject({ project }) {
	const worldRef = useRef(null);
	const stickyRef = useRef(null);
	const chaptersRef = useRef([]);
	const statsRef = useRef(null);
	const dragRef = useRef(null);

	const [transition, setTransition] = useState(0);
	const [rotation, setRotation] = useState(0);

	const [activeChapter, setActiveChapter] = useState(0);

	const [progress, setProgress] = useState(0);

	const [revealedWords, setRevealedWords] = useState({});

	const [animal, setAnimal] = useState("cats");
	const [statsVisible, setStatsVisible] = useState(false);

	const stats = ANIMALS[animal];

	const difference = stats.inflow - stats.outflow;

	const outflowRatio = (stats.outflow / stats.inflow) * 100;

	const projectColor = project?.color || "#8DB5A9";

	/* =====================================
     SCROLL SYNCHRONIZATION
  ===================================== */

	useEffect(() => {
		let frame = null;

		function update() {
			frame = null;

			const world = worldRef.current;
			if (!world) return;

			const viewport = window.innerHeight;

			const inside = Math.max(0, -world.getBoundingClientRect().top);

			/* DARK WORLD ENTRANCE */

			setTransition(smoothstep(inside / viewport));

			/* CD ROTATION */

			setRotation(inside * 0.16);

			/* SUBTLE BACKGROUND SCROLL MOVEMENT */

			if (stickyRef.current) {
				stickyRef.current.style.setProperty("--background-shift", `${Math.sin(inside * 0.001) * 65}px`);
			}

			/* =================================
         ACTIVE CHAPTER
      ================================= */

			const readingLine = viewport * 0.48;

			const positions = chaptersRef.current.map((element) => element?.getBoundingClientRect().top ?? Infinity);

			let current = 0;

			positions.forEach((top, index) => {
				if (top <= readingLine) {
					current = index;
				}
			});

			setActiveChapter(current);

			/* =================================
         CONTINUOUS CD PROGRESS
      ================================= */

			if (current === CHAPTERS.length - 1) {
				setProgress(1);
			} else {
				const start = positions[current];
				const end = positions[current + 1];

				const distance = Math.max(1, end - start);

				const chapterProgress = clamp((readingLine - start) / distance);

				const totalProgress = clamp((current + chapterProgress) / (CHAPTERS.length - 1));

				setProgress(totalProgress);
			}

			/* =================================
         SPOTIFY LYRICS
      ================================= */

			const blocks = Array.from(world.querySelectorAll("[data-lyric-block]"));

			const lyricLine = viewport * 0.72;
			const nextRevealed = {};

		
blocks.forEach((block) => {
  const rect = block.getBoundingClientRect();

  const totalWords = block.querySelectorAll(
    "[data-lyric-word]"
  ).length;

  const isQuote = block.dataset.lyricBlock === "reality-quote";

  // Start highlighting when the text enters the lower
  // part of the screen, and finish while still visible.
  const startLine = viewport * (isQuote ? 0.85 : 0.8);
  const finishLine = viewport * (isQuote ? 0.38 : 0.3);

  // Track the text block itself, NOT the next text block.
  const distance = Math.max(
    1,
    startLine - finishLine + rect.height * 0.35
  );

  const progress = clamp(
    (startLine - rect.top) / distance
  );

  nextRevealed[block.dataset.lyricBlock] =
    Math.min(totalWords, Math.ceil(progress * totalWords));
});


			setRevealedWords((previous) => {
				const unchanged = blocks.every((block) => {
					const id = block.dataset.lyricBlock;

					return previous[id] === nextRevealed[id];
				});

				return unchanged ? previous : nextRevealed;
			});
		}

		function scheduleUpdate() {
			if (frame !== null) return;

			frame = requestAnimationFrame(update);
		}

		update();

		window.addEventListener("scroll", scheduleUpdate, { passive: true });

		window.addEventListener("resize", scheduleUpdate);

		return () => {
			window.removeEventListener("scroll", scheduleUpdate);

			window.removeEventListener("resize", scheduleUpdate);

			if (frame !== null) {
				cancelAnimationFrame(frame);
			}
		};
	}, []);

	/* =====================================
     REPLAY NUMBER ANIMATIONS
  ===================================== */

	useEffect(() => {
		const element = statsRef.current;

		if (!element) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setStatsVisible(entry.isIntersecting);
			},
			{
				threshold: 0.15,
			},
		);

		observer.observe(element);

		return () => observer.disconnect();
	}, []);

	/* =====================================
     INTERACTIVE MOUSE BACKGROUND
  ===================================== */

	function handleBackgroundMove(event) {
		if (event.pointerType !== "mouse" || !stickyRef.current) {
			return;
		}

		const rect = stickyRef.current.getBoundingClientRect();

		stickyRef.current.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);

		stickyRef.current.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
	}

	/* =====================================
     CHAPTER NAVIGATION
  ===================================== */

	function goToChapter(index) {
		const target = clamp(index, 0, CHAPTERS.length - 1);

		chaptersRef.current[target]?.scrollIntoView({
			behavior: getScrollBehavior(),
			block: "start",
		});
	}

	/* =====================================
     DRAG THE CD
  ===================================== */

	function handleDiscDown(event) {
		if (event.button !== 0) return;

		dragRef.current = {
			x: event.clientX,
			y: event.clientY,
			chapter: activeChapter,
		};

		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function handleDiscUp(event) {
		const drag = dragRef.current;
		dragRef.current = null;

		if (!drag) return;

		const dx = event.clientX - drag.x;
		const dy = event.clientY - drag.y;

		if (Math.hypot(dx, dy) < 30) return;

		const direction = Math.abs(dy) > Math.abs(dx) ? Math.sign(dy) : Math.sign(dx);

		goToChapter(drag.chapter + direction);
	}

	/* =====================================
     RENDER
  ===================================== */

	return (
		<section
			ref={worldRef}
			className={styles.world}
			id={project?.slug ? `project-${project.slug}` : "het-mandje"}
			onPointerMove={handleBackgroundMove}
			style={{
				"--project-color": projectColor,
				"--reveal": `${transition * 100}%`,
				"--transition": transition,
				"--disc-rotation": `${rotation}deg`,
			}}
		>
			{/* =================================
          STICKY CD NAVIGATION
      ================================= */}

			<div ref={stickyRef} className={styles.stickyWorld}>
				{/* MOUSE-FOLLOWING GLOW */}

				<div className={styles.ambientGlow} aria-hidden="true" />

				{/* CD ENTERS FROM THE RIGHT */}

				<div
					className={styles.vinylEntrance}
					style={{
						opacity: clamp(transition * 3),
						transform: `
              translateX(${(1 - transition) * 125}vw)
              scale(${0.78 + transition * 0.22})
            `,
					}}
				>
					<div className={styles.vinylShell}>
						{/* ROTATING DISC */}

						<div
							className={styles.vinyl}
							role="group"
							aria-label="Drag the record to change chapter"
							onPointerDown={handleDiscDown}
							onPointerUp={handleDiscUp}
							onPointerCancel={() => {
								dragRef.current = null;
							}}
						>
							<div className={styles.vinylGrooves} />

							<div className={styles.vinylLabel}>
								{project?.image && <img src={project.image} alt="" draggable="false" />}

								<span className={styles.vinylHole} />
							</div>
						</div>

						{/* CURVED CHAPTER NAVIGATION */}

						<nav
							className={styles.chapterMarkers}
							aria-label="Project chapters"
							style={{
								opacity: clamp((transition - 0.6) / 0.4),
								pointerEvents: transition > 0.9 ? "auto" : "none",
							}}
						>
							<svg className={styles.progressRing} viewBox="0 0 100 100" aria-hidden="true">
								<path className={styles.progressTrack} d="M 75.6 10.6 A 47 47 0 0 1 75.6 89.4" pathLength="100" />

								<path
									className={styles.progressFill}
									d="M 75.6 10.6 A 47 47 0 0 1 75.6 89.4"
									pathLength="100"
									style={{
										strokeDasharray: `${progress * 100} 100`,
									}}
								/>
							</svg>

							{CHAPTERS.map((chapter, index) => (
								<button
									key={chapter}
									type="button"
									className={`${styles.marker} ${activeChapter === index ? styles.markerActive : ""}`}
									style={markerPosition(MARKER_ANGLES[index])}
									aria-current={activeChapter === index ? "step" : undefined}
									onClick={() => goToChapter(index)}
								>
									<span className={styles.markerDot} />

									<span className={styles.markerText}>{chapter}</span>
								</button>
							))}
						</nav>
					</div>
				</div>

				{/* PROJECT NAME */}

				<div
					className={styles.projectIdentity}
					style={{
						opacity: clamp((transition - 0.7) / 0.3),
					}}
				>
					FINAL WORK — {project?.title}
				</div>
			</div>

			{/* =================================
          SCROLLABLE PROJECT STORY
      ================================= */}

			<div className={styles.scrollContent}>
				<div className={styles.transitionSpace} aria-hidden="true" />

				{/* =================================
            01 — RESEARCH
        ================================= */}

				<article
					ref={(element) => {
						chaptersRef.current[0] = element;
					}}
					className={styles.chapter}
					id="project-research"
				>
					<div className={styles.chapterContent}>
						{/* HERO */}

						<header className={styles.researchHero}>
							<span className={styles.eyebrow}>01 / RESEARCH</span>

							<div className={styles.heroImage}>
								<img src={`${BASE}/sleutelbeeldcompress.png`} alt="Cat resting in a basket — Het Mandje" />
							</div>

							<ScrollHighlight id="research-title" as="h2" className={styles.heroTitle} revealedWords={revealedWords} text={"Every animal deserves\na safe place."} />

							<ScrollHighlight id="research-question" className={styles.heroQuestion} revealedWords={revealedWords} text="But what happens when animal shelters run out of space?" />
						</header>

						{/* STATISTICS */}

						<section ref={statsRef} className={styles.researchBlock}>
							<span className={styles.eyebrow}>THE NUMBERS / FLANDERS 2022</span>

							<ScrollHighlight id="numbers-title" as="h3" className={styles.impactTitle} revealedWords={revealedWords} text="More animals entered shelters than left." />

							<ScrollHighlight id="numbers-desc" className={styles.supportText} revealedWords={revealedWords} text="Explore the recorded intake and outflow of cats and dogs." />

							{/* CAT / DOG SWITCH */}

							<div className={styles.animalSwitch} role="group" aria-label="Choose animal type">
								{Object.keys(ANIMALS).map((type) => (
									<button key={type} type="button" className={animal === type ? styles.switchActive : ""} onClick={() => setAnimal(type)} aria-pressed={animal === type}>
										{type === "cats" ? "Cats" : "Dogs"}
									</button>
								))}
							</div>

							{/* ANIMATED STATS */}

							<div className={styles.impactGrid}>
								<div className={styles.impactCard}>
									<span className={styles.impactLabel}>ENTERED SHELTERS ↘</span>

									<strong className={styles.impactNumber}>
										<AnimatedNumber value={stats.inflow} active={statsVisible} />
									</strong>

									<div className={styles.impactBarWrap}>
										<div
											className={`${styles.impactBar} ${styles.impactBarIn}`}
											style={{
												height: statsVisible ? "100%" : "0%",
											}}
										/>
									</div>

									<p className={styles.impactCaption}>Recorded intake of {stats.label} in 2022.</p>
								</div>

								<div className={styles.impactCard}>
									<span className={styles.impactLabel}>LEFT SHELTERS ↗</span>

									<strong className={styles.impactNumber}>
										<AnimatedNumber value={stats.outflow} active={statsVisible} delay={250} />
									</strong>

									<div className={styles.impactBarWrap}>
										<div
											className={`${styles.impactBar} ${styles.impactBarOut}`}
											style={{
												height: statsVisible ? `${outflowRatio}%` : "0%",
											}}
										/>
									</div>

									<p className={styles.impactCaption}>Recorded outflow of {stats.label} in 2022.</p>
								</div>
							</div>

							{/* DIFFERENCE */}

							<div className={styles.impactDifference}>
								<span className={styles.differenceLabel}>THE DIFFERENCE</span>

								<strong className={styles.differenceValue}>
									+
									<AnimatedNumber value={difference} active={statsVisible} delay={650} />
								</strong>

								<p className={styles.differenceText}>More {stats.label} entered shelters than left in 2022.</p>
							</div>

							<p className={styles.sourceNote}>Source: Dierenwelzijn Vlaanderen (2022). Annual intake and outflow totals; not a measure of shelter occupancy.</p>
						</section>

						{/* THE REALITY */}

						<section className={styles.researchBlock}>
							<span className={styles.eyebrow}>THE REALITY</span>

							<ScrollHighlight id="reality-quote" as="blockquote" className={styles.bigQuote} revealedWords={revealedWords} text="“Wij zitten altijd over onze capaciteit.”" />

							<p className={styles.quoteSource}>Bram Willems — Dierenbescherming Mechelen, as cited in the project magazine</p>

							<figure className={styles.shelterFigure}>
								<img src={`${BASE}/dierenasiel.webp`} alt="Two dogs behind the bars of an animal shelter kennel" loading="lazy" />
							</figure>

							<ScrollHighlight
								id="reality-description"
								className={styles.supportText}
								revealedWords={revealedWords}
								text="Overcrowding was not just something I encountered through desk research. During my internship at Dierenbescherming Mechelen, I experienced the challenges of animal care and limited capacity first-hand."
							/>
						</section>
					</div>
				</article>

				{/* =================================
            02 — WIREFRAMES
        ================================= */}

				<article
					ref={(element) => {
						chaptersRef.current[1] = element;
					}}
					className={`${styles.chapter} ${styles.wireframeChapter}`}
					id="project-wireframes"
				>
					<div className={styles.chapterContent}>
						<SectionTitle
							eyebrow="02 / WIREFRAMES"
							title={"One platform.\nThree different users."}
							description="Designing intuitive experiences for foster families, animal shelters and veterinarians."
							prefix="wireframes"
							revealedWords={revealedWords}
							className={styles.wireframeHeader}
						/>

						{WIREFRAMES.map((item) => (
							<figure className={styles.wireframeFigure} key={item.src}>
								<div className={styles.wireframeImage}>
									<img src={item.src} alt={`${item.label} — Het Mandje wireframe`} loading="lazy" />
								</div>

								<figcaption className={styles.wireframeCaption}>
									<span>{item.category}</span>
									<span>{item.label}</span>
								</figcaption>
							</figure>
						))}
					</div>
				</article>

				
{/* =================================
    03 — TESTING & DEVELOPMENT
================================= */}

<article
  ref={(element) => {
    chaptersRef.current[2] = element;
  }}
  className={styles.chapter}
  id="project-testing"
>
  <div className={styles.chapterContent}>

    <header className={styles.chapterHeading}>
      <span className={styles.eyebrow}>
        03 / TESTING & DEVELOPMENT
      </span>

      <ScrollHighlight
        id="testing-title"
        as="h2"
        revealedWords={revealedWords}
        text={"From wireframe\nto working platform."}
      />

      <ScrollHighlight
        id="testing-description"
        revealedWords={revealedWords}
        text="Turning designs into functional experiences meant testing more than just the interface. I explored how features, data and different user roles work together."
      />
    </header>

    {/* =================================
        BEFORE / AFTER — INTERACTIVE MAP
    ================================= */}

    <section className={styles.testingComparison}>
      <div className={styles.testingSectionMeta}>
        <span>01 / FROM DESIGN TO CODE</span>
        <span>INTERACTIVE MAP</span>
      </div>

      <div className={styles.testingComparisonGrid}>
        <figure className={styles.testingCompareItem}>
          <div className={styles.testingImageFrame}>
            <img
              src="/images/projects/Dieren_zoeken-3.png"
              alt="Initial wireframe of the animal discovery map"
              loading="lazy"
            />
          </div>

          <figcaption>
            <span>01 — WIREFRAME</span>
            <span>Exploring the structure</span>
          </figcaption>
        </figure>

        <figure className={styles.testingCompareItem}>
          <div className={styles.testingImageFrame}>
            <img
              src="/images/projects/interactive_map.png"
              alt="Developed interactive animal discovery map"
              loading="lazy"
            />
          </div>

          <figcaption>
            <span>02 — DEVELOPMENT</span>
            <span>Bringing the map to life</span>
          </figcaption>
        </figure>
      </div>

      <ScrollHighlight
        id="testing-map-description"
        className={styles.supportText}
        revealedWords={revealedWords}
        text="The initial wireframe became an interactive map where users can explore animal shelters and discover animals by location. Building the feature helped me translate a visual concept into a functional user experience."
      />
    </section>

    {/* =================================
        FEATURE TESTING
    ================================= */}

    <section className={styles.testingFeatures}>
      <div className={styles.testingSectionMeta}>
        <span>02 / FUNCTIONAL TESTING</span>
        <span>THREE CONNECTED ROLES</span>
      </div>

      <ScrollHighlight
        id="testing-features-title"
        as="h3"
        className={styles.impactTitle}
        revealedWords={revealedWords}
        text="Making the experience work."
      />

      <ScrollHighlight
        id="testing-features-intro"
        className={styles.supportText}
        revealedWords={revealedWords}
        text="I tested the platform from the perspectives of foster families, animal shelters and veterinarians, focusing on the interactions and information shared between them."
      />

      <div className={styles.testingFeatureGrid}>

        {/* APPLICATION FLOW */}

        <figure className={styles.testingFeatureCard}>
          <div className={styles.testingFeatureImage}>
            <img
              src="/images/projects/aanvraag.png"
              alt="Animal shelter reviewing a foster care application"
              loading="lazy"
            />
          </div>

          <figcaption>
            <span>01 / APPLICATION FLOW</span>
            <h4>From request to approval.</h4>
            <p>
              Testing how foster care applications
              are received, reviewed and approved
              by animal shelters.
            </p>
          </figcaption>
        </figure>

        {/* ANIMAL DOSSIER */}

        <figure className={styles.testingFeatureCard}>
          <div className={styles.testingFeatureImage}>
            <img
              src="/images/projects/dossier.png"
              alt="Animal dossier with health and care information"
              loading="lazy"
            />
          </div>

          <figcaption>
            <span>02 / ANIMAL DOSSIER</span>
            <h4>One place for every detail.</h4>
            <p>
              Organising animal information,
              medical records and appointments
              in a clear and accessible layout.
            </p>
          </figcaption>
        </figure>

        {/* TASK MANAGEMENT */}

        <figure
          className={`${styles.testingFeatureCard} ${styles.testingFeatureWide}`}
        >
          <div className={styles.testingFeatureImage}>
            <img
              src="/images/projects/task.png"
              alt="Veterinarian task creation interface"
              loading="lazy"
            />
          </div>

          <figcaption>
            <span>03 / TASK MANAGEMENT</span>
            <h4>Keeping care organised.</h4>
            <p>
              Testing how veterinarians can create
              tasks, connect them to animals and
              keep track of important care activities.
            </p>
          </figcaption>
        </figure>
      </div>
    </section>

    {/* =================================
        REFLECTION
    ================================= */}

    <section className={styles.testingReflection}>
      <span className={styles.eyebrow}>
        WHAT I LEARNED
      </span>

      <ScrollHighlight
        id="testing-reflection"
        as="h3"
        revealedWords={revealedWords}
        text="A design is only truly tested when people can use it."
      />

      <ScrollHighlight
        id="testing-reflection-description"
        revealedWords={revealedWords}
        text="Working across three connected user roles taught me to look beyond individual screens. Every interaction needed to make sense within the larger system, from applications and medical updates to appointments and tasks."
      />
    </section>

  </div>
</article>


				{/* =================================
            04 — FINAL
        ================================= */}

				<article
					ref={(element) => {
						chaptersRef.current[3] = element;
					}}
					className={`${styles.chapter} ${styles.finalChapter}`}
					id="project-final"
				>
					<div className={styles.chapterContent}>
						<SectionTitle
							eyebrow="04 / FINAL RESULT"
							title={"From concept\nto reality."}
							description="Het Mandje brings animal shelters, foster families and veterinarians together in one digital platform."
							prefix="final"
							revealedWords={revealedWords}
							className={styles.finalHeader}
						/>

						{/* THREE LAPTOP MOCKUPS */}

						<section className={styles.finalShowcase} aria-label="Final platform designs">
							<div className={styles.finalShowcaseHeading}>
								<span>THE FINAL EXPERIENCE</span>
								<span>01 — 03 / HET MANDJE</span>
							</div>

							<div className={styles.mockupCollage}>
								{MOCKUPS.map((item) => (
									<figure key={item.src} className={`${styles.mockupItem} ${styles[item.className]}`}>
										<img src={item.src} alt={`${item.label} laptop mockup`} loading="lazy" />

										<figcaption>
											<span>{item.category}</span>
											<span>{item.label}</span>
										</figcaption>
									</figure>
								))}
							</div>
						</section>

						{/* BRUZZ FEATURE */}

						<section className={styles.bruzzSection}>
							<span className={styles.eyebrow}>FEATURED ON BRUZZ</span>

							<ScrollHighlight id="final-bruzz-title" as="h3" text="A story worth sharing." revealedWords={revealedWords} />

							<ScrollHighlight id="final-bruzz-description" text="At the Erasmus Shift Festival, I presented Het Mandje and shared the story behind my graduation project in a BRUZZ interview." revealedWords={revealedWords} />

							<a href={BRUZZ_URL} className={styles.bruzzFeatureCard} target="_blank" rel="noopener noreferrer" aria-label="Open BRUZZ coverage and interview">
								<div className={styles.bruzzImageWrap}>
									<img src={`${BASE}/bruzz-feature.png`} alt="BRUZZ article and video featuring Het Mandje" loading="lazy" />

									<span className={styles.bruzzImageLabel}>BRUZZ / 2026</span>
								</div>

								<div className={styles.bruzzFeatureFooter}>
									<div className={styles.bruzzFeatureText}>
										<span>PRESS FEATURE</span>

										<strong>Read &amp; watch the story</strong>

										<p>Read the full article and watch the interview. My part starts at 04:13.</p>
									</div>

									<span className={styles.bruzzFeatureArrow} aria-hidden="true">
										↗
									</span>
								</div>
							</a>
						</section>

						{/* DIGITAL MAGAZINE */}

						<section className={styles.magazineSection}>
							<span className={styles.eyebrow}>THE COMPLETE PROCESS</span>

							<div className={styles.magazineCard}>
								<div className={styles.magazineCover}>
									<img src={`${BASE}/magazine-cover.png`} alt="Cover of Het Mandje magazine" loading="lazy" />
								</div>

								<div className={styles.magazineInfo}>
									<span className={styles.magazineLabel}>GRADUATION PROJECT / DIGITAL MAGAZINE</span>

									<ScrollHighlight id="final-magazine-title" as="h3" text="Curious about the process?" revealedWords={revealedWords} />

									<p>Go beyond the final designs. Explore the research, user personas, wireframes, technical decisions and testing behind Het Mandje.</p>

									<div className={styles.magazineActions}>
										<a className={styles.magazineRead} href={MAGAZINE_PDF} target="_blank" rel="noopener noreferrer">
											<span>↗</span>
											Read magazine
										</a>

										<a className={styles.magazineDownload} href={MAGAZINE_PDF} download="Het-Mandje-Magazine.pdf">
											<span>↓</span>
											Download PDF
										</a>
									</div>
								</div>
							</div>
						</section>
					</div>
				</article>
			</div>
		</section>
	);
}
