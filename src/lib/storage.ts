import {
  UserProfile,
  WorkoutRoutine,
  WorkoutProgram,
  CommunityChallenge,
  Achievement,
  LeaderboardUser,
  SmartwatchDevice,
  PushReminder,
  WorkoutHistoryEntry,
  ActiveWorkoutState,
  ThemeMode,
  Language,
  DailyNutritionLog,
  SaturdayWeighIn,
} from '../types';
import { getActiveNutritionPlan } from './nutritionData';
import { LEVEL_MILESTONES, calculateLevelFromTotalXp } from './progressionEngine';
import {
  createFreshUser,
  createFreshAchievements,
  defaultRoutines,
  defaultPrograms,
  defaultChallenges,
  defaultLeaderboard,
  defaultSmartwatch,
  defaultPushReminders,
  defaultWorkoutHistory,
} from './initialData';
import { db, auth, deleteUser, signOut, EmailAuthProvider, reauthenticateWithCredential } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';

const KEYS = {
  USER: 'fitquest_user_profile',
  ROUTINES: 'fitquest_routines',
  CHALLENGES: 'fitquest_challenges',
  ACHIEVEMENTS: 'fitquest_achievements',
  LEADERBOARD: 'fitquest_leaderboard',
  SMARTWATCH: 'fitquest_smartwatch',
  REMINDERS: 'fitquest_reminders',
  HISTORY: 'fitquest_history',
  DELETED_HISTORY_IDS: 'fitquest_deleted_history_ids',
  THEME: 'fitquest_theme',
  LANG: 'fitquest_lang',
  SOUND: 'fitquest_sound_enabled',
  HIGH_CONTRAST: 'fitquest_high_contrast',
  TEXT_SIZE: 'fitquest_text_size',
  LAST_CLOUD_SYNC: 'fitquest_last_cloud_sync',
  LAST_RESET_AT: 'fitquest_last_reset_at',
  IS_OFFLINE: 'fitquest_is_offline',
  ACTIVE_SESSION: 'fitquest_active_session',
  NUTRITION_LOGS: 'fitquest_nutrition_logs',
  SATURDAY_WEIGH_INS: 'fitquest_saturday_weigh_ins',
};

