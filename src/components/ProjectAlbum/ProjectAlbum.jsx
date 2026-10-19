import { useEffect, useRef, useState } from "react";

import styles from "./ProjectAlbum.module.css";

const CHAPTERS = [
	{
		id: "introduction",
		title: "Introduction",
		subtitle: "The story behind the project",
		lines: [
			{
				title: "The problem",
				text: "Animal shelters often struggle with overcrowding.",
				visual: "The problem",
				description: "Understanding the challenge",
				imageKey: "problem",
			},
			{
				title: "The opportunity",
				text: "Temporary foster care can give animals a safer place to stay.",
				visual: "Temporary foster care",
				description: "A place to recover and feel safe",
				imageKey: "foster",
			},
			{
				title: "The idea",
				text: "That's why I created Het Mandje, a platform connecting shelters, foster families and veterinarians.",
				visual: "Het Mandje",
				description: "One connected digital platform",
				imageKey: "overview",
			},
		],
	},
	{
		id: "research",
		title: "Research",
		subtitle: "Listening to real users",
		lines: [
			{
				title: "User research",
				text: "I explored the needs of shelters, foster families and veterinarians.",
				visual: "Research",
				description: "Understanding different user groups",
				imageKey: "research",
			},
			{
				title: "Key insights",
				text: "Interviews revealed the challenges people face when coordinating temporary animal care.",
				visual: "Key insights",
				description: "What I learned from users",
				imageKey: "insights",
			},
			{
				title: "User journeys",
				text: "I translated these findings into personas, journey maps and clear design requirements.",
				visual: "User journeys",
				description: "Turning research into direction",
				imageKey: "journey",
			},
		],
	},
	{
		id: "design",
		title: "Design",
		subtitle: "From insight to interface",
		lines: [
			{
				title: "User flows",
				text: "I mapped out the journeys that each user group needed to complete.",
				visual: "User flows",
				description: "Structuring the experience",
				imageKey: "flows",
			},
			{
				title: "Wireframes",
				text: "Low-fidelity wireframes helped me explore different layouts and interactions.",
				visual: "Wireframes",
				description: "Building the foundation",
				imageKey: "wireframes",
			},
			{
				title: "UI design",
				text: "I refined the visual design into a clear, consistent and user-friendly interface.",
				visual: "Final UI",
				description: "Bringing the platform to life",
				imageKey: "ui",
			},
		],
	},
	{
		id: "result",
		title: "Final Result",
		subtitle: "The finished platform",
		lines: [
			{
				title: "The platform",
				text: "Het Mandje brings animal shelters, foster families and veterinarians together.",
				visual: "Final platform",
				description: "A connected experience",
				imageKey: "final",
			},
			{
				title: "Key features",
				text: "The platform supports animal management, foster applications and coordinated care.",
				visual: "Key features",
				description: "Designed around real workflows",
				imageKey: "features",
			},
			{
				title: "Reflection",
				text: "From UX research to development, I transformed a real social challenge into a working digital product.",
				visual: "Reflection",
				description: "What I created and learned",
				imageKey: "reflection",
			},
		],
	},
];

const STEPS = CHAPTERS.flatMap((chapter, chapterIndex) =>
	chapter.lines.map((line, lineIndex) => ({
		...line,
		chapterId: chapter.id,
		chapterTitle: chapter.title,
		chapterIndex,
		lineIndex,
	})),
);

