import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  Check,
  Dumbbell,
  Activity,
  Flame,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';
import { Exercise } from '../types';
import {
  standardExerciseCatalog,
  ExerciseTemplate,
  templateToExercise
} from '../lib/exerciseDatabase';
import { sound } from '../lib/soundFx';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercises: (exercises: Exercise[]) => void;
  initialCategory?: string;
  title?: string;
  buttonLabel?: string;
  allowMultiSelect?: boolean;
}

export const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectExercises,
  initialCategory = 'all',
  title = 'Seleccionar Ejercicios',
  buttonLabel = 'Añadir al Entrenamiento',
  allowMultiSelect = true,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  
  // Custom Exercise Creation state
  const [customMuscle, setCustomMuscle] = useState<'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio'>('Chest');
  const [customSets, setCustomSets] = useState<number>(3);
  const [customWeight, setCustomWeight] = useState<number>(20);
  const [customReps, setCustomReps] = useState<number>(10);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'Cardio', label: '🏃 Cardio & Running' },
    { id: 'Chest', label: 'Pectoral' },
    { id: 'Back', label: 'Espalda' },
    { id: 'Legs', label: 'Piernas' },
    { id: 'Shoulders', label: 'Hombros' },
    { id: 'Arms', label: 'Brazos' },
    { id: 'Core', label: 'Core / Abdomen' },
  ];

  // Filter exercises based on category and search query
  const filteredTemplates = useMemo(() => {
    return standardExerciseCatalog.filter((tpl) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'Cardio' ? (tpl.muscleGroup === 'Cardio' || tpl.type === 'cardio') : tpl.muscleGroup === selectedCategory);
      const matchesSearch =
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const exactMatchExists = useMemo(() => {
    return standardExerciseCatalog.some(
      (t) => t.name.toLowerCase().trim() === searchQuery.toLowerCase().trim()
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const toggleSelectTemplate = (id: string) => {
    sound.playBeep(650, 30);
    if (!allowMultiSelect) {
      const tpl = standardExerciseCatalog.find((t) => t.id === id);
      if (tpl) {
        onSelectExercises([templateToExercise(tpl)]);
        onClose();
      }
      return;
    }

    if (selectedTemplateIds.includes(id)) {
      setSelectedTemplateIds(selectedTemplateIds.filter((tId) => tId !== id));
    } else {
      setSelectedTemplateIds([...selectedTemplateIds, id]);
    }
  };

  const handleConfirmSelection = () => {
    sound.playLevelUp();
    const selectedExercises = selectedTemplateIds
      .map((id) => standardExerciseCatalog.find((t) => t.id === id))
      .filter((t): t is ExerciseTemplate => !!t)
      .map((t) => templateToExercise(t));

    if (selectedExercises.length > 0) {
      onSelectExercises(selectedExercises);
      onClose();
    }
  };

  // Create & Add Custom Exercise directly
  const handleCreateCustomExercise = () => {
    if (!searchQuery.trim()) return;
    sound.playAchievement();

    const isCardio = customMuscle === 'Cardio' || searchQuery.toLowerCase().includes('carrera') || searchQuery.toLowerCase().includes('running') || searchQuery.toLowerCase().includes('cinta');

    const customExercise: Exercise = {
      id: `custom_ex_${Date.now()}`,
      name: searchQuery.trim(),
      muscleGroup: isCardio ? 'Cardio' : customMuscle,
      equipment: isCardio ? 'None' : 'Barbell',
      type: isCardio ? 'cardio' : 'strength',
      restSeconds: isCardio ? 0 : 90,
      instructions: 'Ejercicio personalizado creado por el atleta.',
      sets: Array.from({ length: customSets }, (_, i) => ({
        id: `s_cust_${Date.now()}_${i + 1}`,
        setNumber: i + 1,
        targetReps: customReps,
        actualReps: customReps,
        targetWeightKg: customWeight,
        actualWeightKg: customWeight,
        completed: false,
      })),
    };

    onSelectExercises([customExercise]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#121214] border border-cyan-500/30 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0 bg-[#121214]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-base sm:text-lg">
                {title}
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">
                Elige de la biblioteca o escribe tu propio ejercicio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Category Filter Strip */}
        <div className="p-4 border-b border-white/5 space-y-3 shrink-0 bg-[#121214]/80">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar ejercicio o escribir nombre nuevo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Horizontal Slider */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                    : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 no-scrollbar">
          
          {/* Option to create new custom exercise if search query is typed */}
          {searchQuery.trim().length > 0 && !exactMatchExists && (
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block">
                    ✨ Ejercicio Nuevo Personalizado
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    "{searchQuery.trim()}"
                  </h4>
                </div>
                <button
                  onClick={handleCreateCustomExercise}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear y Añadir</span>
                </button>
              </div>

              {/* Quick muscle selector for custom */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-neutral-400 font-mono">Grupo Muscular:</span>
                {(['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCustomMuscle(m)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                      customMuscle === m
                        ? 'bg-cyan-500 text-neutral-950 border-cyan-400'
                        : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Standard Exercises */}
          {filteredTemplates.map((tpl) => {
            const isSelected = selectedTemplateIds.includes(tpl.id);
            const isCardio = tpl.muscleGroup === 'Cardio' || tpl.type === 'cardio';

            return (
              <div
                key={tpl.id}
                onClick={() => toggleSelectTemplate(tpl.id)}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white truncate">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-cyan-400 border border-white/5 shrink-0">
                      {tpl.muscleGroup}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 truncate font-mono">
                    {isCardio ? 'Cardio • Distancia (km) & FC' : `${tpl.equipment} • ${tpl.defaultSets} series × ${tpl.defaultReps} reps`}
                  </p>
                </div>

                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                    isSelected
                      ? 'bg-cyan-500 border-cyan-400 text-neutral-950 shadow-md shadow-cyan-500/40'
                      : 'bg-white/5 border-white/10 text-transparent group-hover:border-white/30'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            );
          })}

          {filteredTemplates.length === 0 && !searchQuery.trim() && (
            <div className="p-8 text-center text-neutral-500">
              <p className="text-xs font-mono">No se encontraron ejercicios en esta categoría.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {allowMultiSelect && (
          <div className="p-4 border-t border-white/10 shrink-0 bg-[#121214] flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-neutral-400">
              {selectedTemplateIds.length} ejercicio(s) seleccionado(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-exercise-selection"
                disabled={selectedTemplateIds.length === 0}
                onClick={handleConfirmSelection}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:pointer-events-none text-neutral-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                {buttonLabel} ({selectedTemplateIds.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
