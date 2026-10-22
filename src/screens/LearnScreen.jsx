import Icon from '../components/Icon';
import BackIconButton from '../components/BackIconButton';
import { EXERCISE_EDUCATION_VIDEOS, conditionEducationForPatient, patientPlan } from '../data/sampleData';

function VideoRow({ title, watched, onOpen }) {
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`${title}${watched ? ', watched' : ''}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
        minHeight: 56,
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          flexShrink: 0,
          background: 'linear-gradient(135deg, var(--teal-100), var(--teal-50))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="play" size={20} color="var(--teal-600)" />
      </div>
      <div style={{ flex: 1, minWidth: 0, font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{title}</div>
      {watched ? (
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="check" size={14} color="var(--success)" />
        </div>
      ) : (
        <Icon name="chevron-right" size={20} color="var(--gray-500)" />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ font: '600 1rem/1 var(--font-display)', color: 'var(--text-muted)', marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

/** Learn tab — short education videos, separate from the exercise library
 * (those are workouts to *do*; these are things to watch and understand).
 * Two sources: a standing library of general exercise-safety videos, and
 * condition-specific videos assigned by the plan — filtered to the
 * patient's actual conditions and to videos that have actually been
 * recorded, so a condition the Portal hasn't produced content for yet
 * doesn't show up as a broken entry (see conditionEducationForPatient).
 *
 * `learnHints` comes from the fixed rules that fired at onboarding (see
 * data/rules.js) — which barrier answer the patient gave reorders this
 * screen, it never adds or removes a question to ask. */
export default function LearnScreen({ watched, learnHints, onOpenVideo, onBack }) {
  const { quickFirst, welcomeFirst } = learnHints || {};

  // "Not sure where to start" promotes the welcome video + first-week
  // guide into their own section at the very top instead of just
  // reordering them within Exercise Education.
  const gettingStarted = welcomeFirst ? EXERCISE_EDUCATION_VIDEOS.filter((v) => v.tag === 'welcome' || v.tag === 'firstWeek') : [];
  let exerciseVideos = EXERCISE_EDUCATION_VIDEOS.filter((v) => !gettingStarted.includes(v));
  // "Time" shows the ~5 min videos first.
  if (quickFirst) exerciseVideos = [...exerciseVideos].sort((a, b) => (a.quick === b.quick ? 0 : a.quick ? -1 : 1));

  const conditionVideos = conditionEducationForPatient(patientPlan);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 12px 0' }}>
        <BackIconButton onClick={onBack} />
      </div>
      <div style={{ padding: '4px 20px 0' }}>
        <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>Learn</div>
      </div>
      <div
        className="vh-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 88px', display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        {gettingStarted.length > 0 && (
          <Section title="Getting Started">
            {gettingStarted.map((v) => (
              <VideoRow key={v.id} title={v.title} watched={!!watched[v.id]} onOpen={() => onOpenVideo(v.id, v.title)} />
            ))}
          </Section>
        )}

        <Section title="Exercise Education">
          {exerciseVideos.map((v) => (
            <VideoRow key={v.id} title={v.title} watched={!!watched[v.id]} onOpen={() => onOpenVideo(v.id, v.title)} />
          ))}
        </Section>

        {conditionVideos.length > 0 && (
          <Section title="About Your Conditions">
            {conditionVideos.map((v) => (
              <VideoRow key={v.id} title={v.title} watched={!!watched[v.id]} onOpen={() => onOpenVideo(v.id, v.title)} />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
