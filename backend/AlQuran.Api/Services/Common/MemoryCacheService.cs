using System.Collections.Concurrent;
using AlQuran.Api.Services.Abstractions;
using Microsoft.Extensions.Caching.Memory;

namespace AlQuran.Api.Services.Common;

/// <summary>
/// IMemoryCache-backed <see cref="ICacheService"/>.
/// A per-key semaphore stops the "cache stampede" problem: if ten requests for
/// Surah Al-Baqarah arrive at once on a cold cache, only one of them calls the
/// upstream API and the other nine wait for its result.
/// </summary>
public sealed class MemoryCacheService : ICacheService, IDisposable
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<MemoryCacheService> _logger;
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

    public MemoryCacheService(IMemoryCache cache, ILogger<MemoryCacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<T> GetOrCreateAsync<T>(
        string key,
        TimeSpan duration,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(key, out T? cached) && cached is not null)
        {
            _logger.LogDebug("Cache hit for {CacheKey}", key);
            return cached;
        }

        var gate = _locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            // Someone else may have populated it while we waited on the gate.
            if (_cache.TryGetValue(key, out cached) && cached is not null)
            {
                return cached;
            }

            _logger.LogDebug("Cache miss for {CacheKey}, calling factory", key);
            var value = await factory(cancellationToken).ConfigureAwait(false);

            if (value is not null)
            {
                _cache.Set(key, value, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = duration,
                    // Every entry counts as 1 against CacheOptions.SizeLimit.
                    Size = 1,
                });
            }

            return value;
        }
        finally
        {
            gate.Release();
            // Keep the lock table from growing forever.
            if (gate.CurrentCount == 1 && _locks.TryRemove(key, out var removed) && removed != gate)
            {
                _locks.TryAdd(key, removed);
            }
        }
    }

    public void Remove(string key) => _cache.Remove(key);

    public void Dispose()
    {
        foreach (var gate in _locks.Values)
        {
            gate.Dispose();
        }

        _locks.Clear();
    }
}
