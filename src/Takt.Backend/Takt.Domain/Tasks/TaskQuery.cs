using Takt.Domain.Common;
using Takt.Domain.Enums;

namespace Takt.Domain.Tasks;

public sealed record TaskQuery
{
    public PaginationRequest Pagination { get; init; } = new();
    public string? Search { get; init; }
    public Guid? CategoryId { get; init; }
    public TodoStatus? Status { get; init; }
    public TaskSortField SortBy { get; init; } = TaskSortField.CreatedAt;
    public bool SortDescending { get; init; } = true;
}
