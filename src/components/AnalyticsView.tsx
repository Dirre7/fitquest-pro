import React, { useState } from 'react';
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
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Sparkles
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
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const totalDistance = history.reduce((acc, h) => acc + (h.totalDistanceKm || 0), 0);

  // Volume progression over time chart data
  const volumeData = history.length > 0 
    ? [...history].reverse().map((h) => ({
        date: h.date.slice(5), // MM-DD
        vol: h.totalVolumeKg,
        calories: h.calories,
        bpm: h.avgHeartRate,
        duration: h.durationMinutes,
      }))
    : [
        { date: 'Lun', vol: 1200, calories: 340, bpm: 130, duration: 45 },
        { date: 'Mie', vol: 2400, calories: 480, bpm: 142, duration: 55 },
        { date: 'Vie', vol: 3100, calories: 520, bpm: 145, duration: 60 },
        { date: 'Dom', vol: 1800, calories: 390, bpm: 135, duration: 40 },
      ];

  // Cardio progression over time chart data
  const cardioData = history.length > 0
    ? [...history].reverse().map((h) => ({
        date: h.date.slice(5),
        km: h.totalDistanceKm || (h.routineTitle?.toLowerCase().includes('cardio') ? 4.5 : 0),
        bpm: h.avgHeartRate || 135,
        duration: h.durationMinutes,
      }))
    : [
        { date: 'Lun', km: 3.5, bpm: 132, duration: 25 },
        { date: 'Mie', km: 5.0, bpm: 144, duration: 32 },
        { date: 'Vie', km: 7.2, bpm: 148, duration: 45 },
        { date: 'Dom', km: 10.0, bpm: 155, duration: 58 },
      ];

  // Estimated 1RM Progression data
  const strength1rmData = [
    { week: 'Sem 1', Bench: 70, Squat: 90, Deadlift: 110, OHP: 45 },
    { week: 'Sem 2', Bench: 72.5, Squat: 95, Deadlift: 115, OHP: 47.5 },
    { week: 'Sem 3', Bench: 77.5, Squat: 100, Deadlift: 122.5, OHP: 50 },
    { week: 'Sem 4', Bench: 82.5, Squat: 107.5, Deadlift: 130, OHP: 52.5 },
    { week: 'Sem 5', Bench: 87.5, Squat: 115, Deadlift: 140, OHP: 55 },
  ];

  // Muscle group split breakdown
  const muscleDistributionData = [
    { muscle: 'Pectoral', value: user.attributes.strength || 60 },
    { muscle: 'Espalda', value: Math.min(100, (user.attributes.strength || 60) + 5) },
    { muscle: 'Piernas', value: user.attributes.endurance || 65 },
    { muscle: 'Hombros', value: user.attributes.discipline || 55 },
    { muscle: 'Brazos', value: user.attributes.agility || 50 },
    { muscle: 'Core', value: 65 },
  ];

  // Export JSON backup (Full app restoration)
  const handleExportJson = () => {
    sound.playAchievement();
    const dataStr = FitStorage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitquest-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  };

  // Export CSV for Excel / Google Sheets / Apple Numbers with UTF-8 BOM
  const handleExportCsv = () => {
    sound.playAchievement();
    let csv = '\uFEFFFecha,Rutina,Duracion_Minutos,Volumen_Total_Kg,Calorias,Distancia_Km,XP_Ganada,Valoracion,Notas\n';
    
    history.forEach((h) => {
      const cleanTitle = (h.routineTitle || 'Entrenamiento').replace(/"/g, '""');
      const cleanNotes = (h.notes || '').replace(/"/g, '""');
      csv += `"${h.date}","${cleanTitle}",${h.durationMinutes || 0},${h.totalVolumeKg || 0},${h.calories || 0},${(h.totalDistanceKm || 0).toFixed(2)},${h.xpEarned || 0},${h.rating || 5},"${cleanNotes}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitquest-entrenamientos-${new Date().toISOString().split('T')[0]}.csv`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              📊 Telemetría & Rendimiento
            </span>
            <span className="text-xs font-mono font-bold text-neutral-400">
              {history.length} Sesiones Registradas
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            Analíticas de Progreso
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Evolución de tonelaje levantado, gasto calórico y progresión de fuerza 1RM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-analytics-csv"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-2xl bg-[#121214] border border-white/10 hover:border-cyan-500/40 text-neutral-200 hover:text-cyan-400 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            title="Descargar datos en formato Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          
          <button
            id="btn-export-analytics-json"
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-2xl bg-[#121214] border border-white/10 hover:border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            title="Copia de seguridad JSON completa"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Volume Trend (kg) Chart */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-lg text-white">
                Sobrecarga Progresiva (Volumen en kg)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {user.stats.totalVolumeKg.toLocaleString()} kg Total
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} fontStyle="italic" />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121214', borderColor: '#333', borderRadius: '16px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="vol" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#volGrad)" name="Volumen (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 1RM Strength Evolution Chart */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-bold text-lg text-white">
                Fuerza Máxima 1RM Estimada (kg)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">Básicos</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strength1rmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="week" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} domain={[30, 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121214', borderColor: '#333', borderRadius: '16px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="Bench" stroke="#06b6d4" strokeWidth={2} name="Banca" />
                <Line type="monotone" dataKey="Squat" stroke="#10b981" strokeWidth={2} name="Sentadilla" />
                <Line type="monotone" dataKey="Deadlift" stroke="#f59e0b" strokeWidth={2} name="Peso Muerto" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cardio & Running Distance Evolution */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="font-display font-bold text-lg text-white">
                Rendimiento Cardio & Running (km)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400">
              {totalDistance.toFixed(1)} km Acumulados
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cardioData}>
                <defs>
                  <linearGradient id="cardioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121214', borderColor: '#333', borderRadius: '16px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="km" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#cardioGrad)" name="Distancia (km)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calorie Burn & Average BPM Correlation */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h3 className="font-display font-bold text-lg text-white">
                Gasto Calórico por Sesión
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400">
              {user.stats.caloriesBurned.toLocaleString()} kcal Acumuladas
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121214', borderColor: '#333', borderRadius: '16px', fontSize: '12px' }}
                />
                <Bar dataKey="calories" fill="#f97316" radius={[8, 8, 0, 0]} name="Calorías (kcal)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Muscle Group Breakdown Radar */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              <h3 className="font-display font-bold text-lg text-white">
                Distribución de Estímulo Muscular
              </h3>
            </div>
            <span className="text-xs font-bold text-cyan-400 font-mono">Radar RPG</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={muscleDistributionData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="muscle" stroke="#9ca3af" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#555" />
                <Radar name="Frecuencia de Carga" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PR Wall & Interactive Detailed Workout Sessions Table */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-black text-xl text-white">
              Historial Detallado de Entrenamientos
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono font-semibold">
            {history.length} sesiones registradas
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <Dumbbell className="w-10 h-10 text-neutral-600 mx-auto mb-3 animate-pulse" />
            <h4 className="font-display font-bold text-white text-base">Aún no has registrado entrenamientos</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Ve a la pestaña de <span className="text-cyan-400 font-bold">Entrenar</span>, inicia una rutina y completa tus series para desbloquear estadísticas reales aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((hist) => {
              const isExpanded = expandedSessionId === hist.id;
              return (
                <div
                  key={hist.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base">{hist.routineTitle}</span>
                        <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                          {hist.date}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 font-mono">
                        ⏱ {hist.durationMinutes} min • 🔥 {hist.calories} kcal • ❤️ {hist.avgHeartRate} BPM • 🏋️ {hist.totalVolumeKg.toLocaleString()} kg total
                      </p>
                      {hist.notes && (
                        <p className="text-xs text-cyan-300 italic mt-1 font-medium">"{hist.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-amber-400 text-xs font-mono font-bold">
                        {'★'.repeat(hist.rating || 5)}
                      </div>
                      <span className="font-mono font-black text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/30">
                        +{hist.xpEarned} XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
