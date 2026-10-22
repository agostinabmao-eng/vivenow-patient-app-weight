import { useState } from 'react';
import Icon from '../components/Icon';
import Button from '../components/Button';
import BackIconButton from '../components/BackIconButton';
import { ChoiceQuestion, MultiSelectQuestion, ScaleQuestion, TextQuestion, isAnswered } from '../components/SurveyFields';
import { SURVEY_QUESTIONS } from '../data/sampleData';

/** The weekly patient check-in — short enough to answer in one scroll
 * (unlike onboarding's one-question-per-screen wizard), since it's just 6
 * quick questions reachable any time from Home's check-in card. Submitting
 * sends the answers to the care team as a single message, not a graded
 * assessment. */
export default function SurveyScreen({ initialResponses = {}, onSubmit, onBack }) {
  const [responses, setResponses] = useState(initialResponses);
  const setAnswer = (id, value) => setResponses((r) => ({ ...r, [id]: value }));
  const canSubmit = SURVEY_QUESTIONS.every((q) => isAnswered(q, responses[q.id]));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BackIconButton onClick={onBack} />
          <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>Weekly Check-In</div>
        </div>
        <div style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6 }}>
          A quick update for your care team — takes under a minute.
        </div>
      </div>

      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {SURVEY_QUESTIONS.map((q) => (
          <div key={q.id}>
            <div style={{ font: '700 1rem/1.4 var(--font-display)', color: 'var(--ink)' }}>
              {q.question}
              {q.optional && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> (optional)</span>}
            </div>
            {q.type === 'choice' && <ChoiceQuestion options={q.options} value={responses[q.id]} onChange={(v) => setAnswer(q.id, v)} />}
            {q.type === 'multiselect' && (
              <MultiSelectQuestion options={q.options} noneOption={q.noneOption} value={responses[q.id]} onChange={(v) => setAnswer(q.id, v)} />
            )}
            {q.type === 'scale' && (
              <ScaleQuestion min={q.min} max={q.max} minLabel={q.minLabel} maxLabel={q.maxLabel} value={responses[q.id]} onChange={(v) => setAnswer(q.id, v)} />
            )}
            {q.type === 'text' && <TextQuestion value={responses[q.id]} onChange={(v) => setAnswer(q.id, v)} />}
          </div>
        ))}
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
        <Button variant="primary" size="lg" fullWidth disabled={!canSubmit} onClick={() => onSubmit(responses)} iconLeft={<Icon name="check" size={20} />}>
          Send to my care team
        </Button>
      </div>
    </div>
  );
}
