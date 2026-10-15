import { Observable, OperatorFunction, catchError, map, of, startWith } from 'rxjs';
import { AppError, isAppError } from '../models/api-error';
import { AsyncState, failure, loading, success } from '../models/async-state';

/**
 * Wraps a request stream so it emits loading -> success | error instead of
 * throwing. Combined with `toSignal`, this gives a component one signal that
 * already covers every UI state.
 *
 * Usage:
 *   readonly surahs = toSignal(
 *     this.quran.getSurahs().pipe(toAsyncState()),
 *     { initialValue: idle<Surah[]>() },
 *   );
 */
export function toAsyncState<T>(): OperatorFunction<T, AsyncState<T>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((data) => success(data)),
      startWith(loading<T>()),
      catchError((error: unknown) => of(failure<T>(asAppError(error)))),
    );
}

/** Last-resort conversion for anything that reached us without the interceptor. */
export function asAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  return {
    code: 'unexpected_error',
    message: 'Something went wrong. Please try again.',
    status: 0,
    retryable: true,
  };
}
