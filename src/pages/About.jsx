import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import AboutVinyl from "../components/AboutVinyl/AboutVinyl";
import AboutPhotoFolder from "../components/AboutPhotoFolder/AboutPhotoFolder";

import styles from "./About.module.css";

import MouseGlow from "../components/MouseGlow/MouseGlow";

import ContactGlobe from "../components/ContactGlobe/ContactGlobe";

/* =====================================
   CHAPTERS
===================================== */

const CHAPTERS = [
	{
		id: "about",
		title: "About Me",
		color: "#C3A2EB",
	},
	{
		id: "skills",
		title: "Skills",
		color: "#F59AC2",
	},
	{
		id: "contact",
		title: "Contact",
		color: "#70C9E8",
	},
];

/* =====================================
   CONTACT
===================================== */

const CONTACT = {
	email: "klaklang.m@outlook.com",
	linkedin: "https://www.linkedin.com/in/meo-klaklang-9838782a0/",
	location: "3190 Boortmeerbeek, Belgium",
};

/* =====================================
   SKILLS
===================================== */

const skillGroups = [
	{
		title: "Education",
		color: "#C3A2EB",
		items: ["Multimedia & Creative Technology", "Erasmus Hogeschool Brussel", "2023 — 2026", "", "Agro-Biotechnology · Animal Care", "VIVES Hogeschool Roeselare", "2020 — 2023"],
	},
	{
		title: "Design Tools",
		color: "#F59AC2",
		items: ["Figma", "Adobe Illustrator", "Adobe Photoshop", "Adobe XD", "Adobe InDesign", "Premiere Pro"],
	},
	{
		title: "Development",
		color: "#63D99B",
		items: ["HTML / CSS", "JavaScript", "React / Next.js", "Node.js", "Swift / SwiftUI", "MongoDB / MySQL", "Supabase"],
	},
	{
		title: "Languages",
		color: "#70C9E8",
		items: ["Dutch — Fluent", "English — Fluent", "French — Fluent", "Thai — Basic speaking"],
	},
	{
		title: "Soft Skills",
		color: "#F5D76E",
		items: ["Curious", "Creative", "Collaborative", "Feedback-oriented", "Organised", "Problem-solving"],
	},
	{
		title: "Beyond Design",
		color: "#C3A2EB",
		items: ["Animals & animal care", "Music", "Running", "Travelling", "Crocheting", "Gaming"],
	},
];

