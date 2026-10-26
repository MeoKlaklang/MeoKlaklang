
import { useEffect, useRef } from "react";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";
import landTopology from "world-atlas/land-110m.json";

import styles from "./ContactGlobe.module.css";

/* =====================================
   GLOBE SETTINGS
===================================== */

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

const SETTINGS = {
  // Automatic horizontal rotation
  rotationSpeed: 0.007,

  // Globe appearance
  globeSize: 0.30,
  dotSpacing: 2.15,
  dotSize: 0.75,

  // Initial view
  initialYaw: -16,
  initialPitch: -12,

  // Mouse / touch sensitivity
  dragSensitivity: 0.43,

  // Arc appearance
  arcHeight: 0.38,
  arcOpacity: 0.58,

  // Momentum after dragging
  momentumFriction: 0.92,
};

/* =====================================
   HELPERS
===================================== */

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

function wrapDegrees(degrees) {
  return ((degrees + 180) % 360 + 360) % 360 - 180;
}

/* =====================================
   REAL GEOGRAPHIC LAND DATA

   Natural Earth / World Atlas
===================================== */

const land = feature(
  landTopology,
  landTopology.objects.land
);

/* =====================================
   SPHERICAL COORDINATES
===================================== */

function toVector(lon, lat) {
  const longitude = lon * DEG;
  const latitude = lat * DEG;

  return {
    x: Math.cos(latitude) * Math.sin(longitude),
    y: -Math.sin(latitude),
    z: Math.cos(latitude) * Math.cos(longitude),
  };
}

/* =====================================
   TRUE 2-AXIS ROTATION

   Yaw   = left / right
   Pitch = up / down

   Pitch is NOT clamped, allowing
   full vertical 360-degree rotation.
===================================== */

function rotateVector(point, yaw, pitch) {
  const yawRadians = yaw * DEG;
  const pitchRadians = pitch * DEG;

  const cosY = Math.cos(yawRadians);
  const sinY = Math.sin(yawRadians);

  const cosX = Math.cos(pitchRadians);
  const sinX = Math.sin(pitchRadians);

  // Rotate around vertical Y axis.
  const x =
    point.x * cosY +
    point.z * sinY;

  const zAfterYaw =
    point.z * cosY -
    point.x * sinY;

  // Rotate around horizontal X axis.
  const y =
    point.y * cosX -
    zAfterYaw * sinX;

  const z =
    point.y * sinX +
    zAfterYaw * cosX;

  return { x, y, z };
}

/* =====================================
   ACCURATE LAND DOTS

   Points are sampled from real
   geographic land polygons.
===================================== */

function makeLandDots() {
  const dots = [];
  const spacing = SETTINGS.dotSpacing;

  for (
    let lat = -84;
    lat <= 84;
    lat += spacing
  ) {
    const latitude = lat * DEG;

    const longitudeStep =
      spacing /
      Math.max(0.26, Math.cos(latitude));

    const row = Math.round(
      (lat + 84) / spacing
    );

    const stagger =
      row % 2 ? longitudeStep / 2 : 0;

    for (
      let lon = -180;
      lon < 180;
      lon += longitudeStep
    ) {
      const actualLon = lon + stagger;

      if (
        geoContains(land, [
          actualLon,
          lat,
        ])
      ) {
        dots.push(
          toVector(actualLon, lat)
        );
      }
    }
  }

  return dots;
}

const LAND_DOTS = makeLandDots();

/* =====================================
   DECORATIVE CONNECTIONS

   Only 6 blue arcs.

   Coordinates are longitude, latitude.
===================================== */

const LOCATIONS = {
  belgium: [4.35, 50.85],
  thailand: [100.5, 13.75],
  newYork: [-74.0, 40.71],
  tokyo: [139.69, 35.68],
  capeTown: [18.42, -33.92],
  sydney: [151.21, -33.87],
  london: [-0.12, 51.5],
  losAngeles: [-118.24, 34.05],
};

const CONNECTIONS = [
  ["belgium", "thailand"],
  ["belgium", "newYork"],
  ["belgium", "tokyo"],
  ["belgium", "capeTown"],
  ["thailand", "sydney"],
  ["london", "losAngeles"],
];

