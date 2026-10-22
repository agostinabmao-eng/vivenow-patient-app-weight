import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import BackIconButton from '../components/BackIconButton';
import Button from '../components/Button';

const PLAYBACK_SECONDS = 5;

/** A short education video — simpler than the exercise player (no safety
 * gate, no sets, no feedback survey; this is a video to understand
 * something, not an exercise to do). Simulated playback like every other
 * video in this prototype, marking it watched once it "finishes". */
export default function LearnVideoScreen({ videoId, title, onMarkWatched, onBack }) {
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setProgress(0);
    setFinished(false);
    const startedAt = Date.now();
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(1, (Date.now() - startedAt) / (PLAYBACK_SECONDS * 1000));
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [videoId]);

  useEffect(() => {
    if (progress >= 1 && !finished) {
      setFinished(true);
      onMarkWatched(videoId);
    }
  }, [progress, finished, onMarkWatched, videoId]);

  if (finished) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 32px', textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={34} color="var(--success)" />
        </div>
        <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>Nice — you watched this!</div>
        <div style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)' }}>{title}</div>
        <Button variant="primary" size="lg" onClick={onBack} style={{ marginTop: 8, minWidth: 200 }}>
          Back to Learn
        </Button>
      </div>
    );
  }

  const progressPct = Math.round(progress * 100);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 12px 0' }}>
        <BackIconButton onClick={onBack} />
      </div>
      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 4',
            borderRadius: 'var(--radius-lg)',
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
          <div
            role="progressbar"
            aria-label={`${title} playback progress`}
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ position: 'absolute', bottom: 14, left: 14, right: 14, height: 4, borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}
          >
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--teal-400)', transition: 'width 100ms linear' }} />
          </div>
        </div>
        <div style={{ font: '700 1.0625rem/1.3 var(--font-display)', color: 'var(--ink)' }}>{title}</div>
      </div>
    </div>
  );
}
