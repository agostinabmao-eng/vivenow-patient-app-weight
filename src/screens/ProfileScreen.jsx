import Icon from '../components/Icon';
import BackIconButton from '../components/BackIconButton';
import Switch from '../components/Switch';
import { patientProfile, todaySample } from '../data/sampleData';
import { calculateBmi, classifyBmi, z68Code } from '../utils/bmi';

function initials(fullName) {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function SectionLabel({ children }) {
  return (
    <div style={{ font: '600 1rem/1 var(--font-display)', color: 'var(--text-muted)' }}>
      {children}
    </div>
  );
}

function UnitToggle({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2, flexShrink: 0 }}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            aria-pressed={active}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: active ? '#fff' : 'transparent',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              color: active ? 'var(--ink)' : 'var(--text-muted)',
              font: '600 1rem/1 var(--font-sans)',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function DisplayRow({ title, description, control, last }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 0',
        borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{title}</div>
        <div style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>
      </div>
      {control}
    </div>
  );
}

/** BMI classification badge — pulls the patient's current weight + profile
 * height, maps the result to the nursing team's verified Weight Management
 * ICD-10 ladder (E66.3 overweight, E66.811/812/813 obesity classes 1–3),
 * and shows the matching Z68 BMI-tracking code alongside the BMI value. */
function BmiBadge({ weightLbs, heightIn }) {
  const bmi = calculateBmi(weightLbs, heightIn);
  const level = classifyBmi(bmi);
  if (!level) return null;
  const isObesity = level.key !== 'overweight';
  const tint = isObesity ? 'var(--danger)' : 'var(--warning)';
  const tintSubtle = isObesity ? 'var(--danger-subtle)' : 'var(--warning-subtle)';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: tintSubtle,
        border: `1px solid ${tint}`,
        borderRadius: 'var(--radius-pill)',
        padding: '7px 12px',
      }}
    >
      <span style={{ font: '700 1rem/1 var(--font-sans)', color: tint }}>{level.label}</span>
      <span style={{ width: 3, height: 3, borderRadius: '50%', background: tint, opacity: 0.5, flexShrink: 0 }} />
      <span style={{ font: '600 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>
        BMI {bmi.toFixed(1)} · {level.icd10} · {z68Code(bmi)}
      </span>
    </div>
  );
}

function AccountRow({ icon, label, last, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 0',
        borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
        cursor: 'pointer',
      }}
    >
      <Icon name={icon} size={19} color="var(--text-muted)" />
      <div style={{ flex: 1, font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{label}</div>
      <Icon name="chevron-right" size={18} color="var(--gray-500)" />
    </div>
  );
}

/** Patient's own profile — reached from the icon-button in Home's top-right
 * corner (in place of a bare notifications bell). Shows who the app thinks
 * she is, her care team's contact info, which RPM devices are paired, and
 * the usual account-level settings entries + sign out. */
const WATER_UNIT_OPTIONS = [
  { key: 'ounces', label: 'Ounces' },
  { key: 'glasses', label: 'Glasses' },
];
const WEIGHT_UNIT_OPTIONS = [
  { key: 'lbs', label: 'lbs' },
  { key: 'kg', label: 'kg' },
];

export default function ProfileScreen({
  onBack,
  simpleMode,
  onSetSimpleMode,
  waterUnit,
  onSetWaterUnit,
  weightUnit,
  onSetWeightUnit,
  onReportRisk,
  onSimulateNurseUpdate,
}) {
  const { fullName, dob, patientId, heightIn, conditions, careTeam, devices } = patientProfile;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        className="vh-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: 'calc(20px + var(--safe-top)) 20px 88px', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BackIconButton onClick={onBack} />
          <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>Profile</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--teal-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ font: '700 1.5rem/1 var(--font-display)', color: '#fff' }}>{initials(fullName)}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: '700 1.0625rem/1.3 var(--font-display)', color: 'var(--ink)' }}>{fullName}</div>
            <div style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 2 }}>Born {dob}</div>
            <div style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)' }}>Patient ID {patientId}</div>
          </div>
        </div>

        <BmiBadge weightLbs={todaySample.weight} heightIn={heightIn} />

        <div>
          <SectionLabel>Managing</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {conditions.map((c) => (
              <span
                key={c}
                style={{
                  font: '600 1rem/1 var(--font-sans)',
                  color: 'var(--teal-700)',
                  background: 'var(--teal-50)',
                  border: '1px solid var(--teal-200)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '7px 12px',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Care Team</SectionLabel>
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              padding: 14,
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="stethoscope" size={19} color="var(--teal-600)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{careTeam.name}</div>
              <div style={{ font: '400 1rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>{careTeam.role}</div>
            </div>
            <a
              href={`tel:${careTeam.phoneTel}`}
              aria-label={`Call ${careTeam.name}`}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--teal-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="phone-call" size={17} color="#fff" />
            </a>
          </div>
        </div>

        <div>
          <SectionLabel>Connected Devices</SectionLabel>
          <div
            style={{
              marginTop: 10,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              padding: '4px 14px',
            }}
          >
            {devices.map((d, i) => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: i === devices.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                <Icon name={d.icon} size={18} color="var(--text-muted)" />
                <div style={{ flex: 1, font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{d.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.connected ? 'var(--success)' : 'var(--gray-300)' }} />
                  <span style={{ font: '500 1rem/1 var(--font-sans)', color: d.connected ? 'var(--success)' : 'var(--text-muted)' }}>
                    {d.connected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Display</SectionLabel>
          <div
            style={{
              marginTop: 10,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              padding: '0 14px',
            }}
          >
            <DisplayRow
              title="Simple mode"
              description="Shows just your to-do list, with fewer taps to log each item."
              control={<Switch checked={simpleMode} onChange={onSetSimpleMode} label="Simple mode" />}
            />
            <DisplayRow
              title="Water units"
              description="How your water intake is shown"
              control={<UnitToggle value={waterUnit} onChange={onSetWaterUnit} options={WATER_UNIT_OPTIONS} />}
            />
            <DisplayRow
              title="Weight units"
              description="How your weight is shown"
              control={<UnitToggle value={weightUnit} onChange={onSetWeightUnit} options={WEIGHT_UNIT_OPTIONS} />}
              last
            />
          </div>
        </div>

        <div>
          <SectionLabel>Account</SectionLabel>
          <div
            style={{
              marginTop: 10,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              padding: '0 14px',
            }}
          >
            <AccountRow icon="bell" label="Notifications" />
            <AccountRow icon="shield" label="Privacy &amp; Data" />
            <AccountRow icon="alert-triangle" label="Report a fall, pain, or new symptom" onClick={onReportRisk} />
            <AccountRow icon="help-circle" label="Help &amp; Support" last />
          </div>
        </div>

        {/* Dev-only stand-in for a live Portal sync — there's no real-time
            plan backend in this prototype, so this just demonstrates the
            "Your nurse updated your plan" notice the real sync would fire. */}
        <button
          onClick={onSimulateNurseUpdate}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 0',
            font: '500 1rem/1.3 var(--font-sans)',
            color: 'var(--text-muted)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          Simulate: nurse updated your plan
        </button>

        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            padding: '10px 0',
            font: '600 1rem/1 var(--font-sans)',
            color: 'var(--danger)',
            cursor: 'pointer',
          }}
        >
          <Icon name="log-out" size={17} color="var(--danger)" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
