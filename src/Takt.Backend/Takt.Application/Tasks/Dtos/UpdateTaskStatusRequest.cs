using Takt.Domain.Enums;

namespace Takt.Application.Tasks.Dtos;

public sealed record UpdateTaskStatusRequest(TodoStatus Status);
