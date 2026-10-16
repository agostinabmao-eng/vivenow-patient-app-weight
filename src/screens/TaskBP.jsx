import TaskScreenShell from '../components/TaskScreenShell';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function TaskBP({ bpSys, setBpSys, bpDia, setBpDia, onSave, onBack }) {
  const saveDisabled = !(bpSys !== '' && bpDia !== '');
  return (
    <TaskScreenShell
      icon="activity"
      title="Measure Blood Pressure"
      description="Enter the reading from your home monitor."
      onBack={onBack}
      footer={
        <Button variant="primary" size="lg" fullWidth disabled={saveDisabled} onClick={onSave} iconLeft={<Icon name="check" size={20} />}>
          OK, save reading
        </Button>
      }
    >
      <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 24 }}>
        <Input
          label="Systolic"
          placeholder="120"
          type="number"
          inputMode="numeric"
          value={bpSys}
          onChange={(e) => setBpSys(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}
          containerStyle={{ flex: 1, minWidth: 0 }}
        />
        <Input
          label="Diastolic"
          placeholder="80"
          type="number"
          inputMode="numeric"
          value={bpDia}
          onChange={(e) => setBpDia(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}
          containerStyle={{ flex: 1, minWidth: 0 }}
        />
      </div>
    </TaskScreenShell>
  );
}
