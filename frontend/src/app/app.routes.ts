import { Routes } from '@angular/router';

/**
 * Application routes.
 *
 * Every feature is lazy loaded with `loadComponent`, so the browser downloads a
 * screen only when it is opened. That keeps the initial bundle small, which
 * matters most on the phones this app is mainly read on.
 *
 * `data.meta` is picked up by PageTitleStrategy and turned into the page title,
 * meta description, Open Graph tags and canonical link.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((m) => m.HomePage),
    data: {
      meta: {
        title: '',
        description:
          'Read the Quran in Arabic with Bangla translation, listen to recitation, follow ' +
          'prayer times, view the Islamic calendar and find mosques nearby.',
      },
    },
  },
  {
    path: 'quran',
    loadComponent: () => import('./features/quran/quran').then((m) => m.QuranPage),
    data: {
      meta: {
        title: 'Quran — Read with Bangla Translation',
        description:
          'Browse all 114 surahs of the Quran with Arabic text, Bangla and English ' +
          'translation, revelation type and ayah counts.',
      },
    },
  },
  {
    // The surah number arrives as a component input thanks to
    // withComponentInputBinding() in app.config.ts.
    path: 'quran/:surahNumber',
    loadComponent: () =>
      import('./features/quran/surah-reader/surah-reader').then((m) => m.SurahReaderPage),
    data: {
      meta: {
        title: 'Read Surah',
        description:
          'Read this surah in Arabic with Bangla translation, and listen to the recitation.',
      },
    },
  },
  {
    path: 'juz',
    loadComponent: () => import('./features/juz/juz').then((m) => m.JuzPage),
    data: {
      meta: {
        title: 'Juz / Para — All 30 Parts of the Quran',
        description: 'Open any of the 30 juz (para) of the Quran and read the ayahs it contains.',
      },
    },
  },
  {
    path: 'juz/:juzNumber',
    loadComponent: () => import('./features/juz/juz-reader/juz-reader').then((m) => m.JuzReaderPage),
    data: {
      meta: {
        title: 'Read Juz',
        description: 'Read this juz of the Quran in Arabic with Bangla translation.',
      },
    },
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search').then((m) => m.SearchPage),
    data: {
      meta: {
        title: 'Search the Quran',
        description:
          'Search the Quran across the Arabic text, Bangla and English translations, ' +
          'surah names and ayah references.',
      },
    },
  },
  {
    path: '99-names',
    loadComponent: () =>
      import('./features/asma-ul-husna/asma-ul-husna').then((m) => m.AsmaUlHusnaPage),
    data: {
      meta: {
        title: 'Asma-ul-Husna — 99 Beautiful Names of Allah',
        description:
          'Explore all 99 Beautiful Names of Allah with authentic Arabic calligraphy, ' +
          'transliteration, Bengali & English meanings, spiritual reflections, and audio pronunciation.',
      },
    },
  },
  {
    path: 'asma-ul-husna',
    redirectTo: '99-names',
    pathMatch: 'full',
  },
  {
    path: 'hadith',
    loadComponent: () => import('./features/hadith/hadith').then((m) => m.HadithPage),
    data: {
      meta: {
        title: 'Hadith Sharif — সহিহ হাদিস সংকলন',
        description:
          'Read authentic Hadiths from Sahih al-Bukhari, Sahih Muslim and Riyad as-Salihin ' +
          'with Arabic text, Bangla translation, English meaning, and daily Hadith.',
      },
    },
  },
  {
    path: 'tasbih',
    loadComponent: () => import('./features/tasbih/tasbih').then((m) => m.TasbihPage),
    data: {
      meta: {
        title: 'Digital Tasbih & Daily Adhkar — জিকির ও তসবিহ',
        description:
          'Interactive Digital Tasbih counter with tactile haptic feedback, sound effects, ' +
          'and authentic morning, evening, and post-prayer supplications.',
      },
    },
  },
  {
    path: 'dhikr',
    redirectTo: 'tasbih',
    pathMatch: 'full',
  },
  {
    path: 'ruqyah',
    loadComponent: () => import('./features/ruqyah/ruqyah').then((m) => m.RuqyahPage),
    data: {
      meta: {
        title: 'Ruqyah Shariah — রুকইয়াহ আশ-শারইয়াহ (অডিও ও পঠন)',
        description:
          'Authentic Ruqyah Shariah verses and prophetic supplications for healing, protection ' +
          'from evil eye (nazar), witchcraft, anxiety, with full audio recitations and interactive repetition counters.',
      },
    },
  },
  {
    path: 'roqya',
    redirectTo: 'ruqyah',
    pathMatch: 'full',
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar').then((m) => m.CalendarPage),
    data: {
      meta: {
        title: 'Islamic Calendar — Hijri Date Today',
        description:
          "Today's Hijri date next to the Gregorian date, all twelve Islamic months and " +
          'the important dates of the Islamic year.',
      },
    },
  },
  {
    path: 'prayer',
    loadComponent: () => import('./features/prayer/prayer').then((m) => m.PrayerPage),
    data: {
      meta: {
        title: 'Prayer Times — Namaz Times for Your City',
        description:
          'Fajr, Sunrise, Dhuhr, Asr, Maghrib and Isha times for your location, with a ' +
          'live countdown to the next prayer.',
      },
    },
  },
  {
    path: 'mosques',
    loadComponent: () => import('./features/mosque/mosque').then((m) => m.MosquePage),
    data: {
      meta: {
        title: 'Nearby Mosques — Find a Masjid Near You',
        description:
          'Find mosques near your location on an OpenStreetMap map, with distance, ' +
          'address and directions.',
      },
    },
  },
  {
    path: 'qibla',
    loadComponent: () => import('./features/qibla/qibla').then((m) => m.QiblaPage),
    data: {
      meta: {
        title: 'Qibla Direction & Compass — কিবলা দিকনির্ণয়',
        description:
          'Accurate Qibla compass towards the Holy Kaaba with real-time motion sensor, exact angle, distance and interactive map.',
      },
    },
  },
  {
    path: 'shield',
    loadComponent: () => import('./features/shield/shield').then((m) => m.ShieldPage),
    data: {
      meta: {
        title: 'Halal Shield — System Content & SafeSearch Blocker',
        description:
          'Free system-wide blocker protecting your family and PC from adult content, harmful websites, and enforcing SafeSearch across all browsers.',
      },
    },
  },
  {
    path: 'bookmarks',
    loadComponent: () => import('./features/bookmarks/bookmarks').then((m) => m.BookmarksPage),
    data: {
      meta: {
        title: 'Bookmarks — Your Saved Ayahs',
        description: 'Every ayah you saved, kept on this device. No account required.',
        noIndex: true,
      },
    },
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then((m) => m.SettingsPage),
    data: {
      meta: {
        title: 'Settings',
        description:
          'Adjust reading size, theme, language, reciter and location, and manage your ' +
          'saved data.',
        noIndex: true,
      },
    },
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFoundPage),
    data: {
      meta: {
        title: 'Page not found',
        description: 'The page you were looking for could not be found.',
        noIndex: true,
      },
    },
  },
];
