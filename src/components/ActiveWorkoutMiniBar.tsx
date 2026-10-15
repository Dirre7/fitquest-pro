import React from 'react';
import { Play, Pause, ChevronUp, Timer, Dumbbell, X } from 'lucide-react';
import { ActiveWorkoutState } from '../types';
import { sound } from '../lib/soundFx';

interface ActiveWorkoutMiniBarProps {
  session: ActiveWorkoutState;
  onMaximize: () => void;
  onDiscard: () => void;
}

export const ActiveWorkoutMiniBar: React.FC<ActiveWorkoutMiniBarProps> = ({
  session,
  onMaximize,
  onDiscard,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const totalSets = (session?.exercises || []).reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = (session?.exercises || []).reduce(
    (acc, ex) => acc + (ex.sets || []).filter((s) => s.completed).length,
    0
  );

  const isAllCompleted = totalSets > 0 && completedSets >= totalSets;

  return (
    <div 
      style={{ bottom: 'max(5.75rem, calc(5.25rem + env(safe-area-inset-bottom, 0px)))' }}
      className="fixed left-1/2 -translate-x-1/2 z-40 w-[94%] xs:w-[92%] sm:w-auto max-w-lg pointer-events-auto animate-in slide-in-from-bottom-5 duration-300"
    >
      <div 
        onClick={onMaximize}
        className={`backdrop-blur-2xl rounded-2xl sm:rounded-full p-2.5 sm:px-4 sm:py-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3 cursor-pointer group transition-all ring-1 ${
          isAllCompleted
            ? 'bg-gradient-to-r from-emerald-950/95 via-neutral-900 to-cyan-950/95 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] ring-emerald-500/40 animate-pulse'
            : 'bg-[#121214]/98 border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:border-cyan-400 ring-cyan-500/20'
        }`}
      >
        {/* Left: Indicator & Routine Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isAllCompleted
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
              : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
          }`}>
            <Timer className="w-4 h-4 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full inline-block ${isAllCompleted ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400 animate-ping'}`} />
              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[200px] group-hover:text-cyan-300 transition-colors">
                {session.routineTitle}
              </h4>
              {isAllCompleted && (
                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  ¡Listo!
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-neutral-400">
              <span className={isAllCompleted ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>{formatTime(session.elapsedSeconds)}</span> • {completedSets}/{totalSets} series completadas
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            id="btn-minibar-maximize"
            onClick={onMaximize}
            className={`px-3 py-1.5 rounded-xl font-mono font-bold text-[11px] flex items-center gap-1 shadow-md transition-all hover:scale-105 ${
              isAllCompleted
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-neutral-950 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950'
            }`}
          >
            <span>{isAllCompleted ? 'Finalizar' : 'Continuar'}</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-minibar-discard"
            onClick={onDiscard}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
            title="Descartar sesión activa"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
