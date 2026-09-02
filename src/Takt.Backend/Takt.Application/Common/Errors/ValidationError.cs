using FluentResults;

namespace Takt.Application.Common.Errors;

public sealed class ValidationError : Error
{
    public ValidationError(IReadOnlyDictionary<string, string[]> failures)
        : base("One or more validation errors occurred.")
    {
        Failures = failures;
    }

    public IReadOnlyDictionary<string, string[]> Failures { get; }
}
