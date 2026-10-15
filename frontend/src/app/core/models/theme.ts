/** What the user picked in Settings. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** What is actually painted right now, after resolving 'system'. */
export type ResolvedTheme = 'light' | 'dark';

export const THEME_PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];

/** Browser chrome colour per theme; kept in step with index.html. */
export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#0f5132',
  dark: '#0f1513',
};
