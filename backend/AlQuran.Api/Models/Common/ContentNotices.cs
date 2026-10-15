namespace AlQuran.Api.Models.Common;

/// <summary>
/// Wording attached to any value this API computes rather than receives from a
/// religious authority. It travels with the data so a client cannot render a
/// calculated Hijri date or prayer time as though it were declared.
/// </summary>
public static class ContentNotices
{
    /// <summary>Attached to every Hijri date and calendar response.</summary>
    public const string HijriCalculated =
        "This Hijri date is calculated astronomically. Local moon sighting may differ - " +
        "follow the announcement of your local authority.";

    /// <summary>Attached to every prayer timetable.</summary>
    public const string PrayerCalculated =
        "Prayer times are calculated for the given location and method. Your local mosque " +
        "may announce slightly different times - follow your local authority.";

    /// <summary>Attached to the Islamic events list.</summary>
    public const string EventsApproximate =
        "These dates are derived from a calculated Hijri calendar and may move by a day " +
        "depending on moon sighting in your region.";

    /// <summary>Attached to mosque results.</summary>
    public const string MosqueDataCommunity =
        "Mosque data comes from OpenStreetMap and is contributed by volunteers. " +
        "Coverage and details vary by area.";
}
