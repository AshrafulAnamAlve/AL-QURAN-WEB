using System.Net;

namespace AlQuran.Api.Models.Common;

/// <summary>
/// Thrown when an upstream (third-party) API fails, times out or answers with
/// something we cannot parse. The exception middleware turns this into a clean
/// 502/504 ProblemDetails response so the Angular app can show a retry button
/// instead of a blank page.
/// </summary>
public sealed class ExternalApiException : Exception
{
    public ExternalApiException(
        string serviceName,
        string message,
        HttpStatusCode? upstreamStatusCode = null,
        Exception? innerException = null)
        : base(message, innerException)
    {
        ServiceName = serviceName;
        UpstreamStatusCode = upstreamStatusCode;
    }

    /// <summary>Which upstream service failed, e.g. "AlQuran.cloud".</summary>
    public string ServiceName { get; }

    /// <summary>Status code the upstream returned, when there was one.</summary>
    public HttpStatusCode? UpstreamStatusCode { get; }

    /// <summary>True when retrying the same request could plausibly succeed.</summary>
    public bool IsRetryable =>
        UpstreamStatusCode is null
        or HttpStatusCode.RequestTimeout
        or HttpStatusCode.TooManyRequests
        or HttpStatusCode.InternalServerError
        or HttpStatusCode.BadGateway
        or HttpStatusCode.ServiceUnavailable
        or HttpStatusCode.GatewayTimeout;
}
