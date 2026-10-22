import TaskScreenShell from '../components/TaskScreenShell';
import Stepper from '../components/Stepper';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { weightToLbs } from '../utils/units';

export default function TaskWeight({ weightInput, setWeightInput, weightUnit, onSave, onBack }) {
  const saveDisabled = !((parseFloat(weightInput) || 0) > 0);
  return (
    <TaskScreenShell
      icon="scale"
      photo="weight"
      title="Measure Weight"
      description="Enter the reading from your scale."
      onBack={onBack}
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={saveDisabled}
          onClick={() => onSave(weightToLbs(parseFloat(weightInput) || 0, weightUnit))}
          iconLeft={<Icon name="check" size={20} />}
        >
          OK, save reading
        </Button>
      }
    >
      <div style={{ width: '100%', marginTop: 28 }}>
        <Stepper
          label="Your weight"
          unit={weightUnit}
          placeholder={weightUnit === 'kg' ? '95.3' : '210.0'}
          value={weightInput}
          onChange={setWeightInput}
          step={weightUnit === 'kg' ? 0.1 : 0.2}
          decimals={1}
          min={1}
          max={999}
        />
      </div>
    </TaskScreenShell>
  );
}
