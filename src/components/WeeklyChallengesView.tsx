import React, { useState } from 'react';
import {
  Target,
  Flame,
  Trophy,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  Plus,
  Award,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CommunityChallenge, Language } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';

interface WeeklyChallengesViewProps {
  challenges: CommunityChallenge[];
  lang: Language;
  onJoinChallenge: (challengeId: string) => void;
  onContribute: (challengeId: string, amount: number) => void;
  onClaimReward: (challengeId: string, rewardXp: number) => void;
}

export const WeeklyChallengesView: React.FC<WeeklyChallengesViewProps> = ({
  challenges,
  lang,
  onJoinChallenge,
  onContribute,
  onClaimReward,
}) => {
  const t = translations[lang];

  const [contributeAmount, setContributeAmount] = useState<{ [id: string]: number }>({});

  const handleClaim = (challenge: CommunityChallenge) => {
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch {}
    onClaimReward(challenge.id, challenge.rewardXp);
  };

  const handleContributeSubmit = (challengeId: string) => {
    const amount = contributeAmount[challengeId] || 25;
    sound.playAchievement();
    onContribute(challengeId, amount);
    setContributeAmount((prev) => ({ ...prev, [challengeId]: 0 }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ⚔️ Retos Globales
            </span>
            <span className="text-xs font-bold text-neutral-400">
              {challenges.length} Retos Activos Esta Semana
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {t.weeklyChallenges}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {t.challengesSubtitle}
          </p>
        </div>
      </div>

      {/* Challenges List Cards */}
      <div className="space-y-4">
        {challenges.map((ch) => {
          const percent = Math.min(100, Math.round((ch.currentProgress / ch.goalTarget) * 100));
          const isCompleted = percent >= 100;

          return (
            <div
              key={ch.id}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 hover:border-emerald-500/40 transition-all shadow-xl space-y-5"
            >
              {/* Top Row: Title, Category, Reward & Days Left */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {ch.category.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {ch.daysRemaining} {t.daysLeft}
                    </span>
                    <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {ch.participantsCount.toLocaleString()} atletas
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                    {ch.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                {/* Reward XP Badge & Join/Claim Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-neutral-400 block">Recompensa</span>
                    <span className="font-mono font-extrabold text-lg text-yellow-400">
                      +{ch.rewardXp} XP
                    </span>
                  </div>

                  {isCompleted ? (
                    <button
                      id={`btn-claim-ch-${ch.id}`}
                      onClick={() => handleClaim(ch)}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5 animate-bounce"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>{t.claimReward}</span>
                    </button>
                  ) : ch.joined ? (
                    <span className="px-3.5 py-2 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{t.joined}</span>
                    </span>
                  ) : (
                    <button
                      id={`btn-join-ch-${ch.id}`}
                      onClick={() => {
                        sound.playAchievement();
                        onJoinChallenge(ch.id);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md transition-all hover:scale-105"
                    >
                      {t.joinChallenge}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar & Goal stats */}
              <div>
                <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5">
                  <span>
                    {ch.currentProgress.toLocaleString()} / {ch.goalTarget.toLocaleString()} {ch.unit}
                  </span>
                  <span className="font-mono text-emerald-400 font-extrabold">{percent}%</span>
                </div>
                <div className="h-3 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-700 shadow"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Contribute Action Row & Top Contributors */}
              {ch.joined && (
                <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Personal Logger */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-neutral-300 shrink-0">
                      Registrar mi aporte:
                    </span>
                    <input
                      type="number"
                      placeholder="Ej. 25"
                      value={contributeAmount[ch.id] ?? ''}
                      onChange={(e) =>
                        setContributeAmount({
                          ...contributeAmount,
                          [ch.id]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-20 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      id={`btn-contribute-${ch.id}`}
                      onClick={() => handleContributeSubmit(ch.id)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Sumar {ch.unit}
                    </button>
                  </div>

                  {/* Leaderboard snippet of top contributors */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-neutral-400">{t.topContributors}:</span>
                    <div className="flex -space-x-2">
                      {ch.leaderboardTop.map((leader, i) => (
                        <img
                          key={leader.userId}
                          src={leader.avatar}
                          alt={leader.name}
                          title={`${leader.name}: ${leader.score.toLocaleString()} ${ch.unit}`}
                          className="w-7 h-7 rounded-full object-cover border-2 border-neutral-900"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