/* =====================================
   HELPERS
===================================== */

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function getChapterIndex(chapterId) {
	const index = CHAPTERS.findIndex((chapter) => chapter.id === chapterId);

	return index >= 0 ? index : 0;
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* =====================================
   01 / ABOUT ME
===================================== */

function AboutPanel() {
	return (
		<section className={`${styles.panel} ${styles.aboutPanel}`} aria-labelledby="about-title">
			<div className={styles.aboutCopy}>
				<span className={styles.eyebrow}>01 / THE PERSON BEHIND THE PROJECTS</span>

				<h1 id="about-title" className={styles.mainTitle}>
					So, who's <span>Meo?</span>
				</h1>

				<p className={styles.introText}>
					Hello! I'm <strong>Siriyakorn Klaklang</strong>, but everyone calls me <strong>Meo.</strong>
				</p>

				<p>
					I'm a recent Multimedia & Creative Technology graduate passionate about <strong>UX/UI design, interactive design and front-end development.</strong> I love combining creativity with technology to build intuitive, engaging and meaningful
					digital experiences.
				</p>

				<p>I'm curious, enthusiastic and always looking for new things to learn. I enjoy exploring ideas, experimenting with tools and working with others to turn creative concepts into something real.</p>

				<p className={styles.personalNote}>And in case my animal projects and music-inspired portfolio haven't made it obvious yet... I'm a huge animal lover and music enthusiast. ♡</p>

				<div className={styles.aboutTags}>
					<span>UX/UI</span>
					<span>INTERACTIVE DESIGN</span>
					<span>FRONT-END</span>
				</div>
			</div>

			<div className={styles.aboutVisual}>
				<AboutPhotoFolder />
			</div>
		</section>
	);
}

/* =====================================
   02 / SKILLS
===================================== */

function SkillsPanel() {
	return (
		<section className={`${styles.panel} ${styles.skillsPanel}`} aria-labelledby="skills-title">
			<header className={styles.sectionHeader}>
				<div>
					<span className={styles.eyebrow}>02 / MY PERSONAL ARCHIVE</span>

					<h2 id="skills-title" className={styles.sectionTitle}>
						The little <span>details.</span>
					</h2>
				</div>

				<span className={styles.headerSideNote}>A MIX OF CREATIVE & TECHNICAL SKILLS</span>
			</header>

			<div className={styles.skillsGrid}>
				{skillGroups.map((group) => (
					<section
						key={group.title}
						className={styles.skillGroup}
						style={{
							"--skill-color": group.color,
						}}
					>
						<h3>{group.title}</h3>

						<ul>{group.items.map((item, index) => (item ? <li key={`${item}-${index}`}>{item}</li> : <li key={`space-${index}`} className={styles.skillSpacer} aria-hidden="true" />))}</ul>
					</section>
				))}
			</div>
		</section>
	);
}

/* =====================================
   03 / CONTACT
===================================== */

/* =====================================
   03 / CONTACT
===================================== */

function ContactPanel() {
	const contactLinks = [
		{
			label: "EMAIL",
			value: CONTACT.email,
			href: `mailto:${CONTACT.email}`,
		},
		{
			label: "LINKEDIN",
			value: "Meo Klaklang",
			href: CONTACT.linkedin,
		},
	];

	return (
		<section className={`${styles.panel} ${styles.contactPanel}`} aria-labelledby="contact-title">
			{/* LEFT — CONTACT CONTENT */}

			<div className={styles.contactCopy}>
				<span className={styles.eyebrow}>03 / SAY HELLO</span>

				<h2 id="contact-title" className={styles.contactTitle}>
					Let's
					<br />
					<span>connect.</span>
				</h2>

				<p>Have an idea, a project or just want to say hi? I'm always happy to meet new people, exchange ideas and explore creative opportunities.</p>

			

				{/* CONTACT DETAILS BELOW TEXT */}

				<div className={styles.contactDetails}>
					<span className={styles.contactLabel}>FIND ME HERE</span>

					<div className={styles.contactLinks}>
						{contactLinks.map((link) => {
							const isEmail = link.label === "EMAIL";

							return (
								<a key={link.label} href={link.href} target={isEmail ? undefined : "_blank"} rel={isEmail ? undefined : "noopener noreferrer"}>
									<span>{link.label}</span>
									<strong>{link.value}</strong>
									<span aria-hidden="true">↗</span>
								</a>
							);
						})}

						<div className={styles.locationRow}>
							<span>LOCATION</span>
							<strong>{CONTACT.location}</strong>
							<span aria-hidden="true">⌖</span>
						</div>
					</div>

					<div className={styles.availability}>
						<span className={styles.availabilityDot} />
						OPEN TO CREATIVE OPPORTUNITIES
					</div>
				</div>
			</div>

			{/* RIGHT — INTERACTIVE GLOBE */}

			<div className={styles.contactGlobe}>
				<ContactGlobe />
			</div>
		</section>
	);
}

/* =====================================
   MAIN ABOUT PAGE
===================================== */

export default function About() {
	const location = useLocation();
	const navigate = useNavigate();

	const sectionRefs = useRef([]);
	const scrollFrameRef = useRef(null);
	const navigationFrameRef = useRef(null);

	const [activeChapter, setActiveChapter] = useState(() => getChapterIndex(location.state?.chapter || "about"));

	const [scrollProgress, setScrollProgress] = useState(0);

	/*
    Only Contact opened through the
    TOP NAVBAR uses a sticky navbar.
  */
	const [keepNavbarVisible, setKeepNavbarVisible] = useState(() => location.state?.chapter === "contact");

	/* =====================================
     SCROLL TO CHAPTER
  ===================================== */

	function scrollToChapter(index, behavior = "smooth") {
		const safeIndex = Math.max(0, Math.min(index, CHAPTERS.length - 1));

		/*
      ABOUT ME:

      Go to the actual top of the page.
      Do not offset the first section,
      otherwise the navbar is clipped.
    */

		if (safeIndex === 0) {
			window.scrollTo({
				top: 0,
				behavior,
			});

			return;
		}

		const section = sectionRefs.current[safeIndex];

		if (!section) return;

		const navbarOffset = window.innerWidth <= 850 ? 78 : 95;

		const targetY = window.scrollY + section.getBoundingClientRect().top - navbarOffset;

		window.scrollTo({
			top: Math.max(0, targetY),
			behavior,
		});
	}

	/* =====================================
     SYNC VINYL WITH NORMAL SCROLLING
  ===================================== */

	useEffect(() => {
		function updateScrollState() {
			scrollFrameRef.current = null;

			const sections = sectionRefs.current;

			if (sections.length !== CHAPTERS.length || sections.some((section) => !section)) {
				return;
			}

			const sectionTops = sections.map((section) => window.scrollY + section.getBoundingClientRect().top);

			/*
        The focus point determines which
        chapter is currently active.
      */

			const focusY = window.scrollY + window.innerHeight * 0.42;

			let closestIndex = 0;
			let closestDistance = Infinity;

			sectionTops.forEach((top, index) => {
				const distance = Math.abs(focusY - top);

				if (distance < closestDistance) {
					closestDistance = distance;
					closestIndex = index;
				}
			});

			setActiveChapter(closestIndex);

			/*
        Continuous progress:
        About   = 0
        Skills  = halfway
        Contact = 1
      */

			const firstTop = sectionTops[0];

			const lastTop = sectionTops[sectionTops.length - 1];

			const totalDistance = lastTop - firstTop;

			const nextProgress = totalDistance > 0 ? clamp((focusY - firstTop) / totalDistance) : 0;

			setScrollProgress(nextProgress);
		}

		function onScroll() {
			if (scrollFrameRef.current !== null) {
				return;
			}

			scrollFrameRef.current = requestAnimationFrame(updateScrollState);
		}

		updateScrollState();

		window.addEventListener("scroll", onScroll, { passive: true });

		window.addEventListener("resize", onScroll);

		return () => {
			window.removeEventListener("scroll", onScroll);

			window.removeEventListener("resize", onScroll);

			if (scrollFrameRef.current !== null) {
				cancelAnimationFrame(scrollFrameRef.current);
			}
		};
	}, []);

	/* =====================================
     TOP NAVBAR → ABOUT / CONTACT
  ===================================== */

	useLayoutEffect(() => {
		const requestedChapter = location.state?.chapter;

		if (!requestedChapter) {
			return;
		}

		const requestedIndex = CHAPTERS.findIndex((chapter) => chapter.id === requestedChapter);

		if (requestedIndex === -1) {
			return;
		}

		/*
      Clicking Contact in the TOP navbar
      enables sticky navigation.

      Clicking About disables it.
    */

		setKeepNavbarVisible(requestedChapter === "contact");

		if (navigationFrameRef.current !== null) {
			cancelAnimationFrame(navigationFrameRef.current);
		}

		navigationFrameRef.current = requestAnimationFrame(() => {
			scrollToChapter(requestedIndex, "instant");

			setActiveChapter(requestedIndex);

			/*
          Remove the one-time navigation
          request without resetting scroll.
        */

			navigate(
				{
					pathname: "/about",
					hash: "",
				},
				{
					replace: true,
					state: null,
					preventScrollReset: true,
				},
			);
		});

		return () => {
			if (navigationFrameRef.current !== null) {
				cancelAnimationFrame(navigationFrameRef.current);

				navigationFrameRef.current = null;
			}
		};
	}, [location.key, location.state?.chapter, navigate]);

	/* =====================================
     VINYL → CHAPTER
  ===================================== */

	function handleChapterChange(index) {
		if (index < 0 || index >= CHAPTERS.length) {
			return;
		}

		/*
      Unlike top-navbar Contact,
      vinyl navigation does not
      keep the navbar sticky.
    */

		setKeepNavbarVisible(false);

		const behavior = prefersReducedMotion() ? "instant" : "smooth";

		/*
      When disabling sticky positioning,
      let React apply the layout change
      before measuring the target.
    */

		requestAnimationFrame(() => {
			scrollToChapter(index, behavior);
		});
	}

	const chapter = CHAPTERS[activeChapter];

	/* =====================================
     RENDER
  ===================================== */

	return (
		<div
			className={styles.aboutPage}
			style={{
				"--about-color": chapter.color,
			}}
		>
			{/* COLOUR-CHANGING AURA */}

			<div className={styles.ambient} aria-hidden="true" />

			{/* SAME MOUSE HIGHLIGHT AS PROJECTS */}

			<MouseGlow color={chapter.color} />

			{/* =====================================
          NAVBAR
      ===================================== */}

			<div className={`${styles.navbarWrap} ${keepNavbarVisible ? styles.navbarSticky : ""}`}>
				<Navbar variant="dark" activeAboutChapter={chapter.id} />
			</div>

			{/* =====================================
          MAIN CONTENT
      ===================================== */}

			<main className={styles.main}>
				{/* TOP LINE */}

				<div className={styles.topLine}>
					<span>MEØ® / SIDE B</span>

					<span>
						{String(activeChapter + 1).padStart(2, "0")}
						{" / "}
						{String(CHAPTERS.length).padStart(2, "0")}
					</span>
				</div>

				{/* 01 — ABOUT ME */}

				<div
					id="about-about"
					ref={(element) => {
						sectionRefs.current[0] = element;
					}}
					className={styles.chapterSection}
				>
					<AboutPanel />
				</div>

				{/* 02 — SKILLS */}

				<div
					id="about-skills"
					ref={(element) => {
						sectionRefs.current[1] = element;
					}}
					className={styles.chapterSection}
				>
					<SkillsPanel />
				</div>

				{/* 03 — CONTACT */}

				<div
					id="about-contact"
					ref={(element) => {
						sectionRefs.current[2] = element;
					}}
					className={styles.chapterSection}
				>
					<ContactPanel />
				</div>
			</main>

			{/* =====================================
          FIXED HALF VINYL
      ===================================== */}

			<AboutVinyl chapters={CHAPTERS} activeChapter={activeChapter} progress={scrollProgress} onChapterChange={handleChapterChange} />
		</div>
	);
}
