
import { useEffect, useState } from "react";
import styles from "./AboutPhotoFolder.module.css";

const photos = [
  "/images/about/me-3.jpg",
  "/images/about/me-2.jpg",
  "/images/about/me-1.jpeg",
];

const sentences = [
  {
    text: "Meo loves food",
    highlight: "food",
  },
  {
    text: "Meo loves hiking",
    highlight: "hiking",
  },
  {
    text: "Meo loves her dog",
    highlight: "her dog",
  },
];

function TypewriterText() {
  const [visibleCharacters, setVisibleCharacters] =
    useState(0);

  const fullText = sentences
    .map((sentence) => sentence.text)
    .join("\n");

  useEffect(() => {
    // Respect visitors who prefer less animation.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      setVisibleCharacters(fullText.length);
      return;
    }

    let position = 0;

    const interval = window.setInterval(() => {
      position += 1;
      setVisibleCharacters(position);

      if (position >= fullText.length) {
        window.clearInterval(interval);
      }
    }, 65);

    return () => window.clearInterval(interval);
  }, [fullText]);

  let remaining = visibleCharacters;

  return (
    <div
      className={styles.typewriter}
      aria-label={sentences
        .map((sentence) => sentence.text)
        .join(". ")}
    >
      {sentences.map((sentence, index) => {
        const visibleCount = Math.min(
          remaining,
          sentence.text.length
        );

        remaining = Math.max(
          0,
          remaining - sentence.text.length - 1
        );

        const prefix = "Meo loves ";
        const prefixLength = prefix.length;

        const visiblePrefix = prefix.slice(
          0,
          visibleCount
        );

        const visibleHighlight =
          sentence.highlight.slice(
            0,
            Math.max(
              0,
              visibleCount - prefixLength
            )
          );

        return (
          <div
            key={sentence.text}
            className={styles.typewriterLine}
            aria-hidden="true"
          >
            <span>{visiblePrefix}</span>

            <span
              className={`${styles.scriptWord} ${
                styles[`script${index + 1}`]
              }`}
            >
              {visibleHighlight}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AboutPhotoFolder() {
  const [failedPhotos, setFailedPhotos] =
    useState([]);

  return (
    <div className={styles.scene}>
      <div className={styles.folder}>
        {/* THREE PHOTOS — UNCHANGED */}

        <div className={styles.photos}>
          {photos.map((src, index) => (
            <div
              key={src}
              className={`${styles.photo} ${
                styles[`photo${index + 1}`]
              }`}
            >
              {!failedPhotos.includes(index) ? (
                <img
                  src={src}
                  alt={`Meo — photo ${index + 1}`}
                  draggable={false}
                  onError={() =>
                    setFailedPhotos((previous) =>
                      previous.includes(index)
                        ? previous
                        : [...previous, index]
                    )
                  }
                />
              ) : (
                <div
                  className={styles.placeholder}
                >
                  <span>MEØ</span>
                  <small>
                    PHOTO 0{index + 1}
                  </small>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FOLDER BACK */}

        <div className={styles.folderBack} />

        {/* TRANSPARENT FOLDER FRONT */}

        <div className={styles.folderFront}>
          <div className={styles.reflection} />

          <div className={styles.folderMeta}>
            <span>
              MEØ / PERSONAL ARCHIVE
            </span>

            <span>001—003</span>
          </div>

          {/* NEW TYPEWRITER TEXT */}

          <TypewriterText />
        </div>
      </div>

      <span className={styles.hint}>
        HOVER TO REVEAL ↑
      </span>
    </div>
  );
}
