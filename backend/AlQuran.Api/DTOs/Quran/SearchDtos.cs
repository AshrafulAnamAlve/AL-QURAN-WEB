namespace AlQuran.Api.DTOs.Quran;

/// <summary>One search hit.</summary>
/// <param name="SurahNumber">Surah the match is in.</param>
/// <param name="SurahEnglishName">English name of that surah.</param>
/// <param name="SurahBanglaName">Bangla name of that surah.</param>
/// <param name="NumberInSurah">Ayah number within the surah.</param>
/// <param name="GlobalNumber">Ayah number within the whole Quran.</param>
/// <param name="Text">The matched text, in the edition that was searched.</param>
/// <param name="Edition">Edition the match came from.</param>
/// <param name="Language">Language of that edition.</param>
public sealed record SearchMatchDto(
    int SurahNumber,
    string SurahEnglishName,
    string SurahBanglaName,
    int NumberInSurah,
    int GlobalNumber,
    string Text,
    string Edition,
    string Language);

/// <summary>Results of a Quran search.</summary>
/// <param name="Query">The term that was searched.</param>
/// <param name="Edition">The edition that was searched.</param>
/// <param name="TotalMatches">How many matches exist upstream, before the limit.</param>
/// <param name="Matches">The matches returned, capped by the requested limit.</param>
/// <param name="DirectReference">
/// Set when the query looked like an ayah reference such as "2:255" or "2 255",
/// so the client can offer to jump straight there instead of listing matches.
/// </param>
/// <param name="SurahMatches">
/// Surahs whose English or Bangla name matches the query, so searching
/// "kahf" or "কাহফ" finds the surah as well as the text.
/// </param>
public sealed record SearchResponseDto(
    string Query,
    string Edition,
    int TotalMatches,
    IReadOnlyList<SearchMatchDto> Matches,
    AyahReferenceDto? DirectReference,
    IReadOnlyList<SurahLinkDto> SurahMatches);

/// <summary>A translation or script edition that can be requested.</summary>
public sealed record EditionDto(
    string Identifier,
    string Language,
    string Name,
    string EnglishName,
    string Type,
    string Direction);

/// <summary>
/// A reciter whose per-ayah recitation the audio CDN serves.
///
/// Only editions with one MP3 per ayah appear here, each with the bitrate that
/// actually serves it - see <c>Services/Quran/Reciters.cs</c> for why both
/// filters are necessary. The browser fetches the audio directly, so it needs
/// the bitrate to build the URL itself.
/// </summary>
/// <param name="Identifier">Edition identifier, e.g. "ar.alafasy".</param>
/// <param name="Name">Arabic name of the reciter.</param>
/// <param name="EnglishName">Conventional English spelling of the name.</param>
/// <param name="Style">"Murattal" or "Mujawwad", or empty when unmarked.</param>
/// <param name="Bitrate">CDN bitrate folder for this reciter, in kbps.</param>
public sealed record ReciterDto(
    string Identifier,
    string Name,
    string EnglishName,
    string Style,
    int Bitrate);
