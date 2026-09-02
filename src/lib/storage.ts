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
} from '../types';
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
import { db, auth, deleteUser } from './firebase';
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
  THEME: 'fitquest_theme',
  LANG: 'fitquest_lang',
  SOUND: 'fitquest_sound_enabled',
  HIGH_CONTRAST: 'fitquest_high_contrast',
  TEXT_SIZE: 'fitquest_text_size',
  LAST_CLOUD_SYNC: 'fitquest_last_cloud_sync',
  LAST_RESET_AT: 'fitquest_last_reset_at',
  IS_OFFLINE: 'fitquest_is_offline',
  ACTIVE_SESSION: 'fitquest_active_session',
};

export class FitStorage {
  public static getUser(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : createFreshUser('guest_user', 'Atleta Nuevo');
    } catch {
      return createFreshUser('guest_user', 'Atleta Nuevo');
    }
  }

  public static saveUser(user: UserProfile) {
    try {
      const uid = auth.currentUser?.uid || (user.id && !user.id.startsWith('guest_') ? user.id : null);
      const userToSave: UserProfile = {
        ...user,
        ...(uid ? { id: uid } : {}),
      };
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  }

  public static async syncUserToCloud(user: UserProfile) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...user,
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
        weightKg: user.weightKg,
        targetWeightKg: user.targetWeightKg,
        name: user.name,
        avatar: user.avatar,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
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

      if (userSnap.exists()) {
        const cloudData = userSnap.data() as Partial<UserProfile>;
        const defaults = createFreshUser(uid, displayName || (email ? email.split('@')[0] : 'Atleta FitQuest'), email);
        const existingLocalUser = this.getUser();

        // Check if cloud has an active reset
        const localResetAt = localStorage.getItem(KEYS.LAST_RESET_AT);
        const cloudResetAt = cloudData.lastResetAt;
        const isCloudResetActive = Boolean(
          (cloudResetAt && (!localResetAt || new Date(cloudResetAt).getTime() >= new Date(localResetAt).getTime())) ||
          (cloudData.level === 1 && (cloudData.xp === 0 || !cloudData.xp) && existingLocalUser.level > 1)
        );

        if (isCloudResetActive) {
          if (cloudResetAt) localStorage.setItem(KEYS.LAST_RESET_AT, cloudResetAt);
          localStorage.removeItem(KEYS.HISTORY);
          localStorage.setItem('fitquest_claimed_challenges', JSON.stringify([]));
          this.saveHistory([]);
          this.saveAchievements(createFreshAchievements());
        }

        const mergedClaimed = isCloudResetActive
          ? (cloudData.claimedChallenges || [])
          : Array.from(new Set([
              ...(cloudData.claimedChallenges || []),
              ...(existingLocalUser.claimedChallenges || []),
            ]));

        const mergedBadges = isCloudResetActive
          ? (cloudData.unlockedBadges || [])
          : Array.from(new Set([
              ...(cloudData.unlockedBadges || []),
              ...(existingLocalUser.unlockedBadges || []),
              ...(defaults.unlockedBadges || []),
            ]));

        const maxLevel = isCloudResetActive
          ? (cloudData.level || 1)
          : Math.max(cloudData.level || 1, existingLocalUser.level || 1, defaults.level || 1);

        const maxTotalXp = isCloudResetActive
          ? (cloudData.xp || 0)
          : Math.max(cloudData.xp || 0, existingLocalUser.xp || 0);

        const effectiveCurrentLevelXp = isCloudResetActive
          ? (cloudData.currentLevelXp || 0)
          : (cloudData.xp !== undefined && cloudData.xp >= (existingLocalUser.xp || 0))
          ? (cloudData.currentLevelXp ?? existingLocalUser.currentLevelXp ?? defaults.currentLevelXp)
          : (existingLocalUser.currentLevelXp ?? defaults.currentLevelXp);

        const effectiveNextLevelXp = isCloudResetActive
          ? (cloudData.nextLevelXp || 500)
          : (cloudData.xp !== undefined && cloudData.xp >= (existingLocalUser.xp || 0))
          ? (cloudData.nextLevelXp || existingLocalUser.nextLevelXp || defaults.nextLevelXp)
          : (existingLocalUser.nextLevelXp || defaults.nextLevelXp);

        userProfile = {
          ...defaults,
          ...(isCloudResetActive ? {} : existingLocalUser),
          ...cloudData,
          id: uid,
          level: maxLevel,
          xp: maxTotalXp,
          currentLevelXp: effectiveCurrentLevelXp,
          nextLevelXp: effectiveNextLevelXp,
          name: cloudData.name || existingLocalUser.name || defaults.name,
          avatar: cloudData.avatar || existingLocalUser.avatar || defaults.avatar,
          rankTitle: cloudData.rankTitle || (isCloudResetActive ? 'Gladiador de Bronce' : (existingLocalUser.rankTitle || defaults.rankTitle)),
          weightKg: cloudData.weightKg ?? existingLocalUser.weightKg ?? defaults.weightKg,
          targetWeightKg: cloudData.targetWeightKg ?? existingLocalUser.targetWeightKg ?? defaults.targetWeightKg,
          claimedChallenges: mergedClaimed,
          claimedChallengesWeek: cloudData.claimedChallengesWeek || existingLocalUser.claimedChallengesWeek,
          unlockedBadges: mergedBadges,
          lastResetAt: cloudResetAt || (isCloudResetActive ? new Date().toISOString() : existingLocalUser.lastResetAt),
        };
        try {
          localStorage.setItem('fitquest_claimed_challenges', JSON.stringify(mergedClaimed));
        } catch {}

        // If local had a custom title or badges or higher XP without active reset, sync them to cloud
        if (!isCloudResetActive && (userProfile.rankTitle !== cloudData.rankTitle || userProfile.xp !== cloudData.xp || (userProfile.unlockedBadges?.length || 0) > (cloudData.unlockedBadges?.length || 0))) {
          this.syncUserToCloud(userProfile);
        }
      } else {
        // Brand-new user: initialize from zero
        userProfile = createFreshUser(uid, displayName || (email ? email.split('@')[0] : 'Nuevo Atleta'), email);
        await setDoc(userRef, {
          ...userProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Load history subcollection and merge safely with local history
      try {
        const historyRef = collection(db, 'users', uid, 'history');
        const q = query(historyRef, orderBy('date', 'desc'));
        const historySnap = await getDocs(q);
        if (!historySnap.empty) {
          historyEntries = historySnap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutHistoryEntry));
        }
      } catch (err) {
        console.warn('Could not load history subcollection', err);
      }

      const combinedHistoryMap = new Map<string, WorkoutHistoryEntry>();
      // Put Firestore entries first
      historyEntries.forEach(h => combinedHistoryMap.set(h.id, h));

      // Put local entries ONLY if cloud was not reset
      const localResetAt = localStorage.getItem(KEYS.LAST_RESET_AT);
      const isCloudReset = userProfile.lastResetAt && localResetAt && userProfile.lastResetAt === localResetAt && userProfile.level === 1 && userProfile.xp === 0;
      if (!isCloudReset) {
        const localHistory = this.getHistory();
        localHistory.forEach(h => {
          if (!combinedHistoryMap.has(h.id)) {
            combinedHistoryMap.set(h.id, h);
            // Sync missing entry to cloud
            try {
              const historyDocRef = doc(db, 'users', uid, 'history', h.id);
              setDoc(historyDocRef, { ...h, createdAt: h.date || new Date().toISOString() }, { merge: true });
            } catch {}
          }
        });
      }

      // Sanitize any historically corrupted distance/calorie entries from previous strength rowing bug
      const finalHistory = Array.from(combinedHistoryMap.values())
        .map((h) => {
          let cleanedKm = h.totalDistanceKm || 0;
          let cleanedCal = h.calories || 0;
          // If distance was inflated (> 30 km on a strength session)
          if (cleanedKm > 30 && !h.routineTitle?.toLowerCase().includes('maratón')) {
            cleanedKm = 0;
          }
          // If calories were inflated (> 1500 kcal on a single session)
          if (cleanedCal > 1500) {
            const minutes = h.durationMinutes || 45;
            const volume = h.totalVolumeKg || 0;
            cleanedCal = Math.round(minutes * 7.5 + (volume / 1000) * 8 + cleanedKm * 60);
          }
          const cleaned = {
            ...h,
            totalDistanceKm: cleanedKm,
            calories: cleanedCal,
          };
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
          totalWorkouts: finalHistory.length,
          totalVolumeKg: exactVolume,
          totalMinutes: exactMinutes,
          caloriesBurned: exactCalories,
          totalDistanceKm: exactDistance,
        },
      };

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
    } catch (e) {
      console.error('Failed to save routines', e);
    }
  }

  public static getPrograms(): WorkoutProgram[] {
    return defaultPrograms;
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
      current[progId] = Math.max(current[progId] || 0, dayNumber);
      localStorage.setItem('fitquest_program_progress', JSON.stringify(current));
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
      // Merge with fresh list so all 35 achievements are present and updated
      return fresh.map((base) => {
        const stored = parsedMap.get(base.id);
        if (!stored) return base;
        return {
          ...base,
          currentProgress: stored.currentProgress || 0,
          unlocked: stored.unlocked || false,
          unlockedAt: stored.unlockedAt,
        };
      });
    } catch {
      return createFreshAchievements();
    }
  }

  public static saveAchievements(achievements: Achievement[]) {
    try {
      localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
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

  public static getSmartwatch(): SmartwatchDevice {
    try {
      const data = localStorage.getItem(KEYS.SMARTWATCH);
      if (!data) return defaultSmartwatch;
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') return defaultSmartwatch;
      return {
        ...defaultSmartwatch,
        ...parsed,
        status: parsed.status || 'connected',
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
    } catch (e) {
      console.error('Failed to save active session', e);
    }
  }

  public static clearActiveSession() {
    try {
      localStorage.removeItem(KEYS.ACTIVE_SESSION);
    } catch (e) {
      console.error('Failed to clear active session', e);
    }
  }

  public static async addHistoryEntry(entry: WorkoutHistoryEntry, user?: UserProfile) {
    const history = this.getHistory();
    const updated = [entry, ...history.filter(h => h.id !== entry.id)];
    this.saveHistory(updated);

    // Save to Firestore if authenticated or has persistent user ID
    const uid = auth.currentUser?.uid || (user?.id && !user.id.startsWith('guest_') ? user.id : null);
    if (uid) {
      try {
        const historyDocRef = doc(db, 'users', uid, 'history', entry.id);
        await setDoc(historyDocRef, {
          ...entry,
          createdAt: entry.date || new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.error('Failed to save workout entry to Firestore', err);
      }
    }
  }

  public static addXp(amount: number, currentUser?: UserProfile): UserProfile {
    const user = currentUser || this.getUser();
    let currentXp = user.currentLevelXp + amount;
    let nextXp = user.nextLevelXp;
    let level = user.level;
    const rankTitle = user.rankTitle || 'Recluta Inicial';

    while (currentXp >= nextXp) {
      currentXp -= nextXp;
      level += 1;
      nextXp = Math.round(nextXp * 1.3);
    }

    const updatedUser: UserProfile = {
      ...user,
      level,
      xp: user.xp + amount,
      currentLevelXp: currentXp,
      nextLevelXp: nextXp,
      rankTitle,
      attributes: {
        strength: Math.min(100, user.attributes.strength + Math.floor(amount / 300)),
        endurance: Math.min(100, user.attributes.endurance + Math.floor(amount / 350)),
        agility: Math.min(100, user.attributes.agility + Math.floor(amount / 400)),
        discipline: Math.min(100, user.attributes.discipline + Math.floor(amount / 250)),
      },
    };

    this.saveUser(updatedUser);
    return updatedUser;
  }

  public static claimWeeklyChallenge(challengeId: string, rewardXp: number, currentUser?: UserProfile): UserProfile {
    const user = currentUser || this.getUser();
    const existing = user.claimedChallenges || [];
    if (existing.includes(challengeId)) {
      return user;
    }
    const updatedClaimed = [...existing, challengeId];

    let currentXp = user.currentLevelXp + rewardXp;
    let nextXp = user.nextLevelXp;
    let level = user.level;
    const rankTitle = user.rankTitle || 'Recluta Inicial';

    while (currentXp >= nextXp) {
      currentXp -= nextXp;
      level += 1;
      nextXp = Math.round(nextXp * 1.3);
    }

    const updatedUser: UserProfile = {
      ...user,
      level,
      xp: user.xp + rewardXp,
      currentLevelXp: currentXp,
      nextLevelXp: nextXp,
      rankTitle,
      claimedChallenges: updatedClaimed,
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
      exportVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      routines: this.getRoutines(),
      challenges: this.getChallenges(),
      achievements: this.getAchievements(),
      leaderboard: this.getLeaderboard(),
      smartwatch: this.getSmartwatch(),
      reminders: this.getReminders(),
      history: this.getHistory(),
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
      nextLevelXp: 500,
      rankTitle: 'Gladiador de Bronce',
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
    };

    // 1. Reset local storage
    this.saveUser(freshUser);
    this.saveHistory([]);
    try {
      localStorage.setItem(KEYS.LAST_RESET_AT, resetTimestamp);
      localStorage.removeItem(KEYS.HISTORY);
      localStorage.setItem('fitquest_claimed_challenges', JSON.stringify([]));
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

    // 2. Clear cloud Firestore if user is authenticated
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, {
          ...freshUser,
          updatedAt: resetTimestamp,
          lastResetAt: resetTimestamp,
        });

        // Clear history subcollection in cloud
        const historyCol = collection(db, 'users', currentUser.uid, 'history');
        const historySnap = await getDocs(historyCol);
        for (const docSnap of historySnap.docs) {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'history', docSnap.id));
        }
      } catch (err) {
        console.warn('Cloud reset warning:', err);
      }
    }

    return freshUser;
  }

  public static async deleteUserAccountAndData(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // 1. Delete Firestore user document
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await deleteDoc(userDocRef);
        } catch (dbErr) {
          console.warn('Firestore doc deletion warning:', dbErr);
        }
        // 2. Delete Firebase Auth account
        await deleteUser(currentUser);
      }
      // 3. Clear all Local Storage keys
      localStorage.clear();
      return true;
    } catch (err) {
      console.error('Failed to fully delete account from auth:', err);
      localStorage.clear();
      return false;
    }
  }
}
