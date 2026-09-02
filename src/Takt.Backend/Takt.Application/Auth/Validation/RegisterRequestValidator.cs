using FluentValidation;
using Takt.Application.Auth.Dtos;
using Takt.Domain.Constants;

namespace Takt.Application.Auth.Validation;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(AuthConstants.EmailMaxLength);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(AuthConstants.PasswordMinLength);

        RuleFor(x => x.DisplayName)
            .MaximumLength(UserConstants.DisplayNameMaxLength);
    }
}
