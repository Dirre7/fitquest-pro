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
  Zap,
  X,
  Heart,
  Check,
  UserPlus,
  UserCheck,
  Dumbbell,
  Target,
  Share2,
  Edit3,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeaderboardUser, League, Language, UserProfile, WorkoutHistoryEntry } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';
import { FitStorage } from '../lib/storage';
import { 
  getCountdownToSunday, 
  getLeagueLeaderboard, 
  calculateUserWeeklyXp, 
  LEAGUE_HIERARCHY, 
  LEAGUE_BOTS,
  WeeklyCountdown 
} from '../lib/leagueEngine';

interface LeaderboardViewProps {
  users?: LeaderboardUser[];
  user: UserProfile;
  history?: WorkoutHistoryEntry[];
  currentLeague: League;
  lang: Language;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  history = [],
  currentLeague,
  lang,
  onUpdateUser,
}) => {
  const t = translations[lang];
  const [selectedLeague, setSelectedLeague] = useState<League>(currentLeague || user.league || 'Bronze');
  const [filterMode, setFilterMode] = useState<'global' | 'friends'>('global');
  const [countdown, setCountdown] = useState<WeeklyCountdown>(getCountdownToSunday());
  const [selectedAthlete, setSelectedAthlete] = useState<LeaderboardUser | null>(null);
  const [followingSet, setFollowingSet] = useState<Set<string>>(() => new Set(user.following || ['bot_g1', 'bot_s2', 'bot_d1']));
  const [cheeredUserIds, setCheeredUserIds] = useState<Set<string>>(new Set());
  
  // Social Connections Modal state ('following' | 'followers' | null)
  const [connectionsModalType, setConnectionsModalType] = useState<'following' | 'followers' | null>(null);
  const [connectionsSearch, setConnectionsSearch] = useState<string>('');

  // Bio inline edit state for current user
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [bioInput, setBioInput] = useState<string>(user.bio || 'Entrenando duro en FitQuest Pro para conquistar el podio.');

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

  useEffect(() => {
    if (user.bio) {
      setBioInput(user.bio);
    }
  }, [user.bio]);

  const leagues: { id: League; name: string; color: string; border: string; glow: string }[] = [
    { id: 'Bronze', name: 'Liga Bronce', color: 'text-amber-600 border-amber-600/40 bg-amber-600/10', border: 'border-amber-700/50', glow: 'shadow-[0_0_20px_rgba(180,83,9,0.3)]' },
    { id: 'Silver', name: 'Liga Plata', color: 'text-neutral-300 border-neutral-400/40 bg-neutral-400/10', border: 'border-neutral-400/50', glow: 'shadow-[0_0_20px_rgba(200,200,200,0.2)]' },
    { id: 'Gold', name: 'Liga Oro', color: 'text-amber-400 border-amber-400/40 bg-amber-400/10', border: 'border-amber-400/50', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.35)]' },
    { id: 'Diamond', name: 'Liga Diamante', color: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10', border: 'border-cyan-400/50', glow: 'shadow-[0_0_25px_rgba(6,182,212,0.35)]' },
    { id: 'Titan', name: 'Liga Titán', color: 'text-purple-400 border-purple-400/40 bg-purple-400/10', border: 'border-purple-400/50', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]' },
  ];

  const userWeeklyXp = calculateUserWeeklyXp(user, history);
  const leagueLeaderboard = getLeagueLeaderboard(selectedLeague, user, userWeeklyXp, history);

  const filteredUsers = leagueLeaderboard.filter((u) => {
    if (filterMode === 'friends') return followingSet.has(u.userId) || u.isCurrentUser;
    return true;
  });

  const top3 = filteredUsers.slice(0, 3);
  const restOfUsers = filteredUsers.slice(3);

  const currentLeagueIdx = LEAGUE_HIERARCHY.indexOf(selectedLeague);
  const nextLeague = currentLeagueIdx < LEAGUE_HIERARCHY.length - 1 ? LEAGUE_HIERARCHY[currentLeagueIdx + 1] : null;
  const prevLeague = currentLeagueIdx > 0 ? LEAGUE_HIERARCHY[currentLeagueIdx - 1] : null;

  // Flatten all registered community users for connections list
  const allCommunityUsers: LeaderboardUser[] = Object.values(LEAGUE_BOTS).flat().map((b, idx) => ({
    ...b,
    rank: idx + 1,
  }));

  const handleCheerAthlete = (athlete: LeaderboardUser) => {
    setCheeredUserIds((prev) => new Set(prev).add(athlete.userId));
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handleToggleFollow = (athleteUserId: string) => {
    setFollowingSet((prev) => {
      const next = new Set(prev);
      if (next.has(athleteUserId)) {
        next.delete(athleteUserId);
        sound.playBeep(400, 80);
      } else {
        next.add(athleteUserId);
        sound.playBeep(750, 80);
      }
      const updatedFollowing = Array.from(next);
      if (onUpdateUser) {
        onUpdateUser({ following: updatedFollowing });
      } else {
        FitStorage.saveUser({ ...user, following: updatedFollowing });
      }
      return next;
    });
  };

  const handleSaveBio = () => {
    const trimmed = bioInput.trim();
    setIsEditingBio(false);
    sound.playAchievement();
    if (onUpdateUser) {
      onUpdateUser({ bio: trimmed });
    } else {
      FitStorage.saveUser({ ...user, bio: trimmed });
    }
  };

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
            Pincha sobre cualquier atleta para ver sus logros, biografía y seguidores.
          </p>
        </div>

        {/* Global vs Following Filter Switcher */}
        <div className="flex bg-neutral-900 border border-white/10 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setFilterMode('global')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'global'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Global</span>
          </button>
          <button
            onClick={() => setFilterMode('friends')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'friends'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Siguiendo ({followingSet.size})</span>
          </button>
        </div>
      </div>

      {/* League Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {leagues.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLeague(l.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
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
          <div
            onClick={() => setSelectedAthlete(top3[1])}
            className={`border rounded-3xl p-4 text-center relative shadow-xl transform hover:-translate-y-1.5 transition-all cursor-pointer group ${
              top3[1].isCurrentUser ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-[#121214] border-white/10 hover:border-neutral-300/40'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-neutral-300 text-black font-extrabold text-xs mx-auto -mt-7 mb-2 flex items-center justify-center shadow">
              2
            </div>
            <img
              src={top3[1].avatar}
              alt={top3[1].name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover mx-auto border-2 border-neutral-300 shadow-md mb-2 group-hover:scale-105 transition-transform"
            />
            <h4 className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">{top3[1].name}</h4>
            <p className="font-mono font-extrabold text-xs sm:text-sm text-neutral-300 mt-1">
              {top3[1].xpEarned} <span className="text-[10px] font-sans font-normal text-neutral-500">XP</span>
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-[10px] text-emerald-400 font-mono font-bold">↑ Asciende</span>
              <span className="text-[9px] text-neutral-500 font-mono">🏆 {top3[1].achievementsUnlockedCount || 10}/100</span>
            </div>
          </div>

          {/* #1 Gold Center Podium */}
          <div
            onClick={() => setSelectedAthlete(top3[0])}
            className={`border-2 rounded-3xl p-4 sm:p-5 text-center relative shadow-2xl transform hover:-translate-y-2 transition-all cursor-pointer group ${
              top3[0].isCurrentUser ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'bg-gradient-to-b from-amber-950/40 via-[#121214] to-[#121214] border-amber-400/60 hover:border-amber-400'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-black text-sm mx-auto -mt-8 sm:-mt-9 mb-2 flex items-center justify-center shadow-lg shadow-amber-400/30 animate-pulse">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <img
              src={top3[0].avatar}
              alt={top3[0].name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover mx-auto border-2 border-amber-400 shadow-xl mb-2 group-hover:scale-105 transition-transform"
            />
            <h4 className="font-extrabold text-white text-xs sm:text-sm truncate group-hover:text-amber-300 transition-colors">{top3[0].name}</h4>
            <p className="font-mono font-black text-sm sm:text-base text-amber-400 mt-1">
              {top3[0].xpEarned} <span className="text-xs font-sans font-normal text-amber-300/70">XP</span>
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-[10px] text-amber-400 font-mono font-black uppercase">👑 Líder</span>
              <span className="text-[9px] text-amber-300/80 font-mono font-bold">🏆 {top3[0].achievementsUnlockedCount || 25}/100</span>
            </div>
          </div>

          {/* #3 Bronze Podium */}
          <div
            onClick={() => setSelectedAthlete(top3[2])}
            className={`border rounded-3xl p-4 text-center relative shadow-xl transform hover:-translate-y-1.5 transition-all cursor-pointer group ${
              top3[2].isCurrentUser ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-[#121214] border-white/10 hover:border-amber-700/40'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs mx-auto -mt-7 mb-2 flex items-center justify-center shadow">
              3
            </div>
            <img
              src={top3[2].avatar}
              alt={top3[2].name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover mx-auto border-2 border-amber-700 shadow-md mb-2 group-hover:scale-105 transition-transform"
            />
            <h4 className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">{top3[2].name}</h4>
            <p className="font-mono font-extrabold text-xs sm:text-sm text-amber-600 mt-1">
              {top3[2].xpEarned} <span className="text-[10px] font-sans font-normal text-neutral-500">XP</span>
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-[10px] text-emerald-400 font-mono font-bold">↑ Asciende</span>
              <span className="text-[9px] text-neutral-500 font-mono">🏆 {top3[2].achievementsUnlockedCount || 8}/100</span>
            </div>
          </div>

        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-400 uppercase px-4 pb-2 border-b border-white/5">
          <span>Puesto & Atleta (Toca para ver tarjeta)</span>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Logros</span>
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
              onClick={() => setSelectedAthlete(item)}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer group ${
                isUser
                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50 hover:bg-cyan-500/15'
                  : isTop3
                  ? 'bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]'
                  : isDemotionZone
                  ? 'bg-red-500/[0.02] border-red-500/20 hover:border-red-500/40 hover:bg-red-500/[0.05]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
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

                <div className="relative shrink-0">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border transition-transform group-hover:scale-105 ${
                      isUser ? 'border-cyan-400 shadow-[0_0_8px_#06b6d4]' : 'border-white/10 group-hover:border-white/30'
                    }`}
                  />
                  {followingSet.has(item.userId) && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 border border-neutral-950 flex items-center justify-center text-[9px] text-neutral-950 font-bold">
                      ★
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs sm:text-sm font-bold truncate group-hover:text-cyan-300 transition-colors ${isUser ? 'text-cyan-300' : 'text-white'}`}>
                      {item.name}
                    </p>
                    {isUser && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-500 text-neutral-950">
                        TÚ
                      </span>
                    )}
                    {item.rankTitle && (
                      <span className="hidden md:inline text-[9px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300">
                        "{item.rankTitle}"
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
                <div className="hidden sm:flex items-center gap-1 text-xs text-amber-400 font-mono font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-xl">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{item.achievementsUnlockedCount || (item.rank <= 3 ? 20 : 8)}/100</span>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-xs text-orange-400 font-mono font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{item.streakDays}d</span>
                </div>

                <div className="text-right">
                  <p className="font-mono font-black text-sm sm:text-base text-white">
                    {item.xpEarned.toLocaleString()} <span className="text-xs text-cyan-400 font-sans">XP</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    {item.workoutsThisWeek} {item.workoutsThisWeek === 1 ? 'sesión' : 'sesiones'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ATHLETE PROFILE MODAL CARD */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Background Glow */}
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Header / Close button */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Carnet de Atleta • Liga {selectedAthlete.league}
              </span>
              <button
                onClick={() => {
                  setSelectedAthlete(null);
                  setIsEditingBio(false);
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Avatar & Profile Info */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <img
                  src={selectedAthlete.avatar}
                  alt={selectedAthlete.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                />
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-mono font-black shadow-lg">
                  #{selectedAthlete.rank}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-display font-black text-white truncate">
                    {selectedAthlete.name}
                  </h3>
                  {selectedAthlete.isCurrentUser && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-500 text-neutral-950 shrink-0">
                      TÚ
                    </span>
                  )}
                </div>

                <p className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                  "{selectedAthlete.rankTitle || 'Guerrero de Hierro'}"
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-neutral-200">
                    Nivel {selectedAthlete.level}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Liga {selectedAthlete.league}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Followers / Following Bar */}
            <div className="bg-neutral-950/80 border border-white/5 rounded-2xl p-3 flex items-center justify-around gap-2 relative z-10 shadow-inner">
              <button
                onClick={() => {
                  setConnectionsModalType('following');
                  setConnectionsSearch('');
                }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-center"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <div className="text-left">
                  <p className="text-sm font-mono font-black text-white leading-none">
                    {selectedAthlete.isCurrentUser ? followingSet.size : (selectedAthlete.followingCount || 12)}
                  </p>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Siguiendo</span>
                </div>
              </button>

              <div className="w-[1px] h-6 bg-white/10" />

              <button
                onClick={() => {
                  setConnectionsModalType('followers');
                  setConnectionsSearch('');
                }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-center"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <p className="text-sm font-mono font-black text-white leading-none">
                    {selectedAthlete.isCurrentUser ? (user.followers?.length || 4) : (selectedAthlete.followersCount || 18)}
                  </p>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Seguidores</span>
                </div>
              </button>
            </div>

            {/* Bio Section with Inline Editing */}
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Biografía del Atleta:</span>
                {selectedAthlete.isCurrentUser && !isEditingBio && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Editar Bio
                  </button>
                )}
              </div>

              {isEditingBio && selectedAthlete.isCurrentUser ? (
                <div className="space-y-2">
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    maxLength={140}
                    placeholder="Escribe tu lema de entrenamiento o metas personales..."
                    rows={3}
                    className="w-full bg-neutral-950 border border-cyan-500/50 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 resize-none font-sans"
                  />
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-neutral-500">{bioInput.length} / 140 caracteres</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 text-xs font-mono font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveBio}
                        className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-mono font-extrabold cursor-pointer shadow-md shadow-cyan-500/20"
                      >
                        Guardar Bio
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-xs text-neutral-300 italic leading-relaxed">
                  "{selectedAthlete.isCurrentUser ? (user.bio || bioInput) : (selectedAthlete.bio || 'Entrenando para superarme cada día.')}"
                </div>
              )}
            </div>

            {/* 4-Card KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
              <div className="bg-neutral-950/70 border border-white/5 rounded-2xl p-3 text-center shadow-inner">
                <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase">XP Semanal</span>
                <p className="text-sm font-mono font-black text-white mt-0.5">
                  {selectedAthlete.xpEarned.toLocaleString()}
                </p>
              </div>

              <div className="bg-neutral-950/70 border border-white/5 rounded-2xl p-3 text-center shadow-inner">
                <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Logros</span>
                <p className="text-sm font-mono font-black text-amber-300 mt-0.5">
                  {selectedAthlete.achievementsUnlockedCount || (selectedAthlete.rank <= 3 ? 24 : 12)}/100
                </p>
              </div>

              <div className="bg-neutral-950/70 border border-white/5 rounded-2xl p-3 text-center shadow-inner">
                <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Racha</span>
                <p className="text-sm font-mono font-black text-orange-400 mt-0.5">
                  {selectedAthlete.streakDays} Días
                </p>
              </div>

              <div className="bg-neutral-950/70 border border-white/5 rounded-2xl p-3 text-center shadow-inner">
                <Dumbbell className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Volumen</span>
                <p className="text-sm font-mono font-black text-purple-300 mt-0.5">
                  {((selectedAthlete.totalVolumeKg || 18000) / 1000).toFixed(1)}k kg
                </p>
              </div>
            </div>

            {/* Top Badges Vitrina */}
            {selectedAthlete.topBadges && selectedAthlete.topBadges.length > 0 && (
              <div className="space-y-2 relative z-10">
                <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Medallas & Hitos Destacados:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedAthlete.topBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200 shadow-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-white/5 flex gap-3 relative z-10">
              {/* Cheer button */}
              <button
                onClick={() => handleCheerAthlete(selectedAthlete)}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                  cheeredUserIds.has(selectedAthlete.userId)
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>{cheeredUserIds.has(selectedAthlete.userId) ? '¡Ánimo Enviado! 👏' : '¡Enviar Ánimo!'}</span>
              </button>

              {!selectedAthlete.isCurrentUser && (
                <button
                  onClick={() => handleToggleFollow(selectedAthlete.userId)}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                    followingSet.has(selectedAthlete.userId)
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-extrabold'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200 hover:text-white'
                  }`}
                >
                  {followingSet.has(selectedAthlete.userId) ? (
                    <>
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <span>Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SOCIAL CONNECTIONS MODAL (SIGUIENDO / SEGUIDORES) */}
      {connectionsModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                {connectionsModalType === 'following' ? (
                  <Users className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-amber-400" />
                )}
                <h3 className="text-lg font-display font-black text-white">
                  {connectionsModalType === 'following' ? `Personas que sigues (${followingSet.size})` : 'Seguidores de la Comunidad'}
                </h3>
              </div>
              <button
                onClick={() => setConnectionsModalType(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter in connections */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={connectionsSearch}
                onChange={(e) => setConnectionsSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* User List */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {allCommunityUsers
                .filter((u) => {
                  if (connectionsModalType === 'following') {
                    return followingSet.has(u.userId);
                  }
                  return true;
                })
                .filter((u) => {
                  if (!connectionsSearch.trim()) return true;
                  return u.name.toLowerCase().includes(connectionsSearch.toLowerCase()) || (u.rankTitle || '').toLowerCase().includes(connectionsSearch.toLowerCase());
                })
                .map((athlete) => {
                  const isFollowing = followingSet.has(athlete.userId);

                  return (
                    <div
                      key={athlete.userId}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all"
                    >
                      <div
                        onClick={() => {
                          setConnectionsModalType(null);
                          setSelectedAthlete(athlete);
                        }}
                        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 group"
                      >
                        <img
                          src={athlete.avatar}
                          alt={athlete.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:border-cyan-400 transition-colors shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                            {athlete.name}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-400 truncate">
                            Nvl {athlete.level} • "{athlete.rankTitle || 'Atleta'}"
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleFollow(athlete.userId)}
                        className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ml-2 ${
                          isFollowing
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
                        }`}
                      >
                        {isFollowing ? 'Siguiendo' : '+ Seguir'}
                      </button>
                    </div>
                  );
                })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
