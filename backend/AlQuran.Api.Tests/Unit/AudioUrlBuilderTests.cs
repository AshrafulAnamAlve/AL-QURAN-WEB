using AlQuran.Api.Configuration;
using AlQuran.Api.Models.Common;
using AlQuran.Api.Services.Quran;
using Microsoft.Extensions.Options;
using Xunit;

namespace AlQuran.Api.Tests.Unit;

public class AudioUrlBuilderTests
{
    private readonly AudioUrlBuilder _builder;

    public AudioUrlBuilderTests()
    {
        var options = Options.Create(new QuranAudioOptions
        {
            BaseUrl = "https://cdn.islamic.network/quran/audio",
            DefaultReciter = "ar.alafasy",
            Bitrate = 128
        });
        _builder = new AudioUrlBuilder(options);
    }

    [Fact]
    public void Build_WithDefaultReciter_ReturnsExpectedCdnUrl()
    {
        var url = _builder.Build(1);
        Assert.Equal("https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3", url);
    }

    [Theory]
    [InlineData("ar.alafasy", 1, "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3")]
    [InlineData("ar.abdulbasitmurattal", 255, "https://cdn.islamic.network/quran/audio/64/ar.abdulbasitmurattal/255.mp3")]
    [InlineData("ar.husary", 6236, "https://cdn.islamic.network/quran/audio/128/ar.husary/6236.mp3")]
    public void Build_WithNamedReciter_UsesReciterBitrateAndEdition(string reciter, int ayah, string expected)
    {
        var url = _builder.Build(ayah, reciter);
        Assert.Equal(expected, url);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(6237)]
    public void Build_WithOutOfRangeAyah_ThrowsValidationException(int ayah)
    {
        Assert.Throws<RequestValidationException>(() => _builder.Build(ayah));
    }

    [Theory]
    [InlineData("unverified.reciter")]
    [InlineData("invalid/path")]
    [InlineData("reciter..injection")]
    public void Build_WithInvalidReciter_ThrowsValidationException(string reciter)
    {
        Assert.Throws<RequestValidationException>(() => _builder.Build(1, reciter));
    }
}
