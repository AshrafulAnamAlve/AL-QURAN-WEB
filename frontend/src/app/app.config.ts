import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';
import { TitleStrategy } from '@angular/router';
import { correlationInterceptor } from './core/interceptors/correlation-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { PageTitleStrategy } from './core/services/page-title-strategy';
import { routes } from './app.routes';

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
    ),

    provideHttpClient(
      // fetch() is the modern transport and works well with abort signals.
      withFetch(),
      // Order matters: correlation tags the request, error normalises the failure.
      withInterceptors([correlationInterceptor, errorInterceptor]),
    ),

    // Applies per-route title and SEO metadata on every navigation.
    { provide: TitleStrategy, useClass: PageTitleStrategy },

    // Progressive Web App service worker for offline shell and Quran text caching.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
