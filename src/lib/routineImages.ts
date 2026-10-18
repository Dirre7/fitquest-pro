/**
 * Maps specific routines to high-resolution, unique and contextual fitness photography.
 * Avoids repetition across workout catalog and dashboard.
 */
export const ROUTINE_IMAGES_MAP: Record<string, string> = {
  // Fuerza & Powerlifting
  rt_powerlifting_max: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&q=80&auto=format&fit=crop', // Discos de competición y barra pesada
  rt_upper_strength: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=80&auto=format&fit=crop', // Press de banca y torso con mancuernas
  
  // Hipertrofia & Músculo
  rt_chest_back_pump: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80&auto=format&fit=crop', // Poleas y jalones dorsales
  rt_legs_hypertrophy: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=700&q=80&auto=format&fit=crop', // Sentadilla profunda y piernas en rack
  
  // HIIT & Acondicionamiento
  rt_hiit_spartan: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=700&q=80&auto=format&fit=crop', // Cuerdas de batalla (Battle ropes) dinámicas
  rt_tabata_shredder: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80&auto=format&fit=crop', // Intervalos de salto y sprint metabólico
  
  // Calistenia & Peso Corporal
  rt_calisthenics_mastery: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=700&q=80&auto=format&fit=crop', // Dominadas en barra al aire libre
  rt_calisthenics_skills: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=700&q=80&auto=format&fit=crop', // Paralelas y fuerza estricta
  
  // Cardio & Running
  rt_cardio_12330: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=700&q=80&auto=format&fit=crop', // Cinta de correr en gimnasio
  rt_outdoor_power_walk: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&q=80&auto=format&fit=crop', // Marcha y carrera al aire libre
  rt_cardio_zone2: 'https://images.unsplash.com/photo-1483721074574-e866e4a2d61c?w=700&q=80&auto=format&fit=crop', // Remo indoor Concept2
  rt_cardio_vo2max: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=700&q=80&auto=format&fit=crop', // Pista de atletismo y sprints anaeróbicos
  
  // Movilidad & Recuperación
  rt_mobility_full: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=700&q=80&auto=format&fit=crop', // Estiramientos y movilidad en colchoneta
  rt_mobility_shoulders: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=700&q=80&auto=format&fit=crop', // Espalda y apertura articular
};

export function getRoutinePhoto(routine: { id?: string; category?: string; difficulty?: string; imageUrl?: string }): string {
  if (routine.imageUrl) return routine.imageUrl;
  if (routine.id && ROUTINE_IMAGES_MAP[routine.id]) {
    return ROUTINE_IMAGES_MAP[routine.id];
  }
  
  // Category fallbacks with varied distinct images
  switch (routine.category) {
    case 'Strength':
      return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&q=80&auto=format&fit=crop';
    case 'Hypertrophy':
      return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80&auto=format&fit=crop';
    case 'HIIT':
      return 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=700&q=80&auto=format&fit=crop';
    case 'Calisthenics':
      return 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=700&q=80&auto=format&fit=crop';
    case 'Cardio':
      return 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=700&q=80&auto=format&fit=crop';
    case 'Mobility':
      return 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=700&q=80&auto=format&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=80&auto=format&fit=crop';
  }
}
