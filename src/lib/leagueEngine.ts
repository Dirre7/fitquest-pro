import { UserProfile, LeaderboardUser, League, WorkoutHistoryEntry } from '../types';
import { FitStorage } from './storage';

export const LEAGUE_HIERARCHY: League[] = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Titan'];

export interface WeeklyCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isPastSunday: boolean;
}

/**
 * Returns current ISO week string, e.g. "2026-W36"
 */
export function getCurrentWeekIdentifier(): string {
  const d = new Date();
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

/**
 * Calculates countdown until next Sunday 23:59:59 local time
 */
export function getCountdownToSunday(): WeeklyCountdown {
  const now = new Date();
  const nextSunday = new Date(now);
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(23, 59, 59, 999);

  const diffMs = nextSunday.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, formatted: 'Finalizada', isPastSunday: true };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  const formatted = `${days}d ${hours}h ${minutes}m`;
  return { days, hours, minutes, seconds, formatted, isPastSunday: false };
}

/**
 * Calculates XP earned by user in the current week
 */
export function calculateUserWeeklyXp(user: UserProfile, history: WorkoutHistoryEntry[]): number {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // 1 (Mon) to 7 (Sun)
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const thisWeekHistory = history.filter((h) => {
    const entryDate = new Date(h.date);
    return entryDate >= monday;
  });

  const xpFromWorkouts = thisWeekHistory.reduce((sum, h) => sum + (h.xpEarned || 0), 0);
  return Math.max(user.leaguePoints || 0, xpFromWorkouts);
}

/**
 * Pre-calibrated competitors for each league
 */
