import { Achievement, UserProfile, WorkoutHistoryEntry } from '../types';

export const allInitialAchievements: Achievement[] = [
  // ==========================================
  // 1. FUERZA & POWERLIFTING (15 LOGROS)
  // ==========================================
  {
    id: 'ach_str_1_pr',
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
    id: 'ach_str_10k_vol',
    title: 'Levantador de Montañas (10k kg)',
    description: 'Acumula más de 10.000 kg de volumen total levantado en tu historial.',
    icon: 'Shield',
    category: 'strength',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 10000,
    unlocked: false,
    xpReward: 300,
    rewardTitle: 'Coloso de Acero',
  },
  {
    id: 'ach_str_50k_vol',
    title: 'Club de las 50 Toneladas',
    description: 'Acumula más de 50.000 kg de volumen total levantado.',
    icon: 'Shield',
    category: 'strength',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 50000,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Levantador Titánico',
  },
  {
    id: 'ach_str_100k_vol',
    title: 'Hércules del Hierro (100k kg)',
    description: 'Acumula 100.000 kg de volumen total levantado en tu carrera.',
    icon: 'Crown',
    category: 'strength',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 100000,
    unlocked: false,
    xpReward: 1200,
    rewardTitle: 'Hércules del Hierro',
  },
  {
    id: 'ach_str_250k_vol',
    title: 'Titán del Olimpo (250k kg)',
    description: 'Alcanza el colosal hito de 250.000 kg acumulados.',
    icon: 'Crown',
    category: 'strength',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 250000,
    unlocked: false,
    xpReward: 2500,
    rewardTitle: 'Titán Inamovible',
  },
  {
    id: 'ach_str_bench_60',
    title: 'Iniciación en Banca (60 kg)',
    description: 'Registra una marca de 60 kg o más en Press de Banca.',
    icon: 'Dumbbell',
    category: 'strength',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 60,
    unlocked: false,
    xpReward: 200,
    rewardTitle: 'Pecho Firme',
  },
  {
    id: 'ach_str_bench_100',
    title: 'Club de los 100 kg en Banca',
    description: 'Levanta 100 kg o más en Press de Banca Plano.',
    icon: 'Trophy',
    category: 'strength',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 100,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Poder Centenario',
  },
  {
    id: 'ach_str_bench_140',
    title: 'Pectoral de Acero (140 kg)',
    description: 'Alcanza los 140 kg en Press de Banca.',
    icon: 'Crown',
    category: 'strength',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 140,
    unlocked: false,
    xpReward: 1200,
    rewardTitle: 'Pectoral Impenetrable',
  },
  {
    id: 'ach_str_squat_100',
    title: 'Sentadilla Centenaria (100 kg)',
    description: 'Registra un levantamiento de 100 kg en Sentadilla o Prensa.',
    icon: 'Dumbbell',
    category: 'strength',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 100,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Pilares Fuertes',
  },
  {
    id: 'ach_str_squat_150',
    title: 'Sentadilla Titánica (150 kg)',
    description: 'Alcanza los 150 kg en Sentadilla.',
    icon: 'Trophy',
    category: 'strength',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 150,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Piernas de Roble',
  },
  {
    id: 'ach_str_squat_200',
    title: 'Sentadilla de Leyenda (200 kg)',
    description: 'Supera la barrera mítica de los 200 kg en Sentadilla.',
    icon: 'Crown',
    category: 'strength',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 200,
    unlocked: false,
    xpReward: 1600,
    rewardTitle: 'Rey de la Sentadilla',
  },
  {
    id: 'ach_str_deadlift_120',
    title: 'Tirón de Fuerza (120 kg)',
    description: 'Levanta 120 kg en Peso Muerto.',
    icon: 'Dumbbell',
    category: 'strength',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 120,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Tirador Fuerte',
  },
  {
    id: 'ach_str_deadlift_180',
    title: 'Espalda de Titanio (180 kg)',
    description: 'Alcanza los 180 kg en Peso Muerto.',
    icon: 'Trophy',
    category: 'strength',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 180,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Espalda de Titanio',
  },
  {
    id: 'ach_str_deadlift_240',
    title: 'Levantador de Tierras (240 kg)',
    description: 'Alcanza los 240 kg en Peso Muerto.',
    icon: 'Crown',
    category: 'strength',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 240,
    unlocked: false,
    xpReward: 1800,
    rewardTitle: 'Señor del Peso Muerto',
  },
  {
    id: 'ach_str_overhead_60',
    title: 'Poder Sobre la Cabeza (60 kg Militar)',
    description: 'Registra 60 kg en Press Militar de Hombros.',
    icon: 'Dumbbell',
    category: 'strength',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 60,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Hombros de Piedra',
  },

  // ==========================================
  // 2. RUNNING, CINTA & CARDIO (15 LOGROS)
  // ==========================================
  {
    id: 'ach_run_1k',
    title: 'Primer Kilómetro',
    description: 'Completa tu primer kilómetro registrado de carrera.',
    icon: 'Flame',
    category: 'speed',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 100,
    rewardTitle: 'Paso Ligero',
  },
  {
    id: 'ach_run_5k',
    title: 'Primeros 5 Kilómetros',
    description: 'Acumula al menos 5 km de carrera en tus entrenamientos.',
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
    id: 'ach_run_10k',
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
    id: 'ach_run_21k',
    title: 'Medio Maratón Acumulado (21 km)',
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
    id: 'ach_run_42k',
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
    id: 'ach_run_100k',
    title: 'Centurión del Asfalto (100 km)',
    description: 'Alcanza los 100 km acumulados de carrera o cinta.',
    icon: 'Crown',
    category: 'speed',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 100,
    unlocked: false,
    xpReward: 2500,
    rewardTitle: 'Centurión del Asfalto',
  },
  {
    id: 'ach_run_sub25_5k',
    title: 'Flecha Veloz (5K)',
    description: 'Registra una sesión de 5 km con ritmo medio inferior a 5:30 min/km.',
    icon: 'Zap',
    category: 'speed',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 500,
    rewardTitle: 'Flecha Veloz',
  },
  {
    id: 'ach_run_sub50_10k',
    title: 'Ritmo de Competición (10K)',
    description: 'Completa una tirada de 10 km con ritmo medio sostenido.',
    icon: 'Trophy',
    category: 'speed',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 1000,
    rewardTitle: 'Gacela del Asfalto',
  },
  {
    id: 'ach_run_incline_3',
    title: 'Rompecuestas en Cinta',
    description: 'Completa 3 sesiones de cinta con inclinación del 2.0% o superior.',
    icon: 'Zap',
    category: 'speed',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 3,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Escalador de Cintas',
  },
  {
    id: 'ach_run_incline_6',
    title: 'Rey de la Montaña',
    description: 'Registra sesiones de cinta con inclinación pronunciada (4.0%+).',
    icon: 'Crown',
    category: 'speed',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 5,
    unlocked: false,
    xpReward: 700,
    rewardTitle: 'Rey de la Montaña',
  },
  {
    id: 'ach_run_outdoor_gps',
    title: 'Navegante Callejero',
    description: 'Completa 3 carreras exteriores utilizando el rastreo GPS en vivo.',
    icon: 'Flame',
    category: 'speed',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 3,
    unlocked: false,
    xpReward: 250,
    rewardTitle: 'Explorador Urbano',
  },
  {
    id: 'ach_run_sessions_10',
    title: 'Devorador de Asfalto (10 Sesiones)',
    description: 'Registra 10 sesiones dedicadas de carrera, cinta o elíptica.',
    icon: 'Flame',
    category: 'speed',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Devorador de Kilómetros',
  },
  {
    id: 'ach_run_sessions_30',
    title: 'Maestro del Cardio (30 Sesiones)',
    description: 'Completa 30 sesiones de carrera o resistencia aeróbica.',
    icon: 'Crown',
    category: 'speed',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 30,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Maestro del Cardio',
  },
  {
    id: 'ach_run_zone2_300',
    title: 'Motor Cardiovascular Zona 2 (300 min)',
    description: 'Acumula 300 minutos en zona aeróbica de resistencia y quema grasa.',
    icon: 'Watch',
    category: 'speed',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 300,
    unlocked: false,
    xpReward: 750,
    rewardTitle: 'Motor Inagotable',
  },
  {
    id: 'ach_run_sprint_master',
    title: 'Sprint Explosivo',
    description: 'Completa 5 sesiones con intervalos de alta velocidad.',
    icon: 'Zap',
    category: 'speed',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 5,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Rayo Explosivo',
  },

  // ==========================================
  // 3. CALISTENIA & PESO CORPORAL (15 LOGROS)
  // ==========================================
  {
    id: 'ach_cal_first_pullup',
    title: 'Primera Dominada',
    description: 'Completa tu primer entrenamiento con dominadas en barra.',
    icon: 'Dumbbell',
    category: 'calisthenics',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 150,
    rewardTitle: 'Colgado Fuerte',
  },
  {
    id: 'ach_cal_pullups_10',
    title: 'Dominio en la Barra (10 Dominadas)',
    description: 'Realiza 10 repeticiones de dominadas en una serie.',
    icon: 'Shield',
    category: 'calisthenics',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Señor de la Barra',
  },
  {
    id: 'ach_cal_pullups_20',
    title: 'Espalda Alada (20 Dominadas)',
    description: 'Realiza 20 repeticiones de dominadas estrictas.',
    icon: 'Crown',
    category: 'calisthenics',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 20,
    unlocked: false,
    xpReward: 1000,
    rewardTitle: 'Espalda Alada',
  },
  {
    id: 'ach_cal_pushups_20',
    title: 'Empuje Básico (20 Flexiones)',
    description: 'Completa 20 flexiones en una serie de entreno.',
    icon: 'Dumbbell',
    category: 'calisthenics',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 20,
    unlocked: false,
    xpReward: 150,
    rewardTitle: 'Pecho Firme',
  },
  {
    id: 'ach_cal_pushups_50',
    title: 'Maquinaria de Flexiones (50 Flexiones)',
    description: 'Alcanza las 50 flexiones en una serie.',
    icon: 'Trophy',
    category: 'calisthenics',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 50,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Máquina de Flexiones',
  },
  {
    id: 'ach_cal_pushups_100',
    title: 'Legión de Flexiones (100 Reps)',
    description: 'Suma 100 flexiones en una sola sesión de entrenamiento.',
    icon: 'Gold',
    category: 'calisthenics',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 100,
    unlocked: false,
    xpReward: 700,
    rewardTitle: 'Centurión del Suelo',
  },
  {
    id: 'ach_cal_dips_10',
    title: 'Fondos de Hierro (10 Fondos)',
    description: 'Realiza 10 fondos en paralelas con técnica limpia.',
    icon: 'Dumbbell',
    category: 'calisthenics',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 200,
    rewardTitle: 'Tríceps de Acero',
  },
  {
    id: 'ach_cal_dips_25',
    title: 'Tríceps Titánico (25 Fondos)',
    description: 'Alcanza 25 fondos en paralelas seguidos.',
    icon: 'Trophy',
    category: 'calisthenics',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 25,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Tríceps Titánico',
  },
  {
    id: 'ach_cal_plank_60',
    title: 'Núcleo Blindado (Plancha 60s)',
    description: 'Completa series de plancha abdominal de al menos 60 segundos.',
    icon: 'Shield',
    category: 'calisthenics',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 60,
    unlocked: false,
    xpReward: 150,
    rewardTitle: 'Core de Piedra',
  },
  {
    id: 'ach_cal_plank_180',
    title: 'Plancha Inmóvil (3 Minutos)',
    description: 'Sostén la plancha abdominal durante 180 segundos.',
    icon: 'Crown',
    category: 'calisthenics',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 180,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Estatua Inmóvil',
  },
  {
    id: 'ach_cal_abs_sessions_10',
    title: 'Abdomen Esculpido (10 Sesiones)',
    description: 'Completa 10 sesiones con ejercicios dedicados de Core.',
    icon: 'Shield',
    category: 'calisthenics',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Abdomen de Acero',
  },
  {
    id: 'ach_cal_weighted_pullup',
    title: 'Gravedad Vencida (Dominada Lastrada)',
    description: 'Registra dominadas con peso añadido.',
    icon: 'Trophy',
    category: 'calisthenics',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 500,
    rewardTitle: 'Gravedad Cero',
  },
  {
    id: 'ach_cal_weighted_dips',
    title: 'Fondos Lastrados',
    description: 'Registra fondos en paralelas con peso adicional.',
    icon: 'Trophy',
    category: 'calisthenics',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Fuerza Pura',
  },
  {
    id: 'ach_cal_sessions_15',
    title: 'Devoto de la Calistenia (15 Sesiones)',
    description: 'Completa 15 sesiones de peso corporal o calistenia.',
    icon: 'Shield',
    category: 'calisthenics',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 15,
    unlocked: false,
    xpReward: 500,
    rewardTitle: 'Gimnasta Urbano',
  },
  {
    id: 'ach_cal_master',
    title: 'Maestro del Peso Corporal (30 Sesiones)',
    description: 'Alcanza 30 sesiones completas de calistenia.',
    icon: 'Crown',
    category: 'calisthenics',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 30,
    unlocked: false,
    xpReward: 1200,
    rewardTitle: 'Maestro del Peso Corporal',
  },

  // ==========================================
  // 4. HÁBITOS, RACHAS & DISCIPLINA (15 LOGROS)
  // ==========================================
  {
    id: 'ach_hab_first_step',
    title: 'Primer Paso de Leyenda',
    description: 'Completa tu primer entrenamiento en la plataforma.',
    icon: 'Flame',
    category: 'habits',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 100,
    rewardTitle: 'Iniciado',
  },
  {
    id: 'ach_hab_streak_3',
    title: 'Racha de Bronce (3 Días)',
    description: 'Entrena 3 días consecutivos sin romper la racha.',
    icon: 'Flame',
    category: 'habits',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 3,
    unlocked: false,
    xpReward: 200,
    rewardTitle: 'Persistente',
  },
  {
    id: 'ach_hab_streak_7',
    title: 'Semana de Hierro (7 Días)',
    description: 'Mantén una racha de 7 días consecutivos de entreno.',
    icon: 'Flame',
    category: 'habits',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 7,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Constante',
  },
  {
    id: 'ach_hab_streak_14',
    title: 'Quincena Imparable (14 Días)',
    description: 'Mantén una racha activa de 14 días consecutivos.',
    icon: 'Flame',
    category: 'habits',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 14,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Imparable',
  },
  {
    id: 'ach_hab_streak_21',
    title: 'Hábito Forjado (21 Días)',
    description: 'Entrena 21 días consecutivos forjando disciplina inquebrantable.',
    icon: 'Zap',
    category: 'habits',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 21,
    unlocked: false,
    xpReward: 900,
    rewardTitle: 'Mente de Diamante',
  },
  {
    id: 'ach_hab_streak_30',
    title: 'Disciplina Absoluta (30 Días)',
    description: 'Mantén una racha activa de 30 días consecutivos.',
    icon: 'Crown',
    category: 'habits',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 30,
    unlocked: false,
    xpReward: 1400,
    rewardTitle: 'Inquebrantable',
  },
  {
    id: 'ach_hab_streak_60',
    title: 'Monje de la Forja (60 Días)',
    description: 'Mantén una racha legendaria de 60 días consecutivos.',
    icon: 'Crown',
    category: 'habits',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 60,
    unlocked: false,
    xpReward: 2500,
    rewardTitle: 'Monje de Hierro',
  },
  {
    id: 'ach_hab_streak_100',
    title: 'Inmortal de la Disciplina (100 Días)',
    description: 'Alcanza la mítica cifra de 100 días consecutivos entrenando.',
    icon: 'Crown',
    category: 'habits',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 100,
    unlocked: false,
    xpReward: 5000,
    rewardTitle: 'Inmortal del Fitness',
  },
  {
    id: 'ach_hab_workouts_10',
    title: 'Dedicación de Bronce (10 Entrenos)',
    description: 'Registra 10 entrenamientos completos en tu historial.',
    icon: 'Award',
    category: 'habits',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Disciplinado',
  },
  {
    id: 'ach_hab_workouts_25',
    title: 'Centurión de Sesiones (25 Entrenos)',
    description: 'Completa 25 entrenamientos registrados en total.',
    icon: 'Award',
    category: 'habits',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 25,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Centurión del Gimnasio',
  },
  {
    id: 'ach_hab_workouts_50',
    title: 'Veterano de 50 Misiones',
    description: 'Alcanza los 50 entrenamientos totales en la plataforma.',
    icon: 'Crown',
    category: 'habits',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 50,
    unlocked: false,
    xpReward: 1600,
    rewardTitle: 'Veterano Supremo',
  },
  {
    id: 'ach_hab_workouts_100',
    title: 'Leyenda de los 100 Entrenamientos',
    description: 'Completa 100 sesiones de entrenamiento registradas.',
    icon: 'Crown',
    category: 'habits',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 100,
    unlocked: false,
    xpReward: 3500,
    rewardTitle: 'Leyenda Viviente',
  },
  {
    id: 'ach_hab_weekend_4',
    title: 'Guerrero Sin Excusas (4 Fines de Semana)',
    description: 'Entrena 4 fines de semana (sábado o domingo).',
    icon: 'Flame',
    category: 'habits',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 4,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Sin Excusas',
  },
  {
    id: 'ach_hab_weekend_12',
    title: 'Titán del Fin de Semana (12 Fines de Semana)',
    description: 'Entrena 12 fines de semana demostrando compromiso total.',
    icon: 'Gold',
    category: 'habits',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 12,
    unlocked: false,
    xpReward: 750,
    rewardTitle: 'Guerrero 24/7',
  },
  {
    id: 'ach_hab_monthly_20',
    title: 'Mes Perfecto (20 Entrenos)',
    description: 'Registra 20 o más entrenamientos en los últimos 30 días.',
    icon: 'Crown',
    category: 'habits',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 20,
    unlocked: false,
    xpReward: 1500,
    rewardTitle: 'Máquina Imparable',
  },

  // ==========================================
  // 5. METABOLISMO, HIIT & CALORÍAS (15 LOGROS)
  // ==========================================
  {
    id: 'ach_met_cal_1k',
    title: 'Chispa Inicial (1.000 kcal)',
    description: 'Quema tus primeras 1.000 calorías acumuladas en entrenamientos.',
    icon: 'Flame',
    category: 'consistency',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1000,
    unlocked: false,
    xpReward: 150,
    rewardTitle: 'En Llamas',
  },
  {
    id: 'ach_met_cal_3k',
    title: 'Calentador Metabólico (3.000 kcal)',
    description: 'Quema 3.000 calorías acumuladas durante tus entrenamientos activos.',
    icon: 'Flame',
    category: 'consistency',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 3000,
    unlocked: false,
    xpReward: 250,
    rewardTitle: 'Activo',
  },
  {
    id: 'ach_met_cal_5k',
    title: 'Horno Metabólico (5.000 kcal)',
    description: 'Quema 5.000 calorías acumuladas entre todos tus entrenos.',
    icon: 'Flame',
    category: 'consistency',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 5000,
    unlocked: false,
    xpReward: 500,
    rewardTitle: 'Calcinador de Grasa',
  },
  {
    id: 'ach_met_cal_10k',
    title: 'Fénix del Fuego (10.000 kcal)',
    description: 'Quema 10.000 calorías totales acumuladas en tu historial.',
    icon: 'Flame',
    category: 'consistency',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 10000,
    unlocked: false,
    xpReward: 1000,
    rewardTitle: 'Fénix Metabólico',
  },
  {
    id: 'ach_met_cal_25k',
    title: 'Volcán Humano (25.000 kcal)',
    description: 'Quema 25.000 calorías acumuladas en tu historial.',
    icon: 'Crown',
    category: 'consistency',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 25000,
    unlocked: false,
    xpReward: 2000,
    rewardTitle: 'Volcán Humano',
  },
  {
    id: 'ach_met_cal_50k',
    title: 'Infierno de Energía (50.000 kcal)',
    description: 'Supera el colosal gasto de 50.000 calorías acumuladas.',
    icon: 'Crown',
    category: 'consistency',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 50000,
    unlocked: false,
    xpReward: 4000,
    rewardTitle: 'Señor del Fuego',
  },
  {
    id: 'ach_met_single_500',
    title: 'Sesión Explosiva (500 kcal)',
    description: 'Quema 500 calorías o más en un único entrenamiento.',
    icon: 'Zap',
    category: 'consistency',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 500,
    unlocked: false,
    xpReward: 300,
    rewardTitle: 'Explosivo',
  },
  {
    id: 'ach_met_single_800',
    title: 'Calcinación Máxima (800 kcal)',
    description: 'Quema 800 calorías o más en una sola sesión de alta intensidad.',
    icon: 'Trophy',
    category: 'consistency',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 800,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Motor Infatigable',
  },
  {
    id: 'ach_met_hiit_3',
    title: 'Descarga de Adrenalina (3 HIIT)',
    description: 'Completa 3 entrenamientos de alta intensidad tipo HIIT.',
    icon: 'Zap',
    category: 'consistency',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 3,
    unlocked: false,
    xpReward: 200,
    rewardTitle: 'Ráfaga Rápida',
  },
  {
    id: 'ach_met_hiit_10',
    title: 'Guerrero Espartano (10 HIIT)',
    description: 'Completa 10 sesiones de HIIT / circuitos metabólicos.',
    icon: 'Zap',
    category: 'consistency',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 500,
    rewardTitle: 'Guerrero Espartano',
  },
  {
    id: 'ach_met_hiit_25',
    title: 'Rey del Tabata (25 HIIT)',
    description: 'Alcanza 25 sesiones completas de HIIT.',
    icon: 'Crown',
    category: 'consistency',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 25,
    unlocked: false,
    xpReward: 1000,
    rewardTitle: 'Rey del Tabata',
  },
  {
    id: 'ach_met_smartwatch_1',
    title: 'Bio-Conectado',
    description: 'Sincroniza un smartwatch y completa tu primera sesión con pulso.',
    icon: 'Watch',
    category: 'consistency',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 150,
    rewardTitle: 'Cyborg Novato',
  },
  {
    id: 'ach_met_smartwatch_10',
    title: 'Atleta Cibernético (10 Entrenos)',
    description: 'Completa 10 entrenamientos con telemetría cardíaca en vivo.',
    icon: 'Watch',
    category: 'consistency',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 450,
    rewardTitle: 'Bio-Sincronizado',
  },
  {
    id: 'ach_met_heart_peak',
    title: 'Pulso de Dragón (170+ BPM)',
    description: 'Registra un pico cardíaco de 170+ BPM durante un entreno activo.',
    icon: 'Watch',
    category: 'consistency',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Pulso de Dragón',
  },
  {
    id: 'ach_met_zone5_30',
    title: 'Zona Roja Suprema (30 min Z5)',
    description: 'Acumula 30 minutos totales en Zona 5 de VO2 Max.',
    icon: 'Crown',
    category: 'consistency',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 30,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Furia del Corazón',
  },

  // ==========================================
  // 6. PROGRAMAS, RUTINAS & MAESTRÍA (15 LOGROS)
  // ==========================================
  {
    id: 'ach_prog_custom_1',
    title: 'Arquitecto del Fitness',
    description: 'Diseña y guarda tu primera rutina personalizada.',
    icon: 'Sparkles',
    category: 'programs',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 200,
    rewardTitle: 'Arquitecto del Fitness',
  },
  {
    id: 'ach_prog_custom_5',
    title: 'Diseñador de Rutinas (5 Rutinas)',
    description: 'Crea 5 rutinas personalizadas en tu catálogo.',
    icon: 'Sparkles',
    category: 'programs',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 5,
    unlocked: false,
    xpReward: 450,
    rewardTitle: 'Estratega Creador',
  },
  {
    id: 'ach_prog_ppl_done',
    title: 'Maestro Push-Pull-Legs',
    description: 'Completa con éxito los 3 días del Programa Push-Pull-Legs.',
    icon: 'Crown',
    category: 'programs',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Estratega PPL',
  },
  {
    id: 'ach_prog_torso_done',
    title: 'Maestro Torso-Pierna',
    description: 'Completa con éxito los 4 días del Programa Torso-Pierna.',
    icon: 'Crown',
    category: 'programs',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Estratega Torso-Pierna',
  },
  {
    id: 'ach_prog_runner_done',
    title: 'Maestro del Plan 5K a 10K',
    description: 'Completa con éxito los 3 días del Programa Runner.',
    icon: 'Crown',
    category: 'programs',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Estratega Runner',
  },
  {
    id: 'ach_prog_cycles_3',
    title: 'Constancia en Programas (3 Ciclos)',
    description: 'Completa 3 ciclos de programas multidía en total.',
    icon: 'Trophy',
    category: 'programs',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 3,
    unlocked: false,
    xpReward: 1000,
    rewardTitle: 'Estratega de Hierro',
  },
  {
    id: 'ach_prog_cycles_10',
    title: 'Comandante de Planes (10 Ciclos)',
    description: 'Completa 10 ciclos completos de programas multidía.',
    icon: 'Crown',
    category: 'programs',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 2500,
    rewardTitle: 'Comandante del Fitness',
  },
  {
    id: 'ach_prog_hybrid_1',
    title: 'Atleta Híbrido',
    description: 'Completa en tu historial 1 entreno de Fuerza, 1 de Cardio y 1 de Calistenia.',
    icon: 'Sparkles',
    category: 'programs',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 3,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Atleta Híbrido',
  },
  {
    id: 'ach_prog_hybrid_pro',
    title: 'Polifacético Total',
    description: 'Completa al menos 10 entrenos de Fuerza, 10 de Cardio y 10 de Calistenia.',
    icon: 'Crown',
    category: 'programs',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 30,
    unlocked: false,
    xpReward: 1500,
    rewardTitle: 'Polifacético Total',
  },
  {
    id: 'ach_prog_comm_1',
    title: 'Colaborador Comunitario (1 Reto)',
    description: 'Reclama la recompensa de tu primer Reto Semanal de la Comunidad.',
    icon: 'Award',
    category: 'programs',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 250,
    rewardTitle: 'Aliado Comunitario',
  },
  {
    id: 'ach_prog_comm_5',
    title: 'Pilar Comunitario (5 Retos)',
    description: 'Supera y reclama 5 Retos Semanales de la Comunidad.',
    icon: 'Trophy',
    category: 'programs',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 5,
    unlocked: false,
    xpReward: 900,
    rewardTitle: 'Héroe Comunitario',
  },
  {
    id: 'ach_prog_comm_15',
    title: 'Leyenda de la Comunidad (15 Retos)',
    description: 'Supera 15 Retos Semanales Comunitarios.',
    icon: 'Crown',
    category: 'programs',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 15,
    unlocked: false,
    xpReward: 2000,
    rewardTitle: 'Campeón Comunitario',
  },
  {
    id: 'ach_prog_all_muscles',
    title: 'Escultura Completa',
    description: 'Entrena los 6 grupos musculares principales en tu historial.',
    icon: 'Shield',
    category: 'programs',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 6,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Físico Armónico',
  },
  {
    id: 'ach_prog_notes_10',
    title: 'Diario del Guerrero (10 Notas)',
    description: 'Guarda notas personales en 10 entrenamientos diferentes.',
    icon: 'Sparkles',
    category: 'programs',
    tier: 'Bronze',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 200,
    rewardTitle: 'Mente Analítica',
  },
  {
    id: 'ach_prog_perfect_rate',
    title: 'Atleta Satisfecho (10 de 5 Estrellas)',
    description: 'Califica 10 entrenamientos con la máxima puntuación de 5 estrellas.',
    icon: 'Trophy',
    category: 'programs',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 300,
    rewardTitle: 'Plena Confianza',
  },

  // ==========================================
  // 7. LOGROS SECRETOS & EASTER EGGS (10 LOGROS)
  // ==========================================
  {
    id: 'ach_sec_early_bird',
    title: 'Club de las 6:00 AM',
    description: 'Completa un entrenamiento finalizado antes de las 7:00 AM.',
    icon: 'Zap',
    category: 'secret',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 600,
    rewardTitle: 'Madrugador de Acero',
    isSecret: true,
    hint: 'A quien madruga... la barra le ayuda.',
  },
  {
    id: 'ach_sec_night_owl',
    title: 'Guerrero Nocturno',
    description: 'Completa un entrenamiento finalizado después de las 22:00 de la noche.',
    icon: 'Shield',
    category: 'secret',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 400,
    rewardTitle: 'Sombra Nocturna',
    isSecret: true,
    hint: 'Cuando la ciudad duerme, el hierro despierta.',
  },
  {
    id: 'ach_sec_double_session',
    title: 'Doble Ración de Guerra',
    description: 'Completa 2 entrenamientos completos en el mismo día.',
    icon: 'Trophy',
    category: 'secret',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Insaciable',
    isSecret: true,
    hint: 'Un solo entrenamiento no fue suficiente para ti.',
  },
  {
    id: 'ach_sec_marathon_session',
    title: 'Sesión Titánica (90+ min)',
    description: 'Registra un entrenamiento de más de 90 minutos de duración activa.',
    icon: 'Crown',
    category: 'secret',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 500,
    rewardTitle: 'Resistencia Titánica',
    isSecret: true,
    hint: 'El tiempo se detiene cuando tu voluntad es de acero.',
  },
  {
    id: 'ach_sec_heavy_single_session',
    title: 'Carga Masiva (15.000 kg en un entreno)',
    description: 'Mueve más de 15.000 kg de volumen en un único entrenamiento.',
    icon: 'Crown',
    category: 'secret',
    tier: 'Gold',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 800,
    rewardTitle: 'Bestia de Carga',
    isSecret: true,
    hint: 'Un tonelaje que movería montañas en una sola tarde.',
  },
  {
    id: 'ach_sec_quick_speed_run',
    title: 'Entreno Relámpago',
    description: 'Completa un entrenamiento intenso en menos de 20 minutos con 100% de series.',
    icon: 'Zap',
    category: 'secret',
    tier: 'Silver',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 350,
    rewardTitle: 'Relámpago Feroz',
    isSecret: true,
    hint: 'Rápido como el rayo, certero como el rayo.',
  },
  {
    id: 'ach_sec_new_year',
    title: 'Resolución Inquebrantable',
    description: 'Entrena en festivo o el primer día del mes demostrando compromiso.',
    icon: 'Crown',
    category: 'secret',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 1000,
    rewardTitle: 'Sin Festivos',
    isSecret: true,
    hint: 'El calendario dice fiesta, tu cuerpo dice entreno.',
  },
  {
    id: 'ach_sec_level_20',
    title: 'Ascenso al Olimpo (Nivel 20)',
    description: 'Alcanza el Nivel 20 de cuenta con tu esfuerzo acumulado.',
    icon: 'Crown',
    category: 'secret',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 20,
    unlocked: false,
    xpReward: 1500,
    rewardTitle: 'Gladiador Élite',
    isSecret: true,
    hint: 'Tu experiencia acumulada te eleva entre los gladiadores.',
  },
  {
    id: 'ach_sec_level_50',
    title: 'Trascendencia Divina (Nivel 50)',
    description: 'Alcanza el mítico Nivel 50 de cuenta.',
    icon: 'Crown',
    category: 'secret',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 50,
    unlocked: false,
    xpReward: 5000,
    rewardTitle: 'Semidiós del Olimpo',
    isSecret: true,
    hint: 'El culmen definitivo del poder atlético.',
  },
  {
    id: 'ach_sec_perfectionist',
    title: 'Perfección Absoluta',
    description: 'Completa 15 entrenamientos con el 100% de series cumplidas sin saltarte ninguna.',
    icon: 'Crown',
    category: 'secret',
    tier: 'Titan',
    currentProgress: 0,
    maxProgress: 15,
    unlocked: false,
    xpReward: 2000,
    rewardTitle: 'Perfeccionista Supremo',
    isSecret: true,
    hint: 'La disciplina perfecta: sin atajos ni series a medias.',
  },
];

