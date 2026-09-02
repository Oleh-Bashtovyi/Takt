using FluentValidation;
using Takt.Application.Tasks.Dtos;

namespace Takt.Application.Tasks.Validation;

public sealed class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title).TaskTitle();
        RuleFor(x => x.Description).TaskDescription();
        RuleFor(x => x.Priority!.Value).IsInEnum().When(x => x.Priority.HasValue);
        RuleFor(x => x.Status!.Value).IsInEnum().When(x => x.Status.HasValue);
    }
}
