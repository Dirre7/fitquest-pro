import React, { useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Flame,
  Star,
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import { getLevelTier, LEVEL_MILESTONES } from '../lib/progressionEngine';
import { sound } from '../lib/soundFx';

interface LevelUpCelebrationModalProps {
  user: UserProfile;
  newLevel: number;
  onClose: () => void;
  onEquipTitle?: (newTitle: string) => void;
}

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  user,
  newLevel,
  onClose,
  onEquipTitle,
}) => {
  const tier = getLevelTier(newLevel);
  const milestone = LEVEL_MILESTONES.find((m) => m.level === newLevel);

  useEffect(() => {
    try {
      sound.playLevelUp();
    } catch {}
  }, []);

  const safePlayClick = () => {
    try {
      sound.playClick();
    } catch {}
  };

  const handleEquipAndClose = () => {
    safePlayClick();
    if (milestone?.title && onEquipTitle) {
      onEquipTitle(milestone.title);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] pointer-events-auto flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gradient-to-b from-[#18181f] via-[#121217] to-[#0c0c0f] border-2 border-cyan-400/50 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.4)] flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Ambient Pulsing Glow Orbs */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[90px] pointer-events-none opacity-60 animate-pulse"
          style={{ backgroundColor: tier.accentColor }}
        />
        <div className="absolute -bottom-20 right-0 w-48 h-48 bg-blue-600/30 blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-black uppercase tracking-wider mb-4 shadow-md">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          ¡SUBIDA DE NIVEL ÉPICA!
        </div>

        {/* Big Animated Level Shield Emblem */}
        <div className="relative my-2">
          {/* Shockwave halo */}
          <div
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex flex-col items-center justify-center border-4 shadow-2xl relative z-10 font-mono transition-transform duration-500 scale-105"
            style={{
              borderColor: tier.accentColor,
              backgroundColor: `${tier.accentColor}25`,
              boxShadow: `0 0 40px ${tier.glowColor}`,
            }}
          >
            <span className="text-3xl sm:text-4xl">{tier.badgeIcon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300 mt-1">
              NIVEL
            </span>
            <span
              className="text-3xl sm:text-4xl font-black tracking-tight"
              style={{ color: tier.accentColor }}
            >
              {newLevel}
            </span>
          </div>
        </div>

        {/* Level Up Title Banner */}
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight mt-4">
          ¡Nivel {newLevel} Conquistado!
        </h2>

        <p className="text-xs sm:text-sm text-neutral-300 mt-1 font-mono">
          Rango: <span className="font-bold" style={{ color: tier.accentColor }}>{tier.name}</span>
        </p>

        {/* Unlocked Reward Box */}
        {milestone ? (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 my-4 text-left">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              🎉 Nueva Recompensa Desbloqueada
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{milestone.icon}</span>
              <div>
                <h4 className="text-sm font-bold text-white">{milestone.rewardLabel}</h4>
                <p className="text-xs text-neutral-400">{milestone.description}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 my-4">
            <p className="text-xs text-neutral-300 font-mono">
              ⚡ Tus atributos han aumentado: +Fuerza, +Resistencia y +Disciplina.
            </p>
          </div>
        )}

        {/* Stats Boost Mini Grid */}
        <div className="grid grid-cols-3 gap-2 w-full mb-5 font-mono text-[11px]">
          <div className="bg-black/40 border border-white/5 rounded-xl p-2 text-center">
            <span className="text-cyan-400 font-bold block">+Fuerza</span>
            <span className="text-neutral-400">Potencia</span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2 text-center">
            <span className="text-blue-400 font-bold block">+Disciplina</span>
            <span className="text-neutral-400">Constancia</span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2 text-center">
            <span className="text-emerald-400 font-bold block">+XP Liga</span>
            <span className="text-neutral-400">Podio</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          {milestone?.title ? (
            <button
              onClick={handleEquipAndClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 fill-current" />
              <span>Equipar "{milestone.title}" y Continuar</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>¡Continuar Entrenando!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
