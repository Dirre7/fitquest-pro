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
  // ==========================================
  // 🥩 1. CARNES MAGRAS Y AVES (PROTEÍNA PURA)
  // ==========================================
  { name: 'Pechuga de pollo a la plancha (150g)', calories: 165, protein: 35, carbs: 0, fat: 2, servingSize: '150g', category: 'protein' },
  { name: 'Pechuga de pollo a la plancha (200g)', calories: 220, protein: 46, carbs: 0, fat: 3, servingSize: '200g', category: 'protein' },
  { name: 'Pechuga de pavo al natural (150g)', calories: 158, protein: 36, carbs: 0, fat: 1.5, servingSize: '150g', category: 'protein' },
  { name: 'Pechuga de pavo braseada / fiambre >90% (80g)', calories: 72, protein: 16, carbs: 1, fat: 0.8, servingSize: '80g', category: 'protein' },
  { name: 'Solomillo de ternera magra (150g)', calories: 195, protein: 33, carbs: 0, fat: 6, servingSize: '150g', category: 'protein' },
  { name: 'Solomillo de ternera magra (200g)', calories: 260, protein: 44, carbs: 0, fat: 8, servingSize: '200g', category: 'protein' },
  { name: 'Carne picada de ternera magra <5% grasa (180g)', calories: 230, protein: 38, carbs: 0, fat: 7, servingSize: '180g', category: 'protein' },
  { name: 'Lomo embuchado ibérico extra magro (50g)', calories: 125, protein: 20, carbs: 0.5, fat: 4.5, servingSize: '50g', category: 'protein' },
  { name: 'Jamón serrano / ibérico sin tocino (60g)', calories: 135, protein: 22, carbs: 0.5, fat: 5, servingSize: '60g', category: 'protein' },
  { name: 'Cinta de lomo de cerdo a la plancha (150g)', calories: 185, protein: 32, carbs: 0, fat: 6, servingSize: '150g', category: 'protein' },
  { name: 'Hamburguesa casera pollo/pavo 100% (150g)', calories: 175, protein: 32, carbs: 1, fat: 4, servingSize: '150g', category: 'protein' },
  { name: 'Conejo asado / plancha (180g)', calories: 235, protein: 39, carbs: 0, fat: 8, servingSize: '180g', category: 'protein' },

  // ==========================================
  // 🐟 2. PESCADOS Y MARISCOS
  // ==========================================
  { name: 'Salmón fresco a la plancha (150g)', calories: 290, protein: 30, carbs: 0, fat: 18, servingSize: '150g', category: 'protein' },
  { name: 'Salmón fresco a la plancha (200g)', calories: 385, protein: 40, carbs: 0, fat: 24, servingSize: '200g', category: 'protein' },
  { name: 'Merluza a la plancha o al horno (200g)', calories: 170, protein: 34, carbs: 0, fat: 2, servingSize: '200g', category: 'protein' },
  { name: 'Bacalao fresco o desalado (200g)', calories: 160, protein: 36, carbs: 0, fat: 1, servingSize: '200g', category: 'protein' },
  { name: 'Lubina o Dorada al horno (220g)', calories: 215, protein: 42, carbs: 0, fat: 5, servingSize: '220g', category: 'protein' },
  { name: 'Atún al natural en lata (1 lata escurrida 52g)', calories: 55, protein: 13, carbs: 0, fat: 0.5, servingSize: '52g', category: 'protein' },
  { name: 'Atún al natural en lata (2 latas escurridas 104g)', calories: 110, protein: 26, carbs: 0, fat: 1, servingSize: '104g', category: 'protein' },
  { name: 'Lomo de atún fresco a la plancha (180g)', calories: 235, protein: 43, carbs: 0, fat: 6, servingSize: '180g', category: 'protein' },
  { name: 'Gambas o Langostinos cocidos pelados (150g)', calories: 140, protein: 31, carbs: 1, fat: 1.5, servingSize: '150g', category: 'protein' },
  { name: 'Calamares o Sepia a la plancha (200g)', calories: 160, protein: 32, carbs: 2, fat: 2, servingSize: '200g', category: 'protein' },
  { name: 'Mejillones al vapor (150g carne)', calories: 125, protein: 18, carbs: 5, fat: 3, servingSize: '150g', category: 'protein' },
  { name: 'Pulpo cocido a la gallega sin aceite (150g)', calories: 125, protein: 25, carbs: 2, fat: 1.5, servingSize: '150g', category: 'protein' },
  { name: 'Sardinas frescas a la plancha (150g)', calories: 210, protein: 28, carbs: 0, fat: 10, servingSize: '150g', category: 'protein' },
  { name: 'Salmón ahumado en lonchas (80g)', calories: 145, protein: 18, carbs: 0, fat: 8, servingSize: '80g', category: 'protein' },

  // ==========================================
  // 🥚 3. HUEVOS Y LÁCTEOS FITNESS
  // ==========================================
  { name: 'Huevo campero cocido o plancha (1 ud)', calories: 72, protein: 6.5, carbs: 0.5, fat: 5, servingSize: '1 ud (60g)', category: 'dairy' },
  { name: 'Huevos revueltos camperos (2 uds)', calories: 144, protein: 13, carbs: 1, fat: 10, servingSize: '2 uds', category: 'dairy' },
  { name: 'Huevos revueltos camperos (3 uds)', calories: 216, protein: 19.5, carbs: 1.5, fat: 15, servingSize: '3 uds', category: 'dairy' },
  { name: 'Claras de huevo pasteurizadas (150ml)', calories: 75, protein: 16, carbs: 1, fat: 0, servingSize: '150ml', category: 'dairy' },
  { name: 'Claras de huevo pasteurizadas (250ml)', calories: 125, protein: 27, carbs: 1.5, fat: 0, servingSize: '250ml', category: 'dairy' },
  { name: 'Queso fresco batido 0% (200g)', calories: 100, protein: 16, carbs: 7, fat: 0, servingSize: '200g', category: 'dairy' },
  { name: 'Queso fresco batido 0% (300g)', calories: 150, protein: 24, carbs: 10, fat: 0, servingSize: '300g', category: 'dairy' },
  { name: 'Yogur +Proteínas natural / sabor (125g)', calories: 75, protein: 12, carbs: 4, fat: 0, servingSize: '125g', category: 'dairy' },
  { name: 'Yogur griego auténtico natural (125g)', calories: 130, protein: 5, carbs: 4, fat: 10, servingSize: '125g', category: 'dairy' },
  { name: 'Queso Cottage / Requesón bajo en grasa (150g)', calories: 120, protein: 18, carbs: 4, fat: 3, servingSize: '150g', category: 'dairy' },
  { name: 'Queso tipo Burgos 0% desnatado (125g)', calories: 80, protein: 14, carbs: 4, fat: 0.5, servingSize: '125g', category: 'dairy' },
  { name: 'Mozzarella Light rallada / bola (50g)', calories: 110, protein: 13, carbs: 1, fat: 6, servingSize: '50g', category: 'dairy' },
  { name: 'Leche entera de vaca (250ml)', calories: 155, protein: 8, carbs: 12, fat: 8, servingSize: '250ml', category: 'dairy' },
  { name: 'Leche desnatada o semidesnatada (250ml)', calories: 90, protein: 8.5, carbs: 12, fat: 1, servingSize: '250ml', category: 'dairy' },
  { name: 'Bebida de almendras o avena 0% azúcar (250ml)', calories: 35, protein: 1, carbs: 3, fat: 2, servingSize: '250ml', category: 'dairy' },

  // ==========================================
  // 🍚 4. CARBOHIDRATOS LIMPIOS Y CEREALES
  // ==========================================
  { name: 'Arroz blanco cocido (150g)', calories: 195, protein: 4, carbs: 42, fat: 0.5, servingSize: '150g', category: 'carbs' },
  { name: 'Arroz blanco cocido (200g)', calories: 260, protein: 5, carbs: 56, fat: 0.5, servingSize: '200g', category: 'carbs' },
  { name: 'Arroz integral cocido (180g)', calories: 215, protein: 5, carbs: 45, fat: 2, servingSize: '180g', category: 'carbs' },
  { name: 'Arroz basmati / jazmín cocido (180g)', calories: 220, protein: 5, carbs: 48, fat: 0.5, servingSize: '180g', category: 'carbs' },
  { name: 'Copos de avena suaves en crudo (50g)', calories: 185, protein: 7, carbs: 32, fat: 3.5, servingSize: '50g', category: 'carbs' },
  { name: 'Copos de avena suaves en crudo (80g)', calories: 295, protein: 11, carbs: 51, fat: 5.5, servingSize: '80g', category: 'carbs' },
  { name: 'Harina de avena micronizada neutra/sabor (60g)', calories: 225, protein: 8, carbs: 39, fat: 4, servingSize: '60g', category: 'carbs' },
  { name: 'Crema de arroz instantánea (50g)', calories: 180, protein: 3.5, carbs: 40, fat: 0.5, servingSize: '50g', category: 'carbs' },
  { name: 'Patata cocida o asada sin piel (200g)', calories: 170, protein: 4, carbs: 38, fat: 0.2, servingSize: '200g', category: 'carbs' },
  { name: 'Patata cocida o asada sin piel (300g)', calories: 255, protein: 6, carbs: 57, fat: 0.3, servingSize: '300g', category: 'carbs' },
  { name: 'Boniato / Batata al horno o vapor (200g)', calories: 180, protein: 3, carbs: 41, fat: 0.5, servingSize: '200g', category: 'carbs' },
  { name: 'Pasta tradicional de trigo cocida (150g)', calories: 220, protein: 7, carbs: 44, fat: 1, servingSize: '150g', category: 'carbs' },
  { name: 'Pasta 100% integral cocida (150g)', calories: 210, protein: 8, carbs: 42, fat: 1, servingSize: '150g', category: 'carbs' },
  { name: 'Pan 100% integral artesano (60g - 2 rebanadas)', calories: 150, protein: 6, carbs: 28, fat: 1.5, servingSize: '60g', category: 'carbs' },
  { name: 'Pan 100% integral artesano (100g)', calories: 250, protein: 10, carbs: 47, fat: 2.5, servingSize: '100g', category: 'carbs' },
  { name: 'Pan de centeno puro alemán (70g)', calories: 160, protein: 5, carbs: 32, fat: 1, servingSize: '70g', category: 'carbs' },
  { name: 'Tortitas de arroz inflado natural (3 uds - 30g)', calories: 110, protein: 2.5, carbs: 24, fat: 0.6, servingSize: '3 uds', category: 'carbs' },
  { name: 'Tortitas de maíz inflado (3 uds - 30g)', calories: 115, protein: 2.5, carbs: 25, fat: 0.5, servingSize: '3 uds', category: 'carbs' },

  // ==========================================
  // 🫘 5. LEGUMBRES Y PROTEÍNA VEGETAL
  // ==========================================
  { name: 'Lentejas cocidas caseras o bote (200g)', calories: 230, protein: 18, carbs: 38, fat: 1, servingSize: '200g', category: 'carbs' },
  { name: 'Garbanzos cocidos de bote (200g)', calories: 260, protein: 15, carbs: 42, fat: 4, servingSize: '200g', category: 'carbs' },
  { name: 'Alubias blancas o rojas cocidas (200g)', calories: 240, protein: 17, carbs: 40, fat: 1.5, servingSize: '200g', category: 'carbs' },
  { name: 'Edamame en vaina o grano cocido (150g)', calories: 180, protein: 17, carbs: 12, fat: 7, servingSize: '150g', category: 'protein' },
  { name: 'Tofu firme natural a la plancha (150g)', calories: 160, protein: 18, carbs: 3, fat: 9, servingSize: '150g', category: 'protein' },
  { name: 'Tempeh marinado a la plancha (120g)', calories: 230, protein: 23, carbs: 10, fat: 11, servingSize: '120g', category: 'protein' },
  { name: 'Seitán a la plancha (150g)', calories: 190, protein: 36, carbs: 6, fat: 2, servingSize: '150g', category: 'protein' },
  { name: 'Hummus de garbanzo clásico (50g)', calories: 125, protein: 4, carbs: 9, fat: 8, servingSize: '50g', category: 'fats' },
  { name: 'Soja texturizada fina hidratada (150g)', calories: 175, protein: 25, carbs: 12, fat: 1, servingSize: '150g', category: 'protein' },
  { name: 'Guisantes tiernos cocidos (150g)', calories: 120, protein: 8, carbs: 19, fat: 0.5, servingSize: '150g', category: 'carbs' },

  // ==========================================
  // 🥑 6. GRASAS SALUDABLES, FRUTOS SECOS Y SEMILLAS
  // ==========================================
  { name: 'Aceite de oliva virgen extra (10ml / 1 cda sopera)', calories: 90, protein: 0, carbs: 0, fat: 10, servingSize: '10ml', category: 'fats' },
  { name: 'Aceite de oliva virgen extra (15ml / 1.5 cdas)', calories: 135, protein: 0, carbs: 0, fat: 15, servingSize: '15ml', category: 'fats' },
  { name: 'Aguacate Hass fresco (medio aguacate - 80g)', calories: 130, protein: 1.5, carbs: 3, fat: 12, servingSize: '80g', category: 'fats' },
  { name: 'Aguacate Hass fresco entero (150g)', calories: 245, protein: 3, carbs: 6, fat: 23, servingSize: '150g', category: 'fats' },
  { name: 'Nueces peladas al natural (25g)', calories: 165, protein: 3.5, carbs: 2.5, fat: 16, servingSize: '25g', category: 'fats' },
  { name: 'Almendras crudas sin sal (25g)', calories: 150, protein: 5, carbs: 4, fat: 13, servingSize: '25g', category: 'fats' },
  { name: 'Pistachos pelados tostados sin sal (25g)', calories: 145, protein: 5, carbs: 6, fat: 11, servingSize: '25g', category: 'fats' },
  { name: 'Anacardos al natural (25g)', calories: 145, protein: 4.5, carbs: 8, fat: 11, servingSize: '25g', category: 'fats' },
  { name: 'Crema de cacahuete 100% natural (20g / 1 cda)', calories: 125, protein: 5.5, carbs: 3, fat: 10, servingSize: '20g', category: 'fats' },
  { name: 'Crema de almendras 100% pura (20g)', calories: 125, protein: 4.5, carbs: 2.5, fat: 11, servingSize: '20g', category: 'fats' },
  { name: 'Semillas de chía o lino molidas (15g)', calories: 75, protein: 3, carbs: 5, fat: 5, servingSize: '15g', category: 'fats' },
  { name: 'Chocolate negro >85% cacao puro (20g - 2 onzas)', calories: 120, protein: 2, carbs: 4, fat: 10, servingSize: '20g', category: 'fats' },

  // ==========================================
  // 🍎 7. FRUTAS FRESCAS
  // ==========================================
  { name: 'Plátano o banana mediano (120g)', calories: 105, protein: 1.2, carbs: 25, fat: 0.3, servingSize: '1 ud (120g)', category: 'fruits' },
  { name: 'Manzana verde o roja (180g)', calories: 95, protein: 0.5, carbs: 24, fat: 0.3, servingSize: '1 pieza (180g)', category: 'fruits' },
  { name: 'Pera conferencia o de agua (180g)', calories: 90, protein: 0.5, carbs: 23, fat: 0.2, servingSize: '1 pieza (180g)', category: 'fruits' },
  { name: 'Fresas o fresones frescos (200g)', calories: 65, protein: 1.5, carbs: 14, fat: 0.5, servingSize: '200g', category: 'fruits' },
  { name: 'Arándanos frescos silvestres (125g)', calories: 70, protein: 1, carbs: 17, fat: 0.4, servingSize: '125g', category: 'fruits' },
  { name: 'Frambuesas frescas (125g)', calories: 65, protein: 1.5, carbs: 14, fat: 0.8, servingSize: '125g', category: 'fruits' },
  { name: 'Naranja de mesa grande (200g)', calories: 90, protein: 1.8, carbs: 21, fat: 0.2, servingSize: '1 pieza (200g)', category: 'fruits' },
  { name: 'Kiwi verde o amarillo (2 uds - 150g)', calories: 90, protein: 1.6, carbs: 20, fat: 0.8, servingSize: '2 uds (150g)', category: 'fruits' },
  { name: 'Sandía fresca troceada (300g)', calories: 90, protein: 1.8, carbs: 22, fat: 0.4, servingSize: '300g', category: 'fruits' },
  { name: 'Melón piel de sapo o cantaloupe (250g)', calories: 85, protein: 2, carbs: 20, fat: 0.3, servingSize: '250g', category: 'fruits' },
  { name: 'Piña natural en su jugo (150g)', calories: 75, protein: 0.8, carbs: 19, fat: 0.2, servingSize: '150g', category: 'fruits' },
  { name: 'Melocotón o nectarina fresca (150g)', calories: 60, protein: 1.4, carbs: 14, fat: 0.3, servingSize: '1 pieza (150g)', category: 'fruits' },

  // ==========================================
  // 🥦 8. VERDURAS, ENSALADAS Y CREMAS
  // ==========================================
  { name: 'Ensalada mixta (lechuga, canónigos, tomate, pepino)', calories: 30, protein: 1.5, carbs: 5, fat: 0.3, servingSize: '1 bol (150g)', category: 'vegetables' },
  { name: 'Brócoli al vapor o salteado (200g)', calories: 65, protein: 5.5, carbs: 11, fat: 0.8, servingSize: '200g', category: 'vegetables' },
  { name: 'Espárragos verdes trigueros a la plancha (150g)', calories: 35, protein: 3.5, carbs: 4, fat: 0.4, servingSize: '150g', category: 'vegetables' },
  { name: 'Espinacas frescas o salteadas al ajo (150g)', calories: 35, protein: 4, carbs: 5, fat: 0.6, servingSize: '150g', category: 'vegetables' },
  { name: 'Calabacín a la plancha o vapor (200g)', calories: 35, protein: 2.5, carbs: 6, fat: 0.5, servingSize: '200g', category: 'vegetables' },
  { name: 'Pimientos asados o a la plancha (150g)', calories: 45, protein: 1.5, carbs: 9, fat: 0.3, servingSize: '150g', category: 'vegetables' },
  { name: 'Champiñones o setas a la plancha con ajo (150g)', calories: 40, protein: 4.5, carbs: 5, fat: 0.5, servingSize: '150g', category: 'vegetables' },
  { name: 'Judías verdes cocidas (200g)', calories: 65, protein: 3.5, carbs: 14, fat: 0.4, servingSize: '200g', category: 'vegetables' },
  { name: 'Zanahorias crudas o al vapor (150g)', calories: 60, protein: 1.4, carbs: 14, fat: 0.3, servingSize: '150g', category: 'vegetables' },
  { name: 'Tomate de ensalada fresco en rodajas (150g)', calories: 28, protein: 1.3, carbs: 5.5, fat: 0.3, servingSize: '1 tomate (150g)', category: 'vegetables' },
  { name: 'Crema casera de calabacín y puerro sin nata (250ml)', calories: 85, protein: 2.5, carbs: 14, fat: 2, servingSize: '1 tazón (250ml)', category: 'vegetables' },
  { name: 'Gazpacho tradicional andaluz suave (250ml)', calories: 110, protein: 2, carbs: 11, fat: 6, servingSize: '250ml', category: 'vegetables' },

  // ==========================================
  // ⚡ 9. SUPLEMENTOS Y NUTRICIÓN DEPORTIVA
  // ==========================================
  { name: 'Proteína Whey concentrada (1 scoop 30g)', calories: 115, protein: 24, carbs: 2, fat: 1.5, servingSize: '30g polvo', category: 'supplement' },
  { name: 'Proteína Whey aislada / Iso Whey (1 scoop 30g)', calories: 110, protein: 27, carbs: 0.5, fat: 0.5, servingSize: '30g polvo', category: 'supplement' },
  { name: 'Caseína Micelar nocturna (1 scoop 30g)', calories: 110, protein: 24, carbs: 1.5, fat: 0.8, servingSize: '30g polvo', category: 'supplement' },
  { name: 'Proteína vegetal soja/guisante (1 scoop 30g)', calories: 115, protein: 24, carbs: 1.5, fat: 1.2, servingSize: '30g polvo', category: 'supplement' },
  { name: 'Barrita proteica baja en azúcares (60g)', calories: 210, protein: 20, carbs: 18, fat: 7, servingSize: '1 barrita (60g)', category: 'supplement' },
  { name: 'Creatina Creapure monohidrato (5g)', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: '5g polvo', category: 'supplement' },
  { name: 'Aminoácidos BCAAs / EAAs en polvo (10g)', calories: 40, protein: 9, carbs: 0.5, fat: 0, servingSize: '10g polvo', category: 'supplement' },
  { name: 'Bebida isotónica deportiva baja en azúcar (500ml)', calories: 70, protein: 0, carbs: 17, fat: 0, servingSize: '500ml', category: 'supplement' },
  { name: 'Gel energético pre/intra entreno (40g)', calories: 100, protein: 0, carbs: 25, fat: 0, servingSize: '1 gel (40g)', category: 'supplement' },
  { name: 'Café solo espresso o americano sin azúcar', calories: 2, protein: 0.2, carbs: 0.2, fat: 0, servingSize: '1 taza', category: 'supplement' },
];

