namespace AlQuran.Api.Services.Calendar;

/// <summary>
/// Notable dates in the Islamic year, defined by their Hijri day and month.
///
/// Their Gregorian dates are resolved at runtime through the Hijri conversion
/// API rather than being listed here, because they move every year and because
/// a hard-coded Gregorian date would be wrong the moment the calculation method
/// or the moon sighting differs.
///
/// Every entry is presented to the user as calculated and approximate. Nothing
/// here is a religious ruling; observance and exact dates vary by country and by
/// school, and the app says so.
/// </summary>
public static class IslamicEvents
{
    /// <summary>One observance in the Islamic year.</summary>
    /// <param name="Key">Stable identifier used by the frontend.</param>
    /// <param name="Name">English name.</param>
    /// <param name="BanglaName">Bangla name.</param>
    /// <param name="Day">Day of the Hijri month.</param>
    /// <param name="Month">Hijri month number.</param>
    /// <param name="Description">One line of context.</param>
    /// <param name="IsRange">
    /// True when the observance spans several nights rather than falling on one
    /// fixed day, so the UI can avoid presenting a single date as definitive.
    /// </param>
    public sealed record Event(
        string Key,
        string Name,
        string BanglaName,
        int Day,
        int Month,
        string Description,
        bool IsRange = false);

    private static readonly Event[] Events =
    [
        new("islamic-new-year", "Islamic New Year", "ইসলামি নববর্ষ", 1, 1,
            "The first day of Muharram, which begins the Hijri year."),

        new("ashura", "Day of Ashura", "আশুরা", 10, 1,
            "The tenth of Muharram. Widely observed with voluntary fasting."),

        new("mawlid", "12 Rabi al-awwal", "১২ রবিউল আউয়াল", 12, 3,
            "Observed in many countries as the birth of the Prophet Muhammad, peace be upon him. "
            + "Observance and the exact date differ between regions and schools."),

        new("isra-miraj", "Isra and Miraj", "শবে মিরাজ", 27, 7,
            "The night journey and ascension, commonly observed on 27 Rajab."),

        new("mid-shaban", "Mid-Shaban", "শবে বরাত", 15, 8,
            "The night of the fifteenth of Shaban, observed in many regions."),

        new("ramadan-start", "First day of Ramadan", "রমজান শুরু", 1, 9,
            "The first day of fasting. The actual start depends on local moon sighting."),

        new("laylat-al-qadr", "Laylat al-Qadr", "লাইলাতুল কদর", 27, 9,
            "Sought in the odd nights of the last ten days of Ramadan. "
            + "The 27th night is the most widely observed, but the night is not fixed.",
            IsRange: true),

        new("eid-al-fitr", "Eid al-Fitr", "ঈদুল ফিতর", 1, 10,
            "The festival that ends Ramadan, on the first of Shawwal."),

        new("day-of-arafah", "Day of Arafah", "আরাফাহর দিন", 9, 12,
            "The ninth of Dhu al-Hijjah, the day of standing at Arafah."),

        new("eid-al-adha", "Eid al-Adha", "ঈদুল আযহা", 10, 12,
            "The festival of sacrifice, on the tenth of Dhu al-Hijjah."),
    ];

    /// <summary>Every observance, in Hijri calendar order.</summary>
    public static IReadOnlyList<Event> All { get; } =
        Events.OrderBy(item => item.Month).ThenBy(item => item.Day).ToList();

    /// <summary>Observances falling in a given Hijri month.</summary>
    public static IEnumerable<Event> InMonth(int hijriMonth) =>
        All.Where(item => item.Month == hijriMonth);
}
