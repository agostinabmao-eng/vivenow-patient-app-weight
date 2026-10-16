import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import BackIconButton from '../components/BackIconButton';
import Button from '../components/Button';
import { formatDose } from '../data/sampleData';

// There's no real video file behind this prototype, so "playback" is a
// timed simulation — long enough to feel like watching something, short
// enough to actually test. A real build would swap this for a <video>
// `ended` event driving the same onMarkWatched call. A single exercise's
// sets play out faster than a full workout — it's one movement, not a
// routine — and pause for a short rest in between instead of running
// straight through.
const PLAYBACK_SECONDS = 6;
const EXERCISE_SET_SECONDS = 4;
const MOOD_OPTIONS = ['Great', 'Good', 'Tough but doable', 'Too difficult'];

const overlayBtnStyle = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'rgba(0,0,0,0.4)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

function ChoicePill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '10px 16px',
        borderRadius: 'var(--radius-pill)',
        border: `1.5px solid ${active ? 'var(--teal-500)' : 'var(--border-default)'}`,
        background: active ? 'var(--teal-50)' : '#fff',
        color: active ? 'var(--teal-700)' : 'var(--ink)',
        font: '600 0.875rem/1 var(--font-sans)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

/** Exercise video — plays right in portrait (no "rotate your phone" gate),
 * with Previous/Next to move through the day's routine, an optional
 * full-screen view, and a mute toggle. A full workout counts as done once
 * played start to finish (see useAppState.markVideoWatched) — there's no
 * manual "mark as watched" button. A single exercise instead plays one set
 * at a time, shows "Set X of Y", and pauses for a short rest in between;
 * it only counts as done once every set is logged. Finishing shows a
 * "great job" screen, then a short feedback survey, before returning to
 * the Exercise list. */
