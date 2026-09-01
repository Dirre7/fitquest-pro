import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  WorkoutRoutine,
  WorkoutHistoryEntry,
  CommunityChallenge,
  Achievement,
  LeaderboardUser,
  SmartwatchDevice,
  PushReminder,
  ActiveWorkoutState,
  Language,
  ThemeMode,
} from './types';
import { FitStorage } from './lib/storage';
import { translations } from './lib/i18n';
import { sound } from './lib/soundFx';
import { auth, onAuthStateChanged, signOut as fbSignOut } from './lib/firebase';
import { evaluateWeeklyLeagueReset } from './lib/leagueEngine';

// Components
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { WorkoutCatalogView } from './components/WorkoutCatalogView';
import { ActiveWorkoutTracker } from './components/ActiveWorkoutTracker';
import { ActiveWorkoutMiniBar } from './components/ActiveWorkoutMiniBar';
import { LeaderboardView } from './components/LeaderboardView';
import { WeeklyChallengesView } from './components/WeeklyChallengesView';
import { AchievementsView } from './components/AchievementsView';
import { CommunityView } from './components/CommunityView';
import { AnalyticsView } from './components/AnalyticsView';
import { SmartwatchView } from './components/SmartwatchView';
import { CloudAndSettingsView } from './components/CloudAndSettingsView';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { ProfileEditModal } from './components/ProfileEditModal';
import { QuickStartModal } from './components/QuickStartModal';

