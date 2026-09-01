import React, { useState } from 'react';
import {
  Zap,
  Activity,
  Dumbbell,
  Flame,
  ChevronRight,
  X,
  Play,
  Heart,
  Sparkles,
  ArrowRight,
  Shield
} from 'lucide-react';
import { WorkoutRoutine, Exercise, Language } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';
import { ExerciseSelectorModal } from './ExerciseSelectorModal';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  routines: WorkoutRoutine[];
  lang: Language;
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onNavigateCatalog: () => void;
}

export const QuickStartModal: React.FC<QuickStartModalProps> = ({
  isOpen,
  onClose,
  routines,
  lang,
  onStartRoutine,
  onNavigateCatalog,
}) => {
  const [selectorModalOpen, setSelectorModalOpen] = useState<boolean>(false);
  const [selectorCategory, setSelectorCategory] = useState<string>('all');
  const [selectorTitle, setSelectorTitle] = useState<string>('Seleccionar Ejercicios');
  const [selectorMode, setSelectorMode] = useState<'cardio' | 'strength'>('strength');

  if (!isOpen) return null;

  const t = translations[lang];

  // Open Cardio exercise picker
  const handleOpenCardioPicker = () => {
    sound.playBeep(750, 40);
    setSelectorCategory('Cardio');
    setSelectorTitle('Seleccionar Actividad de Cardio / Running');
    setSelectorMode('cardio');
    setSelectorModalOpen(true);
  };

  // Open Gym exercise picker
  const handleOpenGymPicker = () => {
    sound.playBeep(750, 40);
    setSelectorCategory('all');
    setSelectorTitle('Elige tus Ejercicios de Gimnasio');
    setSelectorMode('strength');
    setSelectorModalOpen(true);
  };

  // Callback when exercises are chosen or created
  const handleExercisesSelected = (selectedExercises: Exercise[]) => {
    sound.playLevelUp();
    const isCardio = selectorMode === 'cardio' || selectedExercises.every(e => e.muscleGroup === 'Cardio' || e.type === 'cardio');
    const customRoutine: WorkoutRoutine = {
      id: `custom_${isCardio ? 'cardio' : 'gym'}_${Date.now()}`,
      title: isCardio ? (selectedExercises.length === 1 ? selectedExercises[0].name : 'Sesión de Cardio Libre') : 'Entrenamiento Libre de Gimnasio',
      description: isCardio ? 'Sesión personalizada de cardio con medición de distancia y ritmo.' : 'Sesión personalizada con ejercicios seleccionados por el atleta.',
      category: isCardio ? 'Cardio' : 'Strength',
      difficulty: 'Intermediate',
      durationMinutes: isCardio ? 35 : 50,
      estimatedCalories: isCardio ? 380 : 420,
      xpReward: isCardio ? 260 : 320,
      targetMuscles: Array.from(new Set(selectedExercises.map(e => e.muscleGroup))),
      tags: ['Sesión Personalizada', isCardio ? 'Cardio' : 'Fuerza'],
      isCustom: true,
      exercises: selectedExercises,
    };

    onStartRoutine(customRoutine);
    setSelectorModalOpen(false);
    onClose();
  };

  // Select a preset routine
  const handleSelectRoutine = (routine: WorkoutRoutine) => {
    sound.playLevelUp();
    onStartRoutine(routine);
    onClose();
  };

  return (
    <div 
      style={{ 
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#121214] border border-cyan-500/30 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0 bg-[#121214]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Zap className="w-5 h-5 fill-cyan-400" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-base sm:text-lg">
                Iniciar Entrenamiento
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">
                ¿Qué tipo de sesión vas a realizar hoy?
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {/* Quick Primary Actions: Running vs Gym */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Action 1: Free Running */}
            <button
              id="btn-quick-free-run"
              onClick={handleOpenCardioPicker}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/40 hover:border-purple-400 flex flex-col text-left group transition-all hover:scale-[1.02] shadow-lg shadow-purple-900/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-neutral-950 font-black shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:rotate-6 transition-transform">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  KM & GPS
                </span>
              </div>
              <h4 className="font-display font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                Carrera / Cardio Libre
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Elige correr en cinta, exterior, elíptica, bici o remo con medición en km.
              </p>
            </button>

            {/* Action 2: Free Gym Session */}
            <button
              id="btn-quick-free-gym"
              onClick={handleOpenGymPicker}
              className="p-4 rounded-2xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/40 hover:border-cyan-400 flex flex-col text-left group transition-all hover:scale-[1.02] shadow-lg shadow-cyan-900/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-neutral-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.5)] group-hover:rotate-6 transition-transform">
                  <Dumbbell className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PESAS & REPS
                </span>
              </div>
              <h4 className="font-display font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                Sesión Libre de Gimnasio
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Selecciona de la biblioteca o escribe cualquier ejercicio nuevo al instante.
              </p>
            </button>
          </div>

          {/* Section: Pick from Catalog Routines */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                O Elige una Rutina Diseñada
              </h4>
              <button
                onClick={() => {
                  onNavigateCatalog();
                  onClose();
                }}
                className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Ver Catálogo Completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
              {routines.slice(0, 6).map((routine) => (
                <div
                  key={routine.id}
                  onClick={() => handleSelectRoutine(routine)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors truncate">
                        {routine.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-neutral-800 text-cyan-300 shrink-0">
                        {routine.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      ⏱ {routine.durationMinutes} min • {routine.exercises.length} ejercicios • +{routine.xpReward} XP
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-neutral-950 transition-all shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Link to Full Catalog */}
        <div className="p-3.5 sm:p-4 bg-[#121214] border-t border-white/10 shrink-0 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            ¿Buscas planes multidía (Push-Pull, Runner 10K, Torso-Pierna)?
          </span>
          <button
            onClick={() => {
              onNavigateCatalog();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 font-mono font-bold text-xs flex items-center gap-1.5 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors shrink-0"
          >
            <span>Explorar Planes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Exercise Selector & Custom Creator Modal */}
      <ExerciseSelectorModal
        isOpen={selectorModalOpen}
        onClose={() => setSelectorModalOpen(false)}
        onSelectExercises={handleExercisesSelected}
        initialCategory={selectorCategory}
        title={selectorTitle}
        buttonLabel="Comenzar Entrenamiento"
        allowMultiSelect={true}
      />
    </div>
  );
};
