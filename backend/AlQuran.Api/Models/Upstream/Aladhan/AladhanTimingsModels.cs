using System.Text.Json;

namespace AlQuran.Api.Models.Upstream.Aladhan;

/// <summary>Payload of /timings, /timingsByCity and each day of /calendar.</summary>
public sealed class AladhanTimingsData
{
    /// <summary>
    /// Prayer name to "HH:mm", e.g. {"Fajr":"04:25"}. Kept as a dictionary
    /// because the provider adds and renames keys (Imsak, Midnight, Firstthird,
    /// Lastthird) and a fixed class would silently drop them.
    /// </summary>
    public Dictionary<string, string> Timings { get; set; } = [];

    public AladhanDate? Date { get; set; }

    public AladhanMeta? Meta { get; set; }
}

/// <summary>How the times were calculated and for where.</summary>
public sealed class AladhanMeta
{
    public double Latitude { get; set; }

    public double Longitude { get; set; }

    /// <summary>IANA zone, e.g. "Asia/Dhaka". Needed to build a correct countdown.</summary>
    public string Timezone { get; set; } = string.Empty;

    public AladhanMethod? Method { get; set; }

    /// <summary>Returned as a word ("HANAFI"), not the number that was sent.</summary>
    public string? School { get; set; }

    public string? LatitudeAdjustmentMethod { get; set; }

    public string? MidnightMode { get; set; }
}

/// <summary>A calculation method, from meta.method and from /methods.</summary>
public sealed class AladhanMethod
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Twilight angles. Values are usually numbers but can be strings such as
    /// "90 min" (Umm al-Qura), so they stay as raw JSON and are formatted later.
    /// </summary>
    public Dictionary<string, JsonElement>? Params { get; set; }

    public AladhanMethodLocation? Location { get; set; }
}

public sealed class AladhanMethodLocation
{
    public double Latitude { get; set; }

    public double Longitude { get; set; }
}
