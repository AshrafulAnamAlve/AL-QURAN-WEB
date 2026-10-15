namespace AlQuran.Api.Services.Abstractions;

/// <summary>
/// Thin abstraction over the in-memory cache. Services depend on this instead of
/// IMemoryCache directly, so we can swap in a distributed cache later without
/// touching a single service.
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Returns the cached value for <paramref name="key"/>, or runs
    /// <paramref name="factory"/> and caches its result for <paramref name="duration"/>.
    /// Failures are never cached.
    /// </summary>
    Task<T> GetOrCreateAsync<T>(
        string key,
        TimeSpan duration,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken cancellationToken = default);

    /// <summary>Removes one entry. Used by cache-busting admin/debug paths.</summary>
    void Remove(string key);
}
