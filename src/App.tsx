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
import { createFreshAchievements, defaultChallenges } from './lib/initialData';
import { translations } from './lib/i18n';
import { sound } from './lib/soundFx';
import { auth, db, onAuthStateChanged, signOut as fbSignOut } from './lib/firebase';
import { onSnapshot, doc } from 'firebase/firestore';
import { evaluateWeeklyLeagueReset, calculateRealStreak, calculateAthleteAttributes } from './lib/leagueEngine';
import { evaluateAllAchievements } from './lib/achievementEngine';
import { Smartphone } from 'lucide-react';

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
  const [isMobileLandscape, setIsMobileLandscape] = useState<boolean>(false);

  const t = translations[lang];

  // Screen Orientation Lock & Landscape Detection for Mobile
  useEffect(() => {
    try {
      if ('orientation' in window.screen && (window.screen.orientation as any)?.lock) {
        (window.screen.orientation as any).lock('portrait-primary').catch(() => {});
      }
    } catch {}

    const handleCheckOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const isShortScreen = window.innerHeight < 520;
      // Triggers strictly on smartphone-height landscape rotations
      setIsMobileLandscape(isLandscape && isShortScreen);
    };

    handleCheckOrientation();
    window.addEventListener('resize', handleCheckOrientation);
    window.addEventListener('orientationchange', handleCheckOrientation);

    return () => {
      window.removeEventListener('resize', handleCheckOrientation);
      window.removeEventListener('orientationchange', handleCheckOrientation);
    };
  }, []);

  // Always reset scroll to the very top when navigating between tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Listen to Firebase Auth state and attach real-time Firestore sync
  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (firebaseUser) {
        setIsAuthenticated(true);
        // Initial load of cloud data
        const cloudData = await FitStorage.loadUserFromCloud(
          firebaseUser.uid,
          firebaseUser.email || undefined,
          firebaseUser.displayName || undefined
        );
        const evaluated = evaluateWeeklyLeagueReset(cloudData.user, cloudData.history);
        const realStreak = calculateRealStreak(cloudData.history);
        const dynamicAttributes = calculateAthleteAttributes(cloudData.history, realStreak.currentStreak);
        const syncedUser: UserProfile = {
          ...evaluated.updatedUser,
          attributes: dynamicAttributes,
          stats: {
            ...evaluated.updatedUser.stats,
            currentStreak: realStreak.currentStreak,
            bestStreak: Math.max(evaluated.updatedUser.stats.bestStreak || 0, realStreak.bestStreak),
            caloriesBurned: cloudData.history.length > 0 ? cloudData.history.reduce((s, h) => s + (h.calories || 0), 0) : evaluated.updatedUser.stats.caloriesBurned,
            totalDistanceKm: cloudData.history.length > 0 ? cloudData.history.reduce((s, h) => s + (h.totalDistanceKm || 0), 0) : (evaluated.updatedUser.stats.totalDistanceKm || 0),
            totalMinutes: cloudData.history.length > 0 ? cloudData.history.reduce((s, h) => s + (h.durationMinutes || 0), 0) : evaluated.updatedUser.stats.totalMinutes,
            totalVolumeKg: cloudData.history.length > 0 ? cloudData.history.reduce((s, h) => s + (h.totalVolumeKg || 0), 0) : evaluated.updatedUser.stats.totalVolumeKg,
            totalWorkouts: cloudData.history.length > 0 ? cloudData.history.length : evaluated.updatedUser.stats.totalWorkouts,
          },
        };
        const evaluatedAch = evaluateAllAchievements(
          syncedUser,
          cloudData.history,
          cloudData.achievements || FitStorage.getAchievements(),
          (cloudData.routines || []).filter((r) => r.isCustom).length
        );
        setUser(syncedUser);
        setHistory(cloudData.history);
        setAchievements(evaluatedAch);
        setChallenges(cloudData.challenges);
        setRoutines(cloudData.routines);

        // Real-time Firestore Live Sync for instant multi-device synchronization
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<UserProfile>;
            
            const localResetAt = localStorage.getItem('fitquest_last_reset_at');
            const isSnapshotReset = Boolean(
              (data.lastResetAt && (!localResetAt || new Date(data.lastResetAt).getTime() > new Date(localResetAt).getTime())) ||
              (data.level === 1 && (data.xp === 0 || !data.xp) && user.level > 1)
            );

            if (isSnapshotReset) {
              if (data.lastResetAt) localStorage.setItem('fitquest_last_reset_at', data.lastResetAt);
              localStorage.removeItem('fitquest_history');
              localStorage.setItem('fitquest_claimed_challenges', JSON.stringify([]));
              setHistory([]);
              setAchievements(createFreshAchievements());
              setChallenges(defaultChallenges.map(c => ({ ...c, currentProgress: 0, completed: false })));
            }

            setUser((prev) => {
              const currentHistory = isSnapshotReset ? [] : FitStorage.getHistory();
              const realStreak = calculateRealStreak(currentHistory);
              const dynamicAttributes = calculateAthleteAttributes(currentHistory, realStreak.currentStreak);

              const effectiveLevel = isSnapshotReset ? (data.level || 1) : Math.max(prev.level, data.level || 1);
              const effectiveXp = isSnapshotReset ? (data.xp || 0) : Math.max(prev.xp, data.xp || 0);

              const updated: UserProfile = {
                ...prev,
                ...data,
                name: data.name || prev.name,
                avatar: data.avatar || prev.avatar,
                rankTitle: data.rankTitle || (isSnapshotReset ? 'Gladiador de Bronce' : prev.rankTitle),
                level: effectiveLevel,
                xp: effectiveXp,
                currentLevelXp: isSnapshotReset ? (data.currentLevelXp || 0) : ((data.xp !== undefined && data.xp >= prev.xp) ? (data.currentLevelXp ?? prev.currentLevelXp) : prev.currentLevelXp),
                nextLevelXp: data.nextLevelXp || (isSnapshotReset ? 500 : prev.nextLevelXp),
                weightKg: data.weightKg ?? prev.weightKg,
                targetWeightKg: data.targetWeightKg ?? prev.targetWeightKg,
                unlockedBadges: isSnapshotReset ? (data.unlockedBadges || []) : (data.unlockedBadges !== undefined ? data.unlockedBadges : (prev.unlockedBadges || [])),
                claimedChallenges: isSnapshotReset ? (data.claimedChallenges || []) : (data.claimedChallenges !== undefined ? data.claimedChallenges : (prev.claimedChallenges || [])),
                attributes: isSnapshotReset ? { strength: 10, endurance: 10, agility: 10, discipline: 10 } : dynamicAttributes,
                stats: {
                  ...prev.stats,
                  totalWorkouts: currentHistory.length,
                  totalVolumeKg: currentHistory.reduce((s, h) => s + (h.totalVolumeKg || 0), 0),
                  totalMinutes: currentHistory.reduce((s, h) => s + (h.durationMinutes || 0), 0),
                  caloriesBurned: currentHistory.reduce((s, h) => s + (h.calories || 0), 0),
                  totalDistanceKm: currentHistory.reduce((s, h) => s + (h.totalDistanceKm || 0), 0),
                  currentStreak: realStreak.currentStreak,
                  bestStreak: Math.max(prev.stats?.bestStreak || 0, realStreak.bestStreak),
                },
                lastResetAt: data.lastResetAt || prev.lastResetAt,
              };
              try {
                localStorage.setItem('fitquest_user_profile', JSON.stringify(updated));
                localStorage.setItem('fitquest_claimed_challenges', JSON.stringify(updated.claimedChallenges || []));
              } catch {}
              return updated;
            });
          }
        });
      } else {
        setIsAuthenticated(false);
        const localUser = FitStorage.getUser();
        const localHistory = FitStorage.getHistory();
        const evaluated = evaluateWeeklyLeagueReset(localUser, localHistory);
        const realStreak = calculateRealStreak(localHistory);
        const dynamicAttributes = calculateAthleteAttributes(localHistory, realStreak.currentStreak);
        const syncedLocalUser: UserProfile = {
          ...evaluated.updatedUser,
          attributes: dynamicAttributes,
          stats: {
            ...evaluated.updatedUser.stats,
            currentStreak: realStreak.currentStreak,
            bestStreak: Math.max(evaluated.updatedUser.stats.bestStreak || 0, realStreak.bestStreak),
            caloriesBurned: localHistory.length > 0 ? localHistory.reduce((s, h) => s + (h.calories || 0), 0) : evaluated.updatedUser.stats.caloriesBurned,
            totalMinutes: localHistory.length > 0 ? localHistory.reduce((s, h) => s + (h.durationMinutes || 0), 0) : evaluated.updatedUser.stats.totalMinutes,
            totalVolumeKg: localHistory.length > 0 ? localHistory.reduce((s, h) => s + (h.totalVolumeKg || 0), 0) : evaluated.updatedUser.stats.totalVolumeKg,
            totalWorkouts: localHistory.length > 0 ? localHistory.length : evaluated.updatedUser.stats.totalWorkouts,
          },
        };
        const evaluatedAch = evaluateAllAchievements(
          syncedLocalUser,
          localHistory,
          FitStorage.getAchievements(),
          FitStorage.getRoutines().filter((r) => r.isCustom).length
        );
        setUser(syncedLocalUser);
        setAchievements(evaluatedAch);
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
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
    // If completed workout belonged to a multi-day program, unlock the next day!
    if (activeRoutine?.programId && activeRoutine?.programDayNumber) {
      FitStorage.setProgramDayCompleted(activeRoutine.programId, activeRoutine.programDayNumber);
    }

    FitStorage.clearActiveSession();
    setActiveSession(null);
    setActiveRoutine(null);

    // 1. Add history entry (persists to Firestore if logged in)
    FitStorage.addHistoryEntry(entry, user);
    const updatedHistory = FitStorage.getHistory();
    setHistory(updatedHistory);

    // 2. Add XP to User Profile
    const updatedUser = FitStorage.addXp(xpGained, user);

    // Calculate real streak and exact cumulative stats from complete history
    const realStreak = calculateRealStreak(updatedHistory);
    const dynamicAttributes = calculateAthleteAttributes(updatedHistory, realStreak.currentStreak);
    const calculatedVolume = updatedHistory.reduce((sum, h) => sum + (h.totalVolumeKg || 0), 0);
    const calculatedMinutes = updatedHistory.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
    const calculatedCalories = updatedHistory.reduce((sum, h) => sum + (h.calories || 0), 0);
    const calculatedDistance = updatedHistory.reduce((sum, h) => sum + (h.totalDistanceKm || 0), 0);

    const finalUser: UserProfile = {
      ...updatedUser,
      attributes: dynamicAttributes,
      stats: {
        ...updatedUser.stats,
        totalWorkouts: updatedHistory.length,
        totalVolumeKg: calculatedVolume,
        totalDistanceKm: calculatedDistance,
        totalMinutes: calculatedMinutes,
        caloriesBurned: calculatedCalories,
        currentStreak: realStreak.currentStreak,
        bestStreak: Math.max(updatedUser.stats.bestStreak || 0, realStreak.bestStreak),
      },
    };

    FitStorage.saveUser(finalUser);
    setUser(finalUser);

    // 3. Check and unlock achievements
    const allAchievements = FitStorage.getAchievements();
    const updatedAchievements = evaluateAllAchievements(
      finalUser,
      updatedHistory,
      allAchievements,
      routines.filter((r) => r.isCustom).length,
      challenges.filter((c) => c.joined && c.currentProgress >= c.goalTarget).length
    );
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

  // Handle Claim Challenge Reward (Cloud Synced to avoid duplicate claims)
  const handleClaimChallengeReward = (challengeId: string, rewardXp: number) => {
    const updatedUser = FitStorage.claimWeeklyChallenge(challengeId, rewardXp, user);
    setUser(updatedUser);

    const updatedChallenges = challenges.map((c) =>
      c.id === challengeId ? { ...c, rewardClaimed: true } : c
    );
    FitStorage.saveChallenges(updatedChallenges);
    setChallenges(updatedChallenges);
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

      {/* Main Content Container with bottom padding for the floating Liquid Glass dock and iOS Home Indicator */}
      <main 
        style={{ paddingBottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        
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
            onOpenProfileModal={() => setProfileModalOpen(true)}
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
            onEquipTitle={(newTitle) => {
              const updatedUser: UserProfile = {
                ...user,
                rankTitle: newTitle,
              };
              setUser(updatedUser);
              FitStorage.saveUser(updatedUser);
              FitStorage.syncUserToCloud(updatedUser);
              sound.playLevelUp();
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            history={history}
            user={user}
            lang={lang}
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
            onResetProgress={async () => {
              const freshUser = await FitStorage.resetUserProgress();
              setUser(freshUser);
              setHistory([]);
              setAchievements(createFreshAchievements());
              setChallenges(defaultChallenges.map((c) => ({ ...c, currentProgress: 0, completed: false })));
            }}
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
          onSaveUser={async (updatedUser) => {
            setUser(updatedUser);
            FitStorage.saveUser(updatedUser);
            await FitStorage.syncUserToCloud(updatedUser);
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

      {/* Mobile Landscape Orientation Guard Overlay */}
      {isMobileLandscape && (
        <div className="fixed inset-0 z-[99999] bg-[#09090b]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_25px_rgba(6,182,212,0.3)] animate-pulse">
            <Smartphone className="w-7 h-7 rotate-90 animate-bounce" />
          </div>
          <h3 className="font-display font-black text-lg text-white tracking-tight">
            Modo Vertical Requerido
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
            Gira tu dispositivo a vertical para registrar tus series, cronómetro y cargas de entrenamiento con total comodidad.
          </p>
          <div className="mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>FITQUEST PRO • EXPERIENCIA MÓVIL EN VERTICAL</span>
          </div>
        </div>
      )}
    </div>
  );
}
