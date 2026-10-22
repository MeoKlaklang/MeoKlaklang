import styles from "./AboutPolaroids.module.css";

const photos = [
  {
    id: 1,
    src: "/images/about/about-animals.jpg",
    alt: "Meo with animals",
    label: "animals",
    className: styles.cardOne,
  },
  {
    id: 2,
    src: "/images/about/about-hiking.jpg",
    alt: "Meo hiking in the mountains",
    label: "hiking",
    className: styles.cardTwo,
  },
  {
    id: 3,
    src: "/images/about/about-food.jpg",
    alt: "Meo enjoying food and travel",
    label: "food",
    className: styles.cardThree,
  },
];

export default function AboutPolaroids() {
  return (
    <div className={styles.wrapper} aria-label="Personal photo highlights">
      <div className={styles.stack}>
        {photos.map((photo) => (
          <article
            key={photo.id}
            className={`${styles.polaroid} ${photo.className}`}
          >
            <div className={styles.imageWrap}>
              <img src={photo.src} alt={photo.alt} loading="lazy" />
            </div>

            <div className={styles.captionRow}>
              <span className={styles.caption}>{photo.label}</span>
              <span className={styles.number}>
                00{photo.id}
              </span>
            </div>
          </article>
        ))}
      </div>

      <p className={styles.helperText}>hover to reveal ✦</p>
    </div>
  );
}