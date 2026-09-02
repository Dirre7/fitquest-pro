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

  React.useEffect(() => {
    if (totalSets > 0 && completedSets >= totalSets) {
      onDiscard();
    }
  }, [completedSets, totalSets, onDiscard]);

  if (totalSets > 0 && completedSets >= totalSets) {
    return null;
  }

  return (
    <div 
      style={{ bottom: 'max(5.75rem, calc(5.25rem + env(safe-area-inset-bottom, 0px)))' }}
      className="fixed left-1/2 -translate-x-1/2 z-40 w-[94%] xs:w-[92%] sm:w-auto max-w-lg pointer-events-auto animate-in slide-in-from-bottom-5 duration-300"
    >
      <div 
        onClick={onMaximize}
        className="bg-[#121214]/98 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl sm:rounded-full p-2.5 sm:px-4 sm:py-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.3)] flex items-center justify-between gap-3 cursor-pointer hover:border-cyan-400 group transition-all ring-1 ring-cyan-500/20"
      >
        {/* Left: Indicator & Routine Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Timer className="w-4 h-4 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[200px] group-hover:text-cyan-300 transition-colors">
                {session.routineTitle}
              </h4>
            </div>
            <p className="text-[10px] font-mono text-neutral-400">
              <span className="text-cyan-400 font-bold">{formatTime(session.elapsedSeconds)}</span> • {completedSets}/{totalSets} series completadas
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            id="btn-minibar-maximize"
            onClick={onMaximize}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-bold text-[11px] flex items-center gap-1 shadow-md transition-all hover:scale-105"
          >
            <span>Continuar</span>
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
