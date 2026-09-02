import React from 'react';
import { Activity, Flame, Dumbbell, Sparkles, CheckCircle2, ChevronRight, Zap, Target } from 'lucide-react';
import { WorkoutHistoryEntry, Language } from '../types';

interface MuscleHeatmapWidgetProps {
  history: WorkoutHistoryEntry[];
  lang: Language;
  onStartMuscleWorkout?: (muscle: string) => void;
}

export const MuscleHeatmapWidget: React.FC<MuscleHeatmapWidgetProps> = ({
  history = [],
  lang,
  onStartMuscleWorkout,
}) => {
  // Filter history entries from the last 7 days
  const now = new Date();
  const last7DaysEntries = history.filter((h) => {
    const d = new Date(h.date);
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });

  // Calculate volume & sets per muscle group in last 7 days
  const muscleScores: Record<string, { sets: number; volumeKg: number; lastTrainedDaysAgo: number | null }> = {
    Pecho: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null },
    Espalda: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null },
    Hombros: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null },
    Brazos: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null },
    Piernas: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null },
    Core: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null },
    Cardio: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null },
  };

  // Days of current week (Mon-Sun)
  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const weekDaysStatus = dayNames.map((dayLabel, idx) => {
    // Current day of week (0=Sun, 1=Mon, ..., 6=Sat)
    const currentDayOfWeek = (now.getDay() + 6) % 7; // Convert to Mon=0 ... Sun=6
    const diffFromMonday = idx - currentDayOfWeek;
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + diffFromMonday);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const hasWorkout = history.some((h) => h.date.startsWith(targetDateStr));
    const isToday = diffFromMonday === 0;
    const isPast = diffFromMonday <= 0;

    return {
      label: dayLabel,
      dateStr: targetDateStr,
      hasWorkout,
      isToday,
      isPast,
    };
  });

  // Aggregate muscle work
  last7DaysEntries.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const daysAgo = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (entry.exercises && entry.exercises.length > 0) {
      entry.exercises.forEach((ex) => {
        const mg = (ex.muscleGroup || '').toLowerCase();
        let targetGroup = 'Pecho';

        if (mg.includes('chest') || mg.includes('pecho')) targetGroup = 'Pecho';
        else if (mg.includes('back') || mg.includes('espalda') || mg.includes('lats')) targetGroup = 'Espalda';
        else if (mg.includes('shoulder') || mg.includes('hombro') || mg.includes('delt')) targetGroup = 'Hombros';
        else if (mg.includes('arm') || mg.includes('bicep') || mg.includes('tricep') || mg.includes('brazo')) targetGroup = 'Brazos';
        else if (mg.includes('leg') || mg.includes('pierna') || mg.includes('quad') || mg.includes('hamstring') || mg.includes('glute')) targetGroup = 'Piernas';
        else if (mg.includes('core') || mg.includes('ab') || mg.includes('abs')) targetGroup = 'Core';
        else if (mg.includes('cardio') || mg.includes('run') || mg.includes('carrera')) targetGroup = 'Cardio';

        const completedSets = ex.sets ? ex.sets.filter((s) => s.completed).length : 3;
        const setVolume = ex.sets
          ? ex.sets.reduce((sum, s) => sum + (s.actualReps || 0) * (s.actualWeightKg || s.targetWeightKg || 0), 0)
          : (ex.weightKg || 0) * (ex.reps || 0);

        if (muscleScores[targetGroup]) {
          muscleScores[targetGroup].sets += completedSets;
          muscleScores[targetGroup].volumeKg += setVolume;
          if (muscleScores[targetGroup].lastTrainedDaysAgo === null || daysAgo < muscleScores[targetGroup].lastTrainedDaysAgo!) {
            muscleScores[targetGroup].lastTrainedDaysAgo = daysAgo;
          }
        }
      });
    } else {
      // Fallback for general workout entry
      const title = (entry.routineTitle || '').toLowerCase();
      if (title.includes('pecho') || title.includes('push') || title.includes('empuje')) {
        muscleScores['Pecho'].sets += 6;
        muscleScores['Hombros'].sets += 4;
        muscleScores['Brazos'].sets += 4;
      } else if (title.includes('espalda') || title.includes('pull') || title.includes('tirón')) {
        muscleScores['Espalda'].sets += 6;
        muscleScores['Brazos'].sets += 4;
      } else if (title.includes('pierna') || title.includes('leg')) {
        muscleScores['Piernas'].sets += 10;
      } else {
        muscleScores['Pecho'].sets += 3;
        muscleScores['Espalda'].sets += 3;
      }
    }
  });

  const muscleList = [
    { name: 'Pecho', icon: '🏋️', targetSets: 12 },
    { name: 'Espalda', icon: '🛡️', targetSets: 12 },
    { name: 'Piernas', icon: '🦵', targetSets: 14 },
    { name: 'Hombros', icon: '⚡', targetSets: 10 },
    { name: 'Brazos', icon: '💪', targetSets: 10 },
    { name: 'Core', icon: '🎯', targetSets: 8 },
    { name: 'Cardio', icon: '🏃', targetSets: 3 },
  ];

  // Smart advice generator based on recovery & lowest trained group
  const leastTrained = [...muscleList].sort((a, b) => {
    const scoreA = muscleScores[a.name]?.sets || 0;
    const scoreB = muscleScores[b.name]?.sets || 0;
    return scoreA - scoreB;
  })[0];

  return (
    <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header with Weekly Frequency Calendar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              FRECUENCIA MUSCULAR (7 DÍAS)
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              {last7DaysEntries.length} {last7DaysEntries.length === 1 ? 'sesión esta semana' : 'sesiones esta semana'}
            </span>
          </div>
          <h3 className="text-lg font-display font-black text-white mt-1">
            Mapa de Activación & Recuperación
          </h3>
        </div>

        {/* 7-Day Mini Calendar Bubbles */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-white/[0.03] border border-white/5 p-1.5 rounded-2xl">
          {weekDaysStatus.map((day, i) => (
            <div
              key={i}
              className={`w-7 h-8 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all ${
                day.hasWorkout
                  ? 'bg-gradient-to-t from-cyan-500 to-blue-500 text-neutral-950 shadow-md shadow-cyan-500/20 font-black scale-105'
                  : day.isToday
                  ? 'border border-cyan-400 text-cyan-400 bg-cyan-500/10'
                  : 'text-neutral-500 bg-neutral-900/50'
              }`}
              title={day.hasWorkout ? `¡Entrenaste el día ${day.label}!` : `Día ${day.label}`}
            >
              <span>{day.label}</span>
              {day.hasWorkout ? (
                <CheckCircle2 className="w-2.5 h-2.5 fill-current" />
              ) : (
                <span className="w-1 h-1 rounded-full bg-current opacity-40" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7 Muscle Group Activity Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {muscleList.map((m) => {
          const stats = muscleScores[m.name] || { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null };
          const progressPercent = Math.min(100, Math.round((stats.sets / m.targetSets) * 100));
          
          let statusColor = 'text-neutral-400 border-white/5 bg-white/[0.02]';
          let statusText = 'Descansado';
          let badgeColor = 'bg-neutral-800 text-neutral-400';

          if (progressPercent >= 80) {
            statusColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/[0.05]';
            statusText = 'Óptimo';
            badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
          } else if (progressPercent > 0) {
            statusColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/[0.05]';
            statusText = 'Activo';
            badgeColor = 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
          }

          return (
            <div
              key={m.name}
              onClick={() => onStartMuscleWorkout && onStartMuscleWorkout(m.name)}
              className={`p-3 rounded-2xl border transition-all hover:scale-[1.03] cursor-pointer flex flex-col justify-between ${statusColor}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">{m.icon}</span>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full ${badgeColor}`}>
                  {statusText}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-white leading-tight">{m.name}</p>
                <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                  {stats.sets} / {m.targetSets} <span className="text-[8px]">series</span>
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-900 rounded-full h-1.5 mt-2 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent >= 80 ? 'bg-emerald-400' : progressPercent > 0 ? 'bg-cyan-400' : 'bg-neutral-700'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Balance Recommendation */}
      <div className="bg-gradient-to-r from-cyan-950/30 via-[#121214] to-neutral-900 border border-cyan-500/20 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>Sugerencia de Balance Muscular:</span>
              <span className="text-cyan-300 font-mono">¡Entrenar {leastTrained.name} hoy! {leastTrained.icon}</span>
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Tus músculos de {leastTrained.name} están completamente recuperados y listos para maximizar la síntesis proteica.
            </p>
          </div>
        </div>

        {onStartMuscleWorkout && (
          <button
            onClick={() => onStartMuscleWorkout(leastTrained.name)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Entrenar {leastTrained.name}</span>
          </button>
        )}
      </div>
    </div>
  );
};
