import { useNavigate } from "react-router-dom";
import { projects } from "../../data/projects";

import styles from "./ProjectsOverview.module.css";

export default function ProjectsOverview() {
	const navigate = useNavigate();

	// Exclude About Me from the project collection
	const workProjects = projects.filter((project) => project.slug !== "about");

	/* =====================================
     OPEN PROJECT WITHOUT RELOADING
  ===================================== */

	function openProject(event, slug) {
		// Preserve normal browser behavior for
		// Ctrl+click, Cmd+click and middle-click.
		if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		event.preventDefault();

		// Navigate inside React, without restarting
		// the website or its loading animation.
		navigate("/", {
			state: {
				openProject: slug,
				returnTo: "/projects",
			},
		});
	}

	return (
		<section className={styles.projectsPage} aria-label="Selected projects">
			<div className={styles.container}>
				{/* =====================================
            PROJECT GRID
        ===================================== */}

				<div className={styles.projectGrid}>
					{workProjects.map((project, index) => (
						<a
							key={project.slug}
							href={`/#project-${project.slug}`}
							className={styles.projectItem}
							onClick={(event) => openProject(event, project.slug)}
							style={{
								"--card-accent": project.color,
								"--card-index": index,
							}}
							aria-label={`Explore ${project.title}`}
						>
							{/* IMAGE */}

							<div className={styles.imageFrame}>
								<img src={project.image} alt={`${project.title} project preview`} loading="lazy" />

								<span className={styles.imageNumber}>{String(index + 1).padStart(2, "0")}</span>

								<span className={styles.viewIcon} aria-hidden="true">
									↗
								</span>
							</div>

							{/* PROJECT INFORMATION */}

							<div className={styles.cardInfo}>
								<div className={styles.cardHeadingRow}>
									<h3>{project.title}</h3>

									<span className={styles.year}>{project.year}</span>
								</div>

								<div className={styles.cardMeta}>
									<span>{project.category}</span>

									<span className={styles.viewText}>EXPLORE RECORD ↗</span>
								</div>
							</div>
						</a>
					))}
				</div>

				{/* =====================================
            FOOTER
        ===================================== */}

				<div className={styles.footer}>
					<span>FIVE PROJECTS. FIVE DIFFERENT STORIES.</span>

					<span>SELECT A RECORD ↗</span>
				</div>
			</div>
		</section>
	);
}
