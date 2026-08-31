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
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Logo & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-nav-logo"
              onClick={() => handleSetTab('dashboard')}
              className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-2xl p-1"
              aria-label="FitQuest Pro Inicio"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-cyan-500 flex items-center justify-center text-neutral-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-transform shrink-0">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-base sm:text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                    FITQUEST
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    PRO
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] font-mono font-medium text-neutral-400 -mt-0.5 tracking-wider hidden sm:block">
                  CYBER-FITNESS MATRIX
                </p>
              </div>
            </button>

            {/* User Level & XP Bar chip (Clickable to Edit Profile) */}
            <button
              id="btn-nav-profile-edit"
              onClick={onOpenProfileModal}
              className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-inner transition-all hover:scale-105"
              title="Editar Perfil, Avatar y Títulos"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                className="w-7 h-7 rounded-xl object-cover border border-cyan-500/50 shrink-0"
              />
              <div className="text-left min-w-[75px] sm:min-w-[110px]">
                <div className="flex justify-between items-center text-[10px] font-bold gap-1">
                  <span className="text-white truncate max-w-[70px] sm:max-w-[100px]">{user.name}</span>
                  <span className="text-cyan-400 font-mono shrink-0">Nvl {user.level}</span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Right Header: Streak + Smartwatch + Config + Quick Action */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Streak Counter */}
            <div 
              className="flex items-center gap-1 sm:gap-1.5 bg-orange-500/10 border border-orange-500/30 rounded-2xl px-2.5 sm:px-3 py-1 text-orange-400 text-xs font-bold shadow-[0_0_10px_rgba(249,115,22,0.15)]"
              title={`${user?.stats?.currentStreak ?? 0} ${t.streakDays}`}
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 animate-bounce" />
              <span className="font-mono text-[11px] sm:text-xs">{user?.stats?.currentStreak ?? 0}d</span>
            </div>

            {/* Smartwatch BPM Telemetry Badge */}
            <button
              id="btn-nav-smartwatch"
              onClick={() => handleSetTab('settings')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-xs font-mono font-medium border transition-all ${
                isWatchConnected
                  ? 'bg-red-500/10 border-red-500/25 text-neutral-200 hover:border-red-500/40'
                  : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
              }`}
              title={isWatchConnected ? `${watchName} - ${liveHeartRate} BPM (Clic para configurar)` : 'Vincular Smartwatch'}
            >
              <Heart className={`w-3.5 h-3.5 ${isWatchConnected ? 'text-red-500 fill-red-500 animate-pulse' : 'text-neutral-500'}`} />
              <span className="font-bold text-neutral-100 text-[11px]">{liveHeartRate} <span className="text-[9px] text-neutral-400">BPM</span></span>
            </button>

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
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {/* Settings Button */}
            <button
              id="btn-nav-settings"
              onClick={() => handleSetTab('settings')}
              className={`p-2 rounded-2xl border transition-colors ${
                currentTab === 'settings'
                  ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:border-cyan-500/30'
              }`}
              title={t.navSettings}
              aria-label="Configuración"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Quick Start Workout Action Button (Desktop only) */}
            <button
              id="btn-nav-quick-start"
              onClick={onOpenQuickStart}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{t.quickStart}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Liquid Glass Bottom Navigation Dock - 4 Master Buttons */}
      <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[88%] sm:w-auto max-w-md pointer-events-auto">
        <nav 
          className="bg-[#121214]/90 backdrop-blur-2xl border border-white/15 rounded-3xl sm:rounded-full p-1.5 sm:p-2 shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-around sm:justify-center sm:gap-3"
          aria-label="Navegación principal inferior"
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
                className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-5 rounded-2xl sm:rounded-full text-xs font-mono font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-[1.03]'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4 sm:h-4 ${isActive ? 'text-neutral-950 stroke-[2.5]' : 'text-neutral-400'}`} />
                <span className="text-[11px] sm:text-xs whitespace-nowrap tracking-tight">
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
