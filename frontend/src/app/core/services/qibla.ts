import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CompassSensorState,
  KAABA_COORDINATES,
  QiblaCalculationResult,
} from '../models/qibla';
import { SettingsService } from './settings';
import { MobileHardwareService } from './mobile-hardware.service';

const EARTH_RADIUS_KM = 6371.0;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates Great-Circle Qibla bearing from True North (0° - 360°).
 */
export function calculateQiblaBearing(userLat: number, userLng: number): number {
  const phi1 = toRadians(userLat);
  const phi2 = toRadians(KAABA_COORDINATES.latitude);
  const deltaLambda = toRadians(KAABA_COORDINATES.longitude - userLng);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Calculates Haversine distance in kilometers from user location to Kaaba.
 */
export function calculateKaabaDistance(userLat: number, userLng: number): number {
  const phi1 = toRadians(userLat);
  const phi2 = toRadians(KAABA_COORDINATES.latitude);
  const deltaPhi = toRadians(KAABA_COORDINATES.latitude - userLat);
  const deltaLambda = toRadians(KAABA_COORDINATES.longitude - userLng);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_KM * c);
}

const CARDINALS: readonly {
  key: string;
  bn: string;
  en: string;
}[] = [
  { key: 'N', bn: 'উত্তর', en: 'North' },
  { key: 'NNE', bn: 'উত্তর-উত্তর-পূর্ব', en: 'North-Northeast' },
  { key: 'NE', bn: 'উত্তর-পূর্ব', en: 'Northeast' },
  { key: 'ENE', bn: 'পূর্ব-উত্তর-পূর্ব', en: 'East-Northeast' },
  { key: 'E', bn: 'পূর্ব', en: 'East' },
  { key: 'ESE', bn: 'পূর্ব-দক্ষিণ-পূর্ব', en: 'East-Southeast' },
  { key: 'SE', bn: 'দক্ষিণ-পূর্ব', en: 'Southeast' },
  { key: 'SSE', bn: 'দক্ষিণ-দক্ষিণ-পূর্ব', en: 'South-Southeast' },
  { key: 'S', bn: 'দক্ষিণ', en: 'South' },
  { key: 'SSW', bn: 'দক্ষিণ-দক্ষিণ-পশ্চিম', en: 'South-Southwest' },
  { key: 'SW', bn: 'দক্ষিণ-পশ্চিম', en: 'Southwest' },
  { key: 'WSW', bn: 'পশ্চিম-দক্ষিণ-পশ্চিম', en: 'West-Southwest' },
  { key: 'W', bn: 'পশ্চিম', en: 'West' },
  { key: 'WNW', bn: 'পশ্চিম-উত্তর-পশ্চিম', en: 'West-Northwest' },
  { key: 'NW', bn: 'উত্তর-পশ্চিম', en: 'Northwest' },
  { key: 'NNW', bn: 'উত্তর-উত্তর-পশ্চিম', en: 'North-Northwest' },
];

