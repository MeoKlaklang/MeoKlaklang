
import {
  useEffect,
  useRef,
  useState,
} from "react";

import ProjectCard from "../ProjectCard/ProjectCard";
import { projects } from "../../data/projects";

import styles from "./DiagonalGallery.module.css";

/* =====================================
   SETTINGS
===================================== */

// Desktop automatic orbit
const AUTO_SPEED = 0.00016;

// Mobile automatic vertical ring
const MOBILE_AUTO_SPEED = 0.000015;

// Pause after mobile interaction (ms)
const MOBILE_RESUME_DELAY = 2500;

// Drag sensitivity
const DESKTOP_DRAG_SPEED = 0.005;
const MOBILE_DRAG_SPEED = 0.008;

// Swipe settings
const SWIPE_THRESHOLD = 8;

// Desktop spin-open animation
const INTRO_DURATION = 2200;

const TAU = Math.PI * 2;

/* =====================================
   HELPERS
===================================== */

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const wrap = (value, length) =>
  ((value % length) + length) % length;

const smoothstep = (value) => {
  const t = clamp(value);

  return t * t * (3 - 2 * t);
};

const lerp = (a, b, t) =>
  a + (b - a) * t;

/* =====================================
   DESKTOP ORBIT

   Compact diagonal orbit.
===================================== */

function getOrbitPosition(index, position) {
  const count = Math.max(
    projects.length,
    1
  );

  const angle =
    ((index - position) / count) * TAU;

  const along = Math.sin(angle);
  const across = Math.cos(angle);

  /* Compact orbit */

  const radiusX = 285;
  const radiusY = 185;

  const crossX = 84;
  const crossY = 55;

  const x =
    along * radiusX +
    across * crossX;

  const y =
    -along * radiusY +
    across * crossY;

  const z =
    -175 + across * 165;

  const depth =
    (across + 1) / 2;

  return {
    x,
    y,
    z,
    depth,
    angle,
  };
}

/* =====================================
   MOBILE VERTICAL MOMENTUM RING

   The nearest CD is at the front.

   Other CDs travel vertically around
   a 3D ellipse.

   Because we use sin/cos, the ring
   rotates endlessly without resetting.
===================================== */

function getMobileRingPosition(index, position) {
  const count = Math.max(
    projects.length,
    1
  );

  const offset =
    wrap(
      index - position + count / 2,
      count
    ) - count / 2;

  const angle =
    (offset / count) * TAU;

  const sine = Math.sin(angle);
  const cosine = Math.cos(angle);

  return {
    x: (1 - cosine) * 15,

    y: sine * 170,

    z: (cosine - 1) * 190,

    rotateX: -sine * 20,

    depth: (cosine + 1) / 2,

    opacity: clamp(
      (cosine + 0.55) / 1.55,
      0,
      1
    ),

    front: cosine > 0.72,
  };
}

/* =====================================
   DIAGONAL GALLERY
===================================== */

