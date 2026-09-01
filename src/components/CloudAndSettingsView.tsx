import React, { useState } from 'react';
import {
  Cloud,
  CloudOff,
  Bell,
  CheckCircle2,
  RefreshCw,
  Download,
  Upload,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Volume2,
  VolumeX,
  Languages,
  Moon,
  Sun,
  Eye,
  Sliders,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  PushReminder,
  Language,
  ThemeMode,
  UserProfile,
} from '../types';
import { translations } from '../lib/i18n';
import { FitStorage } from '../lib/storage';
import { sound } from '../lib/soundFx';

interface CloudAndSettingsViewProps {
  user: UserProfile;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isSoundMuted: boolean;
  setIsSoundMuted: (muted: boolean) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  textSize: 'normal' | 'large' | 'xlarge';
  setTextSize: (size: 'normal' | 'large' | 'xlarge') => void;
  reminders: PushReminder[];
  onUpdateReminders: (reminders: PushReminder[]) => void;
  onDataImported: () => void;
}

export const CloudAndSettingsView: React.FC<CloudAndSettingsViewProps> = ({
  user,
  lang,
  setLang,
  theme,
  setTheme,
  isSoundMuted,
  setIsSoundMuted,
  isOffline,
  setIsOffline,
  highContrast,
  setHighContrast,
  textSize,
  setTextSize,
  reminders,
  onUpdateReminders,
  onDataImported,
}) => {
  const t = translations[lang];

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);

  // Sync now action
  const handleCloudSync = () => {
    setIsSyncing(true);
    sound.playBeep(850, 80);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccessMsg('¡Sincronizado con la nube exitosamente!');
      sound.playAchievement();
      setTimeout(() => setSyncSuccessMsg(null), 3500);
    }, 1200);
  };

  // Request browser push permissions
  const handleRequestPush = async () => {
    if (typeof Notification !== 'undefined') {
      const result = await Notification.requestPermission();
      setPushStatus(result);
      if (result === 'granted') {
        sound.playAchievement();
        new Notification('FitQuest Pro', {
          body: '⚔️ ¡Notificaciones push activadas con éxito! Mantendremos tu motivación al 100%.',
        });
      }
    }
  };

  // Send Test Notification
  const handleSendTestNotification = () => {
    sound.playAchievement();
    setTestNotificationSent(true);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('FitQuest Pro - Recordatorio', {
        body: '🔥 ¡Es hora de entrenar! Tu racha de 8 días te espera en la arena.',
      });
    }
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  // Toggle Reminder Item
  const handleToggleReminder = (id: string) => {
    sound.playBeep(750, 40);
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    onUpdateReminders(updated);
  };

  // File Import Handler
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const success = FitStorage.importData(text);
        if (success) {
          sound.playLevelUp();
          alert('¡Datos restaurados con éxito!');
          onDataImported();
        } else {
          alert('Error al leer el archivo JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ⚙️ Centro de Control
          </span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
          {t.navSettings} & {t.cloudSyncTitle}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
          {t.cloudSyncDesc}
        </p>
      </div>

      {/* Cloud Synchronization & Multi-device Status Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl ${
              isOffline ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}>
              {isOffline ? <CloudOff className="w-7 h-7" /> : <Cloud className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-xl text-white">
                  {isOffline ? t.offlineMode : 'Sincronización Cloud Multidispositivo'}
                </h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isOffline ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isOffline ? 'OFFLINE' : 'ONLINE SYNC'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isOffline ? t.offlineActive : 'Todos tus entrenamientos, récords y XP están respaldados en tiempo real.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-force-cloud-sync"
              disabled={isSyncing || isOffline}
              onClick={handleCloudSync}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-40 flex items-center gap-2 transition-all hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : t.syncNow}</span>
            </button>
          </div>
        </div>

        {syncSuccessMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Multi-device Status Preview */}
        <div>
          <h4 className="text-xs font-extrabold uppercase text-neutral-300 tracking-wider mb-3">
            {t.multiDevice}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <div>
                <h5 className="font-bold text-white text-xs">iPhone 16 Pro</h5>
                <span className="text-[10px] text-emerald-400 font-medium">● Activo ahora (este dispositivo)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center gap-3">
              <Watch className="w-5 h-5 text-teal-400" />
              <div>
                <h5 className="font-bold text-white text-xs">Apple Watch Ultra</h5>
                <span className="text-[10px] text-neutral-400 font-medium">Sincronizado</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center gap-3">
              <Tablet className="w-5 h-5 text-cyan-400" />
              <div>
                <h5 className="font-bold text-white text-xs">iPad Pro M4</h5>
                <span className="text-[10px] text-neutral-400 font-medium">Hace 2 horas</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center gap-3">
              <Laptop className="w-5 h-5 text-amber-400" />
              <div>
                <h5 className="font-bold text-white text-xs">MacBook Pro</h5>
                <span className="text-[10px] text-neutral-400 font-medium">Hace 1 día</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Portability: Backup Export & Restore */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white">Copia de Seguridad y Portabilidad Local</h4>
            <p className="text-xs text-neutral-400 mt-0.5">Exporta o restaura todos tus datos en formato estándar JSON.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const dataStr = FitStorage.exportAllData();
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fitquest-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.exportData}</span>
            </button>

            <label className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.importData}</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Personalized Push Notifications Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-white">
                {t.pushReminders}
              </h3>
              <p className="text-xs text-neutral-400">
                Notificaciones push diarias para proteger tu racha y mantener tu enfoque
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pushStatus !== 'granted' ? (
              <button
                id="btn-enable-push-permission"
                onClick={handleRequestPush}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md"
              >
                {t.enablePush}
              </button>
            ) : (
              <button
                id="btn-send-test-push"
                onClick={handleSendTestNotification}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testNotificationSent ? '¡Notificación Enviada!' : 'Probar Notificación'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{rem.title}</span>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-neutral-700 text-amber-400">
                    {rem.time}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{rem.message}</p>
                <div className="flex gap-1 pt-1">
                  {rem.days.map((d) => (
                    <span key={d} className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-700/70 text-neutral-300 font-semibold">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => handleToggleReminder(rem.id)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  rem.enabled ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    rem.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility & Visual Customization */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="pb-4 border-b border-neutral-800">
          <h3 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            <span>{t.accessibility} & Preferencias</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cumplimiento estricto con las pautas de accesibilidad web (WCAG AA) y experiencia visual óptima
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Visual Theme */}
          <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 space-y-2">
            <label className="text-xs font-bold text-neutral-300 block">Tema Visual</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-theme-cyberpunk"
                onClick={() => {
                  setTheme('cyberpunk');
                  sound.playAchievement();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  theme === 'cyberpunk' || theme === 'dark'
                    ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-neutral-700 text-neutral-300 border-neutral-600 hover:bg-neutral-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cyberpunk</span>
              </button>
              <button
                id="btn-theme-oled"
                onClick={() => {
                  setTheme('oled');
                  sound.playAchievement();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  theme === 'oled'
                    ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-neutral-700 text-neutral-300 border-neutral-600 hover:bg-neutral-600'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>OLED Black</span>
              </button>
            </div>
          </div>

          {/* High Contrast */}
          <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-between">
            <div>
              <h5 className="font-bold text-white text-xs">{t.highContrast}</h5>
              <p className="text-[11px] text-neutral-400">Contraste visual reforzado</p>
            </div>
            <button
              onClick={() => {
                const nextVal = !highContrast;
                setHighContrast(nextVal);
                FitStorage.saveHighContrast(nextVal);
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                highContrast ? 'bg-emerald-500' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Text Size */}
          <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 space-y-2">
            <label className="text-xs font-bold text-neutral-300 block">{t.textSize}</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setTextSize(size);
                    FitStorage.saveTextSize(size);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold capitalize border ${
                    textSize === size ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-neutral-700 text-neutral-300 border-neutral-600'
                  }`}
                >
                  {size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'Max'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
