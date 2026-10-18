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
  Settings,
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
import { getActiveNutritionPlan } from '../lib/nutritionData';
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
import { getEquippedFrameClasses, getFrameById } from '../lib/cosmeticFrames';
import { getRoutinePhoto } from '../lib/routineImages';

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

  const realStreakObj = calculateRealStreak(history, user.shieldUsedDates);
  const effectiveStreak = Math.max(user.stats?.currentStreak || 0, realStreakObj.currentStreak);
  const attrBreakdown = getAthleteAttributesBreakdown(history, effectiveStreak, user.level, user);
  const equippedFrameClasses = getEquippedFrameClasses(user);
  const equippedFrameMeta = getFrameById(user.equippedFrame);

  const currentRoutine = routines.find((r) => r.id === selectedRoutineId) || routines[0];
  const weeklyRotationData = getWeeklyChallengesForRotation(history);
  const claimedChallengeIds = user.claimedChallenges || [];
  const activeChallenge =
    [...weeklyRotationData.challenges]
      .filter((c) => !claimedChallengeIds.includes(c.claimId))
      .sort((a, b) => b.userCurrent / Math.max(1, b.goal) - a.userCurrent / Math.max(1, a.goal))[0] ||
    weeklyRotationData.challenges[0];

  const todayIsoPrefix = new Date().toISOString().split('T')[0];
  const workoutsToday = (history || []).filter((h) => h.date && h.date.startsWith(todayIsoPrefix));
  const trainedToday = workoutsToday.length > 0;
  const todayVolumeKg = workoutsToday.reduce((sum, w) => sum + (Number(w.totalVolumeKg) || 0), 0);
  const todayCalories = workoutsToday.reduce((sum, w) => sum + (Number(w.calories) || 0), 0);
  const todayMinutes = workoutsToday.reduce((sum, w) => sum + (Number(w.durationMinutes) || 0), 0);
  const todayDistanceKm = workoutsToday.reduce((sum, w) => sum + (Number(w.totalDistanceKm) || 0), 0);
  
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

  // Weekly workout consistency (Mon - Sun) for compact bar chart
  const currentDayOfWeek = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const daysOfWeekLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const weekDaysActivity = daysOfWeekLabels.map((label, index) => {
    const d = new Date();
    const diffToMonday = currentDayOfWeek;
    d.setDate(d.getDate() - diffToMonday + index);
    const dateStr = d.toISOString().split('T')[0];
    const dayWorkouts = (history || []).filter((h) => h.date && h.date.startsWith(dateStr));
    const hasWorkout = dayWorkouts.length > 0;
    const isToday = index === currentDayOfWeek;
    const isPast = index <= currentDayOfWeek;
    return {
      label,
      dateStr,
      hasWorkout,
      workoutsCount: dayWorkouts.length,
      isToday,
      isPast,
    };
  });

  // Today's quick metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayNutritionLog = FitStorage.getNutritionLog(todayStr);
  const todayWaterLiters = ((Number(todayNutritionLog?.waterMl) || 0) / 1000).toFixed(1);
  const todayEarnedXp = workoutsToday.reduce((s, w) => s + (Number(w.xpEarned) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 👑 BENTO GRID: DASHBOARD PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* BENTO 1: FICHA ATLETA & NIVEL XP (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-[#141417] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4">
            <div 
              onClick={onOpenProfileModal}
              className="flex items-center gap-3.5 cursor-pointer group min-w-0"
              title="Personalizar avatar y perfil"
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 shadow-lg group-hover:scale-105 transition-all ${equippedFrameClasses.borderClass} ${equippedFrameClasses.glowClass}`}
                />
                <span className="absolute -top-1.5 -right-1 text-sm bg-neutral-950/80 rounded-full px-1 border border-white/10">
                  {equippedFrameMeta.badgeEmoji}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md border uppercase tracking-wider"
                    style={{
                      color: currentTier.accentColor,
                      borderColor: `${currentTier.accentColor}50`,
                      backgroundColor: `${currentTier.accentColor}15`,
                    }}
                  >
                    NVL {user.level} · {currentTier.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    LIGA {user.league}
                  </span>
                </div>
                <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-0.5 truncate">
                  {user.name}
                </h1>
                <p className="text-xs text-neutral-400 font-mono">
                  {user.rankTitle || 'Recluta Inicial'}
                </p>
              </div>
            </div>

            {/* Streak, Shields & Settings Icon Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-orange-400/20 animate-pulse" />
                <span>{effectiveStreak}d</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold shadow-sm">
                <Shield className="w-3.5 h-3.5 fill-cyan-400/20" />
                <span>{user.streakShields ?? 1}/2</span>
              </div>
              <button
                id="btn-profile-settings"
                type="button"
                onClick={() => onNavigateTab('settings')}
                className="p-2 sm:p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-neutral-400 hover:text-white transition-all shadow-sm group"
                title="Ajustes y Cuenta"
                aria-label="Ajustes"
              >
                <Settings className="w-4 h-4 sm:w-4 sm:h-4 group-hover:rotate-45 transition-transform duration-300 text-neutral-300 group-hover:text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Level Progress Track in Card */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1.5">
              <span className="text-neutral-400">Progreso de Nivel</span>
              <button 
                type="button" 
                onClick={onOpenLevelRoadmap} 
                className="text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <span>{user.currentLevelXp} / {user.nextLevelXp} XP ({xpPercent}%)</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{ width: `${Math.max(4, Math.min(100, xpPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* BENTO 2: ACTIVIDAD SEMANAL WIDGET (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-[#141417] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              ACTIVIDAD SEMANAL
            </span>
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              {weekDaysActivity.filter((d) => d.hasWorkout).length}/7 Días
            </span>
          </div>

          {/* 7 Vertical Bars */}
          <div className="flex items-end justify-between gap-1 h-14 pt-1 px-1">
            {weekDaysActivity.map((day, idx) => {
              const barHeight = day.hasWorkout ? '100%' : day.isToday ? '35%' : day.isPast ? '20%' : '15%';
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full max-w-[20px] h-full flex items-end justify-center">
                    <div
                      className={`w-full rounded-full transition-all duration-500 ${
                        day.hasWorkout
                          ? 'bg-gradient-to-t from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                          : day.isToday
                          ? 'bg-cyan-500/30 border border-cyan-400/60 animate-pulse'
                          : 'bg-white/10'
                      }`}
                      style={{ height: barHeight }}
                      title={`${day.dateStr}: ${day.hasWorkout ? `${day.workoutsCount} entrenos` : 'Descanso'}`}
                    />
                  </div>
                  <span className={`text-[9px] font-mono font-bold ${day.isToday ? 'text-cyan-400' : 'text-neutral-500'}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ⚔️ BENTO: ATRIBUTOS RPG DEL ATLETA */}
      <div className="bg-[#141417] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
              ATRIBUTOS DEL ATLETA
            </span>
            <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              MEDIA {attrBreakdown.overall} OVR
            </span>
            <span className="text-[10px] font-semibold text-neutral-300 hidden sm:inline">
              {attrBreakdown.archetype.icon} {attrBreakdown.archetype.name}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedAttrKey('strength')}
            className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Ver Ficha y Bonus</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* PWR */}
          <button
            type="button"
            onClick={() => setSelectedAttrKey('strength')}
            className="bg-white/5 hover:bg-white/[0.08] p-3 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-neutral-400">FUERZA</span>
              <span className="text-[10px] font-mono font-black text-red-400 px-1.5 py-0.2 rounded bg-red-500/10">PWR</span>
            </div>
            <p className="text-xl font-mono font-black text-white mt-1">
              {attrBreakdown.details.strength.score} <span className="text-[10px] text-neutral-500 font-normal">/99</span>
            </p>
            <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${(attrBreakdown.details.strength.score / 99) * 100}%` }} />
            </div>
            <p className="text-[9px] font-mono text-red-400 mt-1">+{attrBreakdown.details.strength.bonusPct}% XP</p>
          </button>

          {/* END */}
          <button
            type="button"
            onClick={() => setSelectedAttrKey('endurance')}
            className="bg-white/5 hover:bg-white/[0.08] p-3 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-neutral-400">RESISTENCIA</span>
              <span className="text-[10px] font-mono font-black text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-500/10">END</span>
            </div>
            <p className="text-xl font-mono font-black text-white mt-1">
              {attrBreakdown.details.endurance.score} <span className="text-[10px] text-neutral-500 font-normal">/99</span>
            </p>
            <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(attrBreakdown.details.endurance.score / 99) * 100}%` }} />
            </div>
            <p className="text-[9px] font-mono text-cyan-400 mt-1">+{attrBreakdown.details.endurance.bonusPct}% XP</p>
          </button>

          {/* AGI */}
          <button
            type="button"
            onClick={() => setSelectedAttrKey('agility')}
            className="bg-white/5 hover:bg-white/[0.08] p-3 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-neutral-400">AGILIDAD</span>
              <span className="text-[10px] font-mono font-black text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10">AGI</span>
            </div>
            <p className="text-xl font-mono font-black text-white mt-1">
              {attrBreakdown.details.agility.score} <span className="text-[10px] text-neutral-500 font-normal">/99</span>
            </p>
            <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(attrBreakdown.details.agility.score / 99) * 100}%` }} />
            </div>
            <p className="text-[9px] font-mono text-amber-400 mt-1">+{attrBreakdown.details.agility.bonusPct}% XP</p>
          </button>

          {/* DIS */}
          <button
            type="button"
            onClick={() => setSelectedAttrKey('discipline')}
            className="bg-white/5 hover:bg-white/[0.08] p-3 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-neutral-400">DISCIPLINA</span>
              <span className="text-[10px] font-mono font-black text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10">DIS</span>
            </div>
            <p className="text-xl font-mono font-black text-white mt-1">
              {attrBreakdown.details.discipline.score} <span className="text-[10px] text-neutral-500 font-normal">/99</span>
            </p>
            <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(attrBreakdown.details.discipline.score / 99) * 100}%` }} />
            </div>
            <p className="text-[9px] font-mono text-emerald-400 mt-1">+{attrBreakdown.details.discipline.bonusPct}% XP</p>
          </button>
        </div>
      </div>

      {/* 📊 BENTO: TUS MÉTRICAS DE HOY (4 WIDGETS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Agua */}
        <div 
          onClick={() => onNavigateTab('nutrition')}
          className="bg-[#141417] border border-white/10 hover:border-blue-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div>
            <p className="text-[10px] font-mono uppercase text-neutral-400 font-bold">Agua Hoy</p>
            <p className="text-lg font-mono font-black text-white mt-0.5">
              {todayWaterLiters} <span className="text-xs text-blue-400 font-normal">L</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Droplet className="w-4 h-4 fill-blue-400/20" />
          </div>
        </div>

        {/* Calorías */}
        <div className="bg-[#141417] border border-white/10 hover:border-orange-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg transition-all">
          <div>
            <p className="text-[10px] font-mono uppercase text-neutral-400 font-bold">Calorías Quemadas</p>
            <p className="text-lg font-mono font-black text-white mt-0.5">
              {todayCalories.toLocaleString()} <span className="text-xs text-orange-400 font-normal">Kcal</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 fill-orange-400/20" />
          </div>
        </div>

        {/* Pulso / Hierro */}
        <div className="bg-[#141417] border border-white/10 hover:border-purple-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg transition-all">
          <div>
            <p className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
              {smartwatch?.liveHeartRate && smartwatch.liveHeartRate > 0 ? 'Frecuencia' : (todayDistanceKm > 0 ? 'Distancia' : 'Hierro')}
            </p>
            <p className="text-lg font-mono font-black text-white mt-0.5">
              {smartwatch?.liveHeartRate && smartwatch.liveHeartRate > 0
                ? `${smartwatch.liveHeartRate} bpm`
                : (todayDistanceKm > 0 ? `${todayDistanceKm.toFixed(1)} km` : `${todayVolumeKg.toLocaleString()} kg`)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            {smartwatch?.liveHeartRate && smartwatch.liveHeartRate > 0 ? (
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20 animate-pulse" />
            ) : (
              <Dumbbell className="w-4 h-4 text-purple-400" />
            )}
          </div>
        </div>

        {/* Tiempo Activo */}
        <div className="bg-[#141417] border border-white/10 hover:border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg transition-all">
          <div>
            <p className="text-[10px] font-mono uppercase text-neutral-400 font-bold">Tiempo Activo</p>
            <p className="text-lg font-mono font-black text-amber-400 mt-0.5">
              {todayMinutes} <span className="text-xs text-neutral-300 font-normal">Min ({workoutsToday.length} ses.)</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>

      {/* ⚔️ BENTO: RETO SEMANAL & CLASIFICACIÓN (2 WIDGETS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Reto Semanal Widget */}
        {activeChallenge && (
          <div 
            onClick={() => onNavigateTab('challenges')}
            className={`bg-[#141417] border border-white/10 hover:border-cyan-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] ${activeChallenge ? 'lg:col-span-6' : 'lg:col-span-12'}`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                ⚔️ RETO ({weeklyRotationData.rotationMeta.badge})
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                +{activeChallenge.rewardXp} XP
              </span>
            </div>

            <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight">
              {activeChallenge.title}
            </h3>

            {/* Progress bar */}
            <div className="my-2 bg-black/40 rounded-xl p-2.5 border border-white/5">
              <div className="flex justify-between text-[11px] font-mono font-bold text-white mb-1">
                <span>{activeChallenge.userCurrent.toLocaleString()} / {activeChallenge.goal.toLocaleString()} {activeChallenge.unit}</span>
                <span>{Math.min(100, Math.round((activeChallenge.userCurrent / Math.max(1, activeChallenge.goal)) * 100))}%</span>
              </div>
              <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.round((activeChallenge.userCurrent / Math.max(1, activeChallenge.goal)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Clasificación Liga Widget */}
        <div className={`bg-[#141417] border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col justify-between ${activeChallenge ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              LIGA {user.league}
            </span>
            <button 
              onClick={() => onNavigateTab('leaderboard')}
              className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver Liga</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {topTwoRivals.slice(0, 1).map((rival) => (
              <div key={rival.name} className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl">
                <span className="text-xs font-mono font-bold text-neutral-400 w-4">0{rival.rank}</span>
                <img src={rival.avatar} alt={rival.name} className="w-7 h-7 rounded-lg object-cover" />
                <span className="text-xs font-bold text-white truncate flex-1">{rival.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{rival.xpEarned.toLocaleString()} XP</span>
              </div>
            ))}

            {currentUserEntry && (
              <div className="flex items-center gap-2.5 bg-cyan-500/10 border border-cyan-500/30 p-2 rounded-xl">
                <span className="text-xs font-mono font-bold text-cyan-400 w-4">#{currentUserEntry.rank}</span>
                <div className="w-7 h-7 rounded-lg bg-cyan-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center">TÚ</div>
                <span className="text-xs font-bold text-white truncate flex-1">{user.name}</span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{currentUserEntry.xpEarned.toLocaleString()} XP</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 3. ENTRENAMIENTOS SUGERIDOS / MISIÓN DEL DÍA (ENVATO / EVOMARE SLIM BANNER) */}
      {currentRoutine && (() => {
        const workoutThumbnail = getRoutinePhoto(currentRoutine);

        return (
          <div className="bg-[#141417] border border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden group">
            {/* Header tag */}
            <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400 fill-current" />
                  ENTRENAMIENTO SUGERIDO
                </span>
                {trainedToday && (
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> COMPLETADO
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                +{currentRoutine.xpReward} XP
              </span>
            </div>

            {/* Horizontal Slim Content */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Photo Thumbnail */}
                <div className="relative w-20 sm:w-24 h-16 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                  <img
                    src={workoutThumbnail}
                    alt={currentRoutine.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-mono font-bold text-white bg-black/70 backdrop-blur-md px-1.5 py-0.2 rounded">
                    {currentRoutine.durationMinutes}m
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-black text-sm sm:text-base text-white tracking-tight uppercase truncate">
                    {currentRoutine.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-0.5 flex-wrap">
                    <span className="text-cyan-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {currentRoutine.durationMinutes} min
                    </span>
                    <span>•</span>
                    <span className="text-orange-400 flex items-center gap-0.5">
                      <Flame className="w-3 h-3" />
                      ~{currentRoutine.estimatedCalories} kcal
                    </span>
                    <span>•</span>
                    <span>{currentRoutine.exercises?.length || 5} ej.</span>
                  </div>

                  {/* Muscle Tags */}
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {targetMuscles.map((muscle, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono font-medium px-2 py-0.2 rounded-full bg-white/5 text-neutral-300 border border-white/10"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-1 sm:pt-0">
                {/* Quick Routine Selector */}
                <div className="relative flex-1 sm:flex-initial sm:w-44">
                  <select
                    value={currentRoutine.id}
                    onChange={(e) => setSelectedRoutineId(e.target.value)}
                    className="w-full py-2 pl-2.5 pr-7 rounded-xl bg-neutral-900 border border-white/10 text-[11px] font-mono font-bold text-neutral-200 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                  >
                    {routines.map((r) => (
                      <option key={r.id} value={r.id} className="bg-neutral-900 text-white">
                        🎯 {r.title} ({r.durationMinutes}m)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Direct Cyan Start Button */}
                <button
                  onClick={() => onStartRoutine(currentRoutine)}
                  className="py-2 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-display font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{trainedToday ? 'Repetir' : 'Iniciar'}</span>
                </button>
              </div>
            </div>

            {/* Quick Secondary Strip */}
            <div className="flex items-center gap-2 pt-2.5 mt-2.5 border-t border-white/5 text-[11px] font-mono">
              <button
                onClick={() => onNavigateTab('routines')}
                className="flex-1 py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Ver Catálogo</span>
              </button>
              {onOpenQuickStart && (
                <button
                  onClick={onOpenQuickStart}
                  className="flex-1 py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Entreno Libre</span>
                </button>
              )}
              {onOpenSportModal && (
                <button
                  id="btn-dashboard-log-sport"
                  onClick={onOpenSportModal}
                  className="flex-1 py-1 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 flex items-center justify-center gap-1 transition-colors cursor-pointer border border-emerald-500/20"
                >
                  <Watch className="w-3 h-3 text-emerald-400" />
                  <span>Deporte / Reloj</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* 🥗 NUTRITION & HYDRATION COMPACT BAR (ENVATO STYLE) */}
      {(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLog = FitStorage.getNutritionLog(todayStr);
        const activeNutritionPlan = getActiveNutritionPlan(user.activeNutritionPlanId);
        const safeFoods = Array.isArray(todayLog?.foods) ? todayLog.foods : [];
        const totalCalories = safeFoods.reduce((sum, f) => sum + (Number(f.calories) || 0) * (Number(f.quantity) || 1), 0);
        const totalProtein = safeFoods.reduce((sum, f) => sum + (Number(f.protein) || 0) * (Number(f.quantity) || 1), 0);
        const waterLiters = ((Number(todayLog?.waterMl) || 0) / 1000).toFixed(1);

        return (
          <div
            onClick={() => onNavigateTab('nutrition')}
            className="bg-[#141417] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-3.5 shadow-lg relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">Nutrición & Macros</span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {activeNutritionPlan ? activeNutritionPlan.name : 'Modo Libre'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white font-mono mt-0.5">
                    {totalCalories} <span className="text-neutral-400 font-normal">/ {todayLog.targetCalories} kcal</span>
                    <span className="mx-2 text-neutral-600">|</span>
                    <span className="text-cyan-400">{totalProtein}g</span> <span className="text-neutral-400 font-normal">prot.</span>
                    <span className="mx-2 text-neutral-600">|</span>
                    <span className="text-blue-400">{waterLiters}L</span> <span className="text-neutral-400 font-normal">agua</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>{activeNutritionPlan ? 'Ver Plan' : 'Nutrición'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🏆 Hitos & Trayectoria Histórica (Career Lifetime Stats) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Récord Global de Carrera
            </span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Hitos &amp; Trayectoria Histórica
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {displayTotalWorkouts} entrenamientos totales
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Sesiones Totales */}
          <div className="bg-[#121214] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl transition-all">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Sesiones Totales</span>
              <Dumbbell className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="font-mono font-extrabold text-3xl text-white">{displayTotalWorkouts}</p>
            <span className="text-[11px] text-cyan-400 font-mono font-medium">
              {workoutsThisWeek > 0 ? `+${workoutsThisWeek} en los últimos 7 días` : 'Historial acumulado'}
            </span>
          </div>

          {/* 2. Tonelaje Total */}
          <div className="bg-[#121214] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl transition-all">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Tonelaje Histórico</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="font-mono font-extrabold text-3xl text-white">
              {(displayTotalVolumeKg / 1000).toFixed(1)} <span className="text-sm font-sans font-normal text-neutral-400">ton</span>
            </p>
            <span className="text-[11px] text-neutral-400 font-mono">
              {displayTotalVolumeKg.toLocaleString()} kg levantados
            </span>
          </div>

          {/* 3. Calorías Totales */}
          <div className="bg-[#121214] border border-white/5 hover:border-orange-500/30 rounded-3xl p-5 shadow-xl transition-all">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Calorías Totales</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <p className="font-mono font-extrabold text-2xl sm:text-3xl text-white">
              {Math.round(displayCaloriesBurned).toLocaleString()}{' '}
              <span className="text-sm font-sans font-normal text-neutral-400">kcal</span>
            </p>
            <span className="text-[11px] text-orange-400 font-mono font-medium">
              Gasto energético de carrera
            </span>
          </div>

          {/* 4. Tiempo / Distancia Total */}
          <div className="bg-[#121214] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl transition-all">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Tiempo Histórico</span>
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
            <span className="text-[11px] text-cyan-400 font-mono font-medium">
              {displayDistanceKm > 0 ? `${displayDistanceKm.toFixed(1)} km recorridos` : `${displayTotalMinutes} min acumulados`}
            </span>
          </div>
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
                  <span>Mín 5</span>
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
