using Takt.Domain.Entities;

namespace Takt.Domain.Repositories;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> ListByUserAsync(Guid userId, CancellationToken ct);

    Task<Category?> GetByIdAsync(Guid id, Guid userId, CancellationToken ct);

    Task<bool> NameExistsAsync(Guid userId, string name, Guid? excludingId, CancellationToken ct);

    Task<IReadOnlyDictionary<Guid, int>> GetTaskCountsByCategoryAsync(Guid userId, CancellationToken ct);

    Task<int> CountTasksAsync(Guid categoryId, CancellationToken ct);

    Task AddAsync(Category category, CancellationToken ct);

    void Remove(Category category);

    Task SaveChangesAsync(CancellationToken ct);
}
