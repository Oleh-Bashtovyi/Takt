using Microsoft.EntityFrameworkCore;
using Takt.Domain.Entities;
using Takt.Domain.Repositories;
using Takt.Infrastructure.Auth;

namespace Takt.Infrastructure.Persistence.Repositories;

internal sealed class RefreshTokenRepository(AppDbContext context) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByRawTokenAsync(string rawToken, CancellationToken ct)
    {
        var hash = RefreshTokenHasher.Hash(rawToken);
        return context.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, ct);
    }

    public async Task AddAsync(Guid userId, string rawToken, DateTime expiresAtUtc, CancellationToken ct)
    {
        var token = RefreshToken.Issue(userId, RefreshTokenHasher.Hash(rawToken), expiresAtUtc);
        await context.RefreshTokens.AddAsync(token, ct);
    }

    public async Task RevokeActiveByUserAsync(Guid userId, CancellationToken ct)
    {
        var active = await context.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAtUtc == null)
            .ToListAsync(ct);

        foreach (var token in active)
        {
            token.Revoke();
        }
    }

    public Task SaveChangesAsync(CancellationToken ct) => context.SaveChangesAsync(ct);
}
