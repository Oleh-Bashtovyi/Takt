using Microsoft.EntityFrameworkCore;
using Takt.Domain.Common;
using Takt.Domain.Entities;
using Takt.Domain.Enums;
using Takt.Domain.Repositories;
using Takt.Domain.Tasks;

namespace Takt.Infrastructure.Persistence.Repositories;

internal sealed class TodoTaskRepository(AppDbContext context) : ITodoTaskRepository
{
    public async Task<PaginatedResult<TodoTask>> GetPagedAsync(Guid userId, TaskQuery query, CancellationToken ct)
    {
        var filtered = context.Tasks
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();

            filtered = filtered.Where(t =>
                t.Title.Contains(term) || (t.Description != null && t.Description.Contains(term)));
        }

        if (query.CategoryId is not null)
        {
            filtered = filtered.Where(t => t.CategoryId == query.CategoryId);
        }

        if (query.IsCompleted is not null)
        {
            filtered = query.IsCompleted.Value
                ? filtered.Where(t => t.CompletedAtUtc != null)
                : filtered.Where(t => t.CompletedAtUtc == null);
        }

        var total = await filtered.LongCountAsync(ct);

        var items = await Sort(filtered, query)
            .Skip(query.Pagination.Skip)
            .Take(query.Pagination.Take)
            .ToListAsync(ct);

        return new PaginatedResult<TodoTask>(items, query.Pagination.Page, query.Pagination.PageSize, total);
    }

    public Task<TodoTask?> GetByIdAsync(Guid id, Guid userId, CancellationToken ct) =>
        context.Tasks
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);

    public async Task AddAsync(TodoTask task, CancellationToken ct) =>
        await context.Tasks.AddAsync(task, ct);

    public void Remove(TodoTask task) => context.Tasks.Remove(task);

    public Task SaveChangesAsync(CancellationToken ct) => context.SaveChangesAsync(ct);

    private static IOrderedQueryable<TodoTask> Sort(IQueryable<TodoTask> query, TaskQuery request)
    {
        var descending = request.SortDescending;

        return request.SortBy switch
        {
            TaskSortField.DueDate => descending
                ? query.OrderByDescending(t => t.DueDateUtc)
                : query.OrderBy(t => t.DueDateUtc),
            TaskSortField.Priority => descending
                ? query.OrderByDescending(t => t.Priority == TaskPriority.High ? 2 : t.Priority == TaskPriority.Medium ? 1 : 0)
                : query.OrderBy(t => t.Priority == TaskPriority.High ? 2 : t.Priority == TaskPriority.Medium ? 1 : 0),
            TaskSortField.Title => descending
                ? query.OrderByDescending(t => t.Title)
                : query.OrderBy(t => t.Title),
            _ => descending
                ? query.OrderByDescending(t => t.CreatedAtUtc)
                : query.OrderBy(t => t.CreatedAtUtc),
        };
    }
}
