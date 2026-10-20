import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
  withHashLocation,
} from '@angular/router';
import { TitleStrategy } from '@angular/router';
import { correlationInterceptor } from './core/interceptors/correlation-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { PageTitleStrategy } from './core/services/page-title-strategy';
import { routes } from './app.routes';

const isDesktopOrFile =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'file:' || Boolean((window as unknown as { desktopApi?: { isDesktop?: boolean } }).desktopApi?.isDesktop));

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      // Route params arrive as component inputs - no manual ActivatedRoute plumbing.
      withComponentInputBinding(),
      // Return to the top on navigation, but restore the position on Back.
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      ...(isDesktopOrFile ? [withHashLocation()] : []),
    ),

    ...(isDesktopOrFile
      ? [
          {
            provide: APP_BASE_HREF,
            useValue:
              typeof window !== 'undefined' && window.location.pathname.endsWith('.html')
                ? window.location.pathname
                : '',
          },
        ]
      : []),

    provideHttpClient(
      // fetch() is the modern transport and works well with abort signals.
      withFetch(),
      // Order matters: correlation tags the request, error normalises the failure.
      withInterceptors([correlationInterceptor, errorInterceptor]),
    ),

    // Applies per-route title and SEO metadata on every navigation.
    { provide: TitleStrategy, useClass: PageTitleStrategy },

    // Progressive Web App service worker for offline shell and Quran text caching (disabled in desktop/Electron).
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode() && !isDesktopOrFile,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
