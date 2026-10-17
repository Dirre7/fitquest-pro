import React, { useState, useEffect } from 'react';
import {
  Skull,
  Trophy,
  Zap,
  Flame,
  Shield,
  Dumbbell,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import {
  getActiveBossRaid,
  getBossContributions,
  getCurrentMonthName,
} from '../lib/bossRaidEngine';
import { sound } from '../lib/soundFx';

interface MonthlyBossRaidViewProps {
  user: UserProfile;
  lang: Language;
  onNavigateRoutines?: () => void;
}

export const MonthlyBossRaidView: React.FC<MonthlyBossRaidViewProps> = ({
  user,
  onNavigateRoutines,
}) => {
  const [boss, setBoss] = useState(getActiveBossRaid());
  const [squad, setSquad] = useState(getBossContributions(user));

  useEffect(() => {
    const handleBossUpdate = () => {
      setBoss(getActiveBossRaid());
      setSquad(getBossContributions(user));
    };

    window.addEventListener('fitquest_boss_updated', handleBossUpdate);
    return () => window.removeEventListener('fitquest_boss_updated', handleBossUpdate);
  }, [user]);

  const progressPct = Math.min(100, Math.round((boss.currentDamageKg / boss.maxHpKg) * 100));
  const remainingHpKg = Math.max(0, boss.maxHpKg - boss.currentDamageKg);
  const remainingHpPct = Math.max(0, 100 - progressPct);
  const isDefeated = boss.status === 'defeated' || remainingHpKg === 0;

  // Find user's contribution
  const userEntry = squad.find((c) => c.userId === user.id || c.userName === user.name);
  const userDamage = userEntry ? userEntry.damageKg : 0;
  const userRank = userEntry ? squad.indexOf(userEntry) + 1 : squad.length;
  const userPct = Math.min(100, ((userDamage / Math.max(1, boss.maxHpKg)) * 100)).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* 🌋 Hero Boss Raid Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1c1214] via-[#161218] to-[#09090b] border border-rose-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-rose-950/60 border-2 border-rose-500/50 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_30px_rgba(244,63,94,0.4)] animate-pulse shrink-0">
              {boss.avatar}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 tracking-wider">
                  {isDefeated ? '👑 DERROTADO' : '⚔️ INCURSIÓN COMUNITARIA ACTIVA'}
                </span>
                <span className="text-[10px] font-mono font-bold text-neutral-400">
                  {boss.month || getCurrentMonthName()}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                {boss.name}
              </h2>
              <p className="text-xs text-rose-200/80 font-mono mt-0.5 flex items-center gap-1.5">
                <span>Elemento: {boss.element}</span> • <span>HP Total: {(boss.maxHpKg / 1000).toLocaleString()} Toneladas</span>
              </p>
            </div>
          </div>

          {/* Quick Action */}
          {onNavigateRoutines && !isDefeated && (
            <button
              onClick={onNavigateRoutines}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-neutral-950 px-4 py-2.5 rounded-2xl text-xs font-mono font-black uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Dumbbell className="w-4 h-4 fill-current" />
              <span>ENTRENAR Y ATACAR</span>
            </button>
          )}
        </div>

        {/* Collective HP Bar */}
        <div className="relative z-10 pt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Skull className="w-4 h-4 text-rose-400" />
              <span>Vida Colectiva del Jefe</span>
            </span>
            <span className="font-black text-rose-400">
              {isDefeated ? '¡0 KG (DERROTADO)!' : `${remainingHpKg.toLocaleString()} kg restantes (${remainingHpPct}% HP)`}
            </span>
          </div>

          <div className="h-5 bg-black/60 rounded-2xl border border-white/10 p-0.5 overflow-hidden shadow-inner relative">
            <div
              className={`h-full rounded-xl transition-all duration-700 relative overflow-hidden ${
                isDefeated
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                  : 'bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]'
              }`}
              style={{ width: `${progressPct}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-neutral-400 pt-1">
            <span>Daño infligido: {boss.currentDamageKg.toLocaleString()} kg ({progressPct}%)</span>
            <span>Objetivo: {boss.maxHpKg.toLocaleString()} kg</span>
          </div>
        </div>

        {/* Exclusive Raid Reward Teaser */}
        <div className="relative z-10 mt-6 p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 shadow">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Recompensa Exclusiva de Incursión
              </p>
              <p className="text-xs font-bold text-white">
                {boss.rewardBadgeName} <span className="text-cyan-400 font-mono">+{boss.rewardXp} XP</span>
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-300 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
            {isDefeated
              ? '✅ Incursión completada: medalla desbloqueada'
              : '⚡ Se otorga a todos los atletas que ataquen este mes'}
          </div>
        </div>
      </div>

      {/* 👥 Squad de Asalto Comunitario (Leaderboard of Contributions) */}
      <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">
              SQUAD DE ASALTO COMUNITARIO
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Top Levantadores de la Incursión
          </span>
        </div>

        {/* User personal contribution highlight */}
        <div className="bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover border border-cyan-400 shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Tu Contribución</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Posición #{userRank}
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-400">
                {userDamage.toLocaleString()} kg levantados ({userPct}% del total)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-white block">
              {userEntry?.attacksCount || 0} ataques
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">sesiones sumadas</span>
          </div>
        </div>

        {/* Top Squad List */}
        <div className="space-y-2 pt-2">
          {squad.slice(0, 5).map((member, idx) => {
            const isMe = member.userId === user.id || member.userName === user.name;
            const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

            return (
              <div
                key={member.userId + idx}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                  isMe
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 font-mono font-bold text-xs text-neutral-400 text-center">
                    {rankIcon}
                  </div>
                  <img
                    src={member.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.userName}`}
                    alt={member.userName}
                    className="w-8 h-8 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{member.userName}</span>
                      {isMe && <span className="text-[9px] font-mono bg-cyan-400 text-neutral-950 px-1.5 py-0.2 rounded font-black">TÚ</span>}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      {member.attacksCount} entrenamientos completados
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-rose-400">
                    {member.damageKg.toLocaleString()} kg
                  </p>
                  <p className="text-[10px] font-mono text-neutral-500">
                    {((member.damageKg / Math.max(1, boss.maxHpKg)) * 100).toFixed(1)}% HP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ℹ️ How it works card */}
      <div className="bg-[#121214] border border-white/5 rounded-3xl p-5 text-neutral-300 text-xs font-mono space-y-2">
        <p className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mecánica de la Incursión Mensual</span>
        </p>
        <p className="text-neutral-400 leading-relaxed">
          Cada entrenamiento de fuerza o cardio que registras en FitQuest suma directamente al daño infligido contra el jefe. 
          Al final del mes, todos los atletas que hayan infligido al menos 1,000 kg reciben la medalla exclusiva de edición limitada y los 500 XP de bonificación.
        </p>
      </div>

    </div>
  );
};
