import React, { useState } from 'react';
import {
  User,
  Camera,
  Award,
  Sparkles,
  Check,
  X,
  Scale,
  Shield,
  Upload,
  RefreshCw,
  Trophy,
  Zap,
  Flame,
  ChevronDown
} from 'lucide-react';
import { UserProfile, Achievement, Language } from '../types';
import { sound } from '../lib/soundFx';

interface ProfileEditModalProps {
  user: UserProfile;
  achievements?: Achievement[];
  lang: Language;
  onClose: () => void;
  onSaveUser: (updatedUser: UserProfile) => Promise<void> | void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  user,
  achievements = [],
  lang,
  onClose,
  onSaveUser,
}) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [rankTitle, setRankTitle] = useState(user.rankTitle || 'Recluta Inicial');
  const [weightKg, setWeightKg] = useState(user.weightKg || 70);
  const [targetWeightKg, setTargetWeightKg] = useState(user.targetWeightKg || 70);
  const [isSaving, setIsSaving] = useState(false);

  // Avatar Presets
  const avatarPresets = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=TitanCy&backgroundColor=06b6d4,3b82f6`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=AresMech&backgroundColor=3b82f6,1d4ed8`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Valkyrie&backgroundColor=8b5cf6,ec4899`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=ShadowRunner&backgroundColor=10b981,06b6d4`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=AlexFitness&backgroundColor=06b6d4`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusBeast&backgroundColor=3b82f6`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaPro&backgroundColor=8b5cf6`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'FitQuest')}&backgroundColor=06b6d4,3b82f6`,
  ];

  // Available Titles
  const levelTitles = [
    { title: 'Recluta Inicial', minLevel: 1, icon: '🥉' },
    { title: 'Iniciado del Hierro', minLevel: 3, icon: '⚡' },
    { title: 'Guerrero de Bronce', minLevel: 5, icon: '🛡️' },
    { title: 'Atleta de Plata', minLevel: 10, icon: '🥈' },
    { title: 'Maestro de Oro', minLevel: 15, icon: '🥇' },
    { title: 'Titán Legendario', minLevel: 20, icon: '👑' },
    { title: 'Deidad FitQuest', minLevel: 30, icon: '🌌' },
  ];

  const achievementTitles = achievements
    .filter((a) => a.rewardTitle)
    .map((a) => ({
      title: a.rewardTitle!,
      unlocked: a.unlocked || user.unlockedBadges?.includes(a.id),
      icon: '🏆',
      desc: a.title,
    }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const rawData = uploadEvent.target?.result as string;
      if (!rawData) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressed);
          sound.playAchievement();
        }
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim() || isSaving) return;
    setIsSaving(true);

    const updatedUser: UserProfile = {
      ...user,
      name: name.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=06b6d4,3b82f6`,
      rankTitle,
      weightKg: Number(weightKg) || 70,
      targetWeightKg: Number(targetWeightKg) || 70,
    };

    sound.playLevelUp();
    try {
      await onSaveUser(updatedUser);
    } catch (e) {
      console.error('Failed to save user profile:', e);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div 
      style={{ 
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#121214] border border-cyan-500/30 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 overflow-hidden">
        
        {/* Fixed Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0 bg-[#121214]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-base sm:text-lg">
                Perfil de Atleta & Identidad
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">
                Nivel {user.level} • {rankTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {/* Top Prime Row: Avatar + Name Input (Side by side for instant 1st view) */}
          <div className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5">
            {/* Avatar image preview */}
            <div className="relative group shrink-0">
              <img
                src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'FitQuest')}`}
                alt="Avatar"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
              />
              <label
                htmlFor="avatar-file-upload-quick"
                className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                title="Subir foto desde galería"
              >
                <Camera className="w-5 h-5 text-cyan-400" />
              </label>
              <input
                id="avatar-file-upload-quick"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Name input */}
            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-mono font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                Nombre de Atleta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Alex Titan"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm font-bold text-white focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Quick Avatar Actions & Presets Carousel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold text-neutral-300 block uppercase tracking-wider">
                Elegir Avatar o Foto
              </label>
              <div className="flex items-center gap-1.5">
                <label
                  htmlFor="avatar-file-upload-btn-2"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Subir Foto</span>
                </label>
                <input
                  id="avatar-file-upload-btn-2"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    const initials = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'FitQuest')}&backgroundColor=06b6d4,3b82f6`;
                    setAvatar(initials);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-[10px] font-mono font-bold border border-white/5 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Iniciales</span>
                </button>
              </div>
            </div>

            {/* Presets Horizontal Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {avatarPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(preset)}
                  className={`p-0.5 rounded-xl border shrink-0 transition-all ${
                    avatar === preset
                      ? 'border-cyan-500 bg-cyan-500/20 ring-2 ring-cyan-500/40 scale-105'
                      : 'border-white/5 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <img src={preset} alt={`Preset ${idx}`} className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-lg" />
                </button>
              ))}
            </div>
          </div>

          {/* Equip Rank Title Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold text-neutral-300 block uppercase tracking-wider">
                Título Honorífico Equipado
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                value={rankTitle}
                onChange={(e) => setRankTitle(e.target.value)}
                placeholder="Ej: Guerrero de Bronce, Titán de Acero..."
                className="w-full bg-neutral-900/80 border border-cyan-500/40 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <p className="text-[10px] font-mono text-neutral-400 pt-0.5">O elige un título de la lista:</p>
            <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl">
              {levelTitles.map((item) => {
                const isSelected = rankTitle === item.title;

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setRankTitle(item.title);
                      sound.playBeep(750, 70);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500/80 text-cyan-300 font-extrabold shadow-sm'
                        : 'bg-white/5 border-white/5 text-neutral-200 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </span>
                    {isSelected ? (
                      <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Equipado
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">Nvl {item.minLevel}</span>
                    )}
                  </button>
                );
              })}

              {achievementTitles.map((ach) => {
                const isSelected = rankTitle === ach.title;
                return (
                  <button
                    key={ach.title}
                    type="button"
                    onClick={() => {
                      setRankTitle(ach.title);
                      sound.playBeep(750, 70);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-extrabold shadow-sm'
                        : 'bg-white/5 border-white/5 text-neutral-200 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{ach.icon}</span>
                      <span>{ach.title}</span>
                    </span>
                    {isSelected ? (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Equipado
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400/80">Logro</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weights Calibration Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-neutral-300 flex items-center gap-1">
                <Scale className="w-3 h-3 text-cyan-400" />
                <span>Peso Actual (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-neutral-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Peso Objetivo (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sticky Fixed Bottom Action Bar */}
        <div className="flex gap-2.5 p-4 sm:p-5 border-t border-white/10 bg-[#121214] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono font-bold border border-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-save-profile"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 text-xs font-mono font-black shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
