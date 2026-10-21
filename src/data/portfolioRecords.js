import { projects } from "./projects";

import HetMandje from "../projects/HetMandje/HetMandje";
import Gistda from "../projects/Gistda/Gistda";
import PetBridge from "../projects/PetBridge/PetBridge";

function findProject(keyword) {
	return projects.find((project) =>
		String(project.slug || project.title || "")
			.toLowerCase()
			.includes(keyword),
	);
}

function createRecord(keyword, fallback, themeColor, chapters, Component) {
	const data = findProject(keyword);

	return {
		...fallback,
		...data,

		// Explicit colour for the entire record experience
		color: themeColor,
		themeColor: themeColor,

		chapters,
		Component,
	};
}

export const portfolioRecords = [
	createRecord(
		"mandje",
		{
			slug: "het-mandje",
			title: "Het Mandje",
		},
		"#8DB5A9",
		["Research", "Wireframes", "Testing", "Final"],
		HetMandje,
	),

	createRecord(
		"gistda",
		{
			slug: "gistda",
			title: "GISTDA",
		},
		"#C3A2EB",
		["Intro", "Editorial", "Branding", "Logo"],
		Gistda,
	),

	createRecord(
		"petbridge",
		{
			slug: "petbridge",
			title: "PetBridge",
		},
		"#72CED1",
		["Intro", "Wireframe", "Testing", "Demo"],
		PetBridge,
	),
];
