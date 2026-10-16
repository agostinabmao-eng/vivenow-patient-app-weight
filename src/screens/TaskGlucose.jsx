import TaskScreenShell from '../components/TaskScreenShell';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function TaskGlucose({ glucoseInput, setGlucoseInput, onSave, onBack }) {
  const saveDisabled = !((parseInt(glucoseInput, 10) || 0) > 0);
  return (
    <TaskScreenShell
      icon="droplets"
      title="Measure Glucose"
      description="Enter the reading from your glucose meter."
      onBack={onBack}
      footer={
        <Button variant="primary" size="lg" fullWidth disabled={saveDisabled} onClick={() => onSave(glucoseInput)} iconLeft={<Icon name="check" size={20} />}>
          OK, save reading
        </Button>
      }
    >
      <div style={{ width: '100%', maxWidth: 220, marginTop: 24 }}>
        <Input
          label="Glucose (mg/dL)"
          placeholder="122"
          type="number"
          inputMode="numeric"
          value={glucoseInput}
          onChange={(e) => setGlucoseInput(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}
        />
      </div>
    </TaskScreenShell>
  );
}
