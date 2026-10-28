import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { AudioProvider, useAudio } from "./context/AudioContext";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import SoundButton from "./components/SoundButton/SoundButton";

// Split routes into separate JavaScript chunks.
// Only the current page needs to be loaded initially.
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));

// Shorter intro, while preserving the original loading screen and fade.
// Raise LOADING_DURATION if you prefer a longer, cinematic introduction.
const LOADING_DURATION = 3000;
const FADE_DURATION = 550;

function RouteFallback() {
  const { pathname } = useLocation();
  const dark = pathname === "/about";

  return (
    <div
      aria-hidden="true"
      style={{
        minHeight: "100svh",
        backgroundColor: dark ? "#131416" : "#ffffff",
      }}
    />
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}

/**
 * Loading has its own state, separate from the real page.
 * Updating the progress bar therefore does not rerender Home,
 * the CD gallery, projects or the sound button.
 */
function LoadingOverlay() {
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [finished, setFinished] = useState(false);
  const elapsedRef = useRef(0);

  const { pausePlayback, resumePlayback } = useAudio();

  function togglePause() {
    if (exiting || finished) return;

    if (paused) {
      resumePlayback();
      setPaused(false);
    } else {
      pausePlayback();
      setPaused(true);
    }
  }

  useEffect(() => {
    if (paused || exiting || finished) return;

    let frame = null;
    let previousTime = null;

    function animate(time) {
      if (previousTime !== null) {
        elapsedRef.current += Math.min(time - previousTime, 100);
      }
      previousTime = time;

      const nextProgress = Math.min(
        100,
        Math.round((elapsedRef.current / LOADING_DURATION) * 100)
      );

      // React skips the update when the integer percentage is unchanged.
      setProgress((current) =>
        current === nextProgress ? current : nextProgress
      );

      if (elapsedRef.current >= LOADING_DURATION) {
        setProgress(100);
        setExiting(true);
        return;
      }

      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [paused, exiting, finished]);

  useEffect(() => {
    if (!exiting) return;

    const timer = setTimeout(() => setFinished(true), FADE_DURATION);
    return () => clearTimeout(timer);
  }, [exiting]);

  // Prevent accidental scrolling behind the introduction.
  useEffect(() => {
    if (finished) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [finished]);

  if (finished) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483000,
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <LoadingScreen
        progress={progress}
        paused={paused}
        exiting={exiting}
        onTogglePause={togglePause}
      />
    </div>
  );
}

function AppContent() {
  return (
    <>
      {/* The real page now mounts immediately behind the intro. */}
      <AppRoutes />
      <SoundButton />
      <LoadingOverlay />
    </>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AudioProvider>
  );
}
