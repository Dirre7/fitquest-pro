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
  Play
} from 'lucide-react';
import { WorkoutRoutine, WorkoutProgram, ProgramDay, Exercise, Language } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';
import { FitStorage } from '../lib/storage';

interface WorkoutCatalogViewProps {
  routines: WorkoutRoutine[];
  lang: Language;
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onCreateRoutine: (routine: WorkoutRoutine) => void;
}

export const WorkoutCatalogView: React.FC<WorkoutCatalogViewProps> = ({
  routines,
  lang,
  onStartRoutine,
  onCreateRoutine,
}) => {
  const t = translations[lang];

  // Active Catalog Tab: 'routines' or 'programs'
  const [catalogTab, setCatalogTab] = useState<'routines' | 'programs'>('routines');

  // Program tracking state
  const [programs] = useState<WorkoutProgram[]>(() => FitStorage.getPrograms());
  const [programProgress, setProgramProgress] = useState<{ [id: string]: number }>(() =>
    FitStorage.getProgramProgress()
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>('prog_ppl_3day');

  // New Custom Routine Form State
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

  const categories = [
    { id: 'all', label: t.allCategories },
    { id: 'Strength', label: t.strength },
    { id: 'Hypertrophy', label: t.hypertrophy },
    { id: 'HIIT', label: t.hiit },
    { id: 'Calisthenics', label: t.calisthenics },
    { id: 'Cardio', label: t.cardio },
    { id: 'Mobility', label: t.mobility },
  ];

  const filteredRoutines = routines.filter((r) => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
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

    const routine: WorkoutRoutine = {
      id: `rt_custom_${Date.now()}`,
      title: newTitle,
      description: newDescription || 'Rutina personalizada diseñada por el usuario.',
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
    setNewTitle('');
    setNewDescription('');
  };

  const handleStartProgramDay = (progId: string, day: ProgramDay) => {
    sound.playAchievement();
    onStartRoutine(day.routine);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase mb-1">
            PROTOCOLOS Y CATÁLOGO DE ENTRENAMIENTO
          </p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {catalogTab === 'routines' ? 'Catálogo de Rutinas' : 'Programas Multidía'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {catalogTab === 'routines'
              ? 'Rutinas estructuradas con sobrecarga progresiva y puntos de experiencia'
              : 'Planes estructurados de varios días por semana con seguimiento de ciclo continuo'}
          </p>
        </div>

        {/* Tab switcher: Rutinas vs Programas */}
        <div className="flex items-center gap-2">
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

          {catalogTab === 'routines' && (
            <button
              id="btn-open-create-routine"
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold text-xs shadow flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Nueva Rutina</span>
            </button>
          )}
        </div>
      </div>

      {/* ===================== VIEW 1: MULTI-DAY PROGRAMS ===================== */}
      {catalogTab === 'programs' && (
        <div className="space-y-6">
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
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {program.daysPerWeek} DÍAS / SEMANA
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 uppercase">
                          {program.difficulty}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5">
                          {program.category}
                        </span>
                      </div>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                        {program.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                        {program.description}
                      </p>
                    </div>

                    {/* XP Reward & Days Progress Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-black text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-xl border border-yellow-500/20 shadow">
                        +{program.xpReward} XP Recompensa
                      </span>
                      <div className="text-right">
                        <span className="text-[11px] font-mono font-bold text-neutral-400">
                          {currentCompletedDays} de {program.days.length} Días ({percent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Program Progress Bar */}
                  <div className="my-4 relative z-10">
                    <div className="h-2.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                        style={{ width: `${Math.max(5, percent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Program Days Grid */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-400">
                        Calendario de Sesiones del Plan:
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

                          return (
                            <div
                              key={day.dayNumber}
                              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                isCompleted
                                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                                  : isNext
                                  ? 'bg-cyan-500/[0.06] border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                  : 'bg-white/[0.02] border-white/5 text-neutral-400 opacity-80'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                                      isCompleted
                                        ? 'bg-emerald-500 text-neutral-950'
                                        : isNext
                                        ? 'bg-cyan-500 text-neutral-950 font-black'
                                        : 'bg-white/10 text-neutral-300'
                                    }`}>
                                      {day.dayNumber}
                                    </span>
                                    <h5 className="font-display font-bold text-sm text-white">
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
                                </div>
                                <p className="text-xs text-neutral-300 ml-8">
                                  {day.focus}
                                </p>
                                <p className="text-[11px] font-mono text-neutral-400 ml-8 mt-1">
                                  {day.routine.exercises.length} Ejercicios • ~{day.routine.durationMinutes} min • +{day.routine.xpReward} XP
                                </p>
                              </div>

                              <div className="flex items-center justify-end pt-2 border-t border-white/5">
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
                                  <span>{isCompleted ? 'Repetir Sesión' : 'Iniciar Sesión'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
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

          {/* Routine Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRoutines.map((routine) => {
              const isExpanded = expandedRoutineId === routine.id;

              return (
                <div
                  key={routine.id}
                  className="bg-[#121214] border border-white/5 hover:border-cyan-500/40 rounded-3xl p-5 sm:p-6 transition-all flex flex-col justify-between shadow-2xl group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

                  <div className="relative z-10">
                    {/* Badges row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                          {routine.category}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                          {routine.difficulty}
                        </span>
                        {routine.isCustom && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-xl border border-cyan-500/20">
                        +{routine.xpReward} XP
                      </span>
                    </div>

                    {/* Title and description */}
                    <h3 className="font-display font-black text-lg sm:text-xl text-white group-hover:text-cyan-400 transition-colors">
                      {routine.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                      {routine.description}
                    </p>

                    {/* Target muscle chips */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {routine.targetMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/5 text-neutral-300 border border-white/5"
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
                        <span>{routine.exercises.length} Ejercicios incluidos</span>
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

                  {/* Card bottom: Duration, cals & Start button */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {routine.durationMinutes}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        ~{routine.estimatedCalories}kcal
                      </span>
                    </div>

                    <button
                      id={`btn-start-routine-${routine.id}`}
                      onClick={() => {
                        sound.playAchievement();
                        onStartRoutine(routine);
                      }}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t.startWorkout}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Custom Routine Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-cyan-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-white text-lg">
                  {t.createCustom}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">Nombre de la Rutina</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Pecho & Tríceps Hipertrofia"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">Descripción</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Objetivo principal, técnica y notas..."
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
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-cyan-500 focus:outline-none"
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
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Duración (min)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value) || 45)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Exercise Builder in Modal */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-white">Ejercicios ({newExercises.length})</h4>
                <button
                  onClick={handleAddExerciseToForm}
                  className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {newExercises.map((ex, idx) => (
                  <div key={ex.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...newExercises];
                          updated[idx].name = e.target.value;
                          setNewExercises(updated);
                        }}
                        className="bg-transparent font-medium text-xs text-white border-b border-white/10 focus:border-cyan-500 focus:outline-none flex-1 py-0.5"
                      />
                      {newExercises.length > 1 && (
                        <button
                          onClick={() => setNewExercises(newExercises.filter((_, i) => i !== idx))}
                          className="text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-white/5">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustomRoutine}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-mono font-bold shadow-md shadow-cyan-500/25"
              >
                Guardar Rutina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
