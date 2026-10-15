/**
 * Production settings.
 *
 * There are deliberately NO secrets here. Everything in this file ships to the
 * browser and is readable by anyone. Keys, if a provider ever needs one, belong
 * in the ASP.NET Core backend configuration instead.
 */
export const environment = {
  production: true,

  /**
   * Where the ASP.NET Core API lives.
   *
   * '/api' assumes the frontend is served from the same origin as the backend
   * (a reverse proxy, or the API serving the built Angular files). If you deploy
   * them to separate hosts, change this to the full URL, e.g.
   * 'https://alquran-api.example.com/api', and add that frontend origin to
   * Cors:AllowedOrigins in the backend appsettings.json.
   */
  apiBaseUrl: '/api',

  appName: 'Al-Quran',
  appUrl: 'https://alquran.example.com',

  /**
   * Recitation audio is streamed straight from the public CDN to the browser.
   * Routing tens of megabytes of MP3 through our own server would be slower and
   * pointless - there is no key to protect.
   */
  audioCdnBaseUrl: 'https://cdn.islamic.network/quran/audio',

  /** OpenStreetMap raster tiles for the mosque map (free, attribution required). */
  mapTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapAttribution: '&copy; OpenStreetMap contributors',

  /** Milliseconds to wait after typing stops before firing a search request. */
  searchDebounceMs: 350,

  /** How long HTTP GET responses are reused from the in-memory client cache. */
  httpCacheTtlMs: 5 * 60 * 1000,
} as const;

export type Environment = typeof environment;
