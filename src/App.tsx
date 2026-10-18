import React, { useState, useEffect, useRef } from 'react';
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
  DailyNutritionLog,
  SaturdayWeighIn,
} from './types';
import { FitStorage } from './lib/storage';
import { createFreshAchievements, createFreshUser, defaultChallenges } from './lib/initialData';
import { translations } from './lib/i18n';
import { sound } from './lib/soundFx';
import { auth, db, onAuthStateChanged, signOut as fbSignOut } from './lib/firebase';
import { onSnapshot, doc, updateDoc, collection } from 'firebase/firestore';
import {
  evaluateWeeklyLeagueReset,
  calculateRealStreak,
  checkAndApplyStreakShield,
  calculateAthleteAttributes,
  calculateAttributeXpBonus,
} from './lib/leagueEngine';
import { attackBossRaid } from './lib/bossRaidEngine';
import { evaluateAllAchievements } from './lib/achievementEngine';
import { calculateLevelFromTotalXp } from './lib/progressionEngine';
import { Smartphone, ShieldAlert } from 'lucide-react';

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
import { NutritionView } from './components/NutritionView';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { ProfileEditModal } from './components/ProfileEditModal';
import { QuickStartModal } from './components/QuickStartModal';
import { SportActivityModal } from './components/SportActivityModal';
import { LevelRoadmapModal } from './components/LevelRoadmapModal';
import { LevelUpCelebrationModal } from './components/LevelUpCelebrationModal';
import { OnboardingModal } from './components/OnboardingModal';

