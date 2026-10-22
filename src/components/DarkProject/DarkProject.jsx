import { useEffect, useRef, useState } from "react";

import styles from "./DarkProject.module.css";

import VinylNavigation from "./shared/VinylNavigation";
import RecordTransition from "./shared/RecordTransition";
import AmbientBackground from "./shared/AmbientBackground";

import { portfolioRecords } from "../../data/portfolioRecords";
import { useLocation, useNavigate } from "react-router-dom";

/* =====================================
   HELPERS
===================================== */

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function smoothstep(value) {
	const t = clamp(value);
	return t * t * (3 - 2 * t);
}

function getScrollBehavior() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/* =====================================
   RECORD TRANSITION
===================================== */

function getTransitionState(element, viewport) {
	if (!element) {
		return { progress: 0, cue: 0 };
	}

	const rect = element.getBoundingClientRect();

	const start = viewport * 0.7;
	const end = -viewport * 0.7;

	return {
		progress: smoothstep((start - rect.top) / (start - end)),
		cue: smoothstep((viewport * 1.05 - rect.top) / (viewport * 0.45)),
	};
}

/* =====================================
   CHAPTER PROGRESS
===================================== */

/*
  Every chapter occupies one part of the
  vinyl progress arc.

  Within that part, progress follows the
  actual scroll distance.

  This keeps the progress arc aligned
  with the four chapter markers.
*/

function getChapterState(refs, readingLine, viewport) {
	const elements = (refs?.current || []).filter(Boolean);

	if (!elements.length) {
		return { active: 0, progress: 0 };
	}

	const rects = elements.map((element) => element.getBoundingClientRect());

	if (rects[0].top > readingLine) {
		return { active: 0, progress: 0 };
	}

	let active = 0;

	rects.forEach((rect, index) => {
		if (rect.top <= readingLine) {
			active = index;
		}
	});

	const lastIndex = rects.length - 1;
	const current = rects[active];

	let withinChapter = 0;

	if (active < lastIndex) {
		const next = rects[active + 1];

		const distance = Math.max(1, next.top - current.top);

		withinChapter = clamp((readingLine - current.top) / distance);
	} else {
		// Finish near the end of the last chapter,
		// including the final portfolio project.

		const reachableEnd = viewport * 0.85;

		const distance = Math.max(1, current.height + readingLine - reachableEnd);

		withinChapter = clamp((readingLine - current.top) / distance);
	}

	return {
		active,
		progress: clamp((active + withinChapter) / rects.length),
	};
}

/* =====================================
   SPOTIFY-STYLE LYRICS
===================================== */

/*
  Reveal words according to their real
  position on screen.

  This replaces the previous calculation
  based on an entire text block.
*/

function calculateRevealedWords(world, viewport) {
	const revealed = {};
	const line = viewport * 0.67;

	world.querySelectorAll("[data-lyric-block]").forEach((block) => {
		const id = block.dataset.lyricBlock;

		if (!id) return;

		const words = block.querySelectorAll("[data-lyric-word]");

		let count = 0;

		for (const word of words) {
			const rect = word.getBoundingClientRect();

			if (rect.top <= line) {
				count += 1;
			} else {
				break;
			}
		}

		revealed[id] = count;
	});

	return revealed;
}

/* =====================================
   INDIVIDUAL PROJECT SECTION
===================================== */

function ProjectSection({ record, recordIndex, records, chapterRefs, projectStartRefs, transitionRefs, revealedWords }) {
	const Component = record.Component;
	const nextRecord = records[recordIndex + 1];

	return (
		<div>
			{/* CURRENT PROJECT */}

			<div
				ref={(element) => {
					projectStartRefs.current[recordIndex] = element;
				}}
				id={`project-${record.slug}`}
				className={recordIndex === 0 ? undefined : styles.nextProjectPosition}
			>
				<Component project={record} chaptersRef={chapterRefs.current[recordIndex]} revealedWords={revealedWords} />
			</div>

			{/* TRANSITION TO NEXT PROJECT */}

			{nextRecord && (
				<section
					ref={(element) => {
						transitionRefs.current[recordIndex] = element;
					}}
					className={styles.recordTransitionZone}
					aria-label={`Next project: ${nextRecord.title}`}
				>
					<div className={styles.recordTransitionPrompt}>
						<span>END OF RECORD {String(recordIndex + 1).padStart(2, "0")}</span>

						<h2>Every record has another side.</h2>

						<p>Keep scrolling — or click the glowing record — to discover {nextRecord.title}.</p>

						<span className={styles.recordScrollArrow} aria-hidden="true">
							↓
						</span>
					</div>
				</section>
			)}
		</div>
	);
}

/* =====================================
   MAIN DARK PROJECT
===================================== */

