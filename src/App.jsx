import NavBar from './components/NavBar';
import SosFab from './components/SosFab';
import ElevatedAlertModal from './components/ElevatedAlertModal';
import ExerciseSafetyModal from './components/ExerciseSafetyModal';
import ReminderModal from './components/ReminderModal';
import NurseWillDiscussNotice from './screens/NurseWillDiscussNotice';
import { TASK_LABELS, patientPlan } from './data/sampleData';
import HomeScreen from './screens/HomeScreen';
import ProgressScreen from './screens/ProgressScreen';
import NutritionScreen from './screens/NutritionScreen';
import MealComposerScreen from './screens/MealComposerScreen';
import ExerciseScreen from './screens/ExerciseScreen';
import LogCustomExerciseScreen from './screens/LogCustomExerciseScreen';
import ExerciseSafetyIntroScreen from './screens/ExerciseSafetyIntroScreen';
import LearnScreen from './screens/LearnScreen';
import LearnVideoScreen from './screens/LearnVideoScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import SosScreen from './screens/SosScreen';
import TaskBP from './screens/TaskBP';
import TaskMeds from './screens/TaskMeds';
import TaskWater from './screens/TaskWater';
import TaskWeight from './screens/TaskWeight';
import TaskSteps from './screens/TaskSteps';
import TaskGlucose from './screens/TaskGlucose';
import ProfileScreen from './screens/ProfileScreen';
import SurveyScreen from './screens/SurveyScreen';
import OnboardingSurveyScreen from './screens/OnboardingSurveyScreen';
import useAppState from './hooks/useAppState';
import useOnlineStatus from './hooks/useOnlineStatus';

const TAB_SCREENS = new Set(['home', 'progress', 'nutrition', 'exercise', 'learn']);
// Screens with no screen-owned footer of their own — safe for the SOS
// button to float as a bare circle instead of reserving a dedicated strip.
// Profile is the one non-tab screen that qualifies (its own footer button
// was replaced by a header back-icon), so it floats too, just without the
// NavBar-height offset the tab screens get (see SosFab's hasNavBar prop).
const FLOATING_SOS_SCREENS = new Set(['home', 'progress', 'nutrition', 'exercise', 'learn', 'profile', 'nurse-notice']);

