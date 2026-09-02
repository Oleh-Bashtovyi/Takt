using FluentResults;
using FluentValidation.Results;

namespace Takt.Application.Common.Errors;

public sealed class ValidationError : Error
{
    private ValidationError(IReadOnlyDictionary<string, string[]> failures)
        : base("One or more validation errors occurred.")
    {
        Failures = failures;
    }

    public IReadOnlyDictionary<string, string[]> Failures { get; }

    public IDictionary<string, string[]> ToDictionary() =>
        Failures.ToDictionary(x => x.Key, x => x.Value);

    public static ValidationError FromValidationResult(ValidationResult result)
    {
        var failures = result.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        return new ValidationError(failures);
    }

    public static ValidationError FromFailures(IReadOnlyDictionary<string, string[]> failures) =>
        new(failures);
}
