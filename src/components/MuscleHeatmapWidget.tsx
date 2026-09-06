import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Dumbbell,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Zap,
  Target,
  Clock,
  Info,
  X,
  Layers,
  Calendar,
} from 'lucide-react';
import { WorkoutHistoryEntry, Language, Exercise } from '../types';
import { FitStorage } from '../lib/storage';
import { defaultRoutines } from '../lib/initialData';

interface MuscleHeatmapWidgetProps {
  history: WorkoutHistoryEntry[];
  lang: Language;
  onStartMuscleWorkout?: (muscle: string) => void;
}

type Timeframe = '7d' | '30d' | 'all';

export const MuscleHeatmapWidget: React.FC<MuscleHeatmapWidgetProps> = ({
  history = [],
  lang,
  onStartMuscleWorkout,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [selectedMuscleModal, setSelectedMuscleModal] = useState<string | null>(null);

  const now = new Date();

  // Filter history entries by selected timeframe
  const filteredEntries = history.filter((h) => {
    if (timeframe === 'all') return true;
    const d = new Date(h.date);
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (timeframe === '7d') return diffDays <= 7;
    if (timeframe === '30d') return diffDays <= 30;
    return true;
  });

  // Calculate volume & sets per muscle group
  const muscleScores: Record<
    string,
    {
      sets: number;
      volumeKg: number;
      lastTrainedDaysAgo: number | null;
      exercisesDone: { name: string; sets: number; volumeKg: number }[];
    }
  > = {
    Pecho: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null, exercisesDone: [] },
    Espalda: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null, exercisesDone: [] },
    Hombros: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null, exercisesDone: [] },
    Brazos: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null, exercisesDone: [] },
    Piernas: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null, exercisesDone: [] },
    Core: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null, exercisesDone: [] },
    Cardio: { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null, exercisesDone: [] },
  };

  // Days of current week (Mon-Sun)
  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const weekDaysStatus = dayNames.map((dayLabel, idx) => {
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

  // Get catalog routines for automatic historical reconstruction
  const allRoutines = [...defaultRoutines, ...FitStorage.getRoutines()];

  // Helper to map muscle group string to normalized target group
  const mapMuscleGroup = (mgName: string): string => {
    const mg = (mgName || '').toLowerCase();
    if (mg.includes('chest') || mg.includes('pecho') || mg.includes('pectoral')) return 'Pecho';
    if (mg.includes('back') || mg.includes('espalda') || mg.includes('lats') || mg.includes('dorsal')) return 'Espalda';
    if (mg.includes('shoulder') || mg.includes('hombro') || mg.includes('delt')) return 'Hombros';
    if (mg.includes('arm') || mg.includes('bicep') || mg.includes('tricep') || mg.includes('brazo')) return 'Brazos';
    if (mg.includes('leg') || mg.includes('pierna') || mg.includes('quad') || mg.includes('hamstring') || mg.includes('glute') || mg.includes('femoral') || mg.includes('gemelo')) return 'Piernas';
    if (mg.includes('core') || mg.includes('ab') || mg.includes('abs') || mg.includes('abdomen')) return 'Core';
    if (mg.includes('cardio') || mg.includes('run') || mg.includes('carrera') || mg.includes('walk') || mg.includes('caminata') || mg.includes('cinta')) return 'Cardio';
    return 'Pecho';
  };

  // Helper to add exercise to muscleScores
  const registerExerciseToMuscle = (
    targetGroup: string,
    exName: string,
    completedSets: number,
    setVolume: number,
    daysAgo: number
  ) => {
    if (!muscleScores[targetGroup]) return;

    muscleScores[targetGroup].sets += completedSets;
    muscleScores[targetGroup].volumeKg += setVolume;

    if (muscleScores[targetGroup].lastTrainedDaysAgo === null || daysAgo < muscleScores[targetGroup].lastTrainedDaysAgo!) {
      muscleScores[targetGroup].lastTrainedDaysAgo = daysAgo;
    }

    const existing = muscleScores[targetGroup].exercisesDone.find((e) => e.name.toLowerCase() === exName.toLowerCase());
    if (existing) {
      existing.sets += completedSets;
      existing.volumeKg += setVolume;
    } else {
      muscleScores[targetGroup].exercisesDone.push({
        name: exName,
        sets: completedSets,
        volumeKg: setVolume,
      });
    }
  };

  // Aggregate muscle work across all filtered entries
  filteredEntries.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const daysAgo = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    // Case 1: Entry has explicit exercises array
    if (entry.exercises && entry.exercises.length > 0) {
      entry.exercises.forEach((ex) => {
        const targetGroup = mapMuscleGroup(ex.muscleGroup || '');
        const completedSets = ex.sets
          ? ex.sets.filter((s) => s.completed || (s.actualReps && s.actualReps > 0)).length || ex.sets.length
          : 3;
        
        let setVolume = 0;
        if (ex.sets && ex.sets.length > 0) {
          setVolume = ex.sets.reduce((sum, s) => sum + (s.actualReps || 0) * (s.actualWeightKg || s.targetWeightKg || 0), 0);
        }
        if (setVolume === 0 && entry.totalVolumeKg > 0 && entry.exercises) {
          setVolume = Math.round(entry.totalVolumeKg / entry.exercises.length);
        }

        registerExerciseToMuscle(targetGroup, ex.name, completedSets, setVolume, daysAgo);
      });
    } 
    // Case 2: Historical entry without explicit exercises: Reconstruct from catalog
    else {
      const routineTitle = (entry.routineTitle || '').trim().toLowerCase();
      const matchedRoutine = allRoutines.find(
        (r) => r.id === entry.routineId || r.title.toLowerCase() === routineTitle || routineTitle.includes(r.title.toLowerCase())
      );

      if (matchedRoutine && matchedRoutine.exercises && matchedRoutine.exercises.length > 0) {
        const totalExs = matchedRoutine.exercises.length;
        const volumePerEx = entry.totalVolumeKg > 0 ? Math.round(entry.totalVolumeKg / totalExs) : 0;

        matchedRoutine.exercises.forEach((ex) => {
          const targetGroup = mapMuscleGroup(ex.muscleGroup || '');
          const setsCount = ex.sets ? ex.sets.length : 3;
          registerExerciseToMuscle(targetGroup, ex.name, setsCount, volumePerEx, daysAgo);
        });
      } else {
        // Fallback reconstruction by routine title heuristics
        const title = routineTitle;
        const totalVol = entry.totalVolumeKg || 0;

        if (title.includes('pecho') && title.includes('espalda')) {
          registerExerciseToMuscle('Pecho', 'Press de Banca Plano', 4, Math.round(totalVol * 0.3), daysAgo);
          registerExerciseToMuscle('Pecho', 'Press Inclinado con Mancuernas', 3, Math.round(totalVol * 0.2), daysAgo);
          registerExerciseToMuscle('Espalda', 'Remo con Barra', 4, Math.round(totalVol * 0.3), daysAgo);
          registerExerciseToMuscle('Espalda', 'Jalón al Pecho', 3, Math.round(totalVol * 0.2), daysAgo);
        } else if (title.includes('torso')) {
          registerExerciseToMuscle('Pecho', 'Press de Banca Pesado', 4, Math.round(totalVol * 0.35), daysAgo);
          registerExerciseToMuscle('Espalda', 'Remo Pendlay con Barra', 4, Math.round(totalVol * 0.35), daysAgo);
          registerExerciseToMuscle('Hombros', 'Press Militar Overhead', 3, Math.round(totalVol * 0.15), daysAgo);
          registerExerciseToMuscle('Brazos', 'Fondos / Tríceps', 3, Math.round(totalVol * 0.15), daysAgo);
        } else if (title.includes('powerlifting') || title.includes('fuerza')) {
          registerExerciseToMuscle('Pecho', 'Press de Banca Competición', 5, Math.round(totalVol * 0.35), daysAgo);
          registerExerciseToMuscle('Piernas', 'Sentadilla Trasera con Barra', 5, Math.round(totalVol * 0.35), daysAgo);
          registerExerciseToMuscle('Espalda', 'Peso Muerto Convencional', 4, Math.round(totalVol * 0.30), daysAgo);
        } else if (title.includes('pierna') || title.includes('leg') || title.includes('glúteo')) {
          registerExerciseToMuscle('Piernas', 'Sentadilla Hack / Prensa', 4, Math.round(totalVol * 0.4), daysAgo);
          registerExerciseToMuscle('Piernas', 'Peso Muerto Rumano', 3, Math.round(totalVol * 0.3), daysAgo);
          registerExerciseToMuscle('Piernas', 'Extensiones & Curl Femoral', 4, Math.round(totalVol * 0.3), daysAgo);
        } else if (title.includes('caminata') || title.includes('carrera') || title.includes('cardio')) {
          registerExerciseToMuscle('Cardio', title.includes('caminata') ? 'Caminata / Andar al Aire Libre' : 'Carrera Continua', 1, 0, daysAgo);
        } else {
          registerExerciseToMuscle('Pecho', 'Press de Banca General', 3, Math.round(totalVol * 0.5), daysAgo);
          registerExerciseToMuscle('Espalda', 'Remo con Mancuerna', 3, Math.round(totalVol * 0.5), daysAgo);
        }
      }
    }
  });

  const muscleList = [
    { name: 'Pecho', icon: '🏋️', targetSets7d: 12, recoveryHours: 48 },
    { name: 'Espalda', icon: '🛡️', targetSets7d: 12, recoveryHours: 48 },
    { name: 'Piernas', icon: '🦵', targetSets7d: 14, recoveryHours: 72 },
    { name: 'Hombros', icon: '⚡', targetSets7d: 10, recoveryHours: 48 },
    { name: 'Brazos', icon: '💪', targetSets7d: 10, recoveryHours: 36 },
    { name: 'Core', icon: '🎯', targetSets7d: 8, recoveryHours: 24 },
    { name: 'Cardio', icon: '🏃', targetSets7d: 3, recoveryHours: 24 },
  ];

  // Smart advice generator based on recovery & lowest trained group
  const leastTrained = [...muscleList].sort((a, b) => {
    const scoreA = muscleScores[a.name]?.sets || 0;
    const scoreB = muscleScores[b.name]?.sets || 0;
    return scoreA - scoreB;
  })[0];

  const selectedMuscleData = selectedMuscleModal ? muscleList.find((m) => m.name === selectedMuscleModal) : null;
  const selectedMuscleStats = selectedMuscleModal ? muscleScores[selectedMuscleModal] : null;

  return (
    <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header with Title, Timeframe Filter & Frequency Calendar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Activity className="w-3 h-3" /> FRECUENCIA &amp; BALANCE MUSCULAR
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'sesión registrada' : 'sesiones registradas'}
            </span>
          </div>
          <h3 className="text-xl font-display font-black text-white mt-1">
            Mapa de Activación &amp; Recuperación
          </h3>
        </div>

        {/* Timeframe selector + Weekly Mini Calendar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Filter Pills */}
          <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-2xl">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                timeframe === '7d' ? 'bg-cyan-500 text-neutral-950 font-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                timeframe === '30d' ? 'bg-cyan-500 text-neutral-950 font-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              30 Días
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                timeframe === 'all' ? 'bg-cyan-500 text-neutral-950 font-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todo
            </button>
          </div>

          {/* 7-Day Mini Calendar Bubbles */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 p-1.5 rounded-2xl">
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
      </div>

      {/* 7 Muscle Group Activity Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {muscleList.map((m) => {
          const stats = muscleScores[m.name] || { sets: 0, volumeKg: 0, lastTrainedDaysAgo: null, exercisesDone: [] };
          const multiplier = timeframe === '30d' ? 4 : timeframe === 'all' ? 10 : 1;
          const target = m.targetSets7d * multiplier;
          const progressPercent = Math.min(100, Math.round((stats.sets / target) * 100));

          let statusColor = 'border-white/5 bg-white/[0.02] hover:border-white/20';
          let statusText = 'Descansado';
          let badgeColor = 'bg-neutral-800 text-neutral-400 border-neutral-700';
          let barColor = 'bg-neutral-600';

          if (progressPercent >= 80) {
            statusColor = 'border-emerald-500/30 bg-emerald-500/[0.05] hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
            statusText = 'Óptimo';
            badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            barColor = 'bg-gradient-to-r from-emerald-400 to-teal-400';
          } else if (progressPercent > 0) {
            statusColor = 'border-cyan-500/30 bg-cyan-500/[0.05] hover:border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.1)]';
            statusText = 'Activo';
            badgeColor = 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
            barColor = 'bg-gradient-to-r from-cyan-400 to-blue-500';
          }

          return (
            <div
              key={m.name}
              onClick={() => setSelectedMuscleModal(m.name)}
              className={`p-3.5 rounded-2xl border transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer flex flex-col justify-between group ${statusColor}`}
              title="Haz clic para ver el desglose completo de ejercicios y recuperación"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{m.icon}</span>
                  <span className={`text-[8px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {statusText}
                  </span>
                </div>

                <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                  {m.name}
                </h4>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                  <span className="text-white font-extrabold">{stats.sets}</span> / {target} series
                </p>
              </div>

              <div className="mt-3">
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 mt-1">
                  <span>{progressPercent}%</span>
                  <span>{stats.volumeKg >= 1000 ? `${(stats.volumeKg / 1000).toFixed(1)}t` : `${Math.round(stats.volumeKg)}kg`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Balance Recommendation Banner */}
      {leastTrained && (
        <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-transparent border border-cyan-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Sugerencia de Balance: <span className="text-cyan-400">¡Entrenar {leastTrained.name} hoy! {leastTrained.icon}</span>
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {leastTrained.name === 'Cardio'
                  ? 'Una sesión de cardio o caminata mantendrá activo tu gasto metabólico y VO2 Max.'
                  : `Tus músculos de ${leastTrained.name} están completamente recuperados (~${leastTrained.recoveryHours}h) y listos para maximizar la síntesis proteica.`}
              </p>
            </div>
          </div>

          {onStartMuscleWorkout && (
            <button
              onClick={() => onStartMuscleWorkout(leastTrained.name)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Entrenar {leastTrained.name}</span>
            </button>
          )}
        </div>
      )}

      {/* Drill-down Modal for Specific Muscle Inspection */}
      {selectedMuscleModal && selectedMuscleData && selectedMuscleStats && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#121214] border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-5 animate-in zoom-in-95">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedMuscleData.icon}</span>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white">
                    {selectedMuscleData.name}
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    Tiempo de recuperación estimado: ~{selectedMuscleData.recoveryHours} horas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMuscleModal(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Series Acumuladas</span>
                <p className="text-xl font-mono font-black text-cyan-400 mt-0.5">{selectedMuscleStats.sets} series</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Tonelaje Total</span>
                <p className="text-xl font-mono font-black text-emerald-400 mt-0.5">
                  {selectedMuscleStats.volumeKg >= 1000
                    ? `${(selectedMuscleStats.volumeKg / 1000).toFixed(1)} ton`
                    : `${Math.round(selectedMuscleStats.volumeKg)} kg`}
                </p>
              </div>
            </div>

            {/* Exercises List Done for this Muscle */}
            <div className="relative z-10 space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                Ejercicios realizados ({selectedMuscleStats.exercisesDone.length})
              </h4>
              {selectedMuscleStats.exercisesDone.length > 0 ? (
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {selectedMuscleStats.exercisesDone.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white/5 border border-white/5 hover:border-cyan-500/30 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-neutral-200 truncate">{ex.name}</p>
                        <p className="text-[10px] font-mono text-neutral-400">{ex.sets} series completadas</p>
                      </div>
                      <span className="font-mono text-cyan-400 font-bold shrink-0">
                        {ex.volumeKg > 0 ? `${Math.round(ex.volumeKg)} kg` : `${ex.sets} series`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 italic py-2">
                  No se registran ejercicios para este músculo en el periodo seleccionado.
                </p>
              )}
            </div>

            {/* CTA to start workout */}
            <div className="pt-2 border-t border-white/5 relative z-10 flex gap-2">
              <button
                onClick={() => {
                  setSelectedMuscleModal(null);
                  if (onStartMuscleWorkout) onStartMuscleWorkout(selectedMuscleData.name);
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Explorar Rutinas de {selectedMuscleData.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
