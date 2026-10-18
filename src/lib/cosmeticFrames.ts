import { UserProfile, AvatarFrame, League } from '../types';

export const AVATAR_FRAMES: AvatarFrame[] = [
  // 1. Inicial / Nivel Básico
  {
    id: 'frame_default',
    name: 'Hierro Forjado',
    description: 'Acero templado pulido para todo atleta forjado en el gimnasio.',
    borderClass: 'border-slate-300 ring-2 ring-slate-400/60',
    glowClass: 'shadow-[0_0_15px_rgba(148,163,184,0.45)]',
    badgeEmoji: '🛡️',
    unlockRequirement: 'Desbloqueado desde el inicio',
  },
  {
    id: 'frame_bronze_rookie',
    name: 'Bronce del Iniciado',
    description: 'Aleación de bronce bruñido que conmemora los primeros pasos.',
    borderClass: 'border-amber-700 ring-2 ring-amber-600/70',
    glowClass: 'shadow-[0_0_14px_rgba(180,83,9,0.45)]',
    badgeEmoji: '🥉',
    unlockRequirement: 'Alcanzar Nivel 3',
  },
  {
    id: 'frame_cyber_neon',
    name: 'Neón Cyberpunk',
    description: 'Pulso de energía bioluminiscente color esmeralda.',
    borderClass: 'border-emerald-400 ring-2 ring-emerald-400/60',
    glowClass: 'shadow-[0_0_20px_rgba(52,211,153,0.6)] animate-pulse',
    badgeEmoji: '⚡',
    unlockRequirement: 'Alcanzar Nivel 5',
  },
  {
    id: 'frame_cobalt_striker',
    name: 'Cobalto Táctico',
    description: 'Resplandor azul cobalto militar electrizante.',
    borderClass: 'border-blue-500 ring-2 ring-blue-400/70',
    glowClass: 'shadow-[0_0_18px_rgba(59,130,246,0.55)]',
    badgeEmoji: '🔵',
    unlockRequirement: 'Alcanzar Nivel 7',
  },
  {
    id: 'frame_stealth_shadow',
    name: 'Sombra Ninja Black Ops',
    description: 'Carbono mate con halo violeta sigiloso.',
    borderClass: 'border-zinc-300 ring-2 ring-violet-500/60',
    glowClass: 'shadow-[0_0_18px_rgba(139,92,246,0.45)]',
    badgeEmoji: '🥷',
    unlockRequirement: 'Alcanzar Nivel 8',
  },
  {
    id: 'frame_solar_flare',
    name: 'Llamarada Solar',
    description: 'Fuego coronal naranja y amarillo de alta potencia calórica.',
    borderClass: 'border-orange-400 ring-2 ring-amber-500/80',
    glowClass: 'shadow-[0_0_22px_rgba(249,115,22,0.65)] animate-pulse',
    badgeEmoji: '☀️',
    unlockRequirement: 'Alcanzar Nivel 10',
  },
  {
    id: 'frame_amethyst_ascension',
    name: 'Amatista Mística',
    description: 'Aura púrpura etérea para atletas consagrados.',
    borderClass: 'border-purple-400 ring-2 ring-fuchsia-500/70',
    glowClass: 'shadow-[0_0_24px_rgba(192,38,211,0.65)]',
    badgeEmoji: '🔮',
    unlockRequirement: 'Alcanzar Nivel 15',
  },
  {
    id: 'frame_master_ruby',
    name: 'Rubí Gran Maestro',
    description: 'Corona carmesí de destellos para los maestros de la disciplina.',
    borderClass: 'border-red-500 ring-2 ring-rose-400/80',
    glowClass: 'shadow-[0_0_26px_rgba(239,68,68,0.75)] animate-pulse',
    badgeEmoji: '💎',
    unlockRequirement: 'Alcanzar Nivel 20',
  },
  {
    id: 'frame_celestial_god',
    name: 'Aura Celestial Suprema',
    description: 'Resplandor divino blanco platino reservado a las leyendas.',
    borderClass: 'border-white ring-2 ring-amber-200',
    glowClass: 'shadow-[0_0_30px_rgba(255,255,255,0.85)] animate-pulse',
    badgeEmoji: '🌌',
    unlockRequirement: 'Alcanzar Nivel 30',
  },

  // 2. Racha & Constancia
  {
    id: 'frame_spark_streak',
    name: 'Chispa de Constancia',
    description: 'Aura ámbar cálida encendida por tus primeros días seguidos.',
    borderClass: 'border-amber-300 ring-2 ring-yellow-400/50',
    glowClass: 'shadow-[0_0_15px_rgba(250,204,21,0.45)]',
    badgeEmoji: '🕯️',
    unlockRequirement: 'Mantener una racha de al menos 3 días',
  },
  {
    id: 'frame_thunder',
    name: 'Relámpago de Racha',
    description: 'Descargas voltaicas cian que premian una semana ininterrumpida.',
    borderClass: 'border-cyan-400 ring-2 ring-cyan-400/70',
    glowClass: 'shadow-[0_0_22px_rgba(34,211,238,0.75)]',
    badgeEmoji: '⚡',
    unlockRequirement: 'Mantener una racha de al menos 7 días',
  },
  {
    id: 'frame_hyper_streak',
    name: 'Tormenta Voltaica',
    description: 'Fusión de rayos índigo y cian para rachas de dos semanas.',
    borderClass: 'border-indigo-400 ring-2 ring-cyan-300/80',
    glowClass: 'shadow-[0_0_25px_rgba(99,102,241,0.75)] animate-pulse',
    badgeEmoji: '🌪️',
    unlockRequirement: 'Mantener una racha de al menos 14 días',
  },
  {
    id: 'frame_eternal_flame',
    name: 'Fuego Eterno de la Racha',
    description: 'Llama sagrada imbatible que premia un mes de pura disciplina.',
    borderClass: 'border-amber-400 ring-2 ring-rose-500',
    glowClass: 'shadow-[0_0_28px_rgba(245,158,11,0.85)] animate-pulse',
    badgeEmoji: '♾️',
    unlockRequirement: 'Mantener una racha de al menos 30 días',
  },

  // 3. Tonelaje & Fuerza
  {
    id: 'frame_iron_crusher',
    name: 'Triturador de Hierro',
    description: 'Acero con reflejos esmeralda oscura forjados levantando toneladas.',
    borderClass: 'border-teal-400 ring-2 ring-slate-400/60',
    glowClass: 'shadow-[0_0_18px_rgba(20,184,166,0.5)]',
    badgeEmoji: '⚙️',
    unlockRequirement: 'Levantar 10.000 kg o más de volumen total',
  },
  {
    id: 'frame_titanium_colossus',
    name: 'Coloso de Titanio',
    description: 'Resplandor cósmico púrpura para los titanes del tonelaje.',
    borderClass: 'border-purple-400 ring-2 ring-purple-500/80',
    glowClass: 'shadow-[0_0_30px_rgba(168,85,247,0.85)]',
    badgeEmoji: '🪐',
    unlockRequirement: 'Levantar 30.000 kg o más de volumen total',
  },
  {
    id: 'frame_gravity_singularity',
    name: 'Singularidad Gravitatoria',
    description: 'Distorsión cósmica para atletas que han movido más de 100 toneladas.',
    borderClass: 'border-pink-500 ring-2 ring-cyan-400',
    glowClass: 'shadow-[0_0_32px_rgba(236,72,153,0.85)] animate-pulse',
    badgeEmoji: '🕳️',
    unlockRequirement: 'Levantar 100.000 kg o más de volumen total',
  },

  // 4. Entrenamientos Completados
  {
    id: 'frame_first_blood',
    name: 'Bautismo de Fuego',
    description: 'El sello de compromiso tras tus primeras 5 batallas de entrenamiento.',
    borderClass: 'border-red-400 ring-2 ring-red-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(248,113,113,0.45)]',
    badgeEmoji: '🩸',
    unlockRequirement: 'Completar al menos 5 entrenamientos',
  },
  {
    id: 'frame_crimson_beast',
    name: 'Llama Berserker',
    description: 'Fuego ardiente para guerreros que nunca se rinden.',
    borderClass: 'border-rose-500 ring-2 ring-rose-500/70',
    glowClass: 'shadow-[0_0_24px_rgba(244,63,94,0.8)] animate-pulse',
    badgeEmoji: '👹',
    unlockRequirement: 'Completar al menos 15 entrenamientos',
  },
  {
    id: 'frame_centurion_veteran',
    name: 'Centurión de la Arena',
    description: 'Corona dorada imperial para veteranos con 30 batallas completadas.',
    borderClass: 'border-yellow-500 ring-2 ring-amber-600/70',
    glowClass: 'shadow-[0_0_22px_rgba(202,138,4,0.65)]',
    badgeEmoji: '🏛️',
    unlockRequirement: 'Completar al menos 30 entrenamientos',
  },

  // 5. Ligas Competitivas
  {
    id: 'frame_silver_challenger',
    name: 'Retador Plateado',
    description: 'Plata cromada pulida para atletas ascendidos a Liga Plata o superior.',
    borderClass: 'border-slate-200 ring-2 ring-cyan-200/60',
    glowClass: 'shadow-[0_0_18px_rgba(226,232,240,0.55)]',
    badgeEmoji: '🥈',
    unlockRequirement: 'Alcanzar Liga Plata o superior',
  },
  {
    id: 'frame_gold_champion',
    name: 'Oro de Gladiador',
    description: 'Aura dorada de campeón para atletas de alta competición.',
    borderClass: 'border-amber-400 ring-2 ring-amber-300',
    glowClass: 'shadow-[0_0_25px_rgba(251,191,36,0.75)]',
    badgeEmoji: '👑',
    unlockRequirement: 'Alcanzar Liga Oro o superior',
  },
  {
    id: 'frame_diamond_paragon',
    name: 'Parangón de Diamante',
    description: 'Cristal celeste reflectante para la élite de Diamante y Titán.',
    borderClass: 'border-sky-300 ring-2 ring-cyan-400',
    glowClass: 'shadow-[0_0_30px_rgba(56,189,248,0.85)] animate-pulse',
    badgeEmoji: '🔷',
    unlockRequirement: 'Alcanzar Liga Diamante o Titán',
  },
  {
    id: 'frame_titan_overlord',
    name: 'Señor Supremo Titán',
    description: 'Lava primordial y oro regio exclusivo para la cúspide de la Liga Titán.',
    borderClass: 'border-rose-500 ring-2 ring-amber-400',
    glowClass: 'shadow-[0_0_35px_rgba(244,63,94,0.95)] animate-pulse',
    badgeEmoji: '🌋',
    unlockRequirement: 'Alcanzar la prestigiosa Liga Titán',
  },
];

