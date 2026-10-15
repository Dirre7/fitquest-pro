import { FoodItem, MealType } from '../types';

export interface MealSlotConfig {
  type: MealType;
  title: string;
  timeRange: string;
  targetKcal: number;
  targetProtein: number;
  description: string;
  suggestedFoods: Omit<FoodItem, 'id'>[];
}

export const RENATO_PLAN_CONFIG = {
  athleteName: 'Renato Cabrera',
  initialWeightKg: 103.7,
  targetWeightKg: 90.0,
  targetMuscleKg: 63.5,
  targetVisceralFatMax: 9,
  waterGoalMl: 3500, // 3.5 Liters (3.0 - 3.5L priority)
  targets: {
    workout: {
      calories: 2300,
      protein: 180,
      carbs: 220,
      fat: 70,
    },
    rest: {
      calories: 2100,
      protein: 180,
      carbs: 180,
      fat: 70,
    },
  },
};

export const MEAL_SLOTS: MealSlotConfig[] = [
  {
    type: 'breakfast',
    title: 'Desayuno',
    timeRange: '07:30 - 08:30',
    targetKcal: 550,
    targetProtein: 40,
    description: 'Energía sostenida y saciedad para empezar la jornada',
    suggestedFoods: [
      { name: 'Huevos enteros camperos (3 uds)', calories: 210, protein: 18, carbs: 1, fat: 15, servingSize: '3 uds' },
      { name: 'Pan 100% integral con tomate y AOVE (5g)', calories: 190, protein: 6, carbs: 28, fat: 6, servingSize: '60g' },
      { name: 'Pechuga de pavo braseada / jamón magro (60g)', calories: 65, protein: 14, carbs: 0, fat: 1, servingSize: '60g' },
      { name: 'Café solo o con chorrito de bebida vegetal', calories: 20, protein: 1, carbs: 2, fat: 0, servingSize: '1 taza' },
    ],
  },
  {
    type: 'mid_morning',
    title: 'Media Mañana',
    timeRange: '10:30 - 11:30',
    targetKcal: 235,
    targetProtein: 20,
    description: 'Fácil para llevar en el coche o entre visitas de obra',
    suggestedFoods: [
      { name: 'Yogur +Proteínas natural / sabor (125g)', calories: 75, protein: 12, carbs: 4, fat: 0, servingSize: '1 tarrina' },
      { name: 'Nueces o Almendras al natural (20g)', calories: 130, protein: 4, carbs: 3, fat: 12, servingSize: '20g' },
      { name: 'Manzana verde o plátano mediano', calories: 85, protein: 1, carbs: 21, fat: 0, servingSize: '1 pieza' },
    ],
  },
  {
    type: 'lunch',
    title: 'Comida Principal',
    timeRange: '14:00 - 15:00',
    targetKcal: 630,
    targetProtein: 50,
    description: 'Plato equilibrado: proteína magra, verdura abundante e hidrato complejo',
    suggestedFoods: [
      { name: 'Pechuga de pollo a la plancha (200g)', calories: 220, protein: 46, carbs: 0, fat: 3, servingSize: '200g' },
      { name: 'Arroz integral o basmati cocido (180g)', calories: 215, protein: 5, carbs: 46, fat: 2, servingSize: '180g' },
      { name: 'Ensalada verde / verduras con 1 cda AOVE (10g)', calories: 120, protein: 2, carbs: 6, fat: 10, servingSize: '1 ración' },
      { name: 'Salmón o Merluza al horno (Opción Pescado 200g)', calories: 210, protein: 38, carbs: 0, fat: 6, servingSize: '200g' },
      { name: 'Patata o Boniato al vapor / horno (Opción Hidrato 200g)', calories: 170, protein: 4, carbs: 38, fat: 0, servingSize: '200g' },
    ],
  },
  {
    type: 'snack',
    title: 'Merienda / Pre-Entreno',
    timeRange: '18:00 - 19:00',
    targetKcal: 290,
    targetProtein: 30,
    description: 'Aporte de aminoácidos y energía limpia antes o después del gym',
    suggestedFoods: [
      { name: 'Batido Proteína Whey (1 scoop 30g en agua)', calories: 115, protein: 24, carbs: 2, fat: 1.5, servingSize: '30g polvo' },
      { name: 'Tortitas de arroz / avena inflada (3 uds)', calories: 95, protein: 2, carbs: 20, fat: 1, servingSize: '3 tortitas' },
      { name: 'Queso fresco batido 0% con canela (150g)', calories: 75, protein: 13, carbs: 5, fat: 0, servingSize: '150g' },
    ],
  },
  {
    type: 'dinner',
    title: 'Cena Ligera',
    timeRange: '21:00 - 22:00',
    targetKcal: 535,
    targetProtein: 40,
    description: 'Digestión ligera para facilitar descanso nocturno y regeneración',
    suggestedFoods: [
      { name: 'Lubina, Dorada o Merluza al horno (220g)', calories: 200, protein: 40, carbs: 0, fat: 3, servingSize: '220g' },
      { name: 'Tortilla de 2 huevos con espinacas frescas', calories: 175, protein: 14, carbs: 2, fat: 12, servingSize: '1 tortilla' },
      { name: 'Crema casera de calabacín y puerro (sin nata)', calories: 85, protein: 2, carbs: 14, fat: 2, servingSize: '1 tazón' },
      { name: 'Patata cocida pequeña (100g - días de entreno)', calories: 85, protein: 2, carbs: 19, fat: 0, servingSize: '100g' },
    ],
  },
];

