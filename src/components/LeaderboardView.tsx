import React, { useState } from 'react';
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
  Clock,
} from 'lucide-react';
import { LeaderboardUser, League, Language } from '../types';
import { translations } from '../lib/i18n';

interface LeaderboardViewProps {
  users: LeaderboardUser[];
  currentLeague: League;
  lang: Language;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  users,
  currentLeague,
  lang,
}) => {
  const t = translations[lang];
  const [selectedLeague, setSelectedLeague] = useState<League>(currentLeague);
  const [filterMode, setFilterMode] = useState<'global' | 'friends'>('global');

  const leagues: { id: League; name: string; color: string }[] = [
    { id: 'Bronze', name: t.leagueBronze, color: 'text-amber-700 border-amber-700/40 bg-amber-700/10' },
    { id: 'Silver', name: t.leagueSilver, color: 'text-neutral-300 border-neutral-400/40 bg-neutral-400/10' },
    { id: 'Gold', name: t.leagueGold, color: 'text-amber-400 border-amber-400/40 bg-amber-400/10' },
    { id: 'Diamond', name: t.leagueDiamond, color: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' },
    { id: 'Titan', name: t.leagueTitan, color: 'text-purple-400 border-purple-400/40 bg-purple-400/10' },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesLeague = u.league === selectedLeague;
    const matchesFriends = filterMode === 'global' || u.isFriend || u.isCurrentUser;
    return matchesLeague && matchesFriends;
  });

  const top3 = filteredUsers.slice(0, 3);
  const restOfUsers = filteredUsers.slice(3);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Weekly Reset Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {t.weeklyLeague}
            </span>
            <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {t.resetsIn} 2d 14h
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {t.leaderboardTitle}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {t.leaderboardSubtitle}
          </p>
        </div>

        {/* Global vs Friends Toggle */}
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setFilterMode('global')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'global'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.globalRank}</span>
          </button>
          <button
            onClick={() => setFilterMode('friends')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'friends'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.friendsRank}</span>
          </button>
        </div>
      </div>

      {/* League Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {leagues.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLeague(l.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              selectedLeague === l.id
                ? `${l.color} shadow-lg scale-105`
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* Promotion Zone Hint Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <ChevronUp className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>{t.leaguePromoHint}</span>
        </div>
        <span className="font-bold text-emerald-400 font-mono">Top 3 = Ascenso de Liga</span>
      </div>

      {/* Top 3 Podium Display */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4 pb-2">
          
          {/* #2 Silver Podium */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 text-center relative shadow-xl transform hover:-translate-y-1 transition-transform">
            <div className="w-6 h-6 rounded-full bg-neutral-300 text-black font-extrabold text-xs mx-auto -mt-7 mb-2 flex items-center justify-center shadow">
              2
            </div>
            <img
              src={top3[1].avatar}
              alt={top3[1].name}
              className="w-14 h-14 rounded-2xl object-cover mx-auto border-2 border-neutral-300 shadow-md mb-2"
            />
            <h4 className="font-bold text-white text-xs truncate">{top3[1].name}</h4>
            <p className="font-mono font-extrabold text-sm text-neutral-300 mt-1">
              {top3[1].xpEarned} <span className="text-[10px] font-sans font-normal text-neutral-500">XP</span>
            </p>
            <span className="text-[10px] text-neutral-400">Nv. {top3[1].level}</span>
          </div>

          {/* #1 Gold Center Podium */}
          <div className="bg-gradient-to-b from-amber-950/40 via-neutral-900 to-neutral-900 border-2 border-amber-400/60 rounded-3xl p-5 text-center relative shadow-2xl transform hover:-translate-y-2 transition-transform">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-black text-sm mx-auto -mt-9 mb-2 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <img
              src={top3[0].avatar}
              alt={top3[0].name}
              className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-amber-400 shadow-xl mb-2"
            />
            <h4 className="font-extrabold text-white text-sm truncate">{top3[0].name}</h4>
            <p className="font-mono font-black text-base text-amber-400 mt-1">
              {top3[0].xpEarned} <span className="text-xs font-sans font-normal text-amber-300/70">XP</span>
            </p>
            <span className="text-xs text-amber-300/80 font-bold">Nv. {top3[0].level} • 🥇 Líder</span>
          </div>

          {/* #3 Bronze Podium */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 text-center relative shadow-xl transform hover:-translate-y-1 transition-transform">
            <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs mx-auto -mt-7 mb-2 flex items-center justify-center shadow">
              3
            </div>
            <img
              src={top3[2].avatar}
              alt={top3[2].name}
              className="w-14 h-14 rounded-2xl object-cover mx-auto border-2 border-amber-700 shadow-md mb-2"
            />
            <h4 className="font-bold text-white text-xs truncate">{top3[2].name}</h4>
            <p className="font-mono font-extrabold text-sm text-amber-600 mt-1">
              {top3[2].xpEarned} <span className="text-[10px] font-sans font-normal text-neutral-500">XP</span>
            </p>
            <span className="text-[10px] text-neutral-400">Nv. {top3[2].level}</span>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-2">
        <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 pb-2 border-b border-neutral-800">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Atleta</div>
          <div className="col-span-2 text-center">Racha</div>
          <div className="col-span-3 text-right">XP Semanal</div>
        </div>

        <div className="space-y-2">
          {filteredUsers.map((user, idx) => {
            const isTop3 = idx < 3;

            return (
              <div
                key={user.userId}
                className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl border transition-all ${
                  user.isCurrentUser
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-neutral-800/50 border-neutral-700/60 hover:bg-neutral-800'
                }`}
              >
                {/* Rank # */}
                <div className="col-span-1 flex items-center">
                  <span
                    className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center ${
                      idx === 0
                        ? 'bg-amber-400 text-black'
                        : idx === 1
                        ? 'bg-neutral-300 text-black'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* Avatar & User details */}
                <div className="col-span-6 flex items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover border border-neutral-600" />
                  <div className="truncate">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate flex items-center gap-1.5">
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="text-[9px] bg-emerald-500 text-black font-black px-1.5 py-0.2 rounded">TÚ</span>
                      )}
                    </h4>
                    <span className="text-[11px] text-neutral-400">
                      Nivel {user.level} • {user.workoutsThisWeek} sesiones
                    </span>
                  </div>
                </div>

                {/* Streak Days */}
                <div className="col-span-2 flex items-center justify-center gap-1 text-xs font-bold text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{user.streakDays}d</span>
                </div>

                {/* XP Earned */}
                <div className="col-span-3 text-right">
                  <span className="font-mono font-extrabold text-sm text-emerald-400">
                    +{user.xpEarned.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
