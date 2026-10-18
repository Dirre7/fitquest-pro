import React from 'react';
import { Moon, Sparkles, RefreshCw, Zap, Shield, Heart, Watch, CheckCircle2 } from 'lucide-react';
import { SmartwatchDevice, Language } from '../types';
import { sound } from '../lib/soundFx';

interface SleepTrackerCardProps {
  smartwatch: SmartwatchDevice;
  lang?: Language;
  onSyncRequest?: () => void;
  compact?: boolean;
}

export const SleepTrackerCard: React.FC<SleepTrackerCardProps> = ({
  smartwatch,
  onSyncRequest,
  compact = false,
}) => {
  const isConnected = smartwatch.status === 'connected';
  const totalMinutes = isConnected ? (smartwatch.sleepTotalMinutes || 0) : 0;
  const targetMinutes = smartwatch.sleepTargetMinutes || 480; // 8h target
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const targetHours = Math.floor(targetMinutes / 60);

  const percent = totalMinutes > 0 ? Math.min(100, Math.round((totalMinutes / targetMinutes) * 100)) : 0;

  const stages = (isConnected && smartwatch.sleepStages) ? smartwatch.sleepStages : {
    deepMinutes: 0,
    remMinutes: 0,
    lightMinutes: 0,
    awakeMinutes: 0,
  };

  const deepPct = totalMinutes > 0 ? Math.round((stages.deepMinutes / totalMinutes) * 100) : 0;
  const remPct = totalMinutes > 0 ? Math.round((stages.remMinutes / totalMinutes) * 100) : 0;
  const lightPct = totalMinutes > 0 ? Math.round((stages.lightMinutes / totalMinutes) * 100) : 0;
  const awakePct = totalMinutes > 0 ? Math.round((stages.awakeMinutes / totalMinutes) * 100) : 0;

  const recoveryScore = isConnected ? (smartwatch.recoveryScore || 0) : 0;
  const multiplier = isConnected ? (smartwatch.recoveryXpMultiplier || 1.0) : 1.0;
  const bonusXpPercent = Math.round((multiplier - 1) * 100);

  const formatStageTime = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
  };

  return (
    <div className="bg-[#141417] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden group">
      {/* Cyber ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-indigo-500/15 transition-all" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Moon className="w-4 h-4 fill-indigo-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
                Sueño & Recuperación RPG
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                <Watch className="w-2.5 h-2.5" />
                <span>{smartwatch.brand || 'Smartwatch'}</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              {isConnected ? `Sincronizado: ${smartwatch.lastSyncTime}` : 'Telemetría lista para sincronizar'}
            </p>
          </div>
        </div>

        {onSyncRequest && (
          <button
            type="button"
            onClick={() => {
              sound.playBeep(850, 60);
              onSyncRequest();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
            title="Sincronizar telemetría del reloj ahora"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Stats Row: Sleep Time + Recovery RPG Score */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 relative z-10">
        {/* Left: Total Sleep Hours */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-400 mb-1">
            <span>DURACIÓN TOTAL</span>
            <span className="text-cyan-400">{percent}% de la meta ({targetHours}h)</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-display text-white tracking-tight">
              {hours}<span className="text-lg text-neutral-400 font-sans font-normal">h</span> {minutes}<span className="text-lg text-neutral-400 font-sans font-normal">m</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              +{bonusXpPercent}% XP hoy
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden mt-3 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Right: Recovery Score */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              RECOVERY SCORE RPG
            </span>
            <span className="text-indigo-400">{recoveryScore}/100</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div>
              <span className="text-2xl sm:text-3xl font-black font-display text-white">
                {isConnected && recoveryScore > 0
                  ? (recoveryScore >= 85 ? 'ÓPTIMO' : recoveryScore >= 70 ? 'BUENO' : 'MODERADO')
                  : 'SIN REGISTRO'}
              </span>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                {isConnected && recoveryScore > 0 ? (
                  <>Pulsaciones reposo: <span className="font-mono font-bold text-cyan-400">{smartwatch.restingHeartRate || '--'} bpm</span> • HRV: <span className="font-mono font-bold text-indigo-300">{smartwatch.hrvMs || '--'} ms</span></>
                ) : (
                  <span>Conecta tu reloj para calcular tu recuperación diaria</span>
                )}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-mono font-black text-xs ${
              isConnected && recoveryScore > 0 ? 'border-indigo-500/30 border-t-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-neutral-800 text-neutral-500'
            }`}>
              {isConnected && recoveryScore > 0 ? recoveryScore : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Stages Multi-Color Progress Bar */}
      {!compact && (
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="font-bold uppercase tracking-wider">Fases de Sueño Analizadas</span>
            <span className="text-[10px] text-neutral-500">
              {totalMinutes > 0 ? 'Sincronizado vía sensor del reloj' : 'Requiere sincronización'}
            </span>
          </div>

          {totalMinutes > 0 ? (
            <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-neutral-900 border border-white/5">
              <div
                style={{ width: `${deepPct}%` }}
                className="bg-cyan-400 transition-all"
                title={`Sueño Profundo: ${formatStageTime(stages.deepMinutes)} (${deepPct}%)`}
              />
              <div
                style={{ width: `${remPct}%` }}
                className="bg-purple-500 transition-all"
                title={`Sueño REM: ${formatStageTime(stages.remMinutes)} (${remPct}%)`}
              />
              <div
                style={{ width: `${lightPct}%` }}
                className="bg-blue-600 transition-all"
                title={`Sueño Ligero: ${formatStageTime(stages.lightMinutes)} (${lightPct}%)`}
              />
              <div
                style={{ width: `${awakePct}%` }}
                className="bg-neutral-600 transition-all"
                title={`Despierto: ${formatStageTime(stages.awakeMinutes)} (${awakePct}%)`}
              />
            </div>
          ) : (
            <div className="w-full h-3.5 rounded-full bg-neutral-900/60 border border-white/5 flex items-center justify-center">
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Sin fases analizadas (0h)</span>
            </div>
          )}

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 opacity-80" />
              <span>Profundo: <strong className="text-white">{totalMinutes > 0 ? formatStageTime(stages.deepMinutes) : '--'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 opacity-80" />
              <span>REM: <strong className="text-white">{totalMinutes > 0 ? formatStageTime(stages.remMinutes) : '--'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 opacity-80" />
              <span>Ligero: <strong className="text-white">{totalMinutes > 0 ? formatStageTime(stages.lightMinutes) : '--'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-600 shrink-0 opacity-80" />
              <span>Despierto: <strong className="text-white">{totalMinutes > 0 ? formatStageTime(stages.awakeMinutes) : '--'}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Active Recovery XP Banner */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono relative z-10">
        <div className="flex items-center gap-2 text-cyan-300 font-bold">
          <Zap className={`w-4 h-4 text-cyan-400 ${bonusXpPercent > 0 ? 'fill-cyan-400/20' : 'opacity-40'}`} />
          <span>Multiplicador de Descanso: +{bonusXpPercent}% XP hoy</span>
        </div>
        <span className="text-[10px] text-neutral-400">
          {bonusXpPercent > 0 ? 'Aplicado automáticamente a tus rutinas' : 'Vincula tu smartwatch para activar bonos'}
        </span>
      </div>
    </div>
  );
};
