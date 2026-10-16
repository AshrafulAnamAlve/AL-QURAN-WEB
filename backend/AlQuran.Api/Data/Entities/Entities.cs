namespace AlQuran.Api.Data.Entities;

public class UserBookmark
{
    public int Id { get; set; }
    public string? ClientId { get; set; }
    public int SurahNumber { get; set; }
    public int AyahNumber { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class UserPreference
{
    public int Id { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string Language { get; set; } = "bn";
    public string ReciterId { get; set; } = "ar.alafasy";
    public int PrayerMethodId { get; set; } = 1;
    public string Theme { get; set; } = "system";
    public string? City { get; set; }
    public string? Country { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class MosqueFeedback
{
    public int Id { get; set; }
    public string MosqueId { get; set; } = string.Empty;
    public string MosqueName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string FeedbackText { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class DailyAyahLog
{
    public int Id { get; set; }
    public DateTime DateUtc { get; set; }
    public int SurahNumber { get; set; }
    public int AyahNumber { get; set; }
    public DateTime SelectedAtUtc { get; set; } = DateTime.UtcNow;
}
