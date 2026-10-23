import TaskScreenShell from '../components/TaskScreenShell';
import MedicationList from '../components/MedicationList';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { MEDICATIONS } from '../data/sampleData';

export default function TaskMeds({ medsTaken, onToggleMed, onMarkAllTaken, onBack }) {
  const allTaken = MEDICATIONS.every((m) => medsTaken[m.id]);
  return (
    <TaskScreenShell
      icon="pill"
      photo="meds"
      title="Take Medications"
      description="Mark them as you take it."
      onBack={onBack}
      footer={
        <>
          <Button variant="primary" size="lg" fullWidth onClick={onBack} iconLeft={<Icon name="check" size={20} />}>
            Done
          </Button>
          {!allTaken && (
            <Button variant="outline" size="lg" fullWidth onClick={onMarkAllTaken} iconLeft={<Icon name="check" size={18} />}>
              Mark all taken
            </Button>
          )}
        </>
      }
    >
      <div style={{ width: '100%', marginTop: 20, textAlign: 'left' }}>
        <MedicationList medsTaken={medsTaken} onToggleMed={onToggleMed} onMarkAllTaken={onMarkAllTaken} showMarkAll={false} />
      </div>
    </TaskScreenShell>
  );
}
