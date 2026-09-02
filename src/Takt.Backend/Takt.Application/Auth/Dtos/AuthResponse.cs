namespace Takt.Application.Auth.Dtos;

public sealed record AuthUser(Guid Id, string Email, string? DisplayName);

public sealed record AuthResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAtUtc,
    string RefreshToken,
    DateTime RefreshTokenExpiresAtUtc,
    AuthUser User);
