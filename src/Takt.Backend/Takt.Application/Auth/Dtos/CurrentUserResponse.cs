namespace Takt.Application.Auth.Dtos;

public sealed record CurrentUserResponse(Guid Id, string Email, string? DisplayName);
