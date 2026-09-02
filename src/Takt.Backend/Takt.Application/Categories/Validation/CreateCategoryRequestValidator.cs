using FluentValidation;
using Takt.Application.Categories.Dtos;

namespace Takt.Application.Categories.Validation;

public sealed class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name).CategoryName();
    }
}
