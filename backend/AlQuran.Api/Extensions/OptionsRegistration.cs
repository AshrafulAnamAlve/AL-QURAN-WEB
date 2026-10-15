using AlQuran.Api.Configuration;

namespace AlQuran.Api.Extensions;

/// <summary>Binds and validates every configuration section used by the app.</summary>
public static class OptionsRegistration
{
    public static IServiceCollection AddAlQuranOptions(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ValidateOnStart means a typo in appsettings.json fails loudly at startup
        // instead of producing a confusing NullReferenceException on first request.
        services.AddOptions<QuranApiOptions>()
            .Bind(configuration.GetSection(QuranApiOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<QuranAudioOptions>()
            .Bind(configuration.GetSection(QuranAudioOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<PrayerApiOptions>()
            .Bind(configuration.GetSection(PrayerApiOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<GeocodingApiOptions>()
            .Bind(configuration.GetSection(GeocodingApiOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<OverpassApiOptions>()
            .Bind(configuration.GetSection(OverpassApiOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<CacheOptions>()
            .Bind(configuration.GetSection(CacheOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<CorsOptions>()
            .Bind(configuration.GetSection(CorsOptions.SectionName))
            .Validate(
                options => options.AllowedOrigins.Count > 0,
                "Cors:AllowedOrigins must list at least one frontend origin.")
            .ValidateOnStart();

        return services;
    }
}
