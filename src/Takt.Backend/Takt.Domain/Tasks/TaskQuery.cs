using Takt.Domain.Common;

namespace Takt.Domain.Tasks;

public sealed record TaskQuery
{
    public PaginationRequest Pagination { get; init; } = new();
    public string? Search { get; init; }
    public Guid? CategoryId { get; init; }
    public bool? IsCompleted { get; init; }
    public TaskSortField SortBy { get; init; } = TaskSortField.CreatedAt;
    public bool SortDescending { get; init; } = true;
}