// Helper para identificar este dispositivo y forzar la exclusión mutua (Móvil vs Tablet)
function getDeviceSessionId(): string {
  let id = localStorage.getItem('fitquest_device_session_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    localStorage.setItem('fitquest_device_session_id', id);
  }
  return id;
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/ipad|tablet/i.test(ua)) return 'Tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'Móvil';
  return 'Navegador Web / Escritorio';
}

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

  // Cloud Auth State & Single Active Session Control
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [quickStartModalOpen, setQuickStartModalOpen] = useState<boolean>(false);
  const [sportModalOpen, setSportModalOpen] = useState<boolean>(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState<boolean>(false);
  const [isSessionRevoked, setIsSessionRevoked] = useState<boolean>(false);
  const [revokingDeviceName, setRevokingDeviceName] = useState<string>('Tablet / Móvil');

  // Level Progression Roadmap & Epic Level Up Celebration
  const [levelRoadmapModalOpen, setLevelRoadmapModalOpen] = useState<boolean>(false);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState<boolean>(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState<boolean>(false);
  const [celebrationLevel, setCelebrationLevel] = useState<number>(user.level || 1);

  // 1. Listen for real-time Level Up event triggered during active progression (XP earned)
  useEffect(() => {
    const handleLevelUp = (e: Event) => {
      const customEvt = e as CustomEvent<{ newLevel: number }>;
      const lvl = customEvt.detail?.newLevel;
      if (lvl) {
        setCelebrationLevel(lvl);
        setLevelUpModalOpen(true);
        localStorage.setItem('fitquest_last_celebrated_level', String(lvl));
        try {
          sound.playLevelUp();
        } catch {}
      }
    };

    window.addEventListener('fitquest_level_up', handleLevelUp);
    return () => {
      window.removeEventListener('fitquest_level_up', handleLevelUp);
    };
  }, []);

  // 2. Persistent Level Up Celebration Guard (verifies against persisted lastCelebratedLevel)
  useEffect(() => {
    if (authLoading) return;

    const currentLevel = user.level || 1;
    const storedCelebrated = Number(localStorage.getItem('fitquest_last_celebrated_level') || 0);
    const lastCelebrated = Math.max(user.lastCelebratedLevel || 0, storedCelebrated);

    if (currentLevel > 1 && lastCelebrated > 0 && currentLevel > lastCelebrated) {
      setCelebrationLevel(currentLevel);
      setLevelUpModalOpen(true);
      localStorage.setItem('fitquest_last_celebrated_level', String(currentLevel));
      try {
        sound.playLevelUp();
      } catch {}
      setUser((prev) => ({
        ...prev,
        lastCelebratedLevel: currentLevel,
      }));
    } else if (lastCelebrated === 0) {
      // Catch-up check: if user advanced past Level 8 right before this update, celebrate it!
      if (currentLevel > 8) {
        setCelebrationLevel(currentLevel);
        setLevelUpModalOpen(true);
        localStorage.setItem('fitquest_last_celebrated_level', String(currentLevel));
        try {
          sound.playLevelUp();
        } catch {}
        setUser((prev) => ({
          ...prev,
          lastCelebratedLevel: currentLevel,
        }));
      } else {
        // Otherwise initialize baseline so login never causes a false celebration
        localStorage.setItem('fitquest_last_celebrated_level', String(currentLevel));
      }
    }
  }, [user.level, authLoading]);

  const handleEquipTitle = async (newTitle: string) => {
    const updatedUser: UserProfile = {
      ...user,
      rankTitle: newTitle,
    };
    setUser(updatedUser);
    FitStorage.saveUser(updatedUser);
    await FitStorage.syncUserToCloud(updatedUser);
  };

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

  // Purge outdated service worker caches on version bump
  useEffect(() => {
    const CURRENT_PWA_BUILD = 'v3.6';
    const storedBuild = localStorage.getItem('fitquest_pwa_build');
    if (storedBuild && storedBuild !== CURRENT_PWA_BUILD) {
      localStorage.setItem('fitquest_pwa_build', CURRENT_PWA_BUILD);
      if ('caches' in window) {
        caches.keys().then((names) => {
          return Promise.all(names.map((name) => caches.delete(name)));
        });
      }
    } else if (!storedBuild) {
      localStorage.setItem('fitquest_pwa_build', CURRENT_PWA_BUILD);
    }
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
    let unsubNutrition: (() => void) | null = null;
    let unsubWeighIns: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }
      if (unsubNutrition) {
        unsubNutrition();
        unsubNutrition = null;
      }
      if (unsubWeighIns) {
        unsubWeighIns();
        unsubWeighIns = null;
      }

      if (firebaseUser) {
        setIsAuthenticated(true);
        // Initial load of cloud data (including bidirectional nutrition & weighIns sync)
        const cloudData = await FitStorage.loadUserFromCloud(
          firebaseUser.uid,
          firebaseUser.email || undefined,
          firebaseUser.displayName || undefined
        );

        // Notify local UI tabs immediately that fresh cloud nutrition, weighIns and history are loaded
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('fitquest_nutrition_updated'));
          window.dispatchEvent(new CustomEvent('fitquest_weighins_updated'));
          window.dispatchEvent(new CustomEvent('fitquest_history_updated'));
        }
        const shieldResult = checkAndApplyStreakShield(cloudData.user, cloudData.history);
        const userToEvaluate = shieldResult.updatedUser;
        const evaluated = evaluateWeeklyLeagueReset(userToEvaluate, cloudData.history);
        const realStreak = calculateRealStreak(cloudData.history, userToEvaluate.shieldUsedDates);
        const dynamicAttributes = calculateAthleteAttributes(
          cloudData.history,
          realStreak.currentStreak,
          cloudData.user.level,
          cloudData.user.attributes
        );
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

        // Claim exclusive active session for this device
        const currentDeviceId = getDeviceSessionId();
        const currentDeviceName = getDeviceName();
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          await updateDoc(userDocRef, {
            activeSessionDeviceId: currentDeviceId,
            activeSessionDeviceName: currentDeviceName,
            activeSessionClaimedAt: new Date().toISOString()
          });
        } catch (e) {
          // Document may not exist yet or offline
        }

        // Real-time Firestore Live Sync for instant multi-device synchronization
        unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<UserProfile> & {
              activeSessionDeviceId?: string;
              activeSessionDeviceName?: string;
              activeSessionClaimedAt?: string;
            };

            const localResetAt = localStorage.getItem('fitquest_last_reset_at');
            const isSnapshotReset = Boolean(
              (data.level === 1 && (data.xp === 0 || !data.xp)) &&
              ((data.lastResetAt && (!localResetAt || new Date(data.lastResetAt).getTime() > new Date(localResetAt).getTime())) ||
               (user.level > 1 && user.xp > 0))
            );

            if (isSnapshotReset) {
              if (data.lastResetAt) localStorage.setItem('fitquest_last_reset_at', data.lastResetAt);
              localStorage.removeItem('fitquest_history');
              localStorage.setItem('fitquest_claimed_challenges', JSON.stringify([]));
              setHistory([]);
              setAchievements(createFreshAchievements());
              setChallenges(defaultChallenges.map(c => ({ ...c, currentProgress: 0, completed: false })));
            }

            // Real-time synchronization of workout history from master user document
            if (Array.isArray((data as any).workoutHistory)) {
              try {
                const cloudHistory = (data as any).workoutHistory as WorkoutHistoryEntry[];
                const localHistory = FitStorage.getHistory();
                const deletedIds = FitStorage.getDeletedHistoryIds();
                const mergedMap = new Map<string, WorkoutHistoryEntry>();

                if (!isSnapshotReset) {
                  localHistory.forEach((h) => {
                    if (h && h.id && !deletedIds.has(h.id)) {
                      mergedMap.set(h.id, h);
                    }
                  });
                }

                cloudHistory.forEach((h) => {
                  if (h && h.id && !deletedIds.has(h.id) && !mergedMap.has(h.id)) {
                    mergedMap.set(h.id, h);
                  }
                });

                const sortedMerged = Array.from(mergedMap.values()).sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                if (JSON.stringify(sortedMerged) !== JSON.stringify(localHistory)) {
                  FitStorage.saveHistory(sortedMerged);
                  setHistory(sortedMerged);
                  window.dispatchEvent(new CustomEvent('fitquest_history_updated'));
                }
              } catch (e) {
                console.warn('Live sync history parsing notice:', e);
              }
            }

            // Real-time synchronization of custom routines
            if (Array.isArray((data as any).customRoutines)) {
              try {
                const cloudCustom = (data as any).customRoutines as WorkoutRoutine[];
                const currentRoutines = FitStorage.getRoutines();
                const defaultsOnly = currentRoutines.filter((r) => !r.isCustom);
                const mergedRoutines = [...defaultsOnly, ...cloudCustom.map((r) => ({ ...r, isCustom: true }))];
                if (JSON.stringify(mergedRoutines) !== JSON.stringify(currentRoutines)) {
                  localStorage.setItem('fitquest_routines', JSON.stringify(mergedRoutines));
                  setRoutines(mergedRoutines);
                }
              } catch (e) {
                console.warn('Live sync custom routines notice:', e);
              }
            }

            // Real-time synchronization of achievements state
            if (Array.isArray((data as any).achievementsState)) {
              try {
                const cloudAch = (data as any).achievementsState as Achievement[];
                const currentAch = FitStorage.getAchievements();
                const cloudMap = new Map(cloudAch.map((a) => [a.id, a]));
                const mergedAch = currentAch.map((base) => {
                  const c = cloudMap.get(base.id);
                  if (!c) return base;
                  const unlockedAtVal = base.unlockedAt || c.unlockedAt;
                  return {
                    ...base,
                    currentProgress: Math.max(base.currentProgress || 0, c.currentProgress || 0),
                    unlocked: Boolean(base.unlocked || c.unlocked),
                    ...(unlockedAtVal ? { unlockedAt: unlockedAtVal } : {}),
                    rewardClaimed: Boolean((base as any).rewardClaimed || (c as any).rewardClaimed),
                  };
                });
                if (JSON.stringify(mergedAch) !== JSON.stringify(currentAch)) {
                  localStorage.setItem('fitquest_achievements', JSON.stringify(mergedAch));
                  setAchievements(mergedAch);
                }
              } catch (e) {
                console.warn('Live sync achievements notice:', e);
              }
            }

            if (data.programProgress) {
              try {
                localStorage.setItem('fitquest_program_progress', JSON.stringify(data.programProgress));
              } catch {}
            }

            if (data.activeSession !== undefined) {
              if (data.activeSession) {
                try {
                  localStorage.setItem('fitquest_active_session', JSON.stringify(data.activeSession));
                } catch {}
                setActiveSession((prev) => {
                  if (!prev || prev.routineId !== data.activeSession?.routineId) {
                    return data.activeSession || null;
                  }
                  return prev;
                });
              } else {
                try {
                  localStorage.removeItem('fitquest_active_session');
                } catch {}
                if (!activeRoutine) {
                  setActiveSession(null);
                }
              }
            }

            setUser((prev) => {
              const currentHistory = isSnapshotReset ? [] : FitStorage.getHistory();
              const realStreak = calculateRealStreak(currentHistory, (data.shieldUsedDates || prev.shieldUsedDates));
              const localHasMoreXp = !isSnapshotReset && (prev.xp || 0) > (data.xp || 0);
              const effectiveXp = isSnapshotReset
                ? (data.xp || 0)
                : Math.max(data.xp || 0, prev.xp || 0);
              const prog = calculateLevelFromTotalXp(effectiveXp);
              const effectiveLevel = prog.level;
              const effectiveCurrentLevelXp = prog.currentLevelXp;
              const effectiveNextLevelXp = prog.nextLevelXp;

              const dynamicAttributes = calculateAthleteAttributes(
                currentHistory,
                realStreak.currentStreak,
                effectiveLevel,
                prev.attributes
              );

              const calculatedVolume = currentHistory.reduce((s, h) => s + (h.totalVolumeKg || 0), 0);
              const calculatedMinutes = currentHistory.reduce((s, h) => s + (h.durationMinutes || 0), 0);
              const calculatedCalories = currentHistory.reduce((s, h) => s + (h.calories || 0), 0);
              const calculatedDistance = currentHistory.reduce((s, h) => s + (h.totalDistanceKm || 0), 0);

              const resolvedTotalWorkouts = currentHistory.length > 0
                ? currentHistory.length
                : Math.max(data.stats?.totalWorkouts || 0, prev.stats?.totalWorkouts || 0);
              const resolvedVolume = currentHistory.length > 0
                ? calculatedVolume
                : Math.max(data.stats?.totalVolumeKg || 0, prev.stats?.totalVolumeKg || 0);
              const resolvedMinutes = currentHistory.length > 0
                ? calculatedMinutes
                : Math.max(data.stats?.totalMinutes || 0, prev.stats?.totalMinutes || 0);
              const resolvedCalories = currentHistory.length > 0
                ? calculatedCalories
                : Math.max(data.stats?.caloriesBurned || 0, prev.stats?.caloriesBurned || 0);
              const resolvedDistance = currentHistory.length > 0
                ? calculatedDistance
                : Math.max(data.stats?.totalDistanceKm || 0, prev.stats?.totalDistanceKm || 0);

              const updated: UserProfile = {
                ...prev,
                ...data,
                name: data.name || prev.name,
                avatar: data.avatar || prev.avatar,
                rankTitle: localHasMoreXp ? (prev.rankTitle || data.rankTitle || 'Recluta Inicial') : (data.rankTitle || (isSnapshotReset ? 'Recluta Inicial' : prev.rankTitle)),
                level: effectiveLevel,
                xp: effectiveXp,
                currentLevelXp: effectiveCurrentLevelXp,
                nextLevelXp: effectiveNextLevelXp,
                weightKg: data.weightKg ?? prev.weightKg,
                targetWeightKg: data.targetWeightKg ?? prev.targetWeightKg,
                heightCm: data.heightCm ?? prev.heightCm,
                age: data.age ?? prev.age,
                gender: data.gender ?? prev.gender,
                fitnessGoal: data.fitnessGoal ?? prev.fitnessGoal,
                trainingDaysPerWeek: data.trainingDaysPerWeek ?? prev.trainingDaysPerWeek,
                experienceLevel: data.experienceLevel ?? prev.experienceLevel,
                onboardingCompleted: data.onboardingCompleted ?? prev.onboardingCompleted,
                unlockedBadges: isSnapshotReset ? (data.unlockedBadges || []) : (data.unlockedBadges !== undefined ? data.unlockedBadges : (prev.unlockedBadges || [])),
                claimedChallenges: isSnapshotReset ? (data.claimedChallenges || []) : (data.claimedChallenges !== undefined ? data.claimedChallenges : (prev.claimedChallenges || [])),
                attributes: isSnapshotReset ? { strength: 10, endurance: 10, agility: 10, discipline: 10 } : dynamicAttributes,
                programProgress: data.programProgress || prev.programProgress,
                activeSession: data.activeSession !== undefined ? data.activeSession : prev.activeSession,
                activeNutritionPlanId: data.activeNutritionPlanId !== undefined ? data.activeNutritionPlanId : prev.activeNutritionPlanId,
                stats: {
                  ...prev.stats,
                  ...(data.stats || {}),
                  totalWorkouts: resolvedTotalWorkouts,
                  totalVolumeKg: resolvedVolume,
                  totalMinutes: resolvedMinutes,
                  caloriesBurned: resolvedCalories,
                  totalDistanceKm: resolvedDistance,
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

            // Real-time synchronization of nutrition logs from master user document (identical to XP, level, stats)
            if (data.nutritionLogs && typeof data.nutritionLogs === 'object') {
              try {
                const currentLogsRaw = localStorage.getItem('fitquest_nutrition_logs');
                const currentLogs: Record<string, DailyNutritionLog> = currentLogsRaw ? JSON.parse(currentLogsRaw) : {};
                let hasChanges = false;

                for (const [dateKey, cloudLog] of Object.entries(data.nutritionLogs)) {
                  const local = currentLogs[dateKey];
                  const cloudFoodsCount = cloudLog?.foods?.length || 0;
                  const localFoodsCount = local?.foods?.length || 0;
                  const cloudWater = Number(cloudLog?.waterMl) || 0;
                  const localWater = Number(local?.waterMl) || 0;

                  if (!local || cloudFoodsCount !== localFoodsCount || cloudWater !== localWater) {
                    currentLogs[dateKey] = {
                      ...(local || {}),
                      ...cloudLog,
                      date: dateKey,
                    };
                    hasChanges = true;
                  }
                }

                if (hasChanges) {
                  localStorage.setItem('fitquest_nutrition_logs', JSON.stringify(currentLogs));
                  window.dispatchEvent(new CustomEvent('fitquest_nutrition_updated'));
                }
              } catch (e) {
                console.warn('Live sync nutrition parsing notice:', e);
              }
            }

            // Real-time synchronization of Saturday weigh-ins from master user document
            if (Array.isArray(data.saturdayWeighIns) && data.saturdayWeighIns.length > 0) {
              try {
                const currentList = FitStorage.getSaturdayWeighIns();
                if (data.saturdayWeighIns.length !== currentList.length || JSON.stringify(data.saturdayWeighIns) !== JSON.stringify(currentList)) {
                  localStorage.setItem('fitquest_saturday_weigh_ins', JSON.stringify(data.saturdayWeighIns));
                  window.dispatchEvent(new CustomEvent('fitquest_weighins_updated'));
                }
              } catch (e) {
                console.warn('Live sync weigh-ins parsing notice:', e);
              }
            }
          }
        }, (error) => {
          console.warn('User live sync snapshot warning:', error);
        });

        // Real-time Firestore Live Sync for nutrition subcollection across all devices
        try {
          const nutritionColRef = collection(db, 'users', firebaseUser.uid, 'nutrition');
          unsubNutrition = onSnapshot(nutritionColRef, (snapshot) => {
            if (!snapshot.empty) {
              const currentLogsRaw = localStorage.getItem('fitquest_nutrition_logs');
              const currentLogs: Record<string, DailyNutritionLog> = currentLogsRaw ? JSON.parse(currentLogsRaw) : {};
              let hasChanges = false;

              snapshot.docChanges().forEach((change) => {
                const dateKey = change.doc.id;
                const cloudLog = change.doc.data() as DailyNutritionLog;
                if (change.type === 'added' || change.type === 'modified') {
                  currentLogs[dateKey] = {
                    ...currentLogs[dateKey],
                    ...cloudLog,
                    date: dateKey,
                  };
                  hasChanges = true;
                } else if (change.type === 'removed') {
                  delete currentLogs[dateKey];
                  hasChanges = true;
                }
              });

              if (hasChanges) {
                localStorage.setItem('fitquest_nutrition_logs', JSON.stringify(currentLogs));
                window.dispatchEvent(new CustomEvent('fitquest_nutrition_updated'));
              }
            }
          }, (err) => {
            console.warn('Nutrition onSnapshot safe warning:', err);
          });
        } catch (e) {
          console.warn('Could not attach nutrition real-time listener', e);
        }

        // Real-time Firestore Live Sync for Saturday weigh-ins subcollection across all devices
        try {
          const weighInsColRef = collection(db, 'users', firebaseUser.uid, 'weighIns');
          unsubWeighIns = onSnapshot(weighInsColRef, (snapshot) => {
            if (!snapshot.empty) {
              const currentList = FitStorage.getSaturdayWeighIns();
              const map = new Map<string, SaturdayWeighIn>();
              currentList.forEach((w) => map.set(w.id, w));

              snapshot.docChanges().forEach((change) => {
                const id = change.doc.id;
                if (change.type === 'added' || change.type === 'modified') {
                  map.set(id, { ...(change.doc.data() as SaturdayWeighIn), id });
                } else if (change.type === 'removed') {
                  map.delete(id);
                }
              });

              const updatedList = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
              localStorage.setItem('fitquest_saturday_weigh_ins', JSON.stringify(updatedList));
              window.dispatchEvent(new CustomEvent('fitquest_weighins_updated'));
            }
          }, (err) => {
            console.warn('Weigh-ins onSnapshot safe warning:', err);
          });
        } catch (e) {
          console.warn('Could not attach weigh-ins real-time listener', e);
        }
      } else {
        setIsAuthenticated(false);
        const localUser = FitStorage.getUser();
        const localHistory = FitStorage.getHistory();
        const shieldResult = checkAndApplyStreakShield(localUser, localHistory);
        const userToEvaluate = shieldResult.updatedUser;
        const evaluated = evaluateWeeklyLeagueReset(userToEvaluate, localHistory);
        const realStreak = calculateRealStreak(localHistory, userToEvaluate.shieldUsedDates);
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
      if (unsubNutrition) unsubNutrition();
      if (unsubWeighIns) unsubWeighIns();
    };
  }, []);

  // Listen for local and cloud history & nutrition updates to keep UI & attributes synchronized in real-time
  useEffect(() => {
    const handleHistoryUpdate = () => {
      const h = FitStorage.getHistory();
      setHistory(h);
      const streak = calculateRealStreak(h, user.shieldUsedDates);
      setUser((prev) => ({
        ...prev,
        attributes: calculateAthleteAttributes(h, streak.currentStreak, prev.level),
      }));
    };
    const handleNutritionUpdate = () => {
      const h = FitStorage.getHistory();
      const streak = calculateRealStreak(h, user.shieldUsedDates);
      setUser((prev) => ({
        ...prev,
        attributes: calculateAthleteAttributes(h, streak.currentStreak, prev.level),
      }));
    };
    window.addEventListener('fitquest_history_updated', handleHistoryUpdate);
    window.addEventListener('fitquest_nutrition_updated', handleNutritionUpdate);
    return () => {
      window.removeEventListener('fitquest_history_updated', handleHistoryUpdate);
      window.removeEventListener('fitquest_nutrition_updated', handleNutritionUpdate);
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
    const isNewAthlete = !cloudData.user.onboardingCompleted && (cloudData.user.level === 1 && (cloudData.user.xp || 0) === 0);
    if (isNewAthlete) {
      localStorage.removeItem('fitquest_nutrition_logs');
      localStorage.removeItem('fitquest_saturday_weigh_ins');
      setOnboardingModalOpen(true);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    FitStorage.clearUserSession();
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

  // Handle Workout Complete from ActiveWorkoutTracker or SportActivityModal
  const handleCompleteWorkout = (entry: WorkoutHistoryEntry, xpGained: number) => {
    // If completed workout belonged to a multi-day program, unlock the next day!
    let totalXpToAward = xpGained;
    const currentProgMap = FitStorage.getProgramProgress();
    const updatedProgramProgress = { ...currentProgMap, ...(user.programProgress || {}) };
    const isProgramWorkout = Boolean(activeRoutine?.programId && activeRoutine?.programDayNumber);

    if (activeRoutine?.programId && activeRoutine?.programDayNumber) {
      const progId = activeRoutine.programId;
      const dayNum = activeRoutine.programDayNumber;
      const prevCompletedDay = updatedProgramProgress[progId] || 0;
      updatedProgramProgress[progId] = Math.max(prevCompletedDay, dayNum);
      localStorage.setItem('fitquest_program_progress', JSON.stringify(updatedProgramProgress));

      // Only award the cycle completion bonus when completing the final day for the first time in this cycle
      const targetProgram = FitStorage.getPrograms().find((p) => p.id === progId);
      if (targetProgram && prevCompletedDay < targetProgram.days.length && dayNum >= targetProgram.days.length) {
        totalXpToAward += (targetProgram.xpReward || 300);
        sound.playLevelUp();
      }
    }

    // Apply passive RPG Attribute XP bonus (Fuerza, Resistencia, Agilidad, Disciplina)
    const currentHistoryBeforeAdd = FitStorage.getHistory().filter((h) => h.id !== entry.id);
    const previewStreak = calculateRealStreak([entry, ...currentHistoryBeforeAdd], user.shieldUsedDates);
    const currentAttrs = calculateAthleteAttributes(
      currentHistoryBeforeAdd,
      previewStreak.currentStreak,
      user.level
    );
    const attrBonus = calculateAttributeXpBonus(
      entry,
      currentAttrs,
      previewStreak.currentStreak,
      xpGained
    );
    totalXpToAward += attrBonus.bonusXp;

    const finalEntry: WorkoutHistoryEntry = {
      ...entry,
      xpEarned: totalXpToAward,
    };

    // Clear active session in local memory & localStorage first without triggering a premature cloud snapshot
    localStorage.removeItem('fitquest_active_session');
    setActiveSession(null);
    setActiveRoutine(null);

    // 1. Prepend new history entry synchronously to localStorage
    const existingHistory = FitStorage.getHistory().filter((h) => h.id !== finalEntry.id);
    const updatedHistory = [finalEntry, ...existingHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    FitStorage.saveHistory(updatedHistory);
    setHistory(updatedHistory);

    // 1b. Automatically switch today's Nutrition Log to Workout Day (2,300 kcal)
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayNutrition = FitStorage.getNutritionLog(todayStr);
      if (todayNutrition.dayType !== 'workout') {
        FitStorage.saveNutritionLog({
          ...todayNutrition,
          dayType: 'workout',
          targetCalories: 2300,
          targetProtein: 180,
          targetCarbs: 220,
          targetFat: 70,
        });
      } else {
        window.dispatchEvent(new CustomEvent('fitquest_nutrition_updated'));
      }
    } catch {}

    // 1c. Monthly Boss Raid Attack: community damage from session volume & distance
    try {
      const sessionDamage = (finalEntry.totalVolumeKg || 0) + Math.round((finalEntry.totalDistanceKm || 0) * 100);
      if (sessionDamage > 0) {
        attackBossRaid(sessionDamage, user);
      }
    } catch (e) {
      console.warn('Boss raid attack warning:', e);
    }

    // 2. Add XP to User Profile & calculate exact cumulative stats + RPG attributes from updatedHistory
    const updatedUser = FitStorage.addXp(totalXpToAward, user, true);
    const realStreak = calculateRealStreak(updatedHistory, updatedUser.shieldUsedDates);
    const dynamicAttributes = calculateAthleteAttributes(
      updatedHistory,
      realStreak.currentStreak,
      updatedUser.level,
      updatedUser.attributes
    );
    const calculatedVolume = updatedHistory.reduce((sum, h) => sum + (h.totalVolumeKg || 0), 0);
    const calculatedMinutes = updatedHistory.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
    const calculatedCalories = updatedHistory.reduce((sum, h) => sum + (h.calories || 0), 0);
    const calculatedDistance = updatedHistory.reduce((sum, h) => sum + (h.totalDistanceKm || 0), 0);

    const finalUser: UserProfile = {
      ...updatedUser,
      programProgress: updatedProgramProgress,
      activeSession: null,
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

    // 3. Check and unlock achievements before cloud sync so achievementsState is up-to-date
    const allAchievements = FitStorage.getAchievements();
    const updatedAchievements = evaluateAllAchievements(
      finalUser,
      updatedHistory,
      allAchievements,
      routines.filter((r) => r.isCustom).length,
      challenges.filter((c) => c.joined && c.currentProgress >= c.goalTarget).length
    );
    localStorage.setItem('fitquest_achievements', JSON.stringify(updatedAchievements));
    setAchievements(updatedAchievements);

    // 4. Update challenges progress
    const updatedChallenges = challenges.map((ch) => {
      if (!ch.joined) return ch;
      if (ch.category === 'volume') {
        const newP = Math.min(ch.goalTarget, ch.currentProgress + finalEntry.totalVolumeKg);
        return { ...ch, currentProgress: newP };
      }
      if (ch.category === 'workouts') {
        const newP = Math.min(ch.goalTarget, ch.currentProgress + 1);
        return { ...ch, currentProgress: newP };
      }
      if (ch.category === 'calories') {
        const newP = Math.min(ch.goalTarget, ch.currentProgress + finalEntry.calories);
        return { ...ch, currentProgress: newP };
      }
      return ch;
    });
    FitStorage.saveChallenges(updatedChallenges);
    setChallenges(updatedChallenges);

    // 5. Persist finalUser + updatedHistory + updatedAchievements to localStorage & Firestore in one clean pass
    FitStorage.saveUser(finalUser);
    FitStorage.addHistoryEntry(finalEntry, finalUser);
    setUser(finalUser);

    // 6. Close active routine modal & show appropriate view
    if (isProgramWorkout) {
      setActiveTab('routines');
    } else if (!entry.isSportActivity) {
      setActiveTab('analytics');
    }
  };

  // Handle Custom Routine Created or Edited
  const handleCreateRoutine = (routine: WorkoutRoutine) => {
    const isEditingExisting = routines.some((r) => r.id === routine.id);
    FitStorage.saveRoutine(routine);
    setRoutines(FitStorage.getRoutines());
    if (!isEditingExisting) {
      const updatedUser = FitStorage.addXp(120, user);
      setUser(updatedUser);
    } else {
      FitStorage.syncUserToCloud(user);
    }
  };

  // Handle Custom Routine Deleted
  const handleDeleteRoutine = (routineId: string) => {
    const updated = FitStorage.deleteCustomRoutine(routineId);
    setRoutines(updated);
    FitStorage.syncUserToCloud(user);
  };

  // Helper to recalculate user stats when history is edited or deleted
  const recalculateUserStatsFromHistory = (updatedHistory: WorkoutHistoryEntry[]) => {
    const realStreak = calculateRealStreak(updatedHistory, user.shieldUsedDates);
    const historyXp = updatedHistory.reduce((sum, h) => sum + (Number(h.xpEarned) || 0), 0);
    const claimedAchXp = FitStorage.getAchievements()
      .filter((a) => Boolean((a as any).rewardClaimed))
      .reduce((sum, a) => sum + (Number(a.xpReward) || 0), 0);
    const prog = calculateLevelFromTotalXp(Math.max(0, historyXp + claimedAchXp));

    const dynamicAttributes = calculateAthleteAttributes(
      updatedHistory,
      realStreak.currentStreak,
      prog.level,
      user.attributes
    );
    const calculatedVolume = updatedHistory.reduce((sum, h) => sum + (h.totalVolumeKg || 0), 0);
    const calculatedMinutes = updatedHistory.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
    const calculatedCalories = updatedHistory.reduce((sum, h) => sum + (h.calories || 0), 0);
    const calculatedDistance = updatedHistory.reduce((sum, h) => sum + (h.totalDistanceKm || 0), 0);

    const updatedUser: UserProfile = {
      ...user,
      level: prog.level,
      xp: prog.xp,
      currentLevelXp: prog.currentLevelXp,
      nextLevelXp: prog.nextLevelXp,
      attributes: dynamicAttributes,
      stats: {
        ...user.stats,
        totalWorkouts: updatedHistory.length,
        totalVolumeKg: calculatedVolume,
        totalDistanceKm: calculatedDistance,
        totalMinutes: calculatedMinutes,
        caloriesBurned: calculatedCalories,
        currentStreak: realStreak.currentStreak,
        bestStreak: Math.max(user.stats.bestStreak || 0, realStreak.bestStreak),
      },
    };
    FitStorage.saveUser(updatedUser);
    setUser(updatedUser);
  };

  const handleDeleteHistoryEntry = async (entryId: string) => {
    const updatedHistory = await FitStorage.deleteHistoryEntry(entryId, user);
    setHistory(updatedHistory);
    recalculateUserStatsFromHistory(updatedHistory);
  };

  const handleUpdateHistoryEntry = async (updatedEntry: WorkoutHistoryEntry) => {
    const updatedHistory = await FitStorage.updateHistoryEntry(updatedEntry, user);
    setHistory(updatedHistory);
    recalculateUserStatsFromHistory(updatedHistory);
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

    const totalClaimedCount = Math.max(
      (updatedUser.claimedChallenges || []).length,
      updatedUser.stats?.challengesCompleted || 0
    );
    const updatedAchievements = evaluateAllAchievements(
      updatedUser,
      history,
      FitStorage.getAchievements(),
      routines.filter((r) => r.isCustom).length,
      totalClaimedCount
    );
    FitStorage.saveAchievements(updatedAchievements);
    setAchievements(updatedAchievements);
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
        onOpenLevelRoadmap={() => setLevelRoadmapModalOpen(true)}
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

      {/* Main Content Container with safe area padding top and bottom dock padding */}
      <main 
        style={{ 
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' 
        }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
      >
        
        {/* Render Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            routines={routines}
            challenges={challenges}
            achievements={achievements}
            smartwatch={smartwatch}
            history={history}
            lang={lang}
            onStartRoutine={handleStartRoutine}
            onNavigateTab={setActiveTab}
            onOpenQuickStart={() => setQuickStartModalOpen(true)}
            onOpenSportModal={() => setSportModalOpen(true)}
            onOpenProfileModal={() => setProfileModalOpen(true)}
            onOpenLevelRoadmap={() => setLevelRoadmapModalOpen(true)}
          />
        )}

        {activeTab === 'routines' && (
          <WorkoutCatalogView
            routines={routines}
            user={user}
            lang={lang}
            onStartRoutine={handleStartRoutine}
            onCreateRoutine={handleCreateRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            onOpenSportModal={() => setSportModalOpen(true)}
            onUpdateProgramProgress={(progMap) => {
              const updatedUser = { ...user, programProgress: progMap };
              setUser(updatedUser);
              FitStorage.saveUser(updatedUser);
            }}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            user={user}
            history={history}
            lang={lang}
            onUpdateUser={(updated) => setUser(updated)}
            onGrantXp={(amount, _reason) => {
              const updatedUser = FitStorage.addXp(amount, user);
              setUser(updatedUser);
            }}
          />
        )}

        {(activeTab === 'community' || activeTab === 'challenges' || activeTab === 'leaderboard' || activeTab === 'achievements' || activeTab === 'duels' || activeTab === 'raid') && (
          <CommunityView
            challenges={challenges}
            leaderboard={leaderboard}
            achievements={achievements}
            user={user}
            history={history}
            lang={lang}
            initialSubTab={
              activeTab === 'leaderboard'
                ? 'leaderboard'
                : activeTab === 'achievements'
                ? 'achievements'
                : activeTab === 'duels'
                ? 'duels'
                : activeTab === 'raid'
                ? 'raid'
                : 'challenges'
            }
            onJoinChallenge={handleJoinChallenge}
            onContribute={handleContributeChallenge}
            onClaimReward={handleClaimChallengeReward}
            onClaimAchievementXp={handleClaimAchievementXp}
            onWinDuel={handleDuelWin}
            onNavigateRoutines={() => setActiveTab('routines')}
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
            onUpdateUser={(partial) => {
              const updatedUser: UserProfile = {
                ...user,
                ...partial,
              };
              setUser(updatedUser);
              FitStorage.saveUser(updatedUser);
              FitStorage.syncUserToCloud(updatedUser);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            history={history}
            user={user}
            lang={lang}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onUpdateUser={(updated) => setUser(updated)}
            onDeleteHistoryEntry={handleDeleteHistoryEntry}
            onUpdateHistoryEntry={handleUpdateHistoryEntry}
          />
        )}

        {activeTab === 'smartwatch' && (
          <SmartwatchView
            smartwatch={smartwatch}
            onUpdateSmartwatch={handleUpdateSmartwatch}
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
              setActiveSession(null);
              setActiveRoutine(null);
              setAchievements(createFreshAchievements());
              setChallenges(defaultChallenges.map((c) => ({ ...c, currentProgress: 0, completed: false })));
              sound.playLevelUp();
            }}
            onDeleteAccount={async (password?: string) => {
              const res = await FitStorage.deleteUserAccountAndData(password);
              if (res.success) {
                setIsAuthenticated(false);
                setIsGuestMode(false);
                const guestUser = createFreshUser('guest_' + Date.now(), 'Atleta', '');
                setUser(guestUser);
                setHistory([]);
                setActiveSession(null);
                setActiveRoutine(null);
                setAchievements(createFreshAchievements());
                setChallenges(defaultChallenges);
                return { success: true };
              }
              return res;
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

      {/* New Athlete Onboarding Wizard Modal */}
      {onboardingModalOpen && (
        <OnboardingModal
          user={user}
          lang={lang}
          onComplete={async (updatedUser) => {
            // Close modal immediately and set active tab to dashboard
            setOnboardingModalOpen(false);
            setActiveTab('dashboard');
            setUser(updatedUser);
            FitStorage.saveUser(updatedUser);

            // Initialize baseline weigh-in with exact user weight from onboarding
            const todayStr = new Date().toISOString().split('T')[0];
            const initialWeighIn: SaturdayWeighIn = {
              id: `baseline_${Date.now()}`,
              date: todayStr,
              weightKg: updatedUser.weightKg,
              muscleMassKg: Number((updatedUser.weightKg * 0.65).toFixed(1)),
              notes: `Inicio de seguimiento para ${updatedUser.name}. Meta: ${updatedUser.targetWeightKg} kg.`,
            };
            FitStorage.saveSaturdayWeighIn(initialWeighIn);

            try {
              await FitStorage.syncUserToCloud(updatedUser);
            } catch (err) {
              console.warn('Onboarding cloud sync non-blocking warning:', err);
            }
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
        onOpenSportModal={() => setSportModalOpen(true)}
      />

      {/* Sport & Smartwatch Activity Logger Modal */}
      <SportActivityModal
        isOpen={sportModalOpen}
        onClose={() => setSportModalOpen(false)}
        userWeightKg={user.weightKg}
        onCompleteSportActivity={handleCompleteWorkout}
      />

      {/* Interactive Level Progression Roadmap Modal */}
      {levelRoadmapModalOpen && (
        <LevelRoadmapModal
          user={user}
          lang={lang}
          onClose={() => setLevelRoadmapModalOpen(false)}
          onEquipTitle={handleEquipTitle}
        />
      )}

      {/* Epic Level Up Celebration Modal */}
      {levelUpModalOpen && (
        <LevelUpCelebrationModal
          user={user}
          newLevel={celebrationLevel}
          onClose={() => setLevelUpModalOpen(false)}
          onEquipTitle={handleEquipTitle}
        />
      )}

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

      {/* Single Active Session Revocation Dialog (Exclusión Mutua Móvil / Tablet) */}
      {isSessionRevoked && (
        <div className="fixed inset-0 z-[99999] bg-[#09090b]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="max-w-md w-full bg-neutral-900/90 border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.25)] space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-lg animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-black text-xl text-white tracking-tight">
                Sesión Cerrada en este Dispositivo
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Se ha iniciado sesión desde otro dispositivo (<strong className="text-white">{revokingDeviceName}</strong>).
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Para asegurar la integridad total de tus series y pesos y evitar conflictos de sincronización, la cuenta solo puede estar activa en un único dispositivo a la vez.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-left text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Exclusión Mutua Activa</span>
              </div>
              <p>Tus datos, entrenamientos e historial están seguros y respaldados en la nube.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={async () => {
                  if (auth.currentUser) {
                    const currentDeviceId = getDeviceSessionId();
                    const currentDeviceName = getDeviceName();
                    const ref = doc(db, 'users', auth.currentUser.uid);
                    await updateDoc(ref, {
                      activeSessionDeviceId: currentDeviceId,
                      activeSessionDeviceName: currentDeviceName,
                      activeSessionClaimedAt: new Date().toISOString()
                    });
                    setIsSessionRevoked(false);
                  }
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                Tomar el Control en este Dispositivo
              </button>
              <button
                onClick={async () => {
                  setIsSessionRevoked(false);
                  await fbSignOut(auth);
                  localStorage.removeItem('fitquest_device_session_id');
                }}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
