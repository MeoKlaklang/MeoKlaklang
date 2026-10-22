
import { createPortal } from "react-dom";

import VinylNavigation from "./shared/VinylNavigation";
import styles from "./MobileProjectDock.module.css";

export default function MobileProjectDock({
  visible,
  project,
  activeChapter = 0,
  progress = 0,
  rotation = 0,
  onChapterChange,
  onDiscDown,
  onDiscUp,
  onDiscCancel,
}) {
  if (!visible || !project) return null;

  return createPortal(
    <div
      className={styles.mobileDock}
      style={{
        "--project-color": project.color,
      }}
    >
      <VinylNavigation
        project={project}
        chapters={project.chapters}
        transition={1}
        rotation={rotation}
        progress={progress}
        activeChapter={activeChapter}
        goToChapter={onChapterChange}
        handleDiscDown={onDiscDown}
        handleDiscUp={onDiscUp}
        cancelDrag={onDiscCancel}
        canPlayNext={false}
      />
    </div>,
    document.body
  );
}
