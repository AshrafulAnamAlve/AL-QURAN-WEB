import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TimeoutError, catchError, throwError } from 'rxjs';
import { AppError, AppErrorCode, RETRYABLE_CODES } from '../models/api-error';
import { LoggerService } from '../services/logger';

/**
 * Turns every HTTP failure into a single {@link AppError} shape.
 *
 * After this interceptor, no component or service has to know the difference
 * between "the phone is offline", "the backend returned ProblemDetails" and
 * "the request timed out" - they all arrive with a message worth showing and a
 * `retryable` flag that decides whether a Retry button appears.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const logger = inject(LoggerService);

  return next(request).pipe(
    catchError((raw: unknown) => {
      const error = normalise(raw, request.url);
      logger.error(`HTTP ${error.status} ${request.method} ${request.url}`, error);
      return throwError(() => error);
    }),
  );
};

function normalise(raw: unknown, url: string): AppError {
  if (raw instanceof TimeoutError) {
    return build('timeout', 'The request took too long. Please check your connection and try again.', 0, url);
  }

  if (!(raw instanceof HttpErrorResponse)) {
    return build('unexpected_error', 'Something went wrong. Please try again.', 0, url);
  }

  // Status 0 means the request never got a response: offline, DNS failure,
  // the backend is not running, or CORS blocked it.
  if (raw.status === 0) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return build(
      'offline',
      offline
        ? 'You appear to be offline. Reconnect and try again.'
        : 'Could not reach the server. Make sure the backend is running, then try again.',
      0,
      url,
    );
  }

  // The backend answers errors as ProblemDetails with our extension fields.
  const problem = (raw.error ?? {}) as Record<string, unknown>;
  const code = mapCode(raw.status, problem['errorCode']);
  const message = pickMessage(problem, raw.status);

  return {
    code,
    message,
    status: raw.status,
    retryable:
      typeof problem['retryable'] === 'boolean'
        ? (problem['retryable'] as boolean)
        : RETRYABLE_CODES.includes(code),
    service: typeof problem['service'] === 'string' ? (problem['service'] as string) : undefined,
    correlationId:
      typeof problem['correlationId'] === 'string'
        ? (problem['correlationId'] as string)
        : (raw.headers?.get('X-Correlation-Id') ?? undefined),
    url,
  };
}

function mapCode(status: number, backendCode: unknown): AppErrorCode {
  if (typeof backendCode === 'string') {
    const known: AppErrorCode[] = [
      'validation_failed',
      'not_found',
      'rate_limited',
      'upstream_unavailable',
      'upstream_timeout',
      'unexpected_error',
    ];
    const match = known.find((c) => c === backendCode);
    if (match) {
      return match;
    }
  }

  if (status === 400) return 'validation_failed';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status === 502) return 'upstream_unavailable';
  if (status === 504) return 'upstream_timeout';
  if (status >= 500) return 'server_error';
  return 'unexpected_error';
}

function pickMessage(problem: Record<string, unknown>, status: number): string {
  const detail = problem['detail'];
  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail;
  }

  const title = problem['title'];
  if (typeof title === 'string' && title.trim().length > 0) {
    return title;
  }

  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'The service is having trouble right now. Please try again.';
  return 'Something went wrong. Please try again.';
}

function build(code: AppErrorCode, message: string, status: number, url: string): AppError {
  return { code, message, status, retryable: RETRYABLE_CODES.includes(code), url };
}
