using FluentResults;

namespace Takt.Application.Common.Errors;

public sealed class NotFoundError(string message) : Error(message);