export default function ProjectAlbum({ project, active = false }) {
	const lyricsRef = useRef(null);
	const stepRefs = useRef([]);
	const discRef = useRef(null);

	const [activeStep, setActiveStep] = useState(0);
	const [autoPlay, setAutoPlay] = useState(false);
	const [discPlaying, setDiscPlaying] = useState(true);
	const [shareMessage, setShareMessage] = useState("");

	const step = STEPS[activeStep];
	const chapterIndex = step.chapterIndex;

	const color = project.color || "#9FC5AC";

	const visualImages = project.visuals || {};
	const currentImage = visualImages[step.imageKey] || project.image || null;

	const progress = ((activeStep + 1) / STEPS.length) * 100;

	// Move lyrics to a selected item
	function goToStep(index) {
		const next = Math.max(0, Math.min(STEPS.length - 1, index));

		setActiveStep(next);

		const container = lyricsRef.current;
		const item = stepRefs.current[next];

		if (!container || !item) return;

		const target = item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2;

		container.scrollTo({
			top: Math.max(0, target),
			behavior: "smooth",
		});
	}

	function goToChapter(index) {
		const firstStep = STEPS.findIndex((item) => item.chapterIndex === index);

		if (firstStep >= 0) {
			goToStep(firstStep);
		}
	}

	// When user scrolls lyrics, sync text and image
	function handleLyricsScroll() {
		const container = lyricsRef.current;
		if (!container) return;

		const containerRect = container.getBoundingClientRect();

		const middle = containerRect.top + containerRect.height * 0.48;

		let closestIndex = 0;
		let closestDistance = Infinity;

		stepRefs.current.forEach((item, index) => {
			if (!item) return;

			const rect = item.getBoundingClientRect();
			const center = rect.top + rect.height / 2;

			const distance = Math.abs(center - middle);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		setActiveStep(closestIndex);
	}

	// Optional story autoplay
	useEffect(() => {
		if (!autoPlay || !active) return;

		if (activeStep >= STEPS.length - 1) {
			return;
		}

		const timer = window.setTimeout(() => {
			goToStep(activeStep + 1);
		}, 4200);

		return () => window.clearTimeout(timer);
	}, [autoPlay, activeStep, active]);

	useEffect(() => {
		if (autoPlay && activeStep === STEPS.length - 1) {
			// Defer the reset outside this effect
			// via the playback control when replaying.
			return;
		}
	}, [autoPlay, activeStep]);

	async function handleShare() {
		const url = `${window.location.origin}/#het-mandje`;

		try {
			if (navigator.share) {
				await navigator.share({
					title: project.title,
					text: "Take a look at this project!",
					url,
				});

				return;
			}

			await navigator.clipboard.writeText(url);
			setShareMessage("Link copied!");
		} catch (error) {
			if (error.name !== "AbortError") {
				setShareMessage("Couldn't share link");
			}
		}
	}

	return (
		<div
			className={styles.album}
			style={{
				"--project-color": color,
			}}
		>
			{/* PROJECT HEADER */}

			<header className={styles.albumHeader}>
				<div className={styles.albumCover}>{project.image && <img src={project.image} alt="" draggable="false" />}</div>

				<div className={styles.albumIdentity}>
					<span className={styles.eyebrow}>GRADUATION PROJECT · 2025—2026</span>

					<h1>{project.title}</h1>

					<p>A digital platform connecting animal shelters, foster families and veterinarians for temporary animal care.</p>

					<div className={styles.metadata}>
						<span>UX/UI DESIGN</span>
						<span>RESEARCH</span>
						<span>FULL-STACK</span>
					</div>
				</div>

				{/* MINI DISC PLAYER */}

				<div className={styles.miniPlayer}>
					<div ref={discRef} className={`${styles.miniDisc} ${!discPlaying ? styles.discPaused : ""}`}>
						{project.image && <img src={project.image} alt="" draggable="false" />}

						<span className={styles.miniDiscHole} />
					</div>

					<div className={styles.miniPlayerInfo}>
						<span>NOW VIEWING</span>
						<strong>{step.chapterTitle}</strong>
					</div>

					<button type="button" className={styles.discControl} onClick={() => setDiscPlaying((value) => !value)} aria-label={discPlaying ? "Pause CD animation" : "Play CD animation"} title="Pause or play CD animation">
						{discPlaying ? "Ⅱ" : "▶"}
					</button>
				</div>
			</header>

			{/* ACTION BAR */}

			<div className={styles.actionBar}>
				<div className={styles.actionButtons}>
					<button
						type="button"
						className={styles.primaryPlay}
						onClick={() => {
							if (activeStep === STEPS.length - 1) {
								goToStep(0);
								setAutoPlay(true);
							} else {
								setAutoPlay((value) => !value);
							}
						}}
						aria-label={autoPlay ? "Pause story autoplay" : "Play story autoplay"}
					>
						{autoPlay ? "Ⅱ" : "▶"}
					</button>

					{project.demoUrl && (
						<a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={styles.actionLink}>
							<span>↗</span> Live Demo
						</a>
					)}

					{project.prototypeUrl && (
						<a href={project.prototypeUrl} target="_blank" rel="noopener noreferrer" className={styles.actionLink}>
							Prototype
						</a>
					)}

					{project.caseStudyPdf && (
						<a href={project.caseStudyPdf} download className={styles.actionLink}>
							↓ Download
						</a>
					)}

					<button type="button" className={styles.actionLink} onClick={handleShare}>
						↗ Share
					</button>
				</div>

				<span className={styles.actionStatus}>{shareMessage || `${STEPS.length} STORY MOMENTS`}</span>
			</div>

			{/* SPOTIFY-LIKE CHAPTER BAR */}

			<nav className={styles.chapterBar} aria-label="Project chapters">
				{CHAPTERS.map((chapter, index) => (
					<button key={chapter.id} type="button" onClick={() => goToChapter(index)} className={`${styles.chapterButton} ${chapterIndex === index ? styles.chapterActive : ""}`} aria-current={chapterIndex === index ? "step" : undefined}>
						<span className={styles.chapterNumber}>0{index + 1}</span>

						<span>{chapter.title}</span>
					</button>
				))}
			</nav>

			{/* TWO-COLUMN CONTENT */}

			<div className={styles.contentGrid}>
				{/* LEFT — LYRICS */}
				<section className={styles.lyricsPanel} aria-label="Project story">
					<div className={styles.panelHeading}>
						<div>
							<span className={styles.panelEyebrow}>PROJECT LYRICS</span>
							<h2>{step.chapterTitle}</h2>
						</div>

						<span className={styles.counter}>
							{String(activeStep + 1).padStart(2, "0")}/{String(STEPS.length).padStart(2, "0")}
						</span>
					</div>

					<div ref={lyricsRef} className={styles.lyricsScroll} onScroll={handleLyricsScroll} tabIndex={0} aria-label="Scroll through project story">
						{STEPS.map((item, index) => {
							const firstInChapter = item.lineIndex === 0;

							const isActive = index === activeStep;

							return (
								<div
									key={`${item.chapterId}-${item.lineIndex}`}
									ref={(element) => {
										stepRefs.current[index] = element;
									}}
									className={styles.storyItem}
								>
									{firstInChapter && (
										<div className={styles.storyChapter}>
											TRACK 0{item.chapterIndex + 1}
											<span> — </span>
											{item.chapterTitle}
										</div>
									)}

									<button type="button" className={`${styles.lyric} ${isActive ? styles.lyricActive : ""}`} onClick={() => goToStep(index)}>
										<span className={styles.lyricTitle}>{item.title}</span>

										<span className={styles.lyricText}>{item.text}</span>
									</button>
								</div>
							);
						})}
					</div>
				</section>

				{/* RIGHT — SYNCHRONIZED VISUALS */}
				<aside className={styles.visualPanel} aria-label="Project visuals">
					<div className={styles.visualTop}>
						<div>
							<span className={styles.panelEyebrow}>VISUAL LIBRARY</span>
							<h2>{step.visual}</h2>
						</div>

						<span className={styles.visualBadge}>NOW VIEWING</span>
					</div>

					<div className={styles.visualStage}>
						{currentImage ? (
							<img key={`${activeStep}-${currentImage}`} src={currentImage} alt={`${step.visual} — ${project.title}`} className={styles.mainVisual} />
						) : (
							<div className={styles.visualPlaceholder}>
								<span>PROJECT VISUAL</span>
								<strong>{step.visual}</strong>
							</div>
						)}
					</div>

					<div className={styles.visualFooter}>
						<div>
							<strong>{step.visual}</strong>
							<p>{step.description}</p>
						</div>

						<span>
							{String(activeStep + 1).padStart(2, "0")}/ {STEPS.length}
						</span>
					</div>
				</aside>
			</div>

			{/* STORY PLAYER CONTROLS */}

			<footer className={styles.storyPlayer}>
				<div className={styles.playerRow}>
					<button
						type="button"
						onClick={() => {
							setAutoPlay(false);
							goToStep(activeStep - 1);
						}}
						disabled={activeStep === 0}
						aria-label="Previous story moment"
					>
						⏮
					</button>

					<button
						type="button"
						className={styles.playerMainButton}
						onClick={() => {
							if (activeStep === STEPS.length - 1) {
								goToStep(0);
								setAutoPlay(true);
							} else {
								setAutoPlay((value) => !value);
							}
						}}
						aria-label={autoPlay ? "Pause story" : "Play story"}
					>
						{autoPlay ? "Ⅱ" : "▶"}
					</button>

					<button
						type="button"
						onClick={() => {
							setAutoPlay(false);
							goToStep(activeStep + 1);
						}}
						disabled={activeStep === STEPS.length - 1}
						aria-label="Next story moment"
					>
						⏭
					</button>
				</div>

				<div className={styles.progressRow}>
					<span>{String(activeStep + 1).padStart(2, "0")}</span>

					<input
						type="range"
						min="0"
						max={STEPS.length - 1}
						value={activeStep}
						onChange={(event) => {
							setAutoPlay(false);
							goToStep(Number(event.target.value));
						}}
						className={styles.progressSlider}
						style={{
							"--progress": `${progress}%`,
						}}
						aria-label="Project story progress"
					/>

					<span>{String(STEPS.length).padStart(2, "0")}</span>
				</div>
			</footer>
		</div>
	);
}
