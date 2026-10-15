using AlQuran.Api.Models.Common;

namespace AlQuran.Api.Services.Quran;

/// <summary>
/// Where each juz (para) begins.
///
/// These values were read from AlQuran.cloud's own metadata endpoint
/// (GET /v1/meta -> data.juzs.references) rather than typed from memory, so they
/// match the same source the ayah data comes from. Baking them in avoids 30
/// upstream calls just to render the juz list.
/// </summary>
public static class JuzBoundaries
{
    /// <summary>The surah and ayah a juz starts at.</summary>
    /// <param name="Juz">Juz number, 1-30.</param>
    /// <param name="Surah">Surah the juz begins in.</param>
    /// <param name="Ayah">Ayah within that surah where it begins.</param>
    public sealed record Start(int Juz, int Surah, int Ayah);

    private static readonly Start[] Starts =
    [
        new(1, 1, 1),
        new(2, 2, 142),
        new(3, 2, 253),
        new(4, 3, 93),
        new(5, 4, 24),
        new(6, 4, 148),
        new(7, 5, 82),
        new(8, 6, 111),
        new(9, 7, 88),
        new(10, 8, 41),
        new(11, 9, 93),
        new(12, 11, 6),
        new(13, 12, 53),
        new(14, 15, 1),
        new(15, 17, 1),
        new(16, 18, 75),
        new(17, 21, 1),
        new(18, 23, 1),
        new(19, 25, 21),
        new(20, 27, 56),
        new(21, 29, 46),
        new(22, 33, 31),
        new(23, 36, 28),
        new(24, 39, 32),
        new(25, 41, 47),
        new(26, 46, 1),
        new(27, 51, 31),
        new(28, 58, 1),
        new(29, 67, 1),
        new(30, 78, 1),
    ];

    /// <summary>All 30 start references, in order.</summary>
    public static IReadOnlyList<Start> All => Starts;

    /// <summary>Where the given juz begins.</summary>
    /// <exception cref="RequestValidationException">The number is outside 1-30.</exception>
    public static Start Get(int juzNumber)
    {
        if (juzNumber < 1 || juzNumber > SurahNames.JuzCount)
        {
            throw new RequestValidationException(
                $"Juz number must be between 1 and {SurahNames.JuzCount}.",
                nameof(juzNumber));
        }

        return Starts[juzNumber - 1];
    }

    /// <summary>
    /// Where the given juz ends: the ayah immediately before the next juz starts,
    /// or the last ayah of the Quran for juz 30.
    /// </summary>
    public static (int Surah, int Ayah) GetEnd(int juzNumber)
    {
        var start = Get(juzNumber);

        if (juzNumber == SurahNames.JuzCount)
        {
            var last = SurahNames.Get(SurahNames.SurahCount);
            return (last.Number, last.AyahCount);
        }

        var next = Starts[juzNumber];

        // The juz ends one ayah before the next one begins. When the next juz
        // starts at ayah 1, that means the previous surah ran to its end.
        return next.Ayah > 1
            ? (next.Surah, next.Ayah - 1)
            : (next.Surah - 1, SurahNames.Get(next.Surah - 1).AyahCount);
    }

}
