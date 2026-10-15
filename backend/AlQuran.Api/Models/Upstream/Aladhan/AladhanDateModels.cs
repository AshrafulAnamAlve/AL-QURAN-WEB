namespace AlQuran.Api.Models.Upstream.Aladhan;

/// <summary>The date block Aladhan attaches to timings and conversions.</summary>
public sealed class AladhanDate
{
    /// <summary>Human readable Gregorian date, e.g. "04 Sep 2026".</summary>
    public string Readable { get; set; } = string.Empty;

    /// <summary>Unix seconds, sent as a string by the provider.</summary>
    public string Timestamp { get; set; } = string.Empty;

    public AladhanHijriDate? Hijri { get; set; }

    public AladhanGregorianDate? Gregorian { get; set; }
}

/// <summary>A Hijri date as Aladhan reports it.</summary>
public sealed class AladhanHijriDate
{
    /// <summary>Formatted date, "DD-MM-YYYY".</summary>
    public string Date { get; set; } = string.Empty;

    public string Format { get; set; } = string.Empty;

    public string Day { get; set; } = string.Empty;

    public AladhanWeekday? Weekday { get; set; }

    public AladhanHijriMonth? Month { get; set; }

    public string Year { get; set; } = string.Empty;

    public AladhanDesignation? Designation { get; set; }

    /// <summary>Named observances the provider recognises for this date.</summary>
    public List<string> Holidays { get; set; } = [];

    /// <summary>Which Hijri calculation the provider used, e.g. "HJCoSA".</summary>
    public string? Method { get; set; }
}

/// <summary>A Gregorian date as Aladhan reports it.</summary>
public sealed class AladhanGregorianDate
{
    public string Date { get; set; } = string.Empty;

    public string Format { get; set; } = string.Empty;

    public string Day { get; set; } = string.Empty;

    public AladhanWeekday? Weekday { get; set; }

    public AladhanGregorianMonth? Month { get; set; }

    public string Year { get; set; } = string.Empty;
}

public sealed class AladhanWeekday
{
    public string En { get; set; } = string.Empty;

    public string? Ar { get; set; }
}

public sealed class AladhanHijriMonth
{
    public int Number { get; set; }

    /// <summary>Transliterated name, e.g. "Rabīʿ al-awwal".</summary>
    public string En { get; set; } = string.Empty;

    /// <summary>Arabic name, e.g. رَبيع الأوّل.</summary>
    public string Ar { get; set; } = string.Empty;

    /// <summary>Length of the month, 29 or 30 days.</summary>
    public int Days { get; set; }
}

public sealed class AladhanGregorianMonth
{
    public int Number { get; set; }

    public string En { get; set; } = string.Empty;
}

public sealed class AladhanDesignation
{
    /// <summary>"AH" or "AD".</summary>
    public string Abbreviated { get; set; } = string.Empty;

    public string Expanded { get; set; } = string.Empty;
}

/// <summary>Payload of /gToH and /hToG: the same day in both calendars.</summary>
public sealed class AladhanDateConversion
{
    public AladhanHijriDate? Hijri { get; set; }

    public AladhanGregorianDate? Gregorian { get; set; }
}
