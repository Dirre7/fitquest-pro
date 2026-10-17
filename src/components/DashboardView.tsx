import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  Dumbbell,
  Trophy,
  Swords,
  Activity,
  Heart,
  TrendingUp,
  Award,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
  Target,
  Watch,
  Users,
  Play,
  Layers,
  ChevronDown,
  UtensilsCrossed,
  Droplet,
  CheckCircle2,
  X,
  Info,
} from 'lucide-react';
import {
  UserProfile,
  WorkoutRoutine,
  CommunityChallenge,
  SmartwatchDevice,
  WorkoutHistoryEntry,
  Achievement,
  Language,
} from '../types';
import { translations } from '../lib/i18n';
import { FitStorage } from '../lib/storage';
import {
  getLevelTier,
  getNextMilestone,
  getXpProgressPercent,
} from '../lib/progressionEngine';
import {
  getLeagueLeaderboard,
  calculateUserWeeklyXp,
  calculateRealStreak,
  getAthleteAttributesBreakdown,
} from '../lib/leagueEngine';
import { getWeeklyChallengesForRotation } from '../lib/weeklyChallengesEngine';

interface DashboardViewProps {
  user: UserProfile;
  routines: WorkoutRoutine[];
  challenges: CommunityChallenge[];
  smartwatch: SmartwatchDevice;
  history?: WorkoutHistoryEntry[];
  achievements?: Achievement[];
  lang: Language;
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onNavigateTab: (tab: string) => void;
  onOpenQuickStart?: () => void;
  onOpenSportModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenLevelRoadmap?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  routines,
  challenges,
  smartwatch,
  history = [],
  achievements = [],
  lang,
  onStartRoutine,
  onNavigateTab,
  onOpenQuickStart,
  onOpenSportModal,
  onOpenProfileModal,
  onOpenLevelRoadmap,
}) => {
  const t = translations[lang];

  // Smart default routine selection based on active Multi-Day Program or next uncompleted routine
  const getRecommendedRoutineId = (): string => {
    const programs = FitStorage.getPrograms();
    if (user.programProgress) {
      for (const prog of programs) {
        const completedDays = user.programProgress[prog.id] || [];
        if (completedDays.length > 0 && completedDays.length < prog.days.length) {
          const nextDay = prog.days.find((d) => !completedDays.includes(d.dayNumber));
          if (nextDay && routines.some((r) => r.id === nextDay.routine.id)) {
            return nextDay.routine.id;
          }
        }
      }
    }
    return routines[0]?.id || '';
  };

  // Active workout selection for "Misión del Día"
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(() => getRecommendedRoutineId());
  const [selectedAttrKey, setSelectedAttrKey] = useState<'strength' | 'endurance' | 'agility' | 'discipline' | null>(null);

  const realStreakObj = calculateRealStreak(history);
  const effectiveStreak = Math.max(user.stats?.currentStreak || 0, realStreakObj.currentStreak);
  const attrBreakdown = getAthleteAttributesBreakdown(history, effectiveStreak, user.level, user);

  const currentRoutine = routines.find((r) => r.id === selectedRoutineId) || routines[0];
  const weeklyRotationData = getWeeklyChallengesForRotation(history);
  const claimedChallengeIds = user.claimedChallenges || [];
  const activeChallenge =
    [...weeklyRotationData.challenges]
      .filter((c) => !claimedChallengeIds.includes(c.claimId))
      .sort((a, b) => b.userCurrent / Math.max(1, b.goal) - a.userCurrent / Math.max(1, a.goal))[0] ||
    weeklyRotationData.challenges[0];

  const todayIsoPrefix = new Date().toISOString().split('T')[0];
  const workoutsToday = (history || []).filter((h) => h.date.startsWith(todayIsoPrefix));
  const trainedToday = workoutsToday.length > 0;
  
  // Dynamic Athlete Progression calculations
  const currentTier = getLevelTier(user.level || 1);
  const nextMilestone = getNextMilestone(user.level || 1);
  const xpPercent = getXpProgressPercent(user.currentLevelXp, user.nextLevelXp);
  const remainingXp = Math.max(0, (user.nextLevelXp || 500) - (user.currentLevelXp || 0));

  // Dynamic League Leaderboard & Achievement Teaser
  const userWeeklyXp = calculateUserWeeklyXp(user, history);
  const leagueEntries = getLeagueLeaderboard(user.league || 'Platinum', user, userWeeklyXp, history);
  const topTwoRivals = leagueEntries.filter((e) => !e.isCurrentUser).slice(0, 2);
  const currentUserEntry = leagueEntries.find((e) => e.isCurrentUser) || leagueEntries[0];

  const featuredAchievement =
    achievements.find((a) => a.unlocked) ||
    [...achievements].sort((a, b) => b.progress / Math.max(1, b.maxProgress) - a.progress / Math.max(1, a.maxProgress))[0];

  // Calculate real workouts completed in the last 7 days
  const workoutsThisWeek = (history || []).filter((h) => {
    const d = new Date(h.date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  // Resilient display stats that instantly reflect history entries
  const displayTotalWorkouts = Math.max(user.stats?.totalWorkouts || 0, (history || []).length);
  const displayTotalVolumeKg = Math.max(
    user.stats?.totalVolumeKg || 0,
    (history || []).reduce((s, h) => s + (h.totalVolumeKg || 0), 0)
  );
  const displayCaloriesBurned = Math.max(
    user.stats?.caloriesBurned || 0,
    (history || []).reduce((s, h) => s + (h.calories || 0), 0)
  );
  const displayDistanceKm = Math.max(
    user.stats?.totalDistanceKm || 0,
    (history || []).reduce((s, h) => s + (h.totalDistanceKm || 0), 0)
  );
  const displayTotalMinutes = Math.max(
    user.stats?.totalMinutes || 0,
    (history || []).reduce((s, h) => s + (h.durationMinutes || 0), 0)
  );

  // Determine target muscles for preview badges
  const targetMuscles = Array.from(
    new Set(currentRoutine?.exercises?.map((e) => e.muscleGroup) || ['Pecho', 'Tríceps'])
  ).slice(0, 3);

  // Real-time synchronization for the Nutrition & Macros telemetry card
  const [, setNutritionVersion] = useState<number>(0);
  useEffect(() => {
    const handleNutritionUpdate = () => {
      setNutritionVersion((v) => v + 1);
    };
    window.addEventListener('fitquest_nutrition_updated', handleNutritionUpdate);
    return () => {
      window.removeEventListener('fitquest_nutrition_updated', handleNutritionUpdate);
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 👑 1. TOP HERO CARD: FICHA PRINCIPAL DEL ATLETA (Nivel, Título, Liga, Progreso XP & Métricas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Command Hero Card with Immersive Glowing Radial Backdrop */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#18181b] via-[#121215] to-[#09090b] rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 blur-[90px] pointer-events-none" />

          {/* Top Header of the Athlete Card: Avatar, Big Level, Name, League */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-6 relative z-10">
            <div 
              onClick={onOpenProfileModal}
              className="flex items-center gap-4 sm:gap-5 cursor-pointer group transition-transform hover:scale-[1.01]"
              title="Haz clic para personalizar avatar, nombre o título honorífico"
            >
              {/* Avatar with Animated Glow and Badge */}
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 shadow-2xl group-hover:scale-105 transition-all ${currentTier.frameClass} ${currentTier.borderColor}`}
                />
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenLevelRoadmap) onOpenLevelRoadmap();
                    else if (onOpenProfileModal) onOpenProfileModal();
                  }}
                  className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl text-neutral-950 text-xs font-black font-mono flex items-center gap-1 shadow-2xl cursor-pointer hover:scale-110 transition-transform border border-black/40"
                  style={{
                    backgroundColor: currentTier.accentColor,
                    boxShadow: `0 0 16px ${currentTier.glowColor}`,
                  }}
                  title="Ver Ruta de Rangos y Recompensas"
                >
                  <span>{currentTier.badgeIcon}</span>
                  <span>NVL {user.level}</span>
                </div>
              </div>

              {/* Name, Prominent Level Headline & Badges */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-mono font-black px-3 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                    style={{
                      color: currentTier.accentColor,
                      borderColor: `${currentTier.accentColor}50`,
                      backgroundColor: `${currentTier.accentColor}15`,
                    }}
                  >
                    <span>{currentTier.badgeIcon}</span>
                    <span>{currentTier.name}</span>
                  </span>

                  <span className="text-xs font-mono font-black px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 uppercase tracking-wider">
                    LIGA {user.league}
                  </span>
                </div>

                <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight mt-1 group-hover:text-cyan-300 transition-colors truncate">
                  {user.name}
                </h1>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
                    <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{user.rankTitle || 'Recluta Inicial'}</span>
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenLevelRoadmap) onOpenLevelRoadmap();
                    }}
                    className="text-xs text-neutral-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                  >
                    Ver ruta de rangos →
                  </button>
                </div>

                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  {displayTotalWorkouts} entrenos completados • {Math.round(displayTotalVolumeKg / 1000)}t tonelaje levantado
                </p>
              </div>
            </div>

            {/* Quick action button in header */}
            <button
              id="btn-dashboard-start-workout"
              onClick={onOpenQuickStart ? onOpenQuickStart : () => onNavigateTab('routines')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 px-4 py-2.5 rounded-2xl text-xs font-mono font-black uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 self-start sm:self-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>EXPLORAR RUTINAS</span>
            </button>
          </div>

          {/* XP Progress Bar + Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 relative z-10 pt-5 border-t border-white/10">
            
            {/* Circular Mastery Ring & Level Progress (Prominent 0-100% SVG Ring) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center gap-2 p-4 bg-black/40 rounded-3xl border border-white/5 shadow-inner">
              <div
                onClick={onOpenLevelRoadmap}
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform"
                style={{
                  boxShadow: `0 0 30px ${currentTier.glowColor}`,
                }}
                title="Haz clic para ver todos los niveles y recompensas"
              >
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={`${currentTier.accentColor}25`}
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={currentTier.accentColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - Math.min(100, Math.max(0, xpPercent)) / 100)}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight block">
                    {xpPercent}<span className="text-sm font-normal opacity-50">%</span>
                  </span>
                  <span
                    className="text-[10px] sm:text-xs uppercase tracking-widest font-mono font-black block mt-0.5"
                    style={{ color: currentTier.accentColor }}
                  >
                    NIVEL {user.level}
                  </span>
                </div>
              </div>

              <div className="text-center w-full px-1">
                <p className="text-sm font-mono font-extrabold" style={{ color: currentTier.accentColor }}>
                  {user.currentLevelXp} / {user.nextLevelXp} XP
                </p>
                <p className="text-xs text-neutral-300 font-mono mt-0.5">
                  Faltan <span className="text-white font-bold">{remainingXp} XP</span> para Nivel {user.level + 1}
                </p>
                {nextMilestone && (
                  <p className="text-[11px] text-cyan-300 font-mono mt-1 truncate">
                    🎁 Hito Nvl {nextMilestone.level}: {nextMilestone.rewardLabel}
                  </p>
                )}

                <button
                  type="button"
                  onClick={onOpenLevelRoadmap}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-cyan-400/50 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ruta de Rangos y Recompensas</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>

            {/* Live Telemetry Aggregate Metric Cards */}
            <div className="md:col-span-7 space-y-3">
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:border-cyan-500/30 transition-colors">
                <div>
                  <p className="text-xs text-neutral-400 font-medium">Volumen Total Levantado (Hierro)</p>
                  <p className="text-2xl font-mono font-bold text-white mt-0.5">
                    {displayTotalVolumeKg.toLocaleString()} <span className="text-xs text-cyan-400 font-semibold">KG</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                  <Dumbbell className="w-5 h-5 text-cyan-400" />
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:border-cyan-500/30 transition-colors">
                <div>
                  <p className="text-xs text-neutral-400 font-medium">Distancia Recorrida (Cardio & Running)</p>
                  <p className="text-2xl font-mono font-bold text-white mt-0.5">
                    {displayDistanceKm.toFixed(1)} <span className="text-xs text-cyan-400 font-semibold">KM</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:border-white/10 transition-colors">
                <div>
                  <p className="text-xs text-neutral-400 font-medium">Gasto Calórico en Entrenamientos</p>
                  <p className="text-2xl font-mono font-bold text-white mt-0.5">
                    {displayCaloriesBurned.toLocaleString()} <span className="text-xs text-orange-400 font-semibold">KCAL</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl border border-orange-500/30 bg-orange-500/10 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.2)]">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* ⚔️ 2. ATRIBUTOS DEL ATLETA (10-99 Scale + OVR Media + Arquetipo + Desglose) */}
          <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
                  ATRIBUTOS DEL ATLETA
                </p>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/35 text-cyan-300 text-[10px] font-mono font-black tracking-wide">
                  MEDIA {attrBreakdown.overall} OVR · {attrBreakdown.overallTierLabel.toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-200 text-[10px] font-semibold">
                  {attrBreakdown.archetype.icon} {attrBreakdown.archetype.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAttrKey('strength')}
                className="text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Ver Ficha y Bonus XP →</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* FUERZA (PWR) */}
              <button
                type="button"
                onClick={() => setSelectedAttrKey('strength')}
                className="text-left bg-white/5 hover:bg-white/[0.08] p-3.5 rounded-2xl border border-white/5 hover:border-red-500/40 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 font-mono tracking-wider block">
                      FUERZA
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-mono font-extrabold text-white">
                        {attrBreakdown.details.strength.score}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">/99</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 font-mono font-black text-xs shadow-[0_0_8px_rgba(239,68,68,0.2)] group-hover:scale-105 transition-transform">
                    PWR
                  </div>
                </div>

                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden mt-2.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (attrBreakdown.details.strength.score / 99) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                  <span className="text-neutral-400">{attrBreakdown.details.strength.tierLabel}</span>
                  <span className="text-red-400 font-bold">+{attrBreakdown.details.strength.bonusPct}% XP</span>
                </div>
              </button>

              {/* RESISTENCIA (END) */}
              <button
                type="button"
                onClick={() => setSelectedAttrKey('endurance')}
                className="text-left bg-white/5 hover:bg-white/[0.08] p-3.5 rounded-2xl border border-white/5 hover:border-cyan-500/40 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 font-mono tracking-wider block">
                      RESISTENCIA
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-mono font-extrabold text-white">
                        {attrBreakdown.details.endurance.score}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">/99</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 font-mono font-black text-xs shadow-[0_0_8px_rgba(6,182,212,0.2)] group-hover:scale-105 transition-transform">
                    END
                  </div>
                </div>

                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden mt-2.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (attrBreakdown.details.endurance.score / 99) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                  <span className="text-neutral-400">{attrBreakdown.details.endurance.tierLabel}</span>
                  <span className="text-cyan-400 font-bold">+{attrBreakdown.details.endurance.bonusPct}% XP</span>
                </div>
              </button>

              {/* AGILIDAD (AGI) */}
              <button
                type="button"
                onClick={() => setSelectedAttrKey('agility')}
                className="text-left bg-white/5 hover:bg-white/[0.08] p-3.5 rounded-2xl border border-white/5 hover:border-amber-500/40 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 font-mono tracking-wider block">
                      AGILIDAD
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-mono font-extrabold text-white">
                        {attrBreakdown.details.agility.score}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">/99</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-mono font-black text-xs shadow-[0_0_8px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform">
                    AGI
                  </div>
                </div>

                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden mt-2.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (attrBreakdown.details.agility.score / 99) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                  <span className="text-neutral-400">{attrBreakdown.details.agility.tierLabel}</span>
                  <span className="text-amber-400 font-bold">+{attrBreakdown.details.agility.bonusPct}% XP</span>
                </div>
              </button>

              {/* DISCIPLINA (DIS) */}
              <button
                type="button"
                onClick={() => setSelectedAttrKey('discipline')}
                className="text-left bg-white/5 hover:bg-white/[0.08] p-3.5 rounded-2xl border border-white/5 hover:border-emerald-500/40 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 font-mono tracking-wider block">
                      DISCIPLINA
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-mono font-extrabold text-white">
                        {attrBreakdown.details.discipline.score}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">/99</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-mono font-black text-xs shadow-[0_0_8px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform">
                    DIS
                  </div>
                </div>

                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden mt-2.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (attrBreakdown.details.discipline.score / 99) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                  <span className="text-neutral-400">{attrBreakdown.details.discipline.tierLabel}</span>
                  <span className="text-emerald-400 font-bold">+{attrBreakdown.details.discipline.bonusPct}% XP</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Column: Streak & Global Leaderboard Snapshot */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Global Leaderboard Snapshot Card */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400">
                CLASIFICACIÓN LIGA {user.league}
              </h3>
              <button 
                onClick={() => onNavigateTab('leaderboard')}
                className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                VER LIGA →
              </button>
            </div>

            <div className="space-y-3 flex-1">
              {topTwoRivals.map((rival, idx) => (
                <div
                  key={rival.name}
                  className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="text-neutral-400 font-mono font-bold w-6 text-sm">
                    0{rival.rank}
                  </div>
                  <img
                    src={rival.avatar}
                    alt={rival.name}
                    className="w-10 h-10 rounded-2xl object-cover border border-white/10 shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{rival.name}</p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Nvl {rival.level} • {rival.xpEarned.toLocaleString()} XP sem.
                    </p>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    {idx === 0 ? '👑' : '🥈'}
                  </div>
                </div>
              ))}

              {currentUserEntry && (
                <div className="flex items-center gap-3.5 bg-cyan-500/10 p-3.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <div className="text-cyan-400 font-mono font-bold w-6 text-sm">
                    {currentUserEntry.rank < 10 ? `0${currentUserEntry.rank}` : currentUserEntry.rank}
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500 flex items-center justify-center text-neutral-950 font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    TÚ
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-cyan-300 font-mono">
                      Nvl {user.level} • {currentUserEntry.xpEarned.toLocaleString()} XP sem.
                    </p>
                  </div>
                  <div className="text-xs font-mono font-bold text-cyan-400">
                    #{currentUserEntry.rank}
                  </div>
                </div>
              )}
            </div>

            {/* Achievement Unlocked Teaser Banner */}
            {featuredAchievement && (
              <div
                onClick={() => onNavigateTab('achievements')}
                className="mt-5 p-4 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 rounded-2xl shadow-inner cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-mono uppercase font-bold text-cyan-400">
                    {featuredAchievement.unlocked ? '🏆 LOGRO DESBLOQUEADO' : '🎯 PRÓXIMO LOGRO EN PROGRESO'}
                  </p>
                  <span className="text-[10px] font-mono font-bold text-cyan-300">
                    {featuredAchievement.progress}/{featuredAchievement.maxProgress}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-neutral-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{featuredAchievement.title}</p>
                    <p className="text-[11px] text-neutral-300 line-clamp-1">{featuredAchievement.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Join Sprint / Weekly Rotating Challenge Card matching Immersive UI Design */}
          {activeChallenge && (
            <div 
              onClick={() => onNavigateTab('challenges')}
              className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-6 relative overflow-hidden group cursor-pointer shadow-2xl hover:scale-[1.02] transition-transform"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white tracking-widest inline-block">
                    ⚔️ RETO SEMANAL ({weeklyRotationData.rotationMeta.badge})
                  </span>
                  {activeChallenge.userCurrent >= activeChallenge.goal &&
                    !claimedChallengeIds.includes(activeChallenge.claimId) && (
                      <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-yellow-400 text-neutral-950 animate-bounce">
                        ¡LISTO PARA RECLAMAR!
                      </span>
                    )}
                </div>
                <h3 className="text-lg sm:text-xl font-black italic tracking-tighter uppercase mb-1 text-white">
                  {activeChallenge.title}
                </h3>
                <p className="text-xs text-cyan-100 leading-tight mb-3 max-w-[260px]">
                  {activeChallenge.description}
                </p>

                {/* Live Weekly Challenge Progress Bar */}
                <div className="mb-3.5 bg-black/25 rounded-2xl p-2.5 border border-white/15">
                  <div className="flex justify-between text-[11px] font-mono font-bold text-white mb-1">
                    <span>
                      {activeChallenge.userCurrent.toLocaleString()} / {activeChallenge.goal.toLocaleString()}{' '}
                      {activeChallenge.unit}
                    </span>
                    <span>
                      {Math.min(100, Math.round((activeChallenge.userCurrent / Math.max(1, activeChallenge.goal)) * 100))}%
                    </span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((activeChallenge.userCurrent / Math.max(1, activeChallenge.goal)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full border-2 border-cyan-600 bg-neutral-300"></div>
                    <div className="w-7 h-7 rounded-full border-2 border-cyan-600 bg-neutral-400"></div>
                    <div className="w-7 h-7 rounded-full border-2 border-cyan-600 bg-neutral-500"></div>
                    <div className="px-2 h-7 rounded-full border-2 border-cyan-600 bg-black/40 text-white flex items-center justify-center text-[9px] font-mono font-bold">
                      +{activeChallenge.participantsCount || 184}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-black/30 px-3 py-1 rounded-xl border border-white/10">
                    +{activeChallenge.rewardXp} XP
                  </span>
                </div>
              </div>
              
              {/* Background decorative SVG icon */}
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform">
                <Target className="w-32 h-32 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🎯 3. MISIÓN DEL DÍA / ENTRENAR HOY */}
      {currentRoutine && (
        <div className="bg-gradient-to-r from-neutral-900 via-[#151518] to-cyan-950/40 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_35px_rgba(6,182,212,0.15)] relative overflow-hidden">
          {/* Ambient light glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/10 blur-[80px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                {trainedToday ? (
                  <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-full bg-emerald-500 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> MISIÓN DE HOY COMPLETADA ({workoutsToday.length})
                  </span>
                ) : (
                  <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-full bg-cyan-500 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-cyan-500/30">
                    <Zap className="w-3.5 h-3.5 fill-current animate-bounce" /> MISIÓN DEL DÍA
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                  +{currentRoutine.xpReward} XP Recompensa
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {currentRoutine.difficulty === 'Advanced' ? '🔥 Avanzado' : currentRoutine.difficulty === 'Intermediate' ? '⚡ Intermedio' : '🌱 Principiante'}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                  {currentRoutine.title}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed line-clamp-2">
                  {currentRoutine.description}
                </p>
              </div>

              {/* Workout Specs & Muscle Tags */}
              <div className="flex items-center gap-4 flex-wrap pt-1 text-xs font-mono">
                <span className="text-neutral-300 flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentRoutine.durationMinutes} min aprox.</span>
                </span>

                <span className="text-neutral-300 flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-xl">
                  <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentRoutine.exercises?.length || 5} Ejercicios</span>
                </span>

                <span className="text-orange-400 flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-xl">
                  <Flame className="w-3.5 h-3.5" />
                  <span>~{currentRoutine.estimatedCalories} kcal</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {targetMuscles.map((muscle, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons: Big Start Button & Routine Switcher */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => onStartRoutine(currentRoutine)}
                className="w-full lg:w-64 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-neutral-950 font-display font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.45)] flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{trainedToday ? 'ENTRENAR OTRA SESIÓN' : 'COMENZAR SESIÓN'}</span>
              </button>

              {/* Quick routine selector dropdown right inside the hero card */}
              <div className="relative w-full lg:w-64">
                <select
                  value={currentRoutine.id}
                  onChange={(e) => setSelectedRoutineId(e.target.value)}
                  className="w-full py-2 pl-3 pr-8 rounded-xl bg-neutral-950/80 border border-white/15 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                >
                  {routines.map((r) => (
                    <option key={r.id} value={r.id}>
                      🎯 {r.title} ({r.durationMinutes}m)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onNavigateTab('routines')}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Catálogo</span>
                </button>

                {onOpenQuickStart && (
                  <button
                    onClick={onOpenQuickStart}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Entreno Libre</span>
                  </button>
                )}
              </div>

              {onOpenSportModal && (
                <button
                  id="btn-dashboard-log-sport"
                  onClick={onOpenSportModal}
                  className="w-full lg:w-64 py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-mono font-black text-emerald-300 hover:text-emerald-200 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                >
                  <Watch className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🎾 Registrar Deporte / Reloj</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🥗 NUTRITION & HYDRATION SUMMARY BANNER */}
      {(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLog = FitStorage.getNutritionLog(todayStr);
        const safeFoods = Array.isArray(todayLog?.foods) ? todayLog.foods : [];
        const totalCalories = safeFoods.reduce((sum, f) => sum + (Number(f.calories) || 0) * (Number(f.quantity) || 1), 0);
        const totalProtein = safeFoods.reduce((sum, f) => sum + (Number(f.protein) || 0) * (Number(f.quantity) || 1), 0);
        const waterLiters = ((Number(todayLog?.waterMl) || 0) / 1000).toFixed(1);
        const burnedTodayKcal = workoutsToday.reduce((sum, w) => sum + (Number(w.calories) || 0), 0);

        return (
          <div
            onClick={() => onNavigateTab('nutrition')}
            className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-cyan-950/30 border border-white/10 hover:border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      Nutrición & Macros
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      {todayLog.dayType === 'workout' || trainedToday
                        ? 'Día de Entreno (2.300 kcal)'
                        : 'Día de Descanso (2.100 kcal)'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                    Plan Nutricional Renato Cabrera
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Control de déficit calórico, 180g proteína e hidratación prioritaria en carretera.
                  </p>
                </div>
              </div>

              {/* Progress Gauges */}
              <div className="flex items-center gap-4 sm:gap-5 flex-wrap shrink-0 font-mono">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold">Comidas Hoy</div>
                  <div className="text-lg font-black text-white">
                    {totalCalories} <span className="text-xs text-neutral-400 font-normal">/ {todayLog.targetCalories}</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/10 hidden xs:block" />

                <div>
                  <div className="text-[10px] text-orange-400 uppercase font-bold">Quemadas Hoy</div>
                  <div className="text-lg font-black text-orange-400">
                    +{burnedTodayKcal.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">kcal</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/10 hidden xs:block" />

                <div>
                  <div className="text-[10px] text-cyan-400 uppercase font-bold">Proteína</div>
                  <div className="text-lg font-black text-cyan-400">
                    {totalProtein}g <span className="text-xs text-neutral-400 font-normal">/ {todayLog.targetProtein}g</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/10 hidden xs:block" />

                <div>
                  <div className="text-[10px] text-blue-400 uppercase font-bold">Agua</div>
                  <div className="text-lg font-black text-blue-400">
                    {waterLiters}L <span className="text-xs text-neutral-400 font-normal">/ {(todayLog.waterGoalMl / 1000).toFixed(1)}L</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Abrir</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Global Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121214] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.totalWorkouts}</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-mono font-extrabold text-3xl text-white">{displayTotalWorkouts}</p>
          <span className="text-[11px] text-cyan-400 font-mono font-medium">
            {workoutsToday.length > 0
              ? `🔥 +${workoutsToday.length} hoy (${workoutsThisWeek} esta sem.)`
              : workoutsThisWeek > 0
              ? `↑ +${workoutsThisWeek} esta semana`
              : '0 esta semana'}
          </span>
        </div>

        <div className="bg-[#121214] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.volumeLifted}</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-mono font-extrabold text-3xl text-white">
            {(displayTotalVolumeKg / 1000).toFixed(1)} <span className="text-sm font-sans font-normal text-neutral-400">ton</span>
          </p>
          <span className="text-[11px] text-neutral-400 font-mono">{displayTotalVolumeKg.toLocaleString()} kg total</span>
        </div>

        {/* Calories Burned Card (Entrenamientos & Deportes) */}
        <div className="bg-[#121214] border border-white/5 hover:border-orange-500/30 rounded-3xl p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Calorías Quemadas (Entreno)</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <p className="font-mono font-extrabold text-2xl sm:text-3xl text-white">
            {Math.round(displayCaloriesBurned).toLocaleString()}{' '}
            <span className="text-sm font-sans font-normal text-neutral-400">kcal</span>
          </p>
          <span className="text-[11px] text-orange-400 font-mono font-medium">
            {workoutsToday.length > 0
              ? `🔥 Hoy: +${workoutsToday.reduce((s, w) => s + (w.calories || 0), 0).toLocaleString()} kcal`
              : `~${displayTotalWorkouts > 0 ? Math.round(displayCaloriesBurned / displayTotalWorkouts) : 0} kcal / sesión`}
          </span>
        </div>

        {/* Minutes Trained Card */}
        <div className="bg-[#121214] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.minutesTrained}</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-mono font-extrabold text-3xl text-white">
            {displayTotalMinutes < 60 ? (
              <>
                {displayTotalMinutes}{' '}
                <span className="text-sm font-sans font-normal text-neutral-400">min</span>
              </>
            ) : (
              <>
                {(displayTotalMinutes / 60).toFixed(1)}{' '}
                <span className="text-sm font-sans font-normal text-neutral-400">horas</span>
              </>
            )}
          </p>
          <span className="text-[11px] text-neutral-400 font-mono">
            {workoutsToday.length > 0
              ? `⏱ Hoy: +${workoutsToday.reduce((s, w) => s + (w.durationMinutes || 0), 0)} min (${displayTotalMinutes}m total)`
              : `${displayTotalMinutes} min acumulados`}
          </span>
        </div>
      </div>

      {/* 🎾📋 RECENT WORKOUTS & SPORTS LOGGED */}
      {history && history.length > 0 && (
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Últimos Entrenamientos y Deportes Registrados</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Tus sesiones de gimnasio y partidos con reloj sincronizados en tu perfil
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onOpenSportModal && (
                <button
                  type="button"
                  onClick={onOpenSportModal}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Watch className="w-3.5 h-3.5" />
                  <span>+ Registrar Deporte</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigateTab('analytics')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Ver Historial ({history.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {history.slice(0, 4).map((item) => {
              const isSport = Boolean(item.isSportActivity || item.routineId?.startsWith('sport_'));
              const dateObj = new Date(item.date);
              const isTodaySession = item.date.startsWith(todayIsoPrefix);
              const formattedDate = isTodaySession
                ? 'Hoy'
                : dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

              return (
                <div
                  key={item.id}
                  onClick={() => onNavigateTab('analytics')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSport
                      ? 'bg-emerald-500/5 border-emerald-500/25 hover:border-emerald-400/50'
                      : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                          isSport
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {isSport ? '⌚ Deporte / Reloj' : '🏋️ Gimnasio'}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">{formattedDate}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{item.routineTitle}</h4>
                    {item.notes && (
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{item.notes}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <span className="text-neutral-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {item.durationMinutes}m
                      </span>
                      <span className="text-orange-400 font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {item.calories} kcal
                      </span>
                    </div>
                    <span className="text-emerald-400 font-bold">+{item.xpEarned || 250} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Routines Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-extrabold text-xl text-white">
              Rutinas Disponibles
            </h3>
            <p className="text-xs text-neutral-400">Protocolos calibrados para tu nivel actual</p>
          </div>
          <button
            onClick={() => onNavigateTab('routines')}
            className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>VER CATÁLOGO ({routines.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routines.slice(0, 3).map((routine) => (
            <div
              key={routine.id}
              className="bg-[#121214] border border-white/5 hover:border-cyan-500/40 rounded-3xl p-6 transition-all flex flex-col justify-between shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                    {routine.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    +{routine.xpReward} XP
                  </span>
                </div>
                <h4 className="font-display font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                  {routine.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2">
                  {routine.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-xs font-mono text-neutral-400 space-x-3">
                  <span>⏱ {routine.durationMinutes}m</span>
                  <span>🔥 {routine.estimatedCalories}kcal</span>
                </div>
                <button
                  id={`btn-start-routine-${routine.id}`}
                  onClick={() => onStartRoutine(routine)}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs shadow-md shadow-cyan-500/25 transition-all hover:scale-105 cursor-pointer"
                >
                  {t.startRoutine}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Athlete Attributes Breakdown & XP Bonus Modal */}
      {selectedAttrKey && (() => {
        const activeAttr = attrBreakdown.details[selectedAttrKey];
        const attrOrder: Array<'strength' | 'endurance' | 'agility' | 'discipline'> = [
          'strength',
          'endurance',
          'agility',
          'discipline',
        ];
        const barGradientMap = {
          strength: 'from-red-500 to-orange-400',
          endurance: 'from-cyan-500 to-blue-400',
          agility: 'from-amber-500 to-yellow-400',
          discipline: 'from-emerald-500 to-teal-400',
        };
        const accentTextMap = {
          strength: 'text-red-400',
          endurance: 'text-cyan-400',
          agility: 'text-amber-400',
          discipline: 'text-emerald-400',
        };

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setSelectedAttrKey(null)}
          >
            <div
              className="bg-[#121216] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Overall Rating & Archetype Banner */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)] shrink-0">
                    <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase leading-none">
                      MEDIA
                    </span>
                    <span className="text-2xl font-mono font-black text-white leading-tight">
                      {attrBreakdown.overall}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                        FICHA RPG DEL ATLETA
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white">
                        Rango {attrBreakdown.overallTierLabel}
                      </span>
                    </div>
                    <h3 className="text-base font-display font-extrabold text-white mt-0.5">
                      {attrBreakdown.archetype.icon} {attrBreakdown.archetype.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {attrBreakdown.archetype.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAttrKey(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4-Attribute Selector Tabs */}
              <div className="grid grid-cols-4 gap-2 my-4">
                {attrOrder.map((key) => {
                  const item = attrBreakdown.details[key];
                  const isSelected = key === selectedAttrKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedAttrKey(key)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block">
                        {item.code}
                      </span>
                      <span className="text-lg font-mono font-black text-white">
                        {item.score}
                      </span>
                      <span className="text-[9px] font-mono text-cyan-400 block">
                        +{item.bonusPct}% XP
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Attribute Detail Card */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-lg font-mono font-black ${accentTextMap[selectedAttrKey]}`}>
                        {activeAttr.name} ({activeAttr.code})
                      </h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${activeAttr.tierColorClass}`}
                      >
                        {activeAttr.tierLabel}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1">{activeAttr.summary}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-3xl font-mono font-black text-white">
                      {activeAttr.score}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">/99</span>
                  </div>
                </div>

                {/* Progress Bar (10 to 99) */}
                <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden mt-3 border border-white/5">
                  <div
                    className={`h-full bg-gradient-to-r ${barGradientMap[selectedAttrKey]} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, (activeAttr.score / 99) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
                  <span>Base 10</span>
                  <span>Plata 25</span>
                  <span>Oro 50</span>
                  <span>Élite 75</span>
                  <span>Máx 99</span>
                </div>

                {/* Active Passive Bonus Banner */}
                <div className="mt-3.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 block">
                        VENTAJA PASIVA ACTIVA (CADA 10 PTOS = +2% XP)
                      </span>
                      <span className="text-xs font-bold text-white">
                        {activeAttr.bonusDescription}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Point-by-Point Sources Breakdown */}
                <div className="mt-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    DESGLOSE EXACTO DE PUNTOS
                  </p>
                  <div className="space-y-2">
                    {activeAttr.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs"
                      >
                        <div>
                          <span className="text-neutral-200 font-medium block">{src.label}</span>
                          <span className="text-[11px] font-mono text-neutral-400">{src.rawMetric}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">
                          +{src.pointsAdded} ptos
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* How to level up tip */}
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    💡 ¿CÓMO SUBIR {activeAttr.name} HOY?
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {activeAttr.howToImprove}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-5 flex items-center justify-end gap-3">
                {selectedAttrKey === 'agility' && onOpenSportModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAttrKey(null);
                      onOpenSportModal();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    🎾 Registrar Deporte / Reloj
                  </button>
                )}
                {selectedAttrKey === 'discipline' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAttrKey(null);
                      onNavigateTab('nutrition');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    🥗 Ir a Nutrición & Agua
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedAttrKey(null)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 font-bold text-xs cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
