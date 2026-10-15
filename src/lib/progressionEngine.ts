export type PrestigeTier = 'bronze' | 'neon' | 'gold' | 'diamond' | 'cosmic';

export interface LevelTierInfo {
  id: PrestigeTier;
  name: string;
  minLevel: number;
  maxLevel: number;
  badgeIcon: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  textGradient: string;
  accentColor: string;
  frameClass: string;
  description: string;
}

export interface LevelMilestone {
  level: number;
  tier: PrestigeTier;
  title: string;
  rewardType: 'title' | 'frame' | 'badge' | 'perk';
  rewardLabel: string;
  description: string;
  icon: string;
  unlockedPerk?: string;
}

export const PRESTIGE_TIERS: Record<PrestigeTier, LevelTierInfo> = {
  bronze: {
    id: 'bronze',
    name: 'Recluta de Bronce',
    minLevel: 1,
    maxLevel: 5,
    badgeIcon: '🥉',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    borderColor: 'border-amber-600/60',
    bgGradient: 'from-amber-950/40 via-neutral-900 to-amber-900/20',
    textGradient: 'from-amber-300 to-amber-500',
    accentColor: '#d97706',
    frameClass: 'ring-2 ring-amber-500/50 shadow-[0_0_15px_rgba(217,119,6,0.3)]',
    description: 'Los primeros pasos en la forja. Disciplina diaria y fundamentos de hierro.',
  },
  neon: {
    id: 'neon',
    name: 'Guerrero Cibernético',
    minLevel: 6,
    maxLevel: 12,
    badgeIcon: '⚡',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    borderColor: 'border-cyan-500/60',
    bgGradient: 'from-cyan-950/40 via-neutral-900 to-blue-950/30',
    textGradient: 'from-cyan-300 via-teal-200 to-blue-400',
    accentColor: '#06b6d4',
    frameClass: 'ring-2 ring-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    description: 'Sobrecarga progresiva activada. Tu cuerpo se adapta a la intensidad del Cyber Matrix.',
  },
  gold: {
    id: 'gold',
    name: 'Centurión Titánico',
    minLevel: 13,
    maxLevel: 20,
    badgeIcon: '🥇',
    glowColor: 'rgba(234, 179, 8, 0.5)',
    borderColor: 'border-yellow-500/70',
    bgGradient: 'from-yellow-950/40 via-neutral-900 to-amber-950/30',
    textGradient: 'from-yellow-300 via-amber-200 to-yellow-500',
    accentColor: '#eab308',
    frameClass: 'ring-2 ring-yellow-400/80 shadow-[0_0_25px_rgba(234,179,8,0.5)]',
    description: 'Fuerza colosal y hábitos inquebrantables. Eres un referente en el gimnasio.',
  },
  diamond: {
    id: 'diamond',
    name: 'Dominador Diamante',
    minLevel: 21,
    maxLevel: 35,
    badgeIcon: '💎',
    glowColor: 'rgba(168, 85, 247, 0.55)',
    borderColor: 'border-purple-500/70',
    bgGradient: 'from-purple-950/40 via-neutral-900 to-cyan-950/30',
    textGradient: 'from-purple-300 via-fuchsia-200 to-cyan-400',
    accentColor: '#a855f7',
    frameClass: 'ring-2 ring-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    description: 'Mente y cuerpo cristalizados como el diamante. Récords personales pulverizados.',
  },
  cosmic: {
    id: 'cosmic',
    name: 'Leyenda Cyberpunk',
    minLevel: 36,
    maxLevel: 999,
    badgeIcon: '🌌',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    borderColor: 'border-rose-500/80',
    bgGradient: 'from-rose-950/50 via-neutral-900 to-violet-950/40',
    textGradient: 'from-rose-400 via-pink-300 to-violet-400',
    accentColor: '#f43f5e',
    frameClass: 'ring-2 ring-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.6)] animate-pulse',
    description: 'Nivel legendario. Tu constancia ha trascendido todos los límites terrenales.',
  },
};

