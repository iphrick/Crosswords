// components/game/CluesPanel.jsx
import styles from './CluesPanel.module.css';

export default function CluesPanel({ placedWords = [], activeNumber, activeDir, onClueClick }) {
  const across = placedWords.filter(w => w.direction === 'across');
  const down   = placedWords.filter(w => w.direction === 'down');

  return (
    <aside className={styles.clues} aria-label="Dicas da cruzadinha">
      <ClueSection
        heading="→ Horizontais"
        words={across}
        direction="across"
        activeNumber={activeNumber}
        activeDir={activeDir}
        onClueClick={onClueClick}
      />
      <ClueSection
        heading="↓ Verticais"
        words={down}
        direction="down"
        activeNumber={activeNumber}
        activeDir={activeDir}
        onClueClick={onClueClick}
      />
    </aside>
  );
}

function ClueSection({ heading, words, direction, activeNumber, activeDir, onClueClick }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <ol className={`clues__list ${styles.list}`}>
        {words.map(({ number, clue }) => (
          <li
            key={`${direction}-${number}`}
            className={[
              'clues__item',
              activeNumber === number && activeDir === direction ? 'clues__item--selected' : '',
            ].join(' ')}
            data-number={number}
            data-direction={direction}
            onClick={() => onClueClick(number, direction)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClueClick(number, direction); }}
          >
            <b>{number}. </b>{clue}
          </li>
        ))}
      </ol>
    </section>
  );
}
