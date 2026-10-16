import { useState } from 'react';
import Icon from '../components/Icon';
import Button from '../components/Button';
import BackIconButton from '../components/BackIconButton';
import { ChoiceQuestion, MultiSelectQuestion, TextQuestion, isAnswered } from '../components/SurveyFields';
import MealPatternQuestion from '../components/MealPatternQuestion';
import BodyMapQuestion from '../components/BodyMapQuestion';
import { ONBOARDING_QUESTIONS, patientName } from '../data/sampleData';

// Ordered with the conditional follow-ups spliced in only when their parent
// answer calls for them, so picking "No" (or leaving a "Something else"
// pill untapped) skips straight past the detail question it would have
// unlocked. Recomputed on every render (cheap — a dozen objects) so an
// edited earlier answer immediately adds or removes the step it gates,
// instead of needing its own effect to resync.
function buildSteps(responses) {
  const q = ONBOARDING_QUESTIONS;
  const steps = [q.goals, q.challenges, q.typicalEating, q.activityLevel, q.painCheck];
  if (responses.painCheck === 'Yes') steps.push(q.painAreas);
  steps.push(q.biggestChallenge);
  return steps;
}

/** The very first survey a patient sees — adapted from the nurse's
 * onboarding intake interview (see ONBOARDING_QUESTIONS), one question per
 * screen instead of one long form, since that reads better on a phone and
 * doesn't front-load the whole interview at once. Shown once, before Home,
 * the first time the app is opened — see useAppState, which persists
 * completion separately from `day` (this shouldn't reset daily).
 *
 * `initialResponses`/`initialStepIndex` let a paused-and-resumed session
 * pick up exactly where it left off, instead of restarting at question 1. */
export default function OnboardingSurveyScreen({ initialResponses = {}, initialStepIndex = 0, onSubmit, onPause, onGoHome }) {
  const [responses, setResponses] = useState(initialResponses);
  const [stepIndex, setStepIndex] = useState(initialStepIndex);
  const [done, setDone] = useState(false);

  const steps = buildSteps(responses);
  const index = Math.min(stepIndex, steps.length - 1);
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const canProceed = isAnswered(step, responses[step.id]);

  const setAnswer = (value) => setResponses((r) => ({ ...r, [step.id]: value }));
  // The first question has nowhere earlier to go, so Back pauses instead —
  // saves the draft as-is and returns to Home; every later question just
  // steps back one, same as a normal wizard.
  const goBack = () => (index === 0 ? onPause(responses, index) : setStepIndex((i) => Math.max(0, i - 1)));
  const goNext = () => {
    if (isLast) {
      onSubmit(responses);
      setDone(true);
    } else {
      setStepIndex(index + 1);
    }
  };

  if (done) {
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
        <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>You&apos;re all set, {patientName}!</div>
        <div style={{ font: '400 0.9375rem/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>Thanks for sharing — your care team will use this to build your plan.</div>
        <Button variant="primary" size="lg" onClick={onGoHome} style={{ marginTop: 8, minWidth: 220 }}>
          Go to my dashboard
        </Button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BackIconButton onClick={goBack} />
          <div style={{ flex: 1, textAlign: 'center', font: '600 0.75rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>
            Question {index + 1} of {steps.length}
          </div>
          <div style={{ width: 36, height: 36, flexShrink: 0 }} />
        </div>
        <div style={{ marginTop: 10, height: 4, borderRadius: 'var(--radius-pill)', background: 'var(--teal-50)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${((index + 1) / steps.length) * 100}%`,
              height: '100%',
              background: 'var(--teal-500)',
              transition: 'width var(--dur-med) var(--ease-standard)',
            }}
          />
        </div>
      </div>

      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
        {index === 0 && (
          <div style={{ font: '500 0.8125rem/1.3 var(--font-sans)', color: 'var(--text-muted)', marginBottom: 8 }}>
            Let&apos;s build your plan together — most answers are optional.
          </div>
        )}
        <div style={{ font: '700 1.1875rem/1.4 var(--font-display)', color: 'var(--ink)' }}>
          {step.question}
          {step.optional && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> (optional)</span>}
        </div>
        {step.type === 'choice' && <ChoiceQuestion options={step.options} value={responses[step.id]} onChange={setAnswer} />}
        {step.type === 'multiselect' && (
          <MultiSelectQuestion
            options={step.options}
            noneOption={step.noneOption}
            otherOption={step.otherOption}
            layout={step.layout}
            value={responses[step.id]}
            onChange={setAnswer}
          />
        )}
        {step.type === 'meal-pattern' && <MealPatternQuestion value={responses[step.id]} onChange={setAnswer} />}
        {step.type === 'body-map' && <BodyMapQuestion value={responses[step.id]} onChange={setAnswer} />}
        {step.type === 'text' && <TextQuestion value={responses[step.id]} onChange={setAnswer} placeholder={step.placeholder} />}
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
          disabled={!canProceed}
          onClick={goNext}
          iconLeft={isLast ? <Icon name="check" size={20} /> : undefined}
          iconRight={!isLast ? <Icon name="arrow-right" size={18} /> : undefined}
        >
          {isLast ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
