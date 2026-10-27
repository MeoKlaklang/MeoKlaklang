import { projects } from "./projects";

import HetMandje from "../projects/HetMandje/HetMandje";
import AnimalFestival from "../projects/AnimalFestival/AnimalFestival";
import PetBridge from "../projects/PetBridge/PetBridge";
import Bozar from "../projects/Bozar/Bozar";
import Gistda from "../projects/Gistda/Gistda";

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
		color: themeColor,
		themeColor,
		chapters,
		Component,
	};
}

export const portfolioRecords = [
	// 01 — HET MANDJE / YELLOW
	createRecord(
		"mandje",
		{
			slug: "het-mandje",
			title: "Het Mandje",
		},
		"#F5D76E",
		["Research", "Ideate & Design", "Test & Iterate", "Final Result"],
		HetMandje,
	),

	// 02 — ANIMAL FESTIVAL / PINK
	createRecord(
		"festival",
		{
			slug: "animal-festival",
			title: "Animal Festival",
		},
		"#F59AC2",
		["Intro", "Wireframe", "Final", "Demo"],
		AnimalFestival,
	),

	// 03 — PETBRIDGE / GREEN
	createRecord(
		"petbridge",
		{
			slug: "petbridge",
			title: "PetBridge",
		},
		"#63D99B",
		["Intro", "Wireframe", "Final", "Demo"],
		PetBridge,
	),

	// 04 — BOZAR / BLUE
	createRecord(
		"bozar",
		{
			slug: "bozar",
			title: "ARTMATCH",
		},
		"#70C9E8",
		["Intro", "App", "Kiosk", "Ticket"],
		Bozar,
	),

	// 05 — GISTDA / PURPLE
	createRecord(
		"gistda",
		{
			slug: "gistda",
			title: "GISTDA",
		},
		"#C3A2EB",
		["Intro", "Editorial", "Visual", "Logo"],
		Gistda,
	),
];
