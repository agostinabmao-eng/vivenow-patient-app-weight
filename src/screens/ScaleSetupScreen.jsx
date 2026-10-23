import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import Button from '../components/Button';
import BackIconButton from '../components/BackIconButton';
import Photo from '../components/Photo';
import { patientPlan, SCALE_MODELS } from '../data/sampleData';

// Other Bluetooth devices that show up around the patient's home — they're
// listed (greyed out) so the tutorial matches what the phone really shows.
const NEIGHBOURS = ['JBL Flip 5', 'Galaxy Buds Pro'];

function Dots({ step }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flex: 1 }} aria-label={`Step ${step + 1} of 4`}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: i === step ? 28 : 10, height: 10, borderRadius: 'var(--radius-pill)', background: i <= step ? 'var(--teal-600)' : 'var(--ice-200)', transition: 'width var(--dur-med) var(--ease-standard)' }} />
      ))}
    </div>
  );
}

function DeviceRow({ name, tag, mine, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textAlign: 'left',
        minHeight: 76,
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        background: mine ? 'var(--teal-50)' : 'var(--surface-card)',
        border: `2px solid ${mine ? 'var(--teal-600)' : 'var(--border-subtle)'}`,
        boxShadow: mine ? 'none' : 'var(--shadow-xs)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: mine ? 1 : 0.6,
      }}
    >
      <span style={{ width: 48, height: 48, borderRadius: '50%', background: mine ? '#fff' : 'var(--ice-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={mine ? 'scale' : 'volume-2'} size={20} color={mine ? 'var(--teal-600)' : 'var(--text-muted)'} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', font: '700 1.0625rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{name}</span>
        <span style={{ display: 'block', font: '500 1rem/1.3 var(--font-sans)', color: mine ? 'var(--teal-700)' : 'var(--text-muted)' }}>{tag}</span>
      </span>
      {mine && <Icon name="chevron-right" size={22} color="var(--teal-700)" />}
    </button>
  );
}

/** First-time Bluetooth setup for the scale the care team sent. Required:
 * there is no way to skip it, because weight is never typed in — it arrives
 * from the scale. The patient only ever sees the one model assigned to them
 * (patientPlan.scaleModel). The Bluetooth search is simulated in this
 * preview; a native build would scan for real devices in step 3. */
export default function ScaleSetupScreen({ onBack, onConnected, onFinish }) {
  const model = SCALE_MODELS[patientPlan.scaleModel] || SCALE_MODELS.smart;
  const [step, setStep] = useState(0);
  const [scan, setScan] = useState('scanning'); // scanning | found | notListed | connecting
  const [scanRun, setScanRun] = useState(0);

  // Step 3: look for devices for a couple of seconds, then list them.
  useEffect(() => {
    if (step !== 2 || scan !== 'scanning') return undefined;
    const id = setTimeout(() => setScan('found'), 2600);
    return () => clearTimeout(id);
  }, [step, scan, scanRun]);

  // Connecting takes a moment, then the last step confirms.
  useEffect(() => {
    if (scan !== 'connecting') return undefined;
    const id = setTimeout(() => {
      onConnected();
      setStep(3);
    }, 2200);
    return () => clearTimeout(id);
  }, [scan, onConnected]);

  const goBack = () => {
    if (step === 0 || scan === 'connecting') return onBack();
    setScan('scanning');
    setStep((s) => s - 1);
    return undefined;
  };
  const searchAgain = () => {
    setScan('scanning');
    setScanRun((n) => n + 1);
  };

  const footer = (label, onClick, icon) => (
    <div style={{ padding: '12px calc(24px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(24px + var(--safe-left))', flexShrink: 0 }}>
      <Button variant="primary" size="lg" fullWidth onClick={onClick} iconLeft={icon}>
        {label}
      </Button>
    </div>
  );
  const title = (text) => <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>{text}</div>;
  const body = (text) => <div style={{ font: '400 1.0625rem/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>{text}</div>;

  let content;
  let footerNode = null;
  if (step === 0) {
    content = (
      <>
        <Photo name="bluetooth" alt="A phone's quick settings with Bluetooth turned on" height={220} />
        {title('Turn on Bluetooth')}
        {body('Swipe down from the top of your screen and tap the Bluetooth icon so it lights up.')}
      </>
    );
    footerNode = footer('Bluetooth is on', () => setStep(1), <Icon name="check" size={20} />);
  } else if (step === 1) {
    content = (
      <>
        <Photo name={`scale-${patientPlan.scaleModel}`} alt={`A person standing barefoot on a ${model.label}`} height={220} />
        {title(`Step on your ${model.label}`)}
        {body('Stand on it barefoot and stay still until the screen lights up. Your phone can only find the scale while it is awake.')}
      </>
    );
    footerNode = footer("I'm on the scale", () => { setScan('scanning'); setStep(2); }, <Icon name="check" size={20} />);
  } else if (step === 2) {
    content = (
      <>
        {title('Find your scale')}
        {scan === 'scanning' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '36px 0' }}>
            <span className="vh-spin" style={{ width: 72, height: 72, borderRadius: '50%', border: '6px solid var(--teal-100)', borderTopColor: 'var(--teal-600)', animation: 'vh-spin 1s linear infinite' }} />
            <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Looking for your scale…</div>
            {body('Keep standing on the scale.')}
          </div>
        )}
        {(scan === 'found' || scan === 'notListed') && (
          <>
            {body('Tap your scale to connect it to your phone.')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <DeviceRow name={model.deviceName} tag="Your scale" mine onClick={() => setScan('connecting')} />
              {NEIGHBOURS.map((n) => (
                <DeviceRow key={n} name={n} tag="Not your scale" disabled />
              ))}
            </div>
            {scan === 'notListed' ? (
              <div style={{ background: 'var(--accent-sand, var(--sand-50))', border: '1px solid var(--sand-100)', borderRadius: 'var(--radius-lg)', padding: 18, font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-body)' }}>
                Make sure you are standing on the scale and its screen is on. Check that Bluetooth is still on, then search again.
                <div style={{ marginTop: 14 }}>
                  <Button variant="outline" size="md" fullWidth onClick={searchAgain}>
                    Search again
                  </Button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setScan('notListed')} style={{ alignSelf: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 8px', minHeight: 'var(--tap-min)', font: '600 1rem/1.2 var(--font-sans)', color: 'var(--teal-700)' }}>
                I don&apos;t see my scale
              </button>
            )}
          </>
        )}
        {scan === 'connecting' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '36px 0' }}>
            <span style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="vh-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--teal-200)', animation: 'vh-ring 1.4s ease-out infinite' }} />
              <span style={{ position: 'relative', width: 72, height: 72, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="scale" size={30} color="var(--teal-600)" />
              </span>
            </span>
            <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Connecting to {model.label}…</div>
            {body('Stay on the scale for a moment.')}
          </div>
        )}
      </>
    );
  } else {
    content = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18, paddingTop: 24 }}>
        <span style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={36} color="#fff" strokeWidth={3.2} />
          </span>
        </span>
        {title('Your scale is connected')}
        {body('From now on, just step on it. Your weight is saved automatically and your task is marked done.')}
      </div>
    );
    footerNode = footer('Take my first weight', onFinish, <Icon name="scale" size={20} />);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'calc(12px + var(--safe-top)) 16px 0' }}>
        {step < 3 ? <BackIconButton onClick={goBack} /> : <span style={{ width: 60 }} />}
        <Dots step={step} />
        <span style={{ width: 60 }} />
      </div>
      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {content}
      </div>
      {footerNode}
    </div>
  );
}
