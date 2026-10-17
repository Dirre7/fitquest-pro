import { WorkoutHistoryEntry } from '../types';

export interface WeeklyChallengeItem {
  id: string;
  claimId: string;
  rotationWeek: number; // 1 to 4
  title: string;
  description: string;
  category: 'VOLUMEN' | 'CALORÍAS' | 'DÍAS ÚNICOS' | 'TIEMPO' | 'DEPORTE & RELOJ' | 'SESIONES';
  iconName: 'dumbbell' | 'flame' | 'calendar' | 'clock' | 'watch' | 'zap';
  color: string;
  unit: string;
  goal: number;
  userCurrent: number;
  rewardXp: number;
  participantsCount: number;
}

export interface WeeklyRotationMeta {
  weekNumber: number; // 1 to 4
  title: string;
  subtitle: string;
  badge: string;
}

export const WEEKLY_ROTATIONS_META: WeeklyRotationMeta[] = [
  {
    weekNumber: 1,
    title: 'Semana 1: Fuerza & Raqueta',
    subtitle: 'Equilibrio entre tonelaje en gimnasio y sesiones deportivas con reloj.',
    badge: 'CICLO 1/4',
  },
  {
    weekNumber: 2,
    title: 'Semana 2: Quema & Resistencia',
    subtitle: 'Foco en gasto calórico elevado, minutos activos y partidos intensos.',
    badge: 'CICLO 2/4',
  },
  {
    weekNumber: 3,
    title: 'Semana 3: Atleta Híbrido',
    subtitle: 'Combinación de volumen pesado, frecuencia de sesiones y deporte exterior.',
    badge: 'CICLO 3/4',
  },
  {
    weekNumber: 4,
    title: 'Semana 4: Semana Élite (Boss Week)',
    subtitle: 'Exigencia máxima en las 4 métricas clave con recompensas de XP aumentadas.',
    badge: 'CICLO 4/4 • BONUS XP',
  },
];

export interface CurrentWeekInfo {
  mondayMidnight: number;
  sundayEnd: number;
  weekKey: string;
  activeRotationIndex: number; // 0, 1, 2, 3
  weekDateRangeLabel: string;
}

/**
 * Computes Monday 00:00:00.000, Sunday 23:59:59.999, deterministic weekKey,
 * and the active 1-of-4 rotation index based on the calendar week.
 */
export function getCurrentWeekInfo(now: Date = new Date()): CurrentWeekInfo {
  const current = new Date(now);
  const day = current.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = current.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(current);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Format YYYY-MM-DD in local time for deterministic weekKey
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  const weekKey = `${yyyy}-${mm}-${dd}`;

  // Compute week index since epoch Monday (1970-01-05) so it increments by 1 every Monday 00:00
  const epochMonday = new Date(1970, 0, 5, 0, 0, 0, 0).getTime();
  const weeksSinceEpoch = Math.floor(
    Math.round((monday.getTime() - epochMonday) / (7 * 24 * 60 * 60 * 1000))
  );
  const activeRotationIndex = ((weeksSinceEpoch % 4) + 4) % 4;

  const shortMonthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const weekDateRangeLabel = `${monday.getDate()} ${shortMonthNames[monday.getMonth()]} - ${sunday.getDate()} ${shortMonthNames[sunday.getMonth()]}`;

  return {
    mondayMidnight: monday.getTime(),
    sundayEnd: sunday.getTime(),
    weekKey,
    activeRotationIndex,
    weekDateRangeLabel,
  };
}

export interface WeeklyMetrics {
  weeklyVolumeKg: number;
  weeklyCalories: number;
  weeklyMinutes: number;
  weeklyWorkoutsCount: number;
  weeklyUniqueDaysCount: number;
  weeklySportOrCardioMinutes: number;
  weeklySportOrCardioSessions: number;
  weeklyMaxSingleSessionCalories: number;
}

/**
 * Strictly filters workout history to the current Monday 00:00 -> Sunday 23:59 window
 * and counts unique calendar days (YYYY-MM-DD) instead of raw timestamps.
 */
