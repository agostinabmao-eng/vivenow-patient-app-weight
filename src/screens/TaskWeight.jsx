import TaskScreenShell from '../components/TaskScreenShell';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { weightToLbs } from '../utils/units';

export default function TaskWeight({ weightInput, setWeightInput, weightUnit, onSave, onBack }) {
  const saveDisabled = !((parseFloat(weightInput) || 0) > 0);
  return (
    <TaskScreenShell
      icon="scale"
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
      <div style={{ width: '100%', maxWidth: 220, marginTop: 24 }}>
        <Input
          label={`Weight (${weightUnit})`}
          placeholder={weightUnit === 'kg' ? '95.3' : '210.0'}
          type="number"
          inputMode="decimal"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}
        />
      </div>
    </TaskScreenShell>
  );
}
