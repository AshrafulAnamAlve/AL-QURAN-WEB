using System.Globalization;
using System.Threading.RateLimiting;
using AlQuran.Api.Configuration;
using AlQuran.Api.DTOs.Common;
using Microsoft.AspNetCore.RateLimiting;

namespace AlQuran.Api.Extensions;

/// <summary>CORS and rate limiting - the two guards that sit in front of every request.</summary>
public static class SecurityRegistration
{
    /// <summary>Stricter bucket for endpoints that hit slow or politeness-limited upstreams.</summary>
    public const string ExpensivePolicy = "expensive";

    public static IServiceCollection AddAlQuranCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Read the section directly: building a second service provider here would
        // duplicate every singleton in the app.
        var allowedOrigins = configuration
            .GetSection(CorsOptions.SectionName)
            .Get<CorsOptions>()?.AllowedOrigins ?? [];

        services.AddCors(options =>
        {
            options.AddPolicy(CorsOptions.PolicyName, policy =>
            {
                policy
                    .WithOrigins([.. allowedOrigins])
                    .WithHeaders("Content-Type", "Accept", "X-Correlation-Id")
                    .WithMethods("GET", "POST", "OPTIONS")
                    .WithExposedHeaders("X-Correlation-Id")
                    .SetPreflightMaxAge(TimeSpan.FromHours(1));
            });
        });

        return services;
    }

    public static IServiceCollection AddAlQuranRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // Generous default: reading a long surah legitimately makes several calls.
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    ClientKey(context),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 300,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                    }));

            // Mosque search, geocoding and Quran search hit rate-limited upstreams.
            options.AddPolicy(ExpensivePolicy, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    ClientKey(context),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 30,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                    }));

            options.OnRejected = async (context, cancellationToken) =>
            {
                var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var value)
                    ? (int)value.TotalSeconds
                    : 60;

                context.HttpContext.Response.Headers.RetryAfter =
                    retryAfter.ToString(CultureInfo.InvariantCulture);
                context.HttpContext.Response.ContentType = "application/problem+json";

                await context.HttpContext.Response.WriteAsJsonAsync(new
                {
                    type = "https://tools.ietf.org/html/rfc9110#section-15.5.29",
                    title = "Too many requests",
                    status = StatusCodes.Status429TooManyRequests,
                    detail = "You are sending requests faster than this service allows. Please wait a moment.",
                    errorCode = ApiErrorCodes.RateLimited,
                    retryable = true,
                    retryAfterSeconds = retryAfter,
                }, cancellationToken);
            };
        });

        return services;
    }

    /// <summary>
    /// Partition key for the limiters. We never persist this - it lives only for
    /// the length of the rate limit window.
    /// </summary>
    private static string ClientKey(HttpContext context) =>
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
