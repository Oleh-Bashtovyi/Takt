using Microsoft.EntityFrameworkCore;
using Takt.Domain.Entities;
using Takt.Domain.Repositories;

namespace Takt.Infrastructure.Persistence.Repositories;

internal sealed class CategoryRepository(AppDbContext context) : ICategoryRepository
{
    public async Task<IReadOnlyList<Category>> ListByUserAsync(Guid userId, CancellationToken ct) =>
        await context.Categories
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public Task<Category?> GetByIdAsync(Guid id, Guid userId, CancellationToken ct) =>
        context.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId, ct);

    public Task<bool> NameExistsAsync(Guid userId, string name, Guid? excludingId, CancellationToken ct) =>
        context.Categories.AnyAsync(
            c => c.UserId == userId && c.Name == name && (excludingId == null || c.Id != excludingId),
            ct);

    public async Task<IReadOnlyDictionary<Guid, int>> GetTaskCountsByCategoryAsync(Guid userId, CancellationToken ct)
    {
        var counts = await context.Tasks
            .Where(t => t.UserId == userId && t.CategoryId != null)
            .GroupBy(t => t.CategoryId!.Value)
            .Select(g => new { CategoryId = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        return counts.ToDictionary(x => x.CategoryId, x => x.Count);
    }

    public Task<int> CountTasksAsync(Guid categoryId, CancellationToken ct) =>
        context.Tasks.CountAsync(t => t.CategoryId == categoryId, ct);

    public async Task AddAsync(Category category, CancellationToken ct) =>
        await context.Categories.AddAsync(category, ct);

    public void Remove(Category category) => context.Categories.Remove(category);

    public Task SaveChangesAsync(CancellationToken ct) => context.SaveChangesAsync(ct);
}
