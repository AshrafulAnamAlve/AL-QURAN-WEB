namespace AlQuran.Api.Models.Upstream.AlQuranCloud;

/// <summary>
/// Every AlQuran.cloud response is wrapped in this envelope.
/// These "upstream" types mirror the provider exactly and never leave the
/// service layer - controllers only ever see our own DTOs. That separation is
/// what makes swapping the provider a one-file change.
/// </summary>
public sealed class AlQuranEnvelope<T>
{
    public int Code { get; set; }

    public string Status { get; set; } = string.Empty;

    public T? Data { get; set; }
}
