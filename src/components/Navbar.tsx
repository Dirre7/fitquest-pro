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
  Heart
} from 'lucide-react';
import { UserProfile, ThemeMode, Language, SmartwatchDevice } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';

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

  const xpPercent = user?.nextLevelXp ? Math.min(100, Math.round((user.currentLevelXp / user.nextLevelXp) * 100)) : 0;

  // 4 Core Master Sections for maximum comfort & zero clutter
  const dockItems = [
    { id: 'dashboard', label: 'Inicio', icon: Activity },
    { id: 'routines', label: 'Entrenar', icon: Dumbbell },
    { id: 'analytics', label: 'Progreso', icon: BarChart3 },
    { id: 'community', label: 'Comunidad', icon: Trophy },
  ];

  return (
    <>
      {/* Top Header Bar with iOS Safe Area support */}
      <header 
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0px))' }}
        className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/10 px-2.5 sm:px-6 lg:px-8 pb-2 sm:pb-2.5 transition-all w-full max-w-full overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Left: Logo & Brand Identity */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              id="btn-nav-logo"
              onClick={() => handleSetTab('dashboard')}
              className="flex items-center gap-1.5 sm:gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-2xl p-0.5 shrink-0"
              aria-label="FitQuest Pro Inicio"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform shrink-0">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <div className="text-left hidden xs:block">
                <div className="flex items-center gap-1">
                  <span className="font-display font-black text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                    FITQUEST
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    PRO
                  </span>
                </div>
              </div>
            </button>

            {/* User Level & Avatar (Interactive Profile Button) */}
            <button
              id="btn-nav-profile-edit"
              onClick={onOpenProfileModal}
              className="flex items-center gap-1.5 sm:gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 rounded-xl sm:rounded-2xl px-2 py-1 sm:px-3 sm:py-1.5 shadow-inner transition-all hover:scale-105 shrink min-w-0 max-w-[120px] xs:max-w-[150px] sm:max-w-none"
              title="Editar Perfil, Avatar y Títulos"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl object-cover border border-cyan-500/50 shrink-0"
              />
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold">
                  <span className="text-white truncate max-w-[45px] xs:max-w-[65px] sm:max-w-[110px]">{user.name}</span>
                  <span className="text-cyan-400 font-mono text-[9px] sm:text-[10px] shrink-0">Nvl {user.level}</span>
                </div>
                <div className="h-1 sm:h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5 hidden xs:block">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Right Header: Streak + Smartwatch + Config + Quick Action */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Streak Counter */}
            <div 
              className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 rounded-xl sm:rounded-2xl px-2 sm:px-2.5 py-1 text-orange-400 text-[11px] sm:text-xs font-bold shrink-0"
              title={`${user?.stats?.currentStreak ?? 0} ${t.streakDays}`}
            >
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 animate-bounce" />
              <span className="font-mono">{user?.stats?.currentStreak ?? 0}d</span>
            </div>

            {/* Desktop Only Tools: Cloud Sync, Sound, Lang */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* Cloud Sync Toggle */}
              <button
                id="btn-nav-cloud-sync"
                onClick={handleToggleOffline}
                className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                  isOffline
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    : 'bg-white/5 border-white/10 text-cyan-400 hover:bg-white/10'
                }`}
                title={isOffline ? t.offlineActive : t.onlineActive}
              >
                {isOffline ? <CloudOff className="w-3.5 h-3.5 text-orange-400" /> : <Cloud className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              {/* Sound Toggle */}
              <button
                id="btn-nav-sound"
                onClick={handleToggleSound}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white transition-colors"
                title={isSoundMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  id="btn-nav-language"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white flex items-center gap-1 text-xs uppercase font-bold font-mono"
                >
                  <Languages className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang}</span>
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl py-1 z-50 animate-in fade-in">
                    {(['es', 'en', 'pt', 'fr', 'de'] as Language[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          setLang(l);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-white/5 ${
                          lang === l ? 'text-cyan-400 bg-cyan-500/10 font-bold' : 'text-neutral-300'
                        }`}
                      >
                        <span>
                          {l === 'es' && '🇪🇸 Español'}
                          {l === 'en' && '🇺🇸 English'}
                          {l === 'pt' && '🇧🇷 Português'}
                          {l === 'fr' && '🇫🇷 Français'}
                          {l === 'de' && '🇩🇪 Deutsch'}
                        </span>
                        {lang === l && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cloud User Auth / Sign In Button */}
              {isAuthenticated ? (
                <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-2 py-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {onSignOut && (
                    <button
                      onClick={onSignOut}
                      title="Cerrar sesión"
                      className="p-1 hover:text-red-400 text-neutral-400 transition-colors ml-0.5"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  id="btn-nav-auth"
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs transition-all hover:scale-105"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              )}
            </div>

            {/* Settings Button */}
            <button
              id="btn-nav-settings"
              onClick={() => handleSetTab('settings')}
              className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-colors shrink-0 ${
                currentTab === 'settings'
                  ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Ajustes y Cuenta"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Dynamic Island / Liquid Glass Bottom Navigation Dock */}
      <div 
        style={{ bottom: 'max(0.75rem, calc(0.5rem + env(safe-area-inset-bottom, 0px)))' }}
        className="fixed left-1/2 -translate-x-1/2 z-50 w-[94%] xs:w-[92%] sm:w-auto max-w-lg pointer-events-auto select-none"
      >
        <nav 
          className="bg-neutral-950/92 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-full p-1 sm:p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.15)] flex items-center justify-around sm:justify-center sm:gap-2 ring-1 ring-white/5"
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
                className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-1.5 sm:py-2 px-1.5 sm:px-4.5 rounded-xl sm:rounded-full font-mono font-bold transition-all duration-200 cursor-pointer min-w-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-[1.02]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-neutral-950 stroke-[2.5]' : 'text-neutral-400'}`} />
                <span className="text-[10px] sm:text-xs font-extrabold whitespace-nowrap tracking-tight truncate">
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
