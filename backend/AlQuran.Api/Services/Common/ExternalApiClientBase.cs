using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AlQuran.Api.Models.Common;

namespace AlQuran.Api.Services.Common;

/// <summary>
/// Shared plumbing for every service that talks to a third-party API.
/// It does one job well: perform a request and either return a deserialised
/// payload or throw a descriptive <see cref="ExternalApiException"/>.
/// No service should ever have to write raw try/catch around HttpClient again.
/// </summary>
public abstract class ExternalApiClientBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
    };

    protected ExternalApiClientBase(HttpClient httpClient, ILogger logger, string serviceName)
    {
        HttpClient = httpClient;
        Logger = logger;
        ServiceName = serviceName;
    }

    protected HttpClient HttpClient { get; }

    protected ILogger Logger { get; }

    /// <summary>Friendly upstream name used in logs and error messages.</summary>
    protected string ServiceName { get; }

    /// <summary>GET a relative URL and deserialise the JSON body into <typeparamref name="T"/>.</summary>
    protected Task<T> GetJsonAsync<T>(string relativeUrl, CancellationToken cancellationToken)
        => SendJsonAsync<T>(new HttpRequestMessage(HttpMethod.Get, relativeUrl), cancellationToken);

    /// <summary>Send a prepared request and deserialise the JSON body into <typeparamref name="T"/>.</summary>
    protected async Task<T> SendJsonAsync<T>(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var target = request.RequestUri?.ToString() ?? "(relative)";

        try
        {
            Logger.LogDebug("{Service}: {Method} {Url}", ServiceName, request.Method, target);

            using var response = await HttpClient
                .SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken)
                .ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                var body = await SafeReadAsync(response, cancellationToken).ConfigureAwait(false);
                Logger.LogWarning(
                    "{Service} returned {StatusCode} for {Url}. Body: {Body}",
                    ServiceName, (int)response.StatusCode, target, body);

                throw new ExternalApiException(
                    ServiceName,
                    BuildUpstreamMessage(response.StatusCode),
                    response.StatusCode);
            }

            var payload = await response.Content
                .ReadFromJsonAsync<T>(JsonOptions, cancellationToken)
                .ConfigureAwait(false);

            if (payload is null)
            {
                throw new ExternalApiException(
                    ServiceName,
                    $"{ServiceName} returned an empty response.",
                    response.StatusCode);
            }

            return payload;
        }
        catch (ExternalApiException)
        {
            throw;
        }
        catch (JsonException ex)
        {
            Logger.LogError(ex, "{Service}: could not parse the response from {Url}", ServiceName, target);
            throw new ExternalApiException(
                ServiceName,
                $"{ServiceName} sent a response this app could not understand.",
                HttpStatusCode.BadGateway,
                ex);
        }
        catch (OperationCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            // Cancellation we did not ask for means the upstream call timed out.
            Logger.LogWarning(ex, "{Service}: request to {Url} timed out", ServiceName, target);
            throw new ExternalApiException(
                ServiceName,
                $"{ServiceName} took too long to respond.",
                HttpStatusCode.GatewayTimeout,
                ex);
        }
        catch (HttpRequestException ex)
        {
            Logger.LogError(ex, "{Service}: network failure calling {Url}", ServiceName, target);
            throw new ExternalApiException(
                ServiceName,
                $"Could not reach {ServiceName}. Please check your internet connection and try again.",
                ex.StatusCode,
                ex);
        }
    }

    private string BuildUpstreamMessage(HttpStatusCode statusCode) => statusCode switch
    {
        HttpStatusCode.NotFound => $"{ServiceName} has no data for this request.",
        HttpStatusCode.TooManyRequests => $"{ServiceName} is rate limiting us right now. Please try again in a moment.",
        HttpStatusCode.ServiceUnavailable => $"{ServiceName} is temporarily unavailable. Please try again shortly.",
        _ => $"{ServiceName} responded with an error ({(int)statusCode}).",
    };

    private static async Task<string> SafeReadAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        try
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
            return body.Length > 500 ? body[..500] + "..." : body;
        }
        catch
        {
            return "(body unavailable)";
        }
    }
}
