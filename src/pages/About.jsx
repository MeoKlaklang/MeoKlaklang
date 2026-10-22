import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import AboutVinyl from "../components/AboutVinyl/AboutVinyl";
import AboutPhotoFolder from "../components/AboutPhotoFolder/AboutPhotoFolder";

import styles from "./About.module.css";

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
		items: ["Figma", "Adobe Illustrator", "Adobe Photoshop", "Adobe XD", "Adobe InDesign", "Premiere Pro", "Rive"],
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
   HELPER
===================================== */

function getChapterIndex(chapterId) {
	const index = CHAPTERS.findIndex((chapter) => chapter.id === chapterId);

	return index >= 0 ? index : 0;
}

/* =====================================
   ABOUT ME
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
   SKILLS
===================================== */

function SkillsPanel() {
	return (
		<section className={`${styles.panel} ${styles.skillsPanel}`} aria-labelledby="skills-title">
			<header className={styles.sectionHeader}>
				<div>
					<span className={styles.eyebrow}>02 / MY PERSONAL ARCHIVE</span>

					<h1 id="skills-title" className={styles.sectionTitle}>
						The little <span>details.</span>
					</h1>
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
						<h2>{group.title}</h2>

						<ul>{group.items.map((item, index) => (item ? <li key={`${item}-${index}`}>{item}</li> : <li key={`space-${index}`} className={styles.skillSpacer} aria-hidden="true" />))}</ul>
					</section>
				))}
			</div>
		</section>
	);
}

/* =====================================
   CONTACT
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
			<div className={styles.contactCopy}>
				<span className={styles.eyebrow}>03 / SAY HELLO</span>

				<h1 id="contact-title" className={styles.contactTitle}>
					Let's make
					<br />
					something
					<br />
					<span>meaningful.</span>
				</h1>

				<p>Have an idea, a project or just want to say hi? I'm always happy to meet new people, exchange ideas and explore creative opportunities.</p>

				<a className={styles.primaryContact} href={`mailto:${CONTACT.email}`}>
					GET IN TOUCH
					<span aria-hidden="true">↗</span>
				</a>
			</div>

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
		</section>
	);
}

/* =====================================
   MAIN ABOUT COMPONENT
===================================== */

export default function About() {
	const location = useLocation();
	const navigate = useNavigate();

	const [activeChapter, setActiveChapter] = useState(() => getChapterIndex(location.state?.chapter || "about"));

	/* =====================================
     NAVBAR → CHAPTER NAVIGATION
  ===================================== */

	useEffect(() => {
		const requestedChapter = location.state?.chapter;

		if (!requestedChapter) return;

		const requestedIndex = CHAPTERS.findIndex((chapter) => chapter.id === requestedChapter);

		if (requestedIndex === -1) return;

		/*
      Works even when already on /about.

      ABOUT   -> chapter 0
      SKILLS  -> chapter 1
      CONTACT -> chapter 2
    */

		setActiveChapter(requestedIndex);

		/*
      Remove the one-time instruction
      so future navigation starts clean.
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
	}, [location.key, location.state?.chapter, navigate]);

	/* =====================================
     VINYL NAVIGATION
  ===================================== */

	function handleChapterChange(index) {
		if (index < 0 || index >= CHAPTERS.length) {
			return;
		}

		setActiveChapter(index);
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

			{/* NAVBAR */}
			<div className={styles.navbarWrap}>
				<Navbar variant="dark" activeAboutChapter={CHAPTERS[activeChapter].id} />
			</div>

			{/* MAIN CONTENT */}

			<main className={styles.main}>
				<div className={styles.topLine}>
					<span>MEØ® / SIDE B</span>

					<span>
						{String(activeChapter + 1).padStart(2, "0")}
						{" / "}
						{String(CHAPTERS.length).padStart(2, "0")}
					</span>
				</div>

				<div className={styles.panelViewport} aria-live="polite" aria-atomic="false">
					<div key={chapter.id} className={styles.panelAnimation}>
						{activeChapter === 0 && <AboutPanel />}

						{activeChapter === 1 && <SkillsPanel />}

						{activeChapter === 2 && <ContactPanel />}
					</div>
				</div>
			</main>

			{/* HALF VINYL NAVIGATION */}

			<AboutVinyl chapters={CHAPTERS} activeChapter={activeChapter} onChapterChange={handleChapterChange} />
		</div>
	);
}
