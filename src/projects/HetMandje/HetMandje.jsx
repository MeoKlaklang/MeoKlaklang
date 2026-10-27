import { useEffect, useRef, useState } from "react";

import sharedStyles from "../../components/DarkProject/DarkProject.module.css";

import localStyles from "./HetMandje.module.css";

import { combineStyles } from "../../components/DarkProject/shared/combineStyles";

import ScrollHighlight from "../../components/DarkProject/shared/ScrollHighlight";

import AnimatedNumber from "../../components/DarkProject/shared/AnimatedNumber";

import SectionTitle from "../../components/DarkProject/shared/SectionTitle";

const styles = combineStyles(sharedStyles, localStyles);

const BASE = "/images/projects";

const MAGAZINE_PDF = "/images/projects/het-mandje-magazine.pdf";

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

const MOCKUPS = [

  {

    src: "/images/projects/mockup5.png",

    label: "Find Your Perfect Match",

    category: "ANIMAL SEARCH & DISCOVERY",

    className: "mockupOne",

  },

  {

    src: "/images/projects/mockup1.png",

    label: "Shelter & Veterinary Dashboard",

    category: "MEDICAL RECORDS & FOSTER APPLICATIONS",

    className: "mockupTwo",

  },

  {

    src: "/images/projects/mockup4.png",

    label: "Interactive Shelter Map",

    category: "LOCATION-BASED ANIMAL DISCOVERY",

    className: "mockupThree",

  },

];

/* =====================================
   UX PROCESS / RESEARCH TO DECISIONS

   These are design interpretations based
   on the graduation project's research,
   user roles and documented testing.
===================================== */

const DESIGN_PHASES = [
  "Empathize",
  "Define",
  "Ideate",
  "Prototype",
  "Test & iterate",
];

const RESEARCH_INSIGHTS = [
  {
    number: "01",
    audience: "POTENTIAL FOSTER FAMILIES",
    insight: "Interest alone isn't enough when the process feels unfamiliar.",
    detail:
      "Survey findings revealed confusion between fostering and adoption, alongside questions about time, responsibilities and support.",
    need: "Clarity, reassurance and an approachable first step.",
  },
  {
    number: "02",
    audience: "ANIMAL SHELTERS",
    insight: "A safe placement depends on much more than finding an available home.",
    detail:
      "Animal profiles, applications, appointments and communication need to stay organised as several people care for the same animal.",
    need: "One clear overview of animals, applications and care.",
  },
  {
    number: "03",
    audience: "VETERINARIANS",
    insight: "Important medical information must travel with the animal.",
    detail:
      "When information is spread across people and systems, care teams risk missing updates or duplicating work.",
    need: "Reliable, role-appropriate access to medical information.",
  },
];

const DESIGN_DECISIONS = [
  {
    number: "01",
    user: "FOSTER FAMILIES",
    insight: "I don't know what fostering will involve.",
    decision:
      "Explain temporary fostering before asking users to commit, then guide them from animal discovery to an application.",
    outcome: "Information pages · animal search · guided application",
  },
  {
    number: "02",
    user: "ANIMAL SHELTERS",
    insight: "I need to see what needs my attention today.",
    decision:
      "Prioritise animals, pending applications, appointments and tasks in a role-specific dashboard.",
    outcome: "Shelter overview · application management · calendar",
  },
  {
    number: "03",
    user: "VETERINARIANS",
    insight: "I need the right information, not every piece of information.",
    decision:
      "Connect care information to the animal while limiting each role to relevant records and appointments.",
    outcome: "Animal dossier · medical updates · role-based access",
  },
];

const FOSTER_FLOW = [
  "Understand fostering",
  "Discover an animal",
  "Apply to foster",
  "Follow the care journey",
];

