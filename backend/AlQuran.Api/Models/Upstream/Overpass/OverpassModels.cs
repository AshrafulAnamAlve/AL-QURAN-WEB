namespace AlQuran.Api.Models.Upstream.Overpass;

/// <summary>Response body of an Overpass QL query run with [out:json].</summary>
public sealed class OverpassResponse
{
    public List<OverpassElement> Elements { get; set; } = [];
}

/// <summary>
/// One OSM element. A mosque may be mapped as a single point (node) or as a
/// building outline (way) or a multipolygon (relation), so the query asks for
/// all three with `nwr` and `out center`: nodes carry lat/lon directly, while
/// ways and relations carry a computed <see cref="Center"/> instead.
/// </summary>
public sealed class OverpassElement
{
    /// <summary>"node", "way" or "relation".</summary>
    public string Type { get; set; } = string.Empty;

    public long Id { get; set; }

    /// <summary>Set on nodes only.</summary>
    public double? Lat { get; set; }

    /// <summary>Set on nodes only.</summary>
    public double? Lon { get; set; }

    /// <summary>Set on ways and relations when the query used `out center`.</summary>
    public OverpassCenter? Center { get; set; }

    /// <summary>OSM tags. Sparse - many elements have no name or address.</summary>
    public Dictionary<string, string>? Tags { get; set; }

    /// <summary>Latitude wherever the provider put it, or null if absent.</summary>
    public double? ResolvedLat => Lat ?? Center?.Lat;

    /// <summary>Longitude wherever the provider put it, or null if absent.</summary>
    public double? ResolvedLon => Lon ?? Center?.Lon;
}

/// <summary>Computed centre point of a way or relation.</summary>
public sealed class OverpassCenter
{
    public double Lat { get; set; }

    public double Lon { get; set; }
}
