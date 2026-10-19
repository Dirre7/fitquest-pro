import React from 'react';

export interface ExerciseGuideData {
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  cues: string[];
  commonMistakes: string[];
  renderGraphic: (className?: string) => React.ReactNode;
}

export const EXERCISE_GUIDES: Record<string, ExerciseGuideData> = {
  // 1. SQUAT (Sentadilla con barra)
  squat: {
    category: 'Pierna / Tren Inferior',
    primaryMuscles: ['Cuádriceps', 'Glúteo Mayor'],
    secondaryMuscles: ['Isquiosurales', 'Erectores Espinales', 'Core'],
    cues: [
      'Pies al ancho de hombros con las puntas ligeramente hacia afuera (15-30°).',
      'Inhala y bloquea diafragma (Bracing) antes de iniciar el descenso.',
      'Rompe el paralelo manteniendo pecho alto y rodillas alineadas con las puntas.',
      'Empuja con todo el pie manteniendo el peso repartido en talón y mediopié.',
    ],
    commonMistakes: [
      'Valgo de rodilla (colapso hacia adentro al subir).',
      'Levantar los talones del suelo durante el fondo.',
      'Perder la curvatura neutra lumbar (guiño de glúteo excesivo).',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bodyGradSquat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="barbellGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#71717a" />
            <stop offset="50%" stopColor="#e4e4e7" />
            <stop offset="100%" stopColor="#71717a" />
          </linearGradient>
          <filter id="glowSquat" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <ellipse cx="100" cy="225" rx="75" ry="10" fill="#06b6d4" fillOpacity="0.1" />
        <line x1="25" y1="225" x2="175" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        <rect x="25" y="65" width="150" height="6" rx="3" fill="url(#barbellGrad)" />
        <rect x="28" y="45" width="10" height="46" rx="3" fill="#06b6d4" filter="url(#glowSquat)" stroke="#22d3ee" strokeWidth="1.5" />
        <rect x="20" y="50" width="8" height="36" rx="2" fill="#0891b2" />
        <rect x="162" y="45" width="10" height="46" rx="3" fill="#06b6d4" filter="url(#glowSquat)" stroke="#22d3ee" strokeWidth="1.5" />
        <rect x="172" y="50" width="8" height="36" rx="2" fill="#0891b2" />
        <circle cx="100" cy="50" r="14" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M106 48 L114 49 L106 53 Z" fill="#22d3ee" />
        <path d="M100 64 L86 115" stroke="url(#bodyGradSquat)" strokeWidth="16" strokeLinecap="round" />
        <path d="M96 74 L84 105" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
        <path d="M92 68 L70 66 L65 72" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M108 68 L130 66 L135 72" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="82" cy="120" r="12" fill="#0891b2" stroke="#06b6d4" strokeWidth="2" />
        <path d="M82 120 L122 135 L118 210 L132 215" stroke="url(#bodyGradSquat)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M78 122 L110 138 L105 212 L120 216" stroke="#22d3ee" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="122" cy="135" r="4.5" fill="#f59e0b" filter="url(#glowSquat)" />
        <circle cx="110" cy="138" r="4" fill="#fbbf24" />
        <line x1="100" y1="40" x2="100" y2="225" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.6" />
      </svg>
    ),
  },

  // 2. BULGARIAN SPLIT SQUAT (Sentadilla Búlgara con pie elevado)
  bulgarian: {
    category: 'Pierna / Unilateral',
    primaryMuscles: ['Cuádriceps', 'Glúteo Mayor'],
    secondaryMuscles: ['Isquiosurales', 'Estabilizadores de Cadera', 'Core'],
    cues: [
      'Apoya el empeine de la pierna trasera sobre el banco o soporte elevado.',
      'Da un paso amplio con la pierna delantera para permitir un descenso profundo.',
      'Torso levemente inclinado hacia adelante para enfatizar activación de glúteo.',
      'Desciende hasta que la rodilla trasera casi roce el suelo de forma controlada.',
    ],
    commonMistakes: [
      'Paso delantero muy corto que sobrecarga la rodilla delantera.',
      'Empujar con la pierna trasera en vez de con el talón de la pierna activa.',
      'Perder el equilibrio por colocar los dos pies exactamente en la misma línea.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bulgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="220" x2="180" y2="220" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Bench behind */}
        <rect x="25" y="150" width="40" height="15" rx="3" fill="#27272a" stroke="#52525b" strokeWidth="1.5" />
        <line x1="32" y1="165" x2="32" y2="220" stroke="#71717a" strokeWidth="3" />
        <line x1="58" y1="165" x2="58" y2="220" stroke="#71717a" strokeWidth="3" />
        {/* Head */}
        <circle cx="115" cy="55" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Torso */}
        <path d="M115 67 L105 125" stroke="url(#bulgGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Arms holding dumbbells at sides */}
        <path d="M115 75 L115 130" stroke="#e4e4e7" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="110" y="128" width="10" height="16" rx="3" fill="#06b6d4" />
        {/* Rear leg resting on bench */}
        <path d="M102 125 L75 145 L45 150" stroke="#71717a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Lead front leg descending */}
        <path d="M106 125 L140 145 L135 215 L150 218" stroke="url(#bulgGrad)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="140" cy="145" r="4.5" fill="#f59e0b" />
      </svg>
    ),
  },

  // 3. BENCH PRESS (Press de Banca Plano con barra)
  bench: {
    category: 'Pectoral / Empuje',
    primaryMuscles: ['Pectoral Mayor', 'Pectoral Menor'],
    secondaryMuscles: ['Tríceps Braquial', 'Deltoides Anterior'],
    cues: [
      'Retrae y deprime firmemente las escápulas clavándolas en el banco.',
      'Arco lumbar natural estable y pies bien firmes en el suelo (Leg Drive).',
      'Desciende la barra con control hacia la parte baja del esternón.',
      'Codos a unos 45-70° respecto al torso, nunca a 90° abiertos.',
    ],
    commonMistakes: [
      'Rebotar la barra violentamente en el esternón.',
      'Despegar los glúteos del banco durante el empuje.',
      'Abrir los codos en exceso dañando los hombros.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bodyGradBench" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <rect x="40" y="112" width="130" height="12" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
        <rect x="55" y="124" width="8" height="35" rx="2" fill="#52525b" />
        <rect x="145" y="124" width="8" height="35" rx="2" fill="#52525b" />
        <circle cx="55" cy="102" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M66 106 Q95 96 125 108" stroke="url(#bodyGradBench)" strokeWidth="14" strokeLinecap="round" />
        <circle cx="128" cy="108" r="9" fill="#0891b2" />
        <path d="M128 108 L155 125 L165 160 L178 160" stroke="#06b6d4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="60" y1="58" x2="135" y2="58" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="95" cy="58" r="5" fill="#facc15" />
        <path d="M80 102 L70 78 L93 59" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M98 104 L108 80 L97 59" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  // 4. INCLINE BENCH (Press Inclinado con barra o mancuernas)
  incline_bench: {
    category: 'Pectoral Superior / Empuje',
    primaryMuscles: ['Haz Clavicular Pectoral (Superior)'],
    secondaryMuscles: ['Deltoides Anterior', 'Tríceps Braquial'],
    cues: [
      'Ajusta el respaldo del banco a unos 30° - 45° (máximo).',
      'Escápulas retraídas y pies empujando el suelo firmemente.',
      'Baja la barra o mancuernas a la parte alta del pecho (bajo las clavículas).',
      'Extiende sin descolocar los hombros en la parte alta.',
    ],
    commonMistakes: [
      'Inclinación excesiva (> 60°) que convierte el trabajo en press de hombro.',
      'Descolocar los hombros hacia adelante al empujar arriba.',
      'Recortar recorrido sin sentir el estiramiento en el pectoral superior.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="incBenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {/* Inclined Bench 35 deg */}
        <line x1="50" y1="50" x2="120" y2="120" stroke="#3f3f46" strokeWidth="12" strokeLinecap="round" />
        <rect x="110" y="118" width="50" height="10" rx="3" fill="#27272a" />
        <line x1="85" y1="120" x2="85" y2="160" stroke="#52525b" strokeWidth="6" />
        <line x1="145" y1="125" x2="145" y2="160" stroke="#52525b" strokeWidth="6" />
        {/* Athlete on incline bench */}
        <circle cx="68" cy="48" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M78 58 L125 110" stroke="url(#incBenchGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Legs down */}
        <path d="M125 115 L150 135 L155 165 L170 165" stroke="#06b6d4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Barbell / Dumbbell pressing up */}
        <line x1="85" y1="35" x2="135" y2="35" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
        <path d="M92 68 L80 48 L105 37" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="108" cy="35" r="4.5" fill="#facc15" />
      </svg>
    ),
  },

  // 5. CABLE CROSSOVER / FLYES (Cruces en Polea / Aperturas)
  cable_flyes: {
    category: 'Pectoral / Aislamiento',
    primaryMuscles: ['Pectoral Mayor (Aducción)'],
    secondaryMuscles: ['Deltoides Anterior', 'Bíceps (Cabeza Corta)'],
    cues: [
      'Da un paso al frente para ganar estabilidad con un pie adelantado.',
      'Codos ligeramente flexionados fijados en un ángulo constante.',
      'Junta las manos como si abrazaras un tronco gigante.',
      'Aprieta y mantén un segundo la contracción máxima en el centro.',
    ],
    commonMistakes: [
      'Transformar la apertura en un press empujando con tríceps.',
      'Modificar la flexión de los codos durante la ejecución.',
      'Balancear el torso hacia atrás para generar inercia.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="flyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="225" x2="180" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Pulleys on sides */}
        <circle cx="20" cy="50" r="8" fill="#27272a" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="180" cy="50" r="8" fill="#27272a" stroke="#06b6d4" strokeWidth="2" />
        {/* Cables pulling inwards */}
        <line x1="20" y1="50" x2="88" y2="115" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="180" y1="50" x2="112" y2="115" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Athlete Standing */}
        <circle cx="100" cy="60" r="13" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M100 73 L100 135" stroke="url(#flyGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Staggered Stance Legs */}
        <path d="M96 135 L85 180 L75 220" stroke="url(#flyGrad)" strokeWidth="9" strokeLinecap="round" />
        <path d="M104 135 L120 180 L125 220" stroke="url(#flyGrad)" strokeWidth="9" strokeLinecap="round" />
        {/* Rounded arms hugging tree */}
        <path d="M88 80 Q60 95 88 115" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M112 80 Q140 95 112 115" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="115" r="5" fill="#f43f5e" />
      </svg>
    ),
  },

  // 6. DIPS (Fondos en Paralelas)
  dips: {
    category: 'Pectoral & Tríceps / Calistenia',
    primaryMuscles: ['Tríceps Braquial', 'Pectoral Inferior'],
    secondaryMuscles: ['Deltoides Anterior', 'Serratos'],
    cues: [
      'Agárrate a las paralelas con brazos extendidos y codos bloqueados arriba.',
      'Para pecho: inclina el torso 30° hacia adelante y cruza los tobillos.',
      'Desciende hasta que los codos formen un ángulo de 90°.',
      'Empuja con las palmas extendiendo los codos con fuerza sin rebotar.',
    ],
    commonMistakes: [
      'Descender excesivamente forzando la cápsula anterior del hombro.',
      'Mantenerse demasiado vertical si el objetivo es entrenar pectoral.',
      'Balancear el cuerpo para impulsarse con las piernas.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="dipsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {/* Parallel Bars */}
        <rect x="35" y="100" width="130" height="8" rx="4" fill="#52525b" stroke="#71717a" strokeWidth="1" />
        <line x1="50" y1="108" x2="50" y2="225" stroke="#71717a" strokeWidth="6" />
        <line x1="150" y1="108" x2="150" y2="225" stroke="#71717a" strokeWidth="6" />
        {/* Head forward inclined */}
        <circle cx="108" cy="45" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Torso angled */}
        <path d="M105 58 L90 120" stroke="url(#dipsGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Crossed Knees suspended */}
        <path d="M90 120 L80 160 L95 190" stroke="url(#dipsGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arms bent in dip 90 deg */}
        <path d="M98 68 L60 85 L60 100" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M102 68 L140 85 L140 100" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy="85" r="4.5" fill="#f59e0b" />
        <circle cx="140" cy="85" r="4.5" fill="#f59e0b" />
      </svg>
    ),
  },

  // 7. DEADLIFT (Peso Muerto Convencional / Rumano)
  deadlift: {
    category: 'Cadena Posterior / Fuerza Total',
    primaryMuscles: ['Erectores Espinales', 'Glúteos', 'Isquiosurales'],
    secondaryMuscles: ['Dorsales', 'Trapecios', 'Antebrazos', 'Core'],
    cues: [
      'Barra a 2-3 cm de las espinillas sobre la mitad de los cordones del calzado.',
      'Bisagra de cadera hacia atrás; hombros ligeramente por delante de la barra.',
      'Activa dorsales (imagina exprimir naranjas en las axilas) para pegar la barra.',
      'Empuja la tierra con las piernas y extiende la cadera con bloqueo glúteo firme.',
    ],
    commonMistakes: [
      'Redondear la espalda baja (pérdida de rigidez en la columna neutra).',
      'Alejar la barra del cuerpo aumentando el brazo de palanca lumbar.',
      'Híper-extender la espalda hacia atrás en el bloqueo final.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bodyGradDeadlift" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="220" x2="180" y2="220" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        <circle cx="140" cy="80" r="13" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M148 78 L155 81 L148 84 Z" fill="#22d3ee" />
        <path d="M130 92 L75 130" stroke="url(#bodyGradDeadlift)" strokeWidth="14" strokeLinecap="round" />
        <circle cx="75" cy="130" r="12" fill="#0891b2" />
        <path d="M75 130 L105 160 L108 215 L125 218" stroke="url(#bodyGradDeadlift)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M125 96 L112 170" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
        <circle cx="112" cy="170" r="28" fill="#18181b" stroke="#06b6d4" strokeWidth="3" />
        <circle cx="112" cy="170" r="5" fill="#facc15" />
      </svg>
    ),
  },

  // 8. BARBELL ROW / PENDLAY (Remo con Barra 45° o Pendlay)
  barbell_row: {
    category: 'Espalda / Tracción Horizontal',
    primaryMuscles: ['Dorsal Ancho', 'Romboide', 'Trapecio Medio'],
    secondaryMuscles: ['Bíceps Braquial', 'Deltoides Posterior', 'Erectores Espinales'],
    cues: [
      'Inclina el torso entre 45° y paralelo al suelo manteniendo la columna neutra.',
      'Tira de los codos hacia atrás y hacia arriba en dirección a la cadera.',
      'Junta las escápulas con fuerza en el punto más alto del movimiento.',
      'Controla la bajada sin dejar que los hombros caigan hacia adelante.',
    ],
    commonMistakes: [
      'Tironear con las piernas o incorporar el torso para levantar el peso.',
      'Redondear la espalda lumbar por debilidad o exceso de carga.',
      'Llevar la barra al cuello en vez de hacia la boca del estómago.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="rowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="220" x2="180" y2="220" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Head aligned with 45 deg spine */}
        <circle cx="145" cy="75" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Torso inclined */}
        <path d="M135 85 L85 125" stroke="url(#rowGrad)" strokeWidth="14" strokeLinecap="round" />
        <circle cx="85" cy="125" r="10" fill="#0891b2" />
        {/* Legs bent in athletic hinge */}
        <path d="M85 125 L108 160 L105 215 L122 218" stroke="url(#rowGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arms pulling barbell up towards hips */}
        <path d="M125 90 L115 110 L105 130" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Barbell held at waist */}
        <circle cx="105" cy="130" r="10" fill="#06b6d4" stroke="#22d3ee" strokeWidth="2" />
        <circle cx="105" cy="130" r="3" fill="#facc15" />
      </svg>
    ),
  },

  // 9. LAT PULLDOWN (Jalón al Pecho en Polea)
  lat_pulldown: {
    category: 'Espalda / Tracción Vertical',
    primaryMuscles: ['Dorsal Ancho'],
    secondaryMuscles: ['Bíceps', 'Braquiorradial', 'Redondo Mayor'],
    cues: [
      'Siéntate con los muslos bien sujetos bajo los rodillos de la máquina.',
      'Agarre amplio, pecho alto y leve inclinación del torso (10-15° hacia atrás).',
      'Inicia bajando las escápulas y lleva la barra hacia la parte alta del esternón.',
      'Conduce los codos hacia las costillas y aprieta los dorsales 1 segundo.',
    ],
    commonMistakes: [
      'Inclinarse excesivamente hacia atrás convirtiéndolo en un remo con inercia.',
      'Bajar la barra detrás de la nuca (peligro cervical y de hombro).',
      'Tirar solo con la fuerza de los brazos sin activar los dorsales.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="pulldownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {/* Lat Machine frame & top cable */}
        <line x1="100" y1="15" x2="100" y2="40" stroke="#71717a" strokeWidth="3" />
        {/* Wide curved bar */}
        <path d="M40 50 Q100 45 160 50" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Seat & leg pads */}
        <rect x="75" y="150" width="50" height="10" rx="3" fill="#27272a" />
        <rect x="110" y="130" width="20" height="8" rx="2" fill="#52525b" />
        {/* Athlete seated */}
        <circle cx="100" cy="75" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M100 88 L98 150" stroke="url(#pulldownGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Seated legs under pads */}
        <path d="M98 150 L125 145 L125 210 L140 215" stroke="url(#pulldownGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arms pulling bar down */}
        <path d="M55 50 L80 75 L92 90" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M145 50 L120 75 L108 90" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  // 10. SEATED CABLE ROW (Remo Gironda en Polea Baja)
  seated_row: {
    category: 'Espalda / Tracción Horizontal',
    primaryMuscles: ['Dorsal Ancho', 'Romboide', 'Trapecio Medio'],
    secondaryMuscles: ['Bíceps', 'Braquial', 'Erectores Espinales'],
    cues: [
      'Pies apoyados en la plataforma con ligera flexión en las rodillas.',
      'Torso erguido a 90° con pecho proyectado y curvatura lumbar natural.',
      'Tira del agarre hacia el ombligo llevando los codos pegados al cuerpo.',
      'Junta las escápulas al final del recorrido y vuelve controlando el peso.',
    ],
    commonMistakes: [
      'Balancear el torso adelante y atrás para trampear repeticiones.',
      'Encorvar la espalda lumbar al estirar los brazos.',
      'Subir los hombros hacia las orejas encogiéndose.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="seatedRowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {/* Seat bench & footplates */}
        <rect x="40" y="165" width="85" height="12" rx="3" fill="#27272a" />
        <line x1="160" y1="140" x2="160" y2="180" stroke="#71717a" strokeWidth="6" strokeLinecap="round" />
        {/* Pulley in front */}
        <circle cx="165" cy="155" r="7" fill="#06b6d4" />
        <line x1="165" y1="155" x2="115" y2="135" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
        {/* Athlete seated */}
        <circle cx="75" cy="85" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M75 98 L75 165" stroke="url(#seatedRowGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Legs extended to footplates with slight bend */}
        <path d="M75 165 L115 155 L158 158" stroke="url(#seatedRowGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arms pulling V-bar */}
        <path d="M85 110 L100 125 L115 135" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="110" y="130" width="8" height="10" rx="2" fill="#facc15" />
      </svg>
    ),
  },

  // 11. PULL-UP (Dominadas Pronas Estrictas)
  pullup: {
    category: 'Espalda / Tracción Vertical',
    primaryMuscles: ['Dorsal Ancho', 'Redondo Mayor'],
    secondaryMuscles: ['Bíceps Braquial', 'Braquiorradial', 'Trapecio Medio/Bajo'],
    cues: [
      'Agarre pronado ligeramente más ancho que los hombros.',
      'Inicia la tracción bajando y juntando las escápulas antes de doblar los brazos.',
      'Conduce los codos hacia abajo y hacia las costillas.',
      'Pasa la barbilla por encima de la barra manteniendo el pecho proyectado.',
    ],
    commonMistakes: [
      'Kipping o balanceo excesivo del cuerpo en lugar de tracción estricta.',
      'Quedarse a medio recorrido sin estirar los brazos al descender.',
      'Encorvar los hombros hacia adelante en la parte alta.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bodyGradPull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <rect x="20" y="25" width="160" height="6" rx="3" fill="#71717a" stroke="#a1a1aa" strokeWidth="1" />
        <rect x="55" y="22" width="10" height="10" rx="3" fill="#22d3ee" />
        <rect x="135" y="22" width="10" height="10" rx="3" fill="#22d3ee" />
        <circle cx="100" cy="30" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M60 28 L50 62 L82 68" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M140 28 L150 62 L118 68" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M78 65 L88 120 L112 120 L122 65 Z" fill="url(#bodyGradPull)" stroke="#06b6d4" strokeWidth="2" />
        <path d="M94 122 L92 185 L98 220" stroke="url(#bodyGradPull)" strokeWidth="8" strokeLinecap="round" />
        <path d="M106 122 L108 185 L102 220" stroke="url(#bodyGradPull)" strokeWidth="8" strokeLinecap="round" />
      </svg>
    ),
  },

  // 12. OVERHEAD PRESS (Press Militar de Pie)
  overhead: {
    category: 'Hombros / Deltoides',
    primaryMuscles: ['Deltoides Anterior', 'Deltoides Lateral'],
    secondaryMuscles: ['Tríceps', 'Pectoral Superior', 'Core / Glúteos'],
    cues: [
      'Pies al ancho de caderas y glúteos fuertemente apretados.',
      'Agarre justo por fuera de los hombros con codos ligeramente adelantados a la barra.',
      'Mueve la cabeza levemente hacia atrás al inicio para despejar la trayectoria.',
      'Bloquea la barra sobre el centro de gravedad alineando muñecas, hombros y talones.',
    ],
    commonMistakes: [
      'Arquear la espalda baja en exceso al empujar peso excesivo.',
      'Usar impulso de rodillas (hacer Push Press en vez de Militar estricto).',
      'Empujar la barra hacia adelante en lugar de en trayectoria vertical recta.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bodyGradOhp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="30" y1="225" x2="170" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        <rect x="25" y="24" width="150" height="5" rx="2.5" fill="#e4e4e7" />
        <rect x="28" y="10" width="8" height="34" rx="2" fill="#06b6d4" stroke="#22d3ee" strokeWidth="1.5" />
        <rect x="164" y="10" width="8" height="34" rx="2" fill="#06b6d4" stroke="#22d3ee" strokeWidth="1.5" />
        <path d="M78 78 L65 48 L72 26" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M122 78 L135 48 L128 26" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy="65" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M100 80 L100 135" stroke="url(#bodyGradOhp)" strokeWidth="15" strokeLinecap="round" />
        <circle cx="100" cy="138" r="10" fill="#0891b2" />
        <path d="M93 145 L91 218 L80 222" stroke="url(#bodyGradOhp)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M107 145 L109 218 L120 222" stroke="url(#bodyGradOhp)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  // 13. FRENCH PRESS / SKULL CRUSHER (Press Francés con Barra Z)
  french_press: {
    category: 'Tríceps / Aislamiento',
    primaryMuscles: ['Tríceps (Cabeza Larga)', 'Tríceps (Medial/Lateral)'],
    secondaryMuscles: ['Antebrazos', 'Estabilizadores de Hombro'],
    cues: [
      'Tumbado en banco plano sosteniendo la barra Z con brazos extendidos hacia arriba.',
      'Codos fijos apuntando al techo; solo se doblan los antebrazos.',
      'Desciende la barra hacia la frente o justo detrás de la coronilla de forma controlada.',
      'Extiende los codos sintiendo la contracción máxima de los tríceps.',
    ],
    commonMistakes: [
      'Abrir los codos excesivamente hacia los lados.',
      'Mover los hombros convirtiendo el ejercicio en un pullover.',
      'Dejar caer la barra rápido sin control de la fase excéntrica.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="skullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <rect x="40" y="115" width="130" height="12" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
        <line x1="55" y1="127" x2="55" y2="165" stroke="#52525b" strokeWidth="6" />
        <line x1="145" y1="127" x2="145" y2="165" stroke="#52525b" strokeWidth="6" />
        {/* Athlete lying on bench */}
        <circle cx="58" cy="105" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M68 108 L125 110" stroke="url(#skullGrad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M125 110 L155 125 L160 160 L175 160" stroke="#06b6d4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arms holding EZ Bar descending towards forehead */}
        <path d="M80 105 L80 65 L48 78" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="80" cy="65" r="4.5" fill="#f59e0b" />
        {/* EZ Bar at forehead */}
        <circle cx="45" cy="80" r="9" fill="#06b6d4" stroke="#22d3ee" strokeWidth="2" />
        <circle cx="45" cy="80" r="3" fill="#facc15" />
      </svg>
    ),
  },

  // 14. PLANK / MOUNTAIN CLIMBERS / CORE FLOOR (Planchas / Mountain Climbers)
  plank_climber: {
    category: 'Core / Abdomen & Estabilidad',
    primaryMuscles: ['Recto Abdominal', 'Transverso del Abdomen'],
    secondaryMuscles: ['Flexores de Cadera', 'Deltoides', 'Glúteos'],
    cues: [
      'Colócate en plancha con manos o antebrazos firmes bajo los hombros.',
      'Cuerpo en una sola línea recta desde la cabeza hasta los talones.',
      'Activa glúteos y lleva el ombligo hacia la columna sin dejar caer la cadera.',
      'Para mountain climbers: lleva las rodillas al pecho alternando sin rebotar la cadera.',
    ],
    commonMistakes: [
      'Dejar caer la pelvis arqueando la zona lumbar.',
      'Subir los glúteos formando una pirámide en V.',
      'Mirar a los pies tensionando las cervicales.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="plankGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="155" x2="220" y2="155" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Head */}
        <circle cx="180" cy="75" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Straight Plank Spine */}
        <path d="M170 85 L105 105" stroke="url(#plankGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Support Arms / Hands */}
        <path d="M165 90 L165 152" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />
        {/* Back Leg Extended */}
        <path d="M105 105 L55 130 L45 152" stroke="url(#plankGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        {/* Mountain Climber Knee Drive Forward */}
        <path d="M105 105 L125 125 L110 148" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="125" cy="125" r="4.5" fill="#f59e0b" />
      </svg>
    ),
  },

  // 15. CONCEPT2 / ROWING MACHINE (Máquina de Remo Ergómetro)
  concept2_rower: {
    category: 'Cardiovascular & Tracción Total',
    primaryMuscles: ['Dorsales', 'Piernas (Cuádriceps/Glúteos)'],
    secondaryMuscles: ['Bíceps', 'Core', 'Erectores Espinales'],
    cues: [
      'Secuencia de tirón: 1) Piernas empujan, 2) Cadera bascula atrás, 3) Brazos tiran al esternón.',
      'Secuencia de retorno: 1) Brazos estiran, 2) Cadera bascula adelante, 3) Piernas flexionan.',
      'Espalda recta y neutra en todo momento, sin encorvarse en la atrapada.',
      'Cadencia rítmica: potencia rápida en el impulso y retorno controlado (ratio 1:2).',
    ],
    commonMistakes: [
      'Doblar las piernas antes de pasar el manillar de vuelta.',
      'Tirar con la espalda antes de haber extendido las piernas.',
      'Tensar hombros y cuello hacia arriba en vez de usar las piernas.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="rowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="160" x2="220" y2="160" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Ergometer Monorail & Flywheel */}
        <line x1="40" y1="145" x2="190" y2="145" stroke="#52525b" strokeWidth="5" strokeLinecap="round" />
        <circle cx="195" cy="125" r="22" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <circle cx="195" cy="125" r="8" fill="#0891b2" />
        {/* Athlete sliding seat */}
        <rect x="80" y="137" width="22" height="7" rx="2" fill="#27272a" />
        <circle cx="75" cy="85" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M78 96 L88 140" stroke="url(#rowerGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Legs pushing on footplates */}
        <path d="M90 140 L125 130 L160 140" stroke="url(#rowerGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arms pulling chain from flywheel */}
        <line x1="195" y1="125" x2="120" y2="108" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M85 102 L105 110 L120 108" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  // 16. FLOOR MOBILITY / STRETCH (Movilidad en suelo: Paloma, 90/90, Gato-Camello)
  floor_mobility: {
    category: 'Movilidad & Recuperación Articular',
    primaryMuscles: ['Cápsula de Cadera', 'Glúteo / Piramidal'],
    secondaryMuscles: ['Columna Torácica', 'Flexores de Cadera'],
    cues: [
      'Respira hondo y relaja la musculatura en cada exhalación sin forzar dolor agudo.',
      'En rotación 90/90: mantén el torso erguido mientras rotas las caderas de lado a lado.',
      'En postura de la paloma: pelvis cuadrada mirando al suelo, estirando glúteo profundo.',
      'En gato-camello: arquea y redondea vértebra por vértebra coordinando con diafragma.',
    ],
    commonMistakes: [
      'Aguantar la respiración en tensión en vez de exhalar lento.',
      'Compensar la falta de rotación de cadera retorciendo la columna lumbar.',
      'Realizar rebotes rápidos y bruscos que activan el reflejo miotático defensivo.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="mobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="155" x2="220" y2="155" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Mat on floor */}
        <rect x="35" y="152" width="170" height="6" rx="3" fill="#06b6d4" fillOpacity="0.15" />
        {/* Pigeon / 90-90 pose */}
        <circle cx="100" cy="70" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M100 82 L105 130" stroke="url(#mobGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Front bent leg 90 degrees on floor */}
        <path d="M105 130 L140 148 L105 152" stroke="url(#mobGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        {/* Rear leg extended on floor */}
        <path d="M105 130 L65 145 L40 152" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Hands lightly supporting on ground */}
        <path d="M98 90 L85 130 L85 152" stroke="#e4e4e7" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M105 90 L120 130 L120 152" stroke="#e4e4e7" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="105" cy="130" r="4.5" fill="#facc15" />
      </svg>
    ),
  },

  // 17. CARDIO / RUNNING / WALKING
  cardio: {
    category: 'Cardiovascular / Aeróbico',
    primaryMuscles: ['Sistema Cardiovascular', 'Cuádriceps', 'Gemelos'],
    secondaryMuscles: ['Glúteos', 'Isquiosurales', 'Core'],
    cues: [
      'Postura erguida con una leve inclinación hacia adelante desde los tobillos.',
      'Cadencia ágil y pasos cortos para no talonar bruscamente.',
      'Braceo fluido a 90° relajando hombros y cuello.',
      'Respiración rítmica coordinada con los pasos.',
    ],
    commonMistakes: [
      'Talonamiento excesivo por dar zancadas demasiado largas.',
      'Mirar a los pies encorvando la columna cervical.',
      'Agarrarse a los pasamanos de la cinta perdiendo gasto calórico y biomecánica.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bodyGradCardio" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="220" x2="180" y2="220" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="125" cy="50" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M120 62 L100 120" stroke="url(#bodyGradCardio)" strokeWidth="14" strokeLinecap="round" />
        <path d="M118 70 L145 88 L140 108" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M115 70 L85 82 L75 98" stroke="#71717a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M100 120 L135 145 L130 190 L145 195" stroke="url(#bodyGradCardio)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="135" cy="145" r="4.5" fill="#f59e0b" />
        <path d="M98 120 L65 155 L45 205 L35 215" stroke="#0891b2" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  // 18. DEFAULT / GENERAL STRENGTH
  general: {
    category: 'Fuerza & Acondicionamiento',
    primaryMuscles: ['Grupo Muscular Principal'],
    secondaryMuscles: ['Estabilizadores', 'Core'],
    cues: [
      'Controla el tempo del movimiento: fase excéntrica lenta (2-3s) y concéntrica potente.',
      'Respeta el rango de movimiento completo sin recortar recorrido.',
      'Mantén la tensión en el músculo objetivo durante toda la serie.',
      'Respira de forma controlada sin perder la estabilidad del tronco.',
    ],
    commonMistakes: [
      'Usar inercia o balanceo corporal para mover la carga.',
      'Dejar caer el peso en la fase negativa perdiendo tensión muscular.',
      'Forzar repeticiones con pérdida severa de técnica.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bodyGradGen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="55" r="14" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M100 70 L100 135" stroke="url(#bodyGradGen)" strokeWidth="16" strokeLinecap="round" />
        <path d="M85 75 L60 100 L62 120" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M115 75 L140 100 L138 120" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="54" y="115" width="16" height="10" rx="3" fill="#06b6d4" />
        <rect x="130" y="115" width="16" height="10" rx="3" fill="#06b6d4" />
        <path d="M92 135 L80 180 L75 220" stroke="url(#bodyGradGen)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M108 135 L120 180 L125 220" stroke="url(#bodyGradGen)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="40" y1="225" x2="160" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
      </svg>
    ),
  },
};

/**
 * Intelligent helper to resolve an exercise accurately to its corresponding visual guide
 */
export function getExerciseVisualGuide(exerciseName: string, muscleGroup?: string): ExerciseGuideData {
  const norm = (exerciseName || '').toLowerCase().trim();

  // 1. Concept2 Rowing Machine (Before generic rowing)
  if (norm.includes('concept2') || norm.includes('ergómetro') || norm.includes('ergometro')) {
    return EXERCISE_GUIDES.concept2_rower;
  }

  // 2. Bulgarian Split Squat (Unilateral)
  if (norm.includes('búlgara') || norm.includes('bulgara')) {
    return EXERCISE_GUIDES.bulgarian;
  }

  // 3. Squats & Leg Press
  if (
    norm.includes('sentadilla') ||
    norm.includes('squat') ||
    norm.includes('prensa') ||
    norm.includes('cuádriceps')
  ) {
    return EXERCISE_GUIDES.squat;
  }

  // 4. Deadlifts (Conventional & Romanian)
  if (
    norm.includes('peso muerto') ||
    norm.includes('deadlift') ||
    norm.includes('kettlebell swing') ||
    norm.includes('hip thrust') ||
    norm.includes('isquios')
  ) {
    return EXERCISE_GUIDES.deadlift;
  }

  // 5. Incline Press (Upper chest with barbell/dumbbells)
  if (norm.includes('inclinado') || norm.includes('inclinada')) {
    return EXERCISE_GUIDES.incline_bench;
  }

  // 6. Cable Cross & Flyes (Cruces / Aperturas)
  if (
    norm.includes('cruce') ||
    norm.includes('apertura') ||
    norm.includes('fly') ||
    norm.includes('cable crossover')
  ) {
    return EXERCISE_GUIDES.cable_flyes;
  }

  // 7. Parallel Dips (Fondos en Paralelas)
  if (
    norm.includes('fondo') ||
    norm.includes('dips') ||
    norm.includes('paralelas')
  ) {
    return EXERCISE_GUIDES.dips;
  }

  // 8. French Press & Skull Crushers (Triceps)
  if (
    norm.includes('francés') ||
    norm.includes('frances') ||
    norm.includes('skull crusher') ||
    norm.includes('press frances')
  ) {
    return EXERCISE_GUIDES.french_press;
  }

  // 9. Lat Pulldown (Jalón al pecho)
  if (norm.includes('jalón') || norm.includes('jalon') || norm.includes('lat pulldown')) {
    return EXERCISE_GUIDES.lat_pulldown;
  }

  // 10. Seated Cable Row (Remo Gironda)
  if (norm.includes('gironda') || (norm.includes('remo') && norm.includes('polea'))) {
    return EXERCISE_GUIDES.seated_row;
  }

  // 11. Barbell / Pendlay / Inverted Rows
  if (
    norm.includes('remo con barra') ||
    norm.includes('pendlay') ||
    norm.includes('australiana') ||
    norm.includes('remo con mancuerna') ||
    norm.includes('remo t')
  ) {
    return EXERCISE_GUIDES.barbell_row;
  }

  // 12. Flat Bench Press & Push-ups
  if (
    norm.includes('press de banca') ||
    norm.includes('bench press') ||
    norm.includes('press plano') ||
    norm.includes('flexiones') ||
    norm.includes('push-up')
  ) {
    return EXERCISE_GUIDES.bench;
  }

  // 13. Overhead Press & Shoulders (OHP / Pike / Face Pull)
  if (
    norm.includes('militar') ||
    norm.includes('ohp') ||
    norm.includes('overhead') ||
    norm.includes('pike') ||
    norm.includes('face pull') ||
    norm.includes('elevaciones')
  ) {
    return EXERCISE_GUIDES.overhead;
  }

  // 14. Pull-ups & Chin-ups (Dominadas colgadas)
  if (
    norm.includes('dominada') ||
    norm.includes('pull-up') ||
    norm.includes('chin-up')
  ) {
    return EXERCISE_GUIDES.pullup;
  }

  // 15. Planks, Climbers & Core floor work
  if (
    norm.includes('climber') ||
    norm.includes('plank') ||
    norm.includes('plancha') ||
    norm.includes('dragon flag') ||
    norm.includes('l-sit') ||
    norm.includes('burpee')
  ) {
    return EXERCISE_GUIDES.plank_climber;
  }

  // 16. Floor Mobility & Stretching (Paloma, Gato-camello, 90/90)
  if (
    norm.includes('gato') ||
    norm.includes('camello') ||
    norm.includes('paloma') ||
    norm.includes('90/90') ||
    norm.includes('movilidad') ||
    norm.includes('estiramiento')
  ) {
    return EXERCISE_GUIDES.floor_mobility;
  }

  // 17. Cardio, Running, Walking, Jumping
  if (
    muscleGroup === 'Cardio' ||
    norm.includes('carrera') ||
    norm.includes('running') ||
    norm.includes('caminata') ||
    norm.includes('andar') ||
    norm.includes('cinta') ||
    norm.includes('bici') ||
    norm.includes('ciclismo') ||
    norm.includes('sprint') ||
    norm.includes('salto') ||
    norm.includes('cuerda') ||
    norm.includes('skater') ||
    norm.includes('knees')
  ) {
    return EXERCISE_GUIDES.cardio;
  }

  return EXERCISE_GUIDES.general;
}