export default function VideoPlayerScreen({ videos, currentId, onOpenVideo, onMarkWatched, onSubmitFeedback, onContactCareTeam, onBack }) {
  const index = videos.findIndex((v) => v.id === currentId);
  const video = videos[index];
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < videos.length - 1;
  const isExercise = video?.kind === 'exercise';

  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('playing'); // 'playing' | 'resting' | 'finished' | 'survey'
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [mood, setMood] = useState(null);
  const [pain, setPain] = useState(null);
  const markedForSetRef = useRef(-1);

  // A different video opened (via Previous/Next, or a fresh tap from the
  // Exercise list) — start its playback simulation over.
  useEffect(() => {
    setProgress(0);
    setStage('playing');
    setMood(null);
    setPain(null);
    markedForSetRef.current = -1;
  }, [currentId]);

  const playbackSeconds = isExercise ? EXERCISE_SET_SECONDS : PLAYBACK_SECONDS;
  useEffect(() => {
    if (stage !== 'playing') return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - startedAt) / (playbackSeconds * 1000)));
    }, 100);
    return () => clearInterval(id);
  }, [stage, currentId, playbackSeconds]);

  useEffect(() => {
    if (progress < 1 || stage !== 'playing' || !video) return;
    // Guard against double-firing for the same set (effects can re-run on
    // unrelated re-renders while progress is already at 1).
    const setBeingPlayed = isExercise ? video.setsDone : 0;
    if (markedForSetRef.current === setBeingPlayed) return;
    markedForSetRef.current = setBeingPlayed;

    if (isExercise) {
      const wasLastSet = video.setsDone + 1 >= video.dose.sets;
      onMarkWatched(video.id);
      setStage(wasLastSet ? 'finished' : 'resting');
    } else {
      onMarkWatched(video.id);
      setStage('finished');
    }
  }, [progress, stage, onMarkWatched, video, isExercise]);

  if (!video) return null;

  if (stage === 'resting') {
    const nextSet = video.setsDone + 1;
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={34} color="var(--teal-600)" />
        </div>
        <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>
          Set {video.setsDone} of {video.dose.sets} done
        </div>
        <div style={{ font: '400 0.9375rem/1.4 var(--font-sans)', color: 'var(--text-muted)' }}>Take a short rest, then start your next set.</div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setProgress(0);
            setStage('playing');
          }}
          style={{ marginTop: 8, minWidth: 220 }}
        >
          Start set {nextSet} of {video.dose.sets}
        </Button>
      </div>
    );
  }

  if (stage === 'finished') {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={34} color="var(--success)" />
        </div>
        <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Great job — exercise complete!</div>
        <div style={{ font: '400 0.9375rem/1.4 var(--font-sans)', color: 'var(--text-muted)' }}>{video.title}</div>
        <Button variant="primary" size="lg" onClick={() => setStage('survey')} style={{ marginTop: 8, minWidth: 200 }}>
          Continue
        </Button>
      </div>
    );
  }

  if (stage === 'survey') {
    const canSubmit = mood !== null && pain !== null;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: 'calc(12px + var(--safe-top)) 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <BackIconButton onClick={onBack} />
            <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>How did that feel?</div>
          </div>
          <div style={{ font: '400 0.875rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6 }}>{video.title}</div>
        </div>
        <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div style={{ font: '600 0.9375rem/1.4 var(--font-sans)', color: 'var(--ink)' }}>How did the exercise feel overall?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {MOOD_OPTIONS.map((opt) => (
                <ChoicePill key={opt} label={opt} active={mood === opt} onClick={() => setMood(opt)} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ font: '600 0.9375rem/1.4 var(--font-sans)', color: 'var(--ink)' }}>Did you feel any pain doing this exercise?</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {['Yes', 'No'].map((opt) => (
                <ChoicePill key={opt} label={opt} active={pain === opt} onClick={() => setPain(opt)} />
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: `0 calc(24px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(24px + var(--safe-left))`,
            flexShrink: 0,
          }}
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSubmit}
            onClick={() => {
              onSubmitFeedback(video.id, { mood, pain });
              setStage(pain === 'Yes' ? 'pain-warning' : 'thanks');
            }}
            iconLeft={<Icon name="check" size={20} />}
          >
            Send feedback
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={onBack}>
            Skip
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'pain-warning') {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--warning-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="alert-triangle" size={34} color="var(--warning)" />
        </div>
        <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Please stop this exercise for now</div>
        <div style={{ font: '400 0.9375rem/1.5 var(--font-sans)', color: 'var(--text-body)' }}>
          Don&apos;t do &ldquo;{video.title}&rdquo; again until your care team has reviewed this. If the discomfort doesn&apos;t go away — or gets worse — contact your care team.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
          <Button variant="danger" size="lg" fullWidth onClick={onContactCareTeam}>
            Contact care team
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={() => setStage('thanks')}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'thanks') {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={34} color="var(--success)" />
        </div>
        <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Thanks for letting us know!</div>
        <div style={{ font: '400 0.9375rem/1.4 var(--font-sans)', color: 'var(--text-muted)' }}>Your feedback helps your care team keep your plan on track.</div>
        <Button variant="primary" size="lg" onClick={onBack} style={{ marginTop: 8, minWidth: 200 }}>
          Back to Exercises
        </Button>
      </div>
    );
  }

  // stage === 'playing'
  const progressPct = Math.round(progress * 100);

  const player = (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: fullscreen ? undefined : '3 / 4',
        flex: fullscreen ? 1 : undefined,
        borderRadius: fullscreen ? 0 : 'var(--radius-lg)',
        background: 'var(--navy-900)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="play" size={32} color="#fff" />
      </div>
      {fullscreen && (
        <button onClick={() => setFullscreen(false)} aria-label="Exit full screen" style={{ position: 'absolute', top: 14, left: 14, ...overlayBtnStyle }}>
          <Icon name="arrow-left" size={18} color="#fff" />
        </button>
      )}
      <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          role="progressbar"
          aria-label={`${video.title} playback progress`}
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ flex: 1, height: 4, borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}
        >
          <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--teal-400)', transition: 'width 100ms linear' }} />
        </div>
        <button onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'} style={overlayBtnStyle}>
          <Icon name={muted ? 'volume-x' : 'volume-2'} size={16} color="#fff" />
        </button>
        <button onClick={() => setFullscreen((f) => !f)} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'} style={overlayBtnStyle}>
          <Icon name={fullscreen ? 'minimize' : 'maximize'} size={16} color="#fff" />
        </button>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--navy-900)', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
        {player}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 12px 0' }}>
        <BackIconButton onClick={onBack} />
      </div>
      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {player}
        <div>
          <div style={{ font: '700 1.0625rem/1.3 var(--font-display)', color: 'var(--ink)' }}>{video.title}</div>
          <div style={{ font: '400 0.8125rem/1.3 var(--font-sans)', color: 'var(--text-muted)', marginTop: 2 }}>
            {isExercise ? `Set ${video.setsDone + 1} of ${video.dose.sets} · ${formatDose(video.dose)}` : video.duration} · Exercise {index + 1} of {videos.length}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: `0 calc(24px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(24px + var(--safe-left))`,
          flexShrink: 0,
        }}
      >
        <Button variant="outline" size="lg" disabled={!hasPrev} onClick={() => onOpenVideo(videos[index - 1].id)} iconLeft={<Icon name="arrow-left" size={18} />} style={{ flex: 1 }}>
          Previous
        </Button>
        <Button variant="primary" size="lg" disabled={!hasNext} onClick={() => onOpenVideo(videos[index + 1].id)} iconRight={<Icon name="arrow-right" size={18} />} style={{ flex: 1 }}>
          Next
        </Button>
      </div>
    </div>
  );
}
