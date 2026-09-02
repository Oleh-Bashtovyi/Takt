using FluentResults;

namespace Takt.Application.Common.Errors;

public sealed class AuthenticationError(string message) : Error(message);
