namespace AlQuran.Api.Models.Common;

/// <summary>Thrown when a valid-looking resource simply does not exist. Becomes a 404.</summary>
public sealed class ResourceNotFoundException : Exception
{
    public ResourceNotFoundException(string message) : base(message)
    {
    }
}
