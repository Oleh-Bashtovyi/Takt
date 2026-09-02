using FluentValidation;
using Takt.Domain.Constants;

namespace Takt.Application.Categories.Validation;

internal static class CategoryRules
{
    public static IRuleBuilderOptions<T, string> CategoryName<T>(this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty().MaximumLength(CategoryConstants.NameMaxLength);
}
