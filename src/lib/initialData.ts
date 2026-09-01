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
} from '../types';

/**
 * Creates a clean brand-new user profile with 0 stats, 0 XP, Level 1.
 */
export const createFreshUser = (id: string, name: string, email?: string): UserProfile => {
  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : 'U';
  return {
    id,
    name: name || (email ? email.split('@')[0] : 'Atleta FitQuest'),
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || id)}&backgroundColor=06b6d4,3b82f6`,
    level: 1,
    xp: 0,
    currentLevelXp: 0,
    nextLevelXp: 250,
    rankTitle: 'Recluta Inicial',
    league: 'Bronze',
    leaguePoints: 0,
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
    attributes: {
      strength: 10,
      endurance: 10,
      agility: 10,
      discipline: 10,
    },
    unlockedBadges: [],
    joinedAt: new Date().toISOString().split('T')[0],
    weightKg: 70.0,
    targetWeightKg: 70.0,
  };
};

import { allInitialAchievements } from './achievementEngine';

/**
 * Clean fresh achievement list starting with 0 progress for new users.
 */
export const createFreshAchievements = (): Achievement[] =>
  JSON.parse(JSON.stringify(allInitialAchievements));

export const defaultRoutines: WorkoutRoutine[] = [
  // STRENGTH (FUERZA)
  {
    id: 'rt_powerlifting_max',
    title: 'Fuerza Máxima Powerlifting',
    description: 'Rutina pesada enfocada en los 3 grandes levantamientos básicos y press militar con descansos largos.',
    category: 'Strength',
    difficulty: 'Advanced',
    durationMinutes: 60,
    estimatedCalories: 480,
    xpReward: 350,
    targetMuscles: ['Pectoral', 'Piernas', 'Espalda', 'Hombros'],
    tags: ['Fuerza', 'Básicos', 'Powerlifting'],
    exercises: [
      {
        id: 'ex_str_squat',
        name: 'Sentadilla Trasera Pesada',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        restSeconds: 120,
        instructions: 'Pies al ancho de hombros, desciende controlado por debajo del paralelo.',
        tip: 'Inhala profundamente en diafragma (Bracing) antes de iniciar el descenso.',
        sets: [
          { id: 's1', setNumber: 1, targetReps: 8, actualReps: 8, targetWeightKg: 60, actualWeightKg: 60, completed: false, isWarmup: true },
          { id: 's2', setNumber: 2, targetReps: 5, actualReps: 5, targetWeightKg: 90, actualWeightKg: 90, completed: false },
          { id: 's3', setNumber: 3, targetReps: 5, actualReps: 5, targetWeightKg: 100, actualWeightKg: 100, completed: false },
          { id: 's4', setNumber: 4, targetReps: 3, actualReps: 3, targetWeightKg: 110, actualWeightKg: 110, completed: false },
        ],
      },
      {
        id: 'ex_str_bench',
        name: 'Press de Banca Plano',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        restSeconds: 90,
        instructions: 'Retrae escápulas firmemente en el banco y baja la barra al esternón.',
        sets: [
          { id: 's5', setNumber: 1, targetReps: 8, actualReps: 8, targetWeightKg: 50, actualWeightKg: 50, completed: false, isWarmup: true },
          { id: 's6', setNumber: 2, targetReps: 6, actualReps: 6, targetWeightKg: 75, actualWeightKg: 75, completed: false },
          { id: 's7', setNumber: 3, targetReps: 5, actualReps: 5, targetWeightKg: 85, actualWeightKg: 85, completed: false },
        ],
      },
      {
        id: 'ex_str_deadlift',
        name: 'Peso Muerto Convencional',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        restSeconds: 120,
        instructions: 'Barra pegada a las espinillas, empuja el suelo con las piernas y bloquea con glúteo.',
        sets: [
          { id: 's8', setNumber: 1, targetReps: 6, actualReps: 6, targetWeightKg: 80, actualWeightKg: 80, completed: false },
          { id: 's9', setNumber: 2, targetReps: 4, actualReps: 4, targetWeightKg: 120, actualWeightKg: 120, completed: false },
          { id: 's10', setNumber: 3, targetReps: 3, actualReps: 3, targetWeightKg: 130, actualWeightKg: 130, completed: false },
        ],
      },
      {
        id: 'ex_str_ohp',
        name: 'Press Militar de Pie (OHP)',
        muscleGroup: 'Shoulders',
        equipment: 'Barbell',
        restSeconds: 90,
        instructions: 'Aprieta abdomen y glúteos para no arquear la zona lumbar al bloquear.',
        sets: [
          { id: 's11', setNumber: 1, targetReps: 8, actualReps: 8, targetWeightKg: 35, actualWeightKg: 35, completed: false },
          { id: 's12', setNumber: 2, targetReps: 6, actualReps: 6, targetWeightKg: 45, actualWeightKg: 45, completed: false },
          { id: 's13', setNumber: 3, targetReps: 5, actualReps: 5, targetWeightKg: 50, actualWeightKg: 50, completed: false },
        ],
      },
    ],
  },
  {
    id: 'rt_upper_strength',
    title: 'Torso Pesado & Sobrecarga',
    description: 'Enfoque en tren superior pesado: press inclinado, remo con barra, fondos lastrados y press francés.',
    category: 'Strength',
    difficulty: 'Intermediate',
    durationMinutes: 50,
    estimatedCalories: 450,
    xpReward: 300,
    targetMuscles: ['Pectoral', 'Espalda', 'Hombros', 'Tríceps'],
    tags: ['Fuerza', 'Barra', 'Sobrecarga'],
    exercises: [
      {
        id: 'ex_inc_bench',
        name: 'Press Inclinado con Barra',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        restSeconds: 90,
        instructions: 'Banco a 30°, baja la barra a la parte alta del pectoral.',
        sets: [
          { id: 's14', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 40, actualWeightKg: 40, completed: false, isWarmup: true },
          { id: 's15', setNumber: 2, targetReps: 8, actualReps: 8, targetWeightKg: 60, actualWeightKg: 60, completed: false },
          { id: 's16', setNumber: 3, targetReps: 6, actualReps: 6, targetWeightKg: 70, actualWeightKg: 70, completed: false },
        ],
      },
      {
        id: 'ex_barbell_row',
        name: 'Remo con Barra Pendlay / 45°',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        restSeconds: 75,
        instructions: 'Espalda neutra, tira de los codos hacia la cadera.',
        sets: [
          { id: 's17', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 50, actualWeightKg: 50, completed: false },
          { id: 's18', setNumber: 2, targetReps: 8, actualReps: 8, targetWeightKg: 65, actualWeightKg: 65, completed: false },
          { id: 's19', setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 70, actualWeightKg: 70, completed: false },
        ],
      },
      {
        id: 'ex_dips_weighted',
        name: 'Fondos en Paralelas Lastrados',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        restSeconds: 75,
        instructions: 'Inclina el torso hacia adelante para mayor activación de pectoral inferior.',
        sets: [
          { id: 's20', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's21', setNumber: 2, targetReps: 8, actualReps: 8, targetWeightKg: 10, actualWeightKg: 10, completed: false },
          { id: 's22', setNumber: 3, targetReps: 6, actualReps: 6, targetWeightKg: 15, actualWeightKg: 15, completed: false },
        ],
      },
      {
        id: 'ex_french_press',
        name: 'Press Francés con Barra Z',
        muscleGroup: 'Arms',
        equipment: 'Barbell',
        restSeconds: 60,
        instructions: 'Codos apuntando al techo, desciende la barra hacia la frente de forma controlada.',
        sets: [
          { id: 's23', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 20, actualWeightKg: 20, completed: false },
          { id: 's24', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 25, actualWeightKg: 25, completed: false },
          { id: 's25', setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 30, actualWeightKg: 30, completed: false },
        ],
      },
    ],
  },

  // HYPERTROPHY (HIPERTROFIA)
  {
    id: 'rt_chest_back_pump',
    title: 'Pecho & Espalda Cyber-Pump',
    description: 'Protocolo de volumen y congestión muscular máxima alternando empujes y tirones.',
    category: 'Hypertrophy',
    difficulty: 'Intermediate',
    durationMinutes: 55,
    estimatedCalories: 500,
    xpReward: 320,
    targetMuscles: ['Pectoral', 'Espalda', 'Bíceps'],
    tags: ['Hipertrofia', 'Congestión', 'Pump'],
    exercises: [
      {
        id: 'ex_db_inc_press',
        name: 'Press Inclinado con Mancuernas',
        muscleGroup: 'Chest',
        equipment: 'Dumbbell',
        restSeconds: 75,
        instructions: 'Rango de recorrido completo, siente el estiramiento abajo antes de empujar.',
        sets: [
          { id: 's26', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 22, actualWeightKg: 22, completed: false },
          { id: 's27', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 26, actualWeightKg: 26, completed: false },
          { id: 's28', setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 30, actualWeightKg: 30, completed: false },
        ],
      },
      {
        id: 'ex_lat_pulldown',
        name: 'Jalón al Pecho en Polea',
        muscleGroup: 'Back',
        equipment: 'Cable',
        restSeconds: 60,
        instructions: 'Lleva la barra a la clavícula tirando con los dorsales, no con los brazos.',
        sets: [
          { id: 's29', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 50, actualWeightKg: 50, completed: false },
          { id: 's30', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 60, actualWeightKg: 60, completed: false },
          { id: 's31', setNumber: 3, targetReps: 10, actualReps: 10, targetWeightKg: 65, actualWeightKg: 65, completed: false },
        ],
      },
      {
        id: 'ex_cable_crossover',
        name: 'Cruces en Polea (Aperturas)',
        muscleGroup: 'Chest',
        equipment: 'Cable',
        restSeconds: 60,
        instructions: 'Codos ligeramente flexionados, aprieta 1 segundo en el punto de máxima contracción.',
        sets: [
          { id: 's32', setNumber: 1, targetReps: 15, actualReps: 15, targetWeightKg: 12.5, actualWeightKg: 12.5, completed: false },
          { id: 's33', setNumber: 2, targetReps: 12, actualReps: 12, targetWeightKg: 15, actualWeightKg: 15, completed: false },
          { id: 's34', setNumber: 3, targetReps: 12, actualReps: 12, targetWeightKg: 15, actualWeightKg: 15, completed: false },
        ],
      },
      {
        id: 'ex_seated_cable_row',
        name: 'Remo Gironda en Polea Baja',
        muscleGroup: 'Back',
        equipment: 'Cable',
        restSeconds: 60,
        instructions: 'Torso erguido, junta escápulas al final de la tracción.',
        sets: [
          { id: 's35', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 50, actualWeightKg: 50, completed: false },
          { id: 's36', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 60, actualWeightKg: 60, completed: false },
          { id: 's37', setNumber: 3, targetReps: 10, actualReps: 10, targetWeightKg: 65, actualWeightKg: 65, completed: false },
        ],
      },
    ],
  },
  {
    id: 'rt_legs_hypertrophy',
    title: 'Pierna & Glúteos Hipertrofia Total',
    description: 'Enfoque biomecánico en sentadilla pesada, prensa de piernas, peso muerto rumano y zancadas búlgaras.',
    category: 'Hypertrophy',
    difficulty: 'Advanced',
    durationMinutes: 55,
    estimatedCalories: 550,
    xpReward: 350,
    targetMuscles: ['Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Gemelos'],
    tags: ['Pierna', 'Hipertrofia', 'Volumen'],
    exercises: [
      {
        id: 'ex_leg_squat',
        name: 'Sentadilla Trasera con Barra',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        restSeconds: 90,
        instructions: 'Pies a la anchura de hombros, rompe el paralelo manteniendo el pecho alto.',
        sets: [
          { id: 's38', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 60, actualWeightKg: 60, completed: false, isWarmup: true },
          { id: 's39', setNumber: 2, targetReps: 8, actualReps: 8, targetWeightKg: 80, actualWeightKg: 80, completed: false },
          { id: 's40', setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 90, actualWeightKg: 90, completed: false },
        ],
      },
      {
        id: 'ex_leg_press',
        name: 'Prensa Inclinada 45°',
        muscleGroup: 'Legs',
        equipment: 'Machine',
        restSeconds: 75,
        instructions: 'Baja profundo sin levantar la cadera del respaldo.',
        sets: [
          { id: 's41', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 140, actualWeightKg: 140, completed: false },
          { id: 's42', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 180, actualWeightKg: 180, completed: false },
          { id: 's43', setNumber: 3, targetReps: 10, actualReps: 10, targetWeightKg: 200, actualWeightKg: 200, completed: false },
        ],
      },
      {
        id: 'ex_romanian_dl',
        name: 'Peso Muerto Rumano',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        restSeconds: 75,
        instructions: 'Flexión leve de rodilla, empuja la cadera hacia atrás sintiendo los isquios.',
        sets: [
          { id: 's44', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 60, actualWeightKg: 60, completed: false },
          { id: 's45', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 75, actualWeightKg: 75, completed: false },
          { id: 's46', setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 85, actualWeightKg: 85, completed: false },
        ],
      },
      {
        id: 'ex_bulgarian_squat',
        name: 'Sentadilla Búlgara con Mancuernas',
        muscleGroup: 'Legs',
        equipment: 'Dumbbell',
        restSeconds: 60,
        instructions: 'Pie trasero en banco, desciende verticalmente trabajando el glúteo y cuádriceps.',
        sets: [
          { id: 's47', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 14, actualWeightKg: 14, completed: false },
          { id: 's48', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 16, actualWeightKg: 16, completed: false },
        ],
      },
    ],
  },

  // HIIT
  {
    id: 'rt_hiit_spartan',
    title: 'Spartan HIIT Protocol',
    description: 'Circuito metabólico de alta intensidad para maximizar la quema calórica y VO2 max.',
    category: 'HIIT',
    difficulty: 'Intermediate',
    durationMinutes: 30,
    estimatedCalories: 420,
    xpReward: 280,
    targetMuscles: ['Full Body', 'Cardio', 'Core'],
    tags: ['HIIT', 'Metabólico', 'Quema Grasa'],
    exercises: [
      {
        id: 'ex_hiit_burpees',
        name: 'Burpees Explosivos',
        muscleGroup: 'Full Body',
        equipment: 'Bodyweight',
        restSeconds: 30,
        instructions: 'Pecho a suelo, salta extendiendo cadera y palmada tras la nuca.',
        sets: [
          { id: 's49', setNumber: 1, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's50', setNumber: 2, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's51', setNumber: 3, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_hiit_mountain_climbers',
        name: 'Mountain Climbers Rápidos',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        restSeconds: 30,
        instructions: 'Posición de plancha, lleva rodillas al pecho alternando a máxima velocidad.',
        sets: [
          { id: 's52', setNumber: 1, targetReps: 30, actualReps: 30, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's53', setNumber: 2, targetReps: 30, actualReps: 30, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_hiit_kb_swings',
        name: 'Kettlebell Swings Rusos',
        muscleGroup: 'Legs',
        equipment: 'Kettlebell',
        restSeconds: 30,
        instructions: 'Bisagra explosiva de cadera, proyecta la pesa rusa a la altura del pecho.',
        sets: [
          { id: 's54', setNumber: 1, targetReps: 20, actualReps: 20, targetWeightKg: 16, actualWeightKg: 16, completed: false },
          { id: 's55', setNumber: 2, targetReps: 20, actualReps: 20, targetWeightKg: 20, actualWeightKg: 20, completed: false },
        ],
      },
      {
        id: 'ex_hiit_box_jumps',
        name: 'Saltos al Cajón (Box Jumps)',
        muscleGroup: 'Legs',
        equipment: 'Bodyweight',
        restSeconds: 30,
        instructions: 'Aterriza suave en el cajón amortiguando con flexión de rodilla.',
        sets: [
          { id: 's56', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's57', setNumber: 2, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: 'rt_tabata_shredder',
    title: 'Tabata Shredder 20/10',
    description: 'Intervalos Tabata puros: 20 segundos de máxima potencia y 10 segundos de recuperación.',
    category: 'HIIT',
    difficulty: 'Intermediate',
    durationMinutes: 25,
    estimatedCalories: 380,
    xpReward: 250,
    targetMuscles: ['Full Body', 'Cardio'],
    tags: ['Tabata', 'Cardio', 'Rápido'],
    exercises: [
      {
        id: 'ex_tab_high_knees',
        name: 'High Knees (Rodillas Arriba)',
        muscleGroup: 'Cardio',
        equipment: 'Bodyweight',
        restSeconds: 15,
        instructions: 'Eleva rodillas por encima de la cadera a ritmo de sprint.',
        sets: [
          { id: 's58', setNumber: 1, targetReps: 30, actualReps: 30, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's59', setNumber: 2, targetReps: 30, actualReps: 30, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_tab_plank_jacks',
        name: 'Plank Jacks con Salto',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        restSeconds: 15,
        instructions: 'En plancha alta, abre y cierra pies manteniendo el core bloqueado.',
        sets: [
          { id: 's60', setNumber: 1, targetReps: 25, actualReps: 25, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's61', setNumber: 2, targetReps: 25, actualReps: 25, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_tab_skaters',
        name: 'Skaters Laterales',
        muscleGroup: 'Legs',
        equipment: 'Bodyweight',
        restSeconds: 15,
        instructions: 'Saltos laterales de lado a lado amortiguando sobre un solo pie.',
        sets: [
          { id: 's62', setNumber: 1, targetReps: 20, actualReps: 20, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's63', setNumber: 2, targetReps: 20, actualReps: 20, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
    ],
  },

  // CALISTHENICS (CALISTENIA)
  {
    id: 'rt_calisthenics_mastery',
    title: 'Dominio del Peso Corporal',
    description: 'Entrenamiento gimnástico enfocado en dominadas estrictas, fondos, flexiones declinadas y L-Sit.',
    category: 'Calisthenics',
    difficulty: 'Intermediate',
    durationMinutes: 45,
    estimatedCalories: 390,
    xpReward: 300,
    targetMuscles: ['Espalda', 'Pectoral', 'Hombros', 'Core'],
    tags: ['Calistenia', 'Peso Corporal', 'Gimnasia'],
    exercises: [
      {
        id: 'ex_cal_pullups',
        name: 'Dominadas Pronas Estrictas',
        muscleGroup: 'Back',
        equipment: 'Bodyweight',
        restSeconds: 90,
        instructions: 'Rango completo: desde brazos estirados hasta pasar la barbilla por encima de la barra.',
        sets: [
          { id: 's64', setNumber: 1, targetReps: 8, actualReps: 8, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's65', setNumber: 2, targetReps: 8, actualReps: 8, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's66', setNumber: 3, targetReps: 6, actualReps: 6, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_cal_dips',
        name: 'Fondos en Paralelas',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        restSeconds: 75,
        instructions: 'Baja hasta 90° de codo y empuja hasta el bloqueo.',
        sets: [
          { id: 's67', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's68', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's69', setNumber: 3, targetReps: 10, actualReps: 10, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_cal_pushups',
        name: 'Flexiones Declinadas con Pies Elevados',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        restSeconds: 60,
        instructions: 'Pies sobre banco, enfatiza el pectoral superior y hombros.',
        sets: [
          { id: 's70', setNumber: 1, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's71', setNumber: 2, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_cal_lsit',
        name: 'L-Sit Hold en Paralelas',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        restSeconds: 60,
        instructions: 'Piernas rectas paralelas al suelo manteniendo la tensión abdominal.',
        sets: [
          { id: 's72', setNumber: 1, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's73', setNumber: 2, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: 'rt_calisthenics_skills',
    title: 'Skills & Core de Acero',
    description: 'Construye fuerza de hombros y tensión isométrica para handstand y dragon flags.',
    category: 'Calisthenics',
    difficulty: 'Advanced',
    durationMinutes: 45,
    estimatedCalories: 360,
    xpReward: 320,
    targetMuscles: ['Hombros', 'Core', 'Espalda'],
    tags: ['Skills', 'Handstand', 'Core'],
    exercises: [
      {
        id: 'ex_pike_pushups',
        name: 'Pike Push-ups (Hombro Vertical)',
        muscleGroup: 'Shoulders',
        equipment: 'Bodyweight',
        restSeconds: 75,
        instructions: 'Cadera elevada en V invertida, cabeza hacia adelante entre las manos.',
        sets: [
          { id: 's74', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's75', setNumber: 2, targetReps: 8, actualReps: 8, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's76', setNumber: 3, targetReps: 8, actualReps: 8, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_aus_pullups',
        name: 'Dominadas Australianas en Barra Baja',
        muscleGroup: 'Back',
        equipment: 'Bodyweight',
        restSeconds: 60,
        instructions: 'Cuerpo en línea recta, tira del pecho hacia la barra.',
        sets: [
          { id: 's77', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's78', setNumber: 2, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_dragon_flag',
        name: 'Dragon Flags en Banco',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        restSeconds: 75,
        instructions: 'Agarra el banco tras la cabeza, eleva el torso rígido como un bloque.',
        sets: [
          { id: 's79', setNumber: 1, targetReps: 6, actualReps: 6, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's80', setNumber: 2, targetReps: 6, actualReps: 6, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
    ],
  },

  // CARDIO
  {
    id: 'rt_cardio_zone2',
    title: 'Cardio Zone 2 & Quema de Grasa',
    description: 'Sesión aeróbica sostenida para optimizar la eficiencia mitocondrial y oxidar grasa.',
    category: 'Cardio',
    difficulty: 'Beginner',
    durationMinutes: 40,
    estimatedCalories: 450,
    xpReward: 260,
    targetMuscles: ['Cardio', 'Piernas'],
    tags: ['Cardio', 'Zona 2', 'Resistencia'],
    exercises: [
      {
        id: 'ex_treadmill_incline',
        name: 'Caminata en Cinta con Inclinación',
        muscleGroup: 'Cardio',
        equipment: 'Machine',
        restSeconds: 30,
        instructions: 'Inclinación al 8-12%, velocidad 5.0 km/h manteniendo FC en zona 2 (125-140 BPM).',
        sets: [
          { id: 's81', setNumber: 1, targetReps: 20, actualReps: 20, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_rower_concept2',
        name: 'Remo Concept2 a Ritmo Constante',
        muscleGroup: 'Full Body',
        equipment: 'Machine',
        restSeconds: 45,
        instructions: 'Impulsa con piernas, transfiere con cadera y remata con brazos.',
        sets: [
          { id: 's82', setNumber: 1, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's83', setNumber: 2, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_jump_rope',
        name: 'Salto de Cuerda Continuo',
        muscleGroup: 'Cardio',
        equipment: 'None',
        restSeconds: 30,
        instructions: 'Saltos cortos sobre la punta de los pies con giro de muñecas suave.',
        sets: [
          { id: 's84', setNumber: 1, targetReps: 100, actualReps: 100, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's85', setNumber: 2, targetReps: 100, actualReps: 100, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: 'rt_cardio_vo2max',
    title: 'VO2 Max Booster Interval',
    description: 'Intervalos anaeróbicos para llevar tu corazón al límite y aumentar el consumo máximo de oxígeno.',
    category: 'Cardio',
    difficulty: 'Advanced',
    durationMinutes: 35,
    estimatedCalories: 480,
    xpReward: 300,
    targetMuscles: ['Cardio', 'Full Body'],
    tags: ['VO2Max', 'Sprints', 'Cardio'],
    exercises: [
      {
        id: 'ex_sprints',
        name: 'Sprints Anaeróbicos 30s',
        muscleGroup: 'Cardio',
        equipment: 'None',
        restSeconds: 60,
        instructions: 'Sprint a máxima intensidad durante 30 segundos, recupera caminando.',
        sets: [
          { id: 's86', setNumber: 1, targetReps: 1, actualReps: 1, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's87', setNumber: 2, targetReps: 1, actualReps: 1, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's88', setNumber: 3, targetReps: 1, actualReps: 1, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_battle_ropes',
        name: 'Battle Ropes (Olas Alternas)',
        muscleGroup: 'Full Body',
        equipment: 'None',
        restSeconds: 45,
        instructions: 'Posición de media sentadilla, bate las cuerdas con fuerza explosiva.',
        sets: [
          { id: 's89', setNumber: 1, targetReps: 40, actualReps: 40, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's90', setNumber: 2, targetReps: 40, actualReps: 40, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
    ],
  },

  // MOBILITY
  {
    id: 'rt_mobility_full',
    title: 'Desbloqueo Articular & Cadena Posterior',
    description: 'Rutina de movilidad y descompresión de cadera, columna y tobillos para prevenir lesiones.',
    category: 'Mobility',
    difficulty: 'Beginner',
    durationMinutes: 30,
    estimatedCalories: 180,
    xpReward: 200,
    targetMuscles: ['Piernas', 'Core', 'Espalda'],
    tags: ['Movilidad', 'Flexibilidad', 'Salud'],
    exercises: [
      {
        id: 'ex_cat_cow',
        name: 'Gato - Camello (Movilidad Torácica)',
        muscleGroup: 'Core',
        equipment: 'None',
        restSeconds: 30,
        instructions: 'En cuadrupedia, arquea y redondea la columna coordinando con la respiración.',
        sets: [
          { id: 's91', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's92', setNumber: 2, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_pigeon_pose',
        name: 'Paloma de Glúteo en Suelo',
        muscleGroup: 'Legs',
        equipment: 'None',
        restSeconds: 30,
        instructions: 'Pierna delantera doblada a 90°, desciende el torso para liberar el piramidal.',
        sets: [
          { id: 's93', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's94', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_hip_90_90',
        name: 'Transiciones de Cadera 90/90',
        muscleGroup: 'Legs',
        equipment: 'None',
        restSeconds: 30,
        instructions: 'Sentado en suelo, rota las rodillas de un lado a otro manteniendo el pecho erguido.',
        sets: [
          { id: 's95', setNumber: 1, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's96', setNumber: 2, targetReps: 12, actualReps: 12, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
    ],
  },
  {
    id: 'rt_mobility_shoulders',
    title: 'Hombros de Acero & Espalda Sana',
    description: 'Protocolo de salud escapular y activación de manguito rotador para banca y dominadas sin dolor.',
    category: 'Mobility',
    difficulty: 'Beginner',
    durationMinutes: 25,
    estimatedCalories: 160,
    xpReward: 200,
    targetMuscles: ['Hombros', 'Espalda'],
    tags: ['Hombros', 'Prevención', 'Manguito'],
    exercises: [
      {
        id: 'ex_facepulls_band',
        name: 'Face Pulls con Banda Elástica',
        muscleGroup: 'Shoulders',
        equipment: 'None',
        restSeconds: 30,
        instructions: 'Tira de la banda hacia la frente con los codos altos y rotación externa.',
        sets: [
          { id: 's97', setNumber: 1, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's98', setNumber: 2, targetReps: 15, actualReps: 15, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
      {
        id: 'ex_thoracic_openers',
        name: 'Aperturas Torácicas en Pared',
        muscleGroup: 'Back',
        equipment: 'None',
        restSeconds: 30,
        instructions: 'Rodilla apoyada, desliza el brazo abriendo el pecho sin mover la pelvis.',
        sets: [
          { id: 's99', setNumber: 1, targetReps: 10, actualReps: 10, targetWeightKg: 0, actualWeightKg: 0, completed: false },
          { id: 's100', setNumber: 2, targetReps: 10, actualReps: 10, targetWeightKg: 0, actualWeightKg: 0, completed: false },
        ],
      },
    ],
  },
];

export const defaultPrograms: WorkoutProgram[] = [
  {
    id: 'prog_ppl_3day',
    title: 'Plan Push-Pull-Legs Pro (3 Días)',
    description: 'La división clásica más efectiva para ganar fuerza e hipertrofia equilibrada en 3 sesiones por semana.',
    daysPerWeek: 3,
    difficulty: 'Intermediate',
    category: 'Strength',
    targetMuscles: ['Pectoral', 'Espalda', 'Piernas', 'Hombros', 'Brazos'],
    xpReward: 1200,
    days: [
      {
        dayNumber: 1,
        title: 'Día 1: Empuje (Push)',
        focus: 'Pectoral, Hombro anterior y Tríceps',
        routine: defaultRoutines[1], // rt_upper_strength
      },
      {
        dayNumber: 2,
        title: 'Día 2: Tirón (Pull)',
        focus: 'Dorsales, Espalda media y Bíceps',
        routine: defaultRoutines[2], // rt_chest_back_pump
      },
      {
        dayNumber: 3,
        title: 'Día 3: Pierna & Core (Legs)',
        focus: 'Sentadilla pesada, Isquios y Glúteos',
        routine: defaultRoutines[3], // rt_legs_hypertrophy
      },
    ],
  },
  {
    id: 'prog_torso_pierna_4day',
    title: 'Plan Torso-Pierna Atleta (4 Días)',
    description: 'Frecuencia 2 óptima para fuerza máxima en básicos y volumen de hipertrofia muscular.',
    daysPerWeek: 4,
    difficulty: 'Advanced',
    category: 'Hypertrophy',
    targetMuscles: ['Full Body', 'Fuerza', 'Hipertrofia'],
    xpReward: 1600,
    days: [
      {
        dayNumber: 1,
        title: 'Día 1: Torso Pesado (Fuerza)',
        focus: 'Press de Banca y Remo con Barra pesado',
        routine: defaultRoutines[0], // rt_powerlifting_max
      },
      {
        dayNumber: 2,
        title: 'Día 2: Pierna Pesada (Fuerza)',
        focus: 'Sentadilla Trasera y Peso Muerto',
        routine: defaultRoutines[3], // rt_legs_hypertrophy
      },
      {
        dayNumber: 3,
        title: 'Día 3: Torso Hipertrofia (Pump)',
        focus: 'Press con mancuernas, Jalones y Cruces',
        routine: defaultRoutines[2], // rt_chest_back_pump
      },
      {
        dayNumber: 4,
        title: 'Día 4: Pierna & Glúteos (Volumen)',
        focus: 'Prensa, Zancadas y Peso Muerto Rumano',
        routine: defaultRoutines[3], // rt_legs_hypertrophy
      },
    ],
  },
  {
    id: 'prog_calisthenics_shred',
    title: 'Plan Calistenia & Shred (3 Días)',
    description: 'Domina tu peso corporal y quema grasa con dominadas, fondos y circuitos metabólicos.',
    daysPerWeek: 3,
    difficulty: 'Intermediate',
    category: 'Calisthenics',
    targetMuscles: ['Espalda', 'Pectoral', 'Hombros', 'Core'],
    xpReward: 1100,
    days: [
      {
        dayNumber: 1,
        title: 'Día 1: Dominio del Peso Corporal',
        focus: 'Dominadas y Fondos en Paralelas',
        routine: defaultRoutines[6], // rt_calisthenics_mastery
      },
      {
        dayNumber: 2,
        title: 'Día 2: Spartan HIIT & Cardio',
        focus: 'Burpees, Swings y Salto al Cajón',
        routine: defaultRoutines[4], // rt_hiit_spartan
      },
      {
        dayNumber: 3,
        title: 'Día 3: Skills & Core de Acero',
        focus: 'Pike push-ups, Dragon Flags y L-Sit',
        routine: defaultRoutines[7], // rt_calisthenics_skills
      },
    ],
  },
  {
    id: 'prog_runner_matrix',
    title: 'Plan Runner 5K a 10K Matrix (3 Días)',
    description: 'Estructura profesional de carrera: Fartlek anaeróbico, tirada continua en Zona 2 y tempo run de competición.',
    daysPerWeek: 3,
    difficulty: 'Intermediate',
    category: 'Cardio',
    targetMuscles: ['Cardio', 'Piernas', 'Capacidad Aeróbica'],
    xpReward: 1300,
    days: [
      {
        dayNumber: 1,
        title: 'Día 1: Intervalos Fartlek & Sprints',
        focus: 'Aceleración, cadencia y potencia anaeróbica',
        routine: defaultRoutines[9], // rt_cardio_vo2max
      },
      {
        dayNumber: 2,
        title: 'Día 2: Tirada Continua Zona 2',
        focus: 'Quema de grasa, base aeróbica y economía de carrera',
        routine: defaultRoutines[8], // rt_cardio_zone2
      },
      {
        dayNumber: 3,
        title: 'Día 3: Simulación de Carrera 5K/10K',
        focus: 'Ritmo sostenido y prueba de distancia objetivo',
        routine: defaultRoutines[9], // rt_cardio_vo2max
      },
    ],
  },
  {
    id: 'prog_hiit_burn',
    title: 'Plan HIIT & Fat Burn Apocalypse (3 Días)',
    description: 'Circuitos metabólicos de alta frecuencia para elevar el VO2 Max y maximizar el gasto calórico post-entreno.',
    daysPerWeek: 3,
    difficulty: 'Advanced',
    category: 'HIIT',
    targetMuscles: ['Full Body', 'Cardio', 'Core'],
    xpReward: 1250,
    days: [
      {
        dayNumber: 1,
        title: 'Día 1: Spartan Metabolic Conditioning',
        focus: 'Kettlebells, Burpees y Saltos al cajón',
        routine: defaultRoutines[4], // rt_hiit_spartan
      },
      {
        dayNumber: 2,
        title: 'Día 2: Tabata Shredder 20/10',
        focus: 'High knees, Plank jacks y Skaters a máxima velocidad',
        routine: defaultRoutines[5], // rt_hiit_tabata
      },
      {
        dayNumber: 3,
        title: 'Día 3: VO2 Max Booster Interval',
        focus: 'Sprints y Battle Ropes sin tregua',
        routine: defaultRoutines[9], // rt_cardio_vo2max
      },
    ],
  },
  {
    id: 'prog_hybrid_athlete',
    title: 'Plan Atleta Híbrido: Fuerza + Resistencia (4 Días)',
    description: 'Combina lo mejor de dos mundos: levantamiento pesado para hipertrofia con sesiones de carrera y acondicionamiento.',
    daysPerWeek: 4,
    difficulty: 'Elite',
    category: 'Hybrid',
    targetMuscles: ['Fuerza', 'Hipertrofia', 'Cardio', 'Running'],
    xpReward: 1750,
    days: [
      {
        dayNumber: 1,
        title: 'Día 1: Torso Pesado (Fuerza)',
        focus: 'Press de Banca, Remo y Dominadas con peso',
        routine: defaultRoutines[1], // rt_upper_strength
      },
      {
        dayNumber: 2,
        title: 'Día 2: Running & Cardio Zone 2 (Resistencia)',
        focus: 'Tirada aeróbica continua de 5 a 8 km',
        routine: defaultRoutines[8], // rt_cardio_zone2
      },
      {
        dayNumber: 3,
        title: 'Día 3: Pierna & Glúteos Hipertrofia (Fuerza)',
        focus: 'Sentadillas, Prensa 45° y Búlgaras',
        routine: defaultRoutines[3], // rt_legs_hypertrophy
      },
      {
        dayNumber: 4,
        title: 'Día 4: HIIT & Sprints VO2 Max (Potencia)',
        focus: 'Intervalos metabólicos y aceleraciones',
        routine: defaultRoutines[9], // rt_cardio_vo2max
      },
    ],
  },
];

export const defaultChallenges: CommunityChallenge[] = [
  {
    id: 'ch_weekly_cardio_15k',
    title: 'Desafío Fondista: 15 km de Carrera',
    description: 'Acumula al menos 15 km de carrera o cardio entre tus sesiones esta semana.',
    category: 'distance',
    goalTarget: 15,
    currentProgress: 0,
    unit: 'km',
    participantsCount: 489,
    daysRemaining: 6,
    rewardXp: 450,
    rewardBadge: 'badge_cardio_15k',
    joined: false,
    leaderboardTop: [
      { userId: 'u_c1', name: 'Mateo Runner', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', score: 12.8 },
      { userId: 'u_c2', name: 'Valeria Iron', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', score: 10.4 },
    ],
  },
  {
    id: 'ch_weekly_volume_50k',
    title: 'Levantamiento de Titán Semanal',
    description: 'Levanta más de 20,000 kg acumulados entre todas tus sesiones esta semana.',
    category: 'volume',
    goalTarget: 20000,
    currentProgress: 0,
    unit: 'kg',
    participantsCount: 342,
    daysRemaining: 5,
    rewardXp: 500,
    rewardBadge: 'badge_titan_lift',
    joined: false,
    leaderboardTop: [
      { userId: 'u_1', name: 'Valeria Iron', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', score: 18450 },
      { userId: 'u_2', name: 'Diego Beast', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', score: 16200 },
    ],
  },
  {
    id: 'ch_weekly_workouts_4',
    title: 'Consistencia 4 Días',
    description: 'Registra y finaliza al menos 4 entrenamientos completos antes del domingo.',
    category: 'workouts',
    goalTarget: 4,
    currentProgress: 0,
    unit: 'sesiones',
    participantsCount: 528,
    daysRemaining: 4,
    rewardXp: 350,
    rewardBadge: 'badge_consistency_4',
    joined: false,
    leaderboardTop: [
      { userId: 'u_3', name: 'Lucas Fit', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', score: 4 },
      { userId: 'u_4', name: 'Camila Cross', avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed2c64ee?w=100', score: 3 },
    ],
  },
  {
    id: 'ch_weekly_calories_2000',
    title: 'Infierno Metabólico',
    description: 'Quema 2,000 calorías acumuladas durante tus entrenamientos activos.',
    category: 'calories',
    goalTarget: 2000,
    currentProgress: 0,
    unit: 'kcal',
    participantsCount: 412,
    daysRemaining: 6,
    rewardXp: 400,
    rewardBadge: 'badge_burner_2k',
    joined: false,
    leaderboardTop: [
      { userId: 'u_5', name: 'Sofia Lift', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', score: 1780 },
      { userId: 'u_6', name: 'Mateo Runner', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', score: 1450 },
    ],
  },
];

export const defaultLeaderboard: LeaderboardUser[] = [
  { rank: 1, userId: 'u_top1', name: 'Valeria Iron', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', level: 22, xpEarned: 2450, streakDays: 24, league: 'Gold', workoutsThisWeek: 7 },
  { rank: 2, userId: 'u_top2', name: 'Diego Beast', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 19, xpEarned: 2180, streakDays: 15, league: 'Gold', workoutsThisWeek: 6 },
  { rank: 3, userId: 'u_top4', name: 'Lucas Fit', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', level: 16, xpEarned: 1720, streakDays: 12, league: 'Gold', workoutsThisWeek: 5, isFriend: true },
  { rank: 4, userId: 'u_top5', name: 'Camila Cross', avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed2c64ee?w=100', level: 15, xpEarned: 1540, streakDays: 9, league: 'Gold', workoutsThisWeek: 4 },
  { rank: 5, userId: 'u_top6', name: 'Mateo Runner', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', level: 13, xpEarned: 1390, streakDays: 7, league: 'Gold', workoutsThisWeek: 4, isFriend: true },
];

export const defaultSmartwatch: SmartwatchDevice = {
  id: 'watch_user',
  name: 'Smartwatch Telemetría',
  brand: 'Apple Watch',
  status: 'connected',
  batteryLevel: 95,
  liveHeartRate: 125,
  hrvMs: 72,
  activeZone: 'Cardio',
  stepsToday: 4200,
  vo2max: 48.0,
  lastSyncTime: 'En vivo',
};

export const defaultPushReminders: PushReminder[] = [
  {
    id: 'rem_morning_workout',
    type: 'workout',
    title: '⚔️ ¡Hora de Entrenar!',
    message: 'Tu cuerpo está listo para romper marcas. Tu rutina de hoy te espera.',
    time: '07:30',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    enabled: true,
  },
  {
    id: 'rem_hydration',
    type: 'hydration',
    title: '💧 Recordatorio de Hidratación',
    message: 'Mantén tus músculos hidratados para maximizar la síntesis proteica.',
    time: '12:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    enabled: true,
  },
  {
    id: 'rem_streak_save',
    type: 'streak_save',
    title: '🔥 ¡Protege tu Racha!',
    message: 'Aún no has registrado actividad hoy. ¡Una sesión rápida salvará tu racha!',
    time: '19:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    enabled: true,
  },
];

export const defaultWorkoutHistory: WorkoutHistoryEntry[] = [];
