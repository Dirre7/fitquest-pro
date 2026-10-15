import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed,
  Droplet,
  Flame,
  Scale,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Info,
  Clock,
  Search,
  X,
  Target,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  UserProfile,
  Language,
  DailyNutritionLog,
  LoggedFoodItem,
  MealType,
  FoodItem,
  SaturdayWeighIn,
} from '../types';
import { FitStorage } from '../lib/storage';
import {
  RENATO_PLAN_CONFIG,
  MEAL_SLOTS,
  QUICK_ADD_FOODS,
  MealSlotConfig,
} from '../lib/nutritionData';
import { sound } from '../lib/soundFx';

interface NutritionViewProps {
  user: UserProfile;
  lang: Language;
  onUpdateUser?: (updated: UserProfile) => void;
  onGrantXp?: (amount: number, reason: string) => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  user,
  lang,
  onUpdateUser,
  onGrantXp,
}) => {
  // Current active date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Daily log state
  const [log, setLog] = useState<DailyNutritionLog>(() => FitStorage.getNutritionLog(todayStr));

  // Saturday weigh-ins state
  const [weighIns, setWeighIns] = useState<SaturdayWeighIn[]>(() => FitStorage.getSaturdayWeighIns());

  // Active view tab: 'meals' or 'weighin'
  const [activeSubTab, setActiveSubTab] = useState<'meals' | 'weighin'>('meals');

  // Modal states
  const [addFoodModalOpen, setAddFoodModalOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState<MealType>('breakfast');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [customFoodForm, setCustomFoodForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '1 ración',
  });

  // Weigh-in modal state
  const [weighInModalOpen, setWeighInModalOpen] = useState(false);
  const [weighInForm, setWeighInForm] = useState({
    date: todayStr,
    weightKg: user.weightKg ? String(user.weightKg) : '103.7',
    fatPercent: '',
    muscleMassKg: '',
    visceralFat: '',
    waistCm: '',
    notes: '',
  });

  // Load log when selectedDate changes
  useEffect(() => {
    const loadedLog = FitStorage.getNutritionLog(selectedDate);
    setLog(loadedLog);
  }, [selectedDate]);

  // Save log whenever it changes
  const updateLog = (newLog: DailyNutritionLog) => {
    setLog(newLog);
    FitStorage.saveNutritionLog(newLog);
  };

  // Calculations for current day
  const totals = useMemo(() => {
    return log.foods.reduce(
      (acc, item) => {
        const qty = item.quantity || 1;
        acc.calories += Math.round(item.calories * qty);
        acc.protein += Math.round(item.protein * qty);
        acc.carbs += Math.round(item.carbs * qty);
        acc.fat += Math.round(item.fat * qty);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [log.foods]);

  const caloriesRemaining = Math.max(0, log.targetCalories - totals.calories);
  const caloriesPercent = Math.min(100, Math.round((totals.calories / log.targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((totals.protein / log.targetProtein) * 100));
  const carbsPercent = Math.min(100, Math.round((totals.carbs / log.targetCarbs) * 100));
  const fatPercent = Math.min(100, Math.round((totals.fat / log.targetFat) * 100));
  const waterPercent = Math.min(100, Math.round((log.waterMl / log.waterGoalMl) * 100));

  // Toggle Day Type (Workout vs Rest)
  const handleToggleDayType = (type: 'workout' | 'rest') => {
    sound.playClick();
    const targetConfig = RENATO_PLAN_CONFIG.targets[type];
    const newLog: DailyNutritionLog = {
      ...log,
      dayType: type,
      targetCalories: targetConfig.calories,
      targetProtein: targetConfig.protein,
      targetCarbs: targetConfig.carbs,
      targetFat: targetConfig.fat,
    };
    updateLog(newLog);
  };

  // Hydration modification
  const handleAddWater = (deltaMl: number) => {
    sound.playClick();
    const newWater = Math.max(0, log.waterMl + deltaMl);
    const newLog: DailyNutritionLog = {
      ...log,
      waterMl: newWater,
    };
    updateLog(newLog);

    // Reward XP if reached water goal for the first time today
    if (log.waterMl < log.waterGoalMl && newWater >= log.waterGoalMl && onGrantXp) {
      onGrantXp(25, 'Meta de hidratación diaria (3.5L)');
      sound.playSuccess();
    }
  };

  // Add food item to a meal slot
  const handleAddFoodItem = (food: Omit<FoodItem, 'id'>, mealType: MealType) => {
    sound.playClick();
    const newItem: LoggedFoodItem = {
      ...food,
      id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType,
      quantity: 1,
    };
    const updatedFoods = [...log.foods, newItem];
    const updatedLog = { ...log, foods: updatedFoods };
    updateLog(updatedLog);

    // Grant 15 XP for logging food
    if (onGrantXp && updatedFoods.length === 3) {
      onGrantXp(25, 'Registro nutricional diario activo');
    }
  };

  // Remove food item
  const handleRemoveFoodItem = (itemId: string) => {
    sound.playClick();
    const updatedFoods = log.foods.filter((f) => f.id !== itemId);
    updateLog({ ...log, foods: updatedFoods });
  };

  // Load complete preloaded meal template from Renato's plan
  const handleLoadMealTemplate = (slot: MealSlotConfig) => {
    sound.playClick();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newItems: LoggedFoodItem[] = slot.suggestedFoods.slice(0, 3).map((food, idx) => ({
      ...food,
      id: `plan_${Date.now()}_${idx}`,
      loggedAt: timeNow,
      mealType: slot.type,
      quantity: 1,
    }));
    const updatedFoods = [...log.foods, ...newItems];
    updateLog({ ...log, foods: updatedFoods });
    sound.playSuccess();
  };

  // Submit custom food
  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodForm.name.trim() || !customFoodForm.calories) return;

    handleAddFoodItem(
      {
        name: customFoodForm.name.trim(),
        calories: Number(customFoodForm.calories) || 0,
        protein: Number(customFoodForm.protein) || 0,
        carbs: Number(customFoodForm.carbs) || 0,
        fat: Number(customFoodForm.fat) || 0,
        servingSize: customFoodForm.servingSize || '1 ración',
      },
      targetMealType
    );

    setCustomFoodForm({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      servingSize: '1 ración',
    });
    setAddFoodModalOpen(false);
  };

  // Save new Saturday weigh-in
  const handleSaveWeighIn = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weighInForm.weightKg);
    if (isNaN(weightNum) || weightNum <= 0) return;

    sound.playSuccess();
    const newEntry: SaturdayWeighIn = {
      id: `weigh_${Date.now()}`,
      date: weighInForm.date || todayStr,
      weightKg: weightNum,
      fatPercent: weighInForm.fatPercent ? parseFloat(weighInForm.fatPercent) : undefined,
      muscleMassKg: weighInForm.muscleMassKg ? parseFloat(weighInForm.muscleMassKg) : undefined,
      visceralFat: weighInForm.visceralFat ? parseFloat(weighInForm.visceralFat) : undefined,
      waistCm: weighInForm.waistCm ? parseFloat(weighInForm.waistCm) : undefined,
      notes: weighInForm.notes.trim() || undefined,
    };

    FitStorage.saveSaturdayWeighIn(newEntry);
    setWeighIns(FitStorage.getSaturdayWeighIns());

    // Update user weight in parent state if newest
    if (onUpdateUser) {
      const updatedUser = FitStorage.logWeight(weightNum, newEntry.date, user);
      onUpdateUser(updatedUser);
    }

    if (onGrantXp) {
      onGrantXp(50, 'Pesaje y control de composición corporal');
    }

    setWeighInModalOpen(false);
  };

  const handleDeleteWeighIn = (id: string) => {
    sound.playClick();
    FitStorage.deleteSaturdayWeighIn(id);
    setWeighIns(FitStorage.getSaturdayWeighIns());
  };

  // Filtered food catalog
  const filteredCatalog = useMemo(() => {
    if (!foodSearchQuery.trim()) return QUICK_ADD_FOODS.slice(0, 10);
    const q = foodSearchQuery.toLowerCase().trim();
    return QUICK_ADD_FOODS.filter((f) => f.name.toLowerCase().includes(q));
  }, [foodSearchQuery]);

  // Latest Weigh In & Progress
  const latestWeighIn = weighIns[0] || null;
  const currentWeight = latestWeighIn ? latestWeighIn.weightKg : (user.weightKg || RENATO_PLAN_CONFIG.initialWeightKg);
  const totalKgToLose = RENATO_PLAN_CONFIG.initialWeightKg - RENATO_PLAN_CONFIG.targetWeightKg; // 13.7 kg
  const lostKgSoFar = Math.max(0, RENATO_PLAN_CONFIG.initialWeightKg - currentWeight);
  const targetProgressPercent = Math.min(100, Math.max(0, Math.round((lostKgSoFar / totalKgToLose) * 100)));

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Top Banner: Athlete Identity & Plan Reference */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 p-4 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Plan Personalizado Renato Cabrera
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-neutral-400 border border-white/10">
                Protección Lumbar
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <UtensilsCrossed className="w-7 h-7 text-cyan-400" />
              Nutrición & Macros
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Déficit calórico estratégico (~550 kcal) para alcanzar <strong className="text-white">90.0 kg</strong> manteniendo 63-64 kg de músculo. Prioridad de hidratación continua en carretera.
            </p>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1 shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                sound.playClick();
                setActiveSubTab('meals');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'meals'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Diario de Comidas</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveSubTab('weighin');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'weighin'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Control Sábados</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'meals' ? (
        <>
          {/* Day Navigator & Day-Type Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/60 border border-white/10 rounded-2xl p-3 sm:p-4">
            {/* Date selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
              />
              {selectedDate === todayStr && (
                <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                  Hoy
                </span>
              )}
            </div>

            {/* Workout vs Rest Day toggle */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => handleToggleDayType('workout')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  log.dayType === 'workout'
                    ? 'bg-cyan-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🏋️‍♂️ Día de Entreno (2.300 kcal)
              </button>
              <button
                onClick={() => handleToggleDayType('rest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  log.dayType === 'rest'
                    ? 'bg-cyan-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🛋️ Día de Descanso (2.100 kcal)
              </button>
            </div>
          </div>

          {/* Macro Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Calories Card */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Calorías
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/5">
                  {caloriesRemaining > 0 ? `${caloriesRemaining} restantes` : 'Objetivo cumplido'}
                </span>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono text-white tracking-tight">
                    {totals.calories}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    / {log.targetCalories} kcal
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      totals.calories > log.targetCalories
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${caloriesPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-neutral-500">
                {totals.calories > log.targetCalories ? '⚠️ Superaste la meta' : 'En zona de déficit quema grasa'}
              </span>
            </div>

            {/* Protein Card (180g) */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-cyan-400" />
                  Proteína (Clave)
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {totals.protein >= log.targetProtein ? '100% Meta' : `${Math.round(log.targetProtein - totals.protein)}g faltan`}
                </span>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono text-cyan-400 tracking-tight">
                    {totals.protein}g
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    / {log.targetProtein}g
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${proteinPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-neutral-500">
                Protege tu masa muscular (63-64 kg)
              </span>
            </div>

            {/* Carbs Card (220g / 180g) */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-400" />
                  Carbohidratos
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/5">
                  {Math.round(log.targetCarbs - totals.carbs)}g
                </span>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono text-blue-400 tracking-tight">
                    {totals.carbs}g
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    / {log.targetCarbs}g
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${carbsPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-neutral-500">
                {log.dayType === 'workout' ? 'Energía para el entreno' : 'Moderado en descanso'}
              </span>
            </div>

            {/* Fats Card (70g) */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-emerald-400" />
                  Grasas Saludables
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/5">
                  {Math.round(log.targetFat - totals.fat)}g
                </span>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                    {totals.fat}g
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    / {log.targetFat}g
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${fatPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-neutral-500">
                AOVE, aguacate, nueces
              </span>
            </div>
          </div>

          {/* Hydration Widget (3.0 - 3.5 Liters Priority) */}
          <div className="bg-gradient-to-r from-blue-950/40 via-neutral-900 to-blue-950/30 border border-blue-500/20 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Droplet className="w-5 h-5 fill-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Hidratación en Ruta</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Objetivo 3.5 Litros
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Fundamental para proteger tus discos lumbares y evitar fatiga al volante.
                  </p>
                </div>
              </div>

              {/* Progress & Quick Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-right mr-2">
                  <div className="text-xl font-black font-mono text-blue-400">
                    {(log.waterMl / 1000).toFixed(2)} L
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    de {(log.waterGoalMl / 1000).toFixed(1)} L ({waterPercent}%)
                  </div>
                </div>

                <button
                  onClick={() => handleAddWater(250)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all hover:scale-105"
                >
                  +250ml
                </button>
                <button
                  onClick={() => handleAddWater(500)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all hover:scale-105"
                >
                  +500ml
                </button>
                <button
                  onClick={() => handleAddWater(1000)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all hover:scale-105"
                >
                  +1.0L (Termo Coche)
                </button>
                {log.waterMl > 0 && (
                  <button
                    onClick={() => handleAddWater(-250)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 text-xs transition-colors"
                    title="Restar 250ml"
                  >
                    -250
                  </button>
                )}
              </div>
            </div>

            {/* Water progress bar */}
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          {/* 5 Daily Meal Slots Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-cyan-400" />
                Las 5 Comidas del Día
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                {log.foods.length} alimentos registrados
              </span>
            </div>

            {MEAL_SLOTS.map((slot) => {
              const slotFoods = log.foods.filter((f) => f.mealType === slot.type);
              const slotKcal = slotFoods.reduce((sum, f) => sum + (f.calories * (f.quantity || 1)), 0);
              const slotProtein = slotFoods.reduce((sum, f) => sum + (f.protein * (f.quantity || 1)), 0);

              return (
                <div
                  key={slot.type}
                  className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4 transition-all hover:border-white/20"
                >
                  {/* Slot Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{slot.title}</h3>
                        <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {slot.timeRange}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{slot.description}</p>
                    </div>

                    {/* Target & current count */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white">
                          <span className={slotKcal > slot.targetKcal * 1.2 ? 'text-amber-400' : 'text-cyan-400'}>
                            {slotKcal}
                          </span>{' '}
                          / {slot.targetKcal} kcal
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          {slotProtein}g / ~{slot.targetProtein}g prot
                        </div>
                      </div>

                      {/* Button to load preloaded meal from Renato's plan */}
                      <button
                        onClick={() => handleLoadMealTemplate(slot)}
                        title="Cargar menú sugerido de tu plan de nutrición con 1 click"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all hover:scale-105"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden xs:inline">Cargar Menú Plan</span>
                      </button>

                      {/* Add Food Button */}
                      <button
                        onClick={() => {
                          setTargetMealType(slot.type);
                          setFoodSearchQuery('');
                          setAddFoodModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                        title="Añadir alimento manual o frecuente"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Slot Items List */}
                  {slotFoods.length > 0 ? (
                    <div className="divide-y divide-white/5 mt-2">
                      {slotFoods.map((item) => (
                        <div
                          key={item.id}
                          className="py-2.5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-neutral-100 truncate">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                              {item.servingSize && <span>{item.servingSize}</span>}
                              <span>•</span>
                              <span className="text-cyan-400 font-bold">{item.protein}g prot</span>
                              <span>•</span>
                              <span>{item.carbs}g carb</span>
                              <span>•</span>
                              <span>{item.fat}g gra</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono font-bold text-neutral-200">
                              {item.calories} kcal
                            </span>
                            <button
                              onClick={() => handleRemoveFoodItem(item.id)}
                              className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                              title="Eliminar alimento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs text-neutral-500">
                        Aún no has registrado nada en {slot.title.toLowerCase()}.
                      </p>
                      <button
                        onClick={() => handleLoadMealTemplate(slot)}
                        className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                      >
                        Cargar recomendación del plan ({slot.targetKcal} kcal)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Saturday Weigh-In & Body Composition View */
        <div className="space-y-6">
          {/* Main Weigh-in Progress Card */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Protocolo de Pesaje: Sábados en Ayunas
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                  Control de Composición Corporal
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Seguimiento con báscula de bioimpedancia y cinta métrica para Renato Cabrera.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setWeighInForm({
                    date: todayStr,
                    weightKg: String(currentWeight),
                    fatPercent: latestWeighIn?.fatPercent ? String(latestWeighIn.fatPercent) : '',
                    muscleMassKg: latestWeighIn?.muscleMassKg ? String(latestWeighIn.muscleMassKg) : '',
                    visceralFat: latestWeighIn?.visceralFat ? String(latestWeighIn.visceralFat) : '',
                    waistCm: latestWeighIn?.waistCm ? String(latestWeighIn.waistCm) : '',
                    notes: '',
                  });
                  setWeighInModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs shadow-lg transition-all hover:scale-105 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nuevo Pesaje</span>
              </button>
            </div>

            {/* Target Weight Gauge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Peso Inicial
                </span>
                <div className="text-2xl font-black font-mono text-neutral-400 mt-1">
                  {RENATO_PLAN_CONFIG.initialWeightKg} kg
                </div>
                <span className="text-[10px] text-neutral-500">Punto de partida</span>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Peso Actual</span>
                  <span className="text-[10px] font-mono">
                    {lostKgSoFar > 0 ? `-${lostKgSoFar.toFixed(1)} kg` : '0 kg'}
                  </span>
                </span>
                <div className="text-3xl font-black font-mono text-white mt-1">
                  {currentWeight.toFixed(1)} kg
                </div>
                <span className="text-[10px] text-cyan-400/80">
                  {latestWeighIn ? `Último registro: ${latestWeighIn.date}` : 'Sin registros'}
                </span>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Objetivo Final
                </span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {RENATO_PLAN_CONFIG.targetWeightKg} kg
                </div>
                <span className="text-[10px] text-neutral-500">
                  Faltan {(currentWeight - RENATO_PLAN_CONFIG.targetWeightKg).toFixed(1)} kg
                </span>
              </div>
            </div>

            {/* Overall Progress to 90 kg */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold font-mono mb-1.5">
                <span className="text-neutral-300">Progreso hacia 90 kg</span>
                <span className="text-cyan-400">{targetProgressPercent}% completado</span>
              </div>
              <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${targetProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Targets Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-neutral-400 uppercase">Masa Muscular</div>
              <div className="text-xl font-black font-mono text-white mt-1">
                {latestWeighIn?.muscleMassKg ? `${latestWeighIn.muscleMassKg} kg` : '--'}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono mt-1">
                Meta: 63 - 64 kg (Preservar)
              </div>
            </div>

            <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-neutral-400 uppercase">% Grasa Corporal</div>
              <div className="text-xl font-black font-mono text-white mt-1">
                {latestWeighIn?.fatPercent ? `${latestWeighIn.fatPercent}%` : '--'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">
                Meta: Reducción gradual
              </div>
            </div>

            <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-neutral-400 uppercase">Grasa Visceral</div>
              <div className="text-xl font-black font-mono text-white mt-1">
                {latestWeighIn?.visceralFat ? `Nivel ${latestWeighIn.visceralFat}` : '--'}
              </div>
              <div className="text-[10px] text-amber-400 font-mono mt-1">
                Meta: Nivel &lt; 9
              </div>
            </div>

            <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-neutral-400 uppercase">Perímetro Cintura</div>
              <div className="text-xl font-black font-mono text-white mt-1">
                {latestWeighIn?.waistCm ? `${latestWeighIn.waistCm} cm` : '--'}
              </div>
              <div className="text-[10px] text-blue-400 font-mono mt-1">
                Medición a nivel ombligo
              </div>
            </div>
          </div>

          {/* Historical Weigh-ins Table */}
          <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4 sm:p-5">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Historial de Pesajes Registrados
            </h3>

            {weighIns.length > 0 ? (
              <div className="divide-y divide-white/5 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="text-neutral-400 border-b border-white/10 font-mono">
                      <th className="pb-2">Fecha</th>
                      <th className="pb-2">Peso (kg)</th>
                      <th className="pb-2">% Grasa</th>
                      <th className="pb-2">Músculo (kg)</th>
                      <th className="pb-2">Grasa Visceral</th>
                      <th className="pb-2">Cintura (cm)</th>
                      <th className="pb-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {weighIns.map((w) => (
                      <tr key={w.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 font-bold text-white">{w.date}</td>
                        <td className="py-3 font-black text-cyan-400">{w.weightKg} kg</td>
                        <td className="py-3 text-neutral-300">{w.fatPercent ? `${w.fatPercent}%` : '-'}</td>
                        <td className="py-3 text-neutral-300">{w.muscleMassKg ? `${w.muscleMassKg} kg` : '-'}</td>
                        <td className="py-3 text-neutral-300">{w.visceralFat ?? '-'}</td>
                        <td className="py-3 text-neutral-300">{w.waistCm ? `${w.waistCm} cm` : '-'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteWeighIn(w.id)}
                            className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                            title="Eliminar pesaje"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">
                No hay pesajes registrados todavía.
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Add Food Item */}
      {addFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-black text-white">Añadir Alimento</h3>
                <span className="text-xs text-cyan-400 font-bold capitalize">
                  {MEAL_SLOTS.find((s) => s.type === targetMealType)?.title || targetMealType}
                </span>
              </div>
              <button
                onClick={() => setAddFoodModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick search from database */}
            <div className="my-4">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Buscar en Alimentos Frecuentes
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej: Pollo, Arroz, Merluza, Yogur, Avena..."
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Suggestions chips */}
              <div className="mt-2.5 max-h-48 overflow-y-auto space-y-1.5">
                {filteredCatalog.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleAddFoodItem(item, targetMealType);
                      setAddFoodModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent text-left text-xs transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-white group-hover:text-cyan-300">
                        {item.name}
                      </span>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {item.protein}g prot • {item.carbs}g carb • {item.fat}g gra
                      </div>
                    </div>
                    <span className="font-mono font-bold text-cyan-400">
                      {item.calories} kcal
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom food entry */}
            <form onSubmit={handleSaveCustomFood} className="pt-4 border-t border-white/10 space-y-3">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                O escribe un Alimento Personalizado
              </span>
              <div>
                <input
                  type="text"
                  placeholder="Nombre del alimento o plato"
                  value={customFoodForm.name}
                  onChange={(e) => setCustomFoodForm({ ...customFoodForm, name: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 font-mono">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Kcal</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={customFoodForm.calories}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, calories: e.target.value })}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-cyan-400 block mb-1">Prot (g)</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={customFoodForm.protein}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, protein: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-blue-400 block mb-1">Carb (g)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={customFoodForm.carbs}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, carbs: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-1">Grasa (g)</label>
                  <input
                    type="number"
                    placeholder="8"
                    value={customFoodForm.fat}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, fat: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddFoodModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold shadow-md"
                >
                  Guardar Alimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Saturday Weigh-In */}
      {weighInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                Registrar Pesaje del Sábado
              </h3>
              <button
                onClick={() => setWeighInModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeighIn} className="space-y-3.5 mt-4">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Fecha del Pesaje
                </label>
                <input
                  type="date"
                  value={weighInForm.date}
                  onChange={(e) => setWeighInForm({ ...weighInForm, date: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Peso Corporal (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="103.7"
                  value={weighInForm.weightKg}
                  onChange={(e) => setWeighInForm({ ...weighInForm, weightKg: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-cyan-500/40 rounded-xl px-3 py-2 text-sm font-mono font-black text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    % Grasa Corporal
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="28.5"
                    value={weighInForm.fatPercent}
                    onChange={(e) => setWeighInForm({ ...weighInForm, fatPercent: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Masa Muscular (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="63.8"
                    value={weighInForm.muscleMassKg}
                    onChange={(e) => setWeighInForm({ ...weighInForm, muscleMassKg: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Grasa Visceral (1-15)
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={weighInForm.visceralFat}
                    onChange={(e) => setWeighInForm({ ...weighInForm, visceralFat: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Cintura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="102"
                    value={weighInForm.waistCm}
                    onChange={(e) => setWeighInForm({ ...weighInForm, waistCm: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Notas u Observaciones
                </label>
                <textarea
                  placeholder="Sensaciones, retención de líquidos, semana de carretera, etc."
                  value={weighInForm.notes}
                  onChange={(e) => setWeighInForm({ ...weighInForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWeighInModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold shadow-md"
                >
                  Guardar Pesaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
