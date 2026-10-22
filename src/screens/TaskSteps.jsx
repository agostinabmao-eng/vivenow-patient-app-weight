import TaskScreenShell from '../components/TaskScreenShell';
import Stepper from '../components/Stepper';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function TaskSteps({ stepsInput, setStepsInput, onSave, onBack }) {
  const saveDisabled = !((parseInt(stepsInput, 10) || 0) > 0);
  return (
    <TaskScreenShell
      icon="footprints"
      photo="steps"
      title="Log Steps"
      description="Enter the step count from your tracker."
      onBack={onBack}
      footer={
        <Button variant="primary" size="lg" fullWidth disabled={saveDisabled} onClick={() => onSave(stepsInput)} iconLeft={<Icon name="check" size={20} />}>
          OK, save
        </Button>
      }
    >
      <div style={{ width: '100%', marginTop: 28 }}>
        <Stepper label="Steps today" unit="steps" placeholder="2450" value={stepsInput} onChange={setStepsInput} step={250} max={100000} />
      </div>
    </TaskScreenShell>
  );
}
