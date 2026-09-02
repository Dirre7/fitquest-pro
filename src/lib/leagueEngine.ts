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
    { userId: 'bot_b1', name: 'Sergio_Rookie', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', level: 3, xpEarned: 420, streakDays: 3, league: 'Bronze', workoutsThisWeek: 2, rankTitle: 'Iniciado', achievementsUnlockedCount: 4, totalVolumeKg: 4200, totalDistanceKm: 6.5, topBadges: ['🌱 Primer Paso', '🔥 Racha 3 Días'], bio: 'Iniciando mi camino fitness hacia la mejor versión de mí mismo.' },
    { userId: 'bot_b2', name: 'Laura_Fit', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', level: 2, xpEarned: 310, streakDays: 2, league: 'Bronze', workoutsThisWeek: 1, rankTitle: 'Persistente', achievementsUnlockedCount: 3, totalVolumeKg: 2800, totalDistanceKm: 5.0, topBadges: ['🏃 Primeros 5K', '⚡ Chispa Inicial'], bio: 'Amante del cardio matutino y las rutinas funcionales.' },
    { userId: 'bot_b3', name: 'Pablo_Gym', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', level: 2, xpEarned: 220, streakDays: 1, league: 'Bronze', workoutsThisWeek: 1, rankTitle: 'Disciplinado', achievementsUnlockedCount: 2, totalVolumeKg: 3500, totalDistanceKm: 2.0, topBadges: ['🏋️ Primer PR'], bio: 'Entrenando fuerza para ganar masa muscular.' },
    { userId: 'bot_b4', name: 'Ana_Runner', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100', level: 1, xpEarned: 130, streakDays: 1, league: 'Bronze', workoutsThisWeek: 1, rankTitle: 'Paso Ligero', achievementsUnlockedCount: 2, totalVolumeKg: 800, totalDistanceKm: 4.5, topBadges: ['🏃 1 Km Carrera'], bio: 'Preparando mi primera carrera popular de 5K.' },
    { userId: 'bot_b5', name: 'Carlos_Init', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', level: 1, xpEarned: 60, streakDays: 0, league: 'Bronze', workoutsThisWeek: 0, rankTitle: 'Novato', achievementsUnlockedCount: 1, totalVolumeKg: 1200, totalDistanceKm: 1.0, topBadges: ['🌱 Iniciado'], bio: 'Primeros días en el gimnasio aprendiendo la técnica.' },
  ],
  Silver: [
    { userId: 'bot_s1', name: 'Marcos_Iron', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', level: 8, xpEarned: 980, streakDays: 6, league: 'Silver', workoutsThisWeek: 4, rankTitle: 'Coloso de Acero', achievementsUnlockedCount: 14, totalVolumeKg: 28500, totalDistanceKm: 18.0, topBadges: ['🛡️ 10k Toneladas', '🔥 Semana Hierro', '⚡ HIIT Máster'], bio: 'Dedicado al entrenamiento híbrido: fuerza pesada y sprints.' },
    { userId: 'bot_s2', name: 'Clara_Lift', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', level: 7, xpEarned: 840, streakDays: 5, league: 'Silver', workoutsThisWeek: 3, rankTitle: 'Pectoral Blindado', achievementsUnlockedCount: 11, totalVolumeKg: 19000, totalDistanceKm: 12.0, topBadges: ['🏋️ Banca Pro', '💪 Fondos Hierro'], bio: 'Powerbuilding y calistenia. Sin excusas ningún día.' },
    { userId: 'bot_s3', name: 'Javier_Beast', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 6, xpEarned: 690, streakDays: 4, league: 'Silver', workoutsThisWeek: 3, rankTitle: 'Constante', achievementsUnlockedCount: 9, totalVolumeKg: 14500, totalDistanceKm: 10.0, topBadges: ['🔥 Racha 7 Días', '⚡ Horno 5k kcal'], bio: 'Enfoque en hipertrofia y buena nutrición deportiva.' },
    { userId: 'bot_s4', name: 'Sara_Cross', avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed2c64ee?w=100', level: 6, xpEarned: 580, streakDays: 3, league: 'Silver', workoutsThisWeek: 2, rankTitle: 'Devorador Asfalto', achievementsUnlockedCount: 8, totalVolumeKg: 9500, totalDistanceKm: 15.0, topBadges: ['🏃 Atleta 10K', '⌚ Bio-Sincro'], bio: 'Cross-training y carreras de media distancia.' },
    { userId: 'bot_s5', name: 'Hugo_Fit', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', level: 5, xpEarned: 490, streakDays: 2, league: 'Silver', workoutsThisWeek: 2, rankTitle: 'Disciplinado', achievementsUnlockedCount: 7, totalVolumeKg: 11000, totalDistanceKm: 8.0, topBadges: ['🎖️ 10 Entrenos', '🔥 Racha Bronce'], bio: 'Mejorando mi técnica en sentadillas y peso muerto.' },
  ],
  Gold: [
    { userId: 'bot_g1', name: 'Valeria_Iron', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', level: 16, xpEarned: 2150, streakDays: 14, league: 'Gold', workoutsThisWeek: 6, rankTitle: 'Levantador Titánico', achievementsUnlockedCount: 28, totalVolumeKg: 85000, totalDistanceKm: 42.0, topBadges: ['🥇 50 Toneladas', '👑 Quincena Imparable', '🏃 Medio Maratón'], bio: 'Atleta apasionada del powerlifting y la disciplina inquebrantable.' },
    { userId: 'bot_g2', name: 'Diego_Beast', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 14, xpEarned: 1890, streakDays: 10, league: 'Gold', workoutsThisWeek: 5, rankTitle: 'Poder Centenario', achievementsUnlockedCount: 24, totalVolumeKg: 68000, totalDistanceKm: 32.0, topBadges: ['🏋️ Club 100kg', '💥 Espalda Titanio'], bio: 'Entrenamiento de fuerza puro y duro. Superando mis marcas.' },
    { userId: 'bot_g3', name: 'Lucas_Vanguard', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', level: 13, xpEarned: 1640, streakDays: 8, league: 'Gold', workoutsThisWeek: 5, rankTitle: 'Fondista de Acero', achievementsUnlockedCount: 22, totalVolumeKg: 42000, totalDistanceKm: 55.0, topBadges: ['🏃 21k Fondista', '⚡ Fénix 10k kcal'], bio: 'Corredor de fondo y apasionado de la resistencia aeróbica.' },
    { userId: 'bot_g4', name: 'Camila_Power', avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed2c64ee?w=100', level: 12, xpEarned: 1410, streakDays: 7, league: 'Gold', workoutsThisWeek: 4, rankTitle: 'Guerrero Espartano', achievementsUnlockedCount: 19, totalVolumeKg: 52000, totalDistanceKm: 25.0, topBadges: ['🔥 10 Sesiones HIIT', '💪 Tríceps Titánico'], bio: 'Entrenamientos de alta intensidad y acondicionamiento metabólico.' },
    { userId: 'bot_g5', name: 'Mateo_Runner', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', level: 11, xpEarned: 1250, streakDays: 6, league: 'Gold', workoutsThisWeek: 4, rankTitle: 'Centurión del Gym', achievementsUnlockedCount: 17, totalVolumeKg: 38000, totalDistanceKm: 48.0, topBadges: ['🎖️ 25 Entrenos', '🏃 Flecha Veloz'], bio: 'Constancia diaria para mantener el ritmo alto en cada sesión.' },
  ],
  Diamond: [
    { userId: 'bot_d1', name: 'Hector_Titan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', level: 25, xpEarned: 4100, streakDays: 28, league: 'Diamond', workoutsThisWeek: 7, rankTitle: 'Mente de Diamante', achievementsUnlockedCount: 45, totalVolumeKg: 190000, totalDistanceKm: 95.0, topBadges: ['💎 21 Días Hábito', '👑 Maratón 42k', '🏋️ 100k Toneladas'], bio: 'Entrenar no es un deber, es mi estilo de vida. Liga Diamante.' },
    { userId: 'bot_d2', name: 'Paula_Apex', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', level: 23, xpEarned: 3650, streakDays: 22, league: 'Diamond', workoutsThisWeek: 6, rankTitle: 'Hércules del Hierro', achievementsUnlockedCount: 41, totalVolumeKg: 165000, totalDistanceKm: 80.0, topBadges: ['👑 Hércules Hierro', '⚡ Volcán 25k kcal'], bio: 'Superando barreras físicas cada semana. Buscando el ascenso a Titán.' },
    { userId: 'bot_d3', name: 'Adrian_Legend', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', level: 22, xpEarned: 3200, streakDays: 19, league: 'Diamond', workoutsThisWeek: 6, rankTitle: 'Centurión Asfalto', achievementsUnlockedCount: 38, totalVolumeKg: 120000, totalDistanceKm: 110.0, topBadges: ['🏃 100k Asfalto', '🎯 Gacela 10k'], bio: 'Maratoniano y triatleta. La resistencia es mi mayor virtud.' },
    { userId: 'bot_d4', name: 'Monica_Vanguard', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', level: 21, xpEarned: 2900, streakDays: 16, league: 'Diamond', workoutsThisWeek: 5, rankTitle: 'Estratega PPL', achievementsUnlockedCount: 35, totalVolumeKg: 140000, totalDistanceKm: 65.0, topBadges: ['👑 Maestro PPL', '💪 Espalda Alada'], bio: 'Programación científica del entrenamiento y sobrecarga progresiva.' },
    { userId: 'bot_d5', name: 'Ruben_Elite', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', level: 20, xpEarned: 2600, streakDays: 14, league: 'Diamond', workoutsThisWeek: 5, rankTitle: 'Gladiador Élite', achievementsUnlockedCount: 32, totalVolumeKg: 130000, totalDistanceKm: 70.0, topBadges: ['👑 Nivel 20', '🛡️ Guerrero 24/7'], bio: 'Firme en el podio. Disciplina y superación continua.' },
  ],
  Titan: [
    { userId: 'bot_t1', name: 'Kratos_Gym', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 38, xpEarned: 7800, streakDays: 60, league: 'Titan', workoutsThisWeek: 8, rankTitle: 'Inquebrantable', achievementsUnlockedCount: 75, totalVolumeKg: 450000, totalDistanceKm: 210.0, topBadges: ['💎 30 Días Racha', '👑 250k Toneladas', '👑 Rey Sentadilla 200kg'], bio: 'El dolor es temporal, la gloria es eterna. Rey de la Liga Titán.' },
    { userId: 'bot_t2', name: 'Athena_Olympus', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', level: 35, xpEarned: 6900, streakDays: 45, league: 'Titan', workoutsThisWeek: 7, rankTitle: 'Titán Inamovible', achievementsUnlockedCount: 68, totalVolumeKg: 380000, totalDistanceKm: 180.0, topBadges: ['👑 Señor Peso Muerto', '💎 Monje Forja 60d'], bio: 'Fuerza mitológica y constancia de acero. Ningún día de descanso.' },
    { userId: 'bot_t3', name: 'Thor_Colossus', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', level: 32, xpEarned: 5800, streakDays: 35, league: 'Titan', workoutsThisWeek: 7, rankTitle: 'Volcán Humano', achievementsUnlockedCount: 60, totalVolumeKg: 320000, totalDistanceKm: 150.0, topBadges: ['⚡ Infierno 50k kcal', '👑 Pectoral 140kg'], bio: 'Moviendo montañas cada sesión. El poder del rayo en cada levantamiento.' },
    { userId: 'bot_t4', name: 'Valkyrie_Fit', avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed2c64ee?w=100', level: 30, xpEarned: 5100, streakDays: 30, league: 'Titan', workoutsThisWeek: 6, rankTitle: 'Polifacético Total', achievementsUnlockedCount: 54, totalVolumeKg: 260000, totalDistanceKm: 190.0, topBadges: ['👑 Maratoniano 42k', '🥋 Maestro Calistenia'], bio: 'Atleta híbrida élite. Dominio absoluto de barra, asfalto y hierro.' },
    { userId: 'bot_t5', name: 'Ares_Unstoppable', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', level: 29, xpEarned: 4600, streakDays: 25, league: 'Titan', workoutsThisWeek: 6, rankTitle: 'Veterano Supremo', achievementsUnlockedCount: 48, totalVolumeKg: 240000, totalDistanceKm: 130.0, topBadges: ['🎖️ 50 Misiones', '👑 Maestro Planes 10'], bio: 'Veterano de guerra en el gimnasio. Cada serie al fallo.' },
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
      bio: 'Entrenando duro en FitQuest Pro para conquistar el podio.',
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
 * Calculates real calendar daily streak based on unique workout dates in history.
 */
export function calculateRealStreak(history: WorkoutHistoryEntry[]): { currentStreak: number; bestStreak: number } {
  if (!history || history.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Get unique sorted dates in descending order (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      history
        .map((h) => (h.date ? h.date.split('T')[0] : ''))
        .filter((d) => Boolean(d))
    )
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
 * Calculates specialized athlete attributes (0-100) based on biomechanical training history.
 */
export function calculateAthleteAttributes(
  history: WorkoutHistoryEntry[],
  currentStreak: number
): { strength: number; endurance: number; agility: number; discipline: number } {
  const baseAttr = 10;
  if (!history || history.length === 0) {
    return { strength: baseAttr, endurance: baseAttr, agility: baseAttr, discipline: baseAttr };
  }

  const totalVolumeKg = history.reduce((sum, h) => sum + (h.totalVolumeKg || 0), 0);
  const totalDistanceKm = history.reduce((sum, h) => sum + (h.totalDistanceKm || 0), 0);
  const totalMinutes = history.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);

  const strengthWorkouts = history.filter((h) => (h.totalVolumeKg || 0) > 300).length;
  const cardioWorkouts = history.filter(
    (h) => (h.totalDistanceKm || 0) > 0.5 || h.routineTitle?.toLowerCase().includes('cardio') || h.routineTitle?.toLowerCase().includes('runner')
  ).length;
  const hiitWorkouts = history.filter(
    (h) =>
      h.routineTitle?.toLowerCase().includes('hiit') ||
      h.routineTitle?.toLowerCase().includes('tabata') ||
      h.routineTitle?.toLowerCase().includes('calistenia') ||
      h.routineTitle?.toLowerCase().includes('shred')
  ).length;

  // 1. FUERZA: Volume lifted + heavy strength sessions (scale 10-100)
  const strengthPoints = Math.floor(Math.min(90, (totalVolumeKg / 1000) * 1.5 + strengthWorkouts * 2.5));
  const strength = Math.min(100, Math.max(baseAttr, baseAttr + strengthPoints));

  // 2. RESISTENCIA: Total distance (km) + cardio duration (scale 10-100)
  // Sanitize distance per workout (ignore corrupted huge numbers)
  const sanitizedDistance = history.reduce((sum, h) => sum + Math.min(30, h.totalDistanceKm || 0), 0);
  const endurancePoints = Math.floor(Math.min(90, sanitizedDistance * 2.0 + (totalMinutes / 25) * 1.5 + cardioWorkouts * 3));
  const endurance = Math.min(100, Math.max(baseAttr, baseAttr + endurancePoints));

  // 3. AGILIDAD: HIIT sessions, calisthenics & fast reps (scale 10-100)
  const agilityPoints = Math.floor(Math.min(90, hiitWorkouts * 6 + history.length * 2.0));
  const agility = Math.min(100, Math.max(baseAttr, baseAttr + agilityPoints));

  // 4. DISCIPLINA: Real streak days + total workouts completed (scale 10-100)
  const disciplinePoints = Math.floor(Math.min(90, currentStreak * 5.0 + history.length * 3.0));
  const discipline = Math.min(100, Math.max(baseAttr, baseAttr + disciplinePoints));

  return { strength, endurance, agility, discipline };
}