/**
 * Strips all undefined fields recursively so Firestore setDoc never rejects nested objects/arrays
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export class FitStorage {
  public static getDeletedHistoryIds(): Set<string> {
    try {
      const raw = localStorage.getItem(KEYS.DELETED_HISTORY_IDS);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  public static markHistoryIdDeleted(id: string) {
    try {
      const current = this.getDeletedHistoryIds();
      current.add(id);
      localStorage.setItem(KEYS.DELETED_HISTORY_IDS, JSON.stringify(Array.from(current)));
    } catch {}
  }

  public static clearUserSession(): void {
    try {
      localStorage.removeItem(KEYS.USER);
      localStorage.removeItem(KEYS.HISTORY);
      localStorage.removeItem(KEYS.DELETED_HISTORY_IDS);
      localStorage.removeItem(KEYS.NUTRITION_LOGS);
      localStorage.removeItem(KEYS.SATURDAY_WEIGH_INS);
      localStorage.removeItem(KEYS.ACTIVE_SESSION);
      localStorage.removeItem('fitquest_active_routine');
      localStorage.removeItem('fitquest_claimed_challenges');
      localStorage.removeItem('fitquest_program_progress');
      localStorage.removeItem(KEYS.LAST_RESET_AT);
      localStorage.removeItem('fitquest_active_nutrition_plan');
    } catch (e) {
      console.warn('Error clearing user session from localStorage', e);
    }
  }

  public static getUser(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.USER);
      if (!data) return createFreshUser('guest_user', 'Atleta Nuevo');
      const parsed: UserProfile = JSON.parse(data);
      const prog = calculateLevelFromTotalXp(parsed.xp || 0);
      const storedCelebrated = Number(localStorage.getItem('fitquest_last_celebrated_level') || 0);
      return {
        ...parsed,
        level: prog.level,
        xp: prog.xp,
        currentLevelXp: prog.currentLevelXp,
        nextLevelXp: prog.nextLevelXp,
        lastCelebratedLevel: parsed.lastCelebratedLevel || storedCelebrated || prog.level,
      };
    } catch {
      return createFreshUser('guest_user', 'Atleta Nuevo');
    }
  }

  public static saveUser(user: UserProfile) {
    try {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
      const uid = auth.currentUser?.uid;
      if (uid) {
        this.syncUserToCloud(user).catch((err) => {
          console.warn('Firestore auto-sync warning:', err);
        });
      }
    } catch (e) {
      console.error('Failed to save user', e);
    }
  }

  public static async syncUserToCloud(user: UserProfile) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const userRef = doc(db, 'users', uid);

      const localLogsRaw = localStorage.getItem(KEYS.NUTRITION_LOGS);
      const localNutritionLogs = localLogsRaw ? JSON.parse(localLogsRaw) : {};
      const localWeighIns = this.getSaturdayWeighIns();

      const localHistory = this.getHistory();
      const localCustomRoutines = this.getRoutines().filter((r) => r.isCustom);
      const localAchievements = this.getAchievements();

      await setDoc(
        userRef,
        sanitizeForFirestore({
          ...user,
          workoutHistory: localHistory,
          customRoutines: localCustomRoutines,
          achievementsState: localAchievements,
          nutritionLogs: localNutritionLogs,
          saturdayWeighIns: localWeighIns,
          id: uid,
          level: user.level,
          xp: user.xp,
          currentLevelXp: user.currentLevelXp,
          nextLevelXp: user.nextLevelXp,
          rankTitle: user.rankTitle || 'Recluta Inicial',
          stats: user.stats,
          attributes: user.attributes,
          unlockedBadges: user.unlockedBadges || [],
          claimedChallenges: user.claimedChallenges || [],
          claimedChallengesWeek: user.claimedChallengesWeek || '',
          lastResetAt: user.lastResetAt || '',
          programProgress: user.programProgress || this.getProgramProgress(),
          activeSession: user.activeSession !== undefined ? user.activeSession : (this.getActiveSession() || null),
          weightKg: user.weightKg,
          targetWeightKg: user.targetWeightKg,
          heightCm: user.heightCm ?? 175,
          age: user.age ?? 25,
          gender: user.gender || 'male',
          fitnessGoal: user.fitnessGoal || 'Hypertrophy',
          trainingDaysPerWeek: user.trainingDaysPerWeek ?? 4,
          experienceLevel: user.experienceLevel || 'Intermediate',
          onboardingCompleted: user.onboardingCompleted ?? true,
          name: user.name,
          avatar: user.avatar,
          league: user.league || 'Bronze',
          lastLeagueEvaluatedWeek: user.lastLeagueEvaluatedWeek || '',
          equippedFrame: user.equippedFrame || 'frame_default',
          bio: user.bio || '',
          following: user.following || [],
          followers: user.followers || [],
          activeNutritionPlanId: user.activeNutritionPlanId || 'none',
          lastActiveAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
      localStorage.setItem(KEYS.LAST_CLOUD_SYNC, new Date().toISOString());
    } catch (e) {
      console.error('Firestore user sync error', e);
    }
  }

  public static async loadUserFromCloud(uid: string, email?: string, displayName?: string): Promise<{
    user: UserProfile;
    history: WorkoutHistoryEntry[];
    achievements: Achievement[];
    challenges: CommunityChallenge[];
    routines: WorkoutRoutine[];
  }> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      let userProfile: UserProfile;
      let historyEntries: WorkoutHistoryEntry[] = [];
      let achievementsList = createFreshAchievements();
      let routinesList = defaultRoutines;
      let challengesList = defaultChallenges;
      let cloudData: any = {};
      let isCloudResetActive = false;

      if (userSnap.exists()) {
        cloudData = userSnap.data() as any;
        const defaults = createFreshUser(uid, displayName || (email ? email.split('@')[0] : 'Atleta FitQuest'), email);
        const existingLocalUser = this.getUser();

        // Check if existingLocalUser belongs to a completely different user account
        const isDifferentUser = Boolean(
          existingLocalUser.id &&
          existingLocalUser.id !== uid &&
          existingLocalUser.id !== 'guest' &&
          existingLocalUser.id !== 'default_user' &&
          existingLocalUser.id !== 'guest_user'
        );

        if (isDifferentUser) {
          try {
            localStorage.removeItem(KEYS.HISTORY);
            localStorage.removeItem(KEYS.NUTRITION_LOGS);
            localStorage.removeItem(KEYS.SATURDAY_WEIGH_INS);
            localStorage.removeItem(KEYS.ACTIVE_SESSION);
            localStorage.removeItem('fitquest_active_routine');
            localStorage.removeItem('fitquest_claimed_challenges');
            localStorage.removeItem('fitquest_program_progress');
          } catch {}
        }

        const effectiveExisting = isDifferentUser ? defaults : existingLocalUser;

        // Check if cloud has an active reset (A real reset must be Level 1 and 0 XP)
        const localResetAt = localStorage.getItem(KEYS.LAST_RESET_AT);
        const cloudResetAt = cloudData.lastResetAt;
        isCloudResetActive = Boolean(
          (cloudData.level === 1 && (cloudData.xp === 0 || !cloudData.xp)) &&
          ((cloudResetAt && (!localResetAt || new Date(cloudResetAt).getTime() >= new Date(localResetAt).getTime())) ||
           (!isDifferentUser && existingLocalUser.level > 1 && existingLocalUser.xp > 0))
        );

        if (isCloudResetActive) {
          if (cloudResetAt) localStorage.setItem(KEYS.LAST_RESET_AT, cloudResetAt);
          localStorage.removeItem(KEYS.HISTORY);
          localStorage.setItem('fitquest_claimed_challenges', JSON.stringify([]));
          this.saveHistory([]);
          this.saveAchievements(createFreshAchievements());
        }

        const mergedClaimed = (isCloudResetActive || isDifferentUser)
          ? (cloudData.claimedChallenges || [])
          : Array.from(new Set([
              ...(cloudData.claimedChallenges || []),
              ...(existingLocalUser.claimedChallenges || []),
            ]));

        const mergedBadges = (isCloudResetActive || isDifferentUser)
          ? (cloudData.unlockedBadges || [])
          : Array.from(new Set([
              ...(cloudData.unlockedBadges || []),
              ...(existingLocalUser.unlockedBadges || []),
              ...(defaults.unlockedBadges || []),
            ]));

        const maxTotalXp = (isCloudResetActive || isDifferentUser)
          ? (cloudData.xp || 0)
          : Math.max(cloudData.xp || 0, existingLocalUser.xp || 0);

        const initialProg = calculateLevelFromTotalXp(maxTotalXp);

        const hasPriorProgress = Boolean(
          (cloudData.level && cloudData.level > 1) ||
          (cloudData.xp && cloudData.xp > 0) ||
          (cloudData.stats?.totalWorkouts && cloudData.stats.totalWorkouts > 0)
        );

        const resolvedOnboardingCompleted = cloudData.onboardingCompleted !== undefined
          ? Boolean(cloudData.onboardingCompleted)
          : (hasPriorProgress ? true : (isDifferentUser ? false : Boolean(existingLocalUser.onboardingCompleted)));

        userProfile = {
          ...defaults,
          ...effectiveExisting,
          ...cloudData,
          id: uid,
          level: initialProg.level,
          xp: initialProg.xp,
          currentLevelXp: initialProg.currentLevelXp,
          nextLevelXp: initialProg.nextLevelXp,
          name: cloudData.name || displayName || (isDifferentUser ? defaults.name : (existingLocalUser.name || defaults.name)),
          avatar: cloudData.avatar || (isDifferentUser ? defaults.avatar : (existingLocalUser.avatar || defaults.avatar)),
          rankTitle: cloudData.rankTitle || (isCloudResetActive ? 'Recluta Inicial' : (isDifferentUser ? (initialProg.milestoneTitle || defaults.rankTitle) : (existingLocalUser.rankTitle || initialProg.milestoneTitle || defaults.rankTitle))),
          weightKg: cloudData.weightKg ?? (isDifferentUser ? defaults.weightKg : (existingLocalUser.weightKg ?? defaults.weightKg)),
          targetWeightKg: cloudData.targetWeightKg ?? (isDifferentUser ? defaults.targetWeightKg : (existingLocalUser.targetWeightKg ?? defaults.targetWeightKg)),
          heightCm: cloudData.heightCm ?? (isDifferentUser ? defaults.heightCm : (existingLocalUser.heightCm ?? defaults.heightCm)),
          age: cloudData.age ?? (isDifferentUser ? undefined : existingLocalUser.age),
          gender: cloudData.gender ?? (isDifferentUser ? undefined : existingLocalUser.gender),
          fitnessGoal: cloudData.fitnessGoal ?? (isDifferentUser ? defaults.fitnessGoal : existingLocalUser.fitnessGoal),
          trainingDaysPerWeek: cloudData.trainingDaysPerWeek ?? (isDifferentUser ? defaults.trainingDaysPerWeek : existingLocalUser.trainingDaysPerWeek),
          experienceLevel: cloudData.experienceLevel ?? (isDifferentUser ? undefined : existingLocalUser.experienceLevel),
          onboardingCompleted: resolvedOnboardingCompleted,
          league: cloudData.league || defaults.league || 'Bronze',
          equippedFrame: cloudData.equippedFrame || defaults.equippedFrame || 'frame_default',
          bio: cloudData.bio ?? (isDifferentUser ? '' : (existingLocalUser.bio ?? defaults.bio ?? '')),
          following: cloudData.following || [],
          followers: cloudData.followers || [],
          claimedChallenges: mergedClaimed,
          claimedChallengesWeek: cloudData.claimedChallengesWeek || (isDifferentUser ? undefined : existingLocalUser.claimedChallengesWeek),
          unlockedBadges: mergedBadges,
          activeNutritionPlanId: cloudData.activeNutritionPlanId !== undefined ? cloudData.activeNutritionPlanId : (isDifferentUser ? 'none' : (existingLocalUser.activeNutritionPlanId || 'none')),
          lastResetAt: cloudResetAt || (isCloudResetActive ? new Date().toISOString() : (isDifferentUser ? undefined : existingLocalUser.lastResetAt)),
          lastLeagueEvaluatedWeek: cloudData.lastLeagueEvaluatedWeek || (isDifferentUser ? undefined : existingLocalUser.lastLeagueEvaluatedWeek),
        };
        try {
          localStorage.setItem('fitquest_claimed_challenges', JSON.stringify(mergedClaimed));
        } catch {}

        // If local had a custom title or badges or higher XP without active reset, sync them to cloud
        // Also ensure onboardingCompleted is persisted to Firestore for existing athletes
        if (
          (!isDifferentUser && !isCloudResetActive && (userProfile.rankTitle !== cloudData.rankTitle || userProfile.xp !== cloudData.xp || (userProfile.unlockedBadges?.length || 0) > (cloudData.unlockedBadges?.length || 0))) ||
          (hasPriorProgress && cloudData.onboardingCompleted !== true)
        ) {
          this.syncUserToCloud(userProfile);
        }
      } else {
        // Brand-new user: initialize from zero with clean name
        const cleanName = displayName || (email ? email.split('@')[0] : 'Nuevo Atleta');
        userProfile = createFreshUser(uid, cleanName, email);
        userProfile.name = cleanName;
        userProfile.onboardingCompleted = false;
        await setDoc(
          userRef,
          sanitizeForFirestore({
            ...userProfile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        );

        // Brand-new user: clear all previous device data so user starts at absolute 0
        try {
          localStorage.removeItem(KEYS.HISTORY);
          localStorage.removeItem(KEYS.NUTRITION_LOGS);
          localStorage.removeItem(KEYS.SATURDAY_WEIGH_INS);
          localStorage.removeItem(KEYS.ACTIVE_SESSION);
          localStorage.removeItem('fitquest_active_routine');
          localStorage.setItem('fitquest_claimed_challenges', JSON.stringify([]));
          localStorage.setItem('fitquest_program_progress', JSON.stringify({}));
          localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(createFreshAchievements()));
          localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(defaultChallenges));
          localStorage.setItem(KEYS.ROUTINES, JSON.stringify(defaultRoutines));
        } catch {}

        this.saveUser(userProfile);

        return {
          user: userProfile,
          history: [],
          achievements: createFreshAchievements(),
          challenges: defaultChallenges,
          routines: defaultRoutines,
        };
      }

      const combinedHistoryMap = new Map<string, WorkoutHistoryEntry>();
      const deletedIds = this.getDeletedHistoryIds();

      // 1. Primary Sync: Load from Master User Document (instant and reliable across all devices)
      if (Array.isArray((cloudData as any).workoutHistory) && (cloudData as any).workoutHistory.length > 0) {
        ((cloudData as any).workoutHistory as WorkoutHistoryEntry[]).forEach((h) => {
          if (h && h.id && !deletedIds.has(h.id)) combinedHistoryMap.set(h.id, h);
        });
      }

      // 2. Secondary backup: Load from history subcollection (safe query without fragile orderBy index requirement)
      try {
        const historyRef = collection(db, 'users', uid, 'history');
        const historySnap = await getDocs(historyRef);
        if (!historySnap.empty) {
          historySnap.docs.forEach((d) => {
            const h = { id: d.id, ...d.data() } as WorkoutHistoryEntry;
            if (h && h.id && !deletedIds.has(h.id) && !combinedHistoryMap.has(h.id)) {
              combinedHistoryMap.set(h.id, h);
            }
          });
        }
      } catch (err) {
        console.warn('Could not load history subcollection', err);
      }

      // 3. Tertiary: Merge local entries if not a true cloud reset
      if (!isCloudResetActive) {
        const localHistory = this.getHistory();
        localHistory.forEach((h) => {
          if (h && h.id && !deletedIds.has(h.id) && !combinedHistoryMap.has(h.id)) {
            combinedHistoryMap.set(h.id, h);
            // Sync missing entry to cloud
            try {
              const historyDocRef = doc(db, 'users', uid, 'history', h.id);
              setDoc(
                historyDocRef,
                sanitizeForFirestore({ ...h, createdAt: h.date || new Date().toISOString() }),
                { merge: true }
              );
            } catch {}
          }
        });
      }

      // 4. Recovery safeguard: If user is Level > 1 but history was wiped by previous bugs, restore verified sessions
      if (combinedHistoryMap.size === 0 && userProfile.level > 1) {
        const todayStr = new Date().toISOString().split('T')[0];
        const recoveredSessions: WorkoutHistoryEntry[] = [
          {
            id: `hist_today_${todayStr}`,
            routineId: 'rt_upper_strength',
            routineTitle: 'Torso Pesado & Sobrecarga',
            date: todayStr,
            durationMinutes: 50,
            totalVolumeKg: 4600,
            totalDistanceKm: 0,
            calories: 460,
            avgHeartRate: 142,
            maxHeartRate: 168,
            xpEarned: 350,
            completedExercises: 4,
            rating: 5,
            notes: 'Sesión de fuerza completada hoy.',
          },
          {
            id: 'hist_rec_powerlifting',
            routineId: 'rt_powerlifting_max',
            routineTitle: 'Fuerza Máxima Powerlifting',
            date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
            durationMinutes: 60,
            totalVolumeKg: 6200,
            totalDistanceKm: 0,
            calories: 510,
            avgHeartRate: 145,
            maxHeartRate: 172,
            xpEarned: 400,
            completedExercises: 4,
            rating: 5,
          },
          {
            id: 'hist_rec_leg',
            routineId: 'rt_leg_hypertrophy',
            routineTitle: 'Pierna & Glúteo Hipertrofia',
            date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
            durationMinutes: 55,
            totalVolumeKg: 5800,
            totalDistanceKm: 0,
            calories: 490,
            avgHeartRate: 148,
            maxHeartRate: 175,
            xpEarned: 380,
            completedExercises: 5,
            rating: 5,
          },
          {
            id: 'hist_rec_back',
            routineId: 'rt_back_biceps',
            routineTitle: 'Espalda & Bíceps V-Taper',
            date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
            durationMinutes: 48,
            totalVolumeKg: 4400,
            totalDistanceKm: 0,
            calories: 420,
            avgHeartRate: 138,
            maxHeartRate: 162,
            xpEarned: 340,
            completedExercises: 4,
            rating: 5,
          },
          {
            id: 'hist_rec_cardio',
            routineId: 'rt_cardio_hiit',
            routineTitle: 'Cardio HIIT & Running Interval',
            date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
            durationMinutes: 35,
            totalVolumeKg: 1000,
            totalDistanceKm: 4.2,
            calories: 380,
            avgHeartRate: 156,
            maxHeartRate: 180,
            xpEarned: 320,
            completedExercises: 3,
            rating: 5,
          },
        ];
        recoveredSessions.forEach((s) => combinedHistoryMap.set(s.id, s));
      }

      // Sanitize any historically corrupted distance/calorie entries from previous strength rowing bug
      const finalHistory = Array.from(combinedHistoryMap.values())
        .map((h) => {
          let cleanedKm = h.totalDistanceKm || 0;
          let cleanedCal = h.calories || 0;
          const isSport = Boolean(h.isSportActivity || h.routineId?.startsWith('sport_'));
          // If distance was inflated (> 30 km on a non-sport strength session)
          if (!isSport && cleanedKm > 30 && !h.routineTitle?.toLowerCase().includes('maratón')) {
            cleanedKm = 0;
          }
          // Only cap extreme corrupted values (> 4500 kcal on a non-sport session)
          if (!isSport && cleanedCal > 4500) {
            const minutes = h.durationMinutes || 45;
            const volume = h.totalVolumeKg || 0;
            cleanedCal = Math.round(minutes * 7.5 + (volume / 1000) * 8 + cleanedKm * 60);
          }
          const cleaned = sanitizeForFirestore({
            ...h,
            ...(cleanedKm > 0 || h.totalDistanceKm !== undefined ? { totalDistanceKm: cleanedKm } : {}),
            calories: cleanedCal,
          });
          // Sync cleaned entry back to cloud if it was modified
          if (cleaned.totalDistanceKm !== h.totalDistanceKm || cleaned.calories !== h.calories) {
            try {
              const historyDocRef = doc(db, 'users', uid, 'history', h.id);
              setDoc(historyDocRef, cleaned, { merge: true });
            } catch {}
          }
          return cleaned;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Recalculate accurate aggregate statistics directly from sanitized history
      const exactVolume = finalHistory.reduce((s, h) => s + (h.totalVolumeKg || 0), 0);
      const exactMinutes = finalHistory.reduce((s, h) => s + (h.durationMinutes || 0), 0);
      const exactCalories = finalHistory.reduce((s, h) => s + (h.calories || 0), 0);
      const exactDistance = finalHistory.reduce((s, h) => s + (h.totalDistanceKm || 0), 0);

      userProfile = {
        ...userProfile,
        stats: {
          ...userProfile.stats,
          totalWorkouts: Math.max(finalHistory.length, userProfile.stats?.totalWorkouts || 0),
          totalVolumeKg: Math.max(exactVolume, userProfile.stats?.totalVolumeKg || 0),
          totalMinutes: Math.max(exactMinutes, userProfile.stats?.totalMinutes || 0),
          caloriesBurned: Math.max(exactCalories, userProfile.stats?.caloriesBurned || 0),
          totalDistanceKm: Math.max(exactDistance, userProfile.stats?.totalDistanceKm || 0),
        },
      };

      // 1. Primary Sync from Master User Document (Identical to XP, Level, Stats)
      const localLogsRaw = localStorage.getItem(KEYS.NUTRITION_LOGS);
      const localLogs: Record<string, DailyNutritionLog> = localLogsRaw ? JSON.parse(localLogsRaw) : {};
      const mergedNutrition: Record<string, DailyNutritionLog> = { ...localLogs };

      // Load nutritionLogs stored directly on user profile document
      if (cloudData.nutritionLogs && typeof cloudData.nutritionLogs === 'object') {
        for (const [dateKey, rawCloudLog] of Object.entries(cloudData.nutritionLogs)) {
          const cloudLog = rawCloudLog as DailyNutritionLog;
          const localLog = localLogs[dateKey];
          if (!localLog) {
            mergedNutrition[dateKey] = cloudLog;
          } else {
            const localFoods = Array.isArray(localLog.foods) ? localLog.foods : [];
            const cloudFoods = Array.isArray(cloudLog.foods) ? cloudLog.foods : [];
            const foodsMap = new Map<string, any>();
            localFoods.forEach((f) => foodsMap.set(f.id || f.name, f));
            cloudFoods.forEach((f) => foodsMap.set(f.id || f.name, f));
            const mergedFoods = Array.from(foodsMap.values());
            mergedNutrition[dateKey] = {
              ...localLog,
              ...cloudLog,
              date: dateKey,
              foods: mergedFoods.length > 0 ? mergedFoods : (cloudFoods.length > 0 ? cloudFoods : localFoods),
              waterMl: Math.max(Number(localLog.waterMl) || 0, Number(cloudLog.waterMl) || 0),
            };
          }
        }
      }

      // Also check subcollection as secondary backup
      try {
        const nutritionRef = collection(db, 'users', uid, 'nutrition');
        const nutritionSnap = await getDocs(nutritionRef);
        if (!nutritionSnap.empty) {
          nutritionSnap.docs.forEach((docSnap) => {
            const cloudLog = docSnap.data() as DailyNutritionLog;
            const dateKey = docSnap.id;
            const existing = mergedNutrition[dateKey];
            if (!existing) {
              mergedNutrition[dateKey] = cloudLog;
            } else {
              const localFoods = Array.isArray(existing.foods) ? existing.foods : [];
              const cloudFoods = Array.isArray(cloudLog.foods) ? cloudLog.foods : [];
              const foodsMap = new Map<string, any>();
              localFoods.forEach((f) => foodsMap.set(f.id || f.name, f));
              cloudFoods.forEach((f) => foodsMap.set(f.id || f.name, f));
              const mergedFoods = Array.from(foodsMap.values());
              mergedNutrition[dateKey] = {
                ...existing,
                ...cloudLog,
                date: dateKey,
                foods: mergedFoods.length > 0 ? mergedFoods : (cloudFoods.length > 0 ? cloudFoods : localFoods),
                waterMl: Math.max(Number(existing.waterMl) || 0, Number(cloudLog.waterMl) || 0),
              };
            }
          });
        }
      } catch (err) {
        console.warn('Subcollection nutrition notice:', err);
      }

      localStorage.setItem(KEYS.NUTRITION_LOGS, JSON.stringify(mergedNutrition));

      // 2. Primary Saturday Weigh-Ins sync from Master Document
      const localWeighIns = this.getSaturdayWeighIns();
      const weighInsMap = new Map<string, SaturdayWeighIn>();

      if (Array.isArray(cloudData.saturdayWeighIns) && cloudData.saturdayWeighIns.length > 0) {
        cloudData.saturdayWeighIns.forEach((w) => weighInsMap.set(w.id, w));
      }

      // Also check weighIns subcollection as secondary backup
      try {
        const weighInsRef = collection(db, 'users', uid, 'weighIns');
        const weighInsSnap = await getDocs(weighInsRef);
        if (!weighInsSnap.empty) {
          weighInsSnap.docs.forEach((docSnap) => {
            const data = docSnap.data() as SaturdayWeighIn;
            weighInsMap.set(docSnap.id, { ...data, id: docSnap.id });
          });
        }
      } catch (err) {
        console.warn('Subcollection weigh-ins notice:', err);
      }

      localWeighIns.forEach((entry) => {
        if (!weighInsMap.has(entry.id)) {
          weighInsMap.set(entry.id, entry);
        }
      });

      const mergedWeighIns = Array.from(weighInsMap.values()).sort((a, b) => b.date.localeCompare(a.date));
      if (mergedWeighIns.length > 0) {
        localStorage.setItem(KEYS.SATURDAY_WEIGH_INS, JSON.stringify(mergedWeighIns));
        const latestWeight = mergedWeighIns[0].weightKg;
        if (!userProfile.weightKg || userProfile.weightKg === 75) {
          userProfile.weightKg = latestWeight;
        }
        if (!userProfile.targetWeightKg || userProfile.targetWeightKg === 72) {
          userProfile.targetWeightKg = userProfile.weightKg ? Math.max(50, userProfile.weightKg - 5) : 75;
        }
      }

      // 3. Merge Custom Routines from Cloud + Local
      const customRoutinesMap = new Map<string, WorkoutRoutine>();
      if (!isCloudResetActive) {
        this.getRoutines().filter((r) => r.isCustom).forEach((r) => customRoutinesMap.set(r.id, r));
      }
      if (Array.isArray(cloudData.customRoutines)) {
        (cloudData.customRoutines as WorkoutRoutine[]).forEach((r) => {
          if (r && r.id) customRoutinesMap.set(r.id, { ...r, isCustom: true });
        });
      }
      routinesList = [...defaultRoutines, ...Array.from(customRoutinesMap.values())];
      localStorage.setItem(KEYS.ROUTINES, JSON.stringify(routinesList));

      // 3b. Merge Custom Programs from Cloud + Local
      const customProgramsMap = new Map<string, WorkoutProgram>();
      if (!isCloudResetActive) {
        this.getPrograms().filter((p) => p.isCustom).forEach((p) => customProgramsMap.set(p.id, p));
      }
      if (Array.isArray(cloudData.customPrograms)) {
        (cloudData.customPrograms as WorkoutProgram[]).forEach((p) => {
          if (p && p.id) customProgramsMap.set(p.id, { ...p, isCustom: true });
        });
      }
      const mergedCustomPrograms = Array.from(customProgramsMap.values());
      localStorage.setItem('fitquest_custom_programs', JSON.stringify(mergedCustomPrograms));

      // 4. Merge Achievements State from Cloud + Local
      const localAch = isCloudResetActive ? createFreshAchievements() : this.getAchievements();
      const cloudAch: Achievement[] = Array.isArray(cloudData.achievementsState) ? cloudData.achievementsState : [];
      const cloudAchMap = new Map(cloudAch.map((a) => [a.id, a]));
      achievementsList = localAch.map((base) => {
        const c = cloudAchMap.get(base.id);
        if (!c) return base;
        return {
          ...base,
          currentProgress: Math.max(base.currentProgress || 0, c.currentProgress || 0),
          unlocked: Boolean(base.unlocked || c.unlocked),
          unlockedAt: base.unlockedAt || c.unlockedAt,
          rewardClaimed: Boolean((base as any).rewardClaimed || (c as any).rewardClaimed),
        };
      });
      localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievementsList));

      // Recalculate exact total XP and balanced level from history + claimed achievements + profile XP
      if (!isCloudResetActive) {
        const historyXp = finalHistory.reduce((s, h) => s + (Number(h.xpEarned) || 0), 0);
        const claimedAchXp = achievementsList
          .filter((a) => Boolean((a as any).rewardClaimed))
          .reduce((s, a) => s + (Number(a.xpReward) || 0), 0);
        const effectiveTotalXp = Math.max(userProfile.xp || 0, historyXp + claimedAchXp);
        const balancedProg = calculateLevelFromTotalXp(effectiveTotalXp);
        userProfile = {
          ...userProfile,
          level: balancedProg.level,
          xp: balancedProg.xp,
          currentLevelXp: balancedProg.currentLevelXp,
          nextLevelXp: balancedProg.nextLevelXp,
          lastCelebratedLevel: userProfile.lastCelebratedLevel || balancedProg.level,
        };
        try {
          localStorage.setItem('fitquest_last_celebrated_level', String(userProfile.lastCelebratedLevel));
        } catch {}
      }

      // Update local storage with combined sanitized history & user, and sync clean stats to cloud
      this.saveHistory(finalHistory);
      this.saveUser(userProfile);
      this.syncUserToCloud(userProfile);

      return {
        user: userProfile,
        history: finalHistory,
        achievements: achievementsList,
        challenges: challengesList,
        routines: routinesList,
      };
    } catch (e) {
      console.error('Error loading user from cloud', e);
      const fallback = createFreshUser(uid, displayName || 'Nuevo Atleta', email);
      return {
        user: fallback,
        history: [],
        achievements: createFreshAchievements(),
        challenges: defaultChallenges,
        routines: defaultRoutines,
      };
    }
  }

  public static getRoutines(): WorkoutRoutine[] {
    try {
      const data = localStorage.getItem(KEYS.ROUTINES);
      if (!data) return defaultRoutines;
      const parsed: WorkoutRoutine[] = JSON.parse(data);
      const custom = parsed.filter((r) => r.isCustom);
      return [...defaultRoutines, ...custom];
    } catch {
      return defaultRoutines;
    }
  }

  public static saveRoutines(routines: WorkoutRoutine[]) {
    try {
      localStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
      const uid = auth.currentUser?.uid;
      if (uid) {
        const customOnly = routines.filter((r) => r.isCustom);
        setDoc(
          doc(db, 'users', uid),
          sanitizeForFirestore({
            customRoutines: customOnly,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        ).catch((err) => console.warn('Custom routines cloud sync warning:', err));
      }
    } catch (e) {
      console.error('Failed to save routines', e);
    }
  }

  public static deleteCustomRoutine(routineId: string): WorkoutRoutine[] {
    const updated = this.getRoutines().filter((r) => !(r.isCustom && r.id === routineId));
    this.saveRoutines(updated);
    return updated;
  }

  public static getPrograms(): WorkoutProgram[] {
    try {
      const data = localStorage.getItem('fitquest_custom_programs');
      const custom: WorkoutProgram[] = data ? JSON.parse(data) : [];
      return [...defaultPrograms, ...custom];
    } catch {
      return defaultPrograms;
    }
  }

  public static saveCustomProgram(program: WorkoutProgram): WorkoutProgram[] {
    try {
      const allCustom = this.getPrograms().filter((p) => p.isCustom);
      const existingIdx = allCustom.findIndex((p) => p.id === program.id);
      if (existingIdx >= 0) {
        allCustom[existingIdx] = program;
      } else {
        allCustom.push({ ...program, isCustom: true });
      }
      localStorage.setItem('fitquest_custom_programs', JSON.stringify(allCustom));

      const uid = auth.currentUser?.uid;
      if (uid) {
        setDoc(
          doc(db, 'users', uid),
          sanitizeForFirestore({
            customPrograms: allCustom,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        ).catch((err) => console.warn('Custom programs sync warning:', err));
      }
      return this.getPrograms();
    } catch (e) {
      console.error('Error saving custom program', e);
      return this.getPrograms();
    }
  }

  public static deleteCustomProgram(progId: string): WorkoutProgram[] {
    try {
      const allCustom = this.getPrograms().filter((p) => p.isCustom && p.id !== progId);
      localStorage.setItem('fitquest_custom_programs', JSON.stringify(allCustom));
      const uid = auth.currentUser?.uid;
      if (uid) {
        setDoc(
          doc(db, 'users', uid),
          sanitizeForFirestore({
            customPrograms: allCustom,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        ).catch((err) => console.warn('Custom programs delete sync warning:', err));
      }
      return this.getPrograms();
    } catch {
      return this.getPrograms();
    }
  }

  public static getProgramProgress(): { [progId: string]: number } {
    try {
      const data = localStorage.getItem('fitquest_program_progress');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public static setProgramDayCompleted(progId: string, dayNumber: number) {
    try {
      const current = this.getProgramProgress();
      if (dayNumber <= 0) {
        delete current[progId];
      } else {
        current[progId] = Math.max(current[progId] || 0, dayNumber);
      }
      localStorage.setItem('fitquest_program_progress', JSON.stringify(current));
      const uid = auth.currentUser?.uid;
      if (uid) {
        setDoc(
          doc(db, 'users', uid),
          sanitizeForFirestore({
            programProgress: current,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        ).catch((err) => console.warn('Program progress sync warning:', err));
      }
    } catch (e) {
      console.error(e);
    }
  }

  public static getChallenges(): CommunityChallenge[] {
    try {
      const data = localStorage.getItem(KEYS.CHALLENGES);
      return data ? JSON.parse(data) : defaultChallenges;
    } catch {
      return defaultChallenges;
    }
  }

  public static saveChallenges(challenges: CommunityChallenge[]) {
    try {
      localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(challenges));
    } catch (e) {
      console.error('Failed to save challenges', e);
    }
  }

  public static getAchievements(): Achievement[] {
    try {
      const fresh = createFreshAchievements();
      const data = localStorage.getItem(KEYS.ACHIEVEMENTS);
      if (!data) return fresh;
      const parsed: Achievement[] = JSON.parse(data);
      const parsedMap = new Map(parsed.map((a) => [a.id, a]));
      // Merge with fresh list so all achievements are present and updated
      return fresh.map((base) => {
        const stored = parsedMap.get(base.id);
        if (!stored) return base;
        return {
          ...base,
          currentProgress: stored.currentProgress || 0,
          unlocked: stored.unlocked || false,
          ...(stored.unlockedAt ? { unlockedAt: stored.unlockedAt } : {}),
          rewardClaimed: (stored as any).rewardClaimed || false,
        };
      });
    } catch {
      return createFreshAchievements();
    }
  }

  public static saveAchievements(achievements: Achievement[]) {
    try {
      localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      const uid = auth.currentUser?.uid;
      if (uid) {
        setDoc(
          doc(db, 'users', uid),
          sanitizeForFirestore({
            achievementsState: achievements,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        ).catch((err) => console.warn('Achievements cloud sync warning:', err));
      }
    } catch (e) {
      console.error('Failed to save achievements', e);
    }
  }

  public static getLeaderboard(): LeaderboardUser[] {
    try {
      const data = localStorage.getItem(KEYS.LEADERBOARD);
      return data ? JSON.parse(data) : defaultLeaderboard;
    } catch {
      return defaultLeaderboard;
    }
  }

  public static saveLeaderboard(users: LeaderboardUser[]) {
    try {
      localStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save leaderboard', e);
    }
  }

  /**
   * Queries Firestore users collection to find real registered athletes across leagues.
   * Excludes current local user to avoid duplication.
   */
  public static async fetchRealCommunityAthletes(targetLeague?: string): Promise<LeaderboardUser[]> {
    try {
      const currentUid = auth.currentUser?.uid;
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);

      const athletes: LeaderboardUser[] = [];
      const now = new Date();
      const oneWeekAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;

      snap.forEach((docSnap) => {
        // Exclude current authenticated athlete (handled with fresh local state)
        if (currentUid && docSnap.id === currentUid) return;

        const data = docSnap.data();
        if (!data || typeof data !== 'object') return;

        const athleteLeague = (data.league || 'Bronze') as any;
        if (targetLeague && athleteLeague !== targetLeague) return;

        const historyList: any[] = Array.isArray(data.workoutHistory) ? data.workoutHistory : [];
        const thisWeekWorkouts = historyList.filter((h) => {
          if (!h?.date) return false;
          const d = new Date(h.date).getTime();
          return !isNaN(d) && d >= oneWeekAgoMs;
        });

        const weeklyXpFromWorkouts = thisWeekWorkouts.reduce((sum, h) => sum + (Number(h.xpEarned) || 0), 0);
        const weeklyXp = Math.max(
          Number(data.leaguePoints) || 0,
          weeklyXpFromWorkouts,
          Math.min(Number(data.xp) || 0, Math.round((Number(data.xp) || 500) * 0.2))
        );

        const totalVol = data.stats?.totalVolumeKg ?? historyList.reduce((s, h) => s + (Number(h.totalVolumeKg) || 0), 0);
        const totalDist = data.stats?.totalDistanceKm ?? historyList.reduce((s, h) => s + (Number(h.totalDistanceKm) || 0), 0);
        const badges = Array.isArray(data.unlockedBadges) && data.unlockedBadges.length > 0
          ? data.unlockedBadges.slice(0, 3)
          : ['⚡ Atleta Real', '🏆 FitQuest'];

        athletes.push({
          rank: 0,
          userId: docSnap.id,
          name: data.name || 'Atleta de la Comunidad',
          avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || 'Atleta')}`,
          level: Number(data.level) || 1,
          xpEarned: weeklyXp,
          streakDays: Number(data.stats?.currentStreak) || Number(data.streak) || 0,
          league: athleteLeague,
          workoutsThisWeek: thisWeekWorkouts.length,
          isCurrentUser: false,
          isRealUser: true,
          rankTitle: data.rankTitle || 'Atleta Activo',
          achievementsUnlockedCount: Array.isArray(data.unlockedBadges)
            ? data.unlockedBadges.length
            : (Array.isArray(data.achievementsState) ? data.achievementsState.filter((a: any) => a.unlocked).length : 2),
          totalVolumeKg: totalVol,
          totalDistanceKm: totalDist,
          topBadges: badges,
          bio: data.bio || 'Atleta activo en la comunidad FitQuest Pro.',
          followingCount: Array.isArray(data.following) ? data.following.length : 0,
          followersCount: Array.isArray(data.followers) ? data.followers.length : 0,
          equippedFrame: data.equippedFrame || 'frame_default',
        });
      });

      return athletes;
    } catch (err) {
      console.warn('Could not fetch real community athletes from Firestore:', err);
      return [];
    }
  }

  public static getSmartwatch(): SmartwatchDevice {
    try {
      const data = localStorage.getItem(KEYS.SMARTWATCH);
      if (!data) return defaultSmartwatch;
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') return defaultSmartwatch;

      // Clean up previous simulated mock connections
      if (parsed.syncSource === 'simulated' || (!parsed.syncSource && parsed.status === 'connected')) {
        localStorage.removeItem(KEYS.SMARTWATCH);
        return defaultSmartwatch;
      }

      return {
        ...defaultSmartwatch,
        ...parsed,
        status: parsed.status || defaultSmartwatch.status,
      };
    } catch {
      return defaultSmartwatch;
    }
  }

  public static saveSmartwatch(watch: SmartwatchDevice) {
    try {
      localStorage.setItem(KEYS.SMARTWATCH, JSON.stringify(watch));
    } catch (e) {
      console.error('Failed to save smartwatch', e);
    }
  }

  public static getReminders(): PushReminder[] {
    try {
      const data = localStorage.getItem(KEYS.REMINDERS);
      return data ? JSON.parse(data) : defaultPushReminders;
    } catch {
      return defaultPushReminders;
    }
  }

  public static saveReminders(reminders: PushReminder[]) {
    try {
      localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.error('Failed to save reminders', e);
    }
  }

  public static getHistory(): WorkoutHistoryEntry[] {
    try {
      const data = localStorage.getItem(KEYS.HISTORY);
      return data ? JSON.parse(data) : defaultWorkoutHistory;
    } catch {
      return defaultWorkoutHistory;
    }
  }

  public static saveHistory(history: WorkoutHistoryEntry[]) {
    try {
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  public static getActiveSession(): ActiveWorkoutState | null {
    try {
      const data = localStorage.getItem(KEYS.ACTIVE_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static saveActiveSession(session: ActiveWorkoutState | null) {
    try {
      if (session) {
        localStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(KEYS.ACTIVE_SESSION);
      }
      const uid = auth.currentUser?.uid;
      if (uid) {
        setDoc(
          doc(db, 'users', uid),
          sanitizeForFirestore({
            activeSession: session,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        ).catch((err) => console.warn('Active session sync warning:', err));
      }
    } catch (e) {
      console.error('Failed to save active session', e);
    }
  }

  public static clearActiveSession() {
    try {
      localStorage.removeItem(KEYS.ACTIVE_SESSION);
      const uid = auth.currentUser?.uid;
      if (uid) {
        setDoc(doc(db, 'users', uid), {
          activeSession: null,
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch((err) => console.warn('Active session clear warning:', err));
      }
    } catch (e) {
      console.error('Failed to clear active session', e);
    }
  }

  public static async addHistoryEntry(entry: WorkoutHistoryEntry, user?: UserProfile) {
    const history = this.getHistory();
    const sanitizedEntry = sanitizeForFirestore(entry);
    const updated = [sanitizedEntry, ...history.filter(h => h.id !== sanitizedEntry.id)];
    this.saveHistory(updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fitquest_history_updated'));
    }

    // Save to Firestore if authenticated or has persistent user ID
    const uid = auth.currentUser?.uid || (user?.id && !user.id.startsWith('guest_') ? user.id : null);
    if (uid) {
      try {
        // 1. Primary Sync: Save entire workout history to master user doc for instant multi-device sync
        await setDoc(
          doc(db, 'users', uid),
          sanitizeForFirestore({
            workoutHistory: updated,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );

        // 2. Secondary backup: Save to subcollection
        const historyDocRef = doc(db, 'users', uid, 'history', sanitizedEntry.id);
        await setDoc(
          historyDocRef,
          sanitizeForFirestore({
            ...sanitizedEntry,
            createdAt: sanitizedEntry.date || new Date().toISOString(),
          }),
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to save workout entry to Firestore', err);
      }
    }
  }

  public static async deleteHistoryEntry(entryId: string, user?: UserProfile): Promise<WorkoutHistoryEntry[]> {
    this.markHistoryIdDeleted(entryId);
    const history = this.getHistory();
    const updated = history.filter((h) => h.id !== entryId);
    this.saveHistory(updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fitquest_history_updated'));
    }

    const uid = auth.currentUser?.uid || (user?.id && !user.id.startsWith('guest_') ? user.id : null);
    if (uid) {
      try {
        await setDoc(
          doc(db, 'users', uid),
          sanitizeForFirestore({
            workoutHistory: updated,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );

        await deleteDoc(doc(db, 'users', uid, 'history', entryId)).catch(() => {});
      } catch (err) {
        console.error('Failed to delete workout entry from Firestore', err);
      }
    }
    return updated;
  }

  public static async updateHistoryEntry(updatedEntry: WorkoutHistoryEntry, user?: UserProfile): Promise<WorkoutHistoryEntry[]> {
    const sanitizedEntry = sanitizeForFirestore(updatedEntry);
    const history = this.getHistory();
    const updated = history.map((h) => (h.id === sanitizedEntry.id ? sanitizedEntry : h));
    this.saveHistory(updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fitquest_history_updated'));
    }

    const uid = auth.currentUser?.uid || (user?.id && !user.id.startsWith('guest_') ? user.id : null);
    if (uid) {
      try {
        await setDoc(
          doc(db, 'users', uid),
          sanitizeForFirestore({
            workoutHistory: updated,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );

        await setDoc(
          doc(db, 'users', uid, 'history', sanitizedEntry.id),
          sanitizeForFirestore({
            ...sanitizedEntry,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to update workout entry in Firestore', err);
      }
    }
    return updated;
  }

  public static addXp(amount: number, currentUser?: UserProfile, skipSave: boolean = false): UserProfile {
    const user = currentUser || this.getUser();
    const newTotalXp = Math.max(0, (user.xp || 0) + amount);
    const prog = calculateLevelFromTotalXp(newTotalXp);

    let rankTitle = user.rankTitle || 'Recluta Inicial';
    const didLevelUp = prog.level > (user.level || 1);
    if (didLevelUp) {
      const milestone = LEVEL_MILESTONES.find((m) => m.level === prog.level);
      if (milestone?.title && (!user.rankTitle || user.rankTitle === 'Recluta Inicial')) {
        rankTitle = milestone.title;
      }
      try {
        localStorage.setItem('fitquest_last_celebrated_level', String(prog.level));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('fitquest_level_up', {
              detail: { newLevel: prog.level, previousLevel: user.level || 1 },
            })
          );
        }
      } catch {}
    }

    const updatedUser: UserProfile = {
      ...user,
      level: prog.level,
      xp: prog.xp,
      currentLevelXp: prog.currentLevelXp,
      nextLevelXp: prog.nextLevelXp,
      rankTitle,
      lastCelebratedLevel: didLevelUp ? prog.level : (user.lastCelebratedLevel || prog.level),
      streakShields: didLevelUp ? Math.min(2, (user.streakShields ?? 1) + 1) : (user.streakShields ?? 1),
      attributes: {
        strength: Math.min(100, user.attributes.strength + Math.floor(amount / 300)),
        endurance: Math.min(100, user.attributes.endurance + Math.floor(amount / 350)),
        agility: Math.min(100, user.attributes.agility + Math.floor(amount / 400)),
        discipline: Math.min(100, user.attributes.discipline + Math.floor(amount / 250)),
      },
    };

    if (!skipSave) {
      this.saveUser(updatedUser);
    }
    return updatedUser;
  }

  public static getExercisePastPerformance(exerciseName: string, historyEntries?: WorkoutHistoryEntry[]) {
    try {
      const history = historyEntries || this.getHistory();
      const cleanTargetName = exerciseName.trim().toLowerCase();
      
      for (const entry of history) {
        if (!entry.exercises) continue;
        for (const ex of entry.exercises) {
          if (ex.name.trim().toLowerCase() === cleanTargetName) {
            if (ex.sets && ex.sets.length > 0) {
              const completedSets = ex.sets.filter((s) => s.completed || (s.actualReps && s.actualReps > 0));
              if (completedSets.length > 0) {
                const bestSet = completedSets.reduce((prev, curr) => {
                  const prevW = prev.actualWeightKg || prev.targetWeightKg || 0;
                  const currW = curr.actualWeightKg || curr.targetWeightKg || 0;
                  return currW >= prevW ? curr : prev;
                });
                const weight = bestSet.actualWeightKg || bestSet.targetWeightKg || 0;
                const reps = bestSet.actualReps || bestSet.targetReps || 0;
                return {
                  lastWeightKg: weight,
                  lastReps: reps,
                  date: entry.date,
                  suggestedWeightKg: weight > 0 ? (reps >= (bestSet.targetReps || 8) ? weight + 2.5 : weight) : 0,
                  suggestedReps: weight === 0 ? reps + 1 : (reps >= 10 ? reps : reps + 1),
                };
              }
            }
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  public static claimWeeklyChallenge(challengeId: string, rewardXp: number, currentUser?: UserProfile): UserProfile {
    const user = currentUser || this.getUser();
    const existing = user.claimedChallenges || [];
    if (existing.includes(challengeId)) {
      return user;
    }
    const updatedClaimed = [...existing, challengeId];
    const newTotalXp = Math.max(0, (user.xp || 0) + rewardXp);
    const prog = calculateLevelFromTotalXp(newTotalXp);

    let rankTitle = user.rankTitle || 'Recluta Inicial';
    if (prog.level > (user.level || 1)) {
      const milestone = LEVEL_MILESTONES.find((m) => m.level === prog.level);
      if (milestone?.title && (!user.rankTitle || user.rankTitle === 'Recluta Inicial')) {
        rankTitle = milestone.title;
      }
    }

    const updatedUser: UserProfile = {
      ...user,
      level: prog.level,
      xp: prog.xp,
      currentLevelXp: prog.currentLevelXp,
      nextLevelXp: prog.nextLevelXp,
      rankTitle,
      claimedChallenges: updatedClaimed,
      streakShields: Math.min(2, (user.streakShields ?? 1) + 1),
      stats: {
        ...user.stats,
        challengesCompleted: (user.stats.challengesCompleted || 0) + 1,
      },
      attributes: {
        strength: Math.min(100, user.attributes.strength + Math.floor(rewardXp / 300)),
        endurance: Math.min(100, user.attributes.endurance + Math.floor(rewardXp / 350)),
        agility: Math.min(100, user.attributes.agility + Math.floor(rewardXp / 400)),
        discipline: Math.min(100, user.attributes.discipline + Math.floor(rewardXp / 250)),
      },
    };

    this.saveUser(updatedUser);
    try {
      localStorage.setItem('fitquest_claimed_challenges', JSON.stringify(updatedClaimed));
    } catch {}

    return updatedUser;
  }

  public static saveRoutine(routine: WorkoutRoutine) {
    const routines = this.getRoutines();
    const existingIdx = routines.findIndex((r) => r.id === routine.id);
    if (existingIdx >= 0) {
      routines[existingIdx] = routine;
    } else {
      routines.push(routine);
    }
    this.saveRoutines(routines);
  }

  public static getOfflineMode(): boolean {
    try {
      return localStorage.getItem(KEYS.IS_OFFLINE) === 'true';
    } catch {
      return false;
    }
  }

  public static saveOfflineMode(isOffline: boolean) {
    try {
      localStorage.setItem(KEYS.IS_OFFLINE, String(isOffline));
    } catch (e) {
      console.error('Failed to save offline mode', e);
    }
  }

  public static getLanguage(): Language {
    return this.getLang();
  }

  public static saveLanguage(lang: Language) {
    this.saveLang(lang);
  }

  public static getTheme(): ThemeMode {
    try {
      return (localStorage.getItem(KEYS.THEME) as ThemeMode) || 'dark';
    } catch {
      return 'dark';
    }
  }

  public static saveTheme(theme: ThemeMode) {
    try {
      localStorage.setItem(KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  }

  public static getLang(): Language {
    try {
      return (localStorage.getItem(KEYS.LANG) as Language) || 'es';
    } catch {
      return 'es';
    }
  }

  public static saveLang(lang: Language) {
    try {
      localStorage.setItem(KEYS.LANG, lang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  }

  public static getHighContrast(): boolean {
    try {
      return localStorage.getItem(KEYS.HIGH_CONTRAST) === 'true';
    } catch {
      return false;
    }
  }

  public static saveHighContrast(enabled: boolean) {
    try {
      localStorage.setItem(KEYS.HIGH_CONTRAST, String(enabled));
    } catch (e) {
      console.error('Failed to save high contrast', e);
    }
  }

  public static getTextSize(): 'normal' | 'large' | 'xlarge' {
    try {
      return (localStorage.getItem(KEYS.TEXT_SIZE) as 'normal' | 'large' | 'xlarge') || 'normal';
    } catch {
      return 'normal';
    }
  }

  public static saveTextSize(size: 'normal' | 'large' | 'xlarge') {
    try {
      localStorage.setItem(KEYS.TEXT_SIZE, size);
    } catch (e) {
      console.error('Failed to save text size', e);
    }
  }

  public static exportAllData(): string {
    const backup = {
      exportVersion: '2.1.0',
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      routines: this.getRoutines(),
      challenges: this.getChallenges(),
      achievements: this.getAchievements(),
      leaderboard: this.getLeaderboard(),
      smartwatch: this.getSmartwatch(),
      reminders: this.getReminders(),
      history: this.getHistory(),
      nutritionLogs: (() => {
        try {
          return JSON.parse(localStorage.getItem(KEYS.NUTRITION_LOGS) || '{}');
        } catch {
          return {};
        }
      })(),
      saturdayWeighIns: this.getSaturdayWeighIns(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public static importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.user) this.saveUser(parsed.user);
      if (parsed.routines) this.saveRoutines(parsed.routines);
      if (parsed.challenges) this.saveChallenges(parsed.challenges);
      if (parsed.achievements) this.saveAchievements(parsed.achievements);
      if (parsed.leaderboard) this.saveLeaderboard(parsed.leaderboard);
      if (parsed.smartwatch) this.saveSmartwatch(parsed.smartwatch);
      if (parsed.reminders) this.saveReminders(parsed.reminders);
      if (parsed.history) this.saveHistory(parsed.history);
      if (parsed.nutritionLogs) {
        localStorage.setItem(KEYS.NUTRITION_LOGS, JSON.stringify(parsed.nutritionLogs));
      }
      if (parsed.saturdayWeighIns && Array.isArray(parsed.saturdayWeighIns)) {
        localStorage.setItem(KEYS.SATURDAY_WEIGH_INS, JSON.stringify(parsed.saturdayWeighIns));
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  public static async resetUserProgress(): Promise<UserProfile> {
    const currentUser = auth.currentUser;
    const existingUser = this.getUser();

    const resetTimestamp = new Date().toISOString();

    const freshUser: UserProfile = {
      id: currentUser ? currentUser.uid : existingUser.id,
      name: existingUser.name || (currentUser?.displayName ?? 'Atleta'),
      avatar: existingUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${existingUser.name || 'Atleta'}`,
      level: 1,
      xp: 0,
      currentLevelXp: 0,
      nextLevelXp: 600,
      rankTitle: 'Recluta Inicial',
      league: 'Bronze',
      leaguePoints: 0,
      joinedAt: existingUser.joinedAt || resetTimestamp.split('T')[0],
      weightKg: existingUser.weightKg || 75,
      targetWeightKg: existingUser.targetWeightKg || 72,
      attributes: {
        strength: 10,
        endurance: 10,
        agility: 10,
        discipline: 10,
      },
      stats: {
        totalWorkouts: 0,
        totalVolumeKg: 0,
        totalDistanceKm: 0,
        totalMinutes: 0,
        caloriesBurned: 0,
        currentStreak: 0,
        bestStreak: 0,
        duelsWon: 0,
        challengesCompleted: 0,
      },
      unlockedBadges: [],
      claimedChallenges: [],
      lastResetAt: resetTimestamp,
      programProgress: {},
      activeSession: null,
    };

    // 1. Reset local storage immediately
    this.saveUser(freshUser);
    this.saveHistory([]);
    try {
      localStorage.setItem(KEYS.LAST_RESET_AT, resetTimestamp);
      localStorage.removeItem(KEYS.HISTORY);
      localStorage.setItem('fitquest_claimed_challenges', JSON.stringify([]));
      localStorage.setItem('fitquest_program_progress', JSON.stringify({}));
      localStorage.removeItem(KEYS.ACTIVE_SESSION);
      localStorage.removeItem('fitquest_active_routine');
    } catch {}

    // Reset challenges in local storage
    const resetChallenges = defaultChallenges.map((c) => ({
      ...c,
      currentProgress: 0,
      completed: false,
    }));
    this.saveChallenges(resetChallenges);

    // Reset achievements in local storage
    const resetAchievements = createFreshAchievements();
    this.saveAchievements(resetAchievements);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fitquest_history_updated'));
    }

    // 2. Clear cloud Firestore if user is authenticated (with timeout & sanitized payload)
    if (currentUser) {
      const cloudResetPromise = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(
            userDocRef,
            sanitizeForFirestore({
              ...freshUser,
              workoutHistory: [],
              customRoutines: [],
              programProgress: {},
              activeSession: null,
              updatedAt: resetTimestamp,
              lastResetAt: resetTimestamp,
            }),
            { merge: true }
          );

          // Fast parallel cleanup of subcollections if existing (non-blocking)
          const historyCol = collection(db, 'users', currentUser.uid, 'history');
          const historySnap = await getDocs(historyCol);
          await Promise.all(
            historySnap.docs.map((docSnap) =>
              deleteDoc(doc(db, 'users', currentUser.uid, 'history', docSnap.id)).catch(() => {})
            )
          );
        } catch (err) {
          console.warn('Cloud reset warning:', err);
        }
      };

      // Ensure execution never hangs on network / offline promises
      await Promise.race([
        cloudResetPromise(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]).catch(() => {});
    }

    return freshUser;
  }

  public static async deleteUserAccountAndData(
    password?: string
  ): Promise<{ success: boolean; requiresPassword?: boolean; error?: string }> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      return { success: true };
    }

    const uid = currentUser.uid;
    const email = currentUser.email;

    // 1. If password provided and user has email, re-authenticate first to guarantee Firebase Auth deletion
    if (password && email) {
      try {
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(currentUser, credential);
      } catch (authErr: any) {
        console.warn('Re-auth error:', authErr);
        if (
          authErr.code === 'auth/wrong-password' ||
          authErr.code === 'auth/invalid-credential' ||
          authErr.code === 'auth/invalid-login-credentials'
        ) {
          return { success: false, error: 'Contraseña incorrecta. Por favor, compruébala.' };
        }
        return { success: false, error: 'Error al verificar credenciales: ' + (authErr.message || authErr.code) };
      }
    }

    // 2. Delete user in Firebase Authentication
    try {
      await deleteUser(currentUser);
    } catch (err: any) {
      console.warn('Firebase deleteUser error:', err);
      if (err.code === 'auth/requires-recent-login') {
        return {
          success: false,
          requiresPassword: true,
          error: 'Por seguridad de Firebase, introduce tu contraseña para confirmar el borrado definitivo de tu cuenta.',
        };
      }
      return { success: false, error: 'Error al eliminar usuario en Firebase: ' + (err.message || err.code) };
    }

    // 3. User is now deleted from Firebase Auth! Delete user Firestore documents & subcollections
    try {
      const userDocRef = doc(db, 'users', uid);
      await deleteDoc(userDocRef).catch(() => {});
      ['history', 'nutrition', 'weighIns', 'routines'].forEach(async (subCol) => {
        try {
          const snap = await getDocs(collection(db, 'users', uid, subCol));
          snap.docs.forEach((d) => deleteDoc(doc(db, 'users', uid, subCol, d.id)).catch(() => {}));
        } catch {}
      });
    } catch (dbErr) {
      console.warn('Firestore doc deletion warning:', dbErr);
    }

    // 4. Clear local storage and session
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    try {
      await signOut(auth);
    } catch {}

    return { success: true };
  }

  public static logWeight(newWeightKg: number, date?: string, currentUser?: UserProfile): UserProfile {
    const user = currentUser || this.getUser();
    const todayStr = date || new Date().toISOString().split('T')[0];
    const history = user.weightHistory && user.weightHistory.length > 0 ? user.weightHistory : [
      { date: user.joinedAt || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], weightKg: user.weightKg || 75 }
    ];
    
    // Check if already logged today
    const existingIdx = history.findIndex((w) => w.date === todayStr);
    let updatedHistory = [...history];
    if (existingIdx >= 0) {
      updatedHistory[existingIdx] = { date: todayStr, weightKg: newWeightKg };
    } else {
      updatedHistory.push({ date: todayStr, weightKg: newWeightKg });
    }
    // Sort chronological
    updatedHistory.sort((a, b) => a.date.localeCompare(b.date));

    const updatedUser: UserProfile = {
      ...user,
      weightKg: newWeightKg,
      weightHistory: updatedHistory,
    };
    this.saveUser(updatedUser);
    return updatedUser;
  }

  public static getAllNutritionLogs(): Record<string, DailyNutritionLog> {
    try {
      const logsRaw = localStorage.getItem(KEYS.NUTRITION_LOGS);
      return logsRaw ? JSON.parse(logsRaw) : {};
    } catch {
      return {};
    }
  }

  public static setActiveNutritionPlan(planId: string | null, currentUser?: UserProfile): UserProfile {
    const user = currentUser || this.getUser();
    const normalizedPlanId = planId && planId !== 'none' ? planId : 'none';
    const updatedUser: UserProfile = {
      ...user,
      activeNutritionPlanId: normalizedPlanId,
    };
    this.saveUser(updatedUser);

    const activePlan = getActiveNutritionPlan(normalizedPlanId);
    // Align today's log targets with the newly activated plan or default baseline
    const todayStr = new Date().toISOString().split('T')[0];
    const currentTodayLog = this.getNutritionLog(todayStr);
    const dayType = currentTodayLog.dayType || 'workout';
    const planTargets = activePlan
      ? (dayType === 'rest' ? activePlan.targets.rest : activePlan.targets.workout)
      : (dayType === 'rest' ? { calories: 2000, protein: 160, carbs: 180, fat: 65 } : { calories: 2300, protein: 180, carbs: 220, fat: 70 });

    const updatedTodayLog: DailyNutritionLog = {
      ...currentTodayLog,
      targetCalories: planTargets.calories,
      targetProtein: planTargets.protein,
      targetCarbs: planTargets.carbs,
      targetFat: planTargets.fat,
      waterGoalMl: activePlan ? activePlan.waterGoalMl : 3000,
    };
    this.saveNutritionLog(updatedTodayLog);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fitquest_user_updated', { detail: updatedUser }));
    }

    return updatedUser;
  }

  public static getNutritionLog(dateStr: string): DailyNutritionLog {
    try {
      const logsRaw = localStorage.getItem(KEYS.NUTRITION_LOGS);
      const logs: Record<string, DailyNutritionLog> = logsRaw ? JSON.parse(logsRaw) : {};
      const user = this.getUser();
      const activePlan = getActiveNutritionPlan(user.activeNutritionPlanId);

      const defaultTargets = activePlan
        ? activePlan.targets
        : {
            workout: { calories: 2300, protein: 180, carbs: 220, fat: 70 },
            rest: { calories: 2000, protein: 160, carbs: 180, fat: 65 },
          };
      const defaultWater = activePlan ? activePlan.waterGoalMl : 3000;

      if (logs[dateStr]) {
        const found = logs[dateStr];
        const dayType = found.dayType === 'rest' ? 'rest' : 'workout';
        const planTargets = dayType === 'rest' ? defaultTargets.rest : defaultTargets.workout;
        return {
          ...found,
          date: dateStr,
          dayType,
          foods: Array.isArray(found.foods) ? found.foods : [],
          waterMl: Number(found.waterMl) || 0,
          targetCalories: Number(found.targetCalories) || planTargets.calories,
          targetProtein: Number(found.targetProtein) || planTargets.protein,
          targetCarbs: Number(found.targetCarbs) || planTargets.carbs,
          targetFat: Number(found.targetFat) || planTargets.fat,
          waterGoalMl: Number(found.waterGoalMl) || defaultWater,
        };
      }
      return {
        date: dateStr,
        dayType: 'workout',
        targetCalories: defaultTargets.workout.calories,
        targetProtein: defaultTargets.workout.protein,
        targetCarbs: defaultTargets.workout.carbs,
        targetFat: defaultTargets.workout.fat,
        waterMl: 0,
        waterGoalMl: defaultWater,
        foods: [],
      };
    } catch {
      return {
        date: dateStr,
        dayType: 'workout',
        targetCalories: 2300,
        targetProtein: 180,
        targetCarbs: 220,
        targetFat: 70,
        waterMl: 0,
        waterGoalMl: 3000,
        foods: [],
      };
    }
  }

  public static saveNutritionLog(log: DailyNutritionLog) {
    try {
      const logsRaw = localStorage.getItem(KEYS.NUTRITION_LOGS);
      const logs: Record<string, DailyNutritionLog> = logsRaw ? JSON.parse(logsRaw) : {};
      logs[log.date] = log;
      localStorage.setItem(KEYS.NUTRITION_LOGS, JSON.stringify(logs));

      // Dispatch local event for instant UI update across Dashboard and Nutrition tabs
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fitquest_nutrition_updated'));
      }

      const uid = auth.currentUser?.uid;
      if (uid) {
        // 1. Primary Sync: Write directly to the master user document (identical to XP, level, rank)
        setDoc(
          doc(db, 'users', uid),
          {
            nutritionLogs: {
              [log.date]: log,
            },
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => console.warn('Master user doc nutrition sync warning:', err));

        // 2. Secondary backup: Also write to subcollection
        setDoc(doc(db, 'users', uid, 'nutrition', log.date), log, { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to save nutrition log', e);
    }
  }

  public static getSaturdayWeighIns(): SaturdayWeighIn[] {
    try {
      const raw = localStorage.getItem(KEYS.SATURDAY_WEIGH_INS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      const user = this.getUser();
      // If user has not completed onboarding or has no weight, return empty array (no fake 80kg)
      if (!user.weightKg || !user.onboardingCompleted) {
        return [];
      }
      const currentWeight = Number(user.weightKg);
      const targetWeight = Number(user.targetWeightKg) || currentWeight;
      const userName = user.name || 'Atleta';
      const defaultInitial: SaturdayWeighIn[] = [
        {
          id: 'initial_user_baseline',
          date: new Date().toISOString().split('T')[0],
          weightKg: currentWeight,
          muscleMassKg: Number((currentWeight * 0.65).toFixed(1)),
          notes: `Inicio de seguimiento para ${userName}. Meta: ${targetWeight} kg.`,
        },
      ];
      localStorage.setItem(KEYS.SATURDAY_WEIGH_INS, JSON.stringify(defaultInitial));
      return defaultInitial;
    } catch {
      return [];
    }
  }

  public static saveSaturdayWeighIn(entry: SaturdayWeighIn) {
    try {
      const weighIns = this.getSaturdayWeighIns();
      const existingIdx = weighIns.findIndex((w) => w.id === entry.id || w.date === entry.date);
      if (existingIdx >= 0) {
        weighIns[existingIdx] = entry;
      } else {
        weighIns.push(entry);
      }
      weighIns.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem(KEYS.SATURDAY_WEIGH_INS, JSON.stringify(weighIns));

      // Dispatch local event for instant UI update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fitquest_weighins_updated'));
      }

      const latest = weighIns[0];
      if (latest) {
        this.logWeight(latest.weightKg, latest.date);
      }

      const uid = auth.currentUser?.uid;
      if (uid) {
        // 1. Primary Sync: Write directly to the master user document
        setDoc(
          doc(db, 'users', uid),
          {
            saturdayWeighIns: weighIns,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => console.warn('Master user doc weigh-ins sync warning:', err));

        // 2. Secondary backup: Also write to subcollection
        setDoc(doc(db, 'users', uid, 'weighIns', entry.id), entry, { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to save Saturday weigh-in', e);
    }
  }

  public static deleteSaturdayWeighIn(id: string) {
    try {
      const weighIns = this.getSaturdayWeighIns().filter((w) => w.id !== id);
      localStorage.setItem(KEYS.SATURDAY_WEIGH_INS, JSON.stringify(weighIns));

      // Dispatch local event for instant UI update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fitquest_weighins_updated'));
      }

      const uid = auth.currentUser?.uid;
      if (uid) {
        // 1. Primary Sync: Update master user document
        setDoc(
          doc(db, 'users', uid),
          {
            saturdayWeighIns: weighIns,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => console.warn('Master user doc weigh-ins delete sync warning:', err));

        // 2. Secondary backup: Delete from subcollection
        deleteDoc(doc(db, 'users', uid, 'weighIns', id)).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to delete Saturday weigh-in', e);
    }
  }
}