export default function DarkProject() {
	const records = portfolioRecords;

	const navigate = useNavigate();
	const location = useLocation();

	/* WORLD REFS */

	const worldRef = useRef(null);
	const stickyRef = useRef(null);

	/* PROJECT REFS */

	const chapterRefs = useRef(
		records.map(() => ({
			current: [],
		})),
	);

	const projectStartRefs = useRef([]);
	const transitionRefs = useRef([]);

	/* DISC DRAG */

	const dragRef = useRef(null);

	/* STATE */

	const [entrance, setEntrance] = useState(0);
	const [rotation, setRotation] = useState(0);

	const [chapters, setChapters] = useState(
		records.map(() => ({
			active: 0,
			progress: 0,
		})),
	);

	const [transitions, setTransitions] = useState(
		records.slice(1).map(() => ({
			progress: 0,
			cue: 0,
		})),
	);

	const [revealedWords, setRevealedWords] = useState({});

	/* =====================================
     SCROLL UPDATE
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

			setEntrance(smoothstep(inside / viewport));

			/* VINYL ROTATION */

			setRotation(inside * 0.16);

			/* RECORD TRANSITION PROGRESS */

			const nextTransitions = records.slice(1).map((_, index) => getTransitionState(transitionRefs.current[index], viewport));

			setTransitions(nextTransitions);

			/* CHAPTER PROGRESS */

			const readingLine = viewport * 0.48;

			setChapters(chapterRefs.current.map((ref) => getChapterState(ref, readingLine, viewport)));

			/* BACKGROUND PARALLAX */

			if (stickyRef.current) {
				stickyRef.current.style.setProperty("--background-shift", `${Math.sin(inside * 0.001) * 65}px`);
			}

			/* =====================================
         LYRICS — WORD POSITION
      ===================================== */

			const nextRevealed = calculateRevealedWords(world, viewport);

			setRevealedWords((previous) => {
				const ids = Object.keys(nextRevealed);

				const unchanged = ids.length === Object.keys(previous).length && ids.every((id) => previous[id] === nextRevealed[id]);

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
	}, [records]);

	/* =====================================
     DETERMINE ACTIVE RECORD
  ===================================== */

	let activeRecordIndex = 0;

	transitions.forEach((state, index) => {
		if (state.progress >= 0.96) {
			activeRecordIndex = index + 1;
		}
	});

	const activeRecord = records[activeRecordIndex];

	const upcomingRecord = records[activeRecordIndex + 1];

	/* =====================================
     CHAPTER NAVIGATION
  ===================================== */

	function goToChapter(recordIndex, chapterIndex) {
		const ref = chapterRefs.current[recordIndex];

		if (!ref || !ref.current.length) return;

		const safeIndex = clamp(chapterIndex, 0, ref.current.length - 1);

		const target = ref.current[safeIndex];

		if (!target) return;

		target.scrollIntoView({
			behavior: getScrollBehavior(),
			block: "start",
		});
	}

	/* =====================================
     PLAY PROJECT
  ===================================== */

	function playRecord(recordIndex) {
		const target = projectStartRefs.current[recordIndex];

		if (!target) return;

		target.scrollIntoView({
			behavior: getScrollBehavior(),
			block: "start",
		});
	}

	/* =====================================
     BACK TO HOME
  ===================================== */

	function backToProjects() {
		const cameFromProjects = location.state?.returnTo === "/projects";

		if (cameFromProjects) {
			navigate("/projects", {
				state: null,
			});
			return;
		}

		// Opened from the homepage:
		// return to the top of Home.
		window.scrollTo({
			top: 0,
			behavior: getScrollBehavior(),
		});
	}

	/* =====================================
     DISC DRAG
  ===================================== */

	function handleDiscDown(event, recordIndex) {
		if (event.button !== 0) return;

		dragRef.current = {
			x: event.clientX,
			y: event.clientY,
			recordIndex,
			chapter: chapters[recordIndex]?.active || 0,
		};

		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function handleDiscUp(event) {
		const drag = dragRef.current;

		dragRef.current = null;

		if (!drag) return;

		const dx = event.clientX - drag.x;

		const dy = event.clientY - drag.y;

		if (Math.hypot(dx, dy) < 30) {
			return;
		}

		const direction = Math.abs(dy) > Math.abs(dx) ? Math.sign(dy) : Math.sign(dx);

		const nextChapter = clamp(drag.chapter + direction, 0, records[drag.recordIndex].chapters.length - 1);

		goToChapter(drag.recordIndex, nextChapter);
	}

	function cancelDrag() {
		dragRef.current = null;
	}

	/* =====================================
     BACKGROUND MOUSE
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
     AMBIENT COLORS
  ===================================== */

	const currentColor = activeRecord.color;

	const nextColor = upcomingRecord?.color || currentColor;

	const ambientProgress = transitions[activeRecordIndex]?.progress || 0;

	/* =====================================
     RENDER
  ===================================== */

	return (
		<section
			ref={worldRef}
			className={styles.world}
			id="portfolio-records"
			onPointerMove={handleBackgroundMove}
			style={{
				"--project-color": activeRecord.color,
				"--reveal": `${entrance * 100}%`,
				"--transition": entrance,
				"--disc-rotation": `${rotation}deg`,
				"--next-color": nextColor,
				"--record-progress": ambientProgress,
				"--record-cue": transitions[activeRecordIndex]?.cue || 0,
			}}
		>
			{/* =====================================
          STICKY VINYL WORLD
      ===================================== */}

			<div ref={stickyRef} className={styles.stickyWorld}>
				{/* AMBIENT BACKGROUND */}

				<AmbientBackground currentColor={currentColor} nextColor={nextColor} progress={ambientProgress} />

				{/* CLOSE BUTTON */}

				<button type="button" className={`${styles.projectClose} ${entrance > 0.9 ? styles.projectCloseVisible : ""}`} aria-label="Back to projects" title="Back to projects" tabIndex={entrance > 0.9 ? 0 : -1} onClick={backToProjects}>
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
						<path d="M5 5L19 19M19 5L5 19" />
					</svg>
				</button>

				{/* =====================================
            ALL VINYL RECORDS
        ===================================== */}

				{records.map((record, recordIndex) => {
					const previous = transitions[recordIndex - 1];

					const next = transitions[recordIndex];

					const entered = recordIndex === 0 ? 1 : clamp(((previous?.progress || 0) - 0.955) / 0.045);

					const exit = next ? smoothstep((next.progress - 0.18) / 0.65) : 0;

					const exitMovement = next ? smoothstep((next.progress - 0.12) / 0.73) : 0;

					const visible = entered * (1 - exit);

					const interactive = recordIndex === activeRecordIndex;

					const state = chapters[recordIndex] || {
						active: 0,
						progress: 0,
					};

					return (
						<div
							key={record.slug}
							className={recordIndex === 0 ? styles.recordOld : styles.gistdaVinylWrap}
							style={{
								"--project-color": record.color,

								opacity: visible,

								transform: `translateX(${-125 * exitMovement}vw)`,

								pointerEvents: interactive ? "auto" : "none",

								zIndex: interactive ? 5 : 1,
							}}
						>
							<VinylNavigation
								project={record}
								chapters={record.chapters}
								styles={styles}
								transition={recordIndex === 0 ? entrance : 1}
								rotation={rotation}
								progress={state.progress}
								activeChapter={state.active}
								handleDiscDown={(event) => handleDiscDown(event, recordIndex)}
								handleDiscUp={handleDiscUp}
								cancelDrag={cancelDrag}
								goToChapter={(chapterIndex) => goToChapter(recordIndex, chapterIndex)}
								canPlayNext={Boolean(next && next.cue > 0.4)}
								onPlayNext={() => playRecord(recordIndex + 1)}
							/>
						</div>
					);
				})}

				{/* =====================================
            ALL RECORD TRANSITIONS
        ===================================== */}

				{transitions.map((state, index) => {
					const nextRecord = records[index + 1];

					const previousEntered = index === 0 ? 1 : clamp(((transitions[index - 1]?.progress || 0) - 0.955) / 0.045);

					const visible = previousEntered * clamp((0.985 - state.progress) / 0.025);

					const interactive = activeRecordIndex === index && state.progress > 0.18 && state.progress < 0.96 && visible > 0.05;

					return (
						<div
							key={`transition-${index}`}
							className={styles.transitionVinylWrap}
							style={{
								opacity: visible,

								pointerEvents: interactive ? "auto" : "none",

								zIndex: interactive ? 6 : 0,
							}}
						>
							<RecordTransition project={nextRecord} number={index + 2} progress={state.progress} cue={state.cue} rotation={rotation} onPlay={() => playRecord(index + 1)} />
						</div>
					);
				})}

				{/* =====================================
            NEXT PROJECT SHORTCUT
        ===================================== */}

				{upcomingRecord && entrance > 0.8 && (
					<button
						type="button"
						className={styles.nextProjectShortcut}
						onClick={() => playRecord(activeRecordIndex + 1)}
						aria-label={`Next project: ${upcomingRecord.title}`}
						style={{
							"--next-project-color": upcomingRecord.color,
						}}
					>
						<span className={styles.nextProjectShortcutLabel}>NEXT PROJECT</span>

						<span className={styles.nextProjectShortcutName}>
							{upcomingRecord.title}

							<span aria-hidden="true">↗</span>
						</span>
					</button>
				)}

				{/* =====================================
            NOW PLAYING
        ===================================== */}

				<div
					className={styles.projectIdentity}
					style={{
						opacity: clamp((entrance - 0.7) / 0.3),
						pointerEvents: "none",
					}}
				>
					<span className={styles.projectIdentityCurrent}>NOW PLAYING — {activeRecord.title}</span>
				</div>
			</div>

			{/* =====================================
          PROJECT CONTENT + TRANSITIONS
      ===================================== */}

			{records.map((record, recordIndex) => (
				<ProjectSection key={record.slug} record={record} recordIndex={recordIndex} records={records} chapterRefs={chapterRefs} projectStartRefs={projectStartRefs} transitionRefs={transitionRefs} revealedWords={revealedWords} />
			))}
		</section>
	);
}
