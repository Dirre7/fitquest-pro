import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  Dumbbell,
  Calendar,
  Zap,
  Activity,
  Watch,
  RotateCw,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CommunityChallenge, Language, WorkoutHistoryEntry, UserProfile } from '../types';
import { sound } from '../lib/soundFx';
import {
  getWeeklyChallengesForRotation,
  WEEKLY_ROTATIONS_META,
  WeeklyChallengeItem,
} from '../lib/weeklyChallengesEngine';

interface WeeklyChallengesViewProps {
  challenges: CommunityChallenge[];
  user?: UserProfile;
  history?: WorkoutHistoryEntry[];
  lang: Language;
  onJoinChallenge?: (challengeId: string) => void;
  onContribute?: (challengeId: string, amount: number) => void;
  onClaimReward: (challengeId: string, rewardXp: number) => void;
}

export const WeeklyChallengesView: React.FC<WeeklyChallengesViewProps> = ({
  user,
  history = [],
  onClaimReward,
}) => {
  // Calculate days/hours left until Sunday 23:59:59
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number }>({
    days: 6,
    hours: 12,
    mins: 30,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const day = now.getDay(); // 0 is Sunday
      const daysUntilSunday = day === 0 ? 0 : 7 - day;
      const targetSunday = new Date(now);
      targetSunday.setDate(now.getDate() + daysUntilSunday);
      targetSunday.setHours(23, 59, 59, 999);

      const diffMs = Math.max(0, targetSunday.getTime() - now.getTime());
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, mins });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute current active week info & allow previewing any of the 4 weekly rotations
  const currentRotationData = getWeeklyChallengesForRotation(history);
  const activeRotationIndex = currentRotationData.weekInfo.activeRotationIndex;

  const [selectedRotationIndex, setSelectedRotationIndex] = useState<number>(activeRotationIndex);

  const displayedData = getWeeklyChallengesForRotation(history, selectedRotationIndex);
  const { weekInfo, rotationMeta, challenges: activeChallenges, metrics } = displayedData;
  const isViewingActiveWeek = selectedRotationIndex === activeRotationIndex;

  // Reactive State for claimed challenges directly from user profile
  const [claimedList, setClaimedList] = useState<string[]>(() => user?.claimedChallenges || []);

  // Sync whenever user.claimedChallenges updates (e.g. from cloud sync or reset)
  useEffect(() => {
    setClaimedList(user?.claimedChallenges || []);
  }, [user?.claimedChallenges]);

  const handleClaim = (ch: WeeklyChallengeItem) => {
    if (!isViewingActiveWeek) return;
    if (claimedList.includes(ch.claimId) || claimedList.includes(ch.id)) return;

    sound.playLevelUp();
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch {}

    const updated = [...claimedList, ch.claimId];
    setClaimedList(updated);
    try {
      localStorage.setItem('fitquest_claimed_challenges', JSON.stringify(updated));
    } catch {}
    onClaimReward(ch.claimId, ch.rewardXp);
  };

  const renderChallengeIcon = (iconName: WeeklyChallengeItem['iconName']) => {
    switch (iconName) {
      case 'dumbbell':
        return Dumbbell;
      case 'flame':
        return Flame;
      case 'calendar':
        return Calendar;
      case 'clock':
        return Clock;
      case 'watch':
        return Watch;
      case 'zap':
      default:
        return Zap;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with real-time Sunday timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              ⚔️ ROTACIÓN SEMANAL ({rotationMeta.badge})
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
              📅 Semana Actual: {weekInfo.weekDateRangeLabel}
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1.5">
            {rotationMeta.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {rotationMeta.subtitle} Los retos rotan automáticamente cada lunes a las 00:00.
          </p>
        </div>

        {/* Global Timer Badge */}
        <div className="bg-[#121214] border border-cyan-500/30 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg shrink-0">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
              Próxima Rotación de Retos:
            </span>
            <span className="text-xs font-mono font-black text-cyan-300">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m restantes
            </span>
          </div>
        </div>
      </div>

      {/* 4-Week Cycle Selector Tabs */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-300">
            <RotateCw className="w-4 h-4 text-cyan-400" />
            <span>CICLO DE 4 SEMANAS DE RETOS (CAMBIA CADA LUNES)</span>
          </div>
          {!isViewingActiveWeek && (
            <button
              type="button"
              onClick={() => setSelectedRotationIndex(activeRotationIndex)}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Volver a la Semana Activa (Semana {activeRotationIndex + 1})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {WEEKLY_ROTATIONS_META.map((meta, idx) => {
            const isActiveWeek = idx === activeRotationIndex;
            const isSelected = idx === selectedRotationIndex;
            return (
              <button
                key={meta.weekNumber}
                type="button"
                onClick={() => setSelectedRotationIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-black uppercase text-cyan-400">
                    Semana {meta.weekNumber}
                  </span>
                  {isActiveWeek ? (
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950">
                      ACTIVA
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-neutral-500">Vista previa</span>
                  )}
                </div>
                <p className="text-xs font-bold text-white truncate">
                  {meta.title.replace(/^Semana \d:\s*/, '')}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live Telemetry Summary of Current Week (Monday -> Sunday) */}
        <div className="pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono">
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5">
            <span className="text-[10px] text-neutral-400 uppercase block">Días Únicos (Sem.)</span>
            <span className="text-base font-black text-emerald-400">
              {metrics.weeklyUniqueDaysCount} {metrics.weeklyUniqueDaysCount === 1 ? 'día' : 'días'}
            </span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5">
            <span className="text-[10px] text-neutral-400 uppercase block">Sesiones Totales</span>
            <span className="text-base font-black text-white">{metrics.weeklyWorkoutsCount}</span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5">
            <span className="text-[10px] text-neutral-400 uppercase block">Kcal Quemadas</span>
            <span className="text-base font-black text-orange-400">
              {metrics.weeklyCalories.toLocaleString()} kcal
            </span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5">
            <span className="text-[10px] text-neutral-400 uppercase block">Volumen Pesas</span>
            <span className="text-base font-black text-cyan-400">
              {metrics.weeklyVolumeKg.toLocaleString()} kg
            </span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-neutral-400 uppercase block">Minutos Deporte</span>
            <span className="text-base font-black text-purple-400">
              {metrics.weeklySportOrCardioMinutes} min
            </span>
          </div>
        </div>
      </div>

      {/* Challenges Cards */}
      <div className="space-y-4">
        {activeChallenges.map((ch) => {
          const percent = Math.min(100, Math.round((ch.userCurrent / ch.goal) * 100));
          const isCompleted = percent >= 100;

          const isClaimed =
            claimedList.includes(ch.claimId) ||
            (user?.claimedChallenges || []).includes(ch.claimId) ||
            (() => {
              try {
                const stored = localStorage.getItem('fitquest_claimed_challenges');
                return stored ? JSON.parse(stored).includes(ch.claimId) : false;
              } catch {
                return false;
              }
            })();

          const Icon = renderChallengeIcon(ch.iconName);

          return (
            <div
              key={ch.id}
              className={`bg-[#121214] border rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 transition-all ${
                isClaimed
                  ? 'border-emerald-500/40 bg-emerald-950/[0.04]'
                  : isCompleted && isViewingActiveWeek
                  ? 'border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Top Row: Info, Category, Reward & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ch.color} flex items-center justify-center text-neutral-950 shrink-0 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {ch.category}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        Objetivo: {ch.goal.toLocaleString()} {ch.unit}
                      </span>
                      {!isViewingActiveWeek && (
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Semana {ch.rotationWeek} (En rotación)
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-black text-lg sm:text-xl text-white mt-1">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-neutral-300 max-w-xl leading-relaxed mt-0.5">
                      {ch.description}
                    </p>
                  </div>
                </div>

                {/* Reward & Action Button */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">
                      Recompensa
                    </span>
                    <span className="font-mono font-black text-base sm:text-lg text-yellow-400">
                      +{ch.rewardXp} XP
                    </span>
                  </div>

                  {!isViewingActiveWeek ? (
                    <div className="px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 text-xs font-mono font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Semana {ch.rotationWeek}</span>
                    </div>
                  ) : isClaimed ? (
                    <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Reclamado</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      id={`btn-claim-ch-${ch.id}`}
                      onClick={() => handleClaim(ch)}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-black text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 animate-bounce transition-all hover:scale-105 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Reclamar XP</span>
                    </button>
                  ) : (
                    <div className="px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 text-xs font-mono font-bold">
                      <span>{percent}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Real Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span className="text-neutral-300">
                    Tu avance esta semana ({weekInfo.weekDateRangeLabel}):{' '}
                    <span className="text-white font-black">{ch.userCurrent.toLocaleString()}</span> /{' '}
                    {ch.goal.toLocaleString()} {ch.unit}
                  </span>
                  <span
                    className={`font-mono font-black ${
                      isCompleted ? 'text-cyan-400' : 'text-neutral-400'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>
                <div className="h-2.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                        : 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Automatic sync badge footer */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <div className="flex items-center gap-1.5 text-cyan-400/80">
                  <Activity className="w-3.5 h-3.5" />
                  <span>
                    Calculado estrictamente de lunes a domingo ({weekInfo.weekDateRangeLabel})
                  </span>
                </div>
                <span className="text-neutral-400 font-bold">
                  {ch.userCurrent >= ch.goal
                    ? '¡Objetivo semanal superado!'
                    : `Faltan ${(ch.goal - ch.userCurrent).toLocaleString()} ${ch.unit}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
