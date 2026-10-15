using AlQuran.Api.Models.Common;

namespace AlQuran.Api.Services.Quran;

/// <summary>
/// Converts between "surah 2, ayah 255" and "ayah 262 of the whole Quran".
///
/// The global number is what the audio CDN uses in its file names and what
/// AlQuran.cloud uses to join editions, so this conversion is needed in several
/// places. The running totals are computed once from the surah reference table.
/// </summary>
public static class AyahPositions
{
    /// <summary>Ayahs completed before each surah begins. Index 0 is surah 1.</summary>
    private static readonly int[] Offsets = BuildOffsets();

    private static int[] BuildOffsets()
    {
        var offsets = new int[SurahNames.SurahCount];
        var running = 0;

        foreach (var surah in SurahNames.All)
        {
            offsets[surah.Number - 1] = running;
            running += surah.AyahCount;
        }

        return offsets;
    }

    /// <summary>Position of an ayah within the whole Quran, 1-6236.</summary>
    /// <exception cref="RequestValidationException">The reference is out of range.</exception>
    public static int ToGlobal(int surahNumber, int ayahNumber)
    {
        var surah = SurahNames.Find(surahNumber)
            ?? throw new RequestValidationException(
                $"Surah number must be between 1 and {SurahNames.SurahCount}.",
                nameof(surahNumber));

        if (ayahNumber < 1 || ayahNumber > surah.AyahCount)
        {
            throw new RequestValidationException(
                $"Surah {surahNumber} has {surah.AyahCount} ayahs, so ayah {ayahNumber} does not exist.",
                nameof(ayahNumber));
        }

        return Offsets[surahNumber - 1] + ayahNumber;
    }

    /// <summary>Splits a global ayah number back into surah and ayah.</summary>
    /// <exception cref="RequestValidationException">The number is outside 1-6236.</exception>
    public static (int Surah, int Ayah) FromGlobal(int globalNumber)
    {
        if (globalNumber < 1 || globalNumber > SurahNames.TotalAyahCount)
        {
            throw new RequestValidationException(
                $"Ayah number must be between 1 and {SurahNames.TotalAyahCount}.",
                nameof(globalNumber));
        }

        // 114 entries: a linear scan is clearer than a binary search and just as fast.
        for (var index = SurahNames.SurahCount - 1; index >= 0; index--)
        {
            if (globalNumber > Offsets[index])
            {
                return (index + 1, globalNumber - Offsets[index]);
            }
        }

        return (1, globalNumber);
    }

    /// <summary>How many ayahs a juz contains.</summary>
    public static int AyahCountInJuz(int juzNumber)
    {
        var start = JuzBoundaries.Get(juzNumber);
        var startGlobal = ToGlobal(start.Surah, start.Ayah);

        if (juzNumber == SurahNames.JuzCount)
        {
            return SurahNames.TotalAyahCount - startGlobal + 1;
        }

        var next = JuzBoundaries.Get(juzNumber + 1);
        return ToGlobal(next.Surah, next.Ayah) - startGlobal;
    }
}
