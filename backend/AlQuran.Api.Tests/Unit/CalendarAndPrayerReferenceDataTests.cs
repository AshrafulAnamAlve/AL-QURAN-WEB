using AlQuran.Api.Services.Calendar;
using AlQuran.Api.Services.Prayer;
using Xunit;

namespace AlQuran.Api.Tests.Unit;

public class CalendarAndPrayerReferenceDataTests
{
    [Fact]
    public void HijriMonths_Has12Months_AndRamadanIsMonthNine()
    {
        Assert.Equal(12, HijriMonths.All.Count);
        Assert.Equal(9, HijriMonths.RamadanNumber);

        var ramadan = HijriMonths.Get(9);
        Assert.Equal("Ramadan", ramadan.NameEn);
        Assert.Equal("রমজান", ramadan.NameBn);
    }

    [Fact]
    public void IslamicEvents_ContainsMajorObservances()
    {
        var events = IslamicEvents.All;
        Assert.NotEmpty(events);
        Assert.Contains(events, e => e.Key == "ashura");
        Assert.Contains(events, e => e.Key == "eid-al-fitr");
        Assert.Contains(events, e => e.Key == "eid-al-adha");
        Assert.Contains(events, e => e.Key == "laylat-al-qadr");
    }

    [Fact]
    public void PrayerNames_ContainsEightStandardEntries_AndFiveCorePrayersMarked()
    {
        var entries = PrayerNames.All;
        Assert.Equal(8, entries.Count);
        Assert.Equal(5, PrayerNames.Prayers.Count());

        var fajr = entries.First(e => e.Key == "fajr");
        Assert.True(fajr.IsPrayer);
        Assert.Equal("ফজর", fajr.BanglaName);

        var sunrise = entries.First(e => e.Key == "sunrise");
        Assert.False(sunrise.IsPrayer);
        Assert.Equal("সূর্যোদয়", sunrise.BanglaName);
    }
}