export const QUICK_ADD_FOODS: Omit<FoodItem, 'id'>[] = [
  { name: 'Pechuga de pollo (150g)', calories: 165, protein: 35, carbs: 0, fat: 2, servingSize: '150g' },
  { name: 'Pechuga de pollo (200g)', calories: 220, protein: 46, carbs: 0, fat: 3, servingSize: '200g' },
  { name: 'Huevos revueltos (2 uds)', calories: 140, protein: 12, carbs: 1, fat: 10, servingSize: '2 uds' },
  { name: 'Huevos revueltos (3 uds)', calories: 210, protein: 18, carbs: 1, fat: 15, servingSize: '3 uds' },
  { name: 'Claras de huevo (150ml)', calories: 75, protein: 16, carbs: 1, fat: 0, servingSize: '150ml' },
  { name: 'Salmón a la plancha (180g)', calories: 240, protein: 36, carbs: 0, fat: 10, servingSize: '180g' },
  { name: 'Merluza o Pescado blanco (200g)', calories: 170, protein: 34, carbs: 0, fat: 2, servingSize: '200g' },
  { name: 'Lata de atún al natural (2 latas 100g)', calories: 110, protein: 26, carbs: 0, fat: 1, servingSize: '100g' },
  { name: 'Arroz blanco/integral cocido (150g)', calories: 195, protein: 4, carbs: 42, fat: 1, servingSize: '150g' },
  { name: 'Arroz blanco/integral cocido (200g)', calories: 260, protein: 5, carbs: 56, fat: 1, servingSize: '200g' },
  { name: 'Patata cocida / asada (200g)', calories: 170, protein: 4, carbs: 38, fat: 0, servingSize: '200g' },
  { name: 'Pasta integral cocida (150g)', calories: 210, protein: 8, carbs: 42, fat: 1, servingSize: '150g' },
  { name: 'Avena en copos (50g)', calories: 185, protein: 7, carbs: 32, fat: 3, servingSize: '50g' },
  { name: 'Pan 100% integral (60g)', calories: 150, protein: 6, carbs: 28, fat: 1.5, servingSize: '60g' },
  { name: 'Batido Whey Protein (30g)', calories: 115, protein: 24, carbs: 2, fat: 1.5, servingSize: '30g' },
  { name: 'Yogur Proteico / Skýr (150g)', calories: 85, protein: 15, carbs: 5, fat: 0, servingSize: '150g' },
  { name: 'Queso fresco batido 0% (200g)', calories: 100, protein: 16, carbs: 7, fat: 0, servingSize: '200g' },
  { name: 'Nueces al natural (20g)', calories: 135, protein: 3, carbs: 2, fat: 13, servingSize: '20g' },
  { name: 'Almendras al natural (20g)', calories: 120, protein: 4, carbs: 3, fat: 10, servingSize: '20g' },
  { name: 'Aceite de oliva virgen extra (10ml / 1 cda)', calories: 90, protein: 0, carbs: 0, fat: 10, servingSize: '10ml' },
  { name: 'Manzana / Pera', calories: 80, protein: 0.5, carbs: 20, fat: 0, servingSize: '1 pieza' },
  { name: 'Plátano mediano', calories: 95, protein: 1, carbs: 23, fat: 0, servingSize: '1 pieza' },
  { name: 'Ensalada mixta fresca (lechuga, tomate, pepino)', calories: 35, protein: 1.5, carbs: 6, fat: 0.5, servingSize: '1 plato' },
  { name: 'Verduras salteadas o al vapor (brócoli, judías, zanahoria)', calories: 60, protein: 3, carbs: 10, fat: 0.5, servingSize: '200g' },
  { name: 'Tortitas de arroz simple (3 uds)', calories: 90, protein: 2, carbs: 20, fat: 0.5, servingSize: '3 uds' },
];
