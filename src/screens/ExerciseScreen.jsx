import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import BackIconButton from '../components/BackIconButton';
import { HeroProgressCard, SecondaryProgressCard } from '../components/ProgressCards';
import { TODAY_STEPS, STEPS_GOAL, formatDose } from '../data/sampleData';

function VideoRow({ video, onOpen }) {
  // Full workouts read "Watched"/duration like before; a single exercise
  // instead shows its prescribed dose, or progress through it once a set
  // has been logged.
  let statusText;
  if (video.kind === 'exercise') {
    if (video.checked) statusText = 'Done';
    else if (video.setsDone > 0) statusText = `${video.setsDone} of ${video.dose.sets} sets done`;
    else statusText = formatDose(video.dose);
  } else {
    statusText = video.checked ? 'Watched' : video.duration;
  }
  return (
    <div
      onClick={() => onOpen(video)}
      role="button"
      tabIndex={0}
      aria-label={`${video.title}, ${statusText}${video.intensity === 'low' ? ', low intensity' : ''}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(video)}
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
          position: 'relative',
          width: 60,
          height: 60,
          borderRadius: 'var(--radius-md)',
          flexShrink: 0,
          background: 'linear-gradient(135deg, var(--teal-100), var(--teal-50))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={video.icon} size={26} color="var(--teal-600)" />
        <div
          style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--navy-700)',
            border: '2px solid var(--surface-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="play" size={10} color="#fff" />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 0.875rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{video.title}</div>
        <div style={{ font: '400 0.78125rem/1.3 var(--font-sans)', color: video.checked ? 'var(--success)' : 'var(--text-muted)' }}>
          {statusText}
        </div>
      </div>
      {/* No manual checkbox — a video only counts as watched by actually
          watching it (see VideoPlayerScreen), so this is a status readout,
          not a toggle. */}
      {video.checked ? (
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="check" size={14} color="var(--success)" />
        </div>
      ) : (
        <Icon name="chevron-right" size={20} color="var(--gray-400)" />
      )}
    </div>
  );
}

function RestDayMessage() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '32px 20px',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
        <Icon name="check" size={24} color="var(--teal-600)" />
      </div>
      <div style={{ font: '700 1rem/1.3 var(--font-display)', color: 'var(--ink)', marginTop: 12 }}>No exercise planned today — enjoy your rest.</div>
    </div>
  );
}

/** Exercise tab — the prescribed video routine, filtered to whatever's
 * assigned for today's weekday (see data/sampleData's EXERCISE_VIDEO_LIBRARY).
 * Reached identically from the Home checklist ("Do Your Exercises") and the
 * bottom nav, since it's the same screen and state either way (no separate
 * "task" logic to keep in sync). Tapping a video runs it through the
 * pre-exercise safety check (see useAppState's exercise-gate logic) before
 * VideoPlayerScreen actually opens. */
export default function ExerciseScreen({ videos, videoFilter, onOpenVideo, onOpenSafetyInfo, onBack }) {
  const completedToday = videos.filter((v) => v.checked).length;
  const visibleVideos = videoFilter ? videos.filter((v) => v.intensity === videoFilter) : videos;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackIconButton onClick={onBack} />
        <IconButton variant="ghost" label="Exercise safety guidelines" title="Exercise safety guidelines" onClick={onOpenSafetyInfo}>
          <Icon name="shield" size={19} />
        </IconButton>
      </div>
      <div style={{ padding: '4px 20px 0' }}>
        <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Exercise</div>
      </div>
      <div
        className="vh-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 88px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {videos.length === 0 ? (
          <RestDayMessage />
        ) : (
          <>
            <HeroProgressCard eyebrow="Today's Exercises" value={completedToday} goal={videos.length} unit="videos" />
            <SecondaryProgressCard icon="footprints" label="Steps" value={TODAY_STEPS} goal={STEPS_GOAL} unit="steps" />

            {videoFilter && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--warning-subtle)',
                  border: '1px solid var(--warning)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  font: '600 0.8125rem/1.3 var(--font-sans)',
                  color: 'var(--ink)',
                }}
              >
                <Icon name="alert-triangle" size={16} color="var(--warning)" />
                Showing gentle, low-intensity options only
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visibleVideos.map((v) => (
                <VideoRow key={v.id} video={v} onOpen={(video) => onOpenVideo(video.id)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
