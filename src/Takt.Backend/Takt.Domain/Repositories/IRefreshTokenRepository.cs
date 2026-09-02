using Takt.Domain.Entities;

namespace Takt.Domain.Repositories;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByRawTokenAsync(string rawToken, CancellationToken ct);

    Task AddAsync(Guid userId, string rawToken, DateTime expiresAtUtc, CancellationToken ct);

    Task RevokeActiveByUserAsync(Guid userId, CancellationToken ct);

    Task SaveChangesAsync(CancellationToken ct);
}
