using Takt.Domain.Enums;

namespace Takt.Application.Tasks.Dtos;

public sealed record TaskResponse(
    Guid Id,
    string Title,
    string? Description,
    bool IsCompleted,
    TaskPriority Priority,
    DateTime? DueDateUtc,
    Guid? CategoryId,
    string? CategoryName,
    DateTime? CompletedAtUtc,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);