export default function DiagonalGallery({
  scrollProgress = 0,
  selectedProjectId,
  onProjectOpen,
}) {
  /* =====================================
     STATE
  ===================================== */

  const [position, setPosition] =
    useState(0);

  const [introProgress, setIntroProgress] =
    useState(0);

  const [hoveredId, setHoveredId] =
    useState(null);

  const [dragging, setDragging] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(() =>
      typeof window !== "undefined"
        ? window.matchMedia(
            "(max-width: 767px)"
          ).matches
        : false
    );

  /* =====================================
     REFS
  ===================================== */

  const galleryRef = useRef(null);
  const soundRef = useRef(null);

  const positionRef = useRef(0);
  const targetRef = useRef(0);

  const introRef = useRef(0);

  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);

  const pointerRef = useRef(null);
  const didDragRef = useRef(false);

  const isMobileRef = useRef(isMobile);

  const scrollProgressRef = useRef(
    scrollProgress
  );

  const dragClickUntilRef = useRef(0);

  /* =====================================
     NEW: MOBILE AUTO-ROTATION REFS
  ===================================== */

  // When mobile animation may resume
  const mobileResumeAtRef = useRef(0);

  // Whether the user is touching the reel
  const mobileTouchingRef = useRef(false);

  /* =====================================
     RESPONSIVE DETECTION
  ===================================== */

  useEffect(() => {
    const media = window.matchMedia(
      "(max-width: 767px)"
    );

    function updateMobile() {
      const mobile = media.matches;

      isMobileRef.current = mobile;
      setIsMobile(mobile);

      pointerRef.current = null;

      draggingRef.current = false;
      hoveredRef.current = false;
      mobileTouchingRef.current = false;

      setDragging(false);
      setHoveredId(null);

      if (mobile) {
        // Start on the nearest project
        // when switching to mobile.
        const nearest = Math.round(
          positionRef.current
        );

        targetRef.current = nearest;
        positionRef.current = nearest;

        setPosition(nearest);

        mobileResumeAtRef.current =
          performance.now() +
          MOBILE_RESUME_DELAY;
      }
    }

    updateMobile();

    media.addEventListener(
      "change",
      updateMobile
    );

    return () => {
      media.removeEventListener(
        "change",
        updateMobile
      );
    };
  }, []);

  /* =====================================
     KEEP SCROLL PROGRESS UPDATED
  ===================================== */

  useEffect(() => {
    scrollProgressRef.current =
      scrollProgress;
  }, [scrollProgress]);

  /* =====================================
     ORIGINAL SCROLL TRANSITION

     Preserve project opening.
  ===================================== */

  const centering = smoothstep(
    scrollProgress / 0.27
  );

  const othersFade = 1 - smoothstep(
    (scrollProgress - 0.05) / 0.23
  );

  const selectedFade = 1 - smoothstep(
    (scrollProgress - 0.23) / 0.11
  );

  const galleryLocked =
    scrollProgress > 0.035;

  const introFinished =
    introProgress >= 1;

  const idle =
    introFinished &&
    !galleryLocked &&
    !dragging &&
    hoveredId === null;

  /* =====================================
     MOBILE ACTIVE PROJECT
  ===================================== */

  const mobileIndex = wrap(
    Math.round(position),
    projects.length
  );

  const mobileSelectedProject =
    projects[mobileIndex];

  /* =====================================
     ORIGINAL CD SOUND
  ===================================== */

  useEffect(() => {
    const sound = new Audio(
      "/sounds/cd-pop-instant.mp3"
    );

    sound.preload = "auto";
    sound.volume = 0.25;

    soundRef.current = sound;

    return () => {
      sound.pause();
      soundRef.current = null;
    };
  }, []);

  function playSound() {
    const sound = soundRef.current;

    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;

    sound.play().catch(() => {});
  }

  /* =====================================
     ANIMATION LOOP

     DESKTOP
     - Spin-open intro
     - Automatic diagonal orbit
     - Pauses on hover and drag

     MOBILE
     - Gentle automatic vertical movement
     - Pauses while touching
     - Resumes 2.5 seconds after interaction
     - Preserves momentum and snapping
  ===================================== */

  useEffect(() => {
    let frame;

    let lastTime = 0;
    let introStart = null;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    function animate(time) {
      const delta = lastTime
        ? Math.min(
            time - lastTime,
            50
          )
        : 16;

      lastTime = time;

      const reducedMotion =
        motionQuery.matches;

      const locked =
        scrollProgressRef.current > 0.035;

      /* =================================
         DESKTOP SPIN-OPEN INTRO
      ================================= */

      if (introStart === null) {
        introStart = time;
      }

      if (reducedMotion) {
        introRef.current = 1;
      } else {
        introRef.current = clamp(
          (time - introStart) /
            INTRO_DURATION
        );
      }

      setIntroProgress(
        introRef.current
      );

      /* =================================
         DESKTOP AUTOMATIC ORBIT
      ================================= */

      if (
        introRef.current >= 1 &&
        !locked &&
        !reducedMotion &&
        !hoveredRef.current &&
        !draggingRef.current &&
        !isMobileRef.current &&
        !document.hidden
      ) {
        targetRef.current +=
          delta * AUTO_SPEED;
      }

      /* =================================
         MOBILE AUTOMATIC ROTATION

         Slowly move the ring vertically.

         Negative direction creates
         top-to-bottom visual movement.
      ================================= */

      if (
        introRef.current >= 1 &&
        !locked &&
        !reducedMotion &&
        isMobileRef.current &&
        !draggingRef.current &&
        !mobileTouchingRef.current &&
        time >= mobileResumeAtRef.current &&
        !document.hidden
      ) {
        targetRef.current -=
          delta * MOBILE_AUTO_SPEED;
      }

      /* =================================
         SMOOTH MOMENTUM
      ================================= */

      const speed = draggingRef.current
        ? 0.026
        : isMobileRef.current
          ? 0.011
          : 0.009;

      const ease = reducedMotion
        ? 1
        : 1 - Math.exp(
            -delta * speed
          );

      positionRef.current +=
        (
          targetRef.current -
          positionRef.current
        ) * ease;

      /* =================================
         PREVENT VERY LARGE NUMBERS

         The circular positions remain
         identical after each revolution.
      ================================= */

      const count = projects.length;

      if (
        count > 0 &&
        Math.abs(
          positionRef.current
        ) > count * 100
      ) {
        const revolutions = Math.trunc(
          positionRef.current / count
        );

        const shift =
          revolutions * count;

        positionRef.current -= shift;
        targetRef.current -= shift;
      }

      setPosition(
        positionRef.current
      );

      frame = requestAnimationFrame(
        animate
      );
    }

    frame = requestAnimationFrame(
      animate
    );

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  /* =====================================
     MOBILE PAUSE HELPERS
  ===================================== */

  function pauseMobileRotation() {
    if (!isMobileRef.current) return;

    mobileTouchingRef.current = true;
  }

  function resumeMobileRotation() {
    if (!isMobileRef.current) return;

    mobileTouchingRef.current = false;

    mobileResumeAtRef.current =
      performance.now() +
      MOBILE_RESUME_DELAY;
  }

  /* =====================================
     FINISH DRAG

     Desktop:
     - End mouse drag

     Mobile:
     - Preserve swipe momentum
     - Snap to nearest CD
     - Pause auto-rotation
  ===================================== */

  function finishDrag(cancelled = false) {
    const pointer = pointerRef.current;

    if (!pointer) return;

    const wasVertical =
      pointer.axis === "vertical";

    const wasDragging =
      didDragRef.current;

    pointerRef.current = null;
    draggingRef.current = false;

    setDragging(false);

    if (wasDragging) {
      dragClickUntilRef.current =
        Date.now() + 320;
    }

    if (isMobileRef.current) {
      if (
        !cancelled &&
        wasVertical &&
        wasDragging
      ) {
        /* Momentum based on swipe speed */

        const inertia = clamp(
          pointer.velocity * 140,
          -1.25,
          1.25
        );

        targetRef.current = Math.round(
          targetRef.current + inertia
        );

        playSound();
      } else {
        /* No swipe: stay near current CD */

        targetRef.current = Math.round(
          targetRef.current
        );
      }

      resumeMobileRotation();
    }
  }

  /* =====================================
     POINTER CLEANUP
  ===================================== */

  useEffect(() => {
    function onPointerUp() {
      finishDrag(false);
    }

    function onPointerCancel() {
      finishDrag(true);
    }

    window.addEventListener(
      "pointerup",
      onPointerUp
    );

    window.addEventListener(
      "pointercancel",
      onPointerCancel
    );

    return () => {
      window.removeEventListener(
        "pointerup",
        onPointerUp
      );

      window.removeEventListener(
        "pointercancel",
        onPointerCancel
      );
    };
  });

  /* =====================================
     POINTER DOWN
  ===================================== */

  function handlePointerDown(event) {
    if (
      galleryLocked ||
      (
        event.pointerType === "mouse" &&
        event.button !== 0
      )
    ) {
      return;
    }

    didDragRef.current = false;

    pointerRef.current = {
      pointerId: event.pointerId,

      x: event.clientX,
      y: event.clientY,

      startX: event.clientX,
      startY: event.clientY,

      lastTime: event.timeStamp,

      velocity: 0,
      axis: null,
    };

    if (isMobileRef.current) {
      pauseMobileRotation();
    } else {
      draggingRef.current = true;
      setDragging(true);
    }
  }

  /* =====================================
     POINTER MOVE

     Desktop:
     - Mouse glow
     - Parallax
     - Drag to rotate orbit

     Mobile:
     - Vertical swipe
     - Track velocity for momentum
  ===================================== */

  function handlePointerMove(event) {
    const gallery = galleryRef.current;

    /* =================================
       DESKTOP MOUSE PARALLAX
    ================================= */

    if (
      gallery &&
      event.pointerType === "mouse" &&
      !isMobileRef.current
    ) {
      const rect =
        gallery.getBoundingClientRect();

      const mouseX =
        event.clientX - rect.left;

      const mouseY =
        event.clientY - rect.top;

      gallery.style.setProperty(
        "--mouse-x",
        `${mouseX}px`
      );

      gallery.style.setProperty(
        "--mouse-y",
        `${mouseY}px`
      );

      const nx =
        (
          mouseX / rect.width -
          0.5
        ) * 2;

      const ny =
        (
          mouseY / rect.height -
          0.5
        ) * 2;

      const strength =
        1 - centering;

      gallery.style.setProperty(
        "--gallery-rotate-y",
        `${
          nx * 5 * strength
        }deg`
      );

      gallery.style.setProperty(
        "--gallery-rotate-x",
        `${
          -ny * 4 * strength
        }deg`
      );

      gallery.style.setProperty(
        "--gallery-move-x",
        `${
          nx * 15 * strength
        }px`
      );

      gallery.style.setProperty(
        "--gallery-move-y",
        `${
          ny * 12 * strength
        }px`
      );
    }

    /* =================================
       DRAG INTERACTION
    ================================= */

    const pointer =
      pointerRef.current;

    if (
      !pointer ||
      galleryLocked ||
      event.pointerId !==
        pointer.pointerId
    ) {
      return;
    }

    const totalDx =
      event.clientX -
      pointer.startX;

    const totalDy =
      event.clientY -
      pointer.startY;

    const distance = Math.hypot(
      totalDx,
      totalDy
    );

    /* =================================
       MOBILE VERTICAL SWIPE
    ================================= */

    if (isMobileRef.current) {
      if (pointer.axis === null) {
        if (
          distance <
          SWIPE_THRESHOLD
        ) {
          return;
        }

        if (
          Math.abs(totalDx) >
          Math.abs(totalDy)
        ) {
          pointer.axis = "horizontal";
          return;
        }

        pointer.axis = "vertical";

        draggingRef.current = true;
        didDragRef.current = true;

        setDragging(true);
      }

      if (
        pointer.axis !== "vertical"
      ) {
        return;
      }

      const dy =
        event.clientY -
        pointer.y;

      const dt = Math.max(
        8,
        event.timeStamp -
          pointer.lastTime
      );

      const movement =
        -dy * MOBILE_DRAG_SPEED;

      targetRef.current +=
        movement;

      const velocity =
        movement / dt;

      pointer.velocity =
        pointer.velocity * 0.35 +
        velocity * 0.65;

      pointer.y =
        event.clientY;

      pointer.x =
        event.clientX;

      pointer.lastTime =
        event.timeStamp;

      return;
    }

    /* =================================
       DESKTOP DRAG
    ================================= */

    if (
      !draggingRef.current
    ) {
      return;
    }

    const dx =
      event.clientX -
      pointer.x;

    const dy =
      event.clientY -
      pointer.y;

    if (distance > 7) {
      didDragRef.current = true;
    }

    if (didDragRef.current) {
      targetRef.current +=
        (
          -dx + dy
        ) * DESKTOP_DRAG_SPEED;
    }

    pointer.x =
      event.clientX;

    pointer.y =
      event.clientY;
  }

  /* =====================================
     DESKTOP HOVER

     Keeps original spin-open,
     reflection, tilt and sound.
  ===================================== */

  function handleCardEnter(
    id,
    withSound = true
  ) {
    if (
      isMobileRef.current ||
      galleryLocked ||
      draggingRef.current ||
      introRef.current < 1
    ) {
      return;
    }

    hoveredRef.current = true;

    setHoveredId(id);

    if (withSound) {
      playSound();
    }
  }

  function handleCardLeave(id) {
    if (
      isMobileRef.current
    ) {
      return;
    }

    hoveredRef.current = false;

    setHoveredId(
      (current) =>
        current === id
          ? null
          : current
    );
  }

  /* =====================================
     OPEN PROJECT

     Preserves existing onProjectOpen.
  ===================================== */

  function handleOpen(event, project) {
    if (
      didDragRef.current ||
      Date.now() <
        dragClickUntilRef.current ||
      galleryLocked ||
      (
        !isMobileRef.current &&
        introRef.current < 1
      )
    ) {
      event?.preventDefault?.();
      return;
    }

    /* =================================
       MOBILE:
       Only open the currently
       selected front CD.
    ================================= */

    if (
      isMobileRef.current
    ) {
      const selected =
        projects[
          wrap(
            Math.round(
              positionRef.current
            ),
            projects.length
          )
        ];

      if (
        project.id !==
        selected?.id
      ) {
        return;
      }

      // Pause before page transition.
      pauseMobileRotation();
    }

    onProjectOpen?.(project);
  }

  /* =====================================
     DESKTOP CARD STYLE

     Intro:
       One CD appears.
       Others spin out from behind it.

     Afterwards:
       Compact diagonal orbit.
  ===================================== */

  function getDesktopCardStyle(index) {
    const project =
      projects[index];

    const orbit =
      getOrbitPosition(
        index,
        position
      );

    const anchor =
      getOrbitPosition(
        0,
        0
      );

    const isOpeningSelected =
      project.id ===
      selectedProjectId;

    const isHovered =
      hoveredId ===
        project.id &&
      !galleryLocked;

    /* =================================
       INTRO REVEAL
    ================================= */

    let reveal = 1;

    if (index !== 0) {
      const delay =
        0.12 +
        (index - 1) * 0.075;

      reveal = smoothstep(
        (
          introProgress -
          delay
        ) / 0.48
      );
    }

    /* =================================
       SPREAD FROM FIRST CD
    ================================= */

    const x = lerp(
      anchor.x,
      orbit.x,
      reveal
    );

    const y = lerp(
      anchor.y,
      orbit.y,
      reveal
    );

    let z = lerp(
      anchor.z -
        index * 10,
      orbit.z,
      reveal
    );

    const fanRotation =
      index === 0
        ? 0
        : lerp(
            -65 -
              index * 7,
            0,
            reveal
          );

    const introOpacity =
      index === 0
        ? smoothstep(
            introProgress /
              0.22
          )
        : reveal;

    /* =================================
       HOVER DEPTH
    ================================= */

    if (isHovered) {
      z += 85;
    }

    let finalX = x;
    let finalY = y;
    let finalZ = z;

    /* =================================
       PROJECT OPEN TRANSITION
    ================================= */

    if (
      isOpeningSelected
    ) {
      finalX *=
        1 - centering;

      finalY *=
        1 - centering;

      finalZ *=
        1 - centering;
    }

    const baseOpacity =
      0.72 +
      orbit.depth * 0.28;

    const opacity =
      introOpacity *
      (
        isOpeningSelected
          ? baseOpacity *
            selectedFade
          : baseOpacity *
            othersFade
      );

    return {
      "--x": `${finalX}px`,
      "--y": `${finalY}px`,
      "--z": `${finalZ}px`,

      "--opacity": opacity,

      "--card-color":
        project.color,

      "--fan-spin":
        `${fanRotation}deg`,

      zIndex:
        isOpeningSelected
          ? 500
          : isHovered
            ? 1000
            : introProgress < 1
              ? 100 - index
              : Math.round(
                  100 +
                  orbit.depth *
                    100
                ),

      pointerEvents:
        galleryLocked ||
        introProgress < 1
          ? "none"
          : "auto",
    };
  }

  /* =====================================
     MOBILE CARD STYLE

     Vertical momentum ring.
     Same original CD visuals.
  ===================================== */

  function getMobileCardStyle(index) {
    const project =
      projects[index];

    const ring =
      getMobileRingPosition(
        index,
        position
      );

    const isOpeningSelected =
      project.id ===
      selectedProjectId;

    const opacity =
      isOpeningSelected
        ? ring.opacity *
          selectedFade
        : ring.opacity *
          othersFade;

    const scale =
      0.76 +
      ring.depth * 0.24;

    return {
      "--ring-x":
        `${ring.x}px`,

      "--ring-y":
        `${ring.y}px`,

      "--ring-z":
        `${ring.z}px`,

      "--ring-tilt":
        `${ring.rotateX}deg`,

      "--ring-scale":
        scale,

      "--ring-opacity":
        opacity,

      "--card-color":
        project.color,

      zIndex:
        isOpeningSelected
          ? 500
          : Math.round(
              100 +
              ring.depth * 100
            ),

      pointerEvents:
        galleryLocked ||
        !ring.front
          ? "none"
          : "auto",
    };
  }

  /* =====================================
     RENDER
  ===================================== */

  return (
    <main
      ref={galleryRef}
      className={[
        styles.gallery,

        dragging &&
        !galleryLocked
          ? styles.dragging
          : "",

        galleryLocked
          ? styles.locked
          : "",

        idle
          ? styles.idle
          : "",

        hoveredId !== null &&
        !galleryLocked
          ? styles.hasHover
          : "",

        isMobile
          ? styles.mobileGallery
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={
        handlePointerDown
      }
      onPointerMove={
        handlePointerMove
      }
    >
      {/* =================================
          DESKTOP:
          SPIN-OPEN DIAGONAL ORBIT
      ================================= */}

      {!isMobile && (
        <div
          className={
            styles.scene
          }
        >
          {projects.map(
            (project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                positionStyle={
                  getDesktopCardStyle(
                    index
                  )
                }
                active={
                  !galleryLocked &&
                  hoveredId ===
                    project.id
                }
                onEnter={
                  handleCardEnter
                }
                onLeave={
                  handleCardLeave
                }
                onOpen={
                  handleOpen
                }
              />
            )
          )}
        </div>
      )}

      {/* =================================
          MOBILE:
          AUTO-ROTATING VERTICAL RING
      ================================= */}

      {isMobile && (
        <div
          className={
            styles.mobileScene
          }
          aria-label="Swipe vertically to explore projects"
        >
          <div
            className={
              styles.mobileRing
            }
          >
            {projects.map(
              (project, index) => {
                const ring =
                  getMobileRingPosition(
                    index,
                    position
                  );

                const active =
                  project.id ===
                  mobileSelectedProject?.id;

                return (
                  <div
                    key={project.id}
                    className={
                      styles.mobileSlot
                    }
                    style={
                      getMobileCardStyle(
                        index
                      )
                    }
                  >
                    <ProjectCard
                      project={project}
                      variant="final"
                      positionStyle={{
                        "--opacity": 1,

                        "--card-color":
                          project.color,

                        pointerEvents:
                          ring.front
                            ? "auto"
                            : "none",
                      }}
                      active={
                        active &&
                        !galleryLocked
                      }
                      onEnter={() => {}}
                      onLeave={() => {}}
                      onOpen={
                        handleOpen
                      }
                    />
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </main>
  );
}
