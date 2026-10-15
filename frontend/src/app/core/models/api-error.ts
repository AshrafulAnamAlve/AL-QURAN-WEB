/**
 * A network or server failure, normalised into something the UI can act on.
 *
 * The backend answers errors with RFC 9457 ProblemDetails plus a few extra
 * fields (errorCode, retryable, correlationId). The error interceptor turns all
 * of that - plus offline and unknown failures - into this single shape, so no
 * component ever has to inspect an HttpErrorResponse.
 */
export interface AppError {
  /** Stable machine-readable code, e.g. 'upstream_unavailable'. */
  readonly code: AppErrorCode;

  /** Message safe to show directly to the user. */
  readonly message: string;

  /** HTTP status, or 0 when the request never reached the server. */
  readonly status: number;

  /** True when showing a Retry button makes sense. */
  readonly retryable: boolean;

  /** Upstream provider that failed, when the backend told us. */
  readonly service?: string;

  /** Correlation id for matching a browser error to a backend log line. */
  readonly correlationId?: string;

  /** The request that failed, useful while debugging. */
  readonly url?: string;
}

export type AppErrorCode =
  | 'offline'
  | 'timeout'
  | 'validation_failed'
  | 'not_found'
  | 'rate_limited'
  | 'upstream_unavailable'
  | 'upstream_timeout'
  | 'server_error'
  | 'unexpected_error';

/** Codes for which retrying the exact same request could plausibly work. */
export const RETRYABLE_CODES: readonly AppErrorCode[] = [
  'offline',
  'timeout',
  'rate_limited',
  'upstream_unavailable',
  'upstream_timeout',
  'server_error',
];

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'retryable' in value
  );
}
