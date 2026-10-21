export default function ScrollHighlight({ id, as: Tag = "p", text, className = "", revealedWords, styles }) {

    const tokens = text.match(/\S+|\s+/g) || [];

    const revealedCount = revealedWords[id] || 0;

    let wordIndex = 0;

    return (

        <Tag data-lyric-block={id} className={`${styles.scrollHighlight} ${className}`}>

            {tokens.map((token, index) => {

                if (/^\s+$/.test(token)) {

                    return token;

                }

                const current = wordIndex++;

                const isRead = current < revealedCount;

                return (

                    <span key={index} data-lyric-word={current} data-lyric-active={isRead ? "true" : "false"} className={`${styles.lyricWord} ${isRead ? styles.lyricWordActive : ""}`}>

                        {token}

                    </span>

                );

            })}

        </Tag>

    );

}
