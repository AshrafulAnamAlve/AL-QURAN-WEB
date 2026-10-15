namespace AlQuran.Api.Models.Upstream.Aladhan;

/// <summary>Envelope used by every Aladhan response.</summary>
public sealed class AladhanEnvelope<T>
{
    public int Code { get; set; }

    public string Status { get; set; } = string.Empty;

    public T? Data { get; set; }
}
