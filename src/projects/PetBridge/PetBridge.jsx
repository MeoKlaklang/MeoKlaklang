import ScrollHighlight from "../../components/DarkProject/shared/ScrollHighlight";
import darkStyles from "../../components/DarkProject/DarkProject.module.css";

import styles from "./PetBridge.module.css";

const BASE = "/images/petbridge";
import { useRef, useState } from "react";
/*
  Save your images in public/images/petbridge/

  wireframe-01.png
  wireframe-02.png
  final-phones.png

  When your demo is ready:
  - save it as petbridge-demo.mp4
  - replace null with `${BASE}/petbridge-demo.mp4`
*/

const DEMO_VIDEO = `${BASE}/petbridge-demo-web.mp4`;
const WIREFRAMES = [
	{
		src: `${BASE}/wireframe-01.png`,
		label: "01 / ANIMAL DISCOVERY",
	},
	{
		src: `${BASE}/wireframe-02.png`,
		label: "02 / ANIMAL DETAILS",
	},
];

function setChapter(chaptersRef, index, element) {
	if (chaptersRef?.current) {
		chaptersRef.current[index] = element;
	}
}

function ProjectText({ id, as = "p", className, revealedWords, text }) {
	return <ScrollHighlight id={id} as={as} className={className} styles={darkStyles} revealedWords={revealedWords} text={text} />;
}


function AutoPlayDemo({ src }) {
  const videoRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function handleTimeUpdate() {
    const video = videoRef.current;

    if (!video || !video.duration) return;

    setProgress(
      (video.currentTime / video.duration) * 100
    );
  }

  function handleSeek(event) {
    const video = videoRef.current;
    if (!video) return;

    const value = Number(event.target.value);
    setProgress(value);

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      video.currentTime =
        (value / 100) * video.duration;
    }
  }

  async function togglePlayPause() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        console.error("Video playback failed:", error);
      }
    } else {
      video.pause();
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
        preload="auto"
        disablePictureInPicture
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        aria-label="PetBridge mobile app demonstration"
      />

      <div className={styles.videoControls}>
        <button
          type="button"
          className={styles.videoToggle}
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          title={isPlaying ? "Pause" : "Play"}
        >
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
          aria-label="Seek through PetBridge demo"
          style={{
            "--video-progress": `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}


export default function PetBridge({ chaptersRef, revealedWords = {} }) {
	return (
		<div className={styles.project}>
			{/* =====================================
          01 — INTRO
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 0, element)} id="petbridge-intro" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>01 / INTRO</span>

					<ProjectText id="petbridge-intro-title" as="h2" className={styles.introTitle} revealedWords={revealedWords} text="A little closer to finding a forever home." />

					<ProjectText
						id="petbridge-intro-description"
						className={styles.introDescription}
						revealedWords={revealedWords}
						text="For my iOS development course, I designed and built PetBridge, an iPhone app that helps people discover animals available for adoption. The goal was to make finding and connecting with animals and shelters simple and approachable."
					/>

					<div className={styles.projectDetails}>
						<span>IOS DEVELOPMENT</span>
						<span>UI DESIGN</span>
						<span>MOBILE APP</span>
					</div>

					<div className={styles.introDecoration}>
						<span>DESIGNED WITH CARE</span>
						<div className={styles.introLine} />
						<span>2025</span>
					</div>
				</div>
			</section>

			{/* =====================================
          02 — WIREFRAME
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 1, element)} id="petbridge-wireframe" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>02 / WIREFRAME</span>

					<ProjectText id="petbridge-wireframe-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="Making every interaction feel simple." />

					<ProjectText
						id="petbridge-wireframe-description"
						className={styles.sectionDescription}
						revealedWords={revealedWords}
						text="I explored how users could browse animals, find relevant information and move naturally between different screens. The wireframes helped define a clear and intuitive mobile experience."
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

			<section ref={(element) => setChapter(chaptersRef, 2, element)} id="petbridge-final" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>03 / FINAL</span>

					<ProjectText id="petbridge-final-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="A friendly experience, built for animal lovers." />

					<ProjectText
						id="petbridge-final-description"
						className={styles.sectionDescription}
						revealedWords={revealedWords}
						text="The final design combines soft colours, playful details and clear navigation to make discovering animals and their stories feel personal and accessible."
					/>

					<figure className={styles.finalShowcase}>
						<img src={`${BASE}/final-phones.png`} alt="PetBridge final iOS app designs shown on five iPhone mockups" loading="lazy" />

						<figcaption>PETBRIDGE / FINAL INTERFACE DESIGN</figcaption>
					</figure>
				</div>
			</section>

			{/* =====================================
          04 — DEMO
      ===================================== */}

			<section ref={(element) => setChapter(chaptersRef, 3, element)} id="petbridge-demo" className={styles.chapter}>
				<div className={styles.chapterInner}>
					<span className={styles.eyebrow}>04 / DEMO</span>

					<ProjectText id="petbridge-demo-title" as="h2" className={styles.sectionTitle} revealedWords={revealedWords} text="See PetBridge in action." />

					<ProjectText id="petbridge-demo-description" className={styles.sectionDescription} revealedWords={revealedWords} text="A closer look at how the app works, from browsing animals to exploring their profiles." />

					<div className={styles.demoArea}>
						<AutoPlayDemo src={DEMO_VIDEO} />
					</div>

					<div className={styles.projectEnding}>
						<span>END OF RECORD 03</span>
						<div className={styles.endingLine} />
						<span>MADE WITH CARE</span>
					</div>
				</div>
			</section>
		</div>
	);
}
