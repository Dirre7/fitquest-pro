import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed,
  Droplet,
  Flame,
  Scale,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Check,
  ChevronRight,
  ChevronLeft,
  TrendingDown,
  Info,
  Clock,
  Search,
  X,
  Target,
  Zap,
  Copy,
  Dumbbell,
  SlidersHorizontal,
  Coffee,
  Apple,
  Moon,
} from 'lucide-react';
import {
  UserProfile,
  Language,
  DailyNutritionLog,
  LoggedFoodItem,
  MealType,
  FoodItem,
  SaturdayWeighIn,
  WorkoutHistoryEntry,
  NutritionPlanConfig,
} from '../types';
import { FitStorage } from '../lib/storage';
import {
  NUTRITION_PLANS,
  getActiveNutritionPlan,
  MEAL_SLOTS,
  QUICK_ADD_FOODS,
  MealSlotConfig,
} from '../lib/nutritionData';
import { sound } from '../lib/soundFx';

interface NutritionViewProps {
  user: UserProfile;
  lang: Language;
  history?: WorkoutHistoryEntry[];
  onUpdateUser?: (updated: UserProfile) => void;
  onGrantXp?: (amount: number, reason: string) => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  user,
  lang,
  history = [],
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

  // Plan selector modal state
  const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false);
  const activePlan = getActiveNutritionPlan(user.activeNutritionPlanId);

  // Modal states for adding food
  const [addFoodModalOpen, setAddFoodModalOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState<MealType>('lunch');
  const [modalTab, setModalTab] = useState<'catalog' | 'custom'>('catalog');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'frequent' | 'protein' | 'carbs' | 'dairy' | 'fats' | 'fruits' | 'vegetables' | 'supplement'
  >('all');
  
  // Selected food state in modal
  const [selectedCatalogFood, setSelectedCatalogFood] = useState<Omit<FoodItem, 'id'> | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  // Custom food form state
  const [customFoodForm, setCustomFoodForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '1 ración',
    quantity: 1,
  });

  // Success toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const safePlayClick = () => {
    try {
      sound.playClick();
    } catch {}
  };

  const safePlaySuccess = () => {
    try {
      sound.playSuccess();
    } catch {}
  };

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

  // Listen for real-time remote updates from other devices via Firestore onSnapshot
  useEffect(() => {
    const handleRemoteNutritionUpdate = () => {
      setLog(FitStorage.getNutritionLog(selectedDate));
    };
    const handleRemoteWeighInsUpdate = () => {
      setWeighIns(FitStorage.getSaturdayWeighIns());
    };
    window.addEventListener('fitquest_nutrition_updated', handleRemoteNutritionUpdate);
    window.addEventListener('fitquest_weighins_updated', handleRemoteWeighInsUpdate);
    return () => {
      window.removeEventListener('fitquest_nutrition_updated', handleRemoteNutritionUpdate);
      window.removeEventListener('fitquest_weighins_updated', handleRemoteWeighInsUpdate);
    };
  }, [selectedDate]);

  // Save log whenever it changes
  const updateLog = (newLog: DailyNutritionLog) => {
    setLog(newLog);
    FitStorage.saveNutritionLog(newLog);
  };

  // Safe numerical calculations for current day
  const totals = useMemo(() => {
    return (log.foods || []).reduce(
      (acc, item) => {
        const qty = Number(item.quantity) || 1;
        const cal = Number(item.calories) || 0;
        const prot = Number(item.protein) || 0;
        const carb = Number(item.carbs) || 0;
        const fat = Number(item.fat) || 0;
        acc.calories += Math.round(cal * qty);
        acc.protein += Math.round(prot * qty);
        acc.carbs += Math.round(carb * qty);
        acc.fat += Math.round(fat * qty);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [log.foods]);

  const targetKcal = Number(log.targetCalories) || 2300;
  const targetProt = Number(log.targetProtein) || 180;
  const targetCarb = Number(log.targetCarbs) || 220;
  const targetFat = Number(log.targetFat) || 70;
  const targetWater = Number(log.waterGoalMl) || 3500;

  // Calculate workout calories burned on selectedDate from real workout history
  const workoutCaloriesToday = useMemo(() => {
    return (history || [])
      .filter((h) => h.date && h.date.startsWith(selectedDate))
      .reduce((sum, h) => sum + (Number(h.calories) || 0), 0);
  }, [history, selectedDate]);

  const netCalories = totals.calories - workoutCaloriesToday;

  const caloriesRemaining = Math.max(0, targetKcal - totals.calories);
  const caloriesPercent = Math.min(100, Math.round((totals.calories / targetKcal) * 100));
  const proteinPercent = Math.min(100, Math.round((totals.protein / targetProt) * 100));
  const carbsPercent = Math.min(100, Math.round((totals.carbs / targetCarb) * 100));
  const fatPercent = Math.min(100, Math.round((totals.fat / targetFat) * 100));
  const waterPercent = Math.min(100, Math.round(((log.waterMl || 0) / targetWater) * 100));

  // Weekly calendar days derived from selectedDate
  const weekDays = useMemo(() => {
    const parts = selectedDate.split('-');
    const current = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayOfWeek = current.getDay() || 7; // 1 (Mon) to 7 (Sun)
    const monday = new Date(current);
    monday.setDate(current.getDate() - (dayOfWeek - 1));

    const dayLabels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const iso = `${yyyy}-${mm}-${dd}`;
      days.push({
        label: dayLabels[i],
        dayNum: d.getDate(),
        iso,
        isToday: iso === todayStr,
        isSelected: iso === selectedDate,
      });
    }
    return days;
  }, [selectedDate, todayStr]);

  const handleShiftWeek = (offsetDays: number) => {
    safePlayClick();
    const parts = selectedDate.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleJumpToToday = () => {
    safePlayClick();
    setSelectedDate(todayStr);
  };

  const getMealIcon = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'mid_morning':
        return <Apple className="w-5 h-5 text-emerald-400" />;
      case 'lunch':
        return <UtensilsCrossed className="w-5 h-5 text-cyan-400" />;
      case 'snack':
        return <Zap className="w-5 h-5 text-orange-400" />;
      case 'dinner':
        return <Moon className="w-5 h-5 text-indigo-400" />;
    }
  };

  // Copy meals from the most recent previous logged day ("Repetir día anterior")
  const handleCopyYesterdayMeals = () => {
    safePlayClick();
    const allLogs = FitStorage.getAllNutritionLogs();
    const previousDates = Object.keys(allLogs)
      .filter((d) => d < selectedDate && Array.isArray(allLogs[d]?.foods) && allLogs[d].foods.length > 0)
      .sort((a, b) => b.localeCompare(a));

    if (previousDates.length === 0) {
      showToast('⚠️ No hay registros de comidas en días anteriores para copiar');
      return;
    }

    const sourceDate = previousDates[0];
    const sourceFoods = allLogs[sourceDate].foods || [];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const copiedFoods: LoggedFoodItem[] = sourceFoods.map((f, idx) => ({
      ...f,
      id: `copy_${Date.now()}_${idx}`,
      loggedAt: timeNow,
    }));

    const updatedFoods = [...(log.foods || []), ...copiedFoods];
    updateLog({ ...log, foods: updatedFoods });
    safePlaySuccess();
    showToast(`✓ ${copiedFoods.length} alimentos copiados del ${sourceDate}`);
  };

  // Toggle Day Type (Workout vs Rest)
  const handleToggleDayType = (type: 'workout' | 'rest') => {
    safePlayClick();
    const targetConfig = activePlan.targets[type];
    const newLog: DailyNutritionLog = {
      ...log,
      dayType: type,
      targetCalories: targetConfig.calories,
      targetProtein: targetConfig.protein,
      targetCarbs: targetConfig.carbs,
      targetFat: targetConfig.fat,
    };
    updateLog(newLog);
    showToast(`Día cambiado a ${type === 'workout' ? `Entreno (${targetConfig.calories.toLocaleString()} kcal)` : `Descanso (${targetConfig.calories.toLocaleString()} kcal)`}`);
  };

  // Switch Active Nutrition Plan
  const handleSelectPlan = (plan: NutritionPlanConfig) => {
    safePlaySuccess();
    const updatedUser = FitStorage.setActiveNutritionPlan(plan.id, user);
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    const updatedLog = FitStorage.getNutritionLog(selectedDate);
    setLog(updatedLog);
    setIsPlanSelectorOpen(false);
    showToast(`✓ Plan activado: ${plan.name}`);
  };

  // Hydration modification
  const handleAddWater = (deltaMl: number) => {
    safePlayClick();
    const newWater = Math.max(0, (log.waterMl || 0) + deltaMl);
    const newLog: DailyNutritionLog = {
      ...log,
      waterMl: newWater,
    };
    updateLog(newLog);

    if ((log.waterMl || 0) < targetWater && newWater >= targetWater && onGrantXp) {
      onGrantXp(25, 'Meta de hidratación diaria (3.5L)');
      safePlaySuccess();
      showToast('🎉 ¡Objetivo de hidratación alcanzado (3.5L)! +25 XP');
    }
  };

  // Add food item with explicit quantity
  const handleAddFoodItem = (
    food: Omit<FoodItem, 'id'>,
    mealType: MealType,
    quantity = 1
  ) => {
    safePlaySuccess();
    const safeQty = Math.max(0.25, Number(quantity) || 1);
    const newItem: LoggedFoodItem = {
      ...food,
      calories: Math.round(Number(food.calories) || 0),
      protein: Math.round(Number(food.protein) || 0),
      carbs: Math.round(Number(food.carbs) || 0),
      fat: Math.round(Number(food.fat) || 0),
      id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType,
      quantity: safeQty,
    };

    const updatedFoods = [...(log.foods || []), newItem];
    const updatedLog: DailyNutritionLog = { ...log, foods: updatedFoods };
    updateLog(updatedLog);

    const mealName = MEAL_SLOTS.find((s) => s.type === mealType)?.title || mealType;
    showToast(`✓ ${food.name} (${safeQty}x) añadido a ${mealName}`);

    // Grant XP for logging foods
    if (onGrantXp && updatedFoods.length === 3) {
      onGrantXp(25, 'Registro nutricional diario activo');
    }
  };

  // Update quantity of an existing food item
  const handleUpdateItemQuantity = (itemId: string, delta: number) => {
    safePlayClick();
    const updatedFoods = (log.foods || [])
      .map((item) => {
        if (item.id === itemId) {
          const currentQty = Number(item.quantity) || 1;
          const nextQty = Math.round((currentQty + delta) * 10) / 10;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      })
      .filter((item): item is LoggedFoodItem => item !== null);

    updateLog({ ...log, foods: updatedFoods });
  };

  // Remove food item
  const handleRemoveFoodItem = (itemId: string) => {
    safePlayClick();
    const updatedFoods = (log.foods || []).filter((f) => f.id !== itemId);
    updateLog({ ...log, foods: updatedFoods });
    showToast('Alimento eliminado');
  };

  // Load complete preloaded meal template from active plan
  const handleLoadMealTemplate = (slot: MealSlotConfig) => {
    safePlaySuccess();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newItems: LoggedFoodItem[] = slot.suggestedFoods.slice(0, 3).map((food, idx) => ({
      ...food,
      calories: Math.round(Number(food.calories) || 0),
      protein: Math.round(Number(food.protein) || 0),
      carbs: Math.round(Number(food.carbs) || 0),
      fat: Math.round(Number(food.fat) || 0),
      id: `plan_${Date.now()}_${idx}`,
      loggedAt: timeNow,
      mealType: slot.type,
      quantity: 1,
    }));
    const updatedFoods = [...(log.foods || []), ...newItems];
    updateLog({ ...log, foods: updatedFoods });
    showToast(`✓ Menú del plan cargado en ${slot.title}`);
  };

  // Save selected catalog food from modal
  const handleConfirmSaveSelectedCatalogFood = () => {
    if (!selectedCatalogFood) return;
    handleAddFoodItem(selectedCatalogFood, targetMealType, modalQuantity);
    setAddFoodModalOpen(false);
    setSelectedCatalogFood(null);
    setModalQuantity(1);
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
      targetMealType,
      customFoodForm.quantity || 1
    );

    setCustomFoodForm({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      servingSize: '1 ración',
      quantity: 1,
    });
    setAddFoodModalOpen(false);
  };

  // Save new Saturday weigh-in
  const handleSaveWeighIn = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weighInForm.weightKg);
    if (isNaN(weightNum) || weightNum <= 0) return;

    safePlaySuccess();
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

    if (onUpdateUser) {
      const updatedUser = FitStorage.logWeight(weightNum, newEntry.date, user);
      onUpdateUser(updatedUser);
    }

    if (onGrantXp) {
      onGrantXp(50, 'Pesaje y control de composición corporal');
    }

    showToast(`✓ Pesaje registrado: ${weightNum} kg`);
    setWeighInModalOpen(false);
  };

  const handleDeleteWeighIn = (id: string) => {
    safePlayClick();
    FitStorage.deleteSaturdayWeighIn(id);
    setWeighIns(FitStorage.getSaturdayWeighIns());
    showToast('Pesaje eliminado');
  };

  // Filtered food catalog (including 'frequent' tab derived from historical logs)
  const filteredCatalog = useMemo(() => {
    let list = QUICK_ADD_FOODS;

    if (categoryFilter === 'frequent') {
      const allLogs = FitStorage.getAllNutritionLogs();
      const countMap = new Map<string, { item: Omit<FoodItem, 'id'>; count: number }>();
      Object.values(allLogs).forEach((dayLog) => {
        (dayLog.foods || []).forEach((f) => {
          const existing = countMap.get(f.name);
          if (existing) {
            existing.count += 1;
          } else {
            countMap.set(f.name, {
              item: {
                name: f.name,
                calories: f.calories,
                protein: f.protein,
                carbs: f.carbs,
                fat: f.fat,
                servingSize: f.servingSize,
                category: f.category,
              },
              count: 1,
            });
          }
        });
      });

      const sortedFrequent = Array.from(countMap.values())
        .sort((a, b) => b.count - a.count)
        .map((x) => x.item);

      list = sortedFrequent.length > 0 ? sortedFrequent : QUICK_ADD_FOODS.slice(0, 12);
    }

    if (foodSearchQuery.trim()) {
      const q = foodSearchQuery.toLowerCase().trim();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (categoryFilter === 'all' || categoryFilter === 'frequent') {
      return list;
    }
    if (categoryFilter === 'protein') {
      return list.filter((f) => f.category === 'protein' || (!f.category && f.protein >= 15));
    }
    if (categoryFilter === 'carbs') {
      return list.filter((f) => f.category === 'carbs' || (!f.category && f.carbs >= 15));
    }
    if (categoryFilter === 'dairy') {
      return list.filter((f) => f.category === 'dairy');
    }
    if (categoryFilter === 'fats') {
      return list.filter((f) => f.category === 'fats' || (!f.category && f.fat >= 8));
    }
    if (categoryFilter === 'fruits') {
      return list.filter((f) => f.category === 'fruits' || (!f.category && (f.name.includes('Manzana') || f.name.includes('Plátano'))));
    }
    if (categoryFilter === 'vegetables') {
      return list.filter((f) => f.category === 'vegetables');
    }
    if (categoryFilter === 'supplement') {
      return list.filter((f) => f.category === 'supplement');
    }
    return list;
  }, [foodSearchQuery, categoryFilter, log.foods]);

  // Latest Weigh In & Progress
  const latestWeighIn = weighIns[0] || null;
  const oldestWeighIn = weighIns[weighIns.length - 1] || null;
  const initialWeight = oldestWeighIn ? oldestWeighIn.weightKg : (user.weightKg || 80.0);
  const currentWeight = latestWeighIn ? latestWeighIn.weightKg : (user.weightKg || initialWeight);
  const targetWeight = user.targetWeightKg || Math.max(50, initialWeight - 5);
  const totalKgDiff = Math.abs(initialWeight - targetWeight);
  const currentProgressKg = Math.abs(initialWeight - currentWeight);
  const targetProgressPercent = totalKgDiff > 0 ? Math.min(100, Math.max(0, Math.round((currentProgressKg / totalKgDiff) * 100))) : 100;
  const lostKgSoFar = Math.max(0, initialWeight - currentWeight);

  return (
    <div className="space-y-6 animate-in fade-in pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 border border-cyan-500/50 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-bold font-mono">{toastMessage}</span>
        </div>
      )}

      {/* Compact Top Bar: Subtabs Switcher (Diario vs Control Sábados) */}
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/5">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight uppercase">
            Nutrición
          </h1>
        </div>

        {/* Subtabs Switcher */}
        <div className="flex items-center bg-[#121214] border border-white/10 rounded-2xl p-1 shrink-0">
          <button
            onClick={() => {
              safePlayClick();
              setActiveSubTab('meals');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeSubTab === 'meals'
                ? 'bg-cyan-500 text-neutral-950 shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Diario</span>
          </button>
          <button
            onClick={() => {
              safePlayClick();
              setActiveSubTab('weighin');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeSubTab === 'weighin'
                ? 'bg-cyan-500 text-neutral-950 shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Control</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'meals' ? (
        <>
          {/* 1. HERO CALORIE BALANCE CARD WITH ARC GAUGE (First Priority: How you are doing today) */}
          <div className="bg-gradient-to-b from-[#16181D] via-[#121214] to-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-44 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

            {/* Top Row: Consumidas vs Arc Gauge vs Quemadas */}
            <div className="grid grid-cols-3 items-center gap-2 relative z-10">
              {/* Left: Consumidas */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-neutral-800/80 border border-white/10 flex items-center justify-center text-cyan-400 mb-2 shadow-inner">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold tracking-wider">
                  Consumido
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
                  {totals.calories.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">kcal</span>
              </div>

              {/* Center: Arc Gauge + Remaining */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="relative w-44 sm:w-52 h-36 sm:h-40 flex items-center justify-center">
                  <svg viewBox="0 0 200 150" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="calArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="calExceededArc" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    {/* Track Arc (250 degrees from 145° to 395°) */}
                    <path
                      d="M 38.6 128 A 75 75 0 1 1 161.4 128"
                      fill="none"
                      stroke="#1f242d"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    {/* Progress Arc */}
                    <path
                      d="M 38.6 128 A 75 75 0 1 1 161.4 128"
                      fill="none"
                      stroke={totals.calories > targetKcal ? 'url(#calExceededArc)' : 'url(#calArcGradient)'}
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={327.25}
                      strokeDashoffset={327.25 - (327.25 * Math.min(100, caloriesPercent)) / 100}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>

                  {/* Center Numbers */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 pointer-events-none text-center">
                    <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                      {totals.calories > targetKcal ? 'Superávit' : 'Restantes'}
                    </span>
                    <span className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-none my-0.5">
                      {totals.calories > targetKcal ? `+${(totals.calories - targetKcal).toLocaleString()}` : caloriesRemaining.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 font-extrabold uppercase tracking-wider">
                      kcal
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Quemadas */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-2 shadow-inner">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold tracking-wider">
                  Quemadas
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-orange-400 mt-0.5">
                  {workoutCaloriesToday.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">kcal entreno</span>
              </div>
            </div>

            {/* Equation Subline */}
            <div className="mt-2 text-center">
              <p className="text-[11px] font-mono text-neutral-400">
                Meta <span className="text-white font-bold">{targetKcal}</span> - Consumidas <span className="text-cyan-400 font-bold">{totals.calories}</span> + Quemadas <span className="text-orange-400 font-bold">{workoutCaloriesToday}</span> = Netas <span className="text-white font-bold">{netCalories}</span> kcal
              </p>
            </div>

            {/* Macro Breakdown Pills */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-white/5 relative z-10">
              {/* Proteínas */}
              <div className="bg-neutral-950/70 border border-white/5 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
                  <span className="text-cyan-400 font-mono uppercase tracking-wider text-[10px] sm:text-xs">
                    Proteínas
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/80">{proteinPercent}%</span>
                </div>
                <div className="my-1.5">
                  <div className="text-xs sm:text-sm font-mono font-black text-white">
                    {totals.protein} <span className="text-[10px] text-neutral-400 font-normal">/ {targetProt}g</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${proteinPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Grasas */}
              <div className="bg-neutral-950/70 border border-white/5 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
                  <span className="text-amber-400 font-mono uppercase tracking-wider text-[10px] sm:text-xs">
                    Grasas
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80">{fatPercent}%</span>
                </div>
                <div className="my-1.5">
                  <div className="text-xs sm:text-sm font-mono font-black text-white">
                    {totals.fat} <span className="text-[10px] text-neutral-400 font-normal">/ {targetFat}g</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${fatPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Carbohidratos */}
              <div className="bg-neutral-950/70 border border-white/5 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
                  <span className="text-blue-400 font-mono uppercase tracking-wider text-[10px] sm:text-xs">
                    Carbos
                  </span>
                  <span className="text-[10px] font-mono text-blue-400/80">{carbsPercent}%</span>
                </div>
                <div className="my-1.5">
                  <div className="text-xs sm:text-sm font-mono font-black text-white">
                    {totals.carbs} <span className="text-[10px] text-neutral-400 font-normal">/ {targetCarb}g</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${carbsPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. WEEKLY CALENDAR DAY STRIP (Second Priority: Dates & Day Type) */}
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-3 sm:p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => handleShiftWeek(-7)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Semana anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-neutral-300 capitalize">
                  {(() => {
                    const parts = selectedDate.split('-');
                    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                    return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                      month: 'long',
                      year: 'numeric',
                    });
                  })()}
                </span>
                <button
                  type="button"
                  onClick={() => handleShiftWeek(7)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Semana siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedDate !== todayStr && (
                  <button
                    type="button"
                    onClick={handleJumpToToday}
                    className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all cursor-pointer"
                  >
                    Hoy
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyYesterdayMeals}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-neutral-300 hover:text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Copiar todas las comidas registradas en el día anterior"
                >
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Repetir día anterior</span>
                  <span className="sm:hidden">Repetir</span>
                </button>
              </div>
            </div>

            {/* 7 Days Row */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => {
                    safePlayClick();
                    setSelectedDate(d.iso);
                  }}
                  className={`py-2 sm:py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
                    d.isSelected
                      ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-neutral-950 font-black shadow-lg shadow-cyan-500/30 scale-105'
                      : d.isToday
                      ? 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 font-bold hover:bg-neutral-800'
                      : 'bg-white/[0.03] border border-white/5 text-neutral-400 hover:text-white hover:bg-white/[0.07]'
                  }`}
                >
                  <span className={`text-[10px] tracking-wider uppercase font-extrabold ${d.isSelected ? 'text-neutral-950' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                    {d.label}
                  </span>
                  <span className={`text-sm sm:text-base font-mono font-black mt-0.5 ${d.isSelected ? 'text-neutral-950' : 'text-white'}`}>
                    {d.dayNum}
                  </span>
                  {d.isToday && !d.isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shadow-sm shadow-cyan-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Workout vs Rest Day toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 flex-wrap gap-2 text-xs">
              <span className="text-[11px] text-neutral-400 font-mono">Tipo de jornada:</span>
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => handleToggleDayType('workout')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    log.dayType === 'workout'
                      ? 'bg-cyan-500 text-neutral-950 shadow-sm font-extrabold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🏋️‍♂️ Entreno (2.300 kcal)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDayType('rest')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    log.dayType === 'rest'
                      ? 'bg-cyan-500 text-neutral-950 shadow-sm font-extrabold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🛋️ Descanso (2.100 kcal)
                </button>
              </div>
            </div>
          </div>

          {/* 3. ACTIVE NUTRITION PLAN WIDGET (Compact, zero fluff, prominent change plan button) */}
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {activePlan.badge}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    PLAN ACTIVO
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-400">
                    Meta: {targetWeight.toFixed(1)} kg
                  </span>
                </div>
                <h3 className="font-display font-black text-lg text-white tracking-tight mt-0.5 truncate">
                  {activePlan.name}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                safePlayClick();
                setIsPlanSelectorOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Explorar Planes (5)</span>
            </button>
          </div>

          {/* 3. HYDRATION WIDGET (Litros en Ruta) */}
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
                    {((log.waterMl || 0) / 1000).toFixed(2)} L
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    de {(targetWater / 1000).toFixed(1)} L ({waterPercent}%)
                  </div>
                </div>

                <button
                  onClick={() => handleAddWater(250)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  +250ml
                </button>
                <button
                  onClick={() => handleAddWater(500)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  +500ml
                </button>
                <button
                  onClick={() => handleAddWater(1000)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  +1.0L (Termo Coche)
                </button>
                {(log.waterMl || 0) > 0 && (
                  <button
                    onClick={() => handleAddWater(-250)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 text-xs transition-colors cursor-pointer"
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

          {/* 4. QUICK SEARCH BAR (Matching reference "¿Qué has comido?") */}
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="¿Qué has comido hoy? Buscar alimento rápido..."
              onClick={() => {
                safePlayClick();
                setTargetMealType('lunch');
                setSelectedCatalogFood(null);
                setModalQuantity(1);
                setFoodSearchQuery('');
                setModalTab('catalog');
                setAddFoodModalOpen(true);
              }}
              readOnly
              className="w-full bg-[#121214] hover:bg-neutral-900 border border-white/10 hover:border-cyan-500/40 rounded-2xl py-3.5 pl-11 pr-24 text-xs sm:text-sm text-neutral-200 placeholder:text-neutral-500 transition-all cursor-pointer shadow-md"
            />
            <button
              type="button"
              onClick={() => {
                safePlayClick();
                setTargetMealType('lunch');
                setSelectedCatalogFood(null);
                setModalQuantity(1);
                setFoodSearchQuery('');
                setModalTab('catalog');
                setAddFoodModalOpen(true);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Buscar
            </button>
          </div>

          {/* 5. MODERN MEAL SLOTS CARDS (Matching reference cards with thumb + button) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-cyan-400" />
                Comidas del Día
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                {(log.foods || []).length} alimentos registrados
              </span>
            </div>

            {MEAL_SLOTS.map((slot) => {
              const slotFoods = (log.foods || []).filter((f) => f.mealType === slot.type);
              const slotKcal = slotFoods.reduce(
                (sum, f) => sum + Math.round((Number(f.calories) || 0) * (Number(f.quantity) || 1)),
                0
              );
              const slotProtein = slotFoods.reduce(
                (sum, f) => sum + Math.round((Number(f.protein) || 0) * (Number(f.quantity) || 1)),
                0
              );

              return (
                <div
                  key={slot.type}
                  className="bg-[#121214] border border-white/10 hover:border-white/20 rounded-3xl p-4 sm:p-5 transition-all shadow-xl space-y-3"
                >
                  {/* Slot Main Row matching reference */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                        {getMealIcon(slot.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                            {slot.title}
                          </h3>
                          <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 hidden sm:inline">
                            {slot.timeRange}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-bold text-neutral-300 mt-0.5">
                          <span className={slotKcal > slot.targetKcal * 1.15 ? 'text-amber-400 font-black' : 'text-cyan-400 font-black'}>
                            {slotKcal}
                          </span>
                          <span className="text-neutral-500 font-normal"> / {slot.targetKcal} kcal</span>
                          <span className="text-neutral-500 font-normal ml-2 hidden sm:inline">({slotProtein}g prot)</span>
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {slotFoods.length > 0
                            ? slotFoods.map((f) => `${f.name.split('(')[0].trim()}${Number(f.quantity) > 1 ? ` (${f.quantity}x)` : ''}`).join(', ')
                            : 'Sin alimentos registrados aún'}
                        </p>
                      </div>
                    </div>

                    {/* Right: Modern Thumb + Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        safePlayClick();
                        setTargetMealType(slot.type);
                        setSelectedCatalogFood(null);
                        setModalQuantity(1);
                        setFoodSearchQuery('');
                        setModalTab('catalog');
                        setAddFoodModalOpen(true);
                      }}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-500 text-neutral-950 font-black flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                      title={`Añadir alimento a ${slot.title}`}
                    >
                      <Plus className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>

                  {/* Quick Action: Cargar Menú Plan */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold mr-1">
                        Sugerencias rápidas:
                      </span>
                      {slot.suggestedFoods.slice(0, 3).map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddFoodItem(item, slot.type, 1);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-neutral-200 hover:text-cyan-300 transition-all active:scale-95 cursor-pointer text-xs font-medium"
                          title={`Añadir 1x ${item.name} (${item.calories} kcal)`}
                        >
                          <Plus className="w-3 h-3 text-cyan-400 shrink-0 stroke-[2.5]" />
                          <span>{item.name.split('(')[0].trim()}</span>
                          <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-500/10 px-1 rounded ml-0.5">
                            {item.calories}k
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLoadMealTemplate(slot);
                      }}
                      title="Cargar menú sugerido de tu plan de nutrición con 1 click"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cargar Menú Plan</span>
                    </button>
                  </div>

                  {/* Slot Items List when logged */}
                  {slotFoods.length > 0 && (
                    <div className="divide-y divide-white/5 pt-1">
                      {slotFoods.map((item) => {
                        const qty = Number(item.quantity) || 1;
                        const itemKcal = Math.round((Number(item.calories) || 0) * qty);
                        const itemProt = Math.round((Number(item.protein) || 0) * qty);
                        const itemCarb = Math.round((Number(item.carbs) || 0) * qty);
                        const itemFat = Math.round((Number(item.fat) || 0) * qty);

                        return (
                          <div
                            key={item.id}
                            className="py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-neutral-100 truncate flex items-center gap-2">
                                <span>{item.name}</span>
                                {qty !== 1 && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
                                    {qty}x
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                                {item.servingSize && <span>{item.servingSize}</span>}
                                <span>•</span>
                                <span className="text-cyan-400 font-bold">{itemProt}g prot</span>
                                <span>•</span>
                                <span>{itemCarb}g carb</span>
                                <span>•</span>
                                <span>{itemFat}g gra</span>
                              </div>
                            </div>

                            {/* Quantity Controls & Calories */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemQuantity(item.id, -0.5)}
                                  className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                  title="Disminuir ración"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center font-mono font-bold text-[11px] text-white">
                                  {qty}x
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemQuantity(item.id, 0.5)}
                                  className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                  title="Aumentar ración"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="font-mono font-bold text-neutral-200 w-16 text-right">
                                {itemKcal} kcal
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveFoodItem(item.id)}
                                className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar alimento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
                  Seguimiento con báscula de bioimpedancia y cinta métrica para {user.name || 'tu perfil'}.
                </p>
              </div>

              <button
                onClick={() => {
                  safePlayClick();
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0 self-start sm:self-auto"
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
                  {initialWeight.toFixed(1)} kg
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
                  {targetWeight.toFixed(1)} kg
                </div>
                <span className="text-[10px] text-neutral-500">
                  {targetWeight < currentWeight
                    ? `Faltan ${(currentWeight - targetWeight).toFixed(1)} kg`
                    : targetWeight > currentWeight
                    ? `Faltan ${(targetWeight - currentWeight).toFixed(1)} kg`
                    : '¡Meta alcanzada!'}
                </span>
              </div>
            </div>

            {/* Overall Progress to Target Weight */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold font-mono mb-1.5">
                <span className="text-neutral-300">Progreso hacia {targetWeight.toFixed(1)} kg</span>
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

      {/* ======================================================== */}
      {/* 🍲 MODAL: AÑADIR ALIMENTO CON SELECTOR INTERACTIVO       */}
      {/* ======================================================== */}
      {addFoodModalOpen && (
        <div className="fixed inset-0 z-[70] pointer-events-auto flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg p-4 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Añadir Alimento</h3>
                  <p className="text-[11px] text-neutral-400">
                    Selecciona un alimento del plan o escribe uno libre
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddFoodModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Meal Selector Bar */}
            <div className="mt-3 shrink-0">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Comida de destino:
              </label>
              <div className="grid grid-cols-5 gap-1 bg-black/40 border border-white/10 rounded-2xl p-1">
                {MEAL_SLOTS.map((slot) => {
                  const isSelected = targetMealType === slot.type;
                  return (
                    <button
                      key={slot.type}
                      type="button"
                      onClick={() => {
                        safePlayClick();
                        setTargetMealType(slot.type);
                      }}
                      className={`py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all truncate text-center ${
                        isSelected
                          ? 'bg-cyan-500 text-neutral-950 shadow-md font-black'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                      title={slot.title}
                    >
                      {slot.title.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catalog vs Custom Tabs Switcher */}
            <div className="flex items-center gap-2 mt-3 p-1 bg-black/30 border border-white/5 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => {
                  safePlayClick();
                  setModalTab('catalog');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  modalTab === 'catalog'
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🔍 Catálogo de Alimentos ({QUICK_ADD_FOODS.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  safePlayClick();
                  setModalTab('custom');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  modalTab === 'custom'
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                ✍️ Crear Personalizado
              </button>
            </div>

            {/* Tab 1: Catalog Selector */}
            {modalTab === 'catalog' && (
              <div className="flex-1 flex flex-col min-h-0 mt-3">
                {/* Search & Category Pills */}
                <div className="space-y-2 shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar pollo, arroz, huevos, avena, salmón..."
                      value={foodSearchQuery}
                      onChange={(e) => setFoodSearchQuery(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    {foodSearchQuery && (
                      <button
                        onClick={() => setFoodSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pb-1 no-scrollbar">
                    {(
                      [
                        { id: 'all', label: 'Todos' },
                        { id: 'frequent', label: '⭐ Frecuentes' },
                        { id: 'protein', label: '🥩 Carnes y Pescados' },
                        { id: 'carbs', label: '🍚 Carbohidratos' },
                        { id: 'dairy', label: '🥛 Lácteos y Huevos' },
                        { id: 'fats', label: '🥑 Grasas / Frutos Secos' },
                        { id: 'fruits', label: '🍎 Frutas' },
                        { id: 'vegetables', label: '🥦 Verduras' },
                        { id: 'supplement', label: '⚡ Suplementos' },
                      ] as const
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          safePlayClick();
                          setCategoryFilter(c.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                          categoryFilter === c.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-white/5 text-neutral-400 hover:text-white border border-transparent'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrollable Food Items List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 pr-1 min-h-[140px] max-h-[220px] sm:max-h-[260px]">
                  {filteredCatalog.length > 0 ? (
                    filteredCatalog.map((item, idx) => {
                      const isSelected = selectedCatalogFood?.name === item.name;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            safePlayClick();
                            setSelectedCatalogFood(item);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                              : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10 hover:border-white/15'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-cyan-400 bg-cyan-500 text-neutral-950 font-black'
                                    : 'border-neutral-500 bg-transparent'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                              <span className="font-bold text-white truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5 ml-6">
                              <span className="text-cyan-400 font-bold">{item.protein}g P</span>
                              <span>•</span>
                              <span className="text-blue-400">{item.carbs}g C</span>
                              <span>•</span>
                              <span className="text-emerald-400">{item.fat}g G</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-bold text-cyan-400 text-xs">
                              {item.calories} kcal
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddFoodItem(item, targetMealType, 1);
                                setAddFoodModalOpen(false);
                              }}
                              className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-neutral-950 text-[10px] font-bold border border-cyan-500/30 transition-colors"
                              title="Añadir inmediatamente 1 ración"
                            >
                              + Añadir
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-neutral-500">
                      No se encontraron alimentos con ese filtro.
                    </div>
                  )}
                </div>

                {/* Selected Food Action Bar (When an item is chosen) */}
                <div className="pt-3 border-t border-white/10 mt-3 shrink-0">
                  {selectedCatalogFood ? (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-3">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono block">
                            Alimento Seleccionado:
                          </span>
                          <span className="font-bold text-white truncate block">
                            {selectedCatalogFood.name}
                          </span>
                        </div>

                        {/* Quantity Multiplier */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-neutral-400 font-mono">Ración:</span>
                          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-0.5">
                            <button
                              type="button"
                              onClick={() => setModalQuantity(Math.max(0.5, modalQuantity - 0.5))}
                              className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-xs text-white">
                              {modalQuantity}x
                            </span>
                            <button
                              type="button"
                              onClick={() => setModalQuantity(modalQuantity + 0.5)}
                              className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Primary Save Button */}
                      <button
                        type="button"
                        onClick={handleConfirmSaveSelectedCatalogFood}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-black text-xs shadow-lg transition-all hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>
                          Guardar en {MEAL_SLOTS.find((s) => s.type === targetMealType)?.title || targetMealType} (+{Math.round(selectedCatalogFood.calories * modalQuantity)} kcal)
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-neutral-400">
                      Toca cualquier alimento de la lista para seleccionarlo y guardarlo
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Custom Food Form */}
            {modalTab === 'custom' && (
              <form onSubmit={handleSaveCustomFood} className="flex-1 flex flex-col justify-between mt-3 space-y-3">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Nombre del plato o alimento *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Menú del día Kerakoll, Ensalada de pasta..."
                      value={customFoodForm.name}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, name: e.target.value })}
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2 font-mono">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Calorías *</label>
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Ración / Descripción</label>
                      <input
                        type="text"
                        placeholder="Ej: 1 plato, 200g, 1 rebanada"
                        value={customFoodForm.servingSize}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, servingSize: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Cantidad / Multiplicador</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={customFoodForm.quantity}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, quantity: Number(e.target.value) || 1 })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddFoodModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Guardar Alimento Personalizado</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ⚖️ MODAL: REGISTRAR PESAJE DEL SÁBADO                    */}
      {/* ======================================================== */}
      {weighInModalOpen && (
        <div className="fixed inset-0 z-[70] pointer-events-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
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
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-black shadow-md"
                >
                  Guardar Pesaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📋 Plan Selection Modal (5 Nutritional Plans) */}
      {isPlanSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-5 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Catálogo Nutricional
                </span>
                <h3 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-cyan-400" />
                  Elige tu Plan de Nutrición
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Selecciona el plan que mejor se adapte a tus metas. Los objetivos de calorías y macros se sincronizarán al instante.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanSelectorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {NUTRITION_PLANS.map((plan) => {
                const isActive = plan.id === activePlan.id;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-4 sm:p-5 border transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-base">{plan.badge}</span>
                          <h4 className="text-sm sm:text-base font-black text-white">
                            {plan.name}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500 text-neutral-950 flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                          {plan.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isActive}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 self-start sm:self-auto ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 cursor-default'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 shadow-md hover:scale-105 active:scale-95 cursor-pointer'
                        }`}
                      >
                        {isActive ? 'Plan Activo' : 'Activar Plan'}
                      </button>
                    </div>

                    {/* Macro Breakdown Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 pt-3 border-t border-white/5 font-mono text-xs">
                      <div className="bg-white/5 rounded-xl p-2 text-center">
                        <span className="text-[10px] text-neutral-400 block uppercase">Entreno</span>
                        <span className="font-black text-white">{plan.targets.workout.calories} kcal</span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2 text-center">
                        <span className="text-[10px] text-neutral-400 block uppercase">Descanso</span>
                        <span className="font-black text-neutral-300">{plan.targets.rest.calories} kcal</span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2 text-center">
                        <span className="text-[10px] text-cyan-400 block uppercase">Proteína</span>
                        <span className="font-black text-cyan-300">~{plan.targets.workout.protein}g</span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2 text-center">
                        <span className="text-[10px] text-blue-400 block uppercase">Agua</span>
                        <span className="font-black text-blue-300">{(plan.waterGoalMl / 1000).toFixed(1)} L/día</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
