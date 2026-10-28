
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  AudioProvider,
  useAudio,
} from "./context/AudioContext";

import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import SoundButton from "./components/SoundButton/SoundButton";

/* =========================================
   CINEMATIC LOADING EXPERIENCE
========================================= */

const LOADING_DURATION = 6500;
const FADE_DURATION = 850;

const IMAGE_TIMEOUT = 4500;
const MAX_TOTAL_WAIT = 11000;
const MAX_PRELOAD_IMAGES = 8;

/* =========================================
   PAGE LOADING

   Home code loads during the intro,
   but Home itself mounts AFTER the intro.
========================================= */

const loadHomePage = () => import("./pages/Home");
const Home = lazy(loadHomePage);

const loadAboutPage = () => import("./pages/About");
const About = lazy(loadAboutPage);

const Projects = lazy(() => import("./pages/Projects"));

/* =========================================
   IMAGE PRELOADING UTILITIES
========================================= */

function sameOriginImageUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value, window.location.origin);

    if (url.origin !== window.location.origin) {
      return null;
    }

    if (!/\.(avif|webp|png|jpe?g|gif|svg)(\?|$)/i.test(url.href)) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();

    let settled = false;

    const finish = () => {
      if (settled) return;

      settled = true;

      clearTimeout(timer);

      image.onload = null;
      image.onerror = null;

      resolve();
    };

    const timer = setTimeout(finish, IMAGE_TIMEOUT);

    image.onload = async () => {
      try {
        if (typeof image.decode === "function") {
          await image.decode();
        }
      } catch {
        // Image decoding failure should not block the intro.
      }

      finish();
    };

    image.onerror = finish;

    image.src = url;

    if (image.complete && image.naturalWidth > 0) {
      finish();
    }
  });
}

async function preloadFirstScreenImages() {
  const urls = new Set();

  // Collect images already present in the document.
  for (const image of document.images) {
    const box = image.getBoundingClientRect();

    const nearTop =
      box.bottom > -10 &&
      box.top < window.innerHeight * 1.5;

    if (!nearTop) continue;

    const url = sameOriginImageUrl(
      image.currentSrc || image.src
    );

    if (url) {
      urls.add(url);
    }
  }

  // Collect project cover images from your project data.
  try {
    const { projects = [] } = await import("./data/projects");

    const fields = [
      "image",
      "cover",
      "coverImage",
      "thumbnail",
      "artwork",
    ];

    for (const project of projects) {
      for (const field of fields) {
        const url = sameOriginImageUrl(project?.[field]);

        if (url) {
          urls.add(url);
          break;
        }
      }
    }
  } catch (error) {
    console.warn(
      "Optional project cover preload skipped:",
      error
    );
  }

  const priorityUrls = [...urls].slice(
    0,
    MAX_PRELOAD_IMAGES
  );

  await Promise.all(priorityUrls.map(preloadImage));
}

/* =========================================
   ROUTE FALLBACK
========================================= */

function RouteFallback() {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        minHeight: "100svh",
        background:
          pathname === "/about" ? "#131416" : "#fff",
      }}
    />
  );
}

/* =========================================
   PAGE READY SIGNAL
========================================= */

function PageReadySignal({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
}

/* =========================================
   ROUTES

   IMPORTANT:
   Home only mounts after introDone is true.

   This prevents the CD entrance animation
   from playing behind the loading screen.
========================================= */

function AppRoutes({ onReady, introDone }) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            introDone ? <Home /> : <RouteFallback />
          }
        />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/about"
          element={<About />}
        />
      </Routes>

      <PageReadySignal onReady={onReady} />
    </Suspense>
  );
}

/* =========================================
   LOADING OVERLAY

   Progress updates are isolated here,
   preventing unnecessary App rerenders.
========================================= */

function LoadingOverlay({ pageReady, onFinish }) {
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [finished, setFinished] = useState(false);

  const elapsedRef = useRef(0);

  const {
    pausePlayback,
    resumePlayback,
  } = useAudio();

  /* =========================================
     PAUSE / RESUME
  ========================================= */

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

  /* =========================================
     PRELOAD IMAGES
  ========================================= */

  useEffect(() => {
    let active = true;

    preloadFirstScreenImages().finally(() => {
      if (active) {
        setAssetsReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  /* =========================================
     ANIMATED LOADING PROGRESS
  ========================================= */

  useEffect(() => {
    if (paused || exiting || finished) return;

    let frame = null;
    let previousTime = null;

    function tick(time) {
      if (previousTime !== null) {
        elapsedRef.current += Math.min(
          time - previousTime,
          100
        );
      }

      previousTime = time;

      const elapsed = elapsedRef.current;

      const canLeave =
        elapsed >= LOADING_DURATION &&
        (
          (assetsReady && pageReady) ||
          elapsed >= MAX_TOTAL_WAIT
        );

      if (canLeave) {
        setProgress(100);
        setExiting(true);
        return;
      }

      const nextProgress = Math.min(
        98,
        Math.floor(
          (elapsed / LOADING_DURATION) * 98
        )
      );

      setProgress((old) =>
        old === nextProgress ? old : nextProgress
      );

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [
    paused,
    exiting,
    finished,
    assetsReady,
    pageReady,
  ]);

  /* =========================================
     FINISH LOADING SCREEN
  ========================================= */

  useEffect(() => {
    if (!exiting) return;

    const timeout = setTimeout(() => {
      setFinished(true);
      onFinish();
    }, FADE_DURATION);

    return () => {
      clearTimeout(timeout);
    };
  }, [exiting, onFinish]);

  /* =========================================
     LOCK SCROLL DURING INTRO
  ========================================= */

  useEffect(() => {
    if (finished) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
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
        background: "#fff",
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

/* =========================================
   MAIN APP CONTENT
========================================= */

function AppContent() {
  const { pathname } = useLocation();

  const [pageReady, setPageReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [homeCodeReady, setHomeCodeReady] =
    useState(false);

  const handlePageReady = useCallback(() => {
    setPageReady(true);
  }, []);

  const handleIntroFinish = useCallback(() => {
    setIntroDone(true);
  }, []);

  /* =========================================
     PRELOAD HOME CODE

     Download Home while the intro plays.

     Do NOT mount Home yet.
     Its CD animations must start after
     the loading screen disappears.
  ========================================= */

  useEffect(() => {
    if (pathname !== "/") {
      setHomeCodeReady(true);
      return;
    }

    let active = true;

    loadHomePage()
      .then(() => {
        if (active) {
          setHomeCodeReady(true);
        }
      })
      .catch((error) => {
        console.info(
          "Home preload skipped:",
          error
        );

        // Don't block the loading screen forever.
        if (active) {
          setHomeCodeReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  /* =========================================
     PREFETCH ABOUT

     About is downloaded in the background
     so navigation is faster later.

     It is NOT mounted here.
  ========================================= */

  useEffect(() => {
    if (
      !pageReady ||
      pathname === "/about"
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadAboutPage().catch((error) => {
        console.info(
          "About prefetch skipped:",
          error
        );
      });
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pageReady, pathname]);

  /* =========================================
     RENDER
  ========================================= */

  return (
    <>
      <AppRoutes
        onReady={handlePageReady}
        introDone={introDone}
      />

      <SoundButton />

      {!introDone && (
        <LoadingOverlay
          pageReady={
            pageReady && homeCodeReady
          }
          onFinish={handleIntroFinish}
        />
      )}
    </>
  );
}

/* =========================================
   APP
========================================= */

export default function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AudioProvider>
  );
}
