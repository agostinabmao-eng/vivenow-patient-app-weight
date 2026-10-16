import TaskScreenShell from '../components/TaskScreenShell';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function TaskSteps({ stepsInput, setStepsInput, onSave, onBack }) {
  const saveDisabled = !((parseInt(stepsInput, 10) || 0) > 0);
  return (
    <TaskScreenShell
      icon="footprints"
      title="Log Steps"
      description="Enter the step count from your tracker."
      onBack={onBack}
      footer={
        <Button variant="primary" size="lg" fullWidth disabled={saveDisabled} onClick={() => onSave(stepsInput)} iconLeft={<Icon name="check" size={20} />}>
          OK, save
        </Button>
      }
    >
      <div style={{ width: '100%', maxWidth: 220, marginTop: 24 }}>
        <Input
          label="Steps"
          placeholder="2,450"
          type="number"
          inputMode="numeric"
          value={stepsInput}
          onChange={(e) => setStepsInput(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}
        />
      </div>
    </TaskScreenShell>
  );
}
