import {
  Injector,
  Signal,
  assertInInjectionContext,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, startWith, switchMap } from 'rxjs';
import { AsyncState, idle } from '../models/async-state';
import { toAsyncState } from './async-state.operators';

export interface AsyncResource<T> {
  /** Current loading / success / error state. */
  readonly state: Signal<AsyncState<T>>;
  /** Re-runs the loader. Wire this to the Retry button. */
  reload(): void;
}

/**
 * Turns a "call the API" function into a reloadable signal of {@link AsyncState}.
 *
 * This is the small piece of glue that makes the required loading / error /
 * retry / empty handling automatic instead of hand-written on every screen.
 *
 * Usage inside a component:
 *   private readonly resource = createAsyncResource(() => this.api.get<AppInfo>('meta'));
 *   readonly state = this.resource.state;
 *   retry(): void { this.resource.reload(); }
 */
export function createAsyncResource<T>(
  loader: () => Observable<T>,
  options?: { injector?: Injector },
): AsyncResource<T> {
  if (!options?.injector) {
    assertInInjectionContext(createAsyncResource);
  }

  const injector = options?.injector ?? inject(Injector);
  const trigger = new Subject<void>();

  const state = toSignal(
    trigger.pipe(
      startWith(undefined),
      // switchMap cancels an in-flight request when Retry is pressed again.
      switchMap(() => loader().pipe(toAsyncState())),
    ),
    { initialValue: idle<T>(), injector },
  );

  return {
    state,
    reload: () => trigger.next(),
  };
}

/**
 * Same idea, but the request depends on a signal - a route parameter, the
 * selected city, the chosen reciter. The loader re-runs whenever that input
 * changes, and `reload()` still forces a fresh call with the current value.
 */
export function createDependentAsyncResource<TInput, TResult>(
  input: Signal<TInput>,
  loader: (value: TInput) => Observable<TResult>,
  options?: { injector?: Injector },
): AsyncResource<TResult> {
  if (!options?.injector) {
    assertInInjectionContext(createDependentAsyncResource);
  }

  const injector = options?.injector ?? inject(Injector);
  const version = signal(0);

  // Bumping `version` changes this computed, which re-triggers the request even
  // when the input value itself has not changed.
  const request = computed(() => ({ value: input(), version: version() }));

  const state = toSignal(
    toObservable(request, { injector }).pipe(
      switchMap(({ value }) => loader(value).pipe(toAsyncState())),
    ),
    { initialValue: idle<TResult>(), injector },
  );

  return {
    state,
    reload: () => version.update((v) => v + 1),
  };
}
