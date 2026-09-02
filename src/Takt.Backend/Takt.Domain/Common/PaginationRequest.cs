namespace Takt.Domain.Common;

public sealed record PaginationRequest
{
    public int Page { get; }
    public int PageSize { get; }

    public PaginationRequest(int page = 1, int pageSize = PaginationConstants.DefaultPageSize)
    {
        Page = Math.Max(1, page);
        PageSize = Math.Clamp(pageSize, PaginationConstants.MinPageSize, PaginationConstants.MaxPageSize);
    }

    public int Skip => (Page - 1) * PageSize;
    public int Take => PageSize;
}
