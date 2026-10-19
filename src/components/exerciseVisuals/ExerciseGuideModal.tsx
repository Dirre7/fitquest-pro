import React from 'react';
import { X, CheckCircle2, AlertTriangle, Dumbbell, Sparkles } from 'lucide-react';
import { Exercise } from '../../types';
import { getExerciseVisualGuide } from './ExerciseGuideData';

interface ExerciseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({
  isOpen,
  onClose,
  exercise,
}) => {
  if (!isOpen) return null;

  const guide = getExerciseVisualGuide(exercise.name, exercise.muscleGroup);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#121214] border border-cyan-500/30 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider">
                {guide.category}
              </span>
              <h3 className="font-display font-black text-base sm:text-lg text-white truncate">
                {exercise.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          
          {/* Main Visual: Transparent Model in Athletic Dark Stage */}
          <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-neutral-900/90 to-black/90 border border-white/10 flex items-center justify-center overflow-hidden p-2">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
            
            {/* The transparent graphic */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {guide.renderGraphic('max-h-full max-w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]')}
            </div>

            {/* Muscle Group Badges overlay */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-20">
              {guide.primaryMuscles.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold backdrop-blur-sm"
                >
                  🎯 {m}
                </span>
              ))}
            </div>

            <div className="absolute top-2.5 right-2.5 z-20">
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-neutral-400 border border-white/10 text-[10px] font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Biomecánica 3D
              </span>
            </div>
          </div>

          {/* Exercise Specific Description / Instruction */}
          {exercise.instructions && (
            <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wide">
                Instrucción Clave
              </span>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
                {exercise.instructions}
              </p>
            </div>
          )}

          {/* Technique Cues (Claves de Ejecución) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-black uppercase text-neutral-300 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Técnica & Puntos Clave
            </h4>
            <div className="space-y-2">
              {guide.cues.map((cue, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 bg-neutral-900/50 border border-white/5 rounded-xl p-2.5 text-xs text-neutral-300"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{cue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes to Avoid */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-black uppercase text-neutral-300 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Errores Comunes a Evitar
            </h4>
            <div className="space-y-2">
              {guide.commonMistakes.map((mistake, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl p-2.5 text-xs text-neutral-300"
                >
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    ✕
                  </span>
                  <span className="leading-snug">{mistake}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-neutral-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-black text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            Entendido, volver al entreno
          </button>
        </div>
      </div>
    </div>
  );
};
