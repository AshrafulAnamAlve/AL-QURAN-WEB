import { IconName } from '../shared/components/icon/icon-registry';

export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly labelBn: string;
  readonly icon: IconName;
  /** Shown in the mobile bottom bar (space for five, including "More"). */
  readonly primary?: boolean;
}

/**
 * The single navigation definition, shared by the desktop header, the mobile
 * drawer and the bottom bar. Adding a section here puts it in all three.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Home', labelBn: 'হোম', icon: 'home', primary: true },
  { path: '/quran', label: 'Quran', labelBn: 'কুরআন', icon: 'book', primary: true },
  { path: '/juz', label: 'Juz', labelBn: 'পারা', icon: 'layers' },
  { path: '/99-names', label: '99 Names', labelBn: '৯৯ নাম', icon: 'sparkles' },
  { path: '/tasbih', label: 'Tasbih', labelBn: 'তসবিহ', icon: 'tasbih' },
  { path: '/calendar', label: 'Calendar', labelBn: 'ক্যালেন্ডার', icon: 'calendar' },
  { path: '/prayer', label: 'Prayer', labelBn: 'নামাজ', icon: 'clock', primary: true },
  { path: '/mosques', label: 'Mosques', labelBn: 'মসজিদ', icon: 'mosque' },
  { path: '/bookmarks', label: 'Bookmarks', labelBn: 'বুকমার্ক', icon: 'bookmark', primary: true },
  { path: '/settings', label: 'Settings', labelBn: 'সেটিংস', icon: 'settings' },
];

/** Items that do not appear in the bottom bar, reached through "More". */
export const SECONDARY_NAV_ITEMS = NAV_ITEMS.filter((item) => !item.primary);

export const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((item) => item.primary);
