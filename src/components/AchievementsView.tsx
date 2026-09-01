import React, { useState } from 'react';
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
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
  user,
  lang,
  onClaimXp,
}) => {
  const t = translations[lang];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sharingAchievement, setSharingAchievement] = useState<Achievement | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'strength', label: '🏋️ Fuerza & Tonelaje' },
    { id: 'consistency', label: '🔥 Constancia & Rachas' },
    { id: 'speed', label: '🏃 Cardio & Running' },
    { id: 'social', label: '👑 Retos & Maestría' },
  ];

  const getTierBadge = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'Titan':
        return 'text-purple-400 bg-purple-950/50 border-purple-500/40';
      case 'Gold':
        return 'text-amber-400 bg-amber-950/50 border-amber-500/40';
      case 'Silver':
        return 'text-neutral-300 bg-neutral-800 border-neutral-600';
      default:
        return 'text-amber-700 bg-amber-950/30 border-amber-800/50';
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="w-6 h-6" />;
      case 'Dumbbell':
        return <Dumbbell className="w-6 h-6" />;
      case 'Flame':
        return <Flame className="w-6 h-6" />;
      case 'Zap':
        return <Zap className="w-6 h-6" />;
      case 'Swords':
        return <Swords className="w-6 h-6" />;
      case 'Shield':
        return <Shield className="w-6 h-6" />;
      case 'Watch':
        return <Watch className="w-6 h-6" />;
      case 'Crown':
        return <Crown className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleShareClick = (ach: Achievement) => {
    setSharingAchievement(ach);
    sound.playBeep(850, 60);
  };

  const handleCopyShareText = () => {
    if (!sharingAchievement) return;
    const text = `🏆 ¡Acabo de desbloquear el logro "${sharingAchievement.title}" en FitQuest Pro! 🔥 Rango: ${user.rankTitle} • Nivel ${user.level} #FitQuest #FitnessGamificado`;
    
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Unlocked Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              🏅 Sala de Trofeos
            </span>
            <span className="text-xs font-bold text-neutral-400">
              {unlockedCount} de {achievements.length} Desbloqueados
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {t.achievementsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {t.achievementsSubtitle}
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((ach) => {
          const progressPercent = Math.min(100, Math.round((ach.currentProgress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between shadow-xl ${
                ach.unlocked
                  ? 'bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border-neutral-700/80 hover:border-yellow-500/40'
                  : 'bg-neutral-900/60 border-neutral-800/80 opacity-75'
              }`}
            >
              <div>
                {/* Badge Icon & Tier Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
                      ach.unlocked
                        ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 shadow-yellow-500/20'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                    }`}
                  >
                    {ach.unlocked ? getIcon(ach.icon) : <Lock className="w-5 h-5" />}
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border ${getTierBadge(ach.tier)}`}>
                    {ach.tier}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-display font-bold text-lg text-white">
                  {ach.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {ach.description}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-semibold text-neutral-400 mb-1">
                    <span>Progreso: {ach.currentProgress} / {ach.maxProgress}</span>
                    <span className="font-mono">{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ach.unlocked ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-neutral-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions: Share or Claim */}
              <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-yellow-400">
                  +{ach.xpReward} XP
                </span>

                {ach.unlocked ? (
                  <button
                    id={`btn-share-ach-${ach.id}`}
                    onClick={() => handleShareClick(ach)}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t.shareAchievement}</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
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
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Tarjeta de Logro Social
              </span>
              <button
                onClick={() => setSharingAchievement(null)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated Social Card Preview */}
            <div className="bg-gradient-to-tr from-neutral-950 via-neutral-900 to-emerald-950/80 border-2 border-yellow-500/50 rounded-3xl p-6 text-center shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400 mx-auto flex items-center justify-center shadow-xl shadow-yellow-500/20">
                {getIcon(sharingAchievement.icon)}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
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
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover border border-emerald-400" />
                <div className="text-left">
                  <h4 className="font-bold text-xs text-white">{user.name}</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">{user.rankTitle} • Nivel {user.level}</p>
                </div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <button
                id="btn-copy-social-share"
                onClick={handleCopyShareText}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {copiedNotification ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedNotification ? t.shareCopied : t.shareToSocial}</span>
              </button>

              <p className="text-[11px] text-center text-neutral-400">
                Comparte en Instagram Stories, WhatsApp, X o guarda tu insignia.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
