using FluentResults;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Takt.Application.Auth.Dtos;
using Takt.Application.Common.Errors;
using Takt.Application.Common.Identity;
using Takt.Domain.Entities;
using Takt.Domain.Repositories;

namespace Takt.Application.Auth;

internal sealed class AuthService(
    UserManager<User> userManager,
    ITokenService tokenService,
    IRefreshTokenRepository refreshTokens,
    ICurrentUser currentUser,
    IValidator<RegisterRequest> registerValidator,
    IValidator<LoginRequest> loginValidator) : IAuthService
{
    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        var validation = await registerValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return Result.Fail<AuthResponse>(ValidationError.FromValidationResult(validation));
        }

        var email = request.Email.Trim();
        var user = new User
        {
            UserName = email,
            Email = email,
            DisplayName = request.DisplayName?.Trim(),
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return Result.Fail<AuthResponse>(ToError(result));
        }

        return await IssueAsync(user, ct);
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var validation = await loginValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return Result.Fail<AuthResponse>(ValidationError.FromValidationResult(validation));
        }

        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return Result.Fail<AuthResponse>(new AuthenticationError("Invalid email or password."));
        }

        return await IssueAsync(user, ct);
    }

    public async Task<Result<AuthResponse>> RefreshAsync(RefreshRequest request, CancellationToken ct)
    {
        var token = await refreshTokens.GetByRawTokenAsync(request.RefreshToken, ct);
        if (token is null)
        {
            return Result.Fail<AuthResponse>(new AuthenticationError("Invalid refresh token."));
        }

        if (!token.IsActive)
        {
            await refreshTokens.RevokeActiveByUserAsync(token.UserId, ct);
            await refreshTokens.SaveChangesAsync(ct);
            return Result.Fail<AuthResponse>(new AuthenticationError("Refresh token is no longer valid."));
        }

        var user = await userManager.FindByIdAsync(token.UserId.ToString());
        if (user is null)
        {
            return Result.Fail<AuthResponse>(new AuthenticationError("Invalid refresh token."));
        }

        token.Revoke();
        return await IssueAsync(user, ct);
    }

    public async Task<Result> LogoutAsync(LogoutRequest request, CancellationToken ct)
    {
        var token = await refreshTokens.GetByRawTokenAsync(request.RefreshToken, ct);
        if (token is not null && token.IsActive)
        {
            token.Revoke();
            await refreshTokens.SaveChangesAsync(ct);
        }

        return Result.Ok();
    }

    public async Task<Result<CurrentUserResponse>> GetCurrentAsync(CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(currentUser.Id.ToString());
        if (user is null)
        {
            return Result.Fail<CurrentUserResponse>(new AuthenticationError("User not found."));
        }

        return Result.Ok(new CurrentUserResponse(user.Id, user.Email!, user.DisplayName));
    }

    private async Task<Result<AuthResponse>> IssueAsync(User user, CancellationToken ct)
    {
        var access = tokenService.CreateAccessToken(user);
        var refresh = tokenService.GenerateRefreshToken();

        await refreshTokens.AddAsync(user.Id, refresh.Value, refresh.ExpiresAtUtc, ct);
        await refreshTokens.SaveChangesAsync(ct);

        return Result.Ok(new AuthResponse(
            access.Value,
            access.ExpiresAtUtc,
            refresh.Value,
            refresh.ExpiresAtUtc,
            new AuthUser(user.Id, user.Email!, user.DisplayName)));
    }

    private static Error ToError(IdentityResult result)
    {
        if (result.Errors.Any(e => e.Code is "DuplicateUserName" or "DuplicateEmail"))
        {
            return new ConflictError("An account with this email already exists.");
        }

        var messages = result.Errors.Select(e => e.Description).ToArray();
        return ValidationError.FromFailures(new Dictionary<string, string[]> { ["Password"] = messages });
    }
}
