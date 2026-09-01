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
  Flame
} from 'lucide-react';
import { UserProfile, Achievement, Language } from '../types';
import { sound } from '../lib/soundFx';

interface ProfileEditModalProps {
  user: UserProfile;
  achievements?: Achievement[];
  lang: Language;
  onClose: () => void;
  onSaveUser: (updatedUser: UserProfile) => void;
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

  // Avatar Presets (Cyber-Fitness Matrix Style)
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

  // Available Titles based on Level and Unlocked Achievements
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

  const handleSave = () => {
    if (!name.trim()) return;

    const updatedUser: UserProfile = {
      ...user,
      name: name.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=06b6d4,3b82f6`,
      rankTitle,
      weightKg: Number(weightKg) || 70,
      targetWeightKg: Number(targetWeightKg) || 70,
    };

    sound.playLevelUp();
    onSaveUser(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#121214] border border-cyan-500/30 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 my-auto max-h-[95vh] overflow-y-auto no-scrollbar">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-lg sm:text-xl">
                Perfil de Atleta & Identidad
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Nivel {user.level} • {user.rankTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold text-neutral-300 block uppercase tracking-wider">
            Foto de Perfil / Avatar
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="relative group">
              <img
                src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'FitQuest')}`}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              />
              <label
                htmlFor="avatar-file-upload"
                className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-mono font-bold"
                title="Subir foto desde tu dispositivo"
              >
                <Camera className="w-6 h-6 text-cyan-400" />
              </label>
              <input
                id="avatar-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                <label
                  htmlFor="avatar-file-upload-btn"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Foto</span>
                </label>
                <input
                  id="avatar-file-upload-btn"
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
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono font-bold border border-white/5 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Iniciales</span>
                </button>
              </div>
              <p className="text-[10px] font-mono text-neutral-400">
                O selecciona uno de los avatares predeterminados:
              </p>
            </div>
          </div>

          {/* Avatar Presets Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {avatarPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatar(preset)}
                className={`p-1 rounded-xl border transition-all ${
                  avatar === preset
                    ? 'border-cyan-500 bg-cyan-500/20 ring-2 ring-cyan-500/40 scale-105'
                    : 'border-white/5 hover:border-white/20 bg-white/5'
                }`}
              >
                <img src={preset} alt={`Preset ${idx}`} className="w-full h-10 object-cover rounded-lg" />
              </button>
            ))}
          </div>
        </div>

        {/* Username Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-neutral-300 block uppercase tracking-wider">
            Nombre de Atleta
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Alex Titan"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Equip Rank Title Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-neutral-300 block uppercase tracking-wider">
              Título Honorífico Equipado
            </label>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              Actual: {rankTitle}
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
            {/* Level Titles */}
            {levelTitles.map((item) => {
              const isUnlocked = user.level >= item.minLevel;
              const isSelected = rankTitle === item.title;

              return (
                <button
                  key={item.title}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && setRankTitle(item.title)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold'
                      : isUnlocked
                      ? 'bg-white/5 border-white/5 text-neutral-200 hover:bg-white/10'
                      : 'bg-white/[0.02] border-white/5 text-neutral-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </span>
                  {isSelected ? (
                    <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Equipado
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[10px] text-neutral-400">Desbloqueado</span>
                  ) : (
                    <span className="text-[10px] text-neutral-500 font-mono">Nvl {item.minLevel}</span>
                  )}
                </button>
              );
            })}

            {/* Achievement Titles */}
            {achievementTitles.map((ach) => {
              const isSelected = rankTitle === ach.title;
              return (
                <button
                  key={ach.title}
                  type="button"
                  disabled={!ach.unlocked}
                  onClick={() => ach.unlocked && setRankTitle(ach.title)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                      : ach.unlocked
                      ? 'bg-white/5 border-white/5 text-neutral-200 hover:bg-white/10'
                      : 'bg-white/[0.02] border-white/5 text-neutral-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{ach.icon}</span>
                    <span>{ach.title}</span>
                  </span>
                  {isSelected ? (
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Equipado
                    </span>
                  ) : ach.unlocked ? (
                    <span className="text-[10px] text-emerald-400">Logro Desbloqueado</span>
                  ) : (
                    <span className="text-[10px] text-neutral-500">Bloqueado</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Weights Calibration Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-neutral-300 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Peso Actual (kg)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-neutral-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Peso Objetivo (kg)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions Button */}
        <div className="flex gap-3 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono font-bold border border-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-save-profile"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 text-xs font-mono font-black shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
