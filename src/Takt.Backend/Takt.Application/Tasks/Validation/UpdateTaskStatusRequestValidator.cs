using FluentValidation;
using Takt.Application.Tasks.Dtos;

namespace Takt.Application.Tasks.Validation;

public sealed class UpdateTaskStatusRequestValidator : AbstractValidator<UpdateTaskStatusRequest>
{
    public UpdateTaskStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}
