import { AppError } from './api-error';

/**
 * Every asynchronous read in this app is modelled with the same four states,
 * which is what makes "loading / error / retry / empty" consistent everywhere
 * instead of being re-invented per component.
 */
export type AsyncState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: AppError };

export const idle = <T>(): AsyncState<T> => ({ status: 'idle' });
export const loading = <T>(): AsyncState<T> => ({ status: 'loading' });
export const success = <T>(data: T): AsyncState<T> => ({ status: 'success', data });
export const failure = <T>(error: AppError): AsyncState<T> => ({ status: 'error', error });

export function isLoading<T>(state: AsyncState<T>): boolean {
  return state.status === 'loading';
}

export function dataOf<T>(state: AsyncState<T>): T | null {
  return state.status === 'success' ? state.data : null;
}

export function errorOf<T>(state: AsyncState<T>): AppError | null {
  return state.status === 'error' ? state.error : null;
}
