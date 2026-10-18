namespace AlQuran.Api.DTOs.Tasks;

public sealed record DailyTaskLogDto(
    DateTime DateUtc,
    int SurahNumber,
    int AyahNumber,
    int AyahsRead,
    int MinutesListened,
    bool GoalMet
);

public sealed record DailyTaskLogResponseDto(
    bool Success,
    string Message,
    DateTime TimestampUtc
);
