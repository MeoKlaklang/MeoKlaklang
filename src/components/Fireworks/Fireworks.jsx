import { useMemo } from "react";
import styles from "./Fireworks.module.css";

const COLORS = [
  "#60E8D3",
  "#B5A0FF",
  "#B9FF43",
  "#FF91C1",
  "#9DE7FF",
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Fireworks() {
  const bursts = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const size = randomBetween(28, 68);
      const opacity = randomBetween(0.45, 0.95);
      const left = randomBetween(6, 94);
      const top = randomBetween(10, 82);
      const delay = randomBetween(0, 5.5);
      const duration = randomBetween(2.4, 4.6);
      const color =
        COLORS[Math.floor(Math.random() * COLORS.length)];

      const particles = Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const distance = randomBetween(
          size * 0.6,
          size * 1.15
        );

        return {
          x: `${Math.cos(angle) * distance}px`,
          y: `${Math.sin(angle) * distance}px`,
        };
      });

      return {
        id: index + 1,
        left: `${left}%`,
        top: `${top}%`,
        size: `${size}px`,
        opacity,
        delay: `${delay}s`,
        duration: `${duration}s`,
        color,
        particles,
      };
    });
  }, []);

  return (
    <div className={styles.fireworks} aria-hidden="true">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className={styles.burst}
          style={{
            "--left": burst.left,
            "--top": burst.top,
            "--size": burst.size,
            "--opacity": burst.opacity,
            "--delay": burst.delay,
            "--duration": burst.duration,
            "--color": burst.color,
          }}
        >
          <span className={styles.flash} />

          {burst.particles.map((particle, index) => (
            <span
              key={index}
              className={styles.particle}
              style={{
                "--x": particle.x,
                "--y": particle.y,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}