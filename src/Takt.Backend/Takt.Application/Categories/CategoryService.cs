using FluentResults;
using FluentValidation;
using Takt.Application.Categories.Dtos;
using Takt.Application.Common.Errors;
using Takt.Application.Common.Identity;
using Takt.Domain.Entities;
using Takt.Domain.Repositories;

namespace Takt.Application.Categories;

internal sealed class CategoryService(
    ICategoryRepository repository,
    ICurrentUser currentUser,
    IValidator<CreateCategoryRequest> createValidator,
    IValidator<UpdateCategoryRequest> updateValidator) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken ct)
    {
        var userId = currentUser.Id;
        var categories = await repository.ListByUserAsync(userId, ct);
        var counts = await repository.GetTaskCountsByCategoryAsync(userId, ct);

        return categories
            .Select(c => c.ToResponse(counts.GetValueOrDefault(c.Id)))
            .ToList();
    }

    public async Task<Result<CategoryResponse>> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var category = await repository.GetByIdAsync(id, currentUser.Id, ct);
        if (category is null)
        {
            return Result.Fail<CategoryResponse>(new NotFoundError($"Category '{id}' was not found."));
        }

        var count = await repository.CountTasksAsync(id, ct);
        return Result.Ok(category.ToResponse(count));
    }

    public async Task<Result<CategoryResponse>> CreateAsync(CreateCategoryRequest request, CancellationToken ct)
    {
        var validation = await createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return Result.Fail<CategoryResponse>(ValidationError.FromValidationResult(validation));
        }

        var userId = currentUser.Id;
        var name = request.Name.Trim();

        if (await repository.NameExistsAsync(userId, name, null, ct))
        {
            return Result.Fail<CategoryResponse>(new ConflictError($"A category named '{name}' already exists."));
        }

        var category = Category.Create(userId, name);
        await repository.AddAsync(category, ct);
        await repository.SaveChangesAsync(ct);

        return Result.Ok(category.ToResponse(0));
    }

    public async Task<Result<CategoryResponse>> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct)
    {
        var validation = await updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return Result.Fail<CategoryResponse>(ValidationError.FromValidationResult(validation));
        }

        var userId = currentUser.Id;
        var category = await repository.GetByIdAsync(id, userId, ct);
        if (category is null)
        {
            return Result.Fail<CategoryResponse>(new NotFoundError($"Category '{id}' was not found."));
        }

        var name = request.Name.Trim();
        if (await repository.NameExistsAsync(userId, name, id, ct))
        {
            return Result.Fail<CategoryResponse>(new ConflictError($"A category named '{name}' already exists."));
        }

        category.Rename(name);
        await repository.SaveChangesAsync(ct);

        var count = await repository.CountTasksAsync(id, ct);
        return Result.Ok(category.ToResponse(count));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct)
    {
        var category = await repository.GetByIdAsync(id, currentUser.Id, ct);
        if (category is null)
        {
            return Result.Fail(new NotFoundError($"Category '{id}' was not found."));
        }

        repository.Remove(category);
        await repository.SaveChangesAsync(ct);

        return Result.Ok();
    }
}
