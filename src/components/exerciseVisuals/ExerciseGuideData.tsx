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
  // 1. SQUAT (Sentadilla Trasera con Barra)
  squat: {
    category: 'Pierna / Tren Inferior',
    primaryMuscles: ['Cuádriceps', 'Glúteo Mayor'],
    secondaryMuscles: ['Isquiosurales', 'Erectores Espinales', 'Core'],
    cues: [
      'Pies a la anchura de hombros con puntas ligeramente hacia afuera (15-30°).',
      'Inhala diafragmático (Bracing) para fijar el core antes de descender.',
      'Rompe el paralelo manteniendo el pecho alto y rodillas hacia las puntas.',
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

  // 2. LEG PRESS (Prensa Inclinada 45° en máquina)
  leg_press: {
    category: 'Pierna / Máquina Pesada',
    primaryMuscles: ['Cuádriceps', 'Glúteo Mayor'],
    secondaryMuscles: ['Aductores', 'Isquiosurales'],
    cues: [
      'Espalda y glúteos perfectamente apoyados contra el respaldo sin despegarse.',
      'Pies al ancho de hombros sobre la plataforma a 45°.',
      'Desciende hasta formar 90° en rodillas sin redondear la pelvis.',
      'Empuja con toda la planta del pie sin bloquear las rodillas al final.',
    ],
    commonMistakes: [
      'Despegar el sacro/glúteos del asiento en la parte baja (peligro lumbar).',
      'Bloquear e hiperextender bruscamente las rodillas arriba.',
      'Colapso de rodillas hacia adentro durante el empuje.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="pressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="165" x2="220" y2="165" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 3" />
        {/* Machine Frame 45 deg Rails */}
        <line x1="60" y1="160" x2="190" y2="30" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
        {/* 45 deg Foot Sled Platform */}
        <rect x="145" y="45" width="30" height="12" rx="3" transform="rotate(-45 145 45)" fill="#06b6d4" stroke="#22d3ee" strokeWidth="1.5" />
        {/* Weight plates on sled */}
        <circle cx="160" cy="50" r="14" fill="#18181b" stroke="#06b6d4" strokeWidth="2" />
        {/* Reclined Seat */}
        <line x1="50" y1="150" x2="90" y2="90" stroke="#52525b" strokeWidth="12" strokeLinecap="round" />
        <rect x="40" y="145" width="40" height="10" rx="3" fill="#27272a" />
        {/* Athlete recline seated */}
        <circle cx="85" cy="80" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M80 90 L55 145" stroke="url(#pressGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Legs pushing sled platform */}
        <path d="M55 145 L105 110 L140 65" stroke="url(#pressGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="105" cy="110" r="4.5" fill="#f59e0b" />
      </svg>
    ),
  },

  // 3. BULGARIAN SPLIT SQUAT (Sentadilla Búlgara con pie elevado)
  bulgarian: {
    category: 'Pierna / Unilateral',
    primaryMuscles: ['Cuádriceps', 'Glúteo Mayor'],
    secondaryMuscles: ['Isquiosurales', 'Estabilizadores de Cadera', 'Core'],
    cues: [
      'Apoya el empeine de la pierna trasera sobre el banco o soporte elevado.',
      'Da un paso amplio con la pierna delantera para permitir un descenso profundo.',
      'Torso levemente inclinado hacia adelante para enfatizar glúteo.',
      'Desciende hasta que la rodilla trasera casi roce el suelo de forma controlada.',
    ],
    commonMistakes: [
      'Paso delantero muy corto que sobrecarga la rodilla delantera.',
      'Empujar con la pierna trasera en vez de con el talón activo delantero.',
      'Perder el equilibrio por colocar los dos pies en la misma línea.',
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
        <rect x="25" y="150" width="40" height="15" rx="3" fill="#27272a" stroke="#52525b" strokeWidth="1.5" />
        <line x1="32" y1="165" x2="32" y2="220" stroke="#71717a" strokeWidth="3" />
        <line x1="58" y1="165" x2="58" y2="220" stroke="#71717a" strokeWidth="3" />
        <circle cx="115" cy="55" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M115 67 L105 125" stroke="url(#bulgGrad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M115 75 L115 130" stroke="#e4e4e7" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="110" y="128" width="10" height="16" rx="3" fill="#06b6d4" />
        <path d="M102 125 L75 145 L45 150" stroke="#71717a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M106 125 L140 145 L135 215 L150 218" stroke="url(#bulgGrad)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="140" cy="145" r="4.5" fill="#f59e0b" />
      </svg>
    ),
  },

  // 4. BENCH PRESS (Press de Banca Plano)
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
      'Rebotar la barra en el esternón para impulsarse.',
      'Despegar los glúteos del banco durante el empuje.',
      'Abrir los codos en exceso dañando los manguitos.',
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

  // 5. INCLINE BENCH (Press Inclinado Barra / Mancuernas)
  incline_bench: {
    category: 'Pectoral Superior / Empuje',
    primaryMuscles: ['Haz Clavicular Pectoral (Superior)'],
    secondaryMuscles: ['Deltoides Anterior', 'Tríceps Braquial'],
    cues: [
      'Ajusta el respaldo del banco a unos 30° - 45°.',
      'Escápulas retraídas y pies empujando el suelo firmemente.',
      'Baja la barra o mancuernas a la parte alta del pecho.',
      'Extiende sin descolocar los hombros en la parte alta.',
    ],
    commonMistakes: [
      'Inclinación excesiva (> 60°) que convierte el trabajo en deltoides.',
      'Descolocar los hombros hacia adelante al empujar arriba.',
      'Recortar recorrido sin sentir el estiramiento pectoral.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="incBenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="50" y1="50" x2="120" y2="120" stroke="#3f3f46" strokeWidth="12" strokeLinecap="round" />
        <rect x="110" y="118" width="50" height="10" rx="3" fill="#27272a" />
        <line x1="85" y1="120" x2="85" y2="160" stroke="#52525b" strokeWidth="6" />
        <line x1="145" y1="125" x2="145" y2="160" stroke="#52525b" strokeWidth="6" />
        <circle cx="68" cy="48" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M78 58 L125 110" stroke="url(#incBenchGrad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M125 115 L150 135 L155 165 L170 165" stroke="#06b6d4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="85" y1="35" x2="135" y2="35" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
        <path d="M92 68 L80 48 L105 37" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="108" cy="35" r="4.5" fill="#facc15" />
      </svg>
    ),
  },

  // 6. DECLINE PUSH-UPS (Flexiones Declinadas con Pies Elevados)
  decline_pushup: {
    category: 'Pectoral Superior & Core / Calistenia',
    primaryMuscles: ['Pectoral Superior', 'Deltoides Anterior'],
    secondaryMuscles: ['Tríceps Braquial', 'Serrato Anterior', 'Core'],
    cues: [
      'Apoya las puntas de los pies sobre el banco y manos en el suelo bajo hombros.',
      'Mantén el cuerpo completamente recto en plancha bloqueando glúteos.',
      'Desciende hasta que el pecho casi toque el suelo de forma controlada.',
      'Empuja el suelo con fuerza extendiendo los brazos sin curvar la espalda baja.',
    ],
    commonMistakes: [
      'Dejar caer la cadera hacia el suelo por debilidad del abdomen.',
      'Mirar hacia arriba tensionando el cuello.',
      'Recortar recorrido sin bajar el pecho hasta el suelo.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="decGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="165" x2="220" y2="165" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Bench holding feet elevated */}
        <rect x="25" y="110" width="35" height="15" rx="3" fill="#27272a" stroke="#52525b" strokeWidth="1.5" />
        <line x1="30" y1="125" x2="30" y2="165" stroke="#71717a" strokeWidth="4" />
        <line x1="55" y1="125" x2="55" y2="165" stroke="#71717a" strokeWidth="4" />
        {/* Feet on bench */}
        <circle cx="45" cy="105" r="5" fill="#06b6d4" />
        {/* Incline straight body downwards to hands on floor */}
        <path d="M45 105 L115 125 L165 140" stroke="url(#decGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Head near floor */}
        <circle cx="180" cy="140" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Arms pushing floor */}
        <path d="M155 135 L155 163" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="155" cy="135" r="4" fill="#f59e0b" />
      </svg>
    ),
  },

  // 7. PIKE PUSH-UPS (Hombro Vertical en V Invertida)
  pike_pushup: {
    category: 'Hombros / Calistenia Vertical',
    primaryMuscles: ['Deltoides Anterior', 'Deltoides Lateral'],
    secondaryMuscles: ['Tríceps Braquial', 'Trapecios', 'Core'],
    cues: [
      'Colócate en posición de V invertida con cadera elevada hacia el techo.',
      'Manos al ancho de hombros y mirada dirigida hacia los pies.',
      'Baja la cabeza hacia adelante formando un trípode con las manos.',
      'Empuja el suelo hacia atrás para volver a la posición de V invertida.',
    ],
    commonMistakes: [
      'Bajar la cabeza justo entre las manos en vez de hacia adelante.',
      'Abrir los codos excesivamente a 90° lesionando los hombros.',
      'Bajar la cadera perdiendo la postura de pirámide.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="pikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="220" x2="180" y2="220" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Feet on floor */}
        <line x1="45" y1="218" x2="55" y2="218" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
        {/* Inverted V Hip peak */}
        <path d="M50 218 L95 105" stroke="url(#pikeGrad)" strokeWidth="11" strokeLinecap="round" />
        <circle cx="95" cy="105" r="9" fill="#0891b2" />
        {/* Torso descending to hands */}
        <path d="M95 105 L140 180" stroke="url(#pikeGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Head between hands */}
        <circle cx="155" cy="190" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Hands on ground */}
        <path d="M135 175 L135 218" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="135" cy="175" r="4.5" fill="#f59e0b" />
      </svg>
    ),
  },

  // 8. CABLE CROSSOVER / FLYES (Cruces en Polea / Aperturas)
  cable_flyes: {
    category: 'Pectoral / Aislamiento',
    primaryMuscles: ['Pectoral Mayor (Aducción)'],
    secondaryMuscles: ['Deltoides Anterior', 'Bíceps (Cabeza Corta)'],
    cues: [
      'Da un paso al frente con un pie adelantado para ganar estabilidad.',
      'Codos ligeramente flexionados fijados en un ángulo constante.',
      'Junta las manos como si abrazaras un tronco gigante en el centro.',
      'Aprieta y mantén un segundo la contracción máxima.',
    ],
    commonMistakes: [
      'Transformar la apertura en un press empujando con tríceps.',
      'Modificar la flexión de los codos durante el recorrido.',
      'Balancear el torso hacia atrás para trampear con inercia.',
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
        <circle cx="20" cy="50" r="8" fill="#27272a" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="180" cy="50" r="8" fill="#27272a" stroke="#06b6d4" strokeWidth="2" />
        <line x1="20" y1="50" x2="88" y2="115" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="180" y1="50" x2="112" y2="115" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="100" cy="60" r="13" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M100 73 L100 135" stroke="url(#flyGrad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M96 135 L85 180 L75 220" stroke="url(#flyGrad)" strokeWidth="9" strokeLinecap="round" />
        <path d="M104 135 L120 180 L125 220" stroke="url(#flyGrad)" strokeWidth="9" strokeLinecap="round" />
        <path d="M88 80 Q60 95 88 115" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M112 80 Q140 95 112 115" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="115" r="5" fill="#f43f5e" />
      </svg>
    ),
  },

  // 9. DIPS (Fondos en Paralelas)
  dips: {
    category: 'Pectoral & Tríceps / Calistenia',
    primaryMuscles: ['Tríceps Braquial', 'Pectoral Inferior'],
    secondaryMuscles: ['Deltoides Anterior', 'Serratos'],
    cues: [
      'Agárrate a las paralelas con brazos extendidos y codos bloqueados arriba.',
      'Para pecho: inclina el torso 30° hacia adelante y cruza los tobillos.',
      'Desciende hasta que los codos formen un ángulo de 90°.',
      'Empuja con las palmas extendiendo los codos con fuerza.',
    ],
    commonMistakes: [
      'Descender excesivamente forzando la cápsula del hombro.',
      'Mantenerse demasiado vertical si el objetivo es entrenar pectoral.',
      'Balancear el cuerpo para impulsarse.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="dipsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <rect x="35" y="100" width="130" height="8" rx="4" fill="#52525b" stroke="#71717a" strokeWidth="1" />
        <line x1="50" y1="108" x2="50" y2="225" stroke="#71717a" strokeWidth="6" />
        <line x1="150" y1="108" x2="150" y2="225" stroke="#71717a" strokeWidth="6" />
        <circle cx="108" cy="45" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M105 58 L90 120" stroke="url(#dipsGrad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M90 120 L80 160 L95 190" stroke="url(#dipsGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M98 68 L60 85 L60 100" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M102 68 L140 85 L140 100" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy="85" r="4.5" fill="#f59e0b" />
        <circle cx="140" cy="85" r="4.5" fill="#f59e0b" />
      </svg>
    ),
  },

  // 10. L-SIT HOLD (Suspensión en Paralelas con piernas en L)
  lsit: {
    category: 'Core & Flexores de Cadera / Calistenia',
    primaryMuscles: ['Recto Abdominal', 'Psoas / Flexores de Cadera'],
    secondaryMuscles: ['Tríceps', 'Cuádriceps', 'Dorsal / Hombros'],
    cues: [
      'Apóyate en paralelas con brazos bloqueados y hombros deprimidos con fuerza.',
      'Eleva ambas piernas juntas rectas y paralelas al suelo formando un ángulo de 90°.',
      'Puntas de los pies en punta y cuádriceps totalmente apretados.',
      'Mantén la tensión isométrica respirando de forma controlada.',
    ],
    commonMistakes: [
      'Doblar las rodillas por falta de flexibilidad o fuerza en flexores.',
      'Dejar caer los hombros hacia las orejas perdiendo depresión escapular.',
      'Arquear la espalda lumbar.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="lsitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {/* Parallel bars */}
        <rect x="25" y="115" width="150" height="8" rx="4" fill="#52525b" />
        <line x1="45" y1="123" x2="45" y2="225" stroke="#71717a" strokeWidth="6" />
        <line x1="155" y1="123" x2="155" y2="225" stroke="#71717a" strokeWidth="6" />
        {/* Head */}
        <circle cx="75" cy="50" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Vertical Torso suspended */}
        <path d="M75 62 L75 118" stroke="url(#lsitGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Straight arms locking on bars */}
        <path d="M80 72 L85 115" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />
        {/* 90 DEG HORIZONTAL EXTENDED LEGS (L-Shape) */}
        <path d="M75 118 L160 118" stroke="url(#lsitGrad)" strokeWidth="11" strokeLinecap="round" />
        <circle cx="160" cy="118" r="4.5" fill="#facc15" />
      </svg>
    ),
  },

  // 11. DEADLIFT (Peso Muerto Convencional / Rumano)
  deadlift: {
    category: 'Cadena Posterior / Fuerza Total',
    primaryMuscles: ['Erectores Espinales', 'Glúteos', 'Isquiosurales'],
    secondaryMuscles: ['Dorsales', 'Trapecios', 'Antebrazos', 'Core'],
    cues: [
      'Barra a 2-3 cm de las espinillas sobre la mitad de los cordones.',
      'Bisagra de cadera hacia atrás; hombros levemente adelantados a la barra.',
      'Activa dorsales (exprime axilas) para pegar la barra al cuerpo.',
      'Empuja la tierra con las piernas y bloquea con glúteo firme.',
    ],
    commonMistakes: [
      'Redondear la espalda baja perdiendo la columna neutra.',
      'Alejar la barra del cuerpo aumentando el brazo de palanca.',
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

  // 12. KETTLEBELL SWING (Swings Rusos con Pesa Rusa)
  kettlebell_swing: {
    category: 'Cadena Posterior / Potencia Balística',
    primaryMuscles: ['Glúteo Mayor', 'Isquiosurales'],
    secondaryMuscles: ['Core', 'Deltoides Anterior', 'Antebrazos'],
    cues: [
      'Bisagra explosiva de cadera, no una sentadilla: las rodillas apenas se doblan.',
      'Proyecta la pesa rusa a la altura del pecho usando la extensión de cadera.',
      'Brazos actúan como simples cuerdas/ganchos, no levantes con hombros.',
      'Bloquea glúteos y abdomen de golpe arriba en la posición vertical.',
    ],
    commonMistakes: [
      'Convertir el swing en sentadilla bajando la cadera demasiado.',
      'Tirar de la pesa con la fuerza de los brazos y hombros.',
      'Dejar que la pesa descienda por debajo de las rodillas flexionando la lumbar.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="kbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="220" x2="180" y2="220" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Head */}
        <circle cx="85" cy="50" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Upright locked torso */}
        <path d="M85 62 L85 130" stroke="url(#kbGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Legs upright locked */}
        <path d="M85 130 L78 215 L68 218" stroke="url(#kbGrad)" strokeWidth="9" strokeLinecap="round" />
        <path d="M85 130 L95 215 L105 218" stroke="url(#kbGrad)" strokeWidth="9" strokeLinecap="round" />
        {/* Arms projecting kettlebell forward at chest height */}
        <path d="M85 75 L145 88" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" />
        {/* Kettlebell ball and handle */}
        <circle cx="158" cy="92" r="13" fill="#06b6d4" stroke="#22d3ee" strokeWidth="2" />
        <path d="M145 85 Q150 78 158 80" stroke="#e4e4e7" strokeWidth="3" fill="none" />
        <circle cx="158" cy="92" r="4" fill="#facc15" />
      </svg>
    ),
  },

  // 13. BARBELL ROW / PENDLAY (Remo con Barra 45° o Pendlay)
  barbell_row: {
    category: 'Espalda / Tracción Horizontal',
    primaryMuscles: ['Dorsal Ancho', 'Romboide', 'Trapecio Medio'],
    secondaryMuscles: ['Bíceps Braquial', 'Deltoides Posterior', 'Erectores Espinales'],
    cues: [
      'Inclina el torso a 45° manteniendo la columna neutra.',
      'Tira de los codos hacia atrás y hacia arriba en dirección a la cadera.',
      'Junta las escápulas con fuerza en el punto más alto.',
      'Controla la bajada sin dejar que los hombros caigan hacia adelante.',
    ],
    commonMistakes: [
      'Tironear con las piernas o incorporar el torso para trampear.',
      'Redondear la espalda lumbar por exceso de carga.',
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
        <circle cx="145" cy="75" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M135 85 L85 125" stroke="url(#rowGrad)" strokeWidth="14" strokeLinecap="round" />
        <circle cx="85" cy="125" r="10" fill="#0891b2" />
        <path d="M85 125 L108 160 L105 215 L122 218" stroke="url(#rowGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M125 90 L115 110 L105 130" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="105" cy="130" r="10" fill="#06b6d4" stroke="#22d3ee" strokeWidth="2" />
        <circle cx="105" cy="130" r="3" fill="#facc15" />
      </svg>
    ),
  },

  // 14. AUSTRALIAN PULL-UPS (Dominadas Australianas en Barra Baja)
  australian_pullup: {
    category: 'Espalda / Calistenia Horizontal',
    primaryMuscles: ['Dorsal Ancho', 'Romboides', 'Trapecio'],
    secondaryMuscles: ['Bíceps Braquial', 'Deltoides Posterior', 'Core'],
    cues: [
      'Cuélgate por debajo de la barra baja con talones apoyados en el suelo.',
      'Cuerpo en una sola línea recta bloqueando glúteos y abdomen.',
      'Tira del pecho hacia la barra juntando escápulas al final.',
      'Baja con control hasta estirar por completo los brazos.',
    ],
    commonMistakes: [
      'Dejar caer la cadera hacia el suelo perdiendo la rigidez corporal.',
      'Empujar con la pelvis hacia arriba en vez de tirar con los dorsales.',
      'No llegar a tocar la barra con el pecho.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="austGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="165" x2="220" y2="165" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Low bar horizontal */}
        <circle cx="140" cy="55" r="7" fill="#71717a" stroke="#a1a1aa" strokeWidth="1.5" />
        <line x1="140" y1="55" x2="140" y2="165" stroke="#52525b" strokeWidth="5" />
        {/* Straight suspended body at 35 deg angle */}
        <path d="M50 162 L110 120 L150 85" stroke="url(#austGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Head */}
        <circle cx="160" cy="75" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Arms pulling chest to bar */}
        <path d="M140 85 L140 55" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="140" cy="85" r="4" fill="#f59e0b" />
      </svg>
    ),
  },

  // 15. LAT PULLDOWN (Jalón al Pecho en Polea)
  lat_pulldown: {
    category: 'Espalda / Tracción Vertical',
    primaryMuscles: ['Dorsal Ancho'],
    secondaryMuscles: ['Bíceps', 'Braquiorradial', 'Redondo Mayor'],
    cues: [
      'Siéntate con los muslos bien sujetos bajo los rodillos de la máquina.',
      'Agarre amplio, pecho alto y leve inclinación del torso (10-15° hacia atrás).',
      'Inicia bajando las escápulas y lleva la barra hacia el esternón.',
      'Conduce los codos hacia las costillas y aprieta los dorsales 1 segundo.',
    ],
    commonMistakes: [
      'Inclinarse excesivamente hacia atrás convirtiéndolo en un remo con inercia.',
      'Bajar la barra detrás de la nuca (peligro cervical y articular).',
      'Tirar solo con la fuerza de los brazos sin activar dorsales.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="pulldownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="100" y1="15" x2="100" y2="40" stroke="#71717a" strokeWidth="3" />
        <path d="M40 50 Q100 45 160 50" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="75" y="150" width="50" height="10" rx="3" fill="#27272a" />
        <rect x="110" y="130" width="20" height="8" rx="2" fill="#52525b" />
        <circle cx="100" cy="75" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M100 88 L98 150" stroke="url(#pulldownGrad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M98 150 L125 145 L125 210 L140 215" stroke="url(#pulldownGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M55 50 L80 75 L92 90" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M145 50 L120 75 L108 90" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  // 16. SEATED CABLE ROW (Remo Gironda en Polea Baja)
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
        <rect x="40" y="165" width="85" height="12" rx="3" fill="#27272a" />
        <line x1="160" y1="140" x2="160" y2="180" stroke="#71717a" strokeWidth="6" strokeLinecap="round" />
        <circle cx="165" cy="155" r="7" fill="#06b6d4" />
        <line x1="165" y1="155" x2="115" y2="135" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="75" cy="85" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M75 98 L75 165" stroke="url(#seatedRowGrad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M75 165 L115 155 L158 158" stroke="url(#seatedRowGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M85 110 L100 125 L115 135" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="110" y="130" width="8" height="10" rx="2" fill="#facc15" />
      </svg>
    ),
  },

  // 17. PULL-UP (Dominadas Pronas Estrictas)
  pullup: {
    category: 'Espalda / Tracción Vertical',
    primaryMuscles: ['Dorsal Ancho', 'Redondo Mayor'],
    secondaryMuscles: ['Bíceps Braquial', 'Braquiorradial', 'Trapecio Medio/Bajo'],
    cues: [
      'Agarre pronado ligeramente más ancho que los hombros.',
      'Inicia la tracción bajando y juntando las escápulas antes de flexionar los brazos.',
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

  // 18. OVERHEAD PRESS (Press Militar de Pie)
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

  // 19. FACE PULLS CON BANDA (Tracción a la Cara con Rotación Externa)
  face_pull: {
    category: 'Hombro Posterior & Manguito Rotador',
    primaryMuscles: ['Deltoides Posterior', 'Manguito Rotador (Infraespinoso/Redondo Menor)'],
    secondaryMuscles: ['Trapecio Medio/Superior', 'Romboides'],
    cues: [
      'Fija la banda elástica o polea a la altura de los ojos.',
      'Tira de la cuerda hacia la frente separando las manos y abriendo codos altos.',
      'Termina con una rotación externa completa: nudillos apuntando hacia atrás.',
      'Aprieta la musculatura de la espalda alta durante 1 segundo antes de regresar.',
    ],
    commonMistakes: [
      'Bajar los codos por debajo de los hombros convirtiéndolo en un remo común.',
      'Empujar la cabeza hacia adelante para buscar el agarre.',
      'Arquear la espalda lumbar para ayudarse.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="fpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="225" x2="180" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Anchor point in front */}
        <circle cx="180" cy="70" r="6" fill="#71717a" />
        {/* Band pulling towards face */}
        <line x1="180" y1="70" x2="95" y2="60" stroke="#f43f5e" strokeWidth="2.5" />
        <line x1="180" y1="70" x2="95" y2="75" stroke="#f43f5e" strokeWidth="2.5" />
        {/* Athlete Standing */}
        <circle cx="80" cy="65" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M80 77 L80 140" stroke="url(#fpGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Legs upright */}
        <path d="M75 140 L70 218 L60 222" stroke="url(#fpGrad)" strokeWidth="8" strokeLinecap="round" />
        <path d="M85 140 L90 218 L100 222" stroke="url(#fpGrad)" strokeWidth="8" strokeLinecap="round" />
        {/* High elbows rotated back to face */}
        <path d="M75 80 L55 65 L95 60" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="55" cy="65" r="4.5" fill="#f59e0b" />
      </svg>
    ),
  },

  // 20. FRENCH PRESS / SKULL CRUSHER (Press Francés con Barra Z)
  french_press: {
    category: 'Tríceps / Aislamiento',
    primaryMuscles: ['Tríceps (Cabeza Larga)', 'Tríceps (Medial/Lateral)'],
    secondaryMuscles: ['Antebrazos', 'Estabilizadores de Hombro'],
    cues: [
      'Tumbado en banco plano sosteniendo la barra Z con brazos hacia el techo.',
      'Codos fijos apuntando al techo; solo se doblan los antebrazos.',
      'Desciende la barra hacia la frente o justo detrás de la coronilla.',
      'Extiende los codos sintiendo la contracción máxima de los tríceps.',
    ],
    commonMistakes: [
      'Abrir los codos excesivamente hacia los lados.',
      'Mover los hombros convirtiendo el ejercicio en un pullover.',
      'Dejar caer la barra rápido sin control.',
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
        <circle cx="58" cy="105" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M68 108 L125 110" stroke="url(#skullGrad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M125 110 L155 125 L160 160 L175 160" stroke="#06b6d4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 105 L80 65 L48 78" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="80" cy="65" r="4.5" fill="#f59e0b" />
        <circle cx="45" cy="80" r="9" fill="#06b6d4" stroke="#22d3ee" strokeWidth="2" />
        <circle cx="45" cy="80" r="3" fill="#facc15" />
      </svg>
    ),
  },

  // 21. BATTLE ROPES (Cuerdas de Combate en Media Sentadilla)
  battle_ropes: {
    category: 'Cuerpo Completo & Acondicionamiento Potente',
    primaryMuscles: ['Hombros / Deltoides', 'Brazos', 'Core'],
    secondaryMuscles: ['Cuádriceps', 'Glúteos', 'Sistema Cardiovascular'],
    cues: [
      'Posición atlética de media sentadilla con pecho alto y pies bien anclados.',
      'Agarra un extremo de cada cuerda con firmeza y muñecas alineadas.',
      'Bate las cuerdas de forma alterna o simultánea creando olas continuas.',
      'Mantén el core apretado para no rotar el torso descontroladamente.',
    ],
    commonMistakes: [
      'Erguirse perdiendo la posición de media sentadilla estable.',
      'Tensar las cuerdas en exceso sin dejar holgura para formar las olas.',
      'Bloquear la respiración durante los intervalos rápidos.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="brGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="165" x2="220" y2="165" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Battle Ropes Sinusoidal Waves */}
        <path d="M100 105 Q125 75 150 105 T200 105 T230 160" stroke="#f43f5e" strokeWidth="4" fill="none" />
        <path d="M100 115 Q125 135 150 115 T200 115 T230 160" stroke="#fbbf24" strokeWidth="4" fill="none" />
        {/* Athlete in athletic quarter-squat */}
        <circle cx="65" cy="55" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M65 67 L60 120" stroke="url(#brGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Half squat legs */}
        <path d="M60 120 L85 138 L80 162" stroke="url(#brGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M58 120 L40 142 L35 162" stroke="#0891b2" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arms holding ropes swinging */}
        <path d="M68 78 L95 95 L102 108" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="102" cy="108" r="4" fill="#06b6d4" />
      </svg>
    ),
  },

  // 22. BOX JUMPS (Saltos al Cajón Pliométricos)
  box_jump: {
    category: 'Potencia / Pliometría de Piernas',
    primaryMuscles: ['Cuádriceps', 'Glúteos', 'Gemelos'],
    secondaryMuscles: ['Isquiosurales', 'Core'],
    cues: [
      'Pies al ancho de hombros frente al cajón a un paso de distancia.',
      'Carga con bisagra rápida y balanceo de brazos hacia atrás.',
      'Salta explosivamente extendiendo cadera, rodillas y tobillos a la vez (Triple extensión).',
      'Aterriza suavemente en el centro del cajón absorbiendo el impacto con flexión.',
    ],
    commonMistakes: [
      'Aterrizar con las piernas rígidas sin amortiguar.',
      'Saltar hacia abajo del cajón de espaldas (peligro para tendón de Aquiles).',
      'Elegir un cajón excesivamente alto sacrificando la técnica.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bjGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="15" y1="220" x2="185" y2="220" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Plyo Box on right */}
        <rect x="110" y="130" width="75" height="90" rx="4" fill="#27272a" stroke="#06b6d4" strokeWidth="2" />
        <line x1="120" y1="145" x2="175" y2="205" stroke="#3f3f46" strokeWidth="2" />
        {/* Jumping Athlete in mid-air tuck */}
        <circle cx="75" cy="65" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M75 78 L70 120" stroke="url(#bjGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Arms swinging up for lift */}
        <path d="M75 85 L95 65 L105 50" stroke="#e4e4e7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Tucked knees in air jumping towards box */}
        <path d="M70 120 L95 130 L75 155" stroke="url(#bjGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        {/* Jump trajectory arc */}
        <path d="M40 215 Q65 140 130 125" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" fill="none" />
        <circle cx="130" cy="125" r="4" fill="#facc15" />
      </svg>
    ),
  },

  // 23. JUMP ROPE (Salto de Cuerda Continuo)
  jump_rope: {
    category: 'Cardiovascular & Coordinación',
    primaryMuscles: ['Gemelos / Sóleo', 'Sistema Cardiovascular'],
    secondaryMuscles: ['Antebrazos', 'Hombros', 'Core'],
    cues: [
      'Salta sobre las puntas de los pies con rebotes cortos de 2-3 cm del suelo.',
      'Codos pegados a las costillas; el giro de la comba nace de las muñecas.',
      'Mantén las rodillas ligeramente flexionadas para absorber el impacto.',
      'Respira con cadencia rítmica y mirada al frente.',
    ],
    commonMistakes: [
      'Girar los brazos enteros desde los hombros en vez de usar las muñecas.',
      'Patear con los talones hacia atrás al saltar.',
      'Saltar demasiado alto agotándose antes de tiempo.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="jrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="225" x2="180" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Jump Rope Arc */}
        <path d="M60 115 Q100 245 140 115" stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeDasharray="5 2" />
        <path d="M60 115 Q100 -10 140 115" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
        {/* Athlete hopping */}
        <circle cx="100" cy="50" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M100 62 L100 125" stroke="url(#jrGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Forearms holding rope handles */}
        <path d="M92 75 L75 95 L65 110" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M108 75 L125 95 L135 110" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Legs jumping on toes */}
        <path d="M96 125 L94 185 L90 210" stroke="url(#jrGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M104 125 L106 185 L110 210" stroke="url(#jrGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  // 24. SKATER JUMPS (Skaters Laterales)
  skater_jump: {
    category: 'Pliometría Lateral & Estabilidad',
    primaryMuscles: ['Glúteo Medio', 'Cuádriceps', 'Abductores'],
    secondaryMuscles: ['Core', 'Gemelos', 'Isquiosurales'],
    cues: [
      'Salta lateralmente hacia un lado impulsándote con una sola pierna.',
      'Aterriza suavemente sobre la pierna contraria amortiguando en media sentadilla.',
      'Cruza la pierna libre por detrás sin que toque el suelo para desafiar el equilibrio.',
      'Acompaña con un braceo fluido de patinador para estabilizar.',
    ],
    commonMistakes: [
      'Aterrizar con la rodilla colapsando hacia adentro (valgo peligroso).',
      'No amortiguar flexionando la cadera y rodilla de apoyo.',
      'Saltar solo verticalmente sin desplazamiento lateral amplio.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="skateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="165" x2="220" y2="165" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Head tilted dynamically */}
        <circle cx="105" cy="45" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Angled torso leaning into turn */}
        <path d="M105 56 L125 105" stroke="url(#skateGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Lead landing leg bent at 45 deg */}
        <path d="M125 105 L150 130 L145 162" stroke="url(#skateGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="150" cy="130" r="4.5" fill="#f59e0b" />
        {/* Trailing leg kicked behind in skater position */}
        <path d="M125 105 L80 120 L50 135" stroke="#0891b2" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Skater arms balancing */}
        <path d="M110 65 L155 75" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
        <path d="M105 68 L70 95" stroke="#71717a" strokeWidth="5" strokeLinecap="round" />
        {/* Motion arrow */}
        <path d="M60 155 Q100 130 140 155" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 2" fill="none" />
      </svg>
    ),
  },

  // 25. BURPEES EXPLOSIVOS
  burpee: {
    category: 'Cuerpo Completo & Metabólico',
    primaryMuscles: ['Cuerpo Completo', 'Sistema Cardiovascular'],
    secondaryMuscles: ['Pectoral', 'Cuádriceps', 'Core'],
    cues: [
      'Agáchate apoyando las manos en el suelo al ancho de hombros.',
      'Lanza los pies atrás con un salto cayendo en plancha y apoya el pecho en el suelo.',
      'Empuja explosivamente recogiendo los pies bajo la cadera.',
      'Salta en vertical con las manos arriba y palmada sobre la cabeza.',
    ],
    commonMistakes: [
      'Dejar caer la pelvis arqueando la zona lumbar en la fase de plancha.',
      'Aterrizar sobre las puntas de los pies con rodillas hacia adentro.',
      'Omitir el salto vertical final.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="burpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="165" x2="220" y2="165" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Ghost pushup silhouette on floor */}
        <path d="M40 162 L100 162" stroke="#3f3f46" strokeWidth="6" strokeLinecap="round" strokeDasharray="3 3" />
        {/* Jumping exploded athlete */}
        <circle cx="160" cy="35" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M160 47 L160 100" stroke="url(#burpGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Arms raised up in victory / jump clap */}
        <path d="M155 58 L140 30 L155 18" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M165 58 L180 30 L165 18" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Legs jumping straight in extension */}
        <path d="M156 100 L150 145 L145 155" stroke="url(#burpGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M164 100 L170 145 L175 155" stroke="url(#burpGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Blast arrows */}
        <line x1="160" y1="165" x2="160" y2="145" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2 2" />
      </svg>
    ),
  },

  // 26. DRAGON FLAGS EN BANCO (Abdominales Bruce Lee)
  dragon_flag: {
    category: 'Core Avanzado / Palanca Corporal',
    primaryMuscles: ['Recto Abdominal Completo', 'Transverso'],
    secondaryMuscles: ['Dorsales', 'Glúteos', 'Erectores Espinales'],
    cues: [
      'Túmbate en el banco y agárrate con fuerza al borde detrás de la cabeza.',
      'Eleva todo el cuerpo hacia arriba en una línea recta rígida apoyando solo las escápulas.',
      'Desciende el cuerpo entero como un bloque rígido sin quebrar la cadera.',
      'Detén el descenso a pocos centímetros del banco y vuelve a subir con fuerza abdominal.',
    ],
    commonMistakes: [
      'Doblar la cadera convirtiéndolo en una simple elevación de piernas.',
      'Dejar caer el peso descontroladamente sobre el cuello o espalda.',
      'Separar los codos perdiendo el agarre firme en el banco.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="dfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <rect x="40" y="125" width="150" height="12" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
        <line x1="60" y1="137" x2="60" y2="165" stroke="#52525b" strokeWidth="6" />
        <line x1="160" y1="137" x2="160" y2="165" stroke="#52525b" strokeWidth="6" />
        {/* Shoulders on bench & hands grabbing behind head */}
        <circle cx="65" cy="115" r="10" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M60 115 L50 120 L50 125" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
        {/* Completely STRAIGHT RIGID BODY LEVER POINTING UP AT 45 DEG */}
        <path d="M75 115 L170 50" stroke="url(#dfGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Feet pointed together */}
        <circle cx="170" cy="50" r="5" fill="#facc15" />
        {/* Core activation glow */}
        <circle cx="115" cy="85" r="7" fill="#f43f5e" fillOpacity="0.6" />
      </svg>
    ),
  },

  // 27. CAT - CAMEL (Gato - Camello en Cuadrupedia)
  cat_camel: {
    category: 'Movilidad de Columna / Articular',
    primaryMuscles: ['Erectores Espinales', 'Columna Torácica'],
    secondaryMuscles: ['Recto Abdominal', 'Cuello / Cervicales'],
    cues: [
      'En cuadrupedia con manos bajo los hombros y rodillas bajo las caderas.',
      'Gato (inhalar): arquea la columna hacia abajo levantando cabeza y coxis.',
      'Camello (exhalar): redondea la columna hacia el techo empujando el suelo con las palmas.',
      'Mueve vértebra por vértebra de forma fluida y sin rebotes bruscos.',
    ],
    commonMistakes: [
      'Mover solo el cuello sin involucrar la columna torácica y lumbar.',
      'Hacer movimientos rápidos y espasmódicos.',
      'Bloquear los codos rígidamente.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="catGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="165" x2="220" y2="165" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        <rect x="30" y="162" width="180" height="6" rx="3" fill="#06b6d4" fillOpacity="0.15" />
        {/* Quadruped Hands & Knees on floor */}
        <circle cx="170" cy="95" r="10" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M165 105 L165 162" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />
        <path d="M85 125 L85 162" stroke="url(#catGrad)" strokeWidth="8" strokeLinecap="round" />
        {/* Rounded arched spine towards ceiling (Camel pose) */}
        <path d="M85 125 Q125 75 160 105" stroke="url(#catGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="125" cy="85" r="4.5" fill="#facc15" />
      </svg>
    ),
  },

  // 28. PIGEON STRETCH (Paloma de Glúteo en Suelo)
  pigeon_stretch: {
    category: 'Movilidad de Cadera & Piramidal',
    primaryMuscles: ['Glúteo Mayor', 'Piramidal / Rotadores Profundos'],
    secondaryMuscles: ['Psoas de Pierna Trasera', 'Cápsula de Cadera'],
    cues: [
      'Pierna delantera flexionada a unos 45-90° con la espinilla sobre la colchoneta.',
      'Pierna trasera completamente extendida apoyando el empeine en el suelo.',
      'Mantén la pelvis cuadrada apuntando hacia adelante, sin caer hacia un lado.',
      'Desciende el torso hacia el suelo exhalando profundo para intensificar el estiramiento.',
    ],
    commonMistakes: [
      'Forzar la rodilla delantera si se siente dolor o pellizco articular.',
      'Rotar la cadera hacia un lado dejando el peso caer torcido.',
      'Aguantar la respiración en tensión en vez de relajar el músculo.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="pigGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="160" x2="220" y2="160" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        <rect x="30" y="157" width="180" height="6" rx="3" fill="#06b6d4" fillOpacity="0.15" />
        {/* Forward torso leaning over front bent leg */}
        <circle cx="160" cy="115" r="10" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M150 122 L115 138" stroke="url(#pigGrad)" strokeWidth="12" strokeLinecap="round" />
        {/* Front Leg bent on mat */}
        <path d="M115 138 L145 152 L110 157" stroke="url(#pigGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        {/* Rear Leg straight back on mat */}
        <path d="M115 138 L70 148 L35 157" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Hands on mat supporting */}
        <path d="M145 125 L150 157" stroke="#e4e4e7" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="120" cy="145" r="4.5" fill="#facc15" />
      </svg>
    ),
  },

  // 29. HIP 90/90 TRANSITIONS (Transiciones de Cadera 90/90)
  hip_90_90: {
    category: 'Movilidad de Cadera / Rotación Interna & Externa',
    primaryMuscles: ['Rotadores Internos de Cadera', 'Rotadores Externos'],
    secondaryMuscles: ['Cápsula Articular', 'Glúteos'],
    cues: [
      'Siéntate en el suelo con ambas piernas flexionadas a 90° (una al frente, otra al lateral).',
      'Torso erguido con el pecho alto sin encorvar la espalda.',
      'Rota ambas caderas hacia el lado opuesto de forma fluida manteniendo los talones anclados.',
      'Controla el movimiento intentando no apoyarte en las manos si tu movilidad lo permite.',
    ],
    commonMistakes: [
      'Encorvarse hacia adelante compensando con la columna lumbar.',
      'Levantar los talones del suelo durante la transición.',
      'Hacer el cambio de lado con un impulso brusco.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="hipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="160" x2="220" y2="160" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        <rect x="30" y="157" width="180" height="6" rx="3" fill="#06b6d4" fillOpacity="0.15" />
        {/* Upright Seated Torso */}
        <circle cx="105" cy="70" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M105 82 L105 135" stroke="url(#hipGrad)" strokeWidth="13" strokeLinecap="round" />
        {/* Front 90 deg leg */}
        <path d="M105 135 L145 138 L145 158" stroke="url(#hipGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        {/* Back 90 deg leg */}
        <path d="M105 135 L65 142 L55 158" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Rotation indicator arrows */}
        <path d="M75 110 Q105 95 135 110" stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" fill="none" />
      </svg>
    ),
  },

  // 30. WALL THORACIC OPENING (Aperturas Torácicas en Pared)
  wall_thoracic: {
    category: 'Movilidad Torácica & Cintura Escapular',
    primaryMuscles: ['Columna Torácica', 'Pectoral Mayor/Menor'],
    secondaryMuscles: ['Deltoides Anterior', 'Dorsal Ancho'],
    cues: [
      'De rodillas o de pie con un lateral pegado contra la pared.',
      'Brazos extendidos al frente a la altura de los hombros.',
      'Abre el brazo exterior dibujando un gran semicírculo sobre la pared sin despegar la rodilla.',
      'Sigue la mano con la mirada y siente la apertura en el pecho y espalda alta.',
    ],
    commonMistakes: [
      'Despegar la cadera o rodilla de la pared girando la pelvis en vez del torso.',
      'Doblar el codo reduciendo el brazo de palanca del estiramiento.',
      'Contener la respiración durante la apertura máxima.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="20" y1="225" x2="180" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Wall on left */}
        <line x1="30" y1="20" x2="30" y2="225" stroke="#52525b" strokeWidth="6" strokeLinecap="round" />
        {/* Half kneeling athlete against wall */}
        <circle cx="80" cy="65" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M80 77 L80 145" stroke="url(#wallGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Half kneel legs */}
        <path d="M80 145 L105 175 L100 220" stroke="url(#wallGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M78 145 L60 185 L50 220" stroke="#0891b2" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Wall hand glued & opening rotating arm */}
        <path d="M80 85 L35 85" stroke="#71717a" strokeWidth="5" strokeLinecap="round" />
        <path d="M80 85 L145 85" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
        {/* Arc of rotation */}
        <path d="M35 85 Q90 35 145 85" stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" fill="none" />
      </svg>
    ),
  },

  // 31. CONCEPT2 / ROWING MACHINE (Máquina de Remo Ergómetro)
  concept2_rower: {
    category: 'Cardiovascular & Tracción Total',
    primaryMuscles: ['Dorsales', 'Piernas (Cuádriceps/Glúteos)'],
    secondaryMuscles: ['Bíceps', 'Core', 'Erectores Espinales'],
    cues: [
      'Secuencia de tirón: 1) Piernas empujan, 2) Cadera bascula atrás, 3) Brazos tiran al esternón.',
      'Secuencia de retorno: 1) Brazos estiran, 2) Cadera bascula adelante, 3) Piernas flexionan.',
      'Espalda recta y neutra en todo momento, sin encorvarse en la atrapada.',
      'Cadencia rítmica: potencia explosiva en el empuje y retorno controlado.',
    ],
    commonMistakes: [
      'Doblar las piernas antes de pasar el manillar de vuelta.',
      'Tirar con la espalda antes de haber extendido las piernas.',
      'Tensar hombros y cuello hacia arriba en vez de empujar con las piernas.',
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
        <line x1="40" y1="145" x2="190" y2="145" stroke="#52525b" strokeWidth="5" strokeLinecap="round" />
        <circle cx="195" cy="125" r="22" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <circle cx="195" cy="125" r="8" fill="#0891b2" />
        <rect x="80" y="137" width="22" height="7" rx="2" fill="#27272a" />
        <circle cx="75" cy="85" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M78 96 L88 140" stroke="url(#rowerGrad)" strokeWidth="13" strokeLinecap="round" />
        <path d="M90 140 L125 130 L160 140" stroke="url(#rowerGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="195" y1="125" x2="120" y2="108" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M85 102 L105 110 L120 108" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  // 32. PLANK & MOUNTAIN CLIMBERS (Planchas / Mountain Climbers)
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
        <circle cx="180" cy="75" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M170 85 L105 105" stroke="url(#plankGrad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M165 90 L165 152" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />
        <path d="M105 105 L55 130 L45 152" stroke="url(#plankGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M105 105 L125 125 L110 148" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="125" cy="125" r="4.5" fill="#f59e0b" />
      </svg>
    ),
  },

  // 33. CARDIO / RUNNING / WALKING
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
      'Agarrarse a los pasamanos de la cinta perdiendo gasto calórico.',
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

  // 34. GENERAL STRENGTH (Fuerza General)
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
      'Dejar caer el peso en la fase negativa perdiendo tensión.',
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
 * Intelligent helper to resolve an exercise 100% accurately to its corresponding visual guide
 */
export function getExerciseVisualGuide(exerciseName: string, muscleGroup?: string): ExerciseGuideData {
  const norm = (exerciseName || '').toLowerCase().trim();

  // 1. Concept2 Rower
  if (norm.includes('concept2') || norm.includes('ergómetro') || norm.includes('ergometro')) {
    return EXERCISE_GUIDES.concept2_rower;
  }

  // 2. Leg Press 45 deg Machine
  if (norm.includes('prensa')) {
    return EXERCISE_GUIDES.leg_press;
  }

  // 3. Bulgarian Split Squat (Unilateral)
  if (norm.includes('búlgara') || norm.includes('bulgara')) {
    return EXERCISE_GUIDES.bulgarian;
  }

  // 4. Squats
  if (norm.includes('sentadilla') || norm.includes('squat')) {
    return EXERCISE_GUIDES.squat;
  }

  // 5. Kettlebell Swings (Russian)
  if (norm.includes('kettlebell') || norm.includes('swing') || norm.includes('pesa rusa')) {
    return EXERCISE_GUIDES.kettlebell_swing;
  }

  // 6. Deadlifts
  if (norm.includes('peso muerto') || norm.includes('deadlift') || norm.includes('isquios')) {
    return EXERCISE_GUIDES.deadlift;
  }

  // 7. Incline Bench (Upper Chest)
  if (norm.includes('inclinado') || norm.includes('inclinada')) {
    return EXERCISE_GUIDES.incline_bench;
  }

  // 8. Decline Push-ups with elevated feet
  if (norm.includes('declinada') || (norm.includes('pies elevado') && norm.includes('flexi'))) {
    return EXERCISE_GUIDES.decline_pushup;
  }

  // 9. Pike Push-ups
  if (norm.includes('pike')) {
    return EXERCISE_GUIDES.pike_pushup;
  }

  // 10. Cable Cross & Flyes
  if (norm.includes('cruce') || norm.includes('apertura en polea') || norm.includes('cable crossover')) {
    return EXERCISE_GUIDES.cable_flyes;
  }

  // 11. Wall Thoracic Openings
  if (norm.includes('pared') || norm.includes('torácica') || norm.includes('toracica')) {
    return EXERCISE_GUIDES.wall_thoracic;
  }

  // 12. Dips on Parallel Bars
  if (norm.includes('fondo') || norm.includes('dips')) {
    return EXERCISE_GUIDES.dips;
  }

  // 13. L-Sit Hold
  if (norm.includes('l-sit') || norm.includes('lsit')) {
    return EXERCISE_GUIDES.lsit;
  }

  // 14. French Press with EZ Bar (Triceps)
  if (norm.includes('francés') || norm.includes('frances') || norm.includes('skull crusher')) {
    return EXERCISE_GUIDES.french_press;
  }

  // 15. Face Pulls with Resistance Band
  if (norm.includes('face pull') || norm.includes('facepull')) {
    return EXERCISE_GUIDES.face_pull;
  }

  // 16. Lat Pulldown Machine
  if (norm.includes('jalón') || norm.includes('jalon') || norm.includes('lat pulldown')) {
    return EXERCISE_GUIDES.lat_pulldown;
  }

  // 17. Seated Cable Row (Gironda)
  if (norm.includes('gironda') || (norm.includes('remo') && norm.includes('polea'))) {
    return EXERCISE_GUIDES.seated_row;
  }

  // 18. Australian / Inverted Row
  if (norm.includes('australiana') || norm.includes('remo invertido')) {
    return EXERCISE_GUIDES.australian_pullup;
  }

  // 19. Barbell / Pendlay Rows
  if (norm.includes('remo con barra') || norm.includes('pendlay') || norm.includes('remo con mancuerna') || norm.includes('remo t')) {
    return EXERCISE_GUIDES.barbell_row;
  }

  // 20. Flat Bench Press & Flat Push-ups
  if (norm.includes('press de banca') || norm.includes('bench press') || norm.includes('press plano') || norm.includes('flexiones') || norm.includes('push-up')) {
    return EXERCISE_GUIDES.bench;
  }

  // 21. Overhead Press (OHP)
  if (norm.includes('militar') || norm.includes('ohp') || norm.includes('overhead')) {
    return EXERCISE_GUIDES.overhead;
  }

  // 22. Pull-ups / Chin-ups
  if (norm.includes('dominada') || norm.includes('pull-up') || norm.includes('chin-up')) {
    return EXERCISE_GUIDES.pullup;
  }

  // 23. Dragon Flags on Bench
  if (norm.includes('dragon flag') || norm.includes('dragonflag')) {
    return EXERCISE_GUIDES.dragon_flag;
  }

  // 24. Battle Ropes
  if (norm.includes('battle rope') || norm.includes('cuerdas de batalla') || norm.includes('olas')) {
    return EXERCISE_GUIDES.battle_ropes;
  }

  // 25. Box Jumps
  if (norm.includes('cajón') || norm.includes('cajon') || norm.includes('box jump')) {
    return EXERCISE_GUIDES.box_jump;
  }

  // 26. Jump Rope (Comba)
  if (norm.includes('cuerda') || norm.includes('comba') || norm.includes('jump rope')) {
    return EXERCISE_GUIDES.jump_rope;
  }

  // 27. Skater Jumps
  if (norm.includes('skater')) {
    return EXERCISE_GUIDES.skater_jump;
  }

  // 28. Burpees
  if (norm.includes('burpee')) {
    return EXERCISE_GUIDES.burpee;
  }

  // 29. Plank & Climbers
  if (norm.includes('climber') || norm.includes('plank') || norm.includes('plancha')) {
    return EXERCISE_GUIDES.plank_climber;
  }

  // 30. Cat - Camel
  if (norm.includes('gato') || norm.includes('camello')) {
    return EXERCISE_GUIDES.cat_camel;
  }

  // 31. Pigeon Stretch
  if (norm.includes('paloma')) {
    return EXERCISE_GUIDES.pigeon_stretch;
  }

  // 32. 90/90 Hip Transitions
  if (norm.includes('90/90') || norm.includes('90-90')) {
    return EXERCISE_GUIDES.hip_90_90;
  }

  // 33. Cardio General
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
    norm.includes('knees')
  ) {
    return EXERCISE_GUIDES.cardio;
  }

  return EXERCISE_GUIDES.general;
}
