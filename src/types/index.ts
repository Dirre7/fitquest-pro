export type Language = 'es' | 'en' | 'pt' | 'fr' | 'de';

export type ThemeMode = 'cyberpunk' | 'oled' | 'dark' | 'light';

export type League = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Titan';

export interface UserStats {
  totalWorkouts: number;
  totalVolumeKg: number;
  totalDistanceKm: number;
  totalMinutes: number;
  caloriesBurned: number;
  currentStreak: number;
  bestStreak: number;
  duelsWon: number;
  challengesCompleted: number;
}

export interface UserAttributes {
  strength: number; // 1-100
  endurance: number; // 1-100
  agility: number; // 1-100
  discipline: number; // 1-100
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  rankTitle: string;
  league: League;
  leaguePoints: number;
  stats: UserStats;
  attributes: UserAttributes;
  unlockedBadges: string[];
  joinedAt: string;
  weightKg: number;
  targetWeightKg: number;
  claimedChallenges?: string[];
  claimedChallengesWeek?: string;
  lastResetAt?: string;
  programProgress?: { [progId: string]: number };
  activeSession?: ActiveWorkoutState | null;
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  targetReps: number;
  actualReps: number;
  targetWeightKg: number;
  actualWeightKg: number;
  targetDistanceKm?: number;
  actualDistanceKm?: number;
  targetDurationSeconds?: number;
  actualDurationSeconds?: number;
  paceMinKm?: string;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  isWarmup?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  type?: 'strength' | 'cardio' | 'hiit' | 'mobility';
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body' | 'Cardio';
  equipment: 'Barbell' | 'Dumbbell' | 'Bodyweight' | 'Cable' | 'Machine' | 'Kettlebell' | 'None';
  sets: ExerciseSet[];
  restSeconds: number;
  prKg?: number;
  prDistanceKm?: number;
  instructions?: string;
  tip?: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  description: string;
  category: 'Strength' | 'Hypertrophy' | 'HIIT' | 'Calisthenics' | 'Cardio' | 'Mobility';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  durationMinutes: number;
  estimatedCalories: number;
  xpReward: number;
  exercises: Exercise[];
  targetMuscles: string[];
  tags: string[];
  isCustom?: boolean;
  programId?: string;
  programDayNumber?: number;
}

export interface ProgramDay {
  dayNumber: number;
  title: string;
  focus: string;
  routine: WorkoutRoutine;
  completed?: boolean;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  daysPerWeek: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  category: 'Strength' | 'Hypertrophy' | 'HIIT' | 'Calisthenics' | 'Cardio' | 'Hybrid';
  targetMuscles: string[];
  xpReward: number;
  days: ProgramDay[];
}

export interface ActiveWorkoutState {
  routineId: string;
  routineTitle: string;
  routineCategory?: string;
  startTime: number;
  elapsedSeconds: number;
  currentExerciseIndex: number;
  exercises: Exercise[];
  isResting: boolean;
  restTimeRemaining: number;
  totalRestTime: number;
  isPaused: boolean;
  liveHeartRate: number;
  activeCalories: number;
  notes: string;
}

export interface WorkoutHistoryEntry {
  id: string;
  routineId: string;
  routineTitle: string;
  date: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalDistanceKm?: number;
  averagePace?: string;
  cardioMinutes?: number;
  calories: number;
  avgHeartRate: number;
  maxHeartRate: number;
  xpEarned: number;
  completedExercises: number;
  rating: number; // 1-5
  notes?: string;
}

export interface SmartwatchDevice {
  id: string;
  name: string;
  brand: 'Apple Watch' | 'Garmin' | 'Fitbit' | 'Galaxy Watch' | 'Polar' | 'WebBluetooth';
  status: 'connected' | 'disconnected' | 'pairing';
  batteryLevel: number;
  liveHeartRate: number;
  hrvMs: number; // Heart Rate Variability
  activeZone: 'Rest' | 'WarmUp' | 'FatBurn' | 'Cardio' | 'Peak';
  stepsToday: number;
  vo2max: number;
  lastSyncTime: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  category: 'steps' | 'volume' | 'workouts' | 'calories' | 'reps' | 'distance';
  goalTarget: number;
  currentProgress: number;
  unit: string;
  participantsCount: number;
  daysRemaining: number;
  rewardXp: number;
  rewardBadge: string;
  joined: boolean;
  leaderboardTop: {
    userId: string;
    name: string;
    avatar: string;
    score: number;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'strength' | 'consistency' | 'speed' | 'social' | 'master';
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Titan';
  currentProgress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  rewardTitle?: string;
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  level: number;
  xpEarned: number;
  streakDays: number;
  league: League;
  workoutsThisWeek: number;
  isFriend?: boolean;
  isCurrentUser?: boolean;
}

export interface LiveParticipant {
  id: string;
  name: string;
  avatar: string;
  level: number;
  currentReps: number;
  heartRate: number;
  status: 'active' | 'resting' | 'finished';
  reaction?: string;
}

export interface LiveDuelRoom {
  id: string;
  name: string;
  hostName: string;
  mode: 'Pushup Showdown' | 'HIIT Blitz' | 'Squat Storm' | 'Core Inferno';
  targetReps: number;
  timeLimitSeconds: number;
  participants: LiveParticipant[];
  status: 'lobby' | 'in_progress' | 'finished';
}

export interface PushReminder {
  id: string;
  type: 'workout' | 'hydration' | 'streak_save' | 'weekly_challenge' | 'recovery';
  title: string;
  message: string;
  time: string; // e.g. "08:00"
  days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  enabled: boolean;
}

export interface CloudSyncInfo {
  isOffline: boolean;
  lastSyncedAt: string;
  pendingChanges: number;
  autoSync: boolean;
  connectedDevices: {
    id: string;
    name: string;
    type: 'Mobile' | 'Tablet' | 'Desktop' | 'Watch';
    lastActive: string;
  }[];
}
