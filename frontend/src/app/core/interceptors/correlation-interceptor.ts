import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Tags every outgoing request with a correlation id.
 *
 * The backend echoes the same id in its response header and writes it into its
 * logs, so when a user reports "it failed", the id shown in the error message
 * points straight at the matching server log line.
 */
export const correlationInterceptor: HttpInterceptorFn = (request, next) => {
  // Only tag calls to our own API; third-party CDNs would just reject the header
  // as a disallowed CORS request header.
  if (!request.url.startsWith('/api') && !request.url.includes('/api/')) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { 'X-Correlation-Id': newCorrelationId() },
    }),
  );
};

function newCorrelationId(): string {
  // randomUUID needs a secure context; fall back for plain-http local testing.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
  }

  return Math.random().toString(36).slice(2, 14) + Date.now().toString(36);
}
