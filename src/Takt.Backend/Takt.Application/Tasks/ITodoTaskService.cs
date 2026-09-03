using FluentResults;
using Takt.Application.Tasks.Dtos;
using Takt.Domain.Common;
using Takt.Domain.Tasks;

namespace Takt.Application.Tasks;

public interface ITodoTaskService
{
    Task<PaginatedResult<TaskResponse>> GetPagedAsync(TaskQuery query, CancellationToken ct);

    Task<Result<TaskResponse>> GetByIdAsync(Guid id, CancellationToken ct);

    Task<Result<TaskResponse>> CreateAsync(CreateTaskRequest request, CancellationToken ct);

    Task<Result<TaskResponse>> UpdateAsync(Guid id, UpdateTaskRequest request, CancellationToken ct);

    Task<Result<TaskResponse>> UpdateCompletionAsync(Guid id, UpdateTaskCompletionRequest request, CancellationToken ct);

    Task<Result> DeleteAsync(Guid id, CancellationToken ct);
}
