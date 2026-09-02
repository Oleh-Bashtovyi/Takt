namespace Takt.Application.Categories.Dtos;

public sealed record CategoryResponse(
    Guid Id,
    string Name,
    int TaskCount,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);