export default function App() {
  const online = useOnlineStatus();
  const {
    screen,
    open,
    goHome,
    closeSos,
    day,
    streak,
    onboarding,
    submitOnboarding,
    pauseOnboarding,
    confirmPersonalReason,
    reasonToastDue,
    dismissReasonToast,
    nurseUpdateBanner,
    simulateNurseUpdate,
    dismissNurseUpdateBanner,
    waterUnit,
    setWaterUnit,
    weightUnit,
    setWeightUnit,
    doneCount,
    totalCount,
    uncompleteTask,
    bpSys,
    setBpSys,
    bpDia,
    setBpDia,
    saveBp,
    weightInput,
    setWeightInput,
    saveWeight,
    stepsInput,
    setStepsInput,
    saveSteps,
    glucoseInput,
    setGlucoseInput,
    saveGlucose,
    showAlert,
    alertReading,
    dismissAlert,
    callCaregiver,
    toggleMed,
    markAllMedsTaken,
    openVideoId,
    openVideoPlayer,
    goToAdjacentVideo,
    closeVideoPlayer,
    markVideoWatched,
    openCustomExerciseForm,
    closeCustomExerciseForm,
    saveCustomExercise,
    removeCustomExercise,
    submitExerciseFeedback,
    exerciseGate,
    submitSymptomCheck,
    proceedFromCaution,
    exerciseGateContactCareTeam,
    exerciseGateGentleMobility,
    exerciseGateMeasureNow,
    closeExerciseGate,
    exerciseVideoFilter,
    showExerciseSafetyIntro,
    dismissExerciseSafetyIntro,
    openExerciseSafetyIntro,
    setWaterGlasses,
    saveWater,
    learnWatched,
    markLearnWatched,
    learnVideo,
    openLearnVideo,
    closeLearnVideo,
    composeMealType,
    composeEntryId,
    openMealComposer,
    closeMealComposer,
    quickLogMeal,
    removeMealEntry,
    saveMeal,
    submitSurvey,
    reminders,
    reminderTarget,
    openReminderModal,
    closeReminderModal,
    saveReminder,
  } = useAppState();

  let body = null;
  switch (screen) {
    case 'onboarding':
      body = (
        <OnboardingSurveyScreen
          initialResponses={onboarding.responses}
          initialStepIndex={onboarding.stepIndex}
          initialWelcomeSeen={onboarding.welcomeSeen}
          onSubmit={submitOnboarding}
          onPause={pauseOnboarding}
          onGoHome={goHome}
        />
      );
      break;
    case 'progress':
      body = <ProgressScreen day={day} streak={streak} doneCount={doneCount} weightUnit={weightUnit} waterUnit={waterUnit} />;
      break;
    case 'nutrition':
      body = (
        <NutritionScreen
          meals={day.meals}
          waterGlasses={day.waterGlasses}
          waterUnit={waterUnit}
          onQuickLog={quickLogMeal}
          onRemoveEntry={removeMealEntry}
          onOpenMeal={openMealComposer}
          onSetWaterGlasses={setWaterGlasses}
          onBack={goHome}
        />
      );
      break;
    case 'nutrition-compose': {
      const editingEntry = composeEntryId ? day.meals[composeMealType]?.find((e) => e.id === composeEntryId) : null;
      body = (
        <MealComposerScreen
          mealType={composeMealType}
          existingText={editingEntry?.text || ''}
          isEditing={!!composeEntryId}
          onSave={saveMeal}
          onBack={closeMealComposer}
        />
      );
      break;
    }
    case 'exercise':
      body = (
        <ExerciseScreen
          videos={day.videos}
          videoFilter={exerciseVideoFilter}
          customExercises={day.customExercises}
          onOpenVideo={openVideoPlayer}
          onOpenSafetyInfo={openExerciseSafetyIntro}
          onLogCustom={openCustomExerciseForm}
          onRemoveCustom={removeCustomExercise}
          onBack={goHome}
        />
      );
      break;
    case 'exercise-log-custom':
      body = <LogCustomExerciseScreen onSave={saveCustomExercise} onBack={closeCustomExerciseForm} />;
      break;
    case 'exercise-video':
      body = (
        <VideoPlayerScreen
          videos={day.videos}
          currentId={openVideoId}
          onOpenVideo={goToAdjacentVideo}
          onMarkWatched={markVideoWatched}
          onSubmitFeedback={submitExerciseFeedback}
          onContactCareTeam={() => open('sos')}
          onBack={closeVideoPlayer}
        />
      );
      break;
    case 'learn':
      body = <LearnScreen watched={learnWatched} learnHints={onboarding.learnHints} onOpenVideo={openLearnVideo} onBack={goHome} />;
      break;
    case 'learn-video':
      body = (
        <LearnVideoScreen
          videoId={learnVideo?.id}
          title={learnVideo?.title}
          onMarkWatched={markLearnWatched}
          onBack={closeLearnVideo}
        />
      );
      break;
    case 'sos':
      body = <SosScreen onCancel={closeSos} />;
      break;
    case 'nurse-notice':
      body = <NurseWillDiscussNotice onBack={closeSos} />;
      break;
    case 'bp':
      body = (
        <TaskBP bpSys={bpSys} setBpSys={setBpSys} bpDia={bpDia} setBpDia={setBpDia} onSave={saveBp} onBack={goHome} />
      );
      break;
    case 'meds':
      body = <TaskMeds medsTaken={day.medsTaken} onToggleMed={toggleMed} onMarkAllTaken={markAllMedsTaken} onBack={goHome} />;
      break;
    case 'water':
      body = <TaskWater waterGlasses={day.waterGlasses} waterUnit={waterUnit} onSetGlasses={setWaterGlasses} onSave={saveWater} onBack={goHome} />;
      break;
    case 'weight':
      body = (
        <TaskWeight weightInput={weightInput} setWeightInput={setWeightInput} weightUnit={weightUnit} onSave={saveWeight} onBack={goHome} />
      );
      break;
    case 'steps':
      body = <TaskSteps stepsInput={stepsInput} setStepsInput={setStepsInput} onSave={saveSteps} onBack={goHome} />;
      break;
    case 'glucose':
      body = <TaskGlucose glucoseInput={glucoseInput} setGlucoseInput={setGlucoseInput} onSave={saveGlucose} onBack={goHome} />;
      break;
    case 'profile':
      body = (
        <ProfileScreen
          onBack={goHome}
          waterUnit={waterUnit}
          onSetWaterUnit={setWaterUnit}
          weightUnit={weightUnit}
          onSetWeightUnit={setWeightUnit}
          onReportRisk={() => open('nurse-notice')}
          onSimulateNurseUpdate={simulateNurseUpdate}
        />
      );
      break;
    case 'survey':
      body = <SurveyScreen initialResponses={day.surveyResponses} onSubmit={submitSurvey} onBack={goHome} />;
      break;
    case 'home':
    default:
      body = (
        <HomeScreen
          day={day}
          streak={streak}
          doneCount={doneCount}
          totalCount={totalCount}
          online={online}
          onOpenTask={open}
          onOpenProfile={() => open('profile')}
          onOpenSurvey={() => open('survey')}
          reminders={reminders}
          onSetReminder={openReminderModal}
          onboardingComplete={onboarding.completed}
          onResumeOnboarding={() => open('onboarding')}
          onUncompleteTask={uncompleteTask}
          onboarding={onboarding}
          onConfirmReason={confirmPersonalReason}
          reasonToastDue={reasonToastDue}
          onDismissReasonToast={dismissReasonToast}
          nurseUpdateBanner={nurseUpdateBanner}
          onDismissNurseUpdateBanner={dismissNurseUpdateBanner}
          waterUnit={waterUnit}
          weightUnit={weightUnit}
          weightInput={weightInput}
          setWeightInput={setWeightInput}
          saveWeight={saveWeight}
          bpSys={bpSys}
          setBpSys={setBpSys}
          bpDia={bpDia}
          setBpDia={setBpDia}
          saveBp={saveBp}
          medsTaken={day.medsTaken}
          onToggleMed={toggleMed}
          onMarkAllMedsTaken={markAllMedsTaken}
          setWaterGlasses={setWaterGlasses}
        />
      );
  }

  if (showExerciseSafetyIntro) {
    body = <ExerciseSafetyIntroScreen onDismiss={dismissExerciseSafetyIntro} />;
  }

  return (
    <div
      style={{
        height: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--gray-25)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, overflow: 'hidden' }}>{body}</div>
      {screen !== 'sos' && screen !== 'onboarding' && screen !== 'exercise-log-custom' && (
        <SosFab
          onClick={() => open('sos')}
          floating={FLOATING_SOS_SCREENS.has(screen)}
          withSafeBottom={!TAB_SCREENS.has(screen)}
          hasNavBar={TAB_SCREENS.has(screen)}
        />
      )}
      {TAB_SCREENS.has(screen) && <NavBar active={screen} onNavigate={open} />}
      {showAlert && <ElevatedAlertModal reading={alertReading} onCallCaregiver={callCaregiver} onContinue={dismissAlert} />}
      {exerciseGate && (
        <ExerciseSafetyModal
          stage={exerciseGate.stage}
          questions={patientPlan.preExerciseCheck}
          onSubmitSymptoms={submitSymptomCheck}
          onMeasureNow={exerciseGateMeasureNow}
          onContactCareTeam={exerciseGateContactCareTeam}
          onGentleMobility={exerciseGateGentleMobility}
          onContinueCaution={proceedFromCaution}
          onNotNow={closeExerciseGate}
          onClose={closeExerciseGate}
        />
      )}
      {reminderTarget && (
        <ReminderModal
          taskLabel={TASK_LABELS[reminderTarget]}
          initialTime={reminders[reminderTarget] || undefined}
          onSave={saveReminder}
          onClose={closeReminderModal}
        />
      )}
    </div>
  );
}
