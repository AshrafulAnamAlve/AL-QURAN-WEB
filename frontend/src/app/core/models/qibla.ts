export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/** Exact coordinates of the Holy Kaaba in Makkah al-Mukarramah */
export const KAABA_COORDINATES: GeoCoordinates = {
  latitude: 21.422487,
  longitude: 39.826206,
};

export interface QiblaCalculationResult {
  /** Degrees clockwise from True North (0° - 360°) */
  bearing: number;
  /** Distance in kilometers from current location to Kaaba */
  distanceKm: number;
  /** Cardinal direction abbreviation (e.g., 'WNW', 'E', 'SW') */
  cardinalKey: string;
  /** Bengali cardinal direction name */
  cardinalBn: string;
  /** English cardinal direction name */
  cardinalEn: string;
}

export type CompassSensorState =
  | 'unsupported'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'active'
  | 'error';

export interface QiblaCompassState {
  /** Current device magnetic/true heading in degrees (0 - 360) */
  deviceHeading: number;
  /** Angle difference between current heading and Qibla (-180 to +180 or 0 to 360) */
  qiblaRelativeAngle: number;
  /** Whether the user is currently facing the Kaaba within tolerance (e.g. ±3°) */
  isAligned: boolean;
  /** Sensor availability and permission status */
  sensorState: CompassSensorState;
  /** Heading accuracy in degrees if provided by device */
  accuracy: number | null;
}
