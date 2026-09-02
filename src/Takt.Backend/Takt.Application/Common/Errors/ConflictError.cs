using FluentResults;

namespace Takt.Application.Common.Errors;

public sealed class ConflictError(string message) : Error(message);
