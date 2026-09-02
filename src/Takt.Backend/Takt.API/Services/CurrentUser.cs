using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Takt.Application.Common.Identity;

namespace Takt.API.Services;

internal sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private Guid? _id;

    public Guid Id => _id ??= Resolve();

    private Guid Resolve()
    {
        var value = accessor.HttpContext?.User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (Guid.TryParse(value, out var id))
        {
            return id;
        }

        throw new InvalidOperationException("The request is not associated with an authenticated user.");
    }
}
