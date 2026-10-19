import { Capacitor } from '@capacitor/core';
import { SmartwatchDevice, SleepStages } from '../types';
import { FitStorage } from './storage';
import { sound } from './soundFx';

/**
 * Health & Smartwatch Integration Service for Apple Watch (HealthKit) and Android Wear (Google Health Connect)
 */
export class HealthIntegrationService {
  /**
   * Request native platform permissions for HealthKit (iOS) or Health Connect (Android)
   */
  public static async requestPermissions(brand: SmartwatchDevice['brand']): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        // Native Health Connect / HealthKit check via plugin if available
        const { CapacitorHealthData } = await import('@felix-health/capacitor-health-data');
        if (CapacitorHealthData) {
          const avail = await CapacitorHealthData.isAvailable();
          if (avail.available) {
            await CapacitorHealthData.requestAuthorization();
            return true;
          }
        }
      } catch (err) {
        console.warn('Native Health plugin authorization notice:', err);
      }
    }
    return true;
  }

  /**
   * Generates realistic physiological sleep stages and recovery metrics
   * based on duration, resting heart rate, and HRV
   */
  public static calculateSleepMetrics(
    totalMinutes: number,
    restingHr: number = 56,
    hrvMs: number = 62
  ): {
    sleepScore: number;
    stages: SleepStages;
    recoveryScore: number;
    recoveryXpMultiplier: number;
  } {
    const deepMinutes = Math.round(totalMinutes * 0.23); // ~23% deep sleep
    const remMinutes = Math.round(totalMinutes * 0.22);  // ~22% REM sleep
    const awakeMinutes = Math.min(45, Math.max(15, Math.round(totalMinutes * 0.08)));
    const lightMinutes = Math.max(0, totalMinutes - deepMinutes - remMinutes - awakeMinutes);

    // Sleep Score based on 8-hour target (480 mins) and deep/REM percentages
    const durationScore = Math.min(50, (totalMinutes / 480) * 50);
    const qualityScore = Math.min(50, ((deepMinutes + remMinutes) / (totalMinutes * 0.45)) * 50);
    const sleepScore = Math.min(100, Math.max(30, Math.round(durationScore + qualityScore)));

    // Recovery Score incorporates HRV and low resting HR
    const hrvBonus = Math.min(25, (hrvMs / 70) * 25);
    const hrEfficiency = Math.min(25, Math.max(5, (75 - restingHr) * 1.2));
    const recoveryScore = Math.min(100, Math.max(40, Math.round((sleepScore * 0.5) + hrvBonus + hrEfficiency)));

    // XP multiplier based on physical recovery
    let recoveryXpMultiplier = 1.0;
    if (recoveryScore >= 90) recoveryXpMultiplier = 1.20; // +20% XP
    else if (recoveryScore >= 80) recoveryXpMultiplier = 1.15; // +15% XP
    else if (recoveryScore >= 70) recoveryXpMultiplier = 1.10; // +10% XP
    else if (recoveryScore >= 60) recoveryXpMultiplier = 1.05; // +5% XP

    return {
      sleepScore,
      stages: {
        deepMinutes,
        remMinutes,
        lightMinutes,
        awakeMinutes,
      },
      recoveryScore,
      recoveryXpMultiplier,
    };
  }

  /**
   * Performs real-time or background telemetry sync with connected Apple Watch or Android Wear
   */
  public static async syncDeviceTelemetry(
    currentDevice: SmartwatchDevice,
    brand?: SmartwatchDevice['brand']
  ): Promise<SmartwatchDevice> {
    const activeBrand = brand || currentDevice.brand || 'Apple Watch';
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();

    let syncSource: SmartwatchDevice['syncSource'] = 'simulated';
    if (isNative) {
      syncSource = platform === 'ios' ? 'healthkit' : 'health_connect';
    } else if (currentDevice.brand === 'WebBluetooth') {
      syncSource = 'bluetooth';
    }

    // Default values if no sensor data is present
    let stepsToday = currentDevice.stepsToday || 0;
    let activeCaloriesToday = currentDevice.activeCaloriesToday || 0;
    let restingHeartRate = currentDevice.restingHeartRate || 0;
    let liveHeartRate = currentDevice.liveHeartRate || 0;
    let hrvMs = currentDevice.hrvMs || 0;
    let sleepTotalMinutes = currentDevice.sleepTotalMinutes || 0;

    // In Native environment (iOS / Android), attempt to read actual native platform metrics
    if (isNative) {
      try {
        const { CapacitorHealthData } = await import('@felix-health/capacitor-health-data');
        if (CapacitorHealthData) {
          const startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();

          // Try querying steps
          try {
            const stepsRes = await CapacitorHealthData.queryAggregate({
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              dataType: 'steps',
            });
            if (stepsRes && typeof stepsRes.value === 'number') {
              stepsToday = Math.round(stepsRes.value);
            }
          } catch (stepErr) {
            console.warn('Native steps query notice:', stepErr);
          }

          // Try querying active calories
          try {
            const calRes = await CapacitorHealthData.queryAggregate({
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              dataType: 'calories',
            });
            if (calRes && typeof calRes.value === 'number') {
              activeCaloriesToday = Math.round(calRes.value);
            }
          } catch (calErr) {
            console.warn('Native calories query notice:', calErr);
          }

          // Try querying heart rate
          try {
            const hrRes = await CapacitorHealthData.queryAggregate({
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              dataType: 'heart_rate',
            });
            if (hrRes && typeof hrRes.value === 'number') {
              restingHeartRate = Math.round(hrRes.value);
            }
          } catch (hrErr) {
            console.warn('Native heart rate query notice:', hrErr);
          }
        }
      } catch (nativeErr) {
        console.warn('Native health data access warning:', nativeErr);
      }
    }

    // Sleep metrics (only calculated if actual sleep minutes exist)
    const sleepMetrics = sleepTotalMinutes > 0
      ? this.calculateSleepMetrics(sleepTotalMinutes, restingHeartRate || 60, hrvMs || 55)
      : {
          sleepScore: 0,
          stages: { deepMinutes: 0, remMinutes: 0, lightMinutes: 0, awakeMinutes: 0 },
          recoveryScore: 0,
          recoveryXpMultiplier: 1.0,
        };

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedDevice: SmartwatchDevice = {
      ...currentDevice,
      name: currentDevice.name.includes('Simulación') 
        ? `${activeBrand} (Conectado)` 
        : currentDevice.name || `${activeBrand}`,
      brand: activeBrand,
      status: 'connected',
      batteryLevel: currentDevice.batteryLevel || 100,
      liveHeartRate,
      restingHeartRate,
      hrvMs,
      activeZone: liveHeartRate >= 150 ? 'Cardio' : (liveHeartRate >= 120 ? 'FatBurn' : 'Rest'),
      stepsToday,
      stepsTarget: currentDevice.stepsTarget || 10000,
      activeCaloriesToday,
      calorieSyncMode: currentDevice.calorieSyncMode || 'smartwatch',
      vo2max: currentDevice.vo2max || 0,
      lastSyncTime: `Hoy a las ${nowStr}`,
      sleepTotalMinutes,
      sleepTargetMinutes: 480,
      sleepScore: sleepMetrics.sleepScore,
      sleepStages: sleepMetrics.stages,
      recoveryScore: sleepMetrics.recoveryScore,
      recoveryXpMultiplier: sleepMetrics.recoveryXpMultiplier,
      syncSource,
    };

    // Persist to storage
    FitStorage.saveSmartwatch(updatedDevice);

    // Dispatch global event for instantaneous reactive UI updates across all tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fitquest_smartwatch_updated', { detail: updatedDevice }));
    }

    return updatedDevice;
  }
}
