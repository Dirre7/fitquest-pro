import React from 'react';

export interface ExerciseGuideData {
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  cues: string[];
  commonMistakes: string[];
  // SVG Graphic representation
  renderGraphic: (className?: string) => React.ReactNode;
}

export const EXERCISE_GUIDES: Record<string, ExerciseGuideData> = {
  // SQUAT (Sentadillas)
  squat: {
    category: 'Pierna / Tren Inferior',
    primaryMuscles: ['Cuádriceps', 'Glúteo Mayor'],
    secondaryMuscles: ['Isquiosurales', 'Erectores Espinales', 'Core'],
    cues: [
      'Pies a la anchura de los hombros con las puntas ligeramente hacia afuera (15-30°).',
      'Inhala y bloquea el abdomen con diafragma (Bracing) antes de descender.',
      'Rompe el paralelo manteniendo el pecho alto y las rodillas alineadas con las puntas.',
      'Empuja el suelo con todo el pie, repartiendo el peso entre talón y mediopié.',
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

        {/* Floor grid / platform */}
        <ellipse cx="100" cy="225" rx="75" ry="10" fill="#06b6d4" fillOpacity="0.1" />
        <line x1="25" y1="225" x2="175" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />

        {/* Barbell across upper back */}
        <rect x="25" y="65" width="150" height="6" rx="3" fill="url(#barbellGrad)" />
        {/* Weight plates */}
        <rect x="28" y="45" width="10" height="46" rx="3" fill="#06b6d4" filter="url(#glowSquat)" stroke="#22d3ee" strokeWidth="1.5" />
        <rect x="20" y="50" width="8" height="36" rx="2" fill="#0891b2" />
        <rect x="162" y="45" width="10" height="46" rx="3" fill="#06b6d4" filter="url(#glowSquat)" stroke="#22d3ee" strokeWidth="1.5" />
        <rect x="172" y="50" width="8" height="36" rx="2" fill="#0891b2" />

        {/* Head */}
        <circle cx="100" cy="50" r="14" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Face direction visor */}
        <path d="M106 48 L114 49 L106 53 Z" fill="#22d3ee" />

        {/* Torso & Spine Angle in deep squat */}
        <path d="M100 64 L86 115" stroke="url(#bodyGradSquat)" strokeWidth="16" strokeLinecap="round" />
        {/* Chest / Pectoral Highlight */}
        <path d="M96 74 L84 105" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />

        {/* Arms holding barbell */}
        <path d="M92 68 L70 66 L65 72" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M108 68 L130 66 L135 72" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Glutes & Pelvis (Hips below parallel) */}
        <circle cx="82" cy="120" r="12" fill="#0891b2" stroke="#06b6d4" strokeWidth="2" />

        {/* Left Leg (Thigh at parallel/below) */}
        <path d="M82 120 L122 135 L118 210 L132 215" stroke="url(#bodyGradSquat)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right Leg (Facing side) */}
        <path d="M78 122 L110 138 L105 212 L120 216" stroke="#22d3ee" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

        {/* Knee Joint Accent Indicator */}
        <circle cx="122" cy="135" r="4.5" fill="#f59e0b" filter="url(#glowSquat)" />
        <circle cx="110" cy="138" r="4" fill="#fbbf24" />

        {/* Center of Gravity vertical line */}
        <line x1="100" y1="40" x2="100" y2="225" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.6" />
        {/* Muscle Tension Glow Indicator */}
        <path d="M84 125 Q115 132 105 170" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="3 2" strokeOpacity="0.8" />
      </svg>
    ),
  },

  // BENCH PRESS (Press de Banca)
  bench: {
    category: 'Pectoral / Empuje',
    primaryMuscles: ['Pectoral Mayor', 'Pectoral Menor'],
    secondaryMuscles: ['Tríceps Braquial', 'Deltoides Anterior'],
    cues: [
      'Retrae y deprime fuertemente las escápulas clavándolas en el banco.',
      'Arco lumbar natural estable y pies bien firmes empujando el suelo (Leg Drive).',
      'Desciende la barra con control hacia la parte baja del esternón.',
      'Codos a unos 45-75° respecto al torso, nunca a 90° abiertos.',
    ],
    commonMistakes: [
      'Rebotar la barra en el esternón para impulsarse.',
      'Despegar los glúteos del banco durante el levantamiento.',
      'Abrir los codos en exceso dañando los manguitos rotadores.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="benchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>
          <linearGradient id="bodyGradBench" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <filter id="glowBench" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Bench Structure */}
        <rect x="40" y="112" width="130" height="12" rx="4" fill="url(#benchGrad)" stroke="#3f3f46" strokeWidth="2" />
        <rect x="55" y="124" width="8" height="35" rx="2" fill="#52525b" />
        <rect x="145" y="124" width="8" height="35" rx="2" fill="#52525b" />
        {/* Bench Stand Uprights */}
        <path d="M45 40 L45 124" stroke="#71717a" strokeWidth="5" strokeLinecap="round" />

        {/* Athlete on Bench */}
        {/* Head */}
        <circle cx="55" cy="102" r="11" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Torso with arch */}
        <path d="M66 106 Q95 96 125 108" stroke="url(#bodyGradBench)" strokeWidth="14" strokeLinecap="round" />
        {/* Glutes on bench */}
        <circle cx="128" cy="108" r="9" fill="#0891b2" />
        {/* Legs down to floor (Leg drive) */}
        <path d="M128 108 L155 125 L165 160 L178 160" stroke="#06b6d4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Target Chest Activation Area */}
        <circle cx="95" cy="98" r="7" fill="#f43f5e" fillOpacity="0.4" filter="url(#glowBench)" />
        <circle cx="95" cy="98" r="3.5" fill="#f43f5e" />

        {/* Barbell in mid descent */}
        <line x1="95" y1="15" x2="95" y2="78" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="91" y="55" width="8" height="8" rx="4" fill="#e4e4e7" stroke="#06b6d4" strokeWidth="2" />
        <line x1="95" y1="10" x2="95" y2="100" stroke="#06b6d4" strokeWidth="0" />

        {/* Arms holding the barbell */}
        <path d="M80 102 L70 78 L93 59" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M98 104 L108 80 L97 59" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Barbell Cross Section */}
        <line x1="60" y1="58" x2="135" y2="58" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" filter="url(#glowBench)" />
        <circle cx="95" cy="58" r="5" fill="#facc15" />
      </svg>
    ),
  },

  // DEADLIFT (Peso Muerto)
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
      'Alejar la barra del cuerpo aumentando el brazo de palanca y tensión lumbar.',
      'Híper-extender la espalda hacia atrás en el bloqueo final.',
    ],
    renderGraphic: (className = 'w-full h-full') => (
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bodyGradDeadlift" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <filter id="glowDeadlift" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Floor */}
        <line x1="20" y1="220" x2="180" y2="220" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />

        {/* Athlete in Start Position (Hip Hinge) */}
        {/* Head aligned with spine */}
        <circle cx="140" cy="80" r="13" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M148 78 L155 81 L148 84 Z" fill="#22d3ee" />

        {/* Back / Spine (Straight, neutral alignment) */}
        <path d="M130 92 L75 130" stroke="url(#bodyGradDeadlift)" strokeWidth="14" strokeLinecap="round" />
        <line x1="135" y1="88" x2="70" y2="134" stroke="#22d3ee" strokeWidth="3" strokeDasharray="4 2" />

        {/* Glutes & Hips */}
        <circle cx="75" cy="130" r="12" fill="#0891b2" />

        {/* Thighs & Shins (Shins close to vertical) */}
        <path d="M75 130 L105 160 L108 215 L125 218" stroke="url(#bodyGradDeadlift)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />

        {/* Long Straight Arms pulling bar */}
        <path d="M125 96 L112 170" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />

        {/* Barbell Plates on floor/mid shin */}
        <circle cx="112" cy="170" r="28" fill="#18181b" stroke="#06b6d4" strokeWidth="3" filter="url(#glowDeadlift)" />
        <circle cx="112" cy="170" r="16" fill="#0891b2" fillOpacity="0.4" />
        <circle cx="112" cy="170" r="5" fill="#facc15" />

        {/* Tension Indicators: Lat and Hamstrings */}
        <circle cx="115" cy="108" r="4" fill="#f59e0b" filter="url(#glowDeadlift)" />
        <circle cx="90" cy="145" r="4.5" fill="#f43f5e" filter="url(#glowDeadlift)" />
      </svg>
    ),
  },

  // OVERHEAD PRESS (Press Militar)
  overhead: {
    category: 'Hombros / Deltoides',
    primaryMuscles: ['Deltoides Anterior', 'Deltoides Lateral'],
    secondaryMuscles: ['Tríceps', 'Pectoral Superior', 'Core / Glúteos'],
    cues: [
      'Pies al ancho de caderas y glúteos fuertemente apretados.',
      'Agarre justo por fuera de los hombros con codos ligeramente adelantados a la barra.',
      'Mueve la cabeza ligeramente hacia atrás al inicio para despejar la trayectoria.',
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
          <filter id="glowOhp" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <line x1="30" y1="225" x2="170" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />

        {/* Overhead Barbell at Lockout */}
        <rect x="25" y="24" width="150" height="5" rx="2.5" fill="#e4e4e7" />
        <rect x="28" y="10" width="8" height="34" rx="2" fill="#06b6d4" filter="url(#glowOhp)" stroke="#22d3ee" strokeWidth="1.5" />
        <rect x="164" y="10" width="8" height="34" rx="2" fill="#06b6d4" filter="url(#glowOhp)" stroke="#22d3ee" strokeWidth="1.5" />

        {/* Arms extended overhead */}
        <path d="M78 78 L65 48 L72 26" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M122 78 L135 48 L128 26" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Head through the window */}
        <circle cx="100" cy="65" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />

        {/* Shoulder Deltoid Highlights */}
        <circle cx="78" cy="78" r="7" fill="#f43f5e" fillOpacity="0.6" filter="url(#glowOhp)" />
        <circle cx="122" cy="78" r="7" fill="#f43f5e" fillOpacity="0.6" filter="url(#glowOhp)" />

        {/* Torso straight & tight */}
        <path d="M100 80 L100 135" stroke="url(#bodyGradOhp)" strokeWidth="15" strokeLinecap="round" />
        {/* Hips & Glutes squeezed */}
        <circle cx="100" cy="138" r="10" fill="#0891b2" />

        {/* Legs upright and locked */}
        <path d="M93 145 L91 218 L80 222" stroke="url(#bodyGradOhp)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M107 145 L109 218 L120 222" stroke="url(#bodyGradOhp)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Center of Gravity Line */}
        <line x1="100" y1="20" x2="100" y2="225" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
      </svg>
    ),
  },

  // PULL-UP / LAT PULLDOWN (Dominadas / Jalón)
  pullup: {
    category: 'Espalda / Tracción Vertical',
    primaryMuscles: ['Dorsal Ancho', 'Redondo Mayor'],
    secondaryMuscles: ['Bíceps Braquial', 'Braquiorradial', 'Trapecio Medio/Bajo'],
    cues: [
      'Agarre pronado ligeramente más ancho que los hombros.',
      'Inicia la tracción bajando y juntando las escápulas antes de flexionar los brazos.',
      'Conduce los codos hacia abajo y hacia las costillas, no hacia atrás.',
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
          <filter id="glowPull" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Pull-up Bar */}
        <rect x="20" y="25" width="160" height="6" rx="3" fill="#71717a" stroke="#a1a1aa" strokeWidth="1" />

        {/* Hands on bar */}
        <rect x="55" y="22" width="10" height="10" rx="3" fill="#22d3ee" />
        <rect x="135" y="22" width="10" height="10" rx="3" fill="#22d3ee" />

        {/* Head reaching above bar */}
        <circle cx="100" cy="30" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />

        {/* Arms in contraction */}
        <path d="M60 28 L50 62 L82 68" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M140 28 L150 62 L118 68" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

        {/* Back V-Taper Torso with Lat Spread */}
        <path d="M78 65 L88 120 L112 120 L122 65 Z" fill="url(#bodyGradPull)" stroke="#06b6d4" strokeWidth="2" />
        {/* Lat Wings Highlight */}
        <path d="M78 68 Q68 90 85 110" stroke="#f43f5e" strokeWidth="3" filter="url(#glowPull)" fill="none" />
        <path d="M122 68 Q132 90 115 110" stroke="#f43f5e" strokeWidth="3" filter="url(#glowPull)" fill="none" />

        {/* Lower body hanging */}
        <path d="M94 122 L92 185 L98 220" stroke="url(#bodyGradPull)" strokeWidth="8" strokeLinecap="round" />
        <path d="M106 122 L108 185 L102 220" stroke="url(#bodyGradPull)" strokeWidth="8" strokeLinecap="round" />
      </svg>
    ),
  },

  // CARDIO / RUNNING / WALKING
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
          <filter id="glowCardio" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Treadmill / Ground motion lines */}
        <line x1="20" y1="220" x2="180" y2="220" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" />
        <line x1="40" y1="225" x2="160" y2="225" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 3" />

        {/* Head with forward tilt */}
        <circle cx="125" cy="50" r="12" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M133 48 L142 50 L133 54 Z" fill="#22d3ee" />

        {/* Torso dynamically angled */}
        <path d="M120 62 L100 120" stroke="url(#bodyGradCardio)" strokeWidth="14" strokeLinecap="round" />

        {/* Forward Arm */}
        <path d="M118 70 L145 88 L140 108" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Back Arm */}
        <path d="M115 70 L85 82 L75 98" stroke="#71717a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Forward Leg (Knee raised high) */}
        <path d="M100 120 L135 145 L130 190 L145 195" stroke="url(#bodyGradCardio)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="135" cy="145" r="4.5" fill="#f59e0b" filter="url(#glowCardio)" />

        {/* Trailing Leg (Pushing off ground) */}
        <path d="M98 120 L65 155 L45 205 L35 215" stroke="#0891b2" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />

        {/* Speed Wind Accent Lines */}
        <path d="M45 85 L20 85" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        <path d="M35 110 L15 110" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
      </svg>
    ),
  },

  // DEFAULT / GENERAL STRENGTH
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
          <filter id="glowGen" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <circle cx="100" cy="55" r="14" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M100 70 L100 135" stroke="url(#bodyGradGen)" strokeWidth="16" strokeLinecap="round" />

        {/* Athletic Arms holding dumbbells */}
        <path d="M85 75 L60 100 L62 120" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M115 75 L140 100 L138 120" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dumbbells in hands */}
        <rect x="54" y="115" width="16" height="10" rx="3" fill="#06b6d4" filter="url(#glowGen)" />
        <rect x="130" y="115" width="16" height="10" rx="3" fill="#06b6d4" filter="url(#glowGen)" />

        {/* Athletic Stance Legs */}
        <path d="M92 135 L80 180 L75 220" stroke="url(#bodyGradGen)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M108 135 L120 180 L125 220" stroke="url(#bodyGradGen)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

        <line x1="40" y1="225" x2="160" y2="225" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
      </svg>
    ),
  },
};

