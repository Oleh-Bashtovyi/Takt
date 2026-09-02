using FluentValidation;
using Takt.Application.Categories.Dtos;

namespace Takt.Application.Categories.Validation;

public sealed class UpdateCategoryRequestValidator : AbstractValidator<UpdateCategoryRequest>
{
    public UpdateCategoryRequestValidator()
    {
        RuleFor(x => x.Name).CategoryName();
    }
}
