using Microsoft.AspNetCore.Identity;
using Takt.Domain.Common;

namespace Takt.Domain.Entities;

public class User : IdentityUser<Guid>, IAuditable
{
    public string? DisplayName { get; set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }
}
