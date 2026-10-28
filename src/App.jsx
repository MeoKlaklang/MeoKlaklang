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
   YOUR CINEMATIC LOADING EXPERIENCE

   A minimum 6.5-second introduction.
   The actual page mounts behind the intro.
   Critical images preload during the intro.
========================================= */

const LOADING_DURATION = 6500;
const FADE_DURATION = 850;

// If a critical image is slow or missing, the visitor isn't stuck forever.
const IMAGE_TIMEOUT = 4500;
const MAX_TOTAL_WAIT = 11000;
const MAX_PRELOAD_IMAGES = 8;

// Pages are downloaded separately. The current route starts mounting
// immediately while the intro stays on top.
const Home = lazy(() => import("./pages/Home"));

// Share one module loader between the route and background prefetch.
// The browser caches the module once downloaded.
const loadAboutPage = () => import("./pages/About");
const About = lazy(loadAboutPage);

const Projects = lazy(() => import("./pages/Projects"));

/* =========================================
   IMAGE PRELOADING UTILITIES
========================================= */

function sameOriginImageUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    if (!/\.(avif|webp|png|jpe?g|gif|svg)(\?|$)/i.test(url.href)) return null;
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
      resolve(); // Failed assets shouldn't trap visitors in the intro.
    };

    const timer = setTimeout(finish, IMAGE_TIMEOUT);

    image.onload = async () => {
      try {
        // Decode the image before displaying it if supported.
        if (typeof image.decode === "function") await image.decode();
      } catch {
        // Browsers may reject decode even when the image can be shown.
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

  // 1. Existing images in the first viewport (including loading artwork).
  // The Home route is mounted behind the loading screen at this point.
  for (const image of document.images) {
    const box = image.getBoundingClientRect();
    const nearTop = box.bottom > -10 && box.top < window.innerHeight * 1.5;
    if (!nearTop) continue;

    const url = sameOriginImageUrl(image.currentSrc || image.src);
    if (url) urls.add(url);
  }

  // 2. Collect project cover images when your data/projects records expose
  // one of these common properties. No image filenames are invented.
  try {
    const { projects = [] } = await import("./data/projects");
    const fields = ["image", "cover", "coverImage", "thumbnail", "artwork"];

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
    console.warn("Optional project cover preload skipped:", error);
  }

  const priorityUrls = [...urls].slice(0, MAX_PRELOAD_IMAGES);
  await Promise.all(priorityUrls.map(preloadImage));
}

/* =========================================
   ROUTES & READY SIGNAL
========================================= */

function RouteFallback() {
  const { pathname } = useLocation();
  return (
    <div
      style={{
        minHeight: "100svh",
        background: pathname === "/about" ? "#131416" : "#fff",
      }}
    />
  );
}

function PageReadySignal({ onReady }) {
  useEffect(() => {
    // This runs once the current lazy-loaded page is mounted.
    onReady();
  }, [onReady]);
  return null;
}

function AppRoutes({ onReady }) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <PageReadySignal onReady={onReady} />
    </Suspense>
  );
}

/* =========================================
   LOADING OVERLAY

   Progress is isolated in this component so its state updates don't
   cause your homepage / vinyl gallery to rerender on every frame.
========================================= */

function LoadingOverlay({ pageReady, onFinish }) {
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
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

  // Preload critical assets once while the cinematic intro plays.
  useEffect(() => {
    let active = true;

    preloadFirstScreenImages().finally(() => {
      if (active) setAssetsReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  // Animated intro: always at least LOADING_DURATION, then finish when
  // route + critical images are ready (or after a safety timeout).
  useEffect(() => {
    if (paused || exiting || finished) return;

    let frame = null;
    let previousTime = null;

    function tick(time) {
      if (previousTime !== null) {
        elapsedRef.current += Math.min(time - previousTime, 100);
      }
      previousTime = time;

      const elapsed = elapsedRef.current;
      const canLeave =
        elapsed >= LOADING_DURATION &&
        ((assetsReady && pageReady) || elapsed >= MAX_TOTAL_WAIT);

      if (canLeave) {
        setProgress(100);
        setExiting(true);
        return;
      }

      // 98% means the intro is complete, but critical elements are still
      // being prepared. It won't misleadingly jump to 100% too early.
      const nextProgress = Math.min(
        98,
        Math.floor((elapsed / LOADING_DURATION) * 98)
      );
      setProgress((old) => (old === nextProgress ? old : nextProgress));
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [paused, exiting, finished, assetsReady, pageReady]);

  useEffect(() => {
    if (!exiting) return;
    const timeout = setTimeout(() => {
      setFinished(true);
      onFinish();
    }, FADE_DURATION);
    return () => clearTimeout(timeout);
  }, [exiting, onFinish]);

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

function AppContent() {
  const [pageReady, setPageReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const handlePageReady = useCallback(() => setPageReady(true), []);
  const handleIntroFinish = useCallback(() => setIntroDone(true), []);

  // Download About (and its imported JS/CSS) in the background while
  // the cinematic intro is still playing. This short delay gives Home's
  // first-screen assets priority, instead of fetching everything at once.
  // No About component is mounted yet: its scroll effects stay inactive.
  useEffect(() => {
    if (!pageReady || window.location.pathname === "/about") return;

    const timer = window.setTimeout(() => {
      void loadAboutPage().catch((error) => {
        // Failed prefetch is non-fatal: React.lazy will retry on navigation.
        console.info("About prefetch skipped:", error);
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [pageReady]);

  return (
    <>
      {/* Mount the real page behind the intro to warm up route + images. */}
      <AppRoutes onReady={handlePageReady} />
      <SoundButton />

      {!introDone && (
        <LoadingOverlay
          pageReady={pageReady}
          onFinish={handleIntroFinish}
        />
      )}
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
