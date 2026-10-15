namespace AlQuran.Api.Models.Common;

/// <summary>
/// Thrown when a request reaches a service with values that cannot be honoured
/// (surah 0, latitude 500, an unknown reciter). Becomes a 400 response.
/// </summary>
public sealed class RequestValidationException : Exception
{
    public RequestValidationException(string message, string? parameterName = null)
        : base(message)
    {
        ParameterName = parameterName;
    }

    public string? ParameterName { get; }
}
