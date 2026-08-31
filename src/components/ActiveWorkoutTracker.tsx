import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  X,
  Flame,
  Activity,
  Heart,
  Timer,
  Award,
  Sparkles,
  Volume2,
  Info,
  CheckCircle2,
  Trophy,
  Calculator,
  Minimize2,
  Trash2,
  AlertTriangle,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  WorkoutRoutine,
  Exercise,
  ExerciseSet,
  UserProfile,
  SmartwatchDevice,
  WorkoutHistoryEntry,
  ActiveWorkoutState,
  Language,
} from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';
import { FitStorage } from '../lib/storage';

interface ActiveWorkoutTrackerProps {
  routine: WorkoutRoutine;
  user?: UserProfile;
  smartwatch: SmartwatchDevice;
  lang: Language;
  initialState?: ActiveWorkoutState | null;
  onMinimize?: (state: ActiveWorkoutState) => void;
  onFinishWorkout?: (
    completedRoutine: WorkoutRoutine,
    historyEntry: WorkoutHistoryEntry,
    xpGained: number,
    newPrs: string[]
  ) => void;
  onComplete?: (historyEntry: WorkoutHistoryEntry, xpGained: number) => void;
  onClose: () => void;
  onDiscard?: () => void;
}

export const ActiveWorkoutTracker: React.FC<ActiveWorkoutTrackerProps> = ({
  routine,
  user,
  smartwatch,
  lang,
  initialState,
  onMinimize,
  onFinishWorkout,
  onComplete,
  onClose,
  onDiscard,
}) => {
  const t = translations[lang];

  // Clone routine or resume from initialState
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    if (initialState && initialState.exercises && initialState.exercises.length > 0) {
      return initialState.exercises;
    }
    return JSON.parse(JSON.stringify(routine.exercises));
  });

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(() => {
    return initialState ? initialState.currentExerciseIndex : 0;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    return initialState ? initialState.elapsedSeconds : 0;
  });
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    return initialState ? initialState.isPaused : false;
  });

  // Rest timer
  const [isResting, setIsResting] = useState<boolean>(() => {
    return initialState ? initialState.isResting : false;
  });
  const [restRemaining, setRestRemaining] = useState<number>(() => {
    return initialState ? initialState.restTimeRemaining : 0;
  });
  const [totalRestTime, setTotalRestTime] = useState<number>(() => {
    return initialState ? initialState.totalRestTime : 60;
  });

  // Summary and confirmation modals
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [showSkipWarningModal, setShowSkipWarningModal] = useState<number | null>(null);
  const [activeWarningToast, setActiveWarningToast] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>(() => initialState?.notes || '');
  const [unlockedPrs, setUnlockedPrs] = useState<string[]>([]);
  const [showPrNotification, setShowPrNotification] = useState<string | null>(null);

  // Active biometrics
  const [liveCalories, setLiveCalories] = useState<number>(() => initialState?.activeCalories || 0);

  // 1RM Strength Calculator Modal
  const [show1rmModal, setShow1rmModal] = useState<boolean>(false);
  const [calcWeight, setCalcWeight] = useState<number>(80);
  const [calcReps, setCalcReps] = useState<number>(8);

  // Sync state continuously to FitStorage for safe background persistence
  useEffect(() => {
    const currentState: ActiveWorkoutState = {
      routineId: routine.id,
      routineTitle: routine.title,
      routineCategory: routine.category,
      startTime: initialState?.startTime || (Date.now() - elapsedSeconds * 1000),
      elapsedSeconds,
      currentExerciseIndex,
      exercises,
      isResting,
      restTimeRemaining: restRemaining,
      totalRestTime,
      isPaused,
      liveHeartRate: smartwatch.liveHeartRate || 135,
      activeCalories: liveCalories,
      notes,
    };
    FitStorage.saveActiveSession(currentState);
  }, [elapsedSeconds, currentExerciseIndex, exercises, isResting, restRemaining, totalRestTime, isPaused, liveCalories, notes, routine, smartwatch.liveHeartRate, initialState]);

  const handleMinimize = () => {
    const currentState: ActiveWorkoutState = {
      routineId: routine.id,
      routineTitle: routine.title,
      routineCategory: routine.category,
      startTime: initialState?.startTime || (Date.now() - elapsedSeconds * 1000),
      elapsedSeconds,
      currentExerciseIndex,
      exercises,
      isResting,
      restTimeRemaining: restRemaining,
      totalRestTime,
      isPaused,
      liveHeartRate: smartwatch.liveHeartRate || 135,
      activeCalories: liveCalories,
      notes,
    };
    FitStorage.saveActiveSession(currentState);
    if (onMinimize) onMinimize(currentState);
    onClose();
  };

  const handleConfirmDiscard = () => {
    FitStorage.clearActiveSession();
    if (onDiscard) onDiscard();
    onClose();
  };

  // Active workout timer loop
  useEffect(() => {
    if (isPaused || showSummaryModal) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // Estimate calories based on elapsed seconds and heart rate
        const hrFactor = (smartwatch.liveHeartRate || 135) / 130;
        const cal = Math.round((next / 60) * 8.5 * hrFactor);
        setLiveCalories(cal);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, showSummaryModal, smartwatch.liveHeartRate]);

  // Rest countdown timer loop
  useEffect(() => {
    if (!isResting || isPaused) return;

    const restTimer = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(restTimer);
          setIsResting(false);
          sound.playRestFinished();
          return 0;
        }
        if (prev <= 4) {
          sound.playBeep(600, 70);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(restTimer);
  }, [isResting, isPaused]);

  const currentExercise = exercises[currentExerciseIndex];

  // Helper to toggle set completion with sequential validation
  const handleToggleSet = (setId: string) => {
    setExercises((prevExercises) => {
      const ex = prevExercises[currentExerciseIndex];
      if (!ex) return prevExercises;

      const targetIndex = ex.sets.findIndex((s) => s.id === setId);
      if (targetIndex === -1) return prevExercises;

      const targetSet = ex.sets[targetIndex];
      const willBeCompleted = !targetSet.completed;

      // If completing, check that all previous sets are already finished
      if (willBeCompleted) {
        const firstIncompleteIdx = ex.sets.findIndex((s, idx) => !s.completed && idx < targetIndex);
        if (firstIncompleteIdx !== -1) {
          sound.playBeep(400, 100);
          setActiveWarningToast(`Completa primero la Serie ${firstIncompleteIdx + 1}`);
          setTimeout(() => setActiveWarningToast(null), 3000);
          return prevExercises;
        }
      }

      return prevExercises.map((exercise, exIdx) => {
        if (exIdx !== currentExerciseIndex) return exercise;

        const updatedSets = exercise.sets.map((set, sIdx) => {
          if (sIdx === targetIndex) {
            if (willBeCompleted) {
              sound.playSetComplete();

              // Check if 1RM is a new PR
              const estimated1RM = Math.round(
                set.actualWeightKg / (1.0278 - 0.0278 * Math.min(10, set.actualReps || 1))
              );
              if (set.actualWeightKg > 0 && (!exercise.prKg || set.actualWeightKg > exercise.prKg)) {
                const prMsg = `${exercise.name}: ${set.actualWeightKg} kg (${estimated1RM} kg 1RM)`;
                setUnlockedPrs((prs) => (prs.includes(prMsg) ? prs : [...prs, prMsg]));
                setShowPrNotification(prMsg);
                sound.playAchievement();
                setTimeout(() => setShowPrNotification(null), 4000);
              }

              // Start auto rest timer
              if (exercise.restSeconds > 0) {
                setTotalRestTime(exercise.restSeconds);
                setRestRemaining(exercise.restSeconds);
                setIsResting(true);
              }
            }

            return { ...set, completed: willBeCompleted };
          }

          // If uncompleting an earlier set, also uncomplete all subsequent sets
          if (!willBeCompleted && sIdx > targetIndex) {
            return { ...set, completed: false };
          }

          return set;
        });

        // If all sets in this exercise are now completed
        const allCompletedNow = updatedSets.every((s) => s.completed);
        if (allCompletedNow && willBeCompleted) {
          sound.playLevelUp();
        }

        return { ...exercise, sets: updatedSets };
      });
    });
  };

  // Helper to validate exercise transition
  const handleTryChangeExercise = (targetIndex: number) => {
    if (targetIndex === currentExerciseIndex) return;

    // Going backwards is always permitted
    if (targetIndex < currentExerciseIndex) {
      setCurrentExerciseIndex(targetIndex);
      return;
    }

    // Advancing forward: check if current exercise is completed
    const allSetsDone = currentExercise ? currentExercise.sets.every((s) => s.completed) : true;
    if (allSetsDone) {
      setCurrentExerciseIndex(targetIndex);
    } else {
      setShowSkipWarningModal(targetIndex);
    }
  };

  // Helper to update weight or reps
  const handleUpdateSetVal = (
    setId: string,
    field: 'actualReps' | 'actualWeightKg' | 'rpe',
    delta: number
  ) => {
    setExercises((prevExercises) => {
      return prevExercises.map((ex, exIdx) => {
        if (exIdx !== currentExerciseIndex) return ex;
        const updatedSets = ex.sets.map((set) => {
          if (set.id !== setId) return set;
          const currentVal = (set[field] as number) || 0;
          const newVal = Math.max(0, currentVal + delta);
          return { ...set, [field]: newVal };
        });
        return { ...ex, sets: updatedSets };
      });
    });
  };

  // Add extra set
  const handleAddSet = () => {
    setExercises((prev) => {
      return prev.map((ex, idx) => {
        if (idx !== currentExerciseIndex) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: ExerciseSet = {
          id: `set_${Date.now()}_${Math.random()}`,
          setNumber: ex.sets.length + 1,
          targetReps: lastSet ? lastSet.targetReps : 10,
          actualReps: lastSet ? lastSet.actualReps : 10,
          targetWeightKg: lastSet ? lastSet.targetWeightKg : 50,
          actualWeightKg: lastSet ? lastSet.actualWeightKg : 50,
          completed: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      });
    });
  };

  // Format stopwatch seconds
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  // Calculate workout summary totals
  const totalVolume = exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((sAcc, set) => {
        return set.completed ? sAcc + set.actualWeightKg * set.actualReps : sAcc;
      }, 0)
    );
  }, 0);

  const completedSetsCount = exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.completed).length;
  }, 0);

  const totalSetsCount = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const completionPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  // Complete workout trigger
  const handleOpenFinish = () => {
    setIsPaused(true);
    setShowSummaryModal(true);
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback safe
    }
  };

  const handleConfirmFinish = () => {
    const xpGained = Math.round(routine.xpReward * Math.max(0.6, completionPercent / 100));

    const historyEntry: WorkoutHistoryEntry = {
      id: `hist_${Date.now()}`,
      routineId: routine.id,
      routineTitle: routine.title,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      totalVolumeKg: totalVolume,
      calories: liveCalories,
      avgHeartRate: smartwatch.liveHeartRate || 140,
      maxHeartRate: (smartwatch.liveHeartRate || 140) + 18,
      xpEarned: xpGained,
      completedExercises: exercises.length,
      rating,
      notes,
    };

    FitStorage.clearActiveSession();

    if (onComplete) {
      onComplete(historyEntry, xpGained);
    }
    if (onFinishWorkout) {
      onFinishWorkout(
        { ...routine, exercises },
        historyEntry,
        xpGained,
        unlockedPrs
      );
    }
  };

  // Heart rate zone color helper
  const getHrZoneColor = (hr: number) => {
    if (hr >= 170) return 'text-red-400 bg-red-950/60 border-red-500/40';
    if (hr >= 150) return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    if (hr >= 130) return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
    return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/95 backdrop-blur-2xl flex flex-col overflow-y-auto overflow-x-hidden w-full max-w-full">
      {/* Top Session HUD Bar */}
      <div className="sticky top-0 z-20 bg-[#121214]/95 backdrop-blur-xl border-b border-white/5 px-2.5 sm:px-6 py-2 sm:py-3 w-full max-w-full shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Left: Minimize / Back + Routine Info & Live Timer */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              id="btn-workout-minimize"
              onClick={handleMinimize}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl sm:rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs flex items-center gap-1 shrink-0 transition-all hover:scale-105"
              title="Minimizar y volver al menú principal"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Minimizar</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display font-bold text-white text-xs sm:text-base leading-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-xs">
                  {routine.title}
                </h2>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  {completionPercent}%
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-mono truncate">
                <span className="text-cyan-400 font-bold">{formatTime(elapsedSeconds)}</span>
                <span className="hidden sm:inline"> • {totalVolume.toLocaleString()} kg {t.volumeLifted.toLowerCase()}</span>
              </p>
            </div>
          </div>

          {/* Right Action Tools: BPM + 1RM + Pause + Finish + Discard */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Live Heart Rate */}
            <div
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-xl sm:rounded-2xl border text-[11px] font-mono font-bold ${getHrZoneColor(
                smartwatch.liveHeartRate
              )}`}
              title={`Zona: ${smartwatch.activeZone}`}
            >
              <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current animate-heart-beat" />
              <span>{smartwatch.liveHeartRate}</span>
              <span className="text-[8px] opacity-75 font-sans hidden sm:inline">BPM</span>
            </div>

            {/* 1RM Strength Calculator */}
            <button
              id="btn-workout-1rm-calc"
              onClick={() => setShow1rmModal(true)}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 transition-colors"
              title="Calculadora 1RM & Tabla de Fuerza"
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Pause / Play Toggle */}
            <button
              id="btn-workout-pause"
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title={isPaused ? t.resume : t.pause}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
            </button>

            {/* Finish & Save Workout Button */}
            <button
              id="btn-workout-finish"
              onClick={handleOpenFinish}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-bold text-[11px] sm:text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span className="sm:hidden">Fin</span>
              <span className="hidden sm:inline">{t.finishWorkout}</span>
            </button>

            {/* Discard session */}
            <button
              id="btn-workout-discard"
              onClick={() => setShowDiscardConfirm(true)}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/5 text-neutral-400 hover:text-red-400 transition-colors"
              title="Descartar entrenamiento"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PR Celebration Floating Toast Notification */}
      {showPrNotification && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 px-4 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center gap-2 animate-bounce font-mono font-bold text-xs border border-amber-300">
          <Award className="w-4 h-4 fill-current" />
          <span>{t.personalRecord}: {showPrNotification}</span>
        </div>
      )}

      {/* Sequential Set Warning Toast */}
      {activeWarningToast && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-[#18181b] border border-amber-500/60 text-amber-300 px-4 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center gap-2 animate-in slide-in-from-top-3 font-mono font-bold text-xs">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>{activeWarningToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col gap-4 sm:gap-6 overflow-x-hidden">
        
        {/* Exercise Switcher Tab Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar max-w-full">
          {exercises.map((ex, idx) => {
            const isDone = ex.sets.every((s) => s.completed);
            const isSelected = idx === currentExerciseIndex;
            return (
              <button
                key={ex.id}
                id={`btn-ex-tab-${idx}`}
                onClick={() => handleTryChangeExercise(idx)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#121214] text-neutral-400 border-white/5 hover:text-neutral-200 hover:border-white/10'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate max-w-[130px] sm:max-w-none">{ex.name}</span>
              </button>
            );
          })}
        </div>

        {/* Current Exercise Detail Card */}
        {currentExercise && (
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden w-full max-w-full">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-3xl pointer-events-none" />
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-white/5 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                    {currentExercise.muscleGroup}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {currentExercise.equipment}
                  </span>
                  {currentExercise.prKg ? (
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> PR: {currentExercise.prKg} kg
                    </span>
                  ) : null}
                </div>
                <h3 className="font-display font-extrabold text-lg sm:text-2xl text-white mt-1.5">
                  {currentExercise.name}
                </h3>
              </div>

              {/* Prev / Next Exercise quick buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-prev-exercise"
                  disabled={currentExerciseIndex === 0}
                  onClick={() => handleTryChangeExercise(currentExerciseIndex - 1)}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono font-semibold flex items-center gap-1 transition-colors border border-white/5"
                >
                  <ChevronLeft className="w-4 h-4" /> <span className="hidden xs:inline">{t.prevExercise}</span><span className="xs:hidden">Ant</span>
                </button>
                <button
                  id="btn-next-exercise"
                  disabled={currentExerciseIndex === exercises.length - 1}
                  onClick={() => handleTryChangeExercise(currentExerciseIndex + 1)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-mono font-semibold flex items-center gap-1 transition-all border ${
                    currentExercise.sets.every((s) => s.completed)
                      ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 border-white/5'
                  }`}
                >
                  <span className="hidden xs:inline">{t.nextExercise}</span><span className="xs:hidden">Sig</span> <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Instruction Tip */}
            {currentExercise.instructions && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed relative z-10">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p>{currentExercise.instructions}</p>
                  {currentExercise.tip && (
                    <p className="text-cyan-400 font-medium mt-1">💡 {currentExercise.tip}</p>
                  )}
                </div>
              </div>
            )}

            {/* Sets Logging Table */}
            <div className="mt-4 sm:mt-6 relative z-10 w-full max-w-full">
              <div className="grid grid-cols-12 gap-1 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider px-2 sm:px-3 pb-2 text-center">
                <div className="col-span-2 sm:col-span-2 text-left">{t.set}</div>
                <div className="col-span-4 sm:col-span-4">{t.weight}</div>
                <div className="col-span-3 sm:col-span-3">{t.reps}</div>
                <div className="col-span-3 sm:col-span-3">{t.completedSet}</div>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {(() => {
                  const activeSetIdx = currentExercise.sets.findIndex((s) => !s.completed);

                  return currentExercise.sets.map((set, setIdx) => {
                    const estimated1rm = Math.round(
                      set.actualWeightKg / (1.0278 - 0.0278 * Math.min(10, set.actualReps || 1))
                    );
                    const isCurrentActive = setIdx === activeSetIdx;
                    const isLocked = !set.completed && activeSetIdx !== -1 && setIdx > activeSetIdx;

                    return (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 gap-1 sm:gap-2 items-center p-2.5 sm:p-3.5 rounded-2xl border transition-all ${
                          set.completed
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                            : isCurrentActive
                            ? 'bg-cyan-500/[0.05] border-cyan-500/60 ring-2 ring-cyan-500/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                            : isLocked
                            ? 'bg-white/[0.02] border-white/5 text-neutral-400 opacity-70'
                            : 'bg-white/5 border-white/5 text-white'
                        }`}
                      >
                        {/* Set Number & Badge */}
                        <div className="col-span-2 sm:col-span-2 flex items-center gap-1 sm:gap-1.5">
                          <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg font-mono font-bold text-[11px] sm:text-xs flex items-center justify-center ${
                            isCurrentActive
                              ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/40'
                              : 'bg-white/10 text-neutral-200'
                          }`}>
                            {setIdx + 1}
                          </span>
                          {set.isWarmup && (
                            <span className="text-[8px] sm:text-[9px] font-mono font-extrabold px-1 sm:px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              W
                            </span>
                          )}
                        </div>

                        {/* Weight Adjuster (kg) */}
                        <div className="col-span-4 sm:col-span-4 flex items-center justify-center gap-1 sm:gap-1.5">
                          <button
                            onClick={() => handleUpdateSetVal(set.id, 'actualWeightKg', -2.5)}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold border border-white/5 shrink-0"
                            title="-2.5 kg"
                          >
                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                          <div className="w-12 sm:w-18 text-center min-w-0">
                            <input
                              type="number"
                              value={set.actualWeightKg}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                handleUpdateSetVal(set.id, 'actualWeightKg', val - set.actualWeightKg);
                              }}
                              className="w-full bg-[#09090b] text-center font-mono font-bold text-xs sm:text-sm rounded-lg sm:rounded-xl py-1 sm:py-1.5 border border-white/10 focus:border-cyan-500 focus:outline-none text-white px-0.5"
                            />
                            {set.actualWeightKg > 0 && (
                              <span className="text-[8px] sm:text-[9px] text-neutral-400 block font-mono mt-0.5 hidden xs:block">1RM:{estimated1rm}k</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleUpdateSetVal(set.id, 'actualWeightKg', 2.5)}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold border border-white/5 shrink-0"
                            title="+2.5 kg"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </div>

                        {/* Reps Adjuster */}
                        <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-1 sm:gap-1.5">
                          <button
                            onClick={() => handleUpdateSetVal(set.id, 'actualReps', -1)}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold border border-white/5 shrink-0"
                          >
                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                          <input
                            type="number"
                            value={set.actualReps}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              handleUpdateSetVal(set.id, 'actualReps', val - set.actualReps);
                            }}
                            className="w-9 sm:w-12 bg-[#09090b] text-center font-mono font-bold text-xs sm:text-sm rounded-lg sm:rounded-xl py-1 sm:py-1.5 border border-white/10 focus:border-cyan-500 focus:outline-none text-white px-0.5"
                          />
                          <button
                            onClick={() => handleUpdateSetVal(set.id, 'actualReps', 1)}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold border border-white/5 shrink-0"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </div>

                        {/* Complete Checkbox */}
                        <div className="col-span-3 sm:col-span-3 flex justify-center">
                          <button
                            id={`btn-complete-set-${setIdx}`}
                            onClick={() => handleToggleSet(set.id)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                              set.completed
                                ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                                : isCurrentActive
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 animate-pulse'
                                : 'bg-white/5 hover:bg-white/10 text-neutral-400 border border-white/10'
                            }`}
                          >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Add Set button */}
              <button
                id="btn-add-set"
                onClick={handleAddSet}
                className="mt-5 w-full py-3 rounded-2xl border border-dashed border-white/10 hover:border-cyan-500/50 hover:bg-white/5 text-xs font-mono font-bold text-neutral-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Agregar Serie Adicional</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Rest Timer Card (Shown when resting) */}
        {isResting && (
          <div className="bg-[#121214] border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 animate-in fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              {/* Circular Countdown Progress Ring */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-cyan-400 transition-all duration-1000"
                    strokeDasharray={`${(restRemaining / totalRestTime) * 100}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono font-extrabold text-base text-white">
                  {restRemaining}s
                </span>
              </div>

              <div>
                <h4 className="font-display font-bold text-white text-base">{t.restTimer}</h4>
                <p className="text-xs text-neutral-400">Recupera el aliento y prepárate para la siguiente serie.</p>
              </div>
            </div>

            {/* Rest control buttons */}
            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={() => setRestRemaining((prev) => prev + 30)}
                className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-cyan-400 border border-white/10"
              >
                {t.addRest30}
              </button>
              <button
                onClick={() => {
                  setIsResting(false);
                  setRestRemaining(0);
                }}
                className="px-5 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20"
              >
                {t.skipRest}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Finish Workout Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />
            
            <div className="text-center mb-6 relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center text-neutral-950 shadow-xl shadow-cyan-500/30 mb-3.5">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-white">
                {t.workoutCompleted}
              </h3>
              <p className="text-sm text-neutral-400 mt-1">{routine.title}</p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-neutral-400 font-mono uppercase">{t.estimatedTime}</span>
                <p className="text-base font-mono font-extrabold text-white mt-0.5">{formatTime(elapsedSeconds)}</p>
              </div>
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-neutral-400 font-mono uppercase">{t.volumeLifted}</span>
                <p className="text-base font-mono font-extrabold text-cyan-400 mt-0.5">{totalVolume} kg</p>
              </div>
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-neutral-400 font-mono uppercase">{t.caloriesBurned}</span>
                <p className="text-base font-mono font-extrabold text-orange-400 mt-0.5">{liveCalories} kcal</p>
              </div>
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-neutral-400 font-mono uppercase">{t.xpEarned}</span>
                <p className="text-base font-mono font-extrabold text-cyan-400 mt-0.5">
                  +{Math.round(routine.xpReward * Math.max(0.6, completionPercent / 100))} XP
                </p>
              </div>
            </div>

            {/* PRs achieved */}
            {unlockedPrs.length > 0 && (
              <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl relative z-10">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.personalRecord}</span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-1 font-mono">
                  {unlockedPrs.map((pr, i) => (
                    <li key={i}>• {pr}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Session Feeling Rating (1-5 stars) */}
            <div className="mb-4 relative z-10">
              <label className="text-xs font-mono font-bold text-neutral-300 block mb-2 text-center uppercase">
                ¿Cómo te has sentido en esta sesión?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-11 h-11 rounded-2xl text-lg font-bold transition-transform ${
                      rating >= star
                        ? 'bg-amber-400 text-neutral-950 scale-110 shadow-lg shadow-amber-400/20'
                        : 'bg-white/5 text-neutral-600 border border-white/5'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Notes textarea */}
            <div className="mb-6 relative z-10">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas de la sesión (ej. 'Excelente congestión en banca...')"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Confirm & Save Button */}
            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono font-bold text-xs transition-colors border border-white/5"
              >
                Volver a la Sesión
              </button>
              <button
                id="btn-confirm-save-workout"
                onClick={handleConfirmFinish}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-bold text-xs shadow-xl shadow-cyan-500/25 transition-transform hover:scale-105"
              >
                Guardar y Reclamar XP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1RM Strength & Load Calculator Modal */}
      {show1rmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-cyan-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">Calculadora 1RM & Cargas</h3>
                  <p className="text-[11px] text-neutral-400">Fórmula de Fuerza Máxima Estimada</p>
                </div>
              </div>
              <button
                onClick={() => setShow1rmModal(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs: Peso y Reps */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">
                  Peso Levantado (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">
                  Reps Completadas
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={calcReps}
                  onChange={(e) => setCalcReps(Math.max(1, Math.min(15, Number(e.target.value))))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 1RM Result Display */}
            {(() => {
              const estimated1rm = Math.round(calcWeight * (1 + calcReps / 30));
              return (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border border-cyan-500/30 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      1RM Estimado (Fuerza Máxima)
                    </span>
                    <p className="font-mono font-black text-3xl text-white mt-1">
                      {estimated1rm} <span className="text-sm font-sans font-normal text-cyan-400">kg</span>
                    </p>
                  </div>

                  {/* Percentage Intensity Table */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center text-neutral-400 pb-1 border-b border-white/5 text-[10px] uppercase font-bold">
                      <span>Intensidad</span>
                      <span>Objetivo</span>
                      <span>Carga Sugerida</span>
                    </div>
                    <div className="flex justify-between items-center text-red-300">
                      <span>90% 1RM</span>
                      <span className="text-[10px] text-neutral-400 font-sans">Fuerza Pura (3-4 r)</span>
                      <span className="font-bold text-white">{Math.round(estimated1rm * 0.9)} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-300">
                      <span>85% 1RM</span>
                      <span className="text-[10px] text-neutral-400 font-sans">Fuerza/Masa (5-6 r)</span>
                      <span className="font-bold text-white">{Math.round(estimated1rm * 0.85)} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-cyan-300">
                      <span>80% 1RM</span>
                      <span className="text-[10px] text-neutral-400 font-sans">Hipertrofia (7-8 r)</span>
                      <span className="font-bold text-white">{Math.round(estimated1rm * 0.8)} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-300">
                      <span>70% 1RM</span>
                      <span className="text-[10px] text-neutral-400 font-sans">Resistencia (10-12 r)</span>
                      <span className="font-bold text-white">{Math.round(estimated1rm * 0.7)} kg</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => setShow1rmModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-bold text-xs shadow-md transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Skip Exercise Warning Modal */}
      {showSkipWarningModal !== null && currentExercise && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-white text-lg">¿Avanzar de ejercicio?</h3>
            <p className="text-xs text-neutral-400 mt-1.5 mb-5 leading-relaxed">
              Aún tienes series sin completar en <span className="text-white font-bold">{currentExercise.name}</span>. ¿Deseas saltar al siguiente ejercicio de todos modos?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowSkipWarningModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-bold text-xs shadow-md transition-colors"
              >
                Completar Series
              </button>
              <button
                id="btn-confirm-skip-exercise"
                onClick={() => {
                  const target = showSkipWarningModal;
                  setShowSkipWarningModal(null);
                  setCurrentExerciseIndex(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono font-bold text-xs border border-white/10 transition-all"
              >
                Saltar Ejercicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Workout Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-red-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-white text-lg">¿Descartar entrenamiento?</h3>
            <p className="text-xs text-neutral-400 mt-1.5 mb-5 leading-relaxed">
              Se cancelará la sesión actual y no se guardarán las series ni la XP de hoy.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono font-bold text-xs border border-white/5 transition-colors"
              >
                Continuar Sesión
              </button>
              <button
                id="btn-confirm-discard-workout"
                onClick={handleConfirmDiscard}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono font-bold text-xs shadow-lg shadow-red-500/25 transition-all"
              >
                Sí, Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
