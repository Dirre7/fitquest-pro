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
      const currentAuthUser = auth.currentUser;
      const userToSave: UserProfile = {
        ...user,
        ...(currentAuthUser ? { id: currentAuthUser.uid } : {}),
      };
      localStorage.setItem(KEYS.USER, JSON.stringify(userToSave));
      // Auto-sync to firestore if logged in
      if (currentAuthUser) {
        this.syncUserToCloud(userToSave).catch((err) => {
          console.error('Firestore auto-sync error:', err);
        });
      }
    } catch (e) {
      console.error('Failed to save user', e);
    }
  }

  public static async syncUserToCloud(user: UserProfile) {
    try {
      const currentAuthUser = auth.currentUser;
      if (!currentAuthUser) return;
      const userRef = doc(db, 'users', currentAuthUser.uid);
      await setDoc(userRef, {
        ...user,
        id: currentAuthUser.uid,
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
        userProfile = {
          ...defaults,
          ...cloudData,
          id: uid,
          name: cloudData.name || defaults.name,
          avatar: cloudData.avatar || defaults.avatar,
          rankTitle: cloudData.rankTitle || defaults.rankTitle,
          weightKg: cloudData.weightKg ?? defaults.weightKg,
          targetWeightKg: cloudData.targetWeightKg ?? defaults.targetWeightKg,
          claimedChallenges: cloudData.claimedChallenges || [],
          claimedChallengesWeek: cloudData.claimedChallengesWeek,
        };
        try {
          localStorage.setItem('fitquest_claimed_challenges', JSON.stringify(userProfile.claimedChallenges || []));
        } catch {}
      } else {
        // Brand-new user: initialize from zero
        userProfile = createFreshUser(uid, displayName || (email ? email.split('@')[0] : 'Nuevo Atleta'), email);
        await setDoc(userRef, {
          ...userProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Load history subcollection
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

      // Update local storage with cloud user
      this.saveUser(userProfile);
      this.saveHistory(historyEntries);

      return {
        user: userProfile,
        history: historyEntries,
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
    const updated = [entry, ...history];
    this.saveHistory(updated);

    // Save to Firestore if authenticated
    if (auth.currentUser) {
      try {
        const historyRef = collection(db, 'users', auth.currentUser.uid, 'history');
        await addDoc(historyRef, {
          ...entry,
          createdAt: new Date().toISOString(),
        });
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
    let rankTitle = user.rankTitle;

    while (currentXp >= nextXp) {
      currentXp -= nextXp;
      level += 1;
      nextXp = Math.round(nextXp * 1.3);

      // Rank titles upgrades
      if (level >= 30) rankTitle = 'Titán Olímpico Élite';
      else if (level >= 25) rankTitle = 'Leyenda Inmortal';
      else if (level >= 20) rankTitle = 'Maestro de la Fuerza';
      else if (level >= 15) rankTitle = 'Guerrero de Hierro';
      else if (level >= 10) rankTitle = 'Atleta Vanguardia';
      else if (level >= 5) rankTitle = 'Gladiador de Bronce';
      else rankTitle = 'Recluta Inicial';
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