export const LEVEL_MILESTONES: LevelMilestone[] = [
  {
    level: 1,
    tier: 'bronze',
    title: 'Recluta Inicial',
    rewardType: 'title',
    rewardLabel: 'Título: Recluta Inicial',
    description: 'Comienza tu viaje en FitQuest Pro.',
    icon: '🥉',
    unlockedPerk: 'Insignia de Cadete de Hierro',
  },
  {
    level: 3,
    tier: 'bronze',
    title: 'Iniciado del Hierro',
    rewardType: 'title',
    rewardLabel: 'Título: Iniciado del Hierro',
    description: 'Consolida tu técnica en los ejercicios básicos.',
    icon: '⚡',
    unlockedPerk: '+3 Disciplina Mental',
  },
  {
    level: 5,
    tier: 'bronze',
    title: 'Guerrero de Bronce',
    rewardType: 'frame',
    rewardLabel: 'Marco Bronce Forjado + Título',
    description: 'Graduación de Recluta. Desbloquea el marco de avatar de bronce.',
    icon: '🛡️',
    unlockedPerk: 'Marco de Avatar Bronce',
  },
  {
    level: 7,
    tier: 'neon',
    title: 'Gladiador del Acero',
    rewardType: 'title',
    rewardLabel: 'Título: Gladiador del Acero',
    description: 'Entrada oficial al Rango Cyberpunk. Fuerza en sobrecarga.',
    icon: '⚔️',
    unlockedPerk: '+5 Fuerza Muscular',
  },
  {
    level: 10,
    tier: 'neon',
    title: 'Atleta de Plata Cyberpunk',
    rewardType: 'frame',
    rewardLabel: 'Marco Neón Cyan + Título',
    description: 'Alcanza la primera decena de niveles. Marco cian con brillo activo.',
    icon: '🥈',
    unlockedPerk: 'Marco Neón Cyan Pulsante',
  },
  {
    level: 12,
    tier: 'neon',
    title: 'Vanguardia del Olimpo',
    rewardType: 'title',
    rewardLabel: 'Título: Vanguardia del Olimpo',
    description: 'Tu resistencia aeróbica y anaeróbica no tiene rival.',
    icon: '🚀',
    unlockedPerk: '+5 Resistencia Cardiovascular',
  },
  {
    level: 14,
    tier: 'gold',
    title: 'Levantador Titánico',
    rewardType: 'title',
    rewardLabel: 'Título: Levantador Titánico',
    description: 'Ascenso a la élite de los atletas que mueven toneladas.',
    icon: '🏋️',
    unlockedPerk: 'Insignia Dorada de Fuerza',
  },
  {
    level: 15,
    tier: 'gold',
    title: 'Centurión de Oro',
    rewardType: 'frame',
    rewardLabel: 'Marco Áureo Fénix + Título',
    description: 'Hito legendario. Desbloquea el marco dorado para tu avatar.',
    icon: '🥇',
    unlockedPerk: 'Marco de Oro Fénix',
  },
  {
    level: 18,
    tier: 'gold',
    title: 'Maestro de la Forja',
    rewardType: 'title',
    rewardLabel: 'Título: Maestro de la Forja',
    description: 'Dominio absoluto de la rutina, hidratación y nutrición.',
    icon: '🔨',
    unlockedPerk: '+5 Agilidad & Control',
  },
  {
    level: 20,
    tier: 'gold',
    title: 'Titán Inamovible',
    rewardType: 'badge',
    rewardLabel: 'Insignia Centurión + Título',
    description: 'Récord de constancia. El Olimpo te reconoce como Titán.',
    icon: '👑',
    unlockedPerk: 'Insignia Corona Mítica',
  },
  {
    level: 25,
    tier: 'diamond',
    title: 'Mente de Diamante',
    rewardType: 'frame',
    rewardLabel: 'Marco Diamante Glacial + Título',
    description: 'Tu mente domina al músculo en cada serie al fallo.',
    icon: '💎',
    unlockedPerk: 'Marco Diamante Púrpura Glacial',
  },
  {
    level: 30,
    tier: 'diamond',
    title: 'Hércules del Hierro',
    rewardType: 'title',
    rewardLabel: 'Título: Hércules del Hierro',
    description: 'Fuerza legendaria respetada por toda la comunidad.',
    icon: '🦁',
    unlockedPerk: '+10 Atributos Totales',
  },
  {
    level: 35,
    tier: 'diamond',
    title: 'Coloso Indomable',
    rewardType: 'title',
    rewardLabel: 'Título: Coloso Indomable',
    description: 'Has superado el 99% de atletas de la plataforma.',
    icon: '🗿',
    unlockedPerk: 'Insignia Coloso Élite',
  },
  {
    level: 40,
    tier: 'cosmic',
    title: 'Dios de la Forja Cyberpunk',
    rewardType: 'frame',
    rewardLabel: 'Marco Cósmico Mítico + Título',
    description: 'El pináculo del acondicionamiento físico y la disciplina.',
    icon: '🌌',
    unlockedPerk: 'Marco Cósmico Holográfico Animado',
  },
  {
    level: 50,
    tier: 'cosmic',
    title: 'Leyenda Suprema Inmortal',
    rewardType: 'title',
    rewardLabel: 'Título: Leyenda Suprema Inmortal',
    description: 'Rango máximo de FitQuest Pro. Estado físico y mental perfecto.',
    icon: '🌠',
    unlockedPerk: 'Estatus Inmortal FitQuest',
  },
];

/**
 * Devuelve la información del prestigio/rango según el nivel numérico
 */
export function getLevelTier(level: number): LevelTierInfo {
  if (level >= 36) return PRESTIGE_TIERS.cosmic;
  if (level >= 21) return PRESTIGE_TIERS.diamond;
  if (level >= 13) return PRESTIGE_TIERS.gold;
  if (level >= 6) return PRESTIGE_TIERS.neon;
  return PRESTIGE_TIERS.bronze;
}

/**
 * Devuelve el próximo hito de recompensa desbloqueable para el usuario
 */
export function getNextMilestone(currentLevel: number): LevelMilestone {
  const next = LEVEL_MILESTONES.find((m) => m.level > currentLevel);
  if (next) return next;
  return LEVEL_MILESTONES[LEVEL_MILESTONES.length - 1];
}

/**
 * Devuelve todos los títulos que el usuario ya ha desbloqueado por su nivel
 */
export function getUnlockedLevelTitles(currentLevel: number): LevelMilestone[] {
  return LEVEL_MILESTONES.filter((m) => m.level <= currentLevel);
}

/**
 * Devuelve el porcentaje de avance dentro del nivel actual hacia el siguiente
 */
export function getXpProgressPercent(currentXp: number, nextXp: number): number {
  if (!nextXp || nextXp <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((currentXp / nextXp) * 100)));
}
