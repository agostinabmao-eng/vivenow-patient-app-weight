import TaskScreenShell from '../components/TaskScreenShell';
import MedicationList from '../components/MedicationList';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function TaskMeds({ medsTaken, onToggleMed, onMarkAllTaken, onBack }) {
  return (
    <TaskScreenShell
      icon="pill"
      title="Take Medications"
      description="Mark each medication as you take it."
      onBack={onBack}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={onBack} iconLeft={<Icon name="check" size={20} />}>
          Done
        </Button>
      }
    >
      <div style={{ width: '100%', marginTop: 20, textAlign: 'left' }}>
        <MedicationList medsTaken={medsTaken} onToggleMed={onToggleMed} onMarkAllTaken={onMarkAllTaken} />
      </div>
    </TaskScreenShell>
  );
}
