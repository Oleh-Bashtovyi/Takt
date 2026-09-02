using System.Security.Cryptography;
using System.Text;

namespace Takt.Infrastructure.Auth;

internal static class RefreshTokenHasher
{
    public static string Hash(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes);
    }
}
