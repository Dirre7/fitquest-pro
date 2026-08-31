import React, { useState } from 'react';
import { Target, Trophy, Sparkles } from 'lucide-react';
import { CommunityChallenge, LeaderboardUser, Achievement, UserProfile, Language, WorkoutHistoryEntry } from '../types';
import { WeeklyChallengesView } from './WeeklyChallengesView';
import { LeaderboardView } from './LeaderboardView';
import { AchievementsView } from './AchievementsView';

interface CommunityViewProps {
  challenges: CommunityChallenge[];
  leaderboard: LeaderboardUser[];
  achievements: Achievement[];
  user: UserProfile;
  history?: WorkoutHistoryEntry[];
  lang: Language;
  initialSubTab?: 'challenges' | 'leaderboard' | 'achievements';
  onJoinChallenge: (challengeId: string) => void;
  onContribute: (challengeId: string, amount: number) => void;
  onClaimReward: (challengeId: string, rewardXp: number) => void;
  onClaimAchievementXp: (achievementId: string, xpReward: number) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  challenges,
  leaderboard,
  achievements,
  user,
  history = [],
  lang,
  initialSubTab = 'challenges',
  onJoinChallenge,
  onContribute,
  onClaimReward,
  onClaimAchievementXp,
}) => {
  const [subTab, setSubTab] = useState<'challenges' | 'leaderboard' | 'achievements'>(initialSubTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Sub-navigation pill switcher */}
      <div className="flex justify-center">
        <div className="bg-[#121214] border border-white/10 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl max-w-md w-full">
          <button
            onClick={() => setSubTab('challenges')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              subTab === 'challenges'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Retos Semanales</span>
          </button>

          <button
            onClick={() => setSubTab('leaderboard')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              subTab === 'leaderboard'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Clasificación</span>
          </button>

          <button
            onClick={() => setSubTab('achievements')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              subTab === 'achievements'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Logros</span>
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
        />
      )}

      {subTab === 'achievements' && (
        <AchievementsView
          achievements={achievements}
          user={user}
          lang={lang}
          onClaimXp={onClaimAchievementXp}
        />
      )}
    </div>
  );
};