const TEST_ITERATIONS = [
  {
    number: "01",
    title: "A calendar that respects each role.",
    problem:
      "The veterinarian initially saw too many appointments from the linked shelter.",
    iteration:
      "I separated the veterinarian's calendar while keeping access to relevant animals from the linked shelter.",
    learning: "Relevance is part of clarity.",
  },
  {
    number: "02",
    title: "Updates that don't get lost.",
    problem:
      "A veterinarian's appointment appeared in the calendar, but not in dashboard notifications.",
    iteration:
      "I connected appointment updates to the notification logic so important information appeared where users expected it.",
    learning: "A flow only works when its touchpoints connect.",
  },
  {
    number: "03",
    title: "Care information that follows the animal.",
    problem:
      "Medical notes and medication added by veterinarians were not always visible in the foster family's animal overview.",
    iteration:
      "I refined the data relationships around approved foster applications and the shared animal dossier.",
    learning: "Consistency matters beyond the interface.",
  },
];

const SOLUTION_OUTCOMES = [
  {
    number: "01",
    name: "DISCOVER",
    description: "Explore animals and shelters through searchable profiles and an interactive map.",
  },
  {
    number: "02",
    name: "CONNECT",
    description: "Move from a foster application to a clearer review and follow-up process.",
  },
  {
    number: "03",
    name: "CARE",
    description: "Keep relevant appointments, tasks and animal information connected across roles.",
  },
];

/* =====================================
   ANIMATED DESIGN THINKING PROCESS

   Runs only while visible. Each stage
   gets a subtle jump as its progress
   line fills before the next stage.
===================================== */

const PHASE_DURATION = 900;