export default function App() {
  // Global States loaded from FitStorage
  const [user, setUser] = useState<UserProfile>(FitStorage.getUser());
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(FitStorage.getRoutines());
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>(FitStorage.getHistory());
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(FitStorage.getChallenges());
  const [achievements, setAchievements] = useState<Achievement[]>(FitStorage.getAchievements());
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(FitStorage.getLeaderboard());
  const [smartwatch, setSmartwatch] = useState<SmartwatchDevice>(FitStorage.getSmartwatch());
  const [reminders, setReminders] = useState<PushReminder[]>(FitStorage.getReminders());

  // App Settings & Active Session
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveWorkoutState | null>(() => FitStorage.getActiveSession());
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>(FitStorage.getLanguage());
  const [theme, setTheme] = useState<ThemeMode>(FitStorage.getTheme());
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(sound.getMuted());
  const [isOffline, setIsOffline] = useState<boolean>(FitStorage.getOfflineMode());
  const [highContrast, setHighContrast] = useState<boolean>(FitStorage.getHighContrast());
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>(FitStorage.getTextSize());

  // Cloud Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [quickStartModalOpen, setQuickStartModalOpen] = useState<boolean>(false);

  const t = translations[lang];

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        // Load or create cloud data
        const cloudData = await FitStorage.loadUserFromCloud(
          firebaseUser.uid,
          firebaseUser.email || undefined,
          firebaseUser.displayName || undefined
        );
        const evaluated = evaluateWeeklyLeagueReset(cloudData.user, cloudData.history);
        setUser(evaluated.updatedUser);
        setHistory(cloudData.history);
        setAchievements(cloudData.achievements);
        setChallenges(cloudData.challenges);
        setRoutines(cloudData.routines);
      } else {
        setIsAuthenticated(false);
        const localUser = FitStorage.getUser();
        const localHistory = FitStorage.getHistory();
        const evaluated = evaluateWeeklyLeagueReset(localUser, localHistory);
        setUser(evaluated.updatedUser);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'oled') {
      root.classList.add('oled-mode');
    } else {
      root.classList.remove('oled-mode');
    }
    FitStorage.saveTheme(theme);
  }, [theme]);

  // Sync High Contrast to document root (without CSS filter that breaks fixed position)
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    FitStorage.saveHighContrast(highContrast);
  }, [highContrast]);

  // Sync Text Size dynamically to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-text-size', textSize);
    FitStorage.saveTextSize(textSize);
  }, [textSize]);

  // Auth Success Callback
  const handleAuthSuccess = async (userId: string, name: string, email?: string) => {
    const cloudData = await FitStorage.loadUserFromCloud(userId, email, name);
    setUser(cloudData.user);
    setHistory(cloudData.history);
    setAchievements(cloudData.achievements);
    setChallenges(cloudData.challenges);
    setRoutines(cloudData.routines);
    setIsAuthenticated(true);
    setIsGuestMode(false);
    sound.playLevelUp();
  };

  // Sign out handler
  const handleSignOut = async () => {
    await fbSignOut(auth);
    setIsAuthenticated(false);
    setIsGuestMode(false);
    // Switch to clean fresh user
    const guestUser = FitStorage.getUser();
    setUser(guestUser);
    setHistory(FitStorage.getHistory());
  };

  // Handle Routine Start
  const handleStartRoutine = (routine: WorkoutRoutine) => {
    setActiveRoutine(routine);
    if (!activeSession || activeSession.routineId !== routine.id) {
      const initialSession: ActiveWorkoutState = {
        routineId: routine.id,
        routineTitle: routine.title,
        routineCategory: routine.category,
        startTime: Date.now(),
        elapsedSeconds: 0,
        currentExerciseIndex: 0,
        exercises: JSON.parse(JSON.stringify(routine.exercises)),
        isResting: false,
        restTimeRemaining: 0,
        totalRestTime: 60,
        isPaused: false,
        liveHeartRate: smartwatch.liveHeartRate || 135,
        activeCalories: 0,
        notes: '',
      };
      setActiveSession(initialSession);
      FitStorage.saveActiveSession(initialSession);
    }
  };

  // Handle Minimize to floating background bar
  const handleMinimizeWorkout = (state: ActiveWorkoutState) => {
    setActiveSession(state);
    FitStorage.saveActiveSession(state);
    setActiveRoutine(null);
  };

  // Handle Resume from floating mini bar
  const handleResumeWorkout = () => {
    if (!activeSession) return;
    const foundRoutine = routines.find((r) => r.id === activeSession.routineId) || {
      id: activeSession.routineId,
      title: activeSession.routineTitle,
      description: 'Sesión activa en curso',
      category: (activeSession.routineCategory as any) || 'Strength',
      difficulty: 'Intermediate',
      durationMinutes: 45,
      estimatedCalories: 400,
      xpReward: 300,
      exercises: activeSession.exercises,
      targetMuscles: ['Full Body'],
      tags: ['Custom'],
    };
    setActiveRoutine(foundRoutine);
  };

  // Handle Discard Workout
  const handleDiscardWorkout = () => {
    FitStorage.clearActiveSession();
    setActiveSession(null);
    setActiveRoutine(null);
  };

  // Handle Workout Complete from ActiveWorkoutTracker
  const handleCompleteWorkout = (entry: WorkoutHistoryEntry, xpGained: number) => {
    FitStorage.clearActiveSession();
    setActiveSession(null);

    // 1. Add history entry (persists to Firestore if logged in)
    FitStorage.addHistoryEntry(entry, user);
    const updatedHistory = FitStorage.getHistory();
    setHistory(updatedHistory);

    // 2. Add XP to User Profile
    const updatedUser = FitStorage.addXp(xpGained, user);

    // Increment workout count and volume
    const newTotalWorkouts = updatedUser.stats.totalWorkouts + 1;
    const newTotalVolume = updatedUser.stats.totalVolumeKg + entry.totalVolumeKg;
    const newTotalMinutes = updatedUser.stats.totalMinutes + entry.durationMinutes;
    const newCalories = updatedUser.stats.caloriesBurned + entry.calories;
    const newStreak = Math.max(1, updatedUser.stats.currentStreak + 1);

    const finalUser: UserProfile = {
      ...updatedUser,
      stats: {
        ...updatedUser.stats,
        totalWorkouts: newTotalWorkouts,
        totalVolumeKg: newTotalVolume,
        totalMinutes: newTotalMinutes,
        caloriesBurned: newCalories,
        currentStreak: newStreak,
        bestStreak: Math.max(updatedUser.stats.bestStreak, newStreak),
      },
    };

    FitStorage.saveUser(finalUser);
    setUser(finalUser);

    // 3. Check and unlock achievements
    const allAchievements = FitStorage.getAchievements();
    const updatedAchievements = allAchievements.map((ach) => {
      if (ach.id === 'ach_first_workout') {
        return { ...ach, unlocked: true, currentProgress: 1 };
      }
      if (ach.id === 'ach_streak_3') {
        const prog = Math.min(3, newStreak);
        return { ...ach, currentProgress: prog, unlocked: prog >= 3 };
      }
      if (ach.id === 'ach_streak_7') {
        const prog = Math.min(7, newStreak);
        return { ...ach, currentProgress: prog, unlocked: prog >= 7 };
      }
      if (ach.id === 'ach_tonnage_10k') {
        const nextProg = Math.min(10000, newTotalVolume);
        return { ...ach, currentProgress: nextProg, unlocked: nextProg >= 10000 };
      }
      return ach;
    });
    FitStorage.saveAchievements(updatedAchievements);
    setAchievements(updatedAchievements);

    // 4. Update challenges progress
    const updatedChallenges = challenges.map((ch) => {
      if (!ch.joined) return ch;
      if (ch.category === 'volume') {
        const newP = Math.min(ch.goalTarget, ch.currentProgress + entry.totalVolumeKg);
        return { ...ch, currentProgress: newP };
      }
      if (ch.category === 'workouts') {
        const newP = Math.min(ch.goalTarget, ch.currentProgress + 1);
        return { ...ch, currentProgress: newP };
      }
      if (ch.category === 'calories') {
        const newP = Math.min(ch.goalTarget, ch.currentProgress + entry.calories);
        return { ...ch, currentProgress: newP };
      }
      return ch;
    });
    FitStorage.saveChallenges(updatedChallenges);
    setChallenges(updatedChallenges);

    // 5. Update program progress if this routine was part of a multi-day plan
    const allPrograms = FitStorage.getPrograms();
    allPrograms.forEach((prog) => {
      prog.days.forEach((d) => {
        if (d.routine.id === entry.routineId || d.routine.title === entry.routineTitle) {
          FitStorage.setProgramDayCompleted(prog.id, d.dayNumber);
        }
      });
    });

    // 6. Close active routine modal & show analytics
    setActiveRoutine(null);
    setActiveTab('analytics');
  };

  // Handle Custom Routine Created
  const handleCreateRoutine = (routine: WorkoutRoutine) => {
    FitStorage.saveRoutine(routine);
    setRoutines(FitStorage.getRoutines());
    const updatedUser = FitStorage.addXp(120, user);
    setUser(updatedUser);
  };

  // Handle Duel Victory
  const handleDuelWin = (xpGained: number) => {
    const updatedUser = FitStorage.addXp(xpGained, user);
    const finalUser: UserProfile = {
      ...updatedUser,
      stats: {
        ...updatedUser.stats,
        duelsWon: updatedUser.stats.duelsWon + 1,
      },
    };
    FitStorage.saveUser(finalUser);
    setUser(finalUser);

    // Update leaderboard score
    const updatedLeaderboard = leaderboard.map((u) =>
      u.isCurrentUser ? { ...u, xpEarned: u.xpEarned + xpGained } : u
    );
    FitStorage.saveLeaderboard(updatedLeaderboard);
    setLeaderboard(updatedLeaderboard);
  };

  // Handle Join Challenge
  const handleJoinChallenge = (challengeId: string) => {
    const updated = challenges.map((c) => (c.id === challengeId ? { ...c, joined: true } : c));
    FitStorage.saveChallenges(updated);
    setChallenges(updated);
  };

  // Handle Challenge Contribution
  const handleContributeChallenge = (challengeId: string, amount: number) => {
    const updated = challenges.map((c) =>
      c.id === challengeId
        ? {
            ...c,
            currentProgress: Math.min(c.goalTarget, c.currentProgress + amount),
          }
        : c
    );
    FitStorage.saveChallenges(updated);
    setChallenges(updated);

    const updatedUser = FitStorage.addXp(50, user);
    setUser(updatedUser);
  };

  // Handle Claim Challenge Reward
  const handleClaimChallengeReward = (challengeId: string, rewardXp: number) => {
    const updated = challenges.map((c) =>
      c.id === challengeId ? { ...c, rewardClaimed: true } : c
    );
    FitStorage.saveChallenges(updated);
    setChallenges(updated);

    const updatedUser = FitStorage.addXp(rewardXp, user);
    const finalUser: UserProfile = {
      ...updatedUser,
      stats: {
        ...updatedUser.stats,
        challengesCompleted: updatedUser.stats.challengesCompleted + 1,
      },
    };
    FitStorage.saveUser(finalUser);
    setUser(finalUser);
  };

  // Handle Claim Achievement XP
  const handleClaimAchievementXp = (achievementId: string, xpReward: number) => {
    const updated = achievements.map((a) =>
      a.id === achievementId ? { ...a, rewardClaimed: true } : a
    );
    FitStorage.saveAchievements(updated);
    setAchievements(updated);

    const updatedUser = FitStorage.addXp(xpReward, user);
    setUser(updatedUser);
  };

  // Handle Smartwatch Update
  const handleUpdateSmartwatch = (device: SmartwatchDevice) => {
    FitStorage.saveSmartwatch(device);
    setSmartwatch(device);
  };

  // Reload state after json backup restored
  const handleDataImported = () => {
    setUser(FitStorage.getUser());
    setRoutines(FitStorage.getRoutines());
    setHistory(FitStorage.getHistory());
    setChallenges(FitStorage.getChallenges());
    setAchievements(FitStorage.getAchievements());
    setLeaderboard(FitStorage.getLeaderboard());
    setSmartwatch(FitStorage.getSmartwatch());
    setReminders(FitStorage.getReminders());
  };

  // Text Size scaling class
  const textSizeClass =
    textSize === 'xlarge'
      ? 'text-lg'
      : textSize === 'large'
      ? 'text-base'
      : 'text-sm';

  // If unauthenticated and user has not chosen guest mode, present the AuthScreen directly
  if (!authLoading && !isAuthenticated && !isGuestMode) {
    return (
      <AuthScreen
        lang={lang}
        onSuccess={handleAuthSuccess}
        onContinueGuest={() => {
          setIsGuestMode(true);
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-cyan-500 selection:text-black pb-24 sm:pb-28 transition-colors"
    >
      {/* Top Main Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        smartwatch={smartwatch}
        unreadNotifications={reminders.filter((r) => r.enabled).length}
        onOpenNotifications={() => setActiveTab('settings')}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onOpenQuickStart={() => setQuickStartModalOpen(true)}
        lang={lang}
        setLang={(l) => {
          setLang(l);
          FitStorage.saveLanguage(l);
        }}
        theme={theme}
        setTheme={setTheme}
        isSoundMuted={isSoundMuted}
        setIsSoundMuted={(m) => {
          setIsSoundMuted(m);
          sound.setMuted(m);
        }}
        toggleSound={() => {
          const next = !isSoundMuted;
          sound.setMuted(next);
          setIsSoundMuted(next);
        }}
        isOffline={isOffline}
        setIsOffline={(off) => {
          setIsOffline(off);
          FitStorage.saveOfflineMode(off);
        }}
        toggleOffline={() => {
          const next = !isOffline;
          setIsOffline(next);
          FitStorage.saveOfflineMode(next);
        }}
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Container with bottom padding for the floating Liquid Glass dock */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 sm:pb-32">
        
        {/* Render Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            routines={routines}
            challenges={challenges}
            smartwatch={smartwatch}
            lang={lang}
            onStartRoutine={handleStartRoutine}
            onNavigateTab={setActiveTab}
            onOpenQuickStart={() => setQuickStartModalOpen(true)}
          />
        )}

        {activeTab === 'routines' && (
          <WorkoutCatalogView
            routines={routines}
            lang={lang}
            onStartRoutine={handleStartRoutine}
            onCreateRoutine={handleCreateRoutine}
          />
        )}

        {(activeTab === 'community' || activeTab === 'challenges' || activeTab === 'leaderboard' || activeTab === 'achievements') && (
          <CommunityView
            challenges={challenges}
            leaderboard={leaderboard}
            achievements={achievements}
            user={user}
            history={history}
            lang={lang}
            initialSubTab={activeTab === 'leaderboard' ? 'leaderboard' : activeTab === 'achievements' ? 'achievements' : 'challenges'}
            onJoinChallenge={handleJoinChallenge}
            onContribute={handleContributeChallenge}
            onClaimReward={handleClaimChallengeReward}
            onClaimAchievementXp={handleClaimAchievementXp}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            history={history}
            user={user}
            lang={lang}
          />
        )}

        {activeTab === 'smartwatch' && (
          <SmartwatchView
            smartwatch={smartwatch}
            lang={lang}
            onUpdateDevice={handleUpdateSmartwatch}
          />
        )}

        {activeTab === 'settings' && (
          <CloudAndSettingsView
            user={user}
            lang={lang}
            setLang={(l) => {
              setLang(l);
              FitStorage.saveLanguage(l);
            }}
            theme={theme}
            setTheme={setTheme}
            isSoundMuted={isSoundMuted}
            setIsSoundMuted={(m) => {
              setIsSoundMuted(m);
              sound.setMuted(m);
            }}
            isOffline={isOffline}
            setIsOffline={(off) => {
              setIsOffline(off);
              FitStorage.saveOfflineMode(off);
            }}
            highContrast={highContrast}
            setHighContrast={setHighContrast}
            textSize={textSize}
            setTextSize={setTextSize}
            reminders={reminders}
            onUpdateReminders={(rems) => {
              setReminders(rems);
              FitStorage.saveReminders(rems);
            }}
            onDataImported={handleDataImported}
          />
        )}
      </main>

      {/* Floating Active Workout Mini Bar (when workout is minimized in background) */}
      {!activeRoutine && activeSession && (
        <ActiveWorkoutMiniBar
          session={activeSession}
          onMaximize={handleResumeWorkout}
          onDiscard={handleDiscardWorkout}
        />
      )}

      {/* Active Workout Tracker Fullscreen Overlay */}
      {activeRoutine && (
        <ActiveWorkoutTracker
          routine={activeRoutine}
          user={user}
          smartwatch={smartwatch}
          lang={lang}
          initialState={activeSession}
          onMinimize={handleMinimizeWorkout}
          onDiscard={handleDiscardWorkout}
          onClose={() => setActiveRoutine(null)}
          onComplete={handleCompleteWorkout}
        />
      )}

      {/* Cloud Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        lang={lang}
        onSuccess={handleAuthSuccess}
      />

      {/* Profile Edit & Customization Modal */}
      {profileModalOpen && (
        <ProfileEditModal
          user={user}
          achievements={achievements}
          lang={lang}
          onClose={() => setProfileModalOpen(false)}
          onSaveUser={(updatedUser) => {
            FitStorage.saveUser(updatedUser);
            setUser(updatedUser);
          }}
        />
      )}

      {/* Quick Start Session Selector Modal */}
      <QuickStartModal
        isOpen={quickStartModalOpen}
        onClose={() => setQuickStartModalOpen(false)}
        routines={routines}
        lang={lang}
        onStartRoutine={handleStartRoutine}
        onNavigateCatalog={() => setActiveTab('routines')}
      />
    </div>
  );
}
