import { useState } from 'react';
import Icon from '../components/Icon';
import Button from '../components/Button';
import BackIconButton from '../components/BackIconButton';
import { ChoiceQuestion, MultiSelectQuestion, TextQuestion, isAnswered } from '../components/SurveyFields';
import WelcomeScreen from './WelcomeScreen';
import { buildOnboardingSteps } from '../data/onboardingQuestions';
import { patientName, patientPlan } from '../data/sampleData';

/** Step 2 of onboarding (step 1 is the nurse's intake call, outside the
 * app — see WelcomeScreen). Welcome first, then one low-risk preference
 * question per screen — never a goal, diagnosis, medication, fall, pain or
 * mobility question; the care team already has all of that. Shown once,
 * before Home, the first time the app is opened — see useAppState, which
 * persists completion separately from `day` (this shouldn't reset daily).
 *
 * `initialResponses`/`initialStepIndex`/`initialWelcomeSeen` let a
 * paused-and-resumed session pick up exactly where it left off. */
export default function OnboardingSurveyScreen({
  initialResponses = {},
  initialStepIndex = 0,
  initialWelcomeSeen = false,
  onSubmit,
  onPause,
  onGoHome,
}) {
  const [welcomeSeen, setWelcomeSeen] = useState(initialWelcomeSeen);
  const [responses, setResponses] = useState(initialResponses);
  const [stepIndex, setStepIndex] = useState(initialStepIndex);
  const [done, setDone] = useState(false);

  if (!welcomeSeen) {
    return <WelcomeScreen onStart={() => setWelcomeSeen(true)} />;
  }

  const steps = buildOnboardingSteps(patientPlan);
  const index = Math.min(stepIndex, steps.length - 1);
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const canProceed = isAnswered(step, responses[step.id]);

  const setAnswer = (value) => setResponses((r) => ({ ...r, [step.id]: value }));
  // The first question goes back to Welcome (nowhere earlier to pause to);
  // every later question just steps back one, same as a normal wizard.
  const goBack = () => {
    if (index === 0) {
      setWelcomeSeen(false);
      onPause(responses, 0, false);
    } else {
      setStepIndex((i) => Math.max(0, i - 1));
    }
  };
  const advance = () => {
    if (isLast) {
      onSubmit(responses);
      setDone(true);
    } else {
      setStepIndex(index + 1);
    }
  };
  const goNext = () => canProceed && advance();
  // Skipping this one question just moves on with no answer recorded for
  // it — unlike Next, it doesn't require one. Skipping all of them pauses
  // onboarding exactly like backing out of question 1 does: the draft is
  // saved as incomplete and Home shows a nudge to finish later.
  const skipQuestion = () => advance();
  const skipAll = () => onPause(responses, index, true);

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
        <div style={{ font: '400 0.9375rem/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
          Thanks for sharing — we&apos;ve personalized your app with this.
        </div>
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
          <button
            onClick={skipAll}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 4px',
              font: '600 0.78125rem/1 var(--font-sans)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Skip
          </button>
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
            Just a few quick preferences — this helps us personalize your app.
          </div>
        )}
        <div style={{ font: '700 1.1875rem/1.4 var(--font-display)', color: 'var(--ink)' }}>
          {step.question}
          {step.optional && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> (optional)</span>}
        </div>
        {step.tip && (
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              gap: 8,
              background: 'var(--teal-50)',
              border: '1px solid var(--teal-200)',
              borderRadius: 'var(--radius-md)',
              padding: 12,
            }}
          >
            <Icon name="message-circle" size={16} color="var(--teal-600)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ font: '400 0.8125rem/1.4 var(--font-sans)', color: 'var(--text-body)' }}>{step.tip}</span>
          </div>
        )}
        {step.type === 'choice' && <ChoiceQuestion options={step.options} images={step.images} value={responses[step.id]} onChange={setAnswer} />}
        {step.type === 'multiselect' && (
          <MultiSelectQuestion
            options={step.options}
            images={step.images}
            noneOption={step.noneOption}
            otherOption={step.otherOption}
            otherPlaceholder={step.otherPlaceholder}
            layout={step.layout}
            value={responses[step.id]}
            onChange={setAnswer}
          />
        )}
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
        <button
          onClick={skipQuestion}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 0',
            textAlign: 'center',
            font: '600 0.84375rem/1 var(--font-sans)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Skip this question
        </button>
      </div>
    </div>
  );
}
