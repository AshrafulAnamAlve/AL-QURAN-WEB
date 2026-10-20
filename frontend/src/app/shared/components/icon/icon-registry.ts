/**
 * Inline SVG icon set.
 *
 * Icons are shipped as path data rather than as an icon font or an external
 * sprite so that they inherit `currentColor`, need no extra network request,
 * and stay crisp at any size. Every icon is drawn on a 24x24 grid.
 *
 * Circles are expressed as arc paths so a single <path> element can render any
 * icon - that keeps the template trivial and avoids innerHTML entirely.
 */
export interface IconDefinition {
  /** One or more `d` attributes rendered as stroked paths. */
  readonly paths: readonly string[];
  /** Filled shapes (play, pause) rather than stroked outlines. */
  readonly filled?: boolean;
}

const ICON_DEFINITIONS = {
  home: {
    paths: ['M3 10.6 12 3l9 7.6', 'M5.4 9.4V21h13.2V9.4', 'M9.6 21v-6.2h4.8V21'],
  },
  book: {
    paths: ['M4 4.8A2.8 2.8 0 0 1 6.8 2H20v20H6.8A2.8 2.8 0 0 1 4 19.2Z', 'M4 19.2A2.8 2.8 0 0 1 6.8 16.4H20'],
  },
  bookOpen: {
    paths: ['M12 6.6S9.5 4.1 4 4.1v13.8c5.5 0 8 2.5 8 2.5s2.5-2.5 8-2.5V4.1c-5.5 0-8 2.5-8 2.5Z', 'M12 6.6v13.8'],
  },
  layers: {
    paths: ['M12 2.5 2.6 7.2 12 11.9l9.4-4.7L12 2.5Z', 'm2.6 16.8 9.4 4.7 9.4-4.7', 'm2.6 12 9.4 4.7 9.4-4.7'],
  },
  calendar: {
    paths: ['M8 2.5v3.4', 'M16 2.5v3.4', 'M3.6 6.4h16.8v15H3.6z', 'M3.6 10.8h16.8'],
  },
  clock: {
    paths: ['M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0', 'M12 7.2V12l3.2 2'],
  },
  mapPin: {
    paths: ['M20 10.2c0 6-8 11.8-8 11.8s-8-5.8-8-11.8a8 8 0 1 1 16 0Z', 'M15 10.2a3 3 0 1 1-6 0 3 3 0 1 1 6 0'],
  },
  bookmark: {
    paths: ['M6.4 3h11.2a1 1 0 0 1 1 1v17l-6.6-3.8L5.4 21V4a1 1 0 0 1 1-1Z'],
  },
  settings: {
    paths: [
      'M15 12a3 3 0 1 1-6 0 3 3 0 1 1 6 0',
      'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10.09 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
    ],
  },
  search: {
    paths: ['M18 11a7 7 0 1 1-14 0 7 7 0 1 1 14 0', 'm20.4 20.4-4.4-4.4'],
  },
  menu: {
    paths: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  },
  close: {
    paths: ['m6 6 12 12', 'm18 6-12 12'],
  },
  sun: {
    paths: [
      'M16 12a4 4 0 1 1-8 0 4 4 0 1 1 8 0',
      'M12 2.4v2.2', 'M12 19.4v2.2', 'M4.6 4.6l1.6 1.6', 'M17.8 17.8l1.6 1.6',
      'M2.4 12h2.2', 'M19.4 12h2.2', 'M4.6 19.4l1.6-1.6', 'M17.8 6.2l1.6-1.6',
    ],
  },
  moon: {
    paths: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z'],
  },
  monitor: {
    paths: ['M3.4 4.8h17.2v11.4H3.4z', 'M9 20.4h6', 'M12 16.2v4.2'],
  },
  play: {
    paths: ['M8.4 5.2v13.6L19 12 8.4 5.2Z'],
    filled: true,
  },
  pause: {
    paths: ['M8.6 4.8h3v14.4h-3z', 'M12.4 4.8h3v14.4h-3z'],
    filled: true,
  },
  skipBack: {
    paths: ['M18.6 5.2v13.6L8 12l10.6-6.8Z', 'M5.4 4.8h2.4v14.4H5.4z'],
    filled: true,
  },
  skipForward: {
    paths: ['M5.4 5.2v13.6L16 12 5.4 5.2Z', 'M16.2 4.8h2.4v14.4h-2.4z'],
    filled: true,
  },
  repeat: {
    paths: [
      'm16.6 2.6 3.4 3.4-3.4 3.4',
      'M3.6 12.4v-2.4a4 4 0 0 1 4-4h12.4',
      'm7.4 21.4-3.4-3.4 3.4-3.4',
      'M20.4 11.6v2.4a4 4 0 0 1-4 4H4',
    ],
  },
  volumeOff: {
    paths: ['M11 5.2 6.6 9.2H3.4v5.6h3.2L11 18.8V5.2Z', 'm15.6 9.6 5 4.8', 'm20.6 9.6-5 4.8'],
  },
  chevronUp: { paths: ['m5 14.8 7-7 7 7'] },
  gauge: {
    paths: ['M20.8 17.6a10 10 0 1 0-17.6 0', 'm12 12.8 4.6-4.2', 'M12 3.4v1.8'],
  },
  share: {
    paths: [
      'M21 5a3 3 0 1 1-6 0 3 3 0 1 1 6 0',
      'M9 12a3 3 0 1 1-6 0 3 3 0 1 1 6 0',
      'M21 19a3 3 0 1 1-6 0 3 3 0 1 1 6 0',
      'm8.6 13.5 6.8 4', 'm15.4 6.5-6.8 4',
    ],
  },
  copy: {
    paths: ['M9.2 8.6h10.2a1 1 0 0 1 1 1v10.2a1 1 0 0 1-1 1H9.2a1 1 0 0 1-1-1V9.6a1 1 0 0 1 1-1Z', 'M5.4 15.4H4.6a1 1 0 0 1-1-1V4.2a1 1 0 0 1 1-1h10.2a1 1 0 0 1 1 1v.8'],
  },
  chevronRight: { paths: ['m9.2 5 7 7-7 7'] },
  chevronLeft: { paths: ['m14.8 5-7 7 7 7'] },
  chevronDown: { paths: ['m5 9.2 7 7 7-7'] },
  refresh: {
    paths: ['M20.6 12a8.6 8.6 0 1 1-2.5-6.1', 'M20.6 3.4v6h-6'],
  },
  alert: {
    paths: ['M12 3.2 2.6 20.4h18.8L12 3.2Z', 'M12 9.4v4.8', 'M12 17.4h.01'],
  },
  wifiOff: {
    paths: ['m2.4 2.4 19.2 19.2', 'M8.6 16.2a5 5 0 0 1 6.8 0', 'M5.2 12.6a10 10 0 0 1 3.4-2.2', 'M15.4 10.4a10 10 0 0 1 3.4 2.2', 'M2.4 9a15 15 0 0 1 4.6-2.9', 'M17 6.1A15 15 0 0 1 21.6 9', 'M12 19.8h.01'],
  },
  inbox: {
    paths: ['M3.4 13.2h5l1.6 3h4l1.6-3h5', 'M5.6 4.8h12.8l2.2 8.4v6H3.4v-6z'],
  },
  check: { paths: ['m5 12.8 4.4 4.4 9.6-10.6'] },
  externalLink: {
    paths: ['M14.8 3.4h5.8v5.8', 'm10 14 10.6-10.6', 'M19.4 13.4v6.2a1 1 0 0 1-1 1H4.6a1 1 0 0 1-1-1V5.4a1 1 0 0 1 1-1h6.2'],
  },
  volume: {
    paths: ['M11 5.2 6.6 9.2H3.4v5.6h3.2L11 18.8V5.2Z', 'M15.4 8.6a5 5 0 0 1 0 6.8'],
  },
  info: {
    paths: ['M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0', 'M12 11v5.6', 'M12 7.6h.01'],
  },
  crosshair: {
    paths: ['M20 12a8 8 0 1 1-16 0 8 8 0 1 1 16 0', 'M14.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0', 'M12 2.4v2.6', 'M12 19v2.6', 'M2.4 12H5', 'M19 12h2.6'],
  },
  star: {
    paths: ['m12 3.2 2.5 6.1 6.6.5-5 4.3 1.6 6.4L12 17.1l-5.7 3.4L7.9 14l-5-4.3 6.6-.5L12 3.2Z'],
  },
  trash: {
    paths: ['M4.4 6.8h15.2', 'M9.4 6.8V4.6h5.2v2.2', 'm6.6 6.8 1 13.6h8.8l1-13.6'],
  },
  headphones: {
    paths: ['M4 15.4v-3a8 8 0 0 1 16 0v3', 'M4 15.4h3.2v5.2H5.6A1.6 1.6 0 0 1 4 19v-3.6Z', 'M20 15.4h-3.2v5.2h1.6A1.6 1.6 0 0 0 20 19v-3.6Z'],
  },
  mosque: {
    paths: ['M12 2.6c2.6 2 3.8 3.6 3.8 5.2 0 1.4-1.2 2.4-3.8 2.4S8.2 9.2 8.2 7.8c0-1.6 1.2-3.2 3.8-5.2Z', 'M5.4 21.4V12a3 3 0 0 1 3-3h7.2a3 3 0 0 1 3 3v9.4', 'M2.6 21.4h18.8', 'M10 21.4v-4a2 2 0 0 1 4 0v4'],
  },
  download: {
    paths: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  },
  upload: {
    paths: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5', 'M12 3v12'],
  },
  bell: {
    paths: ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
  },
  sliders: {
    paths: ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
  },
  volume2: {
    paths: ['M11 5L6 9H2v6h4l5 4V5z', 'M19.07 4.93a10 10 0 0 1 0 14.14', 'M15.54 8.46a5 5 0 0 1 0 7.07'],
  },
  sparkles: {
    paths: [
      'M12 2l2.4 6.9 6.9 2.4-6.9 2.4L12 20.6l-2.4-6.9L2.7 11.3l6.9-2.4L12 2Z',
      'M19 2l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1L19 2z',
    ],
  },
  tasbih: {
    paths: [
      'M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M17 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M20 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M21 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M19 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M15 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M9 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M3 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M4 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M7 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    ],
  },
  shield: {
    paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  },
} as const;

/** Every icon name, as a literal union - misspellings fail at compile time. */
export type IconName = keyof typeof ICON_DEFINITIONS;

/**
 * The registry, with values widened to IconDefinition. `as const` above keeps
 * the *keys* literal for IconName; this widening keeps optional members like
 * `filled` visible on every entry.
 */
export const ICONS: Readonly<Record<IconName, IconDefinition>> = ICON_DEFINITIONS;
