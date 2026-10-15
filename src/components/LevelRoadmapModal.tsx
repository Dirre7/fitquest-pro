import React, { useState } from 'react';
import {
  Trophy,
  X,
  Sparkles,
  Check,
  Lock,
  ChevronRight,
  Shield,
  Zap,
  Flame,
  Award,
  Crown
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import {
  getLevelTier,
  getNextMilestone,
  LEVEL_MILESTONES,
  getXpProgressPercent,
  PRESTIGE_TIERS
} from '../lib/progressionEngine';
import { sound } from '../lib/soundFx';

interface LevelRoadmapModalProps {
  user: UserProfile;
  lang: Language;
  onClose: () => void;
  onEquipTitle?: (newTitle: string) => void;
}

export const LevelRoadmapModal: React.FC<LevelRoadmapModalProps> = ({
  user,
  onClose,
  onEquipTitle,
}) => {
  const currentLevel = user.level || 1;
  const currentXp = user.currentLevelXp || 0;
  const nextXp = user.nextLevelXp || 500;
  const xpPercent = getXpProgressPercent(currentXp, nextXp);
  const remainingXp = Math.max(0, nextXp - currentXp);

  const currentTier = getLevelTier(currentLevel);
  const nextMilestone = getNextMilestone(currentLevel);

  const [filterTier, setFilterTier] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const safePlayClick = () => {
    try {
      sound.playClick();
    } catch {}
  };

  const safePlaySuccess = () => {
    try {
      sound.playSuccess();
    } catch {}
  };

  const handleSelectTitle = (title: string) => {
    safePlaySuccess();
    if (onEquipTitle) {
      onEquipTitle(title);
      showToast(`✓ Título equipado: "${title}"`);
    }
  };

  const filteredMilestones = LEVEL_MILESTONES.filter((m) => {
    if (filterTier === 'all') return true;
    return m.tier === filterTier;
  });

  return (
    <div className="fixed inset-0 z-[80] pointer-events-auto flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#101014] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Glow ambient background based on user's current tier */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[110px] pointer-events-none opacity-40"
          style={{ backgroundColor: currentTier.accentColor }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-[110px] pointer-events-none opacity-30"
          style={{ backgroundColor: currentTier.accentColor }}
        />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${currentTier.borderColor} bg-black/40 shadow-lg`}
            >
              {currentTier.badgeIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Ruta de Rangos y Niveles
                </h3>
                <span
                  className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border shadow-sm"
                  style={{
                    color: currentTier.accentColor,
                    borderColor: `${currentTier.accentColor}40`,
                    backgroundColor: `${currentTier.accentColor}15`,
                  }}
                >
                  {currentTier.name}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Desbloquea títulos honoríficos, marcos cibernéticos y prestigio atlético
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              safePlayClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Level Status Card Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border-b border-white/10 relative z-10 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Left: Level counter & Active Title */}
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono border-2 shadow-xl shrink-0"
                style={{
                  borderColor: currentTier.accentColor,
                  backgroundColor: `${currentTier.accentColor}15`,
                }}
              >
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nivel</span>
                <span
                  className="text-2xl font-black tracking-tight"
                  style={{ color: currentTier.accentColor }}
                >
                  {currentLevel}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Título actual:</span>
                  <span className="text-xs font-bold font-mono text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    {user.rankTitle || 'Recluta Inicial'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  XP Acumulado total: <span className="text-cyan-400 font-mono font-bold">{user.xp || 0} XP</span>
                </p>
              </div>
            </div>

            {/* Right: Next Milestone Quick Tracker */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex-1 sm:max-w-xs">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Progreso Nvl {currentLevel + 1}
                </span>
                <span className="text-cyan-400 font-bold">
                  {currentXp} / {nextXp} XP
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${xpPercent}%`,
                    backgroundColor: currentTier.accentColor,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5 font-mono">
                <span>Faltan {remainingXp} XP</span>
                <span className="text-amber-400">Próx. hito: Nvl {nextMilestone.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Filter Tabs */}
        <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => {
              safePlayClick();
              setFilterTier('all');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              filterTier === 'all'
                ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todos los Rangos ({LEVEL_MILESTONES.length})
          </button>

          {Object.values(PRESTIGE_TIERS).map((tier) => (
            <button
              key={tier.id}
              onClick={() => {
                safePlayClick();
                setFilterTier(tier.id);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                filterTier === tier.id
                  ? 'border shadow-sm'
                  : 'text-neutral-400 hover:text-white border border-transparent'
              }`}
              style={{
                color: filterTier === tier.id ? tier.accentColor : undefined,
                borderColor: filterTier === tier.id ? `${tier.accentColor}50` : undefined,
                backgroundColor: filterTier === tier.id ? `${tier.accentColor}15` : undefined,
              }}
            >
              <span>{tier.badgeIcon}</span>
              <span>{tier.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-cyan-500 text-neutral-950 font-mono font-bold text-xs px-4 py-2 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Milestones Scrollable Roadmap */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 relative">
          {filteredMilestones.map((m) => {
            const isUnlocked = currentLevel >= m.level;
            const isCurrent = currentLevel === m.level;
            const tierInfo = PRESTIGE_TIERS[m.tier];
            const isTitleEquipped = user.rankTitle === m.title;

            return (
              <div
                key={m.level}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-cyan-500/10 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg'
                    : isUnlocked
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-black/30 border-white/5 opacity-65'
                }`}
              >
                {/* Left: Level Icon & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border relative ${
                      isUnlocked ? tierInfo.borderColor : 'border-white/10 bg-neutral-900'
                    }`}
                    style={{
                      backgroundColor: isUnlocked ? `${tierInfo.accentColor}20` : undefined,
                    }}
                  >
                    <span>{m.icon}</span>
                    {isCurrent && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-neutral-950 animate-ping" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-neutral-400">
                        Nivel {m.level}
                      </span>
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          color: tierInfo.accentColor,
                          borderColor: `${tierInfo.accentColor}40`,
                          backgroundColor: `${tierInfo.accentColor}10`,
                        }}
                      >
                        {tierInfo.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-cyan-500 text-neutral-950">
                          Tu Nivel Actual
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
                      {m.rewardLabel}
                    </h4>

                    <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                      {m.description}
                    </p>

                    {m.unlockedPerk && (
                      <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono mt-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Recompensa: {m.unlockedPerk}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status / Equip Action */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isUnlocked ? (
                    isTitleEquipped ? (
                      <span className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1 font-mono">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        Equipado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectTitle(m.title)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-cyan-400 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5 text-cyan-400" />
                        Equipar Título
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono px-3 py-1.5 rounded-xl bg-black/40 border border-white/5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Faltan {m.level - currentLevel} niveles</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 sm:p-4 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            Entrena, completa misiones y registra nutrición para ganar XP
          </span>

          <button
            onClick={() => {
              safePlayClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
