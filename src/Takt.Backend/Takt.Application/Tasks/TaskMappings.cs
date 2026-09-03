using Takt.Application.Tasks.Dtos;
using Takt.Domain.Entities;

namespace Takt.Application.Tasks;

internal static class TaskMappings
{
    public static TaskResponse ToResponse(this TodoTask task) =>
        new(
            task.Id,
            task.Title,
            task.Description,
            task.IsCompleted,
            task.Priority,
            task.DueDateUtc,
            task.CategoryId,
            task.Category?.Name,
            task.CompletedAtUtc,
            task.CreatedAtUtc,
            task.UpdatedAtUtc);
}
