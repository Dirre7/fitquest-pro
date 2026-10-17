import React, { useState, useEffect } from 'react';
import {
  Watch,
  Flame,
  Clock,
  Heart,
  Zap,
  Trophy,
  X,
  Check,
  Sparkles,
  Calendar,
  Activity,
  FileText,
} from 'lucide-react';
import { WorkoutHistoryEntry } from '../types';
import { sound } from '../lib/soundFx';

export interface SportDefinition {
  id: string;
  name: string;
  icon: string;
  defaultMet: number;
  primaryAttributes: string[];
  supportsDistance?: boolean;
}

export const SPORTS_CATALOG: SportDefinition[] = [
  {
    id: 'tennis',
    name: 'Tenis',
    icon: '🎾',
    defaultMet: 7.5,
    primaryAttributes: ['Agilidad', 'Resistencia', 'Disciplina'],
    supportsDistance: true,
  },
  {
    id: 'padel',
    name: 'Pádel',
    icon: '🎾',
    defaultMet: 7.0,
    primaryAttributes: ['Agilidad', 'Resistencia', 'Disciplina'],
    supportsDistance: true,
  },
  {
    id: 'football',
    name: 'Fútbol / Fútbol 7',
    icon: '⚽',
    defaultMet: 8.2,
    primaryAttributes: ['Resistencia', 'Agilidad', 'Disciplina'],
    supportsDistance: true,
  },
  {
    id: 'basketball',
    name: 'Baloncesto',
    icon: '🏀',
    defaultMet: 7.6,
    primaryAttributes: ['Agilidad', 'Resistencia', 'Fuerza'],
    supportsDistance: true,
  },
  {
    id: 'cycling',
    name: 'Ciclismo / MTB',
    icon: '🚴',
    defaultMet: 7.8,
    primaryAttributes: ['Resistencia', 'Fuerza', 'Disciplina'],
    supportsDistance: true,
  },
  {
    id: 'swimming',
    name: 'Natación',
    icon: '🏊',
    defaultMet: 8.0,
    primaryAttributes: ['Resistencia', 'Fuerza', 'Disciplina'],
    supportsDistance: true,
  },
  {
    id: 'boxing',
    name: 'Boxeo / Artes Marciales',
    icon: '🥊',
    defaultMet: 8.8,
    primaryAttributes: ['Agilidad', 'Fuerza', 'Resistencia'],
  },
  {
    id: 'running',
    name: 'Running / Trail',
    icon: '🏃',
    defaultMet: 9.2,
    primaryAttributes: ['Resistencia', 'Disciplina'],
    supportsDistance: true,
  },
  {
    id: 'hiking',
    name: 'Senderismo / Caminata',
    icon: '🥾',
    defaultMet: 5.5,
    primaryAttributes: ['Resistencia', 'Disciplina'],
    supportsDistance: true,
  },
  {
    id: 'crossfit',
    name: 'Funcional / Cross',
    icon: '⚡',
    defaultMet: 8.5,
    primaryAttributes: ['Fuerza', 'Resistencia', 'Agilidad'],
  },
  {
    id: 'other',
    name: 'Otro Deporte',
    icon: '🏅',
    defaultMet: 7.0,
    primaryAttributes: ['Resistencia', 'Agilidad', 'Disciplina'],
    supportsDistance: true,
  },
];

interface SportActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWeightKg: number;
  onCompleteSportActivity: (entry: WorkoutHistoryEntry, xpEarned: number) => void;
}

