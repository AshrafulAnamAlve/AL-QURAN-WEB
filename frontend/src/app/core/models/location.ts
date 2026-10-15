/** A place returned by the geocoding service. */
export interface Place {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  countryCode?: string | null;
}

/** The active location used to compute prayer times. */
export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string | null;
  country?: string | null;
  displayName: string;
  source: 'geolocation' | 'manual' | 'default';
}

/** Round coordinates to avoid storing or sending hyper-precise GPS locations. */
export function roundCoordinate(coord: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(coord * factor) / factor;
}
