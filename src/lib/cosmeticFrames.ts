import { UserProfile, AvatarFrame } from '../types';

export const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: 'frame_default',
    name: 'Hierro Forjado',
    description: 'El clásico marco de acero templado para todo atleta iniciado.',
    borderClass: 'border-neutral-500/50',
    glowClass: 'shadow-lg shadow-black/60',
    badgeEmoji: '🛡️',
    unlockRequirement: 'Desbloqueado desde el inicio',
  },
  {
    id: 'frame_cyber_neon',
    name: 'Neón Cyberpunk',
    description: 'Pulso de energía bioluminiscente color esmeralda.',
    borderClass: 'border-emerald-400 ring-2 ring-emerald-400/50',
    glowClass: 'shadow-[0_0_20px_rgba(52,211,153,0.6)] animate-pulse',
    badgeEmoji: '⚡',
    unlockRequirement: 'Alcanzar Nivel 5',
  },
  {
    id: 'frame_thunder',
    name: 'Relámpago de Racha',
    description: 'Descargas voltaicas cian que premian la consistencia férrea.',
    borderClass: 'border-cyan-400 ring-2 ring-cyan-400/60',
    glowClass: 'shadow-[0_0_22px_rgba(34,211,238,0.7)]',
    badgeEmoji: '⚡',
    unlockRequirement: 'Tener una racha de al menos 7 días',
  },
  {
    id: 'frame_gold_champion',
    name: 'Oro de Gladiador',
    description: 'Aura dorada de campeón para atletas de alta competición.',
    borderClass: 'border-amber-400 ring-2 ring-amber-300',
    glowClass: 'shadow-[0_0_25px_rgba(251,191,36,0.75)]',
    badgeEmoji: '👑',
    unlockRequirement: 'Alcanzar Liga Diamante o Titán',
  },
  {
    id: 'frame_crimson_beast',
    name: 'Llama Carmesí Berserker',
    description: 'Fuego ardiente para guerreros que nunca se rinden.',
    borderClass: 'border-rose-500 ring-2 ring-rose-500/70',
    glowClass: 'shadow-[0_0_24px_rgba(244,63,94,0.8)] animate-pulse',
    badgeEmoji: '🔥',
    unlockRequirement: 'Completar 15 o más entrenamientos',
  },
  {
    id: 'frame_titanium_colossus',
    name: 'Coloso de Titanio',
    description: 'Resplandor cósmico púrpura para los titanes del tonelaje.',
    borderClass: 'border-purple-400 ring-2 ring-purple-500/80',
    glowClass: 'shadow-[0_0_30px_rgba(168,85,247,0.85)]',
    badgeEmoji: '🌌',
    unlockRequirement: 'Levantar 30,000 kg o más de volumen total',
  },
];

export function isFrameUnlocked(frameId: string, user: UserProfile): boolean {
  if (frameId === 'frame_default') return true;

  const totalWorkouts = user.stats?.totalWorkouts || 0;
  const totalVolume = user.stats?.totalVolumeKg || 0;
  const currentStreak = user.stats?.currentStreak || 0;
  const bestStreak = user.stats?.bestStreak || 0;
  const level = user.level || 1;
  const league = user.league || 'Bronze';

  switch (frameId) {
    case 'frame_cyber_neon':
      return level >= 5;
    case 'frame_thunder':
      return currentStreak >= 7 || bestStreak >= 7;
    case 'frame_gold_champion':
      return league === 'Diamond' || league === 'Titan';
    case 'frame_crimson_beast':
      return totalWorkouts >= 15;
    case 'frame_titanium_colossus':
      return totalVolume >= 30000;
    default:
      return false;
  }
}

export function getEquippedFrameClasses(user: UserProfile): { borderClass: string; glowClass: string } {
  const frameId = user.equippedFrame || 'frame_default';
  const found = AVATAR_FRAMES.find((f) => f.id === frameId);
  if (!found) {
    return {
      borderClass: 'border-white/10',
      glowClass: 'shadow-lg shadow-black/50',
    };
  }
  return {
    borderClass: found.borderClass,
    glowClass: found.glowClass,
  };
}
