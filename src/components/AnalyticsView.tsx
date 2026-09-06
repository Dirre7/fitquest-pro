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
  Sparkles,
  Footprints,
  Gauge,
  Wind,
  Mountain,
  Zap,
  Scale,
  Plus,
  Edit2,
  Check,
  X,
  Target,
  Percent,
} from 'lucide-react';
import { WorkoutHistoryEntry, UserProfile, Language } from '../types';
import { translations } from '../lib/i18n';
import { FitStorage } from '../lib/storage';
import { sound } from '../lib/soundFx';
import { MuscleHeatmapWidget } from './MuscleHeatmapWidget';

interface AnalyticsViewProps {
  history: WorkoutHistoryEntry[];
  user: UserProfile;
  lang: Language;
  onNavigateTab?: (tab: string) => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  history,
  user,
  lang,
  onNavigateTab,
  onUpdateUser,
}) => {
  const t = translations[lang];
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeightInput, setNewWeightInput] = useState<number>(user.weightKg || 75);
  const [newHeightInput, setNewHeightInput] = useState<number>(user.heightCm || 175);
  const [newTargetWeightInput, setNewTargetWeightInput] = useState<number>(user.targetWeightKg || 72);

  const totalDistance = history.reduce((acc, h) => acc + (h.totalDistanceKm || 0), 0);

  // Volume progression over time chart data (only real history)
  const volumeData = history.length > 0 
    ? [...history].reverse().map((h) => ({
        date: h.date.slice(5), // MM-DD
        vol: h.totalVolumeKg || 0,
        calories: h.calories || 0,
        bpm: h.avgHeartRate || 135,
        duration: h.durationMinutes || 0,
      }))
    : [];

  // Cardio progression over time chart data (only real history)
  const cardioData = history.length > 0
    ? [...history]
        .filter((h) => (h.totalDistanceKm || 0) > 0 || h.routineTitle?.toLowerCase().includes('cardio'))
        .reverse()
        .map((h) => ({
          date: h.date.slice(5),
          km: h.totalDistanceKm || 0,
          bpm: h.avgHeartRate || 135,
          duration: h.durationMinutes || 0,
        }))
    : [];

  // Estimated 1RM Progression data (computed from real history)
  const strength1rmData = history.length > 0
    ? [...history].reverse().map((h, idx) => ({
        week: `S${idx + 1}`,
        vol: h.totalVolumeKg || 0,
        calc1rm: Math.round(((h.totalVolumeKg || 0) / Math.max(1, h.completedExercises || 4)) * 0.15),
      }))
    : [];

  // Muscle group split breakdown
  const muscleDistributionData = [
    { muscle: 'Pectoral', value: user.attributes.strength || 10 },
    { muscle: 'Espalda', value: user.attributes.strength || 10 },
    { muscle: 'Piernas', value: user.attributes.endurance || 10 },
    { muscle: 'Hombros', value: user.attributes.discipline || 10 },
    { muscle: 'Brazos', value: user.attributes.agility || 10 },
    { muscle: 'Core', value: user.attributes.discipline || 10 },
  ];

  // Weight History Data
  const weightData = (user.weightHistory && user.weightHistory.length > 0
    ? user.weightHistory
    : [
        { date: user.joinedAt || '2026-08-01', weightKg: user.weightKg || 75 },
        { date: new Date().toISOString().split('T')[0], weightKg: user.weightKg || 75 },
      ]
  ).map((w) => ({
    date: w.date.slice(5),
    weight: w.weightKg,
  }));

  // Anthropometric & Metabolic Calculations
  const currentWeight = user.weightKg || 75;
  const currentHeight = user.heightCm || 175;
  const heightM = currentHeight / 100;
  const bmi = Math.round((currentWeight / (heightM * heightM)) * 10) / 10;
  
  let bmiCategory = 'Peso Saludable';
  let bmiColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (bmi < 18.5) {
    bmiCategory = 'Bajo Peso';
    bmiColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Atlético / Sobrepeso';
    bmiColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (bmi >= 30) {
    bmiCategory = 'Elevado';
    bmiColor = 'text-red-400 bg-red-500/10 border-red-500/30';
  }

  // BMR (Mifflin-St Jeor formula) & TDEE
  const bmr = Math.round(10 * currentWeight + 6.25 * currentHeight - 5 * 25 + 5);
  const tdee = Math.round(bmr * 1.55); // Moderate activity

  // Relative Strength Standards (PR vs Bodyweight)
  const benchPr = user.stats.benchPrKg || 80;
  const squatPr = user.stats.squatPrKg || 105;
  const deadliftPr = user.stats.deadliftPrKg || 135;

  const benchRatio = Math.round((benchPr / currentWeight) * 100) / 100;
  const squatRatio = Math.round((squatPr / currentWeight) * 100) / 100;
  const deadliftRatio = Math.round((deadliftPr / currentWeight) * 100) / 100;

  // Handle Save Weight & Anthropometrics
  const handleSaveAnthropometrics = () => {
    sound.playLevelUp();
    const updated = FitStorage.logWeight(newWeightInput, undefined, {
      ...user,
      heightCm: newHeightInput,
      targetWeightKg: newTargetWeightInput,
    });
    if (onUpdateUser) onUpdateUser(updated);
    setShowWeightModal(false);
  };

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
              📊 Telemetría &amp; Rendimiento
            </span>
            <span className="text-xs font-mono font-bold text-neutral-400">
              {history.length} Sesiones Registradas
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            Analíticas de Progreso
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Evolución de tonelaje levantado, gasto calórico, composición corporal y progresión de fuerza 1RM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-analytics-csv"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-2xl bg-[#121214] border border-white/10 hover:border-cyan-500/40 text-neutral-200 hover:text-cyan-400 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            title="Descargar datos en formato Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          
          <button
            id="btn-export-analytics-json"
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-2xl bg-[#121214] border border-white/10 hover:border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            title="Copia de seguridad JSON completa"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      {/* 🧬 Mapa de Activación & Frecuencia Muscular */}
      <MuscleHeatmapWidget
        history={history}
        user={user}
        lang={lang}
        onStartMuscleWorkout={onNavigateTab ? () => onNavigateTab('routines') : undefined}
      />

      {/* ⚖️ PANEL DE COMPOSICIÓN CORPORAL, EVOLUCIÓN DEL PESO & FUERZA RELATIVA */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl pointer-events-none" />

        {/* Header of Body Comp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Scale className="w-3 h-3" /> ANTROPOMETRÍA &amp; METABOLISMO
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                Calibrado con Peso ({currentWeight}kg) y Altura ({currentHeight}cm)
              </span>
            </div>
            <h3 className="text-xl font-display font-black text-white mt-1">
              Evolución del Peso &amp; Fuerza Relativa
            </h3>
          </div>

          <button
            onClick={() => {
              setNewWeightInput(user.weightKg || 75);
              setNewHeightInput(user.heightCm || 175);
              setNewTargetWeightInput(user.targetWeightKg || 72);
              setShowWeightModal(true);
            }}
            className="px-4 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 font-mono font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-center cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar / Editar Peso</span>
          </button>
        </div>

        {/* 4 Telemetry Metrics: Peso, IMC, TMB, Gasto Diario */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          {/* Peso Actual */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-colors">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 flex items-center justify-between">
              <span>PESO ACTUAL</span>
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
            </span>
            <p className="text-2xl font-mono font-black text-white mt-1">
              {currentWeight} <span className="text-xs font-normal text-neutral-400">kg</span>
            </p>
            <p className="text-[10px] font-mono text-cyan-400 mt-1">
              Meta: {user.targetWeightKg || 72} kg ({Math.abs(Math.round((currentWeight - (user.targetWeightKg || 72)) * 10) / 10)}kg dif.)
            </p>
          </div>

          {/* IMC */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-colors">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 flex items-center justify-between">
              <span>ÍNDICE IMC</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <p className="text-2xl font-mono font-black text-white mt-1">
              {bmi} <span className="text-xs font-normal text-neutral-400">kg/m²</span>
            </p>
            <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full mt-1 border ${bmiColor}`}>
              {bmiCategory}
            </span>
          </div>

          {/* Tasa Metabólica Basal (TMB) */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-orange-500/30 transition-colors">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 flex items-center justify-between">
              <span>METABOLISMO BASAL (TMB)</span>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </span>
            <p className="text-2xl font-mono font-black text-orange-400 mt-1">
              {bmr.toLocaleString()} <span className="text-xs font-normal text-neutral-400">kcal/día</span>
            </p>
            <p className="text-[10px] font-mono text-neutral-400 mt-1">
              Gasto mínimo en reposo total
            </p>
          </div>

          {/* Gasto Diario Estimado (TDEE) */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-500/30 transition-colors">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 flex items-center justify-between">
              <span>GASTO TOTAL (TDEE)</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <p className="text-2xl font-mono font-black text-amber-300 mt-1">
              ~{tdee.toLocaleString()} <span className="text-xs font-normal text-neutral-400">kcal/día</span>
            </p>
            <p className="text-[10px] font-mono text-neutral-400 mt-1">
              Incluye actividad física y entreno
            </p>
          </div>
        </div>

        {/* Weight Evolution Line Chart + Relative Strength Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 pt-2 border-t border-white/5">
          
          {/* Weight Evolution AreaChart */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Curva de Evolución del Peso</span>
              </h4>
              <span className="text-xs font-mono text-neutral-400">Últimos registros</span>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" stroke="#737373" fontSize={10} fontStyle="italic" />
                  <YAxis stroke="#737373" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121214', borderColor: '#333', borderRadius: '14px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#weightGrad)" name="Peso Corporal (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strength Standards (Fuerza Relativa / Ratio Peso Corporal) */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-cyan-400" />
                <span>Ratios de Fuerza Relativa (Fuerza / Peso)</span>
              </h4>
              <span className="text-xs font-mono text-cyan-400 font-bold">1RM vs Peso</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {/* Bench Press */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Press de Banca (1RM: {benchPr}kg)</p>
                  <p className="text-[10px] text-neutral-400">{benchRatio}× tu peso corporal ({currentWeight}kg)</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  benchRatio >= 1.5 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : benchRatio >= 1.0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/10 text-neutral-300 border-white/10'
                }`}>
                  {benchRatio >= 1.5 ? '👑 Élite' : benchRatio >= 1.0 ? '⚡ Avanzado' : '🌱 Intermedio'}
                </span>
              </div>

              {/* Squat */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Sentadilla (1RM: {squatPr}kg)</p>
                  <p className="text-[10px] text-neutral-400">{squatRatio}× tu peso corporal ({currentWeight}kg)</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  squatRatio >= 2.0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : squatRatio >= 1.4 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/10 text-neutral-300 border-white/10'
                }`}>
                  {squatRatio >= 2.0 ? '👑 Élite' : squatRatio >= 1.4 ? '⚡ Avanzado' : '🌱 Intermedio'}
                </span>
              </div>

              {/* Deadlift */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Peso Muerto (1RM: {deadliftPr}kg)</p>
                  <p className="text-[10px] text-neutral-400">{deadliftRatio}× tu peso corporal ({currentWeight}kg)</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  deadliftRatio >= 2.3 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : deadliftRatio >= 1.7 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/10 text-neutral-300 border-white/10'
                }`}>
                  {deadliftRatio >= 2.3 ? '👑 Élite' : deadliftRatio >= 1.7 ? '⚡ Avanzado' : '🌱 Intermedio'}
                </span>
              </div>
            </div>
          </div>
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
            {volumeData.length > 0 ? (
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
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                <TrendingUp className="w-8 h-8 text-neutral-600 mb-2" />
                <p className="text-xs font-mono font-bold text-neutral-400">Sin datos de volumen</p>
                <p className="text-[11px] text-neutral-500 max-w-xs mt-1">Completa entrenamientos para ver tu curva de sobrecarga progresiva en tiempo real.</p>
              </div>
            )}
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
            {strength1rmData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strength1rmData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="week" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121214', borderColor: '#333', borderRadius: '16px', fontSize: '12px' }}
                  />
                  <Bar dataKey="calc1rm" fill="#10b981" radius={[8, 8, 0, 0]} name="1RM Estimado (kg)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                <BarChart3 className="w-8 h-8 text-neutral-600 mb-2" />
                <p className="text-xs font-mono font-bold text-neutral-400">Sin datos de 1RM</p>
                <p className="text-[11px] text-neutral-500 max-w-xs mt-1">Registra series de pesas pesadas para desbloquear tu cálculo de fuerza máxima.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cardio & Running Distance Progression Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cardio Distance Trend Chart */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-lg text-white">
                Distancia Cardio Acumulada (km)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {totalDistance.toFixed(1)} km Total
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            {cardioData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cardioData}>
                  <defs>
                    <linearGradient id="cardioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" stroke="#737373" fontSize={11} fontStyle="italic" />
                  <YAxis stroke="#737373" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121214', borderColor: '#333', borderRadius: '16px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="km" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#cardioGrad)" name="Distancia (km)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                <Footprints className="w-8 h-8 text-neutral-600 mb-2" />
                <p className="text-xs font-mono font-bold text-neutral-400">Sin sesiones de cardio</p>
                <p className="text-[11px] text-neutral-500 max-w-xs mt-1">Completa carreras, caminata en cinta o al aire libre para trazar tu resistencia.</p>
              </div>
            )}
          </div>
        </div>

        {/* RPG Attributes Radar Chart */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-lg text-white">
                Balance de Atributos RPG
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">Nivel {user.level}</span>
          </div>

          <div className="h-64 w-full pt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={muscleDistributionData}>
                <PolarGrid stroke="#262626" />
                <PolarAngleAxis dataKey="muscle" stroke="#a3a3a3" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#525252" fontSize={9} />
                <Radar name="Nivel" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Workout History Log */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-lg text-white">
              Historial Detallado de Entrenamientos
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {history.length} {history.length === 1 ? 'sesión registrada' : 'sesiones registradas'}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Dumbbell className="w-10 h-10 text-neutral-600 mx-auto mb-2.5" />
            <p className="text-sm font-bold text-white">Aún no has completado entrenamientos</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Inicia una rutina desde el catálogo o la pantalla de inicio para empezar a registrar tu progreso.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => {
              const isExpanded = expandedSessionId === entry.id;
              return (
                <div
                  key={entry.id}
                  className="bg-white/5 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-4 transition-all"
                >
                  <div 
                    onClick={() => setExpandedSessionId(isExpanded ? null : entry.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-base text-white">
                          {entry.routineTitle}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {entry.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 mt-1 flex-wrap">
                        <span>⏱ {entry.durationMinutes} min</span>
                        <span>🔥 {entry.calories} kcal</span>
                        {entry.avgHeartRate > 0 && <span>❤️ {entry.avgHeartRate} BPM</span>}
                        <span>🏋️ {entry.totalVolumeKg.toLocaleString()} kg total</span>
                        {entry.totalDistanceKm && entry.totalDistanceKm > 0 ? (
                          <span className="text-cyan-400">🏃 {entry.totalDistanceKm.toFixed(2)} km</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          +{entry.xpEarned} XP
                        </span>
                        <div className="text-amber-400 text-xs">
                          {'★'.repeat(entry.rating || 5)}
                        </div>
                      </div>
                      <button className="p-1 text-neutral-400 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Session Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-in fade-in">
                      {entry.notes && (
                        <div className="p-3 bg-white/5 rounded-xl text-xs text-neutral-300">
                          <p className="font-bold text-neutral-400 mb-1">Notas de la sesión:</p>
                          <p>{entry.notes}</p>
                        </div>
                      )}

                      {entry.exercises && entry.exercises.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-mono font-bold text-neutral-400 uppercase">
                            Ejercicios y Series Realizadas:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {entry.exercises.map((ex, i) => (
                              <div key={i} className="p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs">
                                <p className="font-bold text-white">{ex.name}</p>
                                <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                                  {ex.sets ? `${ex.sets.filter((s) => s.completed).length} series completadas` : 'Completado'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Modal to Update Weight & Anthropometrics */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#121214] border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-5 animate-in zoom-in-95">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="font-display font-black text-lg text-white">
                  Registrar Peso &amp; Antropometría
                </h3>
              </div>
              <button
                onClick={() => setShowWeightModal(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Peso Actual */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 mb-1.5">
                  Peso Corporal Actual (kg):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    value={newWeightInput}
                    onChange={(e) => setNewWeightInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-500 px-4 py-2.5 rounded-xl text-white font-mono font-bold text-sm outline-none"
                  />
                  <span className="text-xs font-mono text-neutral-400">KG</span>
                </div>
              </div>

              {/* Altura */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 mb-1.5">
                  Estatura / Altura (cm):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    max="240"
                    value={newHeightInput}
                    onChange={(e) => setNewHeightInput(parseInt(e.target.value) || 175)}
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-500 px-4 py-2.5 rounded-xl text-white font-mono font-bold text-sm outline-none"
                  />
                  <span className="text-xs font-mono text-neutral-400">CM</span>
                </div>
              </div>

              {/* Peso Objetivo */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 mb-1.5">
                  Peso Objetivo / Meta (kg):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    value={newTargetWeightInput}
                    onChange={(e) => setNewTargetWeightInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-500 px-4 py-2.5 rounded-xl text-white font-mono font-bold text-sm outline-none"
                  />
                  <span className="text-xs font-mono text-neutral-400">KG</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex gap-3">
              <button
                onClick={() => setShowWeightModal(false)}
                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAnthropometrics}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
