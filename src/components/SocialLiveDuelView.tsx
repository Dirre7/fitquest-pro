import React, { useState, useEffect } from 'react';
import {
  Swords,
  Users,
  Play,
  Flame,
  Zap,
  Trophy,
  Heart,
  Timer,
  Sparkles,
  MessageSquare,
  Smile,
  Shield,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, SmartwatchDevice, Language } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  level: number;
  reps: number;
  bpm: number;
  isCurrentUser?: boolean;
}

interface SocialLiveDuelViewProps {
  user: UserProfile;
  smartwatch: SmartwatchDevice;
  lang: Language;
  onDuelWin: (xpGained: number) => void;
}

export const SocialLiveDuelView: React.FC<SocialLiveDuelViewProps> = ({
  user,
  smartwatch,
  lang,
  onDuelWin,
}) => {
  const t = translations[lang];

  // Duel Mode state: 'lobby' | 'countdown' | 'in_progress' | 'victory'
  const [duelStatus, setDuelStatus] = useState<'lobby' | 'countdown' | 'in_progress' | 'victory'>('lobby');
  const [countdown, setCountdown] = useState<number>(3);
  const [targetReps, setTargetReps] = useState<number>(50);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [userReps, setUserReps] = useState<number>(0);
  const [activeFloatingReactions, setActiveFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);

  // Competitors
  const [opponents, setOpponents] = useState<Participant[]>([
    {
      id: 'opp_1',
      name: 'Elena Beast',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      level: 18,
      reps: 0,
      bpm: 148,
    },
    {
      id: 'opp_2',
      name: 'Marcus Titan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      level: 21,
      reps: 0,
      bpm: 162,
    },
    {
      id: 'opp_3',
      name: 'Sofia Runner',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      level: 15,
      reps: 0,
      bpm: 155,
    },
  ]);

  // Start Duel flow
  const handleStartDuel = () => {
    setUserReps(0);
    setOpponents((prev) => prev.map((o) => ({ ...o, reps: 0 })));
    setTimeRemaining(60);
    setDuelStatus('countdown');
    setCountdown(3);
    sound.playBeep(880, 100);
  };

  // Countdown timer
  useEffect(() => {
    if (duelStatus !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        sound.playBeep(countdown === 1 ? 1200 : 700, 150);
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setDuelStatus('in_progress');
      sound.playLevelUp();
    }
  }, [duelStatus, countdown]);

  // In-progress active duel simulation loop
  useEffect(() => {
    if (duelStatus !== 'in_progress') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishDuel();
          return 0;
        }
        return prev - 1;
      });

      // Simulate opponents pacing
      setOpponents((prev) =>
        prev.map((opp) => {
          if (opp.reps >= targetReps) return opp;
          const randomIncrement = Math.random() > 0.35 ? 1 : 0;
          return {
            ...opp,
            reps: Math.min(targetReps, opp.reps + randomIncrement),
            bpm: Math.min(185, opp.bpm + (Math.random() > 0.5 ? 1 : -1)),
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [duelStatus, targetReps, userReps]);

  // Add User Rep
  const handleAddUserRep = () => {
    if (duelStatus !== 'in_progress') return;

    sound.playBeep(950, 40);
    const nextReps = userReps + 1;
    setUserReps(nextReps);

    if (nextReps >= targetReps) {
      handleFinishDuel();
    }
  };

  const handleFinishDuel = () => {
    setDuelStatus('victory');
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
    onDuelWin(450);
  };

  // Floating emoji reaction
  const handleSendReaction = (emoji: string) => {
    sound.playBeep(1100, 50);
    const newReaction = {
      id: `react_${Date.now()}_${Math.random()}`,
      emoji,
      x: Math.floor(Math.random() * 80) + 10,
    };
    setActiveFloatingReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setActiveFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2000);
  };

  // Compile all participants sorted by reps
  const allParticipants = [
    {
      id: user.id,
      name: `${user.name} (Tú)`,
      avatar: user.avatar,
      level: user.level,
      reps: userReps,
      bpm: smartwatch.liveHeartRate || 145,
      isCurrentUser: true,
    },
    ...opponents,
  ].sort((a, b) => b.reps - a.reps);

  const currentUserRank = allParticipants.findIndex((p) => p.isCurrentUser) + 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Floating Animated Reaction Emojis */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {activeFloatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-20 text-3xl sm:text-4xl animate-bounce transition-all duration-1000"
            style={{ left: `${r.x}%`, transform: 'translateY(-120px)' }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              🔴 Multijugador en Vivo
            </span>
            <span className="text-xs font-bold text-neutral-400">
              {allParticipants.length} Atletas Conectados
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {t.socialDuelTitle}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {t.socialDuelSubtitle}
          </p>
        </div>

        {duelStatus === 'lobby' && (
          <button
            id="btn-start-social-duel"
            onClick={handleStartDuel}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-xl shadow-red-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Swords className="w-5 h-5 stroke-[2.5]" />
            <span>Iniciar Duelo en Vivo (+450 XP)</span>
          </button>
        )}
      </div>

      {/* Countdown Splash */}
      {duelStatus === 'countdown' && (
        <div className="bg-neutral-900 border-2 border-red-500/50 rounded-3xl p-12 text-center shadow-2xl flex flex-col items-center justify-center">
          <span className="text-sm font-extrabold uppercase text-red-400 tracking-widest">
            {t.countDown}
          </span>
          <h1 className="font-display font-black text-7xl sm:text-8xl text-white my-4 animate-ping">
            {countdown > 0 ? countdown : '¡YA!'}
          </h1>
          <p className="text-xs text-neutral-400">Meta: {targetReps} flexiones / repeticiones a máxima velocidad</p>
        </div>
      )}

      {/* Active Battle Arena */}
      {duelStatus === 'in_progress' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Battle HUD Top */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                  {t.repBattle} (Meta: {targetReps} reps)
                </span>
                <h3 className="font-display font-extrabold text-xl text-white">
                  Posición Actual: #{currentUserRank}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-neutral-400 block">Tiempo Restante</span>
              <span className="font-mono font-black text-2xl text-red-400">{timeRemaining}s</span>
            </div>
          </div>

          {/* Big Interactive Tap / Rep Button for Current User */}
          <div className="text-center py-4">
            <button
              id="btn-live-rep-counter"
              onClick={handleAddUserRep}
              className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 text-black font-black text-4xl sm:text-5xl shadow-2xl shadow-red-500/40 flex flex-col items-center justify-center mx-auto transition-transform active:scale-90 hover:scale-105 select-none"
            >
              <span>{userReps}</span>
              <span className="text-xs uppercase font-extrabold mt-1 tracking-wider">
                ¡PULSA +1 REP!
              </span>
            </button>
            <p className="text-xs text-neutral-400 mt-3 font-semibold">
              O presiona la pantalla / barra espaciadora
            </p>
          </div>

          {/* Quick Reaction Bar */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-xs font-bold text-neutral-400 mr-2 flex items-center gap-1">
              <Smile className="w-4 h-4 text-amber-400" /> Reaccionar:
            </span>
            {['🔥', '⚡', '💪', '🏆', '💥', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-lg flex items-center justify-center transition-transform hover:scale-125 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Victory / Summary Card */}
      {duelStatus === 'victory' && (
        <div className="bg-gradient-to-b from-amber-950/40 via-neutral-900 to-neutral-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-black mx-auto flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="font-display font-black text-3xl text-white">
            {currentUserRank === 1 ? '¡CAMPEÓN DEL DUELO!' : `¡Duelo Finalizado! #${currentUserRank}`}
          </h2>
          <p className="text-xs text-neutral-300">
            Completaste {userReps} repeticiones en el tiempo límite. Has ganado +450 XP y 35 Puntos de Liga.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setDuelStatus('lobby')}
              className="px-6 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
            >
              Volver al Lobby
            </button>
            <button
              onClick={handleStartDuel}
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg"
            >
              Revancha Inmediata
            </button>
          </div>
        </div>
      )}

      {/* Live Competitors Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-red-400" />
          <span>{t.liveOpponents}</span>
        </h3>

        <div className="space-y-2.5">
          {allParticipants.map((p, idx) => {
            const progressPercent = Math.min(100, Math.round((p.reps / targetReps) * 100));

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  p.isCurrentUser
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-neutral-800/60 border-neutral-700/70'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-neutral-700 text-neutral-200 font-mono font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-neutral-600" />
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                        {p.name}
                        {p.isCurrentUser && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 rounded">TÚ</span>
                        )}
                      </h4>
                      <span className="text-[11px] text-neutral-400">Nv. {p.level} • {p.bpm} BPM</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-extrabold text-lg text-white">
                      {p.reps} <span className="text-xs text-neutral-400 font-sans">/ {targetReps} reps</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      p.isCurrentUser ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-orange-500 to-amber-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
