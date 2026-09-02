using Takt.Application.Categories.Dtos;
using Takt.Domain.Entities;

namespace Takt.Application.Categories;

internal static class CategoryMappings
{
    public static CategoryResponse ToResponse(this Category category, int taskCount) =>
        new(category.Id, category.Name, taskCount, category.CreatedAtUtc, category.UpdatedAtUtc);
}
