import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import BackIconButton from '../components/BackIconButton';
import Button from '../components/Button';
import { HeroProgressCard } from '../components/ProgressCards';
import DragSlider from '../components/DragSlider';
import { formatWater } from '../components/WaterSlider';
import { MEAL_TYPES, MEAL_PLAN, patientPlan } from '../data/sampleData';

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

function EditButton(props) {
  return (
    <IconButton variant="ghost" size="sm" label="Edit" title="Edit" className="vh-row-edit-btn" {...props}>
      <Icon name="pencil" color="var(--text-muted)" />
    </IconButton>
  );
}

function PlanItemRow({ name, calories, when, checked, onToggle, onEdit }) {
  const label = checked ? `Mark ${name} as not logged` : `Log ${name}`;
  return (
    <div className={checked ? 'vh-hover-row' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
      <div
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={checked}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: checked ? 'var(--success)' : 'transparent',
          border: checked ? 'none' : '1.5px solid var(--border-strong)',
          cursor: 'pointer',
        }}
      >
        {checked && <Icon name="check" size={14} color="#fff" />}
      </div>
      <div onClick={onToggle} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div style={{ font: '600 0.875rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{name}</div>
        {checked && when && <div style={{ font: '400 0.75rem/1.3 var(--font-sans)', color: 'var(--success)' }}>Logged · {when}</div>}
      </div>
      <div style={{ font: '600 0.8125rem/1 var(--font-sans)', color: 'var(--text-muted)', flexShrink: 0 }}>{calories} kcal</div>
      {checked && <EditButton onClick={onEdit} />}
    </div>
  );
}

function OffPlanRow({ text, calories, when, onEdit }) {
  return (
    <div className="vh-hover-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px dashed var(--border-default)', marginTop: 4 }}>
      <div
        aria-hidden="true"
        style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--teal-50)' }}
      >
        <Icon name="utensils" size={13} color="var(--teal-600)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 0.875rem/1.3 var(--font-sans)', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</div>
        <div style={{ font: '400 0.75rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>Logged (not on plan) · {when}</div>
      </div>
      <div style={{ font: '600 0.8125rem/1 var(--font-sans)', color: 'var(--text-muted)', flexShrink: 0 }}>{calories} kcal</div>
      <EditButton onClick={onEdit} />
    </div>
  );
}

/** Water is the one secondary metric a patient actually wants to update
 * from right here in Nutrition — the drag slider itself is always on
 * screen (no tap-to-reveal step in the way), same slider as the dedicated
 * Water task screen, so a glass gets logged in one direct motion. */
function WaterCard({ waterGlasses, waterUnit, onChange }) {
  const goalGlasses = patientPlan.waterGoalGlasses;
  const atGoal = waterGlasses >= goalGlasses;

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon name="droplet" size={15} color="var(--teal-600)" />
        <div style={{ font: '600 0.8125rem/1.2 var(--font-sans)', color: 'var(--ink)' }}>Water</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {atGoal && <Icon name="check" size={13} color="var(--success)" />}
          <span style={{ font: '600 0.75rem/1 var(--font-sans)', color: atGoal ? 'var(--success)' : 'var(--text-muted)' }}>
            {formatWater(waterGlasses, waterUnit)} / {formatWater(goalGlasses, waterUnit)}
          </span>
        </div>
      </div>
      <DragSlider value={waterGlasses} max={goalGlasses} step={1} onChange={onChange} height={10} />
    </div>
  );
}

function MealCard({ type, entries, onQuickLog, onRemoveEntry, onOpenMeal, onEditEntry }) {
  const planItems = MEAL_PLAN[type];
  const loggedTotal = entries.reduce((sum, e) => sum + e.calories, 0);
  const findEntry = (planName) => entries.find((e) => e.planItemName === planName);
  const offPlanEntries = entries.filter((e) => !e.planItemName);

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ font: '700 0.9375rem/1.3 var(--font-display)', color: 'var(--ink)' }}>{MEAL_LABELS[type]}</div>
        {entries.length > 0 && <div style={{ font: '600 0.78125rem/1 var(--font-sans)', color: 'var(--success)' }}>{loggedTotal} kcal logged</div>}
      </div>
      <div style={{ font: '500 0.71875rem/1 var(--font-sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 8 }}>
        Your care team recommends:
      </div>
      <div style={{ marginTop: 2 }}>
        {planItems.map((item) => {
          const entry = findEntry(item.name);
          return (
            <PlanItemRow
              key={item.name}
              name={item.name}
              calories={entry ? entry.calories : item.calories}
              when={entry?.when}
              checked={!!entry}
              onToggle={() => (entry ? onRemoveEntry(type, entry.id) : onQuickLog(type, item))}
              onEdit={entry ? () => onEditEntry(type, entry.id) : undefined}
            />
          );
        })}
        {offPlanEntries.map((entry) => (
          <OffPlanRow key={entry.id} text={entry.text} calories={entry.calories} when={entry.when} onEdit={() => onEditEntry(type, entry.id)} />
        ))}
      </div>
      <Button variant="outline" size="sm" fullWidth onClick={() => onOpenMeal(type)} style={{ marginTop: 6 }} iconLeft={<Icon name="plus" size={15} />}>
        Add something else
      </Button>
    </div>
  );
}

/** Nutrition tab — today's meal plan and diary. Reached identically from the
 * Home checklist ("Log Your Meal") and the bottom nav — same screen, same
 * state. Each meal shows what the care team prescribed; tapping an
 * unlogged item logs it in one tap, or the patient can log something
 * different entirely via the shared composer (its own screen, see
 * MealComposerScreen), which returns here once saved. Each meal type keeps
 * a *list* of logged entries, so checking off a plan item never erases
 * something else already logged for that meal. */
export default function NutritionScreen({ meals, waterGlasses, waterUnit, onQuickLog, onRemoveEntry, onOpenMeal, onSetWaterGlasses, onBack }) {
  const todayTotal = MEAL_TYPES.reduce((sum, t) => sum + meals[t].reduce((s, e) => s + e.calories, 0), 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 12px 0' }}>
        <BackIconButton onClick={onBack} />
      </div>
      <div style={{ padding: '4px 20px 0' }}>
        <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Nutrition</div>
      </div>

      <div
        className="vh-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px 88px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <HeroProgressCard eyebrow="Today's Diary" value={todayTotal} goal={patientPlan.calorieGoal} unit="kcal" />
        <WaterCard waterGlasses={waterGlasses} waterUnit={waterUnit} onChange={onSetWaterGlasses} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MEAL_TYPES.map((type) => (
            <MealCard key={type} type={type} entries={meals[type]} onQuickLog={onQuickLog} onRemoveEntry={onRemoveEntry} onOpenMeal={onOpenMeal} onEditEntry={onOpenMeal} />
          ))}
        </div>
      </div>
    </div>
  );
}
