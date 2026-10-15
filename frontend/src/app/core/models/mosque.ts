/**
 * Models for nearby mosques from OpenStreetMap via Overpass API.
 */

export interface Mosque {
  id: string;
  name: string;
  hasName: boolean;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address: string | null;
  denomination: string | null;
  website: string | null;
  phone: string | null;
  osmType: string;
  osmId: number;
  mapUrl: string;
  directionsUrl: string;
}

export interface MosqueSearchResult {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  mosques: Mosque[];
  source: string;
  attribution: string;
  notice: string;
}