export function calculateWeeklyMetrics(
  history: WorkoutHistoryEntry[] = [],
  now: Date = new Date()
): WeeklyMetrics {
  const { mondayMidnight, sundayEnd } = getCurrentWeekInfo(now);

  const weekEntries = (history || []).filter((h) => {
    if (!h.date) return false;
    const entryTime = new Date(h.date).getTime();
    return !isNaN(entryTime) && entryTime >= mondayMidnight && entryTime <= sundayEnd;
  });

  const weeklyVolumeKg = Math.round(
    weekEntries.reduce((acc, h) => acc + (Number(h.totalVolumeKg) || 0), 0)
  );
  const weeklyCalories = Math.round(
    weekEntries.reduce((acc, h) => acc + (Number(h.calories) || 0), 0)
  );
  const weeklyMinutes = Math.round(
    weekEntries.reduce((acc, h) => acc + (Number(h.durationMinutes) || 0), 0)
  );
  const weeklyWorkoutsCount = weekEntries.length;

  // Unique calendar days (local YYYY-MM-DD or ISO date prefix)
  const uniqueDaysSet = new Set(
    weekEntries.map((h) => {
      const d = new Date(h.date);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayNum = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dayNum}`;
      }
      return h.date.split('T')[0];
    })
  );
  const weeklyUniqueDaysCount = uniqueDaysSet.size;

  const sportOrCardioEntries = weekEntries.filter(
    (h) =>
      Boolean(h.isSportActivity) ||
      Boolean(h.routineId?.startsWith('sport_')) ||
      (Number(h.cardioMinutes) || 0) > 0
  );

  const weeklySportOrCardioMinutes = Math.round(
    sportOrCardioEntries.reduce((acc, h) => {
      if (h.isSportActivity || h.routineId?.startsWith('sport_')) {
        return acc + (Number(h.durationMinutes) || 0);
      }
      return acc + (Number(h.cardioMinutes) || Number(h.durationMinutes) || 0);
    }, 0)
  );

  const weeklySportOrCardioSessions = sportOrCardioEntries.length;

  const weeklyMaxSingleSessionCalories = weekEntries.reduce(
    (max, h) => Math.max(max, Math.round(Number(h.calories) || 0)),
    0
  );

  return {
    weeklyVolumeKg,
    weeklyCalories,
    weeklyMinutes,
    weeklyWorkoutsCount,
    weeklyUniqueDaysCount,
    weeklySportOrCardioMinutes,
    weeklySportOrCardioSessions,
    weeklyMaxSingleSessionCalories,
  };
}

/**
 * Returns the 4 challenges for the specified rotation index (0..3),
 * populated with the user's real current-week metrics and week-scoped claimId.
 */
export function getWeeklyChallengesForRotation(
  history: WorkoutHistoryEntry[] = [],
  rotationIndexOverride?: number,
  now: Date = new Date()
): {
  weekInfo: CurrentWeekInfo;
  rotationMeta: WeeklyRotationMeta;
  challenges: WeeklyChallengeItem[];
  metrics: WeeklyMetrics;
} {
  const weekInfo = getCurrentWeekInfo(now);
  const metrics = calculateWeeklyMetrics(history, now);
  const targetIndex =
    rotationIndexOverride !== undefined
      ? ((rotationIndexOverride % 4) + 4) % 4
      : weekInfo.activeRotationIndex;

  const rotationMeta = WEEKLY_ROTATIONS_META[targetIndex];
  const wk = weekInfo.weekKey;

  const allRotations: WeeklyChallengeItem[][] = [
    // ================= SEMANA 1: FUERZA & RAQUETA =================
    [
      {
        id: 'ch_w1_vol_25k',
        claimId: `ch_w1_vol_25k__${wk}`,
        rotationWeek: 1,
        title: 'Fuerza de Acero Semanal (25.000 kg)',
        description:
          'Acumula al menos 25.000 kg de volumen total levantado en tus rutinas de gimnasio de lunes a domingo.',
        category: 'VOLUMEN',
        iconName: 'dumbbell',
        color: 'from-cyan-500 to-blue-600',
        unit: 'kg',
        goal: 25000,
        userCurrent: metrics.weeklyVolumeKg,
        rewardXp: 750,
        participantsCount: 184,
      },
      {
        id: 'ch_w1_cal_2500',
        claimId: `ch_w1_cal_2500__${wk}`,
        rotationWeek: 1,
        title: 'Quema Metabólica Activa (2.500 kcal)',
        description:
          'Quema 2.500 calorías activas esta semana sumando tus sesiones de pesas y tus deportes con reloj.',
        category: 'CALORÍAS',
        iconName: 'flame',
        color: 'from-orange-500 to-amber-600',
        unit: 'kcal',
        goal: 2500,
        userCurrent: metrics.weeklyCalories,
        rewardXp: 650,
        participantsCount: 246,
      },
      {
        id: 'ch_w1_days_3',
        claimId: `ch_w1_days_3__${wk}`,
        rotationWeek: 1,
        title: 'Tridente de Consistencia (3 Días Únicos)',
        description:
          'Entrena o registra deporte en al menos 3 días distintos del calendario antes de la medianoche del domingo.',
        category: 'DÍAS ÚNICOS',
        iconName: 'calendar',
        color: 'from-emerald-500 to-teal-600',
        unit: 'días',
        goal: 3,
        userCurrent: metrics.weeklyUniqueDaysCount,
        rewardXp: 550,
        participantsCount: 312,
      },
      {
        id: 'ch_w1_sport_90m',
        claimId: `ch_w1_sport_90m__${wk}`,
        rotationWeek: 1,
        title: 'Espíritu Deportivo: 90 Minutos en Pista',
        description:
          'Acumula 90 minutos en partidos (Tenis, Pádel, Fútbol, etc.) o sesiones de cardio registradas con tu reloj.',
        category: 'DEPORTE & RELOJ',
        iconName: 'watch',
        color: 'from-purple-500 to-indigo-600',
        unit: 'min',
        goal: 90,
        userCurrent: metrics.weeklySportOrCardioMinutes,
        rewardXp: 650,
        participantsCount: 159,
      },
    ],

    // ================= SEMANA 2: QUEMA & RESISTENCIA =================
    [
      {
        id: 'ch_w2_cal_4000',
        claimId: `ch_w2_cal_4000__${wk}`,
        rotationWeek: 2,
        title: 'Infierno Calórico Semanal (4.000 kcal)',
        description:
          'Alcanza las 4.000 kcal quemadas entre tus entrenamientos de fuerza y tus partidos de la semana.',
        category: 'CALORÍAS',
        iconName: 'flame',
        color: 'from-orange-500 to-red-600',
        unit: 'kcal',
        goal: 4000,
        userCurrent: metrics.weeklyCalories,
        rewardXp: 850,
        participantsCount: 172,
      },
      {
        id: 'ch_w2_min_200',
        claimId: `ch_w2_min_200__${wk}`,
        rotationWeek: 2,
        title: 'Resistencia Total (200 Minutos Activos)',
        description:
          'Suma al menos 200 minutos totales de entrenamiento o deporte activo a lo largo de esta semana.',
        category: 'TIEMPO',
        iconName: 'clock',
        color: 'from-cyan-500 to-blue-600',
        unit: 'min',
        goal: 200,
        userCurrent: metrics.weeklyMinutes,
        rewardXp: 700,
        participantsCount: 215,
      },
      {
        id: 'ch_w2_days_4',
        claimId: `ch_w2_days_4__${wk}`,
        rotationWeek: 2,
        title: 'Guardia de Hierro (4 Días Únicos)',
        description:
          'Completa al menos una sesión en 4 días diferentes de lunes a domingo (varias sesiones el mismo día cuentan como 1 día).',
        category: 'DÍAS ÚNICOS',
        iconName: 'calendar',
        color: 'from-emerald-500 to-teal-600',
        unit: 'días',
        goal: 4,
        userCurrent: metrics.weeklyUniqueDaysCount,
        rewardXp: 650,
        participantsCount: 238,
      },
      {
        id: 'ch_w2_single_800',
        claimId: `ch_w2_single_800__${wk}`,
        rotationWeek: 2,
        title: 'Partido / Sesión de Alta Tensión (800 kcal)',
        description:
          'Supera las 800 kcal quemadas en un único partido de tenis/deporte o en una sesión intensa de gimnasio.',
        category: 'DEPORTE & RELOJ',
        iconName: 'watch',
        color: 'from-purple-500 to-fuchsia-600',
        unit: 'kcal máx',
        goal: 800,
        userCurrent: metrics.weeklyMaxSingleSessionCalories,
        rewardXp: 750,
        participantsCount: 134,
      },
    ],

    // ================= SEMANA 3: ATLETA HÍBRIDO =================
    [
      {
        id: 'ch_w3_vol_35k',
        claimId: `ch_w3_vol_35k__${wk}`,
        rotationWeek: 3,
        title: 'Tonelaje Híbrido (35.000 kg)',
        description:
          'Mueve un total de 35.000 kg acumulados en tus ejercicios de fuerza durante esta semana.',
        category: 'VOLUMEN',
        iconName: 'dumbbell',
        color: 'from-cyan-500 to-blue-600',
        unit: 'kg',
        goal: 35000,
        userCurrent: metrics.weeklyVolumeKg,
        rewardXp: 850,
        participantsCount: 164,
      },
      {
        id: 'ch_w3_sessions_5',
        claimId: `ch_w3_sessions_5__${wk}`,
        rotationWeek: 3,
        title: 'Operación 5 Misiones (5 Sesiones)',
        description:
          'Completa 5 entrenamientos o partidos registrados esta semana (combinando gimnasio y deportes con reloj).',
        category: 'SESIONES',
        iconName: 'zap',
        color: 'from-amber-500 to-orange-600',
        unit: 'sesiones',
        goal: 5,
        userCurrent: metrics.weeklyWorkoutsCount,
        rewardXp: 700,
        participantsCount: 204,
      },
      {
        id: 'ch_w3_cal_3500',
        claimId: `ch_w3_cal_3500__${wk}`,
        rotationWeek: 3,
        title: 'Motor en Llamas (3.500 kcal)',
        description:
          'Quema 3.500 calorías activas acumuladas antes del cierre semanal del domingo.',
        category: 'CALORÍAS',
        iconName: 'flame',
        color: 'from-orange-500 to-red-600',
        unit: 'kcal',
        goal: 3500,
        userCurrent: metrics.weeklyCalories,
        rewardXp: 750,
        participantsCount: 192,
      },
      {
        id: 'ch_w3_sport_2',
        claimId: `ch_w3_sport_2__${wk}`,
        rotationWeek: 3,
        title: 'Doble Cita Deportiva (2 Partidos / Cardio)',
        description:
          'Registra al menos 2 sesiones de deporte con reloj (Tenis, Pádel, etc.) o cardio esta semana.',
        category: 'DEPORTE & RELOJ',
        iconName: 'watch',
        color: 'from-emerald-500 to-cyan-600',
        unit: 'partidos',
        goal: 2,
        userCurrent: metrics.weeklySportOrCardioSessions,
        rewardXp: 650,
        participantsCount: 147,
      },
    ],

    // ================= SEMANA 4: SEMANA ÉLITE (BOSS WEEK) =================
    [
      {
        id: 'ch_w4_vol_50k',
        claimId: `ch_w4_vol_50k__${wk}`,
        rotationWeek: 4,
        title: 'Titán del Hierro: 50.000 kg',
        description:
          'Semana Élite: Acumula 50.000 kg de tonelaje levantado en tus sesiones de fuerza antes del domingo.',
        category: 'VOLUMEN',
        iconName: 'dumbbell',
        color: 'from-cyan-500 to-blue-600',
        unit: 'kg',
        goal: 50000,
        userCurrent: metrics.weeklyVolumeKg,
        rewardXp: 1000,
        participantsCount: 128,
      },
      {
        id: 'ch_w4_cal_5000',
        claimId: `ch_w4_cal_5000__${wk}`,
        rotationWeek: 4,
        title: 'Supernova Metabólica (5.000 kcal)',
        description:
          'Semana Élite: Quema 5.000 calorías activas combinando entrenamientos de gimnasio y partidos con reloj.',
        category: 'CALORÍAS',
        iconName: 'flame',
        color: 'from-orange-500 to-red-600',
        unit: 'kcal',
        goal: 5000,
        userCurrent: metrics.weeklyCalories,
        rewardXp: 1000,
        participantsCount: 142,
      },
      {
        id: 'ch_w4_min_300',
        claimId: `ch_w4_min_300__${wk}`,
        rotationWeek: 4,
        title: 'Maratón de Acero (300 Minutos)',
        description:
          'Semana Élite: Suma 300 minutos (5 horas) de entrenamiento y deporte registrado durante la semana.',
        category: 'TIEMPO',
        iconName: 'clock',
        color: 'from-purple-500 to-indigo-600',
        unit: 'min',
        goal: 300,
        userCurrent: metrics.weeklyMinutes,
        rewardXp: 900,
        participantsCount: 119,
      },
      {
        id: 'ch_w4_days_5',
        claimId: `ch_w4_days_5__${wk}`,
        rotationWeek: 4,
        title: 'Consistencia Inquebrantable (5 Días Únicos)',
        description:
          'Semana Élite: Entrena o haz deporte en 5 días distintos de lunes a domingo.',
        category: 'DÍAS ÚNICOS',
        iconName: 'calendar',
        color: 'from-emerald-500 to-teal-600',
        unit: 'días',
        goal: 5,
        userCurrent: metrics.weeklyUniqueDaysCount,
        rewardXp: 850,
        participantsCount: 165,
      },
    ],
  ];

  return {
    weekInfo,
    rotationMeta,
    challenges: allRotations[targetIndex],
    metrics,
  };
}
