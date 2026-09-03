using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Takt.API.Contracts;
using Takt.API.Extensions;
using Takt.Application.Tasks;
using Takt.Application.Tasks.Dtos;
using Takt.Domain.Common;

namespace Takt.API.Controllers;

[ApiController]
[Authorize]
[Produces("application/json")]
[Route("api/tasks")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
public sealed class TasksController(ITodoTaskService taskService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<PaginatedResult<TaskResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaged([FromQuery] TaskListQuery query, CancellationToken ct) =>
        Ok(await taskService.GetPagedAsync(query.ToDomain(), ct));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await taskService.GetByIdAsync(id, ct);
        return result.ToActionResult();
    }

    [HttpPost]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request, CancellationToken ct)
    {
        var result = await taskService.CreateAsync(request, ct);
        return result.ToActionResult(onSuccess: response =>
            CreatedAtAction(nameof(GetById), new { id = response.Id }, response));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskRequest request, CancellationToken ct)
    {
        var result = await taskService.UpdateAsync(id, request, ct);
        return result.ToActionResult();
    }

    [HttpPatch("{id:guid}/completion")]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCompletion(Guid id, [FromBody] UpdateTaskCompletionRequest request, CancellationToken ct)
    {
        var result = await taskService.UpdateCompletionAsync(id, request, ct);
        return result.ToActionResult();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await taskService.DeleteAsync(id, ct);
        return result.ToActionResult();
    }
}
