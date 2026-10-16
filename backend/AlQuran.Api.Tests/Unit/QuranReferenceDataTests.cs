using AlQuran.Api.Models.Common;
using AlQuran.Api.Services.Quran;
using Xunit;

namespace AlQuran.Api.Tests.Unit;

public class QuranReferenceDataTests
{
    [Fact]
    public void SurahNames_Has114Surahs_And6236TotalAyahs()
    {
        Assert.Equal(114, SurahNames.SurahCount);
        Assert.Equal(6236, SurahNames.TotalAyahCount);
        Assert.Equal(114, SurahNames.All.Count);
    }

    [Theory]
    [InlineData(1, 1, 1)]
    [InlineData(1, 7, 7)]
    [InlineData(2, 1, 8)]
    [InlineData(2, 255, 262)]
    [InlineData(114, 6, 6236)]
    public void AyahPositions_ToGlobalAndFromGlobal_RoundtripsAccurately(int surah, int ayah, int expectedGlobal)
    {
        var global = AyahPositions.ToGlobal(surah, ayah);
        Assert.Equal(expectedGlobal, global);

        var (s, a) = AyahPositions.FromGlobal(expectedGlobal);
        Assert.Equal(surah, s);
        Assert.Equal(ayah, a);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(115, 1)]
    [InlineData(1, 0)]
    [InlineData(1, 8)]
    public void AyahPositions_InvalidReference_ThrowsValidationException(int surah, int ayah)
    {
        Assert.Throws<RequestValidationException>(() => AyahPositions.ToGlobal(surah, ayah));
    }

    [Fact]
    public void JuzBoundaries_Has30Juz_AndStartsAtCorrectPositions()
    {
        for (var juz = 1; juz <= 30; juz++)
        {
            var start = JuzBoundaries.Get(juz);
            Assert.Equal(juz, start.Juz);
            Assert.InRange(start.Surah, 1, 114);
            Assert.True(start.Ayah >= 1);

            var count = AyahPositions.AyahCountInJuz(juz);
            Assert.True(count > 0);
        }
    }

    [Fact]
    public void Reciters_ContainsVerifiedEntries()
    {
        var alafasy = Reciters.Find("ar.alafasy");
        Assert.NotNull(alafasy);
        Assert.Equal(128, alafasy.Bitrate);

        var abdulbasit = Reciters.Find("ar.abdulbasitmurattal");
        Assert.NotNull(abdulbasit);
        Assert.Equal(64, abdulbasit.Bitrate);
    }
}
