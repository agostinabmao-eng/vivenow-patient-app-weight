// Small pictogram illustrations for onboarding option rows — the equipment
// and activity questions ask for "real life, not emojis" images; this
// sandbox has no network access to real stock photography (every image
// CDN tested was rejected by the egress proxy), so these are simple
// custom-drawn pictograms instead, styled consistently with the rest of
// the app's icon language. Swap in real photos here if/when they're
// available — each is a self-contained <svg>, easy to replace with an
// <img src="..."> of the same size.

const STROKE = 'var(--teal-600)';
const FILL = 'var(--teal-600)';
const ACCENT = 'var(--teal-300)';

function Person({ head, body, limbs }) {
  return (
    <>
      <circle cx={head[0]} cy={head[1]} r="2.3" fill={FILL} />
      {[body, ...limbs].map((d, i) => (
        <path key={i} d={d} stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
      ))}
    </>
  );
}

const ILLUSTRATIONS = {
  'resistance-band': (
    <ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-18 12 12)" fill="none" stroke={STROKE} strokeWidth="3" />
  ),
  dumbbells: (
    <>
      <rect x="2.5" y="9" width="4" height="6" rx="1.3" fill={FILL} />
      <rect x="17.5" y="9" width="4" height="6" rx="1.3" fill={FILL} />
      <rect x="6.5" y="11" width="11" height="2" fill={FILL} />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9" fill={FILL} />
      <path d="M3.5 12 Q12 6.5 20.5 12" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.8" />
      <path d="M3.5 12 Q12 17.5 20.5 12" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.8" />
    </>
  ),
  'step-box': (
    <>
      <path d="M4 10 L8 6.5 H22 L18 10 Z" fill={ACCENT} />
      <rect x="4" y="10" width="14" height="8" rx="1" fill={FILL} />
    </>
  ),
  walking: <Person head={[12, 5]} body="M12 7.3 L12 15" limbs={['M12 15 L8 21', 'M12 15 L16.5 20', 'M12 10 L8.5 14', 'M12 10 L16 13']} />,
  swimming: (
    <>
      <circle cx="6" cy="10" r="2.1" fill={FILL} />
      <path d="M8 10 L16 11" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M8 10 L4.5 7" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M16 11 L20.5 8.5" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M16 11 L20 13.5" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M2 18 Q6 16 10 18 T18 18 T22 17" stroke={ACCENT} strokeWidth="1.6" fill="none" />
    </>
  ),
  biking: (
    <>
      <circle cx="6" cy="17" r="3.2" fill="none" stroke={STROKE} strokeWidth="1.8" />
      <circle cx="18" cy="17" r="3.2" fill="none" stroke={STROKE} strokeWidth="1.8" />
      <path d="M6 17 L11 10 L18 17 M11 10 L14 10 L18 17 M11 10 L9 6" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="9.5" cy="5" r="1.7" fill={FILL} />
    </>
  ),
  dancing: (
    <Person head={[12, 5]} body="M12 7.3 L12 15" limbs={['M12 15 L9 21', 'M12 15 L15.5 19', 'M12 9 L8 5', 'M12 9 L16 5']} />
  ),
  'seated-exercise': (
    <>
      <path d="M6 17 L18 17 M8 17 L8 21 M16 17 L16 21" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="8" r="2.1" fill={FILL} />
      <path d="M12 10.3 L12 17 M12 17 L17 17" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M12 12.5 L9 8.5 M12 12.5 L15 15" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  'strength-exercise': (
    <>
      <circle cx="12" cy="6" r="2.1" fill={FILL} />
      <path d="M12 8.3 L12 16 M12 16 L9 21 M12 16 L15 21" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M12 10 L8.5 11.5 M12 10 L15.5 11.5" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="6.5" y="10.6" width="3" height="1.8" rx="0.6" fill={FILL} />
      <rect x="14.5" y="10.6" width="3" height="1.8" rx="0.6" fill={FILL} />
    </>
  ),
};

/** A 44x44 rounded tile containing a small pictogram, used to the left of
 * an onboarding option's label (equipment/activity questions only — see
 * data/onboardingQuestions.js's `images` maps). Renders nothing for an
 * option with no illustration (e.g. "None"/"Other"), so the row just
 * shows text, same as every other question. */
export default function OptionImage({ id }) {
  const content = ILLUSTRATIONS[id];
  if (!content) return null;
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-sm)',
        flexShrink: 0,
        background: 'linear-gradient(135deg, var(--teal-100), var(--teal-50))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        {content}
      </svg>
    </div>
  );
}
