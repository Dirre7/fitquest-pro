import React, { useState } from 'react';
import { Target, Trophy, Sparkles, Swords } from 'lucide-react';
import {
  CommunityChallenge,
  LeaderboardUser,
  Achievement,
  UserProfile,
  Language,
  WorkoutHistoryEntry,
  SmartwatchDevice,
} from '../types';
import { WeeklyChallengesView } from './WeeklyChallengesView';
import { LeaderboardView } from './LeaderboardView';
import { AchievementsView } from './AchievementsView';
import { SocialLiveDuelView } from './SocialLiveDuelView';

interface CommunityViewProps {
  challenges: CommunityChallenge[];
  leaderboard: LeaderboardUser[];
  achievements: Achievement[];
  user: UserProfile;
  history?: WorkoutHistoryEntry[];
  smartwatch?: SmartwatchDevice;
  lang: Language;
  initialSubTab?: 'challenges' | 'leaderboard' | 'achievements' | 'duels';
  onJoinChallenge: (challengeId: string) => void;
  onContribute: (challengeId: string, amount: number) => void;
  onClaimReward: (challengeId: string, rewardXp: number) => void;
  onClaimAchievementXp: (achievementId: string, xpReward: number) => void;
  onEquipTitle?: (title: string) => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  onWinDuel?: (xpGained: number) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  challenges,
  leaderboard,
  achievements,
  user,
  history = [],
  smartwatch,
  lang,
  initialSubTab = 'challenges',
  onJoinChallenge,
  onContribute,
  onClaimReward,
  onClaimAchievementXp,
  onEquipTitle,
  onUpdateUser,
  onWinDuel,
}) => {
  const [subTab, setSubTab] = useState<'challenges' | 'leaderboard' | 'achievements' | 'duels'>(initialSubTab);

  const fallbackWatch: SmartwatchDevice = smartwatch || {
    id: 'sw_default',
    name: 'Apple Watch Ultra 2',
    brand: 'Apple',
    status: 'connected',
    batteryLevel: 88,
    lastSync: 'Ahora',
    liveHeartRate: 128,
    activeCaloriesToday: 420,
    stepsToday: 6500,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Sub-navigation pill switcher */}
      <div className="flex justify-center">
        <div className="bg-[#121214] border border-white/10 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl max-w-xl w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSubTab('challenges')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              subTab === 'challenges'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4 shrink-0" />
            <span>Retos</span>
          </button>

          <button
            onClick={() => setSubTab('leaderboard')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              subTab === 'leaderboard'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Clasificación</span>
          </button>

          <button
            onClick={() => setSubTab('achievements')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              subTab === 'achievements'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Logros</span>
          </button>

          <button
            onClick={() => setSubTab('duels')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              subTab === 'duels'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Swords className="w-4 h-4 shrink-0" />
            <span>Duelos 1v1</span>
          </button>
        </div>
      </div>

      {/* Render selected subtab */}
      {subTab === 'challenges' && (
        <WeeklyChallengesView
          challenges={challenges}
          user={user}
          history={history}
          lang={lang}
          onClaimReward={onClaimReward}
        />
      )}

      {subTab === 'leaderboard' && (
        <LeaderboardView
          user={user}
          history={history}
          currentLeague={user.league}
          lang={lang}
          onUpdateUser={onUpdateUser}
        />
      )}

      {subTab === 'achievements' && (
        <AchievementsView
          achievements={achievements}
          user={user}
          lang={lang}
          onClaimXp={onClaimAchievementXp}
          onEquipTitle={onEquipTitle}
        />
      )}

      {subTab === 'duels' && (
        <SocialLiveDuelView
          user={user}
          smartwatch={fallbackWatch}
          lang={lang}
          onDuelWin={(xp) => {
            if (onWinDuel) onWinDuel(xp);
          }}
        />
      )}
    </div>
  );
};
