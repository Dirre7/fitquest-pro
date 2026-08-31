import React, { useState } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Trash2,
  Check,
  X,
  Target,
} from 'lucide-react';
import { WorkoutRoutine, Exercise, ExerciseSet, Language } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';

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

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

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
    // Reset form
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Search / Add Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <p className="text-cyan-500 font-mono text-xs tracking-widest uppercase mb-1">
            PROTOCOLOS Y CATALOGO DE ENTRENAMIENTO
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {t.routineTitle}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {t.routineSubtitle}
          </p>
        </div>

        <button
          id="btn-open-create-routine"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.createCustom}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#121214] border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, músculo (Pectoral, Espalda, Pierna)..."
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
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
              className="bg-[#121214] border border-white/5 hover:border-cyan-500/40 rounded-3xl p-6 transition-all flex flex-col justify-between shadow-2xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

              <div className="relative z-10">
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                      {routine.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                      {routine.difficulty}
                    </span>
                    {routine.isCustom && (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        CUSTOM
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
                    +{routine.xpReward} XP
                  </span>
                </div>

                {/* Title and description */}
                <h3 className="font-display font-extrabold text-xl text-white group-hover:text-cyan-400 transition-colors">
                  {routine.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  {routine.description}
                </p>

                {/* Target muscle chips */}
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {routine.targetMuscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-white/5 text-neutral-300 border border-white/5"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>

                {/* Exercises preview dropdown */}
                <div className="mt-4 pt-3.5 border-t border-white/5">
                  <button
                    onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                    className="w-full flex items-center justify-between text-xs font-mono font-bold text-neutral-300 hover:text-cyan-400 transition-colors"
                  >
                    <span>{routine.exercises.length} {t.exercisesCount} incluidos</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 animate-in fade-in">
                      {routine.exercises.map((ex, exIdx) => (
                        <div
                          key={ex.id}
                          className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center">
                              {exIdx + 1}
                            </span>
                            <span className="font-bold text-white">{ex.name}</span>
                          </div>
                          <span className="text-neutral-400 font-mono text-[11px]">
                            {ex.sets.length} series • {ex.restSeconds}s rest
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 font-medium">
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
                  id={`btn-launch-routine-${routine.id}`}
                  onClick={() => onStartRoutine(routine)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {t.startRoutine}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Custom Routine Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white">{t.createCustom}</h3>
                  <p className="text-xs text-neutral-400">Diseña tu propio plan con sobrecarga progresiva</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-2xl bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <label className="text-xs font-mono font-bold text-neutral-300 block mb-1.5 uppercase">Nombre de la Rutina</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Torso Empuje & Hombros Élite"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-neutral-300 block mb-1.5 uppercase">Descripción / Objetivos</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ej. Enfoque en press de banca pesado y elevaciones laterales."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-mono font-bold text-neutral-300 block mb-1.5 uppercase">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as WorkoutRoutine['category'])}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Strength" className="bg-neutral-900">Fuerza</option>
                    <option value="Hypertrophy" className="bg-neutral-900">Hipertrofia</option>
                    <option value="HIIT" className="bg-neutral-900">HIIT</option>
                    <option value="Calisthenics" className="bg-neutral-900">Calistenia</option>
                    <option value="Cardio" className="bg-neutral-900">Cardio</option>
                    <option value="Mobility" className="bg-neutral-900">Movilidad</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-neutral-300 block mb-1.5 uppercase">Dificultad</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as WorkoutRoutine['difficulty'])}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Beginner" className="bg-neutral-900">Principiante</option>
                    <option value="Intermediate" className="bg-neutral-900">Intermedio</option>
                    <option value="Advanced" className="bg-neutral-900">Avanzado</option>
                    <option value="Elite" className="bg-neutral-900">Élite</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-neutral-300 block mb-1.5 uppercase">Duración (min)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value) || 30)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Exercises in the custom routine */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-neutral-300 uppercase">Ejercicios de la Rutina ({newExercises.length})</span>
                  <button
                    onClick={handleAddExerciseToForm}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1 border border-cyan-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Ejercicio
                  </button>
                </div>

                <div className="space-y-3">
                  {newExercises.map((ex, idx) => (
                    <div key={ex.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setNewExercises(newExercises.map((item, i) => (i === idx ? { ...item, name } : item)));
                          }}
                          placeholder="Nombre del Ejercicio"
                          className="flex-1 bg-white/5 px-3 py-2 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={() => setNewExercises(newExercises.filter((_, i) => i !== idx))}
                          className="p-2 text-neutral-500 hover:text-red-400 rounded-xl hover:bg-white/5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <input
                          type="text"
                          value={ex.muscleGroup}
                          onChange={(e) => {
                            const muscleGroup = e.target.value as Exercise['muscleGroup'];
                            setNewExercises(newExercises.map((item, i) => (i === idx ? { ...item, muscleGroup } : item)));
                          }}
                          placeholder="Grupo Muscular (Chest, Legs...)"
                          className="bg-white/5 px-3 py-2 rounded-xl border border-white/10 text-white"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 font-mono text-xs">Descanso:</span>
                          <input
                            type="number"
                            value={ex.restSeconds}
                            onChange={(e) => {
                              const restSeconds = parseInt(e.target.value) || 60;
                              setNewExercises(newExercises.map((item, i) => (i === idx ? { ...item, restSeconds } : item)));
                            }}
                            className="w-20 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10 text-white font-mono"
                          />
                          <span className="text-neutral-400 font-mono text-xs">s</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                id="btn-save-custom-routine"
                onClick={handleSaveCustomRoutine}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/25"
              >
                Guardar Rutina (+XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
