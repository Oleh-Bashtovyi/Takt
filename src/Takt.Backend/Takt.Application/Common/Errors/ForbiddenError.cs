using FluentResults;

namespace Takt.Application.Common.Errors;

public sealed class ForbiddenError(string message) : Error(message);
