import { environment } from '../../../environments/environment';
import { QURAN_TOTALS, Reciter } from '../models/quran';

/**
 * Builds the CDN URL for one ayah's recitation.
 *
 * The backend also builds these (Services/Quran/AudioUrlBuilder.cs) and puts one
 * on every ayah it returns. The browser builds its own as well, for one reason:
 * changing the reciter would otherwise mean refetching the whole surah - 130 kB
 * for Al-Baqarah - to obtain nothing but a different set of predictable URLs.
 * Building them here makes switching reciter instant and costs no request.
 *
 * The shape `{base}/{bitrate}/{reciter}/{ayah}.mp3` must stay in step with the
 * backend builder. The bitrate is per reciter and comes from /api/quran/reciters,
 * because the CDN stores each edition only under the bitrates it was encoded at.
 */
export function buildAyahAudioUrl(globalNumber: number, reciter: Reciter): string {
  if (!Number.isInteger(globalNumber) || globalNumber < 1 || globalNumber > QURAN_TOTALS.ayahs) {
    throw new RangeError(`Ayah number must be between 1 and ${QURAN_TOTALS.ayahs}.`);
  }

  const base = environment.audioCdnBaseUrl.replace(/\/+$/, '');
  return `${base}/${reciter.bitrate}/${reciter.identifier}/${globalNumber}.mp3`;
}
