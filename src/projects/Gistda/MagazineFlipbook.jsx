
import {
  forwardRef,
  useMemo,
  useRef,
  useState,
} from "react";

import HTMLFlipBook from "react-pageflip";
import styles from "./MagazineFlipbook.module.css";

/* =====================================
   MAGAZINE SETTINGS
===================================== */

const FLIP_DURATION = 950;

// 2.png contains the cover on its RIGHT side.
const COVER_SIDE = "right";

/* =====================================
   INDIVIDUAL PHYSICAL PAGE
===================================== */

const MagazinePage = forwardRef(
  function MagazinePage(
    {
      image,
      side,
      label,
      isCover = false,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={[
          styles.page,
          isCover ? styles.coverPage : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-density={
          isCover ? "hard" : "soft"
        }
        aria-label={label}
      >
        <div
          className={[
            styles.pageArtwork,
            side === "left"
              ? styles.pageLeft
              : styles.pageRight,
          ].join(" ")}
          style={{
            backgroundImage: `url("${image}")`,
          }}
          role="img"
          aria-label={label}
        />

        <span
          className={styles.paperTexture}
          aria-hidden="true"
        />

        <span
          className={styles.paperEdge}
          aria-hidden="true"
        />
      </div>
    );
  }
);

/* =====================================
   CREATE PHYSICAL MAGAZINE PAGES
===================================== */

function createBookPages(spreads) {
  if (!spreads.length) return [];

  /*
    Input:
      2.png = cover on RIGHT half
      1.png = complete spread
      3.png = complete spread
      4.png = complete spread
      ...

    Output for react-pageflip:
      Page 0 = cover
      Page 1 = spread 1 left half
      Page 2 = spread 1 right half
      Page 3 = spread 2 left half
      Page 4 = spread 2 right half
      ...

    showCover=true places page 0
    alone on the RIGHT side.

    Every next two physical pages
    form one complete spread.
  */

  const result = [
    {
      id: "cover",
      image: spreads[0],
      side: COVER_SIDE,
      label: "THEOS Earth Gallery cover",
      isCover: true,
    },
  ];

  spreads.slice(1).forEach(
    (image, index) => {
      const spreadNumber = index + 1;

      result.push({
        id: `spread-${spreadNumber}-left`,
        image,
        side: "left",
        label: `Spread ${spreadNumber}, left page`,
      });

      result.push({
        id: `spread-${spreadNumber}-right`,
        image,
        side: "right",
        label: `Spread ${spreadNumber}, right page`,
      });
    }
  );

  return result;
}

/* =====================================
   MAIN MAGAZINE FLIPBOOK
===================================== */

export default function MagazineFlipbook({
  pages = [],
  title = "Magazine",
}) {
  const bookRef = useRef(null);

  const [viewIndex, setViewIndex] =
    useState(0);

  const [isFlipping, setIsFlipping] =
    useState(false);

  const bookPages = useMemo(
    () => createBookPages(pages),
    [pages]
  );

  // One view per original supplied image.
  const totalViews = pages.length;

  /* =====================================
     FLIPBOOK API
  ===================================== */

  function getBook() {
    return bookRef.current?.pageFlip?.();
  }

  /* =====================================
     PAGE FLIP EVENTS
  ===================================== */

  function handleFlip(event) {
    const physicalPageIndex = Number(
      event.data
    );

    if (!Number.isFinite(physicalPageIndex)) {
      return;
    }

    /*
      showCover=true:

      Index 0 = cover
      Index 1 = first complete spread
      Index 3 = second complete spread
      Index 5 = third complete spread
    */

    const nextView =
      physicalPageIndex === 0
        ? 0
        : Math.ceil(
            physicalPageIndex / 2
          );

    setViewIndex(
      Math.max(
        0,
        Math.min(
          totalViews - 1,
          nextView
        )
      )
    );
  }

  function handleFlipState(event) {
    setIsFlipping(
      event.data === "flipping"
    );
  }

  /* =====================================
     PREVIOUS / NEXT
  ===================================== */

  function goToPage(direction) {
    const book = getBook();

    if (
      !book ||
      isFlipping ||
      totalViews === 0
    ) {
      return;
    }

    if (
      direction < 0 &&
      viewIndex === 0
    ) {
      return;
    }

    if (
      direction > 0 &&
      viewIndex >= totalViews - 1
    ) {
      return;
    }

    if (direction > 0) {
      book.flipNext("bottom");
    } else {
      book.flipPrev("bottom");
    }
  }

  /* =====================================
     KEYBOARD NAVIGATION
  ===================================== */

  function handleKeyDown(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPage(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPage(-1);
    }
  }

  if (pages.length === 0) {
    return null;
  }

  const isFirstView = viewIndex === 0;

  const isLastView =
    viewIndex >= totalViews - 1;

  const progress =
    ((viewIndex + 1) / totalViews) *
    100;

  return (
    <div className={styles.book}>
      {/* =====================================
          TOOLBAR
      ===================================== */}

      <div className={styles.toolbar}>
        <div className={styles.bookMeta}>
          <span className={styles.label}>
            THEOS / EARTH GALLERY
          </span>

          <span className={styles.counter}>
            {String(
              viewIndex + 1
            ).padStart(2, "0")}
            {" / "}
            {String(
              totalViews
            ).padStart(2, "0")}
          </span>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => goToPage(-1)}
            disabled={
              isFirstView || isFlipping
            }
            aria-label="Previous magazine spread"
            title="Previous spread"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={
              isLastView || isFlipping
            }
            aria-label="Next magazine spread"
            title="Next spread"
          >
            →
          </button>
        </div>
      </div>

      {/* =====================================
          MAGAZINE VIEWER
      ===================================== */}

      <div
        className={styles.stage}
        tabIndex={0}
        role="group"
        aria-label={`${title}: use the arrow keys or drag a page to browse`}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.bookFrame}>
          <HTMLFlipBook
            ref={bookRef}

            /* PAGE DIMENSIONS */

            width={600}
            height={600}
            size="stretch"
            minWidth={120}
            maxWidth={900}
            minHeight={120}
            maxHeight={900}

            /* COVER ON THE RIGHT */

            startPage={0}
            showCover={true}
            usePortrait={false}

            /* SMOOTH PAGE FLIP */

            flippingTime={FLIP_DURATION}
            drawShadow={true}
            maxShadowOpacity={0.35}

            /* INTERACTIONS */

            useMouseEvents={true}
            showPageCorners={true}
            disableFlipByClick={false}
            mobileScrollSupport={true}

            /* LAYOUT */

            autoSize={true}
            startZIndex={0}

            /* EVENTS */

            onFlip={handleFlip}
            onChangeState={handleFlipState}

            className={styles.flipbook}
          >
            {bookPages.map((page) => (
              <MagazinePage
                key={page.id}
                image={page.image}
                side={page.side}
                label={page.label}
                isCover={page.isCover}
              />
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      {/* =====================================
          PROGRESS BAR
      ===================================== */}

      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Magazine progress"
        aria-valuemin={1}
        aria-valuemax={totalViews}
        aria-valuenow={viewIndex + 1}
      >
        <div
          className={styles.progressFill}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* =====================================
          HINT
      ===================================== */}

      <p className={styles.hint}>
        Drag a page corner or use the arrows
        to explore the magazine.
      </p>
    </div>
  );
}
