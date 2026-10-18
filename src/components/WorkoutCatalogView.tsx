import React, { useState } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Trash2,
  Check,
  X,
  Target,
  Calendar,
  Layers,
  Award,
  ArrowRight,
  Zap,
  Play,
  Lock,
  RotateCcw,
  CheckCircle2,
  Edit2,
} from 'lucide-react';
import { WorkoutRoutine, WorkoutProgram, ProgramDay, Exercise, ExerciseSet, Language, UserProfile } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';
import { FitStorage } from '../lib/storage';
import { ExerciseSelectorModal } from './ExerciseSelectorModal';
import { getRoutinePhoto } from '../lib/routineImages';

interface WorkoutCatalogViewProps {
  routines: WorkoutRoutine[];
  user: UserProfile;
  lang: Language;
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onCreateRoutine: (routine: WorkoutRoutine) => void;
  onDeleteRoutine?: (routineId: string) => void;
  onUpdateProgramProgress?: (progress: { [id: string]: number }) => void;
  onOpenSportModal?: () => void;
}

export const WorkoutCatalogView: React.FC<WorkoutCatalogViewProps> = ({
  routines,
  user,
  lang,
  onStartRoutine,
  onCreateRoutine,
  onDeleteRoutine,
  onUpdateProgramProgress,
  onOpenSportModal,
}) => {
  const t = translations[lang];

  // Active Catalog Tab: 'routines' or 'programs'
  const [catalogTab, setCatalogTab] = useState<'routines' | 'programs'>('routines');

  // Program tracking state reactive to user profile and storage
  const [programs, setPrograms] = useState<WorkoutProgram[]>(() => FitStorage.getPrograms());
  const [programProgress, setProgramProgress] = useState<{ [id: string]: number }>(() =>
    user?.programProgress || FitStorage.getProgramProgress() || {}
  );

  React.useEffect(() => {
    setProgramProgress(user?.programProgress || FitStorage.getProgramProgress() || {});
  }, [user?.programProgress]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creationMode, setCreationMode] = useState<'routine' | 'program'>('routine');
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [confirmDeleteRoutineId, setConfirmDeleteRoutineId] = useState<string | null>(null);
  const [confirmDeleteProgramId, setConfirmDeleteProgramId] = useState<string | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState<boolean>(false);
  const [activeExerciseSelectorTargetDay, setActiveExerciseSelectorTargetDay] = useState<number | null>(null);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>('prog_ppl_3day');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [saveToastMessage, setSaveToastMessage] = useState<string | null>(null);

  // New / Edit Custom Routine Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCategory, setNewCategory] = useState<WorkoutRoutine['category']>('Strength');
  const [newDifficulty, setNewDifficulty] = useState<WorkoutRoutine['difficulty']>('Intermediate');
  const [newDuration, setNewDuration] = useState<number>(45);
  const [newExercises, setNewExercises] = useState<Exercise[]>([
    {
      id: `ex_${Date.now()}_1`,
      name: 'Press Militar con Mancuernas',
      muscleGroup: 'Shoulders',
      equipment: 'Dumbbell',
      restSeconds: 60,
      sets: [
        { id: 'cs1', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 20, actualWeightKg: 20, completed: false },
        { id: 'cs2', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 20, actualWeightKg: 20, completed: false },
        { id: 'cs3', setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 22.5, actualWeightKg: 22.5, completed: false },
      ],
    },
  ]);

  // Multi-Day Program Builder State
  const [programDaysPerWeek, setProgramDaysPerWeek] = useState<number>(3);
  const [programDaysData, setProgramDaysData] = useState<ProgramDay[]>([
    {
      dayNumber: 1,
      title: 'Día 1: Empuje (Pecho & Hombros)',
      focus: 'Fuerza e hipertrofia del tren superior anterior',
      routine: {
        id: `rt_prog_day1_${Date.now()}`,
        title: 'Día 1: Empuje',
        description: 'Sesión de empuje',
        category: 'Strength',
        difficulty: 'Intermediate',
        durationMinutes: 45,
        estimatedCalories: 380,
        xpReward: 300,
        exercises: [
          {
            id: `ex_p1_1`,
            name: 'Press de Banca Plano',
            muscleGroup: 'Chest',
            equipment: 'Barbell',
            restSeconds: 90,
            sets: [
              { id: 's1', setNumber: 1, targetReps: 8, actualReps: 8, targetWeightKg: 60, actualWeightKg: 60, completed: false },
              { id: 's2', setNumber: 2, targetReps: 8, actualReps: 8, targetWeightKg: 60, actualWeightKg: 60, completed: false },
              { id: 's3', setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 60, actualWeightKg: 60, completed: false },
            ],
          },
        ],
        targetMuscles: ['Chest', 'Shoulders'],
        tags: ['Custom', 'Strength'],
      },
    },
    {
      dayNumber: 2,
      title: 'Día 2: Tirón (Espalda & Bíceps)',
      focus: 'Amplitud dorsal y densidad de espalda',
      routine: {
        id: `rt_prog_day2_${Date.now()}`,
        title: 'Día 2: Tirón',
        description: 'Sesión de tirón',
        category: 'Strength',
        difficulty: 'Intermediate',
        durationMinutes: 45,
        estimatedCalories: 380,
        xpReward: 300,
        exercises: [
          {
            id: `ex_p2_1`,
            name: 'Dominadas Pronas',
            muscleGroup: 'Back',
            equipment: 'Bodyweight',
            restSeconds: 90,
            sets: [
              { id: 's1', setNumber: 1, targetReps: 8, actualReps: 8, targetWeightKg: 0, actualWeightKg: 0, completed: false },
              { id: 's2', setNumber: 2, targetReps: 8, actualReps: 8, targetWeightKg: 0, actualWeightKg: 0, completed: false },
            ],
          },
        ],
        targetMuscles: ['Back', 'Arms'],
        tags: ['Custom', 'Strength'],
      },
    },
    {
      dayNumber: 3,
      title: 'Día 3: Pierna & Core',
      focus: 'Fuerza de cuádriceps, glúteos e isquios',
      routine: {
        id: `rt_prog_day3_${Date.now()}`,
        title: 'Día 3: Pierna',
        description: 'Sesión de pierna',
        category: 'Strength',
        difficulty: 'Intermediate',
        durationMinutes: 45,
        estimatedCalories: 420,
        xpReward: 300,
        exercises: [
          {
            id: `ex_p3_1`,
            name: 'Sentadilla Trasera con Barra',
            muscleGroup: 'Legs',
            equipment: 'Barbell',
            restSeconds: 120,
            sets: [
              { id: 's1', setNumber: 1, targetReps: 8, actualReps: 8, targetWeightKg: 80, actualWeightKg: 80, completed: false },
              { id: 's2', setNumber: 2, targetReps: 8, actualReps: 8, targetWeightKg: 80, actualWeightKg: 80, completed: false },
            ],
          },
        ],
        targetMuscles: ['Legs', 'Core'],
        tags: ['Custom', 'Strength'],
      },
    },
  ]);

  const handleOpenCreateModal = (mode: 'routine' | 'program' = 'routine') => {
    setCreationMode(mode);
    setEditingRoutineId(null);
    setNewTitle('');
    setNewDescription('');
    setNewCategory('Strength');
    setNewDifficulty('Intermediate');
    setNewDuration(45);
    setNewExercises([
      {
        id: `ex_${Date.now()}_1`,
        name: 'Press Militar con Mancuernas',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell',
        restSeconds: 60,
        sets: [
          { id: 'cs1', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 20, actualWeightKg: 20, completed: false },
          { id: 'cs2', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 20, actualWeightKg: 20, completed: false },
          { id: 'cs3', setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 22.5, actualWeightKg: 22.5, completed: false },
        ],
      },
    ]);
    setShowCreateModal(true);
  };

  const handleOpenEditRoutine = (routine: WorkoutRoutine) => {
    setCreationMode('routine');
    setEditingRoutineId(routine.id);
    setNewTitle(routine.title);
    setNewDescription(routine.description);
    setNewCategory(routine.category);
    setNewDifficulty(routine.difficulty);
    setNewDuration(routine.durationMinutes);
    setNewExercises(routine.exercises.map((ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s })) })));
    setShowCreateModal(true);
  };

  // Adjust program days count dynamically
  const handleChangeProgramDaysCount = (count: number) => {
    const validCount = Math.max(2, Math.min(6, count));
    setProgramDaysPerWeek(validCount);
    setProgramDaysData((prev) => {
      const current = [...prev];
      if (current.length < validCount) {
        for (let i = current.length + 1; i <= validCount; i++) {
          current.push({
            dayNumber: i,
            title: `Día ${i}: Sesión Personalizada`,
            focus: 'Enfoque de fuerza y desarrollo muscular',
            routine: {
              id: `rt_custom_prog_${Date.now()}_d${i}`,
              title: `Día ${i}`,
              description: `Sesión de día ${i}`,
              category: newCategory,
              difficulty: newDifficulty,
              durationMinutes: 45,
              estimatedCalories: 350,
              xpReward: 300,
              exercises: [
                {
                  id: `ex_cp_${i}_1`,
                  name: 'Press de Banca Plano',
                  muscleGroup: 'Chest',
                  equipment: 'Barbell',
                  restSeconds: 60,
                  sets: [
                    { id: 's1', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 50, actualWeightKg: 50, completed: false },
                    { id: 's2', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 50, actualWeightKg: 50, completed: false },
                  ],
                },
              ],
              targetMuscles: ['Full Body'],
              tags: ['Custom'],
            },
          });
        }
      } else if (current.length > validCount) {
        return current.slice(0, validCount);
      }
      return current;
    });
  };

  const categories = [
    { id: 'all', label: t.allCategories },
    { id: 'custom', label: '⭐ Mis Rutinas' },
    { id: 'Strength', label: t.strength },
    { id: 'Hypertrophy', label: t.hypertrophy },
    { id: 'HIIT', label: t.hiit },
    { id: 'Calisthenics', label: t.calisthenics },
    { id: 'Cardio', label: t.cardio },
    { id: 'Mobility', label: t.mobility },
  ];

  const filteredRoutines = routines.filter((r) => {
    const matchesCat =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'custom'
        ? Boolean(r.isCustom)
        : r.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'all' || r.difficulty === selectedDifficulty;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesDiff && matchesSearch;
  });

  const handleAddExerciseToForm = () => {
    const newEx: Exercise = {
      id: `ex_${Date.now()}`,
      name: 'Nuevo Ejercicio',
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      restSeconds: 60,
      sets: [
        { id: `s_${Date.now()}_1`, setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 50, actualWeightKg: 50, completed: false },
        { id: `s_${Date.now()}_2`, setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 50, actualWeightKg: 50, completed: false },
        { id: `s_${Date.now()}_3`, setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 55, actualWeightKg: 55, completed: false },
      ],
    };
    setNewExercises([...newExercises, newEx]);
  };

  const handleSaveCustomRoutine = () => {
    if (!newTitle.trim()) return;

    if (creationMode === 'routine') {
      if (newExercises.length === 0) return;
      const routine: WorkoutRoutine = {
        id: editingRoutineId || `rt_custom_${Date.now()}`,
        title: newTitle.trim(),
        description: newDescription.trim() || 'Rutina personalizada diseñada por el usuario.',
        category: newCategory,
        difficulty: newDifficulty,
        durationMinutes: newDuration,
        estimatedCalories: Math.round(newDuration * 8),
        xpReward: Math.round(newDuration * 5.5),
        exercises: newExercises,
        targetMuscles: Array.from(new Set(newExercises.map((e) => e.muscleGroup))),
        tags: ['Personalizada', newCategory],
        isCustom: true,
      };

      onCreateRoutine(routine);
      sound.playAchievement();
      setShowCreateModal(false);
      setEditingRoutineId(null);
      setNewTitle('');
      setNewDescription('');

      // Auto-switch to routines tab and select 'custom' filter so user immediately sees their creation
      setCatalogTab('routines');
      setSelectedCategory('custom');
      setSaveToastMessage(`¡Rutina "${routine.title}" guardada con éxito! (+120 XP)`);
      setTimeout(() => setSaveToastMessage(null), 4000);
    } else {
      // Saving Multi-Day Program
      const targetMusclesSet = new Set<string>();
      programDaysData.forEach((d) => {
        d.routine.exercises.forEach((ex) => targetMusclesSet.add(ex.muscleGroup));
      });

      const newProg: WorkoutProgram = {
        id: `prog_custom_${Date.now()}`,
        title: newTitle.trim(),
        description: newDescription.trim() || `Plan personalizado de ${programDaysPerWeek} días a la semana.`,
        daysPerWeek: programDaysPerWeek,
        difficulty: newDifficulty,
        category: (newCategory as any) || 'Strength',
        targetMuscles: Array.from(targetMusclesSet),
        xpReward: 300 + programDaysPerWeek * 100,
        days: programDaysData.map((d) => ({
          ...d,
          routine: {
            ...d.routine,
            difficulty: newDifficulty,
            category: newCategory,
          },
        })),
        isCustom: true,
      };

      const updatedPrograms = FitStorage.saveCustomProgram(newProg);
      setPrograms(updatedPrograms);
      sound.playLevelUp();
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');

      // Auto-switch to programs tab and expand this newly created program
      setCatalogTab('programs');
      setExpandedProgramId(newProg.id);
      setSaveToastMessage(`¡Plan Multidía "${newProg.title}" (${newProg.daysPerWeek} días) creado y activo!`);
      setTimeout(() => setSaveToastMessage(null), 4500);
    }
  };

  const handleDeleteCustomProgram = (progId: string) => {
    const updated = FitStorage.deleteCustomProgram(progId);
    setPrograms(updated);
    setConfirmDeleteProgramId(null);
    sound.playClick();
  };

  const handleStartProgramDay = (progId: string, day: ProgramDay) => {
    sound.playAchievement();
    onStartRoutine({
      ...day.routine,
      programId: progId,
      programDayNumber: day.dayNumber,
    });
  };

  const handleResetProgramCycle = (progId: string) => {
    sound.playLevelUp();
    FitStorage.setProgramDayCompleted(progId, 0);
    const updated = { ...programProgress };
    delete updated[progId];
    setProgramProgress(updated);
    if (onUpdateProgramProgress) {
      onUpdateProgramProgress(updated);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Toast alert confirmation when a routine or program is saved */}
      {saveToastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-neutral-950 px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center gap-3 font-mono font-black text-xs animate-bounce border-2 border-white">
          <Sparkles className="w-4 h-4 fill-current shrink-0" />
          <span>{saveToastMessage}</span>
          <button onClick={() => setSaveToastMessage(null)} className="ml-2 hover:opacity-70 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <p className="text-cyan-400 font-mono text-[10px] tracking-widest uppercase mb-0.5">
            PROTOCOLOS
          </p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {catalogTab === 'routines' ? 'Catálogo de Rutinas' : 'Programas Multidía'}
          </h2>
        </div>

        {/* Tab switcher: Rutinas vs Programas */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#121214] border border-white/10 p-1 rounded-2xl flex items-center gap-1 shadow-lg">
            <button
              id="btn-tab-routines"
              onClick={() => setCatalogTab('routines')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                catalogTab === 'routines'
                  ? 'bg-cyan-500 text-neutral-950 shadow-md scale-[1.02]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Rutinas ({routines.length})</span>
            </button>
            <button
              id="btn-tab-programs"
              onClick={() => setCatalogTab('programs')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                catalogTab === 'programs'
                  ? 'bg-cyan-500 text-neutral-950 shadow-md scale-[1.02]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Planes Multidía ({programs.length})</span>
            </button>
          </div>

          {onOpenSportModal && (
            <button
              id="btn-catalog-log-sport"
              onClick={onOpenSportModal}
              className="px-3.5 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs shadow flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <span>🎾</span>
              <span className="hidden sm:inline">Registrar Deporte</span>
            </button>
          )}

          {/* New Custom Creator Button with dropdown/mode support */}
          <button
            id="btn-open-create-routine"
            onClick={() => handleOpenCreateModal(catalogTab === 'programs' ? 'program' : 'routine')}
            className="px-4 py-2 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-display font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{catalogTab === 'programs' ? '+ Crear Plan Multidía' : '+ Nueva Rutina'}</span>
          </button>
        </div>
      </div>

      {/* ===================== VIEW 1: MULTI-DAY PROGRAMS ===================== */}
      {catalogTab === 'programs' && (
        <div className="space-y-6">
          {/* 🌟 ACTIVE PROGRAM HERO WIDGET (Only shown if user actually started a program and has completed >= 1 day but < all days) */}
          {(() => {
            const activeProg = programs.find((p) => {
              const comp = programProgress[p.id] || 0;
              return comp > 0 && comp < p.days.length;
            });

            if (!activeProg) return null;
            const completedDays = programProgress[activeProg.id] || 0;
            const nextDay = activeProg.days.find((d) => d.dayNumber === completedDays + 1) || activeProg.days[0];
            const progressPct = Math.min(100, Math.round((completedDays / activeProg.days.length) * 100));

            return (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950/40 via-neutral-900/90 to-blue-950/30 border border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.15)]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-400 text-neutral-950 shadow-[0_0_12px_rgba(6,182,212,0.5)] flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" />
                        PROGRAMA ACTIVO
                      </span>
                      <span className="text-[10px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
                        Día {completedDays + 1} de {activeProg.days.length}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                      {activeProg.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      Siguiente sesión sugerida: <strong className="text-white">{nextDay.title}</strong> — {nextDay.focus}
                    </p>

                    {/* Progress Bar & Percentage */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                        <span className="text-cyan-400 font-bold">{progressPct}% completado</span>
                        <span>{completedDays}/{activeProg.days.length} días superados</span>
                      </div>
                      <div className="h-2 bg-neutral-950 rounded-full overflow-hidden border border-white/10 p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                          style={{ width: `${Math.max(4, progressPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions: Direct Launch & Cancel/Abandon Program */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-2.5 shrink-0">
                    <button
                      id={`btn-continue-active-program-${activeProg.id}`}
                      onClick={() => handleStartProgramDay(activeProg.id, nextDay)}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-neutral-950 font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Continuar: Día {nextDay.dayNumber}</span>
                    </button>
                    
                    <button
                      id={`btn-cancel-active-program-${activeProg.id}`}
                      onClick={() => handleResetProgramCycle(activeProg.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-neutral-400 hover:text-red-400 font-mono text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Dejar o anular programa activo"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Desactivar / Reiniciar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* All Programs List */}
          <div className="grid grid-cols-1 gap-6">
            {programs.map((program) => {
              const currentCompletedDays = programProgress[program.id] || 0;
              const isExpanded = expandedProgramId === program.id;
              const percent = Math.min(100, Math.round((currentCompletedDays / program.days.length) * 100));
              const isProgramFinished = currentCompletedDays >= program.days.length;

              return (
                <div
                  key={program.id}
                  className="bg-[#121214] border border-white/10 hover:border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl pointer-events-none" />

                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {program.isCustom && (
                          <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                            PERSONALIZADO
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {program.daysPerWeek} DÍAS / SEMANA
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 uppercase">
                          {program.difficulty}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5">
                          {program.category}
                        </span>
                        {program.isCustom && (
                          confirmDeleteProgramId === program.id ? (
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={() => handleDeleteCustomProgram(program.id)}
                                className="px-2 py-0.5 rounded bg-red-500 text-neutral-950 font-mono font-black text-[10px] hover:bg-red-400 cursor-pointer"
                              >
                                Confirmar Borrar
                              </button>
                              <button
                                onClick={() => setConfirmDeleteProgramId(null)}
                                className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteProgramId(program.id)}
                              className="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-white/10 text-[10px] font-mono flex items-center gap-1 transition-colors ml-auto cursor-pointer"
                              title="Eliminar este plan personalizado"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Borrar</span>
                            </button>
                          )
                        )}
                      </div>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                        {program.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                        {program.description}
                      </p>
                    </div>

                    {/* XP Reward & Days Progress Badge + Reset option */}
                    {(() => {
                      const totalSessionsXp = program.days.reduce(
                        (sum, d) => sum + (d.routine?.xpReward || 300),
                        0
                      );
                      const totalCycleXp = totalSessionsXp + (program.xpReward || 300);
                      return (
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-black text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-xl border border-yellow-500/20 shadow">
                            +{totalCycleXp} XP Total Ciclo ({totalSessionsXp} XP días + {program.xpReward} Bono)
                          </span>
                          <div className="flex items-center gap-2 text-right">
                            <span className="text-[11px] font-mono font-bold text-neutral-400">
                              {currentCompletedDays} de {program.days.length} Días ({percent}%)
                            </span>
                            {currentCompletedDays > 0 && !isProgramFinished && (
                              <button
                                onClick={() => handleResetProgramCycle(program.id)}
                                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-neutral-400 hover:text-red-400 font-mono text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                                title="Reiniciar progreso de este programa"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Reiniciar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Visual Timeline Roadmap Strip */}
                  <div className="my-5 relative z-10">
                    <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
                      {program.days.map((d, idx) => {
                        const isDone = currentCompletedDays >= d.dayNumber;
                        const isCurr = currentCompletedDays + 1 === d.dayNumber;
                        const isLast = idx === program.days.length - 1;

                        return (
                          <div key={d.dayNumber} className="flex items-center flex-1 min-w-[70px]">
                            {/* Step Node */}
                            <div className="flex flex-col items-center gap-1 w-full text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-xs transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                                    : isCurr
                                    ? 'bg-cyan-400 text-neutral-950 ring-4 ring-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse'
                                    : 'bg-white/5 text-neutral-500 border border-white/10'
                                }`}
                              >
                                {isDone ? '✓' : isCurr ? d.dayNumber : <Lock className="w-3 h-3 text-neutral-500" />}
                              </div>
                              <span
                                className={`text-[10px] font-mono truncate max-w-[80px] ${
                                  isDone
                                    ? 'text-emerald-400 font-bold'
                                    : isCurr
                                    ? 'text-cyan-400 font-bold'
                                    : 'text-neutral-500'
                                }`}
                              >
                                D{d.dayNumber}
                              </span>
                            </div>

                            {/* Connecting Line */}
                            {!isLast && (
                              <div
                                className={`h-1 flex-1 mx-1 rounded-full transition-all ${
                                  isDone
                                    ? 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                    : 'bg-white/10'
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Program Days Grid */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-400">
                        Calendario Detallado de Sesiones:
                      </h4>
                      <button
                        onClick={() => setExpandedProgramId(isExpanded ? null : program.id)}
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                      >
                        <span>{isExpanded ? 'Contraer Sesiones' : 'Ver Todas las Sesiones'}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 animate-in fade-in">
                        {program.days.map((day) => {
                          const isCompleted = currentCompletedDays >= day.dayNumber;
                          const isNext = currentCompletedDays + 1 === day.dayNumber;
                          const isLocked = !isCompleted && !isNext;

                          return (
                            <div
                              key={day.dayNumber}
                              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                isCompleted
                                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                                  : isNext
                                  ? 'bg-cyan-500/[0.06] border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                  : 'bg-white/[0.02] border-white/5 text-neutral-500 opacity-60'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                                        isCompleted
                                          ? 'bg-emerald-500 text-neutral-950'
                                          : isNext
                                          ? 'bg-cyan-500 text-neutral-950 font-black'
                                          : 'bg-white/10 text-neutral-500'
                                      }`}
                                    >
                                      {isLocked ? <Lock className="w-3 h-3" /> : day.dayNumber}
                                    </span>
                                    <h5 className={`font-display font-bold text-sm ${isLocked ? 'text-neutral-400' : 'text-white'}`}>
                                      {day.title}
                                    </h5>
                                  </div>
                                  {isCompleted && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                      ✓ COMPLETADO
                                    </span>
                                  )}
                                  {isNext && (
                                    <span className="text-[10px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 animate-pulse">
                                      ⚡ SIGUIENTE
                                    </span>
                                  )}
                                  {isLocked && (
                                    <span className="text-[10px] font-mono font-bold text-neutral-500 px-2 py-0.5 rounded bg-white/5 border border-white/5 flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5" /> BLOQUEADO
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-neutral-400 ml-8">
                                  {day.focus}
                                </p>
                                <p className="text-[11px] font-mono text-neutral-500 ml-8 mt-1">
                                  {isLocked
                                    ? `Completa el Día ${day.dayNumber - 1} para desbloquear`
                                    : `${day.routine.exercises.length} Ejercicios • ~${day.routine.durationMinutes} min • +${day.routine.xpReward} XP`}
                                </p>
                              </div>

                              <div className="flex items-center justify-end pt-2 border-t border-white/5">
                                {isLocked ? (
                                  <button
                                    disabled
                                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed opacity-50"
                                    title={`Bloqueado hasta completar el Día ${day.dayNumber - 1}`}
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Bloqueado</span>
                                  </button>
                                ) : (
                                  <button
                                    id={`btn-start-prog-${program.id}-day-${day.dayNumber}`}
                                    onClick={() => handleStartProgramDay(program.id, day)}
                                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
                                      isNext
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 shadow-lg shadow-cyan-500/30'
                                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                    }`}
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>{isCompleted ? '↺ Repetir Sesión' : 'Iniciar Sesión'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Program Completed Banner & Cycle Restart */}
                    {isProgramFinished && (
                      <div className="mt-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95">
                        <div className="flex items-center gap-3 text-center sm:text-left">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-display font-bold text-white text-sm">¡Ciclo Semanal Completado! (+{program.xpReward} XP Bono Final)</h5>
                            <p className="text-xs text-neutral-400">Has superado todas las sesiones del plan y recibido el bono final. Reinicia el ciclo para la próxima semana.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleResetProgramCycle(program.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 shrink-0 transition-transform hover:scale-105"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reiniciar Ciclo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: INDIVIDUAL ROUTINES ===================== */}
      {catalogTab === 'routines' && (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o músculo (Pectoral, Espalda, Pierna, Core)..."
                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors font-mono"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Routine Cards Grid (EvoMare Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRoutines.map((routine) => {
              const isExpanded = expandedRoutineId === routine.id;
              
              // Routine thumbnail image with unique photography per routine
              const routineImage = getRoutinePhoto(routine);

              // Intensity percentage ring
              const intensityPct = routine.difficulty === 'Advanced' ? 85 : routine.difficulty === 'Intermediate' ? 65 : 45;
              const intensityLabel = routine.difficulty === 'Advanced' ? 'Alta' : routine.difficulty === 'Intermediate' ? 'Media' : 'Básica';

              return (
                <div
                  key={routine.id}
                  className="bg-[#141417] border border-white/10 hover:border-cyan-500/40 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-2xl group relative"
                >
                  {/* Photographic Header Banner */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                    <img
                      src={routineImage}
                      alt={routine.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-[#141417]/40 to-black/60" />

                    {/* Top Overlays: Category & Custom Badges + Actions */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/90 text-neutral-950 backdrop-blur-md">
                          {routine.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/15">
                          {routine.difficulty}
                        </span>
                        {routine.isCustom && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/80 text-white backdrop-blur-md">
                            CUSTOM
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {routine.isCustom && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditRoutine(routine)}
                              className="p-1.5 rounded-xl bg-black/60 backdrop-blur-md hover:bg-cyan-500/20 text-neutral-300 hover:text-cyan-400 border border-white/15 transition-all cursor-pointer"
                              title="Editar rutina"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteRoutine && (
                              confirmDeleteRoutineId === routine.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteRoutine(routine.id);
                                      setConfirmDeleteRoutineId(null);
                                    }}
                                    className="px-2 py-1 rounded-xl bg-red-500 text-neutral-950 font-mono font-black text-[10px] hover:bg-red-400 transition-colors cursor-pointer"
                                  >
                                    Borrar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteRoutineId(null)}
                                    className="p-1 rounded-xl bg-black/60 text-neutral-300 hover:text-white cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteRoutineId(routine.id)}
                                  className="p-1.5 rounded-xl bg-black/60 backdrop-blur-md hover:bg-red-500/20 text-neutral-300 hover:text-red-400 border border-white/15 transition-all cursor-pointer"
                                  title="Eliminar rutina"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )
                            )}
                          </>
                        )}
                        <span className="text-xs font-mono font-black text-cyan-300 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-xl border border-cyan-500/30">
                          +{routine.xpReward} XP
                        </span>
                      </div>
                    </div>

                    {/* Bottom overlay pills on banner: Time & Calories */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono text-white z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {routine.durationMinutes} Min
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[11px] text-orange-300">
                          <Flame className="w-3 h-3 text-orange-400" />
                          ~{routine.estimatedCalories} Kcal
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-300">
                        {routine.exercises.length} Ejercicios
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title */}
                      <h3 className="font-display font-black text-lg sm:text-xl text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                        {routine.title}
                      </h3>

                      {/* Target muscle chips */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {routine.targetMuscles.map((muscle) => (
                          <span
                            key={muscle}
                            className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>

                      {/* Exercises preview dropdown */}
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <button
                          onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                          className="w-full flex items-center justify-between text-xs font-mono font-bold text-neutral-300 hover:text-cyan-400 transition-colors"
                        >
                          <span>{routine.exercises.length} Ejercicios detallados</span>
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2 animate-in fade-in">
                            {routine.exercises.map((ex, exIdx) => (
                              <div
                                key={ex.id}
                                className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-xs flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center">
                                    {exIdx + 1}
                                  </span>
                                  <span className="font-medium text-white">{ex.name}</span>
                                </div>
                                <span className="text-neutral-400 font-mono text-[10px]">
                                  {ex.sets.length} series • {ex.restSeconds}s rest
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer with EvoMare Intensity Ring and Start Button */}
                    <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
                      {/* EvoMare Style Circular Intensity Ring */}
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                          <svg className="w-9 h-9 -rotate-90">
                            <circle
                              cx="18"
                              cy="18"
                              r="13"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-white/10"
                              fill="transparent"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="13"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={2 * Math.PI * 13}
                              strokeDashoffset={2 * Math.PI * 13 * (1 - intensityPct / 100)}
                              strokeLinecap="round"
                              className="text-cyan-400"
                              fill="transparent"
                            />
                          </svg>
                          <span className="absolute text-[9px] font-mono font-black text-white">
                            {intensityPct}%
                          </span>
                        </div>
                        <div className="text-[10px] font-mono leading-tight">
                          <p className="text-neutral-400 uppercase font-semibold">Intensidad</p>
                          <p className="text-cyan-400 font-bold">{intensityLabel}</p>
                        </div>
                      </div>

                      {/* Cyan Pill Start Button */}
                      <button
                        id={`btn-start-routine-${routine.id}`}
                        onClick={() => {
                          sound.playAchievement();
                          onStartRoutine(routine);
                        }}
                        className="py-2.5 px-4 rounded-full bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-neutral-950 font-display font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{t.startWorkout}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Custom Routine / Multi-Day Program Creation & Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  {editingRoutineId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="font-display font-bold text-white text-lg">
                  {editingRoutineId ? 'Editar Rutina' : creationMode === 'routine' ? 'Nueva Rutina Individual' : 'Nuevo Plan Multidía'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingRoutineId(null);
                }}
                className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switcher Mode: Rutina (1 Día) vs Plan Multidía (Sólo si es nueva creación) */}
            {!editingRoutineId && (
              <div className="bg-white/5 p-1 rounded-2xl flex items-center gap-1 shrink-0 border border-white/5">
                <button
                  type="button"
                  onClick={() => setCreationMode('routine')}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    creationMode === 'routine'
                      ? 'bg-cyan-400 text-neutral-950 shadow-md font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Rutina (1 Sesión)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode('program')}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    creationMode === 'program'
                      ? 'bg-cyan-400 text-neutral-950 shadow-md font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Plan Multidía (Semanal)</span>
                </button>
              </div>
            )}

            {/* Form Fields: General */}
            <div className="space-y-3 shrink-0">
              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">
                  {creationMode === 'routine' ? 'Nombre de la Rutina' : 'Nombre del Plan Multidía'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={creationMode === 'routine' ? 'Ej. Pecho & Tríceps Hipertrofia' : 'Ej. Mi Plan Híbrido 4 Días'}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">Descripción u Objetivo</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enfoque principal, técnica y notas para la semana..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-xl text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Strength">Fuerza</option>
                    <option value="Hypertrophy">Hipertrofia</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Calisthenics">Calistenia</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Mobility">Movilidad</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Dificultad</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-xl text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Beginner">Principiante</option>
                    <option value="Intermediate">Intermedio</option>
                    <option value="Advanced">Avanzado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* MODE 1: SINGLE ROUTINE BUILDER */}
            {creationMode === 'routine' && (
              <div className="pt-2 border-t border-white/5 space-y-2.5 overflow-y-auto flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-mono font-bold text-white">Ejercicios de la Sesión ({newExercises.length})</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveExerciseSelectorTargetDay(null);
                        setShowExerciseSelector(true);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Search className="w-3 h-3" /> Catálogo (+100)
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExerciseToForm}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-neutral-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Libre
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {newExercises.map((ex, idx) => {
                    const isExOpen = expandedExerciseId === ex.id;
                    return (
                      <div key={ex.id} className="p-3 bg-[#18181b] rounded-2xl border border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={ex.name}
                            onChange={(e) => {
                              const updated = [...newExercises];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setNewExercises(updated);
                            }}
                            className="bg-transparent font-bold text-xs text-white border-b border-white/10 focus:border-cyan-500 focus:outline-none flex-1 py-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => setExpandedExerciseId(isExOpen ? null : ex.id)}
                            className="px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExOpen ? 'Ocultar Series' : 'Editar Series & Peso'}</span>
                            {isExOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                          {newExercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setNewExercises(newExercises.filter((_, i) => i !== idx))}
                              className="text-neutral-500 hover:text-red-400 cursor-pointer p-1"
                              title="Eliminar ejercicio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Summary chips */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 flex-wrap">
                          <span className="bg-white/5 px-2 py-0.5 rounded text-neutral-300">{ex.muscleGroup}</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-bold">{ex.sets.length} series</span>
                          <span>•</span>
                          <span>Descanso:</span>
                          <select
                            value={ex.restSeconds}
                            onChange={(e) => {
                              const updated = [...newExercises];
                              updated[idx] = { ...updated[idx], restSeconds: Number(e.target.value) };
                              setNewExercises(updated);
                            }}
                            className="bg-neutral-900 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none cursor-pointer"
                          >
                            <option value={30}>30s</option>
                            <option value={45}>45s</option>
                            <option value={60}>60s</option>
                            <option value={90}>90s</option>
                            <option value={120}>120s</option>
                            <option value={180}>180s</option>
                          </select>
                        </div>

                        {/* Detailed Sets & Weights Editor (Collapsible) */}
                        {isExOpen && (
                          <div className="pt-2 border-t border-white/5 space-y-2 animate-in fade-in">
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-neutral-400 uppercase font-bold px-1">
                              <span className="col-span-2 text-center">Set</span>
                              <span className="col-span-5 text-center">Reps</span>
                              <span className="col-span-4 text-center">Peso (kg)</span>
                              <span className="col-span-1"></span>
                            </div>

                            {ex.sets.map((set, sIdx) => (
                              <div key={set.id} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-1.5 rounded-xl border border-white/5">
                                <span className="col-span-2 text-center font-mono font-bold text-xs text-cyan-400">
                                  #{sIdx + 1}
                                </span>
                                <div className="col-span-5 flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={set.targetReps}
                                    onChange={(e) => {
                                      const updated = [...newExercises];
                                      const val = Math.max(1, Number(e.target.value));
                                      updated[idx].sets[sIdx] = { ...set, targetReps: val, actualReps: val };
                                      setNewExercises(updated);
                                    }}
                                    className="w-full bg-neutral-900 border border-white/10 rounded-lg py-1 px-1.5 text-center font-mono font-bold text-xs text-white focus:border-cyan-400 focus:outline-none"
                                  />
                                </div>
                                <div className="col-span-4 flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={set.targetWeightKg}
                                    onChange={(e) => {
                                      const updated = [...newExercises];
                                      const val = Math.max(0, Number(e.target.value));
                                      updated[idx].sets[sIdx] = { ...set, targetWeightKg: val, actualWeightKg: val };
                                      setNewExercises(updated);
                                    }}
                                    className="w-full bg-neutral-900 border border-white/10 rounded-lg py-1 px-1.5 text-center font-mono font-bold text-xs text-white focus:border-cyan-400 focus:outline-none"
                                  />
                                </div>
                                <div className="col-span-1 text-center">
                                  {ex.sets.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...newExercises];
                                        updated[idx].sets = updated[idx].sets.filter((_, i) => i !== sIdx).map((s, newIdx) => ({
                                          ...s,
                                          setNumber: newIdx + 1,
                                        }));
                                        setNewExercises(updated);
                                      }}
                                      className="text-neutral-500 hover:text-red-400 p-0.5 cursor-pointer"
                                      title="Quitar serie"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...newExercises];
                                const lastSet = ex.sets[ex.sets.length - 1];
                                const newSet: ExerciseSet = {
                                  id: `set_${Date.now()}_${Math.random()}`,
                                  setNumber: ex.sets.length + 1,
                                  targetReps: lastSet ? lastSet.targetReps : 10,
                                  actualReps: lastSet ? lastSet.actualReps : 10,
                                  targetWeightKg: lastSet ? lastSet.targetWeightKg : 20,
                                  actualWeightKg: lastSet ? lastSet.actualWeightKg : 20,
                                  completed: false,
                                };
                                updated[idx].sets.push(newSet);
                                setNewExercises(updated);
                              }}
                              className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 font-mono text-[11px] font-bold border border-cyan-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Añadir Serie
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODE 2: MULTI-DAY PROGRAM BUILDER */}
            {creationMode === 'program' && (
              <div className="pt-2 border-t border-white/5 space-y-3 overflow-y-auto flex-1">
                {/* Select Number of Days */}
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1.5">
                    ¿Cuántos días por semana tendrá el plan? ({programDaysPerWeek} Días)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleChangeProgramDaysCount(num)}
                        className={`py-2 rounded-xl font-mono text-xs font-black transition-all cursor-pointer ${
                          programDaysPerWeek === num
                            ? 'bg-cyan-400 text-neutral-950 shadow-md shadow-cyan-500/30 scale-105'
                            : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {num} Días
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days Configuration Cards */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {programDaysData.map((d, dIdx) => (
                    <div key={d.dayNumber} className="p-3.5 bg-[#18181b] rounded-2xl border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-5 h-5 rounded bg-cyan-400 text-neutral-950 font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                          {d.dayNumber}
                        </span>
                        <input
                          type="text"
                          value={d.title}
                          onChange={(e) => {
                            const updated = [...programDaysData];
                            updated[dIdx] = {
                              ...updated[dIdx],
                              title: e.target.value,
                              routine: { ...updated[dIdx].routine, title: e.target.value },
                            };
                            setProgramDaysData(updated);
                          }}
                          placeholder={`Nombre del Día ${d.dayNumber}`}
                          className="bg-transparent font-bold text-xs text-white border-b border-white/10 focus:border-cyan-400 focus:outline-none flex-1 py-0.5"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveExerciseSelectorTargetDay(d.dayNumber);
                            setShowExerciseSelector(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30 shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Ejercicio
                        </button>
                      </div>

                      <input
                        type="text"
                        value={d.focus}
                        onChange={(e) => {
                          const updated = [...programDaysData];
                          updated[dIdx] = { ...updated[dIdx], focus: e.target.value };
                          setProgramDaysData(updated);
                        }}
                        placeholder="Enfoque muscular (ej. 'Pecho y Tríceps', 'Espalda')..."
                        className="w-full bg-white/5 px-2.5 py-1 rounded-lg text-[11px] text-neutral-300 placeholder-neutral-500 border border-white/5 focus:outline-none"
                      />

                      {/* Program Day Exercises with Sets and Weight Customizer */}
                      <div className="space-y-2 pt-1 border-t border-white/5">
                        {d.routine.exercises.length === 0 ? (
                          <p className="text-[10px] font-mono text-neutral-500 text-center py-1">
                            Sin ejercicios en este día aún. Pulsa "+ Ejercicio".
                          </p>
                        ) : (
                          d.routine.exercises.map((pEx, pExIdx) => {
                            const pKey = `p_${d.dayNumber}_${pEx.id}`;
                            const isPExOpen = expandedExerciseId === pKey;
                            return (
                              <div key={pEx.id} className="p-2.5 bg-neutral-900/80 rounded-xl border border-white/5 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-white truncate flex-1">{pEx.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedExerciseId(isPExOpen ? null : pKey)}
                                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-cyan-400 font-mono text-[9px] font-bold border border-white/10 flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{pEx.sets.length}S • {isPExOpen ? 'Cerrar' : 'Series & Kg'}</span>
                                    {isPExOpen ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...programDaysData];
                                      updated[dIdx].routine.exercises = updated[dIdx].routine.exercises.filter((_, i) => i !== pExIdx);
                                      setProgramDaysData(updated);
                                    }}
                                    className="text-neutral-500 hover:text-red-400 p-0.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                {isPExOpen && (
                                  <div className="space-y-1.5 pt-1.5 border-t border-white/5 animate-in fade-in">
                                    {pEx.sets.map((set, sIdx) => (
                                      <div key={set.id} className="flex items-center gap-2 text-xs font-mono">
                                        <span className="text-cyan-400 font-bold w-6">S{sIdx + 1}</span>
                                        <div className="flex-1 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                          <input
                                            type="number"
                                            min="1"
                                            value={set.targetReps}
                                            onChange={(e) => {
                                              const updated = [...programDaysData];
                                              const val = Math.max(1, Number(e.target.value));
                                              updated[dIdx].routine.exercises[pExIdx].sets[sIdx] = {
                                                ...set,
                                                targetReps: val,
                                                actualReps: val,
                                              };
                                              setProgramDaysData(updated);
                                            }}
                                            className="w-12 bg-transparent text-center font-bold text-white focus:outline-none"
                                          />
                                          <span className="text-[10px] text-neutral-400">reps</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                          <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={set.targetWeightKg}
                                            onChange={(e) => {
                                              const updated = [...programDaysData];
                                              const val = Math.max(0, Number(e.target.value));
                                              updated[dIdx].routine.exercises[pExIdx].sets[sIdx] = {
                                                ...set,
                                                targetWeightKg: val,
                                                actualWeightKg: val,
                                              };
                                              setProgramDaysData(updated);
                                            }}
                                            className="w-12 bg-transparent text-center font-bold text-white focus:outline-none"
                                          />
                                          <span className="text-[10px] text-neutral-400">kg</span>
                                        </div>
                                        {pEx.sets.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = [...programDaysData];
                                              updated[dIdx].routine.exercises[pExIdx].sets = updated[dIdx].routine.exercises[pExIdx].sets
                                                .filter((_, i) => i !== sIdx)
                                                .map((s, newI) => ({ ...s, setNumber: newI + 1 }));
                                              setProgramDaysData(updated);
                                            }}
                                            className="text-neutral-500 hover:text-red-400 p-0.5 cursor-pointer"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...programDaysData];
                                        const setsArr = updated[dIdx].routine.exercises[pExIdx].sets;
                                        const lastS = setsArr[setsArr.length - 1];
                                        setsArr.push({
                                          id: `s_${Date.now()}_${Math.random()}`,
                                          setNumber: setsArr.length + 1,
                                          targetReps: lastS ? lastS.targetReps : 10,
                                          actualReps: lastS ? lastS.actualReps : 10,
                                          targetWeightKg: lastS ? lastS.targetWeightKg : 20,
                                          actualWeightKg: lastS ? lastS.actualWeightKg : 20,
                                          completed: false,
                                        });
                                        setProgramDaysData(updated);
                                      }}
                                      className="w-full py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-2.5 h-2.5" /> Añadir Serie a este Ejercicio
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Bottom Bar */}
            <div className="flex gap-3 pt-3 border-t border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingRoutineId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomRoutine}
                className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-display font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                {editingRoutineId
                  ? 'Guardar Cambios'
                  : creationMode === 'routine'
                  ? 'Guardar Rutina (+120 XP)'
                  : 'Crear Plan Multidía'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Selector Modal from +100 Exercise Database */}
      <ExerciseSelectorModal
        isOpen={showExerciseSelector}
        onClose={() => {
          setShowExerciseSelector(false);
          setActiveExerciseSelectorTargetDay(null);
        }}
        title="Añadir Ejercicios a la Rutina"
        buttonLabel="Añadir a la Rutina"
        onSelectExercises={(selectedExercises) => {
          if (activeExerciseSelectorTargetDay !== null) {
            // Target specific program day
            setProgramDaysData((prev) => {
              return prev.map((d) => {
                if (d.dayNumber !== activeExerciseSelectorTargetDay) return d;
                return {
                  ...d,
                  routine: {
                    ...d.routine,
                    exercises: [...d.routine.exercises, ...selectedExercises],
                  },
                };
              });
            });
          } else {
            // Target single routine
            setNewExercises((prev) => [...prev, ...selectedExercises]);
          }
          setShowExerciseSelector(false);
          setActiveExerciseSelectorTargetDay(null);
        }}
      />
    </div>
  );
};