export const LEAGUE_BOTS: Record<League, Omit<LeaderboardUser, 'rank'>[]> = {
  Bronze: [
    { userId: 'bot_b1', name: 'Sergio_Rookie', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', level: 3, xpEarned: 420, streakDays: 3, league: 'Bronze', workoutsThisWeek: 2, rankTitle: 'Iniciado', achievementsUnlockedCount: 4, totalVolumeKg: 4200, totalDistanceKm: 6.5, topBadges: ['🌱 Primer Paso', '🔥 Racha 3 Días'], bio: 'Iniciando mi camino fitness hacia la mejor versión de mí mismo.', followingCount: 6, followersCount: 4 },
    { userId: 'bot_b2', name: 'Laura_Fit', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', level: 2, xpEarned: 310, streakDays: 2, league: 'Bronze', workoutsThisWeek: 1, rankTitle: 'Persistente', achievementsUnlockedCount: 3, totalVolumeKg: 2800, totalDistanceKm: 5.0, topBadges: ['🏃 Primeros 5K', '⚡ Chispa Inicial'], bio: 'Amante del cardio matutino y las rutinas funcionales.', followingCount: 8, followersCount: 6 },
    { userId: 'bot_b3', name: 'Pablo_Gym', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', level: 2, xpEarned: 220, streakDays: 1, league: 'Bronze', workoutsThisWeek: 1, rankTitle: 'Disciplinado', achievementsUnlockedCount: 2, totalVolumeKg: 3500, totalDistanceKm: 2.0, topBadges: ['🏋️ Primer PR'], bio: 'Entrenando fuerza para ganar masa muscular.', followingCount: 4, followersCount: 3 },
    { userId: 'bot_b4', name: 'Ana_Runner', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100', level: 1, xpEarned: 130, streakDays: 1, league: 'Bronze', workoutsThisWeek: 1, rankTitle: 'Paso Ligero', achievementsUnlockedCount: 2, totalVolumeKg: 800, totalDistanceKm: 4.5, topBadges: ['🏃 1 Km Carrera'], bio: 'Preparando mi primera carrera popular de 5K.', followingCount: 3, followersCount: 2 },
    { userId: 'bot_b5', name: 'Carlos_Init', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', level: 1, xpEarned: 60, streakDays: 0, league: 'Bronze', workoutsThisWeek: 0, rankTitle: 'Novato', achievementsUnlockedCount: 1, totalVolumeKg: 1200, totalDistanceKm: 1.0, topBadges: ['🌱 Iniciado'], bio: 'Primeros días en el gimnasio aprendiendo la técnica.', followingCount: 2, followersCount: 1 },
  ],
  Silver: [
    { userId: 'bot_s1', name: 'Marcos_Iron', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', level: 8, xpEarned: 980, streakDays: 6, league: 'Silver', workoutsThisWeek: 4, rankTitle: 'Coloso de Acero', achievementsUnlockedCount: 14, totalVolumeKg: 28500, totalDistanceKm: 18.0, topBadges: ['🛡️ 10k Toneladas', '🔥 Semana Hierro', '⚡ HIIT Máster'], bio: 'Dedicado al entrenamiento híbrido: fuerza pesada y sprints.', followingCount: 15, followersCount: 18 },
    { userId: 'bot_s2', name: 'Clara_Lift', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', level: 7, xpEarned: 840, streakDays: 5, league: 'Silver', workoutsThisWeek: 3, rankTitle: 'Pectoral Blindado', achievementsUnlockedCount: 11, totalVolumeKg: 19000, totalDistanceKm: 12.0, topBadges: ['🏋️ Banca Pro', '💪 Fondos Hierro'], bio: 'Powerbuilding y calistenia. Sin excusas ningún día.', followingCount: 12, followersCount: 14 },
    { userId: 'bot_s3', name: 'Javier_Beast', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 6, xpEarned: 690, streakDays: 4, league: 'Silver', workoutsThisWeek: 3, rankTitle: 'Constante', achievementsUnlockedCount: 9, totalVolumeKg: 14500, totalDistanceKm: 10.0, topBadges: ['🔥 Racha 7 Días', '⚡ Horno 5k kcal'], bio: 'Enfoque en hipertrofia y buena nutrición deportiva.', followingCount: 10, followersCount: 11 },
    { userId: 'bot_s4', name: 'Sara_Cross', avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed2c64ee?w=100', level: 6, xpEarned: 580, streakDays: 3, league: 'Silver', workoutsThisWeek: 2, rankTitle: 'Devorador Asfalto', achievementsUnlockedCount: 8, totalVolumeKg: 9500, totalDistanceKm: 15.0, topBadges: ['🏃 Atleta 10K', '⌚ Bio-Sincro'], bio: 'Cross-training y carreras de media distancia.', followingCount: 9, followersCount: 8 },
    { userId: 'bot_s5', name: 'Hugo_Fit', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', level: 5, xpEarned: 490, streakDays: 2, league: 'Silver', workoutsThisWeek: 2, rankTitle: 'Disciplinado', achievementsUnlockedCount: 7, totalVolumeKg: 11000, totalDistanceKm: 8.0, topBadges: ['🎖️ 10 Entrenos', '🔥 Racha Bronce'], bio: 'Mejorando mi técnica en sentadillas y peso muerto.', followingCount: 8, followersCount: 7 },
  ],
  Gold: [
    { userId: 'bot_g1', name: 'Valeria_Iron', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', level: 16, xpEarned: 2150, streakDays: 14, league: 'Gold', workoutsThisWeek: 6, rankTitle: 'Levantador Titánico', achievementsUnlockedCount: 28, totalVolumeKg: 85000, totalDistanceKm: 42.0, topBadges: ['🥇 50 Toneladas', '👑 Quincena Imparable', '🏃 Medio Maratón'], bio: 'Atleta apasionada del powerlifting y la disciplina inquebrantable.', followingCount: 24, followersCount: 38 },
    { userId: 'bot_g2', name: 'Diego_Beast', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 14, xpEarned: 1890, streakDays: 10, league: 'Gold', workoutsThisWeek: 5, rankTitle: 'Poder Centenario', achievementsUnlockedCount: 24, totalVolumeKg: 68000, totalDistanceKm: 32.0, topBadges: ['🏋️ Club 100kg', '💥 Espalda Titanio'], bio: 'Entrenamiento de fuerza puro y duro. Superando mis marcas.', followingCount: 20, followersCount: 29 },
    { userId: 'bot_g3', name: 'Lucas_Vanguard', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', level: 13, xpEarned: 1640, streakDays: 8, league: 'Gold', workoutsThisWeek: 5, rankTitle: 'Fondista de Acero', achievementsUnlockedCount: 22, totalVolumeKg: 42000, totalDistanceKm: 55.0, topBadges: ['🏃 21k Fondista', '⚡ Fénix 10k kcal'], bio: 'Corredor de fondo y apasionado de la resistencia aeróbica.', followingCount: 18, followersCount: 22 },
    { userId: 'bot_g4', name: 'Camila_Power', avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed2c64ee?w=100', level: 12, xpEarned: 1410, streakDays: 7, league: 'Gold', workoutsThisWeek: 4, rankTitle: 'Guerrero Espartano', achievementsUnlockedCount: 19, totalVolumeKg: 52000, totalDistanceKm: 25.0, topBadges: ['🔥 10 Sesiones HIIT', '💪 Tríceps Titánico'], bio: 'Entrenamientos de alta intensidad y acondicionamiento metabólico.', followingCount: 16, followersCount: 19 },
    { userId: 'bot_g5', name: 'Mateo_Runner', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', level: 11, xpEarned: 1250, streakDays: 6, league: 'Gold', workoutsThisWeek: 4, rankTitle: 'Centurión del Gym', achievementsUnlockedCount: 17, totalVolumeKg: 38000, totalDistanceKm: 48.0, topBadges: ['🎖️ 25 Entrenos', '🏃 Flecha Veloz'], bio: 'Constancia diaria para mantener el ritmo alto en cada sesión.', followingCount: 14, followersCount: 15 },
  ],
  Diamond: [
    { userId: 'bot_d1', name: 'Hector_Titan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', level: 25, xpEarned: 4100, streakDays: 28, league: 'Diamond', workoutsThisWeek: 7, rankTitle: 'Mente de Diamante', achievementsUnlockedCount: 45, totalVolumeKg: 190000, totalDistanceKm: 95.0, topBadges: ['💎 21 Días Hábito', '👑 Maratón 42k', '🏋️ 100k Toneladas'], bio: 'Entrenar no es un deber, es mi estilo de vida. Liga Diamante.', followingCount: 35, followersCount: 82 },
    { userId: 'bot_d2', name: 'Paula_Apex', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', level: 23, xpEarned: 3650, streakDays: 22, league: 'Diamond', workoutsThisWeek: 6, rankTitle: 'Hércules del Hierro', achievementsUnlockedCount: 41, totalVolumeKg: 165000, totalDistanceKm: 80.0, topBadges: ['👑 Hércules Hierro', '⚡ Volcán 25k kcal'], bio: 'Superando barreras físicas cada semana. Buscando el ascenso a Titán.', followingCount: 30, followersCount: 65 },
    { userId: 'bot_d3', name: 'Adrian_Legend', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', level: 22, xpEarned: 3200, streakDays: 19, league: 'Diamond', workoutsThisWeek: 6, rankTitle: 'Centurión Asfalto', achievementsUnlockedCount: 38, totalVolumeKg: 120000, totalDistanceKm: 110.0, topBadges: ['🏃 100k Asfalto', '🎯 Gacela 10k'], bio: 'Maratoniano y triatleta. La resistencia es mi mayor virtud.', followingCount: 28, followersCount: 54 },
    { userId: 'bot_d4', name: 'Monica_Vanguard', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', level: 21, xpEarned: 2900, streakDays: 16, league: 'Diamond', workoutsThisWeek: 5, rankTitle: 'Estratega PPL', achievementsUnlockedCount: 35, totalVolumeKg: 140000, totalDistanceKm: 65.0, topBadges: ['👑 Maestro PPL', '💪 Espalda Alada'], bio: 'Programación científica del entrenamiento y sobrecarga progresiva.', followingCount: 25, followersCount: 49 },
    { userId: 'bot_d5', name: 'Ruben_Elite', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', level: 20, xpEarned: 2600, streakDays: 14, league: 'Diamond', workoutsThisWeek: 5, rankTitle: 'Gladiador Élite', achievementsUnlockedCount: 32, totalVolumeKg: 130000, totalDistanceKm: 70.0, topBadges: ['👑 Nivel 20', '🛡️ Guerrero 24/7'], bio: 'Firme en el podio. Disciplina y superación continua.', followingCount: 22, followersCount: 40 },
  ],
  Titan: [
    { userId: 'bot_t1', name: 'Kratos_Gym', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 38, xpEarned: 7800, streakDays: 60, league: 'Titan', workoutsThisWeek: 8, rankTitle: 'Inquebrantable', achievementsUnlockedCount: 75, totalVolumeKg: 450000, totalDistanceKm: 210.0, topBadges: ['💎 30 Días Racha', '👑 250k Toneladas', '👑 Rey Sentadilla 200kg'], bio: 'El dolor es temporal, la gloria es eterna. Rey de la Liga Titán.', followingCount: 50, followersCount: 240 },
    { userId: 'bot_t2', name: 'Athena_Olympus', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', level: 35, xpEarned: 6900, streakDays: 45, league: 'Titan', workoutsThisWeek: 7, rankTitle: 'Titán Inamovible', achievementsUnlockedCount: 68, totalVolumeKg: 380000, totalDistanceKm: 180.0, topBadges: ['👑 Señor Peso Muerto', '💎 Monje Forja 60d'], bio: 'Fuerza mitológica y constancia de acero. Ningún día de descanso.', followingCount: 42, followersCount: 195 },
    { userId: 'bot_t3', name: 'Thor_Colossus', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', level: 32, xpEarned: 5800, streakDays: 35, league: 'Titan', workoutsThisWeek: 7, rankTitle: 'Volcán Humano', achievementsUnlockedCount: 60, totalVolumeKg: 320000, totalDistanceKm: 150.0, topBadges: ['⚡ Infierno 50k kcal', '👑 Pectoral 140kg'], bio: 'Moviendo montañas cada sesión. El poder del rayo en cada levantamiento.', followingCount: 38, followersCount: 160 },
    { userId: 'bot_t4', name: 'Valkyrie_Fit', avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed2c64ee?w=100', level: 30, xpEarned: 5100, streakDays: 30, league: 'Titan', workoutsThisWeek: 6, rankTitle: 'Polifacético Total', achievementsUnlockedCount: 54, totalVolumeKg: 260000, totalDistanceKm: 190.0, topBadges: ['👑 Maratoniano 42k', '🥋 Maestro Calistenia'], bio: 'Atleta híbrida élite. Dominio absoluto de barra, asfalto y hierro.', followingCount: 35, followersCount: 140 },
    { userId: 'bot_t5', name: 'Ares_Unstoppable', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', level: 29, xpEarned: 4600, streakDays: 25, league: 'Titan', workoutsThisWeek: 6, rankTitle: 'Veterano Supremo', achievementsUnlockedCount: 48, totalVolumeKg: 240000, totalDistanceKm: 130.0, topBadges: ['🎖️ 50 Misiones', '👑 Maestro Planes 10'], bio: 'Veterano de guerra en el gimnasio. Cada serie al fallo.', followingCount: 30, followersCount: 125 },
  ]
};

/**
 * Builds the complete leaderboard for any league, dynamically injecting the real current user
 */
export function getLeagueLeaderboard(
  league: League,
  user: UserProfile,
  weeklyXp: number,
  history: WorkoutHistoryEntry[]
): LeaderboardUser[] {
  const bots = LEAGUE_BOTS[league] || LEAGUE_BOTS['Bronze'];
  let list: LeaderboardUser[] = bots.map((b, i) => ({
    ...b,
    rank: i + 1,
  }));

  // If user belongs to this league, inject user into the list
  if (user.league === league) {
    const workoutsThisWeek = history.filter((h) => {
      const d = new Date(h.date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    const totalVolume = history.reduce((sum, h) => sum + (h.totalVolumeKg || 0), 0);
    const totalDistance = history.reduce((sum, h) => sum + (h.totalDistanceKm || 0), 0);
    const achievements = FitStorage.getAchievements();
    const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

    const currentUserEntry: LeaderboardUser = {
      rank: 1,
      userId: user.id,
      name: `${user.name} (Tú)`,
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
      level: user.level,
      xpEarned: weeklyXp,
      streakDays: user.stats.currentStreak || 0,
      league: user.league,
      workoutsThisWeek,
      isCurrentUser: true,
      rankTitle: user.rankTitle || 'Atleta en Forja',
      achievementsUnlockedCount: unlockedAchievementsCount,
      totalVolumeKg: totalVolume,
      totalDistanceKm: totalDistance,
      topBadges: user.unlockedBadges && user.unlockedBadges.length > 0 ? user.unlockedBadges.slice(0, 3) : ['⚔️ Guerrero Activo', '🔥 Racha en Marcha'],
      bio: user.bio || 'Entrenando duro en FitQuest Pro para conquistar el podio.',
      followingCount: (user.following || []).length,
      followersCount: (user.followers || []).length || 3,
    };

    list = [...list.filter((u) => u.userId !== user.id), currentUserEntry];
  }

  // Sort by weekly XP earned descending
  list.sort((a, b) => b.xpEarned - a.xpEarned);

  // Assign sequential 1-indexed ranks
  return list.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

export interface LeagueEvaluationResult {
  hasEvaluated: boolean;
  status: 'promoted' | 'demoted' | 'retained';
  previousLeague: League;
  newLeague: League;
  rewardXp: number;
  message: string;
}

/**
 * Evaluates weekly reset on app startup. If a new week has started, promotes/demotes based on rank.
 */
export function evaluateWeeklyLeagueReset(
  user: UserProfile,
  history: WorkoutHistoryEntry[]
): { updatedUser: UserProfile; result: LeagueEvaluationResult | null } {
  const currentWeek = getCurrentWeekIdentifier();
  const lastProcessed = localStorage.getItem('fitquest_last_league_week');

  if (!lastProcessed) {
    localStorage.setItem('fitquest_last_league_week', currentWeek);
    return { updatedUser: user, result: null };
  }

  if (lastProcessed === currentWeek) {
    return { updatedUser: user, result: null };
  }

  // A new week started! Evaluate previous week's performance
  const weeklyXp = calculateUserWeeklyXp(user, history);
  const board = getLeagueLeaderboard(user.league, user, weeklyXp, history);
  const userRank = board.find((u) => u.isCurrentUser)?.rank || board.length;

  const currentLeagueIdx = LEAGUE_HIERARCHY.indexOf(user.league);
  let newLeague = user.league;
  let status: 'promoted' | 'demoted' | 'retained' = 'retained';
  let rewardXp = 0;
  let message = `Has mantenido tu posición en la Liga ${user.league}. ¡Comienza una nueva semana de competencia!`;

  if (userRank <= 3 && currentLeagueIdx < LEAGUE_HIERARCHY.length - 1) {
    // Promotion!
    newLeague = LEAGUE_HIERARCHY[currentLeagueIdx + 1];
    status = 'promoted';
    rewardXp = 350;
    message = `🏆 ¡Ascenso de Liga! Quedaste en el puesto #${userRank} y has ascendido a la Liga ${newLeague}. ¡Recompensa de +350 XP!`;
  } else if (userRank >= 5 && currentLeagueIdx > 0) {
    // Demotion
    newLeague = LEAGUE_HIERARCHY[currentLeagueIdx - 1];
    status = 'demoted';
    message = `Has descendido a la Liga ${newLeague}. ¡Esta semana es tu oportunidad de remontar!`;
  }

  // Update user with new league, reset league points, and reset claimed weekly challenges
  const updatedUser: UserProfile = {
    ...user,
    league: newLeague,
    leaguePoints: 0,
    claimedChallenges: [],
    claimedChallengesWeek: currentWeek,
    xp: user.xp + rewardXp,
  };

  FitStorage.saveUser(updatedUser);
  localStorage.setItem('fitquest_last_league_week', currentWeek);
  localStorage.removeItem('fitquest_claimed_challenges');

  return {
    updatedUser,
    result: {
      hasEvaluated: true,
      status,
      previousLeague: user.league,
      newLeague,
      rewardXp,
      message,
    },
  };
}

/**
 * Calculates real calendar daily streak based on unique workout dates and shield protected dates.
 */
export function calculateRealStreak(
  history: WorkoutHistoryEntry[],
  shieldUsedDates: string[] = []
): { currentStreak: number; bestStreak: number } {
  const safeHistory = history || [];
  const safeShields = Array.isArray(shieldUsedDates) ? shieldUsedDates : [];

  if (safeHistory.length === 0 && safeShields.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Get unique sorted dates in descending order (YYYY-MM-DD), combining workouts + shield-protected rest days
  const uniqueDates = Array.from(
    new Set([
      ...safeHistory.map((h) => (h.date ? h.date.split('T')[0] : '')),
      ...safeShields.map((d) => (d ? d.split('T')[0] : '')),
    ].filter((d) => Boolean(d)))
  ).sort().reverse();

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const mostRecentDate = uniqueDates[0];
  const isStreakActive = mostRecentDate === todayStr || mostRecentDate === yesterdayStr;

  let currentStreak = 0;
  if (isStreakActive) {
    currentStreak = 1;
    let checkDate = new Date(mostRecentDate);
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const expectedPrevStr = prevDate.toISOString().split('T')[0];
      if (uniqueDates[i] === expectedPrevStr) {
        currentStreak++;
        checkDate = prevDate;
      } else {
        break;
      }
    }
  }

  // Calculate best streak historically across all date chains
  let bestStreak = currentStreak;
  let runningChain = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const next = new Date(uniqueDates[i + 1]);
    const diffDays = Math.round((current.getTime() - next.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      runningChain++;
      if (runningChain > bestStreak) bestStreak = runningChain;
    } else {
      runningChain = 1;
    }
  }

  return { currentStreak, bestStreak: Math.max(1, bestStreak) };
}

/**
 * Automatically checks if the user missed yesterday and had an active streak.
 * If user has streakShields > 0, it consumes 1 shield to protect the streak.
 */
export function checkAndApplyStreakShield(
  user: UserProfile,
  history: WorkoutHistoryEntry[]
): { updatedUser: UserProfile; shieldConsumed: boolean; consumedDate?: string } {
  const currentShields = user.streakShields ?? 0;
  const currentShieldDates = Array.isArray(user.shieldUsedDates) ? [...user.shieldUsedDates] : [];

  if (currentShields <= 0) {
    return { updatedUser: user, shieldConsumed: false };
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const loggedDates = new Set(
    (history || [])
      .map((h) => (h.date ? h.date.split('T')[0] : ''))
      .filter(Boolean)
  );

  // If user already logged a workout yesterday or yesterday is already shielded, nothing to consume
  if (loggedDates.has(yesterdayStr) || currentShieldDates.includes(yesterdayStr)) {
    return { updatedUser: user, shieldConsumed: false };
  }

  // Check if shielding yesterday preserves a positive streak
  const streakWithoutShield = calculateRealStreak(history, currentShieldDates);
  const streakWithYesterday = calculateRealStreak(history, [...currentShieldDates, yesterdayStr]);

  if (streakWithYesterday.currentStreak > 0 && streakWithYesterday.currentStreak > streakWithoutShield.currentStreak) {
    const updatedDates = [...currentShieldDates, yesterdayStr];
    const updatedUser: UserProfile = {
      ...user,
      streakShields: Math.max(0, currentShields - 1),
      shieldUsedDates: updatedDates,
      stats: {
        ...user.stats,
        currentStreak: streakWithYesterday.currentStreak,
        bestStreak: Math.max(user.stats?.bestStreak || 0, streakWithYesterday.bestStreak),
      },
    };
    return { updatedUser, shieldConsumed: true, consumedDate: yesterdayStr };
  }

  return { updatedUser: user, shieldConsumed: false };
}

export interface AttributeSourceItem {
  label: string;
  rawMetric: string;
  pointsAdded: number;
}

export interface SingleAttributeBreakdown {
  key: 'strength' | 'endurance' | 'agility' | 'discipline';
  name: string;
  code: 'PWR' | 'END' | 'AGI' | 'DIS';
  score: number;
  tierLabel: 'Bronce' | 'Plata' | 'Oro' | 'Élite' | 'Leyenda';
  tierColorClass: string;
  bonusPct: number;
  bonusDescription: string;
  summary: string;
  howToImprove: string;
  sources: AttributeSourceItem[];
}

export interface AthleteAttributesBreakdown {
  attributes: {
    strength: number;
    endurance: number;
    agility: number;
    discipline: number;
  };
  overall: number;
  overallTierLabel: 'Bronce' | 'Plata' | 'Oro' | 'Élite' | 'Leyenda';
  archetype: {
    name: string;
    icon: string;
    description: string;
  };
  details: {
    strength: SingleAttributeBreakdown;
    endurance: SingleAttributeBreakdown;
    agility: SingleAttributeBreakdown;
    discipline: SingleAttributeBreakdown;
  };
}

function getAttributeTierInfo(score: number): {
  tierLabel: 'Bronce' | 'Plata' | 'Oro' | 'Élite' | 'Leyenda';
  tierColorClass: string;
} {
  if (score >= 90) {
    return {
      tierLabel: 'Leyenda',
      tierColorClass: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    };
  }
  if (score >= 75) {
    return {
      tierLabel: 'Élite',
      tierColorClass: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    };
  }
  if (score >= 50) {
    return {
      tierLabel: 'Oro',
      tierColorClass: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
    };
  }
  if (score >= 25) {
    return {
      tierLabel: 'Plata',
      tierColorClass: 'text-slate-200 bg-slate-400/15 border-slate-400/30',
    };
  }
  return {
    tierLabel: 'Bronce',
    tierColorClass: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  };
}

function resolveAthleteArchetype(attrs: {
  strength: number;
  endurance: number;
  agility: number;
  discipline: number;
}): { name: string; icon: string; description: string } {
  const { strength, endurance, agility, discipline } = attrs;
  const values = [strength, endurance, agility, discipline];
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);

  if (minVal >= 45 && maxVal - minVal <= 10) {
    return {
      name: 'Atleta Híbrido Completo',
      icon: '👑',
      description: 'Equilibrio de élite en fuerza, motor aeróbico, agilidad en pista y disciplina diaria.',
    };
  }

  const sorted = [
    { key: 'strength', val: strength },
    { key: 'endurance', val: endurance },
    { key: 'agility', val: agility },
    { key: 'discipline', val: discipline },
  ].sort((a, b) => b.val - a.val);

  const pair = new Set([sorted[0].key, sorted[1].key]);

  if (pair.has('strength') && pair.has('agility')) {
    return {
      name: 'Híbrido: Potencia & Pista',
      icon: '⚔️🎾',
      description: 'Fuerza explosiva en el gimnasio combinada con reflejos y agilidad en deportes.',
    };
  }
  if (pair.has('strength') && pair.has('endurance')) {
    return {
      name: 'Coloso de Hierro & Fondo',
      icon: '🏋️🔥',
      description: 'Gran capacidad de tonelaje muscular respaldada por un motor cardiovascular incansable.',
    };
  }
  if (pair.has('endurance') && pair.has('agility')) {
    return {
      name: 'Especialista de Pista & Cardio',
      icon: '⚡🎾',
      description: 'Alto gasto calórico, resistencia prolongada y velocidad en deportes de cancha.',
    };
  }
  if (pair.has('strength') && pair.has('discipline')) {
    return {
      name: 'Guardián del Hierro',
      icon: '🛡️🏋️',
      description: 'Constancia diaria inquebrantable aplicada a la sobrecarga progresiva y nutrición.',
    };
  }
  if (pair.has('endurance') && pair.has('discipline')) {
    return {
      name: 'Motor Metódico',
      icon: '🏃‍♂️🧭',
      description: 'Resistencia aeróbica sostenida por rachas de entrenamiento y control nutricional.',
    };
  }
  if (pair.has('agility') && pair.has('discipline')) {
    return {
      name: 'Estratega de Pista',
      icon: '🎾🎯',
      description: 'Dominio deportivo, rapidez de reacción y compromiso constante con el plan diario.',
    };
  }

  return {
    name: 'Atleta en Evolución',
    icon: '🌟',
    description: 'Desarrollando capacidades físicas en fuerza, cardio, deporte y hábitos diarios.',
  };
}

/**
 * Computes full breakdown of the 4 RPG Athlete Attributes (10 to 99 scale),
 * Overall Rating (MEDIA OVR), Archetype, and active XP bonuses.
 */
export function getAthleteAttributesBreakdown(
  history: WorkoutHistoryEntry[],
  currentStreak: number,
  userLevel: number = 1,
  userProfile?: UserProfile
): AthleteAttributesBreakdown {
  const safeHistory = Array.isArray(history) ? history : [];

  // Effective athlete level
  const effectiveLevel = Math.max(1, Number(userProfile?.level || userLevel) || 1);

  // RPG Level Cap Curve:
  // Level 1: cap ~20 | Level 5: cap ~28 | Level 8: cap ~34 | Level 15: cap ~47 | Level 25: cap ~66 | Level 35+: 99
  const maxPotentialCap = Math.min(99, Math.round(18 + Math.pow(effectiveLevel, 0.95) * 2.2));

  // Base athlete foundation + Level mastery contribution (+0.45 ptos per level, up to 20 max)
  const baseAthletePoints = 5;
  const levelMastery = Math.min(20, Math.round(effectiveLevel * 0.45 * 10) / 10);

  // 1. FUERZA (PWR) metrics: Gym volume + Strength/Hypertrophy sessions + Peak session PR
  const totalVolumeKg = safeHistory.reduce((sum, h) => sum + (Number(h.totalVolumeKg) || 0), 0);
  const maxSessionVolumeKg = safeHistory.reduce(
    (max, h) => Math.max(max, Number(h.totalVolumeKg) || 0),
    0
  );
  const strengthSessions = safeHistory.filter(
    (h) =>
      !h.isSportActivity &&
      ((Number(h.totalVolumeKg) || 0) >= 300 ||
        h.routineTitle?.toLowerCase().includes('fuerza') ||
        h.routineTitle?.toLowerCase().includes('torso') ||
        h.routineTitle?.toLowerCase().includes('pierna') ||
        h.routineTitle?.toLowerCase().includes('espalda') ||
        h.routineTitle?.toLowerCase().includes('pecho') ||
        h.routineTitle?.toLowerCase().includes('full body') ||
        h.routineTitle?.toLowerCase().includes('powerlifting') ||
        h.routineTitle?.toLowerCase().includes('hipertrofia'))
  ).length;

  const strengthFromVolume = Math.min(45, Math.round((totalVolumeKg / 4000) * 10) / 10);
  const strengthFromSessions = Math.min(25, Math.round(strengthSessions * 0.6 * 10) / 10);
  const strengthFromPeak = maxSessionVolumeKg >= 12000 ? 7 : maxSessionVolumeKg >= 8000 ? 5 : maxSessionVolumeKg >= 4000 ? 3 : maxSessionVolumeKg >= 1500 ? 2 : maxSessionVolumeKg > 0 ? 1 : 0;
  const rawStrength = baseAthletePoints + levelMastery + strengthFromVolume + strengthFromSessions + strengthFromPeak;
  const strengthScore = Math.min(
    maxPotentialCap,
    Math.max(5, Math.round(rawStrength))
  );

  // 2. RESISTENCIA (END) metrics: Total active minutes + Total burned kcal + Cardio distance (km)
  const totalMinutes = safeHistory.reduce((sum, h) => sum + (Number(h.durationMinutes) || 0), 0);
  const totalCalories = safeHistory.reduce((sum, h) => sum + (Number(h.calories) || 0), 0);
  const sanitizedDistanceKm = safeHistory.reduce(
    (sum, h) => sum + Math.min(42, Number(h.totalDistanceKm) || 0),
    0
  );

  const enduranceFromMinutes = Math.min(35, Math.round((totalMinutes / 120) * 10) / 10);
  const enduranceFromCalories = Math.min(25, Math.round((totalCalories / 2500) * 10) / 10);
  const enduranceFromDistance = Math.min(20, Math.round((sanitizedDistanceKm / 4.0) * 10) / 10);
  const rawEndurance = baseAthletePoints + levelMastery + enduranceFromMinutes + enduranceFromCalories + enduranceFromDistance;
  const enduranceScore = Math.min(
    maxPotentialCap,
    Math.max(5, Math.round(rawEndurance))
  );

  // 3. AGILIDAD (AGI) metrics: Sport matches (Tenis, Pádel, Fútbol, Boxeo...) + Sport minutes + HIIT/Mobility/Calisthenics
  const sportEntries = safeHistory.filter(
    (h) =>
      Boolean(h.isSportActivity) ||
      h.routineId?.startsWith('sport_') ||
      h.routineTitle?.toLowerCase().includes('tenis') ||
      h.routineTitle?.toLowerCase().includes('pádel') ||
      h.routineTitle?.toLowerCase().includes('padel') ||
      h.routineTitle?.toLowerCase().includes('fútbol') ||
      h.routineTitle?.toLowerCase().includes('baloncesto') ||
      h.routineTitle?.toLowerCase().includes('boxeo') ||
      h.routineTitle?.toLowerCase().includes('natación') ||
      h.routineTitle?.toLowerCase().includes('ciclismo')
  );
  const sportSessionsCount = sportEntries.length;
  const sportMinutes = sportEntries.reduce((sum, h) => sum + (Number(h.durationMinutes) || 0), 0);

  const hiitMobilitySessions = safeHistory.filter(
    (h) =>
      !h.isSportActivity &&
      (h.routineTitle?.toLowerCase().includes('hiit') ||
        h.routineTitle?.toLowerCase().includes('tabata') ||
        h.routineTitle?.toLowerCase().includes('calistenia') ||
        h.routineTitle?.toLowerCase().includes('movilidad') ||
        h.routineTitle?.toLowerCase().includes('core') ||
        h.routineTitle?.toLowerCase().includes('funcional') ||
        h.routineTitle?.toLowerCase().includes('shred') ||
        h.routineTitle?.toLowerCase().includes('cardio'))
  ).length;

  const agilityFromSports = Math.min(35, Math.round(sportSessionsCount * 1.5 * 10) / 10);
  const agilityFromSportTime = Math.min(25, Math.round((sportMinutes / 50) * 10) / 10);
  const agilityFromHiit = Math.min(20, Math.round(hiitMobilitySessions * 1.0 * 10) / 10);
  const rawAgility = baseAthletePoints + levelMastery + agilityFromSports + agilityFromSportTime + agilityFromHiit;
  const agilityScore = Math.min(
    maxPotentialCap,
    Math.max(5, Math.round(rawAgility))
  );

  // 4. DISCIPLINA (DIS) metrics: Current Streak + Unique training days + Logged Nutrition/Water days + Claimed Weekly Challenges
  const uniqueWorkoutDays = new Set(
    safeHistory
      .map((h) => (typeof h.date === 'string' ? h.date.split('T')[0] : ''))
      .filter(Boolean)
  ).size;

  let nutritionDaysCount = 0;
  try {
    const rawLogs = localStorage.getItem('fitquest_nutrition_logs');
    if (rawLogs) {
      const parsedLogs = JSON.parse(rawLogs);
      if (parsedLogs && typeof parsedLogs === 'object') {
        nutritionDaysCount = Object.values(parsedLogs).filter((log: any) => {
          const hasFoods = Array.isArray(log?.foods) && log.foods.length > 0;
          const hasWater = (Number(log?.waterMl) || 0) >= 500;
          return hasFoods || hasWater;
        }).length;
      }
    }
  } catch {}

  let claimedChallengesCount = userProfile?.claimedChallenges?.length || 0;
  if (!claimedChallengesCount) {
    try {
      const rawClaimed = localStorage.getItem('fitquest_claimed_challenges');
      if (rawClaimed) {
        const parsed = JSON.parse(rawClaimed);
        if (Array.isArray(parsed)) claimedChallengesCount = parsed.length;
      }
    } catch {}
  }

  const safeStreak = Math.max(0, Number(currentStreak) || 0);
  const disciplineFromStreak = Math.min(25, Math.round(safeStreak * 1.0 * 10) / 10);
  const disciplineFromUniqueDays = Math.min(25, Math.round(uniqueWorkoutDays * 0.6 * 10) / 10);
  const disciplineFromNutrition = Math.min(18, Math.round(nutritionDaysCount * 0.6 * 10) / 10);
  const disciplineFromChallenges = Math.min(12, Math.round(claimedChallengesCount * 1.5 * 10) / 10);

  const rawDiscipline = baseAthletePoints + levelMastery + disciplineFromStreak + disciplineFromUniqueDays + disciplineFromNutrition + disciplineFromChallenges;
  const disciplineScore = Math.min(
    maxPotentialCap,
    Math.max(5, Math.round(rawDiscipline))
  );

  const attributes = {
    strength: strengthScore,
    endurance: enduranceScore,
    agility: agilityScore,
    discipline: disciplineScore,
  };

  const overall = Math.round(
    (strengthScore + enduranceScore + agilityScore + disciplineScore) / 4
  );
  const overallTier = getAttributeTierInfo(overall);
  const archetype = resolveAthleteArchetype(attributes);

  const strTier = getAttributeTierInfo(strengthScore);
  const endTier = getAttributeTierInfo(enduranceScore);
  const agiTier = getAttributeTierInfo(agilityScore);
  const disTier = getAttributeTierInfo(disciplineScore);

  const strBonusPct = Math.floor(strengthScore / 10) * 2;
  const endBonusPct = Math.floor(enduranceScore / 10) * 2;
  const agiBonusPct = Math.floor(agilityScore / 10) * 2;
  const disBonusPct = Math.floor(disciplineScore / 10) * 2;

  return {
    attributes,
    overall,
    overallTierLabel: overallTier.tierLabel,
    archetype,
    details: {
      strength: {
        key: 'strength',
        name: 'FUERZA',
        code: 'PWR',
        score: strengthScore,
        tierLabel: strTier.tierLabel,
        tierColorClass: strTier.tierColorClass,
        bonusPct: strBonusPct,
        bonusDescription: `+${strBonusPct}% XP extra en rutinas de Pesas e Hipertrofia`,
        summary: 'Mide tu capacidad de carga muscular, tonelaje total levantado y sesiones de fuerza.',
        howToImprove: 'Completa rutinas de gimnasio registrando series y peso (kg) para sumar tonelaje (+1 pto cada 4.000 kg), suma sesiones de fuerza (+0.6 ptos) y bate récords de carga en 1 sesión.',
        sources: [
          { label: 'Base inicial de Atleta', rawMetric: 'Iniciación', pointsAdded: baseAthletePoints },
          {
            label: `Maestría por Rango (Nivel ${effectiveLevel})`,
            rawMetric: `Nivel ${effectiveLevel}`,
            pointsAdded: levelMastery,
          },
          {
            label: 'Tonelaje total levantado',
            rawMetric: `${totalVolumeKg.toLocaleString()} kg`,
            pointsAdded: strengthFromVolume,
          },
          {
            label: 'Sesiones de Fuerza / Hipertrofia',
            rawMetric: `${strengthSessions} entrenos`,
            pointsAdded: strengthFromSessions,
          },
          {
            label: 'Pico máximo de carga en 1 sesión',
            rawMetric: `${maxSessionVolumeKg.toLocaleString()} kg máx`,
            pointsAdded: strengthFromPeak,
          },
        ],
      },
      endurance: {
        key: 'endurance',
        name: 'RESISTENCIA',
        code: 'END',
        score: enduranceScore,
        tierLabel: endTier.tierLabel,
        tierColorClass: endTier.tierColorClass,
        bonusPct: endBonusPct,
        bonusDescription: `+${endBonusPct}% XP extra en Cardio y entrenos de +45 min`,
        summary: 'Refleja tu motor aeróbico: minutos activos totales, calorías quemadas y kilómetros recorridos.',
        howToImprove: 'Acumula minutos de entrenamiento (+1 pto cada 120 min), quema calorías en sesiones largas (+1 pto cada 2.500 kcal) o registra distancia en cardio o running.',
        sources: [
          { label: 'Base inicial de Atleta', rawMetric: 'Iniciación', pointsAdded: baseAthletePoints },
          {
            label: `Maestría por Rango (Nivel ${effectiveLevel})`,
            rawMetric: `Nivel ${effectiveLevel}`,
            pointsAdded: levelMastery,
          },
          {
            label: 'Tiempo activo acumulado',
            rawMetric: `${totalMinutes} min (${(totalMinutes / 60).toFixed(1)} h)`,
            pointsAdded: enduranceFromMinutes,
          },
          {
            label: 'Gasto energético en entrenos',
            rawMetric: `${totalCalories.toLocaleString()} kcal`,
            pointsAdded: enduranceFromCalories,
          },
          {
            label: 'Distancia Cardio & Running',
            rawMetric: `${sanitizedDistanceKm.toFixed(1)} km`,
            pointsAdded: enduranceFromDistance,
          },
        ],
      },
      agility: {
        key: 'agility',
        name: 'AGILIDAD',
        code: 'AGI',
        score: agilityScore,
        tierLabel: agiTier.tierLabel,
        tierColorClass: agiTier.tierColorClass,
        bonusPct: agiBonusPct,
        bonusDescription: `+${agiBonusPct}% XP extra en Deportes (Tenis, Pádel...) y HIIT`,
        summary: 'Evalúa tu destreza deportiva en cancha, coordinación, sesiones de raqueta/equipo y HIIT.',
        howToImprove: 'Registra partidos en «Registrar Deporte / Reloj» (+1.5 ptos por sesión + tiempo en pista) o completa rutinas de HIIT, Core y Movilidad.',
        sources: [
          { label: 'Base inicial de Atleta', rawMetric: 'Iniciación', pointsAdded: baseAthletePoints },
          {
            label: `Maestría por Rango (Nivel ${effectiveLevel})`,
            rawMetric: `Nivel ${effectiveLevel}`,
            pointsAdded: levelMastery,
          },
          {
            label: 'Partidos y Deportes registrados',
            rawMetric: `${sportSessionsCount} sesiones`,
            pointsAdded: agilityFromSports,
          },
          {
            label: 'Tiempo en pista / cancha',
            rawMetric: `${sportMinutes} min deportivos`,
            pointsAdded: agilityFromSportTime,
          },
          {
            label: 'Sesiones HIIT, Core y Movilidad',
            rawMetric: `${hiitMobilitySessions} sesiones`,
            pointsAdded: agilityFromHiit,
          },
        ],
      },
      discipline: {
        key: 'discipline',
        name: 'DISCIPLINA',
        code: 'DIS',
        score: disciplineScore,
        tierLabel: disTier.tierLabel,
        tierColorClass: disTier.tierColorClass,
        bonusPct: disBonusPct,
        bonusDescription: `+${disBonusPct}% XP extra global manteniendo racha activa (≥2 días)`,
        summary: 'Mide tu adherencia al plan: racha actual, días únicos entrenados, registro nutricional/agua y retos semanales.',
        howToImprove: 'Mantén tu racha activa (+1.0 pto/día), suma días únicos entrenados (+0.6 ptos/día), registra comidas y agua en Nutrición y reclama Retos Semanales.',
        sources: [
          { label: 'Base inicial de Atleta', rawMetric: 'Iniciación', pointsAdded: baseAthletePoints },
          {
            label: `Maestría por Rango (Nivel ${effectiveLevel})`,
            rawMetric: `Nivel ${effectiveLevel}`,
            pointsAdded: levelMastery,
          },
          {
            label: 'Racha activa actual',
            rawMetric: `${safeStreak} días seguidos`,
            pointsAdded: disciplineFromStreak,
          },
          {
            label: 'Días únicos de entrenamiento',
            rawMetric: `${uniqueWorkoutDays} días cumplidos`,
            pointsAdded: disciplineFromUniqueDays,
          },
          {
            label: 'Días con Nutrición / Agua registrada',
            rawMetric: `${nutritionDaysCount} días registrados`,
            pointsAdded: disciplineFromNutrition,
          },
          {
            label: 'Retos Semanales reclamados',
            rawMetric: `${claimedChallengesCount} retos`,
            pointsAdded: disciplineFromChallenges,
          },
        ],
      },
    },
  };
}

/**
 * Calculates specialized athlete attributes (10-99) based on real biomechanical & habit history.
 */
export function calculateAthleteAttributes(
  history: WorkoutHistoryEntry[],
  currentStreak: number,
  userLevel: number = 1,
  _existingAttributes?: { strength: number; endurance: number; agility: number; discipline: number }
): { strength: number; endurance: number; agility: number; discipline: number } {
  return getAthleteAttributesBreakdown(history, currentStreak, userLevel).attributes;
}

/**
 * Calculates passive XP bonus earned on a workout/sport entry from the athlete's attributes.
 */
export function calculateAttributeXpBonus(
  entry: WorkoutHistoryEntry,
  attributes: { strength: number; endurance: number; agility: number; discipline: number },
  currentStreak: number,
  baseXp: number
): { bonusXp: number; totalMultiplierPct: number; activeBonuses: string[] } {
  const safeBaseXp = Math.max(0, Number(baseXp) || 0);
  if (safeBaseXp === 0) {
    return { bonusXp: 0, totalMultiplierPct: 0, activeBonuses: [] };
  }

  let totalPct = 0;
  const activeBonuses: string[] = [];

  const isSport = Boolean(entry.isSportActivity || entry.routineId?.startsWith('sport_'));
  const hasVolume = (Number(entry.totalVolumeKg) || 0) >= 300;
  const isLongOrCardio =
    (Number(entry.durationMinutes) || 0) >= 45 || (Number(entry.totalDistanceKm) || 0) >= 1;

  if (isSport) {
    const agiPct = Math.floor((attributes.agility || 10) / 10) * 2;
    if (agiPct > 0) {
      totalPct += agiPct;
      activeBonuses.push(`+${agiPct}% Agilidad`);
    }
  } else if (hasVolume) {
    const strPct = Math.floor((attributes.strength || 10) / 10) * 2;
    if (strPct > 0) {
      totalPct += strPct;
      activeBonuses.push(`+${strPct}% Fuerza`);
    }
  }

  if (isLongOrCardio) {
    const endPct = Math.floor((attributes.endurance || 10) / 10) * 2;
    if (endPct > 0) {
      totalPct += endPct;
      activeBonuses.push(`+${endPct}% Resistencia`);
    }
  }

  if (currentStreak >= 2) {
    const disPct = Math.floor((attributes.discipline || 10) / 10) * 2;
    if (disPct > 0) {
      totalPct += disPct;
      activeBonuses.push(`+${disPct}% Disciplina`);
    }
  }

  // ⚡ Weekend Beast Event: +50% XP multiplier on Saturdays and Sundays
  const todayDay = new Date().getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = todayDay === 0 || todayDay === 6;
  if (isWeekend) {
    totalPct += 50;
    activeBonuses.push('⚡ +50% Weekend Beast (x1.5)');
  }

  const bonusXp = Math.round(safeBaseXp * (totalPct / 100));
  return { bonusXp, totalMultiplierPct: totalPct, activeBonuses };
}

