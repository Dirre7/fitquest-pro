import React, { useEffect } from 'react';
import { Trophy, ArrowRight, Zap, Shield, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeagueEvaluationResult, LEAGUE_HIERARCHY } from '../lib/leagueEngine';
import { League, Language } from '../types';
import { sound } from '../lib/soundFx';

interface LeagueCelebrationModalProps {
  result: LeagueEvaluationResult;
  onClose: () => void;
  lang?: Language;
}

const LEAGUE_THEMES: Record<
  League,
  { name: string; color: string; bg: string; border: string; glow: string; badge: string }
> = {
  Bronze: {
    name: 'Liga Bronce',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    badge: '🥉',
  },
  Silver: {
    name: 'Liga Plata',
    color: 'text-neutral-200',
    bg: 'bg-white/10',
    border: 'border-white/30',
    glow: 'shadow-[0_0_30px_rgba(255,255,255,0.2)]',
    badge: '🥈',
  },
  Gold: {
    name: 'Liga Oro',
    color: 'text-amber-300',
    bg: 'bg-amber-400/15',
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_35px_rgba(251,191,36,0.35)]',
    badge: '🥇',
  },
  Diamond: {
    name: 'Liga Diamante',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-400/40',
    glow: 'shadow-[0_0_40px_rgba(6,182,212,0.4)]',
    badge: '💎',
  },
  Titan: {
    name: 'Liga Titán',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-400/50',
    glow: 'shadow-[0_0_45px_rgba(168,85,247,0.45)]',
    badge: '👑',
  },
};

export const LeagueCelebrationModal: React.FC<LeagueCelebrationModalProps> = ({
  result,
  onClose,
}) => {
  const isPromoted = result.status === 'promoted';
  const isDemoted = result.status === 'demoted';

  const prevTheme = LEAGUE_THEMES[result.previousLeague] || LEAGUE_THEMES.Bronze;
  const newTheme = LEAGUE_THEMES[result.newLeague] || LEAGUE_THEMES.Silver;

  useEffect(() => {
    if (isPromoted) {
      try {
        sound.playLevelUp();
      } catch {}

      // Fire celebratory confetti bursts
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#eab308', '#ffffff', '#a855f7'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#06b6d4', '#eab308'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#a855f7', '#ffffff'],
        });
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isPromoted]);

  const handleConfirm = () => {
    sound.playBeep(650, 40);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-md bg-[#121215] border rounded-3xl p-6 sm:p-8 text-center overflow-hidden shadow-2xl transition-all ${
          isPromoted ? `${newTheme.border} ${newTheme.glow}` : 'border-white/10'
        }`}
      >
        {/* Subtle background ambient glow */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            backgroundColor: isPromoted ? '#06b6d4' : isDemoted ? '#ef4444' : '#64748b'
          }}
        />

        {/* Close Button top-right */}
        <button
          type="button"
          onClick={handleConfirm}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Trophy / Icon */}
        <div className="mx-auto mb-4 flex items-center justify-center">
          {isPromoted ? (
            <div className={`w-20 h-20 rounded-3xl ${newTheme.bg} ${newTheme.border} border-2 flex items-center justify-center shadow-xl animate-bounce duration-1000`}>
              <Trophy className={`w-10 h-10 ${newTheme.color}`} />
            </div>
          ) : isDemoted ? (
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center shadow-xl">
              <Shield className="w-10 h-10 text-red-400" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center shadow-xl">
              <Shield className="w-10 h-10 text-cyan-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1 mb-5">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-400">
            {isPromoted ? 'CIERRE SEMANAL DE COMPETICIÓN' : 'REINICIO SEMANAL DE LIGA'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            {isPromoted ? '¡ASCENSO CONQUISTADO!' : isDemoted ? 'Descenso de División' : 'Posición Mantenida'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans mt-2 max-w-sm mx-auto leading-relaxed">
            {isPromoted
              ? 'Has culminado la semana en el podio. Tu disciplina te ha colocado en la siguiente división.'
              : isDemoted
              ? 'Esta semana fue reñida y has descendido de división. ¡Aprovecha estos 7 días para recuperar el podio!'
              : 'Has defendido tu puesto en la liga. ¡Comienza una nueva semana de competencia para alcanzar el podio!'}
          </p>
        </div>

        {/* League Transition Card */}
        <div className="flex items-center justify-center gap-3 py-4 px-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-5">
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl">{prevTheme.badge}</span>
            <span className={`text-xs font-mono font-bold mt-1 ${prevTheme.color}`}>
              {prevTheme.name}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">Semana Anterior</span>
          </div>

          <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 text-neutral-400">
            <ArrowRight className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl animate-pulse">{newTheme.badge}</span>
            <span className={`text-xs font-mono font-black mt-1 ${newTheme.color}`}>
              {newTheme.name}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">Nueva División</span>
          </div>
        </div>

        {/* Reward Callout */}
        {result.rewardXp > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs mb-6 shadow-sm">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>+{result.rewardXp} XP de Recompensa de Podio añadidos a tu cuenta</span>
          </div>
        )}

        {/* Confirmation Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className={`w-full py-3.5 px-6 rounded-2xl font-mono font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer ${
            isPromoted
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-neutral-950 hover:brightness-110 shadow-cyan-500/25'
              : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
          }`}
        >
          {isPromoted ? `¡Entrar a ${newTheme.name}!` : 'Comenzar Nueva Semana'}
        </button>
      </div>
    </div>
  );
};
