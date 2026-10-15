import { DEFAULT_RECITER, Reciter } from '../models/quran';
import { buildAyahAudioUrl } from './audio-url';

describe('buildAyahAudioUrl', () => {
  const husary: Reciter = {
    identifier: 'ar.husary',
    name: 'محمود خليل الحصري',
    englishName: 'Mahmoud Khalil Al-Husary',
    style: '',
    bitrate: 128,
  };

  it('builds the CDN path the backend builds', () => {
    expect(buildAyahAudioUrl(262, DEFAULT_RECITER)).toBe(
      'https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3',
    );
  });

  it("uses the reciter's own bitrate, not a fixed one", () => {
    // Abdul Basit is only stored at 64 on the CDN; 128 would be a 404.
    const abdulBasit: Reciter = { ...husary, identifier: 'ar.abdulbasitmurattal', bitrate: 64 };

    expect(buildAyahAudioUrl(1, abdulBasit)).toBe(
      'https://cdn.islamic.network/quran/audio/64/ar.abdulbasitmurattal/1.mp3',
    );
  });

  it('addresses the first and last ayah of the Quran', () => {
    expect(buildAyahAudioUrl(1, husary)).toContain('/ar.husary/1.mp3');
    expect(buildAyahAudioUrl(6236, husary)).toContain('/ar.husary/6236.mp3');
  });

  it('rejects an ayah number outside the Quran rather than building a 404', () => {
    expect(() => buildAyahAudioUrl(0, husary)).toThrow(RangeError);
    expect(() => buildAyahAudioUrl(6237, husary)).toThrow(RangeError);
    expect(() => buildAyahAudioUrl(1.5, husary)).toThrow(RangeError);
  });
});
