import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Trophy,
  Award,
  Share2,
  CheckCircle2,
  Lock,
  Flame,
  Zap,
  Swords,
  Shield,
  Copy,
  Check,
  X,
  Dumbbell,
  Watch,
  Crown,
  Tag,
  Target,
  ArrowRight,
  TrendingUp,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Achievement, Language, UserProfile } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';

interface AchievementsViewProps {
  achievements: Achievement[];
  user: UserProfile;
  lang: Language;
  onClaimXp: (achievementId: string, xpReward: number) => void;
  onEquipTitle?: (title: string) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
  user,
  lang,
  onClaimXp,
  onEquipTitle,
}) => {
  const t = translations[lang];

  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'in_progress' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sharingAchievement, setSharingAchievement] = useState<Achievement | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [equippedSuccessTitle, setEquippedSuccessTitle] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos los Logros' },
    { id: 'strength', label: '🏋️ Fuerza & Powerlifting' },
    { id: 'speed', label: '🏃 Running & Cardio' },
    { id: 'calisthenics', label: '🥋 Calistenia & Core' },
    { id: 'habits', label: '🔥 Hábitos & Disciplina' },
    { id: 'consistency', label: '⚡ Metabolismo & HIIT' },
    { id: 'programs', label: '👑 Programas & Maestría' },
    { id: 'secret', label: '🕵️ Logros Secretos' },
  ];

  // Tier Colors & Aesthetics
  const getTierBadge = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'Titan':
        return 'text-purple-300 bg-purple-950/80 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
      case 'Gold':
        return 'text-amber-300 bg-amber-950/80 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      case 'Silver':
        return 'text-neutral-200 bg-neutral-800/90 border-neutral-400/50 shadow-[0_0_8px_rgba(255,255,255,0.1)]';
      default:
        return 'text-amber-600 bg-amber-950/40 border-amber-800/60';
    }
  };

  const getTierCardBorder = (tier: Achievement['tier'], unlocked: boolean) => {
    if (!unlocked) return 'border-white/5 bg-neutral-900/40 hover:border-white/10';
    switch (tier) {
      case 'Titan':
        return 'border-purple-500/50 bg-gradient-to-b from-purple-950/30 via-neutral-900 to-neutral-950 shadow-[0_10px_30px_rgba(168,85,247,0.15)] hover:border-purple-400';
      case 'Gold':
        return 'border-amber-500/50 bg-gradient-to-b from-amber-950/30 via-neutral-900 to-neutral-950 shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:border-amber-400';
      case 'Silver':
        return 'border-neutral-500/40 bg-gradient-to-b from-neutral-800/30 via-neutral-900 to-neutral-950 shadow-[0_10px_25px_rgba(255,255,255,0.05)] hover:border-neutral-300';
      default:
        return 'border-amber-700/40 bg-gradient-to-b from-amber-950/20 via-neutral-900 to-neutral-950 hover:border-amber-600/60';
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="w-5 h-5" />;
      case 'Dumbbell':
        return <Dumbbell className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Swords':
        return <Swords className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Watch':
        return <Watch className="w-5 h-5" />;
      case 'Crown':
        return <Crown className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  // Metrics summary
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const inProgressCount = achievements.filter((a) => !a.unlocked && a.currentProgress > 0).length;
  const lockedCount = achievements.filter((a) => !a.unlocked && (a.currentProgress === 0 || !a.currentProgress)).length;
  const totalXpEarned = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (a.xpReward || 0), 0);
  const overallPercent = Math.round((unlockedCount / Math.max(1, achievements.length)) * 100);

  // Breakdown by tiers
  const tierCounts = useMemo(() => {
    return {
      titan: achievements.filter((a) => a.unlocked && a.tier === 'Titan').length,
      gold: achievements.filter((a) => a.unlocked && a.tier === 'Gold').length,
      silver: achievements.filter((a) => a.unlocked && a.tier === 'Silver').length,
      bronze: achievements.filter((a) => a.unlocked && a.tier === 'Bronze').length,
    };
  }, [achievements]);

  // Find next closest achievement to complete
  const nextUpAchievement = useMemo(() => {
    const candidates = achievements
      .filter((a) => !a.unlocked && a.currentProgress > 0)
      .map((a) => ({
        ...a,
        percent: a.currentProgress / a.maxProgress,
      }))
      .sort((a, b) => b.percent - a.percent);
    return candidates[0] || null;
  }, [achievements]);

  // Smart Sorting: 
  // 1. Unlocked (Titan -> Gold -> Silver -> Bronze)
  // 2. In progress (highest % to lowest %)
  // 3. Locked 0%
  const sortedAndFilteredAchievements = useMemo(() => {
    const tierWeight: Record<string, number> = { Titan: 4, Gold: 3, Silver: 2, Bronze: 1 };

    return achievements
      .filter((a) => {
        // Category Filter
        if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;

        // Search Query Filter
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          const matchTitle = a.title.toLowerCase().includes(q);
          const matchDesc = a.description.toLowerCase().includes(q);
          const matchReward = (a.rewardTitle || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchReward) return false;
        }

        // Status Filter
        if (statusFilter === 'unlocked') return a.unlocked;
        if (statusFilter === 'in_progress') return !a.unlocked && a.currentProgress > 0;
        if (statusFilter === 'locked') return !a.unlocked && (!a.currentProgress || a.currentProgress === 0);
        return true;
      })
      .sort((a, b) => {
        // Priority 1: Unlocked first
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;

        // If both unlocked, sort by Tier descending
        if (a.unlocked && b.unlocked) {
          const tA = tierWeight[a.tier] || 0;
          const tB = tierWeight[b.tier] || 0;
          if (tA !== tB) return tB - tA;
          return (b.xpReward || 0) - (a.xpReward || 0);
        }

        // If both locked, sort by progress percentage descending
        const pctA = a.currentProgress / a.maxProgress;
        const pctB = b.currentProgress / b.maxProgress;
        if (pctA !== pctB) return pctB - pctA;

        // Fallback to Tier
        const tA = tierWeight[a.tier] || 0;
        const tB = tierWeight[b.tier] || 0;
        return tB - tA;
      });
  }, [achievements, selectedCategory, statusFilter, searchQuery]);

  const handleShareClick = (ach: Achievement) => {
    setSharingAchievement(ach);
    sound.playBeep(850, 60);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  const handleCopyShareText = () => {
    if (!sharingAchievement) return;
    const text = `🏆 ¡Acabo de desbloquear el logro "${sharingAchievement.title}" en FitQuest Pro! 🔥 Rango: ${user.rankTitle} • Nivel ${user.level} #FitQuestPro #FitnessGamificado`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      sound.playAchievement();
      setTimeout(() => setCopiedNotification(false), 3000);
    }

    if (navigator.share) {
      try {
        navigator.share({
          title: sharingAchievement.title,
          text: text,
          url: window.location.href,
        });
      } catch {}
    }
  };

  const handleEquipTitleClick = (title: string) => {
    if (onEquipTitle) {
      onEquipTitle(title);
      setEquippedSuccessTitle(title);
      sound.playLevelUp();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      setTimeout(() => setEquippedSuccessTitle(null), 3500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* 1. Master Trophy Showcase Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-[#101014] to-neutral-950 border border-white/10 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-black uppercase px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Sala de Trofeos & Maestría
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                +{totalXpEarned.toLocaleString()} XP Acumulados
              </span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Vitrina de Logros Honoríficos
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Supera hitos biomecánicos de fuerza, rachas de consistencia y retos comunitarios para desbloquear títulos exclusivos y EXP.
            </p>
          </div>

          {/* Medals Breakdown Pills */}
          <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-around sm:justify-between gap-3 sm:gap-6 shrink-0 shadow-inner">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-mono font-black text-purple-400">👑 {tierCounts.titan}</div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Titán</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-lg sm:text-xl font-mono font-black text-amber-400">🥇 {tierCounts.gold}</div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Oro</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-lg sm:text-xl font-mono font-black text-neutral-300">🥈 {tierCounts.silver}</div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Plata</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-lg sm:text-xl font-mono font-black text-amber-600">🥉 {tierCounts.bronze}</div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Bronce</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Progreso General de la Vitrina:
            </span>
            <span className="text-amber-400">
              {unlockedCount} de {achievements.length} Desbloqueados ({overallPercent}%)
            </span>
          </div>
          <div className="h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Highlight: Next Closest Achievement to Unlock */}
      {nextUpAchievement && (
        <div className="bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-neutral-900 border border-cyan-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              {getIcon(nextUpAchievement.icon)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider">
                  🎯 Próximo Hito Más Cercano
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  ({Math.round((nextUpAchievement.currentProgress / nextUpAchievement.maxProgress) * 100)}% completado)
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {nextUpAchievement.title}
              </h3>
              <p className="text-xs text-neutral-300">
                {nextUpAchievement.description} • <span className="font-mono font-bold text-amber-400">+{nextUpAchievement.xpReward} XP</span>
                {nextUpAchievement.rewardTitle && (
                  <span className="text-cyan-300 ml-1">y Título "{nextUpAchievement.rewardTitle}"</span>
                )}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <div className="flex justify-between text-[11px] font-mono font-bold text-cyan-400 mb-1">
              <span>{nextUpAchievement.currentProgress} / {nextUpAchievement.maxProgress}</span>
              <span>{Math.round((nextUpAchievement.currentProgress / nextUpAchievement.maxProgress) * 100)}%</span>
            </div>
            <div className="h-2 bg-neutral-950 rounded-full overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                style={{ width: `${(nextUpAchievement.currentProgress / nextUpAchievement.maxProgress) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter Navigation Controls */}
      <div className="space-y-3">
        {/* Status Filter Tabs (Todos, Desbloqueados, En Progreso, Bloqueados) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-neutral-950 border-white shadow-lg scale-[1.02]'
                : 'bg-neutral-900/80 border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Todos ({achievements.length})
          </button>

          <button
            onClick={() => setStatusFilter('unlocked')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'unlocked'
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                : 'bg-neutral-900/80 border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Desbloqueados ({unlockedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'in_progress'
                ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                : 'bg-neutral-900/80 border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>En Progreso ({inProgressCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('locked')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'locked'
                ? 'bg-neutral-700 text-white border-neutral-600 shadow-lg scale-[1.02]'
                : 'bg-neutral-900/80 border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Por Desbloquear ({lockedCount})</span>
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar entre los 100 logros o títulos..."
            className="w-full bg-neutral-900/90 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-white/15 border-cyan-500/60 text-cyan-300 font-bold'
                  : 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Achievements Cards Grid (Smartly Ordered) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAndFilteredAchievements.map((ach) => {
          const progressPercent = Math.min(100, Math.round((ach.currentProgress / ach.maxProgress) * 100));
          const isEquippedTitle = ach.rewardTitle && user.rankTitle === ach.rewardTitle;
          const isLockedSecret = ach.isSecret && !ach.unlocked;
          const displayTitle = isLockedSecret ? '??? (Logro Secreto)' : ach.title;
          const displayDesc = isLockedSecret
            ? (ach.hint ? `💡 Pista misteriosa: "${ach.hint}"` : 'Completa hazañas secretas para revelar este logro.')
            : ach.description;

          return (
            <div
              key={ach.id}
              className={`rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between relative overflow-hidden group ${
                isLockedSecret
                  ? 'border-purple-500/20 bg-gradient-to-b from-purple-950/10 to-neutral-950 hover:border-purple-500/40'
                  : getTierCardBorder(ach.tier, ach.unlocked)
              }`}
            >
              {/* Unlocked Sparkle Indicator */}
              {ach.unlocked && (
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
              )}

              <div>
                {/* Header: Icon + Status Badge + Tier Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 duration-200 ${
                      ach.unlocked
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/20'
                        : isLockedSecret
                        ? 'bg-purple-950/40 border-purple-500/40 text-purple-400'
                        : ach.currentProgress > 0
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                        : 'bg-neutral-800/80 border-neutral-700/60 text-neutral-500'
                    }`}
                  >
                    {ach.unlocked ? getIcon(ach.icon) : isLockedSecret ? <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" /> : ach.currentProgress > 0 ? getIcon(ach.icon) : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {ach.unlocked ? (
                      <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completado
                      </span>
                    ) : isLockedSecret ? (
                      <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        🔒 Secreto
                      </span>
                    ) : ach.currentProgress > 0 ? (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {progressPercent}%
                      </span>
                    ) : null}

                    <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-xl border ${getTierBadge(ach.tier)}`}>
                      {ach.tier}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className={`font-display font-extrabold text-lg transition-colors ${
                  isLockedSecret ? 'text-purple-300 font-mono' : 'text-white group-hover:text-amber-300'
                }`}>
                  {displayTitle}
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${isLockedSecret ? 'text-purple-300/80 italic' : 'text-neutral-400'}`}>
                  {displayDesc}
                </p>

                {/* Reward Title Badge if applicable */}
                {ach.rewardTitle && !isLockedSecret && (
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-cyan-400" /> Título:
                      <span className="text-cyan-300 font-bold font-mono">"{ach.rewardTitle}"</span>
                    </span>

                    {ach.unlocked && onEquipTitle && (
                      <button
                        onClick={() => handleEquipTitleClick(ach.rewardTitle!)}
                        className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg transition-all border cursor-pointer ${
                          isEquippedTitle
                            ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-extrabold'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-cyan-500 hover:text-neutral-950 hover:border-cyan-400'
                        }`}
                        title={isEquippedTitle ? 'Título actualmente equipado' : 'Equipar este título honorífico'}
                      >
                        {isEquippedTitle ? '✓ Equipado' : 'Equipar'}
                      </button>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-mono font-semibold text-neutral-400 mb-1">
                    <span>Progreso: {ach.currentProgress} / {ach.maxProgress}</span>
                    <span className="font-bold">{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ach.unlocked
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : ach.currentProgress > 0
                          ? 'bg-cyan-400'
                          : 'bg-neutral-800'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions: Share or Locked status */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="font-mono font-black text-xs text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +{ach.xpReward} XP
                </span>

                {ach.unlocked ? (
                  <button
                    id={`btn-share-ach-${ach.id}`}
                    onClick={() => handleShareClick(ach)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-amber-300 border border-white/10 hover:border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono font-semibold text-neutral-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Bloqueado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Social Achievement Graphic Modal */}
      {sharingAchievement && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                Tarjeta de Trofeo FitQuest
              </span>
              <button
                onClick={() => setSharingAchievement(null)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated Social Card Preview */}
            <div className="bg-gradient-to-tr from-neutral-950 via-neutral-900 to-amber-950/60 border-2 border-amber-500/50 rounded-3xl p-6 text-center shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 text-amber-300 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
                {getIcon(sharingAchievement.icon)}
              </div>

              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {sharingAchievement.tier} Achievement
                </span>
                <h3 className="font-display font-black text-2xl text-white mt-2">
                  {sharingAchievement.title}
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto">
                  {sharingAchievement.description}
                </p>
              </div>

              {/* User Stamp */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover border border-cyan-400" />
                <div className="text-left">
                  <h4 className="font-bold text-xs text-white">{user.name}</h4>
                  <p className="text-[10px] text-cyan-400 font-mono font-semibold">{user.rankTitle} • Nivel {user.level}</p>
                </div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <button
                id="btn-copy-social-share"
                onClick={handleCopyShareText}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-mono font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedNotification ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedNotification ? t.shareCopied : t.shareToSocial}</span>
              </button>

              <p className="text-[11px] font-mono text-center text-neutral-400">
                Comparte en WhatsApp, Instagram Stories, X o descarga tu medalla.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