export const SportActivityModal: React.FC<SportActivityModalProps> = ({
  isOpen,
  onClose,
  userWeightKg,
  onCompleteSportActivity,
}) => {
  const [selectedSportId, setSelectedSportId] = useState<string>('tennis');
  const [customSportName, setCustomSportName] = useState<string>('');
  const [inputMode, setInputMode] = useState<'watch' | 'auto'>('watch');
  const [intensity, setIntensity] = useState<'light' | 'normal' | 'competitive'>('normal');

  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(550);
  const [avgHeartRate, setAvgHeartRate] = useState<number>(142);
  const [maxHeartRate, setMaxHeartRate] = useState<number>(172);
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [rating, setRating] = useState<number>(5);

  const selectedSport = SPORTS_CATALOG.find((s) => s.id === selectedSportId) || SPORTS_CATALOG[0];
  const effectiveWeight = userWeightKg && userWeightKg > 30 ? userWeightKg : 103.7;

  // Auto-calculate calories when in 'auto' mode or when changing sport/duration in 'auto' mode
  useEffect(() => {
    if (inputMode === 'auto') {
      const intensityMultiplier =
        intensity === 'light' ? 0.8 : intensity === 'competitive' ? 1.22 : 1.0;
      const estimated = Math.round(
        selectedSport.defaultMet * intensityMultiplier * effectiveWeight * (Math.max(1, durationMinutes) / 60)
      );
      setCaloriesBurned(estimated);
    }
  }, [inputMode, selectedSportId, durationMinutes, intensity, effectiveWeight, selectedSport.defaultMet]);

  if (!isOpen) return null;

  // Calculate XP reward dynamically:
  // Base XP from minutes (4 XP/min) + Calorie bonus (0.35 XP/kcal) + Smartwatch HR telemetry bonus (+40 XP)
  const calculatedXp = Math.min(
    1200,
    Math.max(
      80,
      Math.round(
        durationMinutes * 3.8 +
          caloriesBurned * 0.35 +
          (avgHeartRate > 90 ? 40 : 0) +
          (Number(distanceKm) > 0 ? Number(distanceKm) * 12 : 0)
      )
    )
  );

  const quickDurationPresets = [30, 45, 60, 90, 120];
  const quickNoteTags = [
    '🏆 Victoria en partido',
    '🔥 Partido muy intenso',
    '🤝 Partido de dobles',
    '🎯 Entrenamiento técnico',
    '⌚ Registrado con Smartwatch',
  ];

  const handleAddQuickTag = (tag: string) => {
    sound.playBeep(700, 30);
    if (notes.includes(tag)) return;
    setNotes((prev) => (prev.trim() ? `${prev.trim()} • ${tag}` : tag));
  };

  const handleSaveSportSession = () => {
    const validDuration = Math.max(5, Number(durationMinutes) || 60);
    const validCalories = Math.max(20, Number(caloriesBurned) || 350);
    const parsedDistance = Number(distanceKm) > 0 ? Number(Number(distanceKm).toFixed(2)) : undefined;

    const sportDisplayName =
      selectedSport.id === 'other' && customSportName.trim()
        ? customSportName.trim()
        : selectedSport.name;

    // Build ISO date preserving current time if today, or noon on selected past date
    const todayStr = new Date().toISOString().split('T')[0];
    const finalIsoDate =
      activityDate === todayStr
        ? new Date().toISOString()
        : new Date(`${activityDate}T12:00:00`).toISOString();

    const entry: WorkoutHistoryEntry = {
      id: `wh_sport_${selectedSport.id}_${Date.now()}`,
      routineId: `sport_${selectedSport.id}`,
      routineTitle: `${selectedSport.icon} ${sportDisplayName}`,
      date: finalIsoDate,
      durationMinutes: validDuration,
      totalVolumeKg: 0,
      totalDistanceKm: parsedDistance,
      cardioMinutes: validDuration,
      cardioMode: 'general',
      calories: validCalories,
      avgHeartRate: Math.max(60, Number(avgHeartRate) || 135),
      maxHeartRate: Math.max(80, Number(maxHeartRate) || 168),
      xpEarned: calculatedXp,
      completedExercises: 1,
      rating,
      notes: notes.trim() || `Sesión de ${sportDisplayName} registrada (${validDuration} min • ${validCalories} kcal).`,
      isSportActivity: true,
      sportType: selectedSport.id,
      sportIcon: selectedSport.icon,
    };

    sound.playAchievement();
    onCompleteSportActivity(entry, calculatedXp);
    onClose();
  };

  return (
    <div
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#121215] border border-emerald-500/40 rounded-3xl max-w-2xl w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col max-h-[92vh] animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-emerald-950/50 via-[#121215] to-cyan-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {selectedSport.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-white text-base sm:text-lg">
                  Registrar Deporte / Reloj
                </h3>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  +{calculatedXp} XP
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Introduce el tiempo y las Kcal de tu smartwatch para sumar XP, logros y balance calórico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar">
          {/* 1. Sport Picker Grid */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
              1. Elige el Deporte Realizado
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {SPORTS_CATALOG.map((sport) => {
                const isSelected = sport.id === selectedSportId;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => {
                      sound.playBeep(680, 30);
                      setSelectedSportId(sport.id);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-[1.02]'
                        : 'bg-neutral-900/80 border-white/10 text-neutral-300 hover:border-white/25 hover:bg-neutral-800/60'
                    }`}
                  >
                    <span className="text-xl shrink-0">{sport.icon}</span>
                    <span className="text-xs font-bold leading-tight truncate">{sport.name}</span>
                  </button>
                );
              })}
            </div>

            {selectedSportId === 'other' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customSportName}
                  onChange={(e) => setCustomSportName(e.target.value)}
                  placeholder="Escribe el nombre del deporte (ej. Squash, Escalada, Remo, Golf...)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-emerald-500/40 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}
          </div>

          {/* 2. Mode Switcher: Smartwatch Exact vs Auto Calculate */}
          <div className="bg-neutral-900/90 border border-white/10 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setInputMode('watch')}
              className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                inputMode === 'watch'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Watch className="w-4 h-4" />
              <span>⌚ Datos de mi Reloj</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('auto')}
              className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                inputMode === 'auto'
                  ? 'bg-cyan-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>🔥 Estimar por Intensidad</span>
            </button>
          </div>

          {/* 3. Main Metrics: Duration & Calories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration Box */}
            <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Duración (Minutos)
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={600}
                  value={durationMinutes}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-cyan-500/40 text-2xl font-display font-black text-white text-center focus:outline-none focus:border-cyan-400"
                />
                <span className="text-xs font-mono font-bold text-neutral-400 shrink-0">MIN</span>
              </div>

              {/* Quick Duration Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {quickDurationPresets.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`flex-1 py-1 px-2 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                      durationMinutes === mins
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-neutral-950 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Calories Burned Box */}
            <div className="bg-neutral-900/70 border border-orange-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-orange-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> Calorías Quemadas
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                  {inputMode === 'watch' ? '⌚ Exacto Reloj' : `Auto (${effectiveWeight}kg)`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={10}
                  max={5000}
                  value={caloriesBurned}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setCaloriesBurned(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-orange-500/40 text-2xl font-display font-black text-orange-400 text-center focus:outline-none focus:border-orange-400"
                />
                <span className="text-xs font-mono font-bold text-neutral-400 shrink-0">KCAL</span>
              </div>

              {inputMode === 'auto' ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'light', label: 'Suave' },
                      { id: 'normal', label: 'Partido' },
                      { id: 'competitive', label: 'Intenso' },
                    ] as const
                  ).map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setIntensity(lvl.id)}
                      className={`py-1 px-2 rounded-lg font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                        intensity === lvl.id
                          ? 'bg-orange-500/20 border-orange-400 text-orange-300'
                          : 'bg-neutral-950 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Escribe las Kcal activas o totales que te marca el reloj al terminar.
                </p>
              )}
            </div>
          </div>

          {/* 4. Optional Smartwatch Telemetry (Heart Rate, Distance, Date) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-900/50 border border-white/5 rounded-2xl p-3.5">
            <div>
              <label className="block text-[10px] font-mono uppercase text-rose-400 mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3" /> PPM Medias
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={avgHeartRate}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAvgHeartRate(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-sm font-mono font-bold text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-rose-300 mb-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> PPM Máximas
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={maxHeartRate}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setMaxHeartRate(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-sm font-mono font-bold text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-purple-300 mb-1">
                Distancia (Km opc.)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="Ej. 4.2"
                value={distanceKm}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-cyan-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Fecha
              </label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* 5. Match Result / Notes */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Resultado del Partido / Sensaciones (Opcional)
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {quickNoteTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddQuickTag(tag)}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-white/5 hover:bg-emerald-500/15 text-neutral-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Ej: Partido de ${selectedSport.name} (6-4, 6-3), muy buenas sensaciones de piernas...`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* 6. Gamification & Nutrition Live Impact Preview */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-cyan-950/50 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-display font-black text-white uppercase tracking-wide">
                  Recompensas & Sincronización Automática
                </span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Suma <strong className="text-orange-400">+{caloriesBurned} kcal</strong> a tu gasto de hoy, activa{' '}
                <strong className="text-cyan-300">Día de Entreno (2,300 kcal)</strong> en Nutrición y desbloquea progreso en{' '}
                <strong className="text-emerald-300">Logros Deportivos</strong>.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              {selectedSport.primaryAttributes.map((attr) => (
                <span
                  key={attr}
                  className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                >
                  ↑ {attr}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#121215] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            id="btn-save-sport-activity"
            type="button"
            onClick={handleSaveSportSession}
            className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-neutral-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              Guardar {selectedSport.icon} {selectedSport.id === 'other' && customSportName.trim() ? customSportName.trim() : selectedSport.name} (+{calculatedXp} XP)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
