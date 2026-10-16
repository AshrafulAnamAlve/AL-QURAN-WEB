using System.Text.Encodings.Web;
using System.Text.Json.Serialization;
using System.Text.Unicode;
using AlQuran.Api.Configuration;
using AlQuran.Api.Extensions;
using AlQuran.Api.Middleware;
using AlQuran.Api.Services.Abstractions;
using AlQuran.Api.Services.Common;
using AlQuran.Api.Services.Calendar;
using AlQuran.Api.Services.Location;
using AlQuran.Api.Services.Meta;
using AlQuran.Api.Services.Mosque;
using AlQuran.Api.Services.Prayer;
using AlQuran.Api.Services.Quran;
using AlQuran.Api.Data;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Configuration (bound and validated at startup)
// ---------------------------------------------------------------------------
builder.Services.AddAlQuranOptions(builder.Configuration);

var cacheOptions = builder.Configuration
    .GetSection(CacheOptions.SectionName)
    .Get<CacheOptions>() ?? new CacheOptions();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<AlQuranDbContext>(options =>
        options.UseSqlServer(connectionString, sqlServerOptions =>
        {
            sqlServerOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null);
        }));
}

// ---------------------------------------------------------------------------
// Cross-cutting services
// ---------------------------------------------------------------------------
builder.Services.AddMemoryCache(options => options.SizeLimit = cacheOptions.SizeLimit);
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();

builder.Services.AddExternalApiClients(builder.Configuration);
builder.Services.AddAlQuranCors(builder.Configuration);
builder.Services.AddAlQuranRateLimiting();
builder.Services.AddResponseCaching();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes
        .Concat(["application/json", "application/problem+json"]);
});

// ---------------------------------------------------------------------------
// Feature services, one per domain.
// All are scoped: they hold no state between requests, and the caching that
// matters lives in the singleton ICacheService behind them.
// ---------------------------------------------------------------------------
builder.Services.AddSingleton<AudioUrlBuilder>();

builder.Services.AddScoped<IMetaService, MetaService>();
builder.Services.AddScoped<IQuranService, QuranService>();
builder.Services.AddScoped<IPrayerService, PrayerService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<IMosqueService, MosqueService>();
builder.Services.AddScoped<ILocationService, LocationService>();

// ---------------------------------------------------------------------------
// MVC / JSON
// ---------------------------------------------------------------------------
builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        // Nulls are written, not omitted. If a DTO says `SurahLinkDto? Next`, the
        // JSON always carries "next": null rather than dropping the key, so the
        // TypeScript models on the other side match the C# records exactly.
        // The saving from omitting them would be a few bytes; the cost would be
        // a class of "undefined vs null" bugs in the client.
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;

        // Without this, System.Text.Json escapes every Arabic and Bangla character
        // as \uXXXX, which roughly triples the size of Quran payloads and makes
        // responses unreadable while debugging.
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
    });

builder.Services.AddOpenApi();

var app = builder.Build();

// ---------------------------------------------------------------------------
// Database migration & table initialization (runs in background to ensure instant startup)
// ---------------------------------------------------------------------------
if (!string.IsNullOrWhiteSpace(connectionString))
{
    _ = Task.Run(() =>
    {
        try
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AlQuranDbContext>();
            db.Database.Migrate();
            app.Logger.LogInformation("Database migration executed successfully.");
        }
        catch (Exception ex)
        {
            app.Logger.LogWarning(ex, "Background database migration note: {Message}", ex.Message);
        }
    });
}

// ---------------------------------------------------------------------------
// HTTP pipeline. Order matters.
// ---------------------------------------------------------------------------
app.UseResponseCompression();

// Sits as early as possible so every downstream failure becomes ProblemDetails.
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Interactive API explorer accessible in dev and production
app.MapOpenApi();
app.MapScalarApiReference(options => options
    .WithTitle("Al-Quran Web API")
    .WithTheme(ScalarTheme.Purple));

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts();
}

app.UseCors(CorsOptions.PolicyName);
app.UseRateLimiter();
app.UseResponseCaching();

app.MapControllers();

// Friendly landing response so hitting the root URL is never a blank 404.
app.MapGet("/", (IHostEnvironment env) => Results.Ok(new
{
    name = "Al-Quran Web API",
    status = "running",
    environment = env.EnvironmentName,
    docs = "/scalar",
    health = "/api/health",
    meta = "/api/meta",
    database = !string.IsNullOrWhiteSpace(connectionString) ? "Configured" : "None",
})).ExcludeFromDescription();

app.Run();

public partial class Program { }