function DesignPhaseProgress() {
  const trackRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);

    syncMotion();
    media.addEventListener("change", syncMotion);
    return () => media.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const element = trackRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || reducedMotion) return;

    setActivePhase(0);
    const timer = window.setInterval(() => {
      setActivePhase((index) => (index + 1) % DESIGN_PHASES.length);
    }, PHASE_DURATION);

    return () => window.clearInterval(timer);
  }, [isVisible, reducedMotion]);

  return (
    <ol
      ref={trackRef}
      className={styles.phaseTrack}
      aria-label="Design thinking: Empathize, Define, Ideate, Prototype, Test and iterate"
      style={{ "--phase-duration": `${PHASE_DURATION}ms` }}
    >
      {DESIGN_PHASES.map((phase, index) => {
        const isComplete = reducedMotion || (isVisible && index < activePhase);
        const isCurrent = !reducedMotion && isVisible && index === activePhase;

        return (
          <li
            key={phase}
            className={[
              styles.phaseStep,
              isComplete ? styles.phaseDone : "",
              isCurrent ? styles.phaseCurrent : "",
            ].filter(Boolean).join(" ")}
          >
            <div className={styles.phaseHeading}>
              <span className={styles.phaseIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong className={styles.phaseWord}>{phase}</strong>
            </div>
            <span className={styles.phaseLine} aria-hidden="true">
              <span className={styles.phaseLineFill} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function HetMandje({ chaptersRef, revealedWords }) {

    const statsRef = useRef(null);

    const [animal, setAnimal] = useState("cats");

    const [statsVisible, setStatsVisible] = useState(false);

    const stats = ANIMALS[animal];

    const difference = stats.inflow - stats.outflow;

    const outflowRatio = (stats.outflow / stats.inflow) * 100;

    useEffect(() => {

        const element = statsRef.current;

        if (!element || typeof IntersectionObserver === "undefined") {

            setStatsVisible(true);

            return;

        }

        const observer = new IntersectionObserver(

            ([entry]) => {

                setStatsVisible(entry.isIntersecting);

            },

            { threshold: 0.15 },

        );

        observer.observe(element);

        return () => observer.disconnect();

    }, []);

    return (

        <div className={styles.scrollContent}>

            <div className={styles.transitionSpace} aria-hidden="true" />

            <article

                ref={(element) => {

                    chaptersRef.current[0] = element;

                }}

                className={styles.chapter}

                id="project-research"

            >

                <div className={styles.chapterContent}>

                    <header className={styles.researchHero}>

                        <span className={styles.eyebrow}>01 / RESEARCH</span>

                        <div className={styles.heroImage}>

                            <img src={`${BASE}/Sleutelbeeldcompress.png`} alt="Cat resting in a basket — Het Mandje" />

                        </div>

                        <ScrollHighlight id="research-title" as="h2" className={styles.heroTitle} revealedWords={revealedWords} text={"Because every animal deserves a safe place,"} styles={styles} />

                        <ScrollHighlight id="research-question" className={styles.heroQuestion} revealedWords={revealedWords} text="even on their journey to a new home." styles={styles} />

                        {/* PROJECT TAGS */}

                        <div className={styles.projectTags} aria-label="Project categories">

                            {["FINAL PROJECT", "FULL-STACK", "REACT", "UX/UI DESIGN"].map((tag) => (

                                <span key={tag} className={styles.projectTag}>

                                    {tag}

                                </span>

                            ))}

                        </div>

                        {/* PROJECT DIVIDER */}

                        <div className={styles.projectDivider}>

                            <span className={styles.dividerLine} aria-hidden="true" />

                            <span className={styles.dividerYear}>2026</span>

                        </div>

                    </header>

                    <section ref={statsRef} className={styles.researchBlock}>

                        <span className={styles.eyebrow}>THE NUMBERS / FLANDERS 2022</span>

                        <ScrollHighlight id="numbers-title" as="h3" className={styles.impactTitle} revealedWords={revealedWords} text="More animals entered shelters than left." styles={styles} />

                        <ScrollHighlight id="numbers-desc" className={styles.supportText} revealedWords={revealedWords} text="Explore the recorded intake and outflow of cats and dogs." styles={styles} />

                        <div className={styles.animalSwitch} role="group" aria-label="Choose animal type">

                            {Object.keys(ANIMALS).map((type) => (

                                <button key={type} type="button" className={animal === type ? styles.switchActive : ""} onClick={() => setAnimal(type)} aria-pressed={animal === type}>

                                    {type === "cats" ? "Cats" : "Dogs"}

                                </button>

                            ))}

                        </div>

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

                    <section className={styles.researchBlock}>

                        <span className={styles.eyebrow}>THE REALITY</span>

                        <ScrollHighlight id="reality-quote" as="blockquote" className={styles.bigQuote} revealedWords={revealedWords} text="“Wij zitten altijd over onze capaciteit.”" styles={styles} />

                        <p className={styles.quoteSource}>Bram Willems — Dierenbescherming Mechelen, as cited in the project magazine</p>

                        <figure className={styles.shelterFigure}>

                            <img src={`${BASE}/dierenasiel.webp`} alt="Two dogs behind the bars of an animal shelter kennel" loading="lazy" />

                        </figure>

                        <ScrollHighlight

                            id="reality-description"

                            className={styles.supportText}

                            revealedWords={revealedWords}

                            text="While many platforms focus on helping people adopt animals, fostering is often overlooked. Many people are unaware that they can offer dogs and cats a temporary home and make a meaningful difference in their lives. With Het Mandje, I wanted to bring more attention to foster care, lower the barriers to getting involved, and make it easier for people to take that first step."

                            styles={styles}

                        />

                    </section>

                    {/* UX PROCESS — the five phases live inside four chapters. */}
                    <section className={styles.processOverview} aria-label="Design thinking approach">
                        <div className={styles.processHeading}>
                            <span className={styles.eyebrow}>MY APPROACH / DESIGN THINKING</span>
                            <ScrollHighlight id="research-process-heading" as="h3" text="From empathy to iteration." revealedWords={revealedWords} styles={styles} />
                            <ScrollHighlight id="research-process-copy" text="I used research to challenge assumptions, translated what I learned into design decisions, and refined the working platform through role-based testing." revealedWords={revealedWords} styles={styles} />
                        </div>
                        <DesignPhaseProgress />
                    </section>

                    {/* EMPATHIZE — grounded in the magazine's survey and audience research. */}
                    <section className={styles.userResearch}>
                        <div className={styles.editorialIntro}>
                            <span className={styles.eyebrow}>EMPATHIZE / WHO ARE WE DESIGNING FOR?</span>
                            <ScrollHighlight id="research-empathize-heading" as="h3" text={"Three perspectives.\nOne shared challenge."} revealedWords={revealedWords} styles={styles} />
                            <ScrollHighlight id="research-empathize-copy" text="My starting point was a survey about people’s understanding of fostering, supported by desk research, competitor analysis and experience in animal care. Looking beyond a single user revealed three different sets of needs." revealedWords={revealedWords} styles={styles} />
                        </div>
                        <div className={styles.insightList}>
                            {RESEARCH_INSIGHTS.map((item) => (
                                <article key={item.number} className={styles.insightRow}>
                                    <span className={styles.insightNumber}>{item.number}</span>
                                    <div>
                                        <span className={styles.insightAudience}>{item.audience}</span>
                                        <ScrollHighlight id={`research-insight-${item.number}-title`} as="h4" text={item.insight} revealedWords={revealedWords} styles={styles} />
                                        <ScrollHighlight id={`research-insight-${item.number}-detail`} text={item.detail} revealedWords={revealedWords} styles={styles} />
                                        <p className={styles.insightNeed}><strong>USER NEED ↗</strong> <ScrollHighlight id={`research-insight-${item.number}-need`} as="span" text={item.need} revealedWords={revealedWords} styles={styles} /></p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* DEFINE — focused problem statement / design opportunity. */}
                    <section className={styles.problemDefinition}>
                        <span className={styles.eyebrow}>DEFINE / THE DESIGN CHALLENGE</span>
                        <span className={styles.problemPrelude}>How might we...</span>
                        <ScrollHighlight id="research-define-challenge" as="h3" text="Make fostering easier to understand and access, while helping shelters, families and veterinarians work better together?" revealedWords={revealedWords} styles={styles} />
                        <ScrollHighlight id="research-define-copy" text="The opportunity wasn’t simply to list animals. It was to create a connected experience that could guide people from curiosity to application and ongoing care." revealedWords={revealedWords} styles={styles} />
                    </section>

                </div>

            </article>

            <article

                ref={(element) => {

                    chaptersRef.current[1] = element;

                }}

                className={`${styles.chapter} ${styles.wireframeChapter}`}

                id="project-wireframes"

            >

                <div className={styles.chapterContent}>

                    <SectionTitle

                        eyebrow="02 / IDEATE & DESIGN"

                        title={"One platform.\nThree different users."}

                        description="Turning research insights into intentional journeys, interfaces and role-specific experiences."

                        prefix="wireframes"

                        revealedWords={revealedWords}

                        className={styles.wireframeHeader}

                        styles={styles}

                    />

                    {/* IDEATE — visible links between evidence and choices. */}
                    <section className={styles.designDecisions}>
                        <div className={styles.editorialIntro}>
                            <span className={styles.eyebrow}>IDEATE / FROM INSIGHT TO INTERFACE</span>
                            <ScrollHighlight id="design-ideate-heading" as="h3" text="Every screen has a reason." revealedWords={revealedWords} styles={styles} />
                            <ScrollHighlight id="design-ideate-copy" text="Rather than giving everyone the same dashboard, I explored how the experience could respond to the responsibilities of each user role. I used prioritisation and user flows to focus on the essentials first." revealedWords={revealedWords} styles={styles} />
                        </div>
                        <div className={styles.decisionList}>
                            {DESIGN_DECISIONS.map((decision) => (
                                <article key={decision.number} className={styles.decisionRow}>
                                    <div className={styles.decisionIndex}>
                                        <span>{decision.number}</span>
                                        <strong>{decision.user}</strong>
                                    </div>
                                    <div className={styles.decisionContent}>
                                        <span className={styles.miniLabel}>THE USER INSIGHT</span>
                                        <ScrollHighlight id={`design-decision-${decision.number}-insight`} as="h4" text={`“${decision.insight}”`} revealedWords={revealedWords} styles={styles} />
                                        <span className={styles.decisionArrow} aria-hidden="true">↓</span>
                                        <span className={styles.miniLabel}>MY DESIGN RESPONSE</span>
                                        <ScrollHighlight id={`design-decision-${decision.number}-response`} text={decision.decision} revealedWords={revealedWords} styles={styles} />
                                        <span className={styles.decisionOutput}>{decision.outcome}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* USER FLOW — illustrative path reflected in the designed product. */}
                    <section className={styles.userJourney}>
                        <div className={styles.testingSectionMeta}>
                            <span>USER FLOW / FOSTER FAMILY</span>
                            <span>FROM INTEREST TO CARE</span>
                        </div>
                        <ScrollHighlight id="design-user-flow-heading" as="h3" text="Make the next step feel natural." revealedWords={revealedWords} styles={styles} />
                        <ScrollHighlight id="design-user-flow-copy" text="A potential foster family shouldn’t have to figure everything out at once. I designed a path that introduces the concept before guiding people towards a decision." revealedWords={revealedWords} styles={styles} />
                        <ol className={styles.journeySteps}>
                            {FOSTER_FLOW.map((step, index) => (
                                <li key={step}>
                                    <span>{String(index + 1).padStart(2, "0")}</span>
                                    <strong>{step}</strong>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <div className={styles.wireframeShowcaseIntro}>
                        <span className={styles.eyebrow}>PROTOTYPE / EARLY SCREENS</span>
                        <ScrollHighlight id="design-wireframes-heading" as="h3" text="Giving the ideas a shape." revealedWords={revealedWords} styles={styles} />
                        <ScrollHighlight id="design-wireframes-copy" text="Exploring information hierarchy, navigation and the key moments in each user’s journey." revealedWords={revealedWords} styles={styles} />
                    </div>

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

            <article

                ref={(element) => {

                    chaptersRef.current[2] = element;

                }}

                className={styles.chapter}

                id="project-testing"

            >

                <div className={styles.chapterContent}>

                    <header className={styles.chapterHeading}>

                        <span className={styles.eyebrow}>03 / PROTOTYPE, TEST & ITERATE</span>

                        <ScrollHighlight id="testing-title" as="h2" revealedWords={revealedWords} text={"From wireframe\nto working platform."} styles={styles} />

                        <ScrollHighlight

                            id="testing-description"

                            revealedWords={revealedWords}

                            text="I translated the designs into a working platform, then tested key journeys across three roles to find where interactions, permissions and information sharing broke down."

                            styles={styles}

                        />

                    </header>

                    <section className={styles.testingComparison}>

                        <div className={styles.testingSectionMeta}>

                            <span>01 / FROM DESIGN TO CODE</span>

                            <span>INTERACTIVE MAP</span>

                        </div>

                        <div className={styles.testingComparisonGrid}>

                            <figure className={styles.testingCompareItem}>

                                <div className={styles.testingImageFrame}>

                                    <img src="/images/projects/Dieren_zoeken-3.png" alt="Initial wireframe of the animal discovery map" loading="lazy" />

                                </div>

                                <figcaption>

                                    <span>01 — WIREFRAME</span>

                                    <span>Exploring the structure</span>

                                </figcaption>

                            </figure>

                            <figure className={styles.testingCompareItem}>

                                <div className={styles.testingImageFrame}>

                                    <img src="/images/projects/interactive_map.png" alt="Developed interactive animal discovery map" loading="lazy" />

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

                            text="The first wireframe helped establish the discovery flow. Building it as an interactive map revealed how filtering, location and animal information had to work together — not just look good on screen."

                            styles={styles}

                        />

                    </section>

                    <section className={styles.testingFeatures}>

                        <div className={styles.testingSectionMeta}>

                            <span>02 / FUNCTIONAL TESTING</span>

                            <span>THREE CONNECTED ROLES</span>

                        </div>

                        <ScrollHighlight id="testing-features-title" as="h3" className={styles.impactTitle} revealedWords={revealedWords} text="Making the experience work." styles={styles} />

                        <ScrollHighlight

                            id="testing-features-intro"

                            className={styles.supportText}

                            revealedWords={revealedWords}

                            text="I carried out role-based functional tests, moving between foster family, shelter and veterinarian accounts to check applications, records, tasks and appointments."

                            styles={styles}

                        />

                        <div className={styles.testingFeatureGrid}>

                            <figure className={styles.testingFeatureCard}>

                                <div className={styles.testingFeatureImage}>

                                    <img src="/images/projects/aanvraag.png" alt="Animal shelter reviewing a foster care application" loading="lazy" />

                                </div>

                                <figcaption>

                                    <span>01 / APPLICATION FLOW</span>

                                    <ScrollHighlight id="testing-feature-application-title" as="h4" text="From request to approval." revealedWords={revealedWords} styles={styles} />

                                    <ScrollHighlight id="testing-feature-application-copy" text="Testing how foster care applications are received, reviewed and approved by animal shelters." revealedWords={revealedWords} styles={styles} />

                                </figcaption>

                            </figure>

                            <figure className={styles.testingFeatureCard}>

                                <div className={styles.testingFeatureImage}>

                                    <img src="/images/projects/dossier.png" alt="Animal dossier with health and care information" loading="lazy" />

                                </div>

                                <figcaption>

                                    <span>02 / ANIMAL DOSSIER</span>

                                    <ScrollHighlight id="testing-feature-dossier-title" as="h4" text="One place for every detail." revealedWords={revealedWords} styles={styles} />

                                    <ScrollHighlight id="testing-feature-dossier-copy" text="Organising animal information, medical records and appointments in a clear and accessible layout." revealedWords={revealedWords} styles={styles} />

                                </figcaption>

                            </figure>

                            <figure className={`${styles.testingFeatureCard} ${styles.testingFeatureWide}`}>

                                <div className={styles.testingFeatureImage}>

                                    <img src="/images/projects/task.png" alt="Veterinarian task creation interface" loading="lazy" />

                                </div>

                                <figcaption>

                                    <span>03 / TASK MANAGEMENT</span>

                                    <ScrollHighlight id="testing-feature-tasks-title" as="h4" text="Keeping care organised." revealedWords={revealedWords} styles={styles} />

                                    <ScrollHighlight id="testing-feature-tasks-copy" text="Testing how veterinarians can create tasks, connect them to animals and keep track of important care activities." revealedWords={revealedWords} styles={styles} />

                                </figcaption>

                            </figure>

                        </div>

                    </section>

                    {/* ITERATE — documented findings from functional testing. */}
                    <section className={styles.iterationSection}>
                        <div className={styles.editorialIntro}>
                            <span className={styles.eyebrow}>TEST & ITERATE / WHAT CHANGED?</span>
                            <ScrollHighlight id="testing-iteration-heading" as="h3" text="The details made the difference." revealedWords={revealedWords} styles={styles} />
                            <ScrollHighlight id="testing-iteration-copy" text="Testing the real flows exposed issues that a static wireframe couldn’t reveal. These are three refinements that made the experience more consistent." revealedWords={revealedWords} styles={styles} />
                        </div>
                        <div className={styles.iterationList}>
                            {TEST_ITERATIONS.map((item) => (
                                <article className={styles.iterationRow} key={item.number}>
                                    <span className={styles.iterationIndex}>{item.number}</span>
                                    <div className={styles.iterationMain}>
                                        <ScrollHighlight id={`testing-iteration-${item.number}-title`} as="h4" text={item.title} revealedWords={revealedWords} styles={styles} />
                                        <div className={styles.iterationPair}>
                                            <div>
                                                <span className={styles.miniLabel}>FOUND DURING TESTING</span>
                                                <ScrollHighlight id={`testing-iteration-${item.number}-problem`} text={item.problem} revealedWords={revealedWords} styles={styles} />
                                            </div>
                                            <div>
                                                <span className={styles.miniLabel}>WHAT I CHANGED</span>
                                                <ScrollHighlight id={`testing-iteration-${item.number}-improvement`} text={item.iteration} revealedWords={revealedWords} styles={styles} />
                                            </div>
                                        </div>
                                        <ScrollHighlight id={`testing-iteration-${item.number}-learning`} as="strong" className={styles.iterationLearning} text={item.learning} revealedWords={revealedWords} styles={styles} />
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className={styles.testingReflection}>

                        <span className={styles.eyebrow}>WHAT I LEARNED</span>

                        <ScrollHighlight id="testing-reflection" as="h3" revealedWords={revealedWords} text="Design is a system, not a collection of screens." styles={styles} />

                        <ScrollHighlight

                            id="testing-reflection-description"

                            revealedWords={revealedWords}

                            text="Role-based testing taught me to look beyond individual screens. A useful experience depends on how applications, appointments, notifications and medical information work together — and on being willing to revisit an earlier design decision."

                            styles={styles}

                        />

                    </section>

                </div>

            </article>

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

                        description="An interactive prototype shaped by research, intentional design decisions and role-based iteration."

                        prefix="final"

                        revealedWords={revealedWords}

                        className={styles.finalHeader}

                        styles={styles}

                    />

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

                    {/* OUTCOME — no unverified adoption or shelter impact claims. */}
                    <section className={styles.outcomeSection}>
                        <div className={styles.editorialIntro}>
                            <span className={styles.eyebrow}>THE OUTCOME / ONE CONNECTED PROTOTYPE</span>
                            <ScrollHighlight id="final-outcome-heading" as="h3" text={"Designed for people.\nBuilt with purpose."} revealedWords={revealedWords} styles={styles} />
                            <ScrollHighlight id="final-outcome-copy" text="Het Mandje brings discovery, foster applications and animal care workflows into one interactive prototype — designed around the needs of three connected roles." revealedWords={revealedWords} styles={styles} />
                        </div>
                        <div className={styles.outcomeGrid}>
                            {SOLUTION_OUTCOMES.map((item) => (
                                <div className={styles.outcomeItem} key={item.number}>
                                    <span>{item.number} / {item.name}</span>
                                    <ScrollHighlight id={`final-outcome-${item.number}-copy`} text={item.description} revealedWords={revealedWords} styles={styles} />
                                </div>
                            ))}
                        </div>
                        <div className={styles.outcomeReflection}>
                            <span className={styles.miniLabel}>MY BIGGEST TAKEAWAY</span>
                            <ScrollHighlight id="final-outcome-reflection" text="Good UX starts with understanding people, but it improves when you test the connections between their needs, your design and the working product." revealedWords={revealedWords} styles={styles} />
                            <ScrollHighlight id="final-outcome-next-step" as="span" className={styles.outcomeFuture} text="Next step: validate the prototype with external foster families, shelters and veterinarians before a real-world launch." revealedWords={revealedWords} styles={styles} />
                        </div>
                    </section>

                    <section className={styles.bruzzSection}>

                        <span className={styles.eyebrow}>FEATURED ON BRUZZ</span>

                        <ScrollHighlight id="final-bruzz-title" as="h3" text="A story worth sharing." revealedWords={revealedWords} styles={styles} />

                        <ScrollHighlight id="final-bruzz-description" text="At the Erasmus Shift Festival, I presented Het Mandje and shared the story behind my graduation project in a BRUZZ interview." revealedWords={revealedWords} styles={styles} />

                        <a href={BRUZZ_URL} className={styles.bruzzFeatureCard} target="_blank" rel="noopener noreferrer" aria-label="Open BRUZZ coverage and interview">

                            <div className={styles.bruzzImageWrap}>

                                <img src={`${BASE}/bruzz-feature.png`} alt="BRUZZ article and video featuring Het Mandje" loading="lazy" />

                                <span className={styles.bruzzImageLabel}>BRUZZ / 2026</span>

                            </div>

                            <div className={styles.bruzzFeatureFooter}>

                                <div className={styles.bruzzFeatureText}>

                                    <span>PRESS FEATURE</span>

                                    <ScrollHighlight id="final-bruzz-card-heading" as="strong" text="Read & watch the story" revealedWords={revealedWords} styles={styles} />

                                    <ScrollHighlight id="final-bruzz-card-copy" text="Read the full article and watch the interview. My part starts at 04:13." revealedWords={revealedWords} styles={styles} />

                                </div>

                                <span className={styles.bruzzFeatureArrow} aria-hidden="true">

                                    ↗

                                </span>

                            </div>

                        </a>

                    </section>

                    <section className={styles.magazineSection}>

                        <span className={styles.eyebrow}>THE COMPLETE PROCESS</span>

                        <div className={styles.magazineCard}>

                            <div className={styles.magazineCover}>

                                <img src={`${BASE}/magazine-cover.png`} alt="Cover of Het Mandje magazine" loading="lazy" />

                            </div>

                            <div className={styles.magazineInfo}>

                                <span className={styles.magazineLabel}>GRADUATION PROJECT / DIGITAL MAGAZINE</span>

                                <ScrollHighlight id="final-magazine-title" as="h3" text="Curious about the process?" revealedWords={revealedWords} styles={styles} />

                                <ScrollHighlight id="final-magazine-copy" text="Explore the complete journey behind Het Mandje: survey research, competitor analysis, personas, customer journeys, MoSCoW prioritisation, wireframes, development and role-based testing." revealedWords={revealedWords} styles={styles} />

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

    );

}
