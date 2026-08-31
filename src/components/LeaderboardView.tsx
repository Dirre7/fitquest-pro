import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Flame,
  Shield,
  Users,
  Globe,
  TrendingUp,
  Sparkles,
  Award,
  ChevronUp,
  ChevronDown,
  Clock,
  Zap
} from 'lucide-react';
import { LeaderboardUser, League, Language, UserProfile, WorkoutHistoryEntry } from '../types';
import { translations } from '../lib/i18n';
import { 
  getCountdownToSunday, 
  getLeagueLeaderboard, 
  calculateUserWeeklyXp, 
  LEAGUE_HIERARCHY, 
  WeeklyCountdown 
} from '../lib/leagueEngine';

interface LeaderboardViewProps {
  users?: LeaderboardUser[];
  user: UserProfile;
  history?: WorkoutHistoryEntry[];
  currentLeague: League;
  lang: Language;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  history = [],
  currentLeague,
  lang,
}) => {
  const t = translations[lang];
  const [selectedLeague, setSelectedLeague] = useState<League>(currentLeague || user.league || 'Bronze');
  const [filterMode, setFilterMode] = useState<'global' | 'friends'>('global');
  const [countdown, setCountdown] = useState<WeeklyCountdown>(getCountdownToSunday());

  // Real-time live countdown timer to Sunday 23:59:59
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownToSunday());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selected league if user league changes
  useEffect(() => {
    if (user.league) {
      setSelectedLeague(user.league);
    }
  }, [user.league]);

  const leagues: { id: League; name: string; color: string }[] = [
    { id: 'Bronze', name: 'Liga Bronce', color: 'text-amber-600 border-amber-600/40 bg-amber-600/10' },
    { id: 'Silver', name: 'Liga Plata', color: 'text-neutral-300 border-neutral-400/40 bg-neutral-400/10' },
    { id: 'Gold', name: 'Liga Oro', color: 'text-amber-400 border-amber-400/40 bg-amber-400/10' },
    { id: 'Diamond', name: 'Liga Diamante', color: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' },
    { id: 'Titan', name: 'Liga Titán', color: 'text-purple-400 border-purple-400/40 bg-purple-400/10' },
  ];

  const userWeeklyXp = calculateUserWeeklyXp(user, history);
  const leagueLeaderboard = getLeagueLeaderboard(selectedLeague, user, userWeeklyXp, history);

  const filteredUsers = leagueLeaderboard.filter((u) => {
    if (filterMode === 'friends') return u.isFriend || u.isCurrentUser;
    return true;
  });

  const top3 = filteredUsers.slice(0, 3);
  const restOfUsers = filteredUsers.slice(3);

  const currentLeagueIdx = LEAGUE_HIERARCHY.indexOf(selectedLeague);
  const nextLeague = currentLeagueIdx < LEAGUE_HIERARCHY.length - 1 ? LEAGUE_HIERARCHY[currentLeagueIdx + 1] : null;
  const prevLeague = currentLeagueIdx > 0 ? LEAGUE_HIERARCHY[currentLeagueIdx - 1] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Weekly Reset Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              LIGA SEMANAL ACTIVA
            </span>
            <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Cierre: <span className="text-emerald-400 font-extrabold">{countdown.formatted}</span></span>
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1.5">
            Clasificación & Ligas
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Compite con atletas de tu mismo rango. El Top 3 asciende este domingo a las 23:59.
          </p>
        </div>

        {/* Global vs Friends Toggle */}
        <div className="flex bg-neutral-900 border border-white/10 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setFilterMode('global')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'global'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Global</span>
          </button>
          <button
            onClick={() => setFilterMode('friends')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'friends'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Amigos</span>
          </button>
        </div>
      </div>

      {/* League Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {leagues.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLeague(l.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              selectedLeague === l.id
                ? `${l.color} shadow-lg scale-105 font-black`
                : 'bg-[#121214] border-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <span>{l.name}</span>
            {user.league === l.id && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500 text-neutral-950 font-black">
                MI LIGA
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Promotion & Demotion Rules Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#121214] to-neutral-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-300 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ChevronUp className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <p className="font-bold text-white">Zona de Ascenso: Puestos 1º al 3º</p>
            <p className="text-[11px] text-neutral-400">
              {nextLeague ? `Suben a la Liga ${nextLeague} al cierre del domingo` : '¡Máxima liga alcanzada!'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-bold">
            Top 3: Ascenso +350 XP
          </span>
          {prevLeague && (
            <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-xl font-bold">
              Puesto 5-6: Descenso
            </span>
          )}
        </div>
      </div>

      {/* Top 3 Podium Display */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-4 pb-2">
          
          {/* #2 Silver Podium */}
          <div className={`border rounded-3xl p-4 text-center relative shadow-xl transform hover:-translate-y-1 transition-transform ${
            top3[1].isCurrentUser ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-[#121214] border-white/10'
          }`}>
            <div className="w-6 h-6 rounded-full bg-neutral-300 text-black font-extrabold text-xs mx-auto -mt-7 mb-2 flex items-center justify-center shadow">
              2
            </div>
            <img
              src={top3[1].avatar}
              alt={top3[1].name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover mx-auto border-2 border-neutral-300 shadow-md mb-2"
            />
            <h4 className="font-bold text-white text-xs truncate">{top3[1].name}</h4>
            <p className="font-mono font-extrabold text-xs sm:text-sm text-neutral-300 mt-1">
              {top3[1].xpEarned} <span className="text-[10px] font-sans font-normal text-neutral-500">XP</span>
            </p>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">↑ Asciende</span>
          </div>

          {/* #1 Gold Center Podium */}
          <div className={`border-2 rounded-3xl p-4 sm:p-5 text-center relative shadow-2xl transform hover:-translate-y-2 transition-transform ${
            top3[0].isCurrentUser ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'bg-gradient-to-b from-amber-950/40 via-[#121214] to-[#121214] border-amber-400/60'
          }`}>
            <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-black text-sm mx-auto -mt-8 sm:-mt-9 mb-2 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <img
              src={top3[0].avatar}
              alt={top3[0].name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover mx-auto border-2 border-amber-400 shadow-xl mb-2"
            />
            <h4 className="font-extrabold text-white text-xs sm:text-sm truncate">{top3[0].name}</h4>
            <p className="font-mono font-black text-sm sm:text-base text-amber-400 mt-1">
              {top3[0].xpEarned} <span className="text-xs font-sans font-normal text-amber-300/70">XP</span>
            </p>
            <span className="text-[10px] text-amber-400 font-mono font-black uppercase">👑 Líder</span>
          </div>

          {/* #3 Bronze Podium */}
          <div className={`border rounded-3xl p-4 text-center relative shadow-xl transform hover:-translate-y-1 transition-transform ${
            top3[2].isCurrentUser ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-[#121214] border-white/10'
          }`}>
            <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs mx-auto -mt-7 mb-2 flex items-center justify-center shadow">
              3
            </div>
            <img
              src={top3[2].avatar}
              alt={top3[2].name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover mx-auto border-2 border-amber-700 shadow-md mb-2"
            />
            <h4 className="font-bold text-white text-xs truncate">{top3[2].name}</h4>
            <p className="font-mono font-extrabold text-xs sm:text-sm text-amber-600 mt-1">
              {top3[2].xpEarned} <span className="text-[10px] font-sans font-normal text-neutral-500">XP</span>
            </p>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">↑ Asciende</span>
          </div>

        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-400 uppercase px-4 pb-2 border-b border-white/5">
          <span>Puesto & Atleta</span>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Racha</span>
            <span>XP Semanal</span>
          </div>
        </div>

        {filteredUsers.map((item) => {
          const isTop3 = item.rank <= 3;
          const isDemotionZone = item.rank >= 5 && selectedLeague !== 'Bronze';
          const isUser = item.isCurrentUser;

          return (
            <div
              key={item.userId}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all ${
                isUser
                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                  : isTop3
                  ? 'bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/30'
                  : isDemotionZone
                  ? 'bg-red-500/[0.02] border-red-500/20 hover:border-red-500/30'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              {/* Rank & User Details */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-7 text-center font-mono font-extrabold text-sm sm:text-base shrink-0">
                  {item.rank === 1 && <span className="text-amber-400">01</span>}
                  {item.rank === 2 && <span className="text-neutral-300">02</span>}
                  {item.rank === 3 && <span className="text-amber-600">03</span>}
                  {item.rank > 3 && <span className="text-neutral-500">{item.rank.toString().padStart(2, '0')}</span>}
                </div>

                <img
                  src={item.avatar}
                  alt={item.name}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover border shrink-0 ${
                    isUser ? 'border-cyan-400 shadow-[0_0_8px_#06b6d4]' : 'border-white/10'
                  }`}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs sm:text-sm font-bold truncate ${isUser ? 'text-cyan-300' : 'text-white'}`}>
                      {item.name}
                    </p>
                    {isUser && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-500 text-neutral-950">
                        TÚ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-neutral-400">Nvl {item.level}</span>
                    {isTop3 && (
                      <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <ChevronUp className="w-3 h-3" /> Ascenso
                      </span>
                    )}
                    {isDemotionZone && (
                      <span className="text-[9px] font-bold text-red-400 flex items-center gap-0.5">
                        <ChevronDown className="w-3 h-3" /> Descenso
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats & Weekly XP */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-xs text-orange-400 font-mono font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{item.streakDays}d</span>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-extrabold text-sm sm:text-base ${
                    isUser ? 'text-cyan-400 font-black' : isTop3 ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {item.xpEarned.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 ml-1">XP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