/**
 * Intelligent helper to resolve an exercise to its corresponding visual guide
 */
export function getExerciseVisualGuide(exerciseName: string, muscleGroup?: string): ExerciseGuideData {
  const norm = (exerciseName || '').toLowerCase();

  // 1. Squats & Legs
  if (
    norm.includes('sentadilla') ||
    norm.includes('squat') ||
    norm.includes('prensa') ||
    norm.includes('búlgara') ||
    norm.includes('bulgara') ||
    norm.includes('cuádriceps')
  ) {
    return EXERCISE_GUIDES.squat;
  }

  // 2. Bench & Chest Press
  if (
    norm.includes('banca') ||
    norm.includes('bench') ||
    norm.includes('press plano') ||
    norm.includes('press inclinado') ||
    norm.includes('pecho') ||
    norm.includes('flexiones') ||
    norm.includes('push-up') ||
    norm.includes('aperturas') ||
    norm.includes('cruces')
  ) {
    return EXERCISE_GUIDES.bench;
  }

  // 3. Deadlift & Hip Hinge
  if (
    norm.includes('muerto') ||
    norm.includes('deadlift') ||
    norm.includes('isquios') ||
    norm.includes('kettlebell swing') ||
    norm.includes('hip thrust')
  ) {
    return EXERCISE_GUIDES.deadlift;
  }

  // 4. Overhead Press & Shoulders
  if (
    norm.includes('militar') ||
    norm.includes('ohp') ||
    norm.includes('overhead') ||
    norm.includes('hombro') ||
    norm.includes('pike') ||
    norm.includes('elevaciones')
  ) {
    return EXERCISE_GUIDES.overhead;
  }

  // 5. Pulls, Rows & Pull-ups
  if (
    norm.includes('dominada') ||
    norm.includes('pull-up') ||
    norm.includes('chin-up') ||
    norm.includes('jalón') ||
    norm.includes('jalon') ||
    norm.includes('remo') ||
    norm.includes('lat')
  ) {
    return EXERCISE_GUIDES.pullup;
  }

  // 6. Cardio & Running & Walking
  if (
    muscleGroup === 'Cardio' ||
    norm.includes('carrera') ||
    norm.includes('running') ||
    norm.includes('caminata') ||
    norm.includes('andar') ||
    norm.includes('cinta') ||
    norm.includes('bici') ||
    norm.includes('ciclismo') ||
    norm.includes('burpee') ||
    norm.includes('sprint') ||
    norm.includes('salto')
  ) {
    return EXERCISE_GUIDES.cardio;
  }

  return EXERCISE_GUIDES.general;
}
