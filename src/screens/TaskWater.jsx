import TaskScreenShell from '../components/TaskScreenShell';
import WaterSlider from '../components/WaterSlider';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function TaskWater({ waterGlasses, waterUnit, onSetGlasses, onSave, onBack }) {
  const saveDisabled = !(waterGlasses > 0);
  return (
    <TaskScreenShell
      icon="droplet"
      photo="water"
      title="Drink Water"
      description="Tap + for each glass, or drag the bar."
      onBack={onBack}
      footer={
        <Button variant="primary" size="lg" fullWidth disabled={saveDisabled} onClick={onSave} iconLeft={<Icon name="check" size={20} />}>
          OK, save
        </Button>
      }
    >
      <div style={{ width: '100%', marginTop: 28 }}>
        <WaterSlider waterGlasses={waterGlasses} waterUnit={waterUnit} onChange={onSetGlasses} />
      </div>
    </TaskScreenShell>
  );
}
