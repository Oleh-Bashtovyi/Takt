using FluentResults;
using Takt.Application.Categories.Dtos;

namespace Takt.Application.Categories;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken ct);

    Task<Result<CategoryResponse>> GetByIdAsync(Guid id, CancellationToken ct);

    Task<Result<CategoryResponse>> CreateAsync(CreateCategoryRequest request, CancellationToken ct);

    Task<Result<CategoryResponse>> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct);

    Task<Result> DeleteAsync(Guid id, CancellationToken ct);
}
