namespace AlQuran.Api.DTOs.Mosque;

/// <summary>A mosque found near a point, from OpenStreetMap data.</summary>
/// <param name="Id">Stable identifier combining OSM type and id, e.g. "node/773452757".</param>
/// <param name="Name">
/// Mosque name. OpenStreetMap is volunteer-maintained and many entries carry no
/// name tag, in which case this falls back to a generic label.
/// </param>
/// <param name="HasName">False when the name above is a fallback rather than real data.</param>
/// <param name="Latitude">Latitude in decimal degrees.</param>
/// <param name="Longitude">Longitude in decimal degrees.</param>
/// <param name="DistanceMeters">Great-circle distance from the search point.</param>
/// <param name="Address">Assembled street address, when the tags allow one.</param>
/// <param name="Denomination">e.g. "sunni", when tagged.</param>
/// <param name="Website">Website, when tagged.</param>
/// <param name="Phone">Phone number, when tagged.</param>
/// <param name="OsmType">"node", "way" or "relation".</param>
/// <param name="OsmId">OpenStreetMap element id.</param>
/// <param name="MapUrl">Link to this element on openstreetmap.org.</param>
/// <param name="DirectionsUrl">Link that opens directions in the visitor's map app.</param>
public sealed record MosqueDto(
    string Id,
    string Name,
    bool HasName,
    double Latitude,
    double Longitude,
    double DistanceMeters,
    string? Address,
    string? Denomination,
    string? Website,
    string? Phone,
    string OsmType,
    long OsmId,
    string MapUrl,
    string DirectionsUrl);

/// <summary>Result of a nearby-mosque search.</summary>
/// <param name="Latitude">Latitude the search was centred on.</param>
/// <param name="Longitude">Longitude the search was centred on.</param>
/// <param name="RadiusMeters">Radius that was searched.</param>
/// <param name="Mosques">Matches, nearest first.</param>
/// <param name="Source">Which Overpass endpoint answered, useful when a mirror was used.</param>
/// <param name="Attribution">Required OpenStreetMap credit.</param>
/// <param name="Notice">Caveat about community-maintained data.</param>
public sealed record MosqueSearchDto(
    double Latitude,
    double Longitude,
    int RadiusMeters,
    IReadOnlyList<MosqueDto> Mosques,
    string Source,
    string Attribution,
    string Notice);
