import { useEffect, useRef, useState } from "react";
import sharedStyles from "../../components/DarkProject/DarkProject.module.css";
import localStyles from "./HetMandje.module.css";
import { combineStyles } from "../../components/DarkProject/shared/combineStyles";
import ScrollHighlight from "../../components/DarkProject/shared/ScrollHighlight";
import AnimatedNumber from "../../components/DarkProject/shared/AnimatedNumber";
import SectionTitle from "../../components/DarkProject/shared/SectionTitle";

const styles = combineStyles(sharedStyles, localStyles);
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
    const observer = new IntersectionObserver(([entry]) => {
      setStatsVisible(entry.isIntersecting);
    }, { threshold: 0.15 });
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

                            <ScrollHighlight id="research-title" as="h2" className={styles.heroTitle} revealedWords={revealedWords} text={"Every animal deserves\na safe place."} styles={styles} />

                            <ScrollHighlight id="research-question" className={styles.heroQuestion} revealedWords={revealedWords} text="But what happens when animal shelters run out of space?" styles={styles} />

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

                                text="Overcrowding was not just something I encountered through desk research. During my internship at Dierenbescherming Mechelen, I experienced the challenges of animal care and limited capacity first-hand." styles={styles} />

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

                            eyebrow="02 / WIREFRAMES"

                            title={"One platform.\nThree different users."}

                            description="Designing intuitive experiences for foster families, animal shelters and veterinarians."

                            prefix="wireframes"

                            revealedWords={revealedWords}

                            className={styles.wireframeHeader} styles={styles} />

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

      <span className={styles.eyebrow}>

        03 / TESTING & DEVELOPMENT

      </span>

      <ScrollHighlight

        id="testing-title"

        as="h2"

        revealedWords={revealedWords}

        text={"From wireframe\nto working platform."} styles={styles} />

      <ScrollHighlight

        id="testing-description"

        revealedWords={revealedWords}

        text="Turning designs into functional experiences meant testing more than just the interface. I explored how features, data and different user roles work together." styles={styles} />

    </header>

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

        text="The initial wireframe became an interactive map where users can explore animal shelters and discover animals by location. Building the feature helped me translate a visual concept into a functional user experience." styles={styles} />

    </section>

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

        text="Making the experience work." styles={styles} />

      <ScrollHighlight

        id="testing-features-intro"

        className={styles.supportText}

        revealedWords={revealedWords}

        text="I tested the platform from the perspectives of foster families, animal shelters and veterinarians, focusing on the interactions and information shared between them." styles={styles} />

      <div className={styles.testingFeatureGrid}>

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

    <section className={styles.testingReflection}>

      <span className={styles.eyebrow}>

        WHAT I LEARNED

      </span>

      <ScrollHighlight

        id="testing-reflection"

        as="h3"

        revealedWords={revealedWords}

        text="A design is only truly tested when people can use it." styles={styles} />

      <ScrollHighlight

        id="testing-reflection-description"

        revealedWords={revealedWords}

        text="Working across three connected user roles taught me to look beyond individual screens. Every interaction needed to make sense within the larger system, from applications and medical updates to appointments and tasks." styles={styles} />

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

                            description="Het Mandje brings animal shelters, foster families and veterinarians together in one digital platform."

                            prefix="final"

                            revealedWords={revealedWords}

                            className={styles.finalHeader} styles={styles} />

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

                                        <strong>Read & watch the story</strong>

                                        <p>Read the full article and watch the interview. My part starts at 04:13.</p>

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
  );
}
