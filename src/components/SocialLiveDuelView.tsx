import React, { useState } from 'react';
import {
  Swords,
  Shield,
  Zap,
  Flame,
  Activity,
  Dumbbell,
  Trophy,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Info,
} from 'lucide-react';
import { UserProfile, WorkoutHistoryEntry, Language, LeaderboardUser } from '../types';
import {
  getAthleteAttributesBreakdown,
  calculateRealStreak,
  LEAGUE_BOTS,
} from '../lib/leagueEngine';
import { translations } from '../lib/i18n';
import { getEquippedFrameClasses } from '../lib/cosmeticFrames';

interface RivalCardProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  league: string;
  rankTitle: string;
  weeklyXp: number;
  totalVolumeKg: number;
  totalDistanceKm: number;
  streakDays: number;
  attributes: {
    strength: number;
    endurance: number;
    agility: number;
    discipline: number;
  };
  overall: number;
  archetype: {
    name: string;
    icon: string;
    description: string;
  };
}

interface SocialLiveDuelViewProps {
  user: UserProfile;
  history?: WorkoutHistoryEntry[];
  lang: Language;
}

export const SocialLiveDuelView: React.FC<SocialLiveDuelViewProps> = ({
  user,
  history = [],
  lang,
}) => {
  const t = translations[lang];

  // 1. Calculate Real User Attributes Breakdown
  const realStreakObj = calculateRealStreak(history, user.shieldUsedDates);
  const effectiveStreak = Math.max(user.stats?.currentStreak || 0, realStreakObj.currentStreak);
  const userBreakdown = getAthleteAttributesBreakdown(history, effectiveStreak, user.level, user);
  const userFrame = getEquippedFrameClasses(user);

  // 2. Build Realistic Rivals from the Current User League
  const leagueBots = LEAGUE_BOTS[user.league] || LEAGUE_BOTS['Bronze'];

  const rivals: RivalCardProfile[] = leagueBots.map((bot, idx) => {
    // Generate deterministic, realistic attributes based on bot stats and level
    const botLevel = Math.max(1, bot.level || 1);
    const botCap = Math.min(99, Math.round(18 + Math.pow(botLevel, 0.95) * 2.2));
    const botMastery = Math.min(20, Math.round(botLevel * 0.45 * 10) / 10);
    const str = Math.min(botCap, Math.max(5, Math.round(5 + botMastery + (bot.totalVolumeKg || 4000) / 4500)));
    const end = Math.min(botCap, Math.max(5, Math.round(5 + botMastery + (bot.totalDistanceKm || 5) * 0.8)));
    const agi = Math.min(botCap, Math.max(5, Math.round(5 + botMastery + (idx % 2 === 0 ? 8 : 4))));
    const dis = Math.min(botCap, Math.max(5, Math.round(5 + botMastery + (bot.streakDays || 1) * 1.2)));
    const ovr = Math.round((str + end + agi + dis) / 4);

    let archetypeName = 'Atleta Híbrido';
    let archetypeIcon = '⚔️';
    let archetypeDesc = 'Equilibrio entre fuerza y constancia semanal.';

    if (str >= end && str >= agi) {
      archetypeName = 'Coloso del Hierro';
      archetypeIcon = '🏋️';
      archetypeDesc = 'Especialista en sobrecarga progresiva y tonelaje alto.';
    } else if (end >= str && end >= agi) {
      archetypeName = 'Motor Aeróbico';
      archetypeIcon = '🏃';
      archetypeDesc = 'Gran capacidad de fondo y distancia acumulada.';
    } else if (agi >= str && agi >= end) {
      archetypeName = 'Especialista en Pista';
      archetypeIcon = '🎾';
      archetypeDesc = 'Velocidad de reacción, HIIT y deportes de cancha.';
    }

    return {
      id: bot.userId,
      name: bot.name,
      avatar: bot.avatar,
      level: bot.level,
      league: user.league,
      rankTitle: bot.rankTitle || 'Guerrero',
      weeklyXp: bot.xpEarned,
      totalVolumeKg: bot.totalVolumeKg || 12000,
      totalDistanceKm: bot.totalDistanceKm || 10,
      streakDays: bot.streakDays || 2,
      attributes: { strength: str, endurance: end, agility: agi, discipline: dis },
      overall: ovr,
      archetype: { name: archetypeName, icon: archetypeIcon, description: archetypeDesc },
    };
  });

  const [selectedRivalId, setSelectedRivalId] = useState<string>(rivals[0]?.id || '');
  const activeRival = rivals.find((r) => r.id === selectedRivalId) || rivals[0];

  // Compare 4 attributes
  const attrKeys: Array<{
    key: 'strength' | 'endurance' | 'agility' | 'discipline';
    name: string;
    code: string;
    color: string;
    barUser: string;
    barRival: string;
  }> = [
    { key: 'strength', name: 'FUERZA', code: 'PWR', color: 'text-red-400', barUser: 'bg-red-500', barRival: 'bg-red-500/60' },
    { key: 'endurance', name: 'RESISTENCIA', code: 'END', color: 'text-cyan-400', barUser: 'bg-cyan-500', barRival: 'bg-cyan-500/60' },
    { key: 'agility', name: 'AGILIDAD', code: 'AGI', color: 'text-amber-400', barUser: 'bg-amber-500', barRival: 'bg-amber-500/60' },
    { key: 'discipline', name: 'DISCIPLINA', code: 'DIS', color: 'text-emerald-400', barUser: 'bg-emerald-500', barRival: 'bg-emerald-500/60' },
  ];

  let userWinsCount = 0;
  let rivalWinsCount = 0;

  attrKeys.forEach(({ key }) => {
    const userVal = userBreakdown.attributes[key];
    const rivalVal = activeRival.attributes[key];
    if (userVal > rivalVal) userWinsCount += 1;
    else if (rivalVal > userVal) rivalWinsCount += 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              ⚔️ Cara a Cara · Ficha FIFA/OVR
            </span>
            <span className="text-xs font-mono font-bold text-neutral-400">
              Liga {user.league}
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-1">
            Comparador de Atletas Real
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Compara tu ficha técnica y tus atributos reales (10 a 99) contra los rivales de tu liga semanal.
          </p>
        </div>

        {/* Rival Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 hidden sm:inline">Rival:</span>
          <select
            value={selectedRivalId}
            onChange={(e) => setSelectedRivalId(e.target.value)}
            className="py-2.5 px-3.5 rounded-2xl bg-[#121214] border border-white/10 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-lg"
          >
            {rivals.map((r) => (
              <option key={r.id} value={r.id}>
                vs {r.name} (MEDIA {r.overall} · Nvl {r.level})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Versus Card (FIFA / EA FC Style) */}
      <div className="bg-gradient-to-br from-[#16161a] via-[#101014] to-[#0a0a0c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-red-500/10 blur-[100px] pointer-events-none" />

        {/* Header VS Badge */}
        <div className="flex items-center justify-center mb-6 relative z-10">
          <div className="px-4 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono font-black text-white flex items-center gap-2 shadow-inner">
            <Swords className="w-4 h-4 text-cyan-400" />
            <span>CARA A CARA EN VIVO</span>
            <span className="text-neutral-500">•</span>
            <span className="text-emerald-400">
              {userWinsCount > rivalWinsCount
                ? '🏆 Ventaja: Tú'
                : userWinsCount < rivalWinsCount
                ? `⚡ Ventaja: ${activeRival.name}`
                : '⚖️ Empate Técnico'}
            </span>
          </div>
        </div>

        {/* Cards Row: User vs Rival */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 mb-8">
          {/* USER CARD (Left) */}
          <div className="bg-gradient-to-b from-cyan-950/30 to-black/40 border-2 border-cyan-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={`w-16 h-16 rounded-2xl object-cover border-2 shadow-xl ${userFrame.borderClass} ${userFrame.glowClass}`}
                  />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-cyan-500 text-neutral-950 font-mono font-black text-[9px]">
                    TÚ
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Nivel {user.level}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {userBreakdown.overallTierLabel}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-black text-white">{user.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    {userBreakdown.archetype.icon} {userBreakdown.archetype.name}
                  </p>
                </div>
              </div>

              {/* Big OVR Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
                <span className="text-[9px] font-mono font-black text-neutral-950 uppercase leading-none">
                  MEDIA
                </span>
                <span className="text-2xl font-mono font-black text-neutral-950 leading-tight">
                  {userBreakdown.overall}
                </span>
                <span className="text-[8px] font-mono font-bold text-neutral-900 leading-none">
                  OVR
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 italic mb-4 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">
              "{userBreakdown.archetype.description}"
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Racha Activa</span>
                <span className="text-sm font-bold text-white">{effectiveStreak} días</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Entrenos Totales</span>
                <span className="text-sm font-bold text-white">{history.length} misiones</span>
              </div>
            </div>
          </div>

          {/* RIVAL CARD (Right) */}
          <div className="bg-gradient-to-b from-red-950/20 to-black/40 border border-white/10 hover:border-red-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden transition-colors">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={activeRival.avatar}
                    alt={activeRival.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono font-black text-[9px] border border-white/10">
                    RIVAL
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                      Nivel {activeRival.level}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-white/10 text-neutral-300">
                      Liga {activeRival.league}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-black text-white">{activeRival.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    {activeRival.archetype.icon} {activeRival.archetype.name}
                  </p>
                </div>
              </div>

              {/* Big OVR Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/15 p-0.5 flex flex-col items-center justify-center shadow-lg shrink-0">
                <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase leading-none">
                  MEDIA
                </span>
                <span className="text-2xl font-mono font-black text-white leading-tight">
                  {activeRival.overall}
                </span>
                <span className="text-[8px] font-mono font-bold text-neutral-500 leading-none">
                  OVR
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 italic mb-4 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">
              "{activeRival.archetype.description}"
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Racha Semanal</span>
                <span className="text-sm font-bold text-white">{activeRival.streakDays} días</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-neutral-400 block">XP de Liga Semanal</span>
                <span className="text-sm font-bold text-cyan-400">{activeRival.weeklyXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Attribute Comparison Bars */}
        <div className="bg-black/50 border border-white/5 rounded-2xl p-5 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              📊 Comparativa Atributo por Atributo
            </span>
            <span className="text-xs font-mono text-neutral-400">
              Escala Oficial 10 a 99
            </span>
          </div>

          <div className="space-y-4">
            {attrKeys.map(({ key, name, code, color, barUser, barRival }) => {
              const uVal = userBreakdown.attributes[key];
              const rVal = activeRival.attributes[key];
              const diff = uVal - rVal;

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <span className={`${color}`}>{name}</span>
                      <span className="text-[10px] text-neutral-500">({code})</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${diff > 0 ? 'text-cyan-400 font-black' : 'text-neutral-400'}`}>
                        {uVal} <span className="text-[10px] text-neutral-500 font-normal">Tú</span>
                      </span>
                      <span className="text-neutral-600 font-normal">vs</span>
                      <span className={`text-sm ${diff < 0 ? 'text-red-400 font-black' : 'text-neutral-400'}`}>
                        {rVal} <span className="text-[10px] text-neutral-500 font-normal">Rival</span>
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          diff > 0
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : diff < 0
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-white/5 text-neutral-400'
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '='}
                      </span>
                    </div>
                  </div>

                  {/* Dual comparison bar */}
                  <div className="grid grid-cols-2 gap-1.5 h-2">
                    {/* User bar (left aligned right) */}
                    <div className="h-full bg-neutral-900 rounded-l-full overflow-hidden flex justify-end">
                      <div
                        className={`h-full ${barUser} rounded-l-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, (uVal / 99) * 100)}%` }}
                      />
                    </div>
                    {/* Rival bar (right aligned left) */}
                    <div className="h-full bg-neutral-900 rounded-r-full overflow-hidden flex justify-start">
                      <div
                        className={`h-full ${barRival} rounded-r-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, (rVal / 99) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
