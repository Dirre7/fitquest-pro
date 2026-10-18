import React, { useState, useEffect } from 'react';
import {
  Watch,
  Heart,
  Activity,
  Battery,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Bluetooth,
  Sliders,
  Shield,
  Sparkles,
  Flame,
  Moon,
  Smartphone,
  ArrowLeft,
  X,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { SmartwatchDevice, Language } from '../types';
import { translations } from '../lib/i18n';
import { sound } from '../lib/soundFx';
import { HealthIntegrationService } from '../lib/healthIntegration';
import { SleepTrackerCard } from './SleepTrackerCard';

interface SmartwatchViewProps {
  smartwatch: SmartwatchDevice;
  lang: Language;
  onUpdateDevice?: (device: SmartwatchDevice) => void;
  onUpdateSmartwatch?: (device: SmartwatchDevice) => void;
  onBack?: () => void;
}

export const SmartwatchView: React.FC<SmartwatchViewProps> = ({
  smartwatch,
  lang,
  onUpdateDevice: propOnUpdateDevice,
  onUpdateSmartwatch,
  onBack,
}) => {
  const onUpdateDevice = onUpdateSmartwatch || propOnUpdateDevice || (() => {});
  const t = translations[lang];

  const [isPairing, setIsPairing] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<SmartwatchDevice['brand']>(smartwatch?.brand || 'Apple Watch');
  const [liveTelemetryHistory, setLiveTelemetryHistory] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]);

  // Sync with Apple Health / Google Health Connect
  const handleSyncHealthPlatform = async (brand: SmartwatchDevice['brand']) => {
    // If running in browser (Vercel / web), notify that HealthKit / Health Connect require the native mobile app
    if (!Capacitor.isNativePlatform()) {
      sound.playWarning();
      alert(
        `Para sincronizar datos reales con ${brand} (HealthKit / Health Connect), abre FitQuest Pro desde la App instalada en tu móvil (Android / iOS).\n\nEn un navegador web (Vercel), Apple y Google bloquean el acceso a las APIs de salud por motivos de privacidad.\n\nSi dispones de un pulsómetro o sensor con Bluetooth, puedes vincularlo directamente con el botón 'Sensor BLE'.`
      );
      return;
    }

    setIsPairing(true);
    sound.playBeep(800, 100);

    try {
      await HealthIntegrationService.requestPermissions(brand);
      const updated = await HealthIntegrationService.syncDeviceTelemetry(smartwatch, brand);
      onUpdateDevice(updated);
      sound.playAchievement();
    } catch (err) {
      console.warn('Sync health error:', err);
    } finally {
      setIsPairing(false);
    }
  };

  // Web Bluetooth Pairing (Real heart rate sensors / Polar / Garmin / Apple / Smartwatches with BLE HR)
  const handleConnectRealBluetooth = async () => {
    setIsPairing(true);
    sound.playBeep(800, 100);

    try {
      if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
        // Request real standard BLE Heart Rate service (0x180D)
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [{ services: ['heart_rate'] }],
          optionalServices: ['battery_service'],
        });

        if (device) {
          const server = await device.gatt.connect();
          const hrService = await server.getPrimaryService('heart_rate');
          const hrCharacteristic = await hrService.getCharacteristic('heart_rate_measurement');
          await hrCharacteristic.startNotifications();

          hrCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value;
            const flags = value.getUint8(0);
            const rate16Bits = flags & 0x1;
            const realBpm = rate16Bits ? value.getUint16(1, true) : value.getUint8(1);

            let zone: SmartwatchDevice['activeZone'] = 'Rest';
            if (realBpm >= 171) zone = 'Peak';
            else if (realBpm >= 151) zone = 'Cardio';
            else if (realBpm >= 131) zone = 'FatBurn';
            else if (realBpm >= 110) zone = 'WarmUp';

            onUpdateDevice({
              ...smartwatch,
              name: device.name || 'Sensor Bluetooth Real',
              brand: 'WebBluetooth',
              status: 'connected',
              liveHeartRate: realBpm,
              activeZone: zone,
              lastSyncTime: 'En vivo (Sensor real)',
            });
            setLiveTelemetryHistory((prev) => [...prev.slice(1), realBpm]);
          });

          onUpdateDevice({
            ...smartwatch,
            name: device.name || 'Sensor Bluetooth Real',
            brand: 'WebBluetooth',
            status: 'connected',
            lastSyncTime: 'En vivo (Sensor real)',
          });
          sound.playAchievement();
          setIsPairing(false);
          return;
        }
      } else {
        alert('Tu navegador no soporta Web Bluetooth. Puedes conectar Apple Health o Google Health Connect.');
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        console.warn('Bluetooth pairing notice:', err);
      }
    }
    setIsPairing(false);
  };

  const handleDisconnect = () => {
    sound.playBeep(500, 80);
    onUpdateDevice({
      ...smartwatch,
      status: 'disconnected',
      liveHeartRate: 0,
      restingHeartRate: 0,
      hrvMs: 0,
      stepsToday: 0,
      activeCaloriesToday: 0,
      calorieSyncMode: 'manual',
      vo2max: 0,
      sleepTotalMinutes: 0,
      sleepScore: 0,
      recoveryScore: 0,
      recoveryXpMultiplier: 1.0,
      sleepStages: undefined,
      lastSyncTime: 'Sin vincular',
      syncSource: undefined,
    });
  };

  const toggleCalorieMode = () => {
    const nextMode = smartwatch.calorieSyncMode === 'smartwatch' ? 'manual' : 'smartwatch';
    sound.playBeep(700, 50);
    onUpdateDevice({
      ...smartwatch,
      calorieSyncMode: nextMode,
    });
  };

  const brands: { id: SmartwatchDevice['brand']; label: string; platform: string }[] = [
    { id: 'Apple Watch', label: 'Apple Watch (HealthKit)', platform: 'iOS & WatchOS' },
    { id: 'Galaxy Watch', label: 'Samsung Galaxy Watch', platform: 'Health Connect' },
    { id: 'Garmin', label: 'Garmin Forerunner / Fenix', platform: 'Garmin Connect' },
    { id: 'Polar', label: 'Polar H10 / Vantage', platform: 'BLE & Sensor' },
    { id: 'Fitbit', label: 'Fitbit Sense / Charge', platform: 'Health Connect' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Navigation & Back Action Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            if (onBack) onBack();
            else window.history.back();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer group shadow-sm active:scale-95"
          title="Volver al Inicio"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al Inicio</span>
        </button>

        {onBack && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Cerrar y volver al inicio"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              ⌚ Apple Watch & WearOS Sync
            </span>
            <span className="text-xs font-bold text-neutral-400">
              Telemetría Cardíaca, Sueño y Kcal
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {t.smartwatchIntegration}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Sincroniza tus métricas biométricas reales: pulso cardíaco, fases del sueño, recuperación física y calorías activas.
          </p>
        </div>

        {/* Pairing Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {smartwatch?.status === 'connected' ? (
            <>
              <button
                id="btn-sync-now"
                disabled={isPairing}
                onClick={() => handleSyncHealthPlatform(selectedBrand)}
                className="px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-neutral-950 font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isPairing ? 'animate-spin' : ''}`} />
                <span>Sincronizar Ahora</span>
              </button>

              <button
                id="btn-disconnect-watch"
                onClick={handleDisconnect}
                className="px-4 py-2.5 rounded-2xl bg-neutral-900 border border-rose-500/40 text-rose-400 hover:bg-rose-950/40 font-bold text-xs shadow-lg transition-colors cursor-pointer"
              >
                Desconectar
              </button>
            </>
          ) : (
            <>
              <button
                id="btn-connect-apple"
                disabled={isPairing}
                onClick={() => handleSyncHealthPlatform('Apple Watch')}
                className="px-4 py-2.5 rounded-2xl bg-white text-black font-extrabold text-xs shadow-xl flex items-center gap-2 hover:bg-neutral-200 transition-all cursor-pointer"
              >
                <Watch className="w-4 h-4 stroke-[2.5]" />
                <span>Conectar Apple Watch</span>
              </button>

              <button
                id="btn-connect-android-wear"
                disabled={isPairing}
                onClick={() => handleSyncHealthPlatform('Galaxy Watch')}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Google Health Connect</span>
              </button>

              <button
                id="btn-connect-bluetooth"
                disabled={isPairing}
                onClick={handleConnectRealBluetooth}
                className="px-3.5 py-2.5 rounded-2xl bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bluetooth className="w-4 h-4 text-cyan-400" />
                <span>Sensor BLE</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Watch Status Card */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
              <Watch className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-xl text-white">
                  {smartwatch?.name || 'Smartwatch Desconectado'}
                </h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  smartwatch?.status === 'connected' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {smartwatch?.status === 'connected' ? 'CONECTADO' : 'DESCONECTADO'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {smartwatch?.status === 'connected'
                  ? `Última sincronización: ${smartwatch?.lastSyncTime || 'Reciente'} • Batería: ${smartwatch?.batteryLevel ?? 0}% • Origen: ${smartwatch.syncSource === 'healthkit' ? 'Apple HealthKit' : smartwatch.syncSource === 'health_connect' ? 'Google Health Connect' : 'Sensor BLE'}`
                  : 'Sin reloj vinculado • Conecta tu Apple Watch, WearOS o sensor Bluetooth para activar métricas'}
              </p>
            </div>
          </div>

          {smartwatch?.status === 'connected' && (
            <div className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-emerald-400" />
              <div className="w-24 h-2.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${smartwatch?.batteryLevel ?? 90}%` }} />
              </div>
              <span className="font-mono text-xs font-bold text-neutral-300">{smartwatch?.batteryLevel ?? 90}%</span>
            </div>
          )}
        </div>

        {/* Live Metrics Grid (6 Advanced Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Live BPM */}
          <div className="bg-neutral-800/60 p-4 rounded-2xl border border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
              <Heart className={`w-4 h-4 fill-current ${smartwatch.status === 'connected' ? 'animate-heart-beat' : 'opacity-40'}`} />
              <span>Pulso en Vivo</span>
            </div>
            <p className="font-mono font-black text-2xl text-white">
              {smartwatch.status === 'connected' && smartwatch.liveHeartRate > 0 ? smartwatch.liveHeartRate : '--'}
            </p>
            <span className={`text-[10px] font-bold ${smartwatch.status === 'connected' ? 'text-cyan-400' : 'text-neutral-500'}`}>
              {smartwatch.status === 'connected' ? `Zona: ${smartwatch.activeZone}` : 'Sin sensor'}
            </span>
          </div>

          {/* Resting Heart Rate */}
          <div className="bg-neutral-800/60 p-4 rounded-2xl border border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold mb-1">
              <Heart className="w-4 h-4" />
              <span>FC Reposo</span>
            </div>
            <p className="font-mono font-black text-2xl text-white">
              {smartwatch.status === 'connected' && smartwatch.restingHeartRate > 0 ? smartwatch.restingHeartRate : '--'}{' '}
              <span className="text-xs text-neutral-400 font-sans">bpm</span>
            </p>
            <span className={`text-[10px] font-bold ${smartwatch.status === 'connected' ? 'text-emerald-400' : 'text-neutral-500'}`}>
              {smartwatch.status === 'connected' ? 'Excelente' : 'Sin vincular'}
            </span>
          </div>

          {/* Active Calories Burned */}
          <div className="bg-neutral-800/60 p-4 rounded-2xl border border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold mb-1">
              <Flame className="w-4 h-4 fill-orange-400/20" />
              <span>Kcal Activas</span>
            </div>
            <p className="font-mono font-black text-2xl text-white">
              {smartwatch.status === 'connected' ? (smartwatch.activeCaloriesToday || 0) : 0}{' '}
              <span className="text-xs text-neutral-400 font-sans">kcal</span>
            </p>
            <span className={`text-[10px] font-bold ${smartwatch.status === 'connected' ? 'text-orange-400' : 'text-neutral-500'}`}>
              {smartwatch.status === 'connected' ? 'Vía sensor óptico' : 'Modo manual'}
            </span>
          </div>

          {/* HRV */}
          <div className="bg-neutral-800/60 p-4 rounded-2xl border border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
              <Activity className="w-4 h-4" />
              <span>{t.hrv}</span>
            </div>
            <p className="font-mono font-black text-2xl text-white">
              {smartwatch.status === 'connected' && smartwatch.hrvMs > 0 ? smartwatch.hrvMs : '--'}{' '}
              <span className="text-xs text-neutral-400 font-sans">ms</span>
            </p>
            <span className={`text-[10px] font-bold ${smartwatch.status === 'connected' ? 'text-cyan-400' : 'text-neutral-500'}`}>
              {smartwatch.status === 'connected' ? 'Recuperación Óptima' : 'Sin datos'}
            </span>
          </div>

          {/* VO2 Max */}
          <div className="bg-neutral-800/60 p-4 rounded-2xl border border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold mb-1">
              <Zap className="w-4 h-4 fill-current" />
              <span>{t.vo2max}</span>
            </div>
            <p className="font-mono font-black text-2xl text-white">
              {smartwatch.status === 'connected' && smartwatch.vo2max > 0 ? smartwatch.vo2max : '--'}
            </p>
            <span className={`text-[10px] font-bold ${smartwatch.status === 'connected' ? 'text-teal-400' : 'text-neutral-500'}`}>
              {smartwatch.status === 'connected' ? 'Nivel Superior' : 'Sin datos'}
            </span>
          </div>

          {/* Daily Steps */}
          <div className="bg-neutral-800/60 p-4 rounded-2xl border border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
              <Activity className="w-4 h-4" />
              <span>{t.dailySteps}</span>
            </div>
            <p className="font-mono font-black text-2xl text-white">
              {(smartwatch.status === 'connected' ? (smartwatch.stepsToday || 0) : 0).toLocaleString()}
            </p>
            <span className={`text-[10px] font-bold ${smartwatch.status === 'connected' ? 'text-amber-400' : 'text-neutral-500'}`}>
              {smartwatch.status === 'connected' ? 'Meta: 10,000' : 'Reloj apagado'}
            </span>
          </div>
        </div>

        {/* Live Pulse Visualizer Wave */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-neutral-400">
            <span>Electro-Telemetría Cardíaca en Tiempo Real</span>
            <span className={`font-mono ${smartwatch.status === 'connected' ? 'text-cyan-400' : 'text-neutral-500'}`}>
              {smartwatch.status === 'connected' ? 'Frecuencia Activa' : 'Sensor Inactivo'}
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-16 w-full">
            {liveTelemetryHistory.map((val, idx) => {
              const heightPercent = smartwatch.status === 'connected' && val > 0 
                ? Math.min(100, Math.max(20, Math.round(((val - 80) / 110) * 100)))
                : 8;
              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-t-md transition-all duration-300 ${
                    smartwatch.status === 'connected' && val > 0
                      ? 'bg-gradient-to-t from-cyan-600 to-blue-400 shadow-sm shadow-cyan-500/20'
                      : 'bg-neutral-800/40'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Sleep Tracker Card Integration */}
        <div className="pt-2">
          <SleepTrackerCard
            smartwatch={smartwatch}
            lang={lang}
            onSyncRequest={() => handleSyncHealthPlatform(selectedBrand)}
          />
        </div>

        {/* Active Calories Configuration Card */}
        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Modo de Medición de Calorías Quemadas
              </h4>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                smartwatch.calorieSyncMode !== 'manual' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {smartwatch.calorieSyncMode !== 'manual' ? '⌚ RELOJ INTELIGENTE' : 'MANUAL / ESTIMADO'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {smartwatch.calorieSyncMode !== 'manual' 
                ? 'Las Kcal quemadas en tus resúmenes diarios y nutrición se calculan directamente con los sensores de tu Apple Watch o WearOS.'
                : 'Las Kcal se calculan con fórmulas matemáticas estimadas basadas en la duración y volumen de tus rutinas.'}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleCalorieMode}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              smartwatch.calorieSyncMode !== 'manual'
                ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40'
                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
            }`}
          >
            {smartwatch.calorieSyncMode !== 'manual' ? 'Cambiar a Modo Manual' : 'Usar Kcal del Reloj'}
          </button>
        </div>

        {/* Device Brand Switcher */}
        <div className="pt-4 border-t border-neutral-800">
          <label className="text-xs font-bold text-neutral-300 block mb-2">
            Selecciona tu dispositivo para vincular con 1 toque:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBrand(b.id);
                  handleSyncHealthPlatform(b.id);
                }}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedBrand === b.id
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md'
                    : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-300 hover:text-white hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{b.label}</span>
                  {selectedBrand === b.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <span className="text-[10px] text-neutral-400 block mt-0.5">{b.platform}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
