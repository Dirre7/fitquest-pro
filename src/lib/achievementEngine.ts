import { Achievement, UserProfile, WorkoutHistoryEntry, WorkoutRoutine } from '../types';

export const allInitialAchievements: Achievement[] = [
  // CONSTANCIA & RACHAS
  {
    id: 'ach_first_workout',
    title: 'Primer Paso de Leyenda',
    description: 'Completa tu primer entrenamiento en la plataforma.',
    icon: 'Flame',
    category: 'consistency',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 100,
    rewardTitle: 'Iniciado',
  },
  {
    id: 'ach_streak_3',
    title: 'Racha de Bronce',
    description: 'Entrena 3 días consecutivos sin romper la racha.',
    icon: 'Flame',
    category: 'consistency',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 3,
    unlocked: false,
    xpReward: 200,
    rewardTitle: 'Persistente',
  },
  {
    id: 'ach_streak_7',
    title: 'Semana de Hierro',
    description: 'Mantén una racha de 7 días consecutivos de entrenamiento.',
    icon: 'Flame',
    category: 'consistency',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 7,
    unlocked: false,
    xpReward: 300,
    rewardTitle: 'Constante',
  },
  {
    id: 'ach_streak_14',
    title: 'Quincena Imparable',
    description: 'Mantén una racha activa de 14 días consecutivos.',
    icon: 'Flame',
    category: 'consistency',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 14,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Imparable',
  },
  {
    id: 'ach_streak_21',
    title: 'Hábito Forjado (21 Días)',
    description: 'Entrena 21 días consecutivos forjando disciplina de acero.',
    icon: 'Zap',
    category: 'consistency',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 21,
    unlocked: false,
    xpReward: 900,
    rewardTitle: 'Mente de Diamante',
  },
  {
    id: 'ach_streak_30',
    title: 'Disciplina Absoluta',
    description: 'Mantén una racha activa de 30 días consecutivos.',
    icon: 'Zap',
    category: 'consistency',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 30,
    unlocked: false,
    xpReward: 1200,
    rewardTitle: 'Inquebrantable',
  },
  {
    id: 'ach_workouts_10',
    title: 'Dedicación de Bronce',
    description: 'Registra 10 entrenamientos completos en tu historial.',
    icon: 'Award',
    category: 'consistency',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Disciplinado',
  },
  {
    id: 'ach_workouts_25',
    title: 'Centurión de Sesiones',
    description: 'Completa 25 entrenamientos registrados en total.',
    icon: 'Award',
    category: 'consistency',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 25,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Centurión del Gimnasio',
  },
  {
    id: 'ach_workouts_50',
    title: 'Veterano de 50 Misiones',
    description: 'Alcanza los 50 entrenamientos totales en la plataforma.',
    icon: 'Crown',
    category: 'consistency',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 50,
    unlocked: false,
    xpReward: 1600,
    rewardTitle: 'Veterano Supremo',
  },
  {
    id: 'ach_weekend_warrior',
    title: 'Guerrero Sin Excusas',
    description: 'Entrena 4 fines de semana (sábado o domingo).',
    icon: 'Flame',
    category: 'consistency',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 4,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Sin Excusas',
  },

  // FUERZA & TONELAJE
  {
    id: 'ach_first_pr',
    title: 'Superando Límites',
    description: 'Establece tu primer récord personal (PR) en cualquier ejercicio.',
    icon: 'Trophy',
    category: 'strength',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 150,
    rewardTitle: 'Rompedor de Marcas',
  },
  {
    id: 'ach_tonnage_10k',
    title: 'Levantador de Montañas',
    description: 'Acumula más de 10,000 kg de volumen total levantado en tu historial.',
    icon: 'Shield',
    category: 'strength',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10000,
    unlocked: false,
    xpReward: 500,
    rewardTitle: 'Coloso de Acero',
  },
  {
    id: 'ach_tonnage_50k',
    title: 'Club de las 50 Toneladas',
    description: 'Acumula más de 50,000 kg de volumen total levantado.',
    icon: 'Shield',
    category: 'strength',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 50000,
    unlocked: false,
    xpReward: 750,
    rewardTitle: 'Levantador Titánico',
  },
  {
    id: 'ach_tonnage_100k',
    title: 'Hércules del Hierro (100k kg)',
    description: 'Acumula 100,000 kg de volumen total levantado en tu historial.',
    icon: 'Crown',
    category: 'strength',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 100000,
    unlocked: false,
    xpReward: 1500,
    rewardTitle: 'Hércules del Hierro',
  },
  {
    id: 'ach_pr_100kg',
    title: 'Poder Centenario (100 kg PR)',
    description: 'Registra un levantamiento de 100 kg o más en cualquier ejercicio.',
    icon: 'Trophy',
    category: 'strength',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 100,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Fuerza Centenaria',
  },
  {
    id: 'ach_bench_master',
    title: 'Pectoral Blindado',
    description: 'Completa 10 sesiones que incluyan Press de Banca o fondos.',
    icon: 'Dumbbell',
    category: 'strength',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 300,
    rewardTitle: 'Pectoral Blindado',
  },
  {
    id: 'ach_squat_master',
    title: 'Piernas de Roble',
    description: 'Completa 10 sesiones con Sentadillas pesadas o Prensa 45°.',
    icon: 'Dumbbell',
    category: 'strength',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 300,
    rewardTitle: 'Piernas de Roble',
  },
  {
    id: 'ach_deadlift_master',
    title: 'Espalda de Titanio',
    description: 'Completa 10 sesiones con Peso Muerto, Dominadas o Remo con Barra.',
    icon: 'Dumbbell',
    category: 'strength',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Espalda de Titanio',
  },

  // CARDIO, RUNNING & RESISTENCIA
  {
    id: 'ach_cardio_5k',
    title: 'Primeros 5 Kilómetros',
    description: 'Acumula al menos 5 km de carrera o cardio en tus entrenamientos.',
    icon: 'Flame',
    category: 'speed',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 5,
    unlocked: false,
    xpReward: 200,
    rewardTitle: 'Corredor Incansable',
  },
  {
    id: 'ach_cardio_10k',
    title: 'Atleta 10K (Diez Mil Metros)',
    description: 'Acumula más de 10 km de carrera o cardio en la plataforma.',
    icon: 'Flame',
    category: 'speed',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Atleta 10K',
  },
  {
    id: 'ach_cardio_half_marathon',
    title: 'Medio Maratón Acumulado',
    description: 'Acumula más de 21 km de carrera y cardio en tu historial.',
    icon: 'Trophy',
    category: 'speed',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 21,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Fondista de Acero',
  },
  {
    id: 'ach_cardio_marathon_42k',
    title: 'Maratón Legendario (42 km)',
    description: 'Acumula 42 km totales de carrera y resistencia aeróbica.',
    icon: 'Crown',
    category: 'speed',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 42,
    unlocked: false,
    xpReward: 1200,
    rewardTitle: 'Maratoniano Legendario',
  },
  {
    id: 'ach_cardio_sessions_5',
    title: 'Devorador de Asfalto',
    description: 'Completa 5 sesiones de carrera exterior, cinta o elíptica.',
    icon: 'Flame',
    category: 'speed',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 5,
    unlocked: false,
    xpReward: 300,
    rewardTitle: 'Devorador de Kilómetros',
  },
  {
    id: 'ach_zone2_master',
    title: 'Motor Cardiovascular (Zona 2)',
    description: 'Acumula 150 minutos en zona aeróbica de quema de grasa y resistencia.',
    icon: 'Watch',
    category: 'speed',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 150,
    unlocked: false,
    xpReward: 450,
    rewardTitle: 'Motor Inagotable',
  },

  // HIIT & GASTO CALÓRICO
  {
    id: 'ach_hiit_5',
    title: 'Motor Inagotable',
    description: 'Completa 5 sesiones de entrenamiento HIIT de alta intensidad.',
    icon: 'Zap',
    category: 'speed',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 5,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Rey del HIIT',
  },
  {
    id: 'ach_hiit_10',
    title: 'Guerrero Espartano',
    description: 'Completa 10 sesiones de HIIT / circuitos de alta intensidad metabólica.',
    icon: 'Zap',
    category: 'speed',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 500,
    rewardTitle: 'Guerrero Espartano',
  },
  {
    id: 'ach_calories_2k',
    title: 'Chispa Metabólica (2.000 kcal)',
    description: 'Quema 2,000 calorías acumuladas durante tus entrenamientos activos.',
    icon: 'Flame',
    category: 'speed',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 2000,
    unlocked: false,
    xpReward: 250,
    rewardTitle: 'Activo',
  },
  {
    id: 'ach_calories_5k',
    title: 'Horno Metabólico (5.000 kcal)',
    description: 'Quema 5,000 calorías acumuladas entre todos tus entrenos.',
    icon: 'Flame',
    category: 'speed',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 5000,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Calcinador de Grasa',
  },
  {
    id: 'ach_calories_10k',
    title: 'Fénix del Fuego (10.000 kcal)',
    description: 'Quema 10,000 calorías totales acumuladas en tu historial.',
    icon: 'Flame',
    category: 'speed',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 10000,
    unlocked: false,
    xpReward: 1200,
    rewardTitle: 'Fénix Metabólico',
  },
  {
    id: 'ach_smartwatch_sync',
    title: 'Atleta Cibernético',
    description: 'Sincroniza un smartwatch y completa 5 entrenamientos con monitoreo cardíaco en vivo.',
    icon: 'Watch',
    category: 'speed',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 5,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Bio-Sincronizado',
  },
  {
    id: 'ach_heart_peak',
    title: 'Pulso de Dragón (160+ BPM)',
    description: 'Registra un pico cardíaco de 160+ BPM en telemetría de smartwatch.',
    icon: 'Watch',
    category: 'speed',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 250,
    rewardTitle: 'Pulso de Dragón',
  },

  // MAESTRÍA, PROGRAMAS & RETOS
  {
    id: 'ach_create_custom',
    title: 'Arquitecto de Entrenamientos',
    description: 'Diseña una rutina personalizada o crea tu primer ejercicio en vivo.',
    icon: 'Sparkles',
    category: 'consistency',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 200,
    rewardTitle: 'Arquitecto del Fitness',
  },
  {
    id: 'ach_program_completed',
    title: 'Estratega de Programas',
    description: 'Completa con éxito todos los días de un Programa Multidía (ej: Push-Pull o Runner 10K).',
    icon: 'Crown',
    category: 'consistency',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Estratega del Hierro',
  },
  {
    id: 'ach_hybrid_athlete',
    title: 'Atleta Híbrido',
    description: 'Completa en tu historial al menos 1 entreno de Fuerza, 1 de Cardio y 1 de Calistenia.',
    icon: 'Sparkles',
    category: 'consistency',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 3,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Atleta Híbrido',
  },
  {
    id: 'ach_community_hero',
    title: 'Pilar Comunitario',
    description: 'Completa con éxito 3 retos comunitarios semanales.',
    icon: 'Crown',
    category: 'consistency',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 3,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Héroe Comunitario',
  },
];

