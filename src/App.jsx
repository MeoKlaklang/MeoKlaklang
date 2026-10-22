
import { useEffect, useRef, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Audio
import {
  AudioProvider,
  useAudio,
} from "./context/AudioContext";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";

// Components
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import SoundButton from "./components/SoundButton/SoundButton";

// Loading settings
const LOADING_DURATION = 6500;
const FADE_DURATION = 850;

/* ====================================
   WEBSITE ROUTES
==================================== */

function AppRoutes() {
  return (
    <Routes>
      {/* Homepage with interactive CD gallery */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* Projects overview — all five projects */}
      <Route
        path="/projects"
        element={<Projects />}
      />

      {/* About Me */}
      <Route
        path="/about"
        element={<About />}
      />


    </Routes>
  );
}

/* ====================================
   MAIN APP CONTENT
==================================== */

function AppContent() {
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [finished, setFinished] = useState(false);

  const elapsedRef = useRef(0);

  const {
    pausePlayback,
    resumePlayback,
  } = useAudio();

  /* ====================================
     PAUSE / RESUME LOADING
  ==================================== */

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

  /* ====================================
     LOADING PROGRESS
  ==================================== */

  useEffect(() => {
    if (paused || exiting || finished) return;

    let animationFrame;
    let previousTime = null;

    function animate(time) {
      if (previousTime !== null) {
        elapsedRef.current += Math.min(
          time - previousTime,
          100
        );
      }

      previousTime = time;

      const nextProgress = Math.min(
        100,
        Math.round(
          (elapsedRef.current / LOADING_DURATION) * 100
        )
      );

      setProgress(nextProgress);

      if (elapsedRef.current >= LOADING_DURATION) {
        setProgress(100);
        setExiting(true);
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [paused, exiting, finished]);

  /* ====================================
     FADE OUT AFTER LOADING
  ==================================== */

  useEffect(() => {
    if (!exiting) return;

    const timer = setTimeout(() => {
      setFinished(true);
    }, FADE_DURATION);

    return () => clearTimeout(timer);
  }, [exiting]);

  /* ====================================
     LOADING SCREEN
  ==================================== */

  if (!finished) {
    return (
      <LoadingScreen
        progress={progress}
        paused={paused}
        exiting={exiting}
        onTogglePause={togglePause}
      />
    );
  }

  /* ====================================
     PORTFOLIO + GLOBAL SOUND BUTTON
  ==================================== */

  return (
    <>
      <AppRoutes />

      {/* Always visible on portfolio pages */}
      <SoundButton />
    </>
  );
}

/* ====================================
   APP PROVIDERS
==================================== */

export default function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AudioProvider>
  );
}
