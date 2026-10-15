import { Injectable, isDevMode } from '@angular/core';

/**
 * Very small logging facade.
 *
 * Debug and info are silenced in production builds so the console stays clean,
 * while warnings and errors always come through. Going through a service (rather
 * than calling console.* everywhere) means we can later forward errors to a
 * monitoring endpoint by changing one file.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly verbose = isDevMode();

  debug(message: string, ...context: unknown[]): void {
    if (this.verbose) {
      console.debug(`[aq] ${message}`, ...context);
    }
  }

  info(message: string, ...context: unknown[]): void {
    if (this.verbose) {
      console.info(`[aq] ${message}`, ...context);
    }
  }

  warn(message: string, ...context: unknown[]): void {
    console.warn(`[aq] ${message}`, ...context);
  }

  error(message: string, ...context: unknown[]): void {
    console.error(`[aq] ${message}`, ...context);
  }
}
