import { PrayerTime } from './prayer';

export type CorePrayerAlertKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type AdhanVoiceId =
  | 'makkah'
  | 'madinah'
  | 'alaqsa'
  | 'egypt'
  | 'mishary'
  | 'nafees';

export interface AdhanVoiceOption {
  readonly id: AdhanVoiceId;
  readonly name: string;
  readonly nameBn: string;
  readonly muezzin: string;
  readonly muezzinBn: string;
  readonly location: string;
  readonly locationBn: string;
  readonly audioUrl: string;
}

export const ADHAN_VOICE_OPTIONS: readonly AdhanVoiceOption[] = [
  {
    id: 'makkah',
    name: 'Makkah — Masjid al-Haram',
    nameBn: 'মক্কা — মসজিদুল হারাম',
    muezzin: 'Sheikh Ali Ahmed Mulla',
    muezzinBn: 'শায়খ আলী আহমেদ মোল্লা',
    location: 'Makkah, Saudi Arabia',
    locationBn: 'মক্কা, সৌদি আরব',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Ali_Ibn_Ahmad_Mala_HQ.mp3',
  },
  {
    id: 'madinah',
    name: 'Madinah — Masjid an-Nabawi',
    nameBn: 'মদিনা — মসজিদে নববী',
    muezzin: 'Sheikh Essam Bukhari',
    muezzinBn: 'শায়খ এসাম বুখারী',
    location: 'Madinah, Saudi Arabia',
    locationBn: 'মদিনা, সৌদি আরব',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Al_Haram_Al_Madani_-_Al_Madinah_1_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D8%AF%D9%86%D9%8A_-_%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9).mp3',
  },
  {
    id: 'alaqsa',
    name: 'Al-Aqsa — Jerusalem',
    nameBn: 'আল-আকসা — জেরুজালেম',
    muezzin: 'Sheikh Naji Qazzaz',
    muezzinBn: 'শায়খ নাজি কাযযায',
    location: 'Jerusalem, Palestine',
    locationBn: 'জেরুজালেম, ফিলিস্তিন',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Najee_Qazaz_-_Al_Aqsa_Jerusalem_(%D9%86%D8%A7%D8%AC%D9%8A_%D9%82%D8%B2%D8%A7%D8%B2_-_%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF_%D8%A7%D9%84%D8%A3%D9%82%D8%B5%D9%89_%D8%A7%D9%84%D9%82%D8%AF%D8%B3).mp3',
  },
  {
    id: 'egypt',
    name: 'Traditional Egyptian Adhan',
    nameBn: 'মিশরীয় ঐতিহ্যবাহী আজান',
    muezzin: 'Sheikh Mahmoud Khalil Al-Hussary',
    muezzinBn: 'শায়খ মাহমুদ খলিল আল-হুসারি',
    location: 'Cairo, Egypt',
    locationBn: 'কায়রো, মিশর',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mahmoud_Khalil_Al_Hussary_-_Cairo_(%D9%85%D8%AD%D9%85%D9%88%D8%AF_%D8%AE%D9%84%D9%8A%D9%84_%D8%A7%D9%84%D8%AD%D8%B5%D8%B1%D9%8A_-_%D8%A7%D9%84%D9%82%D8%A7%D9%87%D8%B1%D8%A9).mp3',
  },
  {
    id: 'mishary',
    name: 'Mishary Rashid Alafasy',
    nameBn: 'মিশারী রাশিদ আল-আফাসী',
    muezzin: 'Mishary Rashid Alafasy',
    muezzinBn: 'মিশারী রাশিদ আল-আফাসী',
    location: 'Kuwait / Dubai',
    locationBn: 'কুয়েত / দুবাই',
    audioUrl: 'https://cdn.aladhan.com/audio/adhans/a4.mp3',
  },
  {
    id: 'nafees',
    name: 'Ahmad al-Nafees',
    nameBn: 'আহমাদ আল-নাফীস',
    muezzin: 'Ahmad al-Nafees',
    muezzinBn: 'আহমাদ আল-নাফীস',
    location: 'Kuwait',
    locationBn: 'কুয়েত',
    audioUrl: 'https://cdn.aladhan.com/audio/adhans/a1.mp3',
  },
];

export interface PrayerNotificationSettings {
  readonly enabled: boolean;
  readonly fajr: boolean;
  readonly sunrise: boolean;
  readonly dhuhr: boolean;
  readonly asr: boolean;
  readonly maghrib: boolean;
  readonly isha: boolean;
  readonly autoPlayAdhanModal: boolean;
  readonly adhanVoice: AdhanVoiceId;
  readonly defaultMuted: boolean;
  readonly volume: number;
}

export const DEFAULT_PRAYER_NOTIFICATION_SETTINGS: PrayerNotificationSettings = {
  enabled: true,
  fajr: true,
  sunrise: false, // Sunrise is not a prayer, optional alert
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
  autoPlayAdhanModal: true,
  adhanVoice: 'makkah',
  defaultMuted: true, // Adheres to browser autoplay policy & quiet environments
  volume: 0.8,
};

export interface AdhanModalState {
  readonly prayer: PrayerTime;
  readonly time12h: string;
  readonly time12hBn: string;
  readonly locationName: string;
  readonly isTest?: boolean;
  readonly isManual?: boolean;
  readonly startMuted?: boolean;
}
