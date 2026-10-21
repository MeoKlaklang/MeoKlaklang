import ScrollHighlight from "./ScrollHighlight";

export default function SectionTitle({ eyebrow, title, description, prefix, revealedWords, className = "", styles }) {

    return (

        <header className={className}>

            <span className={styles.eyebrow}>{eyebrow}</span>

            <ScrollHighlight id={`${prefix}-title`} as="h2" text={title} revealedWords={revealedWords} styles={styles} />

            <ScrollHighlight id={`${prefix}-description`} text={description} revealedWords={revealedWords} styles={styles} />

        </header>

    );

}
