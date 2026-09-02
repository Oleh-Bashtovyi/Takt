using Takt.Domain.Entities;

namespace Takt.Application.Auth;

public interface ITokenService
{
    AccessToken CreateAccessToken(User user);

    RefreshTokenValue GenerateRefreshToken();
}

public sealed record AccessToken(string Value, DateTime ExpiresAtUtc);

public sealed record RefreshTokenValue(string Value, DateTime ExpiresAtUtc);
