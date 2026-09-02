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
  Trash2,
  AlertTriangle,
  LogOut,
  ShieldAlert,
  RotateCcw,
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
import { auth, signOut } from '../lib/firebase';

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
  onResetProgress?: () => Promise<void> | void;
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
  onResetProgress,
}) => {
  const t = translations[lang];

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState<boolean>(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
  const [showResetProgressModal, setShowResetProgressModal] = useState<boolean>(false);
  const [isResettingProgress, setIsResettingProgress] = useState<boolean>(false);

  // Sign out handler
  const handleSignOut = async () => {
    sound.playBeep(400, 100);
    await signOut(auth);
    window.location.reload();
  };

  // Reset progress handler (Reset to level 1 & empty history while keeping account)
  const handleResetProgressAction = async () => {
    setIsResettingProgress(true);
    sound.playWarning();
    try {
      if (onResetProgress) {
        await onResetProgress();
      } else {
        await FitStorage.resetUserProgress();
        window.location.reload();
      }
      setShowResetProgressModal(false);
      sound.playLevelUp();
    } catch (e) {
      console.error('Reset error:', e);
    } finally {
      setIsResettingProgress(false);
    }
  };

  // Delete account and data handler (Apple & GDPR compliance)
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    sound.playWarning();
    await FitStorage.deleteUserAccountAndData();
    window.location.reload();
  };

  // Sync now action
  const handleCloudSync = async () => {
    setIsSyncing(true);
    sound.playBeep(850, 80);

    try {
      await FitStorage.syncUserToCloud(user);
      setIsSyncing(false);
      setSyncSuccessMsg('¡Sincronizado con la nube exitosamente!');
      sound.playAchievement();
      setTimeout(() => setSyncSuccessMsg(null), 3500);
    } catch {
      setIsSyncing(false);
      setSyncSuccessMsg('¡Guardado localmente!');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    }
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

      {/* Account Security & Privacy Zone (App Store & GDPR Mandatory Compliance) */}
      <div className="bg-[#121214] border border-red-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">
                Cuenta, Privacidad & Zona de Peligro
              </h3>
              <p className="text-xs text-neutral-400">
                Gestión de sesión, control de privacidad y eliminación permanente de datos en la nube.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sign Out Action */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3">
            <div>
              <h5 className="font-bold text-white text-xs">Cerrar Sesión Activa</h5>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Desconecta tu cuenta de este dispositivo. Tus entrenamientos seguirán guardados en la nube.
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* Reset Progress Action */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between gap-3">
            <div>
              <h5 className="font-bold text-amber-300 text-xs">Reiniciar Progreso (Empezar de 0)</h5>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Vuelve al Nivel 1 (0 XP) y limpia el historial de entrenamientos, manteniendo tu cuenta y correo intactos.
              </p>
            </div>
            <button
              id="btn-reset-progress"
              onClick={() => setShowResetProgressModal(true)}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Datos</span>
            </button>
          </div>

          {/* Delete Account Action */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex flex-col justify-between gap-3">
            <div>
              <h5 className="font-bold text-red-300 text-xs">Eliminar Cuenta y Datos</h5>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Borrado irreversible de tu usuario, historial en Firestore y registros en el servidor (GDPR / Apple Compliance).
              </p>
            </div>
            <button
              id="btn-delete-account"
              onClick={() => setShowDeleteAccountModal(true)}
              className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Cuenta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Progress Confirmation Modal */}
      {showResetProgressModal && (
        <div 
          style={{ 
            paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#121214] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="font-display font-black text-xl text-white">
              ¿Reiniciar progreso y empezar de 0?
            </h3>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              Volverás al **Nivel 1 con 0 XP**, tus 4 atributos volverán a su base inicial (10 pts) y se vaciará el historial de entrenamientos y logros. **Tu cuenta y correo seguirán activos.**
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                disabled={isResettingProgress}
                onClick={handleResetProgressAction}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-mono font-bold text-xs shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isResettingProgress ? (
                  <span className="animate-pulse">Reiniciando temporada...</span>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Sí, Reiniciar a Nivel 1 (0 XP)</span>
                  </>
                )}
              </button>
              <button
                disabled={isResettingProgress}
                onClick={() => setShowResetProgressModal(false)}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono font-bold text-xs border border-white/5 transition-colors cursor-pointer"
              >
                Cancelar y Mantener Progreso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div 
          style={{ 
            paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', 
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#121214] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-display font-black text-xl text-white">
              ¿Eliminar cuenta definitivamente?
            </h3>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              Esta acción eliminará de forma **permanente e irreversible** tu cuenta de atleta, todas tus series registradas, estadísticas, niveles y logros en la base de datos de la nube.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                disabled={isDeletingAccount}
                onClick={handleDeleteAccount}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeletingAccount ? (
                  <span className="animate-pulse">Borrando datos del servidor...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Eliminar Cuenta y Datos</span>
                  </>
                )}
              </button>
              <button
                disabled={isDeletingAccount}
                onClick={() => setShowDeleteAccountModal(false)}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono font-bold text-xs border border-white/5 transition-colors cursor-pointer"
              >
                Cancelar y Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
