import React from 'react';
import {
  Flame,
  Zap,
  Dumbbell,
  Trophy,
  Swords,
  Activity,
  Heart,
  TrendingUp,
  Award,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
  Target,
  Watch,
  Users,
} from 'lucide-react';
import {
  UserProfile,
  WorkoutRoutine,
  CommunityChallenge,
  SmartwatchDevice,
  Language,
} from '../types';
import { translations } from '../lib/i18n';

interface DashboardViewProps {
  user: UserProfile;
  routines: WorkoutRoutine[];
  challenges: CommunityChallenge[];
  smartwatch: SmartwatchDevice;
  lang: Language;
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onNavigateTab: (tab: string) => void;
  onOpenQuickStart?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  routines,
  challenges,
  smartwatch,
  lang,
  onStartRoutine,
  onNavigateTab,
  onOpenQuickStart,
}) => {
  const t = translations[lang];

  const activeChallenge = challenges[0];
  const xpPercent = Math.min(100, Math.round((user.currentLevelXp / user.nextLevelXp) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Immersive UI Command Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <p className="text-cyan-500 font-mono text-xs tracking-widest uppercase mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] inline-block animate-ping" />
            <span>ESTADO DEL SISTEMA: ENTRENAMIENTO ACTIVO</span>
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
            VIRTUAL COMMAND
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-inner">
            <div className={`w-2.5 h-2.5 rounded-full ${smartwatch?.status === 'connected' ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' : 'bg-neutral-600'}`} />
            <span className="text-xs font-mono font-semibold tracking-tight text-neutral-200 uppercase">
              {smartwatch?.status === 'connected' ? `SMARTWATCH: ${smartwatch?.name || 'VINCULADO'}` : 'SMARTWATCH STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Hero Banner: Gamification Level, Rank & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Command Hero Card with Immersive Glowing Radial Backdrop */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#18181b] to-[#09090b] rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 blur-[90px] pointer-events-none" />

          {/* Top Header of the Hero Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-xl shadow-cyan-500/20"
                />
                <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-neutral-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md font-mono">
                  LV.{user.level}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                    {user.name}
                  </h2>
                  <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                    LIGA {user.league}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-cyan-400 mt-1 flex items-center gap-1.5 font-mono">
                  <Shield className="w-3.5 h-3.5" />
                  {user.rankTitle}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  {user.stats.totalWorkouts} misiones completadas • {Math.round(user.stats.totalVolumeKg / 1000)}t tonelaje total
                </p>
              </div>
            </div>

            <button
              id="btn-dashboard-start-workout"
              onClick={onOpenQuickStart ? onOpenQuickStart : () => onNavigateTab('routines')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 px-4 py-2 rounded-2xl text-xs font-mono font-black uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 self-start sm:self-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>INICIAR ENTRENAMIENTO</span>
            </button>
          </div>

          {/* Goal Ring + Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 relative z-10 pt-4 border-t border-white/5">
            
            {/* Circular Goal Ring */}
            <div className="md:col-span-4 flex flex-col items-center justify-center gap-2 p-2">
              <div className="w-32 h-32 rounded-full border-4 border-cyan-500/20 flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <div 
                  className="absolute inset-0 border-4 border-cyan-500 rounded-full"
                  style={{
                    clipPath: xpPercent >= 75 ? 'polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%, 50% 50%)' : 'polygon(50% 0%, 100% 0%, 100% 75%, 50% 50%)'
                  }}
                />
                <div className="text-center">
                  <span className="text-3xl font-bold font-mono text-white tracking-tight">{xpPercent}<span className="text-sm font-normal opacity-50">%</span></span>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">META XP</p>
                </div>
              </div>
              <p className="text-xs font-mono text-cyan-400 font-bold">{user.currentLevelXp} / {user.nextLevelXp} XP</p>
            </div>

            {/* Live Telemetry Inner Cards */}
            <div className="md:col-span-8 space-y-3.5">
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:border-white/10 transition-colors">
                <div>
                  <p className="text-xs text-neutral-400 font-medium">Frecuencia Cardíaca Promedio</p>
                  <p className="text-2xl font-mono font-bold text-white mt-0.5">
                    {smartwatch?.liveHeartRate || 135} <span className="text-xs text-red-400 font-semibold">BPM</span>
                  </p>
                </div>
                <div className="w-16 h-8 flex items-end gap-1 px-1">
                  <div className="w-2 h-3 bg-red-400/40 rounded-full"></div>
                  <div className="w-2 h-5 bg-red-400/60 rounded-full"></div>
                  <div className="w-2 h-7 bg-red-400 rounded-full shadow-[0_0_8px_#ef4444]"></div>
                  <div className="w-2 h-4 bg-red-400/50 rounded-full"></div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:border-white/10 transition-colors">
                <div>
                  <p className="text-xs text-neutral-400 font-medium">Gasto Calórico Acumulado</p>
                  <p className="text-2xl font-mono font-bold text-white mt-0.5">
                    {user.stats.caloriesBurned.toLocaleString()} <span className="text-xs text-orange-400 font-semibold">KCAL</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl border border-orange-500/30 bg-orange-500/10 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.2)]">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* RPG Attribute Gauges */}
          <div className="mt-6 pt-5 border-t border-white/5 relative z-10">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 mb-3">ATRIBUTOS DE GUERRERO</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex justify-between text-xs font-bold text-neutral-300 font-mono">
                  <span>FUERZA</span>
                  <span className="text-red-400">{user.attributes.strength}/100</span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" style={{ width: `${user.attributes.strength}%` }} />
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex justify-between text-xs font-bold text-neutral-300 font-mono">
                  <span>RESISTENCIA</span>
                  <span className="text-cyan-400">{user.attributes.endurance}/100</span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]" style={{ width: `${user.attributes.endurance}%` }} />
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex justify-between text-xs font-bold text-neutral-300 font-mono">
                  <span>AGILIDAD</span>
                  <span className="text-amber-400">{user.attributes.agility}/100</span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]" style={{ width: `${user.attributes.agility}%` }} />
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex justify-between text-xs font-bold text-neutral-300 font-mono">
                  <span>DISCIPLINA</span>
                  <span className="text-emerald-400">{user.attributes.discipline}/100</span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" style={{ width: `${user.attributes.discipline}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Column: Streak & Global Leaderboard Snapshot */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Global Leaderboard Snapshot Card */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400">
                GLOBAL LEADERBOARD
              </h3>
              <button 
                onClick={() => onNavigateTab('leaderboard')}
                className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                VER TOP 100 →
              </button>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-cyan-400 font-mono font-bold w-6 text-sm">01</div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-black text-xs shadow-md">
                  👑
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">Marcus_Fit</p>
                  <p className="text-[10px] text-neutral-400 font-mono">14,850 XP</p>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  +420
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-neutral-400 font-mono font-bold w-6 text-sm">02</div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neutral-400 to-neutral-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  🥈
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">Elena_Active</p>
                  <p className="text-[10px] text-neutral-400 font-mono">13,920 XP</p>
                </div>
                <div className="text-xs font-mono font-bold text-neutral-400">
                  +210
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-cyan-500/10 p-3.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <div className="text-cyan-400 font-mono font-bold w-6 text-sm">03</div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500 flex items-center justify-center text-neutral-950 font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  TÚ
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-cyan-300 font-mono">{user.currentLevelXp} XP</p>
                </div>
                <div className="text-xs font-mono font-bold text-cyan-400">
                  +850
                </div>
              </div>
            </div>

            {/* Achievement Unlocked Teaser Banner */}
            <div className="mt-5 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl shadow-inner">
              <p className="text-[10px] font-mono uppercase font-bold text-cyan-400 mb-2">LOGRO DESTACADO</p>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-neutral-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-neutral-200">Early Bird: 5 sesiones matutinas consecutivas.</p>
              </div>
            </div>
          </div>

          {/* Join Sprint / Community Challenge Card matching Immersive UI Design */}
          {activeChallenge && (
            <div 
              onClick={() => onNavigateTab('challenges')}
              className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-6 relative overflow-hidden group cursor-pointer shadow-2xl hover:scale-[1.02] transition-transform"
            >
              <div className="relative z-10">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-white/20 text-white tracking-widest mb-2 inline-block">
                  RETO COMUNITARIO
                </span>
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1 text-white">
                  {activeChallenge.title}
                </h3>
                <p className="text-xs text-cyan-100 leading-tight mb-4 max-w-[200px]">
                  {activeChallenge.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full border-2 border-cyan-600 bg-neutral-300"></div>
                    <div className="w-7 h-7 rounded-full border-2 border-cyan-600 bg-neutral-400"></div>
                    <div className="w-7 h-7 rounded-full border-2 border-cyan-600 bg-neutral-500"></div>
                    <div className="px-2 h-7 rounded-full border-2 border-cyan-600 bg-black/40 text-white flex items-center justify-center text-[9px] font-mono font-bold">
                      +{activeChallenge.participantsCount || 142}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-black/30 px-3 py-1 rounded-xl border border-white/10">
                    +{activeChallenge.rewardXp} XP
                  </span>
                </div>
              </div>
              
              {/* Background decorative SVG icon */}
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform">
                <Target className="w-32 h-32 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121214] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.totalWorkouts}</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-mono font-extrabold text-3xl text-white">{user.stats.totalWorkouts}</p>
          <span className="text-[11px] text-cyan-400 font-mono font-medium">↑ +4 esta semana</span>
        </div>

        <div className="bg-[#121214] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.volumeLifted}</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-mono font-extrabold text-3xl text-white">
            {(user.stats.totalVolumeKg / 1000).toFixed(1)} <span className="text-sm font-sans font-normal text-neutral-400">ton</span>
          </p>
          <span className="text-[11px] text-neutral-400 font-mono">{user.stats.totalVolumeKg.toLocaleString()} kg total</span>
        </div>

        <div className="bg-[#121214] border border-white/5 hover:border-orange-500/30 rounded-3xl p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.caloriesBurned}</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <p className="font-mono font-extrabold text-3xl text-white">
            {(user.stats.caloriesBurned / 1000).toFixed(1)}k <span className="text-sm font-sans font-normal text-neutral-400">kcal</span>
          </p>
          <span className="text-[11px] text-orange-400 font-mono font-medium">~512 kcal / sesión</span>
        </div>

        <div className="bg-[#121214] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.minutesTrained}</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-mono font-extrabold text-3xl text-white">
            {Math.round(user.stats.totalMinutes / 60)} <span className="text-sm font-sans font-normal text-neutral-400">horas</span>
          </p>
          <span className="text-[11px] text-neutral-400 font-mono">{user.stats.totalMinutes} min acumulados</span>
        </div>
      </div>

      {/* Suggested Routines Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-extrabold text-xl text-white">
              Rutinas Recomendadas
            </h3>
            <p className="text-xs text-neutral-400">Protocolos calibrados para tu nivel actual</p>
          </div>
          <button
            onClick={() => onNavigateTab('routines')}
            className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>VER CATÁLOGO ({routines.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routines.slice(0, 3).map((routine) => (
            <div
              key={routine.id}
              className="bg-[#121214] border border-white/5 hover:border-cyan-500/40 rounded-3xl p-6 transition-all flex flex-col justify-between shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                    {routine.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    +{routine.xpReward} XP
                  </span>
                </div>
                <h4 className="font-display font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                  {routine.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2">
                  {routine.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-xs font-mono text-neutral-400 space-x-3">
                  <span>⏱ {routine.durationMinutes}m</span>
                  <span>🔥 {routine.estimatedCalories}kcal</span>
                </div>
                <button
                  id={`btn-start-routine-${routine.id}`}
                  onClick={() => onStartRoutine(routine)}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs shadow-md shadow-cyan-500/25 transition-all hover:scale-105"
                >
                  {t.startRoutine}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
