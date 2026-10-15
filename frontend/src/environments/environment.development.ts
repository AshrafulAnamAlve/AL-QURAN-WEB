/**
 * Local development settings.
 *
 * '/api' works because `ng serve` proxies it to http://localhost:5050 - see
 * proxy.conf.json. That keeps the browser on a single origin, so CORS never
 * gets in the way while you are developing.
 */
export const environment = {
  production: false,

  apiBaseUrl: '/api',

  appName: 'Al-Quran (dev)',
  appUrl: 'http://localhost:4200',

  audioCdnBaseUrl: 'https://cdn.islamic.network/quran/audio',

  mapTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapAttribution: '&copy; OpenStreetMap contributors',

  searchDebounceMs: 350,
  httpCacheTtlMs: 60 * 1000,
} as const;

export type Environment = typeof environment;
