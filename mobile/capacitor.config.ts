import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alquran.mobile',
  appName: 'Al-Quran (আল-কুরআন)',
  webDir: '../frontend/dist/frontend/browser',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allows HTTP connection to local .NET API during development
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0a1914',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a1914',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#071611',
      overlaysWebView: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_quran',
      iconColor: '#10b981',
      sound: 'adhan.wav',
    },
    Keyboard: {
      resize: 'native',
      style: 'DARK',
    },
  },
};

export default config;