/**
 * Automatically evaluates all achievements based on live user data and history.
 */
export function evaluateAllAchievements(
  user: UserProfile,
  history: WorkoutHistoryEntry[],
  currentAchievements: Achievement[],
  customRoutinesCount: number = 0,
  claimedChallengesCount: number = 0,
  completedProgramsCount: number = 0
): Achievement[] {
  const existingMap = new Map(currentAchievements.map((a) => [a.id, a]));

  const workouts = history.length;
  const totalVolume = history.reduce((sum, h) => sum + (h.totalVolumeKg || 0), 0);
  const totalDistance = history.reduce((sum, h) => sum + (h.totalDistanceKm || 0), 0);
  const totalCalories = history.reduce((sum, h) => sum + (h.calories || 0), 0);
  const streak = Math.max(user.stats.currentStreak || 0, user.stats.bestStreak || 0);

  // Bench, Squat, Deadlift, Cardio, HIIT sessions counts
  const benchSessions = history.filter((h) =>
    h.routineTitle?.toLowerCase().includes('banca') ||
    h.routineTitle?.toLowerCase().includes('pecho') ||
    h.routineTitle?.toLowerCase().includes('push') ||
    h.routineTitle?.toLowerCase().includes('torso') ||
    h.routineTitle?.toLowerCase().includes('fuerza')
  ).length;

  const squatSessions = history.filter((h) =>
    h.routineTitle?.toLowerCase().includes('sentadilla') ||
    h.routineTitle?.toLowerCase().includes('pierna') ||
    h.routineTitle?.toLowerCase().includes('legs')
  ).length;

  const deadliftSessions = history.filter((h) =>
    h.routineTitle?.toLowerCase().includes('muerto') ||
    h.routineTitle?.toLowerCase().includes('espalda') ||
    h.routineTitle?.toLowerCase().includes('pull') ||
    h.routineTitle?.toLowerCase().includes('powerlifting')
  ).length;

  const cardioSessions = history.filter((h) =>
    h.routineTitle?.toLowerCase().includes('cardio') ||
    h.routineTitle?.toLowerCase().includes('runner') ||
    h.routineTitle?.toLowerCase().includes('carrera') ||
    (h.totalDistanceKm && h.totalDistanceKm > 0)
  ).length;

  const hiitSessions = history.filter((h) =>
    h.routineTitle?.toLowerCase().includes('hiit') ||
    h.routineTitle?.toLowerCase().includes('tabata') ||
    h.routineTitle?.toLowerCase().includes('spartan')
  ).length;

  const weekendWorkouts = history.filter((h) => {
    const day = new Date(h.date).getDay();
    return day === 0 || day === 6;
  }).length;

  const smartwatchWorkouts = history.filter((h) => (h.avgHeartRate || 0) > 60).length;
  const maxBpmRecorded = history.reduce((max, h) => Math.max(max, h.maxHeartRate || h.avgHeartRate || 0), 0);

  const hasStrength = history.some((h) => (h.totalVolumeKg || 0) > 500);
  const hasCardio = history.some((h) => (h.totalDistanceKm || 0) > 1 || h.routineTitle?.toLowerCase().includes('cardio'));
  const hasCalisthenics = history.some((h) => h.routineTitle?.toLowerCase().includes('calistenia') || h.routineTitle?.toLowerCase().includes('shred'));
  const hybridCount = (hasStrength ? 1 : 0) + (hasCardio ? 1 : 0) + (hasCalisthenics ? 1 : 0);

  return allInitialAchievements.map((base) => {
    const existing = existingMap.get(base.id);
    let progress = existing?.currentProgress || 0;
    let unlocked = existing?.unlocked || false;

    switch (base.id) {
      case 'ach_first_workout':
        progress = Math.min(1, workouts);
        break;
      case 'ach_streak_3':
        progress = Math.min(3, streak);
        break;
      case 'ach_streak_7':
        progress = Math.min(7, streak);
        break;
      case 'ach_streak_14':
        progress = Math.min(14, streak);
        break;
      case 'ach_streak_21':
        progress = Math.min(21, streak);
        break;
      case 'ach_streak_30':
        progress = Math.min(30, streak);
        break;
      case 'ach_workouts_10':
        progress = Math.min(10, workouts);
        break;
      case 'ach_workouts_25':
        progress = Math.min(25, workouts);
        break;
      case 'ach_workouts_50':
        progress = Math.min(50, workouts);
        break;
      case 'ach_weekend_warrior':
        progress = Math.min(4, weekendWorkouts);
        break;
      case 'ach_first_pr':
        progress = workouts > 0 ? 1 : 0;
        break;
      case 'ach_tonnage_10k':
        progress = Math.min(10000, totalVolume);
        break;
      case 'ach_tonnage_50k':
        progress = Math.min(50000, totalVolume);
        break;
      case 'ach_tonnage_100k':
        progress = Math.min(100000, totalVolume);
        break;
      case 'ach_pr_100kg':
        progress = totalVolume > 5000 || workouts >= 3 ? 100 : 0;
        break;
      case 'ach_bench_master':
        progress = Math.min(10, benchSessions);
        break;
      case 'ach_squat_master':
        progress = Math.min(10, squatSessions);
        break;
      case 'ach_deadlift_master':
        progress = Math.min(10, deadliftSessions);
        break;
      case 'ach_cardio_5k':
        progress = Math.min(5, Math.round(totalDistance * 10) / 10);
        break;
      case 'ach_cardio_10k':
        progress = Math.min(10, Math.round(totalDistance * 10) / 10);
        break;
      case 'ach_cardio_half_marathon':
        progress = Math.min(21, Math.round(totalDistance * 10) / 10);
        break;
      case 'ach_cardio_marathon_42k':
        progress = Math.min(42, Math.round(totalDistance * 10) / 10);
        break;
      case 'ach_cardio_sessions_5':
        progress = Math.min(5, cardioSessions);
        break;
      case 'ach_zone2_master':
        progress = Math.min(150, history.reduce((sum, h) => sum + (h.cardioMinutes || (h.routineTitle?.toLowerCase().includes('cardio') ? h.durationMinutes : 0)), 0));
        break;
      case 'ach_hiit_5':
        progress = Math.min(5, hiitSessions);
        break;
      case 'ach_hiit_10':
        progress = Math.min(10, hiitSessions);
        break;
      case 'ach_calories_2k':
        progress = Math.min(2000, totalCalories);
        break;
      case 'ach_calories_5k':
        progress = Math.min(5000, totalCalories);
        break;
      case 'ach_calories_10k':
        progress = Math.min(10000, totalCalories);
        break;
      case 'ach_smartwatch_sync':
        progress = Math.min(5, smartwatchWorkouts);
        break;
      case 'ach_heart_peak':
        progress = maxBpmRecorded >= 160 ? 1 : 0;
        break;
      case 'ach_create_custom':
        progress = customRoutinesCount > 0 ? 1 : 0;
        break;
      case 'ach_program_completed':
        progress = completedProgramsCount > 0 ? 1 : 0;
        break;
      case 'ach_hybrid_athlete':
        progress = Math.min(3, hybridCount);
        break;
      case 'ach_community_hero':
        progress = Math.min(3, claimedChallengesCount);
        break;
      default:
        break;
    }

    if (progress >= base.maxProgress) {
      unlocked = true;
    }

    return {
      ...base,
      currentProgress: progress,
      unlocked: unlocked || (existing?.unlocked ?? false),
      unlockedAt: unlocked && !existing?.unlocked ? new Date().toISOString() : existing?.unlockedAt,
    };
  });
}
