import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Activity,
  Trophy,
  Dumbbell,
  BarChart3,
  Watch,
  Settings,
  Cloud,
  CloudOff,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  LogIn,
  LogOut,
  UserCheck,
  Heart,
  UtensilsCrossed,
  Shield,
} from 'lucide-react';
import { UserProfile, ThemeMode, Language, SmartwatchDevice } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';
import { getLevelTier, getXpProgressPercent } from '../lib/progressionEngine';
import { getEquippedFrameClasses } from '../lib/cosmeticFrames';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  user: UserProfile;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isSoundMuted?: boolean;
  setIsSoundMuted?: (muted: boolean) => void;
  toggleSound?: () => void;
  isOffline?: boolean;
  setIsOffline?: (offline: boolean) => void;
  toggleOffline?: () => void;
  smartwatch?: SmartwatchDevice;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
  onOpenQuickStart?: () => void;
  onOpenProfileModal?: () => void;
  onOpenLevelRoadmap?: () => void;
  isAuthenticated?: boolean;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab: propCurrentTab,
  activeTab,
  setCurrentTab: propSetCurrentTab,
  setActiveTab,
  user,
  lang,
  setLang,
  theme,
  setTheme,
  isSoundMuted = false,
  setIsSoundMuted,
  toggleSound,
  isOffline = false,
  setIsOffline,
  toggleOffline,
  smartwatch,
  unreadNotifications = 0,
  onOpenNotifications,
  onOpenQuickStart,
  onOpenProfileModal,
  onOpenLevelRoadmap,
  isAuthenticated = false,
  onOpenAuthModal,
  onSignOut,
}) => {
  const currentTab = activeTab || propCurrentTab || 'dashboard';
  const handleSetTab = (tab: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (setActiveTab) setActiveTab(tab);
    if (propSetCurrentTab) propSetCurrentTab(tab);
  };

  const handleToggleSound = () => {
    if (toggleSound) {
      toggleSound();
    } else if (setIsSoundMuted) {
      const next = !isSoundMuted;
      setIsSoundMuted(next);
      sound.setMuted(next);
    }
  };

  const handleToggleOffline = () => {
    if (toggleOffline) {
      toggleOffline();
    } else if (setIsOffline) {
      setIsOffline(!isOffline);
    }
  };

  const isWatchConnected = smartwatch?.status === 'connected';
  const liveHeartRate = smartwatch?.liveHeartRate || 0;
  const watchName = smartwatch?.name || 'Smartwatch';

  const t = translations[lang];
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const tier = getLevelTier(user?.level || 1);
  const xpPercent = getXpProgressPercent(user?.currentLevelXp || 0, user?.nextLevelXp || 500);
  const frameClasses = getEquippedFrameClasses(user);

  // 5 Core Master Sections for maximum comfort & zero clutter
  const dockItems = [
    { id: 'dashboard', label: 'Inicio', icon: Activity },
    { id: 'routines', label: 'Entrenar', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrición', icon: UtensilsCrossed },
    { id: 'analytics', label: 'Progreso', icon: BarChart3 },
    { id: 'community', label: 'Comunidad', icon: Trophy },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Floating Dynamic Liquid Glass Bottom Navigation Dock (EvoMare Style) */}
      <div 
        style={{ bottom: 'max(0.75rem, calc(0.5rem + env(safe-area-inset-bottom, 0px)))' }}
        className="fixed left-1/2 -translate-x-1/2 z-50 w-[94%] xs:w-[92%] sm:w-auto max-w-lg pointer-events-auto select-none"
      >
        <nav 
          className="bg-[#121215]/95 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.15)] flex items-center justify-around sm:justify-center sm:gap-2 ring-1 ring-white/5"
          aria-label="Navegación principal"
        >
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'community' && (currentTab === 'challenges' || currentTab === 'leaderboard' || currentTab === 'achievements'));
            return (
              <button
                key={item.id}
                id={`dock-tab-${item.id}`}
                onClick={() => {
                  handleSetTab(item.id);
                  sound.playBeep(650, 40);
                }}
                className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 rounded-full font-mono font-bold transition-all duration-300 cursor-pointer min-w-0 ${
                  isActive
                    ? 'bg-cyan-400 text-neutral-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-[1.03]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4 sm:h-4 shrink-0 transition-transform ${isActive ? 'text-neutral-950 stroke-[2.5] scale-110' : 'text-neutral-400'}`} />
                <span className={`text-[10px] sm:text-xs font-black tracking-tight whitespace-nowrap truncate ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