const LEAGUE_LEVELS: Record<League, number> = {
  Bronze: 1,
  Silver: 2,
  Gold: 3,
  Diamond: 4,
  Titan: 5,
};

export function isFrameUnlocked(frameId: string, user: UserProfile): boolean {
  if (frameId === 'frame_default') return true;

  const totalWorkouts = user.stats?.totalWorkouts || 0;
  const totalVolume = user.stats?.totalVolumeKg || 0;
  const currentStreak = user.stats?.currentStreak || 0;
  const bestStreak = user.stats?.bestStreak || 0;
  const effectiveStreak = Math.max(currentStreak, bestStreak);
  const level = user.level || 1;
  const userLeague = (user.league || 'Bronze') as League;
  const leagueScore = LEAGUE_LEVELS[userLeague] || 1;

  switch (frameId) {
    // Niveles
    case 'frame_bronze_rookie':
      return level >= 3;
    case 'frame_cyber_neon':
      return level >= 5;
    case 'frame_cobalt_striker':
      return level >= 7;
    case 'frame_stealth_shadow':
      return level >= 8;
    case 'frame_solar_flare':
      return level >= 10;
    case 'frame_amethyst_ascension':
      return level >= 15;
    case 'frame_master_ruby':
      return level >= 20;
    case 'frame_celestial_god':
      return level >= 30;

    // Rachas
    case 'frame_spark_streak':
      return effectiveStreak >= 3;
    case 'frame_thunder':
      return effectiveStreak >= 7;
    case 'frame_hyper_streak':
      return effectiveStreak >= 14;
    case 'frame_eternal_flame':
      return effectiveStreak >= 30;

    // Tonelaje / Volumen
    case 'frame_iron_crusher':
      return totalVolume >= 10000;
    case 'frame_titanium_colossus':
      return totalVolume >= 30000;
    case 'frame_gravity_singularity':
      return totalVolume >= 100000;

    // Entrenamientos
    case 'frame_first_blood':
      return totalWorkouts >= 5;
    case 'frame_crimson_beast':
      return totalWorkouts >= 15;
    case 'frame_centurion_veteran':
      return totalWorkouts >= 30;

    // Ligas
    case 'frame_silver_challenger':
      return leagueScore >= LEAGUE_LEVELS['Silver'];
    case 'frame_gold_champion':
      return leagueScore >= LEAGUE_LEVELS['Gold'];
    case 'frame_diamond_paragon':
      return leagueScore >= LEAGUE_LEVELS['Diamond'];
    case 'frame_titan_overlord':
      return leagueScore >= LEAGUE_LEVELS['Titan'];

    default:
      return false;
  }
}

export function getFrameById(frameId?: string): AvatarFrame {
  const id = frameId || 'frame_default';
  return AVATAR_FRAMES.find((f) => f.id === id) || AVATAR_FRAMES[0];
}

export function getEquippedFrameClasses(target: UserProfile | string | undefined): { borderClass: string; glowClass: string } {
  const frameId = typeof target === 'string' ? target : target?.equippedFrame || 'frame_default';
  const found = getFrameById(frameId);
  return {
    borderClass: found.borderClass,
    glowClass: found.glowClass,
  };
}
