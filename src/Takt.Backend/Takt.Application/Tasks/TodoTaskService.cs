using FluentResults;
using FluentValidation;
using Takt.Application.Common.Errors;
using Takt.Application.Common.Identity;
using Takt.Application.Tasks.Dtos;
using Takt.Domain.Common;
using Takt.Domain.Entities;
using Takt.Domain.Enums;
using Takt.Domain.Repositories;
using Takt.Domain.Tasks;

namespace Takt.Application.Tasks;

internal sealed class TodoTaskService(
    ITodoTaskRepository repository,
    ICategoryRepository categoryRepository,
    ICurrentUser currentUser,
    IValidator<CreateTaskRequest> createValidator,
    IValidator<UpdateTaskRequest> updateValidator,
    IValidator<UpdateTaskStatusRequest> statusValidator) : ITodoTaskService
{
    public async Task<PaginatedResult<TaskResponse>> GetPagedAsync(TaskQuery query, CancellationToken ct)
    {
        var page = await repository.GetPagedAsync(currentUser.Id, query, ct);
        var items = page.Items.Select(t => t.ToResponse()).ToList();

        return new PaginatedResult<TaskResponse>(items, page.Page, page.PageSize, page.TotalCount);
    }

    public async Task<Result<TaskResponse>> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var task = await repository.GetByIdAsync(id, currentUser.Id, ct);
        if (task is null)
        {
            return Result.Fail<TaskResponse>(new NotFoundError($"Task '{id}' was not found."));
        }

        return Result.Ok(task.ToResponse());
    }

    public async Task<Result<TaskResponse>> CreateAsync(CreateTaskRequest request, CancellationToken ct)
    {
        var validation = await createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return Result.Fail<TaskResponse>(ValidationError.FromValidationResult(validation));
        }

        var userId = currentUser.Id;

        var categoryError = await ValidateCategoryAsync(request.CategoryId, userId, ct);
        if (categoryError is not null)
        {
            return Result.Fail<TaskResponse>(categoryError);
        }

        var task = TodoTask.Create(
            userId,
            request.Title.Trim(),
            request.Description?.Trim(),
            request.Priority ?? TaskPriority.Medium,
            request.DueDateUtc,
            request.CategoryId,
            request.Status ?? TodoStatus.Todo);

        await repository.AddAsync(task, ct);
        await repository.SaveChangesAsync(ct);

        var created = await repository.GetByIdAsync(task.Id, userId, ct);
        return Result.Ok(created!.ToResponse());
    }

    public async Task<Result<TaskResponse>> UpdateAsync(Guid id, UpdateTaskRequest request, CancellationToken ct)
    {
        var validation = await updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return Result.Fail<TaskResponse>(ValidationError.FromValidationResult(validation));
        }

        var userId = currentUser.Id;
        var task = await repository.GetByIdAsync(id, userId, ct);
        if (task is null)
        {
            return Result.Fail<TaskResponse>(new NotFoundError($"Task '{id}' was not found."));
        }

        var categoryError = await ValidateCategoryAsync(request.CategoryId, userId, ct);
        if (categoryError is not null)
        {
            return Result.Fail<TaskResponse>(categoryError);
        }

        task.Update(
            request.Title.Trim(),
            request.Description?.Trim(),
            request.Priority,
            request.DueDateUtc,
            request.CategoryId);
        task.ChangeStatus(request.Status);
        await repository.SaveChangesAsync(ct);

        var updated = await repository.GetByIdAsync(id, userId, ct);
        return Result.Ok(updated!.ToResponse());
    }

    public async Task<Result<TaskResponse>> UpdateStatusAsync(Guid id, UpdateTaskStatusRequest request, CancellationToken ct)
    {
        var validation = await statusValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return Result.Fail<TaskResponse>(ValidationError.FromValidationResult(validation));
        }

        var userId = currentUser.Id;
        var task = await repository.GetByIdAsync(id, userId, ct);
        if (task is null)
        {
            return Result.Fail<TaskResponse>(new NotFoundError($"Task '{id}' was not found."));
        }

        task.ChangeStatus(request.Status);
        await repository.SaveChangesAsync(ct);

        return Result.Ok(task.ToResponse());
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct)
    {
        var task = await repository.GetByIdAsync(id, currentUser.Id, ct);
        if (task is null)
        {
            return Result.Fail(new NotFoundError($"Task '{id}' was not found."));
        }

        repository.Remove(task);
        await repository.SaveChangesAsync(ct);

        return Result.Ok();
    }

    private async Task<NotFoundError?> ValidateCategoryAsync(Guid? categoryId, Guid userId, CancellationToken ct)
    {
        if (categoryId is null)
        {
            return null;
        }

        var category = await categoryRepository.GetByIdAsync(categoryId.Value, userId, ct);
        if (category is null)
        {
            return new NotFoundError($"Category '{categoryId}' was not found.");
        }

        return null;
    }
}
