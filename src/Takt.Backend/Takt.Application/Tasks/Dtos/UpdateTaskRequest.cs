using Takt.Domain.Enums;

namespace Takt.Application.Tasks.Dtos;

public sealed record UpdateTaskRequest(
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDateUtc,
    Guid? CategoryId);
