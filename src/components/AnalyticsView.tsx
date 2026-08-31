import React from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Flame,
  Award,
  Download,
  Calendar,
  Activity,
  Heart,
  Dumbbell,
  Shield,
} from 'lucide-react';
import { WorkoutHistoryEntry, UserProfile, Language } from '../types';
import { translations } from '../lib/i18n';
import { FitStorage } from '../lib/storage';
import { sound } from '../lib/soundFx';

interface AnalyticsViewProps {
  history: WorkoutHistoryEntry[];
  user: UserProfile;
  lang: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  history,
  user,
  lang,
}) => {
  const t = translations[lang];

  // Volume progression over time chart data
  const volumeData = [...history].reverse().map((h) => ({
    date: h.date.slice(5), // MM-DD
    vol: h.totalVolumeKg,
    calories: h.calories,
    bpm: h.avgHeartRate,
    duration: h.durationMinutes,
  }));

  // Estimated 1RM Progression data
  const strength1rmData = [
    { week: 'Sem 1', Bench: 90, Squat: 120, Deadlift: 140, OHP: 55 },
    { week: 'Sem 2', Bench: 92.5, Squat: 125, Deadlift: 145, OHP: 57.5 },
    { week: 'Sem 3', Bench: 97.5, Squat: 130, Deadlift: 150, OHP: 60 },
    { week: 'Sem 4', Bench: 100, Squat: 135, Deadlift: 155, OHP: 62.5 },
    { week: 'Sem 5', Bench: 105, Squat: 145, Deadlift: 165, OHP: 65 },
  ];

  // Muscle group split breakdown
  const muscleDistributionData = [
    { muscle: 'Pectoral', value: 85 },
    { muscle: 'Espalda', value: 90 },
    { muscle: 'Piernas', value: 95 },
    { muscle: 'Hombros', value: 75 },
    { muscle: 'Brazos', value: 70 },
    { muscle: 'Core', value: 65 },
  ];

  // Body weight tracking
  const bodyWeightData = [
    { date: '01 Feb', weight: 78.2 },
    { date: '08 Feb', weight: 77.8 },
    { date: '15 Feb', weight: 77.2 },
    { date: '22 Feb', weight: 76.8 },
    { date: '28 Feb', weight: 76.5 },
  ];

  // Export JSON handler
  const handleExportJson = () => {
    sound.playAchievement();
    const dataStr = FitStorage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitquest-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
              📊 Gráficos de Rendimiento
            </span>
            <span className="text-xs font-bold text-neutral-400">
              {history.length} Sesiones Analizadas
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {t.analyticsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {t.analyticsSubtitle}
          </p>
        </div>

        <button
          id="btn-export-analytics-json"
          onClick={handleExportJson}
          className="px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-700 hover:border-emerald-500 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>{t.exportData}</span>
        </button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Volume Trend (kg) Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-bold text-lg text-white">
                {t.volumeTrend}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-500/30">
              Sobrecarga Progresiva ↑
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="vol" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" name="Volumen (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 1RM Strength Curve Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-bold text-lg text-white">
                {t.estimated1rm}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-500/30">
              +15 kg en 5 semanas
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strength1rmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="week" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="Squat" stroke="#ef4444" strokeWidth={2} name="Sentadilla (kg)" />
                <Line type="monotone" dataKey="Bench" stroke="#f59e0b" strokeWidth={2} name="Banca (kg)" />
                <Line type="monotone" dataKey="Deadlift" stroke="#10b981" strokeWidth={2} name="P. Muerto (kg)" />
                <Line type="monotone" dataKey="OHP" stroke="#06b6d4" strokeWidth={2} name="Militar (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calorie Burn & Average BPM Correlation */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h3 className="font-display font-bold text-lg text-white">
                {t.calorieTrend}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400">
              Promedio: 510 kcal / 146 BPM
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="calories" fill="#f97316" radius={[6, 6, 0, 0]} name="Calorías (kcal)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Muscle Group Breakdown Radar */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              <h3 className="font-display font-bold text-lg text-white">
                {t.muscleDistribution}
              </h3>
            </div>
            <span className="text-xs font-bold text-neutral-400">Balance Óptimo</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={muscleDistributionData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="muscle" stroke="#9ca3af" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#555" />
                <Radar name="Frecuencia de Carga" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PR Wall & Recent Workout Sessions Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display font-extrabold text-xl text-white">
              Historial Reciente de Sesiones
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">Últimas 5 sesiones</span>
        </div>

        <div className="space-y-3">
          {history.map((hist) => (
            <div
              key={hist.id}
              className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{hist.routineTitle}</span>
                  <span className="text-xs font-mono font-semibold text-neutral-400">({hist.date})</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  ⏱ {hist.durationMinutes} min • 🔥 {hist.calories} kcal • ❤️ {hist.avgHeartRate} BPM prom. • 🏋️ {hist.totalVolumeKg.toLocaleString()} kg
                </p>
                {hist.notes && (
                  <p className="text-xs text-emerald-400 italic mt-1 font-medium">"{hist.notes}"</p>
                )}
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-amber-400 text-xs font-mono font-bold">
                  {'★'.repeat(hist.rating)}
                </div>
                <span className="font-mono font-extrabold text-sm text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-xl border border-yellow-500/20">
                  +{hist.xpEarned} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
