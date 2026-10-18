import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NativeHealthMetrics {
  heartRate?: number;
  calories?: number;
  steps?: number;
  distanceMeters?: number;
}

export class NativeHealthService {
  /**
   * Check if running inside iOS or Android native wrapper
   */
  public static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Platform name: 'ios' | 'android' | 'web'
   */
  public static getPlatform(): 'ios' | 'android' | 'web' {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  }

  /**
   * Haptic vibration feedback for sets, button presses, and alarms
   */
  public static async triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
    if (!this.isNative()) return;
    try {
      if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'medium') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (type === 'heavy') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'warning') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (type === 'error') {
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (e) {
      // Haptics unavailable on simulator
    }
  }

  /**
   * Schedule a local notification when rest countdown finishes
   */
  public static async scheduleRestTimerAlert(seconds: number, exerciseName: string = 'Siguiente serie') {
    if (!this.isNative()) return;
    try {
      const hasPermission = await LocalNotifications.checkPermissions();
      if (hasPermission.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1001,
            title: '¡Descanso terminado!',
            body: `Es hora de tu serie de ${exerciseName}. ¡A por ello!`,
            schedule: { at: new Date(Date.now() + seconds * 1000) },
            sound: 'beep.wav',
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (e) {
      console.warn('Local notification schedule notice:', e);
    }
  }

  /**
   * Cancel pending rest timer notifications
   */
  public static async cancelRestTimerAlert() {
    if (!this.isNative()) return;
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
    } catch {}
  }
}
