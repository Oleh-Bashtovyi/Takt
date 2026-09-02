using FluentResults;
using Takt.Application.Auth.Dtos;

namespace Takt.Application.Auth;

public interface IAuthService
{
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct);

    Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken ct);

    Task<Result<AuthResponse>> RefreshAsync(RefreshRequest request, CancellationToken ct);

    Task<Result> LogoutAsync(LogoutRequest request, CancellationToken ct);

    Task<Result<CurrentUserResponse>> GetCurrentAsync(CancellationToken ct);
}
