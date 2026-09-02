using FluentValidation;
using Takt.Domain.Constants;

namespace Takt.Application.Tasks.Validation;

internal static class TaskRules
{
    public static IRuleBuilderOptions<T, string> TaskTitle<T>(this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty().MaximumLength(TodoTaskConstants.TitleMaxLength);

    public static IRuleBuilderOptions<T, string?> TaskDescription<T>(this IRuleBuilder<T, string?> rule) =>
        rule.MaximumLength(TodoTaskConstants.DescriptionMaxLength);
}
