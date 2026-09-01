import React, { useState, useEffect } from 'react';
import {
  Target,
  Flame,
  Trophy,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  Award,
  Dumbbell,
  Calendar,
  Zap,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CommunityChallenge, Language, WorkoutHistoryEntry, UserProfile } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';

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
  challenges,
  user,
  history = [],
  lang,
  onJoinChallenge,
  onClaimReward,
}) => {
  const t = translations[lang];

  // Calculate days/hours left until Sunday 23:59:59
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number }>({ days: 6, hours: 12, mins: 30 });

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

  // Compute real user stats for current week (Monday 00:00:00 to now)
  const mondayMidnight = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  })();

  const weekEntries = history.filter((h) => {
    const entryTime = new Date(h.date).getTime();
    return entryTime >= mondayMidnight || !isNaN(entryTime);
  });

  const weeklyVolumeKg = weekEntries.reduce((acc, h) => acc + (h.totalVolumeKg || 0), 0);
  const weeklyWorkoutsCount = weekEntries.length;
  const weeklyCalories = weekEntries.reduce((acc, h) => acc + (h.calories || 0), 0);
  const weeklyDistanceKm = Math.round(weekEntries.reduce((acc, h) => acc + (h.totalDistanceKm || 0), 0) * 10) / 10;

  // Track claimed challenges state locally & persist
  const [claimedIds, setClaimedIds] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem('fitquest_claimed_challenges');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const handleClaim = (chId: string, rewardXp: number) => {
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch {}
    
    const updated = [...claimedIds, chId];
    setClaimedIds(updated);
    localStorage.setItem('fitquest_claimed_challenges', JSON.stringify(updated));
    onClaimReward(chId, rewardXp);
  };

  // Predefined real dynamic weekly challenges
  const activeChallenges = [
    {
      id: 'ch_weekly_cardio_15k',
      title: 'Desafío Fondista: 15 km de Carrera',
      description: 'Acumula al menos 15 km de carrera, cinta o cardio exterior esta semana.',
      category: 'DISTANCIA',
      icon: Activity,
      color: 'from-purple-500 to-indigo-600',
      unit: 'km',
      goal: 15,
      userCurrent: weeklyDistanceKm,
      rewardXp: 450,
    },
    {
      id: 'ch_weekly_volume_titan',
      title: 'Levantamiento de Titán Semanal',
      description: 'Acumula más de 20,000 kg de volumen total levantado en tus rutinas de esta semana.',
      category: 'VOLUMEN',
      icon: Dumbbell,
      color: 'from-cyan-500 to-blue-600',
      unit: 'kg',
      goal: 20000,
      userCurrent: weeklyVolumeKg,
      rewardXp: 500,
    },
    {
      id: 'ch_weekly_consistency_4',
      title: 'Consistencia de Hierro (4 Días)',
      description: 'Completa al menos 4 entrenamientos completos antes de la medianoche del domingo.',
      category: 'SESIONES',
      icon: Calendar,
      color: 'from-emerald-500 to-teal-600',
      unit: 'sesiones',
      goal: 4,
      userCurrent: weeklyWorkoutsCount,
      rewardXp: 350,
    },
    {
      id: 'ch_weekly_calorie_inferno',
      title: 'Infierno Metabólico',
      description: 'Quema 2,000 calorías acumuladas durante tus entrenamientos activos esta semana.',
      category: 'CALORÍAS',
      icon: Flame,
      color: 'from-orange-500 to-amber-600',
      unit: 'kcal',
      goal: 2000,
      userCurrent: weeklyCalories,
      rewardXp: 400,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header with real-time Sunday timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              ⚔️ RETOS ACTIVOS
            </span>
            <span className="text-xs font-mono font-bold text-neutral-400">
              Semana en Curso
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            Retos de la Comunidad
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            El progreso se sincroniza automáticamente al completar tus entrenamientos.
          </p>
        </div>

        {/* Global Timer Badge */}
        <div className="bg-[#121214] border border-cyan-500/30 rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-lg shrink-0">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">Cierre de Retos:</span>
            <span className="text-xs font-mono font-black text-cyan-300">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m restantes
            </span>
          </div>
        </div>
      </div>

      {/* Challenges Cards */}
      <div className="space-y-4">
        {activeChallenges.map((ch) => {
          const percent = Math.min(100, Math.round((ch.userCurrent / ch.goal) * 100));
          const isCompleted = percent >= 100;
          const isClaimed = claimedIds.includes(ch.id);
          const Icon = ch.icon;

          return (
            <div
              key={ch.id}
              className={`bg-[#121214] border rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 transition-all ${
                isClaimed
                  ? 'border-emerald-500/40 bg-emerald-950/[0.04]'
                  : isCompleted
                  ? 'border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Top Row: Info, Category, Reward & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ch.color} flex items-center justify-center text-neutral-950 shrink-0 shadow-lg`}>
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {ch.category}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        Objetivo: {ch.goal.toLocaleString()} {ch.unit}
                      </span>
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
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Recompensa</span>
                    <span className="font-mono font-black text-base sm:text-lg text-yellow-400">
                      +{ch.rewardXp} XP
                    </span>
                  </div>

                  {isClaimed ? (
                    <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Reclamado</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      id={`btn-claim-ch-${ch.id}`}
                      onClick={() => handleClaim(ch.id, ch.rewardXp)}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-black text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 animate-bounce transition-all hover:scale-105"
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
                    Tu avance: <span className="text-white font-black">{ch.userCurrent.toLocaleString()}</span> / {ch.goal.toLocaleString()} {ch.unit}
                  </span>
                  <span className={`font-mono font-black ${isCompleted ? 'text-cyan-400' : 'text-neutral-400'}`}>
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
                  <span>Sincronizado automáticamente con tus entrenamientos de esta semana</span>
                </div>
                <span className="text-neutral-500">
                  {ch.userCurrent >= ch.goal ? '¡Completado!' : `Faltan ${(ch.goal - ch.userCurrent).toLocaleString()} ${ch.unit}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
