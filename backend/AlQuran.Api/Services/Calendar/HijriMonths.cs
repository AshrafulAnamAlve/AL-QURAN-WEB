using AlQuran.Api.DTOs.Calendar;
using AlQuran.Api.Models.Common;

namespace AlQuran.Api.Services.Calendar;

/// <summary>
/// The twelve Hijri months, in Arabic, transliterated English and Bangla.
///
/// Aladhan returns a transliterated name with diacritics (Rabīʿ al-awwal). We
/// keep our own plain-ASCII English name alongside it so the UI can render and
/// sort names without depending on the provider's exact spelling.
/// </summary>
public static class HijriMonths
{
    /// <summary>One Hijri month.</summary>
    /// <param name="Number">Month number, 1-12.</param>
    /// <param name="NameEn">Transliterated English name.</param>
    /// <param name="NameAr">Arabic name.</param>
    /// <param name="NameBn">Bangla name.</param>
    public sealed record Month(int Number, string NameEn, string NameAr, string NameBn);

    private static readonly Month[] Months =
    [
        new(1, "Muharram", "مُحَرَّم", "মুহাররম"),
        new(2, "Safar", "صَفَر", "সফর"),
        new(3, "Rabi al-awwal", "رَبيع الأوّل", "রবিউল আউয়াল"),
        new(4, "Rabi al-thani", "رَبيع الآخر", "রবিউস সানি"),
        new(5, "Jumada al-ula", "جُمادى الأولى", "জমাদিউল আউয়াল"),
        new(6, "Jumada al-akhirah", "جُمادى الآخرة", "জমাদিউস সানি"),
        new(7, "Rajab", "رَجَب", "রজব"),
        new(8, "Shaban", "شَعْبان", "শাবান"),
        new(9, "Ramadan", "رَمَضان", "রমজান"),
        new(10, "Shawwal", "شَوّال", "শাওয়াল"),
        new(11, "Dhu al-Qidah", "ذُو القعدة", "জিলকদ"),
        new(12, "Dhu al-Hijjah", "ذُو الحِجّة", "জিলহজ"),
    ];

    /// <summary>Ramadan is month 9; used to decide whether the Ramadan view applies.</summary>
    public const int RamadanNumber = 9;

    /// <summary>All twelve months, in order.</summary>
    public static IReadOnlyList<Month> All => Months;

    /// <summary>One month by number.</summary>
    /// <exception cref="RequestValidationException">The number is outside 1-12.</exception>
    public static Month Get(int monthNumber)
    {
        if (monthNumber < 1 || monthNumber > 12)
        {
            throw new RequestValidationException(
                "Hijri month must be between 1 and 12.",
                nameof(monthNumber));
        }

        return Months[monthNumber - 1];
    }

    /// <summary>The reference list the calendar page renders.</summary>
    public static IReadOnlyList<HijriMonthNameDto> ToDtos() =>
        Months.Select(month => new HijriMonthNameDto(
            month.Number, month.NameEn, month.NameAr, month.NameBn)).ToList();
}
