namespace AlQuran.Api.DTOs.Common;

/// <summary>
/// Extra fields this API adds to the standard RFC 9457 ProblemDetails payload.
/// The Angular error interceptor reads these to decide whether to offer a
/// Retry button and which message to show the user.
/// </summary>
public static class ApiErrorExtensionKeys
{
    /// <summary>Stable machine readable error code, e.g. "upstream_unavailable".</summary>
    public const string ErrorCode = "errorCode";

    /// <summary>True when the same request could reasonably be retried.</summary>
    public const string Retryable = "retryable";

    /// <summary>Correlation id, also returned in the X-Correlation-Id header.</summary>
    public const string CorrelationId = "correlationId";

    /// <summary>Upstream provider that caused the failure, when applicable.</summary>
    public const string Service = "service";
}

/// <summary>Stable error codes shared with the frontend.</summary>
public static class ApiErrorCodes
{
    public const string ValidationFailed = "validation_failed";
    public const string NotFound = "not_found";
    public const string UpstreamUnavailable = "upstream_unavailable";
    public const string UpstreamTimeout = "upstream_timeout";
    public const string RateLimited = "rate_limited";
    public const string Unexpected = "unexpected_error";
}