export function getCardinalDirection(bearing: number): {
  key: string;
  bn: string;
  en: string;
} {
  const normalized = (bearing % 360 + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return CARDINALS[index];
}

export interface TurnGuidance {
  status: 'aligned' | 'turn-left' | 'turn-right';
  diffDegrees: number;
  textBn: string;
  textEn: string;
}

@Injectable({ providedIn: 'root' })
export class QiblaService {
  private readonly settings = inject(SettingsService);
  private readonly mobileHardware = inject(MobileHardwareService);

  /** Reactive Qibla calculation based on active user location in Settings */
  readonly qiblaData = computed<QiblaCalculationResult>(() => {
    const loc = this.settings.location();
    const bearing = calculateQiblaBearing(loc.latitude, loc.longitude);
    const distanceKm = calculateKaabaDistance(loc.latitude, loc.longitude);
    const cardinal = getCardinalDirection(bearing);

    return {
      bearing: Math.round(bearing * 10) / 10,
      distanceKm,
      cardinalKey: cardinal.key,
      cardinalBn: cardinal.bn,
      cardinalEn: cardinal.en,
    };
  });

  /** Current device magnetic/true compass heading (0° - 360°) */
  readonly deviceHeading = signal<number>(0);

  /** Accuracy in degrees reported by device sensor */
  readonly accuracy = signal<number | null>(null);

  /** Sensor lifecycle / permission state */
  readonly sensorState = signal<CompassSensorState>('unsupported');

  /** Whether navigator.vibrate is supported by this browser/OS */
  readonly vibrationSupported =
    typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

  /** User preference toggles for feedback */
  readonly vibrationEnabled = signal<boolean>(true);
  readonly soundEnabled = signal<boolean>(true);
  readonly userActivated = signal<boolean>(false);

  /** The cardinal direction corresponding to what the device is currently pointing at */
  readonly currentFacingCardinal = computed(() => {
    return getCardinalDirection(this.deviceHeading());
  });

  /** Whether the user is holding the device oriented towards the Kaaba (±3.5°) */
  readonly isAligned = computed<boolean>(() => {
    if (this.sensorState() !== 'active') return false;
    const diff = Math.abs(this.relativeAngle());
    return diff <= 3.5 || diff >= 356.5;
  });

  /** Angle difference: how many degrees to rotate clockwise/counterclockwise to face Kaaba */
  readonly relativeAngle = computed<number>(() => {
    const qibla = this.qiblaData().bearing;
    const heading = this.deviceHeading();
    return (qibla - heading + 360) % 360;
  });

  /** Detailed turn guidance informing user which way to turn and how many degrees */
  readonly turnGuidance = computed<TurnGuidance>(() => {
    if (this.sensorState() !== 'active') {
      return {
        status: 'aligned',
        diffDegrees: 0,
        textBn: 'কম্পাস সক্রিয় নয় (ম্যাপ ভিউ দেখুন)',
        textEn: 'Compass sensor inactive (use Map View)',
      };
    }

    const qibla = this.qiblaData().bearing;
    const heading = this.deviceHeading();
    let diff = (qibla - heading + 360) % 360;
    if (diff > 180) diff -= 360;

    const absDiff = Math.abs(diff);
    const rounded = Math.round(absDiff);

    if (absDiff <= 3.5) {
      return {
        status: 'aligned',
        diffDegrees: 0,
        textBn: 'আলহামদুলিল্লাহ! আপনি সরাসরি কিবলামুখী হয়েছেন',
        textEn: 'Alhamdulillah! Facing the Holy Kaaba',
      };
    } else if (diff < 0) {
      return {
        status: 'turn-left',
        diffDegrees: rounded,
        textBn: `${rounded}° বামে ঘুরুন`,
        textEn: `Turn ${rounded}° Left`,
      };
    } else {
      return {
        status: 'turn-right',
        diffDegrees: rounded,
        textBn: `${rounded}° ডানে ঘুরুন`,
        textEn: `Turn ${rounded}° Right`,
      };
    }
  });

  private lastFeedbackTime = 0;
  private wasAligned = false;
  private orientationListener: ((e: DeviceOrientationEvent) => void) | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.checkSensorSupport();
  }

  private checkSensorSupport(): void {
    if (typeof window === 'undefined') {
      this.sensorState.set('unsupported');
      return;
    }

    if (!('DeviceOrientationEvent' in window)) {
      this.sensorState.set('unsupported');
      return;
    }

    const deviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    // iOS 13+ requires explicit permission requested on a user interaction
    if (typeof deviceOrientation.requestPermission === 'function') {
      this.sensorState.set('prompt');
    } else {
      // Android and standard Web APIs: ready to start
      this.startListening();
    }
  }

  /**
   * Request motion/orientation permission (primarily required on iOS Safari)
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const deviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof deviceOrientation.requestPermission === 'function') {
      try {
        const response = await deviceOrientation.requestPermission();
        if (response === 'granted') {
          this.sensorState.set('granted');
          this.startListening();
          return true;
        } else {
          this.sensorState.set('denied');
          return false;
        }
      } catch (err) {
        console.error('Qibla orientation permission error:', err);
        this.sensorState.set('error');
        return false;
      }
    }

    this.startListening();
    return true;
  }

  startListening(): void {
    if (typeof window === 'undefined' || this.orientationListener) return;

    this.orientationListener = (event: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // iOS WebKit compass heading (0° is True/Magnetic North)
      const webkitHeading = (event as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      const webkitAccuracy = (event as unknown as { webkitCompassAccuracy?: number }).webkitCompassAccuracy;

      if (typeof webkitHeading === 'number' && !isNaN(webkitHeading)) {
        heading = webkitHeading;
        if (typeof webkitAccuracy === 'number') {
          this.accuracy.set(webkitAccuracy);
        }
      } else if (event.alpha !== null && typeof event.alpha === 'number') {
        // Android DeviceOrientationEvent
        if (event.absolute) {
          heading = (360 - event.alpha) % 360;
        } else {
          heading = (360 - event.alpha) % 360;
        }
      }

      if (heading !== null && !isNaN(heading)) {
        this.sensorState.set('active');
        this.deviceHeading.set(Math.round(heading * 10) / 10);
        this.triggerHapticIfAligned();
      }
    };

    window.addEventListener('deviceorientation', this.orientationListener, true);
    // Extra listener for absolute orientation on supported Chrome mobile
    window.addEventListener('deviceorientationabsolute' as any, this.orientationListener as any, true);
  }

  stopListening(): void {
    if (typeof window !== 'undefined' && this.orientationListener) {
      window.removeEventListener('deviceorientation', this.orientationListener, true);
      window.removeEventListener('deviceorientationabsolute' as any, this.orientationListener as any, true);
      this.orientationListener = null;
    }
  }

  /**
   * Directly test and warm up vibration & audio on user gesture
   */
  testHaptic(): boolean {
    this.userActivated.set(true);
    let didVibrate = false;

    if (this.vibrationEnabled()) {
      this.mobileHardware.hapticKaabaLock();
      didVibrate = true;
    }

    if (this.soundEnabled()) {
      this.playAlignmentChime();
    }

    return didVibrate;
  }

  toggleVibration(): void {
    this.vibrationEnabled.update((v) => !v);
  }

  toggleSound(): void {
    this.soundEnabled.update((s) => !s);
  }

  /**
   * Synthesize a subtle spiritual chime using Web Audio API (cross-platform, works on iOS too)
   */
  playAlignmentChime(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Ignore
    }
  }

  private triggerHapticIfAligned(): void {
    const alignedNow = this.isAligned();

    // Trigger feedback when entering aligned state or every 2.5s while staying aligned
    const now = Date.now();
    if (alignedNow) {
      const shouldTrigger = !this.wasAligned || now - this.lastFeedbackTime > 2500;
      if (shouldTrigger) {
        this.lastFeedbackTime = now;

        // 1. Vibration & Haptics
        if (this.vibrationEnabled()) {
          this.mobileHardware.hapticKaabaLock();
        }

        // 2. Chime (works on iPhone/iOS too)
        if (this.soundEnabled()) {
          this.playAlignmentChime();
        }
      }
    }

    this.wasAligned = alignedNow;
  }
}
