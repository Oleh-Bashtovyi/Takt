using Takt.Domain.Common;
using Takt.Domain.Entities;
using Takt.Domain.Tasks;

namespace Takt.Domain.Repositories;

public interface ITodoTaskRepository
{
    Task<PaginatedResult<TodoTask>> GetPagedAsync(Guid userId, TaskQuery query, CancellationToken ct);

    Task<TodoTask?> GetByIdAsync(Guid id, Guid userId, CancellationToken ct);

    Task AddAsync(TodoTask task, CancellationToken ct);

    void Remove(TodoTask task);

    Task SaveChangesAsync(CancellationToken ct);
}
