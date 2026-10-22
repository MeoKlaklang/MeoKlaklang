import { useRef, useState } from "react";

import ScrollHighlight from "../../components/DarkProject/shared/ScrollHighlight";
import darkStyles from "../../components/DarkProject/DarkProject.module.css";

import styles from "./AnimalFestival.module.css";

const BASE = "/images/animalfestival";

// Change to the MP4 path once your video is ready.
// Temporary demo — replace later with Animal Festival video
const DEMO_VIDEO = "/images/petbridge/petbridge-demo-web.mp4";
const WIREFRAMES = [
	{
		src: `${BASE}/wireframe-01.png`,
		label: "01 / CANINE ACTIVITIES",
	},
	{
		src: `${BASE}/wireframe-02.png`,
		label: "02 / FESTIVAL CONDITIONS",
	},
];

/* =====================================
   CHAPTER REFERENCES
===================================== */

function setChapter(chaptersRef, index, element) {
	if (chaptersRef?.current) {
		chaptersRef.current[index] = element;
	}
}

/* =====================================
   SCROLL LYRICS
===================================== */

function ProjectText({ id, as = "p", className, revealedWords, text }) {
	return <ScrollHighlight id={id} as={as} className={className} styles={darkStyles} revealedWords={revealedWords} text={text} />;
}

/* =====================================
   MOBILE VIDEO PLAYER
===================================== */

function AutoPlayDemo({ src }) {
	const videoRef = useRef(null);

	const [progress, setProgress] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [videoError, setVideoError] = useState(false);

	function handleTimeUpdate() {
		const video = videoRef.current;

		if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
			return;
		}

		setProgress((video.currentTime / video.duration) * 100);
	}

	function handleSeek(event) {
		const video = videoRef.current;
		const nextProgress = Number(event.target.value);

		setProgress(nextProgress);

		if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
			return;
		}

		video.currentTime = (nextProgress / 100) * video.duration;
	}

	async function togglePlayPause() {
		const video = videoRef.current;
		if (!video) return;

		if (!video.paused) {
			video.pause();
			return;
		}

		try {
			setVideoError(false);
			await video.play();
		} catch (error) {
			console.error("Animal Festival video could not play:", error);
			setVideoError(true);
		}
	}

	return (
		<div className={styles.autoPlayPlayer}>
			<video
				ref={videoRef}
				className={styles.demoVideo}
				src={src}
				autoPlay
				muted
				loop
				playsInline
				preload="metadata"
				disablePictureInPicture
				aria-label="Animal Festival mobile prototype demonstration"
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleTimeUpdate}
				onPlay={() => {
					setIsPlaying(true);
					setVideoError(false);
				}}
				onPause={() => setIsPlaying(false)}
				onError={() => setVideoError(true)}
			/>

			<div className={styles.videoControls}>
				<button type="button" className={styles.videoToggle} onClick={togglePlayPause} aria-label={isPlaying ? "Pause video" : "Play video"} title={isPlaying ? "Pause" : "Play"}>
					{isPlaying ? (
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<rect x="6" y="4" width="4" height="16" />
							<rect x="14" y="4" width="4" height="16" />
						</svg>
					) : (
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</button>

				<input
					className={styles.videoProgress}
					type="range"
					min="0"
					max="100"
					step="0.1"
					value={progress}
					onChange={handleSeek}
					aria-label="Seek through Animal Festival demo"
					style={{
						"--video-progress": `${progress}%`,
					}}
				/>
			</div>

			{videoError && (
				<p className={styles.videoError} role="alert">
					This video could not be played. Please check that the MP4 uses H.264 encoding.
				</p>
			)}
		</div>
	);
}

/* =====================================
   ANIMAL FESTIVAL
===================================== */

export default function AnimalFestival({ chaptersRef, revealedWords = {} }) {
	return (
		<div className={styles.project}>
			{/* =====================================
          01 — INTRO
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 0, element)} id="animalfestival-intro" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>01 / INTRO</span>

					<ProjectText id="animalfestival-intro-title" as="h2" className={styles.introTitle} revealedWords={revealedWords} text="A playful festival identity made for animal lovers." />

					<ProjectText
						id="animalfestival-intro-description"
						className={styles.introDescription}
						revealedWords={revealedWords}
						text="For my design course, I created Animal Festival in Adobe XD: a fictional animal-themed festival with its own visual identity and mobile experience. I explored how playful graphics, bold typography and intuitive navigation could come together in one cohesive design."
					/>

					{/* KEEP THE ROUNDED TAGS */}

					<div className={styles.projectDetails}>
						<span>ADOBE XD</span>
						<span>UI DESIGN</span>
						<span>MOBILE EXPERIENCE</span>
					</div>

					<div className={styles.introDecoration}>
						<span>FESTIVAL DESIGN</span>
						<div className={styles.introLine} />
						<span>2024</span>
					</div>
				</div>
			</section>

			{/* =====================================
          02 — WIREFRAME
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 1, element)} id="animalfestival-wireframe" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>02 / WIREFRAME</span>

					<ProjectText id="animalfestival-wireframe-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="Making festival exploration feel effortless." />

					<ProjectText
						id="animalfestival-wireframe-description"
						className={styles.sectionDescription}
						revealedWords={revealedWords}
						text="I designed screens for exploring activities and finding practical festival information. A clear hierarchy and simple navigation help visitors find what they need."
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

			<section ref={(element) => setChapter(chaptersRef, 2, element)} id="animalfestival-final" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>03 / FINAL</span>

					<ProjectText id="animalfestival-final-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="A colourful world with its own personality." />

					<ProjectText
						id="animalfestival-final-description"
						className={styles.sectionDescription}
						revealedWords={revealedWords}
						text="Bright pastel colours, geometric illustrations and expressive typography give Animal Festival a recognisable identity, carried across its homepage, ticket selection and timetable."
					/>

					<figure className={styles.finalShowcase}>
						<img src={`${BASE}/final-phones.png`} alt="Animal Festival designs shown on three iPhone mockups" loading="lazy" />

						<figcaption>ANIMAL FESTIVAL / FINAL MOBILE DESIGN</figcaption>
					</figure>
				</div>
			</section>

			{/* =====================================
          04 — DEMO
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 3, element)} id="animalfestival-demo" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>04 / DEMO</span>

					<ProjectText id="animalfestival-demo-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="See Animal Festival in action." />

					<ProjectText
						id="animalfestival-demo-description"
						className={styles.sectionDescription}
						revealedWords={revealedWords}
						text="Explore the mobile prototype, from discovering activities to finding the festival schedule and selecting tickets."
					/>

					<div className={styles.demoArea}>
						{DEMO_VIDEO ? (
							<AutoPlayDemo src={DEMO_VIDEO} />
						) : (
							<div className={styles.demoPlaceholder}>
								<div className={styles.demoPlayIcon}>
									<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
										<path d="M8 5.5v13l10-6.5z" />
									</svg>
								</div>

								<span>PROTOTYPE WALKTHROUGH</span>
								<p>Demo video coming soon.</p>
							</div>
						)}
					</div>

					<div className={styles.projectEnding}>
						<span>END OF RECORD 04</span>
						<div className={styles.endingLine} />
						<span>DESIGNED WITH PLAYFULNESS</span>
					</div>
				</div>
			</section>
		</div>
	);
}
