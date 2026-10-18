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
  Footprints,
  Gauge,
  MapPin,
  Navigation,
  Mountain,
  Compass,
  Wind,
  Flag,
  MoreVertical,
  Edit3,
  ChevronDown,
  Dumbbell,
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
import { ExerciseSelectorModal } from './ExerciseSelectorModal';

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
  const [showZeroSetsWarning, setShowZeroSetsWarning] = useState<boolean>(false);
  const [showSkipWarningModal, setShowSkipWarningModal] = useState<number | null>(null);
  const [activeWarningToast, setActiveWarningToast] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>(() => initialState?.notes || '');
  const [unlockedPrs, setUnlockedPrs] = useState<string[]>([]);
  const [showPrNotification, setShowPrNotification] = useState<string | null>(null);

  // Active biometrics
  const [liveCalories, setLiveCalories] = useState<number>(() => initialState?.activeCalories || 0);
  const [cardioSubMode, setCardioSubMode] = useState<'treadmill' | 'outdoor'>('treadmill');

  // GPS Outdoor Running Live Tracking
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [gpsDistanceKm, setGpsDistanceKm] = useState<number>(0);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const isFinishedRef = React.useRef(false);

  // 1RM Strength Calculator Modal
  const [show1rmModal, setShow1rmModal] = useState<boolean>(false);
  const [calcWeight, setCalcWeight] = useState<number>(80);
  const [calcReps, setCalcReps] = useState<number>(8);
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState<boolean>(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState<boolean>(false);
  const [showExerciseNotes, setShowExerciseNotes] = useState<boolean>(false);
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({});

  const handleAddLiveExercises = (newExercises: Exercise[]) => {
    sound.playLevelUp();
    const updated = [...exercises, ...newExercises];
    setExercises(updated);
    setCurrentExerciseIndex(exercises.length);
    setAddExerciseModalOpen(false);
  };

  // Lock background body scrolling while active workout modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  // Sync state continuously to FitStorage for safe background persistence
  useEffect(() => {
    if (isFinishedRef.current) return;
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
      programId: routine.programId,
      programDayNumber: routine.programDayNumber,
    };
    FitStorage.saveActiveSession(currentState);
  }, [elapsedSeconds, currentExerciseIndex, exercises, isResting, restRemaining, totalRestTime, isPaused, liveCalories, notes, routine, smartwatch.liveHeartRate, initialState]);

  const handleMinimize = () => {
    if (isFinishedRef.current) return;
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
      programId: routine.programId,
      programDayNumber: routine.programDayNumber,
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

  // Timestamp-based anchors so timers stay 100% accurate even when phone screen is locked
  const workoutAnchorRef = useRef<number>(Date.now() - (initialState?.elapsedSeconds || 0) * 1000);
  const restEndTimestampRef = useRef<number | null>(
    initialState?.isResting && initialState?.restTimeRemaining
      ? Date.now() + initialState.restTimeRemaining * 1000
      : null
  );

  // Active workout timer loop (timestamp-based, immune to background tab throttling)
  useEffect(() => {
    if (isPaused || showSummaryModal) return;

    // Resync anchor with current elapsedSeconds when unpausing
    workoutAnchorRef.current = Date.now() - elapsedSeconds * 1000;

    const syncElapsed = () => {
      const next = Math.max(0, Math.floor((Date.now() - workoutAnchorRef.current) / 1000));
      setElapsedSeconds(next);
      const hrFactor = (smartwatch.liveHeartRate || 135) / 130;
      const cal = Math.round((next / 60) * 8.5 * hrFactor);
      setLiveCalories(cal);
    };

    const timer = setInterval(syncElapsed, 1000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncElapsed();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isPaused, showSummaryModal, smartwatch.liveHeartRate]);

  // Rest countdown timer loop (timestamp-based, immune to mobile screen lock)
  useEffect(() => {
    if (!isResting || isPaused) return;

    if (!restEndTimestampRef.current) {
      restEndTimestampRef.current = Date.now() + restRemaining * 1000;
    }

    const syncRest = () => {
      if (!restEndTimestampRef.current) return;
      const rem = Math.max(0, Math.ceil((restEndTimestampRef.current - Date.now()) / 1000));
      if (rem <= 0) {
        restEndTimestampRef.current = null;
        setRestRemaining(0);
        setIsResting(false);
        sound.playRestFinished();
      } else {
        if (rem <= 3 && rem !== restRemaining) {
          sound.playBeep(600, 70);
        }
        setRestRemaining(rem);
      }
    };

    const restTimer = setInterval(syncRest, 500);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncRest();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(restTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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

        // If resting, block completion until rest finishes or is skipped
        if (isResting) {
          sound.playBeep(400, 100);
          setActiveWarningToast(`⏳ Descanso en curso (${restRemaining}s). Pulsa 'Saltar Descanso' para registrar la serie ya.`);
          setTimeout(() => setActiveWarningToast(null), 3000);
          return prevExercises;
        }
      } else {
        // If unchecking a set, stop any active rest timer
        restEndTimestampRef.current = null;
        setIsResting(false);
        setRestRemaining(0);
      }

      const updatedAll = prevExercises.map((exercise, exIdx) => {
        if (exIdx !== currentExerciseIndex) return exercise;

        const updatedSets = exercise.sets.map((set, sIdx) => {
          if (sIdx === targetIndex) {
            if (willBeCompleted) {
              sound.playSetComplete();

              const isCardioExercise =
                exercise.muscleGroup === 'Cardio' ||
                exercise.type === 'cardio' ||
                exercise.name.toLowerCase().includes('carrera') ||
                exercise.name.toLowerCase().includes('cinta') ||
                exercise.name.toLowerCase().includes('running') ||
                exercise.name.toLowerCase().includes('elíptica') ||
                exercise.name.toLowerCase().includes('sprint');

              if (isCardioExercise) {
                const runKm = set.actualWeightKg || set.actualDistanceKm || 0;
                if (runKm > 0 && (!exercise.prDistanceKm || runKm > exercise.prDistanceKm)) {
                  const prMsg = `${exercise.name}: ${runKm} km (Récord de distancia)`;
                  setUnlockedPrs((prs) => (prs.includes(prMsg) ? prs : [...prs, prMsg]));
                  setShowPrNotification(prMsg);
                  sound.playPrFanfare();
                  try {
                    confetti({
                      particleCount: 70,
                      spread: 60,
                      origin: { y: 0.6 },
                      colors: ['#F59E0B', '#FBBF24', '#10B981', '#06B6D4', '#FFFFFF'],
                    });
                  } catch {}
                  setTimeout(() => setShowPrNotification(null), 5000);
                }
              } else {
                // Check if 1RM is a new strength PR
                const estimated1RM = Math.round(
                  set.actualWeightKg / (1.0278 - 0.0278 * Math.min(10, set.actualReps || 1))
                );
                if (set.actualWeightKg > 0 && (!exercise.prKg || set.actualWeightKg > exercise.prKg)) {
                  const prMsg = `${exercise.name}: ${set.actualWeightKg} kg (${estimated1RM} kg 1RM)`;
                  setUnlockedPrs((prs) => (prs.includes(prMsg) ? prs : [...prs, prMsg]));
                  setShowPrNotification(prMsg);
                  sound.playPrFanfare();
                  try {
                    confetti({
                      particleCount: 100,
                      spread: 75,
                      origin: { y: 0.6 },
                      colors: ['#F59E0B', '#FBBF24', '#10B981', '#06B6D4', '#FFFFFF'],
                    });
                  } catch {}
                  setTimeout(() => setShowPrNotification(null), 5000);
                }
              }

              // Start auto rest timer with exact end timestamp
              if (exercise.restSeconds > 0) {
                restEndTimestampRef.current = Date.now() + exercise.restSeconds * 1000;
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

      // If the user just completed the very last set of the entire workout, auto-open summary modal directly
      if (willBeCompleted) {
        const isEntireWorkoutFinished = updatedAll.every((ex) => ex.sets.every((s) => s.completed));
        if (isEntireWorkoutFinished) {
          setTimeout(() => {
            setIsPaused(true);
            setShowSummaryModal(true);
            sound.playLevelUp();
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {}
          }, 500);
        }
      }

      return updatedAll;
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

  // GPS Haversine distance calculator
  const calculateHaversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleToggleGps = () => {
    if (gpsActive) {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setGpsActive(false);
    } else {
      if ('geolocation' in navigator) {
        sound.playBeep(880, 120);
        setGpsActive(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            if (accuracy && accuracy > 40) return;
            setLastCoords((prev) => {
              if (prev) {
                const distDelta = calculateHaversineKm(prev.lat, prev.lng, latitude, longitude);
                if (distDelta > 0.002 && distDelta < 0.3) {
                  setGpsDistanceKm((d) => {
                    const newTotal = Math.round((d + distDelta) * 1000) / 1000;
                    // Auto-sync into the active cardio set
                    setExercises((prevExs) => {
                      return prevExs.map((ex, exIdx) => {
                        if (exIdx !== currentExerciseIndex) return ex;
                        const activeSet = ex.sets.find((s) => !s.completed) || ex.sets[0];
                        if (!activeSet) return ex;
                        const updatedSets = ex.sets.map((s) =>
                          s.id === activeSet.id ? { ...s, actualWeightKg: newTotal } : s
                        );
                        return { ...ex, sets: updatedSets };
                      });
                    });
                    return newTotal;
                  });
                }
              }
              return { lat: latitude, lng: longitude };
            });
          },
          (err) => {
            console.warn('GPS watch error:', err);
            setGpsActive(false);
          },
          { enableHighAccuracy: true, maximumAge: 1500, timeout: 10000 }
        );
      } else {
        alert('Geolocalización GPS no disponible en este dispositivo');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Helper to update weight, reps, or treadmill incline
  const handleUpdateSetVal = (
    setId: string,
    field: 'actualReps' | 'actualWeightKg' | 'rpe' | 'inclinePercent' | 'speedKmh',
    delta: number
  ) => {
    setExercises((prevExercises) => {
      return prevExercises.map((ex, exIdx) => {
        if (exIdx !== currentExerciseIndex) return ex;
        const updatedSets = ex.sets.map((set) => {
          if (set.id !== setId) return set;
          const currentVal = (set[field] as number) || 0;
          const newVal = Math.max(0, Math.round((currentVal + delta) * 100) / 100);
          return { ...set, [field]: newVal };
        });
        return { ...ex, sets: updatedSets };
      });
    });
  };

  // Toggle set type: 'normal' (WRK) -> 'warmup' (WU) -> 'dropset' (DS) -> 'normal'
  const handleCycleSetType = (setId: string) => {
    sound.playClick();
    setExercises((prev) => {
      return prev.map((ex, exIdx) => {
        if (exIdx !== currentExerciseIndex) return ex;
        const updatedSets = ex.sets.map((set) => {
          if (set.id !== setId) return set;
          const currentType = set.setType || (set.isWarmup ? 'warmup' : 'normal');
          let nextType: 'normal' | 'warmup' | 'dropset' = 'normal';
          if (currentType === 'normal') nextType = 'warmup';
          else if (currentType === 'warmup') nextType = 'dropset';
          else nextType = 'normal';

          return {
            ...set,
            setType: nextType,
            isWarmup: nextType === 'warmup',
          };
        });
        return { ...ex, sets: updatedSets };
      });
    });
  };

  // Add extra set
  const handleAddSet = () => {
    sound.playBeep(600, 80);
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

    setTimeout(() => {
      const addBtn = document.getElementById('btn-add-set');
      if (addBtn) {
        addBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // Format stopwatch seconds
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  // Differentiate cardio vs strength exercises
  const isPureCardio = exercises.every(
    (ex) =>
      ex.muscleGroup === 'Cardio' ||
      ex.type === 'cardio' ||
      ex.name.toLowerCase().includes('carrera') ||
      ex.name.toLowerCase().includes('cinta') ||
      ex.name.toLowerCase().includes('running') ||
      ex.name.toLowerCase().includes('elíptica') ||
      ex.name.toLowerCase().includes('cuerda')
  );

  // Calculate workout summary totals
  const totalVolume = exercises.reduce((acc, ex) => {
    const isCardioEx =
      ex.muscleGroup === 'Cardio' ||
      ex.type === 'cardio' ||
      ex.name.toLowerCase().includes('carrera') ||
      ex.name.toLowerCase().includes('cinta') ||
      ex.name.toLowerCase().includes('running') ||
      ex.name.toLowerCase().includes('elíptica') ||
      ex.name.toLowerCase().includes('cuerda');
    if (isCardioEx) return acc; // Cardio has 0 kg volume!

    return (
      acc +
      ex.sets.reduce((sAcc, set) => {
        return set.completed ? sAcc + set.actualWeightKg * set.actualReps : sAcc;
      }, 0)
    );
  }, 0);

  const totalDistanceKm = Math.round(
    exercises.reduce((acc, ex) => {
      const isCardio =
        ex.muscleGroup === 'Cardio' ||
        ex.type === 'cardio' ||
        ex.name.toLowerCase().includes('carrera') ||
        ex.name.toLowerCase().includes('cinta') ||
        ex.name.toLowerCase().includes('running') ||
        ex.name.toLowerCase().includes('caminata') ||
        ex.name.toLowerCase().includes('andar') ||
        ex.name.toLowerCase().includes('walk') ||
        ex.name.toLowerCase().includes('paseo') ||
        ex.name.toLowerCase().includes('ciclismo') ||
        ex.name.toLowerCase().includes('bicicleta') ||
        ex.name.toLowerCase().includes('elíptica') ||
        ex.name.toLowerCase().includes('sprint');
      
      const isStrengthRow =
        ex.name.toLowerCase().includes('remo con') ||
        ex.name.toLowerCase().includes('remo pendlay') ||
        ex.name.toLowerCase().includes('remo en polea') ||
        ex.name.toLowerCase().includes('remo con mancuerna') ||
        ex.name.toLowerCase().includes('remo t');

      if (!isCardio || isStrengthRow) return acc;

      return (
        acc +
        ex.sets
          .filter((s) => s.completed)
          .reduce((sAcc, s) => {
            const km = (s.actualDistanceKm && s.actualDistanceKm > 0) ? s.actualDistanceKm : (s.actualWeightKg || 0);
            return sAcc + km;
          }, 0)
      );
    }, 0) * 10
  ) / 10;

  const totalCardioMinutesRecorded = exercises.reduce((acc, ex) => {
    const isCardio =
      ex.muscleGroup === 'Cardio' ||
      ex.type === 'cardio' ||
      ex.name.toLowerCase().includes('carrera') ||
      ex.name.toLowerCase().includes('cinta') ||
      ex.name.toLowerCase().includes('running') ||
      ex.name.toLowerCase().includes('caminata') ||
      ex.name.toLowerCase().includes('andar') ||
      ex.name.toLowerCase().includes('walk') ||
      ex.name.toLowerCase().includes('paseo') ||
      ex.name.toLowerCase().includes('ciclismo') ||
      ex.name.toLowerCase().includes('bicicleta') ||
      ex.name.toLowerCase().includes('elíptica') ||
      ex.name.toLowerCase().includes('sprint');
    if (!isCardio) return acc;

    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + (s.actualReps || 0), 0)
    );
  }, 0);

  const calculatedMinutes = Math.max(
    1,
    Math.round(elapsedSeconds / 60),
    totalCardioMinutesRecorded
  );

  const completedSetsCount = exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.completed).length;
  }, 0);

  const totalSetsCount = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const completionPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  // Strict anti-cheat XP calculation: 0 sets = 0 XP, otherwise strictly proportional to completed sets
  const xpGained = completedSetsCount === 0
    ? 0
    : Math.max(10, Math.round(routine.xpReward * (completionPercent / 100)));

  // Accurate biomechanical calorie expenditure: active duration + volume lifted + real cardio distance
  const baseCal = Math.round(calculatedMinutes * 7.5);
  const volumeCal = Math.round((totalVolume / 1000) * 8);
  const distanceCal = Math.round(totalDistanceKm * 65);
  const rawEstimated = completedSetsCount === 0 && calculatedMinutes < 1
    ? 0
    : Math.max(liveCalories, baseCal + volumeCal + distanceCal, 35);
  const estimatedBurn = Math.min(1500, rawEstimated);

  const averagePace = totalDistanceKm > 0
    ? `${Math.floor(calculatedMinutes / totalDistanceKm)}'${Math.round(((calculatedMinutes / totalDistanceKm) % 1) * 60).toString().padStart(2, '0')}" /km`
    : undefined;

  // Complete workout trigger with validation check
  const handleOpenFinish = () => {
    const currentlyCompleted = exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0);

    // If no sets marked completed, check if the athlete entered numbers without clicking the checkmark
    if (currentlyCompleted === 0) {
      const hasEnteredData = exercises.some((ex) =>
        ex.sets.some((s) => (s.actualWeightKg && s.actualWeightKg > 0) || (s.actualReps && s.actualReps > 0))
      );

      if (hasEnteredData) {
        // Auto-complete the filled sets
        setExercises((prev) =>
          prev.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) => {
              if ((s.actualWeightKg && s.actualWeightKg > 0) || (s.actualReps && s.actualReps > 0)) {
                return { ...s, completed: true };
              }
              return s;
            }),
          }))
        );
      } else {
        sound.playBeep(440, 150);
        setShowZeroSetsWarning(true);
        return;
      }
    }

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
    // Ensure all sets with recorded data are preserved in final history entry
    const finalExercises = exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => {
        if (!s.completed && ((s.actualWeightKg && s.actualWeightKg > 0) || (s.actualReps && s.actualReps > 0))) {
          return { ...s, completed: true };
        }
        return s;
      }),
    }));

    const finalDistance = Math.round(
      finalExercises.reduce((acc, ex) => {
        const isCardio =
          ex.muscleGroup === 'Cardio' ||
          ex.type === 'cardio' ||
          ex.name.toLowerCase().includes('carrera') ||
          ex.name.toLowerCase().includes('cinta') ||
          ex.name.toLowerCase().includes('running') ||
          ex.name.toLowerCase().includes('caminata') ||
          ex.name.toLowerCase().includes('andar') ||
          ex.name.toLowerCase().includes('walk') ||
          ex.name.toLowerCase().includes('paseo') ||
          ex.name.toLowerCase().includes('ciclismo') ||
          ex.name.toLowerCase().includes('bicicleta') ||
          ex.name.toLowerCase().includes('elíptica') ||
          ex.name.toLowerCase().includes('sprint');
        const isStrengthRow =
          ex.name.toLowerCase().includes('remo con') ||
          ex.name.toLowerCase().includes('remo pendlay') ||
          ex.name.toLowerCase().includes('remo en polea') ||
          ex.name.toLowerCase().includes('remo con mancuerna') ||
          ex.name.toLowerCase().includes('remo t');
        if (!isCardio || isStrengthRow) return acc;
        return (
          acc +
          ex.sets
            .filter((s) => s.completed)
            .reduce((sAcc, s) => {
              const km = (s.actualDistanceKm && s.actualDistanceKm > 0) ? s.actualDistanceKm : (s.actualWeightKg || 0);
              return sAcc + km;
            }, 0)
        );
      }, 0) * 10
    ) / 10;

    const resolvedDistance = finalDistance > 0 ? finalDistance : totalDistanceKm;
    const resolvedMinutes = calculatedMinutes;

    const historyEntry: WorkoutHistoryEntry = {
      id: `hist_${Date.now()}`,
      routineId: routine.id,
      routineTitle: routine.title,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: resolvedMinutes,
      totalVolumeKg: totalVolume,
      totalDistanceKm: resolvedDistance,
      averagePace: resolvedDistance > 0
        ? `${Math.floor(resolvedMinutes / resolvedDistance)}'${Math.round(((resolvedMinutes / resolvedDistance) % 1) * 60).toString().padStart(2, '0')}" /km`
        : averagePace,
      cardioMode: cardioSubMode,
      cardioMinutes: resolvedDistance > 0 ? resolvedMinutes : 0,
      calories: estimatedBurn,
      avgHeartRate: smartwatch.liveHeartRate || 140,
      maxHeartRate: (smartwatch.liveHeartRate || 140) + 18,
      xpEarned: xpGained > 0 ? xpGained : Math.max(10, Math.round(routine.xpReward || 50)),
      completedExercises: finalExercises.length,
      rating,
      notes,
      exercises: finalExercises,
    };

    isFinishedRef.current = true;
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
    onClose();
  };

  // Heart rate zone color helper
  const getHrZoneColor = (hr: number) => {
    if (hr >= 170) return 'text-red-400 bg-red-950/60 border-red-500/40';
    if (hr >= 150) return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    if (hr >= 130) return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
    return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#09090b] flex flex-col h-screen h-[100dvh] w-full max-w-full overflow-hidden"
    >
      {/* Top Session HUD Bar with iOS Safe Area */}
      <header 
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)' }}
        className="shrink-0 z-20 bg-[#121214] border-b border-white/5 px-3 sm:px-6 pb-3 w-full max-w-full shadow-2xl relative"
      >
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Top Row: Back/More + Title + Finish Flag */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Minimize button & Menu trigger */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="btn-workout-minimize"
                onClick={handleMinimize}
                className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title="Minimizar y volver"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              {/* 3-dots actions menu trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                  className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-all"
                  title="Opciones de entrenamiento"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showHeaderMenu && (
                  <div className="absolute left-0 top-11 z-50 bg-[#18181b] border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[200px] animate-in fade-in zoom-in-95 space-y-1">
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setShow1rmModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-cyan-400 hover:bg-cyan-500/10 text-left transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Calculadora 1RM</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setIsPaused(!isPaused);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-neutral-300 hover:bg-white/10 text-left transition-colors"
                    >
                      {isPaused ? <Play className="w-4 h-4 text-cyan-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                      <span>{isPaused ? 'Reanudar tiempo' : 'Pausar tiempo'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setAddExerciseModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-neutral-300 hover:bg-white/10 text-left transition-colors"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Añadir ejercicio</span>
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setShowDiscardConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-red-400 hover:bg-red-500/10 text-left transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Descartar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Center: Clean Session Title & Stopwatch */}
            <div className="text-center min-w-0 flex-1 px-1">
              <h2 className="font-display font-black text-sm sm:text-lg text-white leading-tight truncate">
                {routine.title}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-neutral-400 mt-0.5">
                <span className={`font-bold ${isPaused ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`}>
                  {formatTime(elapsedSeconds)}
                </span>
                <span>•</span>
                <span className="font-bold text-white">{completionPercent}%</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-neutral-400">{totalVolume.toLocaleString()} kg</span>
              </div>
            </div>

            {/* Right: Flag Finish Button (PUMPD Style) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-workout-finish"
                onClick={handleOpenFinish}
                className="h-9 px-3.5 sm:px-4 rounded-2xl bg-white text-neutral-950 font-mono font-black text-xs flex items-center gap-1.5 shadow-lg shadow-white/10 hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Finalizar entrenamiento"
              >
                <Flag className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Finalizar</span>
              </button>
            </div>
          </div>

          {/* Segmented Progress Bar (PUMPD Style - one tick per exercise) */}
          <div className="flex items-center gap-1.5 w-full pt-1">
            {exercises.map((ex, idx) => {
              const isDone = ex.sets.every((s) => s.completed);
              const isCurrent = idx === currentExerciseIndex;
              const hasSomeDone = ex.sets.some((s) => s.completed);

              return (
                <button
                  key={ex.id}
                  onClick={() => handleTryChangeExercise(idx)}
                  className="h-1.5 flex-1 rounded-full overflow-hidden transition-all duration-300 relative group cursor-pointer"
                  title={`${idx + 1}. ${ex.name} (${isDone ? 'Completado' : hasSomeDone ? 'En progreso' : 'Pendiente'})`}
                >
                  <div
                    className={`w-full h-full transition-all duration-500 ${
                      isDone
                        ? 'bg-white'
                        : isCurrent
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                        : hasSomeDone
                        ? 'bg-cyan-500/50'
                        : 'bg-white/15 group-hover:bg-white/25'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* PR Celebration Floating Toast Notification */}
      {showPrNotification && (
        <div className="fixed top-14 sm:top-16 left-3 right-3 sm:left-auto sm:right-6 z-50 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-neutral-950 px-4 py-2.5 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.85)] flex items-center justify-between gap-3 animate-bounce font-mono border-2 border-white ring-4 ring-amber-400/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-neutral-950 text-amber-400 flex items-center justify-center shrink-0 shadow">
              <Trophy className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-neutral-900 font-black flex items-center gap-1.5">
                💥 ¡NUEVO RÉCORD PERSONAL!
                <span className="bg-neutral-950 text-amber-300 px-1.5 py-0.5 rounded text-[9px] font-black">+50 XP</span>
              </span>
              <span className="text-xs sm:text-sm text-neutral-950 font-black truncate">{showPrNotification}</span>
            </div>
          </div>
          <button
            onClick={() => setShowPrNotification(null)}
            className="p-1 rounded-lg text-neutral-950/70 hover:text-neutral-950 hover:bg-black/10 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sequential Set Warning Toast */}
      {activeWarningToast && (
        <div className="fixed top-14 sm:top-16 right-3 sm:right-6 z-50 bg-[#18181b] border border-amber-500/60 text-amber-300 px-4 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center gap-2 animate-in slide-in-from-top-3 font-mono font-bold text-xs">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>{activeWarningToast}</span>
        </div>
      )}

      {/* Scrollable Workout Content Container */}
      <div 
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8rem)',
        }}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 w-full px-3 sm:px-6 pt-3 sm:pt-5"
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6">
        
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

          {/* Add Exercise on the Fly Button */}
          <button
            id="btn-workout-add-exercise"
            onClick={() => setAddExerciseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 transition-all shrink-0 shadow-sm"
            title="Añadir o crear un nuevo ejercicio en caliente"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Ejercicio</span>
          </button>
        </div>

        {/* Current Exercise Detail Card - PUMPD Widget Style */}
        {currentExercise && (
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden w-full max-w-full space-y-4">
            <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
            
            {/* Exercise Header: Visual Icon + Title + Muscle targets + Prev/Next buttons */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                {/* Exercise Muscle Visual Badge */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
                  <span className="text-xl sm:text-2xl relative z-10">
                    {currentExercise.muscleGroup === 'Chest' ? '🏋️' :
                     currentExercise.muscleGroup === 'Back' ? '💪' :
                     currentExercise.muscleGroup === 'Legs' ? '🦵' :
                     currentExercise.muscleGroup === 'Shoulders' ? '🦾' :
                     currentExercise.muscleGroup === 'Arms' ? '🥊' :
                     currentExercise.muscleGroup === 'Core' ? '⚡' :
                     currentExercise.muscleGroup === 'Cardio' ? '🏃' : '🎯'}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
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
                  <h3 className="font-display font-black text-lg sm:text-2xl text-white tracking-tight mt-1 truncate">
                    {currentExercise.name}
                  </h3>
                </div>
              </div>

              {/* Prev / Next Exercise quick buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="btn-prev-exercise"
                  disabled={currentExerciseIndex === 0}
                  onClick={() => handleTryChangeExercise(currentExerciseIndex - 1)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-colors border border-white/5 cursor-pointer"
                  title="Ejercicio anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="btn-next-exercise"
                  disabled={currentExerciseIndex === exercises.length - 1}
                  onClick={() => handleTryChangeExercise(currentExerciseIndex + 1)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                    currentExercise.sets.every((s) => s.completed)
                      ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-25 border-white/5'
                  }`}
                  title="Siguiente ejercicio"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Session Notes Box (PUMPD Style) */}
            <div className="relative z-10">
              {showExerciseNotes ? (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-3 animate-in fade-in space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="flex items-center gap-1.5 text-neutral-300 font-bold">
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      Sensaciones y notas del ejercicio:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowExerciseNotes(false)}
                      className="text-neutral-500 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>
                  <input
                    type="text"
                    value={exerciseNotes[currentExercise.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExerciseNotes((prev) => ({ ...prev, [currentExercise.id]: val }));
                    }}
                    placeholder="Ej. 'Fácil en la 3ª serie, subir peso la próxima semana...'"
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowExerciseNotes(true)}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/10 text-neutral-400 hover:text-neutral-200 transition-all text-xs font-mono group cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {exerciseNotes[currentExercise.id] || 'Añadir nota de sensaciones en este ejercicio...'}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              )}
            </div>

            {/* Progressive Overload Assistant Banner */}
            {(() => {
              const pastPerf = FitStorage.getExercisePastPerformance(currentExercise.name);
              if (!pastPerf) return null;
              return (
                <div className="p-3 bg-gradient-to-r from-amber-500/10 via-neutral-900 to-cyan-500/10 border border-amber-500/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded-xl bg-amber-500/20 text-amber-400 font-black text-xs">📈</span>
                    <div>
                      <p className="font-bold text-white flex items-center gap-2 text-[11px] sm:text-xs">
                        <span>Marca anterior:</span>
                        <span className="font-mono text-amber-300 font-extrabold">
                          {pastPerf.lastWeightKg > 0 ? `${pastPerf.lastWeightKg} kg × ${pastPerf.lastReps} reps` : `${pastPerf.lastReps} reps`}
                        </span>
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-300 mt-0.5 font-mono">
                        🎯 Meta hoy:{' '}
                        <span className="text-cyan-300 font-black">
                          {pastPerf.suggestedWeightKg > pastPerf.lastWeightKg ? `+2.5 kg (${pastPerf.suggestedWeightKg} kg)` : `+1 rep (${pastPerf.suggestedReps} reps)`}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-black shrink-0">
                    Sobrecarga Asistida
                  </span>
                </div>
              );
            })()}

            {/* Instruction Tip */}
            {currentExercise.instructions && (
              <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-start gap-2.5 text-xs text-neutral-400 leading-relaxed relative z-10">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p>{currentExercise.instructions}</p>
                  {currentExercise.tip && (
                    <p className="text-cyan-400 font-medium mt-0.5">💡 {currentExercise.tip}</p>
                  )}
                </div>
              </div>
            )}

            {/* Sets Logging Table */}
            <div className="relative z-10 w-full max-w-full pt-1">
              {(() => {
                const isCardio =
                  currentExercise.muscleGroup === 'Cardio' ||
                  currentExercise.type === 'cardio' ||
                  currentExercise.name.toLowerCase().includes('carrera') ||
                  currentExercise.name.toLowerCase().includes('cinta') ||
                  currentExercise.name.toLowerCase().includes('caminata') ||
                  currentExercise.name.toLowerCase().includes('andar') ||
                  currentExercise.name.toLowerCase().includes('walk') ||
                  currentExercise.name.toLowerCase().includes('paseo') ||
                  currentExercise.name.toLowerCase().includes('running') ||
                  currentExercise.name.toLowerCase().includes('remo') ||
                  currentExercise.name.toLowerCase().includes('sprint') ||
                  currentExercise.name.toLowerCase().includes('elíptica') ||
                  currentExercise.name.toLowerCase().includes('cuerda');

                const activeSetIdx = currentExercise.sets.findIndex((s) => !s.completed);
                const currentHr = smartwatch.liveHeartRate || 135;

                // Runner Heart Rate Zone definition
                let hrZone = 'Z1';
                let hrZoneLabel = 'Recuperación';
                let hrZoneColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                if (currentHr >= 175) {
                  hrZone = 'Z5';
                  hrZoneLabel = 'VO2 Max';
                  hrZoneColor = 'text-red-400 bg-red-500/10 border-red-500/30 animate-pulse';
                } else if (currentHr >= 160) {
                  hrZone = 'Z4';
                  hrZoneLabel = 'Umbral';
                  hrZoneColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
                } else if (currentHr >= 140) {
                  hrZone = 'Z3';
                  hrZoneLabel = 'Tempo';
                  hrZoneColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                } else if (currentHr >= 120) {
                  hrZone = 'Z2';
                  hrZoneLabel = 'Quema Grasa';
                  hrZoneColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
                }

                return (
                  <>
                    {/* Runner & Cardio Control Panel */}
                    {isCardio && (
                      <div className="mb-3 p-3 bg-[#18181b] border border-cyan-500/20 rounded-2xl space-y-2.5 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                            <button
                              type="button"
                              onClick={() => setCardioSubMode('treadmill')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                                cardioSubMode === 'treadmill'
                                  ? 'bg-cyan-500 text-neutral-950 shadow-md font-black'
                                  : 'text-neutral-400 hover:text-white'
                              }`}
                            >
                              <Footprints className="w-3.5 h-3.5" />
                              <span>Cinta</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardioSubMode('outdoor')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                                cardioSubMode === 'outdoor'
                                  ? 'bg-purple-500 text-white shadow-md font-black'
                                  : 'text-neutral-400 hover:text-white'
                              }`}
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>GPS Exterior</span>
                            </button>
                          </div>

                          <div className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-mono ${hrZoneColor}`}>
                            <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
                            <span className="font-bold">{hrZone}: {currentHr} bpm</span>
                            <span className="hidden sm:inline text-[11px] opacity-80">({hrZoneLabel})</span>
                          </div>
                        </div>

                        {cardioSubMode === 'outdoor' && (
                          <div className="p-2.5 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${gpsActive ? 'bg-purple-500 text-white animate-pulse' : 'bg-white/5 text-purple-400'}`}>
                                <MapPin className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-mono text-neutral-300">
                                {gpsActive ? `📍 GPS Activo • ${gpsDistanceKm.toFixed(2)} km` : 'Seguimiento por GPS'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleToggleGps}
                              className={`px-3 py-1 rounded-xl font-mono text-xs font-bold transition-transform active:scale-95 ${
                                gpsActive
                                  ? 'bg-red-500 text-white shadow-md'
                                  : 'bg-purple-600 text-white shadow-md'
                              }`}
                            >
                              {gpsActive ? 'Detener' : 'Iniciar'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Columns Label Header (PUMPD Style) */}
                    <div className="grid grid-cols-[56px_1fr_1fr_42px] sm:grid-cols-[68px_1fr_1fr_48px] gap-2 text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider px-2 pb-2 text-center items-center">
                      <div className="text-left pl-1">SET</div>
                      <div>{isCardio ? 'KM' : 'KG'}</div>
                      <div>{isCardio ? 'MIN' : 'REPS'}</div>
                      <div className="text-center">✓</div>
                    </div>

                    <div className="space-y-2">
                      {currentExercise.sets.map((set, setIdx) => {
                        const estimated1rm = Math.round(
                          set.actualWeightKg / (1.0278 - 0.0278 * Math.min(10, set.actualReps || 1))
                        );
                        const isCurrentActive = setIdx === activeSetIdx;
                        const isLocked = !set.completed && activeSetIdx !== -1 && setIdx > activeSetIdx;
                        const isWaitingRest = !set.completed && isCurrentActive && isResting;
                        const stepVal = isCardio ? 0.5 : 2.5;

                        // Set type label: WRK (work), WU (warmup), DS (dropset)
                        const setType = set.setType || (set.isWarmup ? 'warmup' : 'normal');
                        const setTypeLabel = setType === 'warmup' ? 'WU' : setType === 'dropset' ? 'DS' : 'WRK';
                        const setTypeBadgeColor = setType === 'warmup'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : setType === 'dropset'
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          : 'bg-white/10 text-neutral-300 border-white/10';

                        // Calculate Runner Pace & Speed
                        const distanceKm = set.actualWeightKg || 0;
                        const timeMin = set.actualReps || 0;
                        const paceDec = distanceKm > 0 ? timeMin / distanceKm : 0;
                        const paceMin = Math.floor(paceDec);
                        const paceSec = Math.round((paceDec - paceMin) * 60);
                        const speedKmh = timeMin > 0 ? ((distanceKm / (timeMin / 60)).toFixed(1)) : '0';

                        return (
                          <div
                            key={set.id}
                            className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
                              set.completed
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-100 shadow-sm'
                                : isWaitingRest
                                ? 'bg-cyan-500/[0.03] border-cyan-500/30 text-cyan-300'
                                : isCurrentActive
                                ? 'bg-neutral-900 border-cyan-500/60 ring-1 ring-cyan-500/40 text-white shadow-lg shadow-cyan-500/10'
                                : isLocked
                                ? 'bg-black/40 border-white/5 text-neutral-500 opacity-60'
                                : 'bg-black/40 border-white/5 text-white'
                            }`}
                          >
                            <div className="grid grid-cols-[56px_1fr_1fr_42px] sm:grid-cols-[68px_1fr_1fr_48px] gap-2 items-center">
                              {/* Set Tag & Cycle Button (WU / WRK / DS) */}
                              <button
                                type="button"
                                onClick={() => handleCycleSetType(set.id)}
                                title="Pulsa para cambiar: Trabajo (WRK) / Calentamiento (WU) / Dropset (DS)"
                                className={`flex items-center gap-1 px-1.5 py-1 rounded-xl border text-[10px] font-mono font-black transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${setTypeBadgeColor}`}
                              >
                                <span>{setIdx + 1}</span>
                                <span>{setTypeLabel}</span>
                              </button>

                              {/* Weight or Distance Adjuster (PUMPD compact pill style) */}
                              <div className="flex items-center justify-center gap-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetVal(set.id, 'actualWeightKg', -stepVal)}
                                  className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center font-black border border-white/5 shrink-0 active:scale-95 cursor-pointer"
                                  title={isCardio ? "-0.5 km" : "-2.5 kg"}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <div className="flex-1 max-w-[68px] sm:max-w-[76px] text-center min-w-0">
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step={isCardio ? "0.1" : "0.5"}
                                    value={set.actualWeightKg}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      const nextVal = isNaN(val) ? 0 : Math.max(0, val);
                                      handleUpdateSetVal(set.id, 'actualWeightKg', nextVal - set.actualWeightKg);
                                    }}
                                    className="w-full bg-[#18181b] text-center font-mono font-black text-xs sm:text-sm rounded-xl py-1 sm:py-1.5 border border-white/10 focus:border-cyan-500 focus:outline-none text-white px-1"
                                    title="Toca para escribir con el teclado"
                                  />
                                  {!isCardio && set.actualWeightKg > 0 && (
                                    <span className="text-[8px] text-neutral-400 block font-mono mt-0.5 truncate">1RM:{estimated1rm}k</span>
                                  )}
                                  {isCardio && (
                                    <span className="text-[8px] text-purple-400 block font-mono mt-0.5">km</span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetVal(set.id, 'actualWeightKg', stepVal)}
                                  className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center font-black border border-white/5 shrink-0 active:scale-95 cursor-pointer"
                                  title={isCardio ? "+0.5 km" : "+2.5 kg"}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Reps or Minutes Adjuster */}
                              <div className="flex items-center justify-center gap-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetVal(set.id, 'actualReps', -1)}
                                  className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center font-black border border-white/5 shrink-0 active:scale-95 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <div className="flex-1 max-w-[56px] sm:max-w-[64px] text-center min-w-0">
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    value={set.actualReps}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      const nextVal = isNaN(val) ? 0 : Math.max(0, val);
                                      handleUpdateSetVal(set.id, 'actualReps', nextVal - set.actualReps);
                                    }}
                                    className="w-full bg-[#18181b] text-center font-mono font-black text-xs sm:text-sm rounded-xl py-1 sm:py-1.5 border border-white/10 focus:border-cyan-500 focus:outline-none text-white px-1"
                                    title="Toca para escribir repeticiones"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetVal(set.id, 'actualReps', 1)}
                                  className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center font-black border border-white/5 shrink-0 active:scale-95 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Complete Checkbox (PUMPD circular button) */}
                              <div className="flex justify-center shrink-0">
                                <button
                                  id={`btn-complete-set-${setIdx}`}
                                  disabled={!set.completed && (isLocked || isWaitingRest)}
                                  onClick={() => handleToggleSet(set.id)}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                    set.completed
                                      ? 'bg-white text-neutral-950 shadow-md shadow-white/20 scale-105 hover:bg-neutral-200'
                                      : isWaitingRest
                                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 cursor-not-allowed opacity-75'
                                      : isCurrentActive
                                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 hover:bg-cyan-500/30'
                                      : isLocked
                                      ? 'bg-white/[0.02] text-neutral-700 border border-white/5 cursor-not-allowed opacity-30'
                                      : 'bg-white/5 hover:bg-white/10 text-neutral-400 border border-white/10'
                                  }`}
                                  title={
                                    set.completed
                                      ? "Desmarcar serie"
                                      : isWaitingRest
                                      ? `Descanso en curso (${restRemaining}s).`
                                      : isLocked
                                      ? "Completa la serie anterior primero"
                                      : "Completar serie"
                                  }
                                >
                                  {set.completed ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : isWaitingRest ? (
                                    <span className="text-[10px] font-mono font-bold text-cyan-400">⏳</span>
                                  ) : (
                                    <Check className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Runner & Treadmill Telemetry Sub-Row */}
                            {isCardio && (
                              <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                                  <Mountain className="w-3 h-3 text-amber-400" />
                                  <span className="text-neutral-400 text-[10px]">Inclinación:</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSetVal(set.id, 'inclinePercent', -0.5)}
                                    className="w-5 h-5 rounded bg-white/10 text-white flex items-center justify-center font-bold text-xs"
                                  >
                                    -
                                  </button>
                                  <span className="font-bold text-amber-400 min-w-[28px] text-center">
                                    {(set.inclinePercent || 0).toFixed(1)}%
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSetVal(set.id, 'inclinePercent', 0.5)}
                                    className="w-5 h-5 rounded bg-white/10 text-white flex items-center justify-center font-bold text-xs"
                                  >
                                    +
                                  </button>
                                </div>

                                {distanceKm > 0 && timeMin > 0 && (
                                  <div className="flex items-center gap-2 text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
                                    <span className="flex items-center gap-1">
                                      <Gauge className="w-3 h-3 text-cyan-400" />
                                      <strong>{speedKmh} km/h</strong>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Wind className="w-3 h-3 text-cyan-400" />
                                      <strong>{paceMin}'{paceSec.toString().padStart(2, '0')}" /km</strong>
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* Add Set Button */}
              <button
                id="btn-add-set"
                onClick={handleAddSet}
                className="mt-3.5 w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Agregar Serie Adicional</span>
              </button>
            </div>
          </div>
        )}

        {/* Next Exercises Preview Accordion (PUMPD Style) */}
        {exercises.length > currentExerciseIndex + 1 && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 px-1">
              Siguientes Ejercicios ({exercises.length - (currentExerciseIndex + 1)})
            </span>
            {exercises.slice(currentExerciseIndex + 1).map((ex, nextRelIdx) => {
              const actualIdx = currentExerciseIndex + 1 + nextRelIdx;
              const isDone = ex.sets.every((s) => s.completed);

              return (
                <div
                  key={ex.id}
                  onClick={() => handleTryChangeExercise(actualIdx)}
                  className="bg-[#121214]/70 hover:bg-[#121214] border border-white/5 hover:border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-mono font-bold text-xs text-neutral-400 shrink-0">
                      {actualIdx + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{ex.name}</h4>
                      <p className="text-[10px] font-mono text-neutral-400">
                        {ex.sets.length} series • {ex.muscleGroup}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isDone ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hecho
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-neutral-500 flex items-center gap-1">
                        Comenzar <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Floating Bottom Rest Dock (PUMPD Capsule Style) */}
      {isResting && (
        <div 
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          className="fixed left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          <div className="bg-[#18181b]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-3 sm:p-3.5 shadow-2xl shadow-black/80 flex items-center justify-between gap-2.5">
            {/* Left: Skip Rest Button */}
            <button
              type="button"
              onClick={() => {
                restEndTimestampRef.current = null;
                setIsResting(false);
                setRestRemaining(0);
              }}
              className="text-xs font-mono font-bold text-neutral-300 hover:text-white px-3 py-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            >
              Skip Rest
            </button>

            {/* Center: Big Clear Countdown */}
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight drop-shadow">
                {Math.floor(restRemaining / 60)}:{(restRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Right: +15s quick add + Play/Pause */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const next = restRemaining + 15;
                  restEndTimestampRef.current = Date.now() + next * 1000;
                  setTotalRestTime((t) => Math.max(t, next));
                  setRestRemaining(next);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 font-mono font-bold text-xs transition-colors cursor-pointer active:scale-95"
              >
                +15 sec
              </button>

              <button
                type="button"
                onClick={() => {
                  // Toggle timer pause
                  if (restEndTimestampRef.current) {
                    restEndTimestampRef.current = null;
                  } else {
                    restEndTimestampRef.current = Date.now() + restRemaining * 1000;
                  }
                }}
                className="w-9 h-9 rounded-2xl bg-white text-neutral-950 flex items-center justify-center font-black transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                title="Pausar / Reanudar descanso"
              >
                <Pause className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Workout Summary Modal - PUMPD Style */}
      {showSummaryModal && (
        <div 
          style={{ 
            paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
          }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden flex flex-col max-h-[92vh]">
            <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
            
            {/* Scrollable Summary Body */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              {/* Header Hero Area */}
              <div className="text-center relative z-10 pt-1">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center text-neutral-950 shadow-2xl shadow-cyan-500/40 mb-3">
                  <Trophy className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                  {routine.programDayNumber
                    ? `¡Día ${routine.programDayNumber} Completado!`
                    : routine.title}
                </h3>
                <p className="text-xs font-mono font-bold text-neutral-400 mt-1">
                  Completado • {new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}
                </p>
              </div>

              {/* Floating Highlight Chips (PUMPD Style) */}
              <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200 font-mono font-bold text-xs flex items-center gap-1.5">
                  ⚡ {exercises.length} ejercicios
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200 font-mono font-bold text-xs flex items-center gap-1.5">
                  ⏱ {elapsedSeconds >= 60 ? formatTime(elapsedSeconds) : `${calculatedMinutes} min`}
                </span>
                {unlockedPrs.length > 0 && (
                  <span className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs flex items-center gap-1.5">
                    🏆 {unlockedPrs.length} nuevo{unlockedPrs.length > 1 ? 's' : ''} PR
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center gap-1.5">
                  +{xpGained} XP
                </span>
              </div>

              {/* Quick Stats Widgets (PUMPD 2x2 Grid) */}
              <div className="grid grid-cols-2 gap-3 relative z-10 pt-2">
                <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold tracking-wider">
                    Tiempo Total
                  </span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-white mt-1">
                    {Math.max(1, Math.round(elapsedSeconds / 60))} <span className="text-xs text-neutral-400 font-normal">min</span>
                  </p>
                </div>

                <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold tracking-wider">
                    {isPureCardio || totalDistanceKm > 0 ? 'Distancia Total' : 'Volumen Total'}
                  </span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-cyan-400 mt-1">
                    {isPureCardio || totalDistanceKm > 0 
                      ? `${totalDistanceKm.toFixed(1)} km` 
                      : `${totalVolume.toLocaleString()} kg`}
                  </p>
                </div>

                <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold tracking-wider">
                    Calorías Quemadas
                  </span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-orange-400 mt-1">
                    {estimatedBurn} <span className="text-xs text-neutral-400 font-normal">kcal</span>
                  </p>
                </div>

                <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold tracking-wider">
                    Intensidad
                  </span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-emerald-400 mt-1">
                    100% <span className="text-xs text-neutral-400 font-normal">completado</span>
                  </p>
                </div>
              </div>

              {/* PRs achieved breakdown */}
              {unlockedPrs.length > 0 && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl relative z-10">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Récords Personales Desbloqueados ({unlockedPrs.length})</span>
                  </div>
                  <ul className="text-xs text-neutral-300 space-y-1.5 font-mono max-h-36 overflow-y-auto pr-1">
                    {unlockedPrs.map((pr, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">⚡</span>
                        <span>{pr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Session Rating */}
              <div className="relative z-10 pt-1">
                <label className="text-[11px] font-mono font-bold text-neutral-300 block mb-2 text-center uppercase tracking-wider">
                  ¿Cómo te has sentido en este entreno?
                </label>
                <div className="flex justify-center gap-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-10 h-10 rounded-2xl text-base font-black transition-all cursor-pointer ${
                        rating >= star
                          ? 'bg-amber-400 text-neutral-950 scale-110 shadow-lg shadow-amber-400/20'
                          : 'bg-white/5 text-neutral-600 border border-white/5 hover:border-white/20'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes input */}
              <div className="relative z-10">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade sensaciones finales (ej. 'Gran congestión y buen ritmo')..."
                  className="w-full px-4 py-3 bg-[#18181b] border border-white/10 rounded-2xl text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="flex gap-2.5 pt-3 mt-2 border-t border-white/10 shrink-0 relative z-10">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono font-bold text-xs transition-colors border border-white/5 cursor-pointer"
              >
                Volver
              </button>
              <button
                id="btn-confirm-save-workout"
                onClick={handleConfirmFinish}
                className="flex-1 py-3 rounded-2xl bg-white text-neutral-950 hover:bg-neutral-200 font-mono font-black text-xs shadow-xl shadow-white/10 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                {routine.programDayNumber ? `Desbloquear Día ${routine.programDayNumber + 1}` : 'Guardar y Reclamar XP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1RM Strength & Load Calculator Modal */}
      {show1rmModal && (
        <div 
          style={{ 
            paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-[#121214] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 shrink-0">
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
            <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
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
                <div className="space-y-3 flex-1 overflow-y-auto">
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
              className="w-full mt-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-bold text-xs shadow-md transition-all shrink-0"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Skip Exercise Warning Modal */}
      {showSkipWarningModal !== null && currentExercise && (
        <div 
          style={{ 
            paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-[#121214] border border-amber-500/30 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
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

      {/* Zero Sets Completed Warning Modal (Anti-Cheat / Empty Workout) */}
      {showZeroSetsWarning && (
        <div 
          style={{ 
            paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-[#121214] border border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-display font-black text-white text-lg tracking-tight">Sin series completadas</h3>
            <p className="text-xs text-neutral-300 mt-2 mb-5 leading-relaxed">
              No has marcado ninguna serie completada en este entreno. Debes completar al menos una serie para poder finalizar y registrar progreso.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowZeroSetsWarning(false)}
                className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Continuar y Entrenar
              </button>
              <button
                onClick={() => {
                  setShowZeroSetsWarning(false);
                  setShowDiscardConfirm(true);
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-red-500/15 text-neutral-400 hover:text-red-400 font-mono text-xs border border-white/10 transition-colors cursor-pointer"
              >
                Descartar Sesión (Sin XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Workout Confirmation Modal */}
      {showDiscardConfirm && (
        <div 
          style={{ 
            paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-[#121214] border border-red-500/30 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
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

      {/* Add / Create Exercise Modal while Workout is Active */}
      <ExerciseSelectorModal
        isOpen={addExerciseModalOpen}
        onClose={() => setAddExerciseModalOpen(false)}
        onSelectExercises={handleAddLiveExercises}
        title="Añadir Ejercicios al Entrenamiento"
        buttonLabel="Añadir a la Sesión"
        allowMultiSelect={true}
      />
    </div>
  );
};