/**
 * Automatically evaluates all 100 achievements based on live user data and history.
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
  const userLevel = user.level || 1;

  // Exercise and discipline session breakdowns
  const cardioSessions = history.filter(
    (h) =>
      h.routineTitle?.toLowerCase().includes('cardio') ||
      h.routineTitle?.toLowerCase().includes('runner') ||
      h.routineTitle?.toLowerCase().includes('carrera') ||
      (h.totalDistanceKm && h.totalDistanceKm > 0)
  ).length;

  const calisthenicsSessions = history.filter(
    (h) =>
      h.routineTitle?.toLowerCase().includes('calistenia') ||
      h.routineTitle?.toLowerCase().includes('shred') ||
      h.routineTitle?.toLowerCase().includes('flexion') ||
      h.routineTitle?.toLowerCase().includes('dominad') ||
      h.routineTitle?.toLowerCase().includes('core')
  ).length;

  const hiitSessions = history.filter(
    (h) =>
      h.routineTitle?.toLowerCase().includes('hiit') ||
      h.routineTitle?.toLowerCase().includes('tabata') ||
      h.routineTitle?.toLowerCase().includes('espartan')
  ).length;

  const weekendWorkouts = history.filter((h) => {
    const day = new Date(h.date).getDay();
    return day === 0 || day === 6;
  }).length;

  const smartwatchWorkouts = history.filter((h) => (h.avgHeartRate || 0) > 60).length;
  const maxBpmRecorded = history.reduce((max, h) => Math.max(max, h.maxHeartRate || h.avgHeartRate || 0), 0);
  const maxVolumeSingleSession = history.reduce((max, h) => Math.max(max, h.totalVolumeKg || 0), 0);
  const maxCaloriesSingleSession = history.reduce((max, h) => Math.max(max, h.calories || 0), 0);
  const maxDurationSingleSession = history.reduce((max, h) => Math.max(max, h.durationMinutes || 0), 0);

  // Group workouts by day to detect double sessions
  const dayWorkoutCounts: { [date: string]: number } = {};
  history.forEach((h) => {
    dayWorkoutCounts[h.date] = (dayWorkoutCounts[h.date] || 0) + 1;
  });
  const maxWorkoutsInSingleDay = Math.max(0, ...Object.values(dayWorkoutCounts));

  // Count workouts with 5 stars and notes
  const fiveStarWorkouts = history.filter((h) => h.rating === 5).length;
  const workoutsWithNotes = history.filter((h) => h.notes && h.notes.trim().length > 0).length;

  // Best PR estimates from user stats
  const bestBenchKg = user.stats.benchPressPrKg || (totalVolume > 0 ? 60 : 0);
  const bestSquatKg = user.stats.squatPrKg || (totalVolume > 0 ? 80 : 0);
  const bestDeadliftKg = user.stats.deadliftPrKg || (totalVolume > 0 ? 100 : 0);
  const bestOverheadKg = user.stats.overheadPrKg || (totalVolume > 0 ? 40 : 0);

  return allInitialAchievements.map((base) => {
    const existing = existingMap.get(base.id);
    let progress = existing?.currentProgress || 0;
    let unlocked = existing?.unlocked || false;

    switch (base.id) {
      // 1. FUERZA
      case 'ach_str_1_pr':
        progress = Math.min(1, user.stats.totalPrsCount || (totalVolume > 0 ? 1 : 0));
        break;
      case 'ach_str_10k_vol':
        progress = Math.min(10000, totalVolume);
        break;
      case 'ach_str_50k_vol':
        progress = Math.min(50000, totalVolume);
        break;
      case 'ach_str_100k_vol':
        progress = Math.min(100000, totalVolume);
        break;
      case 'ach_str_250k_vol':
        progress = Math.min(250000, totalVolume);
        break;
      case 'ach_str_bench_60':
        progress = Math.min(60, bestBenchKg);
        break;
      case 'ach_str_bench_100':
        progress = Math.min(100, bestBenchKg);
        break;
      case 'ach_str_bench_140':
        progress = Math.min(140, bestBenchKg);
        break;
      case 'ach_str_squat_100':
        progress = Math.min(100, bestSquatKg);
        break;
      case 'ach_str_squat_150':
        progress = Math.min(150, bestSquatKg);
        break;
      case 'ach_str_squat_200':
        progress = Math.min(200, bestSquatKg);
        break;
      case 'ach_str_deadlift_120':
        progress = Math.min(120, bestDeadliftKg);
        break;
      case 'ach_str_deadlift_180':
        progress = Math.min(180, bestDeadliftKg);
        break;
      case 'ach_str_deadlift_240':
        progress = Math.min(240, bestDeadliftKg);
        break;
      case 'ach_str_overhead_60':
        progress = Math.min(60, bestOverheadKg);
        break;

      // 2. RUNNING & CARDIO
      case 'ach_run_1k':
        progress = Math.min(1, Math.round(totalDistance));
        break;
      case 'ach_run_5k':
        progress = Math.min(5, Math.round(totalDistance));
        break;
      case 'ach_run_10k':
        progress = Math.min(10, Math.round(totalDistance));
        break;
      case 'ach_run_21k':
        progress = Math.min(21, Math.round(totalDistance));
        break;
      case 'ach_run_42k':
        progress = Math.min(42, Math.round(totalDistance));
        break;
      case 'ach_run_100k':
        progress = Math.min(100, Math.round(totalDistance));
        break;
      case 'ach_run_sub25_5k':
        progress = totalDistance >= 5 ? 1 : 0;
        break;
      case 'ach_run_sub50_10k':
        progress = totalDistance >= 10 ? 1 : 0;
        break;
      case 'ach_run_incline_3':
        progress = Math.min(3, cardioSessions);
        break;
      case 'ach_run_incline_6':
        progress = Math.min(5, cardioSessions);
        break;
      case 'ach_run_outdoor_gps':
        progress = Math.min(3, cardioSessions);
        break;
      case 'ach_run_sessions_10':
        progress = Math.min(10, cardioSessions);
        break;
      case 'ach_run_sessions_30':
        progress = Math.min(30, cardioSessions);
        break;
      case 'ach_run_zone2_300':
        progress = Math.min(300, cardioSessions * 30);
        break;
      case 'ach_run_sprint_master':
        progress = Math.min(5, hiitSessions + cardioSessions);
        break;

      // 3. CALISTENIA
      case 'ach_cal_first_pullup':
        progress = Math.min(1, calisthenicsSessions + workouts);
        break;
      case 'ach_cal_pullups_10':
        progress = Math.min(10, calisthenicsSessions * 3);
        break;
      case 'ach_cal_pullups_20':
        progress = Math.min(20, calisthenicsSessions * 4);
        break;
      case 'ach_cal_pushups_20':
        progress = Math.min(20, (calisthenicsSessions + workouts) * 10);
        break;
      case 'ach_cal_pushups_50':
        progress = Math.min(50, (calisthenicsSessions + workouts) * 15);
        break;
      case 'ach_cal_pushups_100':
        progress = Math.min(100, (calisthenicsSessions + workouts) * 25);
        break;
      case 'ach_cal_dips_10':
        progress = Math.min(10, calisthenicsSessions * 4);
        break;
      case 'ach_cal_dips_25':
        progress = Math.min(25, calisthenicsSessions * 6);
        break;
      case 'ach_cal_plank_60':
        progress = Math.min(60, (calisthenicsSessions + workouts) * 20);
        break;
      case 'ach_cal_plank_180':
        progress = Math.min(180, (calisthenicsSessions + workouts) * 45);
        break;
      case 'ach_cal_abs_sessions_10':
        progress = Math.min(10, calisthenicsSessions + workouts);
        break;
      case 'ach_cal_weighted_pullup':
        progress = totalVolume > 5000 ? 1 : 0;
        break;
      case 'ach_cal_weighted_dips':
        progress = totalVolume > 8000 ? 1 : 0;
        break;
      case 'ach_cal_sessions_15':
        progress = Math.min(15, calisthenicsSessions + Math.floor(workouts / 2));
        break;
      case 'ach_cal_master':
        progress = Math.min(30, calisthenicsSessions + workouts);
        break;

      // 4. HÁBITOS
      case 'ach_hab_first_step':
        progress = Math.min(1, workouts);
        break;
      case 'ach_hab_streak_3':
        progress = Math.min(3, streak);
        break;
      case 'ach_hab_streak_7':
        progress = Math.min(7, streak);
        break;
      case 'ach_hab_streak_14':
        progress = Math.min(14, streak);
        break;
      case 'ach_hab_streak_21':
        progress = Math.min(21, streak);
        break;
      case 'ach_hab_streak_30':
        progress = Math.min(30, streak);
        break;
      case 'ach_hab_streak_60':
        progress = Math.min(60, streak);
        break;
      case 'ach_hab_streak_100':
        progress = Math.min(100, streak);
        break;
      case 'ach_hab_workouts_10':
        progress = Math.min(10, workouts);
        break;
      case 'ach_hab_workouts_25':
        progress = Math.min(25, workouts);
        break;
      case 'ach_hab_workouts_50':
        progress = Math.min(50, workouts);
        break;
      case 'ach_hab_workouts_100':
        progress = Math.min(100, workouts);
        break;
      case 'ach_hab_weekend_4':
        progress = Math.min(4, weekendWorkouts);
        break;
      case 'ach_hab_weekend_12':
        progress = Math.min(12, weekendWorkouts);
        break;
      case 'ach_hab_monthly_20':
        progress = Math.min(20, workouts);
        break;

      // 5. METABOLISMO
      case 'ach_met_cal_1k':
        progress = Math.min(1000, totalCalories);
        break;
      case 'ach_met_cal_3k':
        progress = Math.min(3000, totalCalories);
        break;
      case 'ach_met_cal_5k':
        progress = Math.min(5000, totalCalories);
        break;
      case 'ach_met_cal_10k':
        progress = Math.min(10000, totalCalories);
        break;
      case 'ach_met_cal_25k':
        progress = Math.min(25000, totalCalories);
        break;
      case 'ach_met_cal_50k':
        progress = Math.min(50000, totalCalories);
        break;
      case 'ach_met_single_500':
        progress = Math.min(500, maxCaloriesSingleSession);
        break;
      case 'ach_met_single_800':
        progress = Math.min(800, maxCaloriesSingleSession);
        break;
      case 'ach_met_hiit_3':
        progress = Math.min(3, hiitSessions);
        break;
      case 'ach_met_hiit_10':
        progress = Math.min(10, hiitSessions);
        break;
      case 'ach_met_hiit_25':
        progress = Math.min(25, hiitSessions);
        break;
      case 'ach_met_smartwatch_1':
        progress = Math.min(1, smartwatchWorkouts);
        break;
      case 'ach_met_smartwatch_10':
        progress = Math.min(10, smartwatchWorkouts);
        break;
      case 'ach_met_heart_peak':
        progress = maxBpmRecorded >= 170 ? 1 : 0;
        break;
      case 'ach_met_zone5_30':
        progress = Math.min(30, hiitSessions * 6);
        break;

      // 6. PROGRAMAS
      case 'ach_prog_custom_1':
        progress = Math.min(1, customRoutinesCount);
        break;
      case 'ach_prog_custom_5':
        progress = Math.min(5, customRoutinesCount);
        break;
      case 'ach_prog_ppl_done':
        progress = completedProgramsCount >= 1 ? 1 : 0;
        break;
      case 'ach_prog_torso_done':
        progress = completedProgramsCount >= 1 ? 1 : 0;
        break;
      case 'ach_prog_runner_done':
        progress = completedProgramsCount >= 1 ? 1 : 0;
        break;
      case 'ach_prog_cycles_3':
        progress = Math.min(3, completedProgramsCount);
        break;
      case 'ach_prog_cycles_10':
        progress = Math.min(10, completedProgramsCount);
        break;
      case 'ach_prog_hybrid_1':
        progress = (workouts > 0 && cardioSessions > 0) ? 3 : Math.min(2, workouts);
        break;
      case 'ach_prog_hybrid_pro':
        progress = Math.min(30, workouts + cardioSessions + calisthenicsSessions);
        break;
      case 'ach_prog_comm_1':
        progress = Math.min(1, claimedChallengesCount);
        break;
      case 'ach_prog_comm_5':
        progress = Math.min(5, claimedChallengesCount);
        break;
      case 'ach_prog_comm_15':
        progress = Math.min(15, claimedChallengesCount);
        break;
      case 'ach_prog_all_muscles':
        progress = Math.min(6, workouts >= 6 ? 6 : workouts);
        break;
      case 'ach_prog_notes_10':
        progress = Math.min(10, workoutsWithNotes);
        break;
      case 'ach_prog_perfect_rate':
        progress = Math.min(10, fiveStarWorkouts);
        break;

      // 7. SECRETOS
      case 'ach_sec_early_bird':
        progress = workouts >= 1 ? 1 : 0;
        break;
      case 'ach_sec_night_owl':
        progress = workouts >= 2 ? 1 : 0;
        break;
      case 'ach_sec_double_session':
        progress = maxWorkoutsInSingleDay >= 2 ? 1 : 0;
        break;
      case 'ach_sec_marathon_session':
        progress = maxDurationSingleSession >= 60 ? 1 : 0;
        break;
      case 'ach_sec_heavy_single_session':
        progress = maxVolumeSingleSession >= 10000 ? 1 : 0;
        break;
      case 'ach_sec_quick_speed_run':
        progress = workouts >= 1 ? 1 : 0;
        break;
      case 'ach_sec_new_year':
        progress = workouts >= 3 ? 1 : 0;
        break;
      case 'ach_sec_level_20':
        progress = Math.min(20, userLevel);
        break;
      case 'ach_sec_level_50':
        progress = Math.min(50, userLevel);
        break;
      case 'ach_sec_perfectionist':
        progress = Math.min(15, workouts);
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
      unlocked,
      unlockedAt: unlocked ? (existing?.unlockedAt || new Date().toISOString()) : undefined,
    };
  });
}
