import { BossRaid, BossContribution, UserProfile } from '../types';

const BOSS_STORAGE_KEY = 'fitquest_monthly_boss_raid';
const BOSS_CONTRIBUTIONS_KEY = 'fitquest_monthly_boss_contributions';

/**
 * Returns current month identifier in YYYY-MM format
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCurrentMonthName(): string {
  const now = new Date();
  return now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

/**
 * Monthly Boss Raid Master Catalog
 */
const BOSS_CATALOG: Record<string, Omit<BossRaid, 'currentDamageKg' | 'status'>> = {
  '2026-10': {
    id: '2026-10',
    name: 'Coloso Vulcano de Magma',
    month: 'Octubre 2026',
    description: 'Un descomunal gólem forjado con placas de titanio y roca ígnea. Toda la comunidad de FitQuest debe aunar su tonelaje levantado para derribarlo antes de que acabe el mes.',
    maxHpKg: 350000, // 350 Toneladas
    avatar: '🌋',
    element: 'Fuego y Metal',
    rewardBadgeId: 'boss_slayer_oct_2026',
    rewardBadgeName: 'Destructor del Coloso Vulcano',
    rewardXp: 500,
  },
  'default': {
    id: 'default',
    name: 'Gólem de Acero Primordial',
    month: 'Mensual',
    description: 'Guardián milenario del templo del hierro. Suma el tonelaje de tus entrenamientos con el de toda la comunidad para derrotarlo.',
    maxHpKg: 300000,
    avatar: '🗿',
    element: 'Tierra y Hierro',
    rewardBadgeId: 'boss_slayer_monthly',
    rewardBadgeName: 'Vencedor del Gólem Primordial',
    rewardXp: 400,
  },
};

/**
 * Retrieves the active monthly boss raid state.
 */
export function getActiveBossRaid(): BossRaid {
  const monthKey = getCurrentMonthKey();
  const template = BOSS_CATALOG[monthKey] || {
    ...BOSS_CATALOG['default'],
    id: monthKey,
    month: getCurrentMonthName(),
  };

  try {
    const raw = localStorage.getItem(`${BOSS_STORAGE_KEY}_${monthKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...template,
        ...parsed,
      };
    }
  } catch (e) {
    console.warn('Error reading boss raid from storage:', e);
  }

  // Initial simulated community baseline progress based on day of month (approx 35-55% mid-month)
  const dayOfMonth = new Date().getDate();
  const simulatedCommunityBaseline = Math.min(
    template.maxHpKg * 0.85,
    Math.round((dayOfMonth / 31) * (template.maxHpKg * 0.65) + 45000)
  );

  const initialBoss: BossRaid = {
    ...template,
    currentDamageKg: simulatedCommunityBaseline,
    status: simulatedCommunityBaseline >= template.maxHpKg ? 'defeated' : 'active',
  };

  saveActiveBossRaid(initialBoss);
  return initialBoss;
}

export function saveActiveBossRaid(boss: BossRaid): void {
  try {
    const monthKey = getCurrentMonthKey();
    localStorage.setItem(`${BOSS_STORAGE_KEY}_${monthKey}`, JSON.stringify(boss));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fitquest_boss_updated', { detail: boss }));
    }
  } catch (e) {
    console.error('Failed to save boss raid:', e);
  }
}

/**
 * Retrieves community contributions for this raid
 */
export function getBossContributions(user?: UserProfile): BossContribution[] {
  const monthKey = getCurrentMonthKey();
  const defaultSquad: BossContribution[] = [
    {
      userId: 'bot_t1',
      userName: 'Kratos_Gym',
      userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
      damageKg: 48500,
      attacksCount: 16,
    },
    {
      userId: 'bot_d1',
      userName: 'Hector_Titan',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      damageKg: 34200,
      attacksCount: 14,
    },
    {
      userId: 'bot_t2',
      userName: 'Athena_Olympus',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      damageKg: 29800,
      attacksCount: 12,
    },
    {
      userId: 'bot_g1',
      userName: 'Valeria_Iron',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      damageKg: 21500,
      attacksCount: 10,
    },
    {
      userId: 'bot_d2',
      userName: 'Paula_Apex',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      damageKg: 18400,
      attacksCount: 9,
    },
  ];

  try {
    const raw = localStorage.getItem(`${BOSS_CONTRIBUTIONS_KEY}_${monthKey}`);
    if (raw) {
      const saved = JSON.parse(raw) as BossContribution[];
      if (Array.isArray(saved) && saved.length > 0) {
        return saved.sort((a, b) => b.damageKg - a.damageKg);
      }
    }
  } catch (e) {
    console.warn('Error reading boss contributions:', e);
  }

  // If user provided, add user initial record if not present
  if (user) {
    const userContrib: BossContribution = {
      userId: user.id || 'current_user',
      userName: user.name || 'Tú',
      userAvatar: user.avatar,
      damageKg: Math.min(15000, user.stats?.totalVolumeKg || 0),
      attacksCount: Math.min(6, user.stats?.totalWorkouts || 1),
    };
    defaultSquad.push(userContrib);
  }

  return defaultSquad.sort((a, b) => b.damageKg - a.damageKg);
}

/**
 * Applies damage to the boss when the user completes a workout
 */
export function attackBossRaid(
  volumeKg: number,
  user: UserProfile
): { boss: BossRaid; justDefeated: boolean; userDamage: number } {
  const currentBoss = getActiveBossRaid();
  const safeVolume = Math.max(50, Math.round(volumeKg));
  const previousDamage = currentBoss.currentDamageKg;
  const newDamage = Math.min(currentBoss.maxHpKg, previousDamage + safeVolume);
  const justDefeated = previousDamage < currentBoss.maxHpKg && newDamage >= currentBoss.maxHpKg;

  const updatedBoss: BossRaid = {
    ...currentBoss,
    currentDamageKg: newDamage,
    status: newDamage >= currentBoss.maxHpKg ? 'defeated' : 'active',
  };

  saveActiveBossRaid(updatedBoss);

  // Update squad contributions
  const contributions = getBossContributions(user);
  const userEntryIndex = contributions.findIndex(
    (c) => c.userId === user.id || c.userName === user.name
  );

  if (userEntryIndex >= 0) {
    contributions[userEntryIndex].damageKg += safeVolume;
    contributions[userEntryIndex].attacksCount += 1;
    contributions[userEntryIndex].userAvatar = user.avatar;
    contributions[userEntryIndex].userName = user.name;
  } else {
    contributions.push({
      userId: user.id || 'current_user',
      userName: user.name,
      userAvatar: user.avatar,
      damageKg: safeVolume,
      attacksCount: 1,
    });
  }

  const monthKey = getCurrentMonthKey();
  try {
    localStorage.setItem(
      `${BOSS_CONTRIBUTIONS_KEY}_${monthKey}`,
      JSON.stringify(contributions.sort((a, b) => b.damageKg - a.damageKg))
    );
  } catch (e) {
    console.warn('Error saving boss contributions:', e);
  }

  return { boss: updatedBoss, justDefeated, userDamage: safeVolume };
}
