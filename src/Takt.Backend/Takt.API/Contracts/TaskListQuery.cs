using Takt.Domain.Common;
using Takt.Domain.Tasks;

namespace Takt.API.Contracts;

public sealed record TaskListQuery
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = PaginationConstants.DefaultPageSize;
    public string? Search { get; init; }
    public Guid? CategoryId { get; init; }
    public bool? IsCompleted { get; init; }
    public TaskSortField SortBy { get; init; } = TaskSortField.CreatedAt;
    public bool SortDescending { get; init; } = true;

    public TaskQuery ToDomain() => new()
    {
        Pagination = new PaginationRequest(Page, PageSize),
        Search = Search,
        CategoryId = CategoryId,
        IsCompleted = IsCompleted,
        SortBy = SortBy,
        SortDescending = SortDescending
    };
}
