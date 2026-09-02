using FluentValidation;
using Takt.Application.Tasks.Dtos;

namespace Takt.Application.Tasks.Validation;

public sealed class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Title).TaskTitle();
        RuleFor(x => x.Description).TaskDescription();
        RuleFor(x => x.Priority).IsInEnum();
        RuleFor(x => x.Status).IsInEnum();
    }
}
