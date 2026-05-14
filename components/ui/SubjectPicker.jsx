// components/ui/SubjectPicker.jsx
// Horizontal scrollable icon-button row for subject selection.
// Responds fully to CSS theme variables.

import { SUBJECTS, SUBJECT_ICONS } from '@/lib/juriMessages';

export default function SubjectPicker({ subject, setSubject }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <label
        style={{
          fontSize: '10px',
          fontWeight: 900,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          paddingLeft: '12px',
        }}
      >
        Matéria Atual
      </label>

      {/* Scrollable pill row */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingLeft: '16px',
          paddingRight: '16px',
          scrollbarWidth: 'none',     /* Firefox */
          msOverflowStyle: 'none',    /* IE/Edge */
          border: 'none',
          outline: 'none',
        }}
        className="subject-picker-row"
      >
        {SUBJECTS.map((s) => {
          const { icon, label } = SUBJECT_ICONS[s] || { icon: '📖', label: s };
          const isActive = s === subject;

          return (
            <button
              key={s}
              id={`subject-btn-${s.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSubject(s)}
              title={s}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 6px 8px',
                borderRadius: '16px',
                marginLeft: s === SUBJECTS[0] ? '4px' : '0',
                border: isActive
                  ? '2px solid var(--color-accent)'
                  : '2px solid var(--color-border)',
                background: isActive
                  ? 'var(--color-accent-dim)'
                  : 'var(--color-surface)',
                cursor: 'pointer',
                minWidth: '80px',
                transition: 'border-color 180ms ease, background 180ms ease, transform 150ms ease, box-shadow 180ms ease',
                transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: isActive
                  ? '0 6px 20px rgba(0,0,0,0.35), 0 0 0 1px var(--color-accent)'
                  : '0 2px 8px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-accent) 50%, var(--color-border))';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  background: isActive
                    ? 'var(--color-accent-dim)'
                    : 'var(--color-surface-2)',
                  border: isActive
                    ? '1.5px solid var(--color-accent)'
                    : '1.5px solid var(--color-border)',
                  transition: 'background 180ms ease, border-color 180ms ease',
                  boxShadow: isActive
                    ? '0 0 12px var(--color-accent-dim)'
                    : 'inset 0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                {icon}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  textAlign: 'center',
                  lineHeight: 1.1,
                  maxWidth: '74px',
                  overflowWrap: 'anywhere',
                  transition: 'color 180ms ease',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hide scrollbar on webkit */}
      <style>{`.subject-picker-row::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
