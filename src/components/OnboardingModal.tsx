import React, { useState } from 'react';
import {
  User,
  Scale,
  Ruler,
  Calendar,
  Target,
  Flame,
  Dumbbell,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Zap,
  TrendingDown,
  Activity,
  Heart
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { sound } from '../lib/soundFx';

interface OnboardingModalProps {
  user: UserProfile;
  lang: Language;
  onComplete: (updatedUser: UserProfile) => Promise<void> | void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  user,
  lang,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState<string>(user.name || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user.gender || 'male');
  const [age, setAge] = useState<number>(user.age || 25);
  const [heightCm, setHeightCm] = useState<number>(user.heightCm || 175);
  const [weightKg, setWeightKg] = useState<number>(user.weightKg || 75);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(user.targetWeightKg || 72);
  const [fitnessGoal, setFitnessGoal] = useState<'Hypertrophy' | 'Strength' | 'FatLoss' | 'General'>(
    user.fitnessGoal || 'Hypertrophy'
  );
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number>(
    user.trainingDaysPerWeek || 4
  );
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    user.experienceLevel || 'Intermediate'
  );

  // Calculated metrics
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '22.0';

  const handleNext = () => {
    sound.playBeep(600, 50);
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    sound.playBeep(450, 50);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    sound.playLevelUp();

    const cleanName = name.trim() || user.name || 'Atleta';
    const numWeight = Number(weightKg) || 70;
    const numTarget = Number(targetWeightKg) || numWeight;
    const todayStr = new Date().toISOString().split('T')[0];
    const updated: UserProfile = {
      ...user,
      name: cleanName,
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=06b6d4,3b82f6`,
      gender,
      age: Number(age) || 25,
      heightCm: Number(heightCm) || 175,
      weightKg: numWeight,
      targetWeightKg: numTarget,
      fitnessGoal,
      trainingDaysPerWeek: Number(trainingDaysPerWeek) || 4,
      experienceLevel,
      onboardingCompleted: true,
      // Give initial completion XP boost
      xp: (user.xp || 0) + 150,
      currentLevelXp: (user.currentLevelXp || 0) + 150,
      weightHistory: [
        {
          date: todayStr,
          weightKg: numWeight,
        },
      ],
    };

    try {
      await onComplete(updated);
    } catch (e) {
      console.error('Error saving onboarding data:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{ 
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
      }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#121214] border border-cyan-500/40 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Header with Step Tracker */}
        <div className="p-5 sm:p-6 border-b border-white/10 shrink-0 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest">
                Bienvenido a FitQuest Pro
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-400">
              Paso {step} de 3
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
            {step === 1 && 'Configura tus Métricas de Atleta'}
            {step === 2 && 'Define tus Objetivos de Élite'}
            {step === 3 && 'Tu Plan & Estilo de Entrenamiento'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {step === 1 && 'Personalizaremos tu tonelaje, cálculo calórico y niveles con tu biometría real.'}
            {step === 2 && 'Alinearemos tus rutinas y desafíos a lo que deseas lograr.'}
            {step === 3 && 'Ajusta tu frecuencia semanal para calcular tus rachas y recompensas de XP.'}
          </p>

          {/* Step Progress Indicators */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-white/10'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-white/10'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-white/10'}`} />
          </div>
        </div>

        {/* Step Body Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 relative z-10 no-scrollbar">
          
          {/* STEP 1: Biometrics (Name, Gender, Age, Height, Weight) */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Name Confirmation Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Nombre o Apodo de Atleta *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. David Guerrero"
                  className="w-full bg-[#09090b] border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-white placeholder-neutral-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 mb-2 uppercase tracking-wider">
                  Género
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'male', label: 'Hombre', icon: '♂️' },
                    { id: 'female', label: 'Mujer', icon: '♀️' },
                    { id: 'other', label: 'Otro', icon: '⚡' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        gender === g.id
                          ? 'border-cyan-400 bg-cyan-500/15 text-white font-bold shadow-md shadow-cyan-500/15'
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="text-xl mb-1">{g.icon}</div>
                      <span className="text-xs font-mono">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-neutral-300 flex items-center gap-1.5 uppercase">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edad (Años)</span>
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-neutral-300 flex items-center gap-1.5 uppercase">
                    <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Altura (cm)</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Current Weight & Live BMI preview */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-neutral-300 flex items-center gap-1.5 uppercase">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Peso Actual (kg)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-2xl pl-4 pr-16 py-3 text-sm font-mono font-bold text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-neutral-500">
                    KG
                  </span>
                </div>
              </div>

              {/* BMI Card Feedback */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-black tracking-wider block">
                    Índice de Masa Corporal (IMC)
                  </span>
                  <span className="text-xs text-neutral-300">
                    Calculado automáticamente con tu altura y peso.
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-black text-white">{bmi}</span>
                  <span className="text-[10px] font-mono text-cyan-400 block font-bold">kg/m²</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Fitness Goal & Target Weight */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 mb-2 uppercase tracking-wider">
                  ¿Cuál es tu objetivo principal?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'Hypertrophy',
                      title: 'Hipertrofia Muscular',
                      desc: 'Ganar volumen y densidad muscular con sobrecarga progresiva.',
                      icon: Dumbbell,
                      color: 'text-amber-400',
                      bg: 'bg-amber-500/10 border-amber-500/30',
                    },
                    {
                      id: 'FatLoss',
                      title: 'Pérdida de Grasa / Corte',
                      desc: 'Definir musculatura, aumentar gasto calórico y bajar % graso.',
                      icon: Flame,
                      color: 'text-orange-400',
                      bg: 'bg-orange-500/10 border-orange-500/30',
                    },
                    {
                      id: 'Strength',
                      title: 'Fuerza Máxima & PRs',
                      desc: 'Superar tus marcas personales en sentadilla, banca y peso muerto.',
                      icon: Zap,
                      color: 'text-cyan-400',
                      bg: 'bg-cyan-500/10 border-cyan-500/30',
                    },
                    {
                      id: 'General',
                      title: 'Salud & Rendimiento',
                      desc: 'Mantener constancia, vitalidad y resistencia funcional.',
                      icon: Heart,
                      color: 'text-emerald-400',
                      bg: 'bg-emerald-500/10 border-emerald-500/30',
                    },
                  ].map((g) => {
                    const IconComp = g.icon;
                    const isSelected = fitnessGoal === g.id;

                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFitnessGoal(g.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/30 shadow-lg'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${g.bg} ${g.color}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white font-display flex items-center justify-between">
                            <span>{g.title}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                            {g.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Weight Goal */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-mono font-bold text-neutral-300 flex items-center justify-between uppercase">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Peso Objetivo Deseado (kg)</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    Actual: {weightKg} kg
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-2xl pl-4 pr-16 py-3 text-sm font-mono font-bold text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-neutral-500">
                    KG
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {targetWeightKg < weightKg
                    ? `📉 Meta de déficit: reducir ${(weightKg - targetWeightKg).toFixed(1)} kg de forma saludable.`
                    : targetWeightKg > weightKg
                    ? `📈 Meta de volumen: ganar ${(targetWeightKg - weightKg).toFixed(1)} kg de masa corporal.`
                    : '🎯 Meta de mantenimiento y recomposición corporal.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Experience & Weekly Frequency */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Training Days per Week */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>Días de entrenamiento por semana</span>
                  <span className="text-cyan-400 font-mono font-black">{trainingDaysPerWeek} días/sem</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTrainingDaysPerWeek(days)}
                      className={`py-3 rounded-2xl border text-center transition-all cursor-pointer font-mono font-black ${
                        trainingDaysPerWeek === days
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md ring-2 ring-cyan-400/30 text-base'
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white text-sm'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 mb-2 uppercase tracking-wider">
                  Nivel de Experiencia en el Gimnasio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Beginner', label: 'Principiante', sub: '< 1 año' },
                    { id: 'Intermediate', label: 'Intermedio', sub: '1 a 3 años' },
                    { id: 'Advanced', label: 'Avanzado', sub: '+3 años' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        experienceLevel === lvl.id
                          ? 'border-cyan-400 bg-cyan-500/15 text-white font-bold shadow-md shadow-cyan-500/15'
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{lvl.label}</span>
                      <span className="text-[10px] font-mono text-neutral-500 mt-0.5 block">{lvl.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bonus XP Reward Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 shadow-lg shadow-amber-500/20">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black font-display text-white uppercase tracking-wider">
                    Recompensa de Iniciación
                  </h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    Recibirás <span className="text-amber-400 font-bold font-mono">+150 XP</span> y tu rango oficial al completar tu perfil.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#121214] shrink-0 flex items-center gap-3 relative z-10">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-neutral-950 font-display font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="font-mono">Iniciando Cyber Matrix...</span>
              ) : (
                <>
                  <span>Completar Perfil & Entrar (+150 XP)</span>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