/* =====================================
   SMOOTH 3D CONNECTION ARCS
===================================== */

function makeArc(start, end, steps = 100) {
  const a = toVector(...start);
  const b = toVector(...end);

  const dot = clamp(
    a.x * b.x +
      a.y * b.y +
      a.z * b.z,
    -1,
    1
  );

  const angle = Math.acos(dot);
  const denominator = Math.sin(angle);

  return Array.from(
    { length: steps + 1 },
    (_, index) => {
      const t = index / steps;

      let weightA = 1 - t;
      let weightB = t;

      if (Math.abs(denominator) > 0.0001) {
        weightA =
          Math.sin((1 - t) * angle) /
          denominator;

        weightB =
          Math.sin(t * angle) /
          denominator;
      }

      const altitude =
        1 +
        Math.sin(Math.PI * t) *
          SETTINGS.arcHeight;

      return {
        x:
          (a.x * weightA +
            b.x * weightB) *
          altitude,

        y:
          (a.y * weightA +
            b.y * weightB) *
          altitude,

        z:
          (a.z * weightA +
            b.z * weightB) *
          altitude,
      };
    }
  );
}

const ARCS = CONNECTIONS.map(
  ([start, end]) =>
    makeArc(
      LOCATIONS[start],
      LOCATIONS[end]
    )
);

/* =====================================
   DRAW ONE ARC

   IMPORTANT:
   Both yaw AND pitch are applied.
===================================== */

function drawArc(
  ctx,
  points,
  yaw,
  pitch,
  cx,
  cy,
  radius,
  front,
  alpha
) {
  ctx.beginPath();

  let penDown = false;

  for (const point of points) {
    const p = rotateVector(
      point,
      yaw,
      pitch
    );

    const visible = front
      ? p.z >= 0
      : p.z < 0;

    if (!visible) {
      penDown = false;
      continue;
    }

    const x = cx + p.x * radius;
    const y = cy + p.y * radius;

    if (!penDown) {
      ctx.moveTo(x, y);
      penDown = true;
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle =
    `rgba(112,201,232,${alpha})`;

  ctx.lineWidth = 0.8;
  ctx.stroke();
}

/* =====================================
   CONTACT GLOBE
===================================== */

export default function ContactGlobe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    /* =================================
       STATE INSIDE CANVAS
    ================================= */

    let width = 500;
    let height = 500;

    let yaw = SETTINGS.initialYaw;
    let pitch = SETTINGS.initialPitch;

    let yawVelocity = 0;
    let pitchVelocity = 0;

    let dragging = false;
    let activePointerId = null;

    let previousX = 0;
    let previousY = 0;

    let elapsed = 0;
    let lastFrameTime = 0;

    let frame = null;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    /* =================================
       RESIZE
    ================================= */

    function resize() {
      const rect =
        canvas.getBoundingClientRect();

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(
        width * dpr
      );

      canvas.height = Math.round(
        height * dpr
      );

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      draw();
    }

    /* =================================
       ANIMATED LIGHT POINT
    ================================= */

    function drawPulse(
      point,
      cx,
      cy,
      radius
    ) {
      const p = rotateVector(
        point,
        yaw,
        pitch
      );

      if (p.z < 0) return;

      const x = cx + p.x * radius;
      const y = cy + p.y * radius;

      const glow = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        9
      );

      glow.addColorStop(
        0,
        "rgba(209,244,255,0.85)"
      );

      glow.addColorStop(
        0.3,
        "rgba(112,201,232,0.4)"
      );

      glow.addColorStop(
        1,
        "rgba(112,201,232,0)"
      );

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        9,
        0,
        TAU
      );

      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        1.5,
        0,
        TAU
      );

      ctx.fillStyle = "#D1F4FF";
      ctx.fill();
    }

    /* =================================
       DRAW GLOBE
    ================================= */

    function draw() {
      if (width <= 0 || height <= 0) {
        return;
      }

      const cx = width / 2;
      const cy = height / 2;

      const radius =
        Math.min(width, height) *
        SETTINGS.globeSize;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      /* =================================
         AMBIENT GLOW
      ================================= */

      const ambient = ctx.createRadialGradient(
        cx,
        cy,
        radius * 0.1,
        cx,
        cy,
        radius * 1.5
      );

      ambient.addColorStop(
        0,
        "rgba(112,201,232,0.065)"
      );

      ambient.addColorStop(
        0.65,
        "rgba(112,201,232,0.025)"
      );

      ambient.addColorStop(
        1,
        "rgba(112,201,232,0)"
      );

      ctx.fillStyle = ambient;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        radius * 1.5,
        0,
        TAU
      );

      ctx.fill();

      /* =================================
         BACK CONNECTION ARCS
      ================================= */

      ARCS.forEach((arc, index) => {
        drawArc(
          ctx,
          arc,
          yaw,
          pitch,
          cx,
          cy,
          radius,
          false,
          0.14 + (index % 3) * 0.035
        );
      });

      /* =================================
         DARK SPHERE
      ================================= */

      const sphere = ctx.createRadialGradient(
        cx - radius * 0.32,
        cy - radius * 0.35,
        radius * 0.08,
        cx,
        cy,
        radius
      );

      sphere.addColorStop(
        0,
        "#20262B"
      );

      sphere.addColorStop(
        0.48,
        "#11171C"
      );

      sphere.addColorStop(
        0.85,
        "#090C10"
      );

      sphere.addColorStop(
        1,
        "#050608"
      );

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        radius,
        0,
        TAU
      );

      ctx.fillStyle = sphere;
      ctx.fill();

      /* =================================
         DOTTED CONTINENTS

         Use current yaw AND pitch.
      ================================= */

      for (const point of LAND_DOTS) {
        const p = rotateVector(
          point,
          yaw,
          pitch
        );

        if (p.z <= 0) continue;

        const x =
          cx + p.x * radius;

        const y =
          cy + p.y * radius;

        const edge = Math.pow(
          p.z,
          0.45
        );

        const alpha =
          0.14 + edge * 0.67;

        const size =
          SETTINGS.dotSize *
          (0.58 + edge * 0.44);

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          size,
          0,
          TAU
        );

        ctx.fillStyle =
          `rgba(195,207,217,${alpha})`;

        ctx.fill();
      }

      /* =================================
         FRONT CONNECTION ARCS
      ================================= */

      ARCS.forEach((arc, index) => {
        drawArc(
          ctx,
          arc,
          yaw,
          pitch,
          cx,
          cy,
          radius,
          true,
          SETTINGS.arcOpacity +
            (index % 3) * 0.055
        );

        /* Moving light point */

        const progress =
          (
            elapsed * 0.00012 +
            index / ARCS.length
          ) % 1;

        const pointIndex = Math.floor(
          progress * (arc.length - 1)
        );

        drawPulse(
          arc[pointIndex],
          cx,
          cy,
          radius
        );
      });

      /* =================================
         OUTER EDGE
      ================================= */

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        radius,
        0,
        TAU
      );

      ctx.strokeStyle =
        "rgba(112,201,232,0.10)";

      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    /* =================================
       ANIMATION LOOP
    ================================= */

    function animate(time) {
      frame = null;

      const delta = lastFrameTime
        ? Math.min(
            time - lastFrameTime,
            50
          )
        : 16;

      lastFrameTime = time;

      if (
        !dragging &&
        !motionQuery.matches
      ) {
        // Automatic horizontal spin.
        yaw +=
          delta *
          SETTINGS.rotationSpeed;

        // Momentum on both axes.
        const frameScale = delta / 16;

        yaw +=
          yawVelocity * frameScale;

        pitch +=
          pitchVelocity * frameScale;

        const friction = Math.pow(
          SETTINGS.momentumFriction,
          frameScale
        );

        yawVelocity *= friction;
        pitchVelocity *= friction;

        // Only normalize the numbers.
        // This does NOT restrict rotation.
        yaw = wrapDegrees(yaw);
        pitch = wrapDegrees(pitch);

        elapsed += delta;
      }

      draw();

      if (
        !motionQuery.matches &&
        !document.hidden
      ) {
        frame = requestAnimationFrame(
          animate
        );
      }
    }

    function startAnimation() {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }

      lastFrameTime = 0;

      if (
        motionQuery.matches ||
        document.hidden
      ) {
        draw();
      } else {
        frame = requestAnimationFrame(
          animate
        );
      }
    }

    /* =================================
       POINTER DOWN
    ================================= */

    function pointerDown(event) {
      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      if (activePointerId !== null) {
        return;
      }

      dragging = true;
      activePointerId = event.pointerId;

      previousX = event.clientX;
      previousY = event.clientY;

      yawVelocity = 0;
      pitchVelocity = 0;

      canvas.setPointerCapture(
        event.pointerId
      );
    }

    /* =================================
       POINTER MOVE

       Horizontal = yaw
       Vertical   = pitch

       Both rotate the globe AND arcs.
    ================================= */

    function pointerMove(event) {
      if (
        !dragging ||
        event.pointerId !== activePointerId
      ) {
        return;
      }

      const dx =
        event.clientX - previousX;

      const dy =
        event.clientY - previousY;

      yaw +=
        dx * SETTINGS.dragSensitivity;

      pitch -=
        dy * SETTINGS.dragSensitivity;

      // Momentum after release.
      yawVelocity = dx * 0.045;
      pitchVelocity = -dy * 0.045;

      yaw = wrapDegrees(yaw);
      pitch = wrapDegrees(pitch);

      previousX = event.clientX;
      previousY = event.clientY;

      // Always redraw while dragging.
      if (motionQuery.matches) {
        draw();
      }
    }

    /* =================================
       POINTER UP / CANCEL
    ================================= */

    function pointerUp(event) {
      if (
        event.pointerId !== activePointerId
      ) {
        return;
      }

      dragging = false;
      activePointerId = null;

      if (
        canvas.hasPointerCapture(
          event.pointerId
        )
      ) {
        canvas.releasePointerCapture(
          event.pointerId
        );
      }

      if (motionQuery.matches) {
        draw();
      }
    }

    /* =================================
       KEYBOARD ACCESSIBILITY
    ================================= */

    function keyDown(event) {
      const step = 12;

      switch (event.key) {
        case "ArrowLeft":
          yaw -= step;
          break;

        case "ArrowRight":
          yaw += step;
          break;

        case "ArrowUp":
          pitch += step;
          break;

        case "ArrowDown":
          pitch -= step;
          break;

        default:
          return;
      }

      event.preventDefault();

      yaw = wrapDegrees(yaw);
      pitch = wrapDegrees(pitch);

      draw();
    }

    /* =================================
       VISIBILITY / REDUCED MOTION
    ================================= */

    function onVisibilityChange() {
      startAnimation();
    }

    function onMotionChange() {
      startAnimation();
    }

    /* =================================
       LISTENERS
    ================================= */

    const observer = new ResizeObserver(
      resize
    );

    observer.observe(canvas);

    canvas.addEventListener(
      "pointerdown",
      pointerDown
    );

    canvas.addEventListener(
      "pointermove",
      pointerMove
    );

    canvas.addEventListener(
      "pointerup",
      pointerUp
    );

    canvas.addEventListener(
      "pointercancel",
      pointerUp
    );

    canvas.addEventListener(
      "keydown",
      keyDown
    );

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange
    );

    motionQuery.addEventListener(
      "change",
      onMotionChange
    );

    resize();
    startAnimation();

    /* =================================
       CLEANUP
    ================================= */

    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }

      observer.disconnect();

      canvas.removeEventListener(
        "pointerdown",
        pointerDown
      );

      canvas.removeEventListener(
        "pointermove",
        pointerMove
      );

      canvas.removeEventListener(
        "pointerup",
        pointerUp
      );

      canvas.removeEventListener(
        "pointercancel",
        pointerUp
      );

      canvas.removeEventListener(
        "keydown",
        keyDown
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );

      motionQuery.removeEventListener(
        "change",
        onMotionChange
      );
    };
  }, []);

  return (
    <div className={styles.globeWrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        tabIndex={0}
        role="img"
        aria-label="Interactive 3D globe. Drag in any direction or use arrow keys to rotate."
      />

      <span className={styles.globeCaption}>
        BASED IN BELGIUM · CONNECTING WORLDWIDE
      </span>
    </div>
  );
}
